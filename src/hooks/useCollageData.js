// ============================================================================
// useCollageData Hook - Collage CRUD operations with Firestore
// Pattern follows usePhotoData.js for consistency
// ============================================================================
import { useCallback, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore'
import { devLog } from '../utils/log'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage, auth } from '../firebase'
import useStore from '../state/store'
import { renderCollageThumbnail, renderCollageToCanvas } from '../utils/renderCollageToCanvas'
import { uploadWithFallback, deleteFromR2, extractStoragePathFromR2Url } from '../utils/r2Upload'
import { LAYOUTS_V3 } from '../features/collage/layouts/layouts_v3'
import useAuth from './useAuth' // ✅ P0: For email verification check

/**
 * Listen to user's collages in real-time
 * @param {string} userId - User ID
 * @param {function} callback - Called with updated collages array
 * @returns {function} Unsubscribe function
 */
function listenToCollagesByUser(userId, callback) {
  const colRef = collection(db, 'users', userId, 'collages')
  const q = query(colRef, orderBy('createdAt', 'desc'))

  const unsubscribe = onSnapshot(
    q,
    (snapshot) => {
      const collages = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          ...data,
          id: doc.id,
          collageId: doc.id,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date()
        }
      })
      devLog('📥 [useCollageData] Collages updated from Firestore:', collages.length)
      callback(collages)
    },
    (error) => {
      console.error('❌ Collages listener error:', error)
    }
  )

  return unsubscribe
}

/**
 * Custom hook for collage data management
 * Handles all CRUD operations for collages
 *
 * Collage Document Structure:
 * {
 *   id: string,
 *   userId: string,
 *   title: string,
 *   photoIds: string[],
 *   layoutId: string,
 *   transforms: { [photoId]: { scale, translateX, translateY } },
 *   thumbnailUrl: string,
 *   createdAt: Timestamp,
 *   updatedAt: Timestamp
 * }
 */
