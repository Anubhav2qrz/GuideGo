-- ============================================
-- GuideGo — Database Migration (Safe & Complete)
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Ensure profiles table exists
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT 'User'
);

-- 2. Add all profile columns safely if they do not exist
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cover_image TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS languages TEXT[] DEFAULT ARRAY['English', 'Hindi'];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS rating NUMERIC(3, 2) DEFAULT 5.0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS reviews INT DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS experience INT DEFAULT 1;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS hourly_rate INT DEFAULT 500;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS specialties TEXT[] DEFAULT ARRAY['Local Culture'];
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT DEFAULT 'Kolkata';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'traveler';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gov_doc_type TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gov_doc_number TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gov_doc_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS selfie_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'verified';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- 3. Row Level Security for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- 4. Trigger to Automatically Create Profile upon Auth Signup
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

-- 5. Backfill/Sync any existing auth.users into public.profiles
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

-- 6. Ensure Bookings Table Structure & RLS
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS duration_hours INT DEFAULT 4;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS platform_fee NUMERIC(10, 2);
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_id TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS meeting_location TEXT;

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own bookings" ON public.bookings;
CREATE POLICY "Users can view their own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = traveler_id OR auth.uid() = guide_id);

DROP POLICY IF EXISTS "Travelers can insert bookings" ON public.bookings;
CREATE POLICY "Travelers can insert bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = traveler_id);

-- Critical: Allows both traveler and guide to update booking status (e.g. End Trip, In Progress)
DROP POLICY IF EXISTS "Users can update their own bookings" ON public.bookings;
CREATE POLICY "Users can update their own bookings"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = traveler_id OR auth.uid() = guide_id);

-- 7. Live Locations Table & RLS
CREATE TABLE IF NOT EXISTS public.live_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
  guide_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_guide_booking UNIQUE (guide_id, booking_id)
);

ALTER TABLE public.live_locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view live locations for active bookings" ON public.live_locations;
CREATE POLICY "Anyone can view live locations for active bookings"
  ON public.live_locations FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Guides can update their live locations" ON public.live_locations;
CREATE POLICY "Guides can update their live locations"
  ON public.live_locations FOR ALL
  USING (auth.uid() = guide_id)
  WITH CHECK (auth.uid() = guide_id);

-- 8. Messages Table & RLS
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT FALSE;
ALTER TABLE public.messages ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES public.bookings(id);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own messages" ON public.messages;
CREATE POLICY "Users can view their own messages"
  ON public.messages FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- 9. Reviews Table & RLS
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID UNIQUE REFERENCES public.bookings(id),
  guide_id UUID NOT NULL REFERENCES public.profiles(id),
  traveler_id UUID NOT NULL REFERENCES public.profiles(id),
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Reviews are viewable by everyone" ON public.reviews;
CREATE POLICY "Reviews are viewable by everyone"
  ON public.reviews FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Travelers can insert reviews for their bookings" ON public.reviews;
CREATE POLICY "Travelers can insert reviews for their bookings"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = traveler_id
    AND EXISTS (
      SELECT 1 FROM public.bookings
      WHERE public.bookings.id = reviews.booking_id
      AND public.bookings.traveler_id = auth.uid()
      AND public.bookings.status = 'completed'
    )
  );

CREATE INDEX IF NOT EXISTS idx_reviews_guide_id ON public.reviews(guide_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON public.reviews(booking_id);

-- 10. Auto-update guide rating when a review is added
CREATE OR REPLACE FUNCTION public.update_guide_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles SET
    rating = (SELECT ROUND(AVG(rating)::numeric, 2) FROM public.reviews WHERE guide_id = NEW.guide_id),
    reviews = (SELECT COUNT(*) FROM public.reviews WHERE guide_id = NEW.guide_id)
  WHERE id = NEW.guide_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_guide_rating ON public.reviews;
CREATE TRIGGER trigger_update_guide_rating
  AFTER INSERT ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.update_guide_rating();
