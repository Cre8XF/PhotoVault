/**
 * Adjustments Utility
 * Converts adjustment values (-100 to 100) to CSS filter strings
 */

/**
 * Convert brightness value to CSS filter
 * @param {number} value - Brightness (-100 to 100)
 * @returns {string} CSS filter string
 */
export function getBrightnessFilter(value) {
  // -100 = 0 (black), 0 = 1 (normal), 100 = 2 (double bright)
  const brightness = 1 + value / 100
  return `brightness(${Math.max(0, brightness)})`
}

/**
 * Convert contrast value to CSS filter
 * @param {number} value - Contrast (-100 to 100)
 * @returns {string} CSS filter string
 */
export function getContrastFilter(value) {
  const contrast = 1 + value / 100
  return `contrast(${Math.max(0, contrast)})`
}

/**
 * Convert saturation value to CSS filter
 * @param {number} value - Saturation (-100 to 100)
 * @returns {string} CSS filter string
 */
export function getSaturationFilter(value) {
  const saturation = 1 + value / 100
  return `saturate(${Math.max(0, saturation)})`
}

/**
 * Convert temperature value to CSS filter
 * @param {number} value - Temperature (-100 to 100, warm to cool)
 * @returns {string} CSS filter string
 */
export function getTemperatureFilter(value) {
  // Use hue-rotate for temperature shift
  // Positive = warmer (orange/red), Negative = cooler (blue)
  const hueRotate = value * 0.3 // Scale down for subtle effect
  return `hue-rotate(${hueRotate}deg)`
}

/**
 * Convert tint value to CSS filter
 * @param {number} value - Tint (-100 to 100, green to magenta)
 * @returns {string} CSS filter string
 */
export function getTintFilter(value) {
  // Similar to temperature but perpendicular on color wheel
  const hueRotate = value * 0.2
  return `hue-rotate(${hueRotate + 90}deg)` // Offset by 90 degrees
}

/**
 * Convert highlights value to filter
 * NOTE: CSS filters don't have native highlights control
 * This is a simplified approximation using brightness
 * @param {number} value - Highlights (-100 to 100)
 * @returns {string} CSS filter string
 */
export function getHighlightsFilter(value) {
  // Approximate with slight brightness shift
  const brightness = 1 + value / 300 // More subtle than main brightness
  return `brightness(${brightness})`
}

/**
 * Convert shadows value to filter
 * NOTE: CSS filters don't have native shadows control
 * This is a simplified approximation
 * @param {number} value - Shadows (-100 to 100)
 * @returns {string} CSS filter string
 */
export function getShadowsFilter(value) {
  // Approximate with contrast
  const contrast = 1 + value / 200
  return `contrast(${contrast})`
}

/**
 * Convert sharpness value to filter
 * @param {number} value - Sharpness (0 to 100)
 * @returns {string} CSS filter string
 */
export function getSharpnessFilter(value) {
  // Use contrast to simulate sharpness
  const contrast = 1 + value / 200
  return `contrast(${contrast})`
}

/**
 * NOTE: Vignette cannot be done with CSS filters alone
 * It requires canvas manipulation or CSS gradients
 * For now, we'll skip it in the filter chain
 * Will implement properly in future patch
 */

/**
 * Combine all adjustments into single CSS filter string
 * @param {Object} adjustments - Adjustment values
 * @returns {string} Combined CSS filter string
 */
export function getCombinedFilters(adjustments) {
  const filters = []

  if (adjustments.brightness !== 0) {
    filters.push(getBrightnessFilter(adjustments.brightness))
  }

  if (adjustments.contrast !== 0) {
    filters.push(getContrastFilter(adjustments.contrast))
  }

  if (adjustments.saturation !== 0) {
    filters.push(getSaturationFilter(adjustments.saturation))
  }

  if (adjustments.temperature !== 0) {
    filters.push(getTemperatureFilter(adjustments.temperature))
  }

  if (adjustments.tint !== 0) {
    filters.push(getTintFilter(adjustments.tint))
  }

  // Highlights and shadows are combined with main contrast/brightness
  // so we skip them to avoid double-application

  if (adjustments.sharpness !== 0) {
    filters.push(getSharpnessFilter(adjustments.sharpness))
  }

  // Vignette skipped for now (needs canvas implementation)

  return filters.length > 0 ? filters.join(' ') : 'none'
}

/**
 * FILTER PRESETS
 * Pre-configured adjustment combinations for common filter styles
 */

/**
 * Get adjustment values for a filter preset
 * @param {string} filterName - Filter preset name
 * @param {number} intensity - Filter intensity (0-100)
 * @returns {Object} Adjustment values
 */
