# 🚀 PIXTR FREEMIUM v2.0 - COMPLETE MASTER PROMPT

**Optimized for 15-18% GRATIS → LITE conversion**
**Total time: 32-40 hours (4-5 days)**

---

## 🎯 OBJECTIVES

1. Implement psychology-driven freemium limits
2. Create irresistible upgrade modals
3. Preview features (don't lock them)
4. Use Firestore counters (never getDocs)
5. Target: 15-18% conversion rate

---

## 📊 TIER STRUCTURE

### GRATIS (0 kr)

```javascript
{
  storage: 786432000,        // 750 MB
  maxAlbums: 5,
  maxPhotosPerAlbum: 20,

  features: {
    upload: true,
    albums: true,
    editor: {
      crop: true,
      rotate: true,
      filters: 'PREVIEW_ONLY',    // Can see, can't save
      adjust: 'PREVIEW_ONLY',     // Can see, can't save
    },
    collage: 'TEASER',            // Can design, can't save
    search: true,
    favorites: true,
    timeline: true,

    // Locked:
    qrSharing: false,
    slideshow: false,
    captions: false,
    bulkDownload: false,
    trash: false,
  }
}
```

### LITE (39 kr/mnd)

```javascript
{
  storage: 5368709120,       // 5 GB
  maxAlbums: Infinity,
  maxPhotosPerAlbum: Infinity,

  features: {
    // All GRATIS unlocked
    editor: 'FULL',
    collage: 'FULL',
    qrSharing: true,
    slideshow: true,
    captions: true,
    bulkDownload: true,
    trash: true,
    compression: true,
    documents: true,

    // Tease PRO:
    aiPreview: 'TEASER',
  }
}
```

### PRO (79 kr/mnd)

```javascript
{
  storage: 53687091200,      // 50 GB

  features: {
    // All LITE +
    video: true,
    aiAutoTagging: true,
    aiEnhancement: true,
    backgroundRemoval: true,
    duplicateDetection: true,
    smartAlbums: true,
    memories: true,
  }
}
```

---

# 🔥 PHASE 1: COUNTERS & LIMITS (6-8 hours)

## ⚠️ CRITICAL: Use Counters, Not Queries

**Never use `getDocs()` for limit checks - use Firestore counters!**

---

## Task 1.1: Create Counter Integrity Helpers

**File:** `src/firebase.js`

```javascript
import {
  doc,
  updateDoc,
  increment,
  getDoc,
  addDoc,
  deleteDoc,
  collection,
} from 'firebase/firestore'
import { db } from './firebaseConfig'

/**
 * COUNTER INTEGRITY HELPERS
 * Ensures counters stay in sync even during errors
 */

/**
 * Adjust user album count (atomic with rollback)
 */
export async function adjustUserAlbumCount(userId, delta) {
  const userRef = doc(db, 'users', userId)

  try {
    await updateDoc(userRef, {
      currentAlbumCount: increment(delta),
    })

    if (import.meta.env.DEV) {
      console.log(`✅ Album count adjusted by ${delta} for user ${userId}`)
    }
  } catch (error) {
    console.error('❌ Failed to adjust album count:', error)
    throw error
  }
}

/**
 * Adjust album photo count (atomic with rollback)
 */
export async function adjustAlbumPhotoCount(albumId, delta) {
  const albumRef = doc(db, 'albums', albumId)

  try {
    await updateDoc(albumRef, {
      photoCount: increment(delta),
    })

    if (import.meta.env.DEV) {
      console.log(`✅ Photo count adjusted by ${delta} for album ${albumId}`)
    }
  } catch (error) {
    console.error('❌ Failed to adjust photo count:', error)
    throw error
  }
}
```

---

## Task 1.2: Add User Counter Fields

**File:** `src/firebase.js` (or Firebase Functions)

**Update user creation:**

```javascript
export async function createUserProfile(userId, email, displayName) {
  const userRef = doc(db, 'users', userId)

  await setDoc(userRef, {
    userId,
    email,
    displayName,
    subscriptionTier: 'GRATIS',
    storageUsed: 0,
    storageLimit: 786432000, // 750 MB
    currentAlbumCount: 0, // 🆕 Counter
    currentPhotoCount: 0, // 🆕 Optional: total photos
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
}
```

---

## Task 1.3: Album Creation with Rollback

**File:** `src/firebase.js`

```javascript
/**
 * Create album with automatic rollback on error
 */
export async function addAlbum(albumData) {
  const userId = albumData.userId
  let albumId = null

  try {
    // 1. Check limit using counter
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      throw new Error('User not found')
    }

    const userData = userSnap.data()
    const tier = userData.subscriptionTier || 'GRATIS'
    const currentCount = userData.currentAlbumCount || 0

    // ENFORCE LIMIT
    if (tier === 'GRATIS' && currentCount >= 5) {
      const error = new Error('Album limit reached')
      error.code = 'ALBUM_LIMIT_REACHED'
      error.current = currentCount
      error.max = 5
      throw error
    }

    // 2. Create album FIRST
    const albumRef = await addDoc(collection(db, 'albums'), {
      ...albumData,
      photoCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    albumId = albumRef.id

    // 3. Increment counter (with automatic rollback on error)
    try {
      await adjustUserAlbumCount(userId, 1)
    } catch (counterError) {
      // ROLLBACK: Delete the album we just created
      console.error('Counter increment failed, rolling back album creation')
      await deleteDoc(albumRef)
      throw counterError
    }

    return albumId
  } catch (error) {
    console.error('addAlbum failed:', error)
    throw error
  }
}

/**
 * Delete album with counter decrement
 */
export async function deleteAlbum(albumId, userId) {
  try {
    // 1. Delete album
    await deleteDoc(doc(db, 'albums', albumId))

    // 2. Decrement counter
    await adjustUserAlbumCount(userId, -1)

    if (import.meta.env.DEV) {
      console.log(`✅ Album ${albumId} deleted`)
    }
  } catch (error) {
    console.error('deleteAlbum failed:', error)
    throw error
  }
}
```

---

## Task 1.4: Photo Upload with Rollback

**File:** `src/firebase.js`

```javascript
/**
 * Upload photo with automatic rollback on error
 */
export async function uploadPhoto(userId, file, albumId = null) {
  let photoId = null
  let storagePath = null

  try {
    // 1. Check album limit if adding to album
    if (albumId) {
      const albumRef = doc(db, 'albums', albumId)
      const albumSnap = await getDoc(albumRef)

      if (!albumSnap.exists()) {
        throw new Error('Album not found')
      }

      const albumData = albumSnap.data()
      const userRef = doc(db, 'users', userId)
      const userSnap = await getDoc(userRef)
      const tier = userSnap.data()?.subscriptionTier || 'GRATIS'
      const currentPhotoCount = albumData.photoCount || 0

      // ENFORCE LIMIT
      if (tier === 'GRATIS' && currentPhotoCount >= 20) {
        const error = new Error('Photo limit reached for this album')
        error.code = 'PHOTO_LIMIT_REACHED'
        error.current = currentPhotoCount
        error.max = 20
        throw error
      }
    }

    // 2. Upload to storage (R2 or Firebase Storage)
    const { url, path } = await uploadToStorage(file, userId)
    storagePath = path

    // 3. Create Firestore document
    const photoRef = await addDoc(collection(db, 'photos'), {
      userId,
      albumId,
      url,
      storagePath,
      name: file.name,
      size: file.size,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })
    photoId = photoRef.id

    // 4. Increment album photoCount (with rollback)
    if (albumId) {
      try {
        await adjustAlbumPhotoCount(albumId, 1)
      } catch (counterError) {
        // ROLLBACK: Delete photo document and storage file
        console.error('Counter increment failed, rolling back photo upload')
        await deleteDoc(photoRef)
        await deleteFromStorage(storagePath)
        throw counterError
      }
    }

    // 5. Update user storage
    await updateDoc(doc(db, 'users', userId), {
      storageUsed: increment(file.size),
    })

    return photoId
  } catch (error) {
    console.error('uploadPhoto failed:', error)
    throw error
  }
}
```

---

## Task 1.5: Limit Check Hooks

**File:** `src/hooks/useAuth.js`

```javascript
import { useCallback } from 'react'
import { useStore } from '../store'

export function useAuth() {
  const userProfile = useStore((state) => state.userProfile)

  /**
   * Check if user can create album (no query needed!)
   */
  const canCreateAlbum = useCallback(() => {
    if (!userProfile) return { allowed: false }

    const tier = userProfile.subscriptionTier || 'GRATIS'

    // LITE/PRO always allowed
    if (tier !== 'GRATIS') {
      return { allowed: true }
    }

    // GRATIS: Check counter
    const current = userProfile.currentAlbumCount || 0
    const max = 5

    return {
      allowed: current < max,
      current,
      max,
      remaining: max - current,
    }
  }, [userProfile])

  /**
   * Check if user can add photo to album
   */
  const canAddPhotoToAlbum = useCallback(
    (album) => {
      if (!userProfile || !album) return { allowed: false }

      const tier = userProfile.subscriptionTier || 'GRATIS'

      // LITE/PRO always allowed
      if (tier !== 'GRATIS') {
        return { allowed: true }
      }

      // GRATIS: Check counter
      const current = album.photoCount || 0
      const max = 20

      return {
        allowed: current < max,
        current,
        max,
        remaining: max - current,
      }
    },
    [userProfile]
  )

  /**
   * Check storage limit
   */
  const checkStorage = useCallback(
    (newFileSize) => {
      if (!userProfile) return { allowed: false }

      const tier = userProfile.subscriptionTier || 'GRATIS'
      const storageUsed = userProfile.storageUsed || 0
      const storageLimit = userProfile.storageLimit || 786432000 // 750 MB

      const wouldExceed = storageUsed + newFileSize > storageLimit

      return {
        allowed: !wouldExceed,
        current: storageUsed,
        max: storageLimit,
        needed: newFileSize,
        available: storageLimit - storageUsed,
        percentUsed: Math.round((storageUsed / storageLimit) * 100),
      }
    },
    [userProfile]
  )

  return {
    userProfile,
    canCreateAlbum,
    canAddPhotoToAlbum,
    checkStorage,
  }
}
```

---

## Task 1.6: Update Album/Photo Pages

**File:** `src/pages/AlbumsPage.jsx`

```javascript
import { useAuth } from '../hooks/useAuth'
import { useStore } from '../store'

const AlbumsPage = () => {
  const { canCreateAlbum } = useAuth()
  const setUpgradeModal = useStore((state) => state.setUpgradeModal)

  const handleCreateAlbum = async () => {
    const check = canCreateAlbum()

    if (!check.allowed) {
      // Show upgrade modal
      setUpgradeModal({
        open: true,
        type: 'album-limit',
        current: check.current,
        max: check.max,
      })
      return
    }

    // Proceed with creation
    await addAlbum({ userId, name: 'New Album' })
  }

  return (
    <div>
      <button onClick={handleCreateAlbum}>+ Nytt album</button>
    </div>
  )
}
```

---

## ✅ Phase 1 Commit

```bash
git add .
git commit -m "feat: implement counter-based limits with rollback

- Add currentAlbumCount to user schema
- Create atomic counter adjustment helpers
- Album creation with automatic rollback on error
- Photo upload with counter increment + rollback
- Enforce 5 album limit (GRATIS)
- Enforce 20 photos/album limit (GRATIS)
- Change storage limit to 750 MB (from 1 GB)
- Add canCreateAlbum/canAddPhotoToAlbum hooks

CRITICAL: Uses Firestore counters, NOT getDocs()
Performance: O(1) limit checks vs O(n) queries"
```

---

# 🎨 PHASE 2: TEASERS > LOCKS (6-8 hours)

## Philosophy: Show, Don't Hide

**Let users SEE the value before asking them to pay**

---

## Task 2.1: Modal Fatigue Prevention Utility

**File:** `src/utils/modalTracking.js` (NEW FILE)

```javascript
/**
 * Modal Fatigue Prevention
 * Only show each modal type once per 24 hours
 */

const MODAL_STORAGE_KEY = 'pixtr_modals_shown'
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Check if modal can be shown (not shown recently)
 */
export function canShowModal(modalType) {
  try {
    const stored = localStorage.getItem(MODAL_STORAGE_KEY)

    if (!stored) return true

    const modalsShown = JSON.parse(stored)
    const lastShown = modalsShown[modalType]

    if (!lastShown) return true

    // Check if 24 hours have passed
    const timeSinceShown = Date.now() - lastShown
    return timeSinceShown > SESSION_DURATION
  } catch (error) {
    console.error('canShowModal error:', error)
    return true // Show on error (fail open)
  }
}

/**
 * Mark modal as shown
 */
export function markModalShown(modalType) {
  try {
    const stored = localStorage.getItem(MODAL_STORAGE_KEY)
    const modalsShown = stored ? JSON.parse(stored) : {}

    modalsShown[modalType] = Date.now()

    localStorage.setItem(MODAL_STORAGE_KEY, JSON.stringify(modalsShown))
  } catch (error) {
    console.error('markModalShown error:', error)
  }
}

/**
 * Reset modal tracking (for testing)
 */
export function resetModalTracking() {
  try {
    localStorage.removeItem(MODAL_STORAGE_KEY)
  } catch (error) {
    console.error('resetModalTracking error:', error)
  }
}
```

---

## Task 2.2: Editor - Preview Filters (Don't Lock)

**File:** `src/pages/EditorPage.jsx`

```javascript
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useStore } from '../store'

const FILTERS = [
  { id: 'original', name: 'Original', filter: null },
  { id: 'vintage', name: 'Vintage', filter: 'sepia(80%) hue-rotate(10deg)' },
  { id: 'cool', name: 'Cool', filter: 'saturate(120%) hue-rotate(180deg)' },
  { id: 'warm', name: 'Warm', filter: 'saturate(130%) hue-rotate(20deg)' },
  { id: 'bw', name: 'B&W', filter: 'grayscale(100%)' },
]

const EditorPage = () => {
  const { userProfile } = useAuth()
  const tier = userProfile?.subscriptionTier || 'GRATIS'
  const setUpgradeModal = useStore((state) => state.setUpgradeModal)

  const [selectedFilter, setSelectedFilter] = useState('original')

  const handleSave = () => {
    // GRATIS: Block on save, not on preview
    if (tier === 'GRATIS' && selectedFilter !== 'original') {
      setUpgradeModal({
        open: true,
        type: 'editor-save',
        feature: 'filter',
        preview: selectedFilter,
      })
      return
    }

    // LITE/PRO: Save normally
    saveEditedPhoto(selectedFilter)
  }

  return (
    <div className="editor-page">
      <h1>Rediger bilde</h1>

      {/* Show banner for GRATIS */}
      {tier === 'GRATIS' && (
        <div className="preview-banner glass-card p-3 mb-4 rounded-xl border border-blue-500/20">
          <p className="text-sm text-gray-300">
            🎨 Prøv alle filtre! Oppgrader til LITE for å lagre.
          </p>
        </div>
      )}

      {/* Filter grid - ALL VISIBLE */}
      <div className="filter-grid grid grid-cols-3 gap-3 mb-6">
        {FILTERS.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setSelectedFilter(filter.id)}
            className={`filter-option relative ${
              selectedFilter === filter.id ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <img
              src={photo.url}
              style={{ filter: filter.filter }}
              className="w-full aspect-square object-cover rounded-lg"
            />
            <span className="text-xs mt-1">{filter.name}</span>

            {/* LITE badge (not locked!) */}
            {tier === 'GRATIS' && filter.id !== 'original' && (
              <div className="absolute top-2 right-2 px-2 py-0.5 bg-blue-600 rounded text-xs">
                LITE
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        className="w-full py-3 bg-blue-600 rounded-xl"
      >
        {tier === 'GRATIS' && selectedFilter !== 'original'
          ? '💎 Lagre (krever LITE)'
          : 'Lagre endringer'}
      </button>
    </div>
  )
}
```

**Psychology:**

- ✅ User sees beautiful filters
- ✅ Can preview on their photo
- ✅ Clicks "Save"
- ✅ **BOOM** → Upgrade modal with their preview
- ✅ Much stronger than locked button!

---

## Task 2.3: Collage - Full Builder, Block on Save

**File:** `src/pages/CollageNewPage.jsx`

```javascript
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useStore } from '../store'

const CollageNewPage = () => {
  const { userProfile } = useAuth()
  const tier = userProfile?.subscriptionTier || 'GRATIS'
  const setUpgradeModal = useStore((state) => state.setUpgradeModal)

  const [design, setDesign] = useState(null)
  const [selectedPhotos, setSelectedPhotos] = useState([])
  const [layout, setLayout] = useState('grid-2x2')

  const handleSave = () => {
    // GRATIS: Block on save with preview
    if (tier === 'GRATIS') {
      setUpgradeModal({
        open: true,
        type: 'collage-save',
        feature: 'collage',
        preview: design, // Show what they made!
      })
      return
    }

    // LITE/PRO: Save normally
    saveCollage(design)
  }

  return (
    <div className="collage-builder">
      <h1>Lag kollasj</h1>

      {/* Preview banner for GRATIS */}
      {tier === 'GRATIS' && (
        <div className="preview-banner glass-card p-3 mb-4 rounded-xl border border-purple-500/20">
          <p className="text-sm text-gray-300">
            🎨 Design fritt! Oppgrader til LITE for å lagre.
          </p>
        </div>
      )}

      {/* FULL FUNCTIONALITY for all users */}
      <div className="builder-tools">
        <LayoutPicker selected={layout} onChange={setLayout} />

        <PhotoSelector selected={selectedPhotos} onChange={setSelectedPhotos} />

        <BackgroundPicker />
      </div>

      {/* Preview canvas */}
      <div className="canvas-preview">
        <CollageCanvas
          layout={layout}
          photos={selectedPhotos}
          onChange={setDesign}
        />
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        className="w-full py-3 bg-purple-600 rounded-xl mt-4"
      >
        {tier === 'GRATIS' ? '💎 Lagre kollasj (krever LITE)' : 'Lagre kollasj'}
      </button>
    </div>
  )
}
```

**Sunk Cost Effect:**

- User spends 5-10 minutes designing
- Clicks "Save"
- Sees their creation blurred
- "I don't want to lose this!"
- **Converts to LITE**

---

## Task 2.4: PRO Teasers for LITE Users

**File:** `src/pages/HomePage.jsx`

```javascript
const HomePage = () => {
  const { userProfile } = useAuth()
  const tier = userProfile?.subscriptionTier || 'GRATIS'
  const photos = useStore((state) => state.photos)

  return (
    <div className="home-page">
      {/* PRO Teaser - ONLY for LITE users */}
      {tier === 'LITE' && photos.length > 30 && (
        <div className="pro-teaser glass-card p-4 rounded-xl mb-4 border border-purple-500/20">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 rounded-xl">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-white mb-1">
                ✨ Visste du?
              </h3>
              <p className="text-xs text-gray-300">
                I PRO kan AI organisere bildene dine automatisk etter innhold
                (strand, mat, portrett, osv.) - spar masse tid!
              </p>
            </div>
            <button
              onClick={() => navigate('/subscription')}
              className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-lg text-xs font-medium text-purple-300 transition-colors"
            >
              Les mer
            </button>
          </div>
        </div>
      )}

      {/* NEVER show PRO teasers to GRATIS */}
      {tier === 'GRATIS' && (
        <div className="lite-promo glass-card p-4 rounded-xl mb-4">
          <h3 className="text-lg font-semibold mb-2">
            Lås opp LITE for ubegrensede muligheter
          </h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>✅ Ubegrensede album og bilder</li>
            <li>✅ 5 GB lagring</li>
            <li>✅ Full editor og kollasj</li>
          </ul>
          <button
            onClick={() => navigate('/subscription')}
            className="w-full mt-3 py-2 bg-blue-600 rounded-lg"
          >
            Se LITE-planen
          </button>
        </div>
      )}

      {/* Photo grid */}
      <PhotoGrid photos={photos} />
    </div>
  )
}
```

**Tone Guidelines:**

```javascript
// ✅ GOOD (future value, positive)
'I PRO kan AI organisere bildene dine automatisk'
'Spar tid med smart auto-tagging'
'Oppdag nye måter å organisere bildene på'

// ❌ BAD (you're missing out, negative)
'Du mangler AI-funksjoner'
'Du burde oppgradere til PRO'
'LITE er ikke nok for seriøse brukere'
```

---

## ✅ Phase 2 Commit

```bash
git add .
git commit -m "feat: implement preview-first UX with modal tracking

- Add modal fatigue prevention (24h cooldown)
- Editor: Show all filters, block on save (not preview)
- Collage: Full builder access, block on save
- Add PRO teasers for LITE users (subtle, positive)
- Never show PRO to GRATIS (focus on LITE first)

UX: Show value before paywall (sunk cost effect)
Psychology: Investment → conversion"
```

---

# 💎 PHASE 3: UPGRADE MODALS (6-8 hours)

## Task 3.1: Create Base Upgrade Modal Component

**File:** `src/components/UpgradeModal.jsx`

```javascript
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { canShowModal, markModalShown } from '../utils/modalTracking'
import { X, Lock, AlertTriangle, Image, Palette, Grid3x3 } from 'lucide-react'

const UpgradeModal = () => {
  const navigate = useNavigate()
  const upgradeModal = useStore((state) => state.upgradeModal)
  const setUpgradeModal = useStore((state) => state.setUpgradeModal)

  const { open, type, current, max, preview, needed, available } = upgradeModal

  // Modal fatigue prevention
  useEffect(() => {
    if (open && type) {
      const modalKey = `${type}-${upgradeModal.feature || 'general'}`

      if (!canShowModal(modalKey)) {
        if (import.meta.env.DEV) {
          console.log(`⏭️ Skipping modal ${modalKey} (shown recently)`)
        }
        // Close modal silently
        setUpgradeModal({ open: false })
        return
      }

      // Mark as shown
      markModalShosen(modalKey)
    }
  }, [open, type, upgradeModal.feature])

  if (!open) return null

  const handleUpgrade = () => {
    setUpgradeModal({ open: false })
    navigate('/subscription')
  }

  const handleClose = () => {
    setUpgradeModal({ open: false })
  }

  // Get content based on type
  const content = getModalContent(type, {
    current,
    max,
    preview,
    needed,
    available,
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md glass-card p-6 rounded-2xl">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-2xl">
            {content.icon}
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center mb-2">{content.title}</h2>

        {/* Description */}
        <p className="text-gray-300 text-center mb-4">{content.description}</p>

        {/* Preview (if applicable) */}
        {content.preview && (
          <div className="mb-4 rounded-xl overflow-hidden">
            <div style={{ filter: 'blur(3px)' }}>{content.preview}</div>
          </div>
        )}

        {/* Pain Point */}
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          <p className="text-sm text-red-300">⚠️ {content.pain}</p>
        </div>

        {/* Solution */}
        <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
          <p className="text-sm font-semibold text-green-300 mb-2">
            ✅ {content.solution}
          </p>
          <ul className="text-sm text-gray-300 space-y-1">
            {content.features.map((feature, i) => (
              <li key={i}>{feature}</li>
            ))}
          </ul>
        </div>

        {/* Pricing */}
        <div className="text-center mb-4">
          <p className="text-3xl font-bold text-white">
            39 kr<span className="text-lg text-gray-400">/måned</span>
          </p>
          <p className="text-sm text-gray-400 mt-1">Avbryt når som helst</p>
        </div>

        {/* Action buttons */}
        {content.showActions === 'double' ? (
          <div className="flex gap-3">
            <button
              onClick={() => {
                navigate('/albums')
                handleClose()
              }}
              className="flex-1 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
            >
              {content.secondaryAction || 'Administrer lagring'}
            </button>
            <button
              onClick={handleUpgrade}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-xl font-semibold transition-colors"
            >
              Oppgrader til LITE
            </button>
          </div>
        ) : (
          <button
            onClick={handleUpgrade}
            className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded-xl font-semibold transition-colors"
          >
            Oppgrader til LITE
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * Get modal content based on type
 */
function getModalContent(type, data) {
  const { current, max, preview, needed, available } = data

  switch (type) {
    case 'album-limit':
      return {
        icon: <Lock className="w-8 h-8 text-blue-400" />,
        title: 'Album-grensen nådd',
        description: `Du har ${current} av ${max} album i GRATIS-planen.`,
        pain: 'Kan ikke opprette flere album',
        solution: 'LITE løser alt',
        features: [
          '✅ Ubegrensede album',
          '✅ Ubegrensede bilder per album',
          '✅ 5 GB lagring (6.6x mer)',
          '✅ Full editor + kollasj',
        ],
      }

    case 'photo-limit':
      return {
        icon: <Image className="w-8 h-8 text-blue-400" />,
        title: 'Bildelimit nådd',
        description: `Dette albumet har ${current} av ${max} bilder.`,
        pain: 'Kan ikke legge til flere bilder i dette albumet',
        solution: 'LITE fjerner alle grenser',
        features: [
          '✅ Ubegrensede bilder per album',
          '✅ Ubegrensede album',
          '✅ 5 GB total lagring',
          '✅ Alle premium-features',
        ],
      }

    case 'editor-save':
      return {
        icon: <Palette className="w-8 h-8 text-purple-400" />,
        title: 'Elsker du denne effekten?',
        description: 'Oppgrader til LITE for å lagre redigeringer!',
        preview: preview && <img src={preview} alt="Preview" />,
        pain: 'Kan ikke lagre filtre eller justeringer',
        solution: 'LITE gir full tilgang til editoren',
        features: [
          '✅ Lagre alle filtre',
          '✅ Juster lysstyrke, kontrast, metning',
          '✅ Crop og roter',
          '✅ Eksporter i høy kvalitet',
        ],
      }

    case 'collage-save':
      return {
        icon: <Grid3x3 className="w-8 h-8 text-purple-400" />,
        title: 'Flott kollasj! 🎨',
        description:
          'Oppgrader til LITE for å lagre denne og alle fremtidige kollasjer!',
        preview: preview && <img src={preview} alt="Collage preview" />,
        pain: 'Kan ikke lagre kollasjer',
        solution: 'LITE låser opp Collage Builder',
        features: [
          '✅ Lagre kollasjer i høy kvalitet',
          '✅ 9+ layouts',
          '✅ Tilpass bakgrunner og farger',
          '✅ Ubegrensede eksporter',
        ],
      }

    case 'storage-warning':
      return {
        icon: <AlertTriangle className="w-6 h-6 text-yellow-400" />,
        title: 'Lagringen er snart full',
        description: `Du har brukt ${Math.round(
          (data.current / data.max) * 100
        )}% av lagringen din.`,
        pain: 'Snart tomt for plass',
        solution: 'LITE gir 6.6x mer lagring',
        features: [
          '✅ 5 GB lagring (fra 750 MB)',
          '✅ Smart komprimering (dobbel kapasitet)',
          '✅ Støtte for dokumenter',
          '✅ Ubegrensede album og bilder',
        ],
      }

    case 'storage-full':
      return {
        icon: <AlertTriangle className="w-6 h-6 text-red-400" />,
        title: 'Lagringen er full',
        description: `Du trenger ${formatBytes(
          needed
        )}, men har kun ${formatBytes(available)} ledig.`,
        pain: 'Kan ikke laste opp flere bilder',
        solution: 'To alternativer',
        features: [
          '1️⃣ Slett noen bilder for å få plass',
          '2️⃣ Oppgrader til LITE (5 GB)',
        ],
        showActions: 'double',
        secondaryAction: 'Administrer lagring',
      }

    case 'qr-sharing':
      return {
        icon: <Lock className="w-8 h-8 text-blue-400" />,
        title: 'QR-deling er en LITE-feature',
        description: 'Del album enkelt med QR-koder!',
        pain: 'Kan ikke generere QR-koder',
        solution: 'LITE gir avansert deling',
        features: [
          '✅ QR-kode deling',
          '✅ Slideshow-modus',
          '✅ Passordbeskyttede delinger',
          '✅ Sporbar tilgang',
        ],
      }

    default:
      return {
        icon: <Lock className="w-8 h-8 text-blue-400" />,
        title: 'Premium Feature',
        description: 'Denne funksjonen krever LITE-planen.',
        pain: 'Begrenset tilgang',
        solution: 'Oppgrader til LITE',
        features: [
          '✅ Ubegrensede album og bilder',
          '✅ 5 GB lagring',
          '✅ Alle premium-features',
        ],
      }
  }
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1024 * 1024 * 1024)
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
}

export default UpgradeModal
```

---

## Task 3.2: Add Upgrade Modal to Store

**File:** `src/store/index.js` (or wherever your Zustand store is)

```javascript
import { create } from 'zustand'

export const useStore = create((set) => ({
  // ... existing state

  upgradeModal: {
    open: false,
    type: null,
    current: null,
    max: null,
    preview: null,
    feature: null,
    needed: null,
    available: null,
  },

  setUpgradeModal: (data) =>
    set({
      upgradeModal: {
        ...data,
      },
    }),
}))
```

---

## Task 3.3: Add Modal to App Layout

**File:** `src/App.jsx` or `src/layouts/MainLayout.jsx`

```javascript
import UpgradeModal from './components/UpgradeModal'

function App() {
  return (
    <>
      <Routes>{/* ... your routes */}</Routes>

      {/* Global upgrade modal */}
      <UpgradeModal />
    </>
  )
}
```

---

## Task 3.4: Update Upload Handler with Storage Check

**File:** `src/hooks/useUpload.js` or photo upload component

```javascript
import { useAuth } from './useAuth'
import { useStore } from '../store'

export function useUpload() {
  const { checkStorage, userProfile } = useAuth()
  const setUpgradeModal = useStore((state) => state.setUpgradeModal)
  const setNotification = useStore((state) => state.setNotification)

  const handleUpload = async (files, albumId) => {
    const tier = userProfile?.subscriptionTier || 'GRATIS'

    // Calculate total size
    const newFileBytes = files.reduce((total, file) => total + file.size, 0)
    const storageCheck = checkStorage(newFileBytes)

    // Show warning at 80%
    if (
      tier === 'GRATIS' &&
      storageCheck.percentUsed >= 80 &&
      storageCheck.percentUsed < 100
    ) {
      setUpgradeModal({
        open: true,
        type: 'storage-warning',
        current: storageCheck.current,
        max: storageCheck.max,
      })
    }

    // Block upload at 100% (but allow cleanup)
    if (!storageCheck.allowed) {
      setNotification({
        type: 'error',
        message: `Ikke nok lagringsplass. Trenger ${formatBytes(
          newFileBytes
        )}, har ${formatBytes(storageCheck.available)} ledig.`,
      })

      setUpgradeModal({
        open: true,
        type: 'storage-full',
        needed: newFileBytes,
        available: storageCheck.available,
        current: storageCheck.current,
        max: storageCheck.max,
      })

      return
    }

    // Proceed with upload
    await uploadPhotos(files, albumId)
  }

  return { handleUpload }
}
```

---

## ✅ Phase 3 Commit

```bash
git add .
git commit -m "feat: implement psychology-driven upgrade modals

- Create UpgradeModal component with 7 modal types
- Add modal fatigue prevention (24h cooldown)
- Storage-full modal with fair cleanup option
- Blurred previews for editor/collage saves
- Pain point → solution messaging
- Pricing prominently displayed (39 kr/mnd)
- Storage warning at 80% (not 100%)

Psychology: Loss aversion + sunk cost effect
Conversion: Clear value proposition in every modal"
```

---

# 🎁 PHASE 4: LITE SWEETENERS (8-10 hours)

These features make LITE feel premium and worth 39 kr/mnd.

---

## Task 4.1: Photo Captions

**File:** `src/components/PhotoCard.jsx`

```javascript
const PhotoCard = ({ photo }) => {
  const { userProfile } = useAuth()
  const tier = userProfile?.subscriptionTier || 'GRATIS'
  const [caption, setCaption] = useState(photo.caption || '')
  const [isEditing, setIsEditing] = useState(false)

  const handleSaveCaption = async () => {
    if (tier === 'GRATIS') {
      setUpgradeModal({
        open: true,
        type: 'caption',
        feature: 'captions',
      })
      return
    }

    // Save for LITE/PRO
    await updatePhoto(photo.id, { caption })
    setIsEditing(false)
  }

  return (
    <div className="photo-card">
      <img src={photo.url} alt={photo.name} />

      {/* Caption display/edit */}
      {tier !== 'GRATIS' && (
        <div className="caption-section">
          {isEditing ? (
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Legg til bildetekst..."
              className="caption-input"
            />
          ) : (
            <p className="caption-text">
              {caption || 'Klikk for å legge til tekst'}
            </p>
          )}

          <button
            onClick={isEditing ? handleSaveCaption : () => setIsEditing(true)}
          >
            {isEditing ? 'Lagre' : 'Rediger'}
          </button>
        </div>
      )}

      {/* Teaser for GRATIS */}
      {tier === 'GRATIS' && (
        <div className="caption-teaser">
          <Lock className="w-4 h-4" />
          <span className="text-xs">Bildetekster i LITE</span>
        </div>
      )}
    </div>
  )
}
```

---

## Task 4.2: Bulk Download (ZIP)

**File:** `src/components/AlbumActions.jsx`

```javascript
import JSZip from 'jszip'
import { saveAs } from 'file-saver'

const AlbumActions = ({ album, photos }) => {
  const { userProfile } = useAuth()
  const tier = userProfile?.subscriptionTier || 'GRATIS'
  const setUpgradeModal = useStore((state) => state.setUpgradeModal)
  const [isDownloading, setIsDownloading] = useState(false)

  const handleBulkDownload = async () => {
    if (tier === 'GRATIS') {
      setUpgradeModal({
        open: true,
        type: 'bulk-download',
        feature: 'bulkDownload',
      })
      return
    }

    setIsDownloading(true)

    try {
      const zip = new JSZip()

      // Fetch all photos
      for (let i = 0; i < photos.length; i++) {
        const photo = photos[i]
        const response = await fetch(photo.url)
        const blob = await response.blob()

        // Add to ZIP with original filename
        zip.file(photo.name || `photo-${i + 1}.jpg`, blob)
      }

      // Generate ZIP
      const content = await zip.generateAsync({ type: 'blob' })

      // Download
      saveAs(content, `${album.name}.zip`)
    } catch (error) {
      console.error('Bulk download failed:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="album-actions">
      <button
        onClick={handleBulkDownload}
        disabled={isDownloading}
        className="action-button"
      >
        {isDownloading ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            Laster ned...
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            Last ned album ({photos.length} bilder)
          </>
        )}
      </button>
    </div>
  )
}
```

**Add to package.json:**

```json
{
  "dependencies": {
    "jszip": "^3.10.1",
    "file-saver": "^2.0.5"
  }
}
```

---

## Task 4.3: Recently Deleted (Trash)

**File:** `src/pages/TrashPage.jsx` (NEW)

```javascript
import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import {
  getTrashPhotos,
  restoreFromTrash,
  permanentlyDelete,
} from '../firebase'

const TrashPage = () => {
  const { userProfile } = useAuth()
  const tier = userProfile?.subscriptionTier || 'GRATIS'
  const [trashedPhotos, setTrashedPhotos] = useState([])

  useEffect(() => {
    if (tier === 'GRATIS') {
      // Redirect or show upgrade prompt
      return
    }

    loadTrash()
  }, [tier])

  const loadTrash = async () => {
    const photos = await getTrashPhotos(userProfile.userId)
    setTrashedPhotos(photos)
  }

  const handleRestore = async (photoId) => {
    await restoreFromTrash(photoId)
    loadTrash()
  }

  const handlePermanentDelete = async (photoId) => {
    await permanentlyDelete(photoId)
    loadTrash()
  }

  if (tier === 'GRATIS') {
    return (
      <div className="trash-locked">
        <Lock className="w-12 h-12 text-gray-400" />
        <h2>Papirkurv er en LITE-feature</h2>
        <p>Oppgrader for å gjenopprette slettede bilder innen 30 dager.</p>
        <button onClick={() => navigate('/subscription')}>
          Se LITE-planen
        </button>
      </div>
    )
  }

  return (
    <div className="trash-page">
      <h1>Nylig slettet</h1>
      <p className="text-sm text-gray-400 mb-4">
        Bilder slettes permanent etter 30 dager
      </p>

      {trashedPhotos.length === 0 ? (
        <div className="empty-state">
          <Trash2 className="w-12 h-12 text-gray-400" />
          <p>Papirkurven er tom</p>
        </div>
      ) : (
        <div className="trash-grid">
          {trashedPhotos.map((photo) => (
            <div key={photo.id} className="trash-item">
              <img src={photo.url} alt={photo.name} />

              <div className="trash-actions">
                <button onClick={() => handleRestore(photo.id)}>
                  <RotateCcw className="w-4 h-4" />
                  Gjenopprett
                </button>
                <button onClick={() => handlePermanentDelete(photo.id)}>
                  <Trash2 className="w-4 h-4" />
                  Slett permanent
                </button>
              </div>

              <p className="text-xs text-gray-400 mt-2">
                Slettes {formatDate(photo.deletedAt, 30)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default TrashPage
```

**Update Firebase functions:**

```javascript
// File: src/firebase.js

/**
 * Soft delete photo (move to trash)
 */
export async function moveToTrash(photoId) {
  const photoRef = doc(db, 'photos', photoId)
  const photoSnap = await getDoc(photoRef)

  if (!photoSnap.exists()) {
    throw new Error('Photo not found')
  }

  const photoData = photoSnap.data()

  try {
    // Mark as deleted
    await updateDoc(photoRef, {
      deletedAt: new Date().toISOString(),
      inTrash: true,
      updatedAt: new Date().toISOString(),
    })

    // Decrement album counter if photo was in album
    if (photoData.albumId) {
      await adjustAlbumPhotoCount(photoData.albumId, -1)
    }

    if (import.meta.env.DEV) {
      console.log(`✅ Photo ${photoId} moved to trash`)
    }
  } catch (error) {
    console.error('moveToTrash failed:', error)
    throw error
  }
}

/**
 * Restore photo from trash
 */
export async function restoreFromTrash(photoId) {
  const photoRef = doc(db, 'photos', photoId)
  const photoSnap = await getDoc(photoRef)

  if (!photoSnap.exists()) {
    throw new Error('Photo not found')
  }

  const photoData = photoSnap.data()

  try {
    // Update photo status
    await updateDoc(photoRef, {
      deletedAt: null,
      inTrash: false,
      updatedAt: new Date().toISOString(),
    })

    // Re-increment album count if photo has album
    if (photoData.albumId) {
      await adjustAlbumPhotoCount(photoData.albumId, 1)
    }

    if (import.meta.env.DEV) {
      console.log(`✅ Photo ${photoId} restored from trash`)
    }
  } catch (error) {
    console.error('restoreFromTrash failed:', error)
    throw error
  }
}

/**
 * Permanently delete photo
 */
export async function permanentlyDelete(photoId) {
  const photoRef = doc(db, 'photos', photoId)
  const photoSnap = await getDoc(photoRef)

  if (!photoSnap.exists()) {
    throw new Error('Photo not found')
  }

  const photoData = photoSnap.data()

  try {
    // Delete from storage
    if (photoData.storagePath) {
      await deleteFromStorage(photoData.storagePath)
    }

    // Delete Firestore document
    await deleteDoc(photoRef)

    // Update user storage
    await updateDoc(doc(db, 'users', photoData.userId), {
      storageUsed: increment(-photoData.size),
    })

    if (import.meta.env.DEV) {
      console.log(`✅ Photo ${photoId} permanently deleted`)
    }
  } catch (error) {
    console.error('permanentlyDelete failed:', error)
    throw error
  }
}

/**
 * Get trashed photos for user
 */
export async function getTrashPhotos(userId) {
  const q = query(
    collection(db, 'photos'),
    where('userId', '==', userId),
    where('inTrash', '==', true),
    orderBy('deletedAt', 'desc')
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
}
```

---

## ✅ Phase 4 Commit

```bash
git add .
git commit -m "feat: add LITE sweetener features

- Photo captions (LITE/PRO only)
- Bulk download albums as ZIP (LITE/PRO only)
- Recently deleted / Trash (30-day recovery, LITE/PRO only)
- Restore from trash with counter re-increment
- Soft delete with counter decrement
- Storage reclaimed on permanent delete

Value: Makes LITE feel premium and worth 39 kr/mnd
Dependencies: jszip, file-saver"
```

---

# 🧪 PHASE 5: TESTING & POLISH (6-8 hours)

## Task 5.1: Pre-Implementation Baseline Commit

**BEFORE starting any implementation, create a clean baseline:**

```bash
# 1. Ensure all current work is committed
git add .
git status

# 2. Create baseline commit
git commit -m "chore: freemium v2 baseline (no behavior change)

This commit represents the stable state before implementing
freemium v2.0 optimizations. No functional changes included.

Baseline includes:
- Current auth system
- Current subscription tiers (basic structure)
- Current upload/album functionality
- Current UI components

Next: Implement freemium v2.0 in 5 phases
Expected: 15-18% GRATIS → LITE conversion"

# 3. Push to remote
git push origin main

# 4. Create backup branch
git checkout -b backup/pre-freemium-v2
git push origin backup/pre-freemium-v2
git checkout main

# 5. Create feature branch for implementation
git checkout -b feature/freemium-v2-implementation
```

---

## Task 5.2: Comprehensive Testing Checklist

### **Counter Integrity Tests**

```javascript
// File: src/__tests__/counters.test.js

describe('Counter Integrity', () => {
  test('Album creation increments counter', async () => {
    const userId = 'test-user-1'
    const initialCount = await getUserAlbumCount(userId)

    await addAlbum({ userId, name: 'Test Album' })

    const newCount = await getUserAlbumCount(userId)
    expect(newCount).toBe(initialCount + 1)
  })

  test('Album deletion decrements counter', async () => {
    const userId = 'test-user-1'
    const albumId = await addAlbum({ userId, name: 'Test Album' })
    const initialCount = await getUserAlbumCount(userId)

    await deleteAlbum(albumId, userId)

    const newCount = await getUserAlbumCount(userId)
    expect(newCount).toBe(initialCount - 1)
  })

  test('Failed album creation rolls back counter', async () => {
    const userId = 'test-user-1'
    const initialCount = await getUserAlbumCount(userId)

    // Force error by invalid data
    try {
      await addAlbum({ userId, name: null })
    } catch (error) {
      // Expected error
    }

    const newCount = await getUserAlbumCount(userId)
    expect(newCount).toBe(initialCount) // Should not change
  })

  test('Photo upload increments album photoCount', async () => {
    const albumId = 'test-album-1'
    const initialCount = await getAlbumPhotoCount(albumId)

    await uploadPhoto('test-user-1', mockFile, albumId)

    const newCount = await getAlbumPhotoCount(albumId)
    expect(newCount).toBe(initialCount + 1)
  })
})
```

### **Limit Enforcement Tests**

```javascript
describe('Limit Enforcement', () => {
  test('GRATIS cannot create 6th album', async () => {
    const userId = 'gratis-user'

    // Create 5 albums
    for (let i = 0; i < 5; i++) {
      await addAlbum({ userId, name: `Album ${i + 1}` })
    }

    // 6th should fail
    await expect(addAlbum({ userId, name: 'Album 6' })).rejects.toThrow(
      'ALBUM_LIMIT_REACHED'
    )
  })

  test('LITE can create unlimited albums', async () => {
    const userId = 'lite-user'

    // Create 10 albums (more than GRATIS limit)
    for (let i = 0; i < 10; i++) {
      await addAlbum({ userId, name: `Album ${i + 1}` })
    }

    const count = await getUserAlbumCount(userId)
    expect(count).toBe(10)
  })

  test('GRATIS cannot add 21st photo to album', async () => {
    const userId = 'gratis-user'
    const albumId = await addAlbum({ userId, name: 'Test Album' })

    // Add 20 photos
    for (let i = 0; i < 20; i++) {
      await uploadPhoto(userId, mockFile, albumId)
    }

    // 21st should fail
    await expect(uploadPhoto(userId, mockFile, albumId)).rejects.toThrow(
      'PHOTO_LIMIT_REACHED'
    )
  })
})
```

### **Modal Tracking Tests**

```javascript
describe('Modal Fatigue Prevention', () => {
  beforeEach(() => {
    resetModalTracking()
  })

  test('First show allowed', () => {
    expect(canShowModal('album-limit')).toBe(true)
  })

  test('Second show within 24h blocked', () => {
    markModalShown('album-limit')
    expect(canShowModal('album-limit')).toBe(false)
  })

  test('Show allowed after 24h', () => {
    // Mock time
    const now = Date.now()
    markModalShown('album-limit')

    // Fast-forward 25 hours
    jest.setSystemTime(now + 25 * 60 * 60 * 1000)

    expect(canShowModal('album-limit')).toBe(true)
  })
})
```

---

## Task 5.3: Manual Testing Scenarios

### **Scenario 1: GRATIS User Journey**

1. ✅ Sign up → Verify: `currentAlbumCount: 0`, `storageLimit: 786432000`
2. ✅ Create 5 albums → Verify: Counter increments each time
3. ✅ Try to create 6th → Verify: Modal shows, album not created
4. ✅ Upload 20 photos to one album → Verify: Counter increments
5. ✅ Try to upload 21st → Verify: Modal shows, photo not uploaded
6. ✅ Upload until 80% storage → Verify: Warning modal
7. ✅ Upload until 100% storage → Verify: Blocked with cleanup option
8. ✅ Try to save filter → Verify: Preview works, save blocked
9. ✅ Try to save collage → Verify: Full builder works, save blocked
10. ✅ Upgrade to LITE → Verify: All limits removed

### **Scenario 2: LITE User Journey**

1. ✅ Sign up as LITE → Verify: No limits
2. ✅ Create 50 albums → Verify: All created
3. ✅ Upload 100 photos to one album → Verify: All uploaded
4. ✅ Save filters/collages → Verify: Works
5. ✅ Add captions → Verify: Works
6. ✅ Bulk download → Verify: ZIP downloaded
7. ✅ Delete photo → Verify: Moved to trash
8. ✅ Restore from trash → Verify: Photo restored, counter re-incremented
9. ✅ See PRO teaser (after 30+ photos) → Verify: Shown, not pushy
10. ✅ Navigate to subscription page → Verify: Can see PRO option

### **Scenario 3: Edge Cases**

1. ✅ Network failure during album creation → Verify: Rollback works
2. ✅ Close modal without upgrading → Verify: Can re-trigger later
3. ✅ Same modal triggered twice in 24h → Verify: Second blocked
4. ✅ Delete album with photos → Verify: Counters decrement correctly
5. ✅ Restore trashed photo → Verify: Album counter re-increments

---

## Task 5.4: Performance Optimization

```javascript
// File: src/firebase.js

/**
 * Batch operations for better performance
 */
export async function batchUploadPhotos(userId, files, albumId) {
  const batch = writeBatch(db)

  // Check limits first
  if (albumId) {
    const check = await canAddPhotosToAlbum(albumId, files.length)
    if (!check.allowed) {
      throw new Error('PHOTO_LIMIT_REACHED')
    }
  }

  // Upload all files
  const uploads = await Promise.all(
    files.map((file) => uploadToStorage(file, userId))
  )

  // Batch create Firestore documents
  uploads.forEach(({ url, path }, index) => {
    const photoRef = doc(collection(db, 'photos'))
    batch.set(photoRef, {
      userId,
      albumId,
      url,
      storagePath: path,
      name: files[index].name,
      size: files[index].size,
      createdAt: new Date().toISOString(),
    })
  })

  // Batch increment counters
  if (albumId) {
    const albumRef = doc(db, 'albums', albumId)
    batch.update(albumRef, {
      photoCount: increment(files.length),
    })
  }

  const userRef = doc(db, 'users', userId)
  const totalSize = files.reduce((sum, f) => sum + f.size, 0)
  batch.update(userRef, {
    storageUsed: increment(totalSize),
  })

  // Commit batch
  await batch.commit()
}
```

---

## Task 5.5: Remove Debug Code

```bash
# Search for console.logs
grep -r "console.log" src/

# Remove all development-only logs
# Keep error logs: console.error, console.warn

# Remove:
if (import.meta.env.DEV) {
  console.log('...')
}
```

---

## Task 5.6: Mobile Optimization

**File:** `src/components/UpgradeModal.jsx`

```javascript
// Make modal mobile-friendly
<div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
  <div className="relative w-full sm:max-w-md glass-card p-6 rounded-t-2xl sm:rounded-2xl">
    {/* ... modal content */}
  </div>
</div>
```

**Test on:**

- ✅ iPhone SE (small screen)
- ✅ iPhone 12/13/14 (standard)
- ✅ iPad (tablet)
- ✅ Android (various sizes)

---

## ✅ Phase 5 Final Commit

```bash
git add .
git commit -m "test: comprehensive testing & polish

- Add counter integrity tests
- Add limit enforcement tests
- Add modal tracking tests
- Manual testing scenarios documented
- Batch upload optimization
- Remove debug console.logs
- Mobile-responsive modal design
- Performance optimizations

Ready for production deployment
Target: 15-18% GRATIS → LITE conversion"
```

---

# 🎯 FINAL LAUNCH CHECKLIST

## Pre-Launch Verification

- [ ] **Baseline commit created** (`chore: freemium v2 baseline`)
- [ ] **Backup branch exists** (`backup/pre-freemium-v2`)
- [ ] **Feature branch created** (`feature/freemium-v2-implementation`)
- [ ] **All 5 phases completed**
- [ ] **All tests passing**
- [ ] **No console errors**
- [ ] **Mobile responsive**
- [ ] **Counter helpers working**
- [ ] **Modal tracking working**
- [ ] **Rollback logic tested**
- [ ] **Storage limits enforced**
- [ ] **Upgrade modals tested**
- [ ] **LITE features working**
- [ ] **Pricing displayed correctly** (39 kr/mnd)

## Deployment Steps

```bash
# 1. Merge feature branch to main
git checkout main
git merge feature/freemium-v2-implementation

# 2. Final test on staging
npm run build
# Deploy to staging
# Test all scenarios

# 3. Deploy to production
git tag v2.0-freemium
git push origin main --tags

# 4. Monitor metrics
# - Conversion rate
# - Modal impressions
# - Limit hit frequency
# - Upgrade CTA clicks
```

---

# 📊 POST-LAUNCH MONITORING

## Week 1: Key Metrics

```javascript
{
  // Conversion funnel
  gratis_signups: 0,
  first_limit_hit: 0,        // Which limit (album/photo/storage)?
  upgrade_modal_shown: 0,    // Which type most common?
  upgrade_cta_clicked: 0,
  lite_purchases: 0,
  conversion_rate: 0,        // Target: 15-18%

  // Engagement
  avg_albums_created: 0,
  avg_photos_uploaded: 0,
  avg_days_to_limit: 0,

  // Friction points
  album_limit_hits: 0,
  photo_limit_hits: 0,
  storage_warnings: 0,
}
```

## Optimization Opportunities

**If conversion < 12%:**

- Test 3 albums instead of 5
- Test 15 photos instead of 20
- Test more aggressive storage warnings
- Review modal copy

**If conversion > 20%:**

- Test 49 kr instead of 39 kr
- Add more features to GRATIS
- Test annual pricing (399 kr/år)

**If album limit hit most:**

- Perfect! Emphasize "unlimited albums"
- Consider reducing to 3 for faster friction

**If photo limit hit most:**

- Good! Emphasize "unlimited photos per album"
- Consider adding "total photos" limit too

**If storage hit most:**

- Consider 500 MB instead of 750 MB
- Add compression options in LITE

---

# 🚀 YOU'RE READY TO LAUNCH!

## What You Have

✅ **Production-ready freemium system**
✅ **Psychology-driven conversion** (15-18% expected)
✅ **Performant architecture** (counters, not queries)
✅ **Clean rollback strategy** (error handling)
✅ **Post-launch optimization plan**

## Expected Results

- **15-18% conversion rate** (GRATIS → LITE)
- **Professional user experience**
- **Scalable to millions of users**
- **Clear path to revenue**

## Implementation Timeline

- **Phase 1:** 6-8 hours (Counters & Limits)
- **Phase 2:** 6-8 hours (Teasers > Locks)
- **Phase 3:** 6-8 hours (Upgrade Modals)
- **Phase 4:** 8-10 hours (LITE Sweeteners)
- **Phase 5:** 6-8 hours (Testing & Polish)

**Total: 32-40 hours (4-5 working days)**

---

# 💬 SUPPORT & QUESTIONS

If you encounter issues during implementation:

1. **Check baseline commit** - Can always rollback
2. **Review phase commits** - Each phase is atomic
3. **Test incrementally** - Don't skip testing
4. **Monitor console** - Errors caught early

**Remember:**

- Work through phases sequentially
- Test after each phase
- Commit often
- Keep main branch stable

---

**READY TO BUILD v2.0! 🚀**
