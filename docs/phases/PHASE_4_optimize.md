# Phase 4: Optimize refreshData()

## 🎯 Goal

Replace full refresh (fetches EVERYTHING) with optimistic updates (update only what changed).

## ⏱️ Estimate: 2-3 hours

## 🔴 Problem Being Solved

**Before (inefficient):**
```
Edit album → Firestore update → refreshData()
                                    ↓
                          getAlbumsByUser() → fetches 100 albums
                          getPhotosByUser() → fetches 1000 photos
                                    ↓
                          Total: 1100 Firestore reads ❌
```

**After (optimized):**
```
Edit album → Firestore update → Optimistic UI update
                                    ↓
                          Update ONLY album in state
                                    ↓
                          Total: 0 extra reads ✅
```

**Performance gain:** 90-99% fewer Firestore reads

## 📝 Changes

### Strategy

1. **Optimistic updates** - Update UI first, sync in background
2. **Selective refresh** - Refresh only one resource if needed
3. **Fallback** - Keep full refresh as safety net

### Modify `src/hooks/usePhotoData.js`

#### 1. Keep refreshData() as fallback

```javascript
// Existing function - rename for clarity
const refreshAllData = useCallback(async () => {
  try {
    if (!user?.uid) return;
    
    const [fetchedAlbums, fetchedPhotos] = await Promise.all([
      getAlbumsByUser(user.uid),
      getPhotosByUser(user.uid)
    ]);
    
    setAlbums(fetchedAlbums);
    setPhotos(fetchedPhotos);
  } catch (error) {
    console.error('Error refreshing data:', error);
    setNotification({
      message: t('common:notifications.refreshError'),
      type: 'error'
    });
  }
}, [user?.uid, setNotification, t]);

// Alias for backwards compatibility
const refreshData = refreshAllData;
```

#### 2. Add selective refresh functions

```javascript
// Refresh only one album
const refreshSingleAlbum = useCallback(async (albumId) => {
  try {
    const album = await getAlbum(albumId); // Need to add to firebase.js
    setAlbums(prev => prev.map(a => 
      a.id === albumId ? album : a
    ));
  } catch (error) {
    console.error('Error refreshing album:', error);
    // Fallback to full refresh if something goes wrong
    await refreshAllData();
  }
}, [refreshAllData]);

// Refresh only one photo
const refreshSinglePhoto = useCallback(async (photoId) => {
  try {
    const photo = await getPhoto(photoId); // Need to add to firebase.js
    setPhotos(prev => prev.map(p => 
      p.id === photoId ? photo : p
    ));
  } catch (error) {
    console.error('Error refreshing photo:', error);
    await refreshAllData();
  }
}, [refreshAllData]);
```

#### 3. Update handleAlbumSave (optimistic)

**Before:**
```javascript
const handleAlbumSave = useCallback(async (albumData, editingAlbum = null) => {
  if (isSaving) return;
  setIsSaving(true);
  
  try {
    if (!editingAlbum) {
      throw new Error('Use UploadModal for creation');
    }

    await updateAlbum(editingAlbum.id, albumData);
    setNotification({
      message: t('common:notifications.albumUpdated'),
      type: 'success'
    });
    await refreshData(); // ← INEFFICIENT
  } catch (err) {
    console.error('Album save error:', err);
    setNotification({
      message: t('common:notifications.albumSaveError'),
      type: 'error'
    });
    throw err;
  } finally {
    setIsSaving(false);
  }
}, [isSaving, refreshData, setNotification, t]);
```

**After:**
```javascript
const handleAlbumSave = useCallback(async (albumData, editingAlbum = null) => {
  if (isSaving) return;
  setIsSaving(true);
  
  try {
    if (!editingAlbum) {
      throw new Error('Use UploadModal for creation');
    }

    // OPTIMISTIC UPDATE - update UI immediately
    setAlbums(prev => prev.map(album => 
      album.id === editingAlbum.id 
        ? { ...album, ...albumData }
        : album
    ));

    // Sync to backend in background
    await updateAlbum(editingAlbum.id, albumData);
    
    setNotification({
      message: t('common:notifications.albumUpdated'),
      type: 'success'
    });
    
    // No refresh needed! ✅
  } catch (err) {
    console.error('Album save error:', err);
    
    // ROLLBACK - refresh from server if it fails
    await refreshAllData();
    
    setNotification({
      message: t('common:notifications.albumSaveError'),
      type: 'error'
    });
    throw err;
  } finally {
    setIsSaving(false);
  }
}, [isSaving, refreshAllData, setNotification, t]);
```

