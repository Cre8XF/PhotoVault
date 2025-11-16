# ImagePickerV3 Component Documentation

## Overview

The `ImagePickerV3` component is an enhanced photo selection interface for Collage Builder V3. It provides advanced filtering, search, date-based grouping, and selection management with visual feedback.

---

## Component Structure

```
ImagePickerV3.jsx (main component)
├── FilterTabs.jsx (category filter buttons)
├── SearchBar.jsx (debounced search input)
├── SelectionCounter.jsx (selection header with progress)
└── PhotoGridGrouped.jsx (responsive grid with date grouping)
```

---

## ImagePickerV3 API

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `photos` | `Photo[]` | Yes | `[]` | Array of photo objects from Firestore |
| `onSelect` | `Function` | Yes | - | Selection handler `(photos) => void` |
| `maxPhotos` | `number` | No | `6` | Maximum number of photos allowed |
| `initialSelection` | `Photo[]` | No | `[]` | Pre-selected photos (for editing) |
| `onBack` | `Function` | No | `null` | Back button handler `() => void` |
| `showBack` | `boolean` | No | `false` | Show back button in header |

### Photo Object Schema

```javascript
{
  id: string,              // Required: Unique photo ID
  downloadURL: string,     // Required: Full resolution URL
  thumbnail: string,       // Optional: Thumbnail URL (preferred)
  filename: string,        // Optional: Display name
  uploadedAt: Date,        // Required: Upload timestamp (for grouping)
  isFavorite: boolean,     // Optional: Favorite flag
  isScreenshot: boolean,   // Optional: Screenshot detection
  aiTags: string[]         // Optional: AI-generated tags
}
```

### Example Usage

```jsx
import ImagePickerV3 from './ImagePickerV3'

function CollageBuilder() {
  const { photos } = usePhotoData()
  const [selectedPhotos, setSelectedPhotos] = useState([])

  const handleSelect = (photos) => {
    setSelectedPhotos(photos)
    // Move to next step (layout selection)
  }

  return (
    <ImagePickerV3
      photos={photos}
      onSelect={handleSelect}
      maxPhotos={6}
    />
  )
}
```

---

## FilterTabs API

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `activeFilter` | `string` | Yes | - | Current active filter ID |
| `onChange` | `Function` | Yes | - | Filter change handler `(filterId) => void` |
| `photoCounts` | `Object` | Yes | - | Photo counts per filter `{ all: 50, favorites: 10, ... }` |

### Filter Types

| Filter ID | Icon | Color | Description |
|-----------|------|-------|-------------|
| `all` | `ImageIcon` | White | All photos |
| `favorites` | `Star` | Yellow | Favorited photos |
| `screenshots` | `Smartphone` | Blue | Detected screenshots |
| `recent` | `Clock` | Green | Photos from last 30 days |
| `ai` | `Sparkles` | Purple | AI-tagged photos |

### Example Usage

```jsx
import FilterTabs from './FilterTabs'

function PhotoPicker() {
  const [activeFilter, setActiveFilter] = useState('all')
  const photoCounts = {
    all: 50,
    favorites: 12,
    screenshots: 8,
    recent: 15,
    ai: 20
  }

  return (
    <FilterTabs
      activeFilter={activeFilter}
      onChange={setActiveFilter}
      photoCounts={photoCounts}
    />
  )
}
```

---

## SearchBar API

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `query` | `string` | Yes | - | Current search query |
| `onChange` | `Function` | Yes | - | Query change handler `(query) => void` |
| `debounceMs` | `number` | No | `300` | Debounce delay in milliseconds |
| `placeholder` | `string` | No | `'Search photos...'` | Input placeholder text |

### Features

**Debouncing:**
- 300ms delay before triggering onChange
- Prevents excessive filtering on every keystroke
- Clear button appears when query is active

**Search Logic:**
- Searches in `filename` field
- Searches in `aiTags` array
- Case-insensitive matching

### Example Usage

