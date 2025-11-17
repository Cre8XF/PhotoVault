# COLLAGE V3 - CRITICAL CORRECTIONS & IMPLEMENTATION DETAILS

## 📋 IMPORTANT - READ THIS FIRST

This document **CORRECTS AND EXTENDS** the following files:
- `COLLAGE_V3_COLLAGEVIEW.md` (from ChatGPT)
- `COLLAGE_V3_EXTRAS.md` (from ChatGPT)

**Reading Order for Claude Code:**
1. Read `COLLAGE_V3_COLLAGEVIEW.md` 
2. Read `COLLAGE_V3_EXTRAS.md`
3. Read **THIS FILE** (COLLAGE_V3_FIXES.md) ← Apply all corrections from here
4. Implement with corrections applied

**This file contains:**
- ✅ Field name corrections (CRITICAL)
- 📝 Missing implementation details
- 🔧 Concrete code examples
- ⚠️ Known issues in original docs
- 💡 Best practice recommendations

---

## 🚨 CRITICAL CORRECTIONS (MUST APPLY)

### 1. FIRESTORE FIELD NAMES - CONSISTENCY FIX

**❌ WRONG (in original docs):**
```javascript
thumbnailURL: "https://..."  // Wrong casing
downloadURL: "https://..."   // Field doesn't exist in Firestore
thumbnail: "https://..."     // Field doesn't exist in Firestore
```

**✅ CORRECT (use everywhere):**
```javascript
url: "https://..."          // Main photo URL
thumbnailUrl: "https://..."  // Video thumbnail only (camelCase!)
name: "Photo.jpg"           // Primary filename
filename: "IMG_1234.jpg"    // Fallback filename
```

**Affected sections in original docs:**
- COLLAGE_V3_COLLAGEVIEW.md Part 2, 4, 5, 6, 7
- COLLAGE_V3_EXTRAS.md - all photo references

**Action:** Replace ALL occurrences:
- `photo.downloadURL` → `photo.url`
- `photo.thumbnailURL` → `photo.thumbnailUrl`
- `photo.thumbnail` → `photo.thumbnailUrl`
- `collage.downloadURL` → `collage.url`

### 2. PROPTYPES CORRECTION

**❌ WRONG:**
```javascript
photo: PropTypes.shape({
  id: PropTypes.string.isRequired,
  downloadURL: PropTypes.string.isRequired,
  thumbnail: PropTypes.string,
  filename: PropTypes.string
})
```

**✅ CORRECT:**
```javascript
photo: PropTypes.shape({
  id: PropTypes.string.isRequired,
  url: PropTypes.string.isRequired,
  thumbnailUrl: PropTypes.string,
  name: PropTypes.string,
  filename: PropTypes.string
})
```

### 3. IMAGE RENDERING PATTERN

**✅ ALWAYS use this pattern:**
```javascript
const getPhotoUrl = (photo) => 
  photo?.thumbnailUrl ||  // Video thumbnail
  photo?.url ||           // Standard photo
  ''

<img 
  src={getPhotoUrl(photo)}
  alt={photo.name || photo.filename || 'Photo'}
/>
```

---

## 📝 MISSING IMPLEMENTATION DETAILS

### PART 1: Canvas Rendering (renderCollageToCanvas.js)

**Original doc says:**
```javascript
const blob = await renderCollageToCanvas({ layout, photos, transforms })
```

**Complete implementation:**

