// ============================================================================
// Stripe Checkout Session API
// Purpose: Generate Stripe Checkout session for subscription payments
// ONLY COMPANIES CAN SUBSCRIBE - This is enforced
// ============================================================================

import express from 'express';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Debug: Log env vars (hidden for security)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
console.log('[checkout] === ENV VARS DEBUG ===');
console.log('[checkout] SUPABASE_URL exists:', !!process.env.SUPABASE_URL);
console.log('[checkout] VITE_SUPABASE_URL exists:', !!process.env.VITE_SUPABASE_URL);
console.log('[checkout] SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log('[checkout] VITE_SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.VITE_SUPABASE_SERVICE_ROLE_KEY);
console.log('[checkout] Using URL:', supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'NOT SET');
console.log('[checkout] Using Key length:', supabaseKey ? supabaseKey.length : 'NOT SET');
console.log('[checkout] ======================');

const router = express.Router();

// Initialize Stripe with secret key from environment
const stripeSecretKey = process.env.VITE_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

router.post('/', async (req, res) => {
  try {
    const {
      planId,
      price,
      currency,
      interval,
      userEmail,
      userId,
      planName,
      successUrl,
      cancelUrl,
      trialPeriodDays
    } = req.body;

    // Validate required fields
    if (!planId || !price || !userEmail || !userId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('[checkout] Request for userId:', userId, 'userEmail:', userEmail);

    // CRITICAL: Check if user is a company (only companies can subscribe)
    // Use service_role key to bypass RLS - this should work for authenticated queries
    let userProfile, profileError;

    // Try direct query first (service_role key bypasses RLS)
    const { data: directProfile, error: directError } = await supabase
      .from('profiles')
      .select('user_type, stripe_customer_id, email')
      .eq('id', userId)
      .maybeSingle();

    // If direct query works, use it
    if (!directError && directProfile) {
      userProfile = directProfile;
      profileError = null;
    } else {
      // If direct query fails, try with RPC to bypass RLS
      console.error('[checkout] Profile query error (direct):', directError);

      const { data: rpcProfile, error: rpcError } = await supabase.rpc('get_user_profile', {
        p_user_id: userId
      });

      if (rpcError) {
        console.error('[checkout] Profile query error (RPC):', rpcError);
        return res.status(500).json({
          error: 'Database error: Impossibile recuperare il profilo utente.',
          details: directError?.message || rpcError?.message,
          hint: 'Assicurati che la migration 025_create_get_user_profile_rpc.sql sia stata applicata.'
        });
      }

      // RPC returns an array, get first element
      userProfile = Array.isArray(rpcProfile) ? rpcProfile[0] : rpcProfile;
    }

    if (!userProfile) {
      console.error('[checkout] Profile not found for userId:', userId);
      // Try to get all profiles to see what's happening
      const { data: allProfiles } = await supabase
        .from('profiles')
        .select('id, email, user_type')
        .limit(5);

      console.log('[checkout] Sample profiles:', allProfiles);

      return res.status(404).json({
        error: 'Profilo utente non trovato. Assicurati di aver completato la registrazione come azienda.',
        code: 'PROFILE_NOT_FOUND',
        userId: userId,
        hint: 'Your user ID might not match any profile in the database'
      });
    }

    if (userProfile.user_type !== 'company') {
      return res.status(403).json({
        error: 'Solo le aziende possono sottoscrivere abbonamenti.',
        code: 'COMPANY_ONLY'
      });
    }

    // Stripe must be configured
    if (!stripe) {
      return res.status(500).json({
        error: 'Stripe non è configurato. Contatta l\'amministratore.',
        code: 'STRIPE_NOT_CONFIGURED'
      });
    }

    let customerId = userProfile.stripe_customer_id;

    if (!customerId) {
      // Create new Stripe customer
      const customer = await stripe.customers.create({
        email: userEmail,
        metadata: {
          userId: userId,
          planId: planId
        }
      });
      customerId = customer.id;

      // Update profile with customer ID
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }

    // Convert price to cents (Stripe uses smallest currency unit)
    const priceInCents = Math.round(price * 100);

    // Create checkout session with price_data inline
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8022';
    const sessionConfig = {
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            unit_amount: priceInCents,
            recurring: {
              interval: interval || 'month',
            },
            product_data: {
              name: `Job TV ${planId.toUpperCase()} Plan`,
              description: `Abbonamento ${planName || planId.toUpperCase()}`,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl || `${frontendUrl}/profile?tab=subscription&success=true`,
      cancel_url: cancelUrl || `${frontendUrl}/pricing`,
      metadata: {
        userId: userId,
        planId: planId,
        planName: planName,
        user_id: userId,
        plan_type: planId
      }
    };

    // Add trial period if specified
    if (trialPeriodDays && trialPeriodDays > 0) {
      sessionConfig.subscription_data = {
        trial_period_days: trialPeriodDays,
        metadata: {
          userId: userId,
          planId: planId,
          user_id: userId,
          plan_type: planId
        }
      };
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    // Return sessionId and url for redirect
    return res.json({
      sessionId: session.id,
      url: session.url
    });

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
});

export default router;
