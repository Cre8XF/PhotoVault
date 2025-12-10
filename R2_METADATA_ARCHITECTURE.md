# 🔥 Pixtr R2 Metadata Architecture - CRITICAL DEPLOYMENT GUIDE

## 📋 Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Critical Requirements](#critical-requirements)
3. [Deployment Checklist](#deployment-checklist)
4. [Troubleshooting](#troubleshooting)
5. [Architecture Diagrams](#architecture-diagrams)

---

## 🏗️ Architecture Overview

Pixtr uses **Cloudflare R2 as the SINGLE SOURCE OF TRUTH** for all metadata (albums, photos, settings).

### ✅ CORRECT ARCHITECTURE

```
┌─────────────────────────────────────────────────────────────┐
│                      PIXTR ARCHITECTURE                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Frontend (Vite + React)                                     │
│       │                                                      │
│       ├─── useAuth hook ──────────────────────┐            │
│       │    (on login: load metadata from R2)  │            │
│       │                                         │            │
│       ├─── Zustand Store ────────────────────┐│            │
│       │    albums: []                         ││            │
│       │    photos: []                         ││            │
│       │    loadMetadata() ───────────────────┼┼──────┐    │
│       │    saveMetadata() ───────────────────┼┼──────┤    │
│       │                                       ││      │    │
│       └─── MetadataService ──────────────────┼┼──────┤    │
│            GET/POST to Worker API             ││      │    │
│                                               ││      │    │
└───────────────────────────────────────────────┼┼──────┼────┘
                                                ││      │
                    ┌───────────────────────────┘│      │
                    │                            │      │
                    ▼                            ▼      ▼
        ┌─────────────────────────────────────────────────┐
        │      Cloudflare Worker (metadata-worker)        │
        ├─────────────────────────────────────────────────┤
        │  GET  /api/metadata?userId={uid}                │
        │  POST /api/metadata                             │
        │                                                  │
        │  ✅ Validates Firebase ID tokens                │
        │  ✅ Enforces user can only access own data      │
        │  ✅ Reads from: pixtr-metadata/{uid}.json       │
        │  ✅ Writes to: pixtr-metadata/{uid}.json        │
        └──────────────────┬──────────────────────────────┘
                           │
                           ▼
        ┌──────────────────┬──────────────────────────┐
        │                  │                          │
        ▼                  ▼                          │
┌──────────────────┐  ┌──────────────────────────┐  │
│  R2: pixtr-photos│  │  R2: pixtr-metadata      │◄─┘
│  (Photo Files)   │  │  (Metadata JSON)  ⭐      │
├──────────────────┤  ├──────────────────────────┤
│                  │  │                          │
│ users/           │  │ {uid}.json               │
│  ├─{uid}/        │  │ {uid2}.json              │
│    ├─{albumId}/  │  │ {uid3}.json              │
│      └─photos    │  │                          │
│                  │  │                          │
└──────────────────┘  └──────────────────────────┘
  PIXTR_STORAGE         PIXTR_METADATA
  (binding)             (binding) ⭐
```

### 🔴 WHAT CHANGED FROM OLD ARCHITECTURE

| Component | OLD (WRONG) | NEW (CORRECT) |
|-----------|-------------|---------------|
| **Metadata Source** | Firestore collections | R2 JSON files |
| **Metadata Location** | `albums/` and `photos/` collections | `pixtr-metadata/{uid}.json` |
| **Worker Storage** | KV namespace | R2 bucket |
| **Frontend Loading** | Query Firestore on every page load | Load once from R2 on login |
| **Metadata Sync** | Real-time listeners | Explicit save on changes |

### 📊 Data Flow

#### Login Flow
```
1. User logs in via Firebase Auth
2. useAuth hook calls loadMetadata(userId, idToken)
3. Zustand store calls MetadataService.loadMetadata()
4. MetadataService fetches Worker: GET /api/metadata?userId={uid}
5. Worker verifies Firebase token
6. Worker reads R2: pixtr-metadata/{uid}.json
7. Worker returns metadata JSON
8. Zustand hydrates albums/photos from metadata
9. UI shows albums/photos
```

#### Update Flow (e.g., upload photo, create album, etc.)
```
1. User performs action (upload, rename, delete)
2. Frontend updates Zustand store optimistically
3. Frontend calls saveMetadata() (debounced 2s)
4. MetadataService POSTs to Worker: POST /api/metadata
5. Worker verifies Firebase token
6. Worker writes R2: pixtr-metadata/{uid}.json
7. Worker returns success
8. Frontend also syncs to Firestore for search/access control
```

---

## 🚨 CRITICAL REQUIREMENTS

### 1. **Environment Variable: VITE_METADATA_API_URL**

**CRITICAL:** This MUST be set in your production build environment.

```bash
# .env.production
VITE_METADATA_API_URL=https://www.pixtr.cloud
```

**For Netlify:**
- Go to: Site Settings → Environment Variables
- Add: `VITE_METADATA_API_URL` = `https://www.pixtr.cloud`
- **REBUILD** your site after adding this

**Symptoms if missing:**
- ❌ Metadata returns empty `{ albums: {}, photos: {} }`
- ❌ Albums/photos appear as 0 after refresh
- ❌ Console shows: `"VITE_METADATA_API_URL is NOT SET"`

### 2. **Cloudflare Worker Deployment**

The Worker MUST be deployed and accessible at:
```
https://www.pixtr.cloud/api/metadata
```

**Check deployment:**
```bash
cd cloudflare/metadata-worker
wrangler deploy
```

**Test Worker:**
```bash
curl -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  "https://www.pixtr.cloud/api/metadata?userId=YOUR_USER_ID"
```

### 3. **R2 Bucket Configuration**

**CRITICAL: Pixtr uses TWO SEPARATE R2 buckets:**

1. **`pixtr-photos`** - Stores photo/video files
2. **`pixtr-metadata`** - Stores metadata JSON files (SEPARATE!)

**Bucket 1: pixtr-photos**
```
pixtr-photos/
└── users/{userId}/{albumId}/{photo-files}
```

**Bucket 2: pixtr-metadata** ⭐
```
pixtr-metadata/
├── {userId}.json
├── {userId2}.json
└── {userId3}.json
```

**Create both buckets:**
```bash
wrangler r2 bucket create pixtr-photos
wrangler r2 bucket create pixtr-metadata
```

**IMPORTANT:** The Worker uses TWO bindings:
- `PIXTR_STORAGE` → `pixtr-photos` (photo files)
- `PIXTR_METADATA` → `pixtr-metadata` (metadata JSON)

### 4. **Firebase Authentication**

Worker validates Firebase ID tokens. Ensure:
- ✅ Firebase Auth is configured
- ✅ Tokens are valid and not expired
- ✅ User is authenticated before metadata loads

---

## ✅ DEPLOYMENT CHECKLIST

### Frontend Deployment (Netlify)

- [ ] Set `VITE_METADATA_API_URL=https://www.pixtr.cloud` in Netlify environment variables
- [ ] Trigger new build to pick up environment variable
- [ ] Verify build logs show: `VITE_METADATA_API_URL: https://www.pixtr.cloud`
- [ ] Check browser console for: `"🟢 [MetadataService] PROD MODE: Cloudflare metadata backend ENABLED"`

### Worker Deployment (Cloudflare)

- [ ] Create BOTH R2 buckets: `pixtr-photos` AND `pixtr-metadata`
- [ ] Update `wrangler.toml` with TWO R2 bucket bindings (PIXTR_STORAGE, PIXTR_METADATA)
- [ ] Update routes to match actual domain: `pixtr.cloud/api/*` and `www.pixtr.cloud/api/*`
- [ ] Deploy worker: `wrangler deploy --env production`
- [ ] Verify worker URL: `https://www.pixtr.cloud/api/metadata`
- [ ] Test GET endpoint with valid Firebase token
- [ ] Test POST endpoint with valid metadata payload
- [ ] Check worker logs for successful read/write to pixtr-metadata bucket

### R2 Bucket Setup

- [ ] Create R2 bucket for photos: `wrangler r2 bucket create pixtr-photos`
- [ ] Create R2 bucket for metadata: `wrangler r2 bucket create pixtr-metadata`
- [ ] Bind BOTH buckets to worker in `wrangler.toml`:
  - `PIXTR_STORAGE` → `pixtr-photos`
  - `PIXTR_METADATA` → `pixtr-metadata`
- [ ] Verify bucket permissions allow worker to read/write
- [ ] Test metadata save creates `{userId}.json` in pixtr-metadata bucket

### Firestore Rules (Minimal)

Firestore is NO LONGER the metadata source but is still used for:
- Search indexing
- Access control
- Album/photo document storage (for backward compatibility)

```javascript
// Firestore rules - albums/photos are read-only via metadata
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /albums/{albumId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.userId;
    }
    match /photos/{photoId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.ownerId;
    }
  }
}
```

---

## 🐛 TROUBLESHOOTING

### Problem: Albums/Photos show 0 after refresh

**Symptoms:**
- Albums appear after login but disappear after page refresh
- Console shows: `"albums: {}, photos: {}"`

**Root Causes:**

1. **Missing VITE_METADATA_API_URL**
   ```
   Check console for:
   ❌ [MetadataService] VITE_METADATA_API_URL is NOT SET!

   Fix:
   - Add VITE_METADATA_API_URL to Netlify env vars
   - Rebuild site
   ```

2. **Worker not deployed or unreachable**
   ```
   Check console for:
   ❌ [MetadataService] Failed to load metadata: 404 Not Found

   Fix:
   - Deploy worker: wrangler deploy
   - Verify URL: https://www.pixtr.cloud/api/metadata
   ```

3. **Firebase token expired or invalid**
   ```
   Check console for:
   ❌ [MetadataService] Failed to load metadata: 401 Unauthorized

   Fix:
   - Log out and log back in to get fresh token
   - Check Firebase Auth configuration
   ```

4. **Metadata file doesn't exist in R2**
   ```
   Check worker logs for:
   ✅ Loaded metadata from R2 for user {userId}
   OR
   ⚠️ No metadata found for user {userId}, returning empty metadata

   Fix:
   - Verify pixtr-metadata bucket exists: wrangler r2 bucket list
   - Trigger metadata save by creating/modifying album
   - Check R2 bucket: wrangler r2 object list pixtr-metadata
   - Verify {userId}.json file exists in pixtr-metadata bucket
   ```

5. **Wrong R2 bucket being used**
   ```
   Symptom:
   - Metadata saves but isn't found on next load
   - Worker logs show "pixtr-photos" instead of "pixtr-metadata"

   Fix:
   - Verify Worker uses env.PIXTR_METADATA (not env.PIXTR_STORAGE)
   - Check wrangler.toml has BOTH bucket bindings
   - Redeploy worker: wrangler deploy --env production
   ```

### Problem: Worker returns 401 Unauthorized

**Root Cause:** Firebase token validation failing

**Fix:**
1. Check token is being sent: `Authorization: Bearer {token}`
2. Verify token is valid (not expired)
3. Check worker logs for token decode errors

### Problem: Changes not persisting across devices

**Root Cause:** Metadata not saving to R2

**Fix:**
1. Check console for: `"💾 [MetadataService] Metadata saved successfully!"`
2. Verify POST /api/metadata is being called
3. Check worker logs for save errors
4. Verify R2 write permissions

---

## 📊 Architecture Diagrams

### R2 Bucket Structure

**Bucket: pixtr-metadata**
```
pixtr-metadata/
├── user123.json          # Metadata for user123
├── user456.json          # Metadata for user456
└── user789.json          # Metadata for user789
```

**Bucket: pixtr-photos**
```
pixtr-photos/
└── users/
    ├── user123/
    │   ├── vacation-2024/
    │   │   ├── photo1.jpg
    │   │   └── photo2.jpg
    │   └── family/
    │       └── photo3.jpg
    └── user456/
        └── ...
```

### Metadata Structure (R2 JSON)

Each `{userId}.json` file contains:

```json
{
  "version": "1.0",
  "userId": "firebase-user-id",
  "lastUpdated": "2025-12-09T10:30:00.000Z",
  "photos": {
    "photo-id-1": {
      "id": "photo-id-1",
      "name": "sunset.jpg",
      "albumId": "album-id-1",
      "url": "https://...",
      "storagePath": "users/{uid}/album1/sunset.jpg",
      "size": 2048576,
      "type": "image/jpeg",
      "favorite": false,
      "createdAt": "2025-12-08T10:00:00.000Z"
    }
  },
  "albums": {
    "album-id-1": {
      "id": "album-id-1",
      "name": "Vacation 2025",
      "userId": "firebase-user-id",
      "cover": "https://...",
      "photoCount": 15,
      "createdAt": "2025-12-08T09:00:00.000Z"
    }
  },
  "settings": {
    "language": "no",
    "theme": "dark",
    "autoCompress": false
  }
}
```

### API Endpoints

#### GET /api/metadata?userId={uid}
```
Request:
  Headers:
    Authorization: Bearer {firebase-id-token}
  Query:
    userId: {firebase-user-id}

Response:
  200 OK:
    {
      "version": "1.0",
      "userId": "...",
      "albums": {...},
      "photos": {...}
    }

  401 Unauthorized:
    { "error": "Invalid or expired token" }

  403 Forbidden:
    { "error": "Cannot access other user metadata" }
```

#### POST /api/metadata
```
Request:
  Headers:
    Authorization: Bearer {firebase-id-token}
    Content-Type: application/json
  Body:
    {
      "userId": "...",
      "version": "1.0",
      "albums": {...},
      "photos": {...},
      "settings": {...}
    }

Response:
  200 OK:
    {
      "version": "1.0",
      "userId": "...",
      "lastUpdated": "2025-12-09T10:30:00.000Z",
      ...
    }

  401 Unauthorized:
    { "error": "Invalid or expired token" }

  403 Forbidden:
    { "error": "Cannot save metadata for other users" }
```

---

## 🎯 Key Takeaways

1. **TWO SEPARATE R2 buckets** - `pixtr-photos` for files, `pixtr-metadata` for JSON
2. **R2 is the ONLY metadata source** - Firestore is for search/access only
3. **VITE_METADATA_API_URL MUST be set** in production builds
4. **Metadata loads ONCE on login** from R2 via Worker
5. **Metadata saves are DEBOUNCED** (2s) and sent to R2 via Worker
6. **Worker validates ALL requests** with Firebase ID tokens
7. **Each user has ONE JSON file** in pixtr-metadata bucket: `{uid}.json`
8. **Worker uses TWO bindings** - `PIXTR_STORAGE` and `PIXTR_METADATA`

---

## 📝 Migration Notes

### Migrating from KV to R2

If migrating from KV-based metadata:

1. **Export metadata from KV:**
   ```bash
   # List all KV keys
   wrangler kv:key list --namespace-id={KV_ID}

   # Export each user's metadata
   wrangler kv:key get "user:{userId}" --namespace-id={KV_ID} > {userId}.json
   ```

2. **Upload to R2 pixtr-metadata bucket:**
   ```bash
   # For each user
   wrangler r2 object put pixtr-metadata/{userId}.json \
     --file={userId}.json
   ```

3. **Verify migration:**
   ```bash
   # List all metadata files
   wrangler r2 object list pixtr-metadata
   ```

4. **Remove KV binding** from wrangler.toml after migration complete

### Migrating from pixtr-photos/pixtr-metadata/ to pixtr-metadata/

If you previously stored metadata in `pixtr-photos/pixtr-metadata/{userId}.json`:

1. **List all metadata files:**
   ```bash
   wrangler r2 object list pixtr-photos --prefix="pixtr-metadata/"
   ```

2. **Copy to new bucket:**
   ```bash
   # For each file
   wrangler r2 object get pixtr-photos/pixtr-metadata/{userId}.json > {userId}.json
   wrangler r2 object put pixtr-metadata/{userId}.json --file={userId}.json
   ```

3. **Verify migration:**
   ```bash
   wrangler r2 object list pixtr-metadata
   ```

4. **Clean up old files** (optional):
   ```bash
   wrangler r2 object delete pixtr-photos/pixtr-metadata/{userId}.json
   ```

---

## 🆘 Support

If issues persist:

1. Check browser console for detailed error logs
2. Check Cloudflare Worker logs
3. Verify R2 bucket structure
4. Test Worker endpoints manually with curl
5. Check Netlify build logs for environment variable injection

**Last Updated:** 2025-12-09
**Architecture Version:** 2.0 (R2-based)
