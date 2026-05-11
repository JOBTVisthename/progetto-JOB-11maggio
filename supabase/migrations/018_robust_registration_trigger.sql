-- ============================================================================
-- ROBUST REGISTRATION TRIGGER - Final fix without enum type dependency
-- ============================================================================
-- This migration removes dependency on user_type enum and handles all cases

-- STEP 1: Drop the old trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- STEP 2: Ensure profiles table exists with correct structure
DO $$
BEGIN
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
END $$;

-- STEP 3: Ensure candidate_profiles table exists
DO $$
BEGIN
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
END $$;

-- STEP 4: Ensure company_profiles table exists
DO $$
BEGIN
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

-- STEP 5: Create the robust trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_user_type TEXT;
    v_first_name TEXT;
    v_last_name TEXT;
    v_city TEXT;
    v_phone TEXT;
    v_company_name TEXT;
BEGIN
    -- Extract metadata with defaults
    v_user_type := COALESCE(NEW.raw_user_meta_data->>'user_type', 'candidate');
    v_first_name := NEW.raw_user_meta_data->>'first_name';
    v_last_name := NEW.raw_user_meta_data->>'last_name';
    v_city := NEW.raw_user_meta_data->>'city';
    v_phone := NEW.raw_user_meta_data->>'phone';
    v_company_name := NEW.raw_user_meta_data->>'company_name';

    -- Log for debugging
    RAISE LOG 'Creating profile for user % with type %', NEW.id, v_user_type;

    -- Insert into main profiles table
    INSERT INTO public.profiles (id, email, user_type)
    VALUES (
        NEW.id,
        NEW.email,
        v_user_type
    );

    -- Insert into candidate_profiles if candidate
    IF v_user_type = 'candidate' THEN
        BEGIN
            INSERT INTO public.candidate_profiles (id, first_name, last_name, city, phone)
            VALUES (
                NEW.id,
                v_first_name,
                v_last_name,
                v_city,
                v_phone
            );
            RAISE LOG 'Created candidate_profile for user %', NEW.id;
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Failed to create candidate_profile for user %: %', NEW.id, SQLERRM;
        END;
    END IF;

    -- Insert into company_profiles if company
    IF v_user_type = 'company' THEN
        BEGIN
            INSERT INTO public.company_profiles (id, company_name, city, phone)
            VALUES (
                NEW.id,
                v_company_name,
                v_city,
                v_phone
            );
            RAISE LOG 'Created company_profile for user %', NEW.id;
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Failed to create company_profile for user %: %', NEW.id, SQLERRM;
        END;
    END IF;

    RETURN NEW;
END;
$$;

-- STEP 6: Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- STEP 7: Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidate_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;

-- STEP 8: Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own candidate profile" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Users can update own candidate profile" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Users can insert own candidate profile" ON public.candidate_profiles;
DROP POLICY IF EXISTS "Users can view own company profile" ON public.company_profiles;
DROP POLICY IF EXISTS "Users can update own company profile" ON public.company_profiles;
DROP POLICY IF EXISTS "Users can insert own company profile" ON public.company_profiles;

-- STEP 9: Create policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- STEP 10: Create policies for candidate_profiles
CREATE POLICY "Users can view own candidate profile"
  ON public.candidate_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own candidate profile"
  ON public.candidate_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own candidate profile"
  ON public.candidate_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- STEP 11: Create policies for company_profiles
CREATE POLICY "Users can view own company profile"
  ON public.company_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own company profile"
  ON public.company_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own company profile"
  ON public.company_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- STEP 12: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.candidate_profiles TO authenticated;
GRANT ALL ON public.company_profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT ON public.candidate_profiles TO anon;
GRANT SELECT ON public.company_profiles TO anon;