```javascript
// src/utils/renderCollageToCanvas.js

/**
 * Render collage to canvas and export as blob
 * @param {Object} layout - Layout configuration from layouts_v3.js
 * @param {Array} photos - Array of photo objects
 * @param {Object} transforms - Transform data { [photoId]: { scale, translateX, translateY } }
 * @returns {Promise<Blob>} JPEG blob
 */
export async function renderCollageToCanvas({ layout, photos, transforms }) {
  // Create canvas with layout dimensions
  const canvas = document.createElement('canvas')
  canvas.width = layout.canvas.width
  canvas.height = layout.canvas.height
  const ctx = canvas.getContext('2d')
  
  // Fill background
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  // Calculate slot positions from CSS Grid template
  const slotBounds = calculateSlotBounds(layout)
  
  // Render each photo
  for (let i = 0; i < layout.slots.length; i++) {
    const slot = layout.slots[i]
    const photo = photos[i]
    if (!photo) continue
    
    const transform = transforms[photo.id] || { 
      scale: 1, 
      translateX: 0, 
      translateY: 0 
    }
    
    try {
      // Load high-res image
      const img = await loadImage(photo.url)
      
      // Get slot bounds
      const bounds = slotBounds[i]
      
      // Apply transforms
      ctx.save()
      ctx.beginPath()
      ctx.rect(bounds.x, bounds.y, bounds.width, bounds.height)
      ctx.clip()
      
      // Calculate center point
      const centerX = bounds.x + bounds.width / 2
      const centerY = bounds.y + bounds.height / 2
      
      // Apply transform
      ctx.translate(centerX, centerY)
      ctx.scale(transform.scale, transform.scale)
      ctx.translate(transform.translateX, transform.translateY)
      
      // Calculate scaled dimensions
      const imgAspect = img.width / img.height
      const slotAspect = bounds.width / bounds.height
      
      let drawWidth, drawHeight
      if (imgAspect > slotAspect) {
        // Image wider than slot
        drawHeight = bounds.height
        drawWidth = bounds.height * imgAspect
      } else {
        // Image taller than slot
        drawWidth = bounds.width
        drawHeight = bounds.width / imgAspect
      }
      
      // Draw image centered
      ctx.drawImage(
        img,
        -drawWidth / 2,
        -drawHeight / 2,
        drawWidth,
        drawHeight
      )
      
      ctx.restore()
    } catch (error) {
      console.error(`Failed to render photo ${photo.id}:`, error)
      // Render placeholder
      ctx.fillStyle = '#333333'
      ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height)
    }
  }
  
  // Convert to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to create blob'))
        }
      },
      'image/jpeg',
      0.85  // Quality (0.85 = good balance between size and quality)
    )
  })
}

/**
 * Helper: Load image from URL
 */
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'  // CORS support
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = url
  })
}

/**
 * Helper: Calculate physical bounds of each slot
 */
function calculateSlotBounds(layout) {
  // Parse CSS Grid template
  // This is a simplified version - you may need to adjust based on actual layout.grid format
  const slots = layout.slots.map((slot, index) => {
    // Parse slot.area (e.g., "1 / 1 / 2 / 3" = row-start / col-start / row-end / col-end)
    const [rowStart, colStart, rowEnd, colEnd] = slot.area
      .split('/')
      .map(s => parseInt(s.trim()))
    
    const canvasWidth = layout.canvas.width
    const canvasHeight = layout.canvas.height
    const gap = layout.gap || 8
    const padding = layout.padding || 0
    
    // Calculate grid dimensions
    // This assumes equal-sized grid cells - adjust if needed
    const gridCols = layout.grid.desktop.split(' ').length
    const gridRows = Math.ceil(layout.slots.length / gridCols)
    
    const cellWidth = (canvasWidth - padding * 2 - gap * (gridCols - 1)) / gridCols
    const cellHeight = (canvasHeight - padding * 2 - gap * (gridRows - 1)) / gridRows
    
    return {
      x: padding + (colStart - 1) * (cellWidth + gap),
      y: padding + (rowStart - 1) * (cellHeight + gap),
      width: (colEnd - colStart) * cellWidth + (colEnd - colStart - 1) * gap,
      height: (rowEnd - rowStart) * cellHeight + (rowEnd - rowStart - 1) * gap
    }
  })
  
  return slots
}
```

