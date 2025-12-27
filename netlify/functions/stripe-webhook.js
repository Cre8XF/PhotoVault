import Stripe from 'stripe'
import admin from 'firebase-admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
})

export async function handler(event) {
  console.log('=== STRIPE WEBHOOK RECEIVED ===')

  // 1. RAW BODY CHECK
  const sig = event.headers['stripe-signature']
  if (!sig) {
    console.error('Missing Stripe signature')
    return { statusCode: 400, body: 'Missing signature' }
  }

  // 2. FIREBASE ADMIN INIT (SAFE)
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    })
  }

  let stripeEvent
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
  } catch (err) {
    console.error('Webhook signature verification failed', err.message)
    return { statusCode: 400, body: 'Invalid signature' }
  }

  console.log('Stripe event verified:', stripeEvent.type)

  // 3. TEST EVENT ONLY (NO SIDE EFFECTS YET)
  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object

    console.log('Checkout completed:', {
      sessionId: session.id,
      customer: session.customer,
      email: session.customer_details?.email,
    })

    // 🔒 TEMP: minimal Firestore write
    await admin
      .firestore()
      .collection('stripe_debug')
      .doc(session.id)
      .set({
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        customer: session.customer,
        email: session.customer_details?.email ?? null,
      })

    console.log('Firestore test write OK')
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ received: true }),
  }
}