```jsx
import SearchBar from './SearchBar'

function PhotoPicker() {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <SearchBar
      query={searchQuery}
      onChange={setSearchQuery}
      debounceMs={300}
      placeholder="Search by name or tags..."
    />
  )
}
```

---

## SelectionCounter API

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `count` | `number` | Yes | - | Current selection count |
| `maxPhotos` | `number` | Yes | - | Maximum allowed photos |
| `onContinue` | `Function` | Yes | - | Continue button handler `() => void` |
| `disabled` | `boolean` | No | `false` | Disable continue button |

### Features

**Progress Bar:**
- Visual indicator of selection progress
- Blue fill up to 100%
- Yellow when at max (100%)

**Continue Button:**
- Enabled when at least 1 photo selected
- Shows remaining count: "Select X more photos"
- Shows "Continue with X photos" when ready

**Max Reached Warning:**
- Yellow banner appears when max photos reached
- Message: "Maximum X photos selected"

### Example Usage

```jsx
import SelectionCounter from './SelectionCounter'

function PhotoPicker() {
  const [selectedPhotos, setSelectedPhotos] = useState([])
  const maxPhotos = 6

  const handleContinue = () => {
    console.log('Selected photos:', selectedPhotos)
    // Move to next step
  }

  return (
    <SelectionCounter
      count={selectedPhotos.length}
      maxPhotos={maxPhotos}
      onContinue={handleContinue}
      disabled={selectedPhotos.length === 0}
    />
  )
}
```

---

## PhotoGridGrouped API

### Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| `photos` | `Photo[]` | Yes | - | Array of photos to display |
| `selectedPhotos` | `Photo[]` | Yes | - | Currently selected photos |
| `onToggle` | `Function` | Yes | - | Toggle handler `(photo) => void` |
| `maxReached` | `boolean` | No | `false` | Max selection reached flag |
| `showGrouping` | `boolean` | No | `true` | Show date-based grouping |

### Date Grouping

Photos are grouped by upload date when `showGrouping` is true:

| Group | Time Range |
|-------|------------|
| Today | Last 24 hours |
| Yesterday | 24-48 hours ago |
| This Week | 2-7 days ago |
| This Month | 8-30 days ago |
| Older | 30+ days ago |

### Grid Layout

**Responsive Columns:**
- Mobile (< 640px): 2 columns
- Tablet (640px - 768px): 3 columns
- Desktop (≥ 768px): 4 columns

**Gap:** 8px (gap-2)

### Photo Cell States

**Selected State:**
- Blue border (3px solid)
- Blue checkmark overlay (top-right)
- Scale animation on selection

**Disabled State:**
- Opacity 50%
- Cursor not-allowed
- Occurs when maxReached and photo not selected

**Hover State:**
- Scale transform (1.02)
- Transition animation

### Example Usage

```jsx
import PhotoGridGrouped from './PhotoGridGrouped'

function PhotoPicker() {
  const [photos, setPhotos] = useState([...])
  const [selectedPhotos, setSelectedPhotos] = useState([])
  const maxPhotos = 6

  const handleToggle = (photo) => {
    if (selectedPhotos.includes(photo)) {
      setSelectedPhotos(selectedPhotos.filter(p => p.id !== photo.id))
    } else if (selectedPhotos.length < maxPhotos) {
      setSelectedPhotos([...selectedPhotos, photo])
    }
  }

  return (
    <PhotoGridGrouped
      photos={photos}
      selectedPhotos={selectedPhotos}
      onToggle={handleToggle}
      maxReached={selectedPhotos.length >= maxPhotos}
      showGrouping={true}
    />
  )
}
```

---

## Features

### 1. Advanced Filtering

**Filter by Category:**
- **All:** Show all photos
- **Favorites:** `photo.isFavorite === true`
- **Screenshots:** `photo.isScreenshot === true`
- **Recent:** `uploadedAt` within last 30 days
- **AI:** `photo.aiTags.length > 0`

