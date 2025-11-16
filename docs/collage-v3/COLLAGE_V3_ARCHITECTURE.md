# PIXTR TECHNICAL ARCHITECTURE REFERENCE

## PURPOSE

This document provides Claude Code with critical context about Pixtr's existing architecture, patterns, and constraints. **Read this completely before starting any work.**

---

## PROJECT STRUCTURE

```
pixtr/
├── src/
│   ├── components/          # React components
│   │   ├── CollageBuilder.jsx
│   │   ├── UploadModal.jsx
│   │   └── ...
│   ├── pages/              # Route-level pages
│   │   ├── SearchPage.jsx
│   │   ├── AlbumsPage.jsx
│   │   └── ...
│   ├── hooks/              # Custom React hooks
│   │   ├── usePhotoData.js  ⭐ CRITICAL
│   │   ├── useAuth.js
│   │   └── ...
│   ├── utils/              # Helper functions
│   │   ├── gridLayouts.js
│   │   └── ...
│   ├── stores/             # Zustand state management
│   │   └── ...
│   ├── i18n/               # Internationalization
│   │   ├── locales/
│   │   │   ├── en.json
│   │   │   └── no.json
│   │   └── i18n.js
│   └── App.jsx             # Main app + routing
├── docs/                   # Documentation
└── public/                 # Static assets
```

---

## CRITICAL HOOK: usePhotoData

**NEVER call Firebase directly. ALWAYS use this hook.**

### Available Methods:

```javascript
import { usePhotoData } from '../hooks/usePhotoData'

function MyComponent() {
  const {
    photos, // Photo[] - all user photos
    loading, // boolean
    error, // Error | null
    uploadPhoto, // (file, metadata) => Promise<Photo>
    deletePhoto, // (photoId) => Promise<void>
    updatePhoto, // (photoId, updates) => Promise<void>
    getPhotosByAlbum, // (albumId) => Photo[]
    searchPhotos, // (query) => Photo[]
    favoritePhoto, // (photoId, isFavorite) => Promise<void>
    // ... more methods
  } = usePhotoData()

  // Use these methods instead of direct Firestore calls
}
```

### Photo Object Structure:

```javascript
{
  id: string,                    // Firestore document ID
  downloadURL: string,           // Full resolution URL
  thumbnail: string,             // Thumbnail URL (smaller, faster)
  filename: string,              // Original filename
  uploadedAt: Timestamp,         // Firestore timestamp
  userId: string,                // Owner user ID
  albumId: string | null,        // Parent album (if any)
  isFavorite: boolean,           // User marked as favorite
  isScreenshot: boolean,         // Auto-detected screenshot
  aiTags: string[],              // AI-generated tags (future)
  metadata: {
    size: number,                // File size in bytes
    width: number,               // Image width in pixels
    height: number,              // Image height in pixels
    type: string                 // MIME type
  },
  // ... additional fields
}
```

### Why This Matters:

- **Centralized logic:** All Firestore operations go through one place
- **Caching:** usePhotoData implements smart caching
- **Error handling:** Consistent error handling across app
- **Validation:** Input validation and sanitization
- **Reentrancy guards:** Prevents React StrictMode double-writes

**Example Usage:**

```javascript
// ✅ CORRECT
const { photos, uploadPhoto } = usePhotoData()
const favorites = photos.filter((p) => p.isFavorite)

// ❌ WRONG - Never do this
import { db } from '../firebase'
const photosRef = collection(db, 'photos') // DON'T DO THIS
```

---

## STATE MANAGEMENT: Zustand

Pixtr uses Zustand for global state. Check `/src/stores/` for existing stores.

**Pattern:**

```javascript
import { create } from 'zustand'

export const useCollageStore = create((set) => ({
  selectedPhotos: [],
  selectedLayout: null,
  transforms: {},

  setSelectedPhotos: (photos) => set({ selectedPhotos: photos }),
  setLayout: (layout) => set({ selectedLayout: layout }),
  updateTransform: (photoId, transform) =>
    set((state) => ({
      transforms: {
        ...state.transforms,
        [photoId]: transform,
      },
    })),

  reset: () =>
    set({
      selectedPhotos: [],
      selectedLayout: null,
      transforms: {},
    }),
}))
```

**When to use Zustand vs local state:**

- **Zustand:** State shared across multiple components/pages
- **Local state:** Component-specific UI state

---

## DESIGN SYSTEM

### Glass-Morphism Pattern

**Standard modal overlay:**

```jsx
<div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50">
  <div className="bg-white/10 dark:bg-black/20 border border-white/20 rounded-xl p-6">
    {/* Content */}
  </div>
</div>
```

**Card style:**

```jsx
<div className="bg-white/5 dark:bg-black/10 border border-white/10 rounded-lg p-4 backdrop-blur-sm">
  {/* Content */}
</div>
```

### Color System

**Tailwind config uses:**

- Primary: Blue (`blue-500`, `blue-600`)
- Success: Green (`green-500`)
- Error: Red (`red-500`)
- Warning: Yellow (`yellow-500`)

**Dark/Light Mode:**

