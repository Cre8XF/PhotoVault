# Feature 1: QR-kode Album-deling

**Prioritet:** P0 (Must have)  
**Kompleksitet:** ⭐⭐ (Lav-medium)  
**Estimat:** 3-5 dager  
**Dependencies:** Ingen

---

## 🎯 Funksjonsbeskrivelse

Brukere kan generere en QR-kode for album som deles via scanning. Perfekt for:
- Bryllup - gjester scanner og laster opp bilder
- Konferanser - deltakere deler event-bilder
- Familiesamlinger - alle bidrar til felles album
- Profesjonelle fotografer - klient-gallerier

### User Flow
```
1. Bruker åpner et album
2. Klikker "Del album" knapp
3. Velger "Del via QR-kode"
4. QR-kode genereres med public link
5. Modal viser QR-kode + link
6. Bruker kan:
   - Vise QR-kode på skjerm
   - Laste ned QR-kode som bilde
   - Kopiere link
   - Sette utløpsdato (optional)
7. Andre scanner QR → åpner public album view
8. Public view: Se bilder (read-only eller upload hvis tillatt)
```

---

## 📁 Filstruktur

```
src/
├── features/
│   └── qr-sharing/
│       ├── components/
│       │   ├── QRShareModal.jsx         # Hovedmodal
│       │   ├── PublicAlbumView.jsx      # Public album viewer
│       │   └── QRCodeDisplay.jsx        # QR-kode komponent
│       ├── hooks/
│       │   └── usePublicAlbum.js        # Fetch public album data
│       ├── utils/
│       │   ├── generatePublicSlug.js    # Kort URL generator
│       │   └── qrUtils.js               # QR helpers
│       └── index.js                     # Exports
│
├── pages/
│   └── PublicAlbumPage.jsx              # Route: /share/:slug
│
└── components/
    └── ShareButton.jsx                   # Trigger button (i AlbumPage)
```

---

## 🔧 Fase 1: Core QR Generation (Dag 1)

### Mål
Generer QR-kode for album og vis i modal.

### Implementasjon

#### 1.1 Installer dependencies
```bash
npm install qrcode.react nanoid
```

#### 1.2 Opprett utility for slug generering
**Fil:** `src/features/qr-sharing/utils/generatePublicSlug.js`
```javascript
import { nanoid } from 'nanoid'

/**
 * Generate short, unique slug for public album
 * @param {string} albumName - Album name
 * @returns {string} - Unique slug (e.g., "summer-vacation-a3B9kL")
 */
export const generatePublicSlug = (albumName) => {
  // Sanitize album name
  const sanitized = albumName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 20)
  
  // Add unique identifier
  const uniqueId = nanoid(6)
  
  return `${sanitized}-${uniqueId}`
}

/**
 * Generate full public URL
 * @param {string} slug - Album slug
 * @returns {string} - Full URL
 */
export const getPublicAlbumUrl = (slug) => {
  const baseUrl = process.env.REACT_APP_PUBLIC_URL || window.location.origin
  return `${baseUrl}/share/${slug}`
}
```

#### 1.3 Opprett QR-kode display komponent
**Fil:** `src/features/qr-sharing/components/QRCodeDisplay.jsx`
```javascript
import React from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Download, Copy, Check } from 'lucide-react'

const QRCodeDisplay = ({ url, albumName, onDownload, onCopyLink }) => {
  const [copied, setCopied] = React.useState(false)

  const handleCopy = async () => {
    await onCopyLink()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col items-center gap-6 p-6">
      {/* QR Code */}
      <div className="bg-white p-6 rounded-2xl shadow-lg">
        <QRCodeSVG
          value={url}
          size={256}
          level="H"
          includeMargin={true}
          imageSettings={{
            src: "/logo192.png", // Optional: App logo i midten
            height: 48,
            width: 48,
            excavate: true,
          }}
        />
      </div>

      {/* Album name */}
      <div className="text-center">
        <h3 className="text-xl font-bold mb-2">{albumName}</h3>
        <p className="text-sm opacity-70">
          Scan QR-koden for å åpne albumet
        </p>
      </div>

      {/* URL display */}
      <div className="w-full glass p-4 rounded-xl">
        <p className="text-sm opacity-70 mb-2">Del-lenke:</p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={url}
            readOnly
            className="flex-1 bg-transparent text-sm"
          />
          <button
            onClick={handleCopy}
            className="ripple-effect p-2 hover:bg-white/10 rounded-lg transition"
            title="Kopier lenke"
          >
            {copied ? (
              <Check className="w-5 h-5 text-green-400" />
            ) : (
              <Copy className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 w-full">
        <button
          onClick={onDownload}
          className="ripple-effect flex-1 glass p-4 rounded-xl hover:bg-white/10 transition flex items-center justify-center gap-2"
        >
          <Download className="w-5 h-5" />
          <span>Last ned QR-kode</span>
        </button>
      </div>
    </div>
  )
}

export default QRCodeDisplay
```

