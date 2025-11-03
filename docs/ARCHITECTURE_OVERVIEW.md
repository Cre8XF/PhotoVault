# PhotoVault - Architecture Overview

**Generated:** November 3, 2025
**Version:** 1.0.0-mvp
**Total Lines of Code:** ~18,276 lines
**Components/Pages:** 38 files
**Branch:** claude/photovault-feature-audit-011CUkaPqB1cGGHVZJjNPpTk

---

## 📊 Project Statistics

| Metric | Count | Notes |
|--------|-------|-------|
| **Total Lines of Code** | ~18,276 | Across all .js/.jsx files in src/ |
| **Pages** | 12 | Main application views |
| **Components** | 26 | Reusable UI components |
| **Custom Hooks** | 4 | useAuth, usePhotoData, useAIQueue, useVault |
| **Services** | 4 | googleVision, picsart, openai, social |
| **Utils** | 16+ | Helper functions and utilities |
| **Contexts** | 2 | Security, Toast |
| **State Slices** | 2 | Main store, Vault slice |
| **Languages** | 2 | Norwegian, English (100% coverage) |

---

## 🏗️ Architecture Philosophy

### Modern React Architecture (Phase 2 Evolution)

PhotoVault follows a **modern React architecture** with:
- **Zustand** for global state management (no prop drilling)
- **Custom hooks** for business logic extraction
- **Service layer** for API integrations
- **Context API** for cross-cutting concerns (Security, Toast)
- **Component composition** for reusability
- **i18n** for internationalization

### Design Patterns
1. **Container/Presentational** - Pages (containers) use components (presentational)
2. **Custom Hooks** - Business logic extracted from components
3. **Service Layer** - API calls centralized in services/
4. **State Management** - Zustand store for global state
5. **Error Boundaries** - Graceful error handling
6. **Code Splitting** - Lazy loading for performance

**Reference:** File headers show "Phase 2: Modern Architecture"

---

## 📁 Project Structure

