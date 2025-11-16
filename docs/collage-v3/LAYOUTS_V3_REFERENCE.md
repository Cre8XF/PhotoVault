# LAYOUTS V3 — Visual Reference Guide

## Overview

12 professional collage layouts covering 1-6 photos, with responsive rules and transform support.

---

## 1-Photo Layouts (3 layouts)

### Hero Single (1:1)
**Use case:** Instagram posts, profile pictures, feature images

```
┌──────────────┐
│              │
│              │
│      1       │
│              │
│              │
└──────────────┘

Canvas: 1200×1200px
Grid: 1fr
Slots: 1
```

### Hero Wide (16:9)
**Use case:** Cover photos, banners, landscape photography

```
┌────────────────────────────┐
│                            │
│            1               │
│                            │
└────────────────────────────┘

Canvas: 1920×1080px
Grid: 1fr
Slots: 1
```

### Hero Portrait (3:4)
**Use case:** Story posts, vertical displays, phone screens

```
┌──────────┐
│          │
│          │
│    1     │
│          │
│          │
│          │
└──────────┘

Canvas: 900×1200px
Grid: 1fr
Slots: 1
```

---

## 2-Photo Layouts (3 layouts)

### Side by Side (2:1)
**Use case:** Before/after, comparisons, dual portraits

```
┌────────────┬────────────┐
│            │            │
│     1      │      2     │
│            │            │
└────────────┴────────────┘

Canvas: 2400×1200px
Grid: 1fr 1fr
Slots: 2
Mobile: Stacks vertically
```

### Stacked (1:2)
**Use case:** Top/bottom split, timeline, vertical stories

```
┌──────────────┐
│              │
│      1       │
│              │
├──────────────┤
│              │
│      2       │
│              │
└──────────────┘

Canvas: 1200×2400px
Grid: 1fr / 1fr (1 column, 2 rows)
Slots: 2
```

### Dominant Left (4:3)
**Use case:** Featured photo + detail, main + context

```
┌────────────────┬────┐
│                │    │
│       1        │ 2  │
│                │    │
└────────────────┴────┘

Canvas: 1600×1200px
Grid: 3fr 1fr
Slots: 2
Mobile: Stacks vertically
```

---

## 3-Photo Layouts (3 layouts)

### Triple Row (3:1)
**Use case:** Timeline, triptych, panoramic collage

```
┌──────┬──────┬──────┐
│      │      │      │
│  1   │  2   │  3   │
│      │      │      │
└──────┴──────┴──────┘

Canvas: 3600×1200px
Grid: 1fr 1fr 1fr
Slots: 3
Mobile: Stacks vertically
```

### L-Shape (4:3)
**Use case:** One large + two small, creative asymmetric

```
┌──────────────┬────┐
│              │ 2  │
│      1       ├────┤
│              │ 3  │
└──────────────┴────┘

Canvas: 1600×1200px
Grid: 1fr 1fr / 2fr 1fr
Slots: 3
  - Slot 1: Spans 2 rows (left)
  - Slots 2-3: Stack right
```

### Reverse L (4:3)
**Use case:** Inverted L-shape, two small + one large

```
┌────┬──────────────┐
│ 1  │              │
├────┤      3       │
│ 2  │              │
└────┴──────────────┘

Canvas: 1600×1200px
Grid: 1fr 1fr / 1fr 2fr
Slots: 3
  - Slots 1-2: Stack left
  - Slot 3: Spans 2 rows (right)
```

---

## 4-Photo Layouts (2 layouts)

### Classic Grid (1:1)
**Use case:** Balanced quad, perfect squares, Instagram multi-post

```
┌────────┬────────┐
│   1    │   2    │
├────────┼────────┤
│   3    │   4    │
└────────┴────────┘

Canvas: 2400×2400px
Grid: 1fr 1fr / 1fr 1fr
Slots: 4
Mobile: Same (2×2 works on all screens)
```

### Timeline (4:1)
**Use case:** Horizontal filmstrip, event sequence

