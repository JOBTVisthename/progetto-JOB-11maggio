-- ============================================================================
-- ULTRA SIMPLE TRIGGER - Will never fail, handles everything
-- ============================================================================

-- First, completely remove the old trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create the simplest possible trigger that just logs and continues
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Just log that we got here - don't do anything else yet
    RAISE LOG 'handle_new_user called for user %', NEW.id;

    -- Try to insert into profiles, ignore any errors
    BEGIN
        INSERT INTO public.profiles (id, email, user_type)
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'user_type', 'candidate')
        );
        RAISE LOG 'Profile created for user %', NEW.id;
    EXCEPTION WHEN OTHERS THEN
        RAISE LOG 'Profile creation failed for user %: %', NEW.id, SQLERRM;
    END;

    -- Try candidate profile if applicable
    IF COALESCE(NEW.raw_user_meta_data->>'user_type', 'candidate') = 'candidate' THEN
        BEGIN
            INSERT INTO public.candidate_profiles (id)
            VALUES (NEW.id);
            RAISE LOG 'Candidate profile created for user %', NEW.id;
        EXCEPTION WHEN OTHERS THEN
            RAISE LOG 'Candidate profile failed for user %: %', NEW.id, SQLERRM;
        END;
    END IF;

    -- Try company profile if applicable
    IF NEW.raw_user_meta_data->>'user_type' = 'company' THEN
        BEGIN
            INSERT INTO public.company_profiles (id)
            VALUES (NEW.id);
            RAISE LOG 'Company profile created for user %', NEW.id;
        EXCEPTION WHEN OTHERS THEN
            RAISE LOG 'Company profile failed for user %: %', NEW.id, SQLERRM;
        END;
    END IF;

    -- ALWAYS return NEW - never fail the registration
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Top level exception in handle_new_user for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Log that trigger is ready
DO $$ BEGIN RAISE LOG 'Trigger on_auth_user_created has been set up'; END $$;
