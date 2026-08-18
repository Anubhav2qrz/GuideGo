-- ============================================
-- GuideGo — Database Migration
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add new columns to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS duration_hours INT DEFAULT 4;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS platform_fee NUMERIC(10, 2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_id TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS meeting_location TEXT;

-- 2. Add new columns to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT FALSE;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES bookings(id);

-- 3. Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID UNIQUE REFERENCES bookings(id),
  guide_id UUID NOT NULL REFERENCES profiles(id),
  traveler_id UUID NOT NULL REFERENCES profiles(id),
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Enable RLS on reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Anyone can read reviews (public display on guide profiles)
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

-- Only the traveler of a booking can insert a review
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

-- 5. Create index for faster review lookups by guide
CREATE INDEX IF NOT EXISTS idx_reviews_guide_id ON reviews(guide_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id);

-- 6. (Optional) Auto-update guide rating when a review is added
-- This trigger recalculates the average rating on the profiles table
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
