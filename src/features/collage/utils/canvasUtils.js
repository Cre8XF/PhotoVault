/**
 * Canvas utility functions for collage rendering
 */

// Convert canvas to blob
export const canvasToBlob = (canvas, type = 'image/png', quality = 0.95) => {
  return new Promise((resolve) => {
    canvas.toBlob(resolve, type, quality)
  })
}

// Convert canvas to data URL
export const canvasToDataURL = (canvas, type = 'image/png', quality = 0.95) => {
  return canvas.toDataURL(type, quality)
}

// Clear canvas with background color
export const clearCanvas = (ctx, width, height, backgroundColor = '#ffffff') => {
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, width, height)
}

// Draw border around slot
export const drawSlotBorder = (ctx, x, y, w, h, color = '#e5e7eb', lineWidth = 2) => {
  ctx.strokeStyle = color
  ctx.lineWidth = lineWidth
  ctx.strokeRect(x, y, w, h)
}

// Draw placeholder for empty slot
export const drawPlaceholder = (ctx, x, y, w, h, text = '+') => {
  // Draw background
  ctx.fillStyle = '#f3f4f6'
  ctx.fillRect(x, y, w, h)

  // Draw border
  ctx.strokeStyle = '#d1d5db'
  ctx.lineWidth = 2
  ctx.strokeRect(x, y, w, h)

  // Draw text
  ctx.fillStyle = '#9ca3af'
  ctx.font = `${Math.min(w, h) / 4}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, x + w / 2, y + h / 2)
}

// Add rounded corners to canvas
export const drawRoundedRect = (ctx, x, y, width, height, radius) => {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + width - radius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius)
  ctx.lineTo(x + width, y + height - radius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
  ctx.lineTo(x + radius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
}

// Draw image with rounded corners
export const drawRoundedImage = (ctx, img, x, y, w, h, radius) => {
  ctx.save()
  drawRoundedRect(ctx, x, y, w, h, radius)
  ctx.clip()

  // Use cover behavior for rounded images
  const imgAspect = img.width / img.height
  const slotAspect = w / h

  let sourceX = 0
  let sourceY = 0
  let sourceWidth = img.width
  let sourceHeight = img.height

  if (imgAspect > slotAspect) {
    sourceWidth = img.height * slotAspect
    sourceX = (img.width - sourceWidth) / 2
  } else {
    sourceHeight = img.width / slotAspect
    sourceY = (img.height - sourceHeight) / 2
  }

  ctx.drawImage(
    img,
    sourceX, sourceY, sourceWidth, sourceHeight,
    x, y, w, h
  )

  ctx.restore()
}

// Download canvas as image
export const downloadCanvas = (canvas, filename = 'collage.png') => {
  const link = document.createElement('a')
  link.download = filename
  link.href = canvas.toDataURL('image/png', 0.95)
  link.click()
}

// Get optimal canvas dimensions for screen
export const getOptimalCanvasDimensions = (layoutWidth, layoutHeight, maxWidth, maxHeight) => {
  const aspectRatio = layoutWidth / layoutHeight

  let width = layoutWidth
  let height = layoutHeight

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