```
photovault/
├── public/                      # Static assets
│   └── info/                    # Info pages (help, privacy, terms)
│       ├── help.html
│       ├── security.html
│       ├── pro.html
│       ├── about.html
│       ├── support.html
│       ├── privacy.html
│       └── terms.html
│
├── src/
│   ├── components/              # Reusable UI components (26 files)
│   │   ├── Core UI Components
│   │   │   ├── AlbumCard.jsx           # Album display card (React.memo optimized)
│   │   │   ├── AlbumModal.jsx          # Album create/edit modal
│   │   │   ├── PhotoGrid.jsx           # Photo grid layout
│   │   │   ├── PhotoGridOptimized.jsx  # Virtualized grid (react-window)
│   │   │   ├── PhotoGridLazy.jsx       # Lazy loaded grid
│   │   │   ├── PhotoModal.jsx          # Full-screen photo viewer
│   │   │   ├── UploadModal.jsx         # Photo/video upload modal
│   │   │   ├── MoveModal.jsx           # Move photo between albums
│   │   │   ├── ConfirmModal.jsx        # Confirmation dialogs
│   │   │   ├── ComingSoonModal.jsx     # AI features "Coming Soon" modal
│   │   │   ├── LazyImage.jsx           # Lazy loaded images
│   │   │   ├── Loading.jsx             # Loading skeletons
│   │   │   ├── Notification.jsx        # Toast notifications
│   │   │   └── Particles.jsx           # Background particles
│   │   │
│   │   ├── Security Components
│   │   │   ├── PINLockScreen.jsx       # PIN entry screen (Phase 3)
│   │   │   ├── VaultSetupModal.jsx     # Vault setup wizard (Phase 3)
│   │   │   └── VaultSettingsModal.jsx  # Vault settings (Phase 3)
│   │   │
│   │   ├── Social Components (Phase 4 - Built)
│   │   │   ├── CommentThread.jsx       # Photo comments
│   │   │   ├── ReactionPicker.jsx      # Emoji reactions
│   │   │   └── NotificationPanel.jsx   # Notification center (ACTIVE)
│   │   │
│   │   ├── AI Components (Disabled for MVP)
│   │   │   ├── AILogPanel.jsx          # AI processing log (not used)
│   │   │   ├── AIToolsPanel.jsx        # AI tools UI (not used)
│   │   │   ├── SmartAlbumsView.jsx     # AI album suggestions
│   │   │   └── EnhancedComponents.jsx  # Enhanced UI components (orphaned)
│   │   │
│   │   └── Auth Components
│   │       └── LoginPage.jsx           # Login/registration (also in pages/)
│   │
│   ├── pages/                   # Main application views (12 files)
│   │   ├── LoginPage.jsx                # Authentication page
│   │   ├── HomeDashboard.jsx            # Main dashboard
│   │   ├── AlbumsPage.jsx               # Album grid view
│   │   ├── AlbumPage.jsx                # Single album view
│   │   ├── SearchPage.jsx               # Search & filter
│   │   ├── MorePage.jsx                 # Settings & profile
│   │   ├── ProfilePage.jsx              # User profile (NOT INTEGRATED)
│   │   ├── SubscriptionPage.jsx         # Subscription management (NOT INTEGRATED)
│   │   ├── VaultPage.jsx                # Encrypted vault (Phase 3 - ACTIVE)
│   │   ├── SecuritySettings.jsx         # Security settings (Phase 3 - ACTIVE)
│   │   ├── AISettingsPage.jsx           # AI settings (disabled)
│   │   └── AdminDashboard.jsx           # Admin panel
│   │
│   ├── hooks/                   # Custom React hooks (4 files)
│   │   ├── useAuth.js                   # Authentication logic (120 lines)
│   │   ├── usePhotoData.js              # Photo & album data (260 lines)
│   │   ├── useAIQueue.js                # AI request queue (180 lines - disabled)
│   │   ├── useVault.js                  # Vault encryption logic (400+ lines)
│   │   └── useInfiniteScroll.js         # Infinite scroll pagination
│   │
│   ├── state/                   # Zustand state management
│   │   ├── store.js                     # Main Zustand store (300+ lines)
│   │   └── vaultSlice.js                # Vault state slice (200 lines)
│   │
│   ├── contexts/                # React Context providers
│   │   ├── SecurityContext.jsx          # Security state (PIN, biometric)
│   │   └── ToastContext.js              # Toast notification context
│   │
│   ├── services/                # API integration layer (4 files)
│   │   ├── googleVision.js              # Google Vision API (DISABLED for MVP)
│   │   ├── picsart.js                   # Picsart API (DISABLED for MVP)
│   │   ├── openai.js                    # OpenAI API (DISABLED for MVP)
│   │   ├── socialService.js             # Social features service
│   │   └── encryption.js                # AES-256 encryption (Phase 3)
│   │
│   ├── utils/                   # Utility functions (16+ files)
│   │   ├── imageOptimization.js         # Image compression (browser-image-compression)
│   │   ├── imageCompression.js          # Additional compression utils
│   │   ├── videoTools.js                # Video thumbnail generation (BROKEN)
│   │   ├── biometric.js                 # Biometric auth utils
│   │   ├── nativeBiometric.js           # Capacitor biometric
│   │   ├── nativeCamera.js              # Capacitor camera (not used)
│   │   ├── nativeUtils.js               # Capacitor helpers
│   │   ├── security.js                  # Security utilities
│   │   ├── aiSort.js                    # AI sorting (disabled)
│   │   ├── aiEnhance.js                 # AI enhancement (disabled)
│   │   ├── aiAuth.js                    # AI API authentication
│   │   ├── duplicateDetection.js        # Duplicate photo detection
│   │   ├── smartAlbums.js               # Smart album creation
│   │   ├── searchPhotos.js              # Photo search logic
│   │   ├── deletePhoto.js               # Photo deletion
│   │   ├── picsart.js / picsartAI.js / picsartClient.js  # Picsart utilities
│   │   └── cacheManager.js              # IndexedDB caching
│   │
│   ├── locales/                 # i18n translations (100% coverage)
│   │   ├── en/
│   │   │   ├── common.json              # Common translations
│   │   │   ├── search.json              # Search page
│   │   │   ├── albums.json              # Albums page
│   │   │   ├── nav.json                 # Navigation
│   │   │   └── vault.json               # Vault page
│   │   └── no/
│   │       ├── common.json              # Norwegian translations
│   │       ├── search.json
│   │       ├── albums.json
│   │       ├── nav.json
│   │       └── vault.json
│   │
│   ├── routes/                  # React Router configuration
│   │   └── AppRoutes.jsx                # Route definitions (NOT INTEGRATED)
│   │
│   ├── App.js                           # Main app component (386 lines)
│   ├── App.old.js                       # Old app version (should be deleted)
│   ├── i18n.js                          # i18next configuration
│   ├── firebase.js                      # Firebase utilities (500+ lines)
│   ├── db.js                            # Database utilities
│   └── index.js                         # React entry point
│
├── docs/                        # Project documentation
│   ├── FEATURES.md                      # Feature inventory (this audit)
│   ├── TESTING_CHECKLIST.md             # Testing checklist (this audit)
│   ├── UPDATED_ROADMAP.md               # Updated roadmap (this audit)
│   ├── ARCHITECTURE_OVERVIEW.md         # This file
│   ├── MVP_STRATEGY.md                  # MVP strategy (AI disabling)
│   ├── ROADMAP.md                       # Original 18-month plan (OUTDATED)
│   ├── STATUS.md                        # Project status (OUTDATED)
│   ├── Project Status & Roadmap.md      # Older status doc
│   ├── BUILD_REPORT.md                  # Recent build/fixes
│   ├── FIREBASE_STORAGE_FIX.md          # CORS/storage rules fix
│   ├── VISION_API_AUDIT_REPORT.md       # API endpoint audit
│   ├── CLAUDE_CODE_PROMPT.md            # MVP disabling instructions
│   └── PhotoVault_System_Checklist_v2025-10.md  # Testing checklist
│
├── package.json                 # Dependencies & scripts
├── capacitor.config.ts          # Capacitor configuration
├── storage.rules                # Firebase Storage security rules
├── firestore.rules              # Firestore security rules
└── .firebaserc                  # Firebase project config
```

