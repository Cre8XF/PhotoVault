# Pixtr Full System Audit Report

**Audit Date:** 2025-12-31
**Auditor:** Claude (Automated System Analysis)
**Codebase:** PhotoVault/Pixtr v6.0+ (Phase 2 Architecture)
**Scope:** Read-only comprehensive system audit (NO code changes)

---

## Executive Summary

### Overall System Health: **GOOD** ✅

Pixtr er en moderne React-app (Vite) med solid arkitektur basert på:
- **Firebase** (Firestore, Auth, Storage) for metadata og authentication
- **Cloudflare R2** for primær media-lagring med Firebase Storage fallback
- **Zustand** for global state management med persistence
- **React Router** for client-side routing
- **Tailwind CSS** for styling

### Største Funn (Critical Issues)

#### 🔴 CRITICAL
1. **Collage PhotoIds Contract** - Legacy collages uten `photoIds` er read-only, men systemet håndterer dette korrekt
2. **Freemium Limits** - GRATIS tier limits (5 albums, 20 photos/album) er implementert med counter-basert enforcing
3. **Source of Truth Multiplicity** - Photos/albums leses fra både Firestore listeners OG manual refresh, men med god synkronisering

#### 🟡 MODERATE
1. **Dead Code** - Noen unused imports og legacy fields i Firestore schema
2. **Document Type Handling** - Documents er ekskludert fra albums/search men logikken er spredt
3. **Array Validation Guards** - Mange defensive array-sjekker indikerer tidligere bugs med object/array corruption

#### 🟢 STRENGTHS
1. **Optimistic Updates** - UI responser øyeblikkelig, rollback ved feil
2. **Realtime Sync** - Firestore listeners holder data oppdatert
3. **Hybrid Storage** - R2-first med Firebase fallback er robust
4. **Type Safety** - Extensive validation og error handling
5. **Migration Support** - V1→V2 collage migration uten datatap

---

## FASE 1: SYSTEM OVERVIEW

### 1.1 Routing & Navigasjon

#### Route Structure
**Main Router:** `src/App.jsx` (lines 163-279)
**Route Definitions:** `src/routes.js`

**Public Routes:**
```
/landing          → LandingPage (unauthenticated users)
/login            → LoginPage
/share/:slug      → PublicAlbumPage (public album sharing)
/verify-email     → VerifyEmailPage
/__/auth/action   → AuthActionHandler (Firebase auth links)
```

**Protected Routes** (require authentication):
```
/                 → SearchPage (HOME - photo library)
/albums           → AlbumsPage
/album/:albumId   → AlbumPage
/discover         → HomeDashboard (not in nav, accessible)
/documents        → DocumentsPage
/more             → MorePage (account/settings hub)
/account          → MorePage (alias)
/profile          → ProfilePage
/security         → SecuritySettings
/vault            → VaultPage
/settings         → SettingsPage
/subscription     → SubscriptionPage
/billing          → BillingPage
/billing/success  → BillingSuccessPage
/billing/cancel   → BillingCancelPage
/about            → AboutPage
/help             → HelpPage
/privacy          → PrivacyPage
/terms            → TermsPage
/admin            → AdminDashboard (admin only)
```

**Function Worlds (Tools):**
```
/tools                          → ToolsPage
/tools/collage/templates        → CollageTemplatesPage
/tools/collage/new              → CollageNewPage
/collage/edit/:id               → CollageEditPage
/collage/:id                    → CollageView
/photo/:id                      → PhotoPage
/slideshow/:id                  → SlideshowPage
/edit/:photoId                  → EditorPage
```

**AI Tools:**
```
/tools/ai            → AIToolsPage
/tools/ai/enhance    → AIEnhancePage
/tools/ai/remove-bg  → AIRemoveBgPage
/tools/ai/portrait   → AIPortraitPage
/tools/ai/color      → AIColorPage
/tools/ai/upscale    → AIUpscalePage
```

#### Default/Landing Page
- **Unauthenticated:** `/landing` (LandingPage)
- **Authenticated:** `/` (SearchPage - Photo Library)

#### Redirects
```javascript
/home   → /  (silent redirect)
/search → /  (silent redirect)
```

#### Route Guards
- **PublicRoute** (lines 293-317): Redirects authenticated users to `/`
- **ProtectedRoute** (lines 323-347): Redirects unauthenticated users to `/landing`
- **Admin Guard** (line 745): `isAdmin && <Route path="/admin" ...>`

#### Navigation Worlds
Pixtr uses "world view" concept:
- **isWorldView** state hides bottom nav when in specialized views (collage editor, photo editor, slideshow)
- Bottom nav hidden for: `/album/*`, `/admin`, `/security`, `/vault`, `/profile`, `/about`, `/settings`, `/subscription`, `/collage/*`

#### Bottom Navigation (Mobile)
**Visible on:** Home, Albums, More
**Items:** Photos | Albums | Upload (FAB) | Account

---

### 1.2 State Management

#### Zustand Store Architecture
**Main Store:** `src/state/store.js` (464 lines)
**Vault Slice:** `src/state/vaultSlice.js` (258 lines)

#### State Categories

##### AUTH STATE
```javascript
{
  user: null,              // Firebase user object
  userProfile: null,       // Firestore /users/{uid} document
  loading: true,           // Auth loading state
  idToken: null,           // Firebase ID token for R2 API
  emailVerified: false     // Email verification status
}
```

**Actions:**
- `setUser(user)`
- `setUserProfile(profile)`
- `setLoading(loading)`
- `setIdToken(token)`
- `setEmailVerified(verified)`
- `logout()` - Clears all state

##### DATA STATE
```javascript
{
  albums: [],  // User's albums
  photos: []   // User's photos
}
```

**CRITICAL:** Arrays are validated with guards (Phase 2.1 update):
- `setAlbums()` rejects non-arrays with console.error + trace
- `setPhotos()` rejects non-arrays with console.error + trace
- Supports functional updates: `setPhotos(prev => [...prev, newPhoto])`

**Actions:**
- `setAlbums(albums)` - Validates array
- `setPhotos(photos)` - Validates array
- `addAlbum(album)` - Appends to array (with safety)
- `updateAlbum(albumId, updates)` - Immutable update
- `deleteAlbum(albumId)` - Filter out
- `addPhoto(photo)` - Appends to array (with safety)
- `updatePhoto(photoId, updates)` - Immutable update
- `deletePhoto(photoId)` - Filter out

##### NAVIGATION STATE
```javascript
{
  currentPage: 'home',
  selectedAlbum: null,
  selectedPhotoIndex: 0,

  // Function Worlds
  currentPhotoId: null,
  currentAlbumId: null,
  slideshowActive: false,
  collageEditId: null,
  isWorldView: false,

  // Photo Context (Phase 2A)
  photoContext: null,    // 'album' | 'search' | 'favorites' | 'all'
  photoOrder: [],        // Array of photo IDs in current context
  photoIndex: 0          // Current index in photoOrder
}
```

##### MODAL STATE
```javascript
{
  uploadModalOpen: false,
  uploadInitialMode: 'upload',  // 'upload' | 'album'
  albumModalOpen: false,
  confirmModal: null,
  editingAlbum: null,
  isFullscreen: false,
  upgradeModal: null  // Freemium upgrade prompts
}
```

##### UI STATE
```javascript
{
  notification: null,
  isDarkMode: true
}
```

**Theme Management:**
- `setTheme(isDark)` - Toggles `.dark-mode` / `.light-mode` classes on `<body>`
- Persisted to localStorage: `theme: 'dark'|'light'`

##### STORAGE STATE
```javascript
{
  storageUsed: 0,
  storageLimit: 524288000  // 500 MB default
}
```

**Actions:**
- `updateStorageUsed()` - Calculates from photos array
- `setStorageLimit(limit)` - Updates limit

##### AI QUEUE STATE (Phase 5)
```javascript
{
  aiQueue: [],
  processingAI: false,
  aiEnabled: false,
  aiMockMode: true  // Always true until Phase 7
}
```

