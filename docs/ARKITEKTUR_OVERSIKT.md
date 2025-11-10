# PhotoVault - Komponent- og Dataflyt Oversikt

Visuell representasjon av applikasjonens struktur, komponenthierarki og dataflyt.

---

## 📊 Applikasjonsstruktur

```
PhotoVault App
│
├── 🔐 Authentication Layer
│   ├── LoginPage
│   └── PINLockScreen
│
├── 📱 Main Application (App.js)
│   │
│   ├── 🏠 Home Dashboard
│   │   ├── Stats Cards
│   │   ├── Recent Photos Grid
│   │   ├── Favorites Grid
│   │   ├── Smart Albums
│   │   └── Upload Button
│   │
│   ├── 📁 Albums Page
│   │   ├── View Mode Toggle (Grid/List)
│   │   ├── Smart Filters
│   │   ├── Album Cards
│   │   │   ├── Album Cover
│   │   │   ├── Album Title
│   │   │   └── Edit/Delete Buttons (hover)
│   │   └── PhotoGridOptimized (Photo View)
│   │
│   ├── 🖼️ Album Page (Detail)
│   │   ├── Header
│   │   │   ├── Back Button
│   │   │   ├── Album Title
│   │   │   ├── Statistics
│   │   │   └── Edit Button
│   │   ├── Toolbar
│   │   │   ├── View Mode Toggle
│   │   │   ├── Grid Size Selector
│   │   │   ├── Sort Dropdown
│   │   │   └── Filter Toggle
│   │   ├── Filter Panel (conditional)
│   │   │   ├── Search Input
│   │   │   ├── Category Filter
│   │   │   └── AI Filter
│   │   └── Photos Grid/List
│   │       ├── Photo Cards
│   │       ├── Favorite Toggle
│   │       └── Selection Checkboxes (edit mode)
│   │
│   ├── 🔍 Search Page
│   │   ├── Search Input
│   │   ├── Quick Filters
│   │   ├── Advanced Filters Panel
│   │   │   ├── Album Filter
│   │   │   ├── Category Filter
│   │   │   └── Date Filter
│   │   ├── Popular Tags
│   │   ├── Active Filters Display
│   │   └── Results Grid
│   │
│   ├── ⚙️ More Page
│   │   ├── User Profile Card
│   │   │   ├── Profile Image
│   │   │   ├── User Info
│   │   │   └── Pro Badge
│   │   ├── Quick Stats
│   │   ├── Storage Overview
│   │   ├── Account Section
│   │   │   ├── My Profile
│   │   │   ├── Subscription
│   │   │   ├── Logout
│   │   │   └── Delete Account
│   │   ├── Settings Section
│   │   │   ├── Security
│   │   │   ├── Vault (Pro)
│   │   │   └── Notifications
│   │   ├── Customization
│   │   │   ├── Language Picker
│   │   │   └── Theme Toggle
│   │   ├── AI Functions (Coming Soon)
│   │   ├── Admin Tools (admin only)
│   │   └── Info & Help
│   │
│   └── 🛡️ Additional Pages
│       ├── ProfilePage
│       ├── SubscriptionPage
│       ├── SecuritySettings
│       ├── VaultPage (Pro)
│       └── AdminDashboard (admin)
│
└── 🧩 Shared Components
    ├── Modals
    │   ├── UploadModal
    │   ├── AlbumModal
    │   ├── PhotoModal
    │   ├── MoveModal
    │   ├── ConfirmModal
    │   └── ComingSoonModal
    ├── UI Components
    │   ├── LazyImage
    │   ├── PhotoGridOptimized
    │   ├── AlbumCard
    │   ├── Notification (Toast)
    │   ├── NotificationPanel
    │   └── Particles (Background)
    └── Navigation
        └── Bottom Navigation Bar
```

---