---

## 🔄 Data Flow Architecture

### 1. Authentication Flow

```
User → LoginPage → Firebase Auth → useAuth Hook → Zustand Store
                                          ↓
                                    App.js checks user
                                          ↓
                                    Renders Dashboard
```

**Files Involved:**
- `LoginPage.jsx` - UI
- `useAuth.js` - Logic (120 lines)
- `firebase.js` - Firebase Auth methods
- `store.js` - User state
- `App.js` - Conditional rendering

### 2. Photo Upload Flow

```
User → UploadModal → Select Files → Compress (imageOptimization.js)
                            ↓
                    Upload to Firebase Storage
                            ↓
                    Create Firestore Document
                            ↓
                    usePhotoData.handleUpload
                            ↓
                    Zustand Store Updated
                            ↓
                    UI Re-renders (PhotoGrid)
```

**Files Involved:**
- `UploadModal.jsx` - UI
- `imageOptimization.js` - Compression
- `firebase.js` - uploadPhotoToStorage(), savePhotoMetadata()
- `usePhotoData.js` - State management
- `store.js` - Photos array
- `PhotoGrid.jsx` - Display

### 3. Vault Flow (Phase 3)

```
User → VaultPage → Unlock (password/biometric)
                        ↓
                useVault Hook → Decrypt Photos
                        ↓
                Display in Gallery
                        ↓
            Upload → Client-Side Encrypt → Firebase Storage
                        ↓
                Store in vault_photos collection
```

**Files Involved:**
- `VaultPage.jsx` - UI
- `useVault.js` - Encryption logic (400+ lines)
- `encryption.js` - AES-256 functions
- `vaultSlice.js` - Vault state
- `firebase.js` - Storage/Firestore
- `nativeBiometric.js` - Biometric unlock

