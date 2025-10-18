-- =====================================================
-- UPDATE TRIGGER: ALL USERS GET BOTH PROFILES
-- =====================================================
-- This migration updates the handle_new_user() function
-- to automatically create BOTH profiles and professional_profiles
-- for ALL non-admin users, regardless of user_type.
-- =====================================================

-- Drop and recreate the handle_new_user function with the new logic
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_type VARCHAR(20);
  v_is_admin BOOLEAN;
  v_category_id UUID;
  v_default_category_id UUID;
BEGIN
  -- Check if user is admin
  v_is_admin := COALESCE((NEW.raw_user_meta_data->>'is_admin')::BOOLEAN, false);
  
  -- Skip professional profile creation for admin users
  IF v_is_admin THEN
    -- Get user type from metadata (admins can be 'client' type)
    v_user_type := COALESCE(NEW.raw_user_meta_data->>'user_type', 'client');
    
    -- Insert basic profile for admin
    INSERT INTO public.profiles (
      id,
      user_type,
      full_name,
      email_notifications,
      notifications_enabled,
      is_active,
      default_mode,
      language,
      country
    )
    VALUES (
      NEW.id,
      v_user_type,
      COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'),
      true,
      true,
      true,
      v_user_type,
      'pt-BR',
      'BR'
    );
    
    RETURN NEW;
  END IF;
  
  -- For all non-admin users, set user_type to 'both' (they can be both client and professional)
  v_user_type := 'both';
  
  -- Insert profile with 'both' user_type
  INSERT INTO public.profiles (
    id,
    user_type,
    full_name,
    email_notifications,
    notifications_enabled,
    is_active,
    default_mode,
    language,
    country
  )
  VALUES (
    NEW.id,
    v_user_type,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'),
    true,
    true,
    true,
    COALESCE(NEW.raw_user_meta_data->>'default_mode', 'client'), -- Default to client mode
    'pt-BR',
    'BR'
  );
  
  -- Always create professional profile for non-admin users
  -- Try to get category_id from metadata
  IF NEW.raw_user_meta_data->>'category_id' IS NOT NULL THEN
    v_category_id := (NEW.raw_user_meta_data->>'category_id')::UUID;
  ELSE
    -- Get first active category as default
    SELECT id INTO v_default_category_id
    FROM categories
    WHERE is_active = true
    ORDER BY display_order
    LIMIT 1;
    
    v_category_id := v_default_category_id;
  END IF;
  
  -- Create professional profile (should always succeed if categories exist)
  IF v_category_id IS NOT NULL THEN
    INSERT INTO public.professional_profiles (
      profile_id,
      category_id,
      business_name,
      tagline,
      description,
      years_experience,
      services,
      price_range,
      is_verified,
      verification_status,
      total_reviews,
      average_rating,
      total_bookings,
      completed_bookings,
      profile_views,
      weekly_contacts_used,
      weekly_contacts_reset_at,
      accepts_bookings,
      instant_booking,
      service_radius_km,
      working_hours
    )
    VALUES (
      NEW.id,
      v_category_id,
      COALESCE(NEW.raw_user_meta_data->>'business_name', NULL),
      COALESCE(NEW.raw_user_meta_data->>'tagline', NULL),
      COALESCE(NEW.raw_user_meta_data->>'description', NULL),
      COALESCE((NEW.raw_user_meta_data->>'years_experience')::INTEGER, NULL),
      COALESCE((NEW.raw_user_meta_data->>'services')::JSONB, '[]'::jsonb),
      COALESCE(NEW.raw_user_meta_data->>'price_range', NULL),
      false, -- is_verified
      'pending', -- verification_status
      0, -- total_reviews
      0, -- average_rating
      0, -- total_bookings
      0, -- completed_bookings
      0, -- profile_views
      0, -- weekly_contacts_used
      NOW(), -- weekly_contacts_reset_at
      true, -- accepts_bookings
      false, -- instant_booking
      10, -- service_radius_km (default 10km)
      '{
        "monday": {"enabled": true, "start": "09:00", "end": "18:00"},
        "tuesday": {"enabled": true, "start": "09:00", "end": "18:00"},
        "wednesday": {"enabled": true, "start": "09:00", "end": "18:00"},
        "thursday": {"enabled": true, "start": "09:00", "end": "18:00"},
        "friday": {"enabled": true, "start": "09:00", "end": "18:00"},
        "saturday": {"enabled": false, "start": "09:00", "end": "13:00"},
        "sunday": {"enabled": false, "start": null, "end": null}
      }'::jsonb
    );
  ELSE
    -- Log warning if no categories exist (this shouldn't happen in production)
    RAISE WARNING 'No categories found. Professional profile not created for user %', NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Update the comment for documentation
COMMENT ON FUNCTION public.handle_new_user IS 'Automatically creates both profile AND professional_profile for all non-admin users. All regular users get user_type=both, allowing them to function as both clients and professionals. Reads additional data from raw_user_meta_data.';

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

