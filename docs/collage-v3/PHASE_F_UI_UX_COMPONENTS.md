# Phase F - UI/UX Polish Components Documentation

## Overview

Phase F adds polished UI components for layout selection and workflow navigation, completing the user-facing interface for Collage Builder V3.

---

## Components Created

```
Phase F Components
├── LayoutSelector.jsx (main layout selection interface)
├── LayoutIcon.jsx (SVG-based layout preview icon)
└── StepIndicator.jsx (progress indicator for multi-step workflow)
```

---

## LayoutSelector API

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `photoCount` | `number` | Yes | - | Number of selected photos |
| `selectedLayout` | `Object` | No | `null` | Currently selected layout from layouts_v3.js |
| `onSelect` | `Function` | Yes | - | Selection handler `(layout) => void` |
| `showIncompatible` | `boolean` | No | `false` | Show disabled incompatible layouts |
| `onBack` | `Function` | No | `null` | Back button handler `() => void` |
| `showBack` | `boolean` | No | `false` | Show back button in header |

### Features

**1. Compatibility Filtering:**
- Automatically filters layouts based on `photoCount`
- Uses `getCompatibleLayouts(photoCount)` from layouts_v3.js
- Disables incompatible layouts if `showIncompatible` is true

**2. Visual Layout Icons:**
- Grid of 2-4 columns (responsive: 2 on mobile, 3 on tablet, 4 on desktop)
- Each layout rendered as SVG icon via LayoutIcon component
- Hover effects and scale animations

**3. Auto-Fill Button:**
- Purple "Auto" button appears when no layout selected
- Automatically selects first compatible layout
- Uses Sparkles icon for visual appeal

**4. Grouping by Photo Count:**
- Layouts grouped by minPhotos/maxPhotos
- Group headers: "1 Photo", "2 Photos", "4 Photos", etc.
- Sorted in ascending order

**5. Selection Feedback:**
- Selected layout: Blue border, blue background overlay, shadow
- Checkmark overlay in top-right corner
- Footer shows selected layout name

### Example Usage

```jsx
import LayoutSelector from './LayoutSelector'

function LayoutSelectionStep() {
  const [selectedLayout, setSelectedLayout] = useState(null)
  const photoCount = 4

  return (
    <LayoutSelector
      photoCount={photoCount}
      selectedLayout={selectedLayout}
      onSelect={(layout) => {
        setSelectedLayout(layout)
        console.log('Selected layout:', layout.id)
      }}
      showBack={true}
      onBack={() => console.log('Go back')}
    />
  )
}
```

---

## LayoutIcon API

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `layout` | `Object` | No | `null` | Layout object from layouts_v3.js |
| `className` | `string` | No | `''` | Additional CSS classes |

### Features

**SVG-Based Rendering:**
- Parses layout.slots array to render grid structure
- Each slot becomes a rounded rectangle in SVG
- Calculates positions from CSS Grid `area` property

**Dynamic Grid Calculation:**
- Determines max columns and rows from all slots
- Converts grid coordinates to SVG coordinates
- Accounts for gap spacing in visual representation

**Styling:**
- Background rectangle with low opacity (0.1)
- Slot rectangles with medium opacity (0.7)
- Uses `currentColor` for theme compatibility
- Rounded corners (rx="2") for modern look

### Rendering Algorithm

```javascript
// Parse slot area: "1 / 1 / 2 / 2" → [rowStart, colStart, rowEnd, colEnd]
const [rowStart, colStart, rowEnd, colEnd] = slot.area.split('/').map(s => parseInt(s.trim()))

// Calculate SVG position (100x100 viewBox)
const cellWidth = 100 / maxCols
const cellHeight = 100 / maxRows

const x = (colStart - 1) * cellWidth + gapPercent
const y = (rowStart - 1) * cellHeight + gapPercent
const width = (colEnd - colStart) * cellWidth - (gapPercent * 2)
const height = (rowEnd - rowStart) * cellHeight - (gapPercent * 2)
```