```jsx
// Always support both modes
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
  {/* Content */}
</div>
```

### Spacing & Radius

**Standard values:**

- Gap between items: `gap-2` (8px) or `gap-4` (16px)
- Card padding: `p-4` (16px) or `p-6` (24px)
- Modal padding: `p-6` (24px)
- Border radius: `rounded-lg` (8px) or `rounded-xl` (12px)

### Transitions

**Standard animation:**

```jsx
className = 'transition-all duration-300 ease-in-out'
```

**Hover effects:**

```jsx
className = 'hover:scale-105 hover:shadow-lg transition-transform'
```

### Ripple Effect

Some buttons use ripple effect. Check existing buttons for pattern.

---

## INTERNATIONALIZATION (i18n)

**Setup:** Uses `react-i18next`

### How to Use:

```javascript
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <h1>{t('collage.title')}</h1>
    <p>{t('collage.description', { count: 5 })}</p>
  );
}
```

### Translation Files:

**`/src/i18n/locales/en.json`:**

```json
{
  "collage": {
    "title": "Create Collage",
    "description": "{{count}} photos selected"
  }
}
```

**`/src/i18n/locales/no.json`:**

```json
{
  "collage": {
    "title": "Lag Kollasje",
    "description": "{{count}} bilder valgt"
  }
}
```

### Critical Rules:

- ⚠️ **NEVER hardcode text** - Always use `t('key')`
- ⚠️ **Add to BOTH en.json and no.json**
- ⚠️ **Use dot notation** for nested keys: `t('collage.step.select')`
- ⚠️ **Pluralization:** Use `{{count}}` for dynamic numbers

---

## FIREBASE INTEGRATION

### Current Setup:

```javascript
// Firebase services in use:
- Firestore (database)
- Storage (photo files)
- Auth (user authentication)
```

### Firestore Structure:

```
users/
  {userId}/
    photos/
      {photoId}/
        - id, downloadURL, thumbnail, metadata, etc.
    albums/
      {albumId}/
        - title, createdAt, photoIds[]
    collages/           ⬅️ NEW COLLECTION
      {collageId}/
        - photos[], layoutId, transforms, createdAt
```

### Storage Structure:

```
users/{userId}/
  photos/
    originals/{photoId}.jpg
    thumbnails/{photoId}_thumb.jpg
  collages/               ⬅️ NEW (for rendered collages)
    {collageId}.jpg
```

---

## EXISTING COMPONENTS TO REUSE

### UploadModal Pattern

**Location:** `/src/components/UploadModal.jsx`

**Pattern to follow for modals:**

```jsx
export default function MyModal({ isOpen, onClose, onSave }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50">
      <div className="absolute inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-2xl md:w-full">
        <div className="bg-white/10 dark:bg-black/20 border border-white/20 rounded-xl p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{t('modal.title')}</h2>
            <button onClick={onClose}>✕</button>
          </div>

          {/* Content */}
          <div>{/* ... */}</div>

          {/* Footer */}
          <div className="flex justify-end gap-3 mt-6">
            <button onClick={onClose}>{t('cancel')}</button>
            <button onClick={onSave}>{t('save')}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### SearchPage Filtering

**Location:** `/src/pages/SearchPage.jsx`

**Reusable logic:**

- AI tag filtering
- Search bar debouncing
- Photo grid rendering
- Lazy loading

**Study this file for:**

- How to filter photos by tags
- How to render photo grids efficiently
- Search UX patterns

---

## MOBILE OPTIMIZATION

### Critical Constraints:

**Touch targets:**

- Minimum 44x44px for tap areas
- Use `p-3` (12px) minimum padding on buttons

**Responsive breakpoints:**

```javascript
// Tailwind breakpoints
sm: 640px   // mobile landscape
md: 768px   // tablet
lg: 1024px  // desktop
xl: 1280px  // large desktop
```

**Common patterns:**

```jsx
// Stack on mobile, side-by-side on desktop
<div className="flex flex-col md:flex-row gap-4">

// Hide on mobile, show on desktop
<div className="hidden md:block">

// Full width on mobile, constrained on desktop
<div className="w-full md:max-w-2xl">
```

### Gestures:

**Drag events (works on touch and mouse):**

```javascript
const handlePointerDown = (e) => {
  e.target.setPointerCapture(e.pointerId)
  // Start drag
}

const handlePointerMove = (e) => {
  if (e.target.hasPointerCapture(e.pointerId)) {
    // Update position
  }
}

const handlePointerUp = (e) => {
  e.target.releasePointerCapture(e.pointerId)
  // End drag
}
```

---

## PERFORMANCE REQUIREMENTS

### Image Loading:

**Always use thumbnails first:**

```jsx
<img
  src={photo.thumbnail}
  data-full={photo.downloadURL}
  loading="lazy"
  alt={photo.filename}
/>
```

**Lazy load with Intersection Observer:**

```javascript
import { useEffect, useRef } from 'react'

