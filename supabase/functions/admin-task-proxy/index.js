import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, content-type',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, payload } = await req.json();

    let result;
    let error = null;

    switch (action) {
      case 'get_users':
        result = await getUsers();
        break;

      case 'delete_user':
        result = await deleteUser(payload.userId);
        break;

      case 'update_role':
        result = await updateRole(payload.userId, payload.role);
        break;

      case 'update_subscription':
        result = await updateSubscription(payload.userId, payload.planType, payload.action);
        break;

      default:
        error = 'Unknown action';
    }

    return new Response(
      JSON.stringify({
        success: !error,
        error,
        data: result
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: err.message || 'Internal server error',
        data: null
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});

async function getUsers() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  const allProfiles = [];
  let offset = 0;
  const limit = 1000;
  let hasMore = true;

  // Fetch all users with pagination
  while (hasMore) {
    const profilesResponse = await fetch(
      `${supabaseUrl}/rest/v1/profiles?select=id,email,full_name,user_type,role,created_at,stripe_customer_id,candidate_profiles(id,first_name,last_name,profile_image_url,desired_job_title),company_profiles(id,company_name,profile_image_url),subscriptions(id,plan_type,status,created_at,stripe_customer_id,stripe_subscription_id,stripe_price_id,current_period_start,current_period_end,trial_end,cancel_at_period_end)&order=created_at.desc&limit=${limit}&offset=${offset}`,
      {
        headers: {
          'apikey': supabaseServiceKey,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!profilesResponse.ok) {
      throw new Error(`Failed to fetch profiles: ${profilesResponse.statusText}`);
    }

    const profiles = await profilesResponse.json();

    if (profiles.length === 0) {
      hasMore = false;
    } else {
      allProfiles.push(...profiles);
      offset += limit;

      // If we got less than the limit, we've reached the end
      if (profiles.length < limit) {
        hasMore = false;
      }
    }
  }

  // Group subscriptions by user
  const usersWithSubscriptions = allProfiles.map((profile) => {
    const userSubscriptions = profile.subscriptions || [];

    return {
      ...profile,
      subscriptions: userSubscriptions.length > 0 ? userSubscriptions : null
    };
  });

  return { users: usersWithSubscriptions, total: usersWithSubscriptions.length };
}

async function deleteUser(userId) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  // Delete user's subscriptions
  const subResponse = await fetch(
    `${supabaseUrl}/rest/v1/subscriptions?user_id=eq.${userId}`,
    {
      method: 'DELETE',
      headers: {
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!subResponse.ok) {
    throw new Error(`Failed to delete subscription: ${subResponse.statusText}`);
  }

  // Delete candidate profile if exists
  const candidateResponse = await fetch(
    `${supabaseUrl}/rest/v1/candidate_profiles?id=eq.${userId}`,
    {
      method: 'DELETE',
      headers: {
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!candidateResponse.ok) {
    throw new Error(`Failed to delete candidate profile: ${candidateResponse.statusText}`);
  }

  // Delete company profile if exists
  const companyResponse = await fetch(
    `${supabaseUrl}/rest/v1/company_profiles?id=eq.${userId}`,
    {
      method: 'DELETE',
      headers: {
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!companyResponse.ok) {
    throw new Error(`Failed to delete company profile: ${companyResponse.statusText}`);
  }

  // Delete user profile
  const profileResponse = await fetch(
    `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`,
    {
      method: 'DELETE',
      headers: {
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!profileResponse.ok) {
    throw new Error(`Failed to delete profile: ${profileResponse.statusText}`);
  }

  return { success: true, message: 'User deleted successfully' };
}

async function updateRole(userId, newRole) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  const response = await fetch(
    `${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`,
    {
      method: 'PATCH',
      headers: {
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role: newRole }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to update role: ${response.statusText}`);
  }

  return { success: true, message: 'Role updated successfully', role: newRole };
}

async function updateSubscription(userId, planType, action = 'upgrade') {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  // Handle different actions
  if (action === 'cancel') {
    return await cancelSubscription(userId);
  }

  if (action === 'reactivate') {
    return await reactivateSubscription(userId);
  }

  // For upgrade/downgrade, update the plan type
  const checkResponse = await fetch(
    `${supabaseUrl}/rest/v1/subscriptions?user_id=eq.${userId}&select=*`,
    {
      headers: {
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json',
      },
    }
  );

  if (!checkResponse.ok) {
    throw new Error(`Failed to check subscription: ${checkResponse.statusText}`);
  }

  const existingSubs = await checkResponse.json();
  const existingSub = Array.isArray(existingSubs) && existingSubs.length > 0 ? existingSubs[0] : null;

  const now = new Date();
  const currentPeriodStart = now.toISOString();
  const currentPeriodEnd = new Date(now.setMonth(now.getMonth() + 1)).toISOString();

  if (existingSub) {
    // Update existing subscription
    const updateResponse = await fetch(
      `${supabaseUrl}/rest/v1/subscriptions?id=eq.${existingSub.id}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': supabaseServiceKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan_type: planType,
          status: 'active',
          current_period_start: currentPeriodStart,
          current_period_end: currentPeriodEnd,
          cancel_at_period_end: false,
          updated_at: now.toISOString()
        }),
      }
    );

    if (!updateResponse.ok) {
      throw new Error(`Failed to update subscription: ${updateResponse.statusText}`);
    }

    return { success: true, message: 'Subscription updated successfully', planType };
  } else {
    // Create new subscription
    const insertResponse = await fetch(
      `${supabaseUrl}/rest/v1/subscriptions`,
      {
        method: 'POST',
        headers: {
          'apikey': supabaseServiceKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          plan_type: planType,
          status: 'active',
          current_period_start: currentPeriodStart,
          current_period_end: currentPeriodEnd,
          cancel_at_period_end: false,
          stripe_customer_id: 'admin-manual',
          stripe_subscription_id: `admin-${planType}-${Date.now()}`,
          stripe_price_id: `price-${planType}`,
          created_at: now.toISOString(),
          updated_at: now.toISOString()
        }),
      }
    );

    if (!insertResponse.ok) {
      throw new Error(`Failed to create subscription: ${insertResponse.statusText}`);
    }

    const newSub = await insertResponse.json();
    return { success: true, message: 'Subscription created successfully', planType, newSub };
  }
}

async function cancelSubscription(userId) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  const response = await fetch(
    `${supabaseUrl}/rest/v1/subscriptions?user_id=eq.${userId}`,
    {
      method: 'PATCH',
      headers: {
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'canceled',
        cancel_at_period_end: true,
        updated_at: new Date().toISOString()
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to cancel subscription: ${response.statusText}`);
  }

  return { success: true, message: 'Subscription canceled successfully' };
}

async function reactivateSubscription(userId) {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  const now = new Date();
  const currentPeriodStart = now.toISOString();
  const currentPeriodEnd = new Date(now.setMonth(now.getMonth() + 1)).toISOString();

  const response = await fetch(
    `${supabaseUrl}/rest/v1/subscriptions?user_id=eq.${userId}`,
    {
      method: 'PATCH',
      headers: {
        'apikey': supabaseServiceKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: 'active',
        cancel_at_period_end: false,
        current_period_start: currentPeriodStart,
        current_period_end: currentPeriodEnd,
        updated_at: now.toISOString()
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to reactivate subscription: ${response.statusText}`);
  }

  return { success: true, message: 'Subscription reactivated successfully' };
}