**Usage in CollageBuilder after Save:**
```javascript
// Inside CollageBuilder.jsx - handleSave function

const handleSave = async () => {
  try {
    setIsSaving(true)
    
    // 1. Generate thumbnail
    const thumbnailBlob = await renderCollageToCanvas({
      layout: selectedLayout,
      photos: selectedPhotos,
      transforms: transforms
    })
    
    // 2. Upload thumbnail to Firebase Storage
    const thumbnailPath = `users/${user.uid}/collages/thumbnails/${collageId}.jpg`
    const thumbnailRef = ref(storage, thumbnailPath)
    await uploadBytes(thumbnailRef, thumbnailBlob)
    const thumbnailUrl = await getDownloadURL(thumbnailRef)
    
    // 3. Save collage to Firestore
    const collageData = {
      id: collageId,
      title: collageTitle || 'Untitled Collage',
      userId: user.uid,
      layoutId: selectedLayout.id,
      photoIds: selectedPhotos.map(p => p.id),
      transforms: transforms,
      thumbnailUrl: thumbnailUrl,  // ✅ camelCase
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    await addDoc(collection(db, 'collages'), collageData)
    
    // 4. Success
    toast.success(t('collage:success.saved'))
    navigate('/albums')
    
  } catch (error) {
    console.error('Save collage error:', error)
    toast.error(t('collage:errors.saveFailed'))
  } finally {
    setIsSaving(false)
  }
}
```

---

### PART 2: Long Press Detection

**Original doc lacks specifics. Here's the implementation:**

```javascript
// src/components/PhotoCell.jsx - Add long press support

import { useState, useRef, useCallback } from 'react'

const PhotoCell = ({ photo, slot, onTap, onLongPress }) => {
  const [isPressed, setIsPressed] = useState(false)
  const pressTimer = useRef(null)
  const pressStart = useRef(null)
  
  const LONG_PRESS_DURATION = 500  // ms
  const MOVE_THRESHOLD = 10         // pixels
  
  const handlePointerDown = useCallback((e) => {
    setIsPressed(true)
    pressStart.current = { x: e.clientX, y: e.clientY }
    
    // Start long press timer
    pressTimer.current = setTimeout(() => {
      // Trigger haptic feedback (if available)
      if (navigator.vibrate) {
        navigator.vibrate(50)
      }
      
      // Trigger long press callback
      onLongPress?.(photo.id)
      
      // Clean up
      clearTimeout(pressTimer.current)
      setIsPressed(false)
    }, LONG_PRESS_DURATION)
  }, [photo.id, onLongPress])
  
  const handlePointerMove = useCallback((e) => {
    if (!pressStart.current) return
    
    // Calculate movement distance
    const dx = e.clientX - pressStart.current.x
    const dy = e.clientY - pressStart.current.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    
    // Cancel long press if user moves too much
    if (distance > MOVE_THRESHOLD) {
      clearTimeout(pressTimer.current)
      setIsPressed(false)
    }
  }, [])
  
  const handlePointerUp = useCallback(() => {
    const wasLongPress = !pressTimer.current
    
    // Clear timer
    clearTimeout(pressTimer.current)
    setIsPressed(false)
    pressStart.current = null
    
    // If not long press, trigger tap
    if (!wasLongPress && onTap) {
      onTap(photo.id)
    }
  }, [photo.id, onTap])
  
  const handlePointerCancel = useCallback(() => {
    clearTimeout(pressTimer.current)
    setIsPressed(false)
    pressStart.current = null
  }, [])
  
  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      className={`relative ${isPressed ? 'scale-95' : ''} transition-transform`}
    >
      {/* Photo content */}
    </div>
  )
}
```

---

### PART 3: Action Menu Component

**Original doc mentions ActionMenu.jsx but provides no implementation. Here it is:**

