# R2 Upload Architecture

## Overview

This document explains the correct architecture for uploading files to Cloudflare R2 from the PhotoVault application.

## The Problem with Direct Browser Upload

❌ **Why Direct S3 Upload from Browser Doesn't Work for R2:**

1. **Credential Exposure**: R2 requires AWS S3-compatible credentials (Access Key + Secret Key), which cannot be safely exposed to the browser
2. **CORS Limitations**: While R2 supports CORS, it's designed for serving files, not accepting uploads
3. **Presigned URL Limitations**: R2's presigned URL implementation has limitations compared to AWS S3
4. **Security Risk**: Direct browser access would expose your R2 bucket to potential unauthorized uploads

### Previous Incorrect Architecture

```
❌ BROKEN:
Browser → (tries to get presigned URL) → Non-existent Worker
   ↓
Fails → Falls back to Firebase Storage
```

**Result**: All uploads went to Firebase Storage, no files in R2.

## ✅ Correct Architecture: Worker-Based Upload Proxy

### Architecture Diagram

```
┌──────────────────┐
│   Browser        │
│  (Vite/React)    │
└────────┬─────────┘
         │
         │ 1. POST /upload
         │    - multipart/form-data
         │    - Authorization: Bearer {firebase-token}
         │    - file, userId, storagePath, contentType
         │
         ↓
┌──────────────────────────┐
│  Upload Worker           │
│  (Cloudflare)            │
│  upload.pixtr.cloud      │
├──────────────────────────┤
│  1. Verify Firebase token│
│  2. Validate userId      │
│  3. Validate storagePath │
│  4. Upload to R2         │
│  5. Return public URL    │
└────────┬─────────────────┘
         │
         │ R2.put(storagePath, file)
         │
         ↓
┌──────────────────────────┐
│  R2 Bucket               │
│  (pixtr-photos)          │
│  photos.pixtr.cloud      │
├──────────────────────────┤
│  users/                  │
│    {userId}/             │
│      {albumId}/          │
│        {timestamp}_{file}│
└──────────────────────────┘
```

## Why This Architecture is Correct

✅ **Security**:
- Firebase token verification ensures only authenticated users can upload
- Worker validates that userId matches authenticated user
- R2 credentials never exposed to browser
- Storage path validation prevents directory traversal attacks

✅ **Simplicity**:
- Single POST request from browser to worker
- No complex presigned URL generation
- Direct upload to R2 using Worker's R2 binding

✅ **Reliability**:
- Worker has direct R2 access via Cloudflare's R2 binding
- No CORS issues (Worker handles CORS properly)
- Automatic fallback to Firebase Storage if R2 fails

✅ **Performance**:
- Worker runs on Cloudflare's edge network
- Low latency between Worker and R2 (same infrastructure)
- Efficient multipart upload handling

## Implementation Details

### 1. Upload Worker (`cloudflare/upload-worker/upload-worker.js`)

**Endpoint**: `POST /upload`

**Request**:
```http
POST https://upload.pixtr.cloud/upload
Authorization: Bearer {firebase-id-token}
Content-Type: multipart/form-data

file: <binary>
userId: "abc123"
storagePath: "users/abc123/album1/1234567890_photo.jpg"
contentType: "image/jpeg"
albumId: "album1"
```

**Response**:
```json
{
  "success": true,
  "r2Url": "https://photos.pixtr.cloud/users/abc123/album1/1234567890_photo.jpg",
  "storageBackend": "r2",
  "storagePath": "users/abc123/album1/1234567890_photo.jpg",
  "size": 123456
}
```

**Worker Responsibilities**:
1. Verify Firebase ID token
2. Extract authenticated userId from token
3. Validate that request userId matches authenticated userId
4. Validate storagePath starts with `users/{userId}/`
5. Upload file to R2 using R2 binding
6. Return public R2 URL

### 2. Frontend Upload Function (`src/utils/r2Upload.js`)

**Function**: `uploadToR2(file, storagePath, contentType, metadata, userId, firebaseToken)`

**Process**:
1. Create FormData with file and metadata
2. POST to Worker endpoint with Firebase token in Authorization header
3. Receive R2 URL in response
4. Return URL to caller

### 3. Firebase Integration (`src/firebase.js`)

**Function**: `uploadPhoto(userId, file, albumId, ...)`

**Upload Flow**:
1. Get Firebase ID token: `await auth.currentUser.getIdToken()`
2. Try R2 upload via `uploadWithFallback()`
3. If R2 fails, fallback to Firebase Storage
4. Save to Firestore with `storageBackend` field

### 4. Firestore Schema

Each photo document includes:

```javascript
{
  // Standard fields
  name: "photo.jpg",
  url: "https://photos.pixtr.cloud/users/...",  // Active URL (R2 or Firebase)
  userId: "abc123",
  albumId: "album1",
  storagePath: "users/abc123/album1/...",
  size: 123456,

  // Storage backend tracking
  storageBackend: "r2",  // or "firebase"
  r2Url: "https://photos.pixtr.cloud/users/...",  // R2 URL (if R2)
  firebaseUrl: "https://firebasestorage.googleapis.com/...",  // Firebase URL (if Firebase)

  // ... other fields (EXIF, AI, etc.)
}
```

