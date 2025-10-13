-- =====================================================
-- CONECTEJA - SECURITY RLS FIXES
-- =====================================================
-- This migration fixes critical security issues:
-- 1. Adds RLS to all unprotected tables
-- 2. Fixes weak RLS policies
-- 3. Removes insecure views
-- 4. Protects sensitive functions
-- =====================================================

-- =====================================================
-- STEP 1: DROP ALL VIEWS
-- =====================================================
DROP VIEW IF EXISTS v_booking_analytics;
DROP VIEW IF EXISTS v_professional_search;
DROP VIEW IF EXISTS v_professionals_with_location;

-- =====================================================
-- STEP 2: FIX PROFILES RLS (Too Restrictive)
-- =====================================================

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Allow users to view their own profile
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Allow users to view active professional profiles (for marketplace)
CREATE POLICY "Anyone can view active professional profiles"
  ON profiles FOR SELECT
  USING (
    user_type = 'professional'
    AND is_active = true
    AND EXISTS (
      SELECT 1 FROM professional_profiles
      WHERE profile_id = profiles.id
      AND verification_status = 'approved'
    )
  );

-- Allow users to view client profiles only in conversations
CREATE POLICY "Users can view client profiles in conversations"
  ON profiles FOR SELECT
  USING (
    user_type = 'client'
    AND (
      -- In conversations as professional
      EXISTS (
        SELECT 1 FROM conversations c
        WHERE c.client_profile_id = profiles.id
        AND c.professional_profile_id = auth.uid()
      )
      OR
      -- In conversations as client
      EXISTS (
        SELECT 1 FROM conversations c
        JOIN professional_profiles pp ON pp.profile_id = c.professional_profile_id
        WHERE c.client_profile_id = auth.uid()
        AND c.professional_profile_id = profiles.id
      )
    )
  );

-- =====================================================
-- STEP 3: ADD RLS TO CATEGORIES
-- =====================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Anyone can read categories
CREATE POLICY "Anyone can view active categories"
  ON categories FOR SELECT
  USING (is_active = true);

-- Only admins can modify (will be handled by service role)
-- No INSERT/UPDATE/DELETE policies for regular users

-- =====================================================
-- STEP 4: ADD RLS TO PORTFOLIO_ITEMS
-- =====================================================
ALTER TABLE portfolio_items ENABLE ROW LEVEL SECURITY;

-- Anyone can view portfolio items
CREATE POLICY "Anyone can view portfolio items"
  ON portfolio_items FOR SELECT
  USING (true);

-- Professionals can insert their own items
CREATE POLICY "Professionals can insert their own portfolio items"
  ON portfolio_items FOR INSERT
  WITH CHECK (
    professional_profile_id IN (
      SELECT id FROM professional_profiles WHERE profile_id = auth.uid()
    )
  );

-- Professionals can update their own items
CREATE POLICY "Professionals can update their own portfolio items"
  ON portfolio_items FOR UPDATE
  USING (
    professional_profile_id IN (
      SELECT id FROM professional_profiles WHERE profile_id = auth.uid()
    )
  );

-- Professionals can delete their own items
CREATE POLICY "Professionals can delete their own portfolio items"
  ON portfolio_items FOR DELETE
  USING (
    professional_profile_id IN (
      SELECT id FROM professional_profiles WHERE profile_id = auth.uid()
    )
  );

-- =====================================================
-- STEP 5: ADD RLS TO SUBSCRIPTION_PLANS
-- =====================================================
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;

-- Anyone can view active plans
CREATE POLICY "Anyone can view active subscription plans"
  ON subscription_plans FOR SELECT
  USING (is_active = true);

-- Only service role can modify plans

-- =====================================================
-- STEP 6: FIX SUBSCRIPTIONS RLS (Missing Policies)
-- =====================================================

-- Add INSERT policy (for creating subscriptions)
CREATE POLICY "Users can create their own subscription"
  ON subscriptions FOR INSERT
  WITH CHECK (profile_id = auth.uid());

-- Add UPDATE policy (for managing subscriptions)
CREATE POLICY "Users can update their own subscription"
  ON subscriptions FOR UPDATE
  USING (profile_id = auth.uid());

