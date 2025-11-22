// ============================================================================
// AI Transforms - Pure Functions for Image Transformations
// ============================================================================
// Reusable transform functions for both EditorWorld and AI operations
// All transforms are CSS-based for performance (no pixel manipulation)

/**
 * Apply brightness transform
 * @param {number} value - Brightness adjustment (-100 to +100)
 * @returns {string} CSS filter string
 */
export const applyBrightness = (value) => {
  const brightness = 1 + value / 100; // -100→0, 0→1, +100→2
  return `brightness(${Math.max(0, brightness)})`;
};

/**
 * Apply contrast transform
 * @param {number} value - Contrast adjustment (-100 to +100)
 * @returns {string} CSS filter string
 */
export const applyContrast = (value) => {
  const contrast = 1 + value / 100;
  return `contrast(${Math.max(0, contrast)})`;
};

/**
 * Apply saturation transform
 * @param {number} value - Saturation adjustment (-100 to +100)
 * @returns {string} CSS filter string
 */
export const applySaturation = (value) => {
  const saturation = 1 + value / 100;
  return `saturate(${Math.max(0, saturation)})`;
};

/**
 * Apply temperature/warmth shift
 * @param {number} value - Temperature adjustment (-100 to +100)
 * @returns {string} CSS filter string
 */
export const applyTemperature = (value) => {
  // Warm: shift toward orange/red
  // Cool: shift toward blue
  const hueRotate = value * 0.5; // Scale down for subtler effect
  return `hue-rotate(${hueRotate}deg)`;
};

/**
 * Apply clarity/sharpness effect
 * @param {number} value - Clarity value (0 to 100)
 * @returns {string} CSS filter string
 */
export const applyClarity = (value) => {
  // Higher clarity = less blur + more contrast
  const contrast = 1 + (value / 200); // Subtle contrast boost
  return `contrast(${contrast})`;
};

/**
 * Apply warm color shift
 * Increases warmth by boosting reds and yellows
 * @param {number} intensity - Warmth intensity (0 to 100)
 * @returns {Object} Transform object
 */
export const applyWarmShift = (intensity) => {
  return {
    brightness: intensity * 0.05, // Slight brightness
    contrast: intensity * 0.1,
    saturation: intensity * 0.15,
    temperature: intensity * 0.5, // Main warm effect
  };
};

/**
 * Apply cold color shift
 * Increases coolness by boosting blues
 * @param {number} intensity - Cool intensity (0 to 100)
 * @returns {Object} Transform object
 */
export const applyColdShift = (intensity) => {
  return {
    brightness: -intensity * 0.03,
    contrast: intensity * 0.12,
    saturation: intensity * 0.05,
    temperature: -intensity * 0.5, // Main cool effect
  };
};

/**
 * Combine multiple CSS filters into one string
 * @param {Object} transforms - Object with transform values
 * @returns {string} Combined CSS filter string
 */
export const getCombinedFilters = (transforms) => {
  const filters = [];

  if (transforms.brightness !== undefined && transforms.brightness !== 0) {
    filters.push(applyBrightness(transforms.brightness));
  }
  if (transforms.contrast !== undefined && transforms.contrast !== 0) {
    filters.push(applyContrast(transforms.contrast));
  }
  if (transforms.saturation !== undefined && transforms.saturation !== 0) {
    filters.push(applySaturation(transforms.saturation));
  }
  if (transforms.temperature !== undefined && transforms.temperature !== 0) {
    filters.push(applyTemperature(transforms.temperature));
  }
  if (transforms.clarity !== undefined && transforms.clarity !== 0) {
    filters.push(applyClarity(transforms.clarity));
  }

  return filters.length > 0 ? filters.join(' ') : 'none';
};

/**
 * Create style object for image preview with transforms
 * @param {Object} transforms - Transform values
 * @returns {Object} React style object
 */
export const getTransformStyle = (transforms) => {
  return {
    filter: getCombinedFilters(transforms),
    transition: 'filter 0.2s ease',
  };
};

/**
 * AI Enhancement preset
 * Automatically balanced enhancement
 * @returns {Object} Enhancement transform values
 */
export const getAIEnhancePreset = () => {
  return {
    brightness: 5,
    contrast: 10,
    saturation: 3,
    clarity: 15,
    temperature: 2,
  };
};

/**
 * Vibrant color preset
 * Boosts colors and contrast
 * @returns {Object} Vibrant transform values
 */
export const getVibrantPreset = () => {
  return {
    brightness: 5,
    contrast: 15,
    saturation: 20,
    temperature: 5,
    clarity: 10,
  };
};

/**
 * Muted/Desaturated preset
 * Reduces saturation for muted look
 * @returns {Object} Muted transform values
 */
export const getMutedPreset = () => {
  return {
    brightness: 0,
    contrast: -5,
    saturation: -15,
    temperature: 0,
    clarity: 0,
  };
};

/**
 * Portrait preset
 * Optimized for portraits with skin tones
 * @returns {Object} Portrait transform values
 */
export const getPortraitPreset = () => {
  return {
    brightness: 8,
    contrast: 5,
    saturation: -5, // Reduce saturation for natural skin
    temperature: 8, // Warm for skin tones
    clarity: 12,
  };
};

/**
 * Black & White preset
 * High contrast B&W
 * @returns {Object} B&W transform values
 */
export const getBWPreset = () => {
  return {
    brightness: 0,
    contrast: 20,
    saturation: -100, // Full desaturation
    temperature: 0,
    clarity: 15,
  };
};

/**
 * Calculate difference between two transform sets
 * Used for showing "before/after" comparisons
 * @param {Object} original - Original transforms
 * @param {Object} modified - Modified transforms
 * @returns {Object} Difference map
 */
export const getTransformDiff = (original, modified) => {
  const diff = {};
  const keys = new Set([...Object.keys(original), ...Object.keys(modified)]);

  keys.forEach((key) => {
    const origVal = original[key] || 0;
    const modVal = modified[key] || 0;
    if (origVal !== modVal) {
      diff[key] = {
        original: origVal,
        modified: modVal,
        delta: modVal - origVal,
      };
    }
  });

  return diff;
};

export default {
  applyBrightness,
  applyContrast,
  applySaturation,
  applyTemperature,
  applyClarity,
  applyWarmShift,
  applyColdShift,
  getCombinedFilters,
  getTransformStyle,
  getAIEnhancePreset,
  getVibrantPreset,
  getMutedPreset,
  getPortraitPreset,
  getBWPreset,
  getTransformDiff,
};
