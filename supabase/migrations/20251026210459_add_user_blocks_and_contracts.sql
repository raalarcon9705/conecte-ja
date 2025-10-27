-- Create user_blocks table for blocking functionality
CREATE TABLE IF NOT EXISTS user_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  blocked_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(blocker_profile_id, blocked_profile_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocker ON user_blocks(blocker_profile_id);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked ON user_blocks(blocked_profile_id);

-- Add RLS policies
ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;

-- User blocks policies
CREATE POLICY "Users can view their own blocks" ON user_blocks
  FOR SELECT USING (blocker_profile_id = auth.uid() OR blocked_profile_id = auth.uid());

CREATE POLICY "Users can create blocks" ON user_blocks
  FOR INSERT WITH CHECK (blocker_profile_id = auth.uid());

CREATE POLICY "Users can delete their own blocks" ON user_blocks
  FOR DELETE USING (blocker_profile_id = auth.uid());