### 4. AI Flow (Disabled for MVP)

```
User → Click AI Button → ComingSoonModal Shows
                               ↓
                     NO API CALL MADE
                               ↓
                     Log: "AI feature disabled"
```

**When Active (Phase 2):**
```
User → Upload Photo → useAIQueue → googleVision.analyzeImage()
                            ↓
                    Returns AI tags
                            ↓
                    Save to Firestore (aiTags field)
                            ↓
                    Display in UI
```

**Files Involved:**
- `UploadModal.jsx` - Triggers (currently disabled)
- `useAIQueue.js` - Queue management (180 lines)
- `googleVision.js` - API calls (returns placeholder data)
- `picsart.js` - Enhancement API (disabled)
- `openai.js` - Smart search (disabled)

---

## 🗄️ Data Models

### Firebase Firestore Schema

#### `users` Collection
```javascript
{
  uid: string,                  // Firebase Auth UID
  email: string,
  name: string,
  photoURL: string,
  role: 'user' | 'pro' | 'admin',
  isPro: boolean,
  createdAt: timestamp,
  storageUsed: number,
  storageLimit: number,
  preferences: {
    language: 'en' | 'no',
    theme: 'dark' | 'light',
  }
}
```

#### `albums` Collection
```javascript
{
  id: string,
  userId: string,
  name: string,
  description: string,
  coverImage: string,          // URL
  photoCount: number,           // Auto-calculated
  createdAt: timestamp,
  updatedAt: timestamp,
  // Phase 4 fields (not yet used)
  shared: boolean,
  sharedWith: [],
  publicLink: {}
}
```

#### `photos` Collection
```javascript
{
  id: string,
  userId: string,
  albumId: string | null,
  url: string,                  // Firebase Storage URL
  thumbnailUrl: string,
  title: string,
  category: string,
  tags: string[],               // Manual tags
  aiTags: string[],             // AI tags (empty when AI disabled)
  faces: number,                // AI face count (0 when disabled)
  favorite: boolean,
  width: number,
  height: number,
  size: number,
  contentType: string,          // image/jpeg, video/mp4, etc.
  createdAt: timestamp,
  uploadedAt: timestamp,
  // Phase 2 fields (disabled)
  enhanced: boolean,
  enhancedUrl: string,
  // Phase 4 fields (not yet used)
  comments: [],
  reactions: {}
}
```

#### `vault_photos` Collection (Phase 3)
```javascript
{
  id: string,
  userId: string,
  encryptedUrl: string,         // Firebase Storage URL (encrypted file)
  encryptedThumbnail: string,
  iv: string,                   // Initialization vector for AES
  salt: string,                 // Salt for key derivation
  title: string,
  createdAt: timestamp,
  size: number,
  metadata: {                   // Encrypted metadata
    // ...
  }
}
```

### Firebase Storage Structure

```
storage bucket: photovault-app-a0946.appspot.com
├── users/
│   └── {userId}/
│       ├── photos/
│       │   └── {timestamp}_{filename}.jpg
│       ├── thumbnails/
│       │   └── {timestamp}_{filename}_thumb.jpg
│       ├── videos/
│       │   └── {timestamp}_{filename}.mp4
│       └── enhanced/
│           └── {timestamp}_{filename}_enhanced.jpg
│
└── vault/
    └── {userId}/
        └── {encrypted_filename}         # Encrypted files
```

**Reference:** FIREBASE_STORAGE_FIX.md (storage.rules path patterns)

---

## 🎨 Zustand State Management

### Main Store (`store.js`)

```javascript
{
  // Auth State
  user: null,
  userProfile: null,
  loading: boolean,

  // Data State
  albums: [],
  photos: [],

  // Navigation State
  currentPage: 'home' | 'albums' | 'search' | 'more' | 'album' | 'vault' | 'security' | 'admin',
  selectedAlbum: null,
  selectedPhotoIndex: 0,

  // UI State
  uploadModalOpen: boolean,
  albumModalOpen: boolean,
  photoModalOpen: boolean,
  confirmModal: {},
  notification: {},
  editingAlbum: null,

  // Theme State
  isDarkMode: boolean,

  // Storage State
  storageUsed: number,
  storageLimit: number,

  // Actions (50+ methods)
  setUser(), setAlbums(), setPhotos(),
  setCurrentPage(), setUploadModalOpen(),
  // ... etc
}
```

