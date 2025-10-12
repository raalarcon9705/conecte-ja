-- =====================================================
-- PROXYO APP - DATABASE IMPROVEMENTS
-- =====================================================
-- This migration adds enhancements and optimizations
-- to the initial database structure.
-- =====================================================

-- =====================================================
-- ENHANCEMENT 1: Add hierarchy to categories
-- =====================================================
ALTER TABLE categories ADD COLUMN parent_id UUID REFERENCES categories(id);
CREATE INDEX idx_categories_parent ON categories(parent_id);

-- =====================================================
-- ENHANCEMENT 2: Add business fields to professional_profiles
-- =====================================================
ALTER TABLE professional_profiles
  ADD COLUMN search_keywords TEXT[], -- ["eletricista", "instalacao eletrica"]
  ADD COLUMN tax_id VARCHAR(20), -- CPF/CNPJ
  ADD COLUMN business_license VARCHAR(100),
  ADD COLUMN response_time_avg INTEGER, -- Average response time in minutes
  ADD COLUMN acceptance_rate DECIMAL(5,2) DEFAULT 100.00; -- Booking acceptance rate %

-- Index for search keywords
CREATE INDEX idx_professional_profiles_search_keywords ON professional_profiles USING GIN(search_keywords);

-- =====================================================
-- ENHANCEMENT 3: Add moderation fields to messages
-- =====================================================
ALTER TABLE messages
  ADD COLUMN is_flagged BOOLEAN DEFAULT false,
  ADD COLUMN flagged_reason TEXT,
  ADD COLUMN moderated_at TIMESTAMPTZ;

CREATE INDEX idx_messages_flagged ON messages(is_flagged) WHERE is_flagged = true;

-- =====================================================
-- ENHANCEMENT 4: Professional certifications
-- =====================================================
CREATE TABLE professional_certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_profile_id UUID NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,

  certification_type VARCHAR(100) NOT NULL, -- "Certificado CREA", "Curso de Eletrica"
  certification_name VARCHAR(255) NOT NULL,
  issuer VARCHAR(255),
  issue_date DATE,
  expiry_date DATE,

  document_url TEXT,
  is_verified BOOLEAN DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_certifications_professional ON professional_certifications(professional_profile_id);
CREATE INDEX idx_certifications_verified ON professional_certifications(is_verified);

-- =====================================================
-- ENHANCEMENT 5: Subscription conversion metrics
-- =====================================================
ALTER TABLE subscriptions
  ADD COLUMN trial_started_at TIMESTAMPTZ,
  ADD COLUMN trial_ends_at TIMESTAMPTZ,
  ADD COLUMN converted_from_trial BOOLEAN DEFAULT false,
  ADD COLUMN cancellation_reason VARCHAR(100),
  ADD COLUMN cancellation_feedback TEXT;

CREATE INDEX idx_subscriptions_trial ON subscriptions(trial_ends_at) WHERE trial_ends_at IS NOT NULL;

-- =====================================================
-- ENHANCEMENT 6: Search analytics
-- =====================================================
CREATE TABLE search_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,

  search_query TEXT,
  category_id UUID REFERENCES categories(id),

  -- Applied filters
  filters JSONB, -- {distance: 10, price_range: "50-100", rating_min: 4}

  -- Geolocation
  search_latitude DECIMAL(10, 8),
  search_longitude DECIMAL(11, 8),

  -- Results
  results_count INTEGER,
  clicked_professional_id UUID REFERENCES professional_profiles(id),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_search_logs_profile ON search_logs(profile_id, created_at DESC);
CREATE INDEX idx_search_logs_query ON search_logs(search_query);
CREATE INDEX idx_search_logs_category ON search_logs(category_id);

-- =====================================================
-- ENHANCEMENT 7: Payment fields in bookings
-- =====================================================
ALTER TABLE bookings
  ADD COLUMN payment_status VARCHAR(20) CHECK (payment_status IN ('pending', 'paid', 'refunded', 'failed')),
  ADD COLUMN payment_amount DECIMAL(10, 2),
  ADD COLUMN payment_method VARCHAR(50),
  ADD COLUMN transaction_id UUID REFERENCES payment_transactions(id);

CREATE INDEX idx_bookings_payment_status ON bookings(payment_status);

-- =====================================================
-- ENHANCEMENT 8: Full-text search indexes
-- =====================================================
CREATE INDEX idx_professional_profiles_business_name_trgm
  ON professional_profiles USING gin(business_name gin_trgm_ops);

CREATE INDEX idx_professional_profiles_description_trgm
  ON professional_profiles USING gin(description gin_trgm_ops);

-- =====================================================
-- ENHANCEMENT 9: Additional performance indexes
-- =====================================================
CREATE INDEX idx_subscriptions_created_at ON subscriptions(created_at DESC);
CREATE INDEX idx_bookings_created_at ON bookings(created_at DESC);
CREATE INDEX idx_payment_transactions_completed
  ON payment_transactions(completed_at DESC) WHERE status = 'completed';

