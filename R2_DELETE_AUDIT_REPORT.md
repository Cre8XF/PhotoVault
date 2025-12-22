# R2 Delete Implementation - Audit Report
**Date:** 2025-12-22
**Status:** ⚠️ CRITICAL ISSUE CONFIRMED - R2 files are NOT being deleted

---

## 🎯 EXECUTIVE SUMMARY

**Finding:** Photo deletion currently **does NOT delete files from Cloudflare R2**.
**Impact:** Orphaned files accumulate in R2, causing storage leakage and incorrect usage reporting.
**Root Cause:** Delete function attempts to delete from Firebase Storage (legacy), not R2.

---

## 📋 AUDIT FINDINGS

### A. Where Delete is Initiated

**Location:** `src/firebase.js:563`
```javascript
export async function deletePhoto(photoId, storagePath) {
  // ...
}
```

**Callers:**
- `src/pages/PhotoPage.jsx:217` - Main photo viewer delete
- Other pages (AlbumPage, SearchPage, etc.)

**Call Pattern:**
```javascript
await firebaseDeletePhoto(photo.id, photo.storagePath)
```

---

### B. What Data is Available

**Photo Object Structure** (`src/firebase.js:973-1021`):

✅ **Available:**
- `r2Url` - Full R2 public URL (e.g., `https://images.pixtr.cloud/users/{userId}/...`)
- `storageBackend: 'r2'` - Indicates R2 storage
- `url` - Same as r2Url

❌ **NOT Available:**
- `storagePath` - NOT saved to Firestore (calculated at upload, then discarded)
- `r2Key` - Does not exist
- `r2Path` - Does not exist

**Example r2Url:**
```
https://images.pixtr.cloud/users/abc123/photos/1734908765432_image.jpg
```

**Extractable storagePath from r2Url:**
```
users/abc123/photos/1734908765432_image.jpg
```

---

### C. Current Backend/Worker Capabilities

**Upload Worker:** `cloudflare/upload-worker/upload-worker.js`

✅ **Supports:**
- `POST /upload` - Uploads file to R2 bucket `PIXTR_USERS`
- Firebase token authentication
- User ownership verification
- R2 bucket binding: `env.PIXTR_USERS`

❌ **Does NOT Support:**
- DELETE operation (endpoint does not exist)

**Authentication:**
- Uses Firebase ID token (Bearer token)
- Verifies token matches userId
- Validates storagePath starts with `users/{userId}/`

---

### D. Security Model

✅ **Confirmed Secure:**
- Clients do NOT have direct R2 credentials
- All R2 operations go through Worker
- Worker verifies Firebase token
- Worker ensures user can only access own files (`storagePath.startsWith(\`users/${userId}/\`)`)

✅ **Delete Security Requirements:**
- Must verify Firebase token
- Must check userId matches storagePath owner
- Must validate storagePath format
- Must be idempotent (handle already-deleted files)

---

## 🔍 CURRENT IMPLEMENTATION ISSUES

### Issue 1: Deletes from Firebase Storage, Not R2

**Code:** `src/firebase.js:575-578`
```javascript
if (storagePath) {
  console.log('🔥 Deleting from Storage:', storagePath)
  const storageRef = ref(storage, storagePath)  // ❌ Firebase Storage
  await deleteObject(storageRef)                 // ❌ Not R2!
}
```

