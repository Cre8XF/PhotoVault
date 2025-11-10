# Features 2-5: Implementasjonsplaner

Kompakte detaljplaner for de resterende 4 funksjonene.

---

# Feature 2: Kollasj-maker

**Prioritet:** P0 | **Kompleksitet:** ⭐⭐⭐⭐ | **Estimat:** 7-10 dager

## Funksjonsbeskrivelse
Canvas-basert editor hvor brukere lager kollasjer av 2-9 bilder med:
- Pre-definerte layouts (grid, freeform, polaroid, scrapbook)
- Drag & drop positioning
- Tekst-overlay med fonts/farger
- Stickers & emojis
- Background colors/patterns
- Export som høyoppløselig PNG/JPEG

---

## Fase 1: Canvas Engine & Layouts (Dag 1-3)

### Filstruktur
```
src/features/collage/
├── components/
│   ├── CollageBuilder.jsx      # Main component
│   ├── LayoutSelector.jsx      # Grid of templates
│   ├── PhotoSelector.jsx       # Choose photos
│   ├── ToolbarPanel.jsx        # Edit tools
│   └── ExportModal.jsx         # Save options
├── layouts/
│   ├── gridLayouts.js          # 2x2, 3x3, etc
│   ├── freeformLayouts.js      # Creative templates
│   └── templateEngine.js       # Layout logic
├── hooks/
│   └── useCollageCanvas.js     # Canvas operations
└── utils/
    ├── canvasUtils.js          # Draw/export
    └── imageLoader.js          # Load & resize
```

### Core Implementation

**1. Layout definitions**
```javascript
// src/features/collage/layouts/gridLayouts.js
export const GRID_LAYOUTS = {
  '2-photos-horizontal': {
    name: '2 bilder (horisontal)',
    slots: 2,
    canvas: { width: 1200, height: 600 },
    positions: [
      { x: 0, y: 0, w: 600, h: 600 },
      { x: 600, y: 0, w: 600, h: 600 }
    ]
  },
  '3-photos-vertical': {
    name: '3 bilder (vertikal)',
    slots: 3,
    canvas: { width: 800, height: 1200 },
    positions: [
      { x: 0, y: 0, w: 800, h: 400 },
      { x: 0, y: 400, w: 800, h: 400 },
      { x: 0, y: 800, w: 800, h: 400 }
    ]
  },
  '4-photos-grid': {
    name: '4 bilder (grid)',
    slots: 4,
    canvas: { width: 1200, height: 1200 },
    positions: [
      { x: 0, y: 0, w: 600, h: 600 },
      { x: 600, y: 0, w: 600, h: 600 },
      { x: 0, y: 600, w: 600, h: 600 },
      { x: 600, y: 600, w: 600, h: 600 }
    ]
  },
  // ... add more templates
}
```

**2. Canvas hook**
```javascript
// src/features/collage/hooks/useCollageCanvas.js
import { useRef, useEffect, useState } from 'react'

export const useCollageCanvas = (layout, photos) => {
  const canvasRef = useRef(null)
  const [ctx, setCtx] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current
      canvas.width = layout.canvas.width
      canvas.height = layout.canvas.height
      setCtx(canvas.getContext('2d'))
    }
  }, [layout])

  const drawCollage = async () => {
    if (!ctx || !photos.length) return
    
    setLoading(true)
    
    // Clear canvas
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, layout.canvas.width, layout.canvas.height)
    
    // Load and draw each photo
    for (let i = 0; i < layout.positions.length; i++) {
      const pos = layout.positions[i]
      const photo = photos[i]
      
      if (photo) {
        const img = await loadImage(photo.url)
        ctx.drawImage(img, pos.x, pos.y, pos.w, pos.h)
      }
    }
    
    setLoading(false)
  }

  const loadImage = (url) => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = url
    })
  }

  const exportCollage = (format = 'png', quality = 0.95) => {
    if (!canvasRef.current) return null
    
    return canvasRef.current.toDataURL(`image/${format}`, quality)
  }

  return {
    canvasRef,
    drawCollage,
    exportCollage,
    loading
  }
}
```

