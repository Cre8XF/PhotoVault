# Public Album Photos Missing - Debug & Fix Guide

## Problem Summary
Public albums open correctly but show 0 photos even though photos exist in Firestore with correct `albumId` values.

## Root Causes Identified

### 1. **Firestore Security Rules - Rule Order Issue**
The wildcard rule `match /{document=**}` under `users/{userId}` was potentially overriding the specific `photos/{photoId}` rule.

**Fix:** Move the specific `photos/{photoId}` rule INSIDE the `users/{userId}` block and place it BEFORE the wildcard rule.

### 2. **Security Rule Evaluation with Queries**
When querying with `where()` clauses, Firestore evaluates rules differently. The `get()` call to check if an album is public must succeed for each document in the query result.

**Fix:** Added `exists()` check before `get()` to ensure the album document exists.

### 3. **Missing Error Handling**
The original hook didn't have an error callback for `onSnapshot()`, so permission errors were silent.

**Fix:** Added comprehensive error handling and logging.

## Files Updated

### 1. usePublicAlbum.js (with debug logging)
**Location:** `src/features/qr-sharing/hooks/usePublicAlbum.js`

**Changes:**
- ✅ Added comprehensive console logging at every step
- ✅ Added error callback to `onSnapshot()` to catch permission errors
- ✅ Added validation for `albumData.userId`
- ✅ Log each photo that's returned from query
- ✅ Differentiate between permission errors and other errors

**Debug Output:**
```
🔍 [usePublicAlbum] Starting fetch for slug: doomsday-QjytGu
✅ [usePublicAlbum] Album found: { id: "abc123", userId: "user123", isPublic: true }
🔍 [usePublicAlbum] Querying photos at path: users/user123/photos
🔍 [usePublicAlbum] Filter: albumId == abc123
✅ [usePublicAlbum] Query returned 5 photos
📷 [usePublicAlbum] Photo: { id: "photo1", albumId: "abc123", hasUrl: true }
```

### 2. firestore.rules (fixed)
**Location:** `firestore.rules.fixed`

**Key Changes:**
```javascript
match /users/{userId} {
  // ... user rules ...

  // PHOTOS - Specific rule comes FIRST (before wildcard)
  match /photos/{photoId} {
    // PUBLIC ACCESS
    allow read: if
      resource.data.albumId != null &&
      exists(/databases/$(database)/documents/albums/$(resource.data.albumId)) &&
      get(/databases/$(database)/documents/albums/$(resource.data.albumId)).data.isPublic == true;

    // AUTHENTICATED ACCESS
    allow read, write, update, delete: if isOwner(userId) || isAdmin();
  }

  // WILDCARD - comes LAST
  match /{document=**} {
    allow read: if isAuthenticated();
  }
}
```

**Critical Points:**
1. Specific `photos/{photoId}` rule is INSIDE `users/{userId}` block
2. Public read rule comes FIRST
3. Wildcard `{document=**}` rule comes LAST
4. Added `exists()` check before `get()` for safety

## Testing Steps

### Step 1: Deploy New Rules
```bash
firebase deploy --only firestore:rules
```

### Step 2: Test Public Album Access
1. Open browser console (F12)
2. Navigate to a public album URL: `http://localhost:3000/share/doomsday-QjytGu`
3. Watch console for debug output

### Step 3: Interpret Console Output

#### ✅ SUCCESS - Expected Output:
```
🔍 [usePublicAlbum] Starting fetch for slug: doomsday-QjytGu
✅ [usePublicAlbum] Album found: { id: "...", userId: "...", isPublic: true }
🔍 [usePublicAlbum] Querying photos at path: users/.../photos
🔍 [usePublicAlbum] Filter: albumId == ...
✅ [usePublicAlbum] Query returned X photos
📷 [usePublicAlbum] Photo: { ... }
✅ [usePublicAlbum] Setting X photos in state
```

#### ❌ PERMISSION ERROR:
```
❌ [usePublicAlbum] Snapshot error: FirebaseError: Missing or insufficient permissions
Error code: permission-denied
```
**Action:** Check Firestore rules, ensure they're deployed correctly

#### ❌ NO PHOTOS RETURNED:
```
✅ [usePublicAlbum] Query returned 0 photos
```
**Possible causes:**
1. No photos actually have matching `albumId`
2. Album has no `userId` field
3. Photos are in wrong collection path

### Step 4: Verify Firestore Data Structure

Check in Firebase Console that your data matches:

**Albums Collection** (`albums/{albumId}`):
```json
{
  "id": "abc123",
  "userId": "user123",
  "name": "Doomsday",
  "isPublic": true,
  "publicSlug": "doomsday-QjytGu",
  "publicSettings": {
    "allowUpload": false,
    "expiresAt": null
  }
}
```

**Photos Collection** (`users/{userId}/photos/{photoId}`):
```json
{
  "id": "photo1",
  "albumId": "abc123",  // Must match album.id
  "userId": "user123",  // Should match album.userId
  "url": "https://...",
  "createdAt": { "_seconds": 1234567890 }
}
```

### Step 5: Verify Firestore Indexes

Required index:
- **Collection:** `users/{userId}/photos`
- **Fields:** `albumId` (Ascending/Descending) + `createdAt` (Descending)

If missing, Firestore will show an error with a link to create the index.

## Common Issues & Solutions

### Issue 1: "permission-denied" error
**Cause:** Security rules not allowing read access
**Solution:**
1. Deploy the fixed rules: `firebase deploy --only firestore:rules`
2. Wait 1-2 minutes for rules to propagate
3. Test again

### Issue 2: Query returns 0 photos but photos exist
**Cause:** Data mismatch between `album.id` and `photo.albumId`
**Solution:**
1. Check console logs for exact IDs
2. Verify in Firestore Console that `photo.albumId` matches `album.id`
3. Check that photos are at path `users/{album.userId}/photos`

### Issue 3: "Album has no userId field"
**Cause:** Old albums created before `userId` field was added
**Solution:**
1. Add `userId` field to all albums in Firestore
2. Or modify query to handle albums without `userId`

### Issue 4: Index not found
**Cause:** Missing Firestore composite index
**Solution:**
1. Click the link in the error message to create index
2. Or create manually in Firebase Console → Firestore → Indexes
3. Wait for index to build (can take a few minutes)

## Quick Verification Checklist

Before debugging, verify:
- [ ] Album has `userId` field
- [ ] Album has `isPublic: true`
- [ ] Album has `publicSlug` field
- [ ] Photos exist at `users/{userId}/photos/{photoId}`
- [ ] Photos have `albumId` field matching album ID
- [ ] Firestore rules deployed
- [ ] Firestore index exists for photos collection
- [ ] No console errors when opening public URL

## Manual Firestore Query Test

Test the query directly in Firestore Console:

1. Go to Firebase Console → Firestore
2. Navigate to `users/{userId}/photos`
3. Add filter: `albumId == {your-album-id}`
4. Check if photos are returned

If no photos returned: Data structure issue
If photos returned: Security rules issue

## Next Steps

1. **Deploy the fixed rules** to Firebase
2. **Test with debug logging** enabled (it's in the new usePublicAlbum.js)
3. **Share console output** if still having issues
4. **Verify data structure** in Firestore Console matches expected format

## Contact/Debug Help

If issues persist after trying these fixes, share:
1. Complete console output from public album page
2. Screenshot of album document in Firestore Console
3. Screenshot of photos collection in Firestore Console
4. Current firestore.rules file
