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

/**
 * Netlify Function: Create Stripe Checkout Session (SECURE)
 *
 * Verifies Firebase ID token to authenticate user.
 * Receives only priceId from frontend - uid and email are extracted from verified token.
 * This prevents spoofing of userId/userEmail.
 */
exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    // Step 1: Extract and verify Firebase ID token
    const authHeader = event.headers.authorization || event.headers.Authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          error: 'Unauthorized',
          message: 'Missing or invalid Authorization header'
        })
      };
    }

    const idToken = authHeader.split('Bearer ')[1];

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
      console.error('Token verification failed:', error);
      return {
        statusCode: 401,
        body: JSON.stringify({
          error: 'Unauthorized',
          message: 'Invalid or expired token'
        })
      };
    }

    // Extract verified user data from token
    const uid = decodedToken.uid;
    const email = decodedToken.email;

    if (!uid) {
      return {
        statusCode: 401,
        body: JSON.stringify({
          error: 'Unauthorized',
          message: 'Token missing uid'
        })
      };
    }

    // Step 2: Parse request body (only priceId is trusted)
    const { priceId } = JSON.parse(event.body);

    // Validate required fields
    if (!priceId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing priceId' })
      };
    }

    // Step 3: Get the base URL for redirects
    const origin = event.headers.origin || process.env.URL || 'http://localhost:5173';

    // Step 4: Create Stripe Checkout Session using verified data
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // Attach VERIFIED user ID to session metadata (critical for webhook)
      metadata: {
        uid: uid,
      },
      // Include VERIFIED customer email
      customer_email: email || undefined,
      // Success and cancel URLs
      success_url: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/billing/cancel`,
      // Allow promotion codes
      allow_promotion_codes: true,
      // Billing address collection
      billing_address_collection: 'auto',
    });

    // Return the session URL for redirect
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
      body: JSON.stringify({
        url: session.url,
        sessionId: session.id,
      })
    };

  } catch (error) {
    console.error('Error creating checkout session:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: 'Failed to create checkout session',
        message: error.message
      })
    };
  }
};
