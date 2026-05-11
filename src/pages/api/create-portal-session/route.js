// ============================================================================
// Stripe Customer Portal Session API
// Purpose: Generate Stripe Customer Portal link for subscription management
// ============================================================================

import express from 'express';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const router = express.Router();

// Initialize Stripe with secret key from environment
const stripeSecretKey = process.env.VITE_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
  apiVersion: '2024-12-18.acacia',
}) : null;

// Initialize Supabase admin client
const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY
);

router.post('/', async (req, res) => {
  try {
    const { userId, returnUrl } = req.body;

    // Validate required fields
    if (!userId) {
      return res.status(400).json({ error: 'Missing userId' });
    }

    // Stripe must be configured
    if (!stripe) {
      return res.status(500).json({
        error: 'Stripe non è configurato. Contatta l\'amministratore.',
        code: 'STRIPE_NOT_CONFIGURED'
      });
    }

    // Get user's Stripe customer ID
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    if (!profile.stripe_customer_id) {
      return res.status(400).json({
        error: 'Nessun cliente Stripe trovato. Iscriviti a un piano prima.'
      });
    }

    // Create Stripe Customer Portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: returnUrl || `${process.env.FRONTEND_URL || 'http://localhost:8022'}/profile?tab=subscription`,
    });

    return res.json({
      url: portalSession.url
    });

  } catch (error) {
    console.error('Error creating portal session:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
});

export default router;
