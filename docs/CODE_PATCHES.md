# CODE PATCHES - CLOUDFLARE R2 CRITICAL FIXES

## PATCH 1: CORS.JSON (CRITICAL FIX)

**Fil:** `cors.json`  
**Problem:** Mangler kritiske headers for R2 access

### ORIGINAL (feil)
```json
[
  {
    "origin": [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
      "https://cre8web-photovault.netlify.app",
      "https://photovault-app-a0946.web.app",
      "https://photovault-app-a0946.firebaseapp.com",
      "https://pixtr.cloud",
      "https://www.pixtr.cloud"
    ],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"],
    "responseHeader": [
      "Authorization",
      "Content-Type",
      "x-goog-meta-*",
      "x-goog-acl",
      "x-goog-resumable",
      "x-goog-upload-protocol",
      "x-goog-upload-command",
      "x-goog-upload-offset",
      "x-goog-upload-content-type",
      "x-goog-upload-content-length",
      "Access-Control-Allow-Origin"
    ],
    "maxAgeSeconds": 3600
  }
]
```

### FIXED (korrekt)
```json
[
  {
    "origin": [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5174",
      "https://cre8web-photovault.netlify.app",
      "https://photovault-app-a0946.web.app",
      "https://photovault-app-a0946.firebaseapp.com",
      "https://pixtr.cloud",
      "https://www.pixtr.cloud"
    ],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"],
    "responseHeader": [
      "Authorization",
      "Content-Type",
      "Content-Length",
      "Content-Range",
      "Accept-Ranges",
      "Range",
      "ETag",
      "Last-Modified",
      "Cache-Control",
      "Access-Control-Allow-Origin",
      "Access-Control-Expose-Headers",
      "Access-Control-Allow-Headers",
      "Access-Control-Allow-Methods"
    ],
    "maxAgeSeconds": 3600
  }
]
```

**DIFF:**
```diff
       "Authorization",
       "Content-Type",
-      "x-goog-meta-*",
-      "x-goog-acl",
-      "x-goog-resumable",
-      "x-goog-upload-protocol",
-      "x-goog-upload-command",
-      "x-goog-upload-offset",
-      "x-goog-upload-content-type",
-      "x-goog-upload-content-length",
+      "Content-Length",
+      "Content-Range",
+      "Accept-Ranges",
+      "Range",
+      "ETag",
+      "Last-Modified",
+      "Cache-Control",
       "Access-Control-Allow-Origin"
+      "Access-Control-Expose-Headers",
+      "Access-Control-Allow-Headers",
+      "Access-Control-Allow-Methods"
```

**Deploy:** Roger må deploye via Cloudflare dashboard eller API

---

## PATCH 2: FIREBASE.JS - CONTENT-TYPE FIX (CRITICAL)

**Fil:** `src/firebase.js`  
**Linje:** ~445  
**Problem:** Content-Type ikke satt eksplisitt ved upload

### ORIGINAL (feil)
```javascript
// 2. Upload main file to Storage
const timestamp = Date.now()
const safeName = file.name.replace(/\s+/g, '_')
const folderPath = albumId || 'unassigned'
const storagePath = `users/${userId}/${folderPath}/${timestamp}_${safeName}`
const storageRef = ref(storage, storagePath)

await uploadBytes(storageRef, file, { contentType: fileType })
const downloadURL = await getDownloadURL(storageRef)
```

### FIXED (korrekt)
```javascript
// 2. Upload main file to Storage
const timestamp = Date.now()
const safeName = file.name.replace(/\s+/g, '_')
const folderPath = albumId || 'unassigned'
const storagePath = `users/${userId}/${folderPath}/${timestamp}_${safeName}`
const storageRef = ref(storage, storagePath)

// ✅ FIX: Sett Content-Type eksplisitt + custom metadata
await uploadBytes(storageRef, file, { 
  contentType: fileType || (isVideo ? 'video/mp4' : 'image/jpeg'),
  customMetadata: {
    userId: userId,
    albumId: albumId || 'unassigned',
    uploadedAt: new Date().toISOString(),
    originalName: file.name,
    fileSize: file.size.toString()
  }
})
const downloadURL = await getDownloadURL(storageRef)

console.log(`✅ ${isVideo ? 'Video' : 'Image'} uploaded with Content-Type: ${fileType}`)
```