**Problem:**
- Attempts to delete from Firebase Storage
- R2 files are **never deleted**
- Firebase Storage delete will fail silently (file doesn't exist there)

---

### Issue 2: storagePath Not Saved to Firestore

**Upload Code:** `src/firebase.js:945`
```javascript
const storagePath = `users/${userId}/${folderPath}/${timestamp}_${safeName}`
// ... upload happens ...
// ❌ storagePath is NEVER saved to photoData
```

**Problem:**
- storagePath is calculated at upload but not saved
- Delete calls receive `photo.storagePath` which is `undefined`
- This causes the delete to skip storage deletion entirely

---

### Issue 3: No Worker DELETE Endpoint

**Upload Worker:** `cloudflare/upload-worker/upload-worker.js:44-46`
```javascript
if (path === '/upload' && request.method === 'POST') {
  return await handleUpload(request, env, corsHeaders)
}
// ❌ No /delete endpoint
```

**Problem:**
- Worker only supports uploads
- No endpoint to delete R2 objects
- Cannot delete from R2 without adding DELETE endpoint

---

## ✅ REQUIRED CHANGES

### 1. Add DELETE Endpoint to Worker

**File:** `cloudflare/upload-worker/upload-worker.js`

**Add Route:**
```javascript
if (path === '/delete' && request.method === 'POST') {
  return await handleDelete(request, env, corsHeaders)
}
```

**Add Handler:**
```javascript
async function handleDelete(request, env, corsHeaders) {
  // 1. Verify Firebase token
  // 2. Extract storagePath from request
  // 3. Verify user owns the file (storagePath starts with users/{userId}/)
  // 4. Delete from R2: await env.PIXTR_USERS.delete(storagePath)
  // 5. Return success (idempotent - success even if file doesn't exist)
}
```

---

### 2. Update Frontend Delete Function

**File:** `src/firebase.js:563`

**Current Flow:**
```
deletePhoto(photoId, storagePath) →
  1. Delete from Firebase Storage ❌
  2. Delete Firestore document ✅
```

**New Flow:**
```
deletePhoto(photoId, photo) →
  1. Extract storagePath from photo.r2Url
  2. Call Worker DELETE endpoint with storagePath
  3. On success → Delete Firestore document
  4. On failure → Abort and surface error
```

---

### 3. Add Helper to Extract storagePath from r2Url

**File:** `src/utils/r2Upload.js` (new function)

```javascript
/**
 * Extract R2 storagePath from r2Url
 * @param {string} r2Url - Full R2 URL (e.g., https://images.pixtr.cloud/users/abc/photo.jpg)
 * @returns {string} - storagePath (e.g., users/abc/photo.jpg)
 */
export function extractStoragePathFromR2Url(r2Url) {
  if (!r2Url) return null

  // Remove base URL to get path
  const url = new URL(r2Url)
  return url.pathname.substring(1) // Remove leading /
}
```

---

## 🚨 EDGE CASES TO HANDLE

### Case 1: File Already Deleted from R2
**Solution:** Worker DELETE returns success (idempotent)
```javascript
const obj = await env.PIXTR_USERS.delete(storagePath)
// R2.delete() is already idempotent - no error if file missing
return success
```

### Case 2: Network Failure During Delete
**Solution:** Don't delete Firestore if R2 delete fails
```javascript
try {
  await deleteFromR2(storagePath)
} catch (err) {
  throw new Error('Failed to delete from R2, Firestore NOT deleted')
}
```

### Case 3: Firestore Delete Fails After R2 Delete
**Solution:** Acceptable orphan (Firestore metadata more critical than R2 file)
- User can retry delete to clean up Firestore
- R2 file already gone (no storage leak)

### Case 4: Legacy Photos (No r2Url)
**Solution:** Check for `r2Url` presence
```javascript
if (!photo.r2Url && !photo.storagePath) {
  console.warn('Photo has no R2 data, skipping R2 delete')
  // Only delete Firestore
}
```

### Case 5: Edited Photos
**Solution:** Delete both original and edited versions
- Check for `editedUrl`, `enhancedUrl`, `thumbnailUrl`
- Extract paths and delete all versions

---

## 📊 IMPLEMENTATION PLAN

### Phase 1: Worker DELETE Endpoint
1. Add `handleDelete` function to upload-worker.js
2. Verify Firebase token
3. Validate storagePath ownership
4. Delete from R2 (idempotent)
5. Deploy worker

### Phase 2: Frontend Delete Update
1. Add `extractStoragePathFromR2Url` helper
2. Update `deletePhoto` to call Worker DELETE
3. Handle errors properly (don't orphan Firestore)
4. Test with various photo types

### Phase 3: Testing
1. Test normal delete flow
2. Test already-deleted files (idempotency)
3. Test network failures
4. Test legacy photos (no r2Url)
5. Test edited photos (multiple files)

---

## ✅ SUCCESS CRITERIA

After implementation:
- ✅ Deleting a photo removes Firestore document
- ✅ Deleting a photo removes R2 object
- ✅ No orphaned files remain in R2
- ✅ Storage usage reflects reality
- ✅ Delete is idempotent (safe to retry)
- ✅ Delete is secure (user can only delete own files)
- ✅ Errors are handled gracefully

---

## ⚠️ RISKS & MITIGATIONS

| Risk | Mitigation |
|------|------------|
| Worker deployment fails | Deploy during off-peak hours, have rollback plan |
| Legacy photos break delete | Add fallback logic for photos without r2Url |
| R2 delete fails | Don't delete Firestore, show error to user |
| Partial delete (R2 success, Firestore fail) | Acceptable - user can retry |

---

## 🎯 RECOMMENDATION

**Proceed with implementation:** All assumptions verified, architecture is sound.

**Key Points:**
- Worker DELETE endpoint needed
- Extract storagePath from r2Url
- Maintain delete order: R2 first, then Firestore
- Make it idempotent and secure

**Estimated Effort:** 2-3 hours
**Complexity:** Medium
**Risk:** Low (with proper testing)

---

**End of Audit Report**
