-- Fix ambiguous created_at reference in calculate_response_time function
-- This fixes the "column reference 'created_at' is ambiguous" error

CREATE OR REPLACE FUNCTION calculate_response_time()
RETURNS TRIGGER AS $$
DECLARE
  is_professional BOOLEAN;
  first_message_time TIMESTAMPTZ;
  response_time_minutes NUMERIC;
BEGIN
  -- Check if sender is the professional
  SELECT EXISTS (
    SELECT 1 FROM conversations c
    JOIN professional_profiles pp ON pp.profile_id = c.professional_profile_id
    WHERE c.id = NEW.conversation_id
      AND NEW.sender_profile_id = c.professional_profile_id
  ) INTO is_professional;

  -- Only calculate if this is a professional response
  IF is_professional THEN
    -- Get the first client message after last professional message
    SELECT m.created_at INTO first_message_time
    FROM messages m
    JOIN conversations c ON m.conversation_id = c.id
    WHERE m.conversation_id = NEW.conversation_id
      AND m.sender_profile_id = c.client_profile_id
      AND m.created_at > COALESCE(
        (SELECT MAX(m2.created_at) FROM messages m2
         WHERE m2.conversation_id = NEW.conversation_id
           AND m2.sender_profile_id = c.professional_profile_id
           AND m2.created_at < NEW.created_at),
        '1970-01-01'::TIMESTAMPTZ
      )
    ORDER BY m.created_at ASC
    LIMIT 1;

    -- Calculate response time
    IF first_message_time IS NOT NULL THEN
      response_time_minutes := EXTRACT(EPOCH FROM (NEW.created_at - first_message_time)) / 60;

      -- Update professional's average response time
      UPDATE professional_profiles
      SET response_time_avg = COALESCE(
        (response_time_avg * (total_bookings - 1) + response_time_minutes) / total_bookings,
        response_time_minutes
      )
      WHERE profile_id = NEW.sender_profile_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

