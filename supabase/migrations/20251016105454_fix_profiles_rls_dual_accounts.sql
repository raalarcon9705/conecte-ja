-- =====================================================
-- FIX PROFILES RLS FOR DUAL ACCOUNTS AND CONVERSATIONS
-- =====================================================
-- This migration fixes the RLS policies for profiles to:
-- 1. Support users with dual accounts (user_type = 'both')
-- 2. Allow users to view profiles in their conversations
-- 3. Ensure conversations can load with participant profiles
-- =====================================================

-- Drop the restrictive policies
DROP POLICY IF EXISTS "Anyone can view active professional profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view client profiles in conversations" ON profiles;
DROP POLICY IF EXISTS "Anyone can view professional profiles data" ON profiles;

-- Recreate policy for viewing active professional profiles (supporting 'both')
CREATE POLICY "Anyone can view active professional profiles"
  ON profiles FOR SELECT
  USING (
    user_type IN ('professional', 'both')
    AND is_active = true
    AND EXISTS (
      SELECT 1 FROM professional_profiles
      WHERE profile_id = profiles.id
      AND verification_status = 'approved'
    )
  );

-- Create comprehensive policy for viewing profiles in conversations
-- This allows participants to see each other's profiles
CREATE POLICY "Users can view profiles in their conversations"
  ON profiles FOR SELECT
  USING (
    -- User can see profiles where they are in a conversation together
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE (
        -- User is the client and viewing the professional's profile
        (c.client_profile_id = auth.uid() AND c.professional_profile_id = profiles.id)
        OR
        -- User is the professional and viewing the client's profile
        (c.professional_profile_id = auth.uid() AND c.client_profile_id = profiles.id)
      )
    )
  );

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

