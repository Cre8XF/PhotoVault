# Pixtr Image Worker - CORS-Enabled Image Server

## 📋 Overview

This Cloudflare Worker serves images from R2 storage with proper CORS headers, enabling the Editor to load and process images without CORS errors.

### Why This Worker is Needed

**The Problem:**
- **Gallery rendering works:** Browser `<img>` tags don't require CORS headers
- **Editor fails:** Canvas operations (`getImageData`, `toBlob`, filters) **require** CORS headers to read pixel data
- **Direct R2 access:** May not provide all necessary CORS headers for canvas operations

**The Solution:**
This worker sits between the browser and R2 storage, adding comprehensive CORS headers to every image response.

```
Before:
Browser → images.pixtr.cloud → R2 bucket → ❌ CORS error in Editor

After:
Browser → images.pixtr.cloud → Image Worker → R2 bucket → ✅ Editor works
                                    ↓
                          (adds CORS headers)
```

---

## 🏗️ Architecture

### Request Flow

```
1. User opens image in Editor
   ↓
2. Editor loads: https://images.pixtr.cloud/users/abc/photos/image.jpg
   ↓
3. Cloudflare routes to Image Worker (via DNS/route)
   ↓
4. Worker fetches from R2 bucket "pixtr-users"
   ↓
5. Worker adds CORS headers to response
   ↓
6. Editor receives image with proper headers
   ↓
7. Canvas can now read pixel data ✅
```

### Supported Operations

| HTTP Method | Purpose | Response |
|-------------|---------|----------|
| **OPTIONS** | CORS preflight | 204 with CORS headers |
| **GET** | Serve image | Image body + CORS headers |
| **HEAD** | Check metadata | Headers only (no body) |

---

## 🚀 Deployment

### Prerequisites

1. **Wrangler CLI installed:**
   ```bash
   npm install -g wrangler
   ```

2. **Logged in to Cloudflare:**
   ```bash
   wrangler login
   ```

3. **R2 bucket exists:**
   - Bucket name: `pixtr-users`
   - Verify: `wrangler r2 bucket list`

---

### Step 1: Deploy Worker to workers.dev (Testing)

From project root:

```bash
cd cloudflare/image-worker
wrangler deploy
```

**Expected output:**
```
✅ Successfully deployed pixtr-image-worker
   https://pixtr-image-worker.YOUR-SUBDOMAIN.workers.dev
```

**Save this URL** - you'll use it for testing.

---

### Step 2: Test Worker

#### Test 1: Health Check

```bash
curl https://pixtr-image-worker.YOUR-SUBDOMAIN.workers.dev/health
```

**Expected response:**
```json
{
  "status": "ok",
  "service": "pixtr-image-worker",
  "timestamp": "2024-12-24T..."
}
```

#### Test 2: CORS Preflight (OPTIONS)

```bash
curl -X OPTIONS \
  -H "Origin: https://pixtr.cloud" \
  -H "Access-Control-Request-Method: GET" \
  -I \
  https://pixtr-image-worker.YOUR-SUBDOMAIN.workers.dev/users/test/photo.jpg
```

**Expected headers:**
```
HTTP/1.1 204 No Content
access-control-allow-origin: *
access-control-allow-methods: GET, HEAD, OPTIONS
cross-origin-resource-policy: cross-origin
```

#### Test 3: Fetch Actual Image (GET)

```bash
curl -I \
  -H "Origin: https://pixtr.cloud" \
  https://pixtr-image-worker.YOUR-SUBDOMAIN.workers.dev/users/YOUR-USER-ID/photos/SOME-IMAGE.jpg
```

**Expected headers:**
```
HTTP/1.1 200 OK
content-type: image/jpeg
access-control-allow-origin: *
cross-origin-resource-policy: cross-origin
cache-control: public, max-age=31536000, immutable
```

**If you get 404:** The image doesn't exist in R2. Upload a test image first.

---

### Step 3: Enable Production Routes

Once testing is successful, enable the worker for production:

1. **Edit `wrangler.toml`:**

   Uncomment the routes section:
   ```toml
   [[routes]]
   pattern = "images.pixtr.cloud/*"
   zone_name = "pixtr.cloud"
   ```

2. **Redeploy:**
   ```bash
   wrangler deploy
   ```

3. **Verify DNS routing:**
   - Cloudflare Dashboard → Workers & Pages → pixtr-image-worker
   - Check that routes show: `images.pixtr.cloud/*`

4. **Test production domain:**
   ```bash
   curl -I -H "Origin: https://pixtr.cloud" \
     https://images.pixtr.cloud/users/test/photo.jpg
   ```

---

## ✅ Testing in Editor

### Before Deployment

**Symptom:**
- Gallery images display correctly
- Editor shows black screen or loading spinner
- Browser console error:
  ```
  Access to image at 'https://images.pixtr.cloud/...' has been blocked by CORS policy:
  No 'Access-Control-Allow-Origin' header is present
  ```

### After Deployment

