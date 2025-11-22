// ============================================================================
// MODULE: filterPresets.js - Predefined filter presets
// ============================================================================

/**
 * Filter Presets
 *
 * Predefined combinations of transform values that create specific looks
 * Each preset is a partial transform object that can be applied via applyBatch
 */

export const filterPresets = [
  {
    id: 'none',
    name: 'Original',
    nameKey: 'editor.filters.none',
    transform: {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      temperature: 0,
      blur: 0,
      vignette: 0,
    },
  },
  {
    id: 'vintage',
    name: 'Vintage',
    nameKey: 'editor.filters.vintage',
    transform: {
      brightness: -10,
      contrast: 15,
      saturation: -20,
      temperature: 15,
      blur: 0,
      vignette: 30,
    },
  },
  {
    id: 'bright',
    name: 'Bright',
    nameKey: 'editor.filters.bright',
    transform: {
      brightness: 25,
      contrast: 10,
      saturation: 15,
      temperature: 10,
      blur: 0,
      vignette: 0,
    },
  },
  {
    id: 'bw',
    name: 'Black & White',
    nameKey: 'editor.filters.bw',
    transform: {
      brightness: 5,
      contrast: 20,
      saturation: -100,
      temperature: 0,
      blur: 0,
      vignette: 15,
    },
  },
  {
    id: 'cinematic',
    name: 'Cinematic',
    nameKey: 'editor.filters.cinematic',
    transform: {
      brightness: -5,
      contrast: 25,
      saturation: -10,
      temperature: 5,
      blur: 0,
      vignette: 40,
    },
  },
  {
    id: 'warm',
    name: 'Warm',
    nameKey: 'editor.filters.warm',
    transform: {
      brightness: 10,
      contrast: 5,
      saturation: 10,
      temperature: 30,
      blur: 0,
      vignette: 10,
    },
  },
  {
    id: 'cool',
    name: 'Cool',
    nameKey: 'editor.filters.cool',
    transform: {
      brightness: 5,
      contrast: 10,
      saturation: 5,
      temperature: -30,
      blur: 0,
      vignette: 10,
    },
  },
  {
    id: 'fade',
    name: 'Fade',
    nameKey: 'editor.filters.fade',
    transform: {
      brightness: 15,
      contrast: -15,
      saturation: -15,
      temperature: 5,
      blur: 0,
      vignette: 20,
    },
  },
];

/**
 * Get filter preset by ID
 * @param {string} id - Filter preset ID
 * @returns {object|null} Filter preset or null if not found
 */
export const getFilterPreset = (id) => {
  return filterPresets.find((preset) => preset.id === id) || null;
};

/**
 * Get all filter presets
 * @returns {array} Array of all filter presets
 */
export const getAllFilterPresets = () => {
  return filterPresets;
};
