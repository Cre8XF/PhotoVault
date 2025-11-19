# PHOTO EDITOR V2 - Quick Start Guide

**Start her for å implementere forbedringene**

---

## 🎯 TL;DR

**Hva vi bygger:**
- Mobile-first photo editor
- 11 adjustment sliders (vs 3 nå)
- 30+ filters med intensity control (vs 8 nå)
- Straighten tool
- Auto-enhance (one-tap)
- Drag-to-position for text
- Undo/redo stack
- Before/After comparison

**Tidsbruk:**
- A-prioritet (must-have): 3-4 uker
- B-prioritet (nice-to-have): 1.5-2 uker
- C-prioritet (advanced): 4-5 uker

---

## 📦 Fil til Claude Code

[PHOTO-EDITOR-ANALYSE-OG-FORSLAG.md](./PHOTO-EDITOR-ANALYSE-OG-FORSLAG.md)

**Send denne til Claude Code med:**

```
Les PHOTO-EDITOR-ANALYSE-OG-FORSLAG.md grundig.

Implementer Fase 1.1: Mobile-first layout refactor.

Følg strukturen:
- Top bar (Back, Title, Save)
- Canvas area (fullscreen)
- Bottom tabs (Crop, Adjust, Filters, More)

Start med å refaktorere PhotoEditor.jsx og EditorToolbar.jsx.
```

---

## 🚀 IMPLEMENTERINGSREKKEFØLGE

### Dag 1-4: Layout Refactor

**Mål:** Mobile-first layout med tabs i bunn

**Claude Code oppgave:**
```markdown
# Oppgave: Photo Editor Layout Refactor

## Mål
Refaktorer Photo Editor fra desktop sidebar til mobile-first bottom tabs.

## Filer å endre

1. `src/features/editor/components/PhotoEditor.jsx`
   - Endre layout til: TopBar → Canvas → BottomTabs
   - Flytt verktøy fra sidebar til tabs
   
2. `src/features/editor/components/EditorToolbar.jsx`
   - Konverter fra vertikal sidebar til horizontal tabs
   - Tabs: Crop, Adjust, Filters, More
   
3. `src/features/editor/editor.css`
   - Ny styling for mobile-first layout
   - Responsive breakpoints

## Layout struktur

```jsx
<div className="photo-editor">
  <TopBar>
    <BackButton />
    <Title>{photo.name}</Title>
    <SaveButton />
  </TopBar>
  
  <Canvas ref={canvasRef} />
  
  <BottomTabs>
    <Tab active={activeTool === 'crop'}>Crop</Tab>
    <Tab active={activeTool === 'adjust'}>Adjust</Tab>
    <Tab active={activeTool === 'filters'}>Filters</Tab>
    <Tab active={activeTool === 'more'}>More</Tab>
  </BottomTabs>
  
  {activeTool === 'crop' && <CropTool />}
  {activeTool === 'adjust' && <FilterPanel />}
  {activeTool === 'filters' && <FiltersTab />}
  {activeTool === 'more' && <MoreTab />}
</div>
```

## CSS Guidelines

- Canvas: `min-height: 60vh`
- BottomTabs: `position: fixed; bottom: 0; width: 100%`
- Tab height: `min-height: 44px` (touch-friendly)
- Spacing: `gap: 0.5rem` mellom tabs

## Testing

- [ ] Layout ser bra ut på mobile (< 768px)
- [ ] Layout ser bra ut på tablet (768-1024px)
- [ ] Layout ser bra ut på desktop (> 1024px)
- [ ] Tabs er touch-friendly
- [ ] Canvas tar maks plass
- [ ] Verktøy vises når tab er aktiv

## Success criteria

- ✅ Mobile-first layout fungerer
- ✅ Tabs i bunn (ikke sidebar)
- ✅ Canvas er stort og sentralt
- ✅ Responsive på alle skjermstørrelser
- ✅ Eksisterende funksjoner fungerer fortsatt

Commit message:
"refactor: mobile-first layout for photo editor"
```