```javascript
// src/components/ActionMenu.jsx

import React, { useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { createPortal } from 'react-dom'
import { Edit, Repeat, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const ActionMenu = ({ 
  isOpen, 
  position, 
  onAdjust, 
  onReplace, 
  onClose 
}) => {
  const { t } = useTranslation(['collage'])
  const menuRef = useRef(null)
  
  // Close on click outside
  useEffect(() => {
    if (!isOpen) return
    
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose()
      }
    }
    
    document.addEventListener('pointerdown', handleClickOutside)
    return () => document.removeEventListener('pointerdown', handleClickOutside)
  }, [isOpen, onClose])
  
  // Close on ESC
  useEffect(() => {
    if (!isOpen) return
    
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])
  
  if (!isOpen) return null
  
  const menu = (
    <div
      ref={menuRef}
      className="fixed z-50 bg-black/90 backdrop-blur-xl rounded-xl border border-white/20 shadow-2xl overflow-hidden"
      style={{
        top: position.y,
        left: position.x,
        transform: 'translate(-50%, -100%) translateY(-8px)'
      }}
    >
      <button
        onClick={() => {
          onAdjust()
          onClose()
        }}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors"
      >
        <Edit className="w-5 h-5 text-blue-400" />
        <span className="text-sm font-medium">
          {t('collage:actions.adjustPhoto')}
        </span>
      </button>
      
      <button
        onClick={() => {
          onReplace()
          onClose()
        }}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors border-t border-white/10"
      >
        <Repeat className="w-5 h-5 text-purple-400" />
        <span className="text-sm font-medium">
          {t('collage:actions.replacePhoto')}
        </span>
      </button>
      
      <button
        onClick={onClose}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors border-t border-white/10"
      >
        <X className="w-5 h-5 text-gray-400" />
        <span className="text-sm font-medium text-gray-400">
          {t('collage:actions.cancel')}
        </span>
      </button>
    </div>
  )
  
  return createPortal(menu, document.body)
}

ActionMenu.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  position: PropTypes.shape({
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired
  }).isRequired,
  onAdjust: PropTypes.func.isRequired,
  onReplace: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
}

export default ActionMenu
```

**Usage in PhotoCell:**
```javascript
const [menuOpen, setMenuOpen] = useState(false)
const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 })

const handleLongPress = (e) => {
  const rect = e.target.getBoundingClientRect()
  setMenuPosition({
    x: rect.left + rect.width / 2,
    y: rect.top
  })
  setMenuOpen(true)
}

return (
  <>
    <div onLongPress={handleLongPress}>
      {/* Photo */}
    </div>
    
    <ActionMenu
      isOpen={menuOpen}
      position={menuPosition}
      onAdjust={() => openRepositionModal(photo.id)}
      onReplace={() => openReplaceModal(photo.id)}
      onClose={() => setMenuOpen(false)}
    />
  </>
)
```

---

### PART 4: Drag & Drop for Reorder

**Original doc says "prefer native HTML" but this is too complex. Use a library:**

**RECOMMENDATION: Use `@dnd-kit/core`**

```bash
npm install @dnd-kit/core @dnd-kit/sortable
```

**Implementation:**

```javascript
// src/components/CollageBuilder.jsx - Reorder mode

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Sortable Photo Item
function SortablePhotoItem({ photo, index }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id })
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="relative cursor-move"
    >
      <img src={photo.thumbnailUrl || photo.url} alt={photo.name} />
      
      {/* Drag handle */}
      <div className="absolute top-2 left-2 bg-black/80 rounded px-2 py-1">
        <span className="text-xs font-bold">≡</span>
      </div>
      
      {/* Order number */}
      <div className="absolute top-2 right-2 bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center">
        <span className="text-xs font-bold">{index + 1}</span>
      </div>
    </div>
  )
}

// In CollageBuilder
function CollageBuilder() {
  const [isReorderMode, setIsReorderMode] = useState(false)
  const [selectedPhotos, setSelectedPhotos] = useState([])
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Prevent accidental drags
      },
    })
  )
  
  const handleDragEnd = (event) => {
    const { active, over } = event
    
    if (active.id !== over.id) {
      setSelectedPhotos((photos) => {
        const oldIndex = photos.findIndex(p => p.id === active.id)
        const newIndex = photos.findIndex(p => p.id === over.id)
        
        return arrayMove(photos, oldIndex, newIndex)
      })
    }
  }
  
  if (isReorderMode) {
    return (
      <div>
        <button onClick={() => setIsReorderMode(false)}>
          Done Reordering
        </button>
        
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={selectedPhotos.map(p => p.id)}
            strategy={rectSortingStrategy}
          >
            <div className="grid grid-cols-3 gap-4">
              {selectedPhotos.map((photo, index) => (
                <SortablePhotoItem
                  key={photo.id}
                  photo={photo}
                  index={index}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>
    )
  }
  
  // Normal mode...
}
```