-- =====================================================
-- STEP 7: ADD RLS TO PAYMENT_TRANSACTIONS (CRITICAL)
-- =====================================================
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- Users can only view their own transactions
CREATE POLICY "Users can view their own payment transactions"
  ON payment_transactions FOR SELECT
  USING (profile_id = auth.uid());

-- Only service role can INSERT/UPDATE transactions
-- No user-facing policies for writes

-- =====================================================
-- STEP 8: ADD RLS TO CONVERSATIONS (CRITICAL)
-- =====================================================
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

-- Users can view conversations they are part of
CREATE POLICY "Users can view their own conversations"
  ON conversations FOR SELECT
  USING (
    client_profile_id = auth.uid()
    OR professional_profile_id = auth.uid()
  );

-- Clients can create conversations with professionals
CREATE POLICY "Clients can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (
    client_profile_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'client'
    )
  );

-- Participants can update conversation metadata
CREATE POLICY "Participants can update conversations"
  ON conversations FOR UPDATE
  USING (
    client_profile_id = auth.uid()
    OR professional_profile_id = auth.uid()
  );

-- =====================================================
-- STEP 9: ADD RLS TO FAVORITES
-- =====================================================
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

-- Users can view their own favorites
CREATE POLICY "Users can view their own favorites"
  ON favorites FOR SELECT
  USING (client_profile_id = auth.uid());

-- Users can add favorites
CREATE POLICY "Users can add favorites"
  ON favorites FOR INSERT
  WITH CHECK (client_profile_id = auth.uid());

-- Users can remove favorites
CREATE POLICY "Users can remove favorites"
  ON favorites FOR DELETE
  USING (client_profile_id = auth.uid());

-- =====================================================
-- STEP 10: ADD RLS TO AVAILABILITY_SLOTS
-- =====================================================
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;

-- Anyone can view available slots (for booking)
CREATE POLICY "Anyone can view availability slots"
  ON availability_slots FOR SELECT
  USING (true);

-- Professionals can manage their own slots
CREATE POLICY "Professionals can manage their availability"
  ON availability_slots FOR ALL
  USING (
    professional_profile_id IN (
      SELECT id FROM professional_profiles WHERE profile_id = auth.uid()
    )
  );

-- =====================================================
-- STEP 11: ADD RLS TO CONTACT_LOGS
-- =====================================================
ALTER TABLE contact_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own contact logs (as client or professional)
CREATE POLICY "Users can view their own contact logs"
  ON contact_logs FOR SELECT
  USING (
    client_profile_id = auth.uid()
    OR professional_profile_id IN (
      SELECT id FROM professional_profiles WHERE profile_id = auth.uid()
    )
  );

-- System can insert contact logs (service role)
-- Users cannot manually insert logs

