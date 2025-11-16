# RepositionModal Component Documentation

## Overview

The `RepositionModal` component provides an interactive drag-and-zoom interface for adjusting individual photos within a collage. Features full-screen modal, pointer events, zoom controls, keyboard shortcuts, and touch gesture support.

---

## Component API

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `photo` | `Photo` | Yes | - | Photo object from Firestore |
| `currentTransform` | `Transform` | No | `{ scale: 1, translateX: 0, translateY: 0 }` | Initial transform values |
| `onSave` | `Function` | Yes | - | Save handler `(transform) => void` |
| `onClose` | `Function` | Yes | - | Close handler `() => void` |
| `isOpen` | `boolean` | No | `true` | Modal open state |

### Photo Object Schema

```javascript
{
  id: string,              // Required: Unique photo ID
  downloadURL: string,     // Required: Full resolution URL
  thumbnail: string,       // Optional: Thumbnail URL
  filename: string         // Optional: Display name
}
```

### Transform Object Schema

```javascript
{
  scale: number,        // 1.0 - 3.0 (100% - 300%)
  translateX: number,   // Horizontal offset in pixels
  translateY: number    // Vertical offset in pixels
}
```

---

## Usage Example

```jsx
import RepositionModal from './RepositionModal'

function CollageBuilder() {
  const [repositionTarget, setRepositionTarget] = useState(null)
  const [transforms, setTransforms] = useState({})

  const photo = {
    id: 'photo1',
    downloadURL: 'https://example.com/photo.jpg',
    thumbnail: 'https://example.com/photo_thumb.jpg',
    filename: 'Summer Beach.jpg'
  }

  const handleImageClick = (photoId) => {
    setRepositionTarget(photoId)
  }

  const handleSave = (newTransform) => {
    setTransforms({
      ...transforms,
      [repositionTarget]: newTransform
    })
    setRepositionTarget(null)
  }

  const handleClose = () => {
    setRepositionTarget(null)
  }

  const currentTransform = transforms[repositionTarget] ||
    { scale: 1, translateX: 0, translateY: 0 }

  return (
    <div>
      {/* Photo preview that opens modal */}
      <img
        src={photo.thumbnail}
        onClick={() => handleImageClick(photo.id)}
      />

      {/* Modal */}
      {repositionTarget && (
        <RepositionModal
          photo={photo}
          currentTransform={currentTransform}
          onSave={handleSave}
          onClose={handleClose}
        />
      )}
    </div>
  )
}
```

---

## Features

### 1. Drag to Reposition

**Pointer Events API:**
- Works with mouse and touch
- Smooth dragging with pointer capture
- Visual feedback during drag

**Implementation:**
```javascript
onPointerDown={(e) => {
  imageRef.current.setPointerCapture(e.pointerId)
  setIsDragging(true)
}}

onPointerMove={(e) => {
  if (isDragging) {
    const newTranslateX = e.clientX - dragStartRef.current.x
    const newTranslateY = e.clientY - dragStartRef.current.y
    updateTransform({ ...transform, translateX: newTranslateX, translateY: newTranslateY })
  }
}}

onPointerUp={(e) => {
  imageRef.current.releasePointerCapture(e.pointerId)
  setIsDragging(false)
}}
```

**Visual Feedback:**
- Cursor changes: `grab` → `grabbing`
- Rule of thirds grid overlay appears during drag
- Smooth transitions when not dragging

### 2. Zoom Control

**Three Zoom Methods:**

**A. Slider (Main Control)**
```jsx
<input
  type="range"
  min={1.0}
  max={3.0}
  step={0.01}
  value={scale}
  onChange={(e) => setScale(parseFloat(e.target.value))}
/>
```

**B. Zoom Buttons (+/-)**
- Step: 0.1 (10% increments)
- Min: 1.0 (100%)
- Max: 3.0 (300%)

**C. Mouse Wheel**
```javascript
onWheel={(e) => {
  e.preventDefault()
  const delta = e.deltaY > 0 ? -0.1 : 0.1
  const newScale = Math.max(1.0, Math.min(3.0, scale + delta))
  setScale(newScale)
}}
```

**Zoom Percentage Display:**
- Shows current zoom (e.g., "150%")
- Updates in real-time
- Font-mono for clarity

### 3. Reset Button

**Functionality:**
- Resets to default: `{ scale: 1, translateX: 0, translateY: 0 }`
- Disabled when no changes made
- Smooth animation back to center

**UI State:**
```jsx
<button
  onClick={handleReset}
  disabled={!hasChanges}
  className="disabled:opacity-50 disabled:cursor-not-allowed"
>
  <RotateCcw /> Reset
</button>
```

### 4. Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `ESC` | Close modal (with unsaved changes warning) |
| `ENTER` | Save and close |
| `+` or `=` | Zoom in (+10%) |
| `-` or `_` | Zoom out (-10%) |
| `R` | Reset transform |

