// ============================================================================
// Stripe Webhook Handler - Supabase Edge Function
// Purpose: Handle all Stripe webhook events
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

// Stripe SDK - Using Deno compatible version
import Stripe from 'https://esm.sh/stripe@14.21.0';

// ============================================================================
// CORS Configuration
// ============================================================================
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ============================================================================
// Event Type Handlers
// ============================================================================

interface WebhookEvent {
  id: string;
  type: string;
  data: any;
}

interface EventProcessingResult {
  success: boolean;
  error?: string;
  data?: any;
}

// Handle checkout.session.completed
async function handleCheckoutCompleted(
  event: Stripe.CheckoutSessionEvent,
  supabase: any
): Promise<EventProcessingResult> {
  const session = event.data.object as Stripe.Checkout.Session;
  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;
  const userId = session.metadata?.user_id;
  const planType = session.metadata?.plan_type;

  console.log(`[checkout.session.completed] User: ${userId}, Plan: ${planType}`);

  try {
    // Update user profile with Stripe customer ID
    if (userId) {
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', userId);
    }

    // If subscription was created, it will be handled by subscription.created event
    return { success: true, data: { session } };
  } catch (error) {
    console.error('Error handling checkout.completed:', error);
    return { success: false, error: (error as Error).message };
  }
}

// Handle customer.subscription.created
async function handleSubscriptionCreated(
  event: Stripe.CustomerSubscriptionEvent,
  supabase: any
): Promise<EventProcessingResult> {
  const subscription = event.data.object as Stripe.Subscription;
  const stripeSubscriptionId = subscription.id;
  const stripeCustomerId = subscription.customer as string;

  console.log(`[customer.subscription.created] Subscription: ${stripeSubscriptionId}`);

  try {
    // Get user ID from customer ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', stripeCustomerId)
      .single();

    if (!profile) {
      throw new Error('User profile not found for customer');
    }

    // Get plan type from price metadata
    const priceId = subscription.items.data[0].price.id;
    const planType = subscription.metadata?.plan_type ||
      priceId.includes('hero') ? 'hero' :
      priceId.includes('builder') ? 'builder' : 'starter';

    // Create or update subscription record
    const { error } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: profile.id,
        stripe_subscription_id: stripeSubscriptionId,
        stripe_customer_id: stripeCustomerId,
        stripe_price_id: priceId,
        plan_type: planType,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
        trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'stripe_subscription_id'
      });

    if (error) throw error;

    // Initialize usage tracking for new subscription
    if (subscription.status === 'active' || subscription.status === 'trialing') {
      const { data: subRecord } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('stripe_subscription_id', stripeSubscriptionId)
        .single();

      if (subRecord) {
        // Use dates from Stripe subscription object, not database record
        await supabase.rpc('initialize_subscription_usage', {
          p_subscription_id: subRecord.id,
          p_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
          p_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          p_plan_type: planType
        });
      }
    }

    return { success: true, data: { subscription, userId: profile.id } };
  } catch (error) {
    console.error('Error handling subscription.created:', error);
    return { success: false, error: (error as Error).message };
  }
}