```
┌─────┬─────┬─────┬─────┐
│  1  │  2  │  3  │  4  │
└─────┴─────┴─────┴─────┘

Canvas: 4800×1200px
Grid: 1fr 1fr 1fr 1fr
Slots: 4
Mobile: Converts to 2×2 grid
```

---

## 5-6 Photo Layouts (2 layouts)

### Magazine (4:3)
**Use case:** Editorial spread, asymmetric creative layout

```
┌──────────────┬────┐
│              │ 2  │
│      1       ├────┤
│              │ 3  │
├──────┬──────┬────┤
│  4   │  5   │ 6  │
└──────┴──────┴────┘

Canvas: 2400×1800px
Grid: 1fr 1fr 1fr / 1fr 1fr 1fr
Slots: 5-6
  - Slot 1: Large (2×2)
  - Slots 2-3: Small right stack
  - Slots 4-6: Bottom row (optional slot 6)
```

### Polaroid (3:2)
**Use case:** Classic 6-photo grid, balanced layout

```
┌──────┬──────┬──────┐
│  1   │  2   │  3   │
├──────┼──────┼──────┤
│  4   │  5   │  6   │
└──────┴──────┴──────┘

Canvas: 3600×2400px
Grid: 1fr 1fr / 1fr 1fr 1fr
Slots: 6
Mobile: Converts to 2×3 grid
```

---

## Helper Functions

### `getCompatibleLayouts(photoCount)`

Returns layouts that work with the selected photo count.

```javascript
import { getCompatibleLayouts } from './layouts_v3'

// User selected 3 photos
const layouts = getCompatibleLayouts(3)
// Returns: [triple_row, l_shape, reverse_l, magazine*]
// *magazine allows 5-6 photos but minPhotos=5
```

**Example usage in LayoutSelector:**

```javascript
const compatibleLayouts = getCompatibleLayouts(selectedPhotos.length)

return (
  <div className="grid grid-cols-3 gap-4">
    {compatibleLayouts.map(layout => (
      <LayoutIcon key={layout.id} layout={layout} />
    ))}
  </div>
)
```

### `generateLayoutPreview(layout)`

Generates preview data for rendering layout icons.

```javascript
import { generateLayoutPreview } from './layouts_v3'

const preview = generateLayoutPreview(LAYOUTS_V3.classic_grid)
// Returns:
// {
//   cols: 2,
//   rows: 2,
//   cells: [
//     { id: 'slot-0', index: 1, area: '1 / 1 / 2 / 2', label: '1' },
//     { id: 'slot-1', index: 2, area: '1 / 2 / 2 / 3', label: '2' },
//     { id: 'slot-2', index: 3, area: '2 / 1 / 3 / 2', label: '3' },
//     { id: 'slot-3', index: 4, area: '2 / 2 / 3 / 3', label: '4' }
//   ],
//   aspectRatio: '1:1',
//   preview: '...' // ASCII art
// }
```

**Example usage in LayoutIcon component:**

```javascript
function LayoutIcon({ layout, isSelected, onClick }) {
  const preview = generateLayoutPreview(layout)

  return (
    <button
      onClick={onClick}
      className={`aspect-square rounded-lg border-2 p-3 ${
        isSelected ? 'border-blue-500 bg-blue-500/10' : 'border-white/20'
      }`}
    >
      <div
        className="grid w-full h-full gap-0.5"
        style={{ gridTemplate: layout.grid.desktop }}
      >
        {preview.cells.map(cell => (
          <div
            key={cell.id}
            style={{ gridArea: cell.area }}
            className="bg-white/20 rounded flex items-center justify-center"
          >
            <span className="text-xs opacity-50">{cell.label}</span>
          </div>
        ))}
      </div>
      <span className="text-xs mt-2 block truncate">{layout.name}</span>
    </button>
  )
}
```

### `getResponsiveGrid(layout, screenWidth)`

Returns appropriate grid template based on screen size.

```javascript
import { getResponsiveGrid } from './layouts_v3'

// In CollagePreview component
const gridTemplate = getResponsiveGrid(selectedLayout, window.innerWidth)
// On desktop (1024px): '1fr 1fr'
// On mobile (375px): '1fr' (stacks vertically)
```

