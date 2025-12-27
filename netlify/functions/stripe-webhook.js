const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const admin = require("firebase-admin");

// Firebase Admin initialization (ready but not used yet)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

exports.handler = async (event) => {
  console.log("=== STRIPE WEBHOOK RECEIVED ===");

  // Only allow POST
  if (event.httpMethod !== "POST") {
    console.log("Method not allowed:", event.httpMethod);
    return {
      statusCode: 405,
      body: JSON.stringify({ ok: false, error: "Method not allowed" }),
    };
  }

  // Safe debug logging
  console.log("DEBUG:", {
    hasWebhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
    hasSignatureHeader: !!event.headers["stripe-signature"],
    isBase64Encoded: event.isBase64Encoded,
    bodyLength: event.body?.length || 0,
  });

  // Get webhook secret
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not configured");
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: "Webhook secret not configured" }),
    };
  }

  // Get signature header
  const signature = event.headers["stripe-signature"];
  if (!signature) {
    console.error("Missing stripe-signature header");
    return {
      statusCode: 400,
      body: JSON.stringify({ ok: false, error: "Missing signature header" }),
    };
  }

  // Get RAW body for Netlify (handle base64 encoding)
  let rawBody;
  if (event.isBase64Encoded) {
    rawBody = Buffer.from(event.body, "base64");
  } else {
    rawBody = event.body;
  }

  console.log("Raw body length:", Buffer.byteLength(rawBody));

  // Verify webhook signature
  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      webhookSecret
    );
    console.log("✅ Signature verified, event type:", stripeEvent.type);
  } catch (err) {
    console.error("❌ Signature verification failed:", err.message);
    return {
      statusCode: 400,
      body: JSON.stringify({
        ok: false,
        error: `Webhook signature verification failed: ${err.message}`
      }),
    };
  }

  // Log event type safely (no payload details)
  console.log("Processing event:", stripeEvent.type);

  // PHASE-GATED: No Firestore updates yet
  // In next phase, we'll add handlers for:
  // - checkout.session.completed
  // - customer.subscription.updated
  // - customer.subscription.deleted

  console.log("✅ Webhook verified successfully (no Firestore update yet)");

  return {
    statusCode: 200,
    body: JSON.stringify({
      ok: true,
      received: true,
      type: stripeEvent.type,
    }),
  };
};