#### 4. Update handleUpload (selective refresh)

```javascript
const handleUpload = useCallback(async (files, albumId = null) => {
  if (isUploading) return;
  setIsUploading(true);
  
  try {
    // Upload files
    const uploadedPhotos = await uploadMultiplePhotos(
      files,
      user.uid,
      albumId
    );
    
    // ADD new photos to state (don't fetch EVERYTHING)
    setPhotos(prev => [...prev, ...uploadedPhotos]);
    
    // UPDATE album photoCount if album specified
    if (albumId) {
      setAlbums(prev => prev.map(album =>
        album.id === albumId
          ? { ...album, photoCount: (album.photoCount || 0) + files.length }
          : album
      ));
    }
    
    setNotification({
      message: t('common:notifications.uploadSuccess', { count: files.length }),
      type: 'success'
    });
    
    // No full refresh! ✅
  } catch (error) {
    console.error('Upload error:', error);
    // Rollback on error
    await refreshAllData();
    throw error;
  } finally {
    setIsUploading(false);
  }
}, [isUploading, user?.uid, refreshAllData, setNotification, t]);
```

#### 5. Update handleDeleteAlbum (optimistic)

```javascript
const handleDeleteAlbum = useCallback(async (albumId) => {
  if (isDeleting) return;
  setIsDeleting(true);
  
  try {
    // OPTIMISTIC - remove from UI immediately
    setAlbums(prev => prev.filter(album => album.id !== albumId));
    
    // Sync to backend
    await deleteAlbum(albumId);
    
    setNotification({
      message: t('common:notifications.albumDeleted'),
      type: 'success'
    });
  } catch (error) {
    console.error('Delete album error:', error);
    // Rollback on error
    await refreshAllData();
    setNotification({
      message: t('common:notifications.albumDeleteError'),
      type: 'error'
    });
    throw error;
  } finally {
    setIsDeleting(false);
  }
}, [isDeleting, refreshAllData, setNotification, t]);
```

#### 6. Update handleDeletePhoto (optimistic)

```javascript
const handleDeletePhoto = useCallback(async (photoId) => {
  if (isDeleting) return;
  setIsDeleting(true);
  
  try {
    // OPTIMISTIC - remove from UI
    setPhotos(prev => prev.filter(photo => photo.id !== photoId));
    
    // Sync to backend
    await deletePhoto(photoId);
    
    setNotification({
      message: t('common:notifications.photoDeleted'),
      type: 'success'
    });
  } catch (error) {
    console.error('Delete photo error:', error);
    await refreshAllData();
    setNotification({
      message: t('common:notifications.photoDeleteError'),
      type: 'error'
    });
    throw error;
  } finally {
    setIsDeleting(false);
  }
}, [isDeleting, refreshAllData, setNotification, t]);
```

#### 7. Update toggleFavorite (optimistic)

```javascript
const toggleFavorite = useCallback(async (photoId) => {
  if (isTogglingFavorite) return;
  setIsTogglingFavorite(true);
  
  try {
    const photo = photos.find(p => p.id === photoId);
    if (!photo) throw new Error('Photo not found');
    
    const newFavoriteState = !photo.isFavorite;
    
    // OPTIMISTIC - update UI immediately
    setPhotos(prev => prev.map(p =>
      p.id === photoId
        ? { ...p, isFavorite: newFavoriteState }
        : p
    ));
    
    // Sync to backend
    await toggleFavoriteFirebase(photoId, newFavoriteState);
    
    // No refresh! ✅
  } catch (error) {
    console.error('Toggle favorite error:', error);
    // Rollback on error
    await refreshAllData();
    setNotification({
      message: t('common:notifications.favoriteError'),
      type: 'error'
    });
    throw error;
  } finally {
    setIsTogglingFavorite(false);
  }
}, [isTogglingFavorite, photos, refreshAllData, setNotification, t]);
```

