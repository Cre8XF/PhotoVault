/**
 * Text overlay utilities for collage canvas
 * Handles text rendering with custom styling and shadows
 */

/**
 * Draw text on canvas with custom styling
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {string} text - Text to draw
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {Object} options - Text styling options
 */
export const drawText = (ctx, text, x, y, options = {}) => {
  const {
    fontSize = 48,
    fontFamily = 'Arial',
    fontWeight = 'normal',
    color = '#000000',
    align = 'center',
    baseline = 'middle',
    maxWidth = null,
    shadow = true,
    shadowColor = 'rgba(0, 0, 0, 0.5)',
    shadowBlur = 4,
    shadowOffsetX = 2,
    shadowOffsetY = 2,
    stroke = false,
    strokeColor = '#ffffff',
    strokeWidth = 3
  } = options

  // Save context state
  ctx.save()

  // Set font
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
  ctx.fillStyle = color
  ctx.textAlign = align
  ctx.textBaseline = baseline

  // Add shadow if enabled
  if (shadow) {
    ctx.shadowColor = shadowColor
    ctx.shadowBlur = shadowBlur
    ctx.shadowOffsetX = shadowOffsetX
    ctx.shadowOffsetY = shadowOffsetY
  }

  // Draw stroke first (outline)
  if (stroke) {
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = strokeWidth
    ctx.lineJoin = 'round'

    if (maxWidth) {
      ctx.strokeText(text, x, y, maxWidth)
    } else {
      ctx.strokeText(text, x, y)
    }
  }

  // Draw filled text
  if (maxWidth) {
    ctx.fillText(text, x, y, maxWidth)
  } else {
    ctx.fillText(text, x, y)
  }

  // Restore context state
  ctx.restore()
}

/**
 * Measure text width for layout calculations
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {string} text - Text to measure
 * @param {number} fontSize - Font size
 * @param {string} fontFamily - Font family
 * @returns {number} Text width in pixels
 */
export const measureText = (ctx, text, fontSize = 48, fontFamily = 'Arial', fontWeight = 'normal') => {
  ctx.save()
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`
  const metrics = ctx.measureText(text)
  ctx.restore()
  return metrics.width
}

/**
 * Wrap text to fit within max width
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {string} text - Text to wrap
 * @param {number} maxWidth - Maximum width per line
 * @param {number} fontSize - Font size
 * @param {string} fontFamily - Font family
 * @returns {string[]} Array of text lines
 */
export const wrapText = (ctx, text, maxWidth, fontSize = 48, fontFamily = 'Arial', fontWeight = 'normal') => {
  ctx.save()
  ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`

  const words = text.split(' ')
  const lines = []
  let currentLine = words[0]

  for (let i = 1; i < words.length; i++) {
    const word = words[i]
    const width = ctx.measureText(currentLine + ' ' + word).width

    if (width < maxWidth) {
      currentLine += ' ' + word
    } else {
      lines.push(currentLine)
      currentLine = word
    }
  }
  lines.push(currentLine)

  ctx.restore()
  return lines
}

/**
 * Draw multiline text
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {string} text - Text to draw
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate (top of text block)
 * @param {number} maxWidth - Maximum width per line
 * @param {number} lineHeight - Line height multiplier
 * @param {Object} options - Text styling options
 */
export const drawMultilineText = (ctx, text, x, y, maxWidth, lineHeight = 1.2, options = {}) => {
  const { fontSize = 48, fontFamily = 'Arial', fontWeight = 'normal' } = options

  const lines = wrapText(ctx, text, maxWidth, fontSize, fontFamily, fontWeight)
  const lineHeightPx = fontSize * lineHeight

  lines.forEach((line, index) => {
    const lineY = y + (index * lineHeightPx)
    drawText(ctx, line, x, lineY, { ...options, maxWidth })
  })
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
  { value: 'Comic Sans MS', label: 'Comic Sans' },
]

/**
 * Available font weights
 */
export const FONT_WEIGHTS = [
  { value: 'normal', label: 'Normal' },
  { value: 'bold', label: 'Bold' },
]

/**
 * Preset text colors
 */
export const TEXT_COLORS = [
  { value: '#000000', label: 'Black' },
  { value: '#FFFFFF', label: 'White' },
  { value: '#FF0000', label: 'Red' },
  { value: '#00FF00', label: 'Green' },
  { value: '#0000FF', label: 'Blue' },
  { value: '#FFFF00', label: 'Yellow' },
  { value: '#FF00FF', label: 'Magenta' },
  { value: '#00FFFF', label: 'Cyan' },
  { value: '#FFA500', label: 'Orange' },
  { value: '#800080', label: 'Purple' },
]