**3. Main builder component**
```javascript
// src/features/collage/components/CollageBuilder.jsx
import React, { useState, useEffect } from 'react'
import { X, Download, ArrowLeft } from 'lucide-react'
import { GRID_LAYOUTS } from '../layouts/gridLayouts'
import { useCollageCanvas } from '../hooks/useCollageCanvas'
import LayoutSelector from './LayoutSelector'
import PhotoSelector from './PhotoSelector'

const CollageBuilder = ({ availablePhotos, onClose, onSave }) => {
  const [step, setStep] = useState(1) // 1: layout, 2: photos, 3: edit
  const [selectedLayout, setSelectedLayout] = useState(null)
  const [selectedPhotos, setSelectedPhotos] = useState([])
  
  const { canvasRef, drawCollage, exportCollage, loading } = useCollageCanvas(
    selectedLayout,
    selectedPhotos
  )

  useEffect(() => {
    if (selectedLayout && selectedPhotos.length > 0) {
      drawCollage()
    }
  }, [selectedLayout, selectedPhotos])

  const handleSave = async () => {
    const dataUrl = exportCollage('png', 0.95)
    
    // Convert to blob and upload
    const blob = await fetch(dataUrl).then(r => r.blob())
    await onSave(blob, 'collage')
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-white/10">
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg">
          <X className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold">Lag kollasj</h1>
        <button
          onClick={handleSave}
          disabled={!selectedPhotos.length || loading}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl disabled:opacity-50"
        >
          <Download className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Sidebar */}
        <div className="w-80 bg-gray-900 border-r border-white/10 overflow-y-auto p-4">
          {step === 1 && (
            <LayoutSelector
              layouts={Object.values(GRID_LAYOUTS)}
              onSelect={(layout) => {
                setSelectedLayout(layout)
                setStep(2)
              }}
            />
          )}
          
          {step === 2 && selectedLayout && (
            <PhotoSelector
              photos={availablePhotos}
              maxPhotos={selectedLayout.slots}
              selectedPhotos={selectedPhotos}
              onSelect={setSelectedPhotos}
              onBack={() => setStep(1)}
            />
          )}
        </div>

        {/* Canvas Preview */}
        <div className="flex-1 flex items-center justify-center bg-gray-800 p-8">
          <div className="relative">
            <canvas
              ref={canvasRef}
              className="max-w-full max-h-full shadow-2xl"
              style={{ maxWidth: '90%', maxHeight: '90%' }}
            />
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CollageBuilder
```

### Testing Fase 1
- [ ] Layouts renderer korrekt
- [ ] Canvas dimensions korrekte
- [ ] Photos lastes og plasseres riktig
- [ ] Export fungerer
- [ ] Responsive på ulike skjermstørrelser

---

## Fase 2: Text & Stickers (Dag 4-5)

### Implementasjon

**Text overlay**
```javascript
// src/features/collage/utils/textUtils.js
export const drawText = (ctx, text, x, y, options = {}) => {
  const {
    fontSize = 48,
    fontFamily = 'Arial',
    color = '#000000',
    align = 'center',
    baseline = 'middle',
    maxWidth = null,
    shadow = true
  } = options

  ctx.font = `${fontSize}px ${fontFamily}`
  ctx.fillStyle = color
  ctx.textAlign = align
  ctx.textBaseline = baseline

  if (shadow) {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'
    ctx.shadowBlur = 4
    ctx.shadowOffsetX = 2
    ctx.shadowOffsetY = 2
  }

  if (maxWidth) {
    ctx.fillText(text, x, y, maxWidth)
  } else {
    ctx.fillText(text, x, y)
  }

  // Reset shadow
  ctx.shadowColor = 'transparent'
}
```

**Sticker system**
```javascript
// Pre-defined stickers (emoji/icons)
export const STICKERS = {
  hearts: ['❤️', '💖', '💕', '💗'],
  celebrations: ['🎉', '🎊', '🎈', '🎁'],
  travel: ['✈️', '🗺️', '📍', '🏖️'],
  seasons: ['🌸', '☀️', '🍂', '❄️']
}
```

### Testing Fase 2
- [ ] Text plasseres korrekt
- [ ] Fonts vises riktig
- [ ] Stickers skaleres
- [ ] Drag & drop fungerer

---

## Fase 3: Advanced Features (Dag 6-7)