---

## ⚠️ KNOWN ISSUES IN ORIGINAL DOCS

### Issue 1: Thumbnail Quality
**Original doc says:**
```javascript
quality ~ 0.8
```

**Problem:** 0.8 is too high for thumbnails, creates large files.

**Fix:**
```javascript
// For thumbnails (small preview):
canvas.toBlob(resolve, 'image/jpeg', 0.7)

// For full collage (download):
canvas.toBlob(resolve, 'image/jpeg', 0.9)
```

### Issue 2: Missing Error Handling
**Original docs lack error handling for:**
- Image load failures
- Canvas rendering errors
- Firestore write failures
- Storage upload failures

**Fix:** Wrap all async operations in try-catch and provide user feedback.

### Issue 3: CollageView Routing
**Original doc says:**
```jsx
<Route path="/collage/:id" element={<CollageView />} />
```

**Missing:** Authentication check and loading state.

**Fix:**
```jsx
<Route
  path="/collage/:id"
  element={
    <ProtectedRoute>
      <Suspense fallback={<CollageViewSkeleton />}>
        <CollageView />
      </Suspense>
    </ProtectedRoute>
  }
/>
```

---

## 💡 BEST PRACTICES

### 1. Component File Structure
```
src/features/collage/
├── components/
│   ├── CollageBuilder.jsx
│   ├── CollagePreview.jsx
│   ├── PhotoCell.jsx
│   ├── RepositionModal.jsx
│   ├── ReplacePhotoModal.jsx
│   ├── ActionMenu.jsx
│   └── ReorderGrid.jsx
├── hooks/
│   ├── useCollageData.js
│   └── useCanvasRenderer.js
├── utils/
│   ├── renderCollageToCanvas.js
│   └── calculateSlotBounds.js
└── pages/
    └── CollageView.jsx
```

### 2. State Management Pattern
```javascript
// Use Zustand store for collage state
// src/stores/collageStore.js

import { create } from 'zustand'

const useCollageStore = create((set) => ({
  // Step tracking
  currentStep: 1,
  setStep: (step) => set({ currentStep: step }),
  
  // Photo selection
  selectedPhotos: [],
  setSelectedPhotos: (photos) => set({ selectedPhotos: photos }),
  
  // Layout
  selectedLayout: null,
  setSelectedLayout: (layout) => set({ selectedLayout: layout }),
  
  // Transforms
  transforms: {},
  setTransform: (photoId, transform) => 
    set((state) => ({
      transforms: { ...state.transforms, [photoId]: transform }
    })),
  
  // Reset
  reset: () => set({
    currentStep: 1,
    selectedPhotos: [],
    selectedLayout: null,
    transforms: {}
  })
}))
```

### 3. Translation Keys Structure
```json
{
  "collage": {
    "actions": {
      "adjustPhoto": "Adjust Photo",
      "replacePhoto": "Replace Photo",
      "cancel": "Cancel"
    },
    "reorder": {
      "title": "Reorder Photos",
      "button": "Reorder Photos",
      "done": "Done Reordering",
      "instructions": "Drag photos to reorder them"
    },
    "view": {
      "title": "Collage",
      "edit": "Edit",
      "delete": "Delete",
      "share": "Share",
      "download": "Download"
    }
  }
}
```

---

## 🎯 IMPLEMENTATION PRIORITY

