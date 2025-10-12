-- =====================================================
-- PROXYO APP - INITIAL DATABASE STRUCTURE
-- =====================================================
-- This migration creates the complete initial database schema
-- for the Proxyo marketplace platform.
-- =====================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- =====================================================
-- TABLE: profiles
-- Extension of Supabase Auth users
-- =====================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('client', 'professional')),

  -- Personal information
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,
  bio TEXT,

  -- Geolocation
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(2),
  postal_code VARCHAR(10),
  country VARCHAR(2) DEFAULT 'BR',

  -- Configuration
  language VARCHAR(5) DEFAULT 'pt-BR',
  notifications_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Geospatial index
  location GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
  ) STORED
);

-- Indexes
CREATE INDEX idx_profiles_user_type ON profiles(user_type);
CREATE INDEX idx_profiles_location ON profiles USING GIST(location);
CREATE INDEX idx_profiles_city_state ON profiles(city, state);

-- =====================================================
-- TABLE: categories
-- Service categories
-- =====================================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon_url TEXT,
  color VARCHAR(7), -- Hex color

  -- Order and status
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,

  -- SEO
  meta_title VARCHAR(255),
  meta_description TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_active ON categories(is_active, display_order);

-- =====================================================
-- TABLE: professional_profiles
-- Extended information for professionals
-- =====================================================
CREATE TABLE professional_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES categories(id),

  -- Professional information
  business_name VARCHAR(255),
  tagline VARCHAR(255), -- "Electricista con 10 anos de experiencia"
  description TEXT,
  years_experience INTEGER,

  -- Services and pricing
  services JSONB DEFAULT '[]'::jsonb, -- [{name, description, price, duration}]
  price_range VARCHAR(20), -- "R$ 50-100", "R$ 100-200"

  -- Verification
  is_verified BOOLEAN DEFAULT false,
  verification_status VARCHAR(20) DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'approved', 'rejected')),
  verification_documents JSONB, -- URLs de documentos
  verified_at TIMESTAMPTZ,

  -- Statistics
  total_reviews INTEGER DEFAULT 0,
  average_rating DECIMAL(3, 2) DEFAULT 0,
  total_bookings INTEGER DEFAULT 0,
  completed_bookings INTEGER DEFAULT 0,
  profile_views INTEGER DEFAULT 0,

  -- Weekly contacts (Free plan)
  weekly_contacts_used INTEGER DEFAULT 0,
  weekly_contacts_reset_at TIMESTAMPTZ DEFAULT NOW(),

  -- Configuration
  accepts_bookings BOOLEAN DEFAULT true,
  instant_booking BOOLEAN DEFAULT false,
  service_radius_km INTEGER DEFAULT 10, -- Service radius

  -- Working hours
  working_hours JSONB DEFAULT '{
    "monday": {"enabled": true, "start": "09:00", "end": "18:00"},
    "tuesday": {"enabled": true, "start": "09:00", "end": "18:00"},
    "wednesday": {"enabled": true, "start": "09:00", "end": "18:00"},
    "thursday": {"enabled": true, "start": "09:00", "end": "18:00"},
    "friday": {"enabled": true, "start": "09:00", "end": "18:00"},
    "saturday": {"enabled": false, "start": "09:00", "end": "13:00"},
    "sunday": {"enabled": false, "start": null, "end": null}
  }'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(profile_id)
);

-- Indexes
CREATE INDEX idx_professional_profiles_category ON professional_profiles(category_id);
CREATE INDEX idx_professional_profiles_verified ON professional_profiles(is_verified);
CREATE INDEX idx_professional_profiles_rating ON professional_profiles(average_rating DESC);
CREATE INDEX idx_professional_profiles_profile_id ON professional_profiles(profile_id);

-- =====================================================
-- TABLE: portfolio_items
-- Professional work gallery
-- =====================================================
CREATE TABLE portfolio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_profile_id UUID NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,

  title VARCHAR(255),
  description TEXT,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_portfolio_professional ON portfolio_items(professional_profile_id, display_order);

-- =====================================================
-- TABLE: subscription_plans
-- Subscription plans (Free, Starter, Premium)
-- =====================================================
CREATE TABLE subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE,
  slug VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,

  -- Pricing
  price_monthly DECIMAL(10, 2) NOT NULL,
  price_yearly DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'BRL',

  -- Features
  features JSONB NOT NULL DEFAULT '{
    "weekly_contacts": 3,
    "chat_enabled": true,
    "whatsapp_button": false,
    "send_images": false,
    "send_location": false,
    "priority_support": false,
    "featured_listing": false,
    "analytics": false,
    "badge": null
  }'::jsonb,

  -- Configuration
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,

  -- External IDs (Mercado Pago / Stripe)
  external_plan_id VARCHAR(255),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Initial data