#### 1.4 Testing Fase 1
```javascript
// Test cases:
✓ QR-kode genereres korrekt
✓ URL vises i input-felt
✓ Copy-knapp fungerer
✓ Copied-indikator vises i 2 sekunder
✓ QR-kode er scanbar (test med telefon)
✓ Responsive design (mobile + desktop)
```

**Acceptance Criteria:**
- [ ] QR-kode vises korrekt
- [ ] URL kan kopieres
- [ ] Design matcher app-theme
- [ ] Fungerer på mobile og desktop

---

## 🔧 Fase 2: Share Modal & Integration (Dag 2)

### Mål
Integrer QR-funksjonalitet i AlbumPage med modal.

### Implementasjon

#### 2.1 Opprett share modal
**Fil:** `src/features/qr-sharing/components/QRShareModal.jsx`
```javascript
import React, { useState, useEffect } from 'react'
import { X, Share2, Globe, Lock, Calendar } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import QRCodeDisplay from './QRCodeDisplay'
import { generatePublicSlug, getPublicAlbumUrl } from '../utils/generatePublicSlug'
import { doc, updateDoc, getFirestore } from 'firebase/firestore'

const QRShareModal = ({ isOpen, onClose, album, user }) => {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)
  const [publicUrl, setPublicUrl] = useState('')
  const [shareSettings, setShareSettings] = useState({
    isPublic: album.isPublic || false,
    allowUpload: false,
    expiresAt: null,
  })

  useEffect(() => {
    if (isOpen && album) {
      if (album.publicSlug) {
        // Album allerede delt
        setPublicUrl(getPublicAlbumUrl(album.publicSlug))
      } else {
        // Generer ny slug
        generateAndSaveSlug()
      }
    }
  }, [isOpen, album])

  const generateAndSaveSlug = async () => {
    setLoading(true)
    try {
      const slug = generatePublicSlug(album.name)
      const url = getPublicAlbumUrl(slug)
      
      // Lagre til Firestore
      const db = getFirestore()
      const albumRef = doc(db, `users/${user.uid}/albums/${album.id}`)
      
      await updateDoc(albumRef, {
        publicSlug: slug,
        isPublic: true,
        publicSettings: shareSettings,
        sharedAt: new Date().toISOString(),
      })

      setPublicUrl(url)
    } catch (error) {
      console.error('Error generating slug:', error)
      alert('Kunne ikke generere delingslenke')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadQR = () => {
    // Konverter SVG til PNG og last ned
    const svg = document.querySelector('#qr-code-svg')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    const img = new Image()
    const svgData = new XMLSerializer().serializeToString(svg)
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(svgBlob)
    
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)
      
      canvas.toBlob((blob) => {
        const link = document.createElement('a')
        link.download = `${album.name}-qr-code.png`
        link.href = URL.createObjectURL(blob)
        link.click()
      })
      
      URL.revokeObjectURL(url)
    }
    
    img.src = url
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl)
      return true
    } catch (error) {
      console.error('Copy failed:', error)
      return false
    }
  }

  const handleTogglePublic = async () => {
    setLoading(true)
    try {
      const db = getFirestore()
      const albumRef = doc(db, `users/${user.uid}/albums/${album.id}`)
      
      const newPublicState = !shareSettings.isPublic
      
      await updateDoc(albumRef, {
        isPublic: newPublicState,
        'publicSettings.allowUpload': shareSettings.allowUpload,
      })

      setShareSettings(prev => ({ ...prev, isPublic: newPublicState }))
    } catch (error) {
      console.error('Error toggling public:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl shadow-2xl border border-white/20
                    bg-gradient-to-b from-gray-800/90 to-gray-900/90 backdrop-blur-xl
                    max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600/20 rounded-lg">
              <Share2 className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-xl font-bold">Del album</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings */}
        <div className="p-6 border-b border-white/10 space-y-4">
          {/* Public toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-blue-400" />
              <div>
                <p className="font-medium">Offentlig tilgjengelig</p>
                <p className="text-sm opacity-70">
                  Alle med lenken kan se albumet
                </p>
              </div>
            </div>
            <label className="relative inline-block w-12 h-6">
              <input
                type="checkbox"
                checked={shareSettings.isPublic}
                onChange={handleTogglePublic}
                disabled={loading}
                className="sr-only peer"
              />
              <div className="w-full h-full bg-gray-600 rounded-full peer-checked:bg-purple-600 transition"></div>
              <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition peer-checked:translate-x-6"></div>
            </label>
          </div>

          {/* Allow upload toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-green-400" />
              <div>
                <p className="font-medium">Tillat opplasting</p>
                <p className="text-sm opacity-70">
                  Andre kan laste opp bilder
                </p>
              </div>
            </div>
            <label className="relative inline-block w-12 h-6">
              <input
                type="checkbox"
                checked={shareSettings.allowUpload}
                onChange={() => setShareSettings(prev => ({ 
                  ...prev, 
                  allowUpload: !prev.allowUpload 
                }))}
                disabled={!shareSettings.isPublic || loading}
                className="sr-only peer"
              />
              <div className="w-full h-full bg-gray-600 rounded-full peer-checked:bg-green-600 transition peer-disabled:opacity-50"></div>
              <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition peer-checked:translate-x-6"></div>
            </label>
          </div>
        </div>

        {/* QR Code Display */}
        {shareSettings.isPublic && publicUrl && (
          <QRCodeDisplay
            url={publicUrl}
            albumName={album.name}
            onDownload={handleDownloadQR}
            onCopyLink={handleCopyLink}
          />
        )}

        {/* Info */}
        {shareSettings.isPublic && (
          <div className="p-6 bg-blue-600/10 border-t border-white/10">
            <p className="text-sm opacity-70">
              💡 <strong>Tips:</strong> Print QR-koden og vis på event-lokalet, 
              eller del lenken i sosiale medier.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default QRShareModal
```

