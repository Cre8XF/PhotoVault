# COLLAGE BUILDER V3 — COMPLETE UPGRADE

## CRITICAL: READ BEFORE STARTING

You are working on **Pixtr** (formerly PhotoVault). Before ANY work:

1. **Read these reference files completely:**

   - `COLLAGE_V3_ARCHITECTURE.md` - Pixtr technical architecture
   - `COLLAGE_V3_DESIGN_REFERENCE.md` - Visual design targets

2. **Read these source files:**

   - `/src/components/CollageBuilder.jsx`
   - `/src/utils/gridLayouts.js`
   - `/src/components/UploadModal.jsx`
   - `/src/pages/SearchPage.jsx`
   - `/src/hooks/usePhotoData.js`
   - `/src/App.jsx`
   - `/src/i18n/locales/en.json`

3. **DO NOT START CODING** until you confirm file reading is complete.

---

## PROJECT CONTEXT

**Tech Stack:**

- React 18 + Vite
- Tailwind CSS
- Zustand (state management)
- Firebase (Firestore + Storage + Auth)
- i18next (internationalization, COMPLETE and working)

**Critical Patterns:**

- Use `usePhotoData` hook for ALL Firestore operations
- Never use direct Firebase calls
- Use glass-morphism design system (see DESIGN_REFERENCE)
- All text must use i18next translations
- Support dark/light mode
- Mobile-first responsive

---

## GOAL

Transform Collage Builder from basic grid layout to Google Photos-quality collage maker:

**Core Features:**

1. Modern layout engine (12 layouts, 1-6 photos)
2. Live preview (instant updates)
3. Per-image reposition/zoom
4. Enhanced image picker (filters, AI tags, grouping)
5. Polished UI (visual icons, smooth interactions)

**Success Criteria:**

- User can create professional collages in under 2 minutes
- Works flawlessly on mobile and desktop
- Matches Pixtr's premium design language
- Zero crashes, comprehensive error handling

---

## PHASE 0 — FILE READING & ANALYSIS SETUP

**Action:** Read all files listed above, then create analysis table.

**Output format:**

```markdown
### File Reading Confirmation

✅ Read COLLAGE_V3_ARCHITECTURE.md
✅ Read COLLAGE_V3_DESIGN_REFERENCE.md
✅ Read /src/components/CollageBuilder.jsx
✅ Read /src/utils/gridLayouts.js
✅ Read /src/components/UploadModal.jsx
✅ Read /src/pages/SearchPage.jsx
✅ Read /src/hooks/usePhotoData.js
✅ Read /src/App.jsx
✅ Read /src/i18n/locales/en.json

### Quick Findings

| Component          | Current State | Key Issues | Reusable Parts |
| ------------------ | ------------- | ---------- | -------------- |
| CollageBuilder.jsx | [summary]     | [issues]   | [what to keep] |
| gridLayouts.js     | [summary]     | [issues]   | [what to keep] |
| ...                | ...           | ...        | ...            |

**Ready to proceed to Phase A.**
```

**STOP HERE.** Wait for user approval before Phase A.

---

## PHASE A — DEEP ANALYSIS

Analyze current Collage Builder implementation:

### A1: Current Architecture

- How is state managed? (local state, Zustand, props?)
- How are photos selected? (modal, inline, from search?)
- How are layouts applied? (gridLayouts.js structure?)
- How is preview rendered? (CSS Grid, flex, absolute positioning?)
- How is saving handled? (Firestore structure?)

### A2: Identified Problems

Categorize issues:

**Critical (must fix):**

- [Issue] - Impact on functionality

**UX Problems:**

- [Issue] - Impact on user experience

**Technical Debt:**

- [Issue] - Impact on maintainability

**Missing Features:**

- [Feature] - User value

### A3: Integration Points

- **usePhotoData hook:** What methods are available?
- **SearchPage:** Can we reuse photo filtering logic?
- **UploadModal:** Can we reuse modal pattern?
- **i18n:** What translation keys exist? What new ones needed?

### A4: Proposed Architecture

