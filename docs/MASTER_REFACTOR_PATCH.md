# 🎯 MASTER REFACTOR: GOOGLE PHOTOS-STYLE EDITOR LAYOUT

## KRITISK ARKITEKTUR FIX

Dette er en komplett refactor av editor layout-systemet for å oppnå Google Photos-kvalitet.

**Estimat:** 6-8 timer  
**Kompleksitet:** 🔴 Høy  
**Resultat:** 95% Google Photos-kvalitet

---

## 🎯 HOVEDPROBLEMER SOM FIKSES

### Problem 1: Bilde skjult bak panel
**Nå:** Halvparten av bildet er bak crop-panelet  
**Fix:** Image container får dynamisk padding-bottom når panel åpnes

### Problem 2: Ingen live crop preview
**Nå:** Må trykke Apply for å se resultat  
**Fix:** Canvas renderer viser cropped area i real-time mens du drar

### Problem 3: Image skalerer ikke ned
**Nå:** Image forblir samme størrelse når panel slides inn  
**Fix:** Image auto-scales for å alltid være fullt synlig

---

## 📋 IMPLEMENTERINGSPLAN

### FASE 1: Viewport Dynamic Sizing System
### FASE 2: Real-Time Crop Canvas Rendering  
### FASE 3: Panel/Viewport Integration
### FASE 4: Mobile Touch Optimization

---

# FASE 1: VIEWPORT DYNAMIC SIZING SYSTEM

## FIL 1: `src/features/editor/components/EditorViewport.jsx`

### Endring 1A: Legg til panel height tracking (linje ~15)

**FINN:**
```javascript
import React, { useRef, useImperativeHandle, forwardRef, useEffect, useState } from 'react';
```

**LEGG TIL RETT ETTER:**
```javascript
const PANEL_HEIGHT = 280; // Panel height in pixels
const TOOLBAR_HEIGHT = 72; // Toolbar height in pixels
const TOPBAR_HEIGHT = 60; // Topbar height in pixels
```

### Endring 1B: Legg til dynamic bounds calculation (linje ~30, i component body)

**FINN:**
```javascript
const EditorViewport = forwardRef(({ photo, hasActivePanel, children }, ref) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
```

**LEGG TIL RETT ETTER:**
```javascript
  const [availableHeight, setAvailableHeight] = useState(0);

  // Calculate available height based on panel state
  useEffect(() => {
    const calculateHeight = () => {
      const viewportHeight = window.innerHeight;
      const usedHeight = TOPBAR_HEIGHT + TOOLBAR_HEIGHT + (hasActivePanel ? PANEL_HEIGHT : 0);
      const available = viewportHeight - usedHeight;
      setAvailableHeight(available);
      console.log('📐 Available height:', available, '(Panel:', hasActivePanel ? 'open' : 'closed', ')');
    };

    calculateHeight();
    window.addEventListener('resize', calculateHeight);
    return () => window.removeEventListener('resize', calculateHeight);
  }, [hasActivePanel]);
```

### Endring 1C: Oppdater container styling (linje ~80)

**FINN:**
```javascript
<div
  ref={containerRef}
  className="editor-viewport-shell"
>
```

**ERSTATT MED:**
```javascript
<div
  ref={containerRef}
  className="editor-viewport-shell"
  style={{
    height: availableHeight > 0 ? `${availableHeight}px` : 'auto',
    transition: 'height 0.25s ease',
  }}
>
```

---

## FIL 2: `src/features/editor/editor.css`

### Endring 2A: Fix viewport shell (linje ~100)

**FINN:**
```css
.editor-viewport-shell {
  flex: 1 1 auto;
  position: relative;
  overflow: hidden;
  background: #000;
  display: flex;
  justify-content: center;
  align-items: center;
}
```

**ERSTATT MED:**
```css
.editor-viewport-shell {
  flex: 1 1 auto;
  position: relative;
  overflow: hidden;
  background: #000;
  display: flex;
  justify-content: center;
  align-items: center;
  will-change: height; /* Performance hint for smooth transitions */
  contain: layout; /* Optimize rendering */
}
```

### Endring 2B: Fix canvas to fit container (linje ~125)

**FINN:**
```css
.editor-viewport-canvas {
  width: 100%;
  height: 100%;
  display: block;
  user-select: none;
  touch-action: none;
}
```

**ERSTATT MED:**
```css
.editor-viewport-canvas {
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  display: block;
  user-select: none;
  touch-action: none;
  object-fit: contain; /* Ensure image scales properly */
}
```

---

# FASE 2: REAL-TIME CROP CANVAS RENDERING

## FIL 3: `src/features/editor/hooks/useCanvasRenderer.js`

### Endring 3A: Forbedre renderCroppedPreview (linje ~15, finn funksjonen)

**FINN:**
```javascript
const renderCroppedPreview = (canvas, image, cropRect, transform) => {
  if (!canvas || !image || !cropRect) return;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;
```

