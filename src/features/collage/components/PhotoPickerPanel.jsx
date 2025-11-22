// ============================================================================
// COMPONENT: PhotoPickerPanel.jsx - Photo selection panel
// ============================================================================

import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Star, Image as ImageIcon, Search } from 'lucide-react';
import LazyImage from '../../../components/LazyImage';

/**
 * PhotoPickerPanel Component
 *
 * Sliding panel for selecting photos
 * Shows user's photo library with filters
 * Mobile: slides from bottom
 * Desktop: slides from left/right
 */
const PhotoPickerPanel = ({ isOpen, onClose, photos, onSelectPhoto, selectedSlotIndex }) => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState('all'); // 'all', 'favorites'
  const [searchQuery, setSearchQuery] = useState('');

  // Filter photos based on current filter and search
  const filteredPhotos = useMemo(() => {
    let result = photos || [];

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
  }, [photos, filter, searchQuery]);

  const handlePhotoClick = (photo) => {
    if (onSelectPhoto) {
      onSelectPhoto(photo);
    }
    // Keep panel open for multiple selections
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-fade-in"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed bottom-0 left-0 right-0 md:left-auto md:right-0 md:top-0 md:bottom-0 md:w-96 bg-gradient-to-b from-gray-900 to-black border-t md:border-l border-white/10 z-50 flex flex-col animate-slide-in-bottom md:animate-slide-in-right`}
        style={{ maxHeight: '70vh', height: 'auto' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
          <div>
            <h3 className="font-semibold text-lg">
              {t('collage.photoPicker.title', 'Select Photo')}
            </h3>
            {selectedSlotIndex !== null && (
              <p className="text-xs opacity-50">
                {t('collage.photoPicker.forSlot', 'For slot')} #{selectedSlotIndex + 1}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-white/10 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('collage.photoPicker.search', 'Search photos...')}
              className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 p-4 border-b border-white/10 flex-shrink-0">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            <ImageIcon className="w-4 h-4 inline mr-1" />
            {t('collage.photoPicker.all', 'All')} ({photos?.length || 0})
          </button>
          <button
            onClick={() => setFilter('favorites')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              filter === 'favorites'
                ? 'bg-purple-600 text-white'
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            <Star className="w-4 h-4 inline mr-1" />
            {t('collage.photoPicker.favorites', 'Favorites')}
          </button>
        </div>

        {/* Photo Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredPhotos.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <ImageIcon className="w-12 h-12 opacity-20 mb-3" />
              <p className="text-sm opacity-50">
                {t('collage.photoPicker.noPhotos', 'No photos found')}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {filteredPhotos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => handlePhotoClick(photo)}
                  className="relative aspect-square cursor-pointer group rounded-lg overflow-hidden border border-white/10 hover:border-purple-500 transition-all"
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
        <div className="p-3 border-t border-white/10 text-center flex-shrink-0">
          <p className="text-xs opacity-50">
            {t('collage.photoPicker.hint', 'Tap a photo to add it to the selected slot')}
          </p>
        </div>
      </div>
    </>
  );
};

export default PhotoPickerPanel;
