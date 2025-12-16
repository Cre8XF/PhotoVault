# PIXTR – A-PRIORITET TEKNISK ANALYSE
**Dato:** 28. november 2025  
**Type:** Detaljert årsaksanalyse (ingen patching)  
**Scope:** 8 kritiske issues som blokkerer launch

---

## 📋 INNHOLDSFORTEGNELSE

1. [A1: SearchPage Multiselect mangler funksjonalitet](#a1)
2. [A2: "Uten album"-bilder kan ikke flyttes](#a2)
3. [A3: Crop Aspect Ratio-knapper](#a3)
4. [A4: Desktop rendering av canvas](#a4)
5. [A5: AdjustPanel sliders mangler binding](#a5)
6. [A6: Rotate/Flip/Reset mangler implementasjon](#a6)
7. [A7: Ulik Editor-opplevelse fra AlbumPage vs SearchPage](#a7)
8. [A8: "See All"-routing mangler filter](#a8)
9. [Prioriteringsmatrise](#prioritering)

---

## <a name="a1"></a>🔴 A1: SearchPage Multiselect mangler funksjonalitet

### Symptom
Brukere kan velge flere bilder i SearchPage, men Move-knappen gir kun en alert() og gjør ingenting.

### Root Cause
**Fil:** `src/pages/SearchPage.jsx`  
**Linjer:** ~54-69

Debug-kode er etterlatt i production:
```javascript
onClick={(e) => {
  e.preventDefault()
  e.stopPropagation()
  console.log('🔵 Move button clicked!', {
    selectedCount: selectedPhotos.length,
    albumsCount: safeAlbums.length,
  })
  // Temporary debug alert
  alert(`Move clicked! ${selectedPhotos.length} photos selected`)
  setMoveOpen(true)
}}
```

**Problem:**
1. `alert()` blokkerer event loop
2. `setMoveOpen(true)` kalles ETTER alert (aldri nås pga refresh/block)
3. Faktisk `handleMovePhotos()` funksjon eksisterer (line ~157) men er ikke koblet opp

### Påvirkede filer
- `src/pages/SearchPage.jsx` (primary)
- `src/components/MoveModal.jsx` (sekundær - må motta selectedPhotos)

### Fix-strategi

**Steg 1:** Fjern debug-kode (lines 54-69)
```javascript
// ERSTATT MED:
onClick={(e) => {
  e.preventDefault()
  e.stopPropagation()
  setMoveOpen(true)
}}
```

**Steg 2:** Verifiser at MoveModal får riktige props
```javascript
<MoveModal
  isOpen={moveOpen}
  onClose={() => setMoveOpen(false)}
  albums={safeAlbums}
  selectedPhotos={selectedPhotos} // ← Sjekk at denne sendes
  onConfirm={handleMovePhotos}
/>
```

**Steg 3:** Sjekk at `handleMovePhotos` har riktig signatur
```javascript
const handleMovePhotos = async (targetAlbumId) => {
  // Skal iterere over selectedPhotos array
  // Oppdatere Firestore
  // Kalle refreshData()
}
```

### Dependencies
- Ingen andre issues avhenger av denne
- Kan fikses isolert

### Kompleksitet
⭐ **Lav** (15 minutter)

### Følgefeil
Ingen kjente følgefeil - isolert problem.

---

## <a name="a2"></a>🔴 A2: "Uten album"-bilder kan ikke flyttes

### Symptom
Brukere kan filtrere på "Uten album" og se bilder, men når de prøver å flytte disse til et album, feiler operasjonen stille.

### Root Cause
**Fil:** `src/pages/SearchPage.jsx`  
**Linjer:** ~157-175 (`handleMovePhotos` funksjon)

Firestore-query håndterer ikke `albumId: null` eller `albumId: 'noAlbum'` korrekt:

```javascript
const handleMovePhotos = async (targetAlbumId) => {
  try {
    const db = getFirestore()
    for (const id of selectedPhotos) {
      const docRef = doc(db, 'photos', id)
      await updateDoc(docRef, { albumId: targetAlbumId })
      // ← Problem: Hvis albumId var null, må det håndteres
    }
    await updateAlbumPhotoCount(targetAlbumId)
    // ...
  }
}
```

**Mulige årsaker:**
1. `selectedPhotos` array inneholder photo IDs, men photos mangler i Firestore
2. Photos har `albumId: null` i stedet for `albumId: 'unassigned'`
3. Security rules blokkerer update av null-album photos

### Påvirkede filer
- `src/pages/SearchPage.jsx` (primary)
- `src/firebase.js` (sekundær - updateAlbumPhotoCount må håndtere edge case)
- `firestore.rules` (må verifiseres)

### Fix-strategi

**Steg 1:** Debug logging i `handleMovePhotos`
```javascript
for (const id of selectedPhotos) {
  const docRef = doc(db, 'photos', id)
  const photoSnap = await getDoc(docRef)
  
  if (!photoSnap.exists()) {
    console.error(`Photo ${id} not found in Firestore`)
    continue
  }
  
  const currentAlbumId = photoSnap.data().albumId
  console.log(`Moving photo ${id} from ${currentAlbumId} to ${targetAlbumId}`)
  
  await updateDoc(docRef, { 
    albumId: targetAlbumId,
    updatedAt: new Date().toISOString()
  })
}
```

**Steg 2:** Håndter null/unassigned spesialcase
```javascript
// Hvis photo HAR null albumId, må vi også:
// 1. Fjerne fra "unassigned" collection (hvis det finnes)
// 2. Legge til i target album
// 3. Oppdatere både source og target counts
```

**Steg 3:** Verifiser Firestore rules
```javascript
// firestore.rules - sjekk at dette er tillatt:
match /photos/{photoId} {
  allow update: if request.auth != null 
    && request.auth.uid == resource.data.userId
    && request.resource.data.keys().hasAll(['albumId']); // ← Må tillate null → value
}
```

### Dependencies
- **Avhenger av:** A1 (må fikse Move-funksjonalitet først)
- Ingen andre issues avhenger av denne

### Kompleksitet
⭐⭐ **Medium** (30-45 minutter)

### Følgefeil
**Potensielle problemer:**
1. AlbumPage kan også ha samme issue med unassigned photos
2. Photo count på albums kan bli feil hvis move feiler halvveis
3. Refresh av SearchPage kan ikke vise oppdatert state

---

## <a name="a3"></a>🔴 A3: Crop Aspect Ratio-knapper mangler funksjon

### Symptom
Når bruker trykker på aspect ratio buttons (1:1, 4:5, etc.) i crop tool, skjer ingenting eller app krasjer.

### Root Cause
**Fil:** `src/features/editor/panels/PanelShell.jsx`  
**Linjer:** ~32-64 (Crop aspect ratio buttons)

**Mulige årsaker (må verifiseres):**

**Årsak 1: Import mangler**
```javascript
// Top of file - sjekk at denne linjen finnes:
import { applyCropAspectRatio, clampCropRect } from '../utils/cropTransformBridge';
```

**Årsak 2: Crop ikke initialisert**
Koden har guard (`if (crop)`), men crop kan være `undefined` når tool åpnes første gang:
```javascript
onClick={() => {
  const crop = transform.crop; // ← undefined hvis crop tool aldri brukt før
  if (crop) {
    const newCrop = applyCropAspectRatio(crop, 1, 'center');
    // ...
  }
  // ← Ingenting skjer hvis crop er undefined!
}}
```

**Årsak 3: Default crop ikke satt**
EditorPage initialiserer ikke default crop rect ved mount.

### Påvirkede filer
- `src/features/editor/panels/PanelShell.jsx` (primary)
- `src/pages/EditorPage.jsx` (må initialisere default crop)
- `src/features/editor/editorStore.js` (må ha default crop state)
- `src/features/editor/utils/cropTransformBridge.js` (må eksportere funksjonene)

### Fix-strategi

**Steg 1:** Verifiser at cropTransformBridge eksporterer korrekt
```javascript
// cropTransformBridge.js - sjekk at disse eksisterer:
export const applyCropAspectRatio = (cropRect, aspectRatio, anchor) => { ... }
export const clampCropRect = (cropRect) => { ... }
```

**Steg 2:** Initialiser default crop i EditorPage
```javascript
// EditorPage.jsx - i useEffect ved tool activation:
const handleToolSelect = useCallback((tool) => {
  if (tool === 'crop' && !transform.crop) {
    // Initialiser centered crop rect (80% av bilde)
    const defaultCrop = {
      x1: 0.1,
      y1: 0.1,
      x2: 0.9,
      y2: 0.9,
      aspectRatio: null
    };
    applyTransform('crop', defaultCrop);
  }
  setActiveTool(tool);
}, [transform.crop]);
```

**Steg 3:** Legg til fallback i PanelShell
```javascript
onClick={() => {
  let crop = transform.crop;
  
  // Fallback hvis crop ikke eksisterer
  if (!crop) {
    crop = {
      x1: 0.1, y1: 0.1, x2: 0.9, y2: 0.9,
      aspectRatio: null
    };
  }
  
  const newCrop = applyCropAspectRatio(crop, 1, 'center');
  const clampedCrop = clampCropRect(newCrop);
  applyTransform('crop', { ...clampedCrop, aspectRatio: 1 });
}}
```

### Dependencies
- Ingen andre issues avhenger av denne
- Kan fikses isolert

### Kompleksitet
⭐⭐ **Medium** (45 minutter - må teste alle aspect ratios)

### Følgefeil
**Potensielle problemer:**
1. CropOverlay kan ikke vise korrekt bounding box hvis crop er undefined
2. Apply Crop button kan ikke fungere hvis aspect ratio aldri satt
3. Canvas rendering kan feile hvis crop dimensions er ugyldige

---

## <a name="a4"></a>🔴 A4: Desktop rendering av canvas (verifisering)

### Symptom
Editor viser svart canvas på desktop (historisk problem - angivelig fikset).

### Root Cause (historisk)
**Fil:** `src/features/editor/components/EditorViewport.jsx`  
**Linjer:** Canvas rendering logic

**Mulige årsaker som ble fikset:**
1. Canvas dimensions var 0x0 på desktop
2. GPU rendering feilet pga manglende WebGL context
3. Image load timeout på høy-res bilder

### Påvirkede filer
- `src/features/editor/components/EditorViewport.jsx` (primary)
- `src/features/editor/hooks/useCanvasRenderer.js` (canvas rendering hook)
- `src/features/editor/utils/canvasUtils.js` (drawing utilities)

### Verifiseringsstrategi

**Steg 1:** Test på alle desktop browsers
```bash
# Chrome DevTools
1. Åpne editor med høy-res bilde (>4000px)
2. Sjekk canvas element i DOM
3. Verifiser dimensions: canvas.width, canvas.height
4. Sjekk console for errors

# Firefox
[Samme test]

# Safari
[Samme test]
```

**Steg 2:** Sjekk canvas initialization
```javascript
// useCanvasRenderer.js - verifiser at denne logikken fungerer:
const canvas = canvasRef.current;
const ctx = canvas.getContext('2d');

// Sjekk at dimensions settes korrekt:
canvas.width = containerWidth * devicePixelRatio;
canvas.height = containerHeight * devicePixelRatio;

// Sjekk at scale settes:
ctx.scale(devicePixelRatio, devicePixelRatio);
```

**Steg 3:** Test med ulike bilde-størrelser
- Small (1000x1000px)
- Medium (2000x2000px)
- Large (4000x4000px)
- Ultra (8000x8000px)

### Dependencies
- Ingen andre issues avhenger av denne
- Må verifiseres før launch, men blokkerer ikke andre fixes

### Kompleksitet
⭐ **Lav** (30 minutter testing)

### Følgefeil
**Hvis ikke fikset:**
1. Desktop brukere kan ikke bruke editor i det hele tatt
2. Crop preview vil ikke fungere
3. Save vil generere tom/svart fil

---

## <a name="a5"></a>🔴 A5: AdjustPanel sliders mangler binding

### Symptom
Brightness/Contrast/Saturation sliders vises, men når bruker drar dem skjer ingenting. Bildet endrer seg ikke.

### Root Cause
**Fil:** `src/features/editor/panels/AdjustPanel.jsx`  
**Linjer:** ~30-100 (slider components)

**Mulige årsaker:**

**Årsak 1: State ikke hentet fra editorStore**
```javascript
// AdjustPanel.jsx - mangler denne koden:
import useEditorStore from '../editorStore';

const AdjustPanel = ({ viewportRef }) => {
  const { transform, applyTransform } = useEditorStore();
  
  // ← Sjekk om transform.adjustments faktisk hentes
  const brightness = transform.adjustments?.brightness || 0;
  const contrast = transform.adjustments?.contrast || 0;
  const saturation = transform.adjustments?.saturation || 0;
}
```

**Årsak 2: onChange ikke koblet til applyTransform**
```javascript
<input
  type="range"
  value={brightness}
  onChange={(e) => {
    const value = parseFloat(e.target.value);
    // ← Mangler denne?
    applyTransform('adjustments', {
      ...transform.adjustments,
      brightness: value
    });
  }}
/>
```

**Årsak 3: viewportRef ikke trigget til re-render**
Selv om store oppdateres, må viewport vite at den skal re-render canvas:
```javascript
// ← Mangler useEffect i AdjustPanel?
useEffect(() => {
  if (viewportRef?.current) {
    viewportRef.current.render(); // Force re-render
  }
}, [transform.adjustments]);
```

### Påvirkede filer
- `src/features/editor/panels/AdjustPanel.jsx` (primary)
- `src/features/editor/editorStore.js` (må ha adjustments state)
- `src/features/editor/components/EditorViewport.jsx` (må listen til adjustments changes)
- `src/features/editor/hooks/useCanvasRenderer.js` (må apply filters til canvas)

### Fix-strategi

**Steg 1:** Verifiser editorStore struktur
```javascript
// editorStore.js - sjekk at dette eksisterer:
{
  transform: {
    adjustments: {
      brightness: 0,    // -100 to 100
      contrast: 0,      // -100 to 100
      saturation: 0,    // -100 to 100
      temperature: 0,   // -100 to 100
      sharpness: 0      // 0 to 100
    }
  }
}
```

**Steg 2:** Koble sliders til store
```javascript
// AdjustPanel.jsx
const handleAdjustChange = (key, value) => {
  applyTransform('adjustments', {
    ...transform.adjustments,
    [key]: value
  });
  
  // Trigger viewport re-render via ref method
  if (viewportRef?.current?.setAdjustValue) {
    viewportRef.current.setAdjustValue(key, value);
  }
};
```

**Steg 3:** Implementer setAdjustValue i EditorViewport
```javascript
// EditorViewport.jsx - expose method via useImperativeHandle
useImperativeHandle(ref, () => ({
  setAdjustValue: (key, value) => {
    // Update internal state
    // Trigger canvas re-render
    renderCanvas();
  },
  // ... other methods
}));
```

**Steg 4:** Apply filters i canvas rendering
```javascript
// useCanvasRenderer.js - i drawImage logic:
const applyAdjustments = (ctx, adjustments) => {
  const { brightness, contrast, saturation } = adjustments;
  
  // Use CSS filter (fast)
  ctx.filter = `
    brightness(${1 + brightness / 100})
    contrast(${1 + contrast / 100})
    saturate(${1 + saturation / 100})
  `;
};
```

### Dependencies
- **Avhenger av:** A6 (Reset button må også resette adjustments)
- Ingen andre issues avhenger av denne direkte

### Kompleksitet
⭐⭐⭐ **Høy** (1-1.5 timer - krever state flow + viewport sync)

### Følgefeil
**Potensielle problemer:**
1. Reset button (A6) vil ikke kunne resette adjustments hvis ikke implementert
2. Save funksjon må apply adjustments til final image
3. Undo/Redo må tracke adjustment changes
4. Performance kan bli dårlig hvis hver slider move trigger full canvas re-render

---

## <a name="a6"></a>🔴 A6: Rotate/Flip/Reset mangler implementasjon

### Symptom
Rotate, Flip og Reset buttons vises i editor, men gjør ingenting når bruker trykker på dem.

### Root Cause
**Fil:** `src/features/editor/panels/RotatePanel.jsx`  
**Linjer:** ~20-60 (button handlers)

**Årsak: Methods mangler i EditorViewport**

Buttons kaller metoder som ikke eksisterer:
```javascript
// RotatePanel.jsx
<button onClick={() => viewportRef.current.rotate90CW()}>
  Rotate Right
</button>
// ← viewportRef.current.rotate90CW er undefined!
```

### Påvirkede filer
- `src/features/editor/panels/RotatePanel.jsx` (primary - button handlers)
- `src/features/editor/components/EditorViewport.jsx` (må eksponere methods)
- `src/features/editor/editorStore.js` (må tracke rotation state)
- `src/features/editor/hooks/useCanvasRenderer.js` (må rendere rotert image)
- `src/pages/EditorPage.jsx` (Reset button i header)

### Fix-strategi

**Steg 1:** Implementer rotation state i editorStore
```javascript
// editorStore.js
{
  transform: {
    rotation: 0,      // 0, 90, 180, 270
    flipH: false,     // horizontal flip
    flipV: false,     // vertical flip
    // ... existing crop, adjustments, etc.
  }
}
```

**Steg 2:** Expose methods i EditorViewport
```javascript
// EditorViewport.jsx - useImperativeHandle
useImperativeHandle(ref, () => ({
  rotate90CW: () => {
    const newRotation = (rotation + 90) % 360;
    applyTransform('rotation', newRotation);
    renderCanvas();
  },
  rotate90CCW: () => {
    const newRotation = (rotation - 90 + 360) % 360;
    applyTransform('rotation', newRotation);
    renderCanvas();
  },
  flipHorizontal: () => {
    applyTransform('flipH', !flipH);
    renderCanvas();
  },
  flipVertical: () => {
    applyTransform('flipV', !flipV);
    renderCanvas();
  },
  resetTransform: () => {
    // Reset ALL transforms
    resetToOriginal(); // editorStore method
    renderCanvas();
  },
  resetAdjustValues: () => {
    // Reset only adjustments
    applyTransform('adjustments', {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      temperature: 0,
      sharpness: 0
    });
    renderCanvas();
  }
}));
```

**Steg 3:** Implementer rotation rendering i useCanvasRenderer
```javascript
// useCanvasRenderer.js - i renderCanvas():
const drawRotatedImage = (ctx, image, rotation, flipH, flipV) => {
  ctx.save();
  
  // Translate to center
  ctx.translate(canvas.width / 2, canvas.height / 2);
  
  // Apply rotation
  ctx.rotate((rotation * Math.PI) / 180);
  
  // Apply flips
  if (flipH) ctx.scale(-1, 1);
  if (flipV) ctx.scale(1, -1);
  
  // Draw image centered
  ctx.drawImage(
    image,
    -image.width / 2,
    -image.height / 2,
    image.width,
    image.height
  );
  
  ctx.restore();
};
```

**Steg 4:** Koble Reset button i EditorPage
```javascript
// EditorPage.jsx - header Reset button
<button
  onClick={() => {
    if (viewportRef.current) {
      viewportRef.current.resetTransform();
      // Also reset tool state
      setActiveTool('none');
    }
  }}
>
  <RotateCcw /> Reset
</button>
```

### Dependencies
- **Avhenger av:** A5 (adjustments må være implementert for at reset skal fungere fullt)
- **Påvirker:** A3 (crop må roteres hvis rotation endres)

### Kompleksitet
⭐⭐⭐⭐ **Meget Høy** (1.5-2 timer - kompleks canvas math + state sync)

### Følgefeil
**Kritiske problemer:**
1. **Crop må roteres med bildet** - hvis bruker cropper FØRST, så roterer, må crop rect også roteres
2. **Aspect ratio må flippes** - hvis bilde roteres 90°, må viewport dimensions oppdateres
3. **Save må apply ALL transforms** - rotation må bakes inn i final image
4. **Undo/Redo** må tracke rotation history
5. **Canvas dimensions** må recalculeres ved 90/270° rotation

**Dependency chain:**
```
Rotate → Crop må roteres → Aspect ratio må flippes → Canvas resize
        ↓
      Save må bake transforms
```

---

## <a name="a7"></a>🔴 A7: Ulik Editor-opplevelse fra AlbumPage vs SearchPage

### Symptom
Når bruker åpner editor fra AlbumPage vs SearchPage, opplevelsen er ulik:
- Forskjellig back-button behavior
- Forskjellig state (zoom, context)
- Forskjellig "next/previous" logic

### Root Cause
**Fil:** `src/pages/EditorPage.jsx`  
**Linjer:** Ingen standardisert context-håndtering

**Årsak: Manglende editorContext state**

EditorPage vet ikke HVOR brukeren kom fra:
```javascript
// EditorPage.jsx - current implementation
const { id } = useParams(); // Photo ID
const navigate = useNavigate();

// Back button:
const handleBack = () => {
  navigate(-1); // ← Generic - vet ikke hvor å gå
};
```

**Problem:**
1. `navigate(-1)` kan gå til feil side hvis bruker har kompleks history
2. Ingen context for "next/previous" photo logic
3. Ingen persistent state (zoom level, tool valgt)

### Påvirkede filer
- `src/pages/EditorPage.jsx` (primary)
- `src/state/store.js` (må legge til editorContext)
- `src/pages/AlbumPage.jsx` (må sende context ved navigasjon)
- `src/pages/SearchPage.jsx` (må sende context ved navigasjon)
- `src/pages/HomeDashboard.jsx` (hvis editor kan åpnes herfra også)

### Fix-strategi

**Steg 1:** Legg til editorContext i global store
```javascript
// store.js
{
  editorContext: {
    source: null,        // 'album' | 'search' | 'home' | 'favorites'
    sourceId: null,      // albumId hvis source = 'album'
    photoOrder: [],      // Array av photo IDs i rekkefølge
    currentIndex: 0,     // Index i photoOrder
    filters: null        // Active filters hvis source = 'search'
  },
  setEditorContext: (context) => set({ editorContext: context })
}
```

**Steg 2:** Sett context ved navigasjon fra AlbumPage
```javascript
// AlbumPage.jsx - når bruker klikker "Edit" på et bilde
const handleEditPhoto = (photo) => {
  // Sett context først
  setEditorContext({
    source: 'album',
    sourceId: albumId,
    photoOrder: albumPhotos.map(p => p.id),
    currentIndex: albumPhotos.findIndex(p => p.id === photo.id),
    filters: null
  });
  
  // Så naviger
  navigate(`/editor/${photo.id}`);
};
```

**Steg 3:** Sett context ved navigasjon fra SearchPage
```javascript
// SearchPage.jsx - tilsvarende
const handleEditPhoto = (photo) => {
  setEditorContext({
    source: 'search',
    sourceId: null,
    photoOrder: filteredPhotos.map(p => p.id),
    currentIndex: filteredPhotos.findIndex(p => p.id === photo.id),
    filters: activeFilters // Send med aktive filtre
  });
  
  navigate(`/editor/${photo.id}`);
};
```

**Steg 4:** Bruk context i EditorPage
```javascript
// EditorPage.jsx
const { editorContext, setEditorContext } = useStore();

const handleBack = () => {
  if (editorContext.source === 'album') {
    navigate(`/album/${editorContext.sourceId}`);
  } else if (editorContext.source === 'search') {
    navigate('/search', { 
      state: { filters: editorContext.filters } 
    });
  } else {
    navigate(-1); // Fallback
  }
  
  // Clear context
  setEditorContext(null);
};

const handleNextPhoto = () => {
  const nextIndex = editorContext.currentIndex + 1;
  if (nextIndex < editorContext.photoOrder.length) {
    const nextPhotoId = editorContext.photoOrder[nextIndex];
    setEditorContext({ ...editorContext, currentIndex: nextIndex });
    navigate(`/editor/${nextPhotoId}`, { replace: true });
  }
};
```

### Dependencies
- Ingen andre issues avhenger av denne
- Kan fikses isolert (men påvirker UX betydelig)

### Kompleksitet
⭐⭐⭐ **Høy** (2 timer - må oppdatere flere filer + teste alle flows)

### Følgefeil
**Potensielle problemer:**
1. PhotoPage (view-only) har samme problem - må også bruke context
2. SlideshowPage trenger tilsvarende logic
3. Deep linking (`/editor/abc123` direkte URL) fungerer ikke hvis context mangler
4. Browser back-button kan bryte context

---

## <a name="a8"></a>🔴 A8: "See All"-routing mangler filter

### Symptom
Når bruker trykker "See All" på HomePage (f.eks. ved "Recent Photos"), navigeres de til SearchPage, men ingen filter er forhåndssatt.

### Root Cause
**Fil:** `src/pages/HomeDashboard.jsx`  
**Linjer:** ~150-300 (estimated - "See All" button handlers)

**Årsak: Navigate uten state**
```javascript
// HomeDashboard.jsx - current (antagelig):
<button onClick={() => navigate('/search')}>
  See All
</button>

// ← Mangler state med filter-info
```

### Påvirkede filer
- `src/pages/HomeDashboard.jsx` (primary - alle "See All" buttons)
- `src/pages/SearchPage.jsx` (må lese location.state og applisere filter)

### Fix-strategi

**Steg 1:** Identifiser alle "See All" buttons i HomePage
```javascript
// HomeDashboard.jsx - finn alle varianter:
// 1. Recent Photos → See All
// 2. Favorites → See All
// 3. Albums → See All
// 4. AI Analyzed → See All
// ... etc
```

**Steg 2:** Send filter-state ved navigate
```javascript
// HomeDashboard.jsx - for hver "See All":

// Recent Photos
<button onClick={() => {
  navigate('/search', {
    state: {
      initialFilter: {
        sortBy: 'date',
        sortOrder: 'desc'
      }
    }
  });
}}>
  See All Recent
</button>

// Favorites
<button onClick={() => {
  navigate('/search', {
    state: {
      initialFilter: {
        favorites: true
      }
    }
  });
}}>
  See All Favorites
</button>

// AI Analyzed
<button onClick={() => {
  navigate('/search', {
    state: {
      initialFilter: {
        aiAnalyzed: true
      }
    }
  });
}}>
  See All AI
</button>
```

**Steg 3:** Appliser initial filter i SearchPage
```javascript
// SearchPage.jsx - i useEffect ved mount:
const location = useLocation();

useEffect(() => {
  if (location.state?.initialFilter) {
    const filter = location.state.initialFilter;
    
    // Merge med existing filters
    setActiveFilters(prev => ({
      ...prev,
      ...filter
    }));
    
    // Clear state så den ikke appliseres på hver re-render
    window.history.replaceState({}, document.title);
  }
}, [location]);
```

**Steg 4:** Verifiser at filter appliseres korrekt
```javascript
// SearchPage.jsx - i filteredPhotos memo:
const filteredPhotos = useMemo(() => {
  let results = [...safePhotos];
  
  // Apply active filters
  if (activeFilters.favorites) {
    results = results.filter(p => p.favorite);
  }
  
  if (activeFilters.aiAnalyzed) {
    results = results.filter(p => p.aiAnalyzed);
  }
  
  // Sort
  if (activeFilters.sortBy === 'date') {
    results.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return activeFilters.sortOrder === 'desc' 
        ? dateB - dateA 
        : dateA - dateB;
    });
  }
  
  return results;
}, [safePhotos, activeFilters]);
```

### Dependencies
- Ingen andre issues avhenger av denne
- Kan fikses isolert

### Kompleksitet
⭐⭐ **Medium** (45 minutter - må mappe alle "See All" buttons)

### Følgefeil
**Potensielle problemer:**
1. Andre pages (AlbumsPage, MorePage) kan ha "See All" buttons som også mangler filters
2. Deep linking (`/search?filter=favorites`) fungerer ikke - må implementeres separat
3. Browser back-button kan vise feil filter hvis state ikke clears

---

## <a name="prioritering"></a>📊 PRIORITERINGSMATRISE

### 1️⃣ Hvilket issue bør fikses FØRST?

**A8: "See All"-routing mangler filter**

**Hvorfor:**
- ⭐⭐ Medium kompleksitet (45 min)
- ✅ Ingen dependencies
- 🔓 Blokkerer ikke andre fixes
- 🎯 Høy bruker-impact (homepage er entry point)
- 🛡️ Lav risiko for følgefeil

**Rekkefølge anbefalt:**
```
1. A8 (See All routing)         → 45 min   [START HER]
2. A1 (Multiselect Move)        → 15 min   [Quick win]
3. A2 (Uten album move)         → 30 min   [Avhenger av A1]
4. A4 (Desktop canvas verify)   → 30 min   [Testing only]
5. A3 (Crop aspect ratio)       → 45 min   [Isolert fix]
6. A5 (Adjust sliders)          → 1.5 hr   [Kompleks men isolert]
7. A6 (Rotate/Flip/Reset)       → 2 hr     [Mest kompleks]
8. A7 (Editor context)          → 2 hr     [Viktig men ikke blocker]
```

---

### 2️⃣ Hvilket issue er MEST KOMPLISERT?

**A6: Rotate/Flip/Reset mangler implementasjon**

**Hvorfor:**
- ⭐⭐⭐⭐ Meget høy kompleksitet (1.5-2 timer)
- 🔗 Multiple dependencies (crop må roteres, aspect ratio må flippes)
- 🎨 Kompleks canvas mathematics (rotation transforms)
- 💾 State synchronization (viewport + store + save logic)
- 🐛 Mange potensielle følgefeil

**Nest mest komplisert:**
- **A5:** Adjust sliders (1-1.5 timer) - state flow + viewport sync
- **A7:** Editor context (2 timer) - mange filer påvirkes

---

### 3️⃣ Hvilke issues er AVHENGIGE av hverandre?

#### Dependency Graph:
```
A8 → (ingen dependencies)
     |
A1 → A2 (uten album move avhenger av A1)
     |
A4 → (ingen dependencies, men bør testes early)
     |
A3 → (ingen dependencies)
     |
A5 → A6 (Reset må kunne resette adjustments)
     ↓
A6 → A3 (Rotate må kunne rotere crop rect)
     ↓
A7 → (ingen dependencies, men påvirker all navigation)
```

#### Critical Path:
```
A1 → A2 → [Launch blocker removed]
          ↓
A5 → A6 → [Editor fully functional]
```

#### Independent Fixes:
- **A8** - kan fikses når som helst
- **A4** - kun testing, kan gjøres parallelt
- **A3** - isolert, kan fikses tidlig
- **A7** - viktig men ikke blocker for andre

---

## 🎯 ANBEFALT FIKSESTRATEGI

### Fase 1: Quick Wins (1.5 timer)
```
1. A8: See All routing       → 45 min
2. A1: Multiselect Move      → 15 min
3. A2: Uten album move       → 30 min
```
**Resultat:** SearchPage er fullt funksjonell

---

### Fase 2: Editor Foundation (2.5 timer)
```
4. A4: Desktop canvas verify → 30 min
5. A3: Crop aspect ratio     → 45 min
6. A5: Adjust sliders        → 1.5 hr
```
**Resultat:** Editor grunnfunksjonalitet OK

---

### Fase 3: Advanced Editor (2 timer)
```
7. A6: Rotate/Flip/Reset     → 2 hr
```
**Resultat:** Editor fullt funksjonell

---

### Fase 4: UX Polish (2 timer)
```
8. A7: Editor context        → 2 hr
```
**Resultat:** Konsistent navigation

---

## 🚀 TOTAL ESTIMAT

**Samlet fiksestid:** 8 timer (1 arbeidsdag)  
**Med testing:** 10 timer  
**Med deployment:** 11 timer

---

## ⚠️ KRITISKE NOTATER

### 🔴 Må fikses før launch:
- A1, A2 (SearchPage funksjonalitet)
- A3, A5, A6 (Editor kjernefunksjonalitet)

### 🟡 Bør fikses før launch:
- A7 (Editor context - UX)
- A8 (See All routing - UX)

### 🟢 Kan fikses post-launch:
- A4 (kun verifisering hvis desktop allerede fungerer)

---

**Neste steg:**  
Gi denne analysen til Claude Code med instruksjon:  
*"Fiks A8 først, deretter A1, A2, A3 i rekkefølge. Test mellom hver fix."*

---

**Rapport ferdigstilt:** 28. november 2025  
**Analysert av:** Claude (Sonnet 4.5)  
**Prosjekt:** Pixtr MVP A-prioritet issues
