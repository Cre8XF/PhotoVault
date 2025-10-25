# FILE: 03-album-grid.md

# AlbumPage - Advanced Photo Grid

## INSTRUCTIONS

Implement directly. Test. Commit: "feat(album): advanced photo grid with multiple layouts"

## FILES TO MODIFY

- @src/pages/AlbumPage.jsx

## IMPLEMENTATION

### 1. Add Layout Toggles

Add state for different grid layouts:

```jsx
const [layout, setLayout] = useState('grid'); // grid, masonry, justified, waterfall
const [gridColumns, setGridColumns] = useState(4);
const [viewDensity, setViewDensity] = useState('comfortable'); // compact, comfortable, spacious
```

### 2. Grid Layout Options

```jsx
// Toolbar addition

  {[
    { value: 'grid', icon: Grid3x3, label: 'Grid' },
    { value: 'masonry', icon: Grid, label: 'Masonry' },
    { value: 'justified', icon: AlignJustify, label: 'Justified' },
  ].map(option => (
    <button
      key={option.value}
      onClick={() => setLayout(option.value)}
      className={`p-2 rounded transition ${
        layout === option.value ? 'bg-purple-600' : 'hover:bg-white/10'
      }`}
      title={option.label}
    >


  ))}

```

### 3. Virtual Scrolling for Large Albums

Install and implement:

```bash
npm install react-window react-window-infinite-loader
```

```jsx
import { FixedSizeGrid as Grid } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';

// For 1000+ photos
{filteredPhotos.length > 1000 ? (

) : (

)}
```

### 4. Enhanced Photo Item

```jsx
const PhotoItem = React.memo(({ photo, isSelected, onSelect, editMode }) => {
  return (



      {/* Quick Actions Overlay */}
      {editMode && (










      )}

      {/* Selection Checkbox */}
      {editMode && (

          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
            isSelected ? 'bg-purple-600 border-purple-600' : 'border-white/50 bg-black/20'
          }`}>
            {isSelected && }


      )}

      {/* Metadata Badges */}

        {photo.aiAnalyzed && (


            AI

        )}
        {photo.faces > 0 && (

            👤 {photo.faces}

        )}


  );
});
```

### 5. Smooth Grid Transitions

```jsx
import { AnimatePresence } from 'framer-motion';


  {filteredPhotos.map(photo => (

  ))}

```

## TESTING

- [ ] Grid responsive on all screens
- [ ] Virtual scroll for 1000+ photos
- [ ] Layout switching smooth
- [ ] Selection works correctly
- [ ] 60fps animations

---
