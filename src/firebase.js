// ============================================================================
// firebase.js – komplett integrasjon (v3.3) – Vite + Firebase modular
// ============================================================================

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  setDoc,
  doc,
  query,
  where,
  orderBy,
  deleteDoc,
  updateDoc,
  getDoc,
  limit,
  startAfter,
  onSnapshot,
  increment,
} from 'firebase/firestore'
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'
import * as exifr from 'exifr'
import {
  uploadWithFallback,
  isR2Enabled,
  extractStoragePathFromR2Url,
  deleteFromR2,
} from './utils/r2Upload'

// 🔗 Firebase-konfig (fra Vite environment variabler)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// ============================================================================
// 🔍 Environment Validation (PATCH 5: Simplified)
// ============================================================================
// Full diagnostics now run from App.jsx via envDiagnostics utility

const isDev = import.meta.env.DEV

// Validate critical Firebase config
const missing = Object.entries(firebaseConfig)
  .filter(([key, value]) => !value)
  .map(([key]) => key)

// Simple error logging for missing variables
if (missing.length > 0) {
  console.error('❌ Firebase config missing:', missing)
  if (isDev) {
    console.error('⚠️  Check .env.local file')
  }
}

// 🚀 Initialiser Firebase
const app = initializeApp(firebaseConfig)

// Log successful initialization in DEV (simplified)
if (isDev) {
  console.log('✅ Firebase initialized:', firebaseConfig.projectId)
}

// Eksporter Firebase-tjenestene
export const db = getFirestore(app)
export const storage = getStorage(app)
export const auth = getAuth(app)

// ============================================================================
// 🛠️ Firebase Auth Configuration for Local Development
// ============================================================================
//
// Firebase Auth security measures may block requests from local development
// origins (localhost, 127.0.0.1, local network IPs) if they are not properly
// configured in your Firebase Console.
//
// REQUIRED SETUP FOR LOCAL DEVELOPMENT:
// 1. Go to Firebase Console → Authentication → Settings → Authorized domains
// 2. Add the following domains:
//    - localhost
//    - 127.0.0.1 (if not already present)
//    - Your local network IP (e.g., 192.168.x.x)
//
// This configuration ensures that signInWithEmailAndPassword and other auth
// methods work correctly in development without requiring Firebase Emulator.
//
// Production is NOT affected by local development configuration.
//
// ============================================================================

if (isDev) {
  console.log('🔐 Auth domain:', firebaseConfig.authDomain)
}

// ============================================================================
// 🛡️ AppCheck Configuration (Production Only)
// ============================================================================
//
// AppCheck is NOT implemented in this application yet.
// When implemented, it MUST be disabled in development mode:
//
// Example (DO NOT UNCOMMENT until needed):
// if (!isDev) {
//   const appCheck = initializeAppCheck(app, {
//     provider: new ReCaptchaV3Provider('RECAPTCHA_SITE_KEY'),
//     isTokenAutoRefreshEnabled: true
//   })
// }
//
// DEV mode: AppCheck DISABLED (no crypto.randomUUID calls)
// PROD mode: AppCheck ENABLED (when implemented)
//
// ============================================================================

// ============================================================================
// 🔢 COUNTER INTEGRITY HELPERS (Phase 1: Freemium)
// ============================================================================
/**
 * Ensures counters stay in sync even during errors
 * CRITICAL: Use counters, NOT getDocs() for limit checks
 */

/**
 * Adjust user album count (atomic with rollback)
 */
export async function adjustUserAlbumCount(userId, delta) {
  const userRef = doc(db, 'users', userId)

  try {
    await updateDoc(userRef, {
      currentAlbumCount: increment(delta),
      updatedAt: new Date().toISOString(),
    })

    console.log(`✅ Counter adjusted: userId=${userId}, delta=${delta}`)
  } catch (error) {
    console.error(`❌ Counter adjustment FAILED:`, {
      userId,
      delta,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    })

    // CRITICAL: Log to external service (optional)
    // TODO: Integrate with Sentry or similar logging service
    // logToSentry({ userId, delta, error })

    throw error
  }
}

/**
 * Adjust album photo count (atomic with rollback)
 */
export async function adjustAlbumPhotoCount(albumId, delta) {
  const albumRef = doc(db, 'albums', albumId)

  try {
    await updateDoc(albumRef, {
      photoCount: increment(delta),
    })

    if (import.meta.env.DEV) {
      console.log(`✅ Photo count adjusted by ${delta} for album ${albumId}`)
    }
  } catch (error) {
    console.error('❌ Failed to adjust photo count:', error)
    throw error
  }
}

// ============================================================================
// 📁 Firestore-funksjoner
// ============================================================================

// 🔹 Hent alle album for en bruker
export async function getAlbumsByUser(userId) {
  try {
    const q = query(collection(db, 'albums'), where('userId', '==', userId))
    const snap = await getDocs(q)
    return snap.docs.map((d) => {
      const data = d.data()
      if (!data.createdAt) data.createdAt = new Date().toISOString()
      if (!data.updatedAt) data.updatedAt = data.createdAt
      if (!('photoCount' in data)) data.photoCount = 0
      return { id: d.id, ...data }
    })
  } catch (err) {
    console.error('🔥 getAlbumsByUser:', err)
    return []
  }
}

// 🔹 Legg til nytt album (oppdatert og sikret) - WITH FREEMIUM LIMITS
/**
 * Create album with automatic rollback on error
 * Enforces GRATIS tier limit: 5 albums max
 */