**Filter Logic:**
```javascript
const filteredByCategory = useMemo(() => {
  switch (activeFilter) {
    case 'favorites':
      return photos.filter(p => p.isFavorite)
    case 'screenshots':
      return photos.filter(p => p.isScreenshot)
    case 'recent':
      const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
      return photos.filter(p => new Date(p.uploadedAt).getTime() > thirtyDaysAgo)
    case 'ai':
      return photos.filter(p => p.aiTags?.length > 0)
    default:
      return photos
  }
}, [photos, activeFilter])
```

### 2. Search Functionality

**Debounced Search:**
- 300ms delay prevents excessive re-renders
- Searches in `filename` and `aiTags`
- Case-insensitive matching

**Search Logic:**
```javascript
const filteredPhotos = useMemo(() => {
  if (!searchQuery) return filteredByCategory

  const lowerQuery = searchQuery.toLowerCase()

  return filteredByCategory.filter(photo => {
    const matchesFilename = photo.filename?.toLowerCase().includes(lowerQuery)
    const matchesTags = photo.aiTags?.some(tag =>
      tag.toLowerCase().includes(lowerQuery)
    )

    return matchesFilename || matchesTags
  })
}, [filteredByCategory, searchQuery])
```

### 3. Date-Based Grouping

**Grouping Algorithm:**
```javascript
const groupedPhotos = useMemo(() => {
  const now = Date.now()
  const groups = {
    today: [],
    yesterday: [],
    thisWeek: [],
    thisMonth: [],
    older: []
  }

  photos.forEach(photo => {
    const diff = now - new Date(photo.uploadedAt).getTime()
    const dayMs = 24 * 60 * 60 * 1000

    if (diff < dayMs) groups.today.push(photo)
    else if (diff < 2 * dayMs) groups.yesterday.push(photo)
    else if (diff < 7 * dayMs) groups.thisWeek.push(photo)
    else if (diff < 30 * dayMs) groups.thisMonth.push(photo)
    else groups.older.push(photo)
  })

  return [
    { label: t('collage:picker.groups.today'), photos: groups.today },
    { label: t('collage:picker.groups.yesterday'), photos: groups.yesterday },
    { label: t('collage:picker.groups.thisWeek'), photos: groups.thisWeek },
    { label: t('collage:picker.groups.thisMonth'), photos: groups.thisMonth },
    { label: t('collage:picker.groups.older'), photos: groups.older }
  ].filter(group => group.photos.length > 0)
}, [photos, t])
```

**Grouping Display:**
- Only active for "All" and "Recent" filters
- Empty groups are hidden
- Section headers with opacity-70

### 4. Selection Management

**Selection Logic:**
```javascript
const handlePhotoToggle = (photo) => {
  const isSelected = selectedPhotos.some(p => p.id === photo.id)

  if (isSelected) {
    // Deselect
    setSelectedPhotos(selectedPhotos.filter(p => p.id !== photo.id))
  } else {
    // Select (if under max)
    if (selectedPhotos.length < maxPhotos) {
      setSelectedPhotos([...selectedPhotos, photo])
    }
  }
}
```

**Max Photos Enforcement:**
- Disable unselected photos when `maxReached`
- Visual feedback (opacity 50%, cursor not-allowed)
- Yellow warning banner when max reached

### 5. Initial Selection Support

**Editing Use Case:**
```javascript
// User is editing existing collage with 4 photos
const existingCollage = {
  photoIds: ['photo1', 'photo2', 'photo3', 'photo4']
}

const initialPhotos = existingCollage.photoIds
  .map(id => photos.find(p => p.id === id))
  .filter(Boolean)

<ImagePickerV3
  photos={allPhotos}
  initialSelection={initialPhotos}
  maxPhotos={6}
  onSelect={handleUpdate}
/>
```

**Behavior:**
- Pre-selected photos render with blue border and checkmark
- User can add more (up to max) or remove existing
- Selection count starts at initialSelection.length

---

## Validation & Error Handling

### Photo Count Validation

