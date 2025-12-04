# CLAUDE CODE PROMPT – EDITOR V2 STABILITY FIX

## CONTEXT
Pixtr Editor V2 har 3 kritiske bugs som blokkerer launch:
1. **Dobbel-rendering** - to bilder tegnes oppå hverandre (ghost layers)
2. **Crop fungerer ikke** - crop overlay vises ikke, preview feiler
3. **Transform instabilitet** - rotate/flip ikke konsistent mellom modes

## ROOT CAUSE ANALYSIS

**Problem 1: Dual-pipeline rendering**
- `EditorViewportV2.jsx` har to render pipelines:
  - TRANSFORM pipeline (når `hasTransforms === true`)
  - NO-TRANSFORM pipeline (når `hasTransforms === false`)
- `hasTransforms` check feiler ved init pga type mismatch
- **Resultat:** Begge pipelines tegner samtidig → dobbelt bilde

**Problem 2: Crop race condition**
- Viewport render kjører FØR CropMode setter `crop.isActive = true`
- `crop.isActive` er `false` når viewport første gang render
- **Resultat:** Crop clipping applies aldri

**Problem 3: workingImageUrl ikke initialisert**
- `EditorShellV2` setter `originalUrl` men ikke `workingImageUrl`
- `workingImageUrl` forblir `null`
- **Resultat:** Reset fungerer ikke, pipeline ustabil

## SOLUTION - APPLY THESE PATCHES

### PATCH 1: EditorShellV2.jsx
**File:** `src/features/editor-v2/EditorShellV2.jsx`  
**Line:** ~28-34

**REPLACE:**
```javascript
useEffect(() => {
  if (photo?.url) {
    setOriginalUrl(photo.url);
  }
}, [photo?.url, setOriginalUrl]);
```

**WITH:**
```javascript
useEffect(() => {
  if (photo?.url) {
    setOriginalUrl(photo.url);
    setWorkingImageUrl(photo.url);  // CRITICAL FIX
  }
}, [photo?.url, setOriginalUrl, setWorkingImageUrl]);
```

---

### PATCH 2: EditorViewportV2.jsx - Remove dual pipeline
**File:** `src/features/editor-v2/EditorViewportV2.jsx`  
**Line:** ~140-165

**REPLACE:**
```javascript
const hasTransforms =
  transform.rotate !== 0 || transform.flipH || transform.flipV

ctx.save()

if (hasTransforms) {
  drawTransformedImage(ctx, img, transform, containerWidth, containerHeight)
} else {
  // Original rendering logic (no transforms)
  const imgAspect = img.width / img.height
  const containerAspect = containerWidth / containerHeight

  let renderWidth, renderHeight, offsetX, offsetY

  if (imgAspect > containerAspect) {
    renderWidth = containerWidth
    renderHeight = containerWidth / imgAspect
    offsetX = 0
    offsetY = (containerHeight - renderHeight) / 2
  } else {
    renderWidth = containerHeight * imgAspect
    renderHeight = containerHeight
    offsetX = (containerWidth - renderWidth) / 2
    offsetY = 0
  }

  if (crop.isActive && crop.rect) {
    const { x1, y1, x2, y2 } = crop.rect
    const cropX = offsetX + x1 * renderWidth
    const cropY = offsetY + y1 * renderHeight
    const cropW = (x2 - x1) * renderWidth
    const cropH = (y2 - y1) * renderHeight

    ctx.beginPath()
    ctx.rect(cropX, cropY, cropW, cropH)
    ctx.clip()
  }

  ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight)
}

ctx.restore()
```

**WITH:**
```javascript
// UNIFIED PIPELINE - removes dual-pipeline completely
ctx.save()

// Calculate dimensions
const imgAspect = img.width / img.height
const containerAspect = containerWidth / containerHeight

let renderWidth, renderHeight, offsetX, offsetY

if (imgAspect > containerAspect) {
  renderWidth = containerWidth
  renderHeight = containerWidth / imgAspect
  offsetX = 0
  offsetY = (containerHeight - renderHeight) / 2
} else {
  renderWidth = containerHeight * imgAspect
  renderHeight = containerHeight
  offsetX = (containerWidth - renderWidth) / 2
  offsetY = 0
}

// Apply crop clipping (fix race condition with mode check)
if ((mode === 'crop' || crop.isActive) && crop.rect) {
  const { x1, y1, x2, y2 } = crop.rect
  const cropX = offsetX + x1 * renderWidth
  const cropY = offsetY + y1 * renderHeight
  const cropW = (x2 - x1) * renderWidth
  const cropH = (y2 - y1) * renderHeight

  ctx.beginPath()
  ctx.rect(cropX, cropY, cropW, cropH)
  ctx.clip()
}

// ALWAYS use transform pipeline (handles all cases)
drawTransformedImage(ctx, img, transform, containerWidth, containerHeight)

ctx.restore()
```