-- =====================================================
-- ENHANCEMENT 10: RLS for analytics_events
-- =====================================================
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Professionals can view their own analytics"
  ON analytics_events FOR SELECT
  USING (
    professional_profile_id IN (
      SELECT id FROM professional_profiles WHERE profile_id = auth.uid()
    )
  );

-- =====================================================
-- ENHANCEMENT 11: RLS for certifications
-- =====================================================
ALTER TABLE professional_certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view verified certifications"
  ON professional_certifications FOR SELECT
  USING (is_verified = true);

CREATE POLICY "Professionals can manage their own certifications"
  ON professional_certifications FOR ALL
  USING (
    professional_profile_id IN (
      SELECT id FROM professional_profiles WHERE profile_id = auth.uid()
    )
  );

-- =====================================================
-- ENHANCEMENT 12: RLS for search_logs
-- =====================================================
ALTER TABLE search_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own search logs"
  ON search_logs FOR SELECT
  USING (profile_id = auth.uid());

CREATE POLICY "Users can create search logs"
  ON search_logs FOR INSERT
  WITH CHECK (profile_id = auth.uid() OR profile_id IS NULL);

-- =====================================================
-- FUNCTION: Get professional availability
-- =====================================================
CREATE OR REPLACE FUNCTION get_professional_availability(
  prof_id UUID,
  check_date DATE,
  duration_minutes INTEGER DEFAULT 60
)
RETURNS TABLE(
  slot_start TIMESTAMPTZ,
  slot_end TIMESTAMPTZ,
  is_available BOOLEAN
) AS $$
DECLARE
  day_name TEXT;
  work_start TIME;
  work_end TIME;
  slot_duration INTERVAL;
BEGIN
  slot_duration := duration_minutes * INTERVAL '1 minute';

  -- Get day of week
  day_name := LOWER(TO_CHAR(check_date, 'Day'));
  day_name := TRIM(day_name);

  -- Get working hours for this day
  SELECT
    (working_hours->day_name->>'start')::TIME,
    (working_hours->day_name->>'end')::TIME
  INTO work_start, work_end
  FROM professional_profiles
  WHERE id = prof_id
    AND (working_hours->day_name->>'enabled')::BOOLEAN = true;

  -- If not working this day, return empty
  IF work_start IS NULL THEN
    RETURN;
  END IF;

  -- Generate time slots and check availability
  RETURN QUERY
  WITH time_slots AS (
    SELECT
      generate_series(
        check_date + work_start,
        check_date + work_end - slot_duration,
        slot_duration
      ) AS slot_time
  ),
  blocked_times AS (
    -- Get blocked availability slots
    SELECT date, start_time, end_time
    FROM availability_slots
    WHERE professional_profile_id = prof_id
      AND date = check_date
      AND slot_type = 'blocked'

    UNION ALL

    -- Get existing bookings
    SELECT booking_date, start_time, end_time
    FROM bookings
    WHERE professional_profile_id = prof_id
      AND booking_date = check_date
      AND status IN ('pending', 'confirmed')
  )
  SELECT
    ts.slot_time,
    ts.slot_time + slot_duration,
    NOT EXISTS (
      SELECT 1 FROM blocked_times bt
      WHERE ts.slot_time::TIME >= bt.start_time
        AND ts.slot_time::TIME < bt.end_time
    )
  FROM time_slots ts
  ORDER BY ts.slot_time;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Check message spam
-- =====================================================
CREATE OR REPLACE FUNCTION check_message_spam(
  sender_id UUID,
  message_content TEXT
) RETURNS BOOLEAN AS $$
DECLARE
  recent_messages INTEGER;
BEGIN
  -- Count messages from the last minute
  SELECT COUNT(*) INTO recent_messages
  FROM messages
  WHERE sender_profile_id = sender_id
    AND created_at > NOW() - INTERVAL '1 minute';

  -- If sent more than 10 messages in 1 minute, it's spam
  RETURN recent_messages > 10;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- FUNCTION: Calculate professional response time
-- =====================================================
CREATE OR REPLACE FUNCTION calculate_response_time()
RETURNS TRIGGER AS $$
DECLARE
  first_message_time TIMESTAMPTZ;
  response_time_minutes INTEGER;
  is_professional BOOLEAN;
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
    SELECT created_at INTO first_message_time
    FROM messages m
    JOIN conversations c ON m.conversation_id = c.id
    WHERE m.conversation_id = NEW.conversation_id
      AND m.sender_profile_id = c.client_profile_id
      AND m.created_at > COALESCE(
        (SELECT MAX(created_at) FROM messages
         WHERE conversation_id = NEW.conversation_id
           AND sender_profile_id = c.professional_profile_id
           AND created_at < NEW.created_at),
        '1970-01-01'::TIMESTAMPTZ
      )
    ORDER BY created_at ASC
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