**Implementation:**
```javascript
useEffect(() => {
  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'Escape':
        handleClose()
        break
      case 'Enter':
        handleSave()
        break
      // ... more shortcuts
    }
  }

  document.addEventListener('keydown', handleKeyDown)
  return () => document.removeEventListener('keydown', handleKeyDown)
}, [])
```

### 5. Touch Gesture Support

**Pointer Events (Universal):**
- Single-finger drag: Reposition
- Works on touch screens and mouse
- Pinch-to-zoom: Native browser behavior (not prevented)

**Mobile Optimizations:**
- Min 44px touch targets
- Large tap areas for buttons
- Visual feedback on touch
- No hover states (handled by CSS)

---

## UI Layout

### Desktop (>768px)

```
┌─────────────────────────────────────────────────────┐
│  ← Back      Adjust Photo      Reset      Save ✓    │  <- Header
├─────────────────────────────────────────────────────┤
│                                                     │
│                                                     │
│              [Draggable/Zoomable Photo]            │  <- Main area
│                                                     │     (centered)
│                                                     │
│              "Drag to reposition"                   │  <- Instructions
├─────────────────────────────────────────────────────┤
│  [-]  🔍 Zoom: [────●────────] 150%  [+]           │  <- Footer
│                                                     │     (zoom controls)
│  ESC • ENTER • +/- • R                             │  <- Shortcuts hint
└─────────────────────────────────────────────────────┘
```

### Mobile (<768px)

```
┌──────────────────┐
│  ←     Save ✓    │  <- Header (compact)
├──────────────────┤
│                  │
│                  │
│  [Draggable]     │  <- Main area
│                  │     (full screen)
│                  │
├──────────────────┤
│ [-] [──●──] [+]  │  <- Footer (simplified)
│ 🔍 150%   Reset  │
└──────────────────┘
```

---

## Styling

### Glass-Morphism Modal

```jsx
className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[1100]"
```

**Header/Footer:**
```jsx
className="bg-white/5 border-b border-white/10"
```

### Transitions

**Smooth Image Transform:**
```css
transition: transform 0.2s ease-out; /* When not dragging */
transition: none; /* During drag for immediate feedback */
```

**Fade-in Animation:**
```jsx
className="animate-fade-in"
```

### Zoom Slider Styling

**Custom gradient fill:**
```jsx
style={{
  background: `linear-gradient(
    to right,
    rgb(59 130 246) 0%,
    rgb(59 130 246) ${progress}%,
    rgba(255,255,255,0.1) ${progress}%,
    rgba(255,255,255,0.1) 100%
  )`
}}
```

---

## State Management

### Internal State

```javascript
const [transform, setTransform] = useState(currentTransform)
const [isDragging, setIsDragging] = useState(false)
const [hasChanges, setHasChanges] = useState(false)
```

### Change Detection

```javascript
const hasChanges =
  transform.scale !== currentTransform.scale ||
  transform.translateX !== currentTransform.translateX ||
  transform.translateY !== currentTransform.translateY
```

### Unsaved Changes Warning

```javascript
const handleClose = () => {
  if (hasChanges) {
    const confirm = window.confirm(t('collage:reposition.confirmClose'))
    if (!confirm) return
  }
  onClose()
}
```

---

## Integration Examples

### With Zustand Store

```jsx
import { useCollageStore } from '../store/collageStore'

function CollageBuilderWithStore() {
  const {
    repositionTarget,
    transforms,
    setRepositionTarget,
    updateTransform
  } = useCollageStore()

  const currentPhoto = photos.find(p => p.id === repositionTarget)
  const currentTransform = transforms[repositionTarget]

  return (
    <>
      {repositionTarget && currentPhoto && (
        <RepositionModal
          photo={currentPhoto}
          currentTransform={currentTransform}
          onSave={(transform) => {
            updateTransform(repositionTarget, transform)
            setRepositionTarget(null)
          }}
          onClose={() => setRepositionTarget(null)}
        />
      )}
    </>
  )
}
```

### With CollagePreview

```jsx
import CollagePreview from './CollagePreview'
import RepositionModal from './RepositionModal'

function CollageBuilder() {
  const [selectedPhotos, setSelectedPhotos] = useState([...])
  const [selectedLayout, setSelectedLayout] = useState(...)
  const [transforms, setTransforms] = useState({})
  const [repositionTarget, setRepositionTarget] = useState(null)

  return (
    <div>
      {/* Preview with clickable photos */}
      <CollagePreview
        photos={selectedPhotos}
        layout={selectedLayout}
        transforms={transforms}
        onImageClick={(photoId) => setRepositionTarget(photoId)}
      />

      {/* Reposition modal */}
      {repositionTarget && (
        <RepositionModal
          photo={selectedPhotos.find(p => p.id === repositionTarget)}
          currentTransform={transforms[repositionTarget]}
          onSave={(transform) => {
            setTransforms({ ...transforms, [repositionTarget]: transform })
            setRepositionTarget(null)
          }}
          onClose={() => setRepositionTarget(null)}
        />
      )}
    </div>
  )
}
```

