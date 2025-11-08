# Phase 3: Add Reentrancy Guards

## 🎯 Goal

Protect against duplicate writes caused by:
- Rapid clicking (user clicks multiple times quickly)
- React StrictMode (double-render in dev mode)
- Asynchronous race conditions

## ⏱️ Estimate: 1-2 hours

## 🔴 Problem Being Solved

**Scenario:**
```
User clicks "Create Album" → call starts
User clicks again (impatient) → call 2 starts
Both calls complete → 2 albums in Firestore ❌
```

**Solution:**
```
User clicks "Create Album" → guard activates
User clicks again → rejected (guard active)
First call completes → guard deactivates ✅
```

## 📝 Changes

### Modify `src/hooks/usePhotoData.js`

**Add state variables at top of hook:**

```javascript
const usePhotoData = (user) => {
  const [photos, setPhotos] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // NEW GUARDS:
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  
  // ... rest of code
```

### Add guard pattern to all mutations:

#### 1. handleAlbumSave

**Before:**
```javascript
const handleAlbumSave = useCallback(async (albumData, editingAlbum = null) => {
  try {
    if (!editingAlbum) {
      console.error('handleAlbumSave called without editingAlbum');
      throw new Error('Use UploadModal for creation');
    }

    await updateAlbum(editingAlbum.id, albumData);
    setNotification({
      message: t('common:notifications.albumUpdated'),
      type: 'success'
    });
    await refreshData();
  } catch (err) {
    console.error('Album save error:', err);
    setNotification({
      message: t('common:notifications.albumSaveError'),
      type: 'error'
    });
  }
}, [refreshData, setNotification, t]);
```

**After:**
```javascript
const handleAlbumSave = useCallback(async (albumData, editingAlbum = null) => {
  // GUARD: Check if already in progress
  if (isSaving) {
    console.warn('Album save already in progress, ignoring duplicate call');
    return;
  }

  setIsSaving(true);
  
  try {
    if (!editingAlbum) {
      console.error('handleAlbumSave called without editingAlbum');
      throw new Error('Use UploadModal for creation');
    }

    await updateAlbum(editingAlbum.id, albumData);
    setNotification({
      message: t('common:notifications.albumUpdated'),
      type: 'success'
    });
    await refreshData();
  } catch (err) {
    console.error('Album save error:', err);
    setNotification({
      message: t('common:notifications.albumSaveError'),
      type: 'error'
    });
    throw err; // Re-throw for component error handling
  } finally {
    setIsSaving(false); // Always release guard
  }
}, [isSaving, refreshData, setNotification, t]);
```

#### 2. handleUpload

```javascript
const handleUpload = useCallback(async (files, albumId = null) => {
  if (isUploading) {
    console.warn('Upload already in progress');
    return;
  }

  setIsUploading(true);
  
  try {
    // ... existing upload logic
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  } finally {
    setIsUploading(false);
  }
}, [isUploading, user?.uid, refreshData, setNotification, t]);
```

#### 3. handleDeleteAlbum

```javascript
const handleDeleteAlbum = useCallback(async (albumId) => {
  if (isDeleting) {
    console.warn('Delete already in progress');
    return;
  }

  setIsDeleting(true);
  
  try {
    await deleteAlbum(albumId);
    setNotification({
      message: t('common:notifications.albumDeleted'),
      type: 'success'
    });
    await refreshData();
  } catch (error) {
    console.error('Delete album error:', error);
    setNotification({
      message: t('common:notifications.albumDeleteError'),
      type: 'error'
    });
    throw error;
  } finally {
    setIsDeleting(false);
  }
}, [isDeleting, refreshData, setNotification, t]);
```

#### 4. handleDeletePhoto

```javascript
const handleDeletePhoto = useCallback(async (photoId) => {
  if (isDeleting) {
    console.warn('Delete already in progress');
    return;
  }

  setIsDeleting(true);
  
  try {
    await deletePhoto(photoId);
    setNotification({
      message: t('common:notifications.photoDeleted'),
      type: 'success'
    });
    await refreshData();
  } catch (error) {
    console.error('Delete photo error:', error);
    setNotification({
      message: t('common:notifications.photoDeleteError'),
      type: 'error'
    });
    throw error;
  } finally {
    setIsDeleting(false);
  }
}, [isDeleting, refreshData, setNotification, t]);
```

#### 5. toggleFavorite

```javascript
const toggleFavorite = useCallback(async (photoId) => {
  if (isTogglingFavorite) {
    console.warn('Toggle favorite already in progress');
    return;
  }

  setIsTogglingFavorite(true);
  
  try {
    const photo = photos.find(p => p.id === photoId);
    if (!photo) throw new Error('Photo not found');
    
    await toggleFavoriteFirebase(photoId, !photo.isFavorite);
    await refreshData();
  } catch (error) {
    console.error('Toggle favorite error:', error);
    setNotification({
      message: t('common:notifications.favoriteError'),
      type: 'error'
    });
    throw error;
  } finally {
    setIsTogglingFavorite(false);
  }
}, [isTogglingFavorite, photos, refreshData, setNotification, t]);
```

### Update return statement

```javascript
return {
  photos,
  albums,
  loading,
  refreshData,
  handleUpload,
  handleAlbumSave,
  handleDeleteAlbum,
  handleDeletePhoto,
  toggleFavorite,
  // Export guards for UI feedback:
  isSaving,
  isDeleting,
  isUploading,
  isTogglingFavorite
};
```

## 🎨 (Optional) UI Feedback

Use guard states to disable buttons:

```javascript
// In UploadModal.jsx:
const { handleUpload, isUploading } = usePhotoData(user);

<button 
  onClick={handleSubmit}
  disabled={isUploading}
>
  {isUploading ? 'Uploading...' : 'Upload'}
</button>
```

## 🧪 Testing

### Test 1: Rapid Click Protection
```
1. Open UploadModal
2. Select files
3. Click "Upload" multiple times rapidly (3-5 times)
4. ✅ Check Firestore → only 1 set of files
5. ✅ Console shows "Upload already in progress" warnings
```

### Test 2: StrictMode Compatibility
```
1. Ensure StrictMode is enabled in index.js:
   <React.StrictMode><App /></React.StrictMode>
   
2. Create an album
3. ✅ Check Firestore → only 1 album
4. ✅ Console may show duplicate call warning (expected in dev)
```

### Test 3: Error Recovery
```
1. Disconnect internet
2. Try to upload
3. ✅ Error notification appears
4. ✅ Guard releases (can try again)
5. Reconnect and retry
6. ✅ Works normally
```

## 📦 Commit

```bash
git add .
git commit -m "fix: add reentrancy guards to prevent duplicate writes"
git push
```

## 🎯 Expected Result

- ✅ Rapid clicking results in only 1 Firestore write
- ✅ StrictMode double-render handled gracefully
- ✅ Loading states available for UI feedback
- ✅ Better user experience (no duplicates)

## ⚠️ If Something Goes Wrong

### Problem: Guards "stick" (button stays disabled)

**Cause:** `finally` block doesn't run (something threw exception outside try/catch)

**Solution:** Ensure ALL code that can fail is inside try block:

```javascript
try {
  // Everything that can fail must be here
  await riskyOperation();
  await anotherRiskyOperation();
} catch (error) {
  // ...
} finally {
  setIsSaving(false); // Must always run
}
```

### Problem: Console spams warnings

**That's OK!** Warnings mean the guard is working. If you don't want to see them:

```javascript
if (isSaving) {
  // console.warn('...'); // Comment out in prod
  return;
}
```

---

**✅ PHASE 3 COMPLETE → GO TO PHASE 4**