**Filters & Effects**
```javascript
// Sepia filter
const applySepiaFilter = (ctx, x, y, w, h) => {
  const imageData = ctx.getImageData(x, y, w, h)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    data[i] = (r * 0.393) + (g * 0.769) + (b * 0.189)
    data[i + 1] = (r * 0.349) + (g * 0.686) + (b * 0.168)
    data[i + 2] = (r * 0.272) + (g * 0.534) + (b * 0.131)
  }

  ctx.putImageData(imageData, x, y)
}
```

**Rounded corners**
```javascript
const drawRoundedImage = (ctx, img, x, y, w, h, radius) => {
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + w - radius, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius)
  ctx.lineTo(x + w, y + h - radius)
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
  ctx.lineTo(x + radius, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
  ctx.clip()
  ctx.drawImage(img, x, y, w, h)
  ctx.restore()
}
```

### Testing Fase 3
- [ ] Filters fungerer
- [ ] Rounded corners renderer
- [ ] Undo/redo fungerer

---

## Fase 4: Save & Share (Dag 8-10)

### Firebase integration
```javascript
// Upload collage to Storage
const uploadCollage = async (blob, userId) => {
  const storage = getStorage()
  const filename = `collage_${Date.now()}.png`
  const ref = storageRef(storage, `users/${userId}/collages/${filename}`)
  
  await uploadBytes(ref, blob)
  const url = await getDownloadURL(ref)
  
  // Save metadata to Firestore
  const db = getFirestore()
  await addDoc(collection(db, `users/${userId}/collages`), {
    url,
    filename,
    createdAt: new Date().toISOString(),
    layout: selectedLayout.name,
    photoCount: selectedPhotos.length
  })
  
  return url
}
```

### Social sharing
```javascript
const shareCollage = async (dataUrl) => {
  if (navigator.share) {
    const blob = await fetch(dataUrl).then(r => r.blob())
    const file = new File([blob], 'collage.png', { type: 'image/png' })
    
    await navigator.share({
      files: [file],
      title: 'My Collage',
      text: 'Check out my photo collage!'
    })
  } else {
    // Fallback: download
    const link = document.createElement('a')
    link.download = 'collage.png'
    link.href = dataUrl
    link.click()
  }
}
```

### Testing Fase 4
- [ ] Upload til Firebase fungerer
- [ ] Metadata lagres
- [ ] Share API fungerer (mobile)
- [ ] Download fallback fungerer
- [ ] Final polish & animations

---

# Feature 3: Tidslinje-visning

**Prioritet:** P1 | **Kompleksitet:** ⭐⭐⭐ | **Estimat:** 5-7 dager

## Funksjonsbeskrivelse
Automatisk chronologisk visning av bilder gruppert etter dato.

---

## Fase 1: Date Grouping Logic (Dag 1-2)

### Filstruktur
```
src/features/timeline/
├── components/
│   ├── TimelineView.jsx
│   ├── DateSection.jsx
│   ├── TimelineNavigation.jsx
│   └── OnThisDayWidget.jsx
├── hooks/
│   └── useTimeline.js
└── utils/
    └── dateGrouping.js
```

### Core logic
```javascript
// src/features/timeline/utils/dateGrouping.js
import { format, startOfDay, isSameDay, isSameMonth, isSameYear } from 'date-fns'
import { nb } from 'date-fns/locale'

export const groupPhotosByDate = (photos) => {
  const sorted = [...photos].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  )

  const groups = {}

  sorted.forEach(photo => {
    const date = new Date(photo.createdAt)
    const key = format(date, 'yyyy-MM-dd')

    if (!groups[key]) {
      groups[key] = {
        date: date,
        displayDate: format(date, 'EEEE d. MMMM yyyy', { locale: nb }),
        photos: []
      }
    }

    groups[key].photos.push(photo)
  })

  return Object.values(groups)
}

export const groupPhotosByMonth = (photos) => {
  const sorted = [...photos].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  )

  const groups = {}

  sorted.forEach(photo => {
    const date = new Date(photo.createdAt)
    const key = format(date, 'yyyy-MM')

    if (!groups[key]) {
      groups[key] = {
        date: date,
        displayDate: format(date, 'MMMM yyyy', { locale: nb }),
        photos: []
      }
    }

    groups[key].photos.push(photo)
  })

  return Object.values(groups)
}

export const groupPhotosByYear = (photos) => {
  const sorted = [...photos].sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  )

  const groups = {}

  sorted.forEach(photo => {
    const date = new Date(photo.createdAt)
    const year = format(date, 'yyyy')

    if (!groups[year]) {
      groups[year] = {
        year: year,
        photos: []
      }
    }

    groups[year].photos.push(photo)
  })

  return Object.values(groups)
}
```