#### 2.2 Legg til "Del" knapp i AlbumPage
**Fil:** `src/pages/AlbumPage.jsx` (eksisterende fil)
```javascript
// Legg til imports
import { Share2 } from 'lucide-react'
import QRShareModal from '../features/qr-sharing/components/QRShareModal'

// Legg til state
const [isShareModalOpen, setShareModalOpen] = useState(false)

// Legg til knapp i header (ved siden av upload-knappen)
<button
  onClick={() => setShareModalOpen(true)}
  className="ripple-effect px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition flex items-center gap-2"
>
  <Share2 size={18} />
  Del album
</button>

// Legg til modal nederst i komponenten
<QRShareModal
  isOpen={isShareModalOpen}
  onClose={() => setShareModalOpen(false)}
  album={album}
  user={user}
/>
```

#### 2.3 Testing Fase 2
```javascript
// Test cases:
✓ "Del album" knapp vises i header
✓ Klikk åpner modal
✓ Modal viser QR-kode
✓ Toggle public on/off fungerer
✓ Toggle allow upload fungerer
✓ QR-kode oppdateres i Firestore
✓ ESC lukker modal
✓ Klikk utenfor lukker modal
✓ Last ned QR-kode fungerer
```

**Acceptance Criteria:**
- [ ] Modal integrert i AlbumPage
- [ ] Settings lagres i Firestore
- [ ] QR-kode genereres og vises
- [ ] Download fungerer

---

## 🔧 Fase 3: Public Album Viewer (Dag 3)

### Mål
Lag public view hvor eksterne brukere kan se album via QR/link.

### Implementasjon