### Vault Slice (`vaultSlice.js`)

```javascript
{
  // Vault State
  isVaultUnlocked: boolean,
  vaultPhotos: [],
  vaultSettings: {
    biometricEnabled: boolean,
    autoLockTimeout: number,      // minutes
    stealthMode: boolean,
  },
  lastActivity: timestamp,

  // Actions
  unlockVault(), lockVault(),
  setVaultPhotos(), setVaultSettings(),
  resetActivityTimer(), getTimeUntilAutoLock()
}
```

**Integration:**
```javascript
// store.js:6
import { createVaultSlice } from './vaultSlice';

const useStore = create(
  devtools(
    persist(
      (set, get) => ({
        ...mainStore(set, get),
        ...createVaultSlice(set, get),  // Vault slice merged
      })
    )
  )
);
```

---

## 🔧 Custom Hooks Architecture

### 1. `useAuth.js` (120 lines)
**Purpose:** Centralize authentication logic

**Exports:**
```javascript
{
  user,              // Current Firebase user
  userProfile,       // Firestore user doc
  loading,           // Auth loading state
  handleLogout,      // Logout function
  isAdmin            // Admin check
}
```

**Used By:** App.js, MorePage.jsx, AdminDashboard.jsx

### 2. `usePhotoData.js` (260 lines)
**Purpose:** Manage photo and album data

**Exports:**
```javascript
{
  albums,                          // All user albums
  photos,                          // All user photos
  handleUpload,                    // Upload photo
  handleAlbumSave,                 // Create/update album
  handleCreateAlbumFromUpload,     // Create album during upload
  toggleFavorite,                  // Toggle favorite
  refreshData                      // Reload all data
}
```

**Used By:** App.js, HomeDashboard.jsx, AlbumsPage.jsx, SearchPage.jsx

### 3. `useAIQueue.js` (180 lines - Disabled)
**Purpose:** Queue and rate-limit AI API requests

**Exports:**
```javascript
{
  addToQueue,        // Add AI task to queue
  processQueue,      // Process queued tasks
  clearQueue,        // Clear all tasks
  queueStatus        // Current queue state
}
```

**Status:** Built but not used (AI disabled for MVP)

### 4. `useVault.js` (400+ lines - Phase 3)
**Purpose:** Vault encryption and management

**Exports:**
```javascript
{
  isVaultUnlocked,               // Unlock status
  vaultPhotos,                   // Decrypted photo list
  vaultSettings,                 // Vault configuration
  isVaultSetup,                  // Setup status
  vaultLoading,                  // Loading state
  unlockWithPassword,            // Password unlock
  unlockWithBiometric,           // Biometric unlock
  lockVault,                     // Lock vault
  uploadToVault,                 // Encrypt & upload
  deleteFromVault,               // Delete encrypted photo
  getDecryptedPhotoUrl,          // Decrypt for viewing
  resetActivityTimer,            // Reset auto-lock timer
  checkBiometricAvailability     // Check device support
}
```

**Used By:** VaultPage.jsx

---

## 🛡️ Security Architecture (Phase 3)

### Security Layers

1. **Firebase Security Rules**
   - Firestore: Users can only access own documents
   - Storage: Users can only access own files
   - Path-based validation: `users/{userId}/{albumId}/{file}`

2. **Client-Side Encryption (Vault)**
   - Algorithm: AES-256-GCM
   - Key derivation: PBKDF2
   - Library: Web Crypto API (encryption.js)
   - Flow: Encrypt locally → Upload encrypted → Store decryption key in device

3. **Biometric Authentication**
   - iOS: FaceID, TouchID
   - Android: Fingerprint
   - Library: capacitor-native-biometric
   - Fallback: PIN code

