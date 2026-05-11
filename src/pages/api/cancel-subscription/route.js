// ============================================================================
// Stripe Cancel Subscription API
// Purpose: Cancel a subscription at period end
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
    const { subscriptionId } = req.body;

    // Validate required fields
    if (!subscriptionId) {
      return res.status(400).json({ error: 'Missing subscription ID' });
    }

    console.log('[cancel-subscription] Request for subscriptionId:', subscriptionId);

    // Stripe must be configured
    if (!stripe) {
      return res.status(500).json({
        error: 'Stripe non è configurato. Contatta l\'amministratore.',
        code: 'STRIPE_NOT_CONFIGURED'
      });
    }

    // First, get the subscription from our database to verify it exists
    const { data: localSub, error: localError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', subscriptionId)
      .single();

    if (localError || !localSub) {
      return res.status(404).json({
        error: 'Subscription not found in database',
        code: 'SUBSCRIPTION_NOT_FOUND'
      });
    }

    // Cancel the subscription on Stripe (at period end)
    try {
      await stripe.subscriptions.update(subscriptionId, {
        cancel_at_period_end: true,
      });
    } catch (stripeError) {
      console.error('[cancel-subscription] Stripe error:', stripeError);
      // If the subscription is already cancelled on Stripe, continue with local update
      if (stripeError.code !== 'resource_missing') {
        throw stripeError;
      }
    }

    // Update local database record
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', subscriptionId);

    if (updateError) {
      console.error('[cancel-subscription] Database update error:', updateError);
      throw updateError;
    }

    console.log('[cancel-subscription] Successfully cancelled subscription:', subscriptionId);

    return res.json({
      success: true,
      message: 'Subscription will be cancelled at period end'
    });

  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return res.status(500).json({
      error: error.message || 'Internal server error'
    });
  }
});

export default router;
