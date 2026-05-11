// ============================================================================
// User Registration API Route
// Handles user registration with profile creation
// ============================================================================

import express from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Initialize Supabase admin client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials for registration API');
}

const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// POST endpoint - Register new user
router.post('/', async (req, res) => {
  try {
    const { email, password, userType, firstName, lastName, companyName } = req.body;

    // Validation
    if (!email || !password || !userType) {
      return res.status(400).json({
        success: false,
        error: 'Email, password, and user type are required'
      });
    }

    if (!supabaseAdmin) {
      return res.status(500).json({
        success: false,
        error: 'Server configuration error'
      });
    }

    console.log('[Register API] Creating user:', { email, userType });

    // Create user with admin API (bypasses email confirmation)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        user_type: userType,
        first_name: firstName || null,
        last_name: lastName || null,
        company_name: companyName || null
      }
    });

    if (authError) {
      console.error('[Register API] Auth error:', authError);
      return res.status(400).json({
        success: false,
        error: authError.message
      });
    }

    if (!authData.user) {
      return res.status(500).json({
        success: false,
        error: 'Failed to create user'
      });
    }

    console.log('[Register API] User created in auth:', authData.user.id);

    // Create profile in profiles table
    const profileData = {
      id: authData.user.id,
      user_type: userType,
      email: email
    };

    if (userType === 'candidate') {
      profileData.first_name = firstName || null;
      profileData.last_name = lastName || null;
    } else if (userType === 'company') {
      profileData.company_name = companyName || null;
    }

    console.log('[Register API] Creating profile:', profileData);

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert(profileData);

    if (profileError) {
      console.error('[Register API] Profile error:', profileError);
      // Don't fail - user can continue, profile can be fixed manually
    } else {
      console.log('[Register API] Profile created successfully');
    }

    res.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email
      }
    });

  } catch (error) {
    console.error('[Register API] Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Registration failed'
    });
  }
});

export default router;