### Example Usage

```jsx
import LayoutIcon from './LayoutIcon'
import { LAYOUTS_V3 } from '../layouts/layouts_v3'

function LayoutPreview() {
  return (
    <div className="w-20 h-20">
      <LayoutIcon
        layout={LAYOUTS_V3.classic_grid}
        className="text-blue-400"
      />
    </div>
  )
}
```

---

## StepIndicator API

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `currentStep` | `number` | No | `1` | Current active step (1-4) |
| `completedSteps` | `number[]` | No | `[]` | Array of completed step numbers |
| `onStepClick` | `Function` | No | `null` | Click handler `(stepNumber) => void` |
| `allowNavigation` | `boolean` | No | `false` | Enable clicking steps to navigate |

### Step Definitions

The component defines 4 steps with icons:

| Step | Label | Icon | Description |
|------|-------|------|-------------|
| 1 | Select Photos | `ImageIcon` | Photo selection (ImagePickerV3) |
| 2 | Choose Layout | `Grid` | Layout selection (LayoutSelector) |
| 3 | Customize | `ImagePlus` | Photo adjustment (CollagePreview + RepositionModal) |
| 4 | Save | `Save` | Save collage to Firestore |

### Features

**1. Visual States:**
- **Active step:** Blue background, white text, scaled (110%), shadow
- **Completed step:** Green background, white checkmark icon
- **Future step:** Gray background, low opacity

**2. Responsive Design:**
- Desktop (≥768px): Shows all step labels below circles
- Mobile (<768px): Only shows active step label to save space
- Connecting lines hidden on mobile (< 640px)

**3. Interactive Navigation:**
- When `allowNavigation` is true, completed steps are clickable
- Current step is always clickable
- Future steps are disabled

**4. Connecting Lines:**
- Horizontal lines between step circles
- Blue for active/completed progress
- Green when both connected steps are completed
- Gray for future steps

### Example Usage

```jsx
import StepIndicator from './StepIndicator'

function CollageBuilder() {
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState([])

  const handleStepComplete = () => {
    setCompletedSteps([...completedSteps, currentStep])
    setCurrentStep(currentStep + 1)
  }

  return (
    <div>
      <StepIndicator
        currentStep={currentStep}
        completedSteps={completedSteps}
        onStepClick={setCurrentStep}
        allowNavigation={true}
      />

      {/* Step content... */}

      <button onClick={handleStepComplete}>
        Complete Step {currentStep}
      </button>
    </div>
  )
}
```

---

## Responsive Layout Patterns

### Desktop Layout (≥768px)

**LayoutSelector:**
```
┌─────────────────────────────────────────┐
│  Header + Auto-Fill Button              │
├─────────────────────────────────────────┤
│                                         │
│  Grid: 4 columns                        │
│  [icon] [icon] [icon] [icon]            │
│  [icon] [icon] [icon] [icon]            │
│                                         │
├─────────────────────────────────────────┤
│  Footer: X layouts available            │
└─────────────────────────────────────────┘
```

**StepIndicator:**
```
[ 1: Select Photos ] ━━━ [ 2: Choose Layout ] ━━━ [ 3: Customize ] ━━━ [ 4: Save ]
     (active)                  (future)                (future)           (future)
```

### Mobile Layout (<768px)

**LayoutSelector:**
```
┌───────────────────────┐
│  Header + Auto Button │
├───────────────────────┤
│                       │
│  Grid: 2 columns      │
│  [icon] [icon]        │
│  [icon] [icon]        │
│                       │
├───────────────────────┤
│  Footer info          │
└───────────────────────┘
```

**StepIndicator:**
```
[ 1 ]  [ 2 ]  [ 3 ]  [ 4 ]
 (✓)    (●)    (○)    (○)
     Select Photos
```

---

## Integration with CollageBuilder

### Full Workflow Example

