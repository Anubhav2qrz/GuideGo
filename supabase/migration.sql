-- ============================================
-- GuideGo — Database Migration
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Profiles Table & Policies
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  cover_image TEXT,
  bio TEXT,
  languages TEXT[],
  rating NUMERIC(3, 2) DEFAULT 5.0,
  reviews INT DEFAULT 0,
  experience INT DEFAULT 1,
  hourly_rate INT DEFAULT 500,
  specialties TEXT[],
  city TEXT DEFAULT 'Kolkata',
  verified BOOLEAN DEFAULT FALSE,
  role TEXT DEFAULT 'traveler',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow public read access to all profiles
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Allow users to insert/update their own profile
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- 2. Trigger to Automatically Create Profile upon Auth Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    avatar_url,
    role,
    city,
    hourly_rate,
    specialties,
    languages
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'traveler'),
    COALESCE(NEW.raw_user_meta_data->>'city', 'Kolkata'),
    COALESCE((NEW.raw_user_meta_data->>'hourly_rate')::int, 500),
    CASE 
      WHEN NEW.raw_user_meta_data->>'specialties' IS NOT NULL 
      THEN ARRAY[NEW.raw_user_meta_data->>'specialties']::text[]
      ELSE ARRAY['Local Culture']::text[]
    END,
    ARRAY['English', 'Hindi']::text[]
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Sync any existing auth.users into public.profiles table
INSERT INTO public.profiles (id, full_name, avatar_url, role, city, hourly_rate, specialties, languages)
SELECT 
  id,
  COALESCE(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', split_part(email, '@', 1)),
  COALESCE(raw_user_meta_data->>'avatar_url', raw_user_meta_data->>'picture', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&q=80'),
  COALESCE(raw_user_meta_data->>'role', 'traveler'),
  COALESCE(raw_user_meta_data->>'city', 'Kolkata'),
  COALESCE((raw_user_meta_data->>'hourly_rate')::int, 500),
  ARRAY['Local Culture']::text[],
  ARRAY['English', 'Hindi']::text[]
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 3. Add new columns to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS duration_hours INT DEFAULT 4;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS platform_fee NUMERIC(10, 2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_id TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS meeting_location TEXT;

-- 4. Add new columns to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT FALSE;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES bookings(id);

-- 5. Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID UNIQUE REFERENCES bookings(id),
  guide_id UUID NOT NULL REFERENCES profiles(id),
  traveler_id UUID NOT NULL REFERENCES profiles(id),
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON reviews;
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Travelers can insert reviews for their bookings" ON reviews;
CREATE POLICY "Travelers can insert reviews for their bookings"
  ON reviews FOR INSERT
  WITH CHECK (
    auth.uid() = traveler_id
    AND EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = reviews.booking_id
      AND bookings.traveler_id = auth.uid()
      AND bookings.status = 'completed'
    )
  );

CREATE INDEX IF NOT EXISTS idx_reviews_guide_id ON reviews(guide_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id);

-- 6. Auto-update guide rating when a review is added
CREATE OR REPLACE FUNCTION update_guide_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE profiles SET
    rating = (SELECT ROUND(AVG(rating)::numeric, 2) FROM reviews WHERE guide_id = NEW.guide_id),
    reviews = (SELECT COUNT(*) FROM reviews WHERE guide_id = NEW.guide_id)
  WHERE id = NEW.guide_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_guide_rating ON reviews;
CREATE TRIGGER trigger_update_guide_rating
  AFTER INSERT ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_guide_rating();
