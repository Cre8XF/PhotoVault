# COLLAGE BUILDER V3 — VISUAL DESIGN REFERENCE

## PURPOSE

This document provides exact visual targets for all UI components. Use this as the design specification when coding.

---

## LAYOUT ICONS (12 total)

Each layout has a visual icon representation (80x80px button).

### 1-Photo Layouts

```
┌──────────────┐
│              │
│              │  Hero Single (1:1)
│      1       │  Full photo, centered
│              │
│              │
└──────────────┘

┌────────────────────┐
│                    │  Hero Wide (16:9)
│         1          │  Landscape photo
│                    │
└────────────────────┘

┌──────────┐
│          │
│          │
│    1     │  Hero Portrait (3:4)
│          │  Vertical photo
│          │
│          │
└──────────┘
```

### 2-Photo Layouts

```
┌──────┬──────┐
│      │      │  Side by Side
│  1   │  2   │  Equal split
│      │      │
└──────┴──────┘

┌────────────┐
│     1      │  Stacked
├────────────┤  Top/bottom
│     2      │
└────────────┘

┌──────────┬──┐
│          │ 2│  Dominant Left
│    1     │  │  Large + small
│          │  │
└──────────┴──┘
```

### 3-Photo Layouts

```
┌────┬────┬────┐
│ 1  │ 2  │ 3  │  Triple Row
└────┴────┴────┘  Equal thirds

┌──────────┬────┐
│          │ 2  │  L-Shape
│    1     ├────┤  One large + two small
│          │ 3  │
└──────────┴────┘

┌────┬─────────┐
│ 1  │         │  Reverse L
├────┤    3    │  Creative asymmetric
│ 2  │         │
└────┴─────────┘
```

### 4-Photo Layouts

```
┌─────┬─────┐
│  1  │  2  │  Classic Grid (2x2)
├─────┼─────┤  Perfect squares
│  3  │  4  │
└─────┴─────┘

┌─────────┬───┐
│         │ 2 │  Featured + Three
│    1    ├───┤  One hero photo
│         │ 3 │
│         ├───┤
│         │ 4 │
└─────────┴───┘

┌───┬───┬───┬───┐
│ 1 │ 2 │ 3 │ 4 │  Timeline
└───┴───┴───┴───┘  Horizontal strip
```

### 5-6 Photo Layouts

```
┌─────┬─────┬─────┐
│  1  │  2  │  3  │  Triple Row (5-6 photos)
├─────┼─────┼─────┤  Top row 3, bottom row 2-3
│  4  │  5  │ (6) │
└─────┴─────┴─────┘

┌─────────┬─────┐
│         │  2  │  Magazine Style
│    1    ├─────┤  Complex asymmetric
│         │  3  │
├────┬────┼─────┤
│ 4  │ 5  │ (6) │
└────┴────┴─────┘
```

---

## LAYOUT SELECTOR UI

### Desktop View (>768px)

```
┌─────────────────────────────────────────────────────┐
│  Choose Your Layout                          (3/6)  │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌────┐  ┌────┐  ┌────┐  ┌────┐                   │
│  │ □□ │  │ ══ │  │ ▄▀ │  │▓▓▓│   <- Layout icons  │
│  └────┘  └────┘  └────┘  └────┘      (active=blue)│
│   2x2     Side    L-Sh   Grid                      │
│                                                     │
│  ┌────┐  ┌────┐  ┌────┐  ┌────┐                   │
│  │▒▒▒│  │▓░░│  │≡≡≡│  │ ░  │   <- More layouts   │
│  └────┘  └────┘  └────┘  └────┘      (disabled=gray)
│   Mag    Hero   Triple  Port                       │
│                                                     │
│                         ┌──────────────┐           │
│                         │ ✨ Auto-Fill │           │
│                         └──────────────┘           │
└─────────────────────────────────────────────────────┘
```

### Mobile View (<768px)

