/**
 * Transform Utilities - Phase 8B-3
 *
 * Transform math helpers for zoom, pan, rotation, and flip
 */

// ============================================================================
// ROTATION HELPERS
// ============================================================================

/**
 * Convert degrees to radians
 */
export const degreesToRadians = (degrees) => {
  return (degrees * Math.PI) / 180;
};

/**
 * Normalize rotation to 0-359 range
 */
export const normalizeRotation = (degrees) => {
  const normalized = degrees % 360;
  return normalized < 0 ? normalized + 360 : normalized;
};

/**
 * Get rotated dimensions (bounding box)
 * When image is rotated, calculate the bounding box size
 *
 * @param {number} width - Original width
 * @param {number} height - Original height
 * @param {number} rotation - Rotation in degrees
 * @returns {Object} Rotated dimensions { width, height }
 */
export const getRotatedDimensions = (width, height, rotation) => {
  const rad = degreesToRadians(rotation);
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));

  const rotatedWidth = width * cos + height * sin;
  const rotatedHeight = width * sin + height * cos;

  return {
    width: rotatedWidth,
    height: rotatedHeight,
  };
};

// ============================================================================
// BASIC MATH
// ============================================================================

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
 * Calculate pan bounds with rotation (Phase 8B-3)
 * Accounts for rotated bounding box dimensions
 *
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 * @param {number} imageWidth - Scaled image width (at zoom = 1)
 * @param {number} imageHeight - Scaled image height (at zoom = 1)
 * @param {number} zoom - Current zoom level
 * @param {number} rotation - Rotation in degrees
 * @returns {Object} Max pan bounds { maxPanX, maxPanY }
 */
export const calculatePanBoundsWithRotation = (
  canvasWidth,
  canvasHeight,
  imageWidth,
  imageHeight,
  zoom,
  rotation
) => {
  // Get rotated bounding box dimensions
  const rotated = getRotatedDimensions(imageWidth, imageHeight, rotation);

  // Calculate zoomed dimensions
  const zoomedWidth = rotated.width * zoom;
  const zoomedHeight = rotated.height * zoom;

  // Calculate max pan
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
 * Create initial transform state (Phase 8C-1)
 */
export const createInitialTransform = () => ({
  zoom: 1.0,
  panX: 0,
  panY: 0,
  rotation: 0,      // Degrees (0, 90, 180, 270)
  flipX: false,     // Horizontal flip
  flipY: false,     // Vertical flip
  minZoom: 0.5,
  maxZoom: 4.0,
  adjust: {         // Phase 8C-1: Adjust sliders
    brightness: 0,
    contrast: 0,
    saturation: 0,
    warmth: 0,
    highlights: 0,
    shadows: 0,
    clarity: 0,
    blur: 0,
    vignette: 0,
  },
});

/**
 * Reset transform to initial state
 */
export const resetTransform = () => createInitialTransform();
