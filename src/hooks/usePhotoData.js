// ============================================================================
// usePhotoData Hook - Phase 1: R2 METADATA PERSISTENCE
// ============================================================================
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { doc, deleteDoc } from 'firebase/firestore'
import {
  getAlbumsByUser,
  getPhotosByUser,
  addAlbum,
  updateAlbum,
  uploadPhoto,
  updatePhoto,
  deletePhoto,
  setAlbumCover,
  updateAlbumPhotoCount,
  updatePhotoCaption,
} from '../firebase'
import { db } from '../firebase'
import useStore from '../state/store'

// PHASE 1: Firestore listeners removed - using R2 metadata instead

/**
 * Custom hook for photo and album data management
 * Handles all CRUD operations for photos and albums
 *
 * 🔒 PHASE 4.1 UPDATE: Fixed dependencies and added array validation
 */
export const usePhotoData = () => {
  const { t } = useTranslation(['common'])

  // Reentrancy guards (Phase 3)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false)

  // Zustand store selectors
  const user = useStore((state) => state.user)
  const albums = useStore((state) => state.albums)
  const photos = useStore((state) => state.photos)
  const setAlbums = useStore((state) => state.setAlbums)
  const setPhotos = useStore((state) => state.setPhotos)
  const setNotification = useStore((state) => state.setNotification)
  const setConfirmModal = useStore((state) => state.setConfirmModal)
  const updateStorageUsed = useStore((state) => state.updateStorageUsed)
  const currentPage = useStore((state) => state.currentPage)
  const selectedAlbum = useStore((state) => state.selectedAlbum)
  const setCurrentPage = useStore((state) => state.setCurrentPage)
  const setSelectedAlbum = useStore((state) => state.setSelectedAlbum)
  const closePhotoModal = useStore((state) => state.closePhotoModal)
  const saveMetadata = useStore((state) => state.saveMetadata) // R2 metadata persistence

  /**
   * Refresh all data (albums + photos) for current user from R2
   * R2 METADATA ARCHITECTURE: Load from R2, NOT from Firestore
   */
  const refreshAllData = useCallback(
    async (uid) => {
      if (!uid) {
        console.warn('⚠️ refreshAllData called without uid')
        return { albums: [], photos: [] }
      }

      try {
        console.log('🔄 [usePhotoData] Refreshing metadata from R2...')

        // Get ID token
        const idToken = user?.uid ? await user.getIdToken() : null
        if (!idToken) {
          console.error('❌ [usePhotoData] No ID token available')
          throw new Error('No authentication token')
        }

        // Load metadata from R2 via store's loadMetadata
        const loadMetadataFn = useStore.getState().loadMetadata
        const result = await loadMetadataFn(uid, idToken)

        if (!result.success) {
          throw new Error(result.error || 'Failed to load metadata')
        }

        // Metadata is already loaded into the store by loadMetadata
        // Just get the current state
        const currentState = useStore.getState()
        const safeAlbums = Array.isArray(currentState.albums) ? currentState.albums : []
        const safePhotos = Array.isArray(currentState.photos) ? currentState.photos : []

        console.log('✅ Refresh complete from R2:', {
          albums: safeAlbums.length,
          photos: safePhotos.length,
        })

        updateStorageUsed()

        return { albums: safeAlbums, photos: safePhotos }
      } catch (err) {
        console.error('❌ Error refreshing data from R2:', err)
        setNotification({
          message: t('common:notifications.errorLoadingData'),
          type: 'error',
        })

        // On error, DON'T reset to empty - keep existing data
        const currentState = useStore.getState()
        return {
          albums: Array.isArray(currentState.albums) ? currentState.albums : [],
          photos: Array.isArray(currentState.photos) ? currentState.photos : [],
        }
      }
    },
    [user, updateStorageUsed, setNotification, t]
  )

  // Alias for backwards compatibility
  const refreshData = refreshAllData

  /**
   * R2 METADATA ARCHITECTURE:
   * Metadata is loaded from R2 on login via useAuth hook
   * This effect only runs once to confirm the user is logged in
   * DO NOT clear data here as it races with metadata loading
   */
  useEffect(() => {
    if (user?.uid) {
      console.log('✅ [usePhotoData] User authenticated, metadata should be loaded from R2 via useAuth')
    } else {
      console.log('⏸ [usePhotoData] No user authenticated yet')
    }
    // DO NOT clear albums/photos here - it races with metadata loading
    // Clearing happens in store.logout() instead
  }, [user?.uid])

  /**
   * Handle photo upload
   * PHASE 4: Refresh only after upload - photos appear immediately
   */
  const handleUpload = useCallback(
    async (selectedFiles, albumId, aiTagging = false) => {
      // GUARD: Prevent duplicate uploads
      if (isUploading) {
        console.warn('⚠️ Upload already in progress, ignoring duplicate call')
        return
      }

      if (!user) {
        setNotification({
          message: t('common:notifications.mustBeLoggedIn'),
          type: 'error',
        })
        return
      }

      setIsUploading(true)

      try {
        let successCount = 0

        for (const fileObj of selectedFiles) {
          // Pass thumbnail and metadata for videos
          await uploadPhoto(
            user.uid,
            fileObj.file,
            albumId,
            aiTagging,
            fileObj.thumbnail || null,
            fileObj.metadata || null
          )
          successCount++
        }

        // Refresh to get newly uploaded photos with their IDs
        await refreshAllData(user.uid)

        const message = aiTagging
          ? t('common:notifications.photosUploadedWithAI', {
              count: successCount,
            })
          : t('common:notifications.photosUploaded', { count: successCount })

        setNotification({ message, type: 'success' })
      } catch (error) {
        console.error('❌ Upload error:', error)
        setNotification({
          message: t('common:notifications.uploadError', {
            message: error.message,
          }),
          type: 'error',
        })
        throw error
      } finally {
        setIsUploading(false)
      }
    },
    [isUploading, user, refreshAllData, setNotification, t]
  )

  /**
   * Update existing album
   * PHASE 4: Optimistic update - UI updates immediately, no full refresh
   */
  const handleAlbumSave = useCallback(
    async (albumData, editingAlbum = null) => {
      // GUARD: Prevent duplicate calls
      if (isSaving) {
        console.warn(
          '⚠️ Album save already in progress, ignoring duplicate call'
        )
        return
      }

      setIsSaving(true)

      try {
        if (!editingAlbum) {
          console.error('❌ handleAlbumSave called without editingAlbum')
          throw new Error('Album creation must be done through UploadModal')
        }

        // OPTIMISTIC UPDATE - Update UI immediately
        setAlbums((prev) => {
          const safePrev = Array.isArray(prev) ? prev : []
          return safePrev.map((album) =>
            album.id === editingAlbum.id ? { ...album, ...albumData } : album
          )
        })

        // Persist to R2
        saveMetadata() // Debounced

        // Sync to backend in background
        await updateAlbum(editingAlbum.id, albumData)

        setNotification({
          message: t('common:notifications.albumUpdated'),
          type: 'success',
        })
      } catch (err) {
        console.error('❌ Album save error:', err)

        // ROLLBACK - Refresh from server if it fails
        if (user?.uid) {
          await refreshAllData(user.uid)
        }

        setNotification({
          message: t('common:notifications.albumSaveError'),
          type: 'error',
        })
        throw err
      } finally {
        setIsSaving(false)
      }
    },
    [isSaving, user?.uid, setAlbums, refreshAllData, setNotification, t]
  )

  /**
   * Create album from upload modal (returns album ID)
   */
  const handleCreateAlbumFromUpload = useCallback(
    async (albumData) => {
      try {
        // Album already created by UploadModal - just refresh UI
        if (user?.uid) {
          await refreshAllData(user.uid)
        }

        return albumData.id
      } catch (err) {
        console.error('❌ Album creation error:', err)
        setNotification({
          message: t('common:notifications.albumCreationError'),
          type: 'error',
        })
        throw err
      }
    },
    [user?.uid, refreshAllData, setNotification, t]
  )

  /**
   * Delete album with confirmation
   * PHASE 4: Optimistic update - Album disappears immediately
   */
  const handleDeleteAlbum = useCallback(
    (album) => {
      const safePhotos = Array.isArray(photos) ? photos : []
      const albumPhotos = safePhotos.filter((p) => p.albumId === album.id)
      const photosNote =
        albumPhotos.length > 0
          ? t('common:notifications.deleteAlbumPhotosNote', {
              count: albumPhotos.length,
            })
          : t('common:notifications.deleteAlbumEmptyNote')

      setConfirmModal({
        title: t('common:notifications.deleteAlbumTitle'),
        message: t('common:notifications.deleteAlbumMessage', {
          name: album.name,
          photos: photosNote,
        }),
        onConfirm: async () => {
          if (isDeleting) {
            console.warn(
              '⚠️ Delete already in progress, ignoring duplicate call'
            )
            return
          }

          setIsDeleting(true)

          try {
            // OPTIMISTIC UPDATE
            setAlbums((prev) => {
              const safePrev = Array.isArray(prev) ? prev : []
              return safePrev.filter((a) => a.id !== album.id)
            })

            setPhotos((prev) => {
              const safePrev = Array.isArray(prev) ? prev : []
              return safePrev.map((p) =>
                p.albumId === album.id ? { ...p, albumId: null } : p
              )
            })

            // Persist to R2
            saveMetadata() // Debounced

            // Navigate away if viewing this album
            if (currentPage === 'album' && selectedAlbum?.id === album.id) {
              setCurrentPage('albums')
              setSelectedAlbum(null)
            }

            // Sync to backend
            for (const photo of albumPhotos) {
              await updatePhoto(photo.id, { albumId: null })
            }
            await deleteDoc(doc(db, 'albums', album.id))

            setNotification({
              message: t('common:notifications.albumDeleted'),
              type: 'success',
            })
          } catch (err) {
            console.error('❌ Delete album error:', err)

            // ROLLBACK
            if (user?.uid) {
              await refreshAllData(user.uid)
            }

            setNotification({
              message: t('common:notifications.albumDeleteError'),
              type: 'error',
            })
            throw err
          } finally {
            setIsDeleting(false)
          }
        },
      })
    },
    [
      isDeleting,
      user?.uid,
      photos,
      setAlbums,
      setPhotos,
      refreshAllData,
      currentPage,
      selectedAlbum,
      setConfirmModal,
      setNotification,
      setCurrentPage,
      setSelectedAlbum,
      t,
    ]
  )

  /**
   * Delete photo with confirmation
   * PHASE 4: Optimistic update
   */
  const handleDeletePhoto = useCallback(
    (photo) => {
      setConfirmModal({
        title: t('common:notifications.deletePhotoTitle'),
        message: t('common:notifications.deletePhotoMessage'),
        onConfirm: async () => {
          if (isDeleting) {
            console.warn(
              '⚠️ Delete already in progress, ignoring duplicate call'
            )
            return
          }

          setIsDeleting(true)

          try {
            // OPTIMISTIC UPDATE
            setPhotos((prev) => {
              const safePrev = Array.isArray(prev) ? prev : []
              return safePrev.filter((p) => p.id !== photo.id)
            })

            // Persist to R2
            saveMetadata() // Debounced

            closePhotoModal()

            // Sync to backend
            await deletePhoto(photo.id, photo.storagePath)

            setNotification({
              message: t('common:notifications.photoDeleted'),
              type: 'success',
            })
          } catch (err) {
            console.error('❌ Delete photo error:', err)

            // ROLLBACK
            if (user?.uid) {
              await refreshAllData(user.uid)
            }

            setNotification({
              message: t('common:notifications.photoDeleteError'),
              type: 'error',
            })
            throw err
          } finally {
            setIsDeleting(false)
          }
        },
      })
    },
    [
      isDeleting,
      user?.uid,
      setPhotos,
      refreshAllData,
      closePhotoModal,
      setConfirmModal,
      setNotification,
      t,
    ]
  )

  /**
   * Toggle favorite status
   * PHASE 4: Optimistic update
   */
  const toggleFavorite = useCallback(
    async (photo) => {
      if (isTogglingFavorite) {
        console.warn(
          '⚠️ Toggle favorite already in progress, ignoring duplicate call'
        )
        return
      }

      setIsTogglingFavorite(true)

      try {
        const newFavoriteState = !photo.favorite

        // OPTIMISTIC UPDATE
        setPhotos((prev) => {
          const safePrev = Array.isArray(prev) ? prev : []
          return safePrev.map((p) =>
            p.id === photo.id ? { ...p, favorite: newFavoriteState } : p
          )
        })

        // Persist to R2
        saveMetadata() // Debounced

        // Sync to backend
        await updatePhoto(photo.id, { favorite: newFavoriteState })

        setNotification({
          message: newFavoriteState
            ? t('common:notifications.addedToFavorites')
            : t('common:notifications.removedFromFavorites'),
          type: 'success',
        })
      } catch (err) {
        console.error('❌ Error toggling favorite:', err)

        // ROLLBACK
        if (user?.uid) {
          await refreshAllData(user.uid)
        }

        setNotification({
          message: t('common:notifications.updateError'),
          type: 'error',
        })
        throw err
      } finally {
        setIsTogglingFavorite(false)
      }
    },
    [
      isTogglingFavorite,
      user?.uid,
      setPhotos,
      refreshAllData,
      setNotification,
      t,
    ]
  )

  /**
   * Update photo caption
   */
  const updateCaption = useCallback(
    async (photoId, caption) => {
      try {
        await updatePhotoCaption(photoId, caption, user?.uid)

        // Update local state
        setPhotos((prev) => {
          const safePrev = Array.isArray(prev) ? prev : []
          return safePrev.map((p) =>
            p.id === photoId
              ? { ...p, caption, captionUpdatedAt: new Date().toISOString() }
              : p
          )
        })

        // Persist to R2
        saveMetadata() // Debounced

        setNotification({
          message: t('common:captionSaved'),
          type: 'success',
        })
      } catch (error) {
        console.error('Error updating caption:', error)
        setNotification({
          message: t('common:errorOccurred'),
          type: 'error',
        })
      }
    },
    [user?.uid, setPhotos, setNotification, t]
  )

  /**
   * Get photos by album ID
   */
  const getPhotosByAlbum = useCallback(
    (albumId) => {
      const safePhotos = Array.isArray(photos) ? photos : []
      return safePhotos.filter((photo) => photo.albumId === albumId)
    },
    [photos]
  )

  /**
   * Get photos without album
   */
  const getPhotosWithoutAlbum = useCallback(() => {
    const safePhotos = Array.isArray(photos) ? photos : []
    return safePhotos.filter((photo) => !photo.albumId)
  }, [photos])

  /**
   * Get favorite photos
   */
  const getFavoritePhotos = useCallback(() => {
    const safePhotos = Array.isArray(photos) ? photos : []
    return safePhotos.filter((photo) => photo.favorite)
  }, [photos])

  /**
   * Set album cover image
   * PHASE 4: Optimistic update
   */
  const handleSetAlbumCover = useCallback(
    async (albumId, coverUrl) => {
      if (isSaving) {
        console.warn(
          '⚠️ Save operation already in progress, ignoring duplicate call'
        )
        return
      }

      setIsSaving(true)

      try {
        // OPTIMISTIC UPDATE
        setAlbums((prev) => {
          const safePrev = Array.isArray(prev) ? prev : []
          return safePrev.map((album) =>
            album.id === albumId ? { ...album, cover: coverUrl } : album
          )
        })

        // Persist to R2
        saveMetadata() // Debounced

        // Sync to backend
        await setAlbumCover(albumId, coverUrl)

        setNotification({
          message: t('common:notifications.coverUpdated'),
          type: 'success',
        })
      } catch (err) {
        console.error('❌ Set album cover error:', err)

        // ROLLBACK
        if (user?.uid) {
          await refreshAllData(user.uid)
        }

        setNotification({
          message: t('common:notifications.coverUpdateError'),
          type: 'error',
        })
        throw err
      } finally {
        setIsSaving(false)
      }
    },
    [isSaving, user?.uid, setAlbums, refreshAllData, setNotification, t]
  )

  /**
   * Update album photo count
   * PHASE 4: Optimistic update
   */
  const handleUpdatePhotoCount = useCallback(
    async (albumId, count) => {
      if (isSaving) {
        console.warn(
          '⚠️ Save operation already in progress, ignoring duplicate call'
        )
        return
      }

      setIsSaving(true)

      try {
        // OPTIMISTIC UPDATE
        setAlbums((prev) => {
          const safePrev = Array.isArray(prev) ? prev : []
          return safePrev.map((album) =>
            album.id === albumId ? { ...album, photoCount: count } : album
          )
        })

        // Persist to R2
        saveMetadata() // Debounced

        // Sync to backend
        await updateAlbumPhotoCount(albumId, count)
      } catch (err) {
        console.error('❌ Update photo count error:', err)

        // ROLLBACK
        if (user?.uid) {
          await refreshAllData(user.uid)
        }

        setNotification({
          message: t('common:notifications.updateError'),
          type: 'error',
        })
        throw err
      } finally {
        setIsSaving(false)
      }
    },
    [isSaving, user?.uid, setAlbums, refreshAllData, setNotification, t]
  )

  return {
    // Data - Always return safe arrays
    albums: Array.isArray(albums) ? albums : [],
    photos: Array.isArray(photos) ? photos : [],

    // Actions
    refreshData,
    handleUpload,
    handleAlbumSave,
    handleCreateAlbumFromUpload,
    handleDeleteAlbum,
    handleDeletePhoto,
    handleSetAlbumCover,
    handleUpdatePhotoCount,
    toggleFavorite,
    updateCaption,

    // Utilities
    getPhotosByAlbum,
    getPhotosWithoutAlbum,
    getFavoritePhotos,

    // Guard states (for UI feedback)
    isSaving,
    isDeleting,
    isUploading,
    isTogglingFavorite,
  }
}

export default usePhotoData