-- =====================================================
-- STEP 12: ADD RLS TO NOTIFICATIONS (CRITICAL)
-- =====================================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only view their own notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (profile_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (profile_id = auth.uid());

-- Users can delete their own notifications
CREATE POLICY "Users can delete their own notifications"
  ON notifications FOR DELETE
  USING (profile_id = auth.uid());

-- Only service role can INSERT notifications

-- =====================================================
-- STEP 13: ADD RLS TO REPORTED_CONTENT
-- =====================================================
ALTER TABLE reported_content ENABLE ROW LEVEL SECURITY;

-- Users can view their own reports
CREATE POLICY "Users can view their own reports"
  ON reported_content FOR SELECT
  USING (reporter_profile_id = auth.uid());

-- Users can create reports
CREATE POLICY "Users can create reports"
  ON reported_content FOR INSERT
  WITH CHECK (reporter_profile_id = auth.uid());

-- Only admins can update reports (handled by service role)

-- =====================================================
-- STEP 14: ADD RLS TO ADMIN_USERS (CRITICAL)
-- =====================================================
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Only admins can view admin users
CREATE POLICY "Admins can view admin users"
  ON admin_users FOR SELECT
  USING (
    profile_id = auth.uid()
    AND is_active = true
  );

-- No INSERT/UPDATE/DELETE for users - only service role can manage

-- =====================================================
-- STEP 15: FIX BOOKINGS RLS (Missing UPDATE/DELETE)
-- =====================================================

-- Add UPDATE policy
CREATE POLICY "Participants can update bookings"
  ON bookings FOR UPDATE
  USING (
    client_profile_id = auth.uid()
    OR professional_profile_id IN (
      SELECT id FROM professional_profiles WHERE profile_id = auth.uid()
    )
  );

-- Add DELETE policy (only clients can cancel before confirmation)
CREATE POLICY "Clients can cancel their bookings"
  ON bookings FOR DELETE
  USING (
    client_profile_id = auth.uid()
    AND status = 'pending'
  );

-- =====================================================
-- STEP 16: FIX REVIEWS RLS (Missing UPDATE)
-- =====================================================

-- Add UPDATE policy (for professional responses)
CREATE POLICY "Professionals can respond to reviews"
  ON reviews FOR UPDATE
  USING (
    professional_profile_id IN (
      SELECT id FROM professional_profiles WHERE profile_id = auth.uid()
    )
  );

-- Users can update their own reviews
CREATE POLICY "Users can update their own reviews"
  ON reviews FOR UPDATE
  USING (client_profile_id = auth.uid());

-- =====================================================
-- STEP 17: PROTECT SENSITIVE FUNCTIONS
-- =====================================================

-- Revoke public access to sensitive functions
REVOKE ALL ON FUNCTION reset_weekly_contacts() FROM PUBLIC;
REVOKE ALL ON FUNCTION update_professional_rating() FROM PUBLIC;
REVOKE ALL ON FUNCTION update_updated_at_column() FROM PUBLIC;
REVOKE ALL ON FUNCTION calculate_response_time() FROM PUBLIC;
REVOKE ALL ON FUNCTION update_acceptance_rate() FROM PUBLIC;

-- Grant EXECUTE to authenticated users only for safe functions
GRANT EXECUTE ON FUNCTION calculate_distance(DECIMAL, DECIMAL, DECIMAL, DECIMAL) TO authenticated;
GRANT EXECUTE ON FUNCTION get_professional_availability(UUID, DATE, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION check_message_spam(UUID, TEXT) TO authenticated;

-- =====================================================
-- STEP 18: ADD SECURITY DEFINER TO FUNCTIONS
-- =====================================================

-- Recreate sensitive functions with SECURITY DEFINER
CREATE OR REPLACE FUNCTION reset_weekly_contacts()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow service role or admins to execute
  IF NOT EXISTS (
    SELECT 1 FROM admin_users
    WHERE profile_id = auth.uid()
    AND is_active = true
  ) AND auth.role() != 'service_role' THEN
    RAISE EXCEPTION 'Insufficient permissions';
  END IF;

  UPDATE professional_profiles
  SET
    weekly_contacts_used = 0,
    weekly_contacts_reset_at = NOW()
  WHERE weekly_contacts_reset_at < NOW() - INTERVAL '7 days';
END;
$$;

-- =====================================================
-- STEP 19: ADD HELPER FUNCTION FOR PROFESSIONAL SEARCH
-- =====================================================

-- Create a secure function to search professionals
CREATE OR REPLACE FUNCTION search_professionals(
  search_query TEXT DEFAULT NULL,
  category_id_filter UUID DEFAULT NULL,
  user_latitude DECIMAL DEFAULT NULL,
  user_longitude DECIMAL DEFAULT NULL,
  max_distance_km INTEGER DEFAULT 50,
  min_rating DECIMAL DEFAULT 0,
  limit_results INTEGER DEFAULT 20,
  offset_results INTEGER DEFAULT 0
)
RETURNS TABLE(
  professional_profile_id UUID,
  profile_id UUID,
  business_name VARCHAR(255),
  tagline VARCHAR(255),
  description TEXT,
  years_experience INTEGER,
  price_range VARCHAR(20),
  is_verified BOOLEAN,
  average_rating DECIMAL(3,2),
  total_reviews INTEGER,
  full_name VARCHAR(255),
  avatar_url TEXT,
  city VARCHAR(100),
  state VARCHAR(2),
  category_name VARCHAR(100),
  category_slug VARCHAR(100),
  plan_slug VARCHAR(50),
  distance_km DECIMAL
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
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
    p.full_name,
    p.avatar_url,
    p.city,
    p.state,
    c.name,
    c.slug,
    sp.slug,
    CASE
      WHEN user_latitude IS NOT NULL AND user_longitude IS NOT NULL
      THEN calculate_distance(user_latitude, user_longitude, p.latitude, p.longitude)
      ELSE NULL
    END
  FROM professional_profiles pp
  JOIN profiles p ON pp.profile_id = p.id
  JOIN categories c ON pp.category_id = c.id
  LEFT JOIN subscriptions s ON s.profile_id = p.id
    AND s.status = 'active'
    AND s.current_period_end > NOW()
  LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
  WHERE p.is_active = true
    AND pp.verification_status = 'approved'
    AND (category_id_filter IS NULL OR pp.category_id = category_id_filter)
    AND (search_query IS NULL OR
         pp.business_name ILIKE '%' || search_query || '%' OR
         pp.description ILIKE '%' || search_query || '%' OR
         p.full_name ILIKE '%' || search_query || '%')
    AND pp.average_rating >= min_rating
    AND (
      user_latitude IS NULL OR user_longitude IS NULL OR
      calculate_distance(user_latitude, user_longitude, p.latitude, p.longitude) <= max_distance_km
    )
  ORDER BY
    pp.is_verified DESC,
    pp.average_rating DESC,
    pp.total_reviews DESC
  LIMIT limit_results
  OFFSET offset_results;
END;
$$;

GRANT EXECUTE ON FUNCTION search_professionals TO authenticated, anon;

-- =====================================================
-- STEP 20: ADD FUNCTION TO GET PROFESSIONAL DETAILS
-- =====================================================

CREATE OR REPLACE FUNCTION get_professional_details(prof_profile_id UUID)
RETURNS TABLE(
  professional_profile_id UUID,
  profile_id UUID,
  business_name VARCHAR(255),
  tagline VARCHAR(255),
  description TEXT,
  years_experience INTEGER,
  price_range VARCHAR(20),
  is_verified BOOLEAN,
  average_rating DECIMAL(3,2),
  total_reviews INTEGER,
  completed_bookings INTEGER,
  response_time_avg INTEGER,
  acceptance_rate DECIMAL(5,2),
  full_name VARCHAR(255),
  avatar_url TEXT,
  city VARCHAR(100),
  state VARCHAR(2),
  category_name VARCHAR(100),
  category_slug VARCHAR(100),
  category_icon TEXT,
  plan_slug VARCHAR(50),
  services JSONB,
  working_hours JSONB,
  verified_certifications_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
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
    pp.completed_bookings,
    pp.response_time_avg,
    pp.acceptance_rate,
    p.full_name,
    p.avatar_url,
    p.city,
    p.state,
    c.name,
    c.slug,
    c.icon_url,
    sp.slug,
    pp.services,
    pp.working_hours,
    (SELECT COUNT(*) FROM professional_certifications
     WHERE professional_profile_id = pp.id AND is_verified = true)
  FROM professional_profiles pp
  JOIN profiles p ON pp.profile_id = p.id
  JOIN categories c ON pp.category_id = c.id
  LEFT JOIN subscriptions s ON s.profile_id = p.id
    AND s.status = 'active'
    AND s.current_period_end > NOW()
  LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
  WHERE pp.id = prof_profile_id
    AND p.is_active = true
    AND pp.verification_status = 'approved';
END;
$$;

GRANT EXECUTE ON FUNCTION get_professional_details TO authenticated, anon;

-- =====================================================
-- STEP 21: ADD INDEXES FOR PERFORMANCE
-- =====================================================

-- Improve RLS policy performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_type_active ON profiles(user_type, is_active);
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations(client_profile_id, professional_profile_id);
CREATE INDEX IF NOT EXISTS idx_professional_profiles_verification ON professional_profiles(verification_status) WHERE verification_status = 'approved';

-- =====================================================
-- SECURITY FIXES COMPLETE
-- =====================================================

-- Add migration metadata
COMMENT ON SCHEMA public IS 'RLS security fixes applied on 2025-10-12';
