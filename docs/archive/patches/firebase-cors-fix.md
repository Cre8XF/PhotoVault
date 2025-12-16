# FIREBASE STORAGE CORS FIX FOR EDITORPAGE

**Problem:** EditorPage viser svart skjerm fordi Firebase Storage bilder får CORS-feil når de lastes i canvas.

**Status:**
- ✅ Firebase Storage er i bruk (IKKE R2)
- ✅ Editor laster bilder via `getDownloadURL()`
- ❌ Canvas får CORS-feil
- ❌ `crossOrigin` attributt mangler eller feil satt

---

## 🔍 RIKTIG DIAGNOSE

### Problemet er i 2 deler:

1. **Firebase Storage CORS-regler** må tillate origin
2. **Image loading i EditorPage** må sette `crossOrigin="anonymous"`

---

## 🛠️ FIX 1: Firebase Storage CORS

### Fil: `cors.json` (i prosjektrot eller lag den)

```json
[
  {
    "origin": ["*"],
    "method": ["GET", "HEAD"],
    "maxAgeSeconds": 3600
  }
]
```

### Deploy CORS til Firebase Storage:

```bash
# Installer gsutil (Google Cloud SDK)
# https://cloud.google.com/storage/docs/gsutil_install

# Logg inn
gcloud auth login

# Deploy CORS config
gsutil cors set cors.json gs://YOUR-FIREBASE-BUCKET-NAME.appspot.com
```

**Finn bucket navn:**
- Firebase Console → Storage → Se URL
- Format: `gs://your-project-id.appspot.com`

---

## 🛠️ FIX 2: EditorPage Image Loading

### Fil: `src/pages/EditorPage.jsx`

**LEGG TIL dette i komponenten:**

```javascript
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useStore from '../store/useStore'
import { AlertCircle, Loader } from 'lucide-react'

const EditorPage = () => {
  const { photoId } = useParams()
  const navigate = useNavigate()
  
  const originalPhoto = useStore(state => 
    state.photos.find(p => p.id === photoId)
  )

  // ✅ Image loading state
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(null)

  // ✅ Preload image with CORS fix
  useEffect(() => {
    if (!originalPhoto?.url) return

    console.log('🔍 Preloading image:', originalPhoto.url)

    const img = new Image()
    
    // ✅ KRITISK: Sett crossOrigin BEFORE src
    img.crossOrigin = 'anonymous'
    
    img.onload = () => {
      console.log('✅ Image loaded successfully')
      setImageLoaded(true)
      setImageError(null)
    }
    
    img.onerror = (e) => {
      console.error('❌ Image load failed:', {
        url: originalPhoto.url,
        error: e
      })
      setImageError('Failed to load image. Check Firebase Storage CORS settings.')
      setImageLoaded(false)
    }

    // ✅ Set src AFTER crossOrigin
    img.src = originalPhoto.url
  }, [originalPhoto?.url])

  // ✅ Show error state
  if (imageError) {
    return (
      <div className="editor-world">
        <header className="editor-header">
          <button onClick={() => navigate(-1)}>← Back</button>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <p className="text-red-300 text-lg">{imageError}</p>
            <p className="text-white/60 text-sm mt-2">
              URL: {originalPhoto?.url?.substring(0, 60)}...
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-purple-600 rounded"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ✅ Show loading state
  if (!imageLoaded) {
    return (
      <div className="editor-world">
        <header className="editor-header">
          <button onClick={() => navigate(-1)}>← Back</button>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <Loader className="w-8 h-8 animate-spin text-purple-400" />
          <p className="text-white/60 ml-3">Loading image...</p>
        </div>
      </div>
    )
  }

  // ✅ Existing editor render code...
  return (
    <div className="editor-world">
      {/* Your existing editor UI */}
    </div>
  )
}

export default EditorPage
```

---

## 🛠️ FIX 3: Canvas Rendering (hvis du har en separat canvas component)

### Fil: `src/features/editor/hooks/useCanvasRenderer.js` eller lignende

**Hvis du laster bilder i canvas, sørg for:**

```javascript
const loadImageForCanvas = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    
    // ✅ KRITISK: crossOrigin BEFORE src
    img.crossOrigin = 'anonymous'
    
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load: ${url}`))
    
    img.src = url
  })
}

