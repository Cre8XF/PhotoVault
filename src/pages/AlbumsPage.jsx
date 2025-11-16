// ============================================================================
// PAGE: AlbumsPage.jsx – med støtte for flervalg og flytt til album
// + Collage V3 Integration
// ============================================================================
import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Folder, Image, Star, Calendar, Move, Grid as GridIcon, Plus } from 'lucide-react';
import AlbumCard from '../components/AlbumCard';
import { SkeletonCard } from '../components/SkeletonCard';
import LazyImage from '../components/LazyImage';
import PhotoGridOptimized from '../components/PhotoGridOptimized';
import MoveModal from '../components/MoveModal';
import { updatePhotoAlbum, updatePhoto } from '../firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Edit2, Trash2 } from 'lucide-react';
import useStore from '../state/store';
import { useCollageData } from '../hooks/useCollageData';

const AlbumsPage = ({ albums, photos, onAlbumClick, onPhotoClick, refreshData, onDeleteAlbum, onEditAlbum }) => {
  const { t } = useTranslation(['common', 'albums', 'collage']);
  const [viewMode, setViewMode] = useState('albums');
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [isMoveOpen, setMoveOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Collage state
  const [collages, setCollages] = useState([]);
  const { getCollagesByUser, deleteCollage } = useCollageData();
  const setCurrentPage = useStore((state) => state.setCurrentPage);

  // Fetch collages on mount
  useEffect(() => {
    const loadCollages = async () => {
      const userCollages = await getCollagesByUser();
      setCollages(userCollages);
    };
    loadCollages();
  }, [getCollagesByUser]);

  // Track initial data loading
  useEffect(() => {
    if ((albums && albums.length > 0) || (photos && photos.length > 0)) {
      setIsInitialLoading(false);
    } else {
      const timer = setTimeout(() => setIsInitialLoading(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [albums, photos]);

  const setConfirmModal = useStore((state) => state.setConfirmModal);
  const setNotification = useStore((state) => state.setNotification);
  const setAlbumModalOpen = useStore((state) => state.setAlbumModalOpen);
  const setEditingAlbum = useStore((state) => state.setEditingAlbum);

  // Delete album handler
  const handleDeleteAlbum = (album) => {
    const safePhotos = Array.isArray(photos) ? photos : [];
    const albumPhotos = safePhotos.filter(p => p.albumId === album.id);
    const photosNote = albumPhotos.length > 0
      ? t('common:notifications.deleteAlbumPhotosNote', { count: albumPhotos.length })
      : t('common:notifications.deleteAlbumEmptyNote');

    setConfirmModal({
      title: t('common:notifications.deleteAlbumTitle'),
      message: t('albums:confirmDeleteAlbum', { name: album.name, photosNote }),
      onConfirm: async () => {
        try {
          setLoading(true);

          // 🔍 DEBUG: Log album data before delete
          console.log('🔍 DELETE DEBUG - Album data:', {
            id: album.id,
            name: album.name,
            userId: album.userId,
            hasUserId: 'userId' in album,
            currentUser: auth.currentUser?.uid,
            isMatch: album.userId === auth.currentUser?.uid,
          });

          // Check if album has userId
          if (!album.userId) {
            console.warn('⚠️ Album missing userId field - may cause permission error');
            console.warn('⚠️ Please run the migration to fix old albums (see MorePage)');
          }

          // Check if user owns this album
          if (album.userId && album.userId !== auth.currentUser?.uid) {
            throw new Error('You do not own this album');
          }

          // Remove albumId from all photos in this album
          for (const photo of albumPhotos) {
            await updatePhoto(photo.id, { albumId: null });
          }

          // Delete album from Firestore
          await deleteDoc(doc(db, 'albums', album.id));

          console.log('✅ Album deleted successfully');

          // Refresh data
          if (refreshData) {
            await refreshData();
          }

          setNotification({
            message: t('common:deleted') || 'Slettet',
            type: 'success'
          });
        } catch (error) {
          console.error('❌ Error deleting album:', error);
          console.error('Error code:', error.code);
          console.error('Error message:', error.message);

          let errorMessage = t('common:errorOccurred');

          if (error.code === 'permission-denied') {
            errorMessage = t('albums:errors.permissionDenied');
          } else if (error.message) {
            errorMessage = error.message;
          }

          setNotification({
            message: errorMessage,
            type: 'error'
          });
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const albumPhotos = useMemo(() => {
    const safePhotos = Array.isArray(photos) ? photos : [];
    return safePhotos.filter(p => !p.albumId);
  }, [photos]);

  // Beregning før return
  const safeAlbums = Array.isArray(albums) ? albums : [];
  const safePhotos = Array.isArray(photos) ? photos : [];

  const totalAlbums = safeAlbums.length;
  const totalPhotos = safeAlbums.reduce((sum, a) => sum + (a.photoCount || 0), 0);
  const totalSizeMB = (
  safePhotos.reduce((sum, p) => sum + (p.size || 0), 0) / (1024 * 1024)
).toFixed(1);


  return (
    <div className="min-h-screen p-6 md:p-10 pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('common:albums')}</h1>

        <div className="flex items-center gap-3">
          {selectedPhotos.length > 0 ? (
            <button onClick={() => setMoveOpen(true)} className="ripple-effect px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
              <Move size={18} /> {t('common:moveToAlbum')}
            </button>
          ) : (
            <>
              <button
                onClick={() => setAlbumModalOpen(true)}
                className="ripple-effect px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center gap-2 transition"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">{t('common:album')}</span>
              </button>

              <button
                onClick={() => setCurrentPage('collage')}
                className="ripple-effect px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 flex items-center gap-2 transition"
              >
                <GridIcon className="w-4 h-4" />
                <span className="hidden sm:inline">{t('collage:createButton')}</span>
              </button>
            </>
          )}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-sm text-gray-400">{t('common:albums')}</p>
          <p className="text-2xl font-bold">{totalAlbums}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-sm text-gray-400">{t('common:photos')}</p>
          <p className="text-2xl font-bold">{totalPhotos}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-sm text-gray-400">{t('common:storage')}</p>
          <p className="text-2xl font-bold">{totalSizeMB} MB</p>
        </div>
      </div>

      {isInitialLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array(6).fill(0).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <>
          {/* My Collages Section */}
          {viewMode === 'albums' && collages.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <GridIcon className="w-5 h-5 text-purple-400" />
                {t('collage:myCollages')}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {collages.map((collage, index) => (
                  <div key={collage.id} className={`relative group animate-fade-in-up stagger-${(index % 12) + 1}`}>
                    <div
                      onClick={() => {
                        // TODO: Navigate to collage view
                        console.log('View collage:', collage.id)
                      }}
                      className="cursor-pointer glass-card rounded-xl overflow-hidden border border-white/10 hover:border-purple-400/50 transition-all"
                    >
                      <div className="aspect-square bg-gradient-to-br from-purple-900/20 to-blue-900/20 flex items-center justify-center">
                        <GridIcon className="w-16 h-16 opacity-30" />
                      </div>

                      <div className="p-4">
                        <h3 className="font-semibold text-sm truncate">{collage.title}</h3>
                        <p className="text-xs opacity-60 mt-1">
                          {collage.photoIds?.length || 0} photos • {new Date(collage.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Collage action buttons */}
                    <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Edit collage
                          console.log('Edit collage:', collage.id)
                        }}
                        className="p-2 bg-blue-600/90 hover:bg-blue-700 text-white rounded-lg shadow-lg transition"
                        title={t('common:edit')}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmModal({
                            title: t('buttons:confirmDelete'),
                            message: `Are you sure you want to delete "${collage.title}"?`,
                            onConfirm: async () => {
                              await deleteCollage(collage.id);
                              // Refresh collages
                              const userCollages = await getCollagesByUser();
                              setCollages(userCollages);
                            }
                          });
                        }}
                        className="p-2 bg-red-600/90 hover:bg-red-700 text-white rounded-lg shadow-lg transition"
                        title={t('common:delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state for collages */}
          {viewMode === 'albums' && collages.length === 0 && (
            <div className="mb-8 p-8 bg-white/5 rounded-xl border border-white/10 text-center">
              <GridIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <h3 className="text-lg font-semibold mb-2">{t('collage:emptyState.title')}</h3>
              <p className="text-sm opacity-60 mb-4">{t('collage:emptyState.description')}</p>
              <button
                onClick={() => setCurrentPage('collage')}
                className="ripple-effect px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 transition"
              >
                {t('collage:emptyState.createFirst')}
              </button>
            </div>
          )}

          {/* My Albums Section */}
          {viewMode === 'albums' && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Folder className="w-5 h-5 text-blue-400" />
                My Albums
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {safeAlbums.map((album, index) => (
                  <div key={album.id} className={`relative group animate-fade-in-up stagger-${(index % 12) + 1}`}>
                    <AlbumCard album={album} photos={photos} onOpen={() => onAlbumClick(album)} />

              {/* Album action buttons - show on hover */}
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingAlbum(album);
                    setAlbumModalOpen(true);
                  }}
                  className="p-2 bg-blue-600/90 hover:bg-blue-700 text-white rounded-lg shadow-lg transition"
                  title={t('common:edit')}
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteAlbum(album);
                  }}
                  className="p-2 bg-red-600/90 hover:bg-red-700 text-white rounded-lg shadow-lg transition"
                  title={t('common:delete')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
            </div>
          )}

          {viewMode === 'photos' && <PhotoGridOptimized photos={albumPhotos} onPhotoClick={onPhotoClick} selectedPhotos={selectedPhotos} setSelectedPhotos={setSelectedPhotos} />}
        </>
      )}

      <MoveModal
        isOpen={isMoveOpen}
        onClose={() => setMoveOpen(false)}
        albums={albums}
        onConfirm={async (albumId) => {
          if (selectedPhotos.length === 0) return;

          setLoading(true);
          try {
            // Move all selected photos to the target album
            for (const photoId of selectedPhotos) {
              await updatePhotoAlbum(photoId, albumId);
            }

            // Refresh data to show updated album counts
            if (refreshData) {
              await refreshData();
            }

            setSelectedPhotos([]);
            console.log(`✅ Moved ${selectedPhotos.length} photos to album ${albumId}`);
          } catch (error) {
            console.error('Error moving photos:', error);
            setNotification({
              message: t('albums:errors.couldNotMovePhotos'),
              type: 'error'
            });
          } finally {
            setLoading(false);
          }
        }}
      />
    </div>
  );
};

export default AlbumsPage;