1. **Open Editor** in Pixtr app
2. **Load an image** (any photo)
3. **Open browser DevTools** (F12)
4. **Check Network tab:**
   - Find request to `images.pixtr.cloud`
   - Click on it
   - Go to "Headers" tab
   - Verify **Response Headers** include:
     ```
     access-control-allow-origin: *
     cross-origin-resource-policy: cross-origin
     ```

5. **Check Console tab:**
   - ✅ No CORS errors
   - ✅ Image loads successfully

6. **Test Editor operations:**
   - Apply filters (brightness, contrast, etc.)
   - Crop image
   - Export/save edited image
   - All should work without errors

---

## 🔧 Configuration

### CORS Headers Explained

| Header | Value | Why Needed |
|--------|-------|------------|
| `Access-Control-Allow-Origin` | `*` | Allow all origins to access images |
| `Access-Control-Allow-Methods` | `GET, HEAD, OPTIONS` | Allow fetching images + metadata |
| `Access-Control-Allow-Headers` | `*` | Allow any headers in requests |
| `Access-Control-Expose-Headers` | `Content-Type, ETag, ...` | Expose headers to JavaScript |
| `Cross-Origin-Resource-Policy` | `cross-origin` | Allow embedding in any context |
| `Cross-Origin-Embedder-Policy` | `unsafe-none` | Allow reading responses cross-origin |

### Caching

Images are cached for **1 year** (immutable):
```javascript
'Cache-Control': 'public, max-age=31536000, immutable'
```

**Why:** Images in R2 are content-addressed (filename includes timestamp/hash), so they never change.

**To modify:** Edit `image-worker.js` line ~130:
```javascript
headers.set('Cache-Control', 'public, max-age=YOUR-VALUE')
```

---

## 🔍 Troubleshooting

### Issue: Worker returns 404

**Possible causes:**
1. Image doesn't exist in R2 bucket
2. Incorrect storage path in request
3. R2 bucket binding name mismatch

**Debug:**
```bash
# Check if file exists in R2
wrangler r2 object get pixtr-users/users/YOUR-USER-ID/photos/image.jpg

# Check worker logs
wrangler tail
```

### Issue: CORS headers not present

**Possible causes:**
1. Routes not enabled (still using direct R2 access)
2. Worker not deployed
3. DNS not routing to worker

**Verify:**
```bash
# Check if worker is responding
curl -I https://images.pixtr.cloud/health

# Should return worker health check, not 404
```

### Issue: Image loads but Editor still fails

**Possible causes:**
1. Editor JavaScript error (unrelated to CORS)
2. Image format not supported by canvas
3. Image too large for canvas

**Debug:**
1. Open browser console
2. Look for JavaScript errors (not just CORS)
3. Check image size/format

---

## 📊 Monitoring

### View Worker Logs

```bash
# Real-time logs
wrangler tail

# Filter for errors only
wrangler tail | grep "ERROR"
```

### Check Worker Metrics

1. Cloudflare Dashboard → Workers & Pages
2. Click on `pixtr-image-worker`
3. View:
   - Request volume
   - Error rate
   - CPU time
   - Bandwidth

---

## 🔄 Rollback Plan

If issues occur after deployment:

### Quick Rollback (5 minutes)

1. **Disable routes:**
   ```toml
   # Comment out in wrangler.toml:
   # [[routes]]
   # pattern = "images.pixtr.cloud/*"
   ```

2. **Redeploy:**
   ```bash
   wrangler deploy
   ```

3. **Verify:** Images now bypass worker (direct R2 access)

### Alternative: Keep Worker, Fix CORS

If worker causes issues but you want CORS:

1. Edit `image-worker.js`
2. Modify CORS headers as needed
3. Redeploy: `wrangler deploy`

---

## 🔐 Security Notes

### Public Access

- Worker serves **all** images from R2 publicly
- No authentication required for GET requests
- Images are public by design (same as before worker)

**Why:** Gallery and Editor need unauthenticated access to display images.

### Upload/Delete Protection

- This worker **only handles GET/HEAD** (read-only)
- Upload and delete are handled by separate worker (`upload-worker`)
- Upload worker has Firebase authentication

---

## 📚 Related Files

| File | Purpose |
|------|---------|
| `image-worker.js` | Main worker code |
| `wrangler.toml` | Worker configuration |
| `README.md` | This file (documentation) |
| `/cors.json` | R2 CORS config (legacy, not used by worker) |
| `../upload-worker/` | Handles uploads/deletes (separate worker) |

---

## ✨ Next Steps

After successful deployment:

1. ✅ Test Editor in production
2. ✅ Monitor worker metrics for 24 hours
3. ✅ Check error rates in Cloudflare Dashboard
4. 📝 Update frontend `.env` if needed (should work automatically)
5. 🎉 Enjoy CORS-free image editing!

---

## 📞 Support

**Issues?**
- Check Cloudflare Worker logs: `wrangler tail`
- Verify R2 bucket access: `wrangler r2 bucket list`
- Review this README's troubleshooting section

**Questions?**
- Cloudflare Workers Docs: https://developers.cloudflare.com/workers/
- R2 Documentation: https://developers.cloudflare.com/r2/

---

**Status:** ✅ Ready for deployment
**Last Updated:** 2024-12-24
**Maintainer:** Pixtr Development Team