## 🔄 Dataflyt-diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Firebase Services                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │              │  │              │  │              │          │
│  │ Firestore DB │  │   Storage    │  │     Auth     │          │
│  │              │  │              │  │              │          │
│  │  - albums    │  │  - photos/   │  │  - users     │          │
│  │  - photos    │  │  - videos/   │  │  - sessions  │          │
│  │  - users     │  │  - vault/    │  │              │          │
│  │              │  │              │  │              │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                  │                   │
└─────────┼─────────────────┼──────────────────┼───────────────────┘
          │                 │                  │
          │                 │                  │
          ▼                 ▼                  ▼
    ┌─────────────────────────────────────────────────┐
    │                                                   │
    │              Custom Hooks Layer                   │
    │                                                   │
    │  ┌──────────────┐  ┌──────────────┐             │
    │  │              │  │              │             │
    │  │  useAuth     │  │ usePhotoData │             │
    │  │              │  │              │             │
    │  │  - user      │  │  - photos    │             │
    │  │  - isPro     │  │  - albums    │             │
    │  │  - isAdmin   │  │  - loading   │             │
    │  │  - profile   │  │  - refresh   │             │
    │  │              │  │  - handlers  │             │
    │  └──────────────┘  └──────────────┘             │
    │                                                   │
    └───────────────────────┬───────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │                         │
              │   Zustand Global Store  │
              │                         │
              │  - storageUsed          │
              │  - storageLimit         │
              │  - notifications        │
              │  - currentPage          │
              │                         │
              └─────────┬───────────────┘
                        │
                        ▼
        ┌───────────────────────────────┐
        │                               │
        │          App.js               │
        │     (State Distribution)      │
        │                               │
        │  - Combines all data          │
        │  - Manages navigation         │
        │  - Handles global modals      │
        │  - Distributes via props      │
        │                               │
        └─────────┬─────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
  ┌──────────┐       ┌──────────┐
  │          │       │          │
  │  Pages   │       │ Modals   │
  │          │       │          │
  └──────────┘       └──────────┘
```

---

## 🎯 Event Flow - Typiske brukerscenarier

### Scenario 1: Last opp bilder

```
User Action                    Component                 Backend
─────────────────────────────────────────────────────────────────

1. Click "Upload"         →   Home/Albums              →
2. Open modal             →   UploadModal opens        →
3. Select files           →   File input triggered     →
4. Choose album           →   Album dropdown           →
5. Click "Upload"         →   onUpload() called        →
6. Processing             →   Loading state            → Firebase Storage
7. Create documents       →   Progress updates         → Firestore batch
8. Update counts          →   Album photoCount         → Firestore update
9. Refresh data           →   refreshData() called     → Real-time listeners
10. Show notification     →   Toast appears            →
11. Close modal           →   Modal closes             →
```

### Scenario 2: Flytt bilder mellom album

```
User Action                    Component                 Backend
─────────────────────────────────────────────────────────────────

1. Open album             →   AlbumPage                →
2. Enable edit mode       →   editMode = true          →
3. Select photos          →   selectedPhotos array     →
4. Click "Move"           →   MoveModal opens          →
5. Select target album    →   Album dropdown           →
6. Confirm move           →   handleMovePhotos()       →
7. Update photos          →   Batch update             → Firestore updates
8. Update source count    →   updateAlbumPhotoCount    → Firestore -1
9. Update target count    →   updateAlbumPhotoCount    → Firestore +1
10. Refresh data          →   refreshData()            → Re-fetch data
11. Clear selection       →   selectedPhotos = []      →
12. Show notification     →   Toast success            →
```

### Scenario 3: Søk og filtrer bilder

```
User Action                    Component                 Processing
─────────────────────────────────────────────────────────────────

1. Navigate to Search     →   SearchPage               →
2. Type query             →   searchQuery state        →
3. Toggle filters         →   activeFilters object     →
4. Results calculate      →   filteredPhotos useMemo   → Client-side filter
                              ├─ Text search
                              ├─ Album filter
                              ├─ Category filter
                              ├─ Date filter
                              └─ AI filter
5. Display results        →   Photos Grid              →
6. Click photo            →   PhotoModal opens         →
7. View in fullscreen     →   Swipe navigation         →
```

### Scenario 4: Endre tema og språk

```
User Action                    Component                 Storage
─────────────────────────────────────────────────────────────────

1. Navigate to More       →   MorePage                 →
2. Click language         →   Language dropdown        →
3. Select "English"       →   i18n.changeLanguage()    → localStorage
                              ├─ Update all strings
                              └─ Re-render components
4. Toggle theme           →   setIsDarkMode()          → localStorage
                              ├─ Update CSS class
                              └─ Apply new colors
