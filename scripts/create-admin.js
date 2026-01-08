import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNicGJ3aWpvdnBmeXFieGd0YWl2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ1ODI1MDYsImV4cCI6MjA2MDE1ODUwNn0.kqBCi3gzQjuF7ZhaS6yf8XYdYIfpG96YBNo5hfnELUg";

if (!supabaseUrl) {
  console.error('Missing required environment variable:');
  console.error('VITE_SUPABASE_URL must be set');
  process.exit(1);
}

// Create multiple clients for different approaches
const supabaseService = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function tryServiceRoleApproach() {
  console.log('Trying service role approach...');
  
  try {
    // Test the service role key with a simple query
    const { data, error } = await supabaseService.from('profiles').select('count').limit(1);
    
    if (error) {
      console.log('Service role key test failed:', error.message);
      return null;
    }
    
    console.log('Service role key is valid, proceeding with user creation...');
    
    // Try to sign up the admin user with service role
    const { data: authData, error: authError } = await supabaseService.auth.signUp({
      email: 'admin@jobtv.com',
      password: 'Stocazzo1.1',
      options: {
        data: {
          role: 'admin'
        }
      }
    });

    if (authError && authError.message.includes('already registered')) {
      console.log('Admin user already exists, trying to sign in with service role...');
      const { data: signInData, error: signInError } = await supabaseService.auth.signInWithPassword({
        email: 'admin@jobtv.com',
        password: 'Stocazzo1.1'
      });
      
      if (signInError) {
        throw signInError;
      }
      
      if (signInData.user) {
        const { error: updateError } = await supabaseService
          .from('profiles')
          .upsert({ 
            id: signInData.user.id,
            role: 'admin',
            user_type: 'company'
          }, {
            onConflict: 'id'
          });

        if (updateError) {
          throw updateError;
        }
        
        console.log('Admin profile updated successfully with service role!');
        return signInData.user;
      }
    } else if (authError) {
      throw authError;
    } else {
      console.log('Admin user created successfully with service role!');
      console.log('Please check your email to confirm the account, then run this script again to set up the admin profile.');
      return authData.user;
    }
  } catch (error) {
    console.log('Service role approach failed:', error.message);
    return null;
  }
  
  return null;
}

async function tryAnonKeyApproach() {
  console.log('Trying anon key approach...');
  
  try {
    // Try to sign up with anon key first
    const { data: authData, error: authError } = await supabaseAnon.auth.signUp({
      email: 'admin@jobtv.com',
      password: 'Stocazzo1.1',
      options: {
        data: {
          role: 'admin'
        }
      }
    });

    if (authError && authError.message.includes('already registered')) {
      console.log('Admin user already exists, trying to sign in with anon key...');
      const { data: signInData, error: signInError } = await supabaseAnon.auth.signInWithPassword({
        email: 'admin@jobtv.com',
        password: 'Stocazzo1.1'
      });
      
      if (signInError) {
        throw signInError;
      }
      
      if (signInData.user) {
        console.log('Successfully signed in with anon key. User ID:', signInData.user.id);
        console.log('Note: Profile update requires proper RLS policies or service role.');
        return signInData.user;
      }
    } else if (authError) {
      throw authError;
    } else {
      console.log('Admin user created successfully with anon key!');
      console.log('Please check your email to confirm the account.');
      return authData.user;
    }
  } catch (error) {
    console.log('Anon key approach failed:', error.message);
    return null;
  }
  
  return null;
}

async function tryDirectDBApproach() {
  console.log('Trying direct database approach with existing user...');
  
  try {
    // First, try to sign in with the admin credentials to see if user exists
    const { data: signInData, error: signInError } = await supabaseAnon.auth.signInWithPassword({
      email: 'admin@jobtv.com',
      password: 'Stocazzo1.1'
    });
    
    if (signInError) {
      if (signInError.message.includes('Invalid login credentials')) {
        console.log('Admin user does not exist yet. Please create it manually through the Supabase dashboard:');
        console.log('1. Go to https://supabase.com/dashboard/project/cbpbwijovpfyqbxgtaiv');
        console.log('2. Navigate to Authentication > Users');
        console.log('3. Click "Add user"');
        console.log('4. Email: admin@jobtv.com');
        console.log('5. Password: Stocazzo1.1');
        console.log('6. Set email confirmation to "Confirmed"');
        console.log('7. Add user metadata: {"role": "admin"}');
        console.log('8. After creating the user, run this script again to set up the profile.');
        return null;
      }
      throw signInError;
    }
    
    if (signInData.user) {
      console.log('Admin user found! User ID:', signInData.user.id);
      
      // Now try to update the profile using RPC to bypass RLS
      const { data: profileData, error: profileError } = await supabaseAnon.rpc('admin_update_profile', {
        user_id: signInData.user.id,
        user_role: 'admin',
        user_type: 'company'
      });
      
      if (profileError) {
        console.log('RPC approach failed, trying direct insert...');
        
        // If RPC fails, try direct insert (this might fail due to RLS)
        const { error: insertError } = await supabaseAnon
          .from('profiles')
          .upsert({ 
            id: signInData.user.id,
            role: 'admin',
            user_type: 'company'
          }, {
            onConflict: 'id'
          });

        if (insertError) {
          console.log('Direct profile update failed:', insertError.message);
          console.log('Manual profile update required. Run this SQL in Supabase SQL Editor:');
          console.log(`
INSERT INTO public.profiles (id, role, user_type, created_at, updated_at)
VALUES ('${signInData.user.id}', 'admin', 'company', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET role = 'admin', user_type = 'company', updated_at = NOW();
          `);
          return { id: signInData.user.id, profile_needs_manual_update: true };
        } else {
          console.log('Profile updated successfully!');
          return { id: signInData.user.id };
        }
      } else {
        console.log('Profile updated successfully via RPC!');
        return { id: signInData.user.id };
      }
    }
  } catch (error) {
    console.log('Direct database approach failed:', error.message);
    return null;
  }
  
  return null;
}

async function createAdminUser() {
  try {
    console.log('=== Creating Admin User ===\n');
    
    let user = null;
    
    // Try approach 1: Service role key
    user = await tryServiceRoleApproach();
    
    if (!user) {
      // Try approach 2: Anon key
      user = await tryAnonKeyApproach();
    }
    
    if (!user) {
      // Try approach 3: Direct database approach
      user = await tryDirectDBApproach();
    }
    
    if (user) {
      console.log('\n=== Admin User Setup Complete! ===');
      console.log('Email: admin@jobtv.com');
      console.log('Password: Stocazzo1.1');
      console.log('User ID:', user.id || 'N/A');
      console.log('\nAccess the admin dashboard at: /admin/dashboard');
      console.log('\nNote: If email confirmation is required, please check your email and then run this script again.');
    } else {
      console.log('\n=== All Approaches Failed ===');
      console.log('Please check:');
      console.log('1. Your Supabase project URL and keys are correct');
      console.log('2. Your Supabase project is active');
      console.log('3. The service role key has proper permissions');
      console.log('4. Try running: supabase login && supabase link --project-ref cbpbwijovpfyqbxgtaiv');
    }
    
  } catch (error) {
    console.error('Unexpected error during admin user creation:', error);
    process.exit(1);
  }
}

createAdminUser();