INSERT INTO subscription_plans (name, slug, price_monthly, price_yearly, features, display_order) VALUES
('Free', 'free', 0, 0, '{
  "weekly_contacts": 3,
  "chat_enabled": true,
  "whatsapp_button": false,
  "send_images": false,
  "send_location": false,
  "priority_support": false,
  "featured_listing": false,
  "analytics": false,
  "badge": null
}', 1),
('Starter', 'starter', 29.90, 299.00, '{
  "weekly_contacts": -1,
  "chat_enabled": true,
  "whatsapp_button": true,
  "send_images": false,
  "send_location": false,
  "priority_support": false,
  "featured_listing": false,
  "analytics": true,
  "badge": "starter"
}', 2),
('Premium', 'premium', 79.90, 799.00, '{
  "weekly_contacts": -1,
  "chat_enabled": true,
  "whatsapp_button": true,
  "send_images": true,
  "send_location": true,
  "priority_support": true,
  "featured_listing": true,
  "analytics": true,
  "badge": "premium"
}', 3);

-- =====================================================
-- TABLE: subscriptions
-- Active professional subscriptions
-- =====================================================
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'canceled', 'expired', 'past_due')),

  -- Dates
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  canceled_at TIMESTAMPTZ,

  -- Payment
  payment_method VARCHAR(50), -- 'credit_card', 'pix', etc.
  external_subscription_id VARCHAR(255), -- Mercado Pago/Stripe ID

  -- Renewal
  auto_renew BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_profile ON subscriptions(profile_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status, current_period_end);
CREATE INDEX idx_subscriptions_external ON subscriptions(external_subscription_id);

-- =====================================================
-- TABLE: payment_transactions
-- Payment history
-- =====================================================
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  profile_id UUID NOT NULL REFERENCES profiles(id),

  -- Payment information
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'BRL',
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method VARCHAR(50),

  -- Payment provider
  provider VARCHAR(50), -- 'mercadopago', 'stripe'
  external_transaction_id VARCHAR(255),

  -- Metadata
  description TEXT,
  metadata JSONB,

  -- Dates
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payment_transactions_profile ON payment_transactions(profile_id);
CREATE INDEX idx_payment_transactions_subscription ON payment_transactions(subscription_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);

-- =====================================================
-- TABLE: bookings
-- Service bookings
-- =====================================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  professional_profile_id UUID NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,

  -- Date and time
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME,
  duration_minutes INTEGER,

  -- Service
  service_name VARCHAR(255) NOT NULL,
  service_description TEXT,
  price DECIMAL(10, 2),

  -- Location (optional)
  location_address TEXT,
  location_latitude DECIMAL(10, 8),
  location_longitude DECIMAL(11, 8),

  -- Status
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'completed', 'canceled', 'no_show')),

  -- Notes
  client_notes TEXT,
  professional_notes TEXT,
  cancellation_reason TEXT,

  -- Reminders
  reminder_sent BOOLEAN DEFAULT false,
  reminder_sent_at TIMESTAMPTZ,

  -- Important dates
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  canceled_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bookings_client ON bookings(client_profile_id, booking_date DESC);
CREATE INDEX idx_bookings_professional ON bookings(professional_profile_id, booking_date DESC);
CREATE INDEX idx_bookings_status ON bookings(status, booking_date);
CREATE INDEX idx_bookings_date ON bookings(booking_date, start_time);

-- =====================================================
-- TABLE: reviews
-- Reviews and ratings
-- =====================================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_profile_id UUID NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,
  client_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,

  -- Rating
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,

  -- Moderation
  is_approved BOOLEAN DEFAULT true,
  is_reported BOOLEAN DEFAULT false,
  report_reason TEXT,
  moderated_at TIMESTAMPTZ,
  moderated_by UUID REFERENCES profiles(id),

  -- Professional response
  response TEXT,
  response_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(booking_id) -- One review per booking
);

CREATE INDEX idx_reviews_professional ON reviews(professional_profile_id, created_at DESC);
CREATE INDEX idx_reviews_client ON reviews(client_profile_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);