#### 3.1 Opprett custom hook for public album
**Fil:** `src/features/qr-sharing/hooks/usePublicAlbum.js`
```javascript
import { useState, useEffect } from 'react'
import { getFirestore, collection, query, where, getDocs, onSnapshot } from 'firebase/firestore'

export const usePublicAlbum = (slug) => {
  const [album, setAlbum] = useState(null)
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!slug) return

    const fetchPublicAlbum = async () => {
      try {
        const db = getFirestore()
        
        // Find album by publicSlug
        const albumsRef = collection(db, 'albums')
        const q = query(albumsRef, where('publicSlug', '==', slug))
        const querySnapshot = await getDocs(q)

        if (querySnapshot.empty) {
          setError('Album ikke funnet')
          setLoading(false)
          return
        }

        const albumDoc = querySnapshot.docs[0]
        const albumData = { id: albumDoc.id, ...albumDoc.data() }

        // Check if album is public
        if (!albumData.isPublic) {
          setError('Dette albumet er ikke lenger offentlig tilgjengelig')
          setLoading(false)
          return
        }

        setAlbum(albumData)

        // Fetch photos from album
        // Note: Must adjust path based on your Firestore structure
        const photosRef = collection(db, `albums/${albumDoc.id}/photos`)
        
        // Real-time listener for photos
        const unsubscribe = onSnapshot(photosRef, (snapshot) => {
          const photosData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          setPhotos(photosData)
          setLoading(false)
        })

        return () => unsubscribe()

      } catch (err) {
        console.error('Error fetching public album:', err)
        setError('Kunne ikke laste album')
        setLoading(false)
      }
    }

    fetchPublicAlbum()
  }, [slug])

  return { album, photos, loading, error }
}
```

#### 3.2 Opprett PublicAlbumPage
**Fil:** `src/pages/PublicAlbumPage.jsx`
```javascript
import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { usePublicAlbum } from '../features/qr-sharing/hooks/usePublicAlbum'
import { ArrowLeft, Upload, Image as ImageIcon } from 'lucide-react'
import PhotoModal from '../components/PhotoModal'
import UploadModal from '../components/UploadModal'

const PublicAlbumPage = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { album, photos, loading, error } = usePublicAlbum(slug)
  const [photoModal, setPhotoModal] = useState({ open: false, index: 0 })
  const [uploadOpen, setUploadOpen] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="opacity-70">Laster album...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="p-4 bg-red-600/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Album ikke tilgjengelig</h2>
          <p className="opacity-70 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="ripple-effect px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-xl transition"
          >
            Gå til forsiden
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 glass-card border-b border-white/20 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-white/10 rounded-lg transition"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div>
              <h1 className="text-xl font-bold">{album.name}</h1>
              <p className="text-sm opacity-70">{photos.length} bilder</p>
            </div>
          </div>

          {album.publicSettings?.allowUpload && (
            <button
              onClick={() => setUploadOpen(true)}
              className="ripple-effect px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl transition flex items-center gap-2"
            >
              <Upload size={18} />
              Last opp
            </button>
          )}
        </div>
      </div>

      {/* Photos Grid */}
      <div className="container mx-auto px-4 py-6">
        {photos.length === 0 ? (
          <div className="text-center py-20">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="opacity-70">Ingen bilder i dette albumet ennå</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo, index) => (
              <div
                key={photo.id}
                onClick={() => setPhotoModal({ open: true, index })}
                className="relative aspect-square bg-black/10 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition"
              >
                <img
                  src={photo.url}
                  alt={photo.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Photo Modal */}
      {photoModal.open && (
        <PhotoModal
          photos={photos}
          currentIndex={photoModal.index}
          onClose={() => setPhotoModal({ open: false, index: 0 })}
          readOnly={true} // Disable editing in public view
        />
      )}

      {/* Upload Modal */}
      {album.publicSettings?.allowUpload && (
        <UploadModal
          isOpen={uploadOpen}
          onClose={() => setUploadOpen(false)}
          albumId={album.id}
          publicMode={true}
        />
      )}

      {/* Info banner */}
      <div className="fixed bottom-0 left-0 right-0 p-4 glass-card border-t border-white/20">
        <div className="container mx-auto flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Liker du PhotoVault?</p>
            <p className="text-xs opacity-70">Lag din egen konto gratis</p>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="ripple-effect px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl transition text-sm font-medium"
          >
            Registrer deg
          </button>
        </div>
      </div>
    </div>
  )
}

export default PublicAlbumPage
```

#### 3.3 Legg til route i App.js
**Fil:** `src/App.js` (eller routing-fil)
```javascript
import PublicAlbumPage from './pages/PublicAlbumPage'

// Add route (utenfor authentication guard)
<Route path="/share/:slug" element={<PublicAlbumPage />} />
```