export async function addAlbum(data) {
  const user = auth.currentUser
  if (!user) throw new Error('Ingen bruker logget inn')

  const userId = data.userId || user.uid
  let albumId = null

  try {
    // 1. Check limit using counter (NOT getDocs!)
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      throw new Error('User not found')
    }

    const userData = userSnap.data()
    const tier = userData.subscriptionTier || 'GRATIS'
    const currentCount = userData.currentAlbumCount || 0

    // ENFORCE LIMIT for GRATIS tier
    if (tier === 'GRATIS' && currentCount >= 5) {
      const error = new Error('Album limit reached')
      error.code = 'ALBUM_LIMIT_REACHED'
      error.current = currentCount
      error.max = 5
      throw error
    }

    // 2. Create album FIRST
    const now = new Date().toISOString()
    const cleanAlbum = {
      name: data.name?.toString().trim() || 'Uten navn',
      description: data.description?.toString().trim() || '',
      cover: data.cover?.toString().trim() || '',
      createdAt: data.createdAt || now,
      updatedAt: now,
      photoCount: 0,
      userId: userId,
    }

    const albumRef = await addDoc(collection(db, 'albums'), cleanAlbum)
    albumId = albumRef.id

    // 3. Increment counter (with automatic rollback on error)
    try {
      await adjustUserAlbumCount(userId, 1)
    } catch (counterError) {
      // ROLLBACK: Delete the album we just created
      console.error('Counter increment failed, rolling back album creation')
      await deleteDoc(albumRef)
      throw counterError
    }

    if (isDev) console.log(`📂 Album created: ${cleanAlbum.name}`)

    if (window.showToast) {
      window.showToast('Album created successfully 🎉', 'success')
    }

    return albumId
  } catch (err) {
    console.error('🔥 addAlbum:', err)

    // Show appropriate error message
    if (err.code === 'ALBUM_LIMIT_REACHED') {
      if (window.showToast) {
        window.showToast(`Album limit reached (${err.current}/${err.max}). Upgrade to LITE for unlimited albums.`, 'error')
      }
    } else {
      if (window.showToast) {
        window.showToast('Failed to create album', 'error')
      }
    }

    throw err
  }
}

/**
 * Delete album with counter decrement
 */
export async function deleteAlbum(albumId, userId) {
  try {
    // 1. Delete album
    await deleteDoc(doc(db, 'albums', albumId))

    // 2. Decrement counter
    await adjustUserAlbumCount(userId, -1)

    if (import.meta.env.DEV) {
      console.log(`✅ Album ${albumId} deleted`)
    }
  } catch (error) {
    console.error('deleteAlbum failed:', error)
    throw error
  }
}

// 🔹 Oppdater album
export async function updateAlbum(albumId, updates) {
  try {
    const refDoc = doc(db, 'albums', albumId)
    await updateDoc(refDoc, {
      ...updates,
      updatedAt: new Date().toISOString(),
    })
    if (isDev) console.log(`📝 Album updated: ${albumId}`)
  } catch (err) {
    console.error('🔥 updateAlbum:', err)
  }
}

// 🔹 Sett cover-bilde (KONSOLIDERT FUNKSJON)
export async function setAlbumCover(albumId, photoUrl) {
  try {
    const refDoc = doc(db, 'albums', albumId)
    await updateDoc(refDoc, {
      cover: photoUrl,
      updatedAt: new Date().toISOString(),
    })
    if (isDev) console.log(`🖼️ Cover updated: ${albumId}`)
  } catch (err) {
    console.error('🔥 setAlbumCover:', err)
    throw err
  }
}

// 🔹 Hent alle bilder for bruker
export async function getPhotosByUser(userId) {
  try {
    const q = query(collection(db, 'photos'), where('userId', '==', userId))
    const snap = await getDocs(q)

    return snap.docs.map((d) => {
      const data = d.data()

      // 🔧 Konverter Firestore Timestamp til ISO-streng
      if (data.createdAt?.toDate)
        data.createdAt = data.createdAt.toDate().toISOString()
      if (data.updatedAt?.toDate)
        data.updatedAt = data.updatedAt.toDate().toISOString()

      if (!data.createdAt) data.createdAt = new Date().toISOString()
      if (!data.updatedAt) data.updatedAt = data.createdAt
      if (!('favorite' in data)) data.favorite = false

      // AI-felt defaults
      if (!data.aiTags) data.aiTags = []
      if (!('faces' in data)) data.faces = 0
      if (!('aiAnalyzed' in data)) data.aiAnalyzed = false

      return { id: d.id, ...data }
    })
  } catch (err) {
    console.error('🔥 getPhotosByUser:', err)
    return []
  }
}
// ============================================================================
// 📡 Live Firestore Listeners (for realtime updates)
// ============================================================================
// 🔹 Live listener for albums
export function listenToAlbumsByUser(userId, callback) {
  const q = query(collection(db, 'albums'), where('userId', '==', userId))
  return onSnapshot(q, (snapshot) => {
    const albums = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
    callback(albums)
  })
}

// 🔹 Live listener for photos
export function listenToPhotosByUser(userId, callback) {
  const q = query(collection(db, 'photos'), where('userId', '==', userId))
  return onSnapshot(q, (snapshot) => {
    if (import.meta.env.DEV) console.log('🔄 Firestore listener triggered:', {
      size: snapshot.size,
      docChanges: snapshot.docChanges().length,
    })

    // Log individual changes for debugging
    snapshot.docChanges().forEach((change) => {
      const photoData = { id: change.doc.id, ...change.doc.data() }

      if (change.type === 'modified') {
        if (import.meta.env.DEV) console.log('📝 Photo modified in Firestore:', {
          id: photoData.id,
          favorite: photoData.favorite,
          name: photoData.name,
        })
      } else if (change.type === 'added') {
        if (import.meta.env.DEV) console.log('➕ Photo added to Firestore:', {
          id: photoData.id,
          name: photoData.name,
        })
      } else if (change.type === 'removed') {
        if (import.meta.env.DEV) console.log('➖ Photo removed from Firestore:', {
          id: photoData.id,
        })
      }
    })

    const photos = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
    callback(photos)
  })
}

// ============================================================================
// PHASE 4: Single Resource Getters (for selective refresh if needed)
// ============================================================================

/**
 * Get single album by ID
 * Used for selective refresh instead of fetching all albums
 */
export async function getAlbum(albumId) {
  try {
    const docRef = doc(db, 'albums', albumId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      throw new Error('Album not found')
    }

    const data = docSnap.data()
    if (!data.createdAt) data.createdAt = new Date().toISOString()
    if (!data.updatedAt) data.updatedAt = data.createdAt
    if (!('photoCount' in data)) data.photoCount = 0

    return { id: docSnap.id, ...data }
  } catch (error) {
    console.error('🔥 getAlbum:', error)
    throw error
  }
}