**Forventet output:** PR med ny layout

---

### Dag 5-6: Straighten Tool

**Claude Code oppgave:**
```markdown
# Oppgave: Straighten Tool

## Mål
Legg til straighten/rotate slider i Crop tab.

## Ny fil

`src/features/editor/components/StraightenTool.jsx`

```jsx
const StraightenTool = ({ onStraighten, currentAngle = 0 }) => {
  const [angle, setAngle] = useState(currentAngle)
  
  const handleChange = (newAngle) => {
    setAngle(newAngle)
    onStraighten(newAngle)
  }
  
  return (
    <div className="straighten-tool">
      <label>Straighten</label>
      <input
        type="range"
        min="-45"
        max="45"
        step="0.1"
        value={angle}
        onChange={(e) => handleChange(parseFloat(e.target.value))}
      />
      <span>{angle.toFixed(1)}°</span>
      <button onClick={() => handleChange(0)}>Reset</button>
    </div>
  )
}
```

## Oppdater fil

`src/features/editor/utils/cropUtils.js`

Legg til:
```javascript
export const straightenImage = (canvas, angleDegrees) => {
  const angleRadians = (angleDegrees * Math.PI) / 180
  
  const cos = Math.abs(Math.cos(angleRadians))
  const sin = Math.abs(Math.sin(angleRadians))
  
  const newWidth = canvas.width * cos + canvas.height * sin
  const newHeight = canvas.width * sin + canvas.height * cos
  
  const rotatedCanvas = document.createElement('canvas')
  rotatedCanvas.width = newWidth
  rotatedCanvas.height = newHeight
  
  const ctx = rotatedCanvas.getContext('2d')
  ctx.translate(newWidth / 2, newHeight / 2)
  ctx.rotate(angleRadians)
  ctx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2)
  
  return rotatedCanvas
}
```

## Integrer i CropTool.jsx

Legg til StraightenTool mellom aspect ratio og crop area:
```jsx
<div className="crop-tools">
  <AspectRatioSelector />
  <StraightenTool onStraighten={handleStraighten} />
  <CropArea />
</div>
```

## Testing

- [ ] Slider fungerer -45° to +45°
- [ ] Real-time preview
- [ ] Reset button går til 0°
- [ ] Crop fungerer etter straighten
- [ ] Kvalitet bevares

Commit: "feat: add straighten tool to crop tab"
```

---

### Dag 7-11: Utvidede Adjustments

**Claude Code oppgave:**
```markdown
# Oppgave: Utvidede Adjustment Sliders

## Mål
Utvid fra 3 sliders til 11 sliders i Adjust tab.

## Filer å oppdatere

### 1. `src/features/editor/components/FilterPanel.jsx`

Legg til nye sliders:
```jsx
const adjustments = [
  { key: 'exposure', label: 'Exposure', min: -2, max: 2, step: 0.1, default: 0 },
  { key: 'highlights', label: 'Highlights', min: -100, max: 100, step: 1, default: 0 },
  { key: 'shadows', label: 'Shadows', min: -100, max: 100, step: 1, default: 0 },
  { key: 'brightness', label: 'Brightness', min: -100, max: 100, step: 1, default: 0 },
  { key: 'contrast', label: 'Contrast', min: 0.5, max: 2, step: 0.1, default: 1 },
  { key: 'saturation', label: 'Saturation', min: 0, max: 2, step: 0.1, default: 1 },
  { key: 'warmth', label: 'Warmth', min: -100, max: 100, step: 1, default: 0 },
  { key: 'tint', label: 'Tint', min: -100, max: 100, step: 1, default: 0 },
  { key: 'sharpen', label: 'Sharpen', min: 0, max: 100, step: 1, default: 0 },
  { key: 'vignette', label: 'Vignette', min: 0, max: 100, step: 1, default: 0 },
  { key: 'grain', label: 'Grain', min: 0, max: 100, step: 1, default: 0 }
]

