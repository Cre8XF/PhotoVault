// ============================================================================
// usePrefetchAdjacentPhotos Hook - Phase 2A
// ============================================================================
import { useEffect } from 'react';

/**
 * Prefetches adjacent photos (previous and next) for faster navigation
 * Uses browser's native image preloading
 *
 * @param {array} photoOrder - Array of photo IDs
 * @param {number} photoIndex - Current index in photoOrder
 * @param {array} photos - Array of photo objects (from store)
 */
export function usePrefetchAdjacentPhotos(photoOrder, photoIndex, photos) {
  useEffect(() => {
    if (!Array.isArray(photoOrder) || photoOrder.length === 0) return;
    if (!Array.isArray(photos) || photos.length === 0) return;

    const prefetchPhoto = (photoId) => {
      const photo = photos.find((p) => p.id === photoId);
      if (!photo?.url) return;

      // Create a new Image object to trigger browser prefetch
      const img = new Image();
      img.src = photo.url;
    };

    // Prefetch previous photo
    if (photoIndex > 0) {
      const prevPhotoId = photoOrder[photoIndex - 1];
      if (prevPhotoId) {
        prefetchPhoto(prevPhotoId);
      }
    }

    // Prefetch next photo
    if (photoIndex < photoOrder.length - 1) {
      const nextPhotoId = photoOrder[photoIndex + 1];
      if (nextPhotoId) {
        prefetchPhoto(nextPhotoId);
      }
    }
  }, [photoOrder, photoIndex, photos]);
}
