-- =====================================================
-- ALLOW ANYONE TO CREATE CONVERSATIONS
-- =====================================================
-- This migration simplifies the RLS policy to allow any
-- authenticated user to create conversations with others.
-- This is needed for flexible conversation creation in the app.
-- =====================================================

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can create conversations" ON conversations;

-- Create a simple and flexible policy that allows:
-- Any authenticated user to create a conversation where they participate
CREATE POLICY "Authenticated users can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (
    -- User must be authenticated
    auth.uid() IS NOT NULL
    AND (
      -- Case 1: User is the client in the conversation
      client_profile_id = auth.uid()
      OR
      -- Case 2: User has a professional profile and is the professional
      EXISTS (
        SELECT 1 FROM professional_profiles pp
        WHERE pp.id = professional_profile_id
        AND pp.profile_id = auth.uid()
      )
    )
  );

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON POLICY "Authenticated users can create conversations" ON conversations
  IS 'Allows any authenticated user to create conversations where they participate, either as a client or as a professional';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