```
CollageBuilder.jsx (orchestrator)
├── Step 1: ImagePickerV3.jsx
│   ├── FilterTabs.jsx (All/Favorites/Screenshots/AI)
│   ├── SearchBar.jsx
│   ├── PhotoGrid.jsx (reuse from SearchPage?)
│   └── GroupedView.jsx (day/month headers)
├── Step 2: LayoutSelector.jsx
│   └── LayoutIcon.jsx (12 visual buttons)
├── Step 3: CollagePreview.jsx
│   ├── PhotoCell.jsx (with click to reposition)
│   └── RepositionModal.jsx (drag/zoom interface)
└── Step 4: SaveCollage.jsx
    └── usePhotoData.saveCollage()
```

**State Structure:**

```javascript
{
  step: 1-4,
  selectedPhotos: Photo[], // max 6
  selectedLayout: LayoutV3,
  transforms: {
    [photoId]: { scale, translateX, translateY }
  },
  collageMetadata: {
    title: string,
    createdAt: timestamp
  }
}
```

**Output:** Complete architecture proposal with component tree and state design.

**STOP HERE.** Wait for user approval before Phase B.

---

## PHASE B — LAYOUT ENGINE V3

Create `/src/utils/layouts_v3.js`

### Requirements:

- 12 layouts covering 1-6 photos
- Each layout defines: grid template, photo slots, crop policy, spacing
- Responsive rules (mobile vs desktop)
- Support for transform data storage

### Structure:

```javascript
export const LAYOUTS_V3 = {
  // 1 photo layouts
  hero_single: {
    id: 'hero_single',
    name: 'Hero',
    minPhotos: 1,
    maxPhotos: 1,
    aspectRatio: '4:3',
    grid: {
      desktop: '1fr',
      mobile: '1fr',
    },
    slots: [
      {
        area: '1 / 1 / 2 / 2',
        crop: 'center',
        objectFit: 'cover',
      },
    ],
    gap: 0,
    padding: 0,
  },

  // 2 photo layouts
  side_by_side: {
    id: 'side_by_side',
    name: 'Side by Side',
    minPhotos: 2,
    maxPhotos: 2,
    aspectRatio: '2:1',
    grid: {
      desktop: '1fr 1fr',
      mobile: '1fr',
    },
    slots: [
      { area: '1 / 1 / 2 / 2', crop: 'center' },
      { area: '1 / 2 / 2 / 3', crop: 'center' },
    ],
    gap: 8,
    padding: 0,
  },

  // ... 10 more layouts
  // Include creative options like:
  // - Polaroid style (1 large + 2 small)
  // - Magazine (asymmetric grid)
  // - Collage (3-6 mixed sizes)
  // - Timeline (horizontal strip)
}

// Helper function
export function getCompatibleLayouts(photoCount) {
  return Object.values(LAYOUTS_V3)
    .filter((l) => photoCount >= l.minPhotos && photoCount <= l.maxPhotos)
    .sort((a, b) => a.minPhotos - b.minPhotos)
}

// Preview generator
export function generateLayoutPreview(layout) {
  // Returns ASCII or data structure for icon rendering
}
```

### Deliverables:

1. Complete `layouts_v3.js` file
2. Visual representation of each layout (ASCII art or data for rendering)
3. Unit tests for `getCompatibleLayouts()`

**Example Layout Visualization:**

```
hero_single:        side_by_side:       triple_row:
┌──────────┐        ┌─────┬─────┐       ┌───┬───┬───┐
│          │        │  1  │  2  │       │ 1 │ 2 │ 3 │
│    1     │        │     │     │       └───┴───┴───┘
│          │        └─────┴─────┘
└──────────┘
```

**STOP HERE.** User tests layouts visually before Phase C.

---

## PHASE C — COLLAGE PREVIEW COMPONENT

Create `/src/components/CollagePreview.jsx`

### Component Signature:

