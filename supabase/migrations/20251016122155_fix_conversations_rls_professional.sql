-- =====================================================
-- FIX CONVERSATIONS RLS FOR PROFESSIONALS
-- =====================================================
-- This migration fixes the RLS policy for creating conversations
-- to properly check professional_profile_id against the user's
-- professional profile, not their auth.uid()
-- =====================================================

-- Drop the incorrect policy
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;

-- Create corrected policy that properly handles professional profiles
CREATE POLICY "Users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (
    -- Case 1: User is creating a conversation as a client
    (
      client_profile_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = auth.uid()
        AND p.user_type IN ('client', 'both')
      )
      AND EXISTS (
        SELECT 1 FROM professional_profiles pp
        WHERE pp.id = professional_profile_id
      )
    )
    OR
    -- Case 2: User is creating a conversation as a professional
    -- Check that the professional_profile_id belongs to the current user
    (
      EXISTS (
        SELECT 1 FROM professional_profiles pp
        WHERE pp.id = professional_profile_id
        AND pp.profile_id = auth.uid()
      )
      AND EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = client_profile_id
        AND p.user_type IN ('client', 'both')
      )
    )
  );

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON POLICY "Users can create conversations" ON conversations
  IS 'Allows clients and professionals to create conversations. Properly checks professional_profile.profile_id against auth.uid()';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

