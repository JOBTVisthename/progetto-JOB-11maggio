import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNicGJ3aWpvdnBmeXFieGd0YWl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1ODI1MDYsImV4cCI6MjA2MDE1ODUwNn0.kqBCi3gzQjuF7ZhaS6yf8XYdYIfpG96YBNo5hfnELUg";

console.log('=== Admin User Setup Guide ===\n');

console.log('ISSUE IDENTIFIED:');
console.log('The service role key in your .env file appears to be invalid or expired.');
console.log('Error: "Invalid API key"\n');

console.log('SOLUTION OPTIONS:');
console.log('\n=== OPTION 1: Get a New Service Role Key (Recommended) ===');
console.log('1. Go to https://supabase.com/dashboard/project/cbpbwijovpfyqbxgtaiv');
console.log('2. Navigate to Project Settings > API');
console.log('3. Find the "service_role" key under the "Project API keys" section');
console.log('4. Copy the service_role key and replace VITE_SUPABASE_SERVICE_ROLE_KEY in your .env file');
console.log('5. Run: node scripts/create-admin.js\n');

console.log('=== OPTION 2: Manual Admin User Creation ===');
console.log('1. Go to https://supabase.com/dashboard/project/cbpbwijovpfyqbxgtaiv');
console.log('2. Navigate to Authentication > Users');
console.log('3. Click "Add user" and create:');
console.log('   Email: admin@jobtv.com');
console.log('   Password: Stocazzo1.1');
console.log('   Set "Confirm email" to ON');
console.log('   Add user metadata: {"role": "admin"}');
console.log('4. After creating the user, go to SQL Editor');
console.log('5. Run this SQL to create the profile:');
console.log('INSERT INTO public.profiles (id, role, user_type, created_at, updated_at)');
console.log('SELECT id, \'admin\', \'company\', NOW(), NOW()');
console.log('FROM auth.users');
console.log('WHERE email = \'admin@jobtv.com\'');
console.log('ON CONFLICT (id) DO UPDATE SET');
console.log('  role = \'admin\',');
console.log('  user_type = \'company\',');
console.log('  updated_at = NOW();');

console.log('=== OPTION 3: Quick Test Script ===');
console.log('Test if your current admin user exists:');

async function testAdminUser() {
  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'admin@jobtv.com',
      password: 'Stocazzo1.1'
    });
    
    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        console.log('❌ Admin user does not exist');
      } else {
        console.log('❌ Error:', error.message);
      }
    } else if (data.user) {
      console.log('✅ Admin user exists! User ID:', data.user.id);
      
      // Check if profile exists
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, user_type')
        .eq('id', data.user.id)
        .single();
      
      if (profileError) {
        console.log('❌ Profile does not exist or is inaccessible');
        console.log('Run the SQL from OPTION 2 to create the profile');
      } else {
        console.log('✅ Profile exists:', profile);
        if (profile.role === 'admin' && profile.user_type === 'company') {
          console.log('🎉 Admin setup is complete! You can now use /admin/dashboard');
        } else {
          console.log('⚠️  Profile exists but role/user_type are incorrect');
          console.log('Run the SQL from OPTION 2 to fix the profile');
        }
      }
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testAdminUser().then(() => {
  console.log('\n=== SUMMARY ===');
  console.log('The original script failed because the service role key is invalid.');
  console.log('Use OPTION 1 for the best solution, or OPTION 2 for manual setup.');
  console.log('After fixing, use these credentials:');
  console.log('Email: admin@jobtv.com');
  console.log('Password: Stocazzo1.1');
  console.log('Admin Dashboard: /admin/dashboard');
});