```javascript
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'

export default function CollagePreview({
  photos, // Photo[] from Firestore
  layout, // LayoutV3 object
  transforms, // { [photoId]: { scale, translateX, translateY } }
  onImageClick, // (photoId) => void - open reposition modal
  isLoading, // boolean
}) {
  const { t } = useTranslation()

  // Implementation
}

CollagePreview.propTypes = {
  photos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      downloadURL: PropTypes.string.isRequired,
      thumbnail: PropTypes.string,
    })
  ).isRequired,
  layout: PropTypes.object.isRequired,
  transforms: PropTypes.object,
  onImageClick: PropTypes.func,
  isLoading: PropTypes.bool,
}
```

### Implementation Requirements:

**1. Layout Rendering:**

- Use CSS Grid with dynamic template from `layout.grid`
- Apply gap and padding from layout
- Render skeleton loaders while images load

**2. Image Handling:**

- Use `thumbnail` URL if available, fallback to `downloadURL`
- Apply transforms (scale, translate) via CSS transform
- Use `object-fit: cover` with crop position from layout
- Show click cursor when `onImageClick` provided

**3. Styling:**

- Match Pixtr design system (see DESIGN_REFERENCE.md)
- Glass-morphism border: `border border-white/20`
- Rounded corners: `rounded-xl`
- Smooth transitions: `transition-all duration-300`

**4. Responsive:**

- Use `layout.grid.mobile` on screens < 768px
- Stack layouts vertically on mobile if needed
- Maintain aspect ratio on all screen sizes

**5. Error Handling:**

- Handle missing images gracefully
- Show placeholder for broken image URLs
- Validate photo count matches layout requirements

### Example Structure:

```jsx
<div
  className="relative w-full overflow-hidden rounded-xl border border-white/20"
  style={{ aspectRatio: layout.aspectRatio }}
>
  <div
    className="grid w-full h-full"
    style={{
      gridTemplateColumns: layout.grid.desktop,
      gap: `${layout.gap}px`,
    }}
  >
    {layout.slots.map((slot, index) => (
      <PhotoCell
        key={photos[index]?.id || index}
        photo={photos[index]}
        slot={slot}
        transform={transforms?.[photos[index]?.id]}
        onClick={() => onImageClick?.(photos[index]?.id)}
      />
    ))}
  </div>
</div>
```

**Deliverables:**

1. Complete `CollagePreview.jsx`
2. Separate `PhotoCell.jsx` sub-component
3. Loading skeleton variant
4. Error state variant

**STOP HERE.** User tests with real photos before Phase D.

---

## PHASE D — REPOSITION/ZOOM MODAL

Create `/src/components/RepositionModal.jsx`

### Component Signature:

```javascript
export default function RepositionModal({
  photo, // Photo object
  currentTransform, // { scale, translateX, translateY }
  onSave, // (transform) => void
  onClose, // () => void
}) {
  const { t } = useTranslation()
  const [transform, setTransform] = useState(
    currentTransform || {
      scale: 1,
      translateX: 0,
      translateY: 0,
    }
  )

  // Implementation
}
```

### Features:

**1. Drag to Reposition:**

- Click and drag image to move within frame
- Constrain to reasonable bounds
- Show visual feedback during drag
- Touch support for mobile

**2. Zoom Control:**

- Slider: 100% - 300%
- Pinch gesture on mobile
- Mouse wheel on desktop
- Show current zoom percentage

**3. Reset Button:**

- Return to scale: 1, translate: 0, 0
- Confirm before reset if changes exist

**4. UI Layout:**

```
┌─────────────────────────────────────────┐
│  ← Back          Reset      Save ✓      │  <- Header
├─────────────────────────────────────────┤
│                                         │
│                                         │
│        [Image container with            │  <- Main area
│         draggable/zoomable photo]       │     (centered)
│                                         │
│                                         │
├─────────────────────────────────────────┤
│  🔍 Zoom: [────●────────] 150%         │  <- Footer
└─────────────────────────────────────────┘
```

**5. Styling:**

- Glass-morphism overlay: `bg-black/80 backdrop-blur-xl`
- Smooth animations: `transition-transform duration-200`
- Touch-friendly controls (min 44px tap targets)

### Implementation Pattern:

