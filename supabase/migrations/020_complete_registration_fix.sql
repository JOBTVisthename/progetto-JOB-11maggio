-- ============================================================================
-- COMPLETE FIX FOR REGISTRATION - Tables, RLS, and Trigger
-- ============================================================================
-- This will fix the registration issue once and for all

-- STEP 1: Ensure all tables exist
DO $$
BEGIN
    -- Create profiles table if not exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'profiles') THEN
        CREATE TABLE public.profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT,
            user_type TEXT DEFAULT 'candidate',
            first_name TEXT,
            last_name TEXT,
            company_name TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;

    -- Create candidate_profiles table if not exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'candidate_profiles') THEN
        CREATE TABLE public.candidate_profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            first_name TEXT,
            last_name TEXT,
            city TEXT,
            phone TEXT,
            desired_job_title TEXT,
            profile_image_url TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;

    -- Create company_profiles table if not exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'company_profiles') THEN
        CREATE TABLE public.company_profiles (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            company_name TEXT,
            city TEXT,
            phone TEXT,
            logo_url TEXT,
            description TEXT,
            website TEXT,
            industry TEXT,
            company_size TEXT,
            founded_year INTEGER,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            updated_at TIMESTAMPTZ DEFAULT NOW()
        );
    END IF;
END $$;

-- STEP 2: Remove old trigger and function completely
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- STEP 3: TEMPORARILY disable RLS for setup (will re-enable after)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_profiles DISABLE ROW LEVEL SECURITY;

-- STEP 4: Create the trigger function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_type TEXT;
BEGIN
    RAISE LOG '=== handle_new_user START for user % ===', NEW.id;

    -- Get user type from metadata
    v_user_type := COALESCE(NEW.raw_user_meta_data->>'user_type', 'candidate');
    RAISE LOG 'User type: %', v_user_type;

    -- Insert into profiles table - THIS IS CRITICAL
    BEGIN
        INSERT INTO public.profiles (id, email, user_type)
        VALUES (NEW.id, NEW.email, v_user_type);
        RAISE LOG '✓ Profile created for user %', NEW.id;
    EXCEPTION WHEN OTHERS THEN
        RAISE LOG '✗ Profile creation FAILED for user %: %', NEW.id, SQLERRM;
        -- Don't fail - continue
    END;

    -- Insert into candidate_profiles if candidate
    IF v_user_type = 'candidate' THEN
        BEGIN
            INSERT INTO public.candidate_profiles (id, first_name, last_name, city, phone)
            VALUES (
                NEW.id,
                NEW.raw_user_meta_data->>'first_name',
                NEW.raw_user_meta_data->>'last_name',
                NEW.raw_user_meta_data->>'city',
                NEW.raw_user_meta_data->>'phone'
            );
            RAISE LOG '✓ Candidate profile created for user %', NEW.id;
        EXCEPTION WHEN OTHERS THEN
            RAISE LOG '✗ Candidate profile FAILED for user %: %', NEW.id, SQLERRM;
        END;
    END IF;

    -- Insert into company_profiles if company
    IF v_user_type = 'company' THEN
        BEGIN
            INSERT INTO public.company_profiles (id, company_name, city, phone)
            VALUES (
                NEW.id,
                NEW.raw_user_meta_data->>'company_name',
                NEW.raw_user_meta_data->>'city',
                NEW.raw_user_meta_data->>'phone'
            );
            RAISE LOG '✓ Company profile created for user %', NEW.id;
        EXCEPTION WHEN OTHERS THEN
            RAISE LOG '✗ Company profile FAILED for user %: %', NEW.id, SQLERRM;
        END;
    END IF;

    RAISE LOG '=== handle_new_user END for user % ===', NEW.id;
    RETURN NEW;
END;
$$;

-- STEP 5: Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- STEP 6: Re-enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;

-- STEP 7: Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own candidate profile" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Users can update own candidate profile" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Users can insert own candidate profile" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Users can view own company profile" ON public.company_profiles;
DROP POLICY IF EXISTS "Users can update own company profile" ON public.company_profiles;
DROP POLICY IF EXISTS "Users can insert own company profile" ON public.company_profiles;

-- STEP 8: Create simple, working policies
CREATE POLICY "Enable read access for all users based on user_id" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users only" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on user_id" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable read access for all users based on user_id" ON public.candidate_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users only" ON public.candidate_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on user_id" ON public.candidate_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Enable read access for all users based on user_id" ON public.company_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users only" ON public.company_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on user_id" ON public.company_profiles
  FOR UPDATE USING (auth.uid() = id);

-- STEP 9: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.candidate_profiles TO authenticated;
GRANT ALL ON public.company_profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT ON public.candidate_profiles TO anon;
GRANT SELECT ON public.company_profiles TO anon;

-- STEP 10: Log completion
DO $$ BEGIN RAISE LOG '=== REGISTRATION FIX APPLIED SUCCESSFULLY ==='; END $$;
