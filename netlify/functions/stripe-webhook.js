const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase admin initialization error:', error);
  }
}

const db = admin.firestore();

// Storage limits in bytes
const STORAGE_LIMITS = {
  GRATIS: 524288000,        // 500 MB
  LITE: 5368709120,         // 5 GB
  PRO: 53687091200,         // 50 GB
};

/**
 * Map Stripe Price ID to subscription tier
 * These should match the price IDs in your Stripe dashboard
 */
function getTierFromPriceId(priceId) {
  const LITE_PRICE_ID = process.env.STRIPE_LITE_PRICE_ID;
  const PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID;

  if (priceId === LITE_PRICE_ID) {
    return 'LITE';
  } else if (priceId === PRO_PRICE_ID) {
    return 'PRO';
  }

  // Default to GRATIS if price ID doesn't match
  console.warn(`Unknown price ID: ${priceId}`);
  return 'GRATIS';
}

/**
 * Update user subscription in Firestore
 */
async function updateUserSubscription(uid, subscriptionData) {
  try {
    const userRef = db.collection('users').doc(uid);

    await userRef.update({
      ...subscriptionData,
      updatedAt: new Date().toISOString(),
    });

    console.log(`Successfully updated subscription for user: ${uid}`, subscriptionData);
  } catch (error) {
    console.error(`Error updating user ${uid}:`, error);
    throw error;
  }
}

/**
 * Handle checkout.session.completed event
 */
async function handleCheckoutSessionCompleted(session) {
  const uid = session.metadata?.uid;

  if (!uid) {
    console.error('No uid in session metadata');
    return;
  }

  // Get the subscription details
  const subscriptionId = session.subscription;
  const customerId = session.customer;

  // Retrieve the subscription to get the price ID
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0].price.id;

  // Determine tier from price ID
  const tier = getTierFromPriceId(priceId);
  const storageLimit = STORAGE_LIMITS[tier];

  // Update Firestore
  await updateUserSubscription(uid, {
    subscriptionTier: tier,
    storageLimit: storageLimit,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    stripePriceId: priceId,
    subscriptionStatus: 'active',
  });
}

/**
 * Handle customer.subscription.updated event
 */
async function handleSubscriptionUpdated(subscription) {
  const customerId = subscription.customer;

  // Find user by stripe customer ID
  const usersSnapshot = await db.collection('users')
    .where('stripeCustomerId', '==', customerId)
    .limit(1)
    .get();

  if (usersSnapshot.empty) {
    console.error(`No user found with stripeCustomerId: ${customerId}`);
    return;
  }

  const uid = usersSnapshot.docs[0].id;
  const priceId = subscription.items.data[0].price.id;
  const tier = getTierFromPriceId(priceId);
  const storageLimit = STORAGE_LIMITS[tier];
  const status = subscription.status;

  // Update subscription details
  await updateUserSubscription(uid, {
    subscriptionTier: status === 'active' ? tier : 'GRATIS',
    storageLimit: status === 'active' ? storageLimit : STORAGE_LIMITS.GRATIS,
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId,
    subscriptionStatus: status,
  });
}

/**
 * Handle customer.subscription.deleted event
 */
async function handleSubscriptionDeleted(subscription) {
  const customerId = subscription.customer;

  // Find user by stripe customer ID
  const usersSnapshot = await db.collection('users')
    .where('stripeCustomerId', '==', customerId)
    .limit(1)
    .get();

  if (usersSnapshot.empty) {
    console.error(`No user found with stripeCustomerId: ${customerId}`);
    return;
  }

  const uid = usersSnapshot.docs[0].id;

  // Downgrade to GRATIS
  await updateUserSubscription(uid, {
    subscriptionTier: 'GRATIS',
    storageLimit: STORAGE_LIMITS.GRATIS,
    subscriptionStatus: 'canceled',
  });
}

/**
 * Netlify Function: Stripe Webhook Handler
 *
 * Handles Stripe webhook events and updates Firestore accordingly.
 * This is the ONLY source of truth for subscription updates.
 */
exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const sig = event.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not configured');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Webhook secret not configured' })
    };
  }

  let stripeEvent;

  try {
    // Verify webhook signature
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      webhookSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `Webhook Error: ${err.message}` })
    };
  }

  // Handle the event
  try {
    switch (stripeEvent.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(stripeEvent.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(stripeEvent.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(stripeEvent.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    };

  } catch (error) {
    console.error('Error processing webhook:', error);

    // Return 200 to acknowledge receipt even on error
    // This prevents Stripe from retrying and flooding logs
    return {
      statusCode: 200,
      body: JSON.stringify({
        received: true,
        error: 'Processing failed but acknowledged'
      })
    };
  }
};
