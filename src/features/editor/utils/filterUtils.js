/**
 * Photo Editor - Phase 2: Filters & Adjustments
 *
 * Filter Utilities - CSS filters and pixel adjustments
 */

/**
 * Get CSS filter string for named filter (Phase 1A)
 * @param {string} name - Filter name ('original', 'bright', 'warm', 'cool', 'vintage', 'bw', 'fade', 'mono')
 * @returns {string} CSS filter string
 */
export const getCssFilter = (name) => {
  switch (name) {
    case 'original':
      return 'none';
    case 'bright':
      return 'brightness(1.2) contrast(1.05)';
    case 'warm':
      return 'brightness(1.05) sepia(0.3) saturate(1.2)';
    case 'cool':
      return 'brightness(0.95) saturate(1.3) hue-rotate(10deg)';
    case 'fade':
      return 'contrast(0.85) brightness(1.1) saturate(0.8)';
    case 'mono':
      return 'grayscale(1) contrast(1.1)';
    case 'vintage':
      return 'sepia(0.4) contrast(0.9) brightness(0.95)';
    case 'bw':
      return 'grayscale(1) contrast(1.1)';
    default:
      return 'none';
  }
};

/**
 * CSS Filter Presets
 */
export const FILTERS = {
  none: {
    name: 'Original',
    nameNo: 'Original',
    filter: ''
  },
  grayscale: {
    name: 'Grayscale',
    nameNo: 'Gråtone',
    filter: 'grayscale(100%)'
  },
  sepia: {
    name: 'Sepia',
    nameNo: 'Sepia',
    filter: 'sepia(100%)'
  },
  vintage: {
    name: 'Vintage',
    nameNo: 'Vintage',
    filter: 'sepia(50%) contrast(120%) brightness(110%)'
  },
  cold: {
    name: 'Cold',
    nameNo: 'Kald',
    filter: 'saturate(150%) hue-rotate(180deg)'
  },
  warm: {
    name: 'Warm',
    nameNo: 'Varm',
    filter: 'saturate(150%) hue-rotate(-30deg)'
  },
  highContrast: {
    name: 'High Contrast',
    nameNo: 'Høy kontrast',
    filter: 'contrast(150%) brightness(105%)'
  },
  fade: {
    name: 'Fade',
    nameNo: 'Falmet',
    filter: 'brightness(110%) contrast(90%) saturate(80%)'
  }
}

/**
 * Apply CSS filter to canvas
 * @param {HTMLCanvasElement} sourceCanvas - Source canvas
 * @param {string} filterName - Filter name from FILTERS
 * @returns {HTMLCanvasElement} - New canvas with filter applied
 */
export const applyFilter = (sourceCanvas, filterName) => {
  if (!sourceCanvas || !FILTERS[filterName]) {
    console.error('Invalid parameters for applyFilter')
    return sourceCanvas
  }

  const filteredCanvas = document.createElement('canvas')
  filteredCanvas.width = sourceCanvas.width
  filteredCanvas.height = sourceCanvas.height

  const ctx = filteredCanvas.getContext('2d')

  // Apply CSS filter
  const filterValue = FILTERS[filterName].filter
  if (filterValue) {
    ctx.filter = filterValue
  }

  ctx.drawImage(sourceCanvas, 0, 0)
  ctx.filter = 'none' // Reset

  console.log(`🎨 Applied filter: ${filterName}`)

  return filteredCanvas
}

/**
 * Adjust brightness (pixel manipulation)
 * @param {HTMLCanvasElement} sourceCanvas - Source canvas
 * @param {number} amount - Brightness adjustment (-100 to +100)
 * @returns {HTMLCanvasElement} - New canvas with adjusted brightness
 */
export const adjustBrightness = (sourceCanvas, amount) => {
  if (!sourceCanvas || amount === 0) {
    return sourceCanvas
  }

  const adjustedCanvas = document.createElement('canvas')
  adjustedCanvas.width = sourceCanvas.width
  adjustedCanvas.height = sourceCanvas.height

  const ctx = adjustedCanvas.getContext('2d')
  ctx.drawImage(sourceCanvas, 0, 0)

  const imageData = ctx.getImageData(0, 0, adjustedCanvas.width, adjustedCanvas.height)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.max(0, Math.min(255, data[i] + amount))       // R
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + amount)) // G
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + amount)) // B
    // Alpha channel (i + 3) unchanged
  }

  ctx.putImageData(imageData, 0, 0)

  console.log(`☀️ Adjusted brightness: ${amount > 0 ? '+' : ''}${amount}`)

  return adjustedCanvas
}

