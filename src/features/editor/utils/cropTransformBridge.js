/**
 * Crop Transform Bridge - Phase 8C-2
 *
 * Coordinate conversion utilities for connecting crop system with canvas transform engine.
 * Handles conversion between screen coordinates, image coordinates, and canvas space.
 */

// ============================================================================
// COORDINATE CONVERSION
// ============================================================================

/**
 * Convert screen coordinates to image coordinates
 * Takes into account zoom and pan transforms
 *
 * @param {number} screenX - Screen X coordinate (relative to canvas center)
 * @param {number} screenY - Screen Y coordinate (relative to canvas center)
 * @param {Object} transform - Transform state { zoom, panX, panY, rotation, etc. }
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 * @param {number} imageWidth - Base image width (at zoom=1)
 * @param {number} imageHeight - Base image height (at zoom=1)
 * @returns {Object} { x, y } in image coordinate space (0-1 normalized)
 */
export const screenToImageCoords = (
  screenX,
  screenY,
  transform,
  canvasWidth,
  canvasHeight,
  imageWidth,
  imageHeight
) => {
  const { zoom = 1, panX = 0, panY = 0 } = transform;

  // Convert screen coordinates to canvas center-relative
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const canvasX = screenX - centerX;
  const canvasY = screenY - centerY;

  // Reverse the transform: remove pan, then remove zoom
  const imageX = (canvasX - panX) / zoom;
  const imageY = (canvasY - panY) / zoom;

  // Normalize to 0-1 range relative to image size
  const normalizedX = (imageX + imageWidth / 2) / imageWidth;
  const normalizedY = (imageY + imageHeight / 2) / imageHeight;

  return {
    x: Math.max(0, Math.min(1, normalizedX)),
    y: Math.max(0, Math.min(1, normalizedY)),
  };
};

/**
 * Convert image coordinates to screen coordinates
 * Applies zoom and pan transforms
 *
 * @param {number} imgX - Image X coordinate (0-1 normalized)
 * @param {number} imgY - Image Y coordinate (0-1 normalized)
 * @param {Object} transform - Transform state { zoom, panX, panY, rotation, etc. }
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 * @param {number} imageWidth - Base image width (at zoom=1)
 * @param {number} imageHeight - Base image height (at zoom=1)
 * @returns {Object} { x, y } in screen coordinate space
 */
export const imageToScreenCoords = (
  imgX,
  imgY,
  transform,
  canvasWidth,
  canvasHeight,
  imageWidth,
  imageHeight
) => {
  const { zoom = 1, panX = 0, panY = 0 } = transform;

  // Convert normalized (0-1) to image-centered coordinates
  const imageX = (imgX * imageWidth) - (imageWidth / 2);
  const imageY = (imgY * imageHeight) - (imageHeight / 2);

  // Apply zoom
  const zoomedX = imageX * zoom;
  const zoomedY = imageY * zoom;

  // Apply pan
  const canvasX = zoomedX + panX;
  const canvasY = zoomedY + panY;

  // Convert to screen coordinates
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const screenX = canvasX + centerX;
  const screenY = canvasY + centerY;

  return { x: screenX, y: screenY };
};

// ============================================================================
// CROP RECT UTILITIES
// ============================================================================

/**
 * Normalize crop rect to ensure x1 < x2 and y1 < y2
 * All values are in normalized 0-1 space
 *
 * @param {Object} rect - Crop rect { x1, y1, x2, y2 }
 * @returns {Object} Normalized rect
 */
export const normalizeCropRect = (rect) => {
  const { x1, y1, x2, y2 } = rect;

  return {
    x1: Math.min(x1, x2),
    y1: Math.min(y1, y2),
    x2: Math.max(x1, x2),
    y2: Math.max(y1, y2),
  };
};

/**
 * Clamp crop rect to image bounds (0-1)
 *
 * @param {Object} rect - Crop rect { x1, y1, x2, y2 }
 * @returns {Object} Clamped rect
 */
export const clampCropRect = (rect) => {
  return {
    x1: Math.max(0, Math.min(1, rect.x1)),
    y1: Math.max(0, Math.min(1, rect.y1)),
    x2: Math.max(0, Math.min(1, rect.x2)),
    y2: Math.max(0, Math.min(1, rect.y2)),
  };
};

/**
 * Apply aspect ratio constraint to crop rect
 *
 * @param {Object} rect - Current crop rect { x1, y1, x2, y2 }
 * @param {number|null} aspectRatio - Target aspect ratio (width/height) or null for free
 * @param {string} anchor - Which corner to anchor ('tl', 'tr', 'bl', 'br', 'center')
 * @returns {Object} Constrained rect
 */