**Phase CV-1: Core Viewing (MUST HAVE)**
1. ✅ Fix all field names (url, thumbnailUrl)
2. ✅ Implement renderCollageToCanvas.js
3. ✅ Create CollageView.jsx
4. ✅ Add routing
5. ✅ Thumbnail generation on save

**Phase CV-2: Edit & Delete (HIGH PRIORITY)**
6. Edit existing collage
7. Delete collage (with confirmation)
8. Update AlbumCard to show thumbnails

**Phase CV-3: Replace Photo (MEDIUM PRIORITY)**
9. Long press detection
10. ActionMenu component
11. ReplacePhotoModal

**Phase CV-4: Reorder (NICE TO HAVE)**
12. Install @dnd-kit
13. Reorder mode UI
14. Drag & drop implementation

---

## ✅ VALIDATION CHECKLIST

Before marking Phase CV complete:

**Thumbnails:**
- [ ] Generated correctly with proper dimensions
- [ ] Uploaded to correct Storage path
- [ ] URL stored in Firestore with correct field name (`thumbnailUrl`)
- [ ] Placeholder shown only when missing
- [ ] Transforms applied correctly in thumbnail

**CollageView:**
- [ ] Full collage displays correctly
- [ ] Aspect ratio preserved
- [ ] Metadata shown (layout, photos, resolution, date)
- [ ] Back button works
- [ ] Share button works (native share API)
- [ ] Download button works

**Edit Flow:**
- [ ] Opens CollageBuilder with existing data
- [ ] Loads correct photos, layout, transforms
- [ ] Skips photo selection step
- [ ] Updates existing collage (doesn't create duplicate)

**Delete Flow:**
- [ ] Shows confirmation modal
- [ ] Deletes Firestore document
- [ ] Deletes thumbnail from Storage
- [ ] Removes from UI immediately
- [ ] Shows success message

**Replace Photo:**
- [ ] Long press works on mobile
- [ ] Hover menu works on desktop
- [ ] ActionMenu positions correctly
- [ ] ReplacePhotoModal opens with single-select
- [ ] Preview updates immediately
- [ ] Transform resets for new photo

**Reorder:**
- [ ] Reorder button visible in customize step
- [ ] Drag handles appear in reorder mode
- [ ] Photos can be dragged to new positions
- [ ] Preview updates immediately
- [ ] Done button exits reorder mode
- [ ] Other controls disabled during reorder

---

## 🔧 DEBUGGING TIPS

### If thumbnails don't generate:
```javascript
// Add logging to renderCollageToCanvas
console.log('Canvas size:', canvas.width, canvas.height)
console.log('Photo count:', photos.length)
console.log('Slot count:', layout.slots.length)

// Check if images load
img.onerror = (e) => {
  console.error('Image load failed:', photo.url, e)
}
```

### If drag & drop doesn't work:
```javascript
// Check sensor activation
console.log('Drag started:', active.id)
console.log('Drag over:', over?.id)

// Verify IDs are unique
console.log('Photo IDs:', selectedPhotos.map(p => p.id))
```

### If long press triggers scroll:
```javascript
// Add CSS to prevent scroll during press
.photo-cell {
  touch-action: none;
}

// Or in component:
<div style={{ touchAction: 'none' }}>
```

---

## 📚 SUMMARY

**This file corrects:**
- ❌ `downloadURL` → ✅ `url`
- ❌ `thumbnailURL` → ✅ `thumbnailUrl`

**This file adds:**
- ✅ Complete renderCollageToCanvas.js implementation
- ✅ Long press detection code
- ✅ ActionMenu component
- ✅ Drag & drop with @dnd-kit
- ✅ Error handling patterns
- ✅ Testing checklist

**Implementation order:**
1. Apply field name corrections
2. Implement canvas rendering
3. Create CollageView
4. Add edit/delete
5. Add replace photo
6. Add reorder

**Claude Code should now have everything needed to implement Phase CV correctly!** 🚀
