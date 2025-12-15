import { getCombinedFilters, getFilterPreset } from './adjustments'
import {
  applyRotationTransform,
  restoreRotationTransform,
  getRotatedDimensions,
} from './rotation'

/**
 * Export edited image with all transformations
 *
 * @param {string} imageUrl - Original image URL
 * @param {Object} transform - All transform state from store
 * @returns {Promise<Blob>} - Edited image as blob
 */
export async function exportEditedImage(imageUrl, transform) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      try {
        // Create canvas
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        // Calculate rotated dimensions
        const rotatedDims = getRotatedDimensions(
          img.naturalWidth,
          img.naturalHeight,
          transform.rotation || 0
        )

        // Apply crop if exists
        let finalWidth = rotatedDims.width
        let finalHeight = rotatedDims.height
        let sourceX = 0
        let sourceY = 0
        let sourceWidth = img.naturalWidth
        let sourceHeight = img.naturalHeight

        if (transform.crop) {
          // Calculate crop in pixels (from normalized 0-1)
          sourceX = Math.round(transform.crop.x1 * img.naturalWidth)
          sourceY = Math.round(transform.crop.y1 * img.naturalHeight)
          sourceWidth = Math.round(
            (transform.crop.x2 - transform.crop.x1) * img.naturalWidth
          )
          sourceHeight = Math.round(
            (transform.crop.y2 - transform.crop.y1) * img.naturalHeight
          )

          // Recalculate rotated dimensions for cropped image
          const croppedRotatedDims = getRotatedDimensions(
            sourceWidth,
            sourceHeight,
            transform.rotation || 0
          )

          finalWidth = croppedRotatedDims.width
          finalHeight = croppedRotatedDims.height
        }

        // Set canvas size to final dimensions
        canvas.width = finalWidth
        canvas.height = finalHeight

        // Merge filter preset with manual adjustments
        let finalAdjustments = { ...transform.adjustments }

        if (transform.filter?.active && transform.filter.active !== 'none') {
          const filterAdjustments = getFilterPreset(
            transform.filter.active,
            transform.filter.intensity
          )

          Object.keys(filterAdjustments).forEach((key) => {
            finalAdjustments[key] =
              (finalAdjustments[key] || 0) + filterAdjustments[key]

            // Clamp to valid ranges
            if (key === 'sharpness' || key === 'vignette') {
              finalAdjustments[key] = Math.max(
                0,
                Math.min(100, finalAdjustments[key])
              )
            } else if (key === 'saturation' && finalAdjustments[key] < -100) {
              finalAdjustments[key] = -100
            } else {
              finalAdjustments[key] = Math.max(
                -100,
                Math.min(100, finalAdjustments[key])
              )
            }
          })
        }

        // Apply CSS filters (adjustments + filter preset)
        const filterString = getCombinedFilters(finalAdjustments)
        ctx.filter = filterString

        // Apply rotation and flip
        applyRotationTransform(
          ctx,
          finalWidth,
          finalHeight,
          transform.rotation || 0,
          transform.flipH || false,
          transform.flipV || false
        )

        // Draw image with all transforms
        ctx.drawImage(
          img,
          sourceX,
          sourceY,
          sourceWidth,
          sourceHeight,
          0,
          0,
          finalWidth,
          finalHeight
        )

        // Restore context
        restoreRotationTransform(ctx)

        // Convert to blob (JPEG, 0.92 quality)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Failed to create blob'))
            }
          },
          'image/jpeg',
          0.92
        )
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }

    img.src = imageUrl
  })
}

/**
 * Generate edited filename
 *
 * @param {string} originalName - Original filename
 * @returns {string} - New filename with _edited suffix
 */
export function generateEditedFilename(originalName) {
  if (!originalName) {
    return `edited_${Date.now()}.jpg`
  }

  const parts = originalName.split('.')
  const ext = parts.pop()
  const base = parts.join('.')
  const timestamp = Date.now()

  return `${base}_edited_${timestamp}.${ext}`
}
