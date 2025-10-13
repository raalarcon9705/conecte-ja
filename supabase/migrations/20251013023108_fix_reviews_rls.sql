-- =====================================================
-- FIX: Allow viewing public profile data in reviews
-- =====================================================
-- This migration fixes the RLS issue where client profiles
-- were not visible when fetching reviews.
-- =====================================================

-- Drop the overly restrictive profile view policy
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Create a new policy that allows viewing own profile
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Add policy to allow viewing public profile data of users who left reviews
-- This allows anyone to see basic info (name, avatar) of clients in reviews
CREATE POLICY "Anyone can view public profile data in reviews"
  ON profiles FOR SELECT
  USING (
    -- Allow if this profile has left any approved reviews
    EXISTS (
      SELECT 1 FROM reviews
      WHERE reviews.client_profile_id = profiles.id
      AND reviews.is_approved = true
    )
  );

-- Add policy to allow viewing public profile data of professionals
-- This allows anyone to see basic info of professionals
CREATE POLICY "Anyone can view professional profiles data"
  ON profiles FOR SELECT
  USING (
    -- Allow if this profile has a professional profile
    EXISTS (
      SELECT 1 FROM professional_profiles
      WHERE professional_profiles.profile_id = profiles.id
    )
  );

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON POLICY "Anyone can view public profile data in reviews" ON profiles
  IS 'Allows viewing basic profile information (name, avatar) of clients who have left approved reviews';

COMMENT ON POLICY "Anyone can view professional profiles data" ON profiles
  IS 'Allows viewing basic profile information of users with professional accounts';

-- =====================================================
-- FIX COMPLETE
-- =====================================================
