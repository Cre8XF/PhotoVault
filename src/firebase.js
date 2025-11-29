// ============================================================================
// firebase.js – komplett integrasjon (v3.1) med konsolidert cover-funksjon
// ============================================================================
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { onSnapshot } from 'firebase/firestore'
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
} from 'firebase/firestore'
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from 'firebase/storage'

// 🔗 Firebase-konfig (from environment variables)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
}

// Validate required environment variables
const requiredEnvVars = [
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_AUTH_DOMAIN',
  'REACT_APP_FIREBASE_PROJECT_ID',
  'REACT_APP_FIREBASE_STORAGE_BUCKET',
]

const missingVars = requiredEnvVars.filter((varName) => !process.env[varName])
if (missingVars.length > 0) {
  console.error(
    '❌ Missing required environment variables:',
    missingVars.join(', ')
  )
  console.error(
    'Please check your .env file and ensure all Firebase config variables are set.'
  )
}

// 🚀 Initialiser Firebase
const app = initializeApp(firebaseConfig)
const db = getFirestore(app)
const storage = getStorage(app)
const auth = getAuth(app)

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
      updatedAt: new Date().toISOString()
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
  try {
    const refDoc = doc(db, 'photos', photoId)
    const newStatus = !currentStatus

    await updateDoc(refDoc, {
      favorite: newStatus,
      updatedAt: new Date().toISOString(),
    })

    console.log(`⭐ Favoritt oppdatert: ${photoId} → ${newStatus}`)
    return newStatus
  } catch (err) {
    console.error('🔥 toggleFavorite error:', err)
    console.error('PhotoId:', photoId, 'CurrentStatus:', currentStatus)
    throw err
  }
}

// 🔹 Slett bilde fra Firestore + Storage
export async function deletePhoto(photoId, storagePath) {
  try {
    if (storagePath) {
      const storageRef = ref(storage, storagePath)
      await deleteObject(storageRef)
    }
    await deleteDoc(doc(db, 'photos', photoId))
  } catch (err) {
    console.error('🔥 deletePhoto:', err)
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
  videoMetadata = null
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
      hasType: !!file.type
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

        await uploadBytes(thumbRef, thumbnailBlob)
        thumbnailUrl = await getDownloadURL(thumbRef)
        console.log('✅ [Upload] Thumbnail uploaded:', thumbnailUrl)
      } catch (thumbError) {
        console.error('❌ [Upload] Thumbnail upload failed:', thumbError)
        // Continue without thumbnail
      }
    }

    // 2. Upload main file to Storage
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

    // 3. Prepare metadata
    const photoData = {
      name: file.name,
      url: downloadURL,
      userId: userId,
      albumId: albumId,
      storagePath: storagePath,
      size: file.size,
      type: isVideo ? 'video' : fileType, // Use string "video" for videos, not MIME type
      favorite: false,

      // Video-specific fields
      ...(isVideo && {
        thumbnailUrl: thumbnailUrl,
        metadata: videoMetadata || {
          duration: 0,
          resolution: 'unknown',
          fps: null,
        },
      }),

      // AI-felt (Fase 4.0)
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

      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // 3. AI-tagging – deaktivert i Pixtr MVP
if (aiTagging) {
  console.log("🤖 AI-tagging er deaktivert i denne versjonen (MVP).");
  photoData.aiTags = [];
  photoData.faces = 0;
  photoData.category = null;
  photoData.aiAnalyzed = false;
  photoData.analyzedAt = null;
}

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
    await uploadBytes(storageRef, blob)
    const downloadURL = await getDownloadURL(storageRef)
    return { downloadURL, storagePath }
  } catch (error) {
    console.error('🔥 uploadThumbnail:', error)
    throw new Error(error.message)
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
export { db, storage, auth }
