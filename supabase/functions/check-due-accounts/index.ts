import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!;
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!;
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PushSubscription {
  user_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

interface FixedAccount {
  id: string;
  name: string;
  amount: number;
  due_day: number;
  user_id: string;
}

async function sendPushNotification(
  subscription: PushSubscription,
  title: string,
  body: string
) {
  try {
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    };

    // Create the notification payload
    const payload = JSON.stringify({
      title,
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
    });

    // Generate VAPID headers
    const vapidHeaders = await generateVAPIDHeaders(
      subscription.endpoint,
      VAPID_SUBJECT,
      VAPID_PUBLIC_KEY,
      VAPID_PRIVATE_KEY
    );

    // Send the push notification
    const encryptedPayload = await encryptPayload(payload, subscription.p256dh, subscription.auth);
    const response = await fetch(subscription.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Encoding': 'aes128gcm',
        ...vapidHeaders,
      },
      body: encryptedPayload as BodyInit,
    });

    if (!response.ok) {
      console.error('Failed to send push notification:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return false;
  }
}

async function generateVAPIDHeaders(
  endpoint: string,
  subject: string,
  publicKey: string,
  privateKey: string
): Promise<Record<string, string>> {
  const url = new URL(endpoint);
  const audience = `${url.protocol}//${url.host}`;
  
  const jwtPayload = {
    aud: audience,
    exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60, // 12 hours
    sub: subject,
  };

  // For simplicity, using a basic implementation
  // In production, you'd want to use a proper JWT library
  return {
    'Authorization': `vapid t=${await createJWT(jwtPayload, privateKey)}, k=${publicKey}`,
  };
}

async function createJWT(payload: any, privateKey: string): Promise<string> {
  // This is a simplified JWT creation
  // In production, use a proper library like jose
  const header = { typ: 'JWT', alg: 'ES256' };
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  return `${encodedHeader}.${encodedPayload}.signature`;
}

async function encryptPayload(
  payload: string,
  p256dh: string,
  auth: string
): Promise<Uint8Array> {
  // This is a placeholder for the actual encryption
  // In production, you'd need to implement the full Web Push encryption spec
  const encoder = new TextEncoder();
  return encoder.encode(payload);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting check for due accounts...');

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Get all active fixed accounts
    const { data: accounts, error: accountsError } = await supabase
      .from('fixed_accounts')
      .select('*')
      .eq('is_active', true);

    if (accountsError) {
      throw accountsError;
    }

    console.log(`Found ${accounts?.length || 0} active accounts`);

    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const accountsToNotify: { account: FixedAccount; daysUntilDue: number }[] = [];

    // Check which accounts are due in the next 2 days or today
    for (const account of accounts || []) {
      const dueDay = account.due_day;
      
      // Calculate the due date for this month
      const dueDate = new Date(currentYear, currentMonth, dueDay);
      
      // If the due date has passed this month, check next month
      if (dueDate < today) {
        dueDate.setMonth(dueDate.getMonth() + 1);
      }

      // Calculate days until due
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      console.log(`Account ${account.name} - Due day: ${dueDay}, Days until due: ${diffDays}`);

      // Notify if due today, tomorrow, or in 2 days
      if (diffDays >= 0 && diffDays <= 2) {
        accountsToNotify.push({ account, daysUntilDue: diffDays });
      }
    }

    console.log(`${accountsToNotify.length} accounts need notification`);

    // Group accounts by user
    const accountsByUser = accountsToNotify.reduce((acc, item) => {
      if (!acc[item.account.user_id]) {
        acc[item.account.user_id] = [];
      }
      acc[item.account.user_id].push(item);
      return acc;
    }, {} as Record<string, typeof accountsToNotify>);

    let notificationsSent = 0;

    // Send notifications for each user
    for (const [userId, userAccounts] of Object.entries(accountsByUser)) {
      // Get user's push subscriptions
      const { data: subscriptions, error: subsError } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', userId);

      if (subsError) {
        console.error('Error fetching subscriptions:', subsError);
        continue;
      }

      if (!subscriptions || subscriptions.length === 0) {
        console.log(`No subscriptions found for user ${userId}`);
        continue;
      }

      // Send notification for each account
      for (const { account, daysUntilDue } of userAccounts) {
        let message: string;
        let title = 'Lembrete de Conta';
        if (daysUntilDue === 0) {
          message = `Sua conta ${account.name} vence hoje!`;
        } else if (daysUntilDue === 1) {
          message = `Sua conta ${account.name} vence amanhã`;
        } else {
          message = `Sua conta ${account.name} vence em ${daysUntilDue} dias`;
        }

        // Save notification to history
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert({
            user_id: userId,
            title: title,
            message: message,
            is_read: false,
          });

        if (notificationError) {
          console.error('Error saving notification:', notificationError);
        }

        // Send to all user's subscriptions
        for (const subscription of subscriptions) {
          const sent = await sendPushNotification(
            subscription,
            title,
            message
          );
          if (sent) {
            notificationsSent++;
          }
        }
      }
    }

    console.log(`Sent ${notificationsSent} notifications`);

    return new Response(
      JSON.stringify({
        success: true,
        accountsChecked: accounts?.length || 0,
        accountsToNotify: accountsToNotify.length,
        notificationsSent,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in check-due-accounts:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