export const applyCropAspectRatio = (rect, aspectRatio, anchor = 'center') => {
  if (!aspectRatio) return rect;

  const width = rect.x2 - rect.x1;
  const height = rect.y2 - rect.y1;
  const currentRatio = width / height;

  if (Math.abs(currentRatio - aspectRatio) < 0.01) {
    return rect; // Already correct ratio
  }

  let newWidth = width;
  let newHeight = height;

  if (currentRatio > aspectRatio) {
    // Too wide, constrain width
    newWidth = height * aspectRatio;
  } else {
    // Too tall, constrain height
    newHeight = width / aspectRatio;
  }

  // Apply constraint based on anchor
  if (anchor === 'center') {
    const centerX = (rect.x1 + rect.x2) / 2;
    const centerY = (rect.y1 + rect.y2) / 2;

    return {
      x1: centerX - newWidth / 2,
      y1: centerY - newHeight / 2,
      x2: centerX + newWidth / 2,
      y2: centerY + newHeight / 2,
    };
  }

  // Anchor-specific logic can be added here
  return rect;
};

/**
 * Create default crop rect (centered, 90% of image)
 *
 * @param {number|null} aspectRatio - Optional aspect ratio
 * @returns {Object} Default crop rect { x1, y1, x2, y2 }
 */
export const createDefaultCropRect = (aspectRatio = null) => {
  const margin = 0.05; // 5% margin on each side
  let rect = {
    x1: margin,
    y1: margin,
    x2: 1 - margin,
    y2: 1 - margin,
  };

  if (aspectRatio) {
    rect = applyCropAspectRatio(rect, aspectRatio, 'center');
    rect = clampCropRect(rect);
  }

  return rect;
};

/**
 * Convert crop rect from normalized (0-1) to pixel coordinates
 *
 * @param {Object} rect - Normalized crop rect { x1, y1, x2, y2 }
 * @param {number} imageWidth - Image width in pixels
 * @param {number} imageHeight - Image height in pixels
 * @returns {Object} Pixel crop rect
 */
export const cropRectToPixels = (rect, imageWidth, imageHeight) => {
  return {
    x: Math.round(rect.x1 * imageWidth),
    y: Math.round(rect.y1 * imageHeight),
    width: Math.round((rect.x2 - rect.x1) * imageWidth),
    height: Math.round((rect.y2 - rect.y1) * imageHeight),
  };
};

/**
 * Get crop rect dimensions
 *
 * @param {Object} rect - Crop rect { x1, y1, x2, y2 }
 * @returns {Object} { width, height, aspectRatio }
 */
export const getCropRectDimensions = (rect) => {
  const width = rect.x2 - rect.x1;
  const height = rect.y2 - rect.y1;

  return {
    width,
    height,
    aspectRatio: width / height,
  };
};

// ============================================================================
// HIT TESTING
// ============================================================================

/**
 * Check if point is inside crop rect
 *
 * @param {number} x - Point X (normalized 0-1)
 * @param {number} y - Point Y (normalized 0-1)
 * @param {Object} rect - Crop rect { x1, y1, x2, y2 }
 * @returns {boolean} True if inside
 */
export const isPointInCropRect = (x, y, rect) => {
  return x >= rect.x1 && x <= rect.x2 && y >= rect.y1 && y <= rect.y2;
};

/**
 * Get which handle (if any) is near a point
 *
 * @param {number} x - Point X (screen coords)
 * @param {number} y - Point Y (screen coords)
 * @param {Object} rect - Crop rect in screen coords { x1, y1, x2, y2 }
 * @param {number} threshold - Hit threshold in pixels (default: 20)
 * @returns {string|null} Handle name ('tl', 'tr', 'bl', 'br', 'edge-t', 'edge-r', 'edge-b', 'edge-l') or null
 */
export const getCropHandleAtPoint = (x, y, rect, threshold = 20) => {
  const { x1, y1, x2, y2 } = rect;

  // Check corners first
  if (Math.abs(x - x1) < threshold && Math.abs(y - y1) < threshold) return 'tl';
  if (Math.abs(x - x2) < threshold && Math.abs(y - y1) < threshold) return 'tr';
  if (Math.abs(x - x1) < threshold && Math.abs(y - y2) < threshold) return 'bl';
  if (Math.abs(x - x2) < threshold && Math.abs(y - y2) < threshold) return 'br';

  // Check edges
  if (Math.abs(y - y1) < threshold && x >= x1 && x <= x2) return 'edge-t';
  if (Math.abs(y - y2) < threshold && x >= x1 && x <= x2) return 'edge-b';
  if (Math.abs(x - x1) < threshold && y >= y1 && y <= y2) return 'edge-l';
  if (Math.abs(x - x2) < threshold && y >= y1 && y <= y2) return 'edge-r';

  return null;
};