// Usage in canvas:
const img = await loadImageForCanvas(originalPhoto.url)
ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
```

---

## 🛠️ FIX 4: Collage Image Loader (du har allerede denne!)

### Fil: `src/features/collage/utils/imageLoader.js`

**Du har allerede fjernet crossOrigin her (bra!)**:

```javascript
export const loadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    // REMOVED: img.crossOrigin = 'anonymous' - causes Firebase Storage to fail

    img.onload = () => resolve(img)
    img.onerror = (error) => reject(new Error(`Failed to load: ${url}`))
    
    img.src = url
  })
}
```

**VIKTIG:** Dette fungerer for Collage fordi den IKKE bruker canvas med `toDataURL()` eller `toBlob()`.  
Men EditorPage MÅ ha `crossOrigin` hvis den eksporterer canvas!

---

## ⚠️ VIKTIG FORSKJELL

| Bruksområde | `crossOrigin` | Grunn |
|-------------|---------------|-------|
| **Collage** (display only) | ❌ NEI | Bruker bare `<img>` tags |
| **Editor** (canvas export) | ✅ JA | Må kunne bruke `canvas.toBlob()` |
| **PhotoGrid** (display) | ❌ NEI | Bare visning |

---

## ✅ TESTING

### 1. Test Firebase Storage CORS

```bash
# Test at CORS er deployed
curl -H "Origin: https://pixtr.cloud" \
  -H "Access-Control-Request-Method: GET" \
  -X OPTIONS \
  "https://firebasestorage.googleapis.com/v0/b/YOUR-BUCKET/o/test.jpg?alt=media"

# Forventet respons:
# access-control-allow-origin: *
# access-control-allow-methods: GET, HEAD
```

### 2. Test i browser

1. Åpne EditorPage
2. Åpne Console (F12)
3. Se etter:
   - ✅ `🔍 Preloading image: https://firebasestorage...`
   - ✅ `✅ Image loaded successfully`
   - ❌ **Ingen** CORS errors

### 3. Test canvas export (hvis du har Save-knapp)

```javascript
// I editor, når du skal save:
canvas.toBlob((blob) => {
  if (blob) {
    console.log('✅ Canvas export fungerte!')
  } else {
    console.error('❌ Canvas export feilet - CORS problem!')
  }
}, 'image/jpeg', 0.9)
```

---

## 🚨 VANLIGE FEIL

### Feil 1: `crossOrigin` satt ETTER `src`

```javascript
// ❌ FEIL:
img.src = url
img.crossOrigin = 'anonymous' // For sent!

// ✅ RIKTIG:
img.crossOrigin = 'anonymous'
img.src = url
```

### Feil 2: Glemmer å deploye CORS til Firebase

```bash
# Verifiser at CORS er deployed:
gsutil cors get gs://YOUR-BUCKET.appspot.com
```

### Feil 3: Feil bucket navn

```bash
# Finn riktig bucket navn:
# Firebase Console → Storage → Files tab → se URL
```

---

## 📋 SJEKKLISTE

Før du tester, sørg for:

- [ ] `cors.json` fil eksisterer i prosjektrot
- [ ] Firebase Storage CORS deployed (`gsutil cors set...`)
- [ ] EditorPage har `img.crossOrigin = 'anonymous'`
- [ ] `crossOrigin` settes **før** `img.src`
- [ ] Loading/error states lagt til
- [ ] Console viser ingen CORS errors

---

## 🎯 FORVENTET RESULTAT

**Før:**
- ❌ Svart skjerm i EditorPage
- ❌ CORS error i Console
- ❌ Kan ikke eksportere canvas

**Etter:**
- ✅ Bilde vises i EditorPage
- ✅ Ingen CORS errors
- ✅ Canvas export fungerer
- ✅ Loading spinner mens bilde laster

---

## 📞 NESTE STEG

Gi denne instruksjonen til Claude Code:

```
Les docs/FIREBASE_STORAGE_CORS_FIX.md og implementer:

1. Deploy CORS til Firebase Storage (jeg må gjøre dette manuelt)
2. Legg til crossOrigin i EditorPage image loading
3. Legg til loading/error states
4. Test at canvas export fungerer

VIKTIG: Dette er IKKE R2-migrering. Vi bruker Firebase Storage nå.
R2 er et senere steg.
```

---

**Implementert:** Firebase Storage CORS Fix  
**Dato:** 2024-12-16  
**For:** EditorPage canvas CORS-feil
