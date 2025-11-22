// ============================================================================
// MODULE: photoTransforms.js - Pure functions for photo transformations
// ============================================================================

/**
 * Photo Transform Utilities
 *
 * Pure functions for applying CSS-based transforms to photos
 * All functions return CSS filter/transform strings
 */

/**
 * Apply brightness transform
 * @param {number} value - Brightness value (-100 to 100)
 * @returns {string} CSS filter string
 */
export const applyBrightness = (value) => {
  // Convert -100 to 100 range to 0 to 2 (1 = no change)
  const brightness = 1 + value / 100;
  return `brightness(${brightness})`;
};

/**
 * Apply contrast transform
 * @param {number} value - Contrast value (-100 to 100)
 * @returns {string} CSS filter string
 */
export const applyContrast = (value) => {
  // Convert -100 to 100 range to 0 to 2 (1 = no change)
  const contrast = 1 + value / 100;
  return `contrast(${contrast})`;
};

/**
 * Apply saturation transform
 * @param {number} value - Saturation value (-100 to 100)
 * @returns {string} CSS filter string
 */
export const applySaturation = (value) => {
  // Convert -100 to 100 range to 0 to 2 (1 = no change)
  const saturation = 1 + value / 100;
  return `saturate(${saturation})`;
};

/**
 * Apply temperature transform (warm/cool tint)
 * @param {number} value - Temperature value (-100 to 100)
 * @returns {string} CSS filter string
 */
export const applyTemperature = (value) => {
  // Use hue-rotate for temperature effect
  // Negative = cooler (blue), Positive = warmer (orange)
  const hue = value * 0.6; // Scale down for subtlety
  return `hue-rotate(${hue}deg)`;
};

/**
 * Apply blur transform
 * @param {number} value - Blur value (0 to 10)
 * @returns {string} CSS filter string
 */
export const applyBlur = (value) => {
  return `blur(${value}px)`;
};

/**
 * Apply vignette effect
 * Note: Vignette is typically applied as a CSS gradient overlay,
 * not as a filter. This returns the opacity for the vignette layer.
 * @param {number} value - Vignette intensity (0 to 100)
 * @returns {number} Opacity value (0 to 1)
 */
export const applyVignette = (value) => {
  return value / 100;
};

/**
 * Apply rotation transform
 * @param {number} degrees - Rotation in degrees (0, 90, 180, 270)
 * @returns {string} CSS transform string
 */
export const applyRotation = (degrees) => {
  return `rotate(${degrees}deg)`;
};

/**
 * Apply flip transform
 * @param {boolean} flipH - Flip horizontally
 * @param {boolean} flipV - Flip vertically
 * @returns {string} CSS transform string
 */
export const applyFlip = (flipH, flipV) => {
  const scaleX = flipH ? -1 : 1;
  const scaleY = flipV ? -1 : 1;
  return `scale(${scaleX}, ${scaleY})`;
};

/**
 * Apply crop transform
 * Note: Crop is typically applied via CSS clip-path or object-position
 * @param {object} crop - Crop object { x, y, width, height }
 * @returns {object} CSS properties for crop
 */
export const applyCrop = (crop) => {
  if (!crop) return {};

  return {
    clipPath: `inset(${crop.y}px ${crop.x}px ${crop.height}px ${crop.width}px)`,
  };
};

/**
 * Combine all transforms into CSS filter string
 * @param {object} transform - Transform object from editorStore
 * @returns {string} Combined CSS filter string
 */
export const getCombinedFilters = (transform) => {
  const filters = [];

  if (transform.brightness !== 0) {
    filters.push(applyBrightness(transform.brightness));
  }

  if (transform.contrast !== 0) {
    filters.push(applyContrast(transform.contrast));
  }

  if (transform.saturation !== 0) {
    filters.push(applySaturation(transform.saturation));
  }

  if (transform.temperature !== 0) {
    filters.push(applyTemperature(transform.temperature));
  }

  if (transform.blur > 0) {
    filters.push(applyBlur(transform.blur));
  }

  return filters.join(' ');
};

/**
 * Combine rotation and flip into CSS transform string
 * @param {object} transform - Transform object from editorStore
 * @returns {string} Combined CSS transform string
 */
export const getCombinedTransforms = (transform) => {
  const transforms = [];

  if (transform.rotate !== 0) {
    transforms.push(applyRotation(transform.rotate));
  }

  if (transform.flipH || transform.flipV) {
    transforms.push(applyFlip(transform.flipH, transform.flipV));
  }

  return transforms.join(' ');
};

/**
 * Get complete style object for preview
 * @param {object} transform - Transform object from editorStore
 * @returns {object} Complete CSS style object
 */
export const getPreviewStyle = (transform) => {
  const style = {
    filter: getCombinedFilters(transform),
    transform: getCombinedTransforms(transform),
  };

  // Add crop if present
  if (transform.crop) {
    Object.assign(style, applyCrop(transform.crop));
  }

  return style;
};

/**
 * Apply all transforms to photo data (for save)
 * Note: This returns the transform metadata, not actual pixel manipulation
 * Actual rendering happens on the backend or via canvas
 * @param {object} photo - Original photo object
 * @param {object} transform - Transform object
 * @returns {object} Photo with transform metadata
 */
export const applyAllTransforms = (photo, transform) => {
  return {
    ...photo,
    editTransform: transform,
    edited: true,
    editedAt: new Date().toISOString(),
  };
};
