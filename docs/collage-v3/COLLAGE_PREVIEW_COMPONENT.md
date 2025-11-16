# CollagePreview Component Documentation

## Overview

The `CollagePreview` component is the core rendering component for Collage Builder V3. It displays photos in a responsive grid layout with support for transforms, click interactions, and loading states.

---

## Component Structure

```
CollagePreview.jsx (main component)
├── PhotoCell.jsx (sub-component for each photo)
└── CollagePreviewSkeleton.jsx (loading skeleton)
```

---

## CollagePreview API

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `photos` | `Photo[]` | Yes | `[]` | Array of photo objects from Firestore |
| `layout` | `LayoutV3` | Yes | - | Layout configuration object |
| `transforms` | `Object` | No | `{}` | Transform data `{ [photoId]: { scale, translateX, translateY } }` |
| `onImageClick` | `Function` | No | `null` | Click handler `(photoId) => void` |
| `isLoading` | `boolean` | No | `false` | Loading state overlay |
| `className` | `string` | No | `''` | Additional CSS classes |

### Photo Object Schema

```javascript
{
  id: string,              // Required: Unique photo ID
  downloadURL: string,     // Required: Full resolution URL
  thumbnail: string,       // Optional: Thumbnail URL (used if available)
  filename: string         // Optional: Display name
}
```

### Transform Object Schema

```javascript
{
  [photoId]: {
    scale: number,        // 1.0 = 100%, 1.5 = 150%, etc.
    translateX: number,   // Horizontal offset in pixels
    translateY: number    // Vertical offset in pixels
  }
}
```

### Example Usage

```jsx
import CollagePreview from './CollagePreview'
import { LAYOUTS_V3 } from '../layouts/layouts_v3'

function MyComponent() {
  const photos = [
    {
      id: 'photo1',
      downloadURL: 'https://example.com/photo1.jpg',
      thumbnail: 'https://example.com/photo1_thumb.jpg',
      filename: 'Summer Beach.jpg'
    },
    {
      id: 'photo2',
      downloadURL: 'https://example.com/photo2.jpg',
      thumbnail: 'https://example.com/photo2_thumb.jpg',
      filename: 'Mountain View.jpg'
    }
  ]

  const transforms = {
    photo1: { scale: 1.2, translateX: 10, translateY: -5 }
  }

  const handleImageClick = (photoId) => {
    console.log('Clicked photo:', photoId)
    // Open RepositionModal
  }

  return (
    <CollagePreview
      photos={photos}
      layout={LAYOUTS_V3.side_by_side}
      transforms={transforms}
      onImageClick={handleImageClick}
    />
  )
}
```

---

## PhotoCell API

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `photo` | `Photo` | No | `null` | Photo object (null shows empty placeholder) |
| `slot` | `Slot` | Yes | - | Layout slot configuration |
| `transform` | `Transform` | No | `{ scale: 1, translateX: 0, translateY: 0 }` | Transform values |
| `onClick` | `Function` | No | `null` | Click handler `(photoId) => void` |
| `isLoading` | `boolean` | No | `false` | Shows loading skeleton |

### Slot Object Schema

```javascript
{
  id: string,           // Required: Unique slot ID
  area: string,         // Required: CSS Grid area (e.g., '1 / 1 / 2 / 2')
  crop: string,         // Optional: 'center', 'top', 'bottom', 'left', 'right'
  objectFit: string     // Optional: 'cover', 'contain'
}
```

### States & Behaviors

**Loading State:**
- Shows pulsing skeleton with ImageIcon
- Displays while image is loading

**Error State:**
- Red border with error icon
- Shows if image URL fails to load
- Displays error message

**Empty State:**
- Dashed border placeholder
- Shows when photo is `null`
- Indicates empty slot

**Adjusted State:**
- Blue badge shows zoom percentage on hover
- "Adjusted" indicator if transform is applied
- Click hint: "Click to adjust"

---

## CollagePreviewSkeleton API

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `layout` | `LayoutV3` | No | `null` | Layout for skeleton grid structure |
| `className` | `string` | No | `''` | Additional CSS classes |

### Usage

```jsx
import CollagePreviewSkeleton from './CollagePreviewSkeleton'
import { LAYOUTS_V3 } from '../layouts/layouts_v3'

function LoadingState() {
  return <CollagePreviewSkeleton layout={LAYOUTS_V3.classic_grid} />
}
```

---

## Features

### 1. Responsive Grid

Automatically switches between desktop and mobile grid templates based on screen width.

**Breakpoint:** 768px

```jsx
// Desktop (≥768px): Uses layout.grid.desktop
gridTemplate: '1fr 1fr'

// Mobile (<768px): Uses layout.grid.mobile
gridTemplate: '1fr' // Stacks vertically
```

### 2. Transform Rendering

Applies CSS transforms to photos based on transform data.

```css
transform: scale(1.2) translate(10px, -5px);
transform-origin: center center;
```

**Transform Limits:**
- Scale: 1.0 - 3.0 (100% - 300%)
- Translate: Unrestricted (constrained in RepositionModal)

### 3. Image Optimization

**Loading Strategy:**
1. Use `thumbnail` URL if available (faster loading)
2. Fallback to `downloadURL` if no thumbnail
3. Lazy load with `loading="lazy"` attribute
4. Progressive enhancement: skeleton → thumbnail → full image

**Object Fit:**
- Uses `slot.objectFit` (default: 'cover')
- Respects `slot.crop` position

### 4. Click Interactions

**Hover Effects:**
- Black overlay (50% opacity)
- "Click to adjust" text appears
- Zoom percentage badge shows

**Click Handler:**
- Calls `onImageClick(photoId)`
- Disabled when `isLoading` is true
- Only active if `onImageClick` prop provided

