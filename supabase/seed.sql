-- =====================================================
-- SEED DATA FOR CONECTEJA
-- =====================================================
-- This file seeds the database with test users and data
-- Execute after running migrations
-- =====================================================

-- =====================================================
-- EXTENSIONS
-- =====================================================
COMMENT ON SCHEMA "public" IS 'standard public schema';

CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";

CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";

CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";

-- =====================================================
-- CATEGORIES
-- =====================================================
INSERT INTO categories (name, slug, description, icon_url, color, display_order, is_active)
VALUES
  ('Plomería', 'plomeria', 'Encuentra profesionales de plomería', '🔧', '#3b82f6', 0, true),
  ('Electricidad', 'electricidad', 'Encuentra profesionales de electricidad', '💡', '#f59e0b', 1, true),
  ('Carpintería', 'carpinteria', 'Encuentra profesionales de carpintería', '🪚', '#8b5cf6', 2, true),
  ('Limpieza', 'limpieza', 'Encuentra profesionales de limpieza', '🧹', '#10b981', 3, true),
  ('Pintura', 'pintura', 'Encuentra profesionales de pintura', '🎨', '#ef4444', 4, true),
  ('Jardinería', 'jardineria', 'Encuentra profesionales de jardinería', '🌱', '#22c55e', 5, true),
  ('Cerrajería', 'cerrajeria', 'Encuentra profesionales de cerrajería', '🔑', '#6366f1', 6, true),
  ('Aire Acondicionado', 'aire-acondicionado', 'Encuentra profesionales de aire acondicionado', '❄️', '#06b6d4', 7, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon_url = EXCLUDED.icon_url,
  color = EXCLUDED.color,
  display_order = EXCLUDED.display_order,
  is_active = EXCLUDED.is_active;

-- =====================================================
-- TEST USERS
-- =====================================================
-- Note: All passwords are 'Password123!'
DO $$
DECLARE
  
  -- User IDs
  maria_id UUID := extensions.gen_random_uuid();
  joao_id UUID := extensions.gen_random_uuid();
  ana_id UUID := extensions.gen_random_uuid();
  pedro_id UUID := extensions.gen_random_uuid();
  julia_id UUID := extensions.gen_random_uuid();
  
  -- Category IDs
  plomeria_id UUID;
  electricidad_id UUID;
  limpieza_id UUID;
  carpinteria_id UUID;
  pintura_id UUID;
BEGIN
  -- Get category IDs
  SELECT id INTO plomeria_id FROM categories WHERE slug = 'plomeria';
  SELECT id INTO electricidad_id FROM categories WHERE slug = 'electricidad';
  SELECT id INTO limpieza_id FROM categories WHERE slug = 'limpieza';
  SELECT id INTO carpinteria_id FROM categories WHERE slug = 'carpinteria';
  SELECT id INTO pintura_id FROM categories WHERE slug = 'pintura';

  -- ==========================================
  -- USER 1: Maria Silva - Professional (Plumber)
  -- ==========================================
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
    is_super_admin, role, aud, confirmation_token, email_change_token_new,
    email_change, recovery_token, email_change_token_current, phone_change,
    phone_change_token, reauthentication_token, email_change_confirm_status,
    is_sso_user, is_anonymous
  )
  VALUES (
    maria_id,
    '00000000-0000-0000-0000-000000000000',
    'maria.silva@example.com',
    extensions.crypt('Password123!', extensions.gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object(
      'full_name', 'Maria Silva',
      'default_mode', 'professional',
      'category_id', plomeria_id,
      'business_name', 'Maria Silva - Plomería',
      'tagline', 'Plomería profesional con 10 años de experiencia',
      'description', 'Profissional com 10 anos de experiência no setor. Especializado em trabalhos residenciais e comerciais.',
      'years_experience', 10
    ),
    false, 'authenticated', 'authenticated',
    '', '', '', '', '', '', '', '', 0, false, false
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (
    extensions.gen_random_uuid(), maria_id::text, maria_id,
    jsonb_build_object('sub', maria_id::text, 'email', 'maria.silva@example.com', 'email_verified', true, 'phone_verified', false),
    'email', NOW(), NOW(), NOW()
  )
  ON CONFLICT DO NOTHING;

  -- ==========================================
  -- USER 2: João Santos - Professional (Electrician)
  -- ==========================================
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
    is_super_admin, role, aud, confirmation_token, email_change_token_new,
    email_change, recovery_token, email_change_token_current, phone_change,
    phone_change_token, reauthentication_token, email_change_confirm_status,
    is_sso_user, is_anonymous
  )
  VALUES (
    joao_id,
    '00000000-0000-0000-0000-000000000000',
    'joao.santos@example.com',
    extensions.crypt('Password123!', extensions.gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object(
      'full_name', 'João Santos',
      'default_mode', 'professional',
      'category_id', electricidad_id,
      'business_name', 'João Santos - Electricidad',
      'tagline', 'Electricidad profesional con 8 años de experiencia',
      'description', 'Técnico certificado com ampla trajetória. Ofereço serviços de qualidade garantida.',
      'years_experience', 8
    ),
    false, 'authenticated', 'authenticated',
    '', '', '', '', '', '', '', '', 0, false, false
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (
    extensions.gen_random_uuid(), joao_id::text, joao_id,
    jsonb_build_object('sub', joao_id::text, 'email', 'joao.santos@example.com', 'email_verified', true, 'phone_verified', false),
    'email', NOW(), NOW(), NOW()
  )
  ON CONFLICT DO NOTHING;

  -- ==========================================
  -- USER 3: Ana Oliveira - Client
  -- ==========================================
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
    is_super_admin, role, aud, confirmation_token, email_change_token_new,
    email_change, recovery_token, email_change_token_current, phone_change,
    phone_change_token, reauthentication_token, email_change_confirm_status,
    is_sso_user, is_anonymous
  )
  VALUES (
    ana_id,
    '00000000-0000-0000-0000-000000000000',
    'ana.oliveira@example.com',
    extensions.crypt('Password123!', extensions.gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object(
      'full_name', 'Ana Oliveira',
      'default_mode', 'client'
    ),
    false, 'authenticated', 'authenticated',
    '', '', '', '', '', '', '', '', 0, false, false
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (
    extensions.gen_random_uuid(), ana_id::text, ana_id,
    jsonb_build_object('sub', ana_id::text, 'email', 'ana.oliveira@example.com', 'email_verified', true, 'phone_verified', false),
    'email', NOW(), NOW(), NOW()
  )
  ON CONFLICT DO NOTHING;

  -- ==========================================
  -- USER 4: Pedro Costa - Client
  -- ==========================================
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
    is_super_admin, role, aud, confirmation_token, email_change_token_new,
    email_change, recovery_token, email_change_token_current, phone_change,
    phone_change_token, reauthentication_token, email_change_confirm_status,
    is_sso_user, is_anonymous
  )
  VALUES (
    pedro_id,
    '00000000-0000-0000-0000-000000000000',
    'pedro.costa@example.com',
    extensions.crypt('Password123!', extensions.gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object(
      'full_name', 'Pedro Costa',
      'default_mode', 'client'
    ),
    false, 'authenticated', 'authenticated',
    '', '', '', '', '', '', '', '', 0, false, false
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (
    extensions.gen_random_uuid(), pedro_id::text, pedro_id,
    jsonb_build_object('sub', pedro_id::text, 'email', 'pedro.costa@example.com', 'email_verified', true, 'phone_verified', false),
    'email', NOW(), NOW(), NOW()
  )
  ON CONFLICT DO NOTHING;

  -- ==========================================
  -- USER 5: Julia Ferreira - Professional (Cleaning)
  -- ==========================================
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    created_at, updated_at, raw_app_meta_data, raw_user_meta_data,
    is_super_admin, role, aud, confirmation_token, email_change_token_new,
    email_change, recovery_token, email_change_token_current, phone_change,
    phone_change_token, reauthentication_token, email_change_confirm_status,
    is_sso_user, is_anonymous
  )
  VALUES (
    julia_id,
    '00000000-0000-0000-0000-000000000000',
    'julia.ferreira@example.com',
    extensions.crypt('Password123!', extensions.gen_salt('bf')),
    NOW(), NOW(), NOW(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    jsonb_build_object(
      'full_name', 'Julia Ferreira',
      'default_mode', 'professional',
      'category_id', limpieza_id,
      'business_name', 'Julia Ferreira - Limpieza',
      'tagline', 'Limpieza profesional con 5 años de experiencia',
      'description', 'Profissional responsável e pontual. Me comprometo com a satisfação do cliente.',
      'years_experience', 5
    ),
    false, 'authenticated', 'authenticated',
    '', '', '', '', '', '', '', '', 0, false, false
  )
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO auth.identities (id, provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
  VALUES (
    extensions.gen_random_uuid(), julia_id::text, julia_id,
    jsonb_build_object('sub', julia_id::text, 'email', 'julia.ferreira@example.com', 'email_verified', true, 'phone_verified', false),
    'email', NOW(), NOW(), NOW()
  )
  ON CONFLICT DO NOTHING;

  -- Wait for triggers to complete profile creation
  PERFORM pg_sleep(0.5);

  -- ==========================================
  -- UPDATE PROFILES WITH ADDITIONAL DATA
  -- ==========================================
  
  -- Maria Silva - Professional
  UPDATE profiles SET
    phone = '+55 (48) 99123-4567',
    bio = 'Profissional com 10 anos de experiência no setor. Especializado em trabalhos residenciais e comerciais.',
    latitude = -27.5954,
    longitude = -48.5480,
    address = 'Rua das Flores, 123',
    city = 'Florianópolis',
    state = 'SC',
    postal_code = '88010-000',
    is_verified = true
  WHERE id = maria_id;

  UPDATE professional_profiles SET
    price_range = 'R$ 80-150',
    service_radius_km = 20,
    is_verified = true,
    verification_status = 'approved',
    average_rating = 4.8,
    total_reviews = 45,
    total_bookings = 150,
    completed_bookings = 142,
    accepts_bookings = true
  WHERE profile_id = maria_id;

  -- João Santos - Professional
  UPDATE profiles SET
    phone = '+55 (48) 99234-5678',
    bio = 'Técnico certificado com ampla trajetória. Ofereço serviços de qualidade garantida.',
    latitude = -27.6106,
    longitude = -48.6347,
    address = 'Av. Central, 456',
    city = 'São José',
    state = 'SC',
    postal_code = '88101-000',
    is_verified = true
  WHERE id = joao_id;

  UPDATE professional_profiles SET
    price_range = 'R$ 70-140',
    service_radius_km = 25,
    is_verified = true,
    verification_status = 'approved',
    average_rating = 4.7,
    total_reviews = 38,
    total_bookings = 120,
    completed_bookings = 115,
    accepts_bookings = true
  WHERE profile_id = joao_id;

  -- Ana Oliveira - Client
  UPDATE profiles SET
    phone = '+55 (48) 99345-6789',
    latitude = -27.5960,
    longitude = -48.5490,
    address = 'Rua dos Pinheiros, 789',
    city = 'Florianópolis',
    state = 'SC',
    postal_code = '88015-000'
  WHERE id = ana_id;

  -- Pedro Costa - Client
  UPDATE profiles SET
    phone = '+55 (48) 99456-7890',
    latitude = -27.6445,
    longitude = -48.6702,
    address = 'Rua do Comércio, 321',
    city = 'Palhoça',
    state = 'SC',
    postal_code = '88130-000'
  WHERE id = pedro_id;

  -- Julia Ferreira - Professional
  UPDATE profiles SET
    phone = '+55 (48) 99567-8901',
    bio = 'Profissional responsável e pontual. Me comprometo com a satisfação do cliente.',
    latitude = -27.6110,
    longitude = -48.6350,
    address = 'Rua das Palmeiras, 555',
    city = 'São José',
    state = 'SC',
    postal_code = '88102-000',
    is_verified = true
  WHERE id = julia_id;

  UPDATE professional_profiles SET
    price_range = 'R$ 60-120',
    service_radius_km = 15,
    is_verified = true,
    verification_status = 'approved',
    average_rating = 4.9,
    total_reviews = 67,
    total_bookings = 200,
    completed_bookings = 195,
    accepts_bookings = true
  WHERE profile_id = julia_id;

  -- ==========================================
  -- JOB POSTINGS
  -- ==========================================
  
  -- Job 1: Ana needs a plumber
  INSERT INTO job_postings (
    client_profile_id, title, description, category_id,
    budget_min, budget_max, budget_type, status,
    location_city, location_state, location_latitude, location_longitude,
    start_date, is_recurring, expires_at
  ) VALUES (
    ana_id,
    'Necesito plomero para reparar fuga',
    'Tengo una fuga en el baño que necesita ser reparada urgentemente. Busco profesional con experiencia.',
    plomeria_id,
    100, 200, 'fixed', 'open',
    'Florianópolis', 'SC', -27.5960, -48.5490,
    CURRENT_DATE + INTERVAL '3 days', false,
    CURRENT_DATE + INTERVAL '30 days'
  );

  -- Job 2: Pedro needs an electrician
  INSERT INTO job_postings (
    client_profile_id, title, description, category_id,
    budget_min, budget_max, budget_type, status,
    location_city, location_state, location_latitude, location_longitude,
    start_date, is_recurring, expires_at
  ) VALUES (
    pedro_id,
    'Instalación de ventiladores de techo',
    'Necesito instalar 3 ventiladores de techo en mi casa. Ya tengo los ventiladores.',
    electricidad_id,
    150, 250, 'fixed', 'open',
    'Palhoça', 'SC', -27.6445, -48.6702,
    CURRENT_DATE + INTERVAL '5 days', false,
    CURRENT_DATE + INTERVAL '30 days'
  );

  -- Job 3: Ana needs cleaning service
  INSERT INTO job_postings (
    client_profile_id, title, description, category_id,
    budget_type, status,
    location_city, location_state, location_latitude, location_longitude,
    is_recurring, expires_at
  ) VALUES (
    ana_id,
    'Limpieza profunda de departamento',
    'Busco servicio de limpieza profunda para mi departamento de 2 dormitorios.',
    limpieza_id,
    'negotiable', 'open',
    'Florianópolis', 'SC', -27.5960, -48.5490,
    false,
    CURRENT_DATE + INTERVAL '30 days'
  );

  -- Job 4: Pedro needs painter
  INSERT INTO job_postings (
    client_profile_id, title, description, category_id,
    budget_min, budget_max, budget_type, status,
    location_city, location_state, location_latitude, location_longitude,
    start_date, expires_at
  ) VALUES (
    pedro_id,
    'Pintura de 2 habitaciones',
    'Necesito pintar 2 habitaciones de mi casa. Aproximadamente 40m² en total.',
    pintura_id,
    300, 500, 'fixed', 'open',
    'Palhoça', 'SC', -27.6445, -48.6702,
    CURRENT_DATE + INTERVAL '7 days',
    CURRENT_DATE + INTERVAL '30 days'
  );

  -- Job 5: Ana needs carpenter
  INSERT INTO job_postings (
    client_profile_id, title, description, category_id,
    budget_min, budget_max, budget_type, status,
    location_city, location_state, location_latitude, location_longitude,
    start_date, is_recurring, expires_at
  ) VALUES (
    ana_id,
    'Armario empotrado a medida',
    'Necesito un armario empotrado para mi dormitorio. Tengo las medidas exactas.',
    carpinteria_id,
    800, 1200, 'fixed', 'open',
    'Florianópolis', 'SC', -27.5960, -48.5490,
    CURRENT_DATE + INTERVAL '10 days', false,
    CURRENT_DATE + INTERVAL '30 days'
  );

  RAISE NOTICE 'Seed completed successfully!';
  RAISE NOTICE 'Test users created:';
  RAISE NOTICE '  - maria.silva@example.com (Professional - Plumber)';
  RAISE NOTICE '  - joao.santos@example.com (Professional - Electrician)';
  RAISE NOTICE '  - ana.oliveira@example.com (Client)';
  RAISE NOTICE '  - pedro.costa@example.com (Client)';
  RAISE NOTICE '  - julia.ferreira@example.com (Professional - Cleaning)';
  RAISE NOTICE '  All passwords: Password123!';
  RAISE NOTICE '  Job postings: 5 created';
END $$;

-- =====================================================
-- END OF SEED
-- =====================================================