#### 3.4 Testing Fase 3
```javascript
// Test cases:
✓ /share/:slug route fungerer
✓ Album lastes korrekt
✓ Bilder vises i grid
✓ Klikk på bilde åpner modal
✓ "Last opp" knapp vises hvis allowUpload = true
✓ "Last opp" knapp skjules hvis allowUpload = false
✓ Error state vises hvis album ikke finnes
✓ Error state vises hvis album ikke lenger er public
✓ "Registrer deg" banner vises nederst
✓ Fungerer uten å være innlogget
```

**Acceptance Criteria:**
- [ ] Public view fungerer uten login
- [ ] Bilder vises korrekt
- [ ] Upload fungerer hvis tillatt
- [ ] Error handling fungerer

---

## 🔧 Fase 4: Polish & Analytics (Dag 4-5)

### Mål
Finpuss, analytics tracking, og edge cases.

### Implementasjon

#### 4.1 Legg til analytics tracking
**Fil:** `src/features/qr-sharing/utils/analytics.js`
```javascript
// Simple analytics tracking (kan utvides senere)
export const trackQRGenerated = (albumId, userId) => {
  console.log('QR Generated:', { albumId, userId, timestamp: new Date() })
  // TODO: Send to analytics service (Google Analytics, Mixpanel, etc.)
}

export const trackPublicView = (slug, referrer) => {
  console.log('Public Album Viewed:', { slug, referrer, timestamp: new Date() })
  // TODO: Send to analytics
}

export const trackPublicUpload = (slug, photoCount) => {
  console.log('Public Upload:', { slug, photoCount, timestamp: new Date() })
  // TODO: Send to analytics
}
```

Integrer i relevante komponenter:
```javascript
// I QRShareModal.jsx
import { trackQRGenerated } from '../utils/analytics'

// Når QR genereres:
trackQRGenerated(album.id, user.uid)

// I PublicAlbumPage.jsx
import { trackPublicView } from '../../features/qr-sharing/utils/analytics'

useEffect(() => {
  if (album) {
    trackPublicView(slug, document.referrer)
  }
}, [album, slug])
```

#### 4.2 Legg til expiry date funksjonalitet
**Oppdater:** `src/features/qr-sharing/components/QRShareModal.jsx`
```javascript
// Legg til i shareSettings state:
const [shareSettings, setShareSettings] = useState({
  isPublic: album.isPublic || false,
  allowUpload: false,
  expiresAt: null, // NEW
})

// Legg til i settings UI (før QR code display):
<div className="flex items-center justify-between">
  <div className="flex items-center gap-3">
    <Calendar className="w-5 h-5 text-orange-400" />
    <div>
      <p className="font-medium">Utløpsdato</p>
      <p className="text-sm opacity-70">
        Automatisk deaktivering
      </p>
    </div>
  </div>
  <input
    type="date"
    min={new Date().toISOString().split('T')[0]}
    value={shareSettings.expiresAt || ''}
    onChange={(e) => setShareSettings(prev => ({ 
      ...prev, 
      expiresAt: e.target.value 
    }))}
    className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-sm"
  />
</div>
```

**Oppdater:** `usePublicAlbum.js` hook
```javascript
// Check expiry i fetchPublicAlbum:
if (albumData.publicSettings?.expiresAt) {
  const expiryDate = new Date(albumData.publicSettings.expiresAt)
  if (expiryDate < new Date()) {
    setError('Denne delingslenken har utløpt')
    setLoading(false)
    return
  }
}
```

#### 4.3 Oppdater Firestore Security Rules
**Fil:** `firestore.rules`
```javascript
// Allow reading public albums
match /users/{userId}/albums/{albumId} {
  // Existing rules...
  
  // Allow public read if album is public and not expired
  allow read: if resource.data.isPublic == true &&
    (resource.data.publicSettings.expiresAt == null ||
     resource.data.publicSettings.expiresAt.toDate() > request.time);
}

// Allow public photo read
match /users/{userId}/albums/{albumId}/photos/{photoId} {
  allow read: if get(/databases/$(database)/documents/users/$(userId)/albums/$(albumId)).data.isPublic == true;
}

// Allow public upload if allowed
match /users/{userId}/albums/{albumId}/photos/{photoId} {
  allow create: if get(/databases/$(database)/documents/users/$(userId)/albums/$(albumId)).data.isPublic == true &&
    get(/databases/$(database)/documents/users/$(userId)/albums/$(albumId)).data.publicSettings.allowUpload == true;
}
```

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