---

### PATCH 3: transformUtils.js - Handle no-transform case
**File:** `src/features/editor-v2/utils/transformUtils.js`  
**Line:** Start of `drawTransformedImage()`

**ADD AT START:**
```javascript
export function drawTransformedImage(ctx, img, transforms, canvasW, canvasH) {
  const { rotate = 0, flipH = false, flipV = false } = transforms;

  // Handle no-transform case explicitly
  if (rotate === 0 && !flipH && !flipV) {
    const imgAspect = img.width / img.height;
    const canvasAspect = canvasW / canvasH;
    
    let drawW, drawH;
    
    if (imgAspect > canvasAspect) {
      drawW = canvasW;
      drawH = canvasW / imgAspect;
    } else {
      drawW = canvasH * imgAspect;
      drawH = canvasH;
    }
    
    const offsetX = (canvasW - drawW) / 2;
    const offsetY = (canvasH - drawH) / 2;
    
    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
    return;  // EARLY RETURN - skip transform logic
  }

  // (rest of existing transform code continues...)
```

---

### PATCH 4: CropMode.jsx - Fix race condition
**File:** `src/features/editor-v2/modes/CropMode.jsx`  
**Line:** ~48-56

**REPLACE:**
```javascript
useEffect(() => {
  setCropActive(true);
  return () => {
    resetCrop();
  };
}, [setCropActive, resetCrop]);
```

**WITH:**
```javascript
useEffect(() => {
  setCropActive(true);
  
  // Force viewport re-render to show crop overlay
  if (viewportRef?.current?.renderCropPreview) {
    viewportRef.current.renderCropPreview();
  }
  
  return () => {
    resetCrop();
  };
}, [setCropActive, resetCrop, viewportRef]);
```

---

### PATCH 5: RotateMode.jsx - Ensure numeric type
**File:** `src/features/editor-v2/modes/RotateMode.jsx`  
**Line:** ~30-40

**REPLACE:**
```javascript
const handleRotateCW = () => {
  setRotate((Number(transform.rotate) + 90) % 360);
};

const handleRotateCCW = () => {
  setRotate((Number(transform.rotate) + 270) % 360);
};
```

**WITH:**
```javascript
const handleRotateCW = () => {
  const current = Number(transform.rotate) || 0;
  setRotate(current + 90);  // modeStore normalizes to [0,90,180,270]
};

const handleRotateCCW = () => {
  const current = Number(transform.rotate) || 0;
  setRotate(current + 270);  // modeStore normalizes to [0,90,180,270]
};
```

---

## TESTING AFTER PATCHES

Test sekvens:
1. Open Editor V2
2. Click "Crop" → ✅ Overlay should appear immediately, no double image
3. Click "Rotate" → ✅ Rotate should work, no double image
4. Click "Adjust" → ✅ Sliders should work, no double image
5. Click "Filters" → ✅ Filters should preview correctly
6. Click "Reset" → ✅ Should revert to original image

**Expected results:**
- ✅ No ghost layers / double rendering
- ✅ Crop overlay shows immediately
- ✅ All modes work consistently
- ✅ Pipeline stable across mode changes

---

## TECHNICAL SUMMARY

**Why this works:**
1. **Unified pipeline** - removes dual-pipeline logic that caused double rendering
2. **Race condition fix** - checks `mode === 'crop'` OR `crop.isActive` to handle timing
3. **Proper init** - `workingImageUrl` initialized alongside `originalUrl`
4. **Type safety** - `transform.rotate` always numeric
5. **No-transform optimization** - early return in `drawTransformedImage()` for performance

**Files modified:** 5  
**Lines changed:** ~80  
**Bugs fixed:** 3 critical A-priority bugs

---

## APPLY PATCHES NOW

Claude Code: Please apply all 5 patches above in sequence.
After applying, run test protocol and confirm all bugs are resolved.

**END OF PROMPT**
