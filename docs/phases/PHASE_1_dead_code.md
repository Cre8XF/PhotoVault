# Phase 1: Remove Dead Code

## 🎯 Goal

Remove unused code that causes confusion and makes maintenance harder.

## ⏱️ Estimate: 30 minutes

## 📝 Changes

### 1. Delete entire file: `src/utils/deletePhoto.js`

**Reason:** File is never imported or used. All delete functionality is in `firebase.js`.

```bash
rm src/utils/deletePhoto.js
```

### 2. Remove unused functions in `src/hooks/usePhotoData.js`

**Find and delete these functions (if they exist):**

- `handleAlbumCreate` (not used, creation handled in UploadModal)
- `handlePhotoDelete` (if duplicate of deletePhoto in firebase.js)

**Search for:**
```javascript
const handleAlbumCreate = 
const handlePhotoDelete = 
```

If function is never returned in hook return value → delete it.

### 3. Clean up `firestore.rules`

**Remove unused nested path for albums:**

```javascript
// REMOVE THIS (app uses /albums, not /users/{userId}/albums)
match /users/{userId} {
  match /albums/{albumId} {
    allow read: if isAuthenticated();
    allow create: if isOwner(userId) || isAdmin();
    allow update, delete: if isOwner(userId) || isAdmin();
  }
}
```

**Keep only top-level `/albums` rules:**

```javascript
// /{collection}/{docId} already matches /albums
match /{collection}/{docId} {
  allow read: if isAuthenticated();
  allow create: if isOwnerOnCreate() || isAdmin();
  allow update, delete: if isAdmin() || isOwner(resource.data.userId);
}
```

## 🧪 Testing

After changes:

```bash
# 1. Build app
npm start

# 2. Check console
# ✅ No import errors
# ✅ No "Cannot find module" errors

# 3. Test basic functionality
```

**Checklist:**
- [ ] App starts without errors
- [ ] Can log in
- [ ] Can view albums
- [ ] Can view photos
- [ ] No red text in console

## 📦 Commit

When testing OK:

```bash
git add .
git commit -m "chore: remove dead code (deletePhoto.js, unused functions, redundant rules)"
git push
```

## 🎯 Expected Result

- ✅ ~200 lines of code removed
- ✅ Clearer file structure
- ✅ Easier to navigate codebase
- ✅ No functional changes (everything works as before)

## ⚠️ If Something Goes Wrong

### Problem: "Cannot find module 'deletePhoto'"

**Solution:** A component still imports the deleted file. Search:

```bash
grep -r "deletePhoto" src/
```

Remove the import from the complaining file.

### Problem: Firestore rules deployment fails

**Solution:** 

```bash
firebase deploy --only firestore:rules --debug
```

Read error message and fix syntax error in `firestore.rules`.

---

**✅ PHASE 1 COMPLETE → GO TO PHASE 2**