**DIFF:**
```diff
-await uploadBytes(storageRef, file, { contentType: fileType })
+await uploadBytes(storageRef, file, { 
+  contentType: fileType || (isVideo ? 'video/mp4' : 'image/jpeg'),
+  customMetadata: {
+    userId: userId,
+    albumId: albumId || 'unassigned',
+    uploadedAt: new Date().toISOString(),
+    originalName: file.name,
+    fileSize: file.size.toString()
+  }
+})
 const downloadURL = await getDownloadURL(storageRef)
+console.log(`✅ ${isVideo ? 'Video' : 'Image'} uploaded with Content-Type: ${fileType}`)
```

---

## PATCH 3: FIREBASE.JS - THUMBNAIL UPLOAD FIX

**Fil:** `src/firebase.js`  
**Linje:** ~415-430  
**Problem:** Thumbnail upload mangler Content-Type

### ORIGINAL (feil)
```javascript
// 1. Upload thumbnail to Storage (if provided for video)
let thumbnailUrl = null
if (isVideo && thumbnailBlob) {
  try {
    const timestamp = Date.now()
    const thumbName = file.name.replace(/\.[^.]+$/, '_thumb.jpg')
    const thumbSafeName = thumbName.replace(/\s+/g, '_')
    const thumbPath = `users/${userId}/thumbnails/${timestamp}_${thumbSafeName}`
    const thumbRef = ref(storage, thumbPath)

    await uploadBytes(thumbRef, thumbnailBlob)
    thumbnailUrl = await getDownloadURL(thumbRef)
    console.log('✅ [Upload] Thumbnail uploaded:', thumbnailUrl)
  } catch (thumbError) {
    console.error('❌ [Upload] Thumbnail upload failed:', thumbError)
    // Continue without thumbnail
  }
}
```

### FIXED (korrekt)
```javascript
// 1. Upload thumbnail to Storage (if provided for video)
let thumbnailUrl = null
if (isVideo && thumbnailBlob) {
  try {
    const timestamp = Date.now()
    const thumbName = file.name.replace(/\.[^.]+$/, '_thumb.jpg')
    const thumbSafeName = thumbName.replace(/\s+/g, '_')
    const thumbPath = `users/${userId}/thumbnails/${timestamp}_${thumbSafeName}`
    const thumbRef = ref(storage, thumbPath)

    // ✅ FIX: Sett Content-Type eksplisitt for thumbnail
    await uploadBytes(thumbRef, thumbnailBlob, {
      contentType: 'image/jpeg',
      customMetadata: {
        userId: userId,
        parentVideo: file.name,
        generatedAt: new Date().toISOString()
      }
    })
    thumbnailUrl = await getDownloadURL(thumbRef)
    console.log('✅ [Upload] Thumbnail uploaded:', thumbnailUrl)
  } catch (thumbError) {
    console.error('❌ [Upload] Thumbnail upload failed:', thumbError)
    // Continue without thumbnail
  }
}
```

**DIFF:**
```diff
-    await uploadBytes(thumbRef, thumbnailBlob)
+    await uploadBytes(thumbRef, thumbnailBlob, {
+      contentType: 'image/jpeg',
+      customMetadata: {
+        userId: userId,
+        parentVideo: file.name,
+        generatedAt: new Date().toISOString()
+      }
+    })
```

---

## PATCH 4: PHOTOGRID.JSX - ERROR HANDLING

**Fil:** `src/components/PhotoGrid.jsx`  
**Linje:** ~110-146  
**Problem:** Ingen error handling for failed image loads

### ADD TO COMPONENT

