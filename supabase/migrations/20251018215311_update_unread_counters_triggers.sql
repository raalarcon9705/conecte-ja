-- Triggers to automatically update unread message counters (WhatsApp-like behavior)

-- Function to increment unread counter when a new message is inserted
CREATE OR REPLACE FUNCTION increment_unread_counter()
RETURNS TRIGGER AS $$
BEGIN
  -- Update conversation with new message info
  -- Increment the unread counter for the receiver (not the sender)
  UPDATE conversations
  SET 
    unread_count_client = CASE 
      -- If sender is professional, increment client counter
      WHEN NEW.sender_profile_id = professional_profile_id THEN unread_count_client + 1
      ELSE unread_count_client
    END,
    unread_count_professional = CASE 
      -- If sender is client, increment professional counter
      WHEN NEW.sender_profile_id = client_profile_id THEN unread_count_professional + 1
      ELSE unread_count_professional
    END,
    last_message_at = NEW.created_at,
    last_message_preview = LEFT(COALESCE(NEW.content, ''), 100),
    updated_at = NOW()
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement unread counter when messages are marked as read
CREATE OR REPLACE FUNCTION decrement_unread_counter()
RETURNS TRIGGER AS $$
DECLARE
  conv RECORD;
  unread_from_sender INTEGER;
BEGIN
  -- Only proceed if message was just marked as read
  IF OLD.is_read = FALSE AND NEW.is_read = TRUE THEN
    -- Get conversation info
    SELECT client_profile_id, professional_profile_id 
    INTO conv
    FROM conversations 
    WHERE id = NEW.conversation_id;
    
    -- Count remaining unread messages from the sender of this message
    SELECT COUNT(*) INTO unread_from_sender
    FROM messages
    WHERE conversation_id = NEW.conversation_id
      AND sender_profile_id = NEW.sender_profile_id
      AND is_read = FALSE;
    
    -- Update the appropriate counter
    -- If message sender was professional, update client counter
    IF NEW.sender_profile_id = conv.professional_profile_id THEN
      UPDATE conversations
      SET unread_count_client = unread_from_sender,
          updated_at = NOW()
      WHERE id = NEW.conversation_id;
    END IF;
    
    -- If message sender was client, update professional counter
    IF NEW.sender_profile_id = conv.client_profile_id THEN
      UPDATE conversations
      SET unread_count_professional = unread_from_sender,
          updated_at = NOW()
      WHERE id = NEW.conversation_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to mark all messages as read when entering a conversation
CREATE OR REPLACE FUNCTION mark_conversation_messages_as_read(
  p_conversation_id UUID,
  p_reader_profile_id UUID
)
RETURNS void AS $$
DECLARE
  conv RECORD;
BEGIN
  -- Get conversation info
  SELECT client_profile_id, professional_profile_id 
  INTO conv
  FROM conversations 
  WHERE id = p_conversation_id;
  
  -- Mark all unread messages from the other user as read
  UPDATE messages
  SET 
    is_read = TRUE,
    read_at = NOW()
  WHERE conversation_id = p_conversation_id
    AND is_read = FALSE
    AND sender_profile_id != p_reader_profile_id;
  
  -- Reset the appropriate unread counter
  IF p_reader_profile_id = conv.client_profile_id THEN
    UPDATE conversations
    SET unread_count_client = 0,
        updated_at = NOW()
    WHERE id = p_conversation_id;
  ELSIF p_reader_profile_id = conv.professional_profile_id THEN
    UPDATE conversations
    SET unread_count_professional = 0,
        updated_at = NOW()
    WHERE id = p_conversation_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_increment_unread_on_message_insert ON messages;
DROP TRIGGER IF EXISTS trigger_decrement_unread_on_message_read ON messages;

-- Create trigger for incrementing unread counter on new message
CREATE TRIGGER trigger_increment_unread_on_message_insert
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION increment_unread_counter();

-- Create trigger for decrementing unread counter when message is read
CREATE TRIGGER trigger_decrement_unread_on_message_read
AFTER UPDATE OF is_read ON messages
FOR EACH ROW
WHEN (OLD.is_read IS DISTINCT FROM NEW.is_read)
EXECUTE FUNCTION decrement_unread_counter();

