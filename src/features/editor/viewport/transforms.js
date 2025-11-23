/**
 * Transform Utilities for Editor Viewport
 *
 * Functions for building CSS transform strings and managing transform state
 */

/**
 * Build CSS transform string for image
 * Order: translate -> scale -> rotate
 */
export const buildImageTransform = ({ translateX = 0, translateY = 0, scale = 1, rotate = 0 }) => {
  const transforms = [];

  // Translate first (pan)
  if (translateX !== 0 || translateY !== 0) {
    transforms.push(`translate(${translateX}px, ${translateY}px)`);
  }

  // Scale (zoom)
  if (scale !== 1) {
    transforms.push(`scale(${scale})`);
  }

  // Rotate
  if (rotate !== 0) {
    transforms.push(`rotate(${rotate}deg)`);
  }

  return transforms.join(' ');
};

/**
 * Build CSS filter string for color adjustments
 */
export const buildFilterString = ({ brightness = 0, contrast = 0, saturation = 0, blur = 0 }) => {
  const filters = [];

  // Brightness: -100 to 100 -> 0 to 2
  if (brightness !== 0) {
    const value = 1 + (brightness / 100);
    filters.push(`brightness(${value})`);
  }

  // Contrast: -100 to 100 -> 0 to 2
  if (contrast !== 0) {
    const value = 1 + (contrast / 100);
    filters.push(`contrast(${value})`);
  }

  // Saturation: -100 to 100 -> 0 to 2
  if (saturation !== 0) {
    const value = 1 + (saturation / 100);
    filters.push(`saturate(${value})`);
  }

  // Blur: 0 to 10 -> 0 to 10px
  if (blur > 0) {
    filters.push(`blur(${blur}px)`);
  }

  return filters.length > 0 ? filters.join(' ') : 'none';
};

/**
 * Parse transform string to object
 */
export const parseTransform = (transformString) => {
  const result = {
    translateX: 0,
    translateY: 0,
    scale: 1,
    rotate: 0,
  };

  if (!transformString) return result;

  // Extract translate
  const translateMatch = transformString.match(/translate\((-?\d+\.?\d*)px,\s*(-?\d+\.?\d*)px\)/);
  if (translateMatch) {
    result.translateX = parseFloat(translateMatch[1]);
    result.translateY = parseFloat(translateMatch[2]);
  }

  // Extract scale
  const scaleMatch = transformString.match(/scale\((-?\d+\.?\d*)\)/);
  if (scaleMatch) {
    result.scale = parseFloat(scaleMatch[1]);
  }

  // Extract rotate
  const rotateMatch = transformString.match(/rotate\((-?\d+\.?\d*)deg\)/);
  if (rotateMatch) {
    result.rotate = parseFloat(rotateMatch[1]);
  }

  return result;
};

/**
 * Create initial transform state
 */
export const createInitialTransform = () => ({
  translateX: 0,
  translateY: 0,
  scale: 1,
  rotate: 0,
  flipH: false,
  flipV: false,
});

/**
 * Apply flip to transform
 */
export const applyFlip = (transform, flipH, flipV) => {
  let scaleX = transform.scale;
  let scaleY = transform.scale;

  if (flipH) scaleX = -scaleX;
  if (flipV) scaleY = -scaleY;

  return {
    ...transform,
    flipH,
    flipV,
  };
};

/**
 * Calculate zoom around point
 * Returns new translate values to zoom around a specific point
 */
export const zoomAroundPoint = (pointX, pointY, currentScale, newScale, currentTranslateX, currentTranslateY) => {
  // Calculate the zoom delta
  const scaleDelta = newScale - currentScale;

  // Adjust translation to zoom around the point
  const translateX = currentTranslateX - (pointX * scaleDelta);
  const translateY = currentTranslateY - (pointY * scaleDelta);

  return { translateX, translateY };
};
