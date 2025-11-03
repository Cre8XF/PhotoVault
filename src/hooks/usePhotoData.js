// ============================================================================
// usePhotoData Hook - Phase 2: Photo & Album Data Management
// ============================================================================
import { useCallback, useEffect } from 'react';
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
} from '../firebase';
import { db } from '../firebase';
import useStore from '../state/store';

/**
 * Custom hook for photo and album data management
 * Handles all CRUD operations for photos and albums
 */
export const usePhotoData = () => {
  const { t } = useTranslation(['common']);

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
    if (!user) {
      setNotification({
        message: t('common:notifications.mustBeLoggedIn'),
        type: 'error'
      });
      return;
    }

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
    }
  }, [user, refreshData, setNotification, t]);

  /**
   * Create or update album
   */
  const handleAlbumSave = useCallback(async (albumData, editingAlbum = null) => {
    try {
      if (editingAlbum) {
        await updateAlbum(editingAlbum.id, albumData);
        setNotification({
          message: t('common:notifications.albumUpdated'),
          type: 'success'
        });
      } else {
        await addAlbum({ ...albumData, userId: user.uid });
        setNotification({
          message: t('common:notifications.albumCreated'),
          type: 'success'
        });
      }

      await refreshData();
    } catch (err) {
      console.error('Album save error:', err);
      setNotification({
        message: t('common:notifications.albumSaveError'),
        type: 'error'
      });
    }
  }, [user?.uid, refreshData, setNotification, t]);

  /**
   * Create album from upload modal (returns album ID)
   */
  const handleCreateAlbumFromUpload = useCallback(async (albumName) => {
    try {
      const albumData = {
        name: String(albumName).trim(),
        title: String(albumName).trim(),
        userId: user.uid,
        createdAt: new Date().toISOString(),
        photoCount: 0,
        cover: ''
      };

      const albumId = await addAlbum(albumData);
      await refreshData();

      setNotification({
        message: t('common:notifications.albumCreated'),
        type: 'success'
      });

      return albumId;
    } catch (err) {
      console.error('Album creation error:', err);
      setNotification({
        message: t('common:notifications.albumCreationError'),
        type: 'error'
      });
      throw err;
    }
  }, [user?.uid, refreshData, setNotification, t]);

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
        }
      }
    });
  }, [photos, refreshData, currentPage, selectedAlbum, setConfirmModal, setNotification, setCurrentPage, setSelectedAlbum, t]);

  /**
   * Delete photo with confirmation
   */
  const handleDeletePhoto = useCallback((photo) => {
    setConfirmModal({
      title: t('common:notifications.deletePhotoTitle'),
      message: t('common:notifications.deletePhotoMessage'),
      onConfirm: async () => {
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
        }
      }
    });
  }, [refreshData, closePhotoModal, setConfirmModal, setNotification, t]);

  /**
   * Toggle favorite status of a photo
   */
  const toggleFavorite = useCallback(async (photo) => {
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
    }
  }, [refreshData, setNotification, t]);

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
    toggleFavorite,

    // Utilities
    getPhotosByAlbum,
    getPhotosWithoutAlbum,
    getFavoritePhotos,
  };
};

export default usePhotoData;
