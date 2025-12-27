import Stripe from 'stripe'
import admin from 'firebase-admin'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
})

export async function handler(event) {
  console.log('=== STRIPE WEBHOOK RECEIVED ===')

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  // Stripe signature
  const sig = event.headers['stripe-signature']
  if (!sig) {
    console.error('Missing Stripe signature')
    return { statusCode: 400, body: 'Missing signature' }
  }

  // Raw body handling (Netlify)
  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64')
    : event.body

  let stripeEvent
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    )
    console.log('✅ Stripe signature verified:', stripeEvent.type)
  } catch (err) {
    console.error('❌ Stripe signature verification failed:', err.message)
    return { statusCode: 400, body: 'Invalid signature' }
  }

  // Firebase Admin INIT — AFTER verification
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    })
    console.log('Firebase Admin initialized')
  }

  // Phase 1: no side effects
  console.log('Webhook accepted, no actions executed yet')

  return {
    statusCode: 200,
    body: JSON.stringify({ received: true }),
  }
}