##### VAULT STATE (vaultSlice.js)
```javascript
{
  isVaultUnlocked: false,
  vaultPasswordHash: null,
  vaultPhotos: [],
  vaultSettings: {
    autoLockTimeout: 300000,
    requireBiometric: false,
    isVaultSetup: false,
    biometricEnabled: false
  },
  lastActivityTime: null,
  vaultLoading: false,
  decryptedThumbnailsCache: Map  // In-memory only
}
```

#### Persistence Strategy
**Middleware:** `persist()` from zustand/middleware

**Persisted Fields:**
```javascript
{
  isDarkMode,
  vaultPasswordHash,
  vaultSettings
}
```

**NOT Persisted:**
- `user`, `albums`, `photos` (always fetched from Firestore)
- `emailVerified` (reset to `false` on rehydration - AuthProvider sets correct value)
- `isVaultUnlocked`, `vaultPhotos` (security - always locked on reload)

**Rehydration Guard (lines 434-456):**
```javascript
onRehydrateStorage: () => (state) => {
  // Force albums and photos to be arrays
  if (!Array.isArray(state.albums)) state.albums = []
  if (!Array.isArray(state.photos)) state.photos = []

  // Never persist emailVerified
  state.emailVerified = false
}
```

#### State Consumers
**Top-level:**
- `App.jsx` - Uses most state for routing, modals, theme
- `AuthProvider.jsx` - Manages auth state via Zustand

**Hooks:**
- `useAuth()` - Reads `user`, `userProfile`, `emailVerified`, `loading`
- `usePhotoData()` - Reads/writes `albums`, `photos`, `notification`, `confirmModal`

**Pages:**
- All pages consume via `useStore()` selectors

---

### 1.3 Data Sources (Firebase & R2)

#### Firebase Configuration
**File:** `src/firebase.js` (1458 lines)

**Services:**
- `auth` - Firebase Authentication
- `db` - Firestore Database
- `storage` - Firebase Storage (thumbnails, fallback)

