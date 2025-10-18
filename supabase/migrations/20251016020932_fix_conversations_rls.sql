-- =====================================================
-- FIX CONVERSATIONS RLS POLICY
-- =====================================================
-- This migration fixes the RLS policy for creating conversations
-- to support:
-- 1. Users with dual accounts (user_type = 'both')
-- 2. Professionals initiating conversations
-- 3. Flexible conversation creation
-- =====================================================

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Clients can create conversations" ON conversations;

-- Create a more flexible policy that allows:
-- 1. Users to create conversations where they are the client (and target is a professional)
-- 2. Users to create conversations where they are the professional (and target is a client)
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
        WHERE pp.profile_id = professional_profile_id
      )
    )
    OR
    -- Case 2: User is creating a conversation as a professional
    (
      professional_profile_id = auth.uid()
      AND EXISTS (
        SELECT 1 FROM professional_profiles pp
        WHERE pp.profile_id = auth.uid()
      )
      AND EXISTS (
        SELECT 1 FROM profiles p
        WHERE p.id = client_profile_id
        AND p.user_type IN ('client', 'both')
      )
    )
  );

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