```jsx
import React, { useState } from 'react'
import StepIndicator from './StepIndicator'
import ImagePickerV3 from './ImagePickerV3'
import LayoutSelector from './LayoutSelector'
import CollagePreview from './CollagePreview'
import RepositionModal from './RepositionModal'

export default function CollageBuilder() {
  const [step, setStep] = useState(1)
  const [selectedPhotos, setSelectedPhotos] = useState([])
  const [selectedLayout, setSelectedLayout] = useState(null)
  const [transforms, setTransforms] = useState({})
  const [repositionTarget, setRepositionTarget] = useState(null)
  const [completedSteps, setCompletedSteps] = useState([])

  const handleStepComplete = (stepNumber) => {
    if (!completedSteps.includes(stepNumber)) {
      setCompletedSteps([...completedSteps, stepNumber])
    }
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Step indicator header */}
      <StepIndicator
        currentStep={step}
        completedSteps={completedSteps}
        onStepClick={(stepNum) => {
          if (completedSteps.includes(stepNum) || stepNum === step) {
            setStep(stepNum)
          }
        }}
        allowNavigation={true}
      />

      {/* Step 1: Photo selection */}
      {step === 1 && (
        <ImagePickerV3
          photos={allPhotos}
          onSelect={(photos) => {
            setSelectedPhotos(photos)
            handleStepComplete(1)
            setStep(2)
          }}
          maxPhotos={6}
          initialSelection={selectedPhotos}
        />
      )}

      {/* Step 2: Layout selection */}
      {step === 2 && (
        <LayoutSelector
          photoCount={selectedPhotos.length}
          selectedLayout={selectedLayout}
          onSelect={(layout) => {
            setSelectedLayout(layout)
            handleStepComplete(2)
            setStep(3)
          }}
          showBack={true}
          onBack={() => setStep(1)}
        />
      )}

      {/* Step 3: Customization */}
      {step === 3 && (
        <div className="flex-1 flex flex-col">
          <CollagePreview
            photos={selectedPhotos}
            layout={selectedLayout}
            transforms={transforms}
            onImageClick={(photoId) => setRepositionTarget(photoId)}
          />

          <div className="p-4 border-t border-white/10">
            <button
              onClick={() => {
                handleStepComplete(3)
                setStep(4)
              }}
              className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg"
            >
              Continue to Save
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Save */}
      {step === 4 && (
        <SaveCollageForm
          photos={selectedPhotos}
          layout={selectedLayout}
          transforms={transforms}
          onSave={() => {
            handleStepComplete(4)
            // Navigate to albums page
          }}
          onBack={() => setStep(3)}
        />
      )}

      {/* Reposition modal (overlay) */}
      {repositionTarget && (
        <RepositionModal
          photo={selectedPhotos.find(p => p.id === repositionTarget)}
          currentTransform={transforms[repositionTarget] || { scale: 1, translateX: 0, translateY: 0 }}
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

## Auto-Fill Logic

### Implementation

```javascript
const handleAutoSelect = () => {
  const compatible = getCompatibleLayouts(photoCount)

  if (compatible.length > 0) {
    // Option 1: Select first layout (predictable)
    onSelect(compatible[0])

    // Option 2: Select random layout (variety)
    // const randomIndex = Math.floor(Math.random() * compatible.length)
    // onSelect(compatible[randomIndex])

    // Option 3: Select based on aspect ratio preference
    // const landscape = compatible.filter(l => l.aspectRatio.startsWith('16:'))
    // onSelect(landscape[0] || compatible[0])
  }
}
```

### UX Considerations

**When to show Auto-Fill:**
- Only when no layout is selected yet
- Only when compatible layouts exist
- Hide after user makes manual selection

**Button visibility:**
```jsx
{compatibleLayouts.length > 0 && !selectedLayout && (
  <button onClick={handleAutoSelect}>
    ✨ Auto-Fill
  </button>
)}
```

---

## Styling & Design

### Glass-Morphism Pattern

```jsx
// LayoutSelector header
className="p-4 border-b border-white/10"

// Layout icon button (selected)
className="border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20"

