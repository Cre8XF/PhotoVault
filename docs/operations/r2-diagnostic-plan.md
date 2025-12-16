# CLOUDFLARE R2 + DNS MIGRATION DIAGNOSTIC PLAN

## KONTEKST

PhotoVault/Pixtr har byttet fra:
- **FRA:** Firebase Storage + Netlify DNS  
- **TIL:** Cloudflare R2 + Cloudflare DNS

Dette har skapt multiple problemer:
- Bilder vises ikke i EditorWorld, PhotoPage, SearchPage
- Thumbnails mangler eller viser svart skjerm
- Video-grid feiler
- Intermittent CORS-feil
- DNS/SSL-konflikter

---

## FASE 1: CLOUDFLARE INFRASTRUKTUR

### 1.1 DNS CONFIGURATION

**Problem:** Cloudflare proxied DNS endrer SSL, caching, CORS-headers

**Sjekk:**
```bash
# Finn DNS-konfigurasjon (hvis tilgjengelig som tekstfil)
# Eller instruer Roger å eksportere fra Cloudflare dashboard
```

**Forventet korrekt setup:**
```
Type: A (eller CNAME)
Name: @ (eller subdomain)
Target: Netlify IP eller CNAME
Proxy status: Proxied (oransje sky)
SSL/TLS: Full (strict) 
```

**Mulige feil:**
- [ ] Noen records er "DNS only" (grå sky) mens andre er "Proxied" → inkonsistent SSL
- [ ] SSL/TLS mode er "Flexible" → HTTPS-loop
- [ ] Manglende AAAA record for IPv6
- [ ] Cloudflare caching blokkerer React app updates

**Fix-aksjon:**
1. Alle records MÅ være konsistente (enten alle proxied eller alle DNS-only)
2. SSL/TLS: Sett til "Full (strict)"
3. Page Rules: Bypass cache for `*.js`, `*.css`, `/index.html`

---

### 1.2 R2 BUCKET SETUP

**Problem:** R2 krever manuell CORS, access policy, og public URL

**Sjekk filer:**
- [ ] `cors.json` - CORS config
- [ ] `.env` - R2 credentials
- [ ] `firebase.js` eller storage config - URL format

**Forventet `cors.json`:**
```json
[
  {
    "origin": [
      "http://localhost:3000",
      "http://localhost:5173",
      "https://pixtr.cloud",
      "https://www.pixtr.cloud"
    ],
    "method": ["GET", "POST", "PUT", "DELETE", "HEAD", "OPTIONS"],
    "responseHeader": [
      "Content-Type",
      "Content-Length",
      "Content-Range",
      "Accept-Ranges",
      "Range",
      "Access-Control-Allow-Origin",
      "Access-Control-Expose-Headers",
      "Access-Control-Allow-Headers"
    ],
    "maxAgeSeconds": 3600
  }
]
```

**Kritiske headers som MANGLER i nåværende cors.json:**
- [ ] `Content-Range` - for video Range requests
- [ ] `Accept-Ranges` - for progressive loading
- [ ] `Access-Control-Expose-Headers` - for å eksponere custom headers