// Handle customer.subscription.updated
async function handleSubscriptionUpdated(
  event: Stripe.CustomerSubscriptionEvent,
  supabase: any
): Promise<EventProcessingResult> {
  const subscription = event.data.object as Stripe.Subscription;
  const stripeSubscriptionId = subscription.id;

  console.log(`[customer.subscription.updated] Subscription: ${stripeSubscriptionId}`);

  try {
    // Get plan type from subscription metadata or price
    const priceId = subscription.items.data[0].price.id;
    const planType = subscription.metadata?.plan_type ||
      priceId.includes('hero') ? 'hero' :
      priceId.includes('builder') ? 'builder' : 'starter';

    // Update subscription record
    const { data: existingSub } = await supabase
      .from('subscriptions')
      .select('id, user_id')
      .eq('stripe_subscription_id', stripeSubscriptionId)
      .single();

    if (!existingSub) {
      // If subscription doesn't exist in DB, create it
      return handleSubscriptionCreated(event, supabase);
    }

    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: subscription.status,
        plan_type: planType,
        stripe_price_id: priceId,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
        trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
        cancel_at_period_end: subscription.cancel_at_period_end,
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', stripeSubscriptionId);

    if (error) throw error;

    // Get current subscription info from database
    const { data: updatedSub } = await supabase
      .from('subscriptions')
      .select('id, plan_type')
      .eq('stripe_subscription_id', stripeSubscriptionId)
      .single();

    if (!updatedSub) {
      console.warn('[subscription.updated] Subscription not found in database');
      return { success: false, error: 'Subscription not found' };
    }

    // Check if period changed (renewal) - check BOTH period_start AND period_end
    const currentPeriodStart = new Date(subscription.current_period_start * 1000).toISOString();
    const currentPeriodEnd = new Date(subscription.current_period_end * 1000).toISOString();

    const { data: existingUsage } = await supabase
      .from('subscription_usage')
      .select('id, period_start, period_end')
      .eq('subscription_id', updatedSub.id)
      .eq('period_start', currentPeriodStart)
      .eq('period_end', currentPeriodEnd)
      .maybeSingle();

    // Initialize new usage period if:
    // 1. No usage record exists for current period (renewal), OR
    // 2. Plan changed and we need to update limits
    const shouldInitialize = !existingUsage && (subscription.status === 'active' || subscription.status === 'trialing');

    if (shouldInitialize) {
      console.log(`[subscription.updated] Initializing new usage period for subscription ${updatedSub.id}`);
      await supabase.rpc('initialize_subscription_usage', {
        p_subscription_id: updatedSub.id,
        p_period_start: currentPeriodStart,
        p_period_end: currentPeriodEnd,
        p_plan_type: updatedSub.plan_type
      });
    }

    return { success: true, data: { subscription, userId: existingSub.user_id } };
  } catch (error) {
    console.error('Error handling subscription.updated:', error);
    return { success: false, error: (error as Error).message };
  }
}

// Handle customer.subscription.deleted
async function handleSubscriptionDeleted(
  event: Stripe.CustomerSubscriptionEvent,
  supabase: any
): Promise<EventProcessingResult> {
  const subscription = event.data.object as Stripe.Subscription;
  const stripeSubscriptionId = subscription.id;

  console.log(`[customer.subscription.deleted] Subscription: ${stripeSubscriptionId}`);

  try {
    // Update subscription status to canceled
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString(),
      })
      .eq('stripe_subscription_id', stripeSubscriptionId);

    if (error) throw error;

    return { success: true, data: { subscription } };
  } catch (error) {
    console.error('Error handling subscription.deleted:', error);
    return { success: false, error: (error as Error).message };
  }
}

// Handle invoice.paid
async function handleInvoicePaid(
  event: Stripe.InvoiceEvent,
  supabase: any
): Promise<EventProcessingResult> {
  const invoice = event.data.object as Stripe.Invoice;
  const subscriptionId = invoice.subscription as string;
  const customerId = invoice.customer as string;

  console.log(`[invoice.paid] Subscription: ${subscriptionId}, Amount: ${invoice.amount_paid / 100} ${invoice.currency.toUpperCase()}`);

  try {
    // Get user ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single();

    if (!profile) {
      throw new Error('User profile not found for customer');
    }

    // Get subscription record
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('stripe_subscription_id', subscriptionId)
      .single();

    // Create payment record
    const paymentData: any = {
      user_id: profile.id,
      stripe_invoice_id: invoice.id,
      stripe_payment_intent_id: invoice.payment_intent as string,
      subscription_id: subscription?.id,
      amount: invoice.amount_paid / 100,
      currency: invoice.currency.toUpperCase(),
      status: 'succeeded',
      payment_type: invoice.subscription ? 'subscription' : 'one_time',
      period_start: invoice.period_start ? new Date(invoice.period_start * 1000).toISOString() : null,
      period_end: invoice.period_end ? new Date(invoice.period_end * 1000).toISOString() : null,
      description: invoice.description || `Payment for ${invoice.lines.data[0]?.description || 'subscription'}`,
      metadata: invoice.metadata || {},
    };

    const { error } = await supabase
      .from('payment_records')
      .insert(paymentData);

    if (error) throw error;

    return { success: true, data: { invoice, userId: profile.id } };
  } catch (error) {
    console.error('Error handling invoice.paid:', error);
    return { success: false, error: (error as Error).message };
  }
}