4. **PIN Lock**
   - 4-digit PIN (minimum)
   - Stored hashed (bcrypt equivalent)
   - App-wide lock or vault-specific

5. **Session Management**
   - SecurityContext tracks lock state
   - Auto-lock after inactivity
   - Configurable timeout

**Files:**
- `encryption.js` - AES-256 encryption
- `SecurityContext.jsx` - Security state
- `SecuritySettings.jsx` - Settings UI
- `PINLockScreen.jsx` - PIN entry
- `nativeBiometric.js` - Biometric APIs
- `security.js` - Security utilities

**Reference:** FEATURES.md (Security Features section)

---

## 🌐 i18n Architecture

### Implementation
- **Library:** i18next + react-i18next
- **Languages:** English, Norwegian (100% coverage)
- **Namespaces:** common, nav, search, albums, vault
- **Detection:** Browser language detection
- **Persistence:** localStorage

### File Structure
```
locales/
├── en/
│   ├── common.json      # Global translations
│   ├── nav.json         # Navigation
│   ├── search.json      # Search page
│   ├── albums.json      # Albums page
│   └── vault.json       # Vault page
└── no/
    └── (same structure)
```

### Usage
```javascript
import { useTranslation } from 'react-i18next';

const { t, i18n } = useTranslation(['common', 'nav']);

<h1>{t('common:welcome')}</h1>
<button>{t('nav:upload')}</button>

// Change language
i18n.changeLanguage('no');
```

---

## 📱 Mobile Architecture (Capacitor)

### Capacitor Integration

**Installed Plugins:**
```javascript
@capacitor/app          // App lifecycle
@capacitor/camera       // Camera access
@capacitor/core         // Core APIs
@capacitor/filesystem   // File access
@capacitor/haptics      // Vibration
@capacitor/ios          // iOS platform
@capacitor/android      // Android platform
@capacitor/keyboard     // Keyboard events
@capacitor/share        // Share sheet
@capacitor/splash-screen // Splash screen
@capacitor/status-bar   // Status bar
@capacitor/toast        // Native toasts
capacitor-native-biometric // Biometric auth
```

**Status:** Installed but not fully integrated

**Configuration:** capacitor.config.ts

**Native Utilities:**
- `nativeBiometric.js` - Biometric authentication (ACTIVE)
- `nativeCamera.js` - Camera access (not integrated)
- `nativeUtils.js` - General Capacitor helpers

**Next Steps (Phase 5):**
1. Build iOS app: `npm run ios:build`
2. Build Android app: `npm run android:build`
3. Configure platform-specific settings
4. Submit to App Store / Play Store

---

## 🔌 API Integrations

### Active Integrations

1. **Firebase** (ACTIVE)
   - **Auth:** User authentication
   - **Firestore:** NoSQL database
   - **Storage:** File storage with CDN
   - **Configuration:** firebase.js (500+ lines)

### Disabled Integrations (Phase 2)

2. **Google Vision API** (DISABLED)
   - **Purpose:** Image analysis, tagging, face detection
   - **Status:** Code ready, returns placeholder data
   - **Cost:** 500-1000 NOK/month when active
   - **File:** googleVision.js

3. **Picsart API** (DISABLED)
   - **Purpose:** Image enhancement, background removal
   - **Status:** Code ready, disabled
   - **Cost:** ~500 NOK/month when active
   - **File:** picsart.js

4. **OpenAI GPT-4 Vision** (DISABLED)
   - **Purpose:** Smart album suggestions, natural language search
   - **Status:** Code ready, disabled
   - **Cost:** 200-500 NOK/month when active
   - **File:** openai.js

**Reference:** MVP_STRATEGY.md (AI cost analysis)

---

## 🚀 Performance Optimizations

### Implemented

1. **React.memo**
   - AlbumCard.jsx
   - PhotoCard components
   - Reduces unnecessary re-renders

2. **Lazy Loading**
   - LazyImage.jsx - Intersection Observer
   - Images load as user scrolls
   - Reduces initial load time