### 5. Aspect Ratio Preservation

Container maintains layout aspect ratio on all screen sizes.

```jsx
// Parse aspect ratio string (e.g., "16:9")
const [ratioW, ratioH] = layout.aspectRatio.split(':').map(Number)

// Calculate padding-bottom percentage
const aspectRatioPadding = ((ratioH / ratioW) * 100).toFixed(2)

// Apply to container
<div style={{ paddingBottom: `${aspectRatioPadding}%` }}>
```

---

## Validation & Error Handling

### Photo Count Validation

```javascript
const isValidPhotoCount =
  photoCount >= layout.minPhotos &&
  photoCount <= layout.maxPhotos
```

**Error Message:**
- Shows yellow warning if photo count invalid
- Displays: "Invalid photo count: 2 provided, needs 4-4"

### Layout Validation

```javascript
if (!layout) {
  return <div>Error: No layout provided</div>
}
```

### Missing Photo Handling

- Empty slots show dashed placeholder
- No error thrown if photos.length < slots.length
- Extra photos ignored if photos.length > slots.length

### Image Load Errors

- PhotoCell handles `onError` event
- Shows red error placeholder
- Displays "Failed to load" message

---

## Styling

### Glass-Morphism Design

```jsx
className="rounded-xl border border-white/20 bg-black/10 backdrop-blur-sm"
```

### Transitions

```jsx
className="transition-all duration-300"  // Container
className="transition-all duration-200"  // Image transform
className="transition-opacity"           // Hover overlays
```

### Dark/Light Mode

Component uses Tailwind's opacity-based colors:
- `bg-white/10` - Works in both modes
- `border-white/20` - Subtle borders
- `text-white` - Text content

No explicit dark mode classes needed.

---

## Performance Optimization

### 1. Lazy Loading

```jsx
<img loading="lazy" />
```

### 2. Thumbnail Priority

```jsx
src={photo.thumbnail || photo.downloadURL}
```

### 3. Resize Listener Cleanup

```javascript
useEffect(() => {
  window.addEventListener('resize', handleResize)
  return () => window.removeEventListener('resize', handleResize)
}, [])
```

### 4. Conditional Rendering

- Only renders slots defined in layout
- Skips unnecessary re-renders with React.memo (if needed)

---

## Integration Examples

### With Zustand Store

```jsx
import { useCollageStore } from '../store/collageStore'

function CollageBuilderPreview() {
  const { selectedPhotos, selectedLayout, transforms, setRepositionTarget } = useCollageStore()

  const handleImageClick = (photoId) => {
    setRepositionTarget(photoId)
    // RepositionModal opens automatically via store
  }

  return (
    <CollagePreview
      photos={selectedPhotos}
      layout={selectedLayout}
      transforms={transforms}
      onImageClick={handleImageClick}
    />
  )
}
```

### With CollageBuilder

```jsx
function CollageBuilder() {
  const [step, setStep] = useState(3) // Preview step
  const [selectedPhotos, setSelectedPhotos] = useState([...])
  const [selectedLayout, setSelectedLayout] = useState(LAYOUTS_V3.classic_grid)
  const [transforms, setTransforms] = useState({})

  return (
    <div>
      {step === 3 && (
        <CollagePreview
          photos={selectedPhotos}
          layout={selectedLayout}
          transforms={transforms}
          onImageClick={(photoId) => {
            // Open RepositionModal for this photo
            setRepositionTarget(photoId)
          }}
        />
      )}
    </div>
  )
}
```

---

## Testing Checklist

### Visual Tests

- [ ] Layout renders correctly for all 12 layouts
- [ ] Aspect ratio preserved on all screen sizes
- [ ] Responsive grid switches at 768px breakpoint
- [ ] Images load progressively (skeleton → thumbnail → full)
- [ ] Transforms apply correctly (scale, translate)
- [ ] Hover effects work (overlay, badge, hint text)
- [ ] Click interactions trigger correctly

### Functional Tests

- [ ] Empty slots show placeholder
- [ ] Missing photos don't crash component
- [ ] Invalid photo count shows error message
- [ ] Image load errors show error state
- [ ] Loading overlay displays when `isLoading` true
- [ ] Transform data updates visually
- [ ] `onImageClick` callback fires with correct photoId

### Responsive Tests

- [ ] Desktop: Uses `layout.grid.desktop`
- [ ] Mobile: Uses `layout.grid.mobile`
- [ ] Resize listener updates grid template
- [ ] Touch interactions work on mobile
- [ ] Hover effects disabled on touch devices (CSS handles)

### Accessibility Tests

- [ ] Images have alt text (filename or fallback)
- [ ] Focus states visible for clickable cells
- [ ] Keyboard navigation works (tab through cells)
- [ ] Screen reader announces photo names
- [ ] Loading states have ARIA labels (optional enhancement)

---

## Known Limitations

1. **No drag reposition in preview** - Click to open RepositionModal instead
2. **Max 6 photos** - Layout system supports up to 6 photos
3. **Fixed gap/padding** - Defined by layout, not customizable in preview
4. **No zoom in preview** - Transform preview only, actual zoom in modal

---

## Future Enhancements

1. **Drag-to-reorder photos** - Allow swapping photo positions
2. **Pinch-to-zoom** - Touch gesture support in preview
3. **Filter effects preview** - Show filters/adjustments
4. **Animation on load** - Fade in photos sequentially
5. **Background patterns** - Custom collage backgrounds

---

## Related Components

- **RepositionModal** - Edit individual photo transforms
- **LayoutSelector** - Choose collage layout
- **ImagePickerV3** - Select photos for collage
- **useCollageCanvas** - Export collage to canvas/image

---

**Ready for Phase D (RepositionModal).**
