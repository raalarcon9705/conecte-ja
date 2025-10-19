-- Enable realtime for conversations and messages tables
-- This allows the Supabase Realtime to broadcast changes to subscribed clients

-- Add conversations table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

-- Add messages table to the realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Enable replica identity for conversations (required for UPDATE and DELETE events)
-- This ensures that OLD values are available in realtime updates
ALTER TABLE conversations REPLICA IDENTITY FULL;

-- Enable replica identity for messages (required for UPDATE and DELETE events)
ALTER TABLE messages REPLICA IDENTITY FULL;

