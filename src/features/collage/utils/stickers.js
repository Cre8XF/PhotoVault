/**
 * Sticker library for collage decorations
 * Emoji-based stickers organized by category
 */

/**
 * Predefined sticker categories with emojis
 */
export const STICKERS = {
  hearts: {
    name: 'Hjerter',
    emoji: '❤️',
    items: ['❤️', '💖', '💕', '💗', '💓', '💝', '💘', '💞']
  },
  celebrations: {
    name: 'Feiring',
    emoji: '🎉',
    items: ['🎉', '🎊', '🎈', '🎁', '🎂', '🎆', '✨', '🎀']
  },
  travel: {
    name: 'Reise',
    emoji: '✈️',
    items: ['✈️', '🗺️', '📍', '🏖️', '🏝️', '🗼', '🏔️', '🌍']
  },
  seasons: {
    name: 'Årstider',
    emoji: '🌸',
    items: ['🌸', '☀️', '🍂', '❄️', '🌺', '🌻', '🍁', '⛄']
  },
  food: {
    name: 'Mat',
    emoji: '🍕',
    items: ['🍕', '🍔', '🍰', '🍦', '🍩', '🍪', '🎂', '🧁']
  },
  animals: {
    name: 'Dyr',
    emoji: '🐶',
    items: ['🐶', '🐱', '🐰', '🦊', '🐻', '🐼', '🐨', '🦁']
  },
  nature: {
    name: 'Natur',
    emoji: '🌳',
    items: ['🌳', '🌲', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀']
  },
  weather: {
    name: 'Vær',
    emoji: '☀️',
    items: ['☀️', '🌤️', '⛅', '🌥️', '☁️', '🌧️', '⛈️', '🌈']
  },
  symbols: {
    name: 'Symboler',
    emoji: '⭐',
    items: ['⭐', '✨', '💫', '🌟', '💥', '💢', '💨', '💦']
  },
  faces: {
    name: 'Ansikter',
    emoji: '😊',
    items: ['😊', '😍', '🥰', '😎', '🤩', '🥳', '😂', '🤣']
  }
}

/**
 * Get all sticker categories
 * @returns {Array} Array of category objects
 */
export const getStickerCategories = () => {
  return Object.entries(STICKERS).map(([key, value]) => ({
    id: key,
    ...value
  }))
}

/**
 * Get stickers by category
 * @param {string} category - Category ID
 * @returns {Array} Array of sticker emojis
 */
export const getStickersByCategory = (category) => {
  return STICKERS[category]?.items || []
}

/**
 * Draw sticker (emoji) on canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {string} emoji - Emoji to draw
 * @param {number} x - X coordinate (center)
 * @param {number} y - Y coordinate (center)
 * @param {number} size - Size in pixels
 */
export const drawSticker = (ctx, emoji, x, y, size = 64) => {
  ctx.save()

  // Set font size for emoji
  ctx.font = `${size}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Draw emoji
  ctx.fillText(emoji, x, y)

  ctx.restore()
}

/**
 * Draw sticker with optional rotation
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {string} emoji - Emoji to draw
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} size - Size in pixels
 * @param {number} rotation - Rotation in degrees (0-360)
 */
export const drawStickerRotated = (ctx, emoji, x, y, size = 64, rotation = 0) => {
  ctx.save()

  // Translate to position and rotate
  ctx.translate(x, y)
  ctx.rotate((rotation * Math.PI) / 180)

  // Set font size for emoji
  ctx.font = `${size}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  // Draw emoji
  ctx.fillText(emoji, 0, 0)

  ctx.restore()
}

/**
 * Get emoji size in pixels (for hit detection)
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {string} emoji - Emoji to measure
 * @param {number} size - Font size
 * @returns {Object} {width, height} in pixels
 */
export const getStickerBounds = (ctx, emoji, size = 64) => {
  ctx.save()
  ctx.font = `${size}px Arial`
  const metrics = ctx.measureText(emoji)
  ctx.restore()

  return {
    width: metrics.width,
    height: size // Approximate height based on font size
  }
}

/**
 * Default sticker sizes
 */
export const STICKER_SIZES = [
  { value: 32, label: 'Liten' },
  { value: 48, label: 'Middels' },
  { value: 64, label: 'Stor' },
  { value: 96, label: 'Extra stor' }
]
