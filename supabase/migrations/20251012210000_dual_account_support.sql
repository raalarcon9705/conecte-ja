-- =====================================================
-- DUAL ACCOUNT SUPPORT
-- Allow users to have both client and professional accounts
-- =====================================================

-- Step 1: Drop the old CHECK constraint on user_type
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_user_type_check;

-- Step 2: Modify user_type to allow 'both' and add default_mode
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS default_mode VARCHAR(20) 
  CHECK (default_mode IN ('client', 'professional'));

-- Step 3: Update the user_type constraint to include 'both'
ALTER TABLE profiles 
  ADD CONSTRAINT profiles_user_type_check 
  CHECK (user_type IN ('client', 'professional', 'both'));

-- Step 4: Set default_mode for existing users based on their current user_type
UPDATE profiles 
SET default_mode = user_type 
WHERE default_mode IS NULL;

-- Step 5: Make default_mode NOT NULL after setting values
ALTER TABLE profiles ALTER COLUMN default_mode SET NOT NULL;

-- Step 6: Add helper function to check if user has professional account
CREATE OR REPLACE FUNCTION has_professional_account(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM professional_profiles 
    WHERE profile_id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Add helper function to get user's effective roles
CREATE OR REPLACE FUNCTION get_user_roles(user_id UUID)
RETURNS TABLE(is_client BOOLEAN, is_professional BOOLEAN) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN p.user_type IN ('client', 'both') THEN true
      ELSE false
    END as is_client,
    CASE 
      WHEN p.user_type IN ('professional', 'both') OR 
           EXISTS(SELECT 1 FROM professional_profiles WHERE profile_id = user_id)
      THEN true
      ELSE false
    END as is_professional
  FROM profiles p
  WHERE p.id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Update RLS policies to consider both roles
-- Update the bookings policy to handle both modes
DROP POLICY IF EXISTS "Users can view their own bookings" ON bookings;

CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT
  USING (
    client_profile_id = auth.uid() OR
    professional_profile_id IN (
      SELECT id FROM professional_profiles WHERE profile_id = auth.uid()
    )
  );

-- Step 9: Update conversations RLS to handle both roles better
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;

CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations c
      JOIN profiles p ON p.id = auth.uid()
      WHERE c.id = messages.conversation_id
      AND (c.client_profile_id = auth.uid() OR c.professional_profile_id = auth.uid())
    )
  );

-- Step 10: Add index for default_mode
CREATE INDEX IF NOT EXISTS idx_profiles_default_mode ON profiles(default_mode);

-- Step 11: Add comment for documentation
COMMENT ON COLUMN profiles.user_type IS 'User account type: client, professional, or both';
COMMENT ON COLUMN profiles.default_mode IS 'Default mode when user opens the app: client or professional';
COMMENT ON FUNCTION has_professional_account IS 'Check if a user has a professional account setup';
COMMENT ON FUNCTION get_user_roles IS 'Get the effective roles (client/professional) for a user';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

