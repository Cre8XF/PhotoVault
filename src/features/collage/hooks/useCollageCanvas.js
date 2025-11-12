import { useRef, useEffect, useState, useCallback } from 'react'
import { loadImage } from '../utils/imageLoader'
import { clearCanvas, drawPlaceholder, canvasToDataURL, canvasToBlob } from '../utils/canvasUtils'
import { drawImageCover } from '../utils/imageLoader'
import { drawText } from '../utils/textUtils'
import { drawSticker } from '../utils/stickers'

/**
 * Custom hook for managing collage canvas operations
 * @param {Object} layout - Layout definition with canvas dimensions and positions
 * @param {Array} photos - Array of photo objects with url property
 * @param {Array} textLayers - Array of text layer objects
 * @param {Array} stickerLayers - Array of sticker layer objects
 * @param {Object} options - Additional options (backgroundColor, spacing, etc.)
 */
export const useCollageCanvas = (layout, photos = [], textLayers = [], stickerLayers = [], options = {}) => {
  const canvasRef = useRef(null)
  const [ctx, setCtx] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isReady, setIsReady] = useState(false)

  const {
    backgroundColor = '#ffffff',
    spacing = 0,
    showPlaceholders = true
  } = options

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current || !layout) return

    const canvas = canvasRef.current
    canvas.width = layout.canvas.width
    canvas.height = layout.canvas.height

    const context = canvas.getContext('2d')
    setCtx(context)
    setIsReady(true)

    console.log('🎨 Canvas initialized:', layout.canvas.width, 'x', layout.canvas.height)
  }, [layout])

  // Draw collage whenever layout or photos change
  const drawCollage = useCallback(async () => {
    if (!ctx || !layout || !isReady) {
      console.log('⏳ Canvas not ready yet')
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log('🎨 Drawing collage with', photos.length, 'photos')

      // Clear canvas with background color
      clearCanvas(ctx, layout.canvas.width, layout.canvas.height, backgroundColor)

      // Draw each photo slot
      for (let i = 0; i < layout.positions.length; i++) {
        const pos = layout.positions[i]
        const photo = photos[i]

        // Apply spacing if specified
        const x = pos.x + spacing
        const y = pos.y + spacing
        const w = pos.w - (spacing * 2)
        const h = pos.h - (spacing * 2)

        if (photo && photo.url) {
          try {
            const img = await loadImage(photo.url)
            drawImageCover(ctx, img, x, y, w, h)
            console.log(`✅ Drew photo ${i + 1}/${layout.positions.length}`)
          } catch (imgError) {
            console.error(`❌ Failed to load photo ${i}:`, imgError)
            // Draw error placeholder
            drawPlaceholder(ctx, x, y, w, h, '✕')
          }
        } else if (showPlaceholders) {
          // Draw empty slot placeholder
          drawPlaceholder(ctx, x, y, w, h, `${i + 1}`)
        }
      }

      // Draw stickers (layer above photos, below text)
      if (stickerLayers && stickerLayers.length > 0) {
        console.log('🎨 Drawing', stickerLayers.length, 'stickers')
        stickerLayers.forEach((sticker) => {
          try {
            drawSticker(ctx, sticker.emoji, sticker.x, sticker.y, sticker.size)
          } catch (stickerError) {
            console.error('❌ Failed to draw sticker:', stickerError)
          }
        })
      }

      // Draw text layers (top layer, above everything)
      if (textLayers && textLayers.length > 0) {
        console.log('🎨 Drawing', textLayers.length, 'text layers')
        textLayers.forEach((textLayer) => {
          try {
            drawText(ctx, textLayer.text, textLayer.x, textLayer.y, {
              fontSize: textLayer.fontSize,
              fontFamily: textLayer.fontFamily,
              fontWeight: textLayer.fontWeight,
              color: textLayer.color,
              shadow: textLayer.shadow,
              stroke: textLayer.stroke
            })
          } catch (textError) {
            console.error('❌ Failed to draw text:', textError)
          }
        })
      }

      console.log('✅ Collage drawing complete')
      setLoading(false)
    } catch (err) {
      console.error('❌ Error drawing collage:', err)
      setError(err.message)
      setLoading(false)
    }
  }, [ctx, layout, photos, textLayers, stickerLayers, isReady, backgroundColor, spacing, showPlaceholders])

  // Auto-draw when dependencies change
  useEffect(() => {
    if (isReady && layout && ctx) {
      drawCollage()
    }
  }, [isReady, layout, photos, textLayers, stickerLayers, drawCollage, ctx])

  // Export collage as data URL
  const exportCollage = useCallback((format = 'png', quality = 0.95) => {
    if (!canvasRef.current) {
      console.error('❌ Canvas not ready for export')
      return null
    }

    const mimeType = format === 'jpg' || format === 'jpeg' ? 'image/jpeg' : 'image/png'
    const dataUrl = canvasToDataURL(canvasRef.current, mimeType, quality)

    console.log('📤 Collage exported as', format)
    return dataUrl
  }, [])

  // Export collage as blob
  const exportCollageBlob = useCallback(async (format = 'png', quality = 0.95) => {
    if (!canvasRef.current) {
      console.error('❌ Canvas not ready for export')
      return null
    }

    const mimeType = format === 'jpg' || format === 'jpeg' ? 'image/jpeg' : 'image/png'
    const blob = await canvasToBlob(canvasRef.current, mimeType, quality)

    console.log('📤 Collage exported as blob:', {
      size: blob?.size,
      type: blob?.type,
      mimeType: mimeType
    })

    // Verify blob has correct type
    if (!blob || !blob.type) {
      console.error('❌ Blob missing type property!')
      return null
    }

    return blob
  }, [])

  // Download collage
  const downloadCollage = useCallback((filename = 'collage.png', format = 'png', quality = 0.95) => {
    const dataUrl = exportCollage(format, quality)
    if (!dataUrl) return

    const link = document.createElement('a')
    link.download = filename
    link.href = dataUrl
    link.click()

    console.log('💾 Collage downloaded:', filename)
  }, [exportCollage])

  // Redraw with new options
  const redraw = useCallback(() => {
    drawCollage()
  }, [drawCollage])

  return {
    canvasRef,
    drawCollage,
    exportCollage,
    exportCollageBlob,
    downloadCollage,
    redraw,
    loading,
    error,
    isReady
  }
}

export default useCollageCanvas