### Testing Fase 1
- [ ] Gruppering fungerer for dag/måned/år
- [ ] Sortering korrekt (nyeste først)
- [ ] Edge cases (bilder uten dato)
- [ ] Performance med 1000+ bilder

---

## Fase 2: Timeline UI (Dag 3-4)

### Implementation
```javascript
// src/features/timeline/components/TimelineView.jsx
import React, { useMemo, useState } from 'react'
import { groupPhotosByDate, groupPhotosByMonth } from '../utils/dateGrouping'
import DateSection from './DateSection'
import TimelineNavigation from './TimelineNavigation'

const TimelineView = ({ photos, onPhotoClick }) => {
  const [groupBy, setGroupBy] = useState('day') // 'day' | 'month' | 'year'

  const groups = useMemo(() => {
    if (groupBy === 'day') return groupPhotosByDate(photos)
    if (groupBy === 'month') return groupPhotosByMonth(photos)
    return groupPhotosByYear(photos)
  }, [photos, groupBy])

  return (
    <div className="timeline-view min-h-screen">
      {/* Navigation */}
      <TimelineNavigation
        currentView={groupBy}
        onViewChange={setGroupBy}
        totalPhotos={photos.length}
      />

      {/* Timeline sections */}
      <div className="space-y-8 p-4">
        {groups.map((group, index) => (
          <DateSection
            key={index}
            date={group.displayDate || group.year}
            photos={group.photos}
            onPhotoClick={onPhotoClick}
          />
        ))}
      </div>
    </div>
  )
}

export default TimelineView
```

### Testing Fase 2
- [ ] UI renders korrekt
- [ ] Smooth scrolling
- [ ] View toggle fungerer
- [ ] Responsive design

---

## Fase 3: "On This Day" Widget (Dag 5)

```javascript
// src/features/timeline/components/OnThisDayWidget.jsx
import React, { useMemo } from 'react'
import { isSameDay, subYears } from 'date-fns'

const OnThisDayWidget = ({ photos, onPhotoClick }) => {
  const memoriesFromPastYears = useMemo(() => {
    const today = new Date()
    const memories = []

    photos.forEach(photo => {
      const photoDate = new Date(photo.createdAt)
      
      // Check if same day & month but different year
      if (
        isSameDay(
          new Date(today.getFullYear(), photoDate.getMonth(), photoDate.getDate()),
          today
        ) && 
        photoDate.getFullYear() !== today.getFullYear()
      ) {
        memories.push(photo)
      }
    })

    return memories.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    )
  }, [photos])

  if (memories.length === 0) return null

  return (
    <div className="glass p-6 rounded-2xl mb-6">
      <h3 className="text-xl font-bold mb-4">🎂 På denne dagen</h3>
      <p className="text-sm opacity-70 mb-4">
        Minner fra tidligere år
      </p>
      
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {memoriesFromPastYears.slice(0, 8).map(photo => (
          <div
            key={photo.id}
            onClick={() => onPhotoClick(photo)}
            className="relative aspect-square rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition"
          >
            <img
              src={photo.url}
              alt={photo.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
              <p className="text-xs font-medium">
                {new Date(photo.createdAt).getFullYear()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default OnThisDayWidget
```

### Testing Fase 3
- [ ] "On this day" vises riktig
- [ ] Kun tidligere år inkluderes
- [ ] Click handler fungerer

---

## Fase 4: Navigation & Jump-to-date (Dag 6-7)