// Handle invoice.payment_failed
async function handleInvoicePaymentFailed(
  event: Stripe.InvoiceEvent,
  supabase: any
): Promise<EventProcessingResult> {
  const invoice = event.data.object as Stripe.Invoice;
  const subscriptionId = invoice.subscription as string;

  console.log(`[invoice.payment_failed] Subscription: ${subscriptionId}`);

  try {
    // Create failed payment record
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', invoice.customer as string)
      .single();

    if (!profile) {
      throw new Error('User profile not found');
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('stripe_subscription_id', subscriptionId)
      .single();

    const paymentData: any = {
      user_id: profile.id,
      stripe_invoice_id: invoice.id,
      stripe_payment_intent_id: invoice.payment_intent as string,
      subscription_id: subscription?.id,
      amount: invoice.amount_due / 100,
      currency: invoice.currency.toUpperCase(),
      status: 'failed',
      payment_type: invoice.subscription ? 'subscription' : 'one_time',
      description: `Failed payment: ${invoice.last_finalization_error?.message || 'Payment failed'}`,
      metadata: {
        error_code: invoice.last_finalization_error?.code,
        error_message: invoice.last_finalization_error?.message,
      },
    };

    await supabase
      .from('payment_records')
      .insert(paymentData);

    // Update subscription status if needed
    if (subscriptionId) {
      await supabase
        .from('subscriptions')
        .update({
          status: 'past_due',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_subscription_id', subscriptionId);
    }

    return { success: true, data: { invoice, userId: profile.id } };
  } catch (error) {
    console.error('Error handling invoice.payment_failed:', error);
    return { success: false, error: (error as Error).message };
  }
}

// ============================================================================
// Main Webhook Handler
// ============================================================================

async function processWebhookEvent(
  event: WebhookEvent,
  supabase: any
): Promise<EventProcessingResult> {
  // Log the event first
  await supabase
    .from('stripe_events')
    .insert({
      stripe_event_id: event.id,
      event_type: event.type,
      event_data: event.data,
      processed: false,
    });

  console.log(`Processing Stripe event: ${event.type}`);

  // Route to appropriate handler
  switch (event.type) {
    case 'checkout.session.completed':
      return await handleCheckoutCompleted(event as any, supabase);

    case 'customer.subscription.created':
      return await handleSubscriptionCreated(event as any, supabase);

    case 'customer.subscription.updated':
      return await handleSubscriptionUpdated(event as any, supabase);

    case 'customer.subscription.deleted':
      return await handleSubscriptionDeleted(event as any, supabase);

    case 'invoice.paid':
      return await handleInvoicePaid(event as any, supabase);

    case 'invoice.payment_failed':
      return await handleInvoicePaymentFailed(event as any, supabase);

    case 'invoice.payment_action_required':
      // Log but don't process - user needs to complete 3D Secure
      console.log('[invoice.payment_action_required] 3D Secure required');
      return { success: true, data: { action_required: true } };

    default:
      console.log(`Unhandled event type: ${event.type}`);
      return { success: true, data: { handled: false, reason: 'Event type not implemented' } };
  }
}

// ============================================================================
// HTTP Handler
// ============================================================================

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Only accept POST requests
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }

    // Get Stripe signature
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      return new Response('No stripe-signature header', { status: 400, headers: corsHeaders });
    }

    // Get webhook secret from environment
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    if (!webhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured');
      return new Response('Webhook secret not configured', { status: 500, headers: corsHeaders });
    }

    // Get Stripe API key
    const stripeApiKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeApiKey) {
      console.error('STRIPE_SECRET_KEY not configured');
      return new Response('Stripe not configured', { status: 500, headers: corsHeaders });
    }

    // Initialize Stripe
    const stripe = new Stripe(stripeApiKey, {
      apiVersion: '2024-12-18.acacia',
      httpClient: Stripe.createNodeHttpClient(),
    });

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get raw body
    const body = await req.text();

    // Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response('Invalid signature', { status: 400, headers: corsHeaders });
    }

    // Check for duplicate events
    const { data: existingEvent } = await supabase
      .from('stripe_events')
      .select('id, processed')
      .eq('stripe_event_id', event.id)
      .single();

    if (existingEvent) {
      if (existingEvent.processed) {
        console.log(`Event ${event.id} already processed, skipping`);
        return new Response(JSON.stringify({ received: true, duplicate: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Process the event
    const result = await processWebhookEvent(event as any, supabase);

    // Update event record with processing result
    await supabase
      .from('stripe_events')
      .update({
        processed: result.success,
        processed_at: new Date().toISOString(),
        processing_error: result.error,
      })
      .eq('stripe_event_id', event.id);

    // Return response
    if (result.success) {
      return new Response(JSON.stringify({ received: true, data: result.data }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    } else {
      console.error('Event processing failed:', result.error);
      return new Response(JSON.stringify({ error: result.error }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Webhook handler error:', error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