```
┌─────────────────────┐
│ Choose Layout  3/6  │
├─────────────────────┤
│  ┌───┐  ┌───┐       │
│  │□□ │  │══ │       │  <- 2 per row
│  └───┘  └───┘       │
│  2x2    Side        │
│                     │
│  ┌───┐  ┌───┐       │
│  │▄▀ │  │▓▓▓│       │
│  └───┘  └───┘       │
│  L-Sh   Grid        │
│                     │
│  [More layouts...]  │
│                     │
│ ┌─────────────────┐ │
│ │  ✨ Auto-Fill  │ │
│ └─────────────────┘ │
└─────────────────────┘
```

**Icon Styling:**

```jsx
<button
  className={cn(
    'aspect-square rounded-lg border-2 p-3',
    'flex flex-col items-center justify-center gap-2',
    'hover:scale-105 active:scale-95 transition-all',
    isSelected
      ? 'border-blue-500 bg-blue-500/10'
      : 'border-white/20 bg-white/5',
    isDisabled && 'opacity-30 cursor-not-allowed'
  )}
>
  <LayoutIconSVG layout={layout} />
  <span className="text-xs">{layout.name}</span>
</button>
```

---

## IMAGE PICKER UI

### Desktop (>768px)

```
┌──────────────────────────────────────────────────────────┐
│  Select Photos (max 6)                        [Search..] │
├──────────────────────────────────────────────────────────┤
│  [All] [⭐ Favorites] [📱 Screenshots] [🕐 Recent] [🤖 AI]│ <- Tabs
├──────────────────────────────────────────────────────────┤
│  Today                                                   │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐                   │
│  │ ✓ │ │   │ │ ✓ │ │   │ │ ✓ │ │   │   <- Photo grid  │
│  └───┘ └───┘ └───┘ └───┘ └───┘ └───┘      (checkmark)  │
│                                                          │
│  Yesterday                                               │
│  ┌───┐ ┌───┐ ┌───┐                                      │
│  │   │ │   │ │   │                                      │
│  └───┘ └───┘ └───┘                                      │
│                                                          │
│  Last Week                                               │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐                                │
│  │   │ │   │ │   │ │   │                                │
│  └───┘ └───┘ └───┘ └───┘                                │
├──────────────────────────────────────────────────────────┤
│  3 / 6 selected                     [Continue →]         │
└──────────────────────────────────────────────────────────┘
```

### Mobile (<768px)

```
┌────────────────────┐
│  Select (3/6)      │
│  [Search.........]  │
├────────────────────┤
│ [All][⭐][📱][🕐][🤖]│ <- Icon tabs
├────────────────────┤
│  Today             │
│  ┌────┬────┐       │  <- 2 cols
│  │ ✓  │    │       │
│  └────┴────┘       │
│  ┌────┬────┐       │
│  │ ✓  │    │       │
│  └────┴────┘       │
│                    │
│  Yesterday         │
│  ┌────┬────┐       │
│  │    │    │       │
│  └────┴────┘       │
├────────────────────┤
│ [Continue →]       │
└────────────────────┘
```

**Photo Card Styling:**

```jsx
<div
  className={cn(
    'relative aspect-square rounded-lg overflow-hidden',
    'border-2 transition-all cursor-pointer',
    isSelected
      ? 'border-blue-500 scale-95'
      : 'border-transparent hover:border-white/30',
    isDisabled && 'opacity-50 cursor-not-allowed'
  )}
>
  <img src={photo.thumbnail} className="w-full h-full object-cover" />

  {isSelected && (
    <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
        <CheckIcon className="w-5 h-5 text-white" />
      </div>
    </div>
  )}
</div>
```

---

## REPOSITION MODAL

### Desktop

```
┌────────────────────────────────────────────────────┐
│  ← Back          Adjust Photo          Reset  Save │ <- Header
├────────────────────────────────────────────────────┤
│                                                    │
│                                                    │
│           ┌─────────────────────┐                 │
│           │                     │                 │
│           │   [Draggable        │                 │  Main area
│           │    zoomable         │                 │  (centered)
│           │    photo area]      │                 │
│           │                     │                 │
│           └─────────────────────┘                 │
│                                                    │
│                                                    │
├────────────────────────────────────────────────────┤
│  🔍 Zoom: [────●──────────] 150%                  │ <- Footer
└────────────────────────────────────────────────────┘
```