/**
 * Get single photo by ID
 * Used for selective refresh instead of fetching all photos
 */
export async function getPhoto(photoId) {
  try {
    const docRef = doc(db, 'photos', photoId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      throw new Error('Photo not found')
    }

    const data = docSnap.data()

    // 🔧 Konverter Firestore Timestamp til ISO-streng
    if (data.createdAt?.toDate)
      data.createdAt = data.createdAt.toDate().toISOString()
    if (data.updatedAt?.toDate)
      data.updatedAt = data.updatedAt.toDate().toISOString()

    if (!data.createdAt) data.createdAt = new Date().toISOString()
    if (!data.updatedAt) data.updatedAt = data.createdAt
    if (!('favorite' in data)) data.favorite = false

    // AI-felt defaults
    if (!data.aiTags) data.aiTags = []
    if (!('faces' in data)) data.faces = 0
    if (!('aiAnalyzed' in data)) data.aiAnalyzed = false

    return { id: docSnap.id, ...data }
  } catch (error) {
    console.error('🔥 getPhoto:', error)
    throw error
  }
}

// 🔹 Legg til nytt bilde
export async function addPhoto(data) {
  const now = new Date().toISOString()
  const payload = {
    ...data,
    createdAt: data.createdAt || now,
    updatedAt: now,
    favorite: data.favorite || false,

    // AI-defaults
    aiTags: data.aiTags || [],
    faces: data.faces || 0,
    category: data.category || null,
    aiAnalyzed: data.aiAnalyzed || false,
    analyzedAt: data.analyzedAt || null,
    enhanced: data.enhanced || false,
    enhancedUrl: data.enhancedUrl || null,
    enhancedAt: data.enhancedAt || null,
    bgRemoved: data.bgRemoved || false,
    noBgUrl: data.noBgUrl || null,
    bgRemovedAt: data.bgRemovedAt || null,
  }

  const refDoc = await addDoc(collection(db, 'photos'), payload)
  if (import.meta.env.DEV) console.log(`📸 Bilde lagret: ${refDoc.id}`)
  return refDoc.id
}