export function getFilterPreset(filterName, intensity = 100) {
  // Scale factor based on intensity
  const scale = intensity / 100

  const presets = {
    none: {
      brightness: 0,
      contrast: 0,
      saturation: 0,
      temperature: 0,
      tint: 0,
      highlights: 0,
      shadows: 0,
      sharpness: 0,
      vignette: 0,
    },

    vivid: {
      brightness: Math.round(5 * scale),
      contrast: Math.round(15 * scale),
      saturation: Math.round(25 * scale),
      temperature: Math.round(5 * scale),
      tint: 0,
      highlights: Math.round(-5 * scale),
      shadows: Math.round(10 * scale),
      sharpness: Math.round(10 * scale),
      vignette: 0,
    },

    warm: {
      brightness: Math.round(8 * scale),
      contrast: Math.round(5 * scale),
      saturation: Math.round(10 * scale),
      temperature: Math.round(30 * scale),
      tint: Math.round(-5 * scale),
      highlights: Math.round(5 * scale),
      shadows: Math.round(-5 * scale),
      sharpness: 0,
      vignette: Math.round(15 * scale),
    },

    cool: {
      brightness: Math.round(-3 * scale),
      contrast: Math.round(10 * scale),
      saturation: Math.round(5 * scale),
      temperature: Math.round(-30 * scale),
      tint: Math.round(5 * scale),
      highlights: Math.round(-10 * scale),
      shadows: Math.round(5 * scale),
      sharpness: Math.round(5 * scale),
      vignette: 0,
    },

    bw: {
      brightness: Math.round(5 * scale),
      contrast: Math.round(20 * scale),
      saturation: Math.round(-100 * scale),
      temperature: 0,
      tint: 0,
      highlights: Math.round(-5 * scale),
      shadows: Math.round(10 * scale),
      sharpness: Math.round(15 * scale),
      vignette: Math.round(20 * scale),
    },

    vintage: {
      brightness: Math.round(3 * scale),
      contrast: Math.round(-10 * scale),
      saturation: Math.round(-15 * scale),
      temperature: Math.round(20 * scale),
      tint: Math.round(-10 * scale),
      highlights: Math.round(-15 * scale),
      shadows: Math.round(-10 * scale),
      sharpness: Math.round(-5 * scale),
      vignette: Math.round(30 * scale),
    },

    dramatic: {
      brightness: Math.round(-5 * scale),
      contrast: Math.round(35 * scale),
      saturation: Math.round(15 * scale),
      temperature: Math.round(-5 * scale),
      tint: 0,
      highlights: Math.round(-20 * scale),
      shadows: Math.round(20 * scale),
      sharpness: Math.round(20 * scale),
      vignette: Math.round(40 * scale),
    },

    soft: {
      brightness: Math.round(10 * scale),
      contrast: Math.round(-15 * scale),
      saturation: Math.round(-10 * scale),
      temperature: Math.round(10 * scale),
      tint: Math.round(5 * scale),
      highlights: Math.round(10 * scale),
      shadows: Math.round(-15 * scale),
      sharpness: Math.round(-10 * scale),
      vignette: Math.round(10 * scale),
    },
  }

  return presets[filterName] || presets.none
}

/**
 * Get filter preset metadata
 * @param {string} filterName - Filter preset name
 * @returns {Object} Filter metadata
 */
export function getFilterMetadata(filterName) {
  const metadata = {
    none: {
      name: 'None',
      description: 'Original image',
      icon: '🚫',
    },
    vivid: {
      name: 'Vivid',
      description: 'Boost colors and contrast',
      icon: '🌈',
    },
    warm: {
      name: 'Warm',
      description: 'Sunset-like warmth',
      icon: '🌅',
    },
    cool: {
      name: 'Cool',
      description: 'Cool blue tones',
      icon: '❄️',
    },
    bw: {
      name: 'B&W',
      description: 'Classic black and white',
      icon: '⚫',
    },
    vintage: {
      name: 'Vintage',
      description: 'Retro faded look',
      icon: '📷',
    },
    dramatic: {
      name: 'Dramatic',
      description: 'High contrast and shadows',
      icon: '⚡',
    },
    soft: {
      name: 'Soft',
      description: 'Dreamy soft focus',
      icon: '☁️',
    },
  }

  return metadata[filterName] || metadata.none
}

/**
 * List of all available filter presets
 */
export const FILTER_PRESETS = [
  'none',
  'vivid',
  'warm',
  'cool',
  'bw',
  'vintage',
  'dramatic',
  'soft',
]
