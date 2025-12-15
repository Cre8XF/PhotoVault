/**
 * Load an image and return it with metadata
 * @param {string} url - Image URL
 * @returns {Promise<{image: HTMLImageElement, width: number, height: number}>}
 */
export async function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous' // For R2/external images

    img.onload = () => {
      resolve({
        image: img,
        width: img.naturalWidth,
        height: img.naturalHeight,
      })
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}

/**
 * Calculate dimensions to fit image within container
 * @param {number} imageWidth - Original image width
 * @param {number} imageHeight - Original image height
 * @param {number} containerWidth - Container width
 * @param {number} containerHeight - Container height
 * @returns {{width: number, height: number, scale: number}}
 */
export function calculateFitDimensions(
  imageWidth,
  imageHeight,
  containerWidth,
  containerHeight
) {
  const imageAspect = imageWidth / imageHeight
  const containerAspect = containerWidth / containerHeight

  let width, height, scale

  if (imageAspect > containerAspect) {
    // Image is wider - fit to width
    width = containerWidth
    height = containerWidth / imageAspect
    scale = containerWidth / imageWidth
  } else {
    // Image is taller - fit to height
    height = containerHeight
    width = containerHeight * imageAspect
    scale = containerHeight / imageHeight
  }

  return { width, height, scale }
}

/**
 * Draw image centered on canvas
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {HTMLImageElement} image - Image to draw
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 */
export function drawImageCentered(ctx, image, canvasWidth, canvasHeight) {
  const { width, height } = calculateFitDimensions(
    image.naturalWidth,
    image.naturalHeight,
    canvasWidth,
    canvasHeight
  )

  const x = (canvasWidth - width) / 2
  const y = (canvasHeight - height) / 2

  // Clear canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  // Draw image centered
  ctx.drawImage(image, x, y, width, height)
}
