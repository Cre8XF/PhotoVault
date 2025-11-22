// ============================================================================
// usePhotoContext Hook - Phase 2A
// ============================================================================
import useStore from '../state/store';

/**
 * Manages photo context state for navigation within PhotoPage
 * Returns current context, order, and index along with setters
 *
 * @returns {object} Photo context state and setters
 */
export function usePhotoContext() {
  const photoContext = useStore((state) => state.photoContext);
  const photoOrder = useStore((state) => state.photoOrder);
  const photoIndex = useStore((state) => state.photoIndex);
  const currentPhotoId = useStore((state) => state.currentPhotoId);

  const setPhotoContext = useStore((state) => state.setPhotoContext);
  const setPhotoOrder = useStore((state) => state.setPhotoOrder);
  const setPhotoIndex = useStore((state) => state.setPhotoIndex);
  const setCurrentPhotoId = useStore((state) => state.setCurrentPhotoId);

  return {
    photoContext,
    photoOrder,
    photoIndex,
    currentPhotoId,
    setPhotoContext,
    setPhotoOrder,
    setPhotoIndex,
    setCurrentPhotoId,
  };
}