```jsx
const handleDrag = (e) => {
  const deltaX = e.movementX
  const deltaY = e.movementY
  setTransform((prev) => ({
    ...prev,
    translateX: prev.translateX + deltaX,
    translateY: prev.translateY + deltaY,
  }))
}

const handleZoom = (newScale) => {
  setTransform((prev) => ({
    ...prev,
    scale: Math.max(1, Math.min(3, newScale)),
  }))
}
```

**Deliverables:**

1. Complete `RepositionModal.jsx`
2. Touch gesture support
3. Keyboard shortcuts (ESC to close, Enter to save)
4. Mobile-optimized layout

**STOP HERE.** User tests drag/zoom before Phase E.

---

## PHASE E — IMAGE PICKER V3

Create `/src/components/ImagePickerV3.jsx`

### Component Signature:

```javascript
export default function ImagePickerV3({
  onSelect, // (photos: Photo[]) => void
  maxPhotos, // number (default 6)
  initialSelection, // Photo[] (for editing existing collage)
}) {
  const { t } = useTranslation()
  const { photos, loading } = usePhotoData()
  const [selectedPhotos, setSelectedPhotos] = useState(initialSelection || [])
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Implementation
}
```

### Features:

**1. Filter Tabs:**

```javascript
const FILTERS = [
  { id: 'all', label: 'picker.filters.all', icon: '📷' },
  { id: 'favorites', label: 'picker.filters.favorites', icon: '⭐' },
  { id: 'screenshots', label: 'picker.filters.screenshots', icon: '📱' },
  { id: 'recent', label: 'picker.filters.recent', icon: '🕐' },
  { id: 'ai', label: 'picker.filters.ai', icon: '🤖' },
]
```

Filter logic:

- **All:** All photos from usePhotoData
- **Favorites:** `photo.isFavorite === true`
- **Screenshots:** `photo.isScreenshot === true`
- **Recent:** Sort by `uploadedAt` desc, show last 30 days
- **AI:** Group by `photo.aiTags` (reuse SearchPage logic)

**2. Search Bar:**

- Real-time filter by: filename, tags, AI tags
- Debounced input (300ms)
- Clear button
- Search icon

**3. Photo Grid:**

- Responsive grid: 4 cols desktop, 3 cols tablet, 2 cols mobile
- Lazy load images (use Intersection Observer)
- Show checkmark overlay when selected
- Disable selection when max reached

**4. Grouping (for All/Recent):**

```
Today
[photo] [photo] [photo]

Yesterday
[photo] [photo]

Last Week
[photo] [photo] [photo] [photo]
```

Group by:

- Today
- Yesterday
- Last 7 days
- Last 30 days
- Older (by month)

**5. Selection Counter:**

```jsx
<div className="sticky top-0 bg-white/10 backdrop-blur-xl p-4">
  <div className="flex justify-between items-center">
    <span>
      {selectedPhotos.length} / {maxPhotos} {t('picker.selected')}
    </span>
    <button onClick={() => onSelect(selectedPhotos)}>
      {t('picker.continue')}
    </button>
  </div>
</div>
```

### Layout Structure:

```jsx
<div className="h-full flex flex-col">
  {/* Tabs */}
  <FilterTabs active={activeFilter} onChange={setActiveFilter} />

  {/* Search */}
  <SearchBar query={searchQuery} onChange={setSearchQuery} />

  {/* Counter */}
  <SelectionCounter count={selectedPhotos.length} max={maxPhotos} />

  {/* Grid with grouping */}
  <PhotoGridGrouped
    photos={filteredPhotos}
    selectedPhotos={selectedPhotos}
    onToggle={handleToggle}
    maxReached={selectedPhotos.length >= maxPhotos}
  />
</div>
```

**Deliverables:**

1. Complete `ImagePickerV3.jsx`
2. Sub-components: `FilterTabs.jsx`, `SearchBar.jsx`, `PhotoGridGrouped.jsx`
3. Integration with usePhotoData hook
4. i18n keys for all labels

**STOP HERE.** User tests filtering/selection before Phase F.

---

## PHASE F — UI/UX POLISH

### F1: Layout Selector Component

Create `/src/components/LayoutSelector.jsx`

**Requirements:**