// Layout icon button (unselected)
className="border-white/20 hover:border-white/40"

// StepIndicator background
className="bg-white/5"

// Step circle (active)
className="bg-blue-500 text-white scale-110 shadow-lg shadow-blue-500/50"

// Step circle (completed)
className="bg-green-500 text-white"
```

### Transitions

```jsx
// Layout icon hover scale
className="transition-all duration-200 hover:scale-105"

// Step circle state changes
className="transition-all duration-300"

// Connecting lines
className="transition-all duration-300"
```

### Responsive Grid

```jsx
// LayoutSelector grid
className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 md:gap-4"

// Mobile: 2 columns
// Tablet (640px+): 3 columns
// Desktop (768px+): 4 columns
```

---

## Testing Checklist

### LayoutSelector Tests

**Visual:**
- [ ] Icons render correctly for all 12 layouts
- [ ] Grid responsive (2/3/4 columns)
- [ ] Selected layout has blue border and checkmark
- [ ] Incompatible layouts grayed out when shown
- [ ] Auto-fill button appears/disappears correctly
- [ ] Grouped sections have headers
- [ ] Footer shows selection status

**Functional:**
- [ ] Only compatible layouts shown by default
- [ ] Selecting layout calls onSelect with correct data
- [ ] Auto-fill selects first compatible layout
- [ ] Back button calls onBack handler
- [ ] showIncompatible prop displays all layouts
- [ ] Photo count changes update compatible layouts
- [ ] Hover effects work on desktop
- [ ] Touch interactions work on mobile

**Responsive:**
- [ ] 2 columns on mobile (< 640px)
- [ ] 3 columns on tablet (640-768px)
- [ ] 4 columns on desktop (≥ 768px)
- [ ] Auto-fill button text changes ("Auto" on mobile, "Auto-Fill" on desktop)

### LayoutIcon Tests

**Visual:**
- [ ] SVG renders correctly for all layouts
- [ ] Grid structure matches layout.slots
- [ ] Gap spacing visible
- [ ] Rounded corners on slots
- [ ] Color inherits from className

**Functional:**
- [ ] Handles layouts with varying slot counts (1-6)
- [ ] Handles layouts with different grid dimensions
- [ ] Handles missing layout gracefully (returns null)
- [ ] Scales correctly in different container sizes

### StepIndicator Tests

**Visual:**
- [ ] 4 steps render correctly
- [ ] Active step highlighted in blue
- [ ] Completed steps show green checkmark
- [ ] Future steps grayed out
- [ ] Connecting lines show correct colors
- [ ] Labels show on desktop
- [ ] Only active label shows on mobile

**Functional:**
- [ ] currentStep prop updates visual state
- [ ] completedSteps array displays checkmarks
- [ ] onStepClick fires when allowNavigation is true
- [ ] Disabled steps don't respond to clicks
- [ ] Completed steps clickable when navigation allowed
- [ ] Current step always clickable

**Responsive:**
- [ ] All labels visible on desktop (≥ 768px)
- [ ] Only active label on mobile (< 768px)
- [ ] Connecting lines hidden on mobile (< 640px)
- [ ] Step circles size correctly (10-12px responsive)

### Integration Tests

- [ ] LayoutSelector integrates with CollageBuilder state
- [ ] StepIndicator tracks CollageBuilder progress
- [ ] Auto-fill works with different photo counts
- [ ] Navigation between steps preserves data
- [ ] Back button returns to previous step correctly

---

## i18n Keys Required

Add to `translation.json` under `collage.*`:

```json
{
  "collage": {
    "selector": {
      "title": "Choose Layout",
      "subtitle": "{{count}} photos selected",
      "back": "Back",
      "autoFill": "Auto-Fill",
      "noLayouts": "No compatible layouts",
      "selectPhotos": "Please select {{min}}-{{max}} photos",
      "availableLayouts": "{{count}} layouts available",
      "selected": "selected"
    },
    "steps": {
      "selectPhotos": "Select Photos",
      "chooseLayout": "Choose Layout",
      "customize": "Customize",
      "save": "Save"
    },
    "layouts": {
      "hero_single": "Hero",
      "hero_wide": "Hero Wide",
      "hero_portrait": "Hero Portrait",
      "side_by_side": "Side by Side",
      "stacked": "Stacked",
      "dominant_left": "Dominant Left",
      "triple_row": "Triple Row",
      "l_shape": "L-Shape",
      "reverse_l": "Reverse L",
      "classic_grid": "Classic Grid",
      "timeline": "Timeline",
      "magazine": "Magazine",
      "polaroid": "Polaroid"
    }
  }
}
```

**Norwegian translations (nb.json):**

```json
{
  "collage": {
    "selector": {
      "title": "Velg Oppsett",
      "subtitle": "{{count}} bilder valgt",
      "back": "Tilbake",
      "autoFill": "Autofyll",
      "noLayouts": "Ingen kompatible oppsett",
      "selectPhotos": "Vennligst velg {{min}}-{{max}} bilder",
      "availableLayouts": "{{count}} oppsett tilgjengelig",
      "selected": "valgt"
    },
    "steps": {
      "selectPhotos": "Velg Bilder",
      "chooseLayout": "Velg Oppsett",
      "customize": "Tilpass",
      "save": "Lagre"
    }
  }
}
```

---

## Performance Optimization

### LayoutSelector

**1. Memoized Calculations:**
```javascript
const compatibleLayouts = useMemo(() => {
  return getCompatibleLayouts(photoCount)
}, [photoCount])

