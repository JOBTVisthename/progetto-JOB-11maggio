import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

// Mock Stripe service for development
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { planId, price, currency, userEmail, userId, planName } = body;

    // Validate required fields
    if (!planId || !price || !userEmail || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400 }
      );
    }

    // Create mock customer ID
    let customerId = `cus_mock_${userId}_${Date.now()}`;

    // Update profile with customer ID
    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', userId);

    // Create mock subscription
    const subscriptionData = {
      user_id: userId,
      stripe_subscription_id: `sub_mock_${Date.now()}`,
      stripe_customer_id: customerId,
      stripe_price_id: `price_${planId}`,
      plan_type: planId,
      status: 'active' as const,
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      trial_start: null,
      trial_end: null,
      cancel_at_period_end: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .insert(subscriptionData)
      .select()
      .single();

    if (error) {
      console.error('Error creating subscription:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to create subscription' }),
        { status: 500 }
      );
    }

    // Create mock checkout session
    const mockSessionId = `cs_mock_${Date.now()}`;

    return new Response(JSON.stringify({ 
      sessionId: mockSessionId,
      subscription: subscription,
      isMock: true,
      message: 'Mock payment processed successfully'
    }));

  } catch (error) {
    console.error('Error in mock checkout session:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
}
