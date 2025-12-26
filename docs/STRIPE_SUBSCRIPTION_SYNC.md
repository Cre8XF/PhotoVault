# Stripe Subscription Sync - Manual Recovery

## Overview

The `sync-stripe-subscription` Netlify function manually syncs Stripe subscription data to Firestore when webhook delivery fails (e.g., when the Netlify site is paused).

**Stripe is the source of truth.** This function fetches the current state from Stripe and updates Firestore accordingly.

---

## When to Use

Use this function when:

1. ✅ Stripe shows an active subscription
2. ❌ Firestore does not reflect the subscription (user still on GRATIS tier)
3. ⚠️ Webhook delivery failed (site was paused, network issues, etc.)

**This function is idempotent** - safe to run multiple times on the same user.

---

## Prerequisites

### Environment Variables (Netlify)

Ensure these are configured in Netlify:

```bash
# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_LITE_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...

# Firebase Admin
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### Deployment

The function is automatically deployed when you push to your Netlify-connected branch.

**Location**: `netlify/functions/sync-stripe-subscription.js`

---

## Usage

### Method 1: cURL (Command Line)

```bash
curl -X POST https://your-site.netlify.app/.netlify/functions/sync-stripe-subscription \
  -H "Content-Type: application/json" \
  -d '{"userId":"firebase-uid-here"}'
```

### Method 2: Postman / Insomnia

**URL**: `https://your-site.netlify.app/.netlify/functions/sync-stripe-subscription`

**Method**: `POST`

**Headers**:
```
Content-Type: application/json
```

**Body** (JSON):
```json
{
  "userId": "abc123firebase-uid-here"
}
```

### Method 3: JavaScript (Browser Console)

```javascript
fetch('https://your-site.netlify.app/.netlify/functions/sync-stripe-subscription', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    userId: 'firebase-uid-here'
  })
})
  .then(response => response.json())
  .then(data => console.log('Sync result:', data))
  .catch(error => console.error('Sync failed:', error));
```

### Method 4: Node.js Script

See `scripts/sync-subscription.js` (if created) or use:

```javascript
const fetch = require('node-fetch');

async function syncSubscription(userId) {
  const response = await fetch('https://your-site.netlify.app/.netlify/functions/sync-stripe-subscription', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });

  const result = await response.json();
  console.log(result);
  return result;
}

syncSubscription('firebase-uid-here');
```

---

## Response Examples

### ✅ Success - Active Subscription

```json
{
  "success": true,
  "message": "Subscription synced successfully from Stripe to Firestore",
  "data": {
    "userId": "abc123...",
    "tier": "LITE",
    "status": "active",
    "stripeCustomerId": "cus_...",
    "stripeSubscriptionId": "sub_...",
    "stripePriceId": "price_...",
    "storageLimit": 5368709120
  }
}
```

### ✅ Success - No Active Subscription

```json
{
  "success": true,
  "message": "No active subscription found. User set to GRATIS.",
  "data": {
    "userId": "abc123...",
    "tier": "GRATIS",
    "status": "inactive",
    "stripeCustomerId": "cus_..."
  }
}
```

### ❌ Error - User Not Found

```json
{
  "error": "User not found in Firestore"
}
```

### ❌ Error - No Stripe Customer

```json
{
  "error": "No Stripe customer found",
  "message": "User has no Stripe customer record. No subscription to sync."
}
```

---

## How It Works

### Step-by-Step Process

```
1. Fetch user from Firestore by userId
   └─ Get email and existing stripeCustomerId

2. Find Stripe customer
   ├─ Try existing stripeCustomerId first
   └─ Fallback: Search by email

3. Fetch active subscriptions
   └─ Filter by status: 'active'

4. Determine tier from price ID
   ├─ STRIPE_LITE_PRICE_ID → LITE
   ├─ STRIPE_PRO_PRICE_ID → PRO
   └─ Unknown or no subscription → GRATIS

5. Update Firestore
   ├─ subscriptionTier: "LITE" | "PRO" | "GRATIS"
   ├─ subscriptionStatus: "active" | "inactive"
   ├─ storageLimit: 5368709120 (5 GB for LITE)
   ├─ stripeCustomerId
   ├─ stripeSubscriptionId
   ├─ stripePriceId
   └─ updatedAt: ISO timestamp
```

### Firestore Update

The function updates `users/{userId}` with:

```javascript
{
  subscriptionTier: "LITE",           // or "PRO" or "GRATIS"
  subscriptionStatus: "active",       // or "inactive"
  storageLimit: 5368709120,           // bytes (5 GB for LITE)
  stripeCustomerId: "cus_...",
  stripeSubscriptionId: "sub_...",
  stripePriceId: "price_...",
  updatedAt: "2025-12-26T12:00:00.000Z"
}
```