- Visual icon buttons (not dropdown)
- 3-4 icons per row
- Show layout name on hover
- Highlight selected layout
- Disable incompatible layouts (wrong photo count)

**Icon Rendering:**

```jsx
<div className="grid grid-cols-3 md:grid-cols-4 gap-4">
  {compatibleLayouts.map((layout) => (
    <button
      key={layout.id}
      onClick={() => onSelect(layout)}
      disabled={!isCompatible(layout, photoCount)}
      className={cn(
        'aspect-square rounded-lg border-2 p-3',
        'hover:scale-105 transition-transform',
        selected?.id === layout.id
          ? 'border-blue-500 bg-blue-500/10'
          : 'border-white/20',
        !isCompatible && 'opacity-30 cursor-not-allowed'
      )}
    >
      <LayoutIcon layout={layout} />
      <span className="text-xs mt-2">{layout.name}</span>
    </button>
  ))}
</div>
```

### F2: Step Indicator

```jsx
<div className="flex items-center justify-center gap-2 mb-6">
  {STEPS.map((step, index) => (
    <div key={step.id} className="flex items-center">
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center',
          currentStep === index
            ? 'bg-blue-500 text-white'
            : 'bg-white/10 text-white/50'
        )}
      >
        {index + 1}
      </div>
      {index < STEPS.length - 1 && (
        <div className="w-12 h-0.5 bg-white/20 mx-2" />
      )}
    </div>
  ))}
</div>
```

### F3: Auto-Fill Button

```jsx
;<button
  onClick={autoSelectLayout}
  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg"
>
  ✨ {t('collage.autoFill')}
</button>

function autoSelectLayout() {
  const compatible = getCompatibleLayouts(selectedPhotos.length)
  // Select first or random compatible layout
  setLayout(compatible[0])
}
```

### F4: Responsive Layout

**Desktop (>768px):**

```
┌─────────────────────────────────────────┐
│  Step Indicator                         │
├─────────────┬───────────────────────────┤
│             │                           │
│  Sidebar    │    Main Preview Area      │
│  (controls) │    (collage preview)      │
│             │                           │
└─────────────┴───────────────────────────┘
```

**Mobile (<768px):**

```
┌─────────────────────────────┐
│  Step Indicator             │
├─────────────────────────────┤
│                             │
│  Main Area (full width)     │
│                             │
├─────────────────────────────┤
│  Bottom Controls (sticky)   │
└─────────────────────────────┘
```

**Deliverables:**

1. `LayoutSelector.jsx` with visual icons
2. `StepIndicator.jsx` component
3. Auto-fill logic
4. Responsive layout variants

**STOP HERE.** User does visual QA before Phase G.

---

## PHASE G — INTEGRATION

### G1: Update CollageBuilder.jsx

**New Structure:**

```jsx
export default function CollageBuilder() {
  const { t } = useTranslation()
  const [step, setStep] = useState(1)
  const [selectedPhotos, setSelectedPhotos] = useState([])
  const [selectedLayout, setSelectedLayout] = useState(null)
  const [transforms, setTransforms] = useState({})
  const [repositionTarget, setRepositionTarget] = useState(null)

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <StepIndicator currentStep={step} />

      {step === 1 && (
        <ImagePickerV3
          onSelect={(photos) => {
            setSelectedPhotos(photos)
            setStep(2)
          }}
          maxPhotos={6}
        />
      )}

      {step === 2 && (
        <LayoutSelector
          photoCount={selectedPhotos.length}
          selectedLayout={selectedLayout}
          onSelect={(layout) => {
            setSelectedLayout(layout)
            setStep(3)
          }}
        />
      )}

      {step === 3 && (
        <>
          <CollagePreview
            photos={selectedPhotos}
            layout={selectedLayout}
            transforms={transforms}
            onImageClick={(photoId) => setRepositionTarget(photoId)}
          />
          <button onClick={() => setStep(4)}>{t('collage.saveButton')}</button>
        </>
      )}

      {step === 4 && (
        <SaveCollage
          photos={selectedPhotos}
          layout={selectedLayout}
          transforms={transforms}
          onComplete={(collageId) => {
            // Navigate to collage view
          }}
        />
      )}

      {repositionTarget && (
        <RepositionModal
          photo={selectedPhotos.find((p) => p.id === repositionTarget)}
          currentTransform={transforms[repositionTarget]}
          onSave={(transform) => {
            setTransforms((prev) => ({
              ...prev,
              [repositionTarget]: transform,
            }))
            setRepositionTarget(null)
          }}
          onClose={() => setRepositionTarget(null)}
        />
      )}
    </div>
  )
}
```

