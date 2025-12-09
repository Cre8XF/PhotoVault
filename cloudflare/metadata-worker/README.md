# Pixtr Metadata Engine v1

Cloudflare Worker for managing photo metadata using R2 + KV storage.

## 📋 Overview

This worker provides a metadata layer on top of Cloudflare R2 storage, enabling:

- **Automatic metadata generation** from R2 objects
- **Fast metadata retrieval** via KV storage
- **Storage integrity checking** (detect missing/orphaned files)
- **Bulk repair operations** for Firestore + R2 sync issues

## 🏗️ Architecture

```
┌─────────────┐
│   Frontend  │
│  (Pixtr UI) │
└─────┬───────┘
      │
      │ API Calls
      ▼
┌─────────────────┐
│ Metadata Worker │ ◄─── You are here
│  (CF Worker)    │
└────┬─────┬──────┘
     │     │
     │     └──────────┐
     │                │
     ▼                ▼
┌─────────┐    ┌──────────┐
│   KV    │    │    R2    │
│ Storage │    │ Storage  │
└─────────┘    └──────────┘
```

## 🚀 Setup

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
```

### 2. Login to Cloudflare

```bash
wrangler login
```

### 3. Create KV Namespace

```bash
# Production namespace
wrangler kv:namespace create "PIXTR_METADATA_KV"

# Preview namespace (for testing)
wrangler kv:namespace create "PIXTR_METADATA_KV" --preview
```

Copy the namespace IDs from the output and update `wrangler.toml`.

### 4. Configure Environment

Edit `wrangler.toml`:

1. Replace `YOUR_KV_NAMESPACE_ID_HERE` with the production KV namespace ID
2. Replace `YOUR_KV_PREVIEW_NAMESPACE_ID_HERE` with the preview KV namespace ID
3. Set `ADMIN_TOKEN` to a secure random token (e.g., use `openssl rand -hex 32`)
4. Update `bucket_name` if your R2 bucket has a different name
5. Update route patterns with your domain

### 5. Deploy

```bash
# Deploy to development
wrangler deploy

# Deploy to production
wrangler deploy --env production

# Deploy to staging
wrangler deploy --env staging
```

## 🔧 Local Development

Run the worker locally:

```bash
wrangler dev --local
```

This starts a local server at `http://localhost:8787`.

## 📡 API Endpoints

### 1. Check File Existence

**GET** `/api/check-file?path={storagePath}`

Check if a file exists in R2.

**Example:**
```bash
curl "https://metadata-worker.your-domain.workers.dev/api/check-file?path=users/abc123/album1/photo.jpg"
```

**Response:**
```json
{
  "exists": true,
  "path": "users/abc123/album1/photo.jpg"
}
```

### 2. List Orphaned Files

**GET** `/api/list-orphans?userId={userId}`

List files in R2 that might not have Firestore entries.

**Example:**
```bash
curl "https://metadata-worker.your-domain.workers.dev/api/list-orphans?userId=abc123"
```

**Response:**
```json
{
  "orphans": [
    {
      "path": "users/abc123/unassigned/1234567890_photo.jpg",
      "name": "1234567890_photo.jpg",
      "size": 1024000,
      "uploadedAt": "2024-12-08T10:30:00.000Z"
    }
  ],
  "count": 1
}
```

### 3. Get User Metadata

**GET** `/api/metadata?userId={userId}`

Retrieve stored metadata for a user from KV.

**Example:**
```bash
curl "https://metadata-worker.your-domain.workers.dev/api/metadata?userId=abc123"
```

**Response:**
```json
{
  "version": "1.0",
  "userId": "abc123",
  "lastUpdated": "2024-12-08T10:30:00.000Z",
  "photoCount": 42,
  "albums": {
    "album1": {
      "id": "album1",
      "name": "album1",
      "photos": [...]
    }
  }
}
```

### 4. Repair User Metadata

**POST** `/api/repair?userId={userId}`

Scan R2 and rebuild metadata for a specific user.

**Example:**
```bash
curl -X POST "https://metadata-worker.your-domain.workers.dev/api/repair?userId=abc123"
```

**Response:**
```json
{
  "success": true,
  "userId": "abc123",
  "photoCount": 42,
  "albumCount": 5,
  "metadata": {...}
}
```

### 5. Repair All Users (Admin Only)

**POST** `/api/repair-all`

Scan and rebuild metadata for ALL users.

**Requires:** `Authorization: Bearer {ADMIN_TOKEN}` header

**Example:**
```bash
curl -X POST \
  -H "Authorization: Bearer your-admin-token-here" \
  "https://metadata-worker.your-domain.workers.dev/api/repair-all"
```

**Response:**
```json
{
  "success": true,
  "processedUsers": 10,
  "results": [
    {
      "userId": "user1",
      "status": "success",
      "photoCount": 42,
      "albumCount": 5
    }
  ]
}
```

### 6. Regenerate Presigned URLs

**POST** `/api/regenerate-urls?userId={userId}`

Update metadata timestamp to trigger URL regeneration.

**Example:**
```bash
curl -X POST "https://metadata-worker.your-domain.workers.dev/api/regenerate-urls?userId=abc123"
```

**Response:**
```json
{
  "success": true,
  "count": 42,
  "message": "URLs regenerated successfully"
}
```

## 🧪 Testing

### Test File Existence

```bash
# Should return exists: true for existing files
curl "http://localhost:8787/api/check-file?path=users/testuser/unassigned/photo.jpg"
```

### Test Metadata Repair

```bash
# Rebuild metadata for a user
curl -X POST "http://localhost:8787/api/repair?userId=testuser"
```

### Test Admin Endpoint

```bash
# Test with admin token
curl -X POST \
  -H "Authorization: Bearer your-admin-token" \
  "http://localhost:8787/api/repair-all"
```

## 🔐 Security

- **Admin Token:** The `/api/repair-all` endpoint requires a bearer token matching `ADMIN_TOKEN` from `wrangler.toml`.
- **CORS:** Worker allows all origins (`*`) for development. Update CORS headers in production for better security.
- **Rate Limiting:** Consider adding Cloudflare Rate Limiting rules for production.

## 📊 Monitoring

View worker logs and metrics:

```bash
# Tail logs in real-time
wrangler tail

# View deployment history
wrangler deployments list
```

## 🛠️ Troubleshooting

### KV Namespace Not Found

Make sure the KV namespace IDs in `wrangler.toml` match the output from `wrangler kv:namespace create`.

### R2 Bucket Access Denied

Verify that the R2 bucket name in `wrangler.toml` matches your actual bucket name. Check that the bucket exists in your Cloudflare account.

### CORS Errors

If the frontend can't reach the worker, check:
1. CORS headers are set correctly
2. Worker is deployed and accessible
3. Route configuration matches your domain

## 📝 Next Steps

1. **Deploy the worker** using `wrangler deploy`
2. **Update frontend** to use the worker URL in `.env`:
   ```
   VITE_METADATA_API_URL=https://metadata-worker.your-domain.workers.dev
   ```
3. **Test integrity scan** from the admin panel in Pixtr
4. **Monitor usage** via Cloudflare dashboard

## 📚 Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)
- [R2 Storage Docs](https://developers.cloudflare.com/r2/)
- [KV Storage Docs](https://developers.cloudflare.com/workers/runtime-apis/kv/)