---

## Logging

The function outputs detailed logs to Netlify Functions logs:

```
═══════════════════════════════════════════════
🔄 STRIPE SUBSCRIPTION SYNC STARTED
═══════════════════════════════════════════════
User ID: abc123...
Timestamp: 2025-12-26T12:00:00.000Z

📖 STEP 1: Fetching user from Firestore...
✅ User found: user@example.com
   Existing stripeCustomerId: cus_...

🔍 STEP 2: Finding Stripe customer...
✅ Found customer by ID: cus_...

📋 STEP 3: Fetching subscriptions...
   Found 1 active subscription(s)
   Subscription ID: sub_...
   Price ID: price_...
   Status: active

🎯 STEP 4: Mapping price ID to tier...
   Tier: LITE
   Storage Limit: 5368709120 bytes (5.0 GB)

💾 STEP 5: Updating Firestore...
✅ Firestore updated successfully
═══════════════════════════════════════════════
🎉 SUBSCRIPTION SYNC COMPLETE
═══════════════════════════════════════════════
```

---

## Troubleshooting

### Issue: "User not found in Firestore"

**Cause**: Invalid userId or user doesn't exist in `users` collection

**Solution**: Verify the userId is correct (Firebase UID, not email)

---

### Issue: "No Stripe customer found"

**Cause**: User never created a Stripe customer (never attempted to subscribe)

**Solution**: User needs to go through checkout flow first

---

### Issue: Function returns GRATIS even though Stripe shows active subscription

**Possible causes**:
1. Price ID mismatch - check `STRIPE_LITE_PRICE_ID` and `STRIPE_PRO_PRICE_ID` env vars
2. Subscription status is not "active" (could be "trialing", "past_due", etc.)
3. Multiple subscriptions - function uses the first one

**Debug**:
- Check Netlify function logs for price ID
- Verify env vars match Stripe dashboard
- Check subscription status in Stripe dashboard

---

### Issue: "Failed to sync subscription"

**Check**:
1. Netlify environment variables are set
2. Firebase Admin credentials are valid
3. Stripe API key has correct permissions
4. Function logs for detailed error message

---

## Security Considerations

### Authentication

⚠️ **This function is NOT authenticated** - it accepts any POST request with a userId.

**For production**, add authentication:

```javascript
// Example: Check admin token
const adminToken = event.headers['x-admin-token'];
if (adminToken !== process.env.ADMIN_SECRET) {
  return {
    statusCode: 401,
    body: JSON.stringify({ error: 'Unauthorized' })
  };
}
```

**Alternative**: Make this an internal-only function (not exposed publicly)

---

### Rate Limiting

Consider adding rate limiting if exposed publicly:

```javascript
// Example: Simple in-memory rate limit
const rateLimitMap = new Map();
const MAX_REQUESTS_PER_MINUTE = 10;
```

---

## Monitoring

### Recommended Monitoring

1. **Netlify Function Logs**: Check for errors/warnings
2. **Firestore Console**: Verify `subscriptionTier` is updated
3. **Stripe Dashboard**: Confirm subscription is active

### Alerts

Set up alerts for:
- Function failures (500 errors)
- No Stripe customer found (might indicate signup flow issues)
- Price ID mismatches (unknown price IDs)

---

## Example: Batch Sync Multiple Users

```bash
#!/bin/bash
# sync-multiple-users.sh

USERS=(
  "user-id-1"
  "user-id-2"
  "user-id-3"
)

for USER_ID in "${USERS[@]}"; do
  echo "Syncing user: $USER_ID"

  curl -X POST https://your-site.netlify.app/.netlify/functions/sync-stripe-subscription \
    -H "Content-Type: application/json" \
    -d "{\"userId\":\"$USER_ID\"}" \
    -s | jq '.'

  echo "---"
  sleep 1  # Rate limit
done
```

---

## Related Functions

- `stripe-webhook.js` - Automatic subscription updates via Stripe webhooks
- `create-checkout-session.js` - Initiates subscription checkout

**Sync function is a fallback** - webhooks are the primary source of updates.

---

## Maintenance

### When to Update

Update this function when:
1. Storage limits change
2. New subscription tiers added
3. Stripe price IDs change

### Version History

- **v1.0** (2025-12-26): Initial implementation
  - Manual sync for missed webhook events
  - Idempotent operation
  - Detailed logging

---

## Support

For issues:
1. Check Netlify function logs
2. Verify environment variables
3. Check Stripe dashboard for subscription status
4. Check Firestore for user document

---

**Last Updated**: 2025-12-26
**Author**: Claude (AI Assistant)
**Status**: Production Ready ✅
