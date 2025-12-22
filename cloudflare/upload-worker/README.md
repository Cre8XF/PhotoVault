# Pixtr Upload Worker

Cloudflare Worker for proxying file uploads to R2 storage.

## Architecture

```
Browser → Worker → R2
   ↓         ↓      ↓
 File → Verify → Store
        Auth     Photos
```

## Why a Worker is Required

Cloudflare R2 **cannot** accept secure uploads directly from the browser because:

1. **Credential Exposure**: S3-compatible APIs require access keys, which cannot be safely stored in the browser
2. **CORS Limitations**: R2 doesn't support presigned URLs in the same way as AWS S3
3. **Security**: Direct browser access would expose your R2 bucket to unauthorized uploads

**Solution**: This Worker acts as a secure proxy that:
- Verifies user authentication (Firebase token)
- Validates upload permissions
- Uploads to R2 using server-side credentials
- Returns the public R2 URL

## Endpoints

### POST /upload
Upload a file to R2.

**Headers:**
```
Authorization: Bearer {firebase-id-token}
Content-Type: multipart/form-data
```

**Form Fields:**
```
file: File (required)
userId: string (required)
storagePath: string (required, must start with users/{userId}/)
contentType: string (required, e.g., "image/jpeg")
albumId: string (optional)
```

**Response:**
```json
{
  "success": true,
  "r2Url": "https://photos.pixtr.cloud/users/{userId}/{albumId}/{file}",
  "storageBackend": "r2",
  "storagePath": "users/{userId}/{albumId}/{file}",
  "size": 123456
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "service": "pixtr-upload-worker",
  "timestamp": "2024-12-08T12:00:00.000Z"
}
```

## Deployment

### Prerequisites
1. Cloudflare account
2. Wrangler CLI: `npm install -g wrangler`
3. R2 bucket created: `wrangler r2 bucket create pixtr-photos`

### Deploy to Production
```bash
cd cloudflare/upload-worker
wrangler deploy --env production
```

### Deploy to Staging
```bash
cd cloudflare/upload-worker
wrangler deploy --env staging
```

### Local Development
```bash
cd cloudflare/upload-worker
wrangler dev --local
```

## Configuration

After deployment, update your `.env` file:

```env
VITE_R2_ENABLED=true
VITE_R2_UPLOAD_ENDPOINT=https://upload.pixtr.cloud
VITE_R2_PUBLIC_URL=https://photos.pixtr.cloud
```

## Security

- ✅ Firebase token verification
- ✅ User ID validation (users can only upload to their own folders)
- ✅ Storage path validation (prevents directory traversal)
- ✅ CORS restricted to known origins
- ✅ Credentials never exposed to browser

## Error Handling

| Status | Error | Reason |
|--------|-------|--------|
| 401 | Unauthorized | Missing or invalid Firebase token |
| 403 | Forbidden | User attempting to upload to another user's folder |
| 400 | Bad Request | Missing required fields or invalid storagePath |
| 500 | Internal Server Error | R2 upload failed |

## Monitoring

Check worker logs in Cloudflare Dashboard:
1. Go to Workers & Pages
2. Select `pixtr-upload-worker-production`
3. Click "Logs" tab

## Troubleshooting

### Upload fails with 401
- Check that Firebase token is valid and not expired
- Verify Authorization header format: `Bearer {token}`

### Upload fails with 403
- Ensure `userId` in form data matches authenticated user
- Verify `storagePath` starts with `users/{userId}/`

### Upload fails with 500
- Check R2 bucket binding in wrangler.toml
- Verify bucket exists and worker has access
- Check worker logs for detailed error message

## Architecture Diagram

```
┌──────────────┐
│   Browser    │
│  (Vite/React)│
└──────┬───────┘
       │ POST /upload
       │ multipart/form-data
       │ Authorization: Bearer {token}
       ↓
┌──────────────────┐
│ Upload Worker    │
│ (Cloudflare)     │
├──────────────────┤
│ 1. Verify Token  │
│ 2. Validate User │
│ 3. Upload to R2  │
│ 4. Return URL    │
└──────┬───────────┘
       │
       ↓
┌──────────────────┐
│  R2 Bucket       │
│  (pixtr-photos)  │
│                  │
│  users/          │
│    {userId}/     │
│      {album}/    │
│        {file}    │
└──────────────────┘
```

## Next Steps

After deploying this worker:
1. Update frontend to use Worker endpoint (see `src/utils/r2Upload.js`)
2. Test upload flow end-to-end
3. Verify files appear in R2 bucket
4. Confirm Firestore stores `storageBackend: "r2"` and `r2Url`