-- =====================================================
-- TABLE: favorites
-- Client's favorite professionals
-- =====================================================
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  professional_profile_id UUID NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(client_profile_id, professional_profile_id)
);

CREATE INDEX idx_favorites_client ON favorites(client_profile_id);
CREATE INDEX idx_favorites_professional ON favorites(professional_profile_id);

-- =====================================================
-- TABLE: conversations
-- Chat conversations
-- =====================================================
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  professional_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Last message
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  last_message_preview TEXT,

  -- Unread counters
  unread_count_client INTEGER DEFAULT 0,
  unread_count_professional INTEGER DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(client_profile_id, professional_profile_id)
);

CREATE INDEX idx_conversations_client ON conversations(client_profile_id, last_message_at DESC);
CREATE INDEX idx_conversations_professional ON conversations(professional_profile_id, last_message_at DESC);

-- =====================================================
-- TABLE: messages
-- Chat messages
-- =====================================================
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Content
  message_type VARCHAR(20) DEFAULT 'text'
    CHECK (message_type IN ('text', 'image', 'location', 'system')),
  content TEXT,

  -- Multimedia (Premium only)
  attachment_url TEXT,
  attachment_type VARCHAR(50),

  -- Location (Premium only)
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),

  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_profile_id);
CREATE INDEX idx_messages_unread ON messages(conversation_id, is_read) WHERE is_read = false;

-- =====================================================
-- TABLE: availability_slots
-- Professional specific availability (blocks or extra availability)
-- =====================================================
CREATE TABLE availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_profile_id UUID NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,

  -- Date and time
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,

  -- Type
  slot_type VARCHAR(20) NOT NULL CHECK (slot_type IN ('available', 'blocked')),
  reason TEXT, -- "Vacaciones", "Evento especial", etc.

  -- Recurrence
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern JSONB, -- {type: 'weekly', days: [1,3,5]}
  recurrence_end_date DATE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_availability_professional ON availability_slots(professional_profile_id, date);
CREATE INDEX idx_availability_date ON availability_slots(date, slot_type);

-- =====================================================
-- TABLE: contact_logs
-- Contact logs (for weekly limit control)
-- =====================================================
CREATE TABLE contact_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  professional_profile_id UUID NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,

  -- Contact type
  contact_type VARCHAR(20) NOT NULL CHECK (contact_type IN ('whatsapp', 'chat', 'phone', 'booking')),

  -- Metadata
  metadata JSONB,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contact_logs_client ON contact_logs(client_profile_id, created_at DESC);
CREATE INDEX idx_contact_logs_professional ON contact_logs(professional_profile_id, created_at DESC);

-- =====================================================
-- TABLE: notifications
-- Push and in-app notifications
-- =====================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Content
  type VARCHAR(50) NOT NULL, -- 'new_message', 'booking_confirmed', 'subscription_expiring'
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,

  -- Navigation
  action_url TEXT, -- Deep link
  action_data JSONB,

  -- Status
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,

  -- Push notification
  push_sent BOOLEAN DEFAULT false,
  push_sent_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_profile ON notifications(profile_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(profile_id, is_read) WHERE is_read = false;

-- =====================================================
-- TABLE: reported_content
-- User-reported content
-- =====================================================
CREATE TABLE reported_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Reported content
  content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('review', 'message', 'profile', 'portfolio')),
  content_id UUID NOT NULL,

  -- Reason
  reason VARCHAR(50) NOT NULL,
  description TEXT,

  -- Moderation status
  status VARCHAR(20) DEFAULT 'pending'
    CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  moderator_notes TEXT,
  moderated_by UUID REFERENCES profiles(id),
  moderated_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reported_content_status ON reported_content(status, created_at);
CREATE INDEX idx_reported_content_type ON reported_content(content_type, content_id);

-- =====================================================
-- TABLE: admin_users
-- Admin panel users
-- =====================================================
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,

  -- Role
  role VARCHAR(20) NOT NULL DEFAULT 'moderator'
    CHECK (role IN ('super_admin', 'admin', 'moderator', 'support')),

  -- Permissions
  permissions JSONB DEFAULT '[]'::jsonb,

  -- Status
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(profile_id)
);

CREATE INDEX idx_admin_users_role ON admin_users(role, is_active);

