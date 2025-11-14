/**
 * Text Utilities for Photo Editor
 *
 * Provides functions for rendering text on canvas with various styles
 */

/**
 * Text layer configuration object
 * @typedef {Object} TextLayer
 * @property {string} id - Unique identifier for the text layer
 * @property {string} text - The text content
 * @property {number} x - X position (0-1, relative to canvas width)
 * @property {number} y - Y position (0-1, relative to canvas height)
 * @property {number} fontSize - Font size in pixels
 * @property {string} fontFamily - Font family name
 * @property {string} color - Text color (hex or rgb)
 * @property {string} align - Text alignment ('left', 'center', 'right')
 * @property {boolean} bold - Bold text
 * @property {boolean} italic - Italic text
 * @property {Object} shadow - Text shadow settings
 * @property {boolean} shadow.enabled - Enable shadow
 * @property {string} shadow.color - Shadow color
 * @property {number} shadow.blur - Shadow blur radius
 * @property {number} shadow.offsetX - Shadow X offset
 * @property {number} shadow.offsetY - Shadow Y offset
 * @property {Object} stroke - Text stroke/outline settings
 * @property {boolean} stroke.enabled - Enable stroke
 * @property {string} stroke.color - Stroke color
 * @property {number} stroke.width - Stroke width
 */

/**
 * Default text layer configuration
 */
export const DEFAULT_TEXT_LAYER = {
  id: null,
  text: '',
  x: 0.5, // Center
  y: 0.5, // Center
  fontSize: 48,
  fontFamily: 'Arial',
  color: '#ffffff',
  align: 'center',
  bold: false,
  italic: false,
  shadow: {
    enabled: true,
    color: 'rgba(0, 0, 0, 0.5)',
    blur: 4,
    offsetX: 2,
    offsetY: 2
  },
  stroke: {
    enabled: false,
    color: '#000000',
    width: 2
  }
}

/**
 * Available font families
 */
export const FONT_FAMILIES = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Courier New', label: 'Courier New' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Impact', label: 'Impact' },
  { value: 'Comic Sans MS', label: 'Comic Sans MS' }
]

/**
 * Render a single text layer on canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {TextLayer} textLayer - Text layer configuration
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 */
export const renderTextLayer = (ctx, textLayer, canvasWidth, canvasHeight) => {
  if (!textLayer || !textLayer.text) return

  const {
    text,
    x,
    y,
    fontSize,
    fontFamily,
    color,
    align,
    bold,
    italic,
    shadow,
    stroke
  } = textLayer

  // Calculate absolute position
  const absX = x * canvasWidth
  const absY = y * canvasHeight

  // Save context state
  ctx.save()

  // Set font
  const fontStyle = `${italic ? 'italic ' : ''}${bold ? 'bold ' : ''}${fontSize}px ${fontFamily}`
  ctx.font = fontStyle
  ctx.textAlign = align
  ctx.textBaseline = 'middle'

  // Apply shadow if enabled
  if (shadow && shadow.enabled) {
    ctx.shadowColor = shadow.color
    ctx.shadowBlur = shadow.blur
    ctx.shadowOffsetX = shadow.offsetX
    ctx.shadowOffsetY = shadow.offsetY
  }

  // Draw stroke/outline if enabled
  if (stroke && stroke.enabled) {
    ctx.strokeStyle = stroke.color
    ctx.lineWidth = stroke.width
    ctx.lineJoin = 'round'
    ctx.strokeText(text, absX, absY)
  }

  // Draw text fill
  ctx.fillStyle = color
  ctx.fillText(text, absX, absY)

  // Restore context state
  ctx.restore()
}

/**
 * Apply text layers to a canvas and return new canvas
 * @param {HTMLCanvasElement} sourceCanvas - Source canvas
 * @param {TextLayer[]} textLayers - Array of text layers to render
 * @returns {HTMLCanvasElement} New canvas with text layers applied
 */
export const applyTextLayers = (sourceCanvas, textLayers = []) => {
  if (!sourceCanvas || !textLayers || textLayers.length === 0) {
    return sourceCanvas
  }

  // Create new canvas
  const canvas = document.createElement('canvas')
  canvas.width = sourceCanvas.width
  canvas.height = sourceCanvas.height
  const ctx = canvas.getContext('2d')

  // Draw source image
  ctx.drawImage(sourceCanvas, 0, 0)

  // Render each text layer
  textLayers.forEach(layer => {
    renderTextLayer(ctx, layer, canvas.width, canvas.height)
  })

  return canvas
}

/**
 * Generate unique ID for text layer
 * @returns {string} Unique ID
 */
export const generateTextLayerId = () => {
  return `text_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Create a new text layer with default values
 * @param {Partial<TextLayer>} overrides - Override default values
 * @returns {TextLayer} New text layer
 */
export const createTextLayer = (overrides = {}) => {
  return {
    ...DEFAULT_TEXT_LAYER,
    ...overrides,
    id: generateTextLayerId(),
    shadow: {
      ...DEFAULT_TEXT_LAYER.shadow,
      ...(overrides.shadow || {})
    },
    stroke: {
      ...DEFAULT_TEXT_LAYER.stroke,
      ...(overrides.stroke || {})
    }
  }
}

/**
 * Update a text layer property
 * @param {TextLayer} textLayer - Text layer to update
 * @param {string} property - Property path (supports nested like 'shadow.color')
 * @param {any} value - New value
 * @returns {TextLayer} Updated text layer
 */
export const updateTextLayer = (textLayer, property, value) => {
  const updated = { ...textLayer }

  // Handle nested properties
  if (property.includes('.')) {
    const [parent, child] = property.split('.')
    updated[parent] = {
      ...updated[parent],
      [child]: value
    }
  } else {
    updated[property] = value
  }

  return updated
}

/**
 * Get text metrics for positioning
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {string} text - Text to measure
 * @param {number} fontSize - Font size
 * @param {string} fontFamily - Font family
 * @param {boolean} bold - Bold text
 * @param {boolean} italic - Italic text
 * @returns {TextMetrics} Text metrics
 */
export const measureText = (ctx, text, fontSize, fontFamily, bold = false, italic = false) => {
  ctx.save()
  const fontStyle = `${italic ? 'italic ' : ''}${bold ? 'bold ' : ''}${fontSize}px ${fontFamily}`
  ctx.font = fontStyle
  const metrics = ctx.measureText(text)
  ctx.restore()
  return metrics
}

/**
 * Calculate text bounding box for hit detection
 * @param {TextLayer} textLayer - Text layer
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 * @param {CanvasRenderingContext2D} ctx - Canvas context for measuring
 * @returns {Object} Bounding box {x, y, width, height}
 */
export const getTextBoundingBox = (textLayer, canvasWidth, canvasHeight, ctx) => {
  const { text, x, y, fontSize, fontFamily, bold, italic, align } = textLayer

  const metrics = measureText(ctx, text, fontSize, fontFamily, bold, italic)
  const absX = x * canvasWidth
  const absY = y * canvasHeight

  let left = absX
  if (align === 'center') {
    left = absX - metrics.width / 2
  } else if (align === 'right') {
    left = absX - metrics.width
  }

  return {
    x: left,
    y: absY - fontSize / 2,
    width: metrics.width,
    height: fontSize
  }
}