const [adjustmentValues, setAdjustmentValues] = useState({
  exposure: 0,
  highlights: 0,
  shadows: 0,
  brightness: 0,
  contrast: 1,
  saturation: 1,
  warmth: 0,
  tint: 0,
  sharpen: 0,
  vignette: 0,
  grain: 0
})
```

### 2. `src/features/editor/utils/filterUtils.js`

Implementer nye adjustment funksjoner:

```javascript
export const applyAdvancedAdjustments = (sourceCanvas, adjustments) => {
  const {
    exposure,
    highlights,
    shadows,
    warmth,
    tint,
    sharpen,
    vignette,
    grain
  } = adjustments
  
  const adjustedCanvas = document.createElement('canvas')
  adjustedCanvas.width = sourceCanvas.width
  adjustedCanvas.height = sourceCanvas.height
  const ctx = adjustedCanvas.getContext('2d')
  
  // 1. Apply exposure (multiply brightness)
  ctx.filter = `brightness(${100 + exposure * 50}%)`
  ctx.drawImage(sourceCanvas, 0, 0)
  
  // 2. Get pixel data for advanced adjustments
  const imageData = ctx.getImageData(0, 0, adjustedCanvas.width, adjustedCanvas.height)
  const data = imageData.data
  
  // 3. Apply highlights/shadows (per-pixel)
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const luminance = (r + g + b) / 3
    
    // Highlights (affect bright pixels more)
    if (luminance > 128 && highlights !== 0) {
      const factor = (luminance - 128) / 127
      data[i] += highlights * factor
      data[i + 1] += highlights * factor
      data[i + 2] += highlights * factor
    }
    
    // Shadows (affect dark pixels more)
    if (luminance < 128 && shadows !== 0) {
      const factor = (128 - luminance) / 128
      data[i] += shadows * factor
      data[i + 1] += shadows * factor
      data[i + 2] += shadows * factor
    }
    
    // Warmth (add red/yellow, remove blue)
    if (warmth !== 0) {
      data[i] += warmth * 0.5     // Red
      data[i + 1] += warmth * 0.3 // Green
      data[i + 2] -= warmth * 0.5 // Blue
    }
    
    // Tint (green ↔ magenta)
    if (tint !== 0) {
      data[i] += tint * 0.3      // Red (magenta)
      data[i + 1] -= tint * 0.5  // Green
      data[i + 2] += tint * 0.3  // Blue (magenta)
    }
    
    // Clamp values
    data[i] = Math.max(0, Math.min(255, data[i]))
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1]))
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2]))
  }
  
  ctx.putImageData(imageData, 0, 0)
  
  // 4. Apply sharpen (if > 0)
  if (sharpen > 0) {
    ctx.filter = `contrast(${100 + sharpen}%)`
    const temp = ctx.getImageData(0, 0, adjustedCanvas.width, adjustedCanvas.height)
    ctx.putImageData(temp, 0, 0)
  }
  
  // 5. Apply vignette (radial gradient overlay)
  if (vignette > 0) {
    const gradient = ctx.createRadialGradient(
      adjustedCanvas.width / 2,
      adjustedCanvas.height / 2,
      0,
      adjustedCanvas.width / 2,
      adjustedCanvas.height / 2,
      Math.max(adjustedCanvas.width, adjustedCanvas.height) / 2
    )
    gradient.addColorStop(0, `rgba(0,0,0,0)`)
    gradient.addColorStop(1, `rgba(0,0,0,${vignette / 200})`)
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, adjustedCanvas.width, adjustedCanvas.height)
  }
  
  // 6. Apply grain (random noise)
  if (grain > 0) {
    const grainData = ctx.getImageData(0, 0, adjustedCanvas.width, adjustedCanvas.height)
    for (let i = 0; i < grainData.data.length; i += 4) {
      const noise = (Math.random() - 0.5) * grain
      grainData.data[i] += noise
      grainData.data[i + 1] += noise
      grainData.data[i + 2] += noise
    }
    ctx.putImageData(grainData, 0, 0)
  }
  
  return adjustedCanvas
}
```

## Testing

- [ ] Alle 11 sliders fungerer
- [ ] Real-time preview
- [ ] Reset button per slider
- [ ] Performance OK (< 100ms per adjustment)
- [ ] Kombinasjon av adjustments fungerer

Commit: "feat: add 8 new adjustment sliders (exposure, highlights, shadows, warmth, tint, sharpen, vignette, grain)"
```