function LazyImage({ src, alt }) {
  const imgRef = useRef()

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target
          img.src = img.dataset.full
          observer.unobserve(img)
        }
      })
    })

    if (imgRef.current) {
      observer.observe(imgRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return <img ref={imgRef} data-full={src} alt={alt} />
}
```

### Rendering:

- Use skeleton loaders for loading states
- Debounce search inputs (300ms)
- Virtualize long lists (if >100 items)
- Memoize expensive calculations with `useMemo`

---

## ERROR HANDLING

### Pattern to Follow:

```javascript
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

function MyComponent() {
  const { t } = useTranslation()
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleAction() {
    setError(null)
    setLoading(true)

    try {
      await someAsyncOperation()
      // Success
    } catch (err) {
      console.error('Action failed:', err)
      setError(t('errors.actionFailed'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {error && (
        <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 mb-4">
          {error}
        </div>
      )}
      {/* ... */}
    </div>
  )
}
```

### User Feedback:

- **Success:** Green toast/banner
- **Error:** Red toast/banner with actionable message
- **Loading:** Skeleton or spinner (never block UI completely)
- **Empty state:** Friendly message with CTA

---

## ACCESSIBILITY

### Keyboard Navigation:

```jsx
<button
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }}
  tabIndex={0}
>
  Action
</button>
```

### ARIA Labels:

```jsx
<button aria-label={t('collage.closeModal')}>
  ✕
</button>

<img src={photo.thumbnail} alt={photo.filename || t('photo.untitled')} />
```

### Focus Management:

```javascript
import { useEffect, useRef } from 'react'

function Modal({ isOpen }) {
  const firstFocusableRef = useRef()

  useEffect(() => {
    if (isOpen && firstFocusableRef.current) {
      firstFocusableRef.current.focus()
    }
  }, [isOpen])

  return (
    <div>
      <button ref={firstFocusableRef}>Close</button>
    </div>
  )
}
```

---

## TESTING EXPECTATIONS

### What User Will Test:

1. **Functional:** All features work as specified
2. **Visual:** Dark/light mode, responsive design
3. **i18n:** Both English and Norwegian
4. **Performance:** No lag, smooth animations
5. **Errors:** Graceful handling of edge cases

### No Automated Tests Required

Pixtr doesn't currently use Jest/Vitest. Manual testing is the standard.

**Provide testing checklist** for each component you create.

---

## CODE STYLE

### Component Structure:

```javascript
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'

/**
 * Component description
 */
export default function MyComponent({ prop1, prop2, onAction }) {
  const { t } = useTranslation()

  // Hooks
  // State
  // Effects
  // Handlers

  return <div>{/* JSX */}</div>
}

MyComponent.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number,
  onAction: PropTypes.func,
}

MyComponent.defaultProps = {
  prop2: 0,
  onAction: () => {},
}
```

### Naming Conventions:

- **Components:** PascalCase (`CollagePreview.jsx`)
- **Hooks:** camelCase with `use` prefix (`useCollageData.js`)
- **Utils:** camelCase (`gridLayouts.js`)
- **Constants:** UPPER_SNAKE_CASE (`const MAX_PHOTOS = 6`)
- **Event handlers:** `handle` prefix (`handleSave`, `handleDrag`)

### File Organization:

```javascript
// 1. External imports
import { useState } from 'react'
import PropTypes from 'prop-types'

// 2. Internal imports
import { usePhotoData } from '../hooks/usePhotoData'
import { LAYOUTS_V3 } from '../utils/layouts_v3'

// 3. Component definition
export default function MyComponent() {}

// 4. PropTypes
MyComponent.propTypes = {}
```

---

## CONSTRAINTS & LIMITATIONS

### What NOT to Use:

- ❌ Direct Firebase SDK calls (use `usePhotoData` hook)
- ❌ Inline CSS (use Tailwind)
- ❌ `alert()` / `confirm()` (use custom modals)
- ❌ Hardcoded English text (use i18n)
- ❌ Non-responsive designs
- ❌ Libraries not already in package.json (check first)

### AI Features Currently Disabled:

- Google Vision API (auto-tagging)
- Picsart API (photo enhancement)
- OpenAI (advanced features)

**These are planned for Phase 2 (500+ users).** Don't implement AI features now, but structure code to support them later.

---

## QUESTIONS TO ASK USER

If uncertain about:

1. **UX decisions:** "Should layout selector be modal or inline?"
2. **Data structure:** "Where should collage metadata be stored?"
3. **Edge cases:** "What happens if user closes modal mid-edit?"
4. **Priorities:** "Should I optimize for speed or features first?"

**Always ask before making assumptions that affect user experience.**

---

## SUMMARY CHECKLIST

Before starting work, confirm:

- [ ] Read this entire document
- [ ] Read COLLAGE_V3_DESIGN_REFERENCE.md
- [ ] Read COLLAGE_V3_PROMPT.md
- [ ] Understand usePhotoData hook
- [ ] Understand glass-morphism design system
- [ ] Understand i18n requirements
- [ ] Understand mobile-first approach
- [ ] Know what NOT to use (constraints)

**Ready to proceed to Phase 0 of COLLAGE_V3_PROMPT.md.**