### G2: i18n Keys

Add to `/src/i18n/locales/en.json`:

```json
{
  "collage": {
    "title": "Create Collage",
    "steps": {
      "select": "Select Photos",
      "layout": "Choose Layout",
      "edit": "Edit & Position",
      "save": "Save Collage"
    },
    "autoFill": "Auto-Select Layout",
    "saveButton": "Save Collage",
    "picker": {
      "filters": {
        "all": "All Photos",
        "favorites": "Favorites",
        "screenshots": "Screenshots",
        "recent": "Recently Added",
        "ai": "AI Tagged"
      },
      "selected": "selected",
      "continue": "Continue",
      "searchPlaceholder": "Search photos..."
    },
    "reposition": {
      "title": "Adjust Photo",
      "reset": "Reset",
      "save": "Save",
      "zoom": "Zoom"
    }
  }
}
```

Add Norwegian translations to `/src/i18n/locales/no.json`.

### G3: Routing Integration

Update `/src/App.jsx`:

```jsx
<Route path="/collage" element={<CollageBuilder />} />
<Route path="/collage/:id" element={<CollageView />} />
```

### G4: Save to Firestore

Create `/src/hooks/useCollageData.js`:

```javascript
export function useCollageData() {
  const { saveCollage, getCollage, deleteCollage } = usePhotoData()

  async function createCollage({ photos, layout, transforms, title }) {
    const collageData = {
      photos: photos.map((p) => p.id),
      layoutId: layout.id,
      transforms,
      title: title || `Collage ${new Date().toLocaleDateString()}`,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    return await saveCollage(collageData)
  }

  return { createCollage, getCollage, deleteCollage }
}
```

**Deliverables:**

1. Fully integrated `CollageBuilder.jsx`
2. All i18n keys (English + Norwegian)
3. Routing setup
4. Firestore save logic
5. Remove old/unused code

**STOP HERE.** User does full integration testing before Phase H.

---

## PHASE H — TESTING & VALIDATION

### Testing Checklist

**Functional Tests:**

```markdown
#### Step 1: Select Photos

- [ ] Can select 1-6 photos
- [ ] Cannot select more than 6
- [ ] Selected count updates correctly
- [ ] Favorites filter works
- [ ] Screenshots filter works
- [ ] Recent filter works (last 30 days)
- [ ] AI tags filter works
- [ ] Search filters correctly
- [ ] Day/month grouping displays
- [ ] Can deselect photos
- [ ] Continue button disabled until 1+ selected

#### Step 2: Choose Layout

- [ ] Only compatible layouts shown
- [ ] Layout icons render correctly
- [ ] Selected layout highlights
- [ ] Incompatible layouts disabled
- [ ] Auto-fill selects valid layout
- [ ] Can go back to step 1

#### Step 3: Preview & Edit

- [ ] Preview renders all photos
- [ ] Layout matches selected template
- [ ] Can click photo to reposition
- [ ] Reposition modal opens
- [ ] Drag moves photo
- [ ] Zoom slider works (100-300%)
- [ ] Reset button works
- [ ] Save button saves transform
- [ ] Preview updates after save
- [ ] Can edit multiple photos
- [ ] Can go back to step 2

#### Step 4: Save Collage

- [ ] Save button creates Firestore doc
- [ ] Collage includes all metadata
- [ ] Redirects to collage view
- [ ] Can view saved collage
- [ ] Can edit saved collage
- [ ] Can delete saved collage
```

**Visual Tests:**