```javascript
const photoCounts = useMemo(() => ({
  all: photos.length,
  favorites: photos.filter(p => p.isFavorite).length,
  screenshots: photos.filter(p => p.isScreenshot).length,
  recent: photos.filter(p => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    return new Date(p.uploadedAt).getTime() > thirtyDaysAgo
  }).length,
  ai: photos.filter(p => p.aiTags?.length > 0).length
}), [photos])
```

### Empty States

**No Photos:**
```jsx
{filteredPhotos.length === 0 && (
  <div className="flex flex-col items-center justify-center py-16">
    <ImageIcon className="w-16 h-16 opacity-30 mb-4" />
    <p className="text-lg opacity-60">
      {t('collage:picker.empty.noPhotos')}
    </p>
  </div>
)}
```

**No Search Results:**
```jsx
{searchQuery && filteredPhotos.length === 0 && (
  <div className="flex flex-col items-center justify-center py-16">
    <Search className="w-16 h-16 opacity-30 mb-4" />
    <p className="text-lg opacity-60">
      {t('collage:picker.empty.noResults')}
    </p>
    <p className="text-sm opacity-40">
      Try different keywords
    </p>
  </div>
)}
```

**No Filter Results:**
```jsx
{activeFilter !== 'all' && filteredPhotos.length === 0 && (
  <div className="flex flex-col items-center justify-center py-16">
    <Star className="w-16 h-16 opacity-30 mb-4" />
    <p className="text-lg opacity-60">
      {t(`collage:picker.empty.no${activeFilter}`)}
    </p>
  </div>
)}
```

### Missing Photo Data

**Defensive Checks:**
```javascript
// Handle missing thumbnail
src={photo.thumbnail || photo.downloadURL}

// Handle missing filename
alt={photo.filename || t('collage:photo.untitled')}

// Handle missing uploadedAt
const uploadDate = photo.uploadedAt ? new Date(photo.uploadedAt) : new Date()

// Handle missing aiTags
const tags = photo.aiTags || []
```

---

## Styling

### Glass-Morphism Design

```jsx
// Filter tabs
className="bg-white/5 hover:bg-white/10 backdrop-blur-sm"

// Search bar
className="bg-white/5 border border-white/10 rounded-xl"

// Selection counter
className="sticky top-0 bg-black/40 backdrop-blur-xl border-b border-white/10"

// Photo cells
className="border-2 border-transparent hover:border-white/20"
```

### Transitions

```jsx
// Photo selection animation
className="transition-all duration-200"

// Hover scale effect
className="hover:scale-[1.02] transition-transform"

// Filter tab active state
className="transition-colors duration-150"
```

### Responsive Grid

```jsx
// PhotoGridGrouped responsive columns
className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2"

// Horizontal scroll for filter tabs
className="flex gap-2 overflow-x-auto pb-2 snap-x snap-mandatory"
```

---

## Performance Optimization

### 1. Debounced Search

```javascript
useEffect(() => {
  const timer = setTimeout(() => {
    if (localQuery !== query) {
      onChange(localQuery)
    }
  }, debounceMs)

  return () => clearTimeout(timer)
}, [localQuery, query, onChange, debounceMs])
```

### 2. Memoized Filtering

```javascript
const filteredPhotos = useMemo(() => {
  // Expensive filtering logic
}, [photos, activeFilter, searchQuery])
```

### 3. Memoized Grouping

```javascript
const groupedPhotos = useMemo(() => {
  // Date grouping calculation
}, [photos, showGrouping])
```

### 4. Lazy Loading

```jsx
<img
  src={photo.thumbnail || photo.downloadURL}
  loading="lazy"
  className="w-full h-full object-cover"
/>
```

### 5. Virtual Scrolling (Future Enhancement)

For large photo libraries (500+ photos), consider implementing virtual scrolling with `react-window` or `react-virtual`:

