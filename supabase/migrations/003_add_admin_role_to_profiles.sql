-- Add admin role to profiles table
ALTER TABLE profiles ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin'));

-- Create admin user with specified credentials
-- Note: This will be created through the auth system, then we'll update the role
-- The admin user will have email: admin@jobtv.com and password: Stocazzo1.1

-- Create a function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = user_id AND role = 'admin'
  );
END;
$$;

-- Create RLS policies for admin operations
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow admins to read all profiles
CREATE POLICY "Admins can read all profiles" ON profiles
  FOR SELECT USING (is_admin(auth.uid()));

-- Allow admins to update all profiles
CREATE POLICY "Admins can update all profiles" ON profiles
  FOR UPDATE USING (is_admin(auth.uid()));

-- Allow admins to delete all profiles
CREATE POLICY "Admins can delete all profiles" ON profiles
  FOR DELETE USING (is_admin(auth.uid()));

-- Allow admins to read all candidate_profiles
ALTER TABLE candidate_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read all candidate profiles" ON candidate_profiles
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all candidate profiles" ON candidate_profiles
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete all candidate profiles" ON candidate_profiles
  FOR DELETE USING (is_admin(auth.uid()));

-- Allow admins to read all company_profiles
ALTER TABLE company_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read all company profiles" ON company_profiles
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all company profiles" ON company_profiles
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete all company profiles" ON company_profiles
  FOR DELETE USING (is_admin(auth.uid()));

-- Allow admins to manage subscriptions
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read all subscriptions" ON subscriptions
  FOR SELECT USING (is_admin(auth.uid()));

CREATE POLICY "Admins can update all subscriptions" ON subscriptions
  FOR UPDATE USING (is_admin(auth.uid()));

CREATE POLICY "Admins can delete all subscriptions" ON subscriptions
  FOR DELETE USING (is_admin(auth.uid()));