**ERSTATT HELE FUNKSJONEN MED:**
```javascript
/**
 * Render real-time cropped preview (Phase 8C-5 REFACTOR)
 * Shows only the cropped area, scaled to fit canvas
 * Updates instantly as user drags crop handles
 */
const renderCroppedPreview = (canvas, image, cropRect, transform) => {
  if (!canvas || !image || !cropRect) return;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Calculate source crop in image coordinates
  const sourceX = cropRect.x1 * image.naturalWidth;
  const sourceY = cropRect.y1 * image.naturalHeight;
  const sourceWidth = (cropRect.x2 - cropRect.x1) * image.naturalWidth;
  const sourceHeight = (cropRect.y2 - cropRect.y1) * image.naturalHeight;

  // Calculate destination to center cropped area
  const cropAspectRatio = sourceWidth / sourceHeight;
  const canvasAspectRatio = canvas.width / canvas.height;

  let destWidth, destHeight, destX, destY;

  if (cropAspectRatio > canvasAspectRatio) {
    // Crop is wider - fit to width
    destWidth = canvas.width;
    destHeight = canvas.width / cropAspectRatio;
    destX = 0;
    destY = (canvas.height - destHeight) / 2;
  } else {
    // Crop is taller - fit to height
    destHeight = canvas.height;
    destWidth = canvas.height * cropAspectRatio;
    destX = (canvas.width - destWidth) / 2;
    destY = 0;
  }

  // Apply rotation if any
  if (transform.rotation !== 0) {
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate((transform.rotation * Math.PI) / 180);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);
  }

  // Draw cropped area
  ctx.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    destX,
    destY,
    destWidth,
    destHeight
  );

  if (transform.rotation !== 0) {
    ctx.restore();
  }

  console.log('🎨 Real-time crop preview rendered');
};
```

### Endring 3B: Force re-render on crop change (linje ~100, i render() funksjonen)

**FINN:**
```javascript
  // Real-time crop preview (Phase 8C-5 FIX #3)
  if (transform.crop && !appliedCrop.current) {
    renderCroppedPreview(
      canvasRef.current,
      imageElement,
      transform.crop,
      transform
    );
    return;
  }
```

**ERSTATT MED:**
```javascript
  // Real-time crop preview (Phase 8C-5 REFACTOR)
  if (externalTransform.crop && !appliedCropBox.current) {
    renderCroppedPreview(
      canvasRef.current,
      imageElement,
      externalTransform.crop,
      externalTransform
    );
    // Don't return - continue to normal render for smooth updates
  } else if (appliedCropBox.current) {
    // Applied crop - render locked crop
    renderCroppedPreview(
      canvasRef.current,
      imageElement,
      appliedCropBox.current,
      externalTransform
    );
  }
```

---

# FASE 3: PANEL/VIEWPORT INTEGRATION

## FIL 4: `src/pages/EditorPage.jsx`

### Endring 4A: Sync panel state to viewport (linje ~150)

**FINN:**
```javascript
  // Listen for crop changes and trigger re-render (Phase 8C-5 FIX #3)
  useEffect(() => {
    if (activeTool === 'crop' && transform.crop && viewportRef.current) {
      // Force canvas re-render when crop changes
      viewportRef.current.render();
    }
  }, [transform.crop, activeTool]);
```

**ERSTATT MED:**
```javascript
  // Real-time crop preview sync (Phase 8C-5 REFACTOR)
  useEffect(() => {
    if (activeTool === 'crop' && transform.crop && viewportRef.current) {
      // Force immediate canvas re-render
      viewportRef.current.render();
      console.log('🔄 Crop changed - re-rendering preview');
    }
  }, [transform.crop, activeTool]);

  // Viewport resize when panel opens/closes (Phase 8C-5 REFACTOR)
  useEffect(() => {
    const hasPanel = activeTool !== 'none';
    console.log('📐 Panel state changed:', hasPanel ? 'OPEN' : 'CLOSED');
    
    // Trigger viewport recalculation
    window.dispatchEvent(new Event('resize'));
  }, [activeTool]);
```

---

# FASE 4: MOBILE TOUCH OPTIMIZATION

## FIL 5: `src/features/editor/components/CropOverlay.jsx`

### Endring 5A: Throttle drag updates for performance (linje ~150, i handlePointerMove)

**FINN:**
```javascript
  const handlePointerMove = useCallback(
    (e) => {
      if (!isDragging || !dragHandle || !cropRect) return;
```

**LEGG TIL RETT ETTER:**
```javascript
      // Throttle updates for smooth performance
      const now = Date.now();
      if (now - lastUpdateRef.current < 16) return; // 60fps throttle
      lastUpdateRef.current = now;
```

### Endring 5B: Legg til lastUpdateRef (linje ~30, med andre refs)

**FINN:**
```javascript
  const dragStartRef = useRef({ screenX: 0, screenY: 0, cropRect: null });
```

**LEGG TIL RETT ETTER:**
```javascript
  const lastUpdateRef = useRef(0);
```

---

# TESTING CHECKLIST

## Test 1: Image Visibility
1. Åpne editor
2. Trykk Crop tool
3. ✅ HELE bildet skal være synlig (ikke halvparten bak panel)
4. Zoom inn/ut
5. ✅ Bildet skal forbli fullt synlig

