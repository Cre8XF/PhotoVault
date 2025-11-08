// ============================================================================
// usePhotoData Hook - Phase 3: Photo & Album Data Management with Guards
// ============================================================================
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { doc, deleteDoc } from 'firebase/firestore';
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
} from '../firebase';
import { db } from '../firebase';
import useStore from '../state/store';

/**
 * Custom hook for photo and album data management
 * Handles all CRUD operations for photos and albums
 */
export const usePhotoData = () => {
  const { t } = useTranslation(['common']);

  // Reentrancy guards (Phase 3)
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);

  // Zustand store selectors
  const user = useStore((state) => state.user);
  const albums = useStore((state) => state.albums);
  const photos = useStore((state) => state.photos);
  const setAlbums = useStore((state) => state.setAlbums);
  const setPhotos = useStore((state) => state.setPhotos);
  const setNotification = useStore((state) => state.setNotification);
  const setConfirmModal = useStore((state) => state.setConfirmModal);
  const updateStorageUsed = useStore((state) => state.updateStorageUsed);
  const currentPage = useStore((state) => state.currentPage);
  const selectedAlbum = useStore((state) => state.selectedAlbum);
  const setCurrentPage = useStore((state) => state.setCurrentPage);
  const setSelectedAlbum = useStore((state) => state.setSelectedAlbum);
  const closePhotoModal = useStore((state) => state.closePhotoModal);

  /**
   * Refresh all data (albums + photos) for current user
   */
  const refreshData = useCallback(async (uid = user?.uid) => {
    if (!uid) return;

    try {
      const [albumData, photoData] = await Promise.all([
        getAlbumsByUser(uid),
        getPhotosByUser(uid)
      ]);

      setAlbums(albumData);
      setPhotos(photoData);
      updateStorageUsed();

      return { albums: albumData, photos: photoData };
    } catch (err) {
      console.error('Error refreshing data:', err);
      setNotification({
        message: t('common:notifications.errorLoadingData'),
        type: 'error'
      });
      return { albums: [], photos: [] };
    }
  }, [user?.uid, setAlbums, setPhotos, updateStorageUsed, setNotification, t]);

  /**
   * Auto-refresh data when user changes
   */
  useEffect(() => {
    if (user?.uid) {
      refreshData(user.uid);
    } else {
      setAlbums([]);
      setPhotos([]);
    }
  }, [user?.uid]); // Only depend on user.uid to avoid infinite loops

  /**
   * Handle photo upload
   */
  const handleUpload = useCallback(async (selectedFiles, albumId, aiTagging = false) => {
    // GUARD: Prevent duplicate uploads
    if (isUploading) {
      console.warn('Upload already in progress, ignoring duplicate call');
      return;
    }

    if (!user) {
      setNotification({
        message: t('common:notifications.mustBeLoggedIn'),
        type: 'error'
      });
      return;
    }

    setIsUploading(true);

    try {
      let successCount = 0;

      for (const fileObj of selectedFiles) {
        // Pass thumbnail and metadata for videos
        await uploadPhoto(
          user.uid,
          fileObj.file,
          albumId,
          aiTagging,
          fileObj.thumbnail || null,
          fileObj.metadata || null
        );
        successCount++;
      }

      await refreshData();

      const message = aiTagging
        ? t('common:notifications.photosUploadedWithAI', { count: successCount })
        : t('common:notifications.photosUploaded', { count: successCount });

      setNotification({ message, type: 'success' });
    } catch (error) {
      console.error('Upload error:', error);
      setNotification({
        message: t('common:notifications.uploadError', { message: error.message }),
        type: 'error'
      });
      throw error;
    } finally {
      setIsUploading(false);
    }
  }, [isUploading, user, refreshData, setNotification, t]);

  /**
   * Update existing album
   * Note: Album creation is handled exclusively by UploadModal
   */
  const handleAlbumSave = useCallback(async (albumData, editingAlbum = null) => {
    // GUARD: Prevent duplicate calls
    if (isSaving) {
      console.warn('Album save already in progress, ignoring duplicate call');
      return;
    }

    setIsSaving(true);

    try {
      if (!editingAlbum) {
        // This should never happen in current architecture
        console.error('handleAlbumSave called without editingAlbum - use UploadModal for creation');
        throw new Error('Album creation must be done through UploadModal');
      }

      await updateAlbum(editingAlbum.id, albumData);
      setNotification({
        message: t('common:notifications.albumUpdated'),
        type: 'success'
      });

      await refreshData();
    } catch (err) {
      console.error('Album save error:', err);
      setNotification({
        message: t('common:notifications.albumSaveError'),
        type: 'error'
      });
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, refreshData, setNotification, t]);

  /**
   * Create album from upload modal (returns album ID)
   */
  const handleCreateAlbumFromUpload = useCallback(async (albumData) => {
    try {
      // Album already created by UploadModal - just refresh UI
      await refreshData();

      // Don't show notification - UploadModal already showed one

      return albumData.id;
    } catch (err) {
      console.error('Album creation error:', err);
      setNotification({
        message: t('common:notifications.albumCreationError'),
        type: 'error'
      });
      throw err;
    }
  }, [refreshData, setNotification, t]);

  /**
   * Delete album with confirmation
   */
  const handleDeleteAlbum = useCallback((album) => {
    const albumPhotos = photos.filter(p => p.albumId === album.id);
    const photosNote = albumPhotos.length > 0
      ? t('common:notifications.deleteAlbumPhotosNote', { count: albumPhotos.length })
      : t('common:notifications.deleteAlbumEmptyNote');

    setConfirmModal({
      title: t('common:notifications.deleteAlbumTitle'),
      message: t('common:notifications.deleteAlbumMessage', {
        name: album.name,
        photos: photosNote
      }),
      onConfirm: async () => {
        // GUARD: Prevent duplicate deletes
        if (isDeleting) {
          console.warn('Delete already in progress, ignoring duplicate call');
          return;
        }

        setIsDeleting(true);

        try {
          // Remove albumId from all photos in the album
          for (const photo of albumPhotos) {
            await updatePhoto(photo.id, { albumId: null });
          }

          // Delete album from Firestore
          await deleteDoc(doc(db, 'albums', album.id));

          await refreshData();

          // Navigate away if currently viewing this album
          if (currentPage === 'album' && selectedAlbum?.id === album.id) {
            setCurrentPage('albums');
            setSelectedAlbum(null);
          }

          setNotification({
            message: t('common:notifications.albumDeleted'),
            type: 'success'
          });
        } catch (err) {
          console.error('Delete album error:', err);
          setNotification({
            message: t('common:notifications.albumDeleteError'),
            type: 'error'
          });
          throw err;
        } finally {
          setIsDeleting(false);
        }
      }
    });
  }, [isDeleting, photos, refreshData, currentPage, selectedAlbum, setConfirmModal, setNotification, setCurrentPage, setSelectedAlbum, t]);

  /**
   * Delete photo with confirmation
   */
  const handleDeletePhoto = useCallback((photo) => {
    setConfirmModal({
      title: t('common:notifications.deletePhotoTitle'),
      message: t('common:notifications.deletePhotoMessage'),
      onConfirm: async () => {
        // GUARD: Prevent duplicate deletes
        if (isDeleting) {
          console.warn('Delete already in progress, ignoring duplicate call');
          return;
        }

        setIsDeleting(true);

        try {
          await deletePhoto(photo.id, photo.storagePath);
          await refreshData();
          closePhotoModal();

          setNotification({
            message: t('common:notifications.photoDeleted'),
            type: 'success'
          });
        } catch (err) {
          console.error('Delete photo error:', err);
          setNotification({
            message: t('common:notifications.photoDeleteError'),
            type: 'error'
          });
          throw err;
        } finally {
          setIsDeleting(false);
        }
      }
    });
  }, [isDeleting, refreshData, closePhotoModal, setConfirmModal, setNotification, t]);

  /**
   * Toggle favorite status of a photo
   */
  const toggleFavorite = useCallback(async (photo) => {
    // GUARD: Prevent duplicate toggles
    if (isTogglingFavorite) {
      console.warn('Toggle favorite already in progress, ignoring duplicate call');
      return;
    }

    setIsTogglingFavorite(true);

    try {
      await updatePhoto(photo.id, { favorite: !photo.favorite });
      await refreshData();

      setNotification({
        message: photo.favorite
          ? t('common:notifications.removedFromFavorites')
          : t('common:notifications.addedToFavorites'),
        type: 'success'
      });
    } catch (err) {
      console.error('Error toggling favorite:', err);
      setNotification({
        message: t('common:notifications.updateError'),
        type: 'error'
      });
      throw err;
    } finally {
      setIsTogglingFavorite(false);
    }
  }, [isTogglingFavorite, refreshData, setNotification, t]);

  /**
   * Get photos by album ID
   */
  const getPhotosByAlbum = useCallback((albumId) => {
    return photos.filter(photo => photo.albumId === albumId);
  }, [photos]);

  /**
   * Get photos without album
   */
  const getPhotosWithoutAlbum = useCallback(() => {
    return photos.filter(photo => !photo.albumId);
  }, [photos]);

  /**
   * Get favorite photos
   */
  const getFavoritePhotos = useCallback(() => {
    return photos.filter(photo => photo.favorite);
  }, [photos]);

  /**
   * Set album cover image
   */
  const handleSetAlbumCover = useCallback(async (albumId, coverUrl) => {
    // GUARD: Prevent duplicate calls
    if (isSaving) {
      console.warn('Save operation already in progress, ignoring duplicate call');
      return;
    }

    setIsSaving(true);

    try {
      await setAlbumCover(albumId, coverUrl);
      await refreshData();

      setNotification({
        message: t('common:notifications.coverUpdated'),
        type: 'success'
      });
    } catch (err) {
      console.error('Set album cover error:', err);
      setNotification({
        message: t('common:notifications.coverUpdateError'),
        type: 'error'
      });
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, refreshData, setNotification, t]);

  /**
   * Update album photo count
   */
  const handleUpdatePhotoCount = useCallback(async (albumId, count) => {
    // GUARD: Prevent duplicate calls
    if (isSaving) {
      console.warn('Save operation already in progress, ignoring duplicate call');
      return;
    }

    setIsSaving(true);

    try {
      await updateAlbumPhotoCount(albumId, count);
      await refreshData();
    } catch (err) {
      console.error('Update photo count error:', err);
      setNotification({
        message: t('common:notifications.updateError'),
        type: 'error'
      });
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, refreshData, setNotification, t]);

  return {
    // Data
    albums,
    photos,

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

    // Utilities
    getPhotosByAlbum,
    getPhotosWithoutAlbum,
    getFavoritePhotos,

    // Guard states (for UI feedback)
    isSaving,
    isDeleting,
    isUploading,
    isTogglingFavorite,
  };
};

export default usePhotoData;