```javascript
import React, { useState } from 'react'

const PhotoGrid = ({ photos, onPhotoClick, selectable, selectedPhotos, onSelectionChange }) => {
  // ✅ NEW: Track failed image loads
  const [failedImages, setFailedImages] = useState(new Set())

  // ✅ NEW: Handle image load errors
  const handleImageError = (photoId, url) => {
    console.error('❌ Failed to load image:', {
      photoId,
      url,
      type: photos.find(p => p.id === photoId)?.type
    })
    setFailedImages(prev => new Set(prev).add(photoId))
  }

  // ✅ NEW: Handle image load success
  const handleImageLoad = (photoId, url) => {
    console.log('✅ Image loaded:', { photoId, url })
  }

  return (
    <div className="photo-grid">
      {photos.map(photo => {
        const isFailed = failedImages.has(photo.id)
        const isVideo = photo.type === 'video'

        return (
          <div key={photo.id} className="photo-card">
            {isFailed ? (
              // ✅ NEW: Fallback for failed images
              <div className="photo-error-placeholder">
                <AlertCircle className="w-8 h-8 text-red-400" />
                <p className="text-xs text-red-300 mt-2">Failed to load</p>
              </div>
            ) : (
              <img
                src={photo.thumbnailUrl || photo.url}
                alt={photo.name}
                loading="lazy"
                onError={() => handleImageError(photo.id, photo.url)}
                onLoad={() => handleImageLoad(photo.id, photo.url)}
                className="photo-image"
              />
            )}
            
            {/* Rest of component */}
          </div>
        )
      })}
    </div>
  )
}
```

---

## PATCH 5: EDITORPAGE.JSX - PRELOAD IMAGE

**Fil:** `src/pages/EditorPage.jsx`  
**Linje:** ~80  
**Problem:** Ingen preload, ingen error handling

### ADD TO COMPONENT

```javascript
const EditorPage = () => {
  const { photoId } = useParams()
  const originalPhoto = useStore(state => 
    state.photos.find(p => p.id === photoId)
  )

  // ✅ NEW: Image loading state
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(null)

  // ✅ NEW: Preload image before rendering
  useEffect(() => {
    if (!originalPhoto?.url) return

    console.log('🔍 Preloading image:', originalPhoto.url)

    const img = new Image()
    
    img.onload = () => {
      console.log('✅ Image preloaded successfully')
      setImageLoaded(true)
      setImageError(null)
    }
    
    img.onerror = (e) => {
      console.error('❌ Image preload failed:', {
        url: originalPhoto.url,
        error: e
      })
      setImageError('Failed to load image. Check CORS settings.')
      setImageLoaded(false)
    }

    img.src = originalPhoto.url
  }, [originalPhoto?.url])

  // ✅ NEW: Show error state
  if (imageError) {
    return (
      <div className="editor-world">
        <header className="editor-header">
          <button onClick={handleBack}>Back</button>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <p className="text-red-300 text-lg">{imageError}</p>
            <p className="text-white/60 text-sm mt-2">URL: {originalPhoto?.url}</p>
          </div>
        </div>
      </div>
    )
  }

  // ✅ NEW: Show loading state
  if (!imageLoaded) {
    return (
      <div className="editor-world">
        <header className="editor-header">
          <button onClick={handleBack}>Back</button>
        </header>
        <div className="flex-1 flex items-center justify-center">
          <Loader className="w-8 h-8 animate-spin text-purple-400" />
          <p className="text-white/60 ml-3">Loading image...</p>
        </div>
      </div>
    )
  }

  // Existing render code...
}
```

---

## PATCH 6: PHOTOPAGE.JSX - ERROR BOUNDARY

**Fil:** `src/pages/PhotoPage.jsx`  
**Problem:** Ingen error handling for missing photo data

### ADD TO COMPONENT