**R2 Bucket Policy (Public Read):**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::photovault-media/*"]
    }
  ]
}
```

**R2 Public URL format:**
```
https://<accountid>.r2.cloudflarestorage.com/<bucket>/<key>
```

ELLER med custom domain via Cloudflare Workers:
```
https://media.pixtr.cloud/<key>
```

**Fix-aksjon:**
1. Oppdater `cors.json` med fullstendig header-liste
2. Deploy CORS via Cloudflare API eller dashboard
3. Verifiser bucket policy tillater public read
4. Sjekk at public URL er riktig format

---

## FASE 2: UPLOAD & STORAGE LAYER

### 2.1 FIREBASE.JS - UPLOAD LOGIC

**Fil:** `src/firebase.js`

**Problem:** Firebase SDK brukes fortsatt, men skal peke til R2

**Sjekk:**
```javascript
// Linje ~406: Deteksjon av filtype
const isVideo = fileType.startsWith('video/')

// Linje ~415-430: Thumbnail upload
const thumbPath = `users/${userId}/thumbnails/${timestamp}_${thumbSafeName}`

// Linje ~440: Video upload
const storagePath = `users/${userId}/${folderPath}/${timestamp}_${safeName}`
```

**Kritiske sjekker:**
- [ ] Er `uploadBytes()` fortsatt Firebase, eller byttet til R2 SDK?
- [ ] Settes `Content-Type` header eksplisitt? (Linje ~445)
- [ ] Returnerer `getDownloadURL()` R2 URL eller Firebase URL?

**Forventet R2-implementasjon:**
```javascript
// RIKTIG: Sett Content-Type eksplisitt
await uploadBytes(storageRef, file, { 
  contentType: fileType,
  customMetadata: {
    userId: userId,
    albumId: albumId
  }
})
```

**Feil implementasjon:**
```javascript
// FEIL: Mangler Content-Type
await uploadBytes(storageRef, file) // ❌ R2 får ikke MIME-type
```

**Fix-aksjon:**
1. Verifiser at `Content-Type` settes i metadata
2. Sjekk at `getDownloadURL()` returnerer R2 URL, ikke Firebase
3. Test med både JPEG og MP4 for å verifisere MIME-types

---

### 2.2 USEPLOAD HOOK

**Fil:** `src/hooks/useUpload.js`

**Problem:** Video thumbnail generation kan feile, compress settings kan være feil for R2

**Sjekk linje 120-171:**
```javascript
// Thumbnail generation
const thumbnailBlob = await generateThumbnail(file)

// Compression
if (autoCompress && file.size > 50MB) {
  // Compress video
}
```

**Kritiske sjekker:**
- [ ] Genereres thumbnail som JPEG med riktig MIME? (Linje ~130)
- [ ] Er thumbnail-blob valid før upload?
- [ ] Håndteres video > 100MB riktig?

**Fix-aksjon:**
1. Legg til logging i `generateThumbnail()` for å verifisere output
2. Sjekk at thumbnail alltid har `type: 'image/jpeg'`
3. Test med 1MB, 50MB, 150MB video-filer

---

## FASE 3: REACT COMPONENTS

### 3.1 PHOTOGRID.JSX

**Fil:** `src/components/PhotoGrid.jsx`

**Problem:** Grid viser svart skjerm eller manglende thumbnails

**Sjekk linje 110-146:**
```javascript
// Video detection
photo.type === 'video'

// Thumbnail URL
photo.thumbnailUrl

// Fallback gradient
background: 'linear-gradient(...)'
```

**Kritiske sjekker:**
- [ ] Er `photo.thumbnailUrl` en R2 URL eller Firebase URL?
- [ ] Vises fallback gradient hvis thumbnailUrl mangler?
- [ ] Er `loading="lazy"` riktig implementert?
- [ ] Håndteres CORS-feil i img.onerror?

**Debug-tiltak:**
```javascript
// Legg til i PhotoGrid.jsx
useEffect(() => {
  photos.forEach(p => {
    console.log('Photo URL:', p.url, 'Thumbnail:', p.thumbnailUrl)
  })
}, [photos])
```

**Fix-aksjon:**
1. Logg alle URL-er for å sjekke format
2. Test CORS med `curl -I <thumbnail-url>`
3. Legg til error handler på `<img>` tags

---

### 3.2 EDITORPAGE.JSX

**Fil:** `src/pages/EditorPage.jsx`

**Problem:** Svart skjerm i editor, bilde lastes ikke

**Sjekk:**
```javascript
// Linje ~80: Photo data
const originalPhoto = useStore(state => state.photos.find(...))

// EditorViewport component
<EditorViewport photo={originalPhoto} />
```

**Kritiske sjekker:**
- [ ] Er `originalPhoto.url` en gyldig R2 URL?
- [ ] Vises loading state mens bilde hentes?
- [ ] Håndteres CORS-feil i viewport?

**Fix-aksjon:**
1. Legg til `console.log('Loading photo:', originalPhoto.url)` 
2. Sjekk Network tab i DevTools for CORS errors
3. Test med både Firebase og R2 URL for å isolere problemet

---

### 3.3 PHOTOPAGE.JSX

**Fil:** `src/pages/PhotoPage.jsx`

**Problem:** Fullscreen-visning viser ikke bilde

**Sjekk:**
```javascript
// Photo fetching
const photoId = useParams().photoId
const photo = useStore(state => state.photos.find(p => p.id === photoId))

// Image element
<img src={photo.url} />
```

**Kritiske sjekker:**
- [ ] Er `photo.url` definert og ikke null?
- [ ] Er URL-en en gyldig R2 URL?
- [ ] Håndteres 404-errors?

**Fix-aksjon:**
1. Legg til error boundary
2. Logg `photo` object komplett
3. Test med direkte URL i browser

---

### 3.4 SEARCHPAGE.JSX

**Fil:** `src/pages/SearchPage.jsx`

**Problem:** Søkeresultater viser ikke bilder

**Sjekk:**
```javascript
// Multiselect functionality
const [selectedPhotos, setSelectedPhotos] = useState([])

// Grid rendering
<PhotoGrid photos={filteredPhotos} />
```

**Kritiske sjekker:**
- [ ] Er `filteredPhotos` korrekt filtrert fra Firestore?
- [ ] Inneholder `filteredPhotos` R2 URLs eller Firebase URLs?
- [ ] Fungerer multiselect med nye URL-er?

**Fix-aksjon:**
1. Logg `filteredPhotos` array
2. Verifiser at alle `url` og `thumbnailUrl` er gyldige
3. Test søk → klikk → PhotoPage flyt

---

## FASE 4: STATE MANAGEMENT

### 4.1 ZUSTAND STORE

**Fil:** `src/state/store.js`

**Problem:** State kan inneholde mix av Firebase og R2 URLs

**Sjekk:**
```javascript
photos: [],
currentPhotoId: null,
photoOrder: [],
```

**Kritiske sjekker:**
- [ ] Inneholder `photos` array både gamle Firebase og nye R2 URLs?
- [ ] Oppdateres state riktig etter upload?
- [ ] Synkroniseres `photos` med Firestore?

**Fix-aksjon:**
1. Logg entire `photos` array ved mount
2. Sjekk om noen URLs er Firebase format
3. Implementer migration script hvis nødvendig

---

### 4.2 FIRESTORE DOCUMENTS

**Collection:** `photos`

**Problem:** Dokumenter kan ha gamle Firebase URLs

**Sjekk schema:**
```javascript
{
  url: "https://firebasestorage.googleapis.com/...", // ❌ Gammel
  thumbnailUrl: "https://firebasestorage.googleapis.com/...", // ❌ Gammel
  type: "video",
  metadata: {
    duration: 0,
    resolution: "1920x1080"
  }
}
```

**Riktig R2 schema:**
```javascript
{
  url: "https://<accountid>.r2.cloudflarestorage.com/photovault-media/...", // ✅
  thumbnailUrl: "https://<accountid>.r2.cloudflarestorage.com/photovault-media/...", // ✅
  type: "video",
  contentType: "video/mp4", // ✅ Eksplisitt MIME
  metadata: {
    duration: 0,
    resolution: "1920x1080"
  }
}
```

**Fix-aksjon:**
1. Query Firestore for alle dokumenter
2. Tell hvor mange har Firebase URLs vs R2 URLs
3. Skriv migration script hvis nødvendig

---

## FASE 5: TESTING PROTOCOL

### 5.1 CORS TESTING

```bash
# Test R2 bucket CORS
curl -I -H "Origin: https://pixtr.cloud" \
  https://<accountid>.r2.cloudflarestorage.com/<bucket>/test.jpg

# Forventet response:
# access-control-allow-origin: https://pixtr.cloud
# access-control-expose-headers: Content-Type, Content-Length

# Test OPTIONS preflight
curl -X OPTIONS -H "Origin: https://pixtr.cloud" \
  -H "Access-Control-Request-Method: GET" \
  https://<accountid>.r2.cloudflarestorage.com/<bucket>/test.jpg
```

---

### 5.2 IMAGE LOADING TEST

**Browser DevTools → Network tab:**
1. Upload nytt bilde
2. Sjekk Network tab:
   - [ ] Upload request til R2 (Status 200)
   - [ ] Response har `Content-Type: image/jpeg`
   - [ ] Thumbnail request til R2 (Status 200)
3. Gå til PhotoGrid
   - [ ] Thumbnail vises
   - [ ] Ingen CORS errors i Console
4. Klikk bilde → PhotoPage
   - [ ] Fullsize bilde lastes
   - [ ] Ingen 404 eller 403 errors

---

### 5.3 VIDEO LOADING TEST

1. Upload 10-sekund MP4 (under 50MB)
2. Sjekk Network tab:
   - [ ] Video upload til R2 (Status 200)
   - [ ] Thumbnail upload til R2 (Status 200)
   - [ ] Response har `Content-Type: video/mp4`
3. Gå til PhotoGrid
   - [ ] Video thumbnail vises
   - [ ] Play icon og duration badge vises
4. Klikk video → PhotoModal
   - [ ] Video starter automatisk
   - [ ] Range requests fungerer (206 Partial Content)

---

## FASE 6: PRIORITERT FIXING ORDER

### **A-PRIORITY (Blokkerer MVP)**

1. **CORS Configuration** (30 min)
   - Oppdater `cors.json` med fullstendig header-liste
   - Deploy til R2 bucket
   - Verifiser med `curl` test

2. **Content-Type Headers** (15 min)
   - Legg til eksplisitt `contentType` i `uploadBytes()`
   - Test med JPEG og MP4

3. **URL Format Validation** (20 min)
   - Logg alle URLs i PhotoGrid, EditorPage, PhotoPage
   - Verifiser R2 format
   - Fix hvis Firebase URLs fortsatt brukes

4. **DNS Proxy Settings** (15 min)
   - Sjekk at alle DNS records er konsistente
   - Sett SSL/TLS til "Full (strict)"
   - Legg til Page Rule for `/index.html` (no-cache)

---

### **B-PRIORITY (Viktig, men ikke blokkerende)**

5. **Thumbnail Generation** (30 min)
   - Verifiser at `generateThumbnail()` alltid returnerer valid JPEG blob
   - Legg til error handling

6. **Video Range Requests** (20 min)
   - Sjekk at R2 støtter `Range` header
   - Verifiser 206 Partial Content responses

7. **State Migration** (45 min)
   - Skriv script for å migrere Firebase URLs til R2 i Firestore
   - Backup før kjøring

---

### **C-PRIORITY (Nice-to-have)**

8. **Caching Optimization** (30 min)
   - Sett Cloudflare cache rules for media
   - `Cache-Control: public, max-age=31536000` for images/videos

9. **CDN Performance** (20 min)
   - Aktiver Cloudflare Image Optimization
   - Test loading speed før/etter

10. **Error Monitoring** (30 min)
    - Legg til Sentry eller lignende
    - Log CORS errors, 404s, 403s

---

## FASE 7: IMPLEMENTASJONSGUIDE FOR CLAUDE CODE

### **Step-by-Step Fix Process**

#### STEP 1: CORS FIX (KRITISK)

```bash
# 1. Les nåværende cors.json
cat cors.json

# 2. Oppdater med fullstendig header-liste
# (Se korrekt versjon i seksjon 1.2)

# 3. Deploy til R2 (Roger må gjøre dette manuelt via Cloudflare dashboard)
# ELLER via Cloudflare API:
curl -X PUT https://api.cloudflare.com/client/v4/accounts/{account_id}/r2/buckets/{bucket_name}/cors \
  -H "Authorization: Bearer {api_token}" \
  -H "Content-Type: application/json" \
  --data @cors.json
```

#### STEP 2: FIREBASE.JS FIX

```javascript
// src/firebase.js, linje ~445
// ORIGINAL (feil):
await uploadBytes(storageRef, file)

// FIX:
await uploadBytes(storageRef, file, { 
  contentType: fileType,
  customMetadata: {
    userId: userId,
    albumId: albumId || 'unassigned',
    uploadedAt: new Date().toISOString()
  }
})
```

#### STEP 3: PHOTOGRID.JSX FIX

```javascript
// src/components/PhotoGrid.jsx, legg til error handling

const [failedUrls, setFailedUrls] = useState(new Set())

const handleImageError = (photoId, url) => {
  console.error('Failed to load image:', url)
  setFailedUrls(prev => new Set(prev).add(photoId))
  
  // Fallback: vis placeholder
}

// I render:
<img 
  src={photo.thumbnailUrl || photo.url} 
  onError={() => handleImageError(photo.id, photo.url)}
  alt={photo.name}
/>
```

#### STEP 4: EDITORPAGE.JSX FIX

```javascript
// src/pages/EditorPage.jsx, legg til loading state

const [imageError, setImageError] = useState(null)

useEffect(() => {
  if (!originalPhoto?.url) return
  
  // Prefetch image
  const img = new Image()
  img.onload = () => console.log('✅ Image loaded:', originalPhoto.url)
  img.onerror = (e) => {
    console.error('❌ Image failed:', originalPhoto.url, e)
    setImageError('Failed to load image from R2')
  }
  img.src = originalPhoto.url
}, [originalPhoto?.url])
```

---

## FASE 8: VALIDATION CHECKLIST

### **Pre-Deployment Checklist**

- [ ] CORS config deployed og testet med `curl`
- [ ] Content-Type headers satt eksplisitt i upload
- [ ] URL format validert (alle R2, ingen Firebase)
- [ ] DNS records konsistente (alle proxied eller alle DNS-only)
- [ ] SSL/TLS satt til "Full (strict)"
- [ ] PhotoGrid viser bilder uten CORS errors
- [ ] EditorPage viser bilde uten svart skjerm
- [ ] PhotoPage viser fullsize bilde
- [ ] Video thumbnail genereres og lastes opp
- [ ] Video spiller av i PhotoModal
- [ ] SearchPage multiselect fungerer
- [ ] Ingen console errors relatert til CORS eller 404

### **Post-Deployment Monitoring**

- [ ] Sjekk Cloudflare Analytics for 4xx/5xx errors
- [ ] Monitor R2 bandwidth usage (skal være lavere enn Firebase)
- [ ] Verifiser at thumbnails caches av Cloudflare
- [ ] Test på iOS Safari (CORS kan oppføre seg annerledes)
- [ ] Test på Android Chrome
- [ ] Test med slow 3G for å verifisere progressive loading

---

## KONKLUSJON

Denne planen dekker alle mulige feilkilder ved migrering fra Firebase Storage + Netlify DNS til Cloudflare R2 + DNS.

**Nøkkelpunkter:**
1. **CORS** er den mest sannsynlige årsaken (manglende headers)
2. **Content-Type** må settes eksplisitt (R2 gjør ikke dette automatisk)
3. **URL format** må valideres (ingen Firebase URLs skal eksistere)
4. **DNS proxy** må være konsistent (alle records samme status)

**Estimert tidbruk:**
- A-Priority: 1.5 timer
- B-Priority: 1.5 timer  
- C-Priority: 1.5 timer
- **Total: ~4.5 timer for komplett fix**

**Anbefalt rekkefølge:**
1. Start med CORS (A1)
2. Deretter Content-Type headers (A2)
3. Deretter URL validation (A3)
4. Til slutt DNS/SSL (A4)

Etter A-priority er fikset, skal minst 80% av problemene være løst.