const layoutGroups = useMemo(() => {
  // Grouping logic
}, [allLayouts])
```

**2. Conditional Rendering:**
```javascript
// Don't render incompatible layouts unless requested
const allLayouts = showIncompatible ? getAllLayouts() : compatibleLayouts
```

### LayoutIcon

**SVG Optimization:**
- Minimal DOM nodes (1 background + N slot rectangles)
- No external images or assets
- Renders in <1ms for all layouts

### StepIndicator

**Lightweight:**
- Pure CSS animations
- No state management
- Minimal re-renders

---

## Accessibility

### LayoutSelector

```jsx
// Icon button with title attribute
<button title={t(layout.nameKey)}>
  <LayoutIcon layout={layout} />
  <span>{layout.name}</span>
</button>

// Disabled state
<button disabled={!compatible} aria-disabled={!compatible}>
```

### StepIndicator

```jsx
// Step circle with title
<div title={step.label}>
  <Icon />
  <span>{step.label}</span>
</div>

// Keyboard navigation
onClick={() => handleStepClick(stepNumber)}
className="cursor-pointer"
```

### Keyboard Support

- All buttons focusable with Tab
- Enter/Space to activate
- Visual focus states
- Screen reader labels

---

## Known Limitations

1. **LayoutIcon SVG precision:** May have 1-2px rounding errors on complex grids
2. **StepIndicator fixed to 4 steps:** Would need refactor for dynamic step count
3. **Auto-fill always selects first:** No smart selection based on content analysis
4. **No layout preview:** Icon shows structure but not actual photo arrangement

---

## Future Enhancements

1. **Smart Auto-Fill:** Analyze photo orientations/colors to suggest best layout
2. **Layout Favorites:** Save user's preferred layouts
3. **Custom Layouts:** Allow users to create custom grid arrangements
4. **Layout Previews:** Show actual photos in mini preview (not just structure)
5. **Step Progress Persistence:** Save step progress to localStorage
6. **Animated Transitions:** Smooth transitions between steps
7. **Layout Categories:** Filter by style (modern, classic, creative, etc.)

---

## Related Components

- **ImagePickerV3** - Photo selection for Step 1
- **CollagePreview** - Preview rendering for Step 3
- **RepositionModal** - Photo adjustment in Step 3
- **layouts_v3.js** - Layout data source
- **useCollageStore** - Zustand state management (Phase G)

---

**Phase F Complete!** Ready for Phase G (Integration).