### Month/Year picker
```javascript
const JumpToDatePicker = ({ onDateSelect }) => {
  const [year, setYear] = useState(new Date().getFullYear())
  const [month, setMonth] = useState(new Date().getMonth())

  const years = Array.from({ length: 10 }, (_, i) => year - i)
  const months = [
    'Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni',
    'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'
  ]

  return (
    <div className="flex gap-3">
      <select
        value={month}
        onChange={(e) => setMonth(Number(e.target.value))}
        className="flex-1 p-2 rounded-lg glass"
      >
        {months.map((m, i) => (
          <option key={i} value={i}>{m}</option>
        ))}
      </select>

      <select
        value={year}
        onChange={(e) => setYear(Number(e.target.value))}
        className="flex-1 p-2 rounded-lg glass"
      >
        {years.map(y => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>

      <button
        onClick={() => onDateSelect(new Date(year, month))}
        className="px-4 py-2 bg-purple-600 rounded-lg"
      >
        Gå til
      </button>
    </div>
  )
}
```

### Testing Fase 4
- [ ] Jump to date fungerer
- [ ] Smooth scroll til valgt seksjon
- [ ] Performance optimization
- [ ] Final polish

---

# Feature 4: Grunnleggende Redigering

**Prioritet:** P1 | **Kompleksitet:** ⭐⭐⭐ | **Estimat:** 5-7 dager

## Funksjonsbeskrivelse
Canvas-basert editor for basic transformasjoner og filtre.

---

## Fase 1: Crop & Rotate (Dag 1-2)

### Filstruktur
```
src/features/editor/
├── components/
│   ├── PhotoEditor.jsx
│   ├── CropTool.jsx
│   ├── RotateTool.jsx
│   ├── FilterPanel.jsx
│   └── EditorToolbar.jsx
├── hooks/
│   └── usePhotoEditor.js
└── utils/
    ├── cropUtils.js
    └── filterUtils.js
```

### Crop implementation
```javascript
// src/features/editor/components/CropTool.jsx
import React, { useState, useRef } from 'react'

const CropTool = ({ image, onCropComplete }) => {
  const canvasRef = useRef(null)
  const [cropArea, setCropArea] = useState({
    x: 0,
    y: 0,
    width: 100,
    height: 100
  })

  const handleCrop = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')

    // Create new canvas with cropped area
    const croppedCanvas = document.createElement('canvas')
    croppedCanvas.width = cropArea.width
    croppedCanvas.height = cropArea.height
    const croppedCtx = croppedCanvas.getContext('2d')

    croppedCtx.drawImage(
      canvas,
      cropArea.x,
      cropArea.y,
      cropArea.width,
      cropArea.height,
      0,
      0,
      cropArea.width,
      cropArea.height
    )

    onCropComplete(croppedCanvas.toDataURL())
  }

  return (
    <div className="crop-tool">
      <canvas ref={canvasRef} />
      {/* Crop overlay UI */}
      <div
        className="crop-overlay"
        style={{
          left: cropArea.x,
          top: cropArea.y,
          width: cropArea.width,
          height: cropArea.height
        }}
      />
      <button onClick={handleCrop}>Beskjær</button>
    </div>
  )
}
```

### Testing Fase 1
- [ ] Crop fungerer
- [ ] Rotate 90° fungerer
- [ ] Preview oppdateres real-time

---

## Fase 2: Filters & Adjustments (Dag 3-4)

### CSS Filters
```javascript
// src/features/editor/utils/filterUtils.js
export const FILTERS = {
  none: '',
  grayscale: 'grayscale(100%)',
  sepia: 'sepia(100%)',
  vintage: 'sepia(50%) contrast(120%) brightness(110%)',
  cold: 'saturate(150%) hue-rotate(180deg)',
  warm: 'saturate(150%) hue-rotate(-30deg)',
}

export const applyFilter = (canvas, filterName) => {
  const ctx = canvas.getContext('2d')
  ctx.filter = FILTERS[filterName]
  ctx.drawImage(canvas, 0, 0)
  ctx.filter = 'none'
}
```

### Adjustments
```javascript
export const adjustBrightness = (canvas, amount) => {
  const ctx = canvas.getContext('2d')
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    data[i] += amount     // R
    data[i + 1] += amount // G
    data[i + 2] += amount // B
  }

  ctx.putImageData(imageData, 0, 0)
}
```

### Testing Fase 2
- [ ] Alle filtre fungerer
- [ ] Brightness adjustment fungerer
- [ ] Contrast adjustment fungerer
- [ ] Saturation adjustment fungerer

---

## Fase 3: Text Overlay (Dag 5)