5. Changes persist        →   Load on next visit       ← localStorage
```

---

## 🔗 Prop-drilling oversikt

### App.js → Home Dashboard
```javascript
<HomeDashboard
  albums={albums}              // Array of album objects
  photos={photos}              // Array of photo objects
  user={userProfile || user}   // User object
  onNavigate={setCurrentPage}  // Navigation function
  refreshData={refreshData}    // Refresh function
  onUpload={handleUpload}      // Upload handler
/>
```

### App.js → Albums Page
```javascript
<AlbumsPage
  albums={albums}
  photos={photos}
  onNavigate={setCurrentPage}
  onAlbumClick={handleAlbumClick}    // Open album detail
  onPhotoClick={handlePhotoClick}    // Open photo modal
  toggleFavorite={toggleFavorite}    // Toggle favorite
  refreshData={refreshData}
/>
```

### App.js → Album Page
```javascript
<AlbumPage
  album={selectedAlbum}              // Current album
  albums={albums}                    // All albums (for move)
  user={userProfile || user}
  photos={photos}                    // Filtered to album
  onBack={() => setCurrentPage('albums')}
  refreshData={refreshData}
  onDeletePhoto={handleDeletePhoto}
  onSetAlbumCover={handleSetAlbumCover}
  onUpload={handleUpload}
  onSaveAlbum={handleAlbumSave}
  onUpdatePhotoCount={updateAlbumPhotoCount}
  onToggleFavorite={toggleFavorite}
/>
```

### App.js → Search Page
```javascript
<SearchPage
  photos={photos}
  albums={albums}
  onPhotoClick={handlePhotoClick}
  toggleFavorite={toggleFavorite}
  refreshData={refreshData}
/>
```

### App.js → More Page
```javascript
<MorePage
  user={userProfile || user}
  storageUsed={storageUsed}
  storageLimit={storageLimit}
  photos={photos}
  albums={albums}
  isDarkMode={isDarkMode}
  setIsDarkMode={setTheme}
  onLogout={handleLogout}
  onNavigate={setCurrentPage}
/>
```

---

## 🔌 Context Providers

```
App Root
│
├── ToastProvider
│   └── Provides toast notifications globally
│       ├── showToast()
│       ├── hideToast()
│       └── toasts[]
│
└── SecurityProvider
    └── Provides security state
        ├── isLocked
        ├── pinEnabled
        ├── biometricEnabled
        ├── unlockApp()
        └── lockApp()
```

---

## 📦 State Management per Side

### Home Dashboard
```javascript
Local State:
- isUploadOpen: Boolean

Computed (useMemo):
- stats: { total, favorites, recent, unassigned, withFaces }
- favoritePhotos: Photo[]
- recentPhotos: Photo[]

Props from Parent:
- albums, photos, user, onNavigate, refreshData, onUpload
```

### Albums Page
```javascript
Local State:
- viewMode: 'albums' | 'photos'
- selectedFilter: String
- sortBy: String
- selectedPhotos: Photo[]
- isMoveOpen: Boolean
- editingAlbum: Album | null
- albumModalOpen: Boolean

Computed (useMemo):
- albumPhotos: Photo[]
- stats: Object

Props from Parent:
- albums, photos, onNavigate, onAlbumClick, onPhotoClick, toggleFavorite, refreshData
```

### Album Page
```javascript
Local State:
- editMode: Boolean
- selectedPhotos: Photo[]
- isMoveOpen: Boolean
- isUploadOpen: Boolean
- photoModal: { open, index }
- editingAlbum: Album | null
- sortBy: String
- gridSize: Number (2-5)
- viewMode: 'grid' | 'list'
- searchQuery: String
- showFilters: Boolean
- filterCategory: String
- filterAI: String

Computed (useMemo):
- albumPhotos: Photo[]
- filteredPhotos: Photo[]
- stats: Object

Props from Parent:
- album, albums, user, photos, onBack, refreshData, onDeletePhoto, 
  onSetAlbumCover, onUpload, onSaveAlbum, onUpdatePhotoCount, onToggleFavorite
```

### Search Page
```javascript
Local State:
- searchQuery: String
- activeFilters: {
    favorites: Boolean
    withFaces: Boolean
    withTags: Boolean
    aiAnalyzed: Boolean
    dateRange: String | null
    albumId: String | null
    category: String | null
  }
