-- =====================================================
-- FIX CONVERSATIONS RLS - CORRECT FOREIGN KEY
-- =====================================================
-- The professional_profile_id in conversations table
-- points to profiles.id, NOT professional_profiles.id!
-- This migration fixes the policy to match the actual
-- table structure.
-- =====================================================

-- Drop the incorrect policy
DROP POLICY IF EXISTS "Authenticated users can create conversations" ON conversations;

-- Create the CORRECT policy based on actual foreign keys
CREATE POLICY "Authenticated users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (
    -- User must be authenticated
    auth.uid() IS NOT NULL
    AND (
      -- Case 1: User is the client in the conversation
      client_profile_id = auth.uid()
      OR
      -- Case 2: User is the professional in the conversation
      -- NOTE: professional_profile_id points to profiles.id directly!
      professional_profile_id = auth.uid()
    )
  );

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON POLICY "Authenticated users can create conversations" ON conversations
  IS 'Allows authenticated users to create conversations where they participate. Note: both client_profile_id and professional_profile_id reference profiles.id';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