### Add missing Firebase functions to `src/utils/firebase.js`

```javascript
// Get single album (for selective refresh if needed)
export const getAlbum = async (albumId) => {
  try {
    const docRef = doc(db, 'albums', albumId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Album not found');
    }
    
    return { id: docSnap.id, ...docSnap.data() };
  } catch (error) {
    console.error('Error getting album:', error);
    throw error;
  }
};

// Get single photo (for selective refresh if needed)
export const getPhoto = async (photoId) => {
  try {
    const docRef = doc(db, 'photos', photoId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Photo not found');
    }
    
    return { id: docSnap.id, ...docSnap.data() };
  } catch (error) {
    console.error('Error getting photo:', error);
    throw error;
  }
};
```

## 🧪 Testing

### Test 1: Edit Album (no refresh)
```
1. Open DevTools Network tab (filter: Firestore)
2. Edit an album name
3. ✅ Should see 1 Firestore update
4. ✅ Should NOT see getAlbumsByUser or getPhotosByUser
5. ✅ UI updates immediately
```

### Test 2: Upload Photos (selective update)
```
1. Upload 5 images to an album
2. ✅ Network: 5 Storage uploads + 5 Firestore writes
3. ✅ Network: NOT getPhotosByUser (no full refresh)
4. ✅ Album photoCount updates
5. ✅ Photos appear immediately
```

### Test 3: Delete Album (optimistic)
```
1. Delete an album
2. ✅ Album disappears BEFORE Firestore delete finishes
3. ✅ No full refresh runs
4. ✅ Notification appears
```

### Test 4: Toggle Favorite (instant feedback)
```
1. Toggle favorite on an image
2. ✅ Heart icon changes IMMEDIATELY
3. ✅ No spinner or delay
4. ✅ Only 1 Firestore update in network
```

### Test 5: Error Rollback
```
1. Disconnect internet
2. Try to edit album
3. ✅ Optimistic update shows first
4. ✅ Error occurs → refreshAllData() runs
5. ✅ UI reverts to server state
6. ✅ Error notification appears
```

## 📊 Performance Metrics

**Before optimization:**
```
Edit album:
  - 1 Firestore update
  - 1 getAlbumsByUser (100 reads)
  - 1 getPhotosByUser (1000 reads)
  Total: 1101 operations ❌
```

**After optimization:**
```
Edit album:
  - 1 Firestore update
  Total: 1 operation ✅
  
Improvement: 99.9% fewer operations
```

## 📦 Commit

```bash
git add .
git commit -m "perf: replace full refresh with optimistic updates (99% fewer Firestore reads)"
git push
```

## 🎯 Expected Result

- ✅ 90-99% reduction in Firestore reads
- ✅ Instant UI feedback (no loading delay)
- ✅ Better user experience
- ✅ Lower Firebase costs
- ✅ Faster app with large datasets

## ⚠️ If Something Goes Wrong

### Problem: UI shows wrong data after edit

**Cause:** Optimistic update has wrong data structure

**Solution:** Check that you're sending correct data:

```javascript
// WRONG:
setAlbums(prev => prev.map(a =>
  a.id === id ? albumData : a  // ← missing id
));

// CORRECT:
setAlbums(prev => prev.map(a =>
  a.id === id ? { ...a, ...albumData } : a  // ← merge with existing
));
```

### Problem: State desync after error

**Cause:** Rollback not called

**Solution:** Ensure `refreshAllData()` is called in catch block:

```javascript
catch (error) {
  await refreshAllData(); // ← CRITICAL
  // handle error
}
```

### Problem: Duplicate photos after upload

**Cause:** Both optimistic update AND refresh run

**Solution:** Remove `refreshData()` from upload handler, keep only:

```javascript
setPhotos(prev => [...prev, ...uploadedPhotos]);
```

---

**✅ PHASE 4 COMPLETE → REFACTOR COMPLETE! 🎉**