```jsx
import { FixedSizeGrid } from 'react-window'

<FixedSizeGrid
  columnCount={4}
  columnWidth={150}
  height={600}
  rowCount={Math.ceil(filteredPhotos.length / 4)}
  rowHeight={150}
  width={640}
>
  {({ columnIndex, rowIndex, style }) => {
    const photo = filteredPhotos[rowIndex * 4 + columnIndex]
    return <PhotoCell photo={photo} style={style} />
  }}
</FixedSizeGrid>
```

---

## Integration Examples

### With Zustand Store

```jsx
import { useCollageStore } from '../store/collageStore'
import { usePhotoData } from '../../../hooks/usePhotoData'

function CollageBuilderStep1() {
  const { photos } = usePhotoData()
  const { selectedPhotos, setSelectedPhotos, setStep } = useCollageStore()

  const handleSelect = (photos) => {
    setSelectedPhotos(photos)
    setStep(2) // Move to layout selection
  }

  return (
    <ImagePickerV3
      photos={photos}
      onSelect={handleSelect}
      maxPhotos={6}
      initialSelection={selectedPhotos}
    />
  )
}
```

### With CollageBuilder

```jsx
function CollageBuilder() {
  const [step, setStep] = useState(1)
  const [selectedPhotos, setSelectedPhotos] = useState([])
  const { photos } = usePhotoData()

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <h1>Create Collage</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {step === 1 && (
          <ImagePickerV3
            photos={photos}
            onSelect={(photos) => {
              setSelectedPhotos(photos)
              setStep(2)
            }}
            maxPhotos={6}
            showBack={false}
          />
        )}

        {step === 2 && (
          <LayoutSelector
            photoCount={selectedPhotos.length}
            onBack={() => setStep(1)}
          />
        )}
      </div>
    </div>
  )
}
```

### With Editing Flow

```jsx
function EditCollage({ collageId }) {
  const { photos } = usePhotoData()
  const { getCollage, updateCollage } = useCollageData()
  const [collage, setCollage] = useState(null)

  useEffect(() => {
    const loadCollage = async () => {
      const data = await getCollage(collageId)
      setCollage(data)
    }
    loadCollage()
  }, [collageId])

  const handleUpdatePhotos = async (newPhotos) => {
    await updateCollage(collageId, {
      ...collage,
      photoIds: newPhotos.map(p => p.id),
      updatedAt: new Date()
    })
  }

  if (!collage) return <div>Loading...</div>

  const initialPhotos = collage.photoIds
    .map(id => photos.find(p => p.id === id))
    .filter(Boolean)

  return (
    <ImagePickerV3
      photos={photos}
      onSelect={handleUpdatePhotos}
      maxPhotos={6}
      initialSelection={initialPhotos}
      showBack={true}
      onBack={() => navigate('/albums')}
    />
  )
}
```

---

## Testing Checklist

### Visual Tests

- [ ] Filter tabs render correctly with icons and counts
- [ ] Active filter has blue background
- [ ] Search bar shows clear button when query active
- [ ] Selection counter displays correct count (X/maxPhotos)
- [ ] Progress bar fills correctly (0% to 100%)
- [ ] Continue button enabled/disabled correctly
- [ ] Max reached warning appears at correct time
- [ ] Photo grid responsive (2/3/4 columns)
- [ ] Date grouping displays correctly
- [ ] Selected photos have blue border and checkmark
- [ ] Disabled photos have 50% opacity
- [ ] Hover effects work on desktop
- [ ] Glass-morphism styling consistent

### Functional Tests

- [ ] Filter tabs switch categories correctly
- [ ] Photo counts match actual filtered results
- [ ] Search debounces correctly (300ms delay)
- [ ] Search matches filename and aiTags
- [ ] Date grouping calculates correctly
- [ ] Empty groups are hidden
- [ ] Photo selection toggles correctly
- [ ] Max photos enforcement works
- [ ] Initial selection loads correctly
- [ ] Continue button calls onSelect with correct data
- [ ] Back button calls onBack handler
- [ ] Empty states display for no photos/results

### Responsive Tests

