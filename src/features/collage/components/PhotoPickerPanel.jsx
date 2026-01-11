// ============================================================================
// COMPONENT: PhotoPickerPanel.jsx - Photo selection panel
// ============================================================================

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Star, Image as ImageIcon, Search } from 'lucide-react';
import LazyImage from '../../../components/LazyImage';
import { normalizePhotoFields } from '../../../utils/photoHelpers';

/**
 * PhotoPickerPanel Component
 *
 * Sliding panel for selecting photos
 * Shows user's photo library with filters
 * Mobile: slides from bottom
 * Desktop: slides from left/right
 *
 * @param {string} albumId - Optional album ID to filter photos (when creating collage from album)
 */
const PhotoPickerPanel = ({ isOpen, onClose, photos, onSelectPhoto, selectedSlotIndex, albumId }) => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('all'); // 'all', 'favorites'
  const [searchQuery, setSearchQuery] = useState('');
  const [scope, setScope] = useState(albumId ? 'album' : 'all'); // 'album' | 'all'

  // Filter photos based on current filter and search
  const filteredPhotos = useMemo(() => {
    let result = photos || [];

    // Exclude documents from collage selection
    result = result.filter((p) => p.type !== 'document');

    // Apply album scope filter (if albumId provided and scope is 'album')
    if (albumId && scope === 'album') {
      result = result.filter((p) => p.albumId === albumId);
    }

    // Apply filter
    if (filter === 'favorites') {
      result = result.filter((p) => p.favorite);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(query) ||
          p.caption?.toLowerCase().includes(query)
      );
    }

    return result;
  }, [photos, filter, searchQuery, albumId, scope]);

  const handlePhotoClick = (photo) => {
    if (onSelectPhoto) {
      onSelectPhoto(normalizePhotoFields(photo));
    }
    // Keep panel open for multiple selections
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 backdrop-blur-md z-40 animate-fade-in"
        style={{ backgroundColor: 'var(--overlay-bg)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="fixed bottom-0 left-0 right-0 md:left-auto md:right-0 md:top-0 md:bottom-0 md:w-96 border-t md:border-l z-50 flex flex-col animate-slide-in-bottom md:animate-slide-in-right"
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderColor: 'var(--border-color)',
          maxHeight: '70vh',
          height: 'auto'
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 border-b flex-shrink-0"
          style={{
            borderColor: 'var(--border-color)',
            backgroundColor: 'var(--bg-surface)'
          }}
        >
          <div>
            <h3 className="font-semibold text-lg" style={{ color: 'var(--text-primary)' }}>
              {t('collage.photoPicker.title', 'Select Photo')}
            </h3>
            {selectedSlotIndex !== null && (
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {t('collage.photoPicker.forSlot', 'For slot')} #{selectedSlotIndex + 1}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition"
            style={{ color: 'var(--text-primary)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--interactive-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b flex-shrink-0" style={{ borderColor: 'var(--border-color)' }}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('collage.photoPicker.search', 'Search photos...')}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)'
              }}
            />
          </div>
        </div>

        {/* Album Scope Toggle (when albumId provided) */}
        {albumId && (
          <div className="flex gap-2 px-4 pt-4 flex-shrink-0">
            <button
              onClick={() => setScope('album')}
              className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition"
              style={{
                backgroundColor: scope === 'album' ? '#8b5cf6' : 'var(--bg-surface)',
                color: scope === 'album' ? '#ffffff' : 'var(--text-primary)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: scope === 'album' ? '#8b5cf6' : 'var(--border-color)'
              }}
            >
              {t('collage.photoPicker.thisAlbum', 'This album')}
            </button>
            <button
              onClick={() => setScope('all')}
              className="flex-1 px-3 py-2 rounded-lg text-sm font-medium transition"
              style={{
                backgroundColor: scope === 'all' ? '#8b5cf6' : 'var(--bg-surface)',
                color: scope === 'all' ? '#ffffff' : 'var(--text-primary)',
                borderWidth: '1px',
                borderStyle: 'solid',
                borderColor: scope === 'all' ? '#8b5cf6' : 'var(--border-color)'
              }}
            >
              {t('collage.photoPicker.allPhotos', 'All photos')}
            </button>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-2 p-4 border-b flex-shrink-0" style={{ borderColor: 'var(--border-color)' }}>
          <button
            onClick={() => setFilter('all')}
            className="px-4 py-2 rounded-lg text-sm font-medium transition"
            style={{
              backgroundColor: filter === 'all' ? '#8b5cf6' : 'var(--bg-surface)',
              color: filter === 'all' ? '#ffffff' : 'var(--text-primary)'
            }}
            onMouseEnter={(e) => {
              if (filter !== 'all') e.currentTarget.style.backgroundColor = 'var(--interactive-hover)'
            }}
            onMouseLeave={(e) => {
              if (filter !== 'all') e.currentTarget.style.backgroundColor = 'var(--bg-surface)'
            }}
          >
            <ImageIcon className="w-4 h-4 inline mr-1" />
            {t('collage.photoPicker.all', 'All')} ({photos?.length || 0})
          </button>
          <button
            onClick={() => setFilter('favorites')}
            className="px-4 py-2 rounded-lg text-sm font-medium transition"
            style={{
              backgroundColor: filter === 'favorites' ? '#8b5cf6' : 'var(--bg-surface)',
              color: filter === 'favorites' ? '#ffffff' : 'var(--text-primary)'
            }}
            onMouseEnter={(e) => {
              if (filter !== 'favorites') e.currentTarget.style.backgroundColor = 'var(--interactive-hover)'
            }}
            onMouseLeave={(e) => {
              if (filter !== 'favorites') e.currentTarget.style.backgroundColor = 'var(--bg-surface)'
            }}
          >
            <Star className="w-4 h-4 inline mr-1" />
            {t('collage.photoPicker.favorites', 'Favorites')}
          </button>
        </div>

        {/* Photo Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredPhotos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <ImageIcon className="w-12 h-12 mb-3" style={{ color: 'var(--text-disabled)' }} />
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {t('collage.photoPicker.noPhotos', 'No photos found')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {filteredPhotos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => handlePhotoClick(photo)}
                  className="relative aspect-square cursor-pointer group rounded-lg overflow-hidden border hover:border-purple-500 transition-all"
                  style={{ borderColor: 'var(--border-color)' }}
                >
                  <LazyImage
                    src={photo.url}
                    thumbnail={photo.thumbnailSmall}
                    photoId={photo.id}
                    alt={photo.name || 'Photo'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  {photo.favorite && (
                    <Star className="absolute top-1 right-1 w-3 h-3 text-yellow-400" fill="currentColor" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div
          className="p-3 border-t text-center flex-shrink-0"
          style={{
            borderColor: 'var(--border-color)',
            backgroundColor: 'var(--bg-surface)'
          }}
        >
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            {t('collage.photoPicker.hint', 'Tap a photo to add it to the selected slot')}
          </p>
        </div>
      </div>
    </>
  );
};

export default PhotoPickerPanel;