- showFilters: Boolean
- editMode: Boolean
- selectedPhotos: Photo[]
- isMoveOpen: Boolean
- confirmOpen: Boolean
- photoToDelete: Photo | null

Computed (useMemo):
- categories: String[]
- popularTags: { tag, count }[]
- filteredPhotos: Photo[]
- activeFilterCount: Number

Props from Parent:
- photos, albums, onPhotoClick, toggleFavorite, refreshData
```

### More Page
```javascript
Local State:
- expandedSection: String | null
- showDeleteConfirm: Boolean
- loading: Boolean
- notification: Object | null
- showAIModal: Boolean
- showVaultModal: Boolean

From Context:
- pinEnabled, biometricEnabled (SecurityContext)
- currentLanguage (i18n)

Computed:
- isPro, isAdmin (from user object)
- storagePercent (calculated)

Props from Parent:
- user, storageUsed, storageLimit, photos, albums, isDarkMode, 
  setIsDarkMode, onLogout, onNavigate
```

---

## 🚦 Loading States

### Initial App Load
```
1. App.js mounts
2. useAuth() → Loading = true
3. Firebase auth listener
4. User authenticated
5. usePhotoData() → Loading = true
6. Fetch albums and photos
7. Loading = false
8. Render pages
```

### Data Refresh
```
1. User action (upload, delete, etc.)
2. Operation completes
3. refreshData() called
4. Re-fetch from Firestore
5. Update local state
6. Components re-render
```

### Optimistic Updates
```
1. User action (toggle favorite)
2. Update local state immediately
3. Update UI instantly
4. Send to Firestore in background
5. If error: Revert local state
```

---

## 🎨 Styling Architecture

```
Global Styles (index.css)
│
├── CSS Variables (Twilight Theme)
│   ├── --primary-color
│   ├── --secondary-color
│   ├── --background-gradient
│   └── ...
│
├── Utility Classes
│   ├── .glass (glassmorphism)
│   ├── .ripple-effect
│   ├── .nav-item-premium
│   └── ...
│
└── Component Styles
    ├── Inline Tailwind classes
    └── Dynamic classes (className logic)
```

---

## 📱 Mobile Navigation Flow

```
Bottom Navigation Bar
│
├── Home Tab
│   └── HomeDashboard
│
├── Albums Tab
│   └── AlbumsPage
│       └── (click album) → AlbumPage
│
├── Upload FAB (Center)
│   └── Opens UploadModal
│
├── Search Tab
│   └── SearchPage
│
└── More Tab
    └── MorePage
        ├── Profile → ProfilePage
        ├── Subscription → SubscriptionPage
        ├── Security → SecuritySettings
        └── Admin → AdminDashboard (if admin)
```

---

## 🔒 Security Flow

```
App Start
│
├── Check authentication (Firebase Auth)
│   ├── Not authenticated → LoginPage
│   └── Authenticated → Continue
│
└── Check PIN lock (SecurityContext)
    ├── PIN enabled + locked → PINLockScreen
    │   ├── Enter correct PIN → Unlock
    │   └── Biometric → Auto-unlock
    │
    └── Not locked → Main App
```

---

## 📊 Performance Optimization Points

### Critical Rendering Path
```
1. Initial HTML load
2. JavaScript bundle load
3. Firebase SDK initialization
4. Authentication check
5. Data fetch (albums, photos)
6. First contentful paint
7. Interactive
```

### Lazy Loading Strategy
```
Images:
- Use LazyImage component
- Intersection Observer API
- Load on viewport entry
- Placeholder → Thumbnail → Full

Components:
- React.lazy() for routes
- Suspense boundaries
- Code splitting per route
```

### Memoization Strategy
```
- useMemo for expensive calculations
  - stats
  - filteredPhotos
  - sortedAlbums
  
- useCallback for handlers
  - Event handlers passed as props
  - Prevents child re-renders
  
- React.memo for pure components
  - PhotoCard
  - AlbumCard
  - LazyImage
```

---

**Opprettet:** 10. november 2025  
**Formål:** Visualisering av app-struktur for enklere debugging  
**Bruk:** Referanse ved komplekse bugs eller arkitektur-endringer