---

### Dag 12-15: Auto-Enhance

**Claude Code oppgave:**
```markdown
# Oppgave: Auto-Enhance Feature

## Mål
One-tap photo enhancement basert på image analysis.

## Ny fil

`src/features/editor/utils/autoEnhance.js`

```javascript
/**
 * Analyze image and calculate optimal adjustments
 */
export const autoEnhance = (canvas) => {
  const ctx = canvas.getContext('2d')
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  
  // 1. Calculate histogram
  let totalBrightness = 0
  let darkPixels = 0
  let brightPixels = 0
  let pixelCount = data.length / 4
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]
    const luminance = (r + g + b) / 3
    
    totalBrightness += luminance
    if (luminance < 85) darkPixels++
    if (luminance > 170) brightPixels++
  }
  
  const avgBrightness = totalBrightness / pixelCount
  const darkRatio = darkPixels / pixelCount
  const brightRatio = brightPixels / pixelCount
  
  // 2. Calculate optimal adjustments
  const adjustments = {}
  
  // Exposure: aim for avg brightness around 128
  if (avgBrightness < 110) {
    adjustments.exposure = 0.5 // Increase
  } else if (avgBrightness > 145) {
    adjustments.exposure = -0.3 // Decrease
  } else {
    adjustments.exposure = 0
  }
  
  // Highlights: reduce if too many bright pixels
  if (brightRatio > 0.2) {
    adjustments.highlights = -30
  } else {
    adjustments.highlights = 0
  }
  
  // Shadows: lift if too many dark pixels
  if (darkRatio > 0.3) {
    adjustments.shadows = 30
  } else {
    adjustments.shadows = 10 // Slight lift always
  }
  
  // Contrast: increase slightly
  adjustments.contrast = 1.1
  
  // Saturation: slight boost
  adjustments.saturation = 1.15
  
  // Sharpness: moderate
  adjustments.sharpen = 15
  
  // Keep others at default
  adjustments.brightness = 0
  adjustments.warmth = 0
  adjustments.tint = 0
  adjustments.vignette = 0
  adjustments.grain = 0
  
  return adjustments
}
```

## Integrer i FilterPanel.jsx

Legg til Auto-Enhance button:
```jsx
<button
  onClick={handleAutoEnhance}
  className="auto-enhance-btn"
>
  <Sparkles className="w-4 h-4" />
  Auto Enhance
</button>

const handleAutoEnhance = () => {
  const canvas = canvasRef.current
  if (!canvas) return
  
  const optimalAdjustments = autoEnhance(canvas)
  setAdjustmentValues(optimalAdjustments)
  applyAdjustments(canvas, optimalAdjustments)
}
```

## Testing

- [ ] Auto-enhance fungerer på mørke bilder
- [ ] Auto-enhance fungerer på lyse bilder
- [ ] Auto-enhance fungerer på normal-eksponerte bilder
- [ ] Resultat ser bra ut (ikke over-processed)
- [ ] Button har loading state

Commit: "feat: add auto-enhance with intelligent image analysis"
```

---

## 📱 TESTING CHECKLIST

Etter hver feature:

### Funksjonell testing
- [ ] Feature fungerer på desktop
- [ ] Feature fungerer på mobile
- [ ] Feature fungerer på tablet
- [ ] Ingen console errors
- [ ] Loading states fungerer
- [ ] Error handling fungerer

### Visuell testing
- [ ] Dark mode ser bra ut
- [ ] Light mode ser bra ut
- [ ] Responsive på alle breakpoints
- [ ] Touch targets er > 44px
- [ ] Spacing er konsistent

### i18n testing
- [ ] Norsk fungerer
- [ ] Engelsk fungerer
- [ ] Språkbytte fungerer
- [ ] Ingen hardkodede strings

### Performance testing
- [ ] < 100ms responstid på adjustments
- [ ] Smooth scrolling
- [ ] Ingen lag ved slider-drag
- [ ] Image quality bevares

---

## 🚨 COMMON PITFALLS

### 1. Canvas quality loss
**Problem:** Bildet blir "pixelated" etter flere operations.

**Løsning:**
```javascript
// ALLTID bevare original canvas
const originalCanvas = loadImageToCanvas(imageUrl)

// Lag nye canvases for hver operation
const rotated = rotateCanvas(originalCanvas, angle)
const cropped = cropCanvas(rotated, area)
const adjusted = applyAdjustments(cropped, adjustments)

// IKKE gjenta operations på samme canvas
```

### 2. Memory leaks
**Problem:** Mange canvas-elementer ikke frigjort.

**Løsning:**
```javascript
// Cleanup old canvases
useEffect(() => {
  return () => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }
  }
}, [])
```

### 3. Slow adjustments
**Problem:** Real-time preview laggy.

**Løsning:**
```javascript
// Debounce slider changes
const debouncedApply = useDebouncedCallback((value) => {
  applyAdjustment(value)
}, 50)

// Eller: Apply på mouseup, ikke onChange
```

---

## 💬 KOMMUNIKASJON MED CLAUDE CODE

### Beste praksis

**✅ Bra prompt:**
```
Implementer Fase 1.1 fra PHOTO-EDITOR-ANALYSE-OG-FORSLAG.md.

Start med å lese PhotoEditor.jsx og EditorToolbar.jsx.
Endre layout til mobile-first med bottom tabs.

Testing:
- Verifiser at layout ser bra ut på mobile
- Sjekk at alle eksisterende features fungerer

Commit når ferdig.
```

**❌ Dårlig prompt:**
```
Fix photo editor
```

### Progresjon

**Steg 1:** Claude Code implementerer  
**Steg 2:** Du tester manuelt  
**Steg 3:** Rapporter tilbake  
**Steg 4:** Claude Code justerer  
**Steg 5:** Commit når perfect

---

## 📊 FREMDRIFT TRACKING

| Feature | Status | Dager | Commit |
|---------|--------|-------|--------|
| Layout refactor | ⏳ | 4 | - |
| Straighten tool | ⏳ | 2 | - |
| Extended adjustments | ⏳ | 5 | - |
| Auto-enhance | ⏳ | 4 | - |
| Filter intensity | ⏳ | 2 | - |
| Drag-to-position | ⏳ | 4 | - |

**Legend:**
- ⏳ Not started
- 🚧 In progress
- ✅ Complete
- ⚠️ Issues

---

## 🎯 SUCCESS CRITERIA

Photo Editor V2 er ferdig når:

- ✅ Mobile-first layout fungerer perfekt
- ✅ Alle 11 adjustment sliders fungerer
- ✅ Straighten tool fungerer
- ✅ Auto-enhance gir gode resultater
- ✅ Filter intensity slider fungerer
- ✅ Drag-to-position fungerer for text
- ✅ Ingen console errors
- ✅ Performance < 100ms per adjustment
- ✅ Cross-browser kompatibel
- ✅ i18n fungerer (NO + EN)
- ✅ Dark + light mode ser bra ut

---

**Klar til å starte? Send første oppgave til Claude Code! 🚀**
