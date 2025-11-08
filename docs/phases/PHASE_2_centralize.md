# Phase 2: Centralize Firestore Operations

## 🎯 Goal

ALL Firestore logic should ONLY be in `usePhotoData` hook. No components should call `firebase.js` directly.

## ⏱️ Estimate: 3-4 hours

## 🔴 Problem Being Solved

**Before:**
```
AlbumModal → updateAlbum() → Firestore ❌
PhotoModal → toggleFavorite() → Firestore ❌
AlbumPage → deletePhoto() → Firestore ❌
UploadModal → [via props] → usePhotoData → Firestore ✅
```

**After:**
```
All components → usePhotoData → Firestore ✅
```

## 📝 Changes

### 1. Extend `src/hooks/usePhotoData.js`

**Add missing functions:**

```javascript
// Before end of hook, add:

const handleDeletePhoto = useCallback(async (photoId) => {
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
  }
}, [refreshData, setNotification, t]);

// Ensure this is returned:
return {
  photos,
  albums,
  loading,
  refreshData,
  handleUpload,
  handleAlbumSave,
  handleDeleteAlbum,
  handleDeletePhoto,  // ← NEW
  toggleFavorite
};
```

### 2. Refactor `src/components/AlbumModal.jsx`

**Before:**
```javascript
import { updateAlbum } from '../utils/firebase';

const handleSave = async () => {
  await updateAlbum(editingAlbum.id, albumData);
  await refreshData();
};
```

**After:**
```javascript
// REMOVE: import { updateAlbum } from '../utils/firebase';

const handleSave = async () => {
  // Use callback from props instead
  await onSave(albumData, editingAlbum);
};
```

**Ensure AlbumModal receives `onSave` prop from parent:**

```javascript
// In App.js or AlbumPage.jsx:
<AlbumModal
  isOpen={isAlbumModalOpen}
  onClose={() => setIsAlbumModalOpen(false)}
  onSave={handleAlbumSave}  // ← From usePhotoData
  editingAlbum={editingAlbum}
/>
```

### 3. Refactor `src/components/PhotoModal.jsx`

**Before:**
```javascript
import { toggleFavorite as toggleFavFirebase } from '../utils/firebase';

const handleToggleFavorite = async () => {
  await toggleFavFirebase(photo.id, !photo.isFavorite);
  await refreshData();
};
```

**After:**
```javascript
// REMOVE: import { toggleFavorite as toggleFavFirebase } from '../utils/firebase';

const handleToggleFavorite = async () => {
  // Use callback from props
  await onToggleFavorite(photo.id);
};
```

**Ensure PhotoModal receives prop:**

```javascript
// In parent component:
<PhotoModal
  photo={selectedPhoto}
  onClose={() => setSelectedPhoto(null)}
  onToggleFavorite={toggleFavorite}  // ← From usePhotoData
/>
```

### 4. Refactor `src/pages/AlbumPage.jsx`

**Before:**
```javascript
import { deletePhoto } from '../utils/firebase';

const handleDelete = async (photoId) => {
  await deletePhoto(photoId);
  await refreshData();
};
```

**After:**
```javascript
// REMOVE: import { deletePhoto } from '../utils/firebase';

const handleDelete = async (photoId) => {
  await handleDeletePhoto(photoId);  // From usePhotoData
};
```

### 5. Update `src/App.js`

**Ensure all handlers are passed as props:**

```javascript
const {
  photos,
  albums,
  loading,
  refreshData,
  handleUpload,
  handleAlbumSave,
  handleDeleteAlbum,
  handleDeletePhoto,
  toggleFavorite
} = usePhotoData(user);

// Pass to children components:
<AlbumPage
  // ... other props
  onDeletePhoto={handleDeletePhoto}
  onToggleFavorite={toggleFavorite}
  onSaveAlbum={handleAlbumSave}
/>
```

## 🧪 Testing

```bash
npm start
```

**Test each operation:**

### Album Operations
- [ ] Create album via UploadModal → 1 doc in Firestore
- [ ] Edit album via AlbumModal → updates existing doc
- [ ] Delete album → doc disappears
- [ ] **CRITICAL:** Create album → check Firestore → should be 1 doc, not 2

### Photo Operations
- [ ] Upload photo → 1 doc per file
- [ ] Toggle favorite → updates `isFavorite` field
- [ ] Delete photo → doc disappears

### Console Check
- [ ] No "imported but never used" warnings
- [ ] No duplicate calls in Network tab (Firebase)

## 🔍 Validation

**Check that no components import firebase.js directly:**

```bash
# Search for illegal imports (should find nothing):
grep -r "from.*firebase" src/components/
grep -r "from.*firebase" src/pages/

# Allowed: (only these should appear)
# - src/hooks/usePhotoData.js
# - src/App.js (for auth setup)
# - src/utils/ files
```

## 📦 Commit

```bash
git add .
git commit -m "refactor: centralize all Firestore operations in usePhotoData hook"
git push
```

## 🎯 Expected Result

- ✅ Only `usePhotoData` calls Firebase
- ✅ Components are "dumb" UI components
- ✅ Easier to debug (single source of truth)
- ✅ Duplicate calls eliminated
- ✅ Consistent error handling

## ⚠️ If Something Goes Wrong

### Problem: "onSave is not a function"

**Solution:** Component not receiving correct prop. Check:

1. Parent sends handler: `onSave={handleAlbumSave}`
2. Child receives in props: `const AlbumModal = ({ onSave, ... })`
3. Child calls correctly: `await onSave(data)`

### Problem: Duplicate albums still occur

**Debug:**

```javascript
// In usePhotoData.js, add logging:
const handleAlbumSave = async (albumData, editingAlbum) => {
  console.log('🔵 handleAlbumSave called', { albumData, editingAlbum });
  
  if (!editingAlbum) {
    console.error('❌ handleAlbumSave called without editingAlbum');
    throw new Error('Use UploadModal for creation');
  }
  
  // ... rest of code
};
```

Check console when creating album → should only see 1 call.

---

**✅ PHASE 2 COMPLETE → GO TO PHASE 3**