---

## Accessibility

### Focus Management

```javascript
useEffect(() => {
  if (isOpen && modalRef.current) {
    modalRef.current.focus()
  }
}, [isOpen])
```

### ARIA Labels

```jsx
<button aria-label={t('collage:reposition.close')}>
  <X /> Back
</button>

<button aria-label={t('collage:reposition.zoomIn')}>
  <ZoomIn />
</button>
```

### Keyboard Navigation

- Modal receives focus on open
- Tab through buttons (Back, Reset, Save, Zoom controls)
- Keyboard shortcuts for common actions
- ESC to close (standard modal behavior)

---

## Performance Optimization

### 1. Pointer Capture

```javascript
imageRef.current.setPointerCapture(e.pointerId)
// Ensures smooth dragging even if pointer leaves element
```

### 2. Transition Disable During Drag

```jsx
style={{
  transition: isDragging ? 'none' : 'transform 0.2s ease-out'
}}
```

### 3. Debounced Wheel Events

```javascript
// Wheel events can fire rapidly - consider debouncing
const handleWheel = useCallback(
  debounce((e) => {
    // Zoom logic
  }, 10),
  []
)
```

### 4. Transform Precision

```javascript
// Round to 2 decimal places to avoid floating point issues
const newScale = parseFloat(scale.toFixed(2))
```

---

## Testing Checklist

### Functional Tests

- [ ] Drag repositions image correctly
- [ ] Zoom slider updates scale (1.0 - 3.0)
- [ ] Zoom buttons increment by 0.1
- [ ] Mouse wheel zooms in/out
- [ ] Reset button restores defaults
- [ ] Save button calls `onSave` with correct transform
- [ ] Close button calls `onClose`
- [ ] ESC key closes modal
- [ ] ENTER key saves and closes
- [ ] +/- keys zoom in/out
- [ ] R key resets transform

### Visual Tests

- [ ] Modal covers full screen
- [ ] Glass-morphism styling applied
- [ ] Grid overlay shows during drag
- [ ] Cursor changes (grab/grabbing)
- [ ] Zoom percentage displays correctly
- [ ] Slider fill gradient shows progress
- [ ] Buttons have proper hover states
- [ ] Transitions smooth when not dragging

### Mobile Tests

- [ ] Touch drag works
- [ ] Pinch to zoom (native) works
- [ ] Buttons are min 44px tap targets
- [ ] Header/footer visible on mobile
- [ ] No horizontal scroll
- [ ] Instructions text readable

### Accessibility Tests

- [ ] Modal receives focus on open
- [ ] Tab order is logical
- [ ] ARIA labels on icon-only buttons
- [ ] Keyboard shortcuts work
- [ ] Screen reader announces state changes
- [ ] Focus trapped in modal (ESC to exit)

### Edge Cases

- [ ] Unsaved changes warning shows
- [ ] Clicking backdrop closes modal
- [ ] Very small/large images handled
- [ ] Extreme zoom values (1.0, 3.0) work
- [ ] Rapid zoom changes handled smoothly
- [ ] Component unmounts cleanly (no memory leaks)

---

## Known Limitations

1. **No pinch-to-zoom implementation** - Relies on native browser pinch (works on most touch devices)
2. **No rotation support** - Only scale and translate (rotation could be Phase 2)
3. **No constrained bounds** - User can drag image off-screen (intentional for flexibility)
4. **Single photo only** - Cannot adjust multiple photos simultaneously

---

## Future Enhancements

1. **Two-finger rotation** - Add rotation angle to transform
2. **Flip/mirror** - Horizontal/vertical flip buttons
3. **Aspect ratio lock** - Constrain drag to slot boundaries
4. **Undo/redo** - Transform history stack
5. **Comparison slider** - Before/after view
6. **Grid snap** - Snap to grid lines for alignment

---

## i18n Keys Required

Add to `translation.json`:

```json
{
  "collage": {
    "reposition": {
      "title": "Adjust Photo",
      "back": "Back",
      "close": "Close",
      "reset": "Reset",
      "save": "Save",
      "zoom": "Zoom",
      "zoomIn": "Zoom in",
      "zoomOut": "Zoom out",
      "instructions": "Drag to reposition, scroll to zoom",
      "shortcuts": "Keyboard shortcuts",
      "confirmClose": "You have unsaved changes. Close anyway?"
    }
  }
}
```

---

## Related Components

- **CollagePreview** - Triggers modal via `onImageClick`
- **PhotoCell** - Shows transform result in preview
- **CollageBuilder** - Orchestrates modal state
- **Zustand collageStore** - Manages transforms globally

---

**Ready for Phase E (ImagePickerV3).**