### Mobile

```
┌─────────────────────┐
│  ← Back      Save ✓ │
├─────────────────────┤
│                     │
│  ┌───────────────┐  │
│  │               │  │
│  │  [Draggable   │  │  Full screen
│  │   photo]      │  │  image area
│  │               │  │
│  │               │  │
│  └───────────────┘  │
│                     │
├─────────────────────┤
│ 🔍 [──●───] 150%    │
│ [Reset]             │
└─────────────────────┘
```

**Drag Visual Feedback:**

```jsx
// Show grid overlay during drag
<div className="absolute inset-0 pointer-events-none">
  <div className="grid grid-cols-3 grid-rows-3 h-full w-full">
    {[...Array(9)].map((_, i) => (
      <div key={i} className="border border-white/20" />
    ))}
  </div>
</div>
```

**Zoom Control:**

```jsx
<div className="flex items-center gap-4">
  <span className="text-sm">🔍 Zoom:</span>
  <input
    type="range"
    min="100"
    max="300"
    step="10"
    value={zoom}
    onChange={(e) => setZoom(e.target.value)}
    className="flex-1 accent-blue-500"
  />
  <span className="text-sm font-mono">{zoom}%</span>
</div>
```

---

## COLLAGE PREVIEW

### Desktop Preview

```
┌────────────────────────────────────────────────┐
│  Your Collage Preview                          │
├────────────────────────────────────────────────┤
│                                                │
│        ┌──────────────────────┐               │
│        │                      │               │
│        │   [Collage layout    │               │
│        │    with photos       │               │
│        │    arranged per      │               │
│        │    selected layout]  │               │
│        │                      │               │
│        │   Click photo to     │               │
│        │   adjust position    │               │
│        │                      │               │
│        └──────────────────────┘               │
│                                                │
│     [ ← Change Layout ]  [ Save Collage → ]   │
└────────────────────────────────────────────────┘
```

### Mobile Preview

```
┌──────────────────┐
│ Preview          │
├──────────────────┤
│                  │
│ ┌──────────────┐ │
│ │              │ │
│ │  [Collage]   │ │
│ │              │ │
│ │  Tap photo   │ │
│ │  to adjust   │ │
│ │              │ │
│ └──────────────┘ │
│                  │
├──────────────────┤
│ [← Layout] [Save]│
└──────────────────┘
```

**Photo Cell with Click Hint:**

```jsx
<div
  className="relative group cursor-pointer"
  onClick={() => onImageClick(photo.id)}
>
  <img
    src={photo.thumbnail}
    style={{
      transform: `scale(${transform.scale}) translate(${transform.translateX}px, ${transform.translateY}px)`,
      objectFit: 'cover',
    }}
    className="w-full h-full transition-transform"
  />

  {/* Hover hint */}
  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
    <span className="text-white text-sm">Click to adjust</span>
  </div>
</div>
```

---

## STEP INDICATOR

### Desktop

```
┌────────────────────────────────────────────────┐
│     ①────────②────────③────────④              │
│   Select  Layout   Edit    Save               │
└────────────────────────────────────────────────┘
```

### Mobile

```
┌──────────────────┐
│  ①───②───③───④  │
└──────────────────┘
```

**Implementation:**

```jsx
const STEPS = [
  { id: 1, label: 'Select' },
  { id: 2, label: 'Layout' },
  { id: 3, label: 'Edit' },
  { id: 4, label: 'Save' },
]

;<div className="flex items-center justify-center gap-2">
  {STEPS.map((step, index) => (
    <React.Fragment key={step.id}>
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center text-sm',
          currentStep >= step.id
            ? 'bg-blue-500 text-white'
            : 'bg-white/10 text-white/50'
        )}
      >
        {step.id}
      </div>

      {index < STEPS.length - 1 && (
        <div
          className={cn(
            'h-0.5 w-8 md:w-16',
            currentStep > step.id ? 'bg-blue-500' : 'bg-white/20'
          )}
        />
      )}
    </React.Fragment>
  ))}
</div>
```