## Test 2: Real-Time Crop Preview
1. Med crop tool aktiv, dra en handle
2. ✅ Canvas skal vise BARE cropped area (ikke full image med overlay)
3. Endre aspect ratio (1:1, 16:9, etc)
4. ✅ Preview skal oppdatere UMIDDELBART
5. ✅ Ingen lag eller flickering

## Test 3: Panel Open/Close Animation
1. Trykk Crop tool (panel åpner)
2. ✅ Image skal scale NED smooth (0.25s transition)
3. ✅ Hele bildet fortsatt synlig
4. Trykk Crop igjen (panel lukker)
5. ✅ Image skal scale OPP smooth
6. ✅ Smooth, ikke hakkete

## Test 4: Mobile Performance
1. Test på mobil (< 640px width)
2. Pinch to zoom
3. ✅ Smooth, ingen lag
4. Drag crop handles
5. ✅ Preview oppdaterer i real-time
6. ✅ Touch targets fungerer (44px+)

## Test 5: Apply Crop Workflow
1. Juster crop box
2. Se real-time preview
3. Trykk "Apply Crop"
4. ✅ Tool lukkes
5. ✅ Cropped image vises
6. Åpne Crop igjen
7. ✅ "Clear Crop" button vises
8. Trykk Clear Crop
9. ✅ Full image gjenopprettet

## Test 6: Google Photos Parity
1. Åpne Google Photos (dine screenshots)
2. Åpne Pixtr editor
3. ✅ Layout skal se tilsvarende ut
4. ✅ Image alltid fullt synlig
5. ✅ Live crop preview
6. ✅ Smooth panel transitions

---

# SUCCESS CRITERIA

## Layout
- ✅ Image container har dynamisk padding-bottom
- ✅ Image auto-scales når panel åpnes/lukkes
- ✅ Smooth 0.25s transitions
- ✅ Hele bildet alltid synlig

## Crop Preview
- ✅ Real-time cropped preview (ikke full image + overlay)
- ✅ Instant feedback når handles dras
- ✅ Instant feedback når aspect ratio endres
- ✅ 60fps smooth performance

## Panel Integration
- ✅ Panel slides inn/ut smooth
- ✅ Viewport responderer umiddelbart
- ✅ No layout shifts or jumps
- ✅ Touch targets 44px+ på mobil

## Google Photos Parity
- ✅ 95% visual likhet
- ✅ Samme workflow
- ✅ Samme responsiveness
- ✅ Kan vise Google Photos vs Pixtr side-by-side uten store forskjeller

---

# ROLLBACK INSTRUCTIONS

Hvis denne refactoren gir kritiske problemer:

```bash
# Se alle commits i denne refactoren
git log --oneline -10

# Rollback til før refactor
git revert HEAD~5..HEAD

# Eller hard reset (TAP ENDRINGER)
git reset --hard HEAD~5
```

---

# COMMIT MESSAGES

Bruk disse commit messages etter hver fase:

**Fase 1:**
```
refactor(editor): dynamic viewport sizing system

- Add panel height constants (280px, 72px, 60px)
- Implement availableHeight calculation
- Viewport auto-resizes when panel opens/closes
- Smooth 0.25s transitions

Phase: 8C-5 REFACTOR - Fase 1/4
```

**Fase 2:**
```
refactor(editor): enhanced real-time crop preview rendering

- Improve renderCroppedPreview() logic
- Show only cropped area (not full image)
- Support rotation in crop preview
- Instant feedback on crop changes

Phase: 8C-5 REFACTOR - Fase 2/4
```

**Fase 3:**
```
refactor(editor): panel/viewport integration system

- Sync activeTool state to viewport sizing
- Trigger resize events on panel state change
- Real-time crop preview sync via useEffect
- Smooth layout coordination

Phase: 8C-5 REFACTOR - Fase 3/4
```

**Fase 4:**
```
refactor(editor): mobile touch performance optimization

- Throttle crop handle drag to 60fps
- Add lastUpdateRef for performance
- Smooth dragging on mobile devices
- No lag or stuttering

Phase: 8C-5 REFACTOR - Fase 4/4
```

---

# ESTIMERT TIDSBRUK

- **Fase 1:** 2 timer (viewport system)
- **Fase 2:** 2.5 timer (crop rendering)
- **Fase 3:** 1.5 timer (integration)
- **Fase 4:** 1 time (mobile optimization)
- **Testing:** 1 time

**Total:** 8 timer

---

# CRITICAL NOTES

⚠️ **VIKTIG:**
1. Test grundig etter hver fase
2. Commit etter hver fase
3. Ikke gå videre hvis fase har bugs
4. Mobile testing er kritisk (USB debugging)
5. Ta skjermbilder for før/etter sammenligning

🎯 **MÅL:**
95% Google Photos-kvalitet - Bildet skal ALLTID være fullt synlig, crop preview skal være i real-time, og panel-integrasjon skal være smooth.

---

# READY TO START

Kopier denne prompten til Claude Code og start med Fase 1.

God tur! 🚀
