-- ============================================
-- RUN THIS IN SUPABASE SQL EDITOR
-- Simpler version - just creates profile, not candidate_profiles yet
-- ============================================

-- First, let's see if we can create a simple trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Just create the basic profile entry first
  INSERT INTO public.profiles (id, email, user_type)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'user_type')::user_type, 'candidate')
  );

  -- For candidates, create candidate profile
  IF COALESCE((NEW.raw_user_meta_data->>'user_type')::user_type, 'candidate') = 'candidate' THEN
    INSERT INTO public.candidate_profiles (id, first_name, last_name, city, phone)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'first_name',
      NEW.raw_user_meta_data->>'last_name',
      NEW.raw_user_meta_data->>'city',
      NEW.raw_user_meta_data->>'phone'
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- For companies, create company profile
  IF COALESCE((NEW.raw_user_meta_data->>'user_type')::user_type, 'candidate') = 'company' THEN
    INSERT INTO public.company_profiles (id, company_name)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'company_name'
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the signup
    RAISE WARNING 'handle_new_user error: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- Drop and recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Verify trigger exists
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
