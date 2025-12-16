# R2 Metadata System - Quick Setup Guide

## Prerequisites

- Cloudflare account
- Wrangler CLI installed (`npm install -g wrangler`)
- Existing Firebase project

## Setup Steps

### 1. Install Dependencies

No additional dependencies needed - all changes use existing packages.

### 2. Create R2 Buckets

```bash
# Login to Cloudflare
wrangler login

# Create production bucket
wrangler r2 bucket create pixtr-metadata

# Create preview bucket (for testing)
wrangler r2 bucket create pixtr-metadata-preview
```

### 3. Deploy Cloudflare Worker

```bash
# From project root
cd /home/user/PhotoVault

# Deploy worker
wrangler deploy

# Note the output URL, e.g.:
# https://pixtr-metadata-api.your-subdomain.workers.dev
```

### 4. Configure Environment Variables

Create `.env.local` file in project root:

```bash
# Cloudflare Worker API URL (from step 3)
VITE_METADATA_API_URL=https://pixtr-metadata-api.your-subdomain.workers.dev

# Your existing Firebase variables
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 5. Update Worker CORS (Production)

Edit `worker/index.js` line 16 to restrict to your domain:

```javascript
'Access-Control-Allow-Origin': 'https://your-production-domain.com',
```

Redeploy:
```bash
wrangler deploy
```

### 6. Test Locally

```bash
# Start development server
npm run dev

# Open browser and:
# 1. Login
# 2. Check console for "Loading metadata from R2"
# 3. Toggle a favorite
# 4. Wait 1 second
# 5. Refresh page
# 6. Verify favorite persists
```

### 7. Deploy to Production

```bash
npm run build
# Deploy build/ to your hosting (Vercel, Netlify, etc.)
```

## Verification Checklist

- [ ] Worker deployed successfully
- [ ] R2 buckets created
- [ ] `.env.local` configured with worker URL
- [ ] Can login successfully
- [ ] Console shows "Metadata loaded from R2"
- [ ] Favorite toggle persists after refresh
- [ ] Delete persists after refresh
- [ ] Logout saves metadata
- [ ] Can login on different device and see changes

## Troubleshooting

### Worker Not Accessible
```bash
# Check worker status
wrangler deployments list

# View logs
wrangler tail
```

### R2 Bucket Issues
```bash
# List buckets
wrangler r2 bucket list

# Check bucket exists
wrangler r2 bucket info pixtr-metadata
```

### CORS Errors
- Verify worker CORS headers in `worker/index.js`
- Check browser console for exact error
- Test with `curl -v` to see headers

### Metadata Not Saving
- Check browser console for errors
- Check Network tab for POST to `/api/metadata`
- Verify Firebase ID token is valid
- Check Cloudflare Worker logs

## API Endpoints

### GET /api/metadata
```bash
curl -X GET "https://your-worker.workers.dev/api/metadata?userId=abc123" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"
```

### POST /api/metadata
```bash
curl -X POST "https://your-worker.workers.dev/api/metadata" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "version": "1.0",
    "userId": "abc123",
    "lastUpdated": "2024-12-08T10:00:00.000Z",
    "photos": {},
    "albums": {},
    "settings": {}
  }'
```

### GET /health
```bash
curl https://your-worker.workers.dev/health
```

## Next Steps After Setup

1. **Test all features** - Go through the testing checklist in `PHASE1_R2_METADATA.md`
2. **Monitor logs** - Watch Cloudflare Worker logs for errors
3. **Set up alerts** - Configure Cloudflare alerts for worker errors
4. **Plan migration** - If you have existing users, plan data migration from Firestore to R2

## Cost Estimation

**R2 Storage:**
- Storage: $0.015/GB/month
- Class A Operations (writes): $4.50/million
- Class B Operations (reads): $0.36/million

**Example (1000 users):**
- Storage: ~10MB = $0.00015/month
- Writes: ~10k/day = ~$0.14/month
- Reads: ~10k/day = ~$0.01/month
- **Total: ~$0.15/month**

**Workers:**
- Free tier: 100k requests/day
- Paid: $0.50/million requests

For most applications, this will be **free** or **< $1/month**.

## Support

- **Documentation**: `PHASE1_R2_METADATA.md`
- **Cloudflare Docs**: https://developers.cloudflare.com/r2/
- **Wrangler Docs**: https://developers.cloudflare.com/workers/wrangler/

---

**Setup Time**: ~10 minutes
**Difficulty**: Easy
**Status**: ✅ Ready for deployment
