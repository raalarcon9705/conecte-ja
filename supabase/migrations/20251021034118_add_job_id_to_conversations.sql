-- =====================================================
-- ADD JOB_ID TO CONVERSATIONS
-- =====================================================
-- This migration adds a required job_id field to conversations
-- and deletes existing conversations since they don't have a job association
-- =====================================================

-- Step 1: Delete all existing conversations (cascade will delete messages too)
DELETE FROM conversations;

-- Step 2: Drop the old unique constraint that only includes client and professional
ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_client_profile_id_professional_profile_id_key;

-- Step 3: Drop the redundant participants index (will be replaced by unique constraint)
DROP INDEX IF EXISTS idx_conversations_participants;

-- Step 4: Add job_id column as NOT NULL with foreign key to job_postings
ALTER TABLE conversations
  ADD COLUMN job_id UUID NOT NULL REFERENCES job_postings(id) ON DELETE CASCADE;

-- Step 5: Create optimized indexes
--
-- Index for looking up conversations by job (useful for job detail pages)
CREATE INDEX idx_conversations_job ON conversations(job_id);

-- Index for client's conversations sorted by last message (most common query)
-- Already exists: idx_conversations_client ON conversations(client_profile_id, last_message_at DESC)
-- This index remains optimal and we don't need to recreate it

-- Index for professional's conversations sorted by last message (most common query)
-- Already exists: idx_conversations_professional ON conversations(professional_profile_id, last_message_at DESC)
-- This index remains optimal and we don't need to recreate it

-- Step 6: Create new unique constraint including job_id
-- This constraint also serves as an index for lookups by (client, professional, job)
-- which is used in createOrGetConversation to check if a conversation already exists
ALTER TABLE conversations
  ADD CONSTRAINT conversations_client_professional_job_key
  UNIQUE(client_profile_id, professional_profile_id, job_id);

-- Step 7: Create composite index for finding conversations by job and client/professional
-- This is useful for queries like "show me all conversations for this job where I'm the client"
CREATE INDEX idx_conversations_job_client ON conversations(job_id, client_profile_id);
CREATE INDEX idx_conversations_job_professional ON conversations(job_id, professional_profile_id);

-- Step 8: RLS policies remain unchanged
-- The existing RLS policies check client_profile_id and professional_profile_id
-- which is still sufficient for access control

-- =====================================================
-- COMMENTS
-- =====================================================
COMMENT ON COLUMN conversations.job_id IS 'The job posting that this conversation is related to';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