/**
 * Adjust contrast (pixel manipulation)
 * @param {HTMLCanvasElement} sourceCanvas - Source canvas
 * @param {number} amount - Contrast adjustment (0.5 to 2.0, 1.0 = no change)
 * @returns {HTMLCanvasElement} - New canvas with adjusted contrast
 */
export const adjustContrast = (sourceCanvas, amount) => {
  if (!sourceCanvas || amount === 1.0) {
    return sourceCanvas
  }

  const adjustedCanvas = document.createElement('canvas')
  adjustedCanvas.width = sourceCanvas.width
  adjustedCanvas.height = sourceCanvas.height

  const ctx = adjustedCanvas.getContext('2d')
  ctx.drawImage(sourceCanvas, 0, 0)

  const imageData = ctx.getImageData(0, 0, adjustedCanvas.width, adjustedCanvas.height)
  const data = imageData.data

  const factor = amount
  const intercept = 128 * (1 - factor)

  for (let i = 0; i < data.length; i += 4) {
    data[i] = Math.max(0, Math.min(255, data[i] * factor + intercept))       // R
    data[i + 1] = Math.max(0, Math.min(255, data[i + 1] * factor + intercept)) // G
    data[i + 2] = Math.max(0, Math.min(255, data[i + 2] * factor + intercept)) // B
  }

  ctx.putImageData(imageData, 0, 0)

  console.log(`🔆 Adjusted contrast: ${amount.toFixed(2)}x`)

  return adjustedCanvas
}

/**
 * Adjust saturation (pixel manipulation via HSL)
 * @param {HTMLCanvasElement} sourceCanvas - Source canvas
 * @param {number} amount - Saturation multiplier (0.0 to 2.0, 1.0 = no change)
 * @returns {HTMLCanvasElement} - New canvas with adjusted saturation
 */
export const adjustSaturation = (sourceCanvas, amount) => {
  if (!sourceCanvas || amount === 1.0) {
    return sourceCanvas
  }

  const adjustedCanvas = document.createElement('canvas')
  adjustedCanvas.width = sourceCanvas.width
  adjustedCanvas.height = sourceCanvas.height

  const ctx = adjustedCanvas.getContext('2d')
  ctx.drawImage(sourceCanvas, 0, 0)

  const imageData = ctx.getImageData(0, 0, adjustedCanvas.width, adjustedCanvas.height)
  const data = imageData.data

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]
    const g = data[i + 1]
    const b = data[i + 2]

    // Convert RGB to HSL
    const hsl = rgbToHsl(r, g, b)

    // Adjust saturation
    hsl[1] = Math.max(0, Math.min(1, hsl[1] * amount))

    // Convert back to RGB
    const rgb = hslToRgb(hsl[0], hsl[1], hsl[2])

    data[i] = rgb[0]
    data[i + 1] = rgb[1]
    data[i + 2] = rgb[2]
  }

  ctx.putImageData(imageData, 0, 0)

  console.log(`🎨 Adjusted saturation: ${amount.toFixed(2)}x`)

  return adjustedCanvas
}

/**
 * Convert RGB to HSL
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {Array} - [h, s, l] where h is 0-360, s and l are 0-1
 */
const rgbToHsl = (r, g, b) => {
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h, s, l = (max + min) / 2

  if (max === min) {
    h = s = 0 // Achromatic
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return [h * 360, s, l]
}

/**
 * Convert HSL to RGB
 * @param {number} h - Hue (0-360)
 * @param {number} s - Saturation (0-1)
 * @param {number} l - Lightness (0-1)
 * @returns {Array} - [r, g, b] where each is 0-255
 */
const hslToRgb = (h, s, l) => {
  h /= 360

  let r, g, b

  if (s === 0) {
    r = g = b = l // Achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q

    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return [
    Math.round(r * 255),
    Math.round(g * 255),
    Math.round(b * 255)
  ]
}

/**
 * Apply multiple adjustments in sequence
 * @param {HTMLCanvasElement} sourceCanvas - Source canvas
 * @param {Object} adjustments - { brightness, contrast, saturation }
 * @returns {HTMLCanvasElement} - Canvas with all adjustments applied
 */
export const applyAdjustments = (sourceCanvas, adjustments = {}) => {
  let currentCanvas = sourceCanvas

  // Apply brightness
  if (adjustments.brightness !== undefined && adjustments.brightness !== 0) {
    currentCanvas = adjustBrightness(currentCanvas, adjustments.brightness)
  }

  // Apply contrast
  if (adjustments.contrast !== undefined && adjustments.contrast !== 1.0) {
    currentCanvas = adjustContrast(currentCanvas, adjustments.contrast)
  }

  // Apply saturation
  if (adjustments.saturation !== undefined && adjustments.saturation !== 1.0) {
    currentCanvas = adjustSaturation(currentCanvas, adjustments.saturation)
  }

  return currentCanvas
}