#### 4.4 Edge case handling

**Scenario 1: Album slettet mens noen ser på public view**
```javascript
// I usePublicAlbum.js hook
onSnapshot(albumRef, (snapshot) => {
  if (!snapshot.exists()) {
    setError('Dette albumet eksisterer ikke lenger')
    setAlbum(null)
  }
})
```

**Scenario 2: Album gjort privat mens noen ser på det**
```javascript
// Real-time listener fanger dette
onSnapshot(albumRef, (snapshot) => {
  const data = snapshot.data()
  if (!data.isPublic) {
    setError('Eieren har gjort dette albumet privat')
    setAlbum(null)
  }
})
```

**Scenario 3: QR-kode scanning fra ulike enheter**
- Test på iOS Safari
- Test på Android Chrome
- Test på desktop browsers
- Ensure responsive design fungerer

#### 4.5 UI Polish
- Smooth loading transitions
- Skeleton screens mens data laster
- Success animations når QR genereres
- Copy feedback (toast notification)
- Download progress indicator

#### 4.6 Testing Fase 4
```javascript
// Test cases:
✓ Analytics logger korrekt
✓ Expiry date respekteres
✓ Utløpt link viser error
✓ Album deletion håndteres gracefully
✓ Album privatisering stopper access
✓ Firestore rules fungerer
✓ QR scannes fra iOS
✓ QR scannes fra Android
✓ Alle browsers supportert
✓ Loading states vises
✓ Error states vises
✓ Success feedback tydelig
```

**Final Acceptance Criteria:**
- [ ] Analytics tracking fungerer
- [ ] Expiry date implementert
- [ ] Security rules oppdatert og testet
- [ ] Edge cases håndtert
- [ ] Cross-browser testing OK
- [ ] Mobile testing OK (iOS + Android)
- [ ] Performance godkjent
- [ ] No console errors
- [ ] UI polished og smooth

---

## 📊 Success Metrics

Etter lansering, track:

**Usage metrics:**
- Antall QR-koder generert per dag/uke
- Antall public views per QR
- Conversion rate (public viewer → registrert bruker)
- Gjennomsnittlig antall bilder i public albums
- Upload rate fra eksterne brukere

**Technical metrics:**
- QR generation time (target: <100ms)
- Page load time for public view (target: <2s)
- Error rate (target: <1%)
- Bounce rate på public view

---

## 🐛 Troubleshooting

### Problem: QR-kode ikke scanbar
**Solution:** 
- Øk error correction level til "H"
- Sjekk contrast ratio (QR må være høy kontrast)
- Test size (minimum 200x200px)

### Problem: Public view viser 404
**Solution:**
- Verifiser route konfigurert riktig
- Sjekk at slug eksisterer i database
- Test med hardkodet slug først

### Problem: Firestore permission denied
**Solution:**
- Dobbeltsjekk security rules deployet
- Test med Firebase Console simulator
- Verifiser album.isPublic = true i Firestore

### Problem: Last ned QR ikke fungerer
**Solution:**
- Sjekk SVG → Canvas konvertering
- Test i ulike browsers (Safari kan ha issues)
- Fallback til å åpne i ny tab hvis download feiler

---

## 📝 Documentation to Update

Når ferdig:
- [ ] Oppdater FUNKSJONSOVERSIKT.md med QR-funksjon
- [ ] Legg til i QUICK_REFERENCE.md
- [ ] Update ARKITEKTUR_OVERSIKT.md med nye komponenter
- [ ] Skriv bruker-dokumentasjon (hvordan bruke QR-deling)
- [ ] Oppdater README.md

---

## ✅ Feature Complete Checklist

- [ ] Fase 1: Core QR generation (1 dag)
- [ ] Fase 2: Share modal integration (1 dag)
- [ ] Fase 3: Public album viewer (1 dag)
- [ ] Fase 4: Polish & analytics (1-2 dager)
- [ ] All tests passed
- [ ] Code review
- [ ] Security audit
- [ ] Performance check
- [ ] Mobile testing (iOS + Android)
- [ ] Documentation updated
- [ ] Feature flag enabled
- [ ] Analytics tracking live
- [ ] User guide created

**Total:** 3-5 dager ✓

---

**Status:** 🟢 Ready for implementation  
**Next:** Start Fase 1 - kopier til Claude Code