CREATE TRIGGER trigger_calculate_response_time
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION calculate_response_time();

-- =====================================================
-- FUNCTION: Update booking acceptance rate
-- =====================================================
CREATE OR REPLACE FUNCTION update_acceptance_rate()
RETURNS TRIGGER AS $$
BEGIN
  -- Update acceptance rate when booking status changes
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    UPDATE professional_profiles
    SET acceptance_rate = (
      SELECT
        CASE
          WHEN COUNT(*) = 0 THEN 100.00
          ELSE ROUND(
            (COUNT(*) FILTER (WHERE status IN ('confirmed', 'completed'))::DECIMAL / COUNT(*)) * 100,
            2
          )
        END
      FROM bookings
      WHERE professional_profile_id = NEW.professional_profile_id
        AND status IN ('confirmed', 'completed', 'canceled')
    )
    WHERE id = NEW.professional_profile_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_acceptance_rate
AFTER UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_acceptance_rate();

-- =====================================================
-- VIEW: Enhanced professional search
-- =====================================================
CREATE OR REPLACE VIEW v_professional_search AS
SELECT
  pp.id,
  pp.profile_id,
  pp.business_name,
  pp.tagline,
  pp.description,
  pp.years_experience,
  pp.price_range,
  pp.is_verified,
  pp.average_rating,
  pp.total_reviews,
  pp.service_radius_km,
  pp.response_time_avg,
  pp.acceptance_rate,
  pp.search_keywords,
  p.full_name,
  p.avatar_url,
  p.city,
  p.state,
  p.latitude,
  p.longitude,
  p.location,
  c.name as category_name,
  c.slug as category_slug,
  c.icon_url as category_icon,
  sp.slug as plan_slug,
  sp.features as plan_features,
  COALESCE(
    (SELECT COUNT(*) FROM professional_certifications
     WHERE professional_profile_id = pp.id AND is_verified = true),
    0
  ) as verified_certifications_count
FROM professional_profiles pp
JOIN profiles p ON pp.profile_id = p.id
JOIN categories c ON pp.category_id = c.id
LEFT JOIN subscriptions s ON s.profile_id = p.id
  AND s.status = 'active'
  AND s.current_period_end > NOW()
LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
WHERE p.is_active = true
  AND pp.verification_status = 'approved';

-- =====================================================
-- VIEW: Booking analytics for professionals
-- =====================================================
CREATE OR REPLACE VIEW v_booking_analytics AS
SELECT
  pp.id as professional_profile_id,
  pp.profile_id,
  COUNT(*) FILTER (WHERE b.status = 'pending') as pending_bookings,
  COUNT(*) FILTER (WHERE b.status = 'confirmed') as confirmed_bookings,
  COUNT(*) FILTER (WHERE b.status = 'completed') as completed_bookings,
  COUNT(*) FILTER (WHERE b.status = 'canceled') as canceled_bookings,
  COUNT(*) FILTER (WHERE b.status = 'no_show') as no_show_bookings,
  COALESCE(AVG(b.price) FILTER (WHERE b.status = 'completed'), 0) as avg_booking_value,
  COALESCE(SUM(b.price) FILTER (WHERE b.status = 'completed'), 0) as total_revenue,
  COALESCE(
    SUM(b.price) FILTER (
      WHERE b.status = 'completed'
      AND b.completed_at >= DATE_TRUNC('month', NOW())
    ),
    0
  ) as current_month_revenue
FROM professional_profiles pp
LEFT JOIN bookings b ON b.professional_profile_id = pp.id
GROUP BY pp.id, pp.profile_id;

-- RLS for booking analytics view
-- (Views inherit RLS from underlying tables, but we document the intended access)

-- =====================================================
-- COMMENT DOCUMENTATION
-- =====================================================
COMMENT ON TABLE professional_certifications IS 'Professional certifications and credentials for verified professionals';
COMMENT ON TABLE search_logs IS 'User search analytics for improving search results and recommendations';
COMMENT ON COLUMN professional_profiles.search_keywords IS 'Keywords for search optimization (e.g., ["eletricista", "instalacao eletrica"])';
COMMENT ON COLUMN professional_profiles.response_time_avg IS 'Average response time in minutes for messages';
COMMENT ON COLUMN professional_profiles.acceptance_rate IS 'Percentage of bookings accepted vs rejected';
COMMENT ON FUNCTION get_professional_availability IS 'Returns available time slots for a professional on a given date';
COMMENT ON FUNCTION check_message_spam IS 'Checks if a user is sending too many messages (spam detection)';

-- =====================================================
-- IMPROVEMENTS COMPLETE
-- =====================================================
