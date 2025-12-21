/**
 * Image loading utilities for collage canvas
 * Handles CORS, caching, and error handling
 */

// Load single image
export const loadImage = (url) => {
  return new Promise((resolve, reject) => {
    if (import.meta.env.DEV) console.log('🖼️ loadImage(): starting...', url)

    const img = new Image()
    // REMOVED: img.crossOrigin = 'anonymous' - causes Firebase Storage images to fail silently

    img.onload = () => {
      if (import.meta.env.DEV) console.log('✅ loadImage(): image loaded')
      if (import.meta.env.DEV) console.log('✅ Image loaded:', url.substring(0, 50) + '...')
      resolve(img)
    }

    img.onerror = (error) => {
      console.error('❌ Image load failed:', url, error)
      reject(new Error(`Failed to load image: ${url}`))
    }

    img.src = url
  })
}

// Load multiple images in parallel
export const loadImages = async (urls) => {
  if (import.meta.env.DEV) console.log(`📷 Loading ${urls.length} images...`)

  try {
    const imagePromises = urls.map(url => loadImage(url))
    const images = await Promise.all(imagePromises)
    if (import.meta.env.DEV) console.log(`✅ All ${images.length} images loaded successfully`)
    return images
  } catch (error) {
    console.error('❌ Error loading images:', error)
    throw error
  }
}

// Resize image to fit within max dimensions while maintaining aspect ratio
export const resizeImage = (img, maxWidth, maxHeight) => {
  let width = img.width
  let height = img.height

  // Calculate aspect ratio
  const aspectRatio = width / height

  // Resize if needed
  if (width > maxWidth) {
    width = maxWidth
    height = width / aspectRatio
  }

  if (height > maxHeight) {
    height = maxHeight
    width = height * aspectRatio
  }

  return { width, height }
}

// Draw image to fit slot (cover behavior)
export const drawImageCover = (ctx, img, x, y, w, h) => {
  const imgAspect = img.width / img.height
  const slotAspect = w / h

  let sourceX = 0
  let sourceY = 0
  let sourceWidth = img.width
  let sourceHeight = img.height

  if (imgAspect > slotAspect) {
    // Image is wider than slot
    sourceWidth = img.height * slotAspect
    sourceX = (img.width - sourceWidth) / 2
  } else {
    // Image is taller than slot
    sourceHeight = img.width / slotAspect
    sourceY = (img.height - sourceHeight) / 2
  }

  ctx.drawImage(
    img,
    sourceX, sourceY, sourceWidth, sourceHeight,
    x, y, w, h
  )
}

// Draw image to fit slot (contain behavior)
export const drawImageContain = (ctx, img, x, y, w, h) => {
  const imgAspect = img.width / img.height
  const slotAspect = w / h

  let drawWidth = w
  let drawHeight = h
  let drawX = x
  let drawY = y

  if (imgAspect > slotAspect) {
    // Image is wider - fit to width
    drawHeight = w / imgAspect
    drawY = y + (h - drawHeight) / 2
  } else {
    // Image is taller - fit to height
    drawWidth = h * imgAspect
    drawX = x + (w - drawWidth) / 2
  }

  ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
}

// Create thumbnail from image
export const createThumbnail = async (url, size = 150) => {
  const img = await loadImage(url)

  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  drawImageCover(ctx, img, 0, 0, size, size)

  return canvas.toDataURL('image/jpeg', 0.8)
}
