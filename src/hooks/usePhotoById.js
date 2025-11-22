// ============================================================================
// usePhotoById Hook - Phase 2A
// ============================================================================
import { useState, useEffect } from 'react';
import { getPhoto } from '../firebase';
import useStore from '../state/store';

/**
 * Fetches a single photo by ID from Firestore
 * Handles loading, error, and empty states
 *
 * @param {string} photoId - The photo ID to fetch
 * @returns {object} { photo, loading, error }
 */
export function usePhotoById(photoId) {
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Try to get photo from store first (faster)
  const photosInStore = useStore((state) => state.photos);

  useEffect(() => {
    if (!photoId) {
      setPhoto(null);
      setLoading(false);
      setError('No photo ID provided');
      return;
    }

    let isMounted = true;

    const fetchPhoto = async () => {
      try {
        setLoading(true);
        setError(null);

        // First check if photo is in store
        const photoFromStore = Array.isArray(photosInStore)
          ? photosInStore.find((p) => p.id === photoId)
          : null;

        if (photoFromStore) {
          if (isMounted) {
            setPhoto(photoFromStore);
            setLoading(false);
          }
          return;
        }

        // If not in store, fetch from Firestore
        const fetchedPhoto = await getPhoto(photoId);

        if (isMounted) {
          setPhoto(fetchedPhoto);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching photo:', err);
        if (isMounted) {
          setError(err.message || 'Failed to load photo');
          setLoading(false);
        }
      }
    };

    fetchPhoto();

    return () => {
      isMounted = false;
    };
  }, [photoId, photosInStore]);

  return { photo, loading, error };
}
