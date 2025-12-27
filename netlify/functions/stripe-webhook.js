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

  // PHASE 2A: Handle checkout.session.completed
  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object

    console.log('✔ Checkout completed')

    // Extract UID safely
    const uid = session.client_reference_id || session.metadata?.uid

    if (!uid) {
      console.warn('⚠️ No UID found in session (client_reference_id or metadata.uid missing)')
      return {
        statusCode: 200,
        body: JSON.stringify({
          ok: true,
          received: true,
          warning: 'No UID in session metadata',
        }),
      }
    }

    console.log('✔ UID resolved:', uid)

    // Extract subscription data
    const stripeCustomerId = session.customer
    const stripeSubscriptionId = session.subscription
    const plan = session.metadata?.plan || 'lite' // Default to lite if not specified

    // Write to Firestore
    try {
      const db = admin.firestore()
      await db.collection('users').doc(uid).set(
        {
          subscriptionTier: plan,
          stripeCustomerId: stripeCustomerId,
          stripeSubscriptionId: stripeSubscriptionId,
          subscriptionStatus: 'active',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      )

      console.log('✔ Firestore subscription updated')

      return {
        statusCode: 200,
        body: JSON.stringify({
          ok: true,
          received: true,
          type: stripeEvent.type,
          uid: uid,
        }),
      }
    } catch (error) {
      console.error('❌ Firestore write failed:', error.message)
      // Still return 200 to prevent Stripe retries
      return {
        statusCode: 200,
        body: JSON.stringify({
          ok: true,
          received: true,
          error: 'Firestore write failed but acknowledged',
        }),
      }
    }
  }

  // PHASE 2B: Handle customer.subscription.updated
  if (stripeEvent.type === 'customer.subscription.updated') {
    const subscription = stripeEvent.data.object

    console.log('✔ Subscription updated')

    // Resolve UID: try metadata first, then Firestore lookup
    let uid = subscription.metadata?.uid

    if (!uid) {
      console.log('UID not in metadata, attempting Firestore lookup by stripeCustomerId')
      try {
        const db = admin.firestore()
        const usersSnapshot = await db
          .collection('users')
          .where('stripeCustomerId', '==', subscription.customer)
          .limit(1)
          .get()

        if (!usersSnapshot.empty) {
          uid = usersSnapshot.docs[0].id
          console.log('✔ UID resolved via Firestore lookup:', uid)
        }
      } catch (error) {
        console.error('❌ Firestore lookup failed:', error.message)
      }
    } else {
      console.log('✔ UID resolved from metadata:', uid)
    }

    if (!uid) {
      console.warn('⚠️ UID not resolved for subscription.updated')
      return {
        statusCode: 200,
        body: JSON.stringify({
          ok: true,
          received: true,
          warning: 'UID not resolved',
        }),
      }
    }

    // Extract subscription data
    const plan = subscription.metadata?.plan || 'lite'
    const status = subscription.status

    // Write to Firestore
    try {
      const db = admin.firestore()
      await db.collection('users').doc(uid).set(
        {
          subscriptionTier: plan,
          stripeSubscriptionId: subscription.id,
          subscriptionStatus: status,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      )

      console.log('✔ Firestore subscription updated')

      return {
        statusCode: 200,
        body: JSON.stringify({
          ok: true,
          received: true,
          type: stripeEvent.type,
          uid: uid,
        }),
      }
    } catch (error) {
      console.error('❌ Firestore write failed:', error.message)
      return {
        statusCode: 200,
        body: JSON.stringify({
          ok: true,
          received: true,
          error: 'Firestore write failed but acknowledged',
        }),
      }
    }
  }

  // PHASE 2B: Handle customer.subscription.deleted
  if (stripeEvent.type === 'customer.subscription.deleted') {
    const subscription = stripeEvent.data.object

    console.log('✔ Subscription deleted')

    // Resolve UID: try metadata first, then Firestore lookup
    let uid = subscription.metadata?.uid

    if (!uid) {
      console.log('UID not in metadata, attempting Firestore lookup by stripeCustomerId')
      try {
        const db = admin.firestore()
        const usersSnapshot = await db
          .collection('users')
          .where('stripeCustomerId', '==', subscription.customer)
          .limit(1)
          .get()

        if (!usersSnapshot.empty) {
          uid = usersSnapshot.docs[0].id
          console.log('✔ UID resolved via Firestore lookup:', uid)
        }
      } catch (error) {
        console.error('❌ Firestore lookup failed:', error.message)
      }
    } else {
      console.log('✔ UID resolved from metadata:', uid)
    }

    if (!uid) {
      console.warn('⚠️ UID not resolved for subscription.deleted')
      return {
        statusCode: 200,
        body: JSON.stringify({
          ok: true,
          received: true,
          warning: 'UID not resolved',
        }),
      }
    }

    // Write to Firestore - downgrade to free
    try {
      const db = admin.firestore()
      await db.collection('users').doc(uid).set(
        {
          subscriptionTier: 'free',
          subscriptionStatus: 'canceled',
          stripeSubscriptionId: null,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      )

      console.log('✔ Firestore subscription downgraded to free')

      return {
        statusCode: 200,
        body: JSON.stringify({
          ok: true,
          received: true,
          type: stripeEvent.type,
          uid: uid,
        }),
      }
    } catch (error) {
      console.error('❌ Firestore write failed:', error.message)
      return {
        statusCode: 200,
        body: JSON.stringify({
          ok: true,
          received: true,
          error: 'Firestore write failed but acknowledged',
        }),
      }
    }
  }

  // All other event types: acknowledge but don't process yet
  console.log('ℹ️ Event type not handled in this phase:', stripeEvent.type)

  return {
    statusCode: 200,
    body: JSON.stringify({ received: true }),
  }
}
