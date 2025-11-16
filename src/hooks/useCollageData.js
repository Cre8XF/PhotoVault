// ============================================================================
// useCollageData Hook - Collage CRUD operations with Firestore
// Pattern follows usePhotoData.js for consistency
// ============================================================================
import { useCallback, useState } from 'react'
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
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../firebase'
import useStore from '../state/store'

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
 *   createdAt: Timestamp,
 *   updatedAt: Timestamp
 * }
 */
export const useCollageData = () => {
  const { t } = useTranslation(['collage'])

  // Reentrancy guards
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Zustand store selectors
  const user = useStore((state) => state.user)
  const setNotification = useStore((state) => state.setNotification)

  /**
   * Create a new collage
   * @param {Object} collageData - { title, photoIds, layoutId, transforms }
   * @returns {Promise<string>} - Collage ID
   */
  const createCollage = useCallback(
    async (collageData) => {
      if (!user?.uid) {
        throw new Error('No user logged in')
      }

      if (isSaving) {
        console.warn('⚠️ Save already in progress')
        return null
      }

      setIsSaving(true)

      try {
        const { title, photoIds, layoutId, transforms = {} } = collageData

        // Validate required fields
        if (!photoIds || photoIds.length === 0) {
          throw new Error('No photos provided')
        }
        if (!layoutId) {
          throw new Error('No layout selected')
        }

        // Prepare collage document
        const collageDoc = {
          userId: user.uid,
          title: title || `Collage ${new Date().toLocaleDateString()}`,
          photoIds: photoIds,
          layoutId: layoutId,
          transforms: transforms,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }

        console.log('💾 Creating collage:', collageDoc)

        // Add to Firestore
        const docRef = await addDoc(collection(db, 'collages'), collageDoc)

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
    [user, isSaving, setNotification, t]
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

      setIsLoading(true)

      try {
        const docRef = doc(db, 'collages', collageId)
        const docSnap = await getDoc(docRef)

        if (!docSnap.exists()) {
          console.warn('⚠️ Collage not found:', collageId)
          return null
        }

        const data = docSnap.data()

        return {
          id: docSnap.id,
          ...data,
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
    [setNotification, t]
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
        const q = query(
          collection(db, 'collages'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        )

        const snapshot = await getDocs(q)

        const collages = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate?.() || new Date(),
          updatedAt: doc.data().updatedAt?.toDate?.() || new Date()
        }))

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

      if (isSaving) {
        console.warn('⚠️ Update already in progress')
        return false
      }

      setIsSaving(true)

      try {
        const docRef = doc(db, 'collages', collageId)

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
    [isSaving, setNotification, t]
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

      if (isDeleting) {
        console.warn('⚠️ Delete already in progress')
        return false
      }

      setIsDeleting(true)

      try {
        const docRef = doc(db, 'collages', collageId)

        console.log('🗑️ Deleting collage:', collageId)

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
