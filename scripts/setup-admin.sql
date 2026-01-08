-- Admin User Setup SQL
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/cbpbwijovpfyqbxgtaiv/sql

-- Step 1: Create the admin user in auth.users
-- Note: This may not work due to auth.users restrictions, so you might need to
-- create the user manually via Authentication > Users in the dashboard

INSERT INTO auth.users (
  email,
  password_hash,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES (
  'admin@jobtv.com',
  crypt('Stocazzo1.1', gen_salt('bf')),
  NOW(),
  '{"role": "admin"}',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Step 2: Create the profile record for the admin user
INSERT INTO public.profiles (
  id,
  role,
  user_type,
  created_at,
  updated_at
)
SELECT 
  id,
  'admin',
  'company',
  NOW(),
  NOW()
FROM auth.users 
WHERE email = 'admin@jobtv.com'
ON CONFLICT (id) DO UPDATE SET 
  role = 'admin',
  user_type = 'company',
  updated_at = NOW();

-- Step 3: Verify the setup
SELECT 
  u.email,
  u.email_confirmed_at,
  p.role,
  p.user_type,
  u.created_at as user_created,
  p.created_at as profile_created
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE u.email = 'admin@jobtv.com';