```javascript
const TextOverlayTool = ({ canvas, onTextAdd }) => {
  const [text, setText] = useState('')
  const [fontSize, setFontSize] = useState(48)
  const [color, setColor] = useState('#ffffff')
  const [position, setPosition] = useState({ x: 50, y: 50 })

  const addText = () => {
    const ctx = canvas.getContext('2d')
    ctx.font = `${fontSize}px Arial`
    ctx.fillStyle = color
    ctx.fillText(text, position.x, position.y)
    onTextAdd()
  }

  return (
    <div className="text-overlay-tool">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Skriv tekst..."
      />
      <input
        type="number"
        value={fontSize}
        onChange={(e) => setFontSize(Number(e.target.value))}
      />
      <input
        type="color"
        value={color}
        onChange={(e) => setColor(e.target.value)}
      />
      <button onClick={addText}>Legg til</button>
    </div>
  )
}
```

### Testing Fase 3
- [ ] Text plasseres korrekt
- [ ] Font size fungerer
- [ ] Color picker fungerer

---

## Fase 4: Save & Integration (Dag 6-7)

### Save edited photo
```javascript
const saveEditedPhoto = async (canvas, originalPhoto, userId) => {
  // Convert to blob
  const blob = await new Promise(resolve => 
    canvas.toBlob(resolve, 'image/jpeg', 0.95)
  )

  // Upload to Storage
  const storage = getStorage()
  const filename = `edited_${originalPhoto.name}`
  const ref = storageRef(storage, `users/${userId}/photos/${filename}`)
  
  await uploadBytes(ref, blob)
  const url = await getDownloadURL(ref)

  // Save metadata
  const db = getFirestore()
  await addDoc(collection(db, `users/${userId}/photos`), {
    url,
    name: filename,
    albumId: originalPhoto.albumId,
    editedFrom: originalPhoto.id,
    createdAt: new Date().toISOString()
  })

  return url
}
```

### Testing Fase 4
- [ ] Save fungerer
- [ ] Original bevares (non-destructive)
- [ ] Edited version lagres korrekt
- [ ] Integration i AlbumPage/PhotoModal

---

# Feature 5: Samarbeids-album

**Prioritet:** P2 | **Kompleksitet:** ⭐⭐⭐⭐⭐ | **Estimat:** 10-14 dager

## Funksjonsbeskrivelse
Real-time collaborative albums med invitasjon-system.

---

## Fase 1: Invitasjon-system (Dag 1-3)

### Filstruktur
```
src/features/collaboration/
├── components/
│   ├── InviteModal.jsx
│   ├── CollaboratorsList.jsx
│   └── PendingInvites.jsx
├── hooks/
│   └── useCollaborators.js
└── services/
    └── invitationService.js
```

### Firestore struktur
```javascript
// /invitations/{inviteId}
{
  albumId: string,
  invitedBy: string,
  invitedEmail: string,
  invitedUserId: string (hvis registrert),
  status: 'pending' | 'accepted' | 'rejected' | 'expired',
  permissions: {
    canUpload: boolean,
    canDelete: boolean,
    canInvite: boolean
  },
  expiresAt: timestamp,
  createdAt: timestamp
}

// /albums/{albumId}/collaborators/{userId}
{
  role: 'owner' | 'editor' | 'viewer',
  joinedAt: timestamp,
  permissions: {
    canUpload: boolean,
    canDelete: boolean,
    canInvite: boolean
  }
}
```

### Invitation service
```javascript
// src/features/collaboration/services/invitationService.js
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { getFunctions, httpsCallable } from 'firebase/functions'

export const sendInvitation = async (albumId, email, permissions) => {
  const db = getFirestore()
  
  // Create invitation
  const inviteRef = await addDoc(collection(db, 'invitations'), {
    albumId,
    invitedBy: auth.currentUser.uid,
    invitedEmail: email,
    status: 'pending',
    permissions,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    createdAt: serverTimestamp()
  })

  // Send email (via Cloud Function)
  const functions = getFunctions()
  const sendInviteEmail = httpsCallable(functions, 'sendInviteEmail')
  await sendInviteEmail({
    inviteId: inviteRef.id,
    albumId,
    email
  })

  return inviteRef.id
}

export const acceptInvitation = async (inviteId, userId) => {
  const db = getFirestore()
  const inviteRef = doc(db, 'invitations', inviteId)
  const inviteDoc = await getDoc(inviteRef)
  
  if (!inviteDoc.exists()) throw new Error('Invitation not found')
  
  const invite = inviteDoc.data()
  
  // Add user to album collaborators
  await setDoc(
    doc(db, `albums/${invite.albumId}/collaborators`, userId),
    {
      role: 'editor',
      joinedAt: serverTimestamp(),
      permissions: invite.permissions
    }
  )

  // Update invitation status
  await updateDoc(inviteRef, {
    status: 'accepted',
    invitedUserId: userId,
    acceptedAt: serverTimestamp()
  })
}
```

