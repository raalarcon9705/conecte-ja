-- Migration: Create profile trigger for new users
-- Description: Automatically create a profile when a new user signs up

-- Function to create profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
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
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'client'),
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuario'),
    true,
    true,
    true,
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'client'),
    'pt-BR',
    'BR'
  );
  
  RETURN NEW;
END;
$$;

-- Trigger to automatically create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create profiles for existing users that don't have one
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
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data->>'user_type', 'client'),
  COALESCE(u.raw_user_meta_data->>'full_name', 'Usuario'),
  true,
  true,
  true,
  COALESCE(u.raw_user_meta_data->>'user_type', 'client'),
  'pt-BR',
  'BR'
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON FUNCTION public.handle_new_user() TO postgres, service_role;

