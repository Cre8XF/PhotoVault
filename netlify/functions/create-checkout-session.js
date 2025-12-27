const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Netlify Function: Create Stripe Checkout Session
 *
 * Receives a priceId from the frontend and creates a Stripe Checkout Session
 * for upgrading to Lite or Pro subscription tier.
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
    // Parse request body
    const { priceId, userId, userEmail } = JSON.parse(event.body);

    // Validate required fields
    if (!priceId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing priceId' })
      };
    }

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing userId' })
      };
    }

    // Get the base URL for redirects
    const origin = event.headers.origin || process.env.URL || 'http://localhost:5173';

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      // Attach user ID to session metadata (critical for webhook)
      metadata: {
        uid: userId,
      },
      // Also set client_reference_id as fallback for UID resolution
      client_reference_id: userId,
      // Include customer email if provided
      customer_email: userEmail || undefined,
      // Success and cancel URLs
      success_url: `${origin}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/billing/cancel`,
      // Allow promotion codes
      allow_promotion_codes: true,
      // Billing address collection
      billing_address_collection: 'auto',
      // Set subscription metadata to include uid for future subscription events
      subscription_data: {
        metadata: {
          uid: userId,
        },
      },
    });

    // Return the session URL for redirect
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
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