## Deployment

### 1. Deploy Upload Worker

```bash
cd cloudflare/upload-worker
wrangler deploy --env production
```

This deploys the worker to `upload.pixtr.cloud`.

### 2. Configure Environment

Update `.env`:

```env
VITE_R2_ENABLED=true
VITE_R2_UPLOAD_ENDPOINT=https://upload.pixtr.cloud
VITE_R2_PUBLIC_URL=https://photos.pixtr.cloud
```

### 3. Configure R2 Public Access

Ensure R2 bucket `pixtr-photos` is accessible via custom domain:
1. In Cloudflare Dashboard → R2 → pixtr-photos
2. Settings → Public Access
3. Connect custom domain: `photos.pixtr.cloud`

## Upload Flow Sequence

```
User clicks upload
    ↓
Frontend: useUpload.js - validateFiles()
    ↓
Frontend: useUpload.js - uploadFiles()
    ↓
Frontend: firebase.js - uploadPhoto()
    ↓
Frontend: firebase.js - Get Firebase token
    ↓
Frontend: r2Upload.js - uploadWithFallback()
    ↓
Frontend: r2Upload.js - uploadToR2()
    ↓
HTTP: POST https://upload.pixtr.cloud/upload
    ↓
Worker: Verify Firebase token
    ↓
Worker: Validate userId and storagePath
    ↓
Worker: Upload to R2 (env.PIXTR_PHOTOS.put())
    ↓
Worker: Return { r2Url, storageBackend: "r2" }
    ↓
Frontend: Receive R2 URL
    ↓
Frontend: Save to Firestore with storageBackend="r2"
    ↓
Frontend: Update UI
```

## Error Handling

### R2 Upload Fails

If R2 upload fails (Worker error, network issue, etc.):

1. `uploadToR2()` throws error
2. `uploadWithFallback()` catches error
3. Falls back to Firebase Storage upload
4. Photo saved with `storageBackend: "firebase"`

**Result**: Upload always succeeds (either R2 or Firebase).

### Invalid Token

If Firebase token is invalid or expired:

1. Worker returns 401 Unauthorized
2. Frontend receives error
3. User may need to re-authenticate
4. Upload can be retried after auth refresh

### Permission Denied

If user tries to upload to another user's folder:

1. Worker validates `authenticatedUserId !== requestUserId`
2. Worker returns 403 Forbidden
3. Frontend receives error
4. Upload rejected (security protection)

## Security Considerations

### ✅ Implemented

- Firebase token verification in Worker
- User ID validation (users can only upload to their own folders)
- Storage path validation (prevents `../` attacks)
- CORS restricted to known origins
- R2 credentials never exposed to browser

### 🔒 Future Enhancements

- Implement proper Firebase JWT signature verification using Google's public keys
- Add file size limits in Worker (reject files > 100MB)
- Add file type validation in Worker (prevent malicious uploads)
- Implement rate limiting to prevent abuse
- Add upload quotas per user tier

## Monitoring and Debugging

### Check Worker Logs

```bash
wrangler tail --env production
```

Or in Cloudflare Dashboard:
1. Workers & Pages
2. pixtr-upload-worker-production
3. Logs tab

### Test Upload

```bash
# Get Firebase token
TOKEN="your-firebase-id-token"

# Upload test file
curl -X POST https://upload.pixtr.cloud/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test.jpg" \
  -F "userId=your-user-id" \
  -F "storagePath=users/your-user-id/test/test.jpg" \
  -F "contentType=image/jpeg" \
  -F "albumId=test"
```

### Verify R2 Object

```bash
# List objects in R2
wrangler r2 object list pixtr-photos --prefix users/your-user-id/

# Get object metadata
wrangler r2 object get pixtr-photos users/your-user-id/test/test.jpg --file downloaded.jpg
```

## Comparison: R2 vs Firebase Storage

| Feature | R2 (Cloudflare) | Firebase Storage |
|---------|-----------------|------------------|
| Cost | ~$0.015/GB/month | ~$0.026/GB/month |
| Egress | Free (if on Cloudflare) | $0.12/GB |
| Upload Method | Worker proxy | Direct from browser |
| Authentication | Firebase token → Worker | Firebase SDK |
| CORS | Worker handles | Firebase handles |
| CDN | Cloudflare CDN | Google CDN |
| Custom Domain | ✅ photos.pixtr.cloud | ❌ firebasestorage.googleapis.com |

## Summary

The Worker-based upload architecture is the **only correct way** to upload to R2 from a browser application:

1. ✅ **Secure**: No credentials exposed, proper authentication
2. ✅ **Simple**: Single POST request, no presigned URLs
3. ✅ **Reliable**: Direct R2 access via Worker binding
4. ✅ **Cost-effective**: R2 is cheaper than Firebase Storage
5. ✅ **Performant**: Edge-based upload processing

This architecture ensures that all uploads go to R2 when `VITE_R2_ENABLED=true`, with automatic fallback to Firebase Storage if R2 is unavailable.
