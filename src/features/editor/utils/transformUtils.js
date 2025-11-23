/**
 * Transform Utilities - Phase 8B-2
 *
 * Transform math helpers for zoom and pan
 */

/**
 * Clamp value between min and max
 */
export const clamp = (value, min, max) => {
  return Math.max(min, Math.min(max, value));
};

/**
 * Calculate pan bounds based on zoom level
 * Ensures image doesn't pan beyond visible area
 *
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 * @param {number} imageWidth - Scaled image width
 * @param {number} imageHeight - Scaled image height
 * @param {number} zoom - Current zoom level
 * @returns {Object} Max pan bounds { maxPanX, maxPanY }
 */
export const calculatePanBounds = (canvasWidth, canvasHeight, imageWidth, imageHeight, zoom) => {
  // Calculate how much the image extends beyond canvas after zoom
  const zoomedWidth = imageWidth * zoom;
  const zoomedHeight = imageHeight * zoom;

  // Maximum pan is half the difference between zoomed size and canvas size
  // This keeps at least some part of the image visible
  const maxPanX = Math.max(0, (zoomedWidth - canvasWidth) / 2);
  const maxPanY = Math.max(0, (zoomedHeight - canvasHeight) / 2);

  return { maxPanX, maxPanY };
};

/**
 * Clamp pan values to bounds
 *
 * @param {number} panX - Current pan X
 * @param {number} panY - Current pan Y
 * @param {Object} bounds - Pan bounds from calculatePanBounds
 * @returns {Object} Clamped pan { panX, panY }
 */
export const clampPan = (panX, panY, bounds) => {
  const { maxPanX, maxPanY } = bounds;

  return {
    panX: clamp(panX, -maxPanX, maxPanX),
    panY: clamp(panY, -maxPanY, maxPanY),
  };
};

/**
 * Calculate zoom around a point
 * When zooming with mouse/touch, zoom around the pointer position
 *
 * @param {number} currentZoom - Current zoom level
 * @param {number} newZoom - New zoom level
 * @param {number} currentPanX - Current pan X
 * @param {number} currentPanY - Current pan Y
 * @param {number} pointerX - Pointer X position (relative to canvas center)
 * @param {number} pointerY - Pointer Y position (relative to canvas center)
 * @returns {Object} New pan values { panX, panY }
 */
export const zoomAroundPoint = (
  currentZoom,
  newZoom,
  currentPanX,
  currentPanY,
  pointerX,
  pointerY
) => {
  // Calculate zoom delta
  const zoomDelta = newZoom - currentZoom;

  // Adjust pan to zoom around the pointer
  const panX = currentPanX - pointerX * zoomDelta;
  const panY = currentPanY - pointerY * zoomDelta;

  return { panX, panY };
};

/**
 * Get distance between two touch points (for pinch zoom)
 */
export const getTouchDistance = (touch1, touch2) => {
  const dx = touch2.clientX - touch1.clientX;
  const dy = touch2.clientY - touch1.clientY;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Get midpoint between two touch points (for pinch zoom center)
 */
export const getTouchMidpoint = (touch1, touch2) => {
  return {
    x: (touch1.clientX + touch2.clientX) / 2,
    y: (touch1.clientY + touch2.clientY) / 2,
  };
};

/**
 * Create initial transform state
 */
export const createInitialTransform = () => ({
  zoom: 1.0,
  panX: 0,
  panY: 0,
  minZoom: 0.5,
  maxZoom: 4.0,
});

/**
 * Reset transform to initial state
 */
export const resetTransform = () => createInitialTransform();