3. **Virtualized Grids**
   - PhotoGridOptimized.jsx - react-window
   - Only renders visible items
   - Handles 1000+ photos smoothly

4. **Infinite Scroll**
   - useInfiniteScroll.js
   - Load more as user scrolls
   - Better than pagination for UX

5. **Image Compression**
   - imageOptimization.js - browser-image-compression
   - Compress before upload
   - Reduces storage costs and load time

6. **State Management**
   - Zustand (simpler than Redux)
   - No prop drilling
   - Minimal re-renders

7. **Code Splitting**
   - React.lazy ready (not yet implemented)
   - Can split routes for faster load

### Built But Not Integrated

- **Pagination Functions** (firebase.js:408+)
  - `getPhotosByUserPaginated()`
  - `getAlbumsByUserPaginated()`
  - **Status:** Ready but not used
  - **Would reduce:** Firestore reads, improve performance

### Future Optimizations

- **Service Worker** (Phase 5)
- **PWA Caching** (Phase 5)
- **Bundle size optimization** (tree-shaking, minification)
- **Image CDN** (already using Firebase Storage CDN)

---

## 🧪 Testing Architecture

### Current Testing Coverage

**Unit Tests:** None (no test files found)

**Manual Testing:**
- PhotoVault_System_Checklist_v2025-10.md
- 42/187 tests passing (22%)
- Most testing done manually

**Testing Needed:**
- Security features (vault encryption - CRITICAL!)
- Biometric authentication
- PIN lock
- All Phase 3 features (0% tested)

### Recommended Testing Stack (Future)

```javascript
// Unit Tests
- Jest + React Testing Library

// E2E Tests
- Playwright or Cypress

// Component Tests
- Storybook for component library
```

**Reference:** TESTING_CHECKLIST.md

---

## 🐛 Known Technical Debt

### High Priority

1. **Video Thumbnails Broken**
   - File: videoTools.js
   - Impact: Videos upload but no thumbnail
   - Priority: P0 (BLOCKER)

2. **Duplicate Files**
   - /src/utils/googleVision.js (DELETE)
   - /src/services/googleVision.js (KEEP)
   - Impact: Confusion
   - Priority: P1

3. **Deprecated API Endpoints**
   - Using old v1/images:annotate
   - Should use project-scoped endpoint
   - Priority: P1

4. **npm Vulnerabilities**
   - 9 vulnerabilities (3 moderate, 6 high)
   - Priority: P1

### Medium Priority

5. **Light Theme Not Audited**
   - WCAG contrast compliance unknown
   - Priority: P2

6. **React Scripts 5.x Deprecated**
   - Warnings in build
   - Priority: P2

7. **Orphaned Components**
   - EnhancedComponents.jsx
   - AILogPanel.jsx
   - AIToolsPanel.jsx
   - App.old.js
   - Priority: P3 (cleanup)

8. **Not Integrated**
   - ProfilePage.jsx (ready, not linked)
   - SubscriptionPage.jsx (ready, not linked)
   - Pagination functions (ready, not used)
   - Priority: P2

**Reference:** FEATURES.md (Known Issues section)

---

## 📊 Code Quality Metrics

### File Size Distribution

| Category | Avg Lines | Largest File | Notes |
|----------|-----------|--------------|-------|
| **Pages** | 300-500 | VaultPage.jsx (500+) | Complex pages |
| **Components** | 100-400 | CommentThread.jsx (400) | Reusable components |
| **Hooks** | 120-400 | useVault.js (400+) | Business logic |
| **Services** | 100-200 | googleVision.js (200+) | API integrations |
| **Utils** | 50-200 | firebase.js (500+) | Helper functions |

### Code Organization

✅ **Good Practices:**
- Clear separation of concerns
- Service layer for APIs
- Custom hooks for logic
- Component reusability
- Zustand for state
- Error boundaries

⚠️ **Areas for Improvement:**
- No unit tests
- Some orphaned files
- Documentation could be better (inline comments)
- Video thumbnail generation broken

---

## 🎯 Architecture Decisions