### Testing Fase 1
- [ ] Invitasjon sendes
- [ ] Email mottas (test Cloud Function)
- [ ] Accept fungerer
- [ ] Reject fungerer
- [ ] Expiry håndteres

---

## Fase 2: Real-time Sync (Dag 4-7)

### Optimistic updates
```javascript
// src/features/collaboration/hooks/useCollaborativeAlbum.js
import { useEffect, useState } from 'react'
import { onSnapshot, collection } from 'firebase/firestore'

export const useCollaborativeAlbum = (albumId) => {
  const [photos, setPhotos] = useState([])
  const [collaborators, setCollaborators] = useState([])

  useEffect(() => {
    if (!albumId) return

    // Listen to photos
    const photosUnsubscribe = onSnapshot(
      collection(db, `albums/${albumId}/photos`),
      (snapshot) => {
        const updates = []
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added') {
            updates.push({ type: 'added', photo: change.doc.data() })
          }
          if (change.type === 'removed') {
            updates.push({ type: 'removed', photoId: change.doc.id })
          }
        })

        // Apply updates optimistically
        setPhotos(prev => {
          let newPhotos = [...prev]
          updates.forEach(update => {
            if (update.type === 'added') {
              newPhotos.push(update.photo)
            } else if (update.type === 'removed') {
              newPhotos = newPhotos.filter(p => p.id !== update.photoId)
            }
          })
          return newPhotos
        })
      }
    )

    // Listen to collaborators
    const collabUnsubscribe = onSnapshot(
      collection(db, `albums/${albumId}/collaborators`),
      (snapshot) => {
        setCollaborators(snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })))
      }
    )

    return () => {
      photosUnsubscribe()
      collabUnsubscribe()
    }
  }, [albumId])

  return { photos, collaborators }
}
```

### Conflict resolution
```javascript
// Hvis to brukere redigerer samtidig
const resolveConflict = (localChange, remoteChange) => {
  // Last-write-wins strategy
  if (remoteChange.timestamp > localChange.timestamp) {
    return remoteChange
  }
  return localChange
}
```

### Testing Fase 2
- [ ] Real-time updates fungerer
- [ ] Optimistic updates smooth
- [ ] Conflict resolution
- [ ] Multiple users samtidig

---

## Fase 3: Permissions & Security (Dag 8-10)

### Firestore Rules
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Albums
    match /albums/{albumId} {
      // Owner full access
      allow read, write: if request.auth.uid == resource.data.userId;
      
      // Collaborators read + conditional write
      allow read: if exists(/databases/$(database)/documents/albums/$(albumId)/collaborators/$(request.auth.uid));
      allow write: if exists(/databases/$(database)/documents/albums/$(albumId)/collaborators/$(request.auth.uid)) &&
        get(/databases/$(database)/documents/albums/$(albumId)/collaborators/$(request.auth.uid)).data.permissions.canUpload == true;
      
      // Photos subcollection
      match /photos/{photoId} {
        allow read: if exists(/databases/$(database)/documents/albums/$(albumId)/collaborators/$(request.auth.uid));
        allow create: if exists(/databases/$(database)/documents/albums/$(albumId)/collaborators/$(request.auth.uid)) &&
          get(/databases/$(database)/documents/albums/$(albumId)/collaborators/$(request.auth.uid)).data.permissions.canUpload == true;
        allow delete: if exists(/databases/$(database)/documents/albums/$(albumId)/collaborators/$(request.auth.uid)) &&
          get(/databases/$(database)/documents/albums/$(albumId)/collaborators/$(request.auth.uid)).data.permissions.canDelete == true;
      }
      
      // Collaborators subcollection
      match /collaborators/{userId} {
        allow read: if request.auth.uid == userId || 
          request.auth.uid == get(/databases/$(database)/documents/albums/$(albumId)).data.userId;
        allow write: if request.auth.uid == get(/databases/$(database)/documents/albums/$(albumId)).data.userId;
      }
    }
  }
}
```

### Testing Fase 3
- [ ] Owner kan alt
- [ ] Editor kan upload (hvis tillatt)
- [ ] Viewer kun read
- [ ] Permissions respekteres
- [ ] Security audit passed

---

## Fase 4: Notifications & Activity Feed (Dag 11-14)

### Notification system
```javascript
// /notifications/{notificationId}
{
  userId: string,
  type: 'invite' | 'new_photo' | 'comment',
  albumId: string,
  albumName: string,
  actorName: string,
  actorPhotoUrl: string,
  message: string,
  read: boolean,
  createdAt: timestamp
}