export const useCollageData = () => {
  const { t } = useTranslation(['collage'])
  const { ensureEmailVerified } = useAuth() // ✅ P0: Email verification check

  // Reentrancy guards
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Real-time collages state
  const [collages, setCollages] = useState([])
  const [collagesLoading, setCollagesLoading] = useState(true)

  // Zustand store selectors
  const user = useStore((state) => state.user)
  const setNotification = useStore((state) => state.setNotification)

  // ============================================================
  // Real-time listener for collages
  // ============================================================
  useEffect(() => {
    if (!user?.uid) {
      setCollages([])
      setCollagesLoading(false)
      return
    }

    devLog('✅ [useCollageData] Setting up Firestore listener for collages')
    setCollagesLoading(true)

    const unsubscribe = listenToCollagesByUser(user.uid, (updatedCollages) => {
      setCollages(updatedCollages)
      setCollagesLoading(false)
    })

    // Cleanup on unmount or user change
    return () => {
      devLog('🧹 [useCollageData] Cleaning up Firestore listener')
      unsubscribe()
    }
  }, [user?.uid])

  /**
   * Create a new collage
   * @param {Object} collageData - { title, photoIds, layoutId, transforms, photos, layout }
   * @returns {Promise<string>} - Collage ID
   */
  const createCollage = useCallback(
    async (collageData) => {
      // ✅ P0: EMAIL VERIFICATION GATING
      if (!ensureEmailVerified()) {
        return null // Abort collage creation if email not verified
      }

      if (!user?.uid) {
        throw new Error('No user logged in')
      }

      if (isSaving) {
        console.warn('⚠️ Save already in progress')
        return null
      }

      setIsSaving(true)

      try {
        const { title, photoIds, layoutId, transforms = {}, photos, layout } = collageData

        // Validate required fields
        if (!photoIds || photoIds.length === 0) {
          throw new Error('No photos provided')
        }
        if (!layoutId) {
          throw new Error('No layout selected')
        }

        // Get layout if not provided
        const collageLayout = layout || Object.values(LAYOUTS_V3).find(l => l.id === layoutId)
        if (!collageLayout) {
          throw new Error('Layout not found')
        }

        // Generate thumbnail
        let thumbnailUrl = null
        if (photos && photos.length > 0 && collageLayout) {
          try {
            console.log('🖼️ Generating collage thumbnail...')

            // Render thumbnail
            const thumbnailBlob = await renderCollageThumbnail({
              layout: collageLayout,
              photos: photos,
              transforms: transforms,
              maxWidth: 800
            })

            // Upload thumbnail to Storage
            const timestamp = Date.now()
            const thumbnailPath = `users/${user.uid}/collages/thumbnails/${timestamp}.jpg`
            const thumbnailRef = ref(storage, thumbnailPath)

            await uploadBytes(thumbnailRef, thumbnailBlob, {
              contentType: 'image/jpeg'
            })

            thumbnailUrl = await getDownloadURL(thumbnailRef)

            console.log('✅ Thumbnail uploaded:', thumbnailUrl)
          } catch (thumbError) {
            console.error('⚠️ Thumbnail generation failed:', thumbError)
            // Continue without thumbnail - not critical
          }
        }

        // Generate and upload full-size collage to R2
        let collageImageUrl = null
        let collageStoragePath = null
        if (photos && photos.length > 0 && collageLayout) {
          try {
            console.log('🖼️ Generating full-size collage image...')

            // Render full-size collage
            const collageBlob = await renderCollageToCanvas({
              layout: collageLayout,
              photos: photos,
              transforms: transforms,
              options: {
                quality: 0.9,
                useHighRes: true
              }
            })

            // Get Firebase token for R2 authentication
            const currentUser = auth.currentUser
            if (!currentUser) {
              throw new Error('User not authenticated')
            }
            const firebaseToken = await currentUser.getIdToken()

            // Construct storage path for collage
            const timestamp = Date.now()
            collageStoragePath = `users/${user.uid}/collages/${timestamp}_collage.jpg`

            // Upload to R2
            const { url: r2Url } = await uploadWithFallback(
              collageBlob,
              collageStoragePath,
              'image/jpeg',
              {
                userId: user.uid,
                type: 'collage',
                uploadedAt: new Date().toISOString()
              },
              null, // No Firebase fallback for collages
              user.uid,
              firebaseToken
            )

            collageImageUrl = r2Url

            console.log('✅ Full collage uploaded to R2:', collageImageUrl)
          } catch (collageError) {
            console.error('⚠️ Full collage upload failed:', collageError)
            // Continue without full collage - not critical for MVP
          }
        }

        // Prepare collage document
        const collageDoc = {
          userId: user.uid,
          title: title || `Collage ${new Date().toLocaleDateString()}`,
          photoIds: photoIds,
          layoutId: layoutId,
          transforms: transforms,
          type: 'collage',
          ...(thumbnailUrl && { thumbnailUrl }),
          ...(collageImageUrl && {
            imageUrl: collageImageUrl,
            url: collageImageUrl, // Alias for compatibility with photo listing
            storagePath: collageStoragePath,
            storageBackend: 'r2'
          }),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }

        console.log('💾 Creating collage:', collageDoc)

        // Add to Firestore (user's collages subcollection)
        const docRef = await addDoc(collection(db, 'users', user.uid, 'collages'), collageDoc)

        console.log('✅ Collage created with ID:', docRef.id)

        setNotification({
          message: t('collage:notifications.collageSaved'),
          type: 'success'
        })

        return docRef.id
      } catch (error) {
        console.error('❌ Error creating collage:', error)
        setNotification({
          message: t('collage:notifications.saveFailed'),
          type: 'error'
        })
        throw error
      } finally {
        setIsSaving(false)
      }
    },
    [user, isSaving, setNotification, t, ensureEmailVerified]
  )

  /**
   * Get a collage by ID
   * @param {string} collageId - Collage document ID
   * @returns {Promise<Object|null>} - Collage data or null
   */
  const getCollage = useCallback(
    async (collageId) => {
      if (!collageId) {
        console.warn('⚠️ getCollage called without collageId')
        return null
      }

      if (!user?.uid) {
        console.warn('⚠️ getCollage called without user')
        return null
      }

      setIsLoading(true)

      try {
        const docRef = doc(db, 'users', user.uid, 'collages', collageId)
        const docSnap = await getDoc(docRef)

        if (!docSnap.exists()) {
          console.warn('⚠️ Collage not found:', collageId)
          return null
        }

        const data = docSnap.data()

        return {
          ...data,
          id: docSnap.id, // Document ID always takes precedence
          collageId: docSnap.id, // Also set collageId for compatibility
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date()
        }
      } catch (error) {
        console.error('❌ Error getting collage:', error)
        setNotification({
          message: t('collage:notifications.loadFailed'),
          type: 'error'
        })
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [user, setNotification, t]
  )

  /**
   * Get all collages for current user
   * @returns {Promise<Array>} - Array of collage objects
   */
  const getCollagesByUser = useCallback(
    async () => {
      if (!user?.uid) {
        console.warn('⚠️ getCollagesByUser called without user')
        return []
      }

      setIsLoading(true)

      try {
        // Query user's collages subcollection (no where clause needed)
        const q = query(
          collection(db, 'users', user.uid, 'collages'),
          orderBy('createdAt', 'desc')
        )

        const snapshot = await getDocs(q)

        const collages = snapshot.docs.map(doc => {
          const data = doc.data()
          return {
            ...data,
            id: doc.id, // Document ID always takes precedence
            collageId: doc.id, // Also set collageId for compatibility
            createdAt: data.createdAt?.toDate?.() || new Date(),
            updatedAt: data.updatedAt?.toDate?.() || new Date()
          }
        })

        console.log('✅ Loaded', collages.length, 'collages')

        return collages
      } catch (error) {
        console.error('❌ Error getting collages:', error)
        setNotification({
          message: t('collage:notifications.loadFailed'),
          type: 'error'
        })
        return []
      } finally {
        setIsLoading(false)
      }
    },
    [user, setNotification, t]
  )

  /**
   * Update an existing collage
   * @param {string} collageId - Collage document ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<boolean>} - Success status
   */
  const updateCollage = useCallback(
    async (collageId, updates) => {
      if (!collageId) {
        throw new Error('No collage ID provided')
      }

      if (!user?.uid) {
        throw new Error('No user logged in')
      }

      if (isSaving) {
        console.warn('⚠️ Update already in progress')
        return false
      }

      setIsSaving(true)

      try {
        const docRef = doc(db, 'users', user.uid, 'collages', collageId)

        const updateData = {
          ...updates,
          updatedAt: serverTimestamp()
        }

        // Don't allow updating userId or createdAt
        delete updateData.userId
        delete updateData.createdAt

        console.log('💾 Updating collage:', collageId, updateData)

        await updateDoc(docRef, updateData)

        console.log('✅ Collage updated')

        setNotification({
          message: t('collage:notifications.collageUpdated'),
          type: 'success'
        })

        return true
      } catch (error) {
        console.error('❌ Error updating collage:', error)
        setNotification({
          message: t('collage:notifications.updateFailed'),
          type: 'error'
        })
        return false
      } finally {
        setIsSaving(false)
      }
    },
    [user, isSaving, setNotification, t]
  )

  /**
   * Delete a collage
   * @param {string} collageId - Collage document ID
   * @returns {Promise<boolean>} - Success status
   */
  const deleteCollage = useCallback(
    async (collageId) => {
      if (!collageId) {
        throw new Error('No collage ID provided')
      }

      if (!user?.uid) {
        throw new Error('No user logged in')
      }

      if (isDeleting) {
        console.warn('⚠️ Delete already in progress')
        return false
      }

      setIsDeleting(true)

      try {
        // V2 collages are in users/{uid}/collages subcollection
        const docRef = doc(db, 'users', user.uid, 'collages', collageId)

        console.log('🗑️ Deleting collage:', collageId)

        // Get collage data to find thumbnail URL and R2 storage
        const collageSnap = await getDoc(docRef)
        if (collageSnap.exists()) {
          const collageData = collageSnap.data()

          // Delete static collage image from R2 if it exists
          if (collageData.staticStorageBackend === 'r2' && collageData.staticStoragePath) {
            try {
              const currentUser = auth.currentUser
              if (!currentUser) {
                throw new Error('User not authenticated')
              }
              const firebaseToken = await currentUser.getIdToken()

              await deleteFromR2(collageData.staticStoragePath, firebaseToken)
              console.log('🗑️ Static collage deleted from R2:', collageData.staticStoragePath)
            } catch (r2Error) {
              console.warn('⚠️ Could not delete static collage from R2:', r2Error)
              // Continue with collage deletion even if R2 deletion fails
            }
          }

          // Also delete old-style collage from R2 if it exists (v1 compatibility)
          // Delete full collage from R2 if it exists
          if (collageData.storageBackend === 'r2' && collageData.storagePath) {
            try {
              const currentUser = auth.currentUser
              if (!currentUser) {
                throw new Error('User not authenticated')
              }
              const firebaseToken = await currentUser.getIdToken()

              await deleteFromR2(collageData.storagePath, firebaseToken)
              console.log('🗑️ Collage deleted from R2:', collageData.storagePath)
            } catch (r2Error) {
              console.warn('⚠️ Could not delete collage from R2:', r2Error)
              // Continue with collage deletion even if R2 deletion fails
            }
          }

          // Delete thumbnail from Storage if it exists
          if (collageData.thumbnailUrl) {
            try {
              // Extract path from URL or use pattern
              const thumbnailPath = `users/${collageData.userId}/collages/thumbnails/`
              const filename = collageData.thumbnailUrl.split('/').pop().split('?')[0]
              const fullPath = thumbnailPath + decodeURIComponent(filename)

              const thumbnailRef = ref(storage, fullPath)
              await deleteObject(thumbnailRef)
              console.log('🗑️ Thumbnail deleted from Storage')
            } catch (storageError) {
              console.warn('⚠️ Could not delete thumbnail:', storageError)
              // Continue with collage deletion even if thumbnail deletion fails
            }
          }
        }

        // Delete Firestore document
        await deleteDoc(docRef)

        console.log('✅ Collage deleted')

        setNotification({
          message: t('collage:notifications.collageDeleted'),
          type: 'success'
        })

        return true
      } catch (error) {
        console.error('❌ Error deleting collage:', error)
        setNotification({
          message: t('collage:notifications.deleteFailed'),
          type: 'error'
        })
        return false
      } finally {
        setIsDeleting(false)
      }
    },
    [isDeleting, setNotification, t]
  )

  return {
    // Real-time data
    collages,
    collagesLoading,

    // CRUD operations
    createCollage,
    getCollage,
    getCollagesByUser,
    updateCollage,
    deleteCollage,

    // Loading states
    isSaving,
    isLoading,
    isDeleting
  }
}

export default useCollageData