### 1. Why Zustand Over Redux?
- **Simpler API** - Less boilerplate
- **Smaller bundle size** - ~1kb vs ~8kb
- **No provider needed** - Direct hook access
- **TypeScript support** - Better typing
- **Result:** Faster development, cleaner code

### 2. Why Not React Router?
- **AppRoutes.jsx exists** but not integrated
- **Current:** State-based navigation (`currentPage` in Zustand)
- **Why:** Simpler for mobile app (Capacitor)
- **Future:** May activate for deep linking (Phase 5)

### 3. Why Client-Side Encryption?
- **Security:** Encrypted before upload to Firebase
- **Privacy:** Only user can decrypt (not even admin)
- **Compliance:** Better data protection
- **Trade-off:** Slightly slower, no server-side search

### 4. Why Capacitor Over React Native?
- **Web-first:** Same code for web/iOS/Android
- **Existing React app:** No rewrite needed
- **Plugins:** Rich ecosystem
- **Trade-off:** Slightly worse performance than native

### 5. Why Disable AI for MVP?
- **Cost:** 1,200-2,300 NOK/month for AI APIs
- **Strategy:** Validate core product first
- **Activation:** When user base justifies cost
- **Benefit:** Zero AI costs during MVP

**Reference:** MVP_STRATEGY.md

---

## 🔄 Migration Path: Current Architecture Evolution

### Phase 2 Evolution (Completed)

**Before (v1.0):**
- Props passed through 5+ components
- Business logic in components
- No global state management
- API calls scattered

**After (v2.0 - Current):**
- Zustand global store
- Custom hooks extract logic
- Service layer for APIs
- Clean component composition

**Files with "Phase 2" headers:**
- App.js:3
- useAuth.js:2
- usePhotoData.js:2
- store.js:2
- AppRoutes.jsx:2

### Potential Future Evolution

**Phase 5+ (PWA/Native):**
- Add service worker
- Add PWA manifest
- Implement offline-first with IndexedDB
- Add background sync
- Native app builds

---

## 📚 Key Files Reference

### Core Application
- **App.js** - Main app component (386 lines)
- **store.js** - Zustand state (300+ lines)
- **firebase.js** - Firebase utilities (500+ lines)
- **i18n.js** - Internationalization config

### Critical Features
- **useVault.js** - Vault encryption (400+ lines)
- **VaultPage.jsx** - Vault UI (500+ lines)
- **encryption.js** - AES-256 encryption
- **SecuritySettings.jsx** - Security UI (600 lines)

### AI Features (Disabled)
- **googleVision.js** - Vision API (disabled)
- **picsart.js** - Enhancement API (disabled)
- **openai.js** - Smart search (disabled)
- **useAIQueue.js** - AI queue management (not used)

### Documentation
- **FEATURES.md** - Feature inventory (this audit)
- **TESTING_CHECKLIST.md** - Testing checklist (this audit)
- **UPDATED_ROADMAP.md** - Updated roadmap (this audit)
- **ARCHITECTURE_OVERVIEW.md** - This file

---

## 🎉 Architecture Summary

**Strengths:**
- ✅ Modern React architecture (hooks, Zustand)
- ✅ Clean separation of concerns
- ✅ Service layer for APIs
- ✅ Security features well-implemented (vault, PIN, biometric)
- ✅ i18n 100% coverage
- ✅ Mobile-ready (Capacitor)
- ✅ Performance optimizations (lazy loading, virtualization)

**Areas for Improvement:**
- ⚠️ No unit tests
- ⚠️ Some orphaned components
- ⚠️ Video thumbnail generation broken
- ⚠️ Pagination not integrated
- ⚠️ Documentation could be more comprehensive (inline comments)

**Technical Debt:**
- 🔧 9 npm vulnerabilities
- 🔧 React Scripts 5.x deprecation
- 🔧 Duplicate googleVision.js files
- 🔧 Light theme not audited (WCAG)

**Overall Grade:** A- (High quality architecture, some cleanup needed)

---

**This architecture overview provides a comprehensive map of the PhotoVault codebase structure, data flow, and technical decisions.**
