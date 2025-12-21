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
} from 'firebase/firestore'
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'
import * as exifr from 'exifr'

console.log('🔥 Firebase ENV CHECK', {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
})

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
// 🔍 Environment Validation & DEV Diagnostics
// ============================================================================

const isDev = import.meta.env.DEV
const mode = import.meta.env.MODE

// Comprehensive environment validation
const missing = Object.entries(firebaseConfig)
  .filter(([key, value]) => !value)
  .map(([key]) => key)

// DEV MODE: Enhanced diagnostics
if (isDev) {
  console.log('═══════════════════════════════════════════════')
  console.log('🔧 FIREBASE DEV MODE DIAGNOSTICS')
  console.log('═══════════════════════════════════════════════')
  console.log('Environment:', {
    DEV: isDev,
    MODE: mode,
    timestamp: new Date().toISOString(),
  })
  console.log('Firebase Config:', {
    apiKey: firebaseConfig.apiKey ? '✅ SET' : '❌ MISSING',
    authDomain: firebaseConfig.authDomain || '❌ MISSING',
    projectId: firebaseConfig.projectId || '❌ MISSING',
    storageBucket: firebaseConfig.storageBucket ? '✅ SET' : '❌ MISSING',
    messagingSenderId: firebaseConfig.messagingSenderId
      ? '✅ SET'
      : '❌ MISSING',
    appId: firebaseConfig.appId ? '✅ SET' : '❌ MISSING',
  })

  if (missing.length > 0) {
    console.error('❌ Missing Firebase environment variables:', missing)
    console.error('⚠️ Please check your .env.local file!')
    console.error('⚠️ Make sure all VITE_FIREBASE_* variables are set')
  } else {
    console.log('✅ All Firebase environment variables loaded')
  }

  console.log('Current URL:', window.location.href)
  console.log('Current Origin:', window.location.origin)
  console.log('═══════════════════════════════════════════════')
  console.log('⚠️ App Check: DISABLED in DEV mode')
  console.log('⚠️ All Firebase requests will use production endpoints')
  console.log('═══════════════════════════════════════════════')
}

// PRODUCTION MODE: Simple error logging
if (!isDev && missing.length > 0) {
  console.error(
    '❌ Missing Firebase environment variables in firebaseConfig:',
    missing
  )
}

// 🚀 Initialiser Firebase
const app = initializeApp(firebaseConfig)