- [ ] Filter tabs scroll horizontally on mobile
- [ ] Search bar full-width on mobile
- [ ] Selection counter sticky on scroll
- [ ] Photo grid: 2 columns on mobile (< 640px)
- [ ] Photo grid: 3 columns on tablet (640-768px)
- [ ] Photo grid: 4 columns on desktop (≥ 768px)
- [ ] Touch interactions work on mobile
- [ ] Horizontal snap scrolling for filters

### Performance Tests

- [ ] Search debounce prevents lag (test with 500+ photos)
- [ ] Filter switching is instant
- [ ] Photo selection animations smooth
- [ ] Lazy loading works for images
- [ ] No memory leaks on unmount
- [ ] Memoization prevents unnecessary re-renders

### Accessibility Tests

- [ ] Filter tabs keyboard navigable
- [ ] Search input has focus state
- [ ] Continue button keyboard accessible
- [ ] Photos focusable with tab
- [ ] Screen reader announces selection count
- [ ] ARIA labels for filter icons
- [ ] Alt text for photo images

### Edge Cases

- [ ] No photos: Shows empty state
- [ ] All photos filtered out: Shows no results state
- [ ] Search with no matches: Shows no results state
- [ ] Max photos reached: Disables remaining photos
- [ ] Initial selection > maxPhotos: Handles gracefully
- [ ] Photos without uploadedAt: Defaults to "Older" group
- [ ] Photos without thumbnail: Uses downloadURL
- [ ] Photos without aiTags: Handles undefined safely

---

## Known Limitations

1. **No virtual scrolling** - May lag with 1000+ photos (future enhancement)
2. **Fixed max photos (6)** - Determined by layout system
3. **Fixed grouping logic** - No custom date ranges
4. **No multi-select gestures** - Shift+click, Ctrl+click not implemented
5. **No reordering** - Photo order determined by selection order

---

## Future Enhancements

1. **Virtual Scrolling** - Implement react-window for large libraries
2. **Smart Auto-Select** - AI-powered photo suggestions
3. **Batch Selection** - Select date range, select similar photos
4. **Custom Filters** - User-created filter combinations
5. **Photo Editing Preview** - Show filters/adjustments in picker
6. **Keyboard Shortcuts** - Arrow keys navigation, Space to select
7. **Drag to Reorder** - Rearrange selected photos
8. **Photo Metadata Display** - Date, size, resolution on hover
9. **Favorite/Screenshot Toggle** - Quick actions in picker
10. **Export Selection** - Save selection as album/collection

---

## Related Components

- **CollagePreview** - Displays selected photos in layout
- **LayoutSelector** - Choose collage layout (Phase F)
- **RepositionModal** - Adjust individual photo transforms
- **usePhotoData** - Fetch photos from Firestore
- **useCollageStore** - Zustand state management (Phase G)

---

## i18n Keys Required

Add to `translation.json` under `collage.picker.*`:

```json
{
  "collage": {
    "picker": {
      "title": "Select Photos",
      "filters": {
        "all": "All",
        "favorites": "Favorites",
        "screenshots": "Screenshots",
        "recent": "Recent",
        "ai": "AI Tagged"
      },
      "search": {
        "placeholder": "Search photos...",
        "clear": "Clear search"
      },
      "selection": {
        "count": "{{count}} of {{max}} selected",
        "selectMore": "Select {{remaining}} more photos",
        "continue": "Continue with {{count}} photos",
        "maxReached": "Maximum {{max}} photos selected"
      },
      "groups": {
        "today": "Today",
        "yesterday": "Yesterday",
        "thisWeek": "This Week",
        "thisMonth": "This Month",
        "older": "Older"
      },
      "empty": {
        "noPhotos": "No photos available",
        "noResults": "No photos match your search",
        "noFavorites": "No favorite photos yet",
        "noScreenshots": "No screenshots detected",
        "noRecent": "No recent photos",
        "noAi": "No AI-tagged photos"
      },
      "back": "Back"
    }
  }
}
```

---

**Ready for Phase F (UI/UX Polish).**
