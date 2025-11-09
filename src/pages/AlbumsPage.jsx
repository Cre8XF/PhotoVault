// ============================================================================
// PAGE: AlbumsPage.jsx – med støtte for flervalg og flytt til album
// ============================================================================
import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Folder, Image, Star, Calendar, Move } from 'lucide-react';
import AlbumCard from '../components/AlbumCard';
import LazyImage from '../components/LazyImage';
import PhotoGridOptimized from '../components/PhotoGridOptimized';
import MoveModal from '../components/MoveModal';
import { updatePhotoAlbum, updatePhoto } from '../firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Edit2, Trash2 } from 'lucide-react';
import useStore from '../state/store';

const AlbumsPage = ({ albums, photos, onAlbumClick, onPhotoClick, refreshData, onDeleteAlbum, onEditAlbum }) => {
  const { t } = useTranslation(['common', 'albums']);
  const [viewMode, setViewMode] = useState('albums');
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [isMoveOpen, setMoveOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const setConfirmModal = useStore((state) => state.setConfirmModal);
  const setNotification = useStore((state) => state.setNotification);
  const setAlbumModalOpen = useStore((state) => state.setAlbumModalOpen);
  const setEditingAlbum = useStore((state) => state.setEditingAlbum);

  // Delete album handler
  const handleDeleteAlbum = (album) => {
    const albumPhotos = photos.filter(p => p.albumId === album.id);
    const photosNote = albumPhotos.length > 0
      ? `Dette vil også fjerne ${albumPhotos.length} bilder fra albumet (men ikke slette dem).`
      : 'Dette albumet er tomt.';

    setConfirmModal({
      title: t('common:confirmDelete') || 'Bekreft sletting',
      message: `Er du sikker på at du vil slette albumet "${album.name}"? ${photosNote}`,
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

          let errorMessage = t('common:error') || 'Feil ved sletting';

          if (error.code === 'permission-denied') {
            errorMessage = 'Permission denied. Album may be missing userId field. Check console and run migration.';
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

  const albumPhotos = useMemo(() => (photos || []).filter(p => !p.albumId), [photos]);

  // Beregning før return
  const totalAlbums = albums.length;
  const totalPhotos = (albums || []).reduce((sum, a) => sum + (a.photoCount || 0), 0);
  const totalSizeMB = (
  (photos || []).reduce((sum, p) => sum + (p.size || 0), 0) / (1024 * 1024)
).toFixed(1);


  return (
    <div className="min-h-screen p-6 md:p-10 pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('common:albums')}</h1>
        {selectedPhotos.length > 0 && (
          <button onClick={() => setMoveOpen(true)} className="ripple-effect px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            <Move size={18} /> {t('common:moveToAlbum')}
          </button>
        )}
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

      {viewMode === 'albums' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map(album => (
            <div key={album.id} className="relative group">
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
            alert(t('common:error') || 'Kunne ikke flytte bilder');
          } finally {
            setLoading(false);
          }
        }}
      />
    </div>
  );
};

export default AlbumsPage;