// Log successful initialization in DEV
if (isDev) {
  console.log('✅ Firebase app initialized successfully')
  console.log('📱 App name:', app.name)
  console.log('🔑 Project ID:', firebaseConfig.projectId)
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
  console.log('🔐 Auth Configuration:')
  console.log('   Auth Domain:', firebaseConfig.authDomain)
  console.log('   Current Origin:', window.location.origin)
  console.log(
    '   ⚠️ If auth fails, check Firebase Console → Authorized domains'
  )
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

// 🔹 Legg til nytt album (oppdatert og sikret)
export async function addAlbum(data) {
  const user = auth.currentUser
  if (!user) throw new Error('Ingen bruker logget inn')

  try {
    const now = new Date().toISOString()

    const cleanAlbum = {
      name: data.name?.toString().trim() || 'Uten navn',
      description: data.description?.toString().trim() || '',
      cover: data.cover?.toString().trim() || '',
      createdAt: data.createdAt || now,
      updatedAt: now,
      photoCount: 0,
      userId: user.uid,
    }

    const refDoc = await addDoc(collection(db, 'albums'), cleanAlbum)
    console.log(`📂 Album opprettet for bruker ${user.uid}: ${cleanAlbum.name}`)

    if (window.showToast) {
      window.showToast('Album created successfully 🎉', 'success')
    }

    return refDoc.id
  } catch (err) {
    console.error('🔥 addAlbum:', err)
    if (window.showToast) {
      window.showToast('Failed to create album', 'error')
    }
    throw err
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
    console.log(`📝 Album oppdatert (${albumId})`)
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
    console.log(`🖼️ Cover oppdatert for album ${albumId}`)
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
    console.log('🔄 Firestore listener triggered:', {
      size: snapshot.size,
      docChanges: snapshot.docChanges().length,
    })

    // Log individual changes for debugging
    snapshot.docChanges().forEach((change) => {
      const photoData = { id: change.doc.id, ...change.doc.data() }

      if (change.type === 'modified') {
        console.log('📝 Photo modified in Firestore:', {
          id: photoData.id,
          favorite: photoData.favorite,
          name: photoData.name,
        })
      } else if (change.type === 'added') {
        console.log('➕ Photo added to Firestore:', {
          id: photoData.id,
          name: photoData.name,
        })
      } else if (change.type === 'removed') {
        console.log('➖ Photo removed from Firestore:', {
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
  console.log(`📸 Bilde lagret: ${refDoc.id}`)
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

    console.log(`📝 Caption updated for photo ${photoId}`)
    return { success: true }
  } catch (err) {
    console.error('🔥 updatePhotoCaption error:', err)
    throw err
  }
}

// ⭐ Toggle favoritt-status
export async function toggleFavorite(photoId, currentStatus) {
  console.log('═══════════════════════════════════════════════')
  console.log('🔍 FAVORITT-TOGGLE DEBUG START')
  console.log('═══════════════════════════════════════════════')
  console.log('📥 Input parameters:', {
    photoId,
    currentFavoriteStatus: currentStatus,
    expectedNewStatus: !currentStatus,
    timestamp: new Date().toISOString(),
  })

  try {
    // Step 1: Get document reference
    const photoRef = doc(db, 'photos', photoId)
    console.log('📄 Document reference created:', photoRef.path)

    // Step 2: Check if document exists
    console.log('🔎 Checking if document exists...')
    const photoSnap = await getDoc(photoRef)

    if (!photoSnap.exists()) {
      console.error('❌ FATAL: Document does not exist!')
      console.error('   PhotoId:', photoId)
      console.error('   Path:', photoRef.path)
      throw new Error(`Photo document ${photoId} not found`)
    }
    console.log('✅ Document exists')
    console.log('📊 Current document data:', photoSnap.data())

    // Step 3: Calculate new status
    const newStatus = !currentStatus
    console.log('🔄 Status change:', {
      from: currentStatus,
      to: newStatus,
    })

    // Step 4: Update Firestore
    console.log('💾 Starting Firestore updateDoc()...')
    await updateDoc(photoRef, {
      favorite: newStatus,
      updatedAt: new Date().toISOString(),
    })
    console.log('✅ Firestore updateDoc() completed')

    // Step 5: Verify update
    console.log('🔍 Verifying update...')
    const verifySnap = await getDoc(photoRef)
    const verifyData = verifySnap.data()
    console.log('📊 Post-update document data:', verifyData)

    if (verifyData.favorite === newStatus) {
      console.log('✅ Post-update verification: ✅ MATCH')
    } else {
      console.error('❌ Post-update verification: ❌ MISMATCH')
      console.error('   Expected:', newStatus)
      console.error('   Got:', verifyData.favorite)
    }

    console.log('═══════════════════════════════════════════════')
    console.log('🎉 FAVORITT-TOGGLE DEBUG END - SUCCESS')
    console.log('═══════════════════════════════════════════════')

    return newStatus
  } catch (error) {
    console.error('═══════════════════════════════════════════════')
    console.error('💥 FAVORITT-TOGGLE ERROR')
    console.error('═══════════════════════════════════════════════')
    console.error('Error type:', error.constructor.name)
    console.error('Error message:', error.message)
    console.error('Error code:', error.code)
    console.error('Full error:', error)
    console.error('PhotoId:', photoId)
    console.error('Current status:', currentStatus)
    console.error('═══════════════════════════════════════════════')
    throw error
  }
}

// 🔹 Slett bilde fra Firestore + Storage
export async function deletePhoto(photoId, storagePath) {
  console.log('═══════════════════════════════════════════════')
  console.log('🗑️ DELETE PHOTO DEBUG START')
  console.log('═══════════════════════════════════════════════')
  console.log('📥 Input parameters:', {
    photoId,
    storagePath,
    timestamp: new Date().toISOString(),
  })

  try {
    // Step 1: Delete from Storage (if path provided)
    if (storagePath) {
      console.log('🔥 Deleting from Storage:', storagePath)
      const storageRef = ref(storage, storagePath)
      await deleteObject(storageRef)
      console.log('✅ Deleted from Storage successfully')
    } else {
      console.log('⚠️ No storagePath provided, skipping Storage deletion')
    }

    // Step 2: Delete from Firestore
    console.log('🔥 Deleting from Firestore:', photoId)
    const photoRef = doc(db, 'photos', photoId)
    await deleteDoc(photoRef)
    console.log('✅ Deleted from Firestore successfully')

    console.log('═══════════════════════════════════════════════')
    console.log('🎉 DELETE PHOTO DEBUG END - SUCCESS')
    console.log('═══════════════════════════════════════════════')

    return true
  } catch (err) {
    console.error('═══════════════════════════════════════════════')
    console.error('💥 DELETE PHOTO ERROR')
    console.error('═══════════════════════════════════════════════')
    console.error('Error type:', err.constructor.name)
    console.error('Error message:', err.message)
    console.error('Error code:', err.code)
    console.error('Full error:', err)
    console.error('PhotoId:', photoId)
    console.error('StoragePath:', storagePath)
    console.error('═══════════════════════════════════════════════')
    throw err // ✅ BUGFIX: Properly throw errors so callers can handle them
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
// ☁️ Storage-funksjoner
// ============================================================================

// 🔹 Last opp bildefil komplett (Storage + Firestore) med AI-støtte
export async function uploadPhoto(
  userId,
  file,
  albumId = null,
  aiTagging = false,
  thumbnailBlob = null,
  videoMetadata = null,
  preExtractedExif = null // ✅ NEW: Pre-extracted EXIF data (before compression)
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
    console.log('📄 uploadPhoto received file:', {
      name: file.name,
      size: file.size,
      type: file.type,
      hasType: !!file.type,
    })

    // Determine if this is a video (with fallback)
    const fileType = file.type || 'image/png' // Fallback to image/png if type is missing
    const isVideo = fileType.startsWith('video/')

    // 1. Upload thumbnail to Storage (if provided for video)
    let thumbnailUrl = null
    if (isVideo && thumbnailBlob) {
      try {
        const timestamp = Date.now()
        const thumbName = file.name.replace(/\.[^.]+$/, '_thumb.jpg')
        const thumbSafeName = thumbName.replace(/\s+/g, '_')
        const thumbPath = `users/${userId}/thumbnails/${timestamp}_${thumbSafeName}`
        const thumbRef = ref(storage, thumbPath)

        await uploadBytes(thumbRef, thumbnailBlob, {
          contentType: 'image/jpeg',
          customMetadata: {
            userId: userId,
            parentVideo: file.name,
            generatedAt: new Date().toISOString(),
          },
        })
        thumbnailUrl = await getDownloadURL(thumbRef)
        console.log('✅ [Upload] Thumbnail uploaded:', thumbnailUrl)
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

    if (!isVideo) {
      console.log('═══════════════════════════════════════')
      console.log('🔍 EXIF EXTRACTION DEBUG START')
      console.log('═══════════════════════════════════════')
      console.log('File name:', file.name)
      console.log('File type:', file.type)
      console.log('File size:', file.size, 'bytes')
      console.log('Pre-extracted EXIF available?', !!preExtractedExif)
      console.log('═══════════════════════════════════════')

      let exifData = null

      // ✅ CRITICAL: Use pre-extracted EXIF if available (extracted BEFORE compression)
      if (preExtractedExif) {
        console.log(
          '✅ Using pre-extracted EXIF data (from original file before compression)'
        )
        exifData = preExtractedExif
        console.log('📊 Pre-extracted EXIF data keys:', Object.keys(exifData))
      } else {
        // Fallback: Extract from current file (may have no EXIF if compressed)
        try {
          console.log(
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

          console.log('✅ exifr.parse() completed')
          console.log('📊 EXIF data type:', typeof exifData)
          console.log('📊 EXIF data is null?', exifData === null)
          console.log('📊 EXIF data is undefined?', exifData === undefined)

          if (exifData) {
            console.log('📊 Raw EXIF data keys:', Object.keys(exifData))
            console.log(
              '📊 Raw EXIF data (full):',
              JSON.stringify(exifData, null, 2)
            )
          } else {
            console.warn('⚠️ exifr.parse() returned null/undefined')
            console.warn(
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
        console.log('📊 Processing EXIF data...')

        // STEP 1: Extract date taken (try ALL possible fields)
        console.log('─────────────────────────────────────')
        console.log('📅 SEARCHING FOR DATE FIELDS...')
        console.log('─────────────────────────────────────')

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
          console.log(`  ${field}:`, value || 'NOT FOUND')

          if (value && !takenAt) {
            takenAt = value
            console.log(`  ✅ Using ${field}: ${takenAt}`)
          }
        }

        if (!takenAt) {
          console.warn('❌ No date field found in EXIF!')
          console.warn('Available fields:', Object.keys(exifData))
        } else {
          console.log('✅ Final takenAt value:', takenAt)
          console.log('   Type:', typeof takenAt)
          console.log('   Is Date?', takenAt instanceof Date)

          // Convert to ISO string if it's a Date object
          if (takenAt instanceof Date) {
            takenAt = takenAt.toISOString()
            console.log('   Converted to ISO:', takenAt)
          } else if (typeof takenAt === 'string') {
            // Try parsing string date
            try {
              const parsed = new Date(takenAt)
              if (!isNaN(parsed.getTime())) {
                takenAt = parsed.toISOString()
                console.log('   Parsed string to ISO:', takenAt)
              } else {
                console.warn('   ⚠️ Could not parse date string')
              }
            } catch (parseError) {
              console.error('   ❌ Date parsing error:', parseError.message)
            }
          }
        }

        // STEP 2: Extract GPS location
        console.log('─────────────────────────────────────')
        console.log('📍 SEARCHING FOR GPS DATA...')
        console.log('─────────────────────────────────────')
        console.log('  latitude:', exifData.latitude || 'NOT FOUND')
        console.log('  longitude:', exifData.longitude || 'NOT FOUND')
        console.log('  altitude:', exifData.altitude || 'NOT FOUND')

        if (exifData.latitude && exifData.longitude) {
          location = {
            latitude: exifData.latitude,
            longitude: exifData.longitude,
            altitude: exifData.altitude || null,
          }
          console.log('✅ GPS location found:', location)
        } else {
          console.log('❌ No GPS data in EXIF')
        }

        // STEP 3: Extract camera info
        console.log('─────────────────────────────────────')
        console.log('📷 SEARCHING FOR CAMERA INFO...')
        console.log('─────────────────────────────────────')
        console.log('  Make:', exifData.Make || 'NOT FOUND')
        console.log('  Model:', exifData.Model || 'NOT FOUND')
        console.log('  LensModel:', exifData.LensModel || 'NOT FOUND')

        if (exifData.Make || exifData.Model || exifData.LensModel) {
          camera = {
            make: exifData.Make || null,
            model: exifData.Model || null,
            lens: exifData.LensModel || null,
          }
          console.log('✅ Camera info found:', camera)
        } else {
          console.log('❌ No camera info in EXIF')
        }

        // STEP 4: Extract technical details
        console.log('─────────────────────────────────────')
        console.log('🔧 SEARCHING FOR TECHNICAL DETAILS...')
        console.log('─────────────────────────────────────')
        console.log('  ISO:', exifData.ISO || 'NOT FOUND')
        console.log('  ExposureTime:', exifData.ExposureTime || 'NOT FOUND')
        console.log('  FNumber:', exifData.FNumber || 'NOT FOUND')
        console.log('  FocalLength:', exifData.FocalLength || 'NOT FOUND')
        console.log('  ImageWidth:', exifData.ImageWidth || 'NOT FOUND')
        console.log('  ImageHeight:', exifData.ImageHeight || 'NOT FOUND')

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
          console.log('✅ Technical details found:', technicalDetails)
        } else {
          console.log('❌ No technical details in EXIF')
        }
      }

      console.log('═══════════════════════════════════════')
      console.log('🔍 EXIF EXTRACTION DEBUG END')
      console.log('═══════════════════════════════════════')
    }

    // Log EXIF date status (no fallback - leave undefined if no EXIF date)
    if (takenAt) {
      console.log(`✅ Using EXIF date: ${takenAt}`)
    } else {
      console.log(`⚠️ No EXIF date found - takenAt will be undefined`)
    }

    // 3. Upload main file to Storage
    const timestamp = Date.now()
    const safeName = file.name.replace(/\s+/g, '_')
    const folderPath = albumId || 'unassigned'
    const storagePath = `users/${userId}/${folderPath}/${timestamp}_${safeName}`
    const storageRef = ref(storage, storagePath)

    await uploadBytes(storageRef, file, { contentType: fileType })
    const downloadURL = await getDownloadURL(storageRef)

    console.log(
      `📸 ${isVideo ? 'Video' : 'Bilde'} lastet opp til Storage: ${safeName}`
    )

    // 4. Prepare metadata with comprehensive EXIF data
    const photoData = {
      name: file.name,
      url: downloadURL,
      userId: userId,
      albumId: albumId,
      storagePath: storagePath,
      size: file.size,
      type: isVideo ? 'video' : fileType,
      favorite: false,

      // Date fields (EXIF-enhanced)
      ...(takenAt && { takenAt: takenAt }), // ✅ Canonical EXIF date (only if exists)
      dateTaken: takenAt, // ✅ Keep for backward compatibility
      uploadedAt: new Date().toISOString(),
      displayDate: takenAt || new Date().toISOString(), // ✅ Use takenAt if available, else uploadedAt
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      // EXIF metadata (photos only)
      ...(!isVideo && location && { location }),
      ...(!isVideo && camera && { camera }),
      ...(!isVideo && technicalDetails && { technicalDetails }),

      // Video-specific fields
      ...(isVideo && {
        thumbnailUrl: thumbnailUrl,
        metadata: videoMetadata || {
          duration: 0,
          resolution: 'unknown',
          fps: null,
        },
      }),

      // AI fields (defaults)
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
    }

    // 3. AI-tagging (deaktivert i Pixtr MVP)

    // 4. Lagre metadata i Firestore
    const photoId = await addPhoto(photoData)
    console.log(`✅ Bilde lagret i Firestore: ${photoId}`)

    // 5. Oppdater album photoCount (hvis albumId finnes)
    if (albumId) {
      try {
        const albumRef = doc(db, 'albums', albumId)
        const albumSnap = await getDoc(albumRef)
        if (albumSnap.exists()) {
          const currentCount = albumSnap.data().photoCount || 0
          await updateAlbumPhotoCount(albumId, currentCount + 1)
          console.log(`📂 Album photoCount oppdatert: ${albumId}`)
        }
      } catch (err) {
        console.warn('⚠️ Kunne ikke oppdatere album count:', err)
      }
    }

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
    console.log('✅ [EditedPhoto] Uploaded to R2:', editedUrl)

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
        console.log('✅ [EditedPhoto] Thumbnail uploaded:', thumbnailUrl)
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
      console.log('✅ [EditedPhoto] Preserving originalUrl:', currentPhotoData.url)
    }

    await updateDoc(doc(db, 'photos', photoId), updates)

    console.log(`✅ [EditedPhoto] Firestore updated for ${photoId}`)

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

    console.log('🔧 Starting migration: Adding userId to albums...')

    const albumsSnapshot = await getDocs(collection(db, 'albums'))
    let fixed = 0
    let skipped = 0

    for (const albumDoc of albumsSnapshot.docs) {
      const albumData = albumDoc.data()

      // If album missing userId, add current user's ID
      if (!albumData.userId) {
        console.log(
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

    console.log(
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

    console.log('🔧 Starting migration: Adding userId to photos...')

    const photosSnapshot = await getDocs(collection(db, 'photos'))
    let fixed = 0
    let skipped = 0

    for (const photoDoc of photosSnapshot.docs) {
      const photoData = photoDoc.data()

      // If photo missing userId, add current user's ID
      if (!photoData.userId) {
        console.log(
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

    console.log(
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