// 🔹 Oppdater metadata for et bilde
export async function updatePhoto(photoId, updates) {
  try {
    const refDoc = doc(db, 'photos', photoId)
    await updateDoc(refDoc, {
      ...updates,
      updatedAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error('🔥 updatePhoto:', err)
    throw err // ✅ BUGFIX: Properly throw errors so callers can handle them
  }
}

/**
 * Update photo caption
 * @param {string} photoId - Photo ID
 * @param {string} caption - New caption text (or null to remove)
 * @param {string} userId - User ID (for security)
 * @returns {Promise<{success: boolean}>}
 */
export async function updatePhotoCaption(photoId, caption, userId) {
  try {
    const refDoc = doc(db, 'photos', photoId)

    // Security check: Verify photo belongs to user
    const photoSnap = await getDoc(refDoc)
    if (!photoSnap.exists()) {
      throw new Error('Photo not found')
    }

    const photoData = photoSnap.data()
    if (photoData.userId !== userId) {
      throw new Error('Permission denied')
    }

    // Update caption
    await updateDoc(refDoc, {
      caption: caption || null,
      captionUpdatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    if (import.meta.env.DEV) console.log(`📝 Caption updated for photo ${photoId}`)
    return { success: true }
  } catch (err) {
    console.error('🔥 updatePhotoCaption error:', err)
    throw err
  }
}

// ⭐ Toggle favoritt-status
export async function toggleFavorite(photoId, currentStatus) {
  try {
    const photoRef = doc(db, 'photos', photoId)
    const photoSnap = await getDoc(photoRef)

    if (!photoSnap.exists()) {
      throw new Error(`Photo document ${photoId} not found`)
    }

    const newStatus = !currentStatus
    await updateDoc(photoRef, {
      favorite: newStatus,
      updatedAt: new Date().toISOString(),
    })

    if (isDev) console.log(`⭐ Favorite toggled: ${photoId} → ${newStatus}`)
    return newStatus
  } catch (error) {
    console.error('❌ toggleFavorite error:', error.message, { photoId, currentStatus })
    throw error
  }
}

// 🔹 Delete photo from Firestore + R2 Storage
export async function deletePhoto(photoId, photoData) {
  try {
    // Delete from storage (R2 or Firebase Storage)
    if (photoData?.r2Url || photoData?.storageBackend === 'r2') {
      const storagePath = photoData.storagePath || extractStoragePathFromR2Url(photoData.r2Url)

      if (storagePath) {
        const user = auth.currentUser
        if (!user) {
          throw new Error('User not authenticated - cannot delete from R2')
        }

        const firebaseToken = await user.getIdToken()
        await deleteFromR2(storagePath, firebaseToken)
        if (isDev) console.log('🗑️ Deleted from R2:', storagePath)
      }
    } else if (photoData?.storagePath) {
      const storageRef = ref(storage, photoData.storagePath)
      await deleteObject(storageRef).catch(err => {
        if (isDev) console.log('⚠️ Storage delete warning:', err.message)
      })
      if (isDev) console.log('🗑️ Deleted from Firebase Storage')
    }

    // Delete from Firestore
    const photoRef = doc(db, 'photos', photoId)
    await deleteDoc(photoRef)

    if (isDev) console.log(`🗑️ Photo deleted: ${photoId}`)
    return true
  } catch (err) {
    console.error('❌ deletePhoto error:', err.message, { photoId })
    throw err
  }
}

// 🔹 Oppdater antall bilder i et album
export async function updateAlbumPhotoCount(albumId, newCount) {
  try {
    const refDoc = doc(db, 'albums', albumId)
    await updateDoc(refDoc, {
      photoCount: newCount,
      updatedAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error('🔥 updateAlbumPhotoCount:', err)
  }
}

// 🔹 Oppdater hvilket album et bilde tilhører
export async function updatePhotoAlbum(photoId, targetAlbumId) {
  try {
    const photoRef = doc(db, 'photos', photoId)
    await updateDoc(photoRef, {
      albumId: targetAlbumId,
      updatedAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error('🔥 updatePhotoAlbum:', err)
    throw err
  }
}

// ============================================================================
// ☁️ Storage-funksjoner (R2 + Firebase Storage Hybrid)
// ============================================================================

// 🔹 Last opp bildefil komplett (R2/Firebase Storage + Firestore) med AI-støtte
export async function uploadPhoto(
  userId,
  file,
  albumId = null,
  aiTagging = false,
  thumbnailBlob = null,
  videoMetadata = null,
  preExtractedExif = null // ✅ Pre-extracted EXIF data (before compression)
) {
  try {
    // Validate inputs
    if (!userId) {
      console.error('❌ uploadPhoto: No userId provided')
      throw new Error('No user ID provided to uploadPhoto')
    }

    if (!file) {
      console.error('❌ uploadPhoto: No file provided')
      throw new Error('No file provided to uploadPhoto')
    }

    // Log file details for debugging
    if (import.meta.env.DEV) console.log('📄 uploadPhoto received file:', {
      name: file.name,
      size: file.size,
      type: file.type,
      hasType: !!file.type,
      storageBackend: isR2Enabled() ? 'R2' : 'Firebase Storage',
    })

    // Determine file type (with fallback)
    const fileType = file.type || 'image/png' // Fallback to image/png if type is missing
    const isVideo = fileType.startsWith('video/')
    const isDocument = fileType.startsWith('application/') || fileType === 'text/plain' ||
      /\.(pdf|docx?|xlsx?|txt)$/i.test(file.name)

    // Get Firebase token for R2 authentication
    const currentUser = auth.currentUser
    const firebaseToken = currentUser ? await currentUser.getIdToken() : null

    // 🆕 FREEMIUM: Check album photo limit BEFORE uploading
    if (albumId) {
      const albumRef = doc(db, 'albums', albumId)
      const albumSnap = await getDoc(albumRef)

      if (!albumSnap.exists()) {
        throw new Error('Album not found')
      }

      const albumData = albumSnap.data()
      const userRef = doc(db, 'users', userId)
      const userSnap = await getDoc(userRef)
      const tier = userSnap.data()?.subscriptionTier || 'GRATIS'
      const currentPhotoCount = albumData.photoCount || 0

      // ENFORCE LIMIT for GRATIS tier
      if (tier === 'GRATIS' && currentPhotoCount >= 20) {
        const error = new Error('Photo limit reached for this album')
        error.code = 'PHOTO_LIMIT_REACHED'
        error.current = currentPhotoCount
        error.max = 20
        throw error
      }
    }

    // 1. Upload thumbnail to R2/Firebase Storage (if provided for video)
    let thumbnailUrl = null
    if (isVideo && thumbnailBlob) {
      try {
        const thumbTimestamp = Date.now()
        const thumbName = file.name.replace(/\.[^.]+$/, '_thumb.jpg')
        const thumbSafeName = thumbName.replace(/\s+/g, '_')
        const thumbPath = `users/${userId}/thumbnails/${thumbTimestamp}_${thumbSafeName}`

        // Upload thumbnail with R2-first fallback
        const { url: thumbUrl } = await uploadWithFallback(
          thumbnailBlob,
          thumbPath,
          'image/jpeg',
          {
            userId,
            albumId: albumId || 'unassigned',
            parentVideo: file.name,
            generatedAt: new Date().toISOString(),
            isThumbnail: 'true',
          },
          // Firebase fallback for thumbnail
          async () => {
            const thumbRef = ref(storage, thumbPath)
            await uploadBytes(thumbRef, thumbnailBlob, {
              contentType: 'image/jpeg',
              customMetadata: {
                userId: userId,
                parentVideo: file.name,
                generatedAt: new Date().toISOString(),
              },
            })
            return await getDownloadURL(thumbRef)
          },
          userId,
          firebaseToken
        )

        thumbnailUrl = thumbUrl
        if (import.meta.env.DEV) console.log('✅ [Upload] Thumbnail uploaded:', thumbnailUrl)
      } catch (thumbError) {
        console.error('❌ [Upload] Thumbnail upload failed:', thumbError)
        // Continue without thumbnail
      }
    }

    // 2. Extract comprehensive EXIF data with extensive debugging (for photos only)
    let takenAt = null
    let location = null
    let camera = null
    let technicalDetails = null

    if (!isVideo && !isDocument) {
      if (import.meta.env.DEV) {
        console.log('═══════════════════════════════════════')
        console.log('🔍 EXIF EXTRACTION DEBUG START')
        console.log('═══════════════════════════════════════')
        console.log('File name:', file.name)
        console.log('File type:', file.type)
        console.log('File size:', file.size, 'bytes')
        console.log('Pre-extracted EXIF available?', !!preExtractedExif)
        console.log('═══════════════════════════════════════')
      }

      let exifData = null

      // ✅ CRITICAL: Use pre-extracted EXIF if available (extracted BEFORE compression)
      if (preExtractedExif) {
        if (import.meta.env.DEV) console.log(
          '✅ Using pre-extracted EXIF data (from original file before compression)'
        )
        exifData = preExtractedExif
        if (import.meta.env.DEV) console.log('📊 Pre-extracted EXIF data keys:', Object.keys(exifData))
      } else {
        // Fallback: Extract from current file (may have no EXIF if compressed)
        try {
          if (import.meta.env.DEV) console.log(
            '📊 No pre-extracted EXIF - calling exifr.parse() on current file...'
          )

          // Try parsing with ALL options enabled (no pick filter)
          exifData = await exifr.parse(file, {
            tiff: true,
            exif: true,
            gps: true,
            interop: true,
            ifd0: true,
            ifd1: true,
            iptc: true,
            jfif: true,
            ihdr: true,
            // Don't use 'pick' - get everything!
          })

          if (import.meta.env.DEV) console.log('✅ exifr.parse() completed')
          if (import.meta.env.DEV) console.log('📊 EXIF data type:', typeof exifData)
          if (import.meta.env.DEV) console.log('📊 EXIF data is null?', exifData === null)
          if (import.meta.env.DEV) console.log('📊 EXIF data is undefined?', exifData === undefined)

          if (exifData) {
            if (import.meta.env.DEV) console.log('📊 Raw EXIF data keys:', Object.keys(exifData))
            if (import.meta.env.DEV) console.log(
              '📊 Raw EXIF data (full):',
              JSON.stringify(exifData, null, 2)
            )
          } else {
            if (import.meta.env.DEV) console.warn('⚠️ exifr.parse() returned null/undefined')
            if (import.meta.env.DEV) console.warn(
              'This is normal for screenshots or heavily edited photos'
            )
          }
        } catch (exifError) {
          console.error('═══════════════════════════════════════')
          console.error('❌ EXIF EXTRACTION FAILED')
          console.error('═══════════════════════════════════════')
          console.error('Error name:', exifError.name)
          console.error('Error message:', exifError.message)
          console.error('Error stack:', exifError.stack)
          console.error('═══════════════════════════════════════')
        }
      }

      // Process EXIF data (whether pre-extracted or freshly extracted)
      if (exifData) {
        if (import.meta.env.DEV) console.log('📊 Processing EXIF data...')

        // STEP 1: Extract date taken (try ALL possible fields)
        if (import.meta.env.DEV) console.log('─────────────────────────────────────')
        if (import.meta.env.DEV) console.log('📅 SEARCHING FOR DATE FIELDS...')
        if (import.meta.env.DEV) console.log('─────────────────────────────────────')

        const dateFields = [
          'DateTimeOriginal',
          'CreateDate',
          'DateTime',
          'DateTimeDigitized',
          'ModifyDate',
          'DateCreated',
          'CreationDate',
        ]

        for (const field of dateFields) {
          const value = exifData[field]
          if (import.meta.env.DEV) console.log(`  ${field}:`, value || 'NOT FOUND')

          if (value && !takenAt) {
            takenAt = value
            if (import.meta.env.DEV) console.log(`  ✅ Using ${field}: ${takenAt}`)
          }
        }

        if (!takenAt) {
          if (import.meta.env.DEV) console.warn('❌ No date field found in EXIF!')
          if (import.meta.env.DEV) console.warn('Available fields:', Object.keys(exifData))
        } else {
          if (import.meta.env.DEV) console.log('✅ Final takenAt value:', takenAt)
          if (import.meta.env.DEV) console.log('   Type:', typeof takenAt)
          if (import.meta.env.DEV) console.log('   Is Date?', takenAt instanceof Date)

          // Convert to ISO string if it's a Date object
          if (takenAt instanceof Date) {
            takenAt = takenAt.toISOString()
            if (import.meta.env.DEV) console.log('   Converted to ISO:', takenAt)
          } else if (typeof takenAt === 'string') {
            // Try parsing string date
            try {
              const parsed = new Date(takenAt)
              if (!isNaN(parsed.getTime())) {
                takenAt = parsed.toISOString()
                if (import.meta.env.DEV) console.log('   Parsed string to ISO:', takenAt)
              } else {
                if (import.meta.env.DEV) console.warn('   ⚠️ Could not parse date string')
              }
            } catch (parseError) {
              console.error('   ❌ Date parsing error:', parseError.message)
            }
          }
        }

        // STEP 2: Extract GPS location
        if (import.meta.env.DEV) console.log('─────────────────────────────────────')
        if (import.meta.env.DEV) console.log('📍 SEARCHING FOR GPS DATA...')
        if (import.meta.env.DEV) console.log('─────────────────────────────────────')
        if (import.meta.env.DEV) console.log('  latitude:', exifData.latitude || 'NOT FOUND')
        if (import.meta.env.DEV) console.log('  longitude:', exifData.longitude || 'NOT FOUND')
        if (import.meta.env.DEV) console.log('  altitude:', exifData.altitude || 'NOT FOUND')

        if (exifData.latitude && exifData.longitude) {
          location = {
            latitude: exifData.latitude,
            longitude: exifData.longitude,
            altitude: exifData.altitude || null,
          }
          if (import.meta.env.DEV) console.log('✅ GPS location found:', location)
        } else {
          if (import.meta.env.DEV) console.log('❌ No GPS data in EXIF')
        }

        // STEP 3: Extract camera info
        if (import.meta.env.DEV) console.log('─────────────────────────────────────')
        if (import.meta.env.DEV) console.log('📷 SEARCHING FOR CAMERA INFO...')
        if (import.meta.env.DEV) console.log('─────────────────────────────────────')
        if (import.meta.env.DEV) console.log('  Make:', exifData.Make || 'NOT FOUND')
        if (import.meta.env.DEV) console.log('  Model:', exifData.Model || 'NOT FOUND')
        if (import.meta.env.DEV) console.log('  LensModel:', exifData.LensModel || 'NOT FOUND')

        if (exifData.Make || exifData.Model || exifData.LensModel) {
          camera = {
            make: exifData.Make || null,
            model: exifData.Model || null,
            lens: exifData.LensModel || null,
          }
          if (import.meta.env.DEV) console.log('✅ Camera info found:', camera)
        } else {
          if (import.meta.env.DEV) console.log('❌ No camera info in EXIF')
        }

        // STEP 4: Extract technical details
        if (import.meta.env.DEV) console.log('─────────────────────────────────────')
        if (import.meta.env.DEV) console.log('🔧 SEARCHING FOR TECHNICAL DETAILS...')
        if (import.meta.env.DEV) console.log('─────────────────────────────────────')
        if (import.meta.env.DEV) console.log('  ISO:', exifData.ISO || 'NOT FOUND')
        if (import.meta.env.DEV) console.log('  ExposureTime:', exifData.ExposureTime || 'NOT FOUND')
        if (import.meta.env.DEV) console.log('  FNumber:', exifData.FNumber || 'NOT FOUND')
        if (import.meta.env.DEV) console.log('  FocalLength:', exifData.FocalLength || 'NOT FOUND')
        if (import.meta.env.DEV) console.log('  ImageWidth:', exifData.ImageWidth || 'NOT FOUND')
        if (import.meta.env.DEV) console.log('  ImageHeight:', exifData.ImageHeight || 'NOT FOUND')

        if (
          exifData.ISO ||
          exifData.ExposureTime ||
          exifData.FNumber ||
          exifData.FocalLength
        ) {
          technicalDetails = {
            iso: exifData.ISO || null,
            shutterSpeed: exifData.ExposureTime || null,
            aperture: exifData.FNumber || null,
            focalLength: exifData.FocalLength || null,
            width: exifData.ImageWidth || null,
            height: exifData.ImageHeight || null,
            orientation: exifData.Orientation || null,
          }
          if (import.meta.env.DEV) console.log('✅ Technical details found:', technicalDetails)
        } else {
          if (import.meta.env.DEV) console.log('❌ No technical details in EXIF')
        }
      }

      if (import.meta.env.DEV) console.log('═══════════════════════════════════════')
      if (import.meta.env.DEV) console.log('🔍 EXIF EXTRACTION DEBUG END')
      if (import.meta.env.DEV) console.log('═══════════════════════════════════════')
    }

    // Log EXIF date status (no fallback - leave undefined if no EXIF date)
    if (takenAt) {
      if (import.meta.env.DEV) console.log(`✅ Using EXIF date: ${takenAt}`)
    } else {
      if (import.meta.env.DEV) console.log(`⚠️ No EXIF date found - takenAt will be undefined`)
    }

    // 3. Upload main file to R2/Firebase Storage (with intelligent fallback)
    const timestamp = Date.now()
    const safeName = file.name.replace(/\s+/g, '_')
    const folderPath = albumId || 'unassigned'
    const storagePath = `users/${userId}/${folderPath}/${timestamp}_${safeName}`

    // Upload with R2-first fallback to Firebase
    const { url: downloadURL, storage: storageBackend } = await uploadWithFallback(
      file,
      storagePath,
      fileType,
      {
        userId,
        albumId: albumId || 'unassigned',
        uploadedAt: new Date().toISOString(),
        isVideo: isVideo ? 'true' : 'false',
      },
      // Firebase fallback function
      async () => {
        const storageRef = ref(storage, storagePath)
        await uploadBytes(storageRef, file, { contentType: fileType })
        return await getDownloadURL(storageRef)
      },
      userId,
      firebaseToken
    )

    if (import.meta.env.DEV) console.log(
      `📸 ${isVideo ? 'Video' : isDocument ? 'Document' : 'Bilde'} lastet opp til R2: ${safeName}`
    )

    // 4. Prepare metadata with comprehensive EXIF data
    const photoData = {
      name: file.name,
      url: downloadURL, // Main URL (R2)
      userId: userId,
      albumId: albumId,
      size: file.size,
      type: isDocument ? 'document' : (isVideo ? 'video' : fileType),
      ...(isDocument && { mimeType: fileType }), // Store MIME type for documents
      favorite: false,

      // Storage backend tracking - R2 only
      storageBackend: 'r2', // Always R2 for new uploads
      r2Url: downloadURL, // R2 public URL

      // Date fields (EXIF-enhanced for photos only)
      ...(takenAt && { takenAt: takenAt }), // ✅ Canonical EXIF date (only if exists)
      dateTaken: takenAt, // ✅ Keep for backward compatibility
      uploadedAt: new Date().toISOString(),
      displayDate: takenAt || new Date().toISOString(), // ✅ Use takenAt if available, else uploadedAt
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      // EXIF metadata (photos only)
      ...(!isVideo && !isDocument && location && { location }),
      ...(!isVideo && !isDocument && camera && { camera }),
      ...(!isVideo && !isDocument && technicalDetails && { technicalDetails }),

      // Video-specific fields
      ...(isVideo && {
        thumbnailUrl: thumbnailUrl,
        metadata: videoMetadata || {
          duration: 0,
          resolution: 'unknown',
          fps: null,
        },
      }),

      // AI fields (defaults - not for documents)
      ...(!isDocument && {
        aiTags: [],
        faces: 0,
        category: null,
        aiAnalyzed: false,
        analyzedAt: null,
        enhanced: false,
        enhancedUrl: null,
        enhancedAt: null,
        bgRemoved: false,
        noBgUrl: null,
        bgRemovedAt: null,
      }),
    }

    // 3. AI-tagging (deaktivert i Pixtr MVP)

    // 4. Lagre metadata i Firestore
    const photoId = await addPhoto(photoData)
    if (import.meta.env.DEV) console.log(`✅ Bilde lagret i Firestore: ${photoId}`)

    // 5. 🆕 FREEMIUM: Oppdater album photoCount med rollback (hvis albumId finnes)
    if (albumId) {
      try {
        await adjustAlbumPhotoCount(albumId, 1)
        if (import.meta.env.DEV) console.log(`📂 Album photoCount incremented: ${albumId}`)
      } catch (counterError) {
        // ROLLBACK: Delete photo document and storage file
        console.error('Counter increment failed, rolling back photo upload')

        // Delete Firestore document
        await deleteDoc(doc(db, 'photos', photoId))

        // Delete from storage
        if (storagePath) {
          try {
            if (isR2Enabled()) {
              await deleteFromR2(storagePath, firebaseToken)
            } else {
              await deleteObject(ref(storage, storagePath))
            }
          } catch (storageErr) {
            console.error('Failed to delete storage file during rollback:', storageErr)
          }
        }

        throw counterError
      }
    }

    // 6. Update user storage (always, even without album)
    await updateDoc(doc(db, 'users', userId), {
      storageUsed: increment(file.size),
    })

    return photoId
  } catch (error) {
    console.error('🔥 uploadPhoto error:', error)
    throw new Error(`Upload feilet: ${error.message}`)
  }
}

// 🔹 Last opp thumbnail
export async function uploadThumbnail(blob, userId, photoId, size = 'small') {
  try {
    const storagePath = `users/${userId}/thumbnails/${photoId}_${size}.jpg`
    const storageRef = ref(storage, storagePath)
    await uploadBytes(storageRef, blob, {
      contentType: 'image/jpeg',
      customMetadata: {
        userId: userId,
        photoId: photoId,
        size: size,
        generatedAt: new Date().toISOString(),
      },
    })
    const downloadURL = await getDownloadURL(storageRef)
    return { downloadURL, storagePath }
  } catch (error) {
    console.error('🔥 uploadThumbnail:', error)
    throw new Error(error.message)
  }
}

/**
 * Upload edited photo to R2 enhanced bucket and update Firestore (Phase 3)
 * @param {string} userId - User ID
 * @param {string} photoId - Original photo ID
 * @param {Blob} blob - Edited image blob (JPEG)
 * @param {Object} transform - Transform state from editorStore
 * @param {string} filter - Named filter applied
 * @param {Blob} thumbnailBlob - Optional thumbnail blob
 * @returns {Promise<Object>} { editedUrl, thumbnailUrl, storagePath }
 */
export async function uploadEditedPhoto(
  userId,
  photoId,
  blob,
  transform,
  filter = 'original',
  thumbnailBlob = null
) {
  try {
    if (!userId) {
      throw new Error('No user ID provided to uploadEditedPhoto')
    }

    if (!photoId) {
      throw new Error('No photo ID provided to uploadEditedPhoto')
    }

    if (!blob) {
      throw new Error('No blob provided to uploadEditedPhoto')
    }

    const timestamp = Date.now()

    // 1. Upload edited image to enhanced bucket
    const fileName = `edited_${photoId}_${timestamp}.jpg`
    const storagePath = `users/${userId}/enhanced/${fileName}`
    const storageRef = ref(storage, storagePath)

    await uploadBytes(storageRef, blob, {
      contentType: 'image/jpeg',
      customMetadata: {
        userId: userId,
        sourcePhotoId: photoId,
        editedAt: new Date().toISOString(),
        hasTransforms: 'true',
      },
    })

    const editedUrl = await getDownloadURL(storageRef)
    if (import.meta.env.DEV) console.log('✅ [EditedPhoto] Uploaded to R2:', editedUrl)

    // 2. Upload thumbnail if provided
    let thumbnailUrl = null
    if (thumbnailBlob) {
      try {
        const thumbFileName = `edited_${photoId}_${timestamp}_thumb.jpg`
        const thumbPath = `users/${userId}/thumbnails/${thumbFileName}`
        const thumbRef = ref(storage, thumbPath)

        await uploadBytes(thumbRef, thumbnailBlob, {
          contentType: 'image/jpeg',
          customMetadata: {
            userId: userId,
            sourcePhotoId: photoId,
            editedThumbnail: 'true',
            generatedAt: new Date().toISOString(),
          },
        })

        thumbnailUrl = await getDownloadURL(thumbRef)
        if (import.meta.env.DEV) console.log('✅ [EditedPhoto] Thumbnail uploaded:', thumbnailUrl)
      } catch (thumbError) {
        console.error('⚠️ [EditedPhoto] Thumbnail upload failed:', thumbError)
        // Continue without thumbnail
      }
    }

    // 3. Update Firestore document
    const photoDoc = await getDoc(doc(db, 'photos', photoId))
    const currentPhotoData = photoDoc.data()

    // ✅ Preserve originalUrl on first edit
    const updates = {
      url: editedUrl, // Active image is now the edited version
      editedUrl: editedUrl,
      editedAt: new Date().toISOString(),
      transforms: transform,
      filter: filter,
      edited: true,
      updatedAt: new Date().toISOString(),
    }

    // Set originalUrl only if it doesn't exist (first time editing)
    if (!currentPhotoData.originalUrl) {
      updates.originalUrl = currentPhotoData.url // Backup the original
      if (import.meta.env.DEV) console.log('✅ [EditedPhoto] Preserving originalUrl:', currentPhotoData.url)
    }

    await updateDoc(doc(db, 'photos', photoId), updates)

    if (import.meta.env.DEV) console.log(`✅ [EditedPhoto] Firestore updated for ${photoId}`)

    return { editedUrl, thumbnailUrl, storagePath }
  } catch (error) {
    console.error('🔥 uploadEditedPhoto error:', error)
    throw new Error(`Edited photo upload failed: ${error.message}`)
  }
}

// ============================================================================
// 📄 Pagination Functions - Phase 2
// ============================================================================

/**
 * Get photos by user with pagination
 * @param {string} userId - User ID
 * @param {number} pageSize - Number of photos per page (default 20)
 * @param {object} lastDoc - Last document from previous page (for startAfter)
 * @returns {object} { photos, lastDoc, hasMore }
 */
export async function getPhotosByUserPaginated(
  userId,
  pageSize = 20,
  lastDoc = null
) {
  try {
    let q = query(
      collection(db, 'photos'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    )

    // If lastDoc is provided, start after it
    if (lastDoc) {
      q = query(
        collection(db, 'photos'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(pageSize)
      )
    }

    const snap = await getDocs(q)
    const photos = snap.docs.map((d) => {
      const data = d.data()

      // Convert Firestore Timestamp to ISO string
      if (data.createdAt?.toDate)
        data.createdAt = data.createdAt.toDate().toISOString()
      if (data.updatedAt?.toDate)
        data.updatedAt = data.updatedAt.toDate().toISOString()

      if (!data.createdAt) data.createdAt = new Date().toISOString()
      if (!data.updatedAt) data.updatedAt = data.createdAt
      if (!('favorite' in data)) data.favorite = false

      // AI field defaults
      if (!data.aiTags) data.aiTags = []
      if (!('faces' in data)) data.faces = 0
      if (!('aiAnalyzed' in data)) data.aiAnalyzed = false

      return { id: d.id, ...data }
    })

    // Get last document for next page
    const newLastDoc =
      snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null
    const hasMore = snap.docs.length === pageSize

    return { photos, lastDoc: newLastDoc, hasMore }
  } catch (err) {
    console.error('🔥 getPhotosByUserPaginated:', err)
    return { photos: [], lastDoc: null, hasMore: false }
  }
}

/**
 * Get albums by user with pagination
 * @param {string} userId - User ID
 * @param {number} pageSize - Number of albums per page (default 10)
 * @param {object} lastDoc - Last document from previous page
 * @returns {object} { albums, lastDoc, hasMore }
 */
export async function getAlbumsByUserPaginated(
  userId,
  pageSize = 10,
  lastDoc = null
) {
  try {
    let q = query(
      collection(db, 'albums'),
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc'),
      limit(pageSize)
    )

    if (lastDoc) {
      q = query(
        collection(db, 'albums'),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc'),
        startAfter(lastDoc),
        limit(pageSize)
      )
    }

    const snap = await getDocs(q)
    const albums = snap.docs.map((d) => {
      const data = d.data()
      if (!data.createdAt) data.createdAt = new Date().toISOString()
      if (!data.updatedAt) data.updatedAt = data.createdAt
      if (!('photoCount' in data)) data.photoCount = 0
      return { id: d.id, ...data }
    })

    const newLastDoc =
      snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null
    const hasMore = snap.docs.length === pageSize

    return { albums, lastDoc: newLastDoc, hasMore }
  } catch (err) {
    console.error('🔥 getAlbumsByUserPaginated:', err)
    return { albums: [], lastDoc: null, hasMore: false }
  }
}

/**
 * Get photos in a specific album with pagination
 * @param {string} albumId - Album ID
 * @param {number} pageSize - Number of photos per page (default 50)
 * @param {object} lastDoc - Last document from previous page
 * @returns {object} { photos, lastDoc, hasMore }
 */
export async function getPhotosInAlbumPaginated(
  albumId,
  pageSize = 50,
  lastDoc = null
) {
  try {
    let q = query(
      collection(db, 'photos'),
      where('albumId', '==', albumId),
      orderBy('uploadedAt', 'desc'),
      limit(pageSize)
    )

    if (lastDoc) {
      q = query(
        collection(db, 'photos'),
        where('albumId', '==', albumId),
        orderBy('uploadedAt', 'desc'),
        startAfter(lastDoc),
        limit(pageSize)
      )
    }

    const snap = await getDocs(q)
    const photos = snap.docs.map((d) => {
      const data = d.data()

      // Convert Firestore Timestamp to ISO string
      if (data.createdAt?.toDate)
        data.createdAt = data.createdAt.toDate().toISOString()
      if (data.updatedAt?.toDate)
        data.updatedAt = data.updatedAt.toDate().toISOString()
      if (data.uploadedAt?.toDate)
        data.uploadedAt = data.uploadedAt.toDate().toISOString()

      if (!data.createdAt) data.createdAt = new Date().toISOString()
      if (!data.updatedAt) data.updatedAt = data.createdAt
      if (!data.uploadedAt) data.uploadedAt = data.createdAt
      if (!('favorite' in data)) data.favorite = false

      // AI field defaults
      if (!data.aiTags) data.aiTags = []
      if (!('faces' in data)) data.faces = 0
      if (!('aiAnalyzed' in data)) data.aiAnalyzed = false

      return { id: d.id, ...data }
    })

    const newLastDoc =
      snap.docs.length > 0 ? snap.docs[snap.docs.length - 1] : null
    const hasMore = snap.docs.length === pageSize

    return { photos, lastDoc: newLastDoc, hasMore }
  } catch (err) {
    console.error('🔥 getPhotosInAlbumPaginated:', err)
    return { photos: [], lastDoc: null, hasMore: false }
  }
}

// ============================================================================
// 🔧 Migration Functions
// ============================================================================

/**
 * Migration: Add userId to albums that are missing it
 * Run this ONCE to fix old data
 */
export async function migrateAlbumsAddUserId() {
  try {
    const currentUserId = auth.currentUser?.uid
    if (!currentUserId) {
      throw new Error('No user logged in')
    }

    if (import.meta.env.DEV) console.log('🔧 Starting migration: Adding userId to albums...')

    const albumsSnapshot = await getDocs(collection(db, 'albums'))
    let fixed = 0
    let skipped = 0

    for (const albumDoc of albumsSnapshot.docs) {
      const albumData = albumDoc.data()

      // If album missing userId, add current user's ID
      if (!albumData.userId) {
        if (import.meta.env.DEV) console.log(
          `Fixing album: ${albumDoc.id} - "${albumData.name}" (missing userId)`
        )
        await updateDoc(doc(db, 'albums', albumDoc.id), {
          userId: currentUserId,
          updatedAt: new Date().toISOString(),
        })
        fixed++
      } else {
        skipped++
      }
    }

    if (import.meta.env.DEV) console.log(
      `✅ Migration complete: ${fixed} albums fixed, ${skipped} already had userId`
    )
    return { fixed, skipped, total: albumsSnapshot.docs.length }
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

/**
 * Migration: Add userId to photos that are missing it
 * Run this ONCE to fix old data
 */
export async function migratePhotosAddUserId() {
  try {
    const currentUserId = auth.currentUser?.uid
    if (!currentUserId) {
      throw new Error('No user logged in')
    }

    if (import.meta.env.DEV) console.log('🔧 Starting migration: Adding userId to photos...')

    const photosSnapshot = await getDocs(collection(db, 'photos'))
    let fixed = 0
    let skipped = 0

    for (const photoDoc of photosSnapshot.docs) {
      const photoData = photoDoc.data()

      // If photo missing userId, add current user's ID
      if (!photoData.userId) {
        if (import.meta.env.DEV) console.log(
          `Fixing photo: ${photoDoc.id} - "${
            photoData.name || 'unnamed'
          }" (missing userId)`
        )
        await updateDoc(doc(db, 'photos', photoDoc.id), {
          userId: currentUserId,
          updatedAt: new Date().toISOString(),
        })
        fixed++
      } else {
        skipped++
      }
    }

    if (import.meta.env.DEV) console.log(
      `✅ Migration complete: ${fixed} photos fixed, ${skipped} already had userId`
    )
    return { fixed, skipped, total: photosSnapshot.docs.length }
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  }
}

// ============================================================================
// 📦 Eksporter Firebase-objekter
// ============================================================================

export default app
