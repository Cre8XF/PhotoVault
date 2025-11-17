// ============================================================================
// UTILITY: renderCollageToCanvas.js
// Renders collage layouts to canvas for thumbnail/download generation
// ============================================================================

/**
 * Render collage to canvas and export as blob
 * @param {Object} layout - Layout configuration from layouts_v3.js
 * @param {Array} photos - Array of photo objects
 * @param {Object} transforms - Transform data { [photoId]: { scale, translateX, translateY } }
 * @param {Object} options - Optional rendering options
 * @param {number} options.quality - JPEG quality (0-1, default 0.85)
 * @param {boolean} options.useHighRes - Use high-res URLs (default true)
 * @returns {Promise<Blob>} JPEG blob
 */
export async function renderCollageToCanvas({
  layout,
  photos,
  transforms = {},
  options = {}
}) {
  const {
    quality = 0.85,
    useHighRes = true
  } = options

  // Validate inputs
  if (!layout) {
    throw new Error('Layout is required')
  }
  if (!photos || photos.length === 0) {
    throw new Error('Photos array is required and cannot be empty')
  }

  // Create canvas with layout dimensions
  const canvas = document.createElement('canvas')
  canvas.width = layout.canvas.width
  canvas.height = layout.canvas.height
  const ctx = canvas.getContext('2d')

  // Fill background
  ctx.fillStyle = '#000000'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Calculate slot positions from CSS Grid template
  const slotBounds = calculateSlotBounds(layout)

  // Render each photo
  for (let i = 0; i < layout.slots.length; i++) {
    const slot = layout.slots[i]
    const photo = photos[i]
    if (!photo) continue

    const transform = transforms[photo.id] || {
      scale: 1,
      translateX: 0,
      translateY: 0
    }

    try {
      // Load high-res image
      const imageUrl = useHighRes ? photo.url : (photo.thumbnailUrl || photo.url)
      const img = await loadImage(imageUrl)

      // Get slot bounds
      const bounds = slotBounds[i]

      // Apply transforms
      ctx.save()
      ctx.beginPath()
      ctx.rect(bounds.x, bounds.y, bounds.width, bounds.height)
      ctx.clip()

      // Calculate center point
      const centerX = bounds.x + bounds.width / 2
      const centerY = bounds.y + bounds.height / 2

      // Apply transform
      ctx.translate(centerX, centerY)
      ctx.scale(transform.scale, transform.scale)
      ctx.translate(transform.translateX, transform.translateY)

      // Calculate scaled dimensions (cover behavior)
      const imgAspect = img.width / img.height
      const slotAspect = bounds.width / bounds.height

      let drawWidth, drawHeight
      if (imgAspect > slotAspect) {
        // Image wider than slot - fit height
        drawHeight = bounds.height
        drawWidth = bounds.height * imgAspect
      } else {
        // Image taller than slot - fit width
        drawWidth = bounds.width
        drawHeight = bounds.width / imgAspect
      }

      // Draw image centered
      ctx.drawImage(
        img,
        -drawWidth / 2,
        -drawHeight / 2,
        drawWidth,
        drawHeight
      )

      ctx.restore()
    } catch (error) {
      console.error(`Failed to render photo ${photo.id}:`, error)
      // Render placeholder for failed images
      ctx.save()
      const bounds = slotBounds[i]
      ctx.fillStyle = '#333333'
      ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height)
      ctx.restore()
    }
  }

  // Convert to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Failed to create blob from canvas'))
        }
      },
      'image/jpeg',
      quality
    )
  })
}

/**
 * Helper: Load image from URL
 * @param {string} url - Image URL
 * @returns {Promise<HTMLImageElement>}
 */
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'  // CORS support
    img.onload = () => resolve(img)
    img.onerror = (error) => {
      console.error('Image load error:', url, error)
      reject(new Error(`Failed to load image: ${url}`))
    }
    img.src = url
  })
}

/**
 * Helper: Calculate physical bounds of each slot in the canvas
 * Parses CSS Grid template and converts to pixel coordinates
 * @param {Object} layout - Layout configuration
 * @returns {Array<Object>} Array of bounds { x, y, width, height }
 */