```markdown
#### Dark Mode

- [ ] All components respect dark mode
- [ ] Glass-morphism effects work
- [ ] Text contrast is readable
- [ ] Borders visible

#### Light Mode

- [ ] All components respect light mode
- [ ] No contrast issues
- [ ] Borders visible
- [ ] Background colors appropriate

#### Responsive

- [ ] Mobile (<768px): stacked layout
- [ ] Tablet (768-1024px): optimized grid
- [ ] Desktop (>1024px): sidebar layout
- [ ] Touch targets minimum 44px
- [ ] No horizontal scroll
```

**i18n Tests:**

```markdown
- [ ] All text uses translations
- [ ] English translations complete
- [ ] Norwegian translations complete
- [ ] No hardcoded text
- [ ] Pluralization works (X photos selected)
```

**Performance Tests:**

```markdown
- [ ] 50+ photos: picker loads without lag
- [ ] Image thumbnails load progressively
- [ ] No memory leaks (check DevTools)
- [ ] Smooth animations (60fps)
- [ ] Preview updates <100ms
```

**Error Handling:**

```markdown
- [ ] Missing photo URL: shows placeholder
- [ ] Network error: shows error message
- [ ] Invalid layout: fallback to default
- [ ] Firestore save fails: retry option
- [ ] No photos available: empty state
```

### Bug Report Template

When issues found:

```markdown
**Issue:** [Brief description]
**Component:** [Which file/component]
**Steps to Reproduce:**

1.
2.
3.

**Expected:** [What should happen]
**Actual:** [What happens]
**Screenshots:** [If applicable]
**Priority:** Critical / High / Medium / Low
```

---

## CODE STANDARDS CHECKLIST

Before marking any phase complete:

```markdown
- [ ] All components use PropTypes or TypeScript
- [ ] All user-facing text uses i18next
- [ ] No direct Firebase calls (use usePhotoData)
- [ ] No inline styles (use Tailwind)
- [ ] Loading states implemented
- [ ] Error states implemented
- [ ] Mobile responsive
- [ ] Dark/light mode support
- [ ] Accessibility: keyboard navigation
- [ ] Accessibility: ARIA labels where needed
- [ ] No console.log in production code
- [ ] Code formatted consistently
- [ ] No unused imports
- [ ] No duplicate code
```

---

## COMPLETION CRITERIA

**Collage Builder V3 is complete when:**

1. ✅ All 8 phases delivered and tested
2. ✅ All testing checklist items pass
3. ✅ No critical or high-priority bugs
4. ✅ Code standards checklist 100%
5. ✅ User can create professional collage in <2 minutes
6. ✅ Works flawlessly on mobile and desktop
7. ✅ Matches Pixtr design language
8. ✅ i18n complete (English + Norwegian)

---

## FINAL DELIVERABLES

**Files Created:**

```
/src/components/
  ├── CollageBuilder.jsx (updated)
  ├── CollagePreview.jsx (new)
  ├── ImagePickerV3.jsx (new)
  ├── LayoutSelector.jsx (new)
  ├── RepositionModal.jsx (new)
  ├── PhotoCell.jsx (new)
  ├── FilterTabs.jsx (new)
  ├── SearchBar.jsx (new)
  └── PhotoGridGrouped.jsx (new)

/src/utils/
  └── layouts_v3.js (new)

/src/hooks/
  └── useCollageData.js (new)

/src/i18n/locales/
  ├── en.json (updated)
  └── no.json (updated)
```

**Documentation:**

- [ ] Component API docs
- [ ] Layout system guide
- [ ] User-facing help text
- [ ] Developer notes for future features

---

## EMERGENCY ROLLBACK

If critical issues found post-integration:

1. **Revert Git commits:**

```bash
   git log --oneline  # Find commit before Collage V3
   git revert <commit-hash>
```

2. **Feature flag (alternative):**
   Add to Firestore config:

```javascript
features: {
  collageBuilderV3: false
}
```

3. **Restore old components:**
   Keep backup of old `CollageBuilder.jsx` as `CollageBuilder.legacy.jsx`

---

**Ready to begin. Awaiting file reading confirmation (Phase 0).**