---

## COLOR PALETTE

### Glass-Morphism Effects

```css
/* Modal overlay */
background: rgba(0, 0, 0, 0.8);
backdrop-filter: blur(24px);

/* Card background (light mode) */
background: rgba(255, 255, 255, 0.1);
border: 1px solid rgba(255, 255, 255, 0.2);

/* Card background (dark mode) */
background: rgba(0, 0, 0, 0.2);
border: 1px solid rgba(255, 255, 255, 0.1);
```

### Primary Colors

```javascript
const colors = {
  primary: {
    blue: '#3b82f6', // Tailwind blue-500
    blueHover: '#2563eb', // Tailwind blue-600
  },
  success: '#22c55e', // green-500
  error: '#ef4444', // red-500
  warning: '#eab308', // yellow-500
}
```

### Spacing System

```javascript
const spacing = {
  xs: '4px', // gap-1
  sm: '8px', // gap-2 (thumbnails, tight spacing)
  md: '16px', // gap-4 (standard spacing)
  lg: '24px', // gap-6 (section spacing)
  xl: '32px', // gap-8 (large spacing)
}
```

### Border Radius

```javascript
const radius = {
  sm: '4px', // rounded
  md: '8px', // rounded-lg (cards)
  lg: '12px', // rounded-xl (modals)
  full: '9999px', // rounded-full (circles)
}
```

---

## LOADING STATES

### Skeleton Loader

```jsx
<div className="animate-pulse">
  <div className="bg-white/10 rounded-lg aspect-square" />
</div>
```

### Spinner

```jsx
<div className="flex items-center justify-center p-8">
  <div className="w-8 h-8 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin" />
</div>
```

### Progressive Image Load

```jsx
<div className="relative">
  {/* Blurred placeholder */}
  <img src={photo.thumbnail} className="blur-sm" />

  {/* Full resolution (loads on top) */}
  <img
    src={photo.downloadURL}
    className="absolute inset-0 transition-opacity"
    onLoad={(e) => e.target.classList.add('opacity-100')}
    style={{ opacity: 0 }}
  />
</div>
```

---

## TRANSITIONS & ANIMATIONS

### Standard Transitions

```jsx
// Button hover
className = 'transition-all duration-200 hover:scale-105'

// Modal enter/exit
className = 'transition-opacity duration-300'

// Smooth transform
className = 'transition-transform duration-200 ease-out'
```

### Custom Animations

```css
/* Fade in from bottom */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.slide-up {
  animation: slideUp 0.3s ease-out;
}
```

---

## RESPONSIVE BREAKPOINTS

### Grid Columns

```jsx
// Photo grid
className =
  'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2'

// Layout selector
className = 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'
```

### Text Sizing

```jsx
// Headers
className = 'text-xl md:text-2xl lg:text-3xl'

// Body text
className = 'text-sm md:text-base'

// Small text
className = 'text-xs md:text-sm'
```

---

## ACCESSIBILITY

### Focus States

```jsx
className =
  'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
```

### ARIA Labels

```jsx
<button aria-label="Close modal">✕</button>
<img src={photo.url} alt={photo.filename || "Photo"} />
<input aria-label="Search photos" placeholder="Search..." />
```

### Keyboard Navigation

```jsx
onKeyDown={(e) => {
  if (e.key === 'Escape') onClose();
  if (e.key === 'Enter') onSave();
  if (e.key === 'ArrowLeft') previousPhoto();
  if (e.key === 'ArrowRight') nextPhoto();
}}
```

---

## SUMMARY

Use this design reference as the exact target for all visual components. When in doubt:

1. Check this document first
2. Match Pixtr's existing glass-morphism style
3. Ensure mobile responsiveness
4. Support dark/light mode
5. Add smooth transitions

**All designs should feel premium, smooth, and intuitive.**
