/**
 * Rotation & Flip Utilities
 * Handle canvas transformations for rotation and flipping
 */

/**
 * Apply rotation and flip to canvas context
 * Must be called before drawing image
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {number} rotation - Rotation in degrees (0, 90, 180, 270)
 * @param {boolean} flipH - Flip horizontal
 * @param {boolean} flipV - Flip vertical
 */
export function applyRotationTransform(ctx, width, height, rotation, flipH, flipV) {
  // Save current state
  ctx.save()

  // Translate to center
  ctx.translate(width / 2, height / 2)

  // Apply rotation (convert degrees to radians)
  if (rotation !== 0) {
    ctx.rotate((rotation * Math.PI) / 180)
  }

  // Apply flips
  const scaleX = flipH ? -1 : 1
  const scaleY = flipV ? -1 : 1
  ctx.scale(scaleX, scaleY)

  // Translate back (drawing will be centered)
  ctx.translate(-width / 2, -height / 2)
}

/**
 * Restore canvas context after rotation/flip
 * Must be called after drawing image
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 */
export function restoreRotationTransform(ctx) {
  ctx.restore()
}

/**
 * Calculate rotated dimensions
 * When image is rotated 90° or 270°, width and height swap
 *
 * @param {number} width - Original width
 * @param {number} height - Original height
 * @param {number} rotation - Rotation in degrees
 * @returns {{ width: number, height: number }}
 */
export function getRotatedDimensions(width, height, rotation) {
  const normalizedRotation = ((rotation % 360) + 360) % 360

  // 90° and 270° swap dimensions
  if (normalizedRotation === 90 || normalizedRotation === 270) {
    return { width: height, height: width }
  }

  return { width, height }
}

/**
 * Normalize rotation to 0, 90, 180, 270
 * Used for snapping to 90° increments
 *
 * @param {number} rotation - Rotation in degrees
 * @returns {number} Normalized rotation (0, 90, 180, 270)
 */
export function normalizeRotation(rotation) {
  let normalized = ((rotation % 360) + 360) % 360

  // Round to nearest 90°
  normalized = Math.round(normalized / 90) * 90

  // Ensure 0-270 range
  if (normalized === 360) normalized = 0

  return normalized
}
