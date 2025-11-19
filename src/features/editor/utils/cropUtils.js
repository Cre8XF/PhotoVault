/**
 * Photo Editor - Phase 1: Crop & Rotate
 *
 * Crop Utilities - Helper functions for crop calculations
 */

/**
 * Apply crop to canvas
 * @param {HTMLCanvasElement} sourceCanvas - Source canvas with image
 * @param {Object} cropArea - Crop area {x, y, width, height}
 * @returns {HTMLCanvasElement} - New canvas with cropped image
 */
export const applyCrop = (sourceCanvas, cropArea) => {
  if (!sourceCanvas || !cropArea) {
    console.error('Invalid parameters for applyCrop')
    return null
  }

  const { x, y, width, height } = cropArea

  // Create new canvas with cropped dimensions
  const croppedCanvas = document.createElement('canvas')
  croppedCanvas.width = width
  croppedCanvas.height = height

  const ctx = croppedCanvas.getContext('2d')

  // Draw cropped portion from source canvas
  ctx.drawImage(
    sourceCanvas,
    x, y, width, height, // Source rectangle
    0, 0, width, height  // Destination rectangle
  )

  console.log(`✂️ Cropped image: ${width}x${height} from (${x}, ${y})`)

  return croppedCanvas
}

/**
 * Calculate crop area to fit within canvas bounds
 * @param {Object} cropArea - Proposed crop area
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 * @returns {Object} - Constrained crop area
 */
export const constrainCropArea = (cropArea, canvasWidth, canvasHeight) => {
  let { x, y, width, height } = cropArea

  // Ensure minimum size
  const minSize = 50
  width = Math.max(width, minSize)
  height = Math.max(height, minSize)

  // Constrain to canvas bounds
  x = Math.max(0, Math.min(x, canvasWidth - width))
  y = Math.max(0, Math.min(y, canvasHeight - height))

  // Ensure width and height don't exceed canvas
  width = Math.min(width, canvasWidth - x)
  height = Math.min(height, canvasHeight - y)

  return { x, y, width, height }
}

/**
 * Get crop area for common aspect ratios
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 * @param {string} ratio - Aspect ratio ('1:1', '4:3', '16:9', 'free')
 * @returns {Object} - Crop area centered on canvas
 */
export const getCropAreaForRatio = (canvasWidth, canvasHeight, ratio = 'free') => {
  let width, height

  switch (ratio) {
    case '1:1': // Square
      {
        const size = Math.min(canvasWidth, canvasHeight)
        width = size
        height = size
      }
      break

    case '4:3': // Standard photo
      {
        const targetRatio = 4 / 3
        if (canvasWidth / canvasHeight > targetRatio) {
          height = canvasHeight
          width = height * targetRatio
        } else {
          width = canvasWidth
          height = width / targetRatio
        }
      }
      break

    case '16:9': // Widescreen
      {
        const targetRatio = 16 / 9
        if (canvasWidth / canvasHeight > targetRatio) {
          height = canvasHeight
          width = height * targetRatio
        } else {
          width = canvasWidth
          height = width / targetRatio
        }
      }
      break

    case '3:4': // Portrait
      {
        const targetRatio = 3 / 4
        if (canvasWidth / canvasHeight > targetRatio) {
          height = canvasHeight
          width = height * targetRatio
        } else {
          width = canvasWidth
          height = width / targetRatio
        }
      }
      break

    default: // Free form
      width = Math.floor(canvasWidth * 0.8)
      height = Math.floor(canvasHeight * 0.8)
      break
  }

  // Center the crop area
  const x = Math.floor((canvasWidth - width) / 2)
  const y = Math.floor((canvasHeight - height) / 2)

  return { x, y, width, height }
}

/**
 * Rotate crop area by 90 degrees
 * @param {Object} cropArea - Current crop area
 * @param {number} canvasWidth - Current canvas width
 * @param {number} canvasHeight - Current canvas height
 * @returns {Object} - Rotated crop area
 */
export const rotateCropArea90 = (cropArea, canvasWidth, canvasHeight) => {
  // After 90° rotation, canvas dimensions swap
  const newCanvasWidth = canvasHeight
  const newCanvasHeight = canvasWidth

  // Rotate crop area coordinates
  const newX = canvasHeight - cropArea.y - cropArea.height
  const newY = cropArea.x
  const newWidth = cropArea.height
  const newHeight = cropArea.width

  return {
    x: newX,
    y: newY,
    width: newWidth,
    height: newHeight
  }
}

/**
 * Load image onto canvas
 * @param {string} imageUrl - Image URL or data URL
 * @returns {Promise<HTMLCanvasElement>} - Canvas with loaded image
 */
export const loadImageToCanvas = (imageUrl) => {
  return new Promise((resolve, reject) => {
    console.log('🖼️ loadImageToCanvas(): starting...', imageUrl)

    const img = new Image()
    // REMOVED: img.crossOrigin = 'anonymous' - causes Firebase Storage images to fail silently

    img.onload = () => {
      console.log('✅ loadImageToCanvas(): image loaded')
      console.log(
        "🟢 cropUtils: image loaded:",
        url,
        img.width,
        img.height
      );

      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height

      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0)

      console.log(`✅ Image loaded to canvas: ${img.width}x${img.height}`)
      resolve(canvas)
    }

    img.onerror = (error) => {
      console.error('❌ loadImageToCanvas(): Failed to load image:', imageUrl, error)
      reject(error)
    }

    img.src = imageUrl
  })
}

/**
 * Convert canvas to blob
 * @param {HTMLCanvasElement} canvas - Canvas to convert
 * @param {string} type - Image type ('image/jpeg', 'image/png')
 * @param {number} quality - Quality (0-1 for JPEG)
 * @returns {Promise<Blob>} - Image blob
 */
export const canvasToBlob = (canvas, type = 'image/jpeg', quality = 0.95) => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          console.log(`📦 Canvas converted to blob: ${blob.size} bytes`)
          resolve(blob)
        } else {
          reject(new Error('Failed to create blob'))
        }
      },
      type,
      quality
    )
  })
}

/**
 * Rotate canvas by 90 degrees clockwise
 * @param {HTMLCanvasElement} sourceCanvas - Source canvas
 * @returns {HTMLCanvasElement} - Rotated canvas
 */
export const rotateCanvas90 = (sourceCanvas) => {
  const rotatedCanvas = document.createElement('canvas')

  // Swap width and height
  rotatedCanvas.width = sourceCanvas.height
  rotatedCanvas.height = sourceCanvas.width

  const ctx = rotatedCanvas.getContext('2d')

  // Translate and rotate
  ctx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2)
  ctx.rotate((90 * Math.PI) / 180)
  ctx.drawImage(sourceCanvas, -sourceCanvas.width / 2, -sourceCanvas.height / 2)

  console.log(`🔄 Rotated canvas: ${sourceCanvas.width}x${sourceCanvas.height} → ${rotatedCanvas.width}x${rotatedCanvas.height}`)

  return rotatedCanvas
}