-- =====================================================
-- TABLE: analytics_events
-- Analytics events (for Premium professionals)
-- =====================================================
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_profile_id UUID NOT NULL REFERENCES professional_profiles(id) ON DELETE CASCADE,

  -- Event
  event_type VARCHAR(50) NOT NULL, -- 'profile_view', 'contact_click', 'booking_request'
  event_data JSONB,

  -- Source
  source_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  user_agent TEXT,
  ip_address INET,

  -- Event geolocation
  event_latitude DECIMAL(10, 8),
  event_longitude DECIMAL(11, 8),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analytics_professional ON analytics_events(professional_profile_id, created_at DESC);
CREATE INDEX idx_analytics_event_type ON analytics_events(event_type, created_at);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Profiles: users only see/edit their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Professional profiles: public for read, private for write
ALTER TABLE professional_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view professional profiles"
  ON professional_profiles FOR SELECT
  USING (true);

CREATE POLICY "Professionals can update their own profile"
  ON professional_profiles FOR UPDATE
  USING (profile_id = auth.uid());

CREATE POLICY "Professionals can insert their own profile"
  ON professional_profiles FOR INSERT
  WITH CHECK (profile_id = auth.uid());

-- Messages: only conversation participants
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in their conversations"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = messages.conversation_id
      AND (conversations.client_profile_id = auth.uid()
           OR conversations.professional_profile_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their conversations"
  ON messages FOR INSERT
  WITH CHECK (
    sender_profile_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM conversations
      WHERE conversations.id = conversation_id
      AND (conversations.client_profile_id = auth.uid()
           OR conversations.professional_profile_id = auth.uid())
    )
  );

-- Subscriptions: only the owner
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions"
  ON subscriptions FOR SELECT
  USING (profile_id = auth.uid());

-- Reviews: public read, controlled write
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view approved reviews"
  ON reviews FOR SELECT
  USING (is_approved = true);

CREATE POLICY "Clients can create reviews for their bookings"
  ON reviews FOR INSERT
  WITH CHECK (client_profile_id = auth.uid());

-- Bookings: only participants
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bookings"
  ON bookings FOR SELECT
  USING (
    client_profile_id = auth.uid() OR
    professional_profile_id IN (
      SELECT id FROM professional_profiles WHERE profile_id = auth.uid()
    )
  );

CREATE POLICY "Clients can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (client_profile_id = auth.uid());

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Function: Calculate distance between two points
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 DECIMAL, lon1 DECIMAL,
  lat2 DECIMAL, lon2 DECIMAL
) RETURNS DECIMAL AS $$
BEGIN
  RETURN ST_Distance(
    ST_SetSRID(ST_MakePoint(lon1, lat1), 4326)::geography,
    ST_SetSRID(ST_MakePoint(lon2, lat2), 4326)::geography
  ) / 1000; -- Returns in kilometers
END;
$$ LANGUAGE plpgsql;

-- Function: Update professional rating
CREATE OR REPLACE FUNCTION update_professional_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE professional_profiles
  SET
    total_reviews = (SELECT COUNT(*) FROM reviews WHERE professional_profile_id = NEW.professional_profile_id),
    average_rating = (SELECT ROUND(AVG(rating)::numeric, 2) FROM reviews WHERE professional_profile_id = NEW.professional_profile_id)
  WHERE id = NEW.professional_profile_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_rating
AFTER INSERT OR UPDATE ON reviews
FOR EACH ROW
EXECUTE FUNCTION update_professional_rating();

-- Function: Reset weekly contacts
CREATE OR REPLACE FUNCTION reset_weekly_contacts()
RETURNS void AS $$
BEGIN
  UPDATE professional_profiles
  SET
    weekly_contacts_used = 0,
    weekly_contacts_reset_at = NOW()
  WHERE weekly_contacts_reset_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_professional_profiles_updated_at BEFORE UPDATE ON professional_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_plans_updated_at BEFORE UPDATE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS
-- =====================================================

-- View: Professionals with location and subscription info
CREATE OR REPLACE VIEW v_professionals_with_location AS
SELECT
  pp.*,
  p.full_name,
  p.avatar_url,
  p.city,
  p.state,
  p.latitude,
  p.longitude,
  c.name as category_name,
  c.slug as category_slug,
  sp.name as plan_name,
  sp.slug as plan_slug,
  s.status as subscription_status
FROM professional_profiles pp
JOIN profiles p ON pp.profile_id = p.id
JOIN categories c ON pp.category_id = c.id
LEFT JOIN subscriptions s ON s.profile_id = p.id AND s.status = 'active'
LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
WHERE p.is_active = true;

-- =====================================================
-- INITIAL SETUP COMPLETE
-- =====================================================