```javascript
const PhotoPage = () => {
  const { photoId } = useParams()
  const navigate = useNavigate()
  
  const photo = useStore(state => 
    state.photos.find(p => p.id === photoId)
  )

  // ✅ NEW: Loading state
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(null)

  // ✅ NEW: Validate photo data
  useEffect(() => {
    if (!photo) {
      console.error('❌ Photo not found:', photoId)
      return
    }

    if (!photo.url) {
      console.error('❌ Photo has no URL:', photo)
      setImageError('Photo URL missing')
      return
    }

    console.log('✅ Photo data:', {
      id: photo.id,
      url: photo.url,
      type: photo.type,
      thumbnailUrl: photo.thumbnailUrl
    })

    // Preload image
    const img = new Image()
    img.onload = () => {
      setImageLoaded(true)
      setImageError(null)
    }
    img.onerror = () => {
      setImageError('Failed to load image')
    }
    img.src = photo.url
  }, [photo, photoId])

  // ✅ NEW: Handle missing photo
  if (!photo) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-red-300 text-lg">Photo not found</p>
          <p className="text-white/60 text-sm mt-2">ID: {photoId}</p>
          <button 
            onClick={() => navigate(-1)}
            className="mt-6 px-4 py-2 bg-purple-600 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  // Rest of component...
}
```

---

## TESTING COMMANDS

### Test CORS (køyr i terminal)
```bash
# Test GET request
curl -I -H "Origin: https://pixtr.cloud" \
  "https://YOUR_ACCOUNT.r2.cloudflarestorage.com/photovault-media/test.jpg"

# Expected headers:
# access-control-allow-origin: https://pixtr.cloud
# access-control-expose-headers: Content-Type, Content-Length, Content-Range
# content-type: image/jpeg

# Test OPTIONS preflight
curl -X OPTIONS \
  -H "Origin: https://pixtr.cloud" \
  -H "Access-Control-Request-Method: GET" \
  "https://YOUR_ACCOUNT.r2.cloudflarestorage.com/photovault-media/test.jpg"

# Expected response: 200 OK with CORS headers
```

### Test Image Upload (browser console)
```javascript
// Run this in browser console after upload
const testPhoto = useStore.getState().photos[0]
console.log('Test Photo:', {
  id: testPhoto.id,
  url: testPhoto.url,
  type: testPhoto.type,
  contentType: testPhoto.contentType,
  thumbnailUrl: testPhoto.thumbnailUrl
})

// Fetch image directly
fetch(testPhoto.url)
  .then(res => {
    console.log('Image fetch status:', res.status)
    console.log('Content-Type:', res.headers.get('content-type'))
    console.log('CORS headers:', {
      'access-control-allow-origin': res.headers.get('access-control-allow-origin'),
      'access-control-expose-headers': res.headers.get('access-control-expose-headers')
    })
  })
  .catch(err => console.error('Fetch failed:', err))
```

---

## DEPLOYMENT CHECKLIST

Før deploy:
- [ ] Alle patches implementert
- [ ] `cors.json` deployed til R2
- [ ] CORS testet med `curl`
- [ ] Upload testet i dev environment
- [ ] PhotoGrid viser bilder
- [ ] EditorPage viser bilde (ikke svart skjerm)
- [ ] PhotoPage fungerer
- [ ] Ingen console errors

Etter deploy:
- [ ] Test på production URL
- [ ] Test med iOS Safari
- [ ] Test med Android Chrome
- [ ] Monitor Cloudflare Analytics for 4xx/5xx

---

## ROLLBACK PROCEDURE

Hvis noe går galt:

```bash
# 1. Revert git commits
git revert HEAD~3..HEAD

# 2. Redeploy previous version
npm run build
netlify deploy --prod

# 3. Restore DNS to Netlify (Cloudflare dashboard)
# - Set DNS records to "DNS only" (grå sky)
# - Or point A record back to Netlify IP

# 4. Restore storage to Firebase (if needed)
# - Uncomment Firebase Storage code
# - Comment out R2 code
```

Total rollback tid: ~15 minutter