### `validateTransforms(transforms, layout)`

Ensures transform data has valid defaults.

```javascript
const transforms = validateTransforms(userTransforms, selectedLayout)
// Returns:
// {
//   'photo-0': { scale: 1.2, translateX: 10, translateY: -5 },
//   'photo-1': { scale: 1.0, translateX: 0, translateY: 0 } // defaults
// }
```

---

## Canvas Drawing Coordinates

Each layout slot includes canvas drawing coordinates for `useCollageCanvas` hook:

```javascript
{
  canvas: {
    x: 0,      // X position on canvas
    y: 0,      // Y position on canvas
    w: 1200,   // Width in pixels
    h: 1200    // Height in pixels
  }
}
```

**Example usage in canvas hook:**

```javascript
layout.slots.forEach((slot, index) => {
  const photo = photos[index]
  const transform = transforms[photo.id] || { scale: 1, translateX: 0, translateY: 0 }

  ctx.save()
  ctx.translate(slot.canvas.x, slot.canvas.y)
  ctx.scale(transform.scale, transform.scale)
  ctx.translate(transform.translateX, transform.translateY)

  ctx.drawImage(
    photo.image,
    0, 0,
    slot.canvas.w, slot.canvas.h
  )

  ctx.restore()
})
```

---

## Layout Categories

For filtering/grouping in UI:

```javascript
import { getLayoutCategories } from './layouts_v3'

const categories = getLayoutCategories()
// Returns:
// [
//   { id: '1-photo', name: '1 Photo', layouts: ['hero_single', ...] },
//   { id: '2-photos', name: '2 Photos', layouts: ['side_by_side', ...] },
//   ...
// ]
```

**Usage in LayoutSelector:**

```javascript
{categories.map(category => (
  <div key={category.id}>
    <h3>{t(category.nameKey)}</h3>
    <div className="grid grid-cols-3 gap-2">
      {category.layouts.map(layoutId => (
        <LayoutIcon layout={LAYOUTS_V3[layoutId]} />
      ))}
    </div>
  </div>
))}
```

---

## Responsive Behavior Summary

| Layout | Desktop | Mobile (<768px) |
|--------|---------|-----------------|
| hero_single | 1fr | 1fr (same) |
| hero_wide | 1fr | 1fr (same) |
| hero_portrait | 1fr | 1fr (same) |
| side_by_side | 1fr 1fr | 1fr (stack) |
| stacked | 1fr / 1fr | 1fr / 1fr (same) |
| dominant_left | 3fr 1fr | 1fr (stack) |
| triple_row | 1fr 1fr 1fr | 1fr (stack) |
| l_shape | 1fr 1fr / 2fr 1fr | 1fr / 1fr (stack) |
| reverse_l | 1fr 1fr / 1fr 2fr | 1fr / 1fr (stack) |
| classic_grid | 1fr 1fr / 1fr 1fr | Same (2×2) |
| timeline | 1fr 1fr 1fr 1fr | 1fr 1fr / 1fr 1fr (2×2) |
| magazine | 1fr 1fr 1fr / 1fr 1fr 1fr | 1fr 1fr / 1fr 1fr (2 cols) |
| polaroid | 1fr 1fr / 1fr 1fr 1fr | 1fr 1fr 1fr / 1fr 1fr (2×3) |

---

## Integration Checklist

Before using layouts_v3.js:

- [ ] Import layouts in CollageBuilder
- [ ] Use getCompatibleLayouts() to filter by photo count
- [ ] Render LayoutIcon components with generateLayoutPreview()
- [ ] Store selectedLayout in Zustand collageStore
- [ ] Pass layout.slots to CollagePreview component
- [ ] Use layout.canvas coordinates in useCollageCanvas hook
- [ ] Implement responsive grid switching with getResponsiveGrid()
- [ ] Add all layout nameKeys to i18n translation files
- [ ] Test all 12 layouts with real photos
- [ ] Verify mobile responsive behavior

---

**Next Phase:** Use these layouts in Phase C (CollagePreview) and Phase F (LayoutSelector).
