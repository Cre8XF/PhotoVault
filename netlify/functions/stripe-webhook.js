import Stripe from 'stripe'
import { getFirestore, getFieldValue } from './_firebaseAdmin.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
})

/**
 * Extract Price ID from checkout session or subscription
 * CRITICAL: This is the single source of truth for price ID extraction
 *
 * @param {Object} sessionOrSubscription - Stripe checkout session or subscription object
 * @param {string} subscriptionId - Optional subscription ID to fetch if not in session
 * @returns {Promise<string|null>} Price ID or null if not found
 */
async function extractPriceId(sessionOrSubscription, subscriptionId = null) {
  // Try line_items first (for checkout.session.completed)
  if (sessionOrSubscription.line_items?.data?.length > 0) {
    const priceId = sessionOrSubscription.line_items.data[0].price?.id
    if (priceId) {
      console.log(`✔ Price ID extracted from line_items: ${priceId}`)
      return priceId
    }
  }

  // Try subscription items directly (for subscription.updated/deleted events)
  if (sessionOrSubscription.items?.data?.length > 0) {
    const priceId = sessionOrSubscription.items.data[0].price?.id
    if (priceId) {
      console.log(`✔ Price ID extracted from subscription items: ${priceId}`)
      return priceId
    }
  }

  // If line_items not expanded, fetch subscription
  if (subscriptionId) {
    try {
      console.log(`⚙️ Fetching subscription ${subscriptionId} to get price ID...`)
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)
      if (subscription.items?.data?.length > 0) {
        const priceId = subscription.items.data[0].price?.id
        if (priceId) {
          console.log(`✔ Price ID extracted from fetched subscription: ${priceId}`)
          return priceId
        }
      }
    } catch (err) {
      console.error('❌ Failed to fetch subscription for price ID:', err.message)
    }
  }

  console.error('❌ Could not extract price ID from session/subscription')
  return null
}

/**
 * Map Stripe Price ID to subscription tier and storage limit
 * Returns: { tier: string, storageLimit: number }
 */
function mapPriceIdToTierAndStorage(priceId) {
  const STRIPE_LITE_PRICE_ID = process.env.STRIPE_LITE_PRICE_ID
  const STRIPE_PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID

  console.log(`🔍 Mapping price ID: ${priceId}`)
  console.log(`   LITE Price ID: ${STRIPE_LITE_PRICE_ID}`)
  console.log(`   PRO Price ID: ${STRIPE_PRO_PRICE_ID}`)

  if (priceId === STRIPE_LITE_PRICE_ID) {
    console.log('✅ Matched LITE tier')
    return {
      tier: 'LITE',
      storageLimit: 5368709120, // 5 GB in bytes
    }
  }

  if (priceId === STRIPE_PRO_PRICE_ID) {
    console.log('✅ Matched PRO tier')
    return {
      tier: 'PRO',
      storageLimit: 53687091200, // 50 GB in bytes
    }
  }

  // Default to GRATIS if price ID doesn't match
  console.warn(`⚠️ Unknown price ID: ${priceId}, defaulting to GRATIS`)
  return {
    tier: 'GRATIS',
    storageLimit: 1073741824, // 1 GB in bytes
  }
}

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

  // PHASE 2A: Handle checkout.session.completed
  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object

    console.log('✔ Checkout completed')

    // UID RESOLUTION: Priority order - metadata.uid first, then client_reference_id
    const uid = session.metadata?.uid || session.client_reference_id

    if (!uid) {
      console.warn('⚠️ No UID found in session (metadata.uid and client_reference_id both missing)')
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

    // Extract price ID using the centralized helper
    const priceId = await extractPriceId(session, stripeSubscriptionId)

    if (!priceId) {
      console.error('❌ Could not determine price ID from session')
      return {
        statusCode: 200,
        body: JSON.stringify({
          ok: true,
          received: true,
          error: 'Could not determine price ID',
        }),
      }
    }

    // Map price ID to tier and storage limit
    const { tier, storageLimit } = mapPriceIdToTierAndStorage(priceId)

    console.log(`✔ Mapped to tier: ${tier}, storage: ${storageLimit} bytes`)

    // Write to Firestore
    try {
      const db = getFirestore()
      await db.collection('users').doc(uid).set(
        {
          subscriptionTier: tier,
          stripeCustomerId: stripeCustomerId,
          stripeSubscriptionId: stripeSubscriptionId,
          subscriptionStatus: 'active',
          storageLimit: storageLimit,
          updatedAt: getFieldValue().serverTimestamp(),
        },
        { merge: true }
      )

      console.log('✔ Firestore subscription updated')
      console.log('✅ Firestore write success (checkout.session.completed)')

      return {
        statusCode: 200,
        body: JSON.stringify({
          ok: true,
          received: true,
          type: stripeEvent.type,
          uid: uid,
          tier: tier,
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
        const db = getFirestore()
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
    const status = subscription.status

    // Extract price ID using the centralized helper
    const priceId = await extractPriceId(subscription)

    if (!priceId) {
      console.error('❌ Could not determine price ID from subscription')
      return {
        statusCode: 200,
        body: JSON.stringify({
          ok: true,
          received: true,
          error: 'Could not determine price ID',
        }),
      }
    }

    // Map price ID to tier and storage limit
    const { tier, storageLimit } = mapPriceIdToTierAndStorage(priceId)

    console.log(`✔ Mapped to tier: ${tier}, storage: ${storageLimit} bytes, status: ${status}`)

    // Write to Firestore
    try {
      const db = getFirestore()
      await db.collection('users').doc(uid).set(
        {
          subscriptionTier: tier,
          stripeSubscriptionId: subscription.id,
          subscriptionStatus: status,
          storageLimit: storageLimit,
          updatedAt: getFieldValue().serverTimestamp(),
        },
        { merge: true }
      )

      console.log('✔ Firestore subscription updated')
      console.log('✅ Firestore write success (customer.subscription.updated)')

      return {
        statusCode: 200,
        body: JSON.stringify({
          ok: true,
          received: true,
          type: stripeEvent.type,
          uid: uid,
          tier: tier,
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
        const db = getFirestore()
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

    // Write to Firestore - downgrade to GRATIS
    try {
      const db = getFirestore()
      await db.collection('users').doc(uid).set(
        {
          subscriptionTier: 'GRATIS',
          subscriptionStatus: 'canceled',
          stripeSubscriptionId: null,
          storageLimit: 1073741824, // 1 GB in bytes for GRATIS tier
          updatedAt: getFieldValue().serverTimestamp(),
        },
        { merge: true }
      )

      console.log('✔ Firestore subscription downgraded to GRATIS')
      console.log('✅ Firestore write success (customer.subscription.deleted)')

      return {
        statusCode: 200,
        body: JSON.stringify({
          ok: true,
          received: true,
          type: stripeEvent.type,
          uid: uid,
          tier: 'GRATIS',
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