// Create notification on photo upload
const notifyCollaborators = async (albumId, photoId, uploadedBy) => {
  const collaborators = await getDocs(
    collection(db, `albums/${albumId}/collaborators`)
  )

  const batch = writeBatch(db)

  collaborators.forEach(collab => {
    if (collab.id !== uploadedBy) {
      const notifRef = doc(collection(db, `users/${collab.id}/notifications`))
      batch.set(notifRef, {
        type: 'new_photo',
        albumId,
        photoId,
        actorName: auth.currentUser.displayName,
        read: false,
        createdAt: serverTimestamp()
      })
    }
  })

  await batch.commit()
}
```

### Activity feed
```javascript
const ActivityFeed = ({ albumId }) => {
  const [activities, setActivities] = useState([])

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(
        collection(db, `albums/${albumId}/activity`),
        orderBy('createdAt', 'desc'),
        limit(50)
      ),
      (snapshot) => {
        setActivities(snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })))
      }
    )

    return unsubscribe
  }, [albumId])

  return (
    <div className="activity-feed">
      {activities.map(activity => (
        <div key={activity.id} className="activity-item">
          <img src={activity.actorPhotoUrl} className="w-8 h-8 rounded-full" />
          <div>
            <p>{activity.actorName} {activity.action}</p>
            <p className="text-sm opacity-70">
              {formatDistanceToNow(new Date(activity.createdAt))} ago
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
```

### Testing Fase 4
- [ ] Notifikasjoner sendes
- [ ] Activity feed oppdateres real-time
- [ ] Read/unread tracking
- [ ] Performance med mange notifikasjoner

---

## Cloud Functions (Required)

### Send invite email
```javascript
// functions/index.js
const functions = require('firebase-functions')
const admin = require('firebase-admin')
const nodemailer = require('nodemailer')

admin.initializeApp()

exports.sendInviteEmail = functions.https.onCall(async (data, context) => {
  const { inviteId, albumId, email } = data

  // Get album details
  const albumSnap = await admin.firestore().doc(`albums/${albumId}`).get()
  const album = albumSnap.data()

  // Send email
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: functions.config().email.user,
      pass: functions.config().email.password
    }
  })

  const inviteLink = `https://yourapp.com/invite/${inviteId}`

  await transporter.sendMail({
    from: 'PhotoVault <noreply@photovault.com>',
    to: email,
    subject: `You've been invited to ${album.name}`,
    html: `
      <h2>Album Invitation</h2>
      <p>${context.auth.token.name} has invited you to collaborate on "${album.name}"</p>
      <a href="${inviteLink}">Accept Invitation</a>
    `
  })

  return { success: true }
})
```

---

## Final Testing Checklist

### All Features
- [ ] Feature 1: QR Sharing ✓
- [ ] Feature 2: Collage Maker ✓
- [ ] Feature 3: Timeline View ✓
- [ ] Feature 4: Photo Editor ✓
- [ ] Feature 5: Collaborative Albums ✓

### Cross-feature testing
- [ ] All features work together
- [ ] No conflicts in routes/state
- [ ] Consistent UI/UX
- [ ] Mobile optimized
- [ ] Performance acceptable
- [ ] Security audit passed
- [ ] Documentation complete

---

**Status:** 🟢 Ready for sequential implementation  
**Start with:** Feature 1 (QR Sharing) - simplest first  
**End with:** Feature 5 (Collaboration) - most complex last
