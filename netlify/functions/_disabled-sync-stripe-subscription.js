const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK (reuse if already initialized)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

const db = admin.firestore();

// Storage limits in bytes (must match stripe-webhook.js)
const STORAGE_LIMITS = {
  GRATIS: 524288000,        // 500 MB
  LITE: 5368709120,         // 5 GB
  PRO: 53687091200,         // 50 GB
};

/**
 * Map Stripe Price ID to subscription tier
 * Must match stripe-webhook.js
 */
function getTierFromPriceId(priceId) {
  const LITE_PRICE_ID = process.env.STRIPE_LITE_PRICE_ID;
  const PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID;

  if (priceId === LITE_PRICE_ID) {
    return 'LITE';
  } else if (priceId === PRO_PRICE_ID) {
    return 'PRO';
  }

  console.warn(`Unknown price ID: ${priceId}, defaulting to GRATIS`);
  return 'GRATIS';
}

/**
 * Sync Stripe subscription to Firestore
 *
 * USAGE:
 * POST /.netlify/functions/sync-stripe-subscription
 * Body: { "userId": "firebase-uid-here" }
 *
 * This function is idempotent - safe to run multiple times.
 */
exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed. Use POST.' })
    };
  }

  let userId;
  try {
    const body = JSON.parse(event.body);
    userId = body.userId;
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON body' })
    };
  }

  if (!userId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing userId in request body' })
    };
  }

  console.log('═══════════════════════════════════════════════');
  console.log('🔄 STRIPE SUBSCRIPTION SYNC STARTED');
  console.log('═══════════════════════════════════════════════');
  console.log('User ID:', userId);
  console.log('Timestamp:', new Date().toISOString());

  try {
    // ============================================================
    // STEP 1: Get user from Firestore
    // ============================================================
    console.log('📖 STEP 1: Fetching user from Firestore...');
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      console.error('❌ User not found in Firestore:', userId);
      return {
        statusCode: 404,
        body: JSON.stringify({ error: 'User not found in Firestore' })
      };
    }

    const userData = userDoc.data();
    const userEmail = userData.email;
    const existingStripeCustomerId = userData.stripeCustomerId;

    console.log('✅ User found:', userEmail);
    console.log('   Existing stripeCustomerId:', existingStripeCustomerId || 'none');

    // ============================================================
    // STEP 2: Find Stripe customer
    // ============================================================
    console.log('🔍 STEP 2: Finding Stripe customer...');
    let stripeCustomer = null;

    // Try by existing stripeCustomerId first
    if (existingStripeCustomerId) {
      try {
        stripeCustomer = await stripe.customers.retrieve(existingStripeCustomerId);
        console.log('✅ Found customer by ID:', stripeCustomer.id);
      } catch (error) {
        console.warn('⚠️ Customer ID not found in Stripe, searching by email...', error.message);
      }
    }

    // Fallback: Search by email
    if (!stripeCustomer && userEmail) {
      const customers = await stripe.customers.list({
        email: userEmail,
        limit: 1,
      });

      if (customers.data.length > 0) {
        stripeCustomer = customers.data[0];
        console.log('✅ Found customer by email:', stripeCustomer.id);
      }
    }

    if (!stripeCustomer) {
      console.log('❌ No Stripe customer found for user');
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: 'No Stripe customer found',
          message: 'User has no Stripe customer record. No subscription to sync.'
        })
      };
    }

    // ============================================================
    // STEP 3: Get active subscriptions
    // ============================================================
    console.log('📋 STEP 3: Fetching subscriptions...');
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomer.id,
      status: 'active',
      limit: 10,
    });

    console.log(`   Found ${subscriptions.data.length} active subscription(s)`);

    if (subscriptions.data.length === 0) {
      // No active subscription - set to GRATIS
      console.log('ℹ️ No active subscriptions, setting to GRATIS');

      await userRef.update({
        subscriptionTier: 'GRATIS',
        subscriptionStatus: 'inactive',
        storageLimit: STORAGE_LIMITS.GRATIS,
        stripeCustomerId: stripeCustomer.id,
        updatedAt: new Date().toISOString(),
      });

      console.log('✅ User set to GRATIS tier');
      console.log('═══════════════════════════════════════════════');

      return {
        statusCode: 200,
        body: JSON.stringify({
          success: true,
          message: 'No active subscription found. User set to GRATIS.',
          data: {
            userId,
            tier: 'GRATIS',
            status: 'inactive',
            stripeCustomerId: stripeCustomer.id,
          }
        })
      };
    }

    // Get the first active subscription (most recent)
    const subscription = subscriptions.data[0];
    const priceId = subscription.items.data[0].price.id;
    const status = subscription.status;

    console.log('   Subscription ID:', subscription.id);
    console.log('   Price ID:', priceId);
    console.log('   Status:', status);

    // ============================================================
    // STEP 4: Determine tier from price ID
    // ============================================================
    console.log('🎯 STEP 4: Mapping price ID to tier...');
    const tier = getTierFromPriceId(priceId);
    const storageLimit = STORAGE_LIMITS[tier];

    console.log(`   Tier: ${tier}`);
    console.log(`   Storage Limit: ${storageLimit} bytes (${(storageLimit / 1024 / 1024 / 1024).toFixed(1)} GB)`);

    // ============================================================
    // STEP 5: Update Firestore
    // ============================================================
    console.log('💾 STEP 5: Updating Firestore...');

    const updateData = {
      subscriptionTier: tier,
      subscriptionStatus: status,
      storageLimit: storageLimit,
      stripeCustomerId: stripeCustomer.id,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      updatedAt: new Date().toISOString(),
    };

    await userRef.update(updateData);

    console.log('✅ Firestore updated successfully');
    console.log('═══════════════════════════════════════════════');
    console.log('🎉 SUBSCRIPTION SYNC COMPLETE');
    console.log('═══════════════════════════════════════════════');

    // ============================================================
    // SUCCESS RESPONSE
    // ============================================================
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        message: 'Subscription synced successfully from Stripe to Firestore',
        data: {
          userId,
          tier,
          status,
          stripeCustomerId: stripeCustomer.id,
          stripeSubscriptionId: subscription.id,
          stripePriceId: priceId,
          storageLimit,
        }
      })
    };

  } catch (error) {
    console.error('═══════════════════════════════════════════════');
    console.error('💥 SUBSCRIPTION SYNC FAILED');
    console.error('═══════════════════════════════════════════════');
    console.error('Error:', error);
    console.error('Stack:', error.stack);

    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        error: 'Failed to sync subscription',
        message: error.message,
        userId,
      })
    };
  }
};