function calculateSlotBounds(layout) {
  const canvasWidth = layout.canvas.width
  const canvasHeight = layout.canvas.height
  const gap = layout.gap || 8
  const padding = layout.padding || 0

  // Parse grid template to determine columns and rows
  const gridTemplate = layout.grid.desktop
  const gridParts = gridTemplate.split(' ').filter(p => p.trim())

  // Determine number of columns and rows from grid template
  // Grid templates are typically like "1fr 1fr" or "2fr 1fr 1fr"
  const numCols = gridParts.length

  // Calculate total grid area
  const totalGridWidth = canvasWidth - (padding * 2) - (gap * (numCols - 1))
  const totalGridHeight = canvasHeight - (padding * 2)

  // Calculate fr (fractional unit) values
  const colFractions = gridParts.map(part => {
    const match = part.match(/(\d+(?:\.\d+)?)fr/)
    return match ? parseFloat(match[1]) : 1
  })

  const totalFractions = colFractions.reduce((sum, fr) => sum + fr, 0)
  const frUnit = totalGridWidth / totalFractions

  // Calculate column positions and widths
  const columns = []
  let currentX = padding
  for (let i = 0; i < numCols; i++) {
    const width = colFractions[i] * frUnit
    columns.push({ x: currentX, width })
    currentX += width + gap
  }

  // For rows, we need to analyze the slot areas to determine row count
  const maxRow = Math.max(...layout.slots.map(slot => {
    const parts = slot.area.split('/').map(s => parseInt(s.trim()))
    return parts[2] || 1 // row-end
  }))

  const numRows = maxRow - 1 // Grid lines are 1-indexed

  // Calculate row heights (equal distribution for now)
  const totalGapsHeight = gap * (numRows - 1)
  const rowHeight = (totalGridHeight - totalGapsHeight) / numRows

  const rows = []
  let currentY = padding
  for (let i = 0; i < numRows; i++) {
    rows.push({ y: currentY, height: rowHeight })
    currentY += rowHeight + gap
  }

  // Calculate bounds for each slot
  const bounds = layout.slots.map(slot => {
    // Parse slot.area: "row-start / col-start / row-end / col-end"
    const parts = slot.area.split('/').map(s => parseInt(s.trim()))
    const [rowStart, colStart, rowEnd, colEnd] = parts

    // Convert 1-indexed grid positions to 0-indexed array positions
    const startCol = colStart - 1
    const endCol = colEnd - 1
    const startRow = rowStart - 1
    const endRow = rowEnd - 1

    // Calculate bounds
    const x = columns[startCol].x
    const y = rows[startRow].y

    // Width: sum of column widths + gaps between them
    let width = 0
    for (let i = startCol; i < endCol; i++) {
      width += columns[i].width
      if (i < endCol - 1) width += gap
    }

    // Height: sum of row heights + gaps between them
    let height = 0
    for (let i = startRow; i < endRow; i++) {
      height += rows[i].height
      if (i < endRow - 1) height += gap
    }

    return { x, y, width, height }
  })

  return bounds
}

/**
 * Render thumbnail version of collage (smaller, lower quality)
 * @param {Object} layout - Layout configuration
 * @param {Array} photos - Array of photo objects
 * @param {Object} transforms - Transform data
 * @param {number} maxWidth - Maximum thumbnail width (default 800)
 * @returns {Promise<Blob>} JPEG blob
 */
export async function renderCollageThumbnail({
  layout,
  photos,
  transforms = {},
  maxWidth = 800
}) {
  // Calculate scale factor
  const scale = maxWidth / layout.canvas.width

  // Create scaled layout
  const scaledLayout = {
    ...layout,
    canvas: {
      width: Math.round(layout.canvas.width * scale),
      height: Math.round(layout.canvas.height * scale)
    },
    gap: Math.round((layout.gap || 8) * scale),
    padding: Math.round((layout.padding || 0) * scale)
  }

  // Render with lower quality and thumbnail URLs
  return renderCollageToCanvas({
    layout: scaledLayout,
    photos,
    transforms,
    options: {
      quality: 0.7,
      useHighRes: false // Use thumbnails for faster loading
    }
  })
}

/**
 * Download collage as JPEG file
 * @param {Blob} blob - Collage blob
 * @param {string} filename - Desired filename
 */
export function downloadCollageBlob(blob, filename = 'collage.jpg') {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// Export all functions
export default {
  renderCollageToCanvas,
  renderCollageThumbnail,
  downloadCollageBlob
}