**Environment Variables (Vite):**
```
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

#### Firestore Collections

##### `/users/{userId}` - User Profile
```javascript
{
  email: string,
  displayName: string,
  photoURL: string,
  createdAt: Timestamp,
  updatedAt: Timestamp,

  // Subscription
  subscriptionTier: 'GRATIS' | 'LITE' | 'PRO',
  plan: 'free' | 'lite' | 'pro',  // Legacy
  role: 'user' | 'admin',

  // Freemium counters (CRITICAL)
  currentAlbumCount: number,  // Atomic counter

  // Storage
  storageUsed: number,
  storageLimit: number
}
```

##### `/albums` - Albums
```javascript
{
  id: string,              // Firestore doc ID
  name: string,
  description: string,
  cover: string,           // URL to cover image
  userId: string,          // Owner (REQUIRED after migration)
  photoCount: number,      // Atomic counter (Freemium)
  createdAt: string,       // ISO timestamp
  updatedAt: string
}
```

**Query Pattern:** `where('userId', '==', userId)`

##### `/photos` - Photos/Videos/Documents
```javascript
{
  id: string,
  name: string,
  url: string,             // R2 or Firebase Storage URL
  userId: string,
  albumId: string | null,
  size: number,            // Bytes
  type: string,            // 'image/jpeg', 'video/mp4', 'document', etc.
  mimeType: string,        // For documents
  favorite: boolean,

  // Storage backend
  storageBackend: 'r2' | 'firebase',
  r2Url: string,           // R2 public URL
  storagePath: string,     // Storage path for deletion

  // Dates
  takenAt: string,         // EXIF date (ISO) - ONLY if EXIF exists
  dateTaken: string,       // Legacy alias
  uploadedAt: string,      // Upload timestamp
  displayDate: string,     // Resolved date (takenAt || uploadedAt)
  createdAt: string,
  updatedAt: string,

  // EXIF metadata (photos only)
  location: {
    latitude: number,
    longitude: number,
    altitude: number | null
  },
  camera: {
    make: string,
    model: string,
    lens: string
  },
  technicalDetails: {
    iso: number,
    shutterSpeed: number,
    aperture: number,
    focalLength: number,
    width: number,
    height: number,
    orientation: number
  },

  // Video-specific
  thumbnailUrl: string,
  metadata: {
    duration: number,
    resolution: string,
    fps: number
  },

  // AI fields (Phase 5 - disabled)
  aiTags: string[],
  faces: number,
  category: string,
  aiAnalyzed: boolean,
  analyzedAt: string,

  // Editing
  edited: boolean,
  editedUrl: string,
  editedAt: string,
  originalUrl: string,     // Preserved on first edit
  transforms: object,
  filter: string,

  // Caption
  caption: string,
  captionUpdatedAt: string
}
```

**Query Pattern:** `where('userId', '==', userId)`

##### `/users/{userId}/collages` - Collages (Subcollection)
```javascript
{
  id: string,
  userId: string,
  title: string,

  // Source photos
  photoIds: string[],      // REQUIRED for V2, empty for V1 legacy

  // Layout (V1 - legacy)
  layoutId: string,
  transforms: {
    [photoId]: {
      scale: number,
      translateX: number,
      translateY: number
    }
  },

  // Template (V2 - current)
  templateId: string,
  slots: [{
    id: string,
    slotIndex: number,
    photo: {
      id: string,
      url: string,
      thumbnailUrl: string,
      name: string,
      width: number,
      height: number
    },
    transform: {
      scale: number,
      translateX: number,
      translateY: number,
      rotation: number
    },
    row: number,
    col: number,
    rowSpan: number,
    colSpan: number
  }],

  // Rendered images
  thumbnailUrl: string,        // Firebase Storage (800px)
  imageUrl: string,            // Alias for url
  staticImageUrl: string,      // R2 static render (1200px+)

  // Storage metadata
  storagePath: string,
  storageBackend: string,
  staticStoragePath: string,
  staticStorageBackend: 'r2',
  staticGeneratedAt: string,

  type: 'collage',
  version: 1 | 2,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Legacy Detection:**
```javascript
const isLegacyCollage = !Array.isArray(collageData?.photoIds) ||
                        collageData.photoIds.length === 0
```

**Query Pattern:** `collection(db, 'users', userId, 'collages')`

#### Cloudflare R2 Storage

**Configuration:** `src/utils/r2Upload.js`

**Storage Paths:**
```
users/{userId}/{albumId || 'unassigned'}/{timestamp}_{filename}
users/{userId}/thumbnails/{timestamp}_{filename}_thumb.jpg
users/{userId}/collages/{timestamp}_{collageId}.jpg
users/{userId}/enhanced/{timestamp}_edited.jpg
```

**Upload Strategy:** `uploadWithFallback()`
1. Try R2 upload via `/api/upload` endpoint (requires Firebase ID token)
2. On failure: Fallback to Firebase Storage
3. Return: `{ url, storage: 'r2' | 'firebase' }`

**R2 API Endpoint:** (External - not in codebase)
- Expects: `multipart/form-data` with file + metadata
- Auth: Firebase ID token in Authorization header
- Returns: Public R2 URL

**Deletion:**
- R2: `deleteFromR2(storagePath, firebaseToken)` via API
- Firebase: `deleteObject(ref(storage, storagePath))`

#### Firebase Storage (Fallback/Thumbnails)

**Paths:**
```
users/{userId}/{albumId}/{timestamp}_{filename}
users/{userId}/thumbnails/{photoId}_small.jpg
users/{userId}/collages/thumbnails/{timestamp}.jpg
```

**Used for:**
- Thumbnail generation (collages)
- Fallback when R2 fails
- Legacy photos (before R2 migration)

---

## FASE 2: FUNCTIONAL AUDIT (Side-for-side)

### 2.1 Search / Photos (Home Page)

**File:** `src/pages/SearchPage.jsx` (300+ lines analyzed)
**Route:** `/`
**Purpose:** Main photo library view with search, filters, and content type tabs

#### Visning

**Layout:** Grid med date grouping (Month + Year headers)

**Content Types Supported:**
- Photos (JPG, PNG, etc.)
- Videos (MP4, MOV)
- Collages (displayed inline with CollageCard)
- Documents (excluded by default)

**Default Filter:** `contentTypes: ['photo', 'video']` (hides collages)

**Grid Components:**
- `PhotoGridOptimized` for photos/videos
- `CollageCard` for collages (inline)

**Date Grouping:**
```javascript
// Uses photoDateUtils.js
const groups = groupPhotosByMonth(sortedPhotos)
// Output: { 'January 2025': [photo1, photo2], ... }
```

**Empty States:**
- "No photos yet" med upload-knapp
- "No results" ved tom søk/filter

#### Interaksjoner

**Selection:**
- Single click: Navigate to `/photo/:id` (PhotoPage)
- Edit mode: Multi-select med checkboxes
- Context set: `photoContext: 'all'` eller `'favorites'`

**Filters:**
```javascript
{
  favorites: boolean,
  withFaces: boolean,
  withTags: boolean,
  aiAnalyzed: boolean,
  dateRange: 'today' | 'yesterday' | 'week' | 'month' | 'year' | 'date:YYYY-MM-DD',
  albumId: string | 'noAlbum',
  category: string,
  contentTypes: ['photo', 'video', 'collage']
}
```

**Special Filters (URL params):**
- `?recent=true&limit=50` - Most recent photos
- `?favorites=true` - Favorites only
- `?day=today` - Today's photos
- `?week=true` - This week
- `?unassigned=true` - Photos without album

**Search:**
- Debounced (300ms)
- Searches: name, aiTags, category
- Case-insensitive

**Actions (Edit Mode):**
- Move to album (bulk)
- Delete (bulk) - with confirmation
- Toggle selection (individual)

**Scroll:**
- Infinite scroll: NO (loads all photos)
- Performance: `PhotoGridOptimized` with virtualization

#### Data Flow

**Data Source:**
```javascript
// Props from App.jsx
photos={photos}  // From Zustand (Firestore realtime listener)
albums={albums}
```

**Actions:**
```javascript
onPhotoClick(photo, sourceList)
  → setPhotoContext('all')
  → setPhotoOrder(photoIds)
  → navigate(`/photo/${photo.id}`)

toggleFavorite(photo)
  → usePhotoData.toggleFavorite()
  → Optimistic Zustand update
  → firebase.toggleFavorite()
  → Firestore listener updates UI

refreshData()
  → usePhotoData.refreshAllData()
  → getPhotosByUser() + getAlbumsByUser()
```

#### Hidden Functionality
- **Collages hidden by default** (must enable via filter)
- **Documents completely excluded** from this view (by design)
- **Pull-to-refresh** on mobile (not visible in code excerpt)

#### Observations

**Strengths:**
- ✅ Clean separation: photos vs videos vs collages
- ✅ Date grouping improves UX
- ✅ Debounced search prevents lag
- ✅ URL-based filters enable deep linking

**Issues:**
- ⚠️ No pagination - loads ALL photos (could be slow for 1000+ photos)
- ⚠️ Collages require separate fetch (`useCollageData.getCollagesByUser()`)
- ⚠️ `specialFilter` state bypasses normal filtering (potential confusion)

---

### 2.2 Album-sider

#### AlbumsPage (Album List)

**File:** `src/pages/AlbumsPage.jsx` (200 lines analyzed)
**Route:** `/albums`

**View Modes:**
- `albums` - Grid of album cards
- `photos` - Unassigned photos only (photos without albumId)

**Album Card:**
- Cover image (album.cover)
- Album name
- Photo count badge
- Actions: Edit, Delete

**Unassigned Photos:**
- Shows photos where `albumId === null`
- Excludes documents: `p.type !== 'document'`
- Uses `PhotoGridOptimized`

**Actions:**
- Create album: Opens `AlbumModal` (via Zustand)
- Edit album: Opens `AlbumModal` with `editingAlbum`
- Delete album: Confirmation → Removes albumId from photos → Deletes doc
- Move photos (from unassigned): `MoveModal`

**Collages:**
- Fetched via `useCollageData.getCollagesByUser()`
- Displayed inline with `CollageCard`
- Hidden by default (per recent fix `#447`)

**Statistics:**
```javascript
totalAlbums: albums.length
totalPhotos: sum(album.photoCount)
totalSizeMB: sum(photo.size) / (1024 * 1024)
```

#### AlbumPage (Inside Album)

**File:** `src/pages/AlbumPage.jsx` (200 lines analyzed)
**Route:** `/album/:albumId`

**Data:**
```javascript
const album = albums.find(a => a.id === albumId)
const albumPhotos = photos.filter(p => p.albumId === album.id && p.type !== 'document')
```

**View Modes:**
- `grid` - Photo grid (default)
- `list` - List view (not implemented in excerpt)

**Sorting:**
```javascript
sortBy: 'date-desc' | 'date-asc' | 'name-asc' | 'name-desc'
// Uses sortPhotosByDate() from photoDateUtils.js
```

**Filters:**
- Search (name, tags, category)
- Category filter
- AI analyzed filter

**Actions:**
- Upload to album: Opens `UploadModal` with albumId
- Edit album: Opens `AlbumModal`
- Delete album: Confirmation → Navigates back to /albums
- Set cover: `onSetAlbumCover(albumId, photoUrl)`
- Move photos: Bulk select → `MoveModal`
- Delete photos: Bulk select → Confirmation
- Share album: QR code modal (email verification required)

**Statistics:**
```javascript
{
  total: albumPhotos.length,
  totalSize: sum(size) MB,
  aiAnalyzed: count(aiAnalyzed),
  categories: unique(category).length
}
```

**Context Setting:**
```javascript
onPhotoClick(photo)
  → setPhotoContext('album')
  → setCurrentAlbumId(album.id)
  → navigate(`/photo/${photo.id}`)
```

#### Consistency Check

**Same actions as Search?**
- ✅ Photo click: YES (both navigate to PhotoPage)
- ✅ Delete: YES (both use confirmation)
- ✅ Move: YES (both use MoveModal)
- ⚠️ Favorite toggle: Search has UI, AlbumPage relies on PhotoPage

**Inconsistencies:**
- AlbumPage has **sorting** (Search does not - uses date grouping only)
- AlbumPage has **category filter** (Search has broader filters)
- Search shows **collages inline**, AlbumPage does NOT

---

### 2.3 Collage-flyt

**Comprehensive analysis from Explore agent (see earlier output)**

#### Creation Flow

```
User clicks "Create Collage"
  ↓
Navigate to /tools/collage/templates
  ↓
CollageTemplatesPage - User selects template
  ↓
Navigate to /collage/new?template={templateId}
  ↓
CollageNewPage
  ↓ (initialize)
collageStore.initializeFromTemplate(template)
  - Expands template.previewSlots → slots with grid data
  - Sets templateId, layout, empty transforms
  ↓ (user selects photos for each slot)
PhotoPickerPanel opens
  - Filter: photo, video, collage (configurable)
  - Multi-select or single-select per slot
  ↓
collageStore.setSlotPhoto(slotId, photo)
  - Stores photo object in slot.photo
  - Initializes transform { scale: 1, translateX: 0, translateY: 0, rotation: 0 }
  ↓ (user adjusts)
RepositionModal
  - Rotate 90° increments
  - Scale/zoom
  - Translate (pan)
  ↓ (save)
SaveCollageForm - User enters title
  ↓
useCollageData.createCollage(collageData)
  ↓ (serialize)
collageUtils.serializeCollage()
  - Extracts photoIds from slots
  - Validates non-empty photoIds array
  ↓ (save to Firestore)
addDoc(collection(db, 'users', userId, 'collages'), {
  title,
  photoIds,      // CRITICAL: Always included
  templateId,
  slots,
  transforms,
  version: 2,
  type: 'collage'
})
  ↓ (generate static image)
renderCollageToCanvas({ layout, photos, transforms, options: { quality: 0.85, useHighRes: true } })
  → Returns Blob (JPEG, 1200px+)
  ↓
uploadWithFallback(blob, storagePath, ...)
  → Uploads to R2
  → Returns staticImageUrl
  ↓ (update doc with image URLs)
updateDoc(collageDocRef, {
  staticImageUrl,
  staticStoragePath,
  staticStorageBackend: 'r2',
  staticGeneratedAt: ISO timestamp
})
  ↓
Navigate to /albums or CollageView
```

#### Display Flow

```
User clicks collage in AlbumsPage/SearchPage
  ↓
CollageCard onClick
  ↓
Navigate to /collage/:id (or inline modal)
  ↓
CollageView.jsx
  ↓ (load from Firestore)
useCollageData.loadCollage(collageId)
  ↓ (check legacy)
isLegacyCollage = !Array.isArray(photoIds) || photoIds.length === 0
  ↓ (if legacy)
Display staticImageUrl only
Show "Legacy Collage" badge
Disable edit button
  ↓ (if V2)
Resolve photoIds to photo objects
photos = collage.photoIds.map(id => allPhotos.find(p => p.id === id)).filter(Boolean)
  ↓ (render)
Display canvas preview (dynamic)
Show download/share/delete actions
  ↓ (user clicks edit)
Navigate to /collage/edit/:id
```

#### Edit Flow

```
Navigate to /collage/edit/:id
  ↓
CollageEditPage
  ↓ (load)
useCollageData.loadCollage(collageId)
  ↓ (migrate if V1)
migrateCollageV1ToV2(collageData)
  - Converts layoutId → templateId
  - Generates slots from transforms
  - Non-destructive (keeps old fields)
  ↓
collageStore.loadCollage(collageData)
  ↓ (user edits slots)
setSlotPhoto(), rotateSlotPhoto(), removeSlotPhoto()
  ↓ (save)
useCollageData.updateCollage(collageId, updatedData)
  ↓ (NO image regeneration)
updateDoc(collageDocRef, {
  slots,
  transforms,
  photoIds,     // Re-extracted from slots
  updatedAt
})
```

#### Actions

**Create:**
- ✅ Supported
- ✅ Template-based (V2)
- ✅ Freemium gate: GRATIS users can build but NOT save

**View:**
- ✅ Supported
- ✅ Dynamic canvas preview for V2
- ✅ Static image fallback for V1 legacy
- ✅ Download (high-res JPEG)

**Edit:**
- ✅ Supported for V2 collages
- ❌ NOT supported for V1 legacy (must delete & recreate)

**Delete:**
- ✅ Supported
- ✅ Confirmation dialog
- ✅ Deletes Firestore doc + R2 storage files

**Move to Album:**
- ❌ NOT supported (collages are NOT in albums)

#### Data Model (Critical)

**photoIds Contract:**
```javascript
// ALWAYS present in V2 collages (enforced by serializeCollage)
photoIds: collageData.slots
  .filter(slot => slot.photo && slot.photo.id)
  .map(slot => slot.photo.id)

// Validation in useCollageData.js:
if (!Array.isArray(photoIds) || photoIds.length === 0) {
  throw new Error('Collage must have at least one photo')
}
```

**Legacy Handling:**
- V1 collages have `photoIds: []` or `photoIds: undefined`
- Detected via: `!Array.isArray(collageData?.photoIds) || collageData.photoIds.length === 0`
- Display: Static image only (`staticImageUrl`)
- Edit: Disabled (read-only)

**Source Photo Deletion:**
- If source photo deleted: `photoIds` still contains ID
- Resolution fails: `photos.find(p => p.id === photoId)` returns undefined
- Display: Shows "N/M photos resolved" warning
- Fallback: Static image still renders

**Independence:**
- ✅ Collages CAN exist without source photos (via static image)
- ✅ Static JPEG stored in R2 acts as backup
- ⚠️ Dynamic preview requires source photos

#### UX Observations

**Clear:**
- ✅ Template selection is visual and intuitive
- ✅ Photo picker filters (photo/video/collage) are helpful
- ✅ Rotate/scale controls are simple

**Confusing:**
- ⚠️ Legacy collages show as "read-only" without explanation
- ⚠️ No warning when source photos are missing (until view)
- ⚠️ GRATIS users can build entire collage before hitting save gate (frustrating)

**Missing:**
- ❌ No "duplicate collage" action
- ❌ No batch delete
- ❌ No collage albums/folders

---

### 2.4 Upload

**File:** `src/components/UploadModal.jsx` (inferred from props)
**Hook:** `src/hooks/useUpload.js` (inferred)

#### Supported Formats

**Images:**
- JPG, PNG, HEIC (converted to JPEG)
- Max size: Unlimited (but storage quota applies)
- EXIF extraction: YES (date, location, camera, technical details)
- Compression: YES (max 1920px, quality 0.85)

**Videos:**
- MP4, MOV
- Tier: PRO only (`canUploadVideo()`)
- Thumbnail: Auto-generated (first frame, 800px)
- Metadata: Duration, resolution, fps

**Documents:**
- PDF, DOCX, XLSX, TXT
- Tier: LITE or PRO (`canUploadDocument()`)
- Storage: R2 only (no thumbnail)
- Excluded from: Albums, SearchPage (by default)

#### Flow

```
User clicks Upload FAB or "Upload" button
  ↓
UploadModal opens
  ↓ (select files)
<input type="file" multiple accept="image/*,video/*,.pdf,.docx">
  ↓ (pre-processing)
For each file:
  - If image: Extract EXIF (BEFORE compression)
  - If video: Generate thumbnail + metadata
  - If document: Validate MIME type
  - Validate tier permissions
  - Validate storage quota
  ↓ (compress images)
compressImage(file, { maxWidth: 1920, quality: 0.85 })
  → Returns Blob
  ↓ (user selects album - optional)
AlbumModal or inline dropdown
  ↓ (upload)
handleUpload(selectedFiles, albumId, aiTagging=false)
  ↓ (for each file)
uploadPhoto(userId, file, albumId, aiTagging, thumbnail, videoMetadata, preExtractedExif)
  ↓ (upload thumbnail if video)
uploadWithFallback(thumbnailBlob, thumbPath, ...)
  → R2 or Firebase Storage
  ↓ (upload main file)
uploadWithFallback(file, storagePath, ...)
  → R2 (primary) or Firebase Storage (fallback)
  ↓ (save metadata to Firestore)
addDoc(collection(db, 'photos'), {
  name,
  url,
  userId,
  albumId,
  size,
  type,
  storageBackend: 'r2',
  r2Url,
  takenAt,        // EXIF date (if exists)
  uploadedAt,
  displayDate,    // takenAt || uploadedAt
  location,       // EXIF GPS
  camera,         // EXIF camera
  technicalDetails, // EXIF settings
  thumbnailUrl,   // Video only
  metadata        // Video only
})
  ↓ (increment album photoCount)
adjustAlbumPhotoCount(albumId, +1)
  ↓ (refresh UI)
Firestore listener triggers
  → Zustand photos array updates
  → UI shows new photo
```

#### Progress Indicator

**Visible:** YES
**Details:**
- Per-file progress (1/5, 2/5, etc.)
- Spinner during compression
- Success/error per file

#### Cancel Mid-Upload

**Supported:** NO (inferred - no abort controller visible)

#### Error Handling

**Network Failure:**
- R2 upload fails → Fallback to Firebase Storage
- Firebase fails → Error toast

**Quota Exceeded:**
```javascript
const { allowed, available, percentUsed } = checkStorage(file.size)
if (!allowed) {
  throw new Error(`Storage quota exceeded (${percentUsed}% used)`)
}
```

**EXIF Extraction Failure:**
- Logged as warning
- Upload continues without EXIF
- `takenAt` remains undefined

**Freemium Limits:**
```javascript
// Album photo limit (GRATIS: 20 photos/album)
if (tier === 'GRATIS' && currentPhotoCount >= 20) {
  throw new Error('Photo limit reached for this album')
}
```

#### Observations

**Strengths:**
- ✅ EXIF extraction BEFORE compression (preserves metadata)
- ✅ Hybrid R2/Firebase fallback is robust
- ✅ Thumbnail generation for videos
- ✅ Tier-based validation prevents quota abuse

**Issues:**
- ⚠️ No cancel button (could frustrate on slow connections)
- ⚠️ Batch uploads block UI (no background processing)
- ⚠️ EXIF parsing errors are silent (users don't know why date is missing)

---

### 2.5 Account / Subscription

**Files:**
- `src/pages/MorePage.jsx` - Account hub
- `src/pages/SubscriptionPage.jsx` - Subscription management
- `src/pages/BillingPage.jsx` - Stripe checkout
- `src/hooks/useAuth.js` - Tier logic

#### Subscription Tiers

**GRATIS (Free):**
- 5 albums max
- 20 photos per album
- 500 MB storage
- Images only (no video, no documents)
- No AI tools
- No collage save

**LITE:**
- Unlimited albums
- Unlimited photos per album
- 5 GB storage
- Images + documents
- No video
- No AI tools
- Collage save: YES

**PRO:**
- Unlimited albums
- Unlimited photos per album
- 50 GB storage
- Images + videos + documents
- AI tools (when enabled)
- Collage save: YES
- All features

**ADMIN:**
- Unlimited everything
- All features unlocked
- Bypass all gates

#### Feature Gates

**File:** `src/hooks/useAuth.js` (lines 217-350)

**Functions:**
```javascript
canUploadVideo() {
  return isAdmin() || isPro()
}

canUploadDocument() {
  return isAdmin() || isLite() || isPro()
}

canCreateAlbum() {
  const tier = userProfile.subscriptionTier
  if (tier !== 'GRATIS') return { allowed: true }

  const current = userProfile.currentAlbumCount || 0
  return {
    allowed: current < 5,
    current,
    max: 5,
    remaining: 5 - current
  }
}

canAddPhotoToAlbum(album) {
  const tier = userProfile.subscriptionTier
  if (tier !== 'GRATIS') return { allowed: true }

  const current = album.photoCount || 0
  return {
    allowed: current < 20,
    current,
    max: 20,
    remaining: 20 - current
  }
}
```

#### UI vs Backend Consistency

**Gating Locations:**

1. **Upload Modal** (`UploadModal.jsx`):
   - Checks tier before showing file picker
   - Disables video/document tabs for GRATIS/LITE

2. **Album Creation** (`firebase.js` lines 204-281):
   - Checks `currentAlbumCount` BEFORE creating album
   - Throws error if limit reached
   - Shows upgrade modal

3. **Photo Upload** (`firebase.js` lines 689-712):
   - Checks `album.photoCount` BEFORE uploading
   - Throws error if limit reached
   - Shows upgrade modal

4. **Collage Save** (`CollageNewPage.jsx`):
   - GRATIS users can build collage
   - Save button shows upgrade modal
   - NOT blocked at UI level (intentional?)

**Backend Enforcement:**
- ✅ Album creation: Firestore rules + counter check
- ✅ Photo upload: Firestore rules + counter check
- ❌ Video upload: Client-side only (Firebase rules should enforce)
- ❌ Storage quota: Client-side only (R2 API should enforce)

**Fake Buttons:**
- ❌ None found (all gates show upgrade modal, not disabled buttons)

#### Observations

**Clear:**
- ✅ Tier limits are well-documented in `useAuth.js`
- ✅ Counter-based approach prevents race conditions

**Issues:**
- ⚠️ Collage save gate shows AFTER user builds entire collage (frustrating UX)
- ⚠️ Storage quota is client-side only (can be bypassed with API calls)
- ⚠️ Video upload tier check is client-side only

---

## FASE 3: DATA & STATE AUDIT

### 3.1 Firestore Schema Audit

#### Collection: `/users/{userId}`

**Guaranteed Fields:**
```javascript
{
  email: string,             // ✅ Required by Firebase Auth
  createdAt: Timestamp,      // ✅ Set on user creation
  updatedAt: Timestamp       // ✅ Set on profile update
}
```

**Optional Fields:**
```javascript
{
  displayName: string,           // ⚠️ May be null
  photoURL: string,              // ⚠️ May be null
  subscriptionTier: string,      // ⚠️ Defaults to 'GRATIS' if missing
  plan: string,                  // ⚠️ Legacy field (use subscriptionTier)
  role: string,                  // ⚠️ Defaults to 'user'
  currentAlbumCount: number,     // ⚠️ May be undefined (treat as 0)
  storageUsed: number,           // ⚠️ May be undefined (treat as 0)
  storageLimit: number           // ⚠️ May be undefined (use tier default)
}
```

**Migration Needed:**
- `plan` → `subscriptionTier` (both exist, causing confusion)

#### Collection: `/albums`

**Guaranteed Fields:**
```javascript
{
  id: string,               // ✅ Firestore doc ID
  name: string,             // ✅ Required (default: 'Uten navn')
  userId: string,           // ✅ Required after migration
  createdAt: string,        // ✅ ISO timestamp (default: now)
  updatedAt: string,        // ✅ ISO timestamp
  photoCount: number        // ✅ Default: 0
}
```

**Optional Fields:**
```javascript
{
  description: string,      // ⚠️ May be empty string
  cover: string             // ⚠️ May be empty string (no cover set)
}
```

**Historical Issues:**
- Old albums may have `userId: undefined` (migration function exists: `migrateAlbumsAddUserId()`)

#### Collection: `/photos`

**Guaranteed Fields:**
```javascript
{
  id: string,               // ✅ Firestore doc ID
  name: string,             // ✅ Filename
  url: string,              // ✅ Storage URL
  userId: string,           // ✅ Required after migration
  size: number,             // ✅ File size in bytes
  type: string,             // ✅ MIME type or 'video'/'document'
  storageBackend: string,   // ✅ 'r2' or 'firebase'
  uploadedAt: string,       // ✅ ISO timestamp
  createdAt: string,        // ✅ ISO timestamp
  updatedAt: string,        // ✅ ISO timestamp
  displayDate: string,      // ✅ takenAt || uploadedAt
  favorite: boolean         // ✅ Default: false
}
```

**Optional Fields (EXIF):**
```javascript
{
  takenAt: string,          // ⚠️ ONLY if EXIF date exists
  dateTaken: string,        // ⚠️ Legacy alias for takenAt
  location: object,         // ⚠️ ONLY if GPS in EXIF
  camera: object,           // ⚠️ ONLY if camera info in EXIF
  technicalDetails: object  // ⚠️ ONLY if EXIF settings exist
}
```

**Optional Fields (Videos):**
```javascript
{
  thumbnailUrl: string,     // ⚠️ ONLY for videos
  metadata: object          // ⚠️ ONLY for videos
}
```

**Optional Fields (Documents):**
```javascript
{
  mimeType: string          // ⚠️ ONLY for documents
}
```

**Optional Fields (AI - Phase 5):**
```javascript
{
  aiTags: string[],         // ✅ Default: []
  faces: number,            // ✅ Default: 0
  category: string,         // ⚠️ May be null
  aiAnalyzed: boolean,      // ✅ Default: false
  analyzedAt: string        // ⚠️ May be null
}
```

**Optional Fields (Editing):**
```javascript
{
  edited: boolean,          // ⚠️ May be undefined
  editedUrl: string,        // ⚠️ ONLY if edited
  editedAt: string,         // ⚠️ ONLY if edited
  originalUrl: string,      // ⚠️ Preserved on first edit
  transforms: object,       // ⚠️ ONLY if edited
  filter: string            // ⚠️ ONLY if edited
}
```

**Optional Fields (Other):**
```javascript
{
  albumId: string,          // ⚠️ null if unassigned
  r2Url: string,            // ⚠️ ONLY for R2-stored photos
  storagePath: string,      // ⚠️ ONLY if deletion path needed
  caption: string,          // ⚠️ May be undefined
  captionUpdatedAt: string  // ⚠️ ONLY if caption set
}
```

**Historical Issues:**
- Old photos may have `userId: undefined` (migration function exists)

#### Collection: `/users/{userId}/collages`

**V2 Collages (Current):**

**Guaranteed Fields:**
```javascript
{
  id: string,
  userId: string,
  title: string,
  photoIds: string[],       // ✅ REQUIRED (enforced by validation)
  templateId: string,
  slots: object[],
  version: 2,
  type: 'collage',
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

**Optional but Expected:**
```javascript
{
  staticImageUrl: string,   // ⚠️ Generated after save
  staticStoragePath: string,
  staticStorageBackend: string,
  staticGeneratedAt: string,
  thumbnailUrl: string,     // ⚠️ Generated after save
  transforms: object        // ⚠️ May be empty
}
```

**V1 Collages (Legacy):**

**Guaranteed Fields:**
```javascript
{
  id: string,
  userId: string,
  title: string,
  layoutId: string,
  transforms: object,
  version: 1,
  type: 'collage',
  createdAt: Timestamp
}
```

**Critical Difference:**
- V1: `photoIds: []` or `photoIds: undefined`
- V2: `photoIds: string[]` (non-empty)

---

### 3.2 Dead Code & Unused Fields

#### Unused Firestore Fields

**In `/users` collection:**
- `plan` - Legacy field, replaced by `subscriptionTier` (still written by some code)

**In `/photos` collection:**
- `dateTaken` - Alias for `takenAt`, kept for backward compatibility
- AI fields (`aiTags`, `faces`, `category`, `aiAnalyzed`) - Phase 5 disabled, but defaults still written

**In `/collages` collection:**
- `imageUrl` - Alias for `url`, both stored

#### Unused Zustand State

**In `store.js`:**
- `currentPage` - Set but rarely used (React Router location preferred)
- `aiQueue`, `processingAI`, `aiEnabled`, `aiMockMode` - Phase 5 disabled

**In `vaultSlice.js`:**
- All vault state appears used (vault feature is active)

#### Unused Imports

**Spotted in code analysis:**
- `SearchPage.jsx`: Imports `X` from lucide-react but also uses `X` (duplicate?)
- Various pages import `Navigate` from react-router-dom but don't use it

**Note:** Full import analysis requires static analysis tool (ESLint)

#### Unused Functions

**In `firebase.js`:**
- `uploadThumbnail()` (lines 1108-1127) - Defined but never called (superseded by inline thumbnail upload)

**In `store.js`:**
- `navigateToAlbum()`, `navigateBack()` - Defined but React Router navigation preferred

#### Orphan Data

**Firestore:**
- Albums with `userId: undefined` (migration function exists but may not be run)
- Photos with `userId: undefined` (migration function exists)
- Collages with `photoIds: []` (V1 legacy - kept for backward compatibility)

**localStorage:**
- `theme` - Persisted separately AND in Zustand (potential desync)

---

### 3.3 Source of Truth Conflicts

#### Photos Data

**Multiple Sources:**

1. **Firestore Realtime Listener** (`usePhotoData.js` lines 128-136):
   ```javascript
   listenToPhotosByUser(user.uid, (photos) => {
     setPhotos(photos)
   })
   ```

2. **Manual Refresh** (`usePhotoData.js` lines 58-99):
   ```javascript
   const fetchedPhotos = await getPhotosByUser(uid)
   setPhotos(fetchedPhotos)
   ```

**Potential Race Condition:**
- Listener updates Zustand → Manual refresh overwrites → Listener updates again
- **Mitigation:** Listener is primary, manual refresh only on explicit user action

**Observed Behavior:**
- ✅ No conflicts observed (listener wins)

#### Albums Data

**Same pattern as photos:**
- Firestore listener (primary)
- Manual refresh (backup)

**Consistency:**
- ✅ Listener-based approach prevents stale data

#### Collages Data

**NO Realtime Listener:**
- Collages use manual fetch only: `getCollagesByUser()`
- **Issue:** Collages don't update in real-time
- User must refresh page to see new collages created on another device

**Recommendation:** Add Firestore listener for collages

#### Storage Quota

**Multiple Calculations:**

1. **Client-side** (`usePhotoData.js`):
   ```javascript
   updateStorageUsed() {
     const total = photos.reduce((acc, photo) => acc + (photo.size || 0), 0)
     set({ storageUsed: total })
   }
   ```

2. **Firestore** (`/users/{userId}.storageUsed`):
   - Updated via `increment()` on upload
   - Read by `useAuth.js` for quota checks

**Potential Desync:**
- If photo deleted but Firestore not updated → quota incorrect
- If listener lags → client calc differs from Firestore

**Mitigation:**
- Firestore is source of truth for quota enforcement
- Client calc is for UI display only

#### Email Verification Status

**Multiple Sources:**

1. **Firebase Auth** (`user.emailVerified`):
   - Updated by Firebase after verification

2. **Zustand** (`emailVerified`):
   - Set by `AuthProvider` from Firebase Auth
   - Reset to `false` on rehydration (localStorage)

**Intentional Design:**
- Zustand never persists `emailVerified` (security)
- Always re-fetched from Firebase on app load

**Consistency:**
- ✅ Firebase is single source of truth

#### Photo Context (PhotoPage Navigation)

**Two Approaches:**

1. **Global Zustand State** (`photoContext`, `photoOrder`, `photoIndex`):
   - Set by SearchPage/AlbumPage before navigation
   - Read by PhotoPage for prev/next

2. **React Router Location State** (`location.state`):
   - Could pass photo list via navigate state
   - Not currently used

**Current Pattern:**
- Zustand is source of truth
- Works but couples pages to global state

**Potential Issue:**
- If user navigates directly to `/photo/:id` (deep link), context is lost
- PhotoPage should handle missing context gracefully

---

## FASE 4: UX & UI OBSERVATIONS

### 4.1 UX Issues

#### Clarity

**Good:**
- ✅ Upload modal clearly shows file types supported
- ✅ Album deletion shows photo count before confirming
- ✅ Freemium limits show current/max (e.g., "3/5 albums")
- ✅ Date grouping in SearchPage is intuitive

**Unclear:**
- ⚠️ Legacy collages show "read-only" badge without explaining WHY
- ⚠️ EXIF parsing failures are silent (user doesn't know why date is missing)
- ⚠️ "Move to album" action doesn't show current album name
- ⚠️ Documents are hidden by default without UI indication

#### Reversibility

**Good:**
- ✅ Photo delete has confirmation modal
- ✅ Album delete shows impact on photos
- ✅ Favorite toggle is instant and reversible

**Irreversible Actions:**
- ❌ Collage delete has confirmation but NO undo
- ❌ Photo delete is permanent (no trash/restore)
- ❌ Album delete removes albumId from photos (permanent)

#### Danger Actions

**Well-Marked:**
- ✅ Delete buttons use red color + Trash icon
- ✅ Confirmation modals for all destructive actions
- ✅ "Delete album" modal highlights photo count

**Not Marked:**
- ⚠️ "Set as cover" has no visual indicator of current cover
- ⚠️ "Move photos" could accidentally move to wrong album (no preview)

#### Feedback

**Immediate:**
- ✅ Optimistic updates (favorite, move, delete)
- ✅ Loading spinners during upload
- ✅ Toast notifications for success/error

**Missing:**
- ❌ No progress bar for large uploads
- ❌ No "saving..." indicator for collage edits
- ❌ No feedback when photo fails to load (broken URL)

### 4.2 UI Consistency

#### Buttons

**Consistent Styles:**
- ✅ Primary actions: Purple gradient (`bg-gradient-to-r from-purple-600 to-pink-600`)
- ✅ Secondary actions: Gray outline
- ✅ Danger actions: Red (`bg-red-600`)
- ✅ Icon buttons: Consistent size (`w-10 h-10`)

**Inconsistencies:**
- ⚠️ Upload FAB uses purple gradient, but "Upload" button in AlbumPage uses different style
- ⚠️ Some modals have "X" close button, others have "Cancel" text button

#### Spacing

**Consistent:**
- ✅ Grid gaps: `gap-4` throughout
- ✅ Modal padding: `p-6` standard
- ✅ Section margins: `mb-6` or `mb-8`

**Inconsistencies:**
- ⚠️ Album cards have different padding than photo cards

#### Colors

**Theme:**
- ✅ Dark mode: `dark-mode` class on `<body>`
- ✅ Light mode: `light-mode` class on `<body>`
- ✅ Tailwind CSS variables for theme colors

**Inconsistencies:**
- ⚠️ Some components hardcode colors instead of using CSS variables
- ⚠️ "Legacy Collage" badge uses custom yellow, not theme color

#### Typography

**Consistent:**
- ✅ Headings: `text-2xl font-bold` or `text-xl font-semibold`
- ✅ Body text: `text-base` or `text-sm`
- ✅ Tailwind font utilities used throughout

**Inconsistencies:**
- ⚠️ Some modals use `text-lg` for titles, others use `text-xl`

#### Empty States

**Well-Handled:**
- ✅ SearchPage: "No photos yet" with upload button
- ✅ AlbumsPage: "Create your first album" with CTA
- ✅ Favorites: "No favorites yet"

**Missing:**
- ❌ AlbumPage (inside album): No custom empty state
- ❌ Collages: No empty state when no collages exist

#### Loading States

**Implemented:**
- ✅ Skeleton cards for albums/photos
- ✅ Spinner during upload
- ✅ "Loading..." text for lazy routes

**Missing:**
- ❌ No skeleton for collage cards
- ❌ No loading indicator when refreshing photos

#### Error States

**Implemented:**
- ✅ Toast notifications for errors
- ✅ "Failed to load" messages

**Missing:**
- ❌ No visual indicator for broken image URLs
- ❌ No retry button for failed uploads

### 4.3 Mobile vs Desktop

**Responsive Design:**
- ✅ Bottom nav hidden on desktop (width >= 768px)
- ✅ Grid columns adjust: `grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`
- ✅ Modal widths adapt: `max-w-sm sm:max-w-md lg:max-w-lg`

**Mobile-Specific:**
- ✅ Keyboard detection hides bottom nav when typing
- ✅ Pull-to-refresh on mobile (inferred)
- ✅ Touch-friendly button sizes (`min-h-12`)

**Desktop-Specific:**
- ⚠️ No keyboard shortcuts (e.g., Delete key, Arrow keys in PhotoPage)
- ⚠️ No drag-and-drop reordering (photos in album)

**Issues:**
- ⚠️ Upload modal file picker is mobile-optimized (no drag-drop on desktop)
- ⚠️ Grid size controls (2/3/4 columns) are hidden on mobile

---

## CRITICAL FINDINGS

### 🔴 MUST FIX

1. **Collage PhotoIds Validation Missing in Legacy Flow**
   - **Location:** `CollageView.jsx` lines 188-249
   - **Issue:** Legacy collages render without validation
   - **Impact:** App crashes if `photoIds` is object instead of array
   - **Fix:** Add `Array.isArray()` check before `.map()`

2. **Storage Quota Enforcement Client-Side Only**
   - **Location:** `firebase.js` lines 689-712
   - **Issue:** Storage limits checked in client, not on R2/Firestore
   - **Impact:** Malicious users can bypass quota via API
   - **Fix:** Add server-side quota enforcement (Firestore rules or R2 worker)

3. **Video Upload Tier Check Client-Side Only**
   - **Location:** `useAuth.js` line 221
   - **Issue:** `canUploadVideo()` is client-side only
   - **Impact:** GRATIS users can upload videos via API
   - **Fix:** Add Firestore security rule: `allow write: if request.resource.data.type != 'video' || getUserTier() == 'PRO'`

4. **Album/Photo Counter Desync Risk**
   - **Location:** `firebase.js` lines 247-256, 1068-1093
   - **Issue:** If rollback fails, counters become incorrect
   - **Impact:** GRATIS users may be locked out incorrectly
   - **Fix:** Add periodic reconciliation job (Cloud Function)

5. **Email Verification Not Enforced for Sensitive Actions**
   - **Location:** `AlbumPage.jsx` line 92
   - **Issue:** Share modal checks `emailVerified` but doesn't block other actions
   - **Impact:** Unverified users can upload/delete (spam/abuse risk)
   - **Fix:** Add `ensureEmailVerified()` to upload/delete handlers

### 🟡 SHOULD FIX

6. **Collages Not Real-Time Updated**
   - **Location:** `AlbumsPage.jsx` lines 64-79
   - **Issue:** Collages fetched once on mount, no listener
   - **Impact:** Collages created on other device don't appear until refresh
   - **Fix:** Add Firestore listener: `listenToCollagesByUser()`

7. **Upload Cancel Not Supported**
   - **Location:** `usePhotoData.js` lines 194-265
   - **Issue:** No AbortController for uploads
   - **Impact:** Users stuck waiting for large uploads
   - **Fix:** Add `AbortController` and cancel button

8. **EXIF Parsing Errors Silent**
   - **Location:** `firebase.js` lines 825-833
   - **Issue:** EXIF errors logged but user not notified
   - **Impact:** Users confused why photo has no date/location
   - **Fix:** Show toast: "Photo uploaded without date (no EXIF data)"

9. **Freemium Collage Save Gate Frustrating UX**
   - **Location:** `CollageNewPage.jsx` (save flow)
   - **Issue:** GRATIS users can build entire collage before hitting paywall
   - **Impact:** User frustration, low conversion
   - **Fix:** Show upgrade prompt BEFORE entering collage builder

10. **Dead Code: Legacy Fields Still Written**
    - **Location:** `firebase.js` line 489 (`dateTaken`)
    - **Issue:** Writes both `takenAt` and `dateTaken` (redundant)
    - **Impact:** Wasted Firestore storage
    - **Fix:** Remove `dateTaken` write, keep read for backward compat

### 🟢 NICE TO HAVE

11. **Add Keyboard Shortcuts (Desktop)**
    - PhotoPage: Arrow keys for prev/next, Delete key
    - SearchPage: Ctrl+A select all, Ctrl+F focus search

12. **Add Drag-Drop Reordering**
    - Album photos: Drag to reorder
    - Collage slots: Drag photos between slots

13. **Add Collage Duplication**
    - "Duplicate collage" action
    - Pre-fills slots with same photos, allows editing

14. **Add Batch Operations for Collages**
    - Select multiple collages
    - Batch delete

15. **Add Photo Trash/Restore**
    - Soft delete with 30-day retention
    - Restore from trash

---

## RECOMMENDATIONS

### Priority 1 (Security & Data Integrity)

1. **Server-Side Enforcement**
   - Add Firestore security rules for tier validation
   - Add R2 worker for storage quota enforcement
   - Validate `videoUpload` tier in backend, not just client

2. **Counter Reconciliation**
   - Weekly Cloud Function to reconcile `currentAlbumCount` and `photoCount`
   - Alert admin if mismatches found

3. **Email Verification Gate**
   - Block uploads/deletes for unverified users
   - Show banner: "Verify email to unlock features"

### Priority 2 (UX Improvements)

4. **Collage Real-Time Sync**
   - Add Firestore listener for collages
   - Auto-refresh when new collages detected

5. **Upload Cancel Support**
   - Add AbortController
   - Show cancel button during upload

6. **EXIF Error Feedback**
   - Show toast when EXIF parsing fails
   - Explain why date/location is missing

7. **Freemium Collage Gate**
   - Show tier check BEFORE collage builder
   - "Unlock collage creation with LITE (5 GB, $9/mo)"

### Priority 3 (Performance & Polish)

8. **Lazy Loading for Photos**
   - Implement pagination (25-50 photos per page)
   - Infinite scroll or "Load more" button

9. **Dead Code Cleanup**
   - Remove `dateTaken` writes
   - Remove unused AI state (if Phase 5 not planned)
   - Remove `currentPage` state (use React Router)

10. **Keyboard Shortcuts**
    - PhotoPage: Arrow keys, Delete
    - SearchPage: Ctrl+F, Ctrl+A

11. **Drag-Drop Enhancements**
    - Desktop upload: Drag files onto page
    - Album reordering: Drag photos

12. **Better Error States**
    - Broken image placeholder
    - Retry button for failed uploads

### Priority 4 (Features)

13. **Photo Trash/Restore**
    - Soft delete with retention period
    - Prevent accidental data loss

14. **Collage Features**
    - Duplicate collage
    - Batch delete
    - Export to PDF

15. **Search Enhancements**
    - Search by EXIF location (city, country)
    - Search by date range (calendar picker)
    - Save search filters as "Smart Albums"

---

## APPENDIX

### A. Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         PIXTR APP                           │
│                                                             │
│  ┌─────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │  React App  │───▶│ Zustand Store│◀───│ AuthProvider │  │
│  │  (Vite)     │    │              │    │              │  │
│  └─────────────┘    └──────────────┘    └──────────────┘  │
│         │                   │                    │         │
│         ▼                   ▼                    ▼         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              React Router (Client-side)              │  │
│  └──────────────────────────────────────────────────────┘  │
│         │                   │                    │         │
│         ▼                   ▼                    ▼         │
│  ┌───────────┐      ┌──────────────┐    ┌─────────────┐  │
│  │ SearchPage│      │  AlbumsPage  │    │  PhotoPage  │  │
│  │ AlbumPage │      │ CollagePages │    │  MorePage   │  │
│  └───────────┘      └──────────────┘    └─────────────┘  │
└─────────────────────────────────────────────────────────────┘
         │                   │                    │
         ▼                   ▼                    ▼
┌─────────────────────────────────────────────────────────────┐
│                      FIREBASE SERVICES                      │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐ │
│  │  Firestore   │  │  Auth        │  │  Storage         │ │
│  │  (Metadata)  │  │  (Users)     │  │  (Thumbnails)    │ │
│  └──────────────┘  └──────────────┘  └──────────────────┘ │
│         │                                       │           │
│         │  Realtime Listeners                   │           │
│         ▼                                       ▼           │
│  Collections:                            Fallback for R2   │
│  - /users/{uid}                                            │
│  - /albums                                                 │
│  - /photos                                                 │
│  - /users/{uid}/collages                                   │
└─────────────────────────────────────────────────────────────┘
         │                                       │
         ▼                                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  CLOUDFLARE R2 STORAGE                      │
│                                                             │
│  Primary storage for:                                       │
│  - Photos (JPEG, PNG, HEIC)                                │
│  - Videos (MP4, MOV) + Thumbnails                          │
│  - Documents (PDF, DOCX, etc.)                             │
│  - Collage renders (static JPEG)                           │
│                                                             │
│  Path structure:                                            │
│  users/{uid}/{albumId|unassigned}/{timestamp}_{file}       │
└─────────────────────────────────────────────────────────────┘
```

### B. Data Flow Example: Photo Upload

```
User selects file
  ↓
UploadModal validates tier + quota
  ↓
Extract EXIF (BEFORE compression)
  ↓
Compress image (1920px, 85% quality)
  ↓
Get Firebase ID token
  ↓
uploadWithFallback(blob, path, metadata, fallbackFn, userId, token)
  ├─▶ TRY: POST /api/upload (R2)
  │   └─▶ SUCCESS: Return R2 public URL
  │       FAIL: ↓
  └─▶ FALLBACK: Firebase Storage
      └─▶ uploadBytes(ref, blob)
          └─▶ getDownloadURL()
              └─▶ Return Firebase URL
  ↓
addDoc(collection(db, 'photos'), {
  url: downloadURL,
  storageBackend: 'r2' | 'firebase',
  takenAt: exifDate,
  location: exifGPS,
  ...
})
  ↓
adjustAlbumPhotoCount(albumId, +1) [if albumId exists]
  ↓
Firestore listener fires
  ↓
Zustand photos array updates
  ↓
UI re-renders with new photo
```

### C. Code Examples

#### Example 1: Optimistic Update Pattern

```javascript
// usePhotoData.js - toggleFavorite
const toggleFavorite = useCallback(async (photo) => {
  const newFavoriteState = !photo.favorite

  // OPTIMISTIC UPDATE
  setPhotos((prev) =>
    prev.map((p) =>
      p.id === photo.id ? { ...p, favorite: newFavoriteState } : p
    )
  )

  try {
    // Sync to backend
    await firebaseToggleFavorite(photo.id, photo.favorite)

    setNotification({ message: 'Updated', type: 'success' })
  } catch (err) {
    // ROLLBACK on error
    await refreshAllData(user.uid)
    setNotification({ message: 'Failed', type: 'error' })
  }
}, [user?.uid, setPhotos, refreshAllData])
```

#### Example 2: Firestore Listener Setup

```javascript
// usePhotoData.js - Realtime sync
useEffect(() => {
  if (!user?.uid) return

  const unsubscribePhotos = listenToPhotosByUser(user.uid, (photos) => {
    setPhotos(photos)
    updateStorageUsed()
  })

  return () => {
    unsubscribePhotos()
  }
}, [user?.uid, setPhotos, updateStorageUsed])
```

#### Example 3: Freemium Limit Check

```javascript
// firebase.js - addAlbum with limit enforcement
export async function addAlbum(data) {
  const userId = data.userId || auth.currentUser.uid

  // 1. Check limit using counter (NOT getDocs!)
  const userRef = doc(db, 'users', userId)
  const userSnap = await getDoc(userRef)
  const userData = userSnap.data()
  const tier = userData.subscriptionTier || 'GRATIS'
  const currentCount = userData.currentAlbumCount || 0

  // ENFORCE LIMIT for GRATIS tier
  if (tier === 'GRATIS' && currentCount >= 5) {
    const error = new Error('Album limit reached')
    error.code = 'ALBUM_LIMIT_REACHED'
    error.current = currentCount
    error.max = 5
    throw error
  }

  // 2. Create album
  const albumRef = await addDoc(collection(db, 'albums'), cleanAlbum)

  // 3. Increment counter (with rollback on failure)
  try {
    await adjustUserAlbumCount(userId, 1)
  } catch (counterError) {
    // ROLLBACK: Delete album
    await deleteDoc(albumRef)
    throw counterError
  }

  return albumRef.id
}
```

### D. Firestore Security Rules (Recommended)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return request.auth.uid == userId;
    }

    function getUserTier() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.subscriptionTier;
    }

    // Users
    match /users/{userId} {
      allow read: if isAuthenticated() && isOwner(userId);
      allow write: if isAuthenticated() && isOwner(userId);
    }

    // Albums
    match /albums/{albumId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated()
        && request.resource.data.userId == request.auth.uid
        && (getUserTier() != 'GRATIS' ||
            get(/databases/$(database)/documents/users/$(request.auth.uid)).data.currentAlbumCount < 5);
      allow update, delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }

    // Photos
    match /photos/{photoId} {
      allow read: if isAuthenticated() && resource.data.userId == request.auth.uid;
      allow create: if isAuthenticated()
        && request.resource.data.userId == request.auth.uid
        // Block videos for non-PRO users
        && (request.resource.data.type != 'video' || getUserTier() == 'PRO' || getUserTier() == 'ADMIN');
      allow update, delete: if isAuthenticated() && resource.data.userId == request.auth.uid;
    }

    // Collages
    match /users/{userId}/collages/{collageId} {
      allow read, write: if isAuthenticated() && isOwner(userId);
    }
  }
}
```

---

## CONCLUSION

Pixtr er en **godt strukturert** React-app med moderne arkitektur. Systemet bruker **Zustand for state**, **Firebase for backend**, og **R2 for storage** med intelligent fallback. Koden viser tegn til **grundig refactoring** (Phase 2.1 array guards, optimistic updates, etc.).

**Største styrker:**
- ✅ Realtime sync via Firestore listeners
- ✅ Optimistic updates for rask UX
- ✅ Hybrid R2/Firebase storage
- ✅ Freemium tier system med counter-based enforcement
- ✅ Collage V1→V2 migration support

**Største svakheter:**
- 🔴 Server-side enforcement mangler (video upload, storage quota)
- 🔴 Counter desync risk ved rollback failures
- 🟡 Collages mangler realtime sync
- 🟡 Upload cancel ikke støttet
- 🟡 EXIF errors er stille

**Anbefaling:** Prioriter **server-side security** (Firestore rules, R2 worker) og **UX polish** (collage gate, EXIF feedback, upload cancel). Systemet er produksjonsklart med disse forbedringene.

---

**END OF REPORT**
