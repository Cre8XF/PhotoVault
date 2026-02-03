import { useRef, useEffect, useState, useCallback } from 'react'
import { loadImage, drawImageCentered } from '../utils/imagePipeline'
import { getCombinedFilters, getFilterPreset } from '../utils/adjustments'
import { applyRotationTransform, restoreRotationTransform, getRotatedDimensions } from '../utils/rotation'
import useEditorStore from '../store/editorStore'

/**
 * Custom hook for canvas management
 * NOW WITH FILTER PRESETS
 *
 * @param {string} imageUrl - URL of image to render
 * @param {Object} adjustments - Manual adjustment values
 * @param {Object} filter - Filter preset { active, intensity }
 * @param {number} rotation - Rotation in degrees
 * @param {boolean} flipH - Flip horizontal
 * @param {boolean} flipV - Flip vertical
 * @returns {object} Canvas ref and render state
 */
export function useCanvas(imageUrl, adjustments = {}, filter = {}, rotation = 0, flipH = false, flipV = false) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const imageRef = useRef(null) // Store loaded image

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // ✅ Get preloaded image from store (CORS fix - prevents double loading)
  const preloadedImage = useEditorStore((state) => state.preloadedImage)
  const setCanvasRef = useEditorStore((state) => state.setCanvasRef)

  // ✅ Store canvasRef in store for export
  useEffect(() => {
    if (canvasRef.current) {
      setCanvasRef(canvasRef.current)
    }
    return () => setCanvasRef(null)
  }, [setCanvasRef])

  /**
   * Render the image to canvas with all transformations
   */
  const render = useCallback(() => {
    const canvas = canvasRef.current
    const image = imageRef.current

    if (!canvas || !image) return

    const ctx = canvas.getContext('2d')

    // Original image dimensions
    const origWidth = image.naturalWidth
    const origHeight = image.naturalHeight

    // Calculate canvas dimensions accounting for rotation
    // For 90°/270° rotations, width and height are swapped
    const rotatedDims = getRotatedDimensions(origWidth, origHeight, rotation)
    canvas.width = rotatedDims.width
    canvas.height = rotatedDims.height

    // Clear canvas at rotated dimensions
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Merge filter preset with manual adjustments
    let finalAdjustments = { ...adjustments }

    if (filter.active && filter.active !== 'none') {
      const filterAdjustments = getFilterPreset(filter.active, filter.intensity)

      // Add filter adjustments to manual adjustments
      Object.keys(filterAdjustments).forEach((key) => {
        finalAdjustments[key] = (finalAdjustments[key] || 0) + filterAdjustments[key]

        // Clamp to valid ranges
        if (key === 'sharpness' || key === 'vignette') {
          finalAdjustments[key] = Math.max(0, Math.min(100, finalAdjustments[key]))
        } else if (key === 'saturation' && finalAdjustments[key] < -100) {
          finalAdjustments[key] = -100 // Saturation can't go below -100
        } else {
          finalAdjustments[key] = Math.max(-100, Math.min(100, finalAdjustments[key]))
        }
      })
    }

    // Apply CSS filters (adjustments + filter preset)
    const filterString = getCombinedFilters(finalAdjustments)
    ctx.filter = filterString

    // Apply rotation and flip transformations
    // Pass both canvas dimensions (rotated) and original image dimensions
    applyRotationTransform(ctx, canvas.width, canvas.height, origWidth, origHeight, rotation, flipH, flipV)

    // Draw image at original dimensions (transform handles positioning)
    ctx.drawImage(image, 0, 0, origWidth, origHeight)

    // Restore transformations
    restoreRotationTransform(ctx)

    // Reset filter
    ctx.filter = 'none'

    // Store dimensions for crop overlay (use rotated canvas dimensions)
    setDimensions({ width: canvas.width, height: canvas.height })
  }, [adjustments, filter, rotation, flipH, flipV])

  /**
   * Use preloaded image or load from URL
   */
  useEffect(() => {
    let mounted = true

    async function loadAndRender() {
      try {
        setIsLoading(true)
        setError(null)

        let image

        // ✅ PRIORITY 1: Use preloaded image (already has CORS, faster)
        if (preloadedImage) {
          if (import.meta.env.DEV) console.log('✅ Using preloaded image for canvas')
          image = preloadedImage
        }
        // ✅ FALLBACK: Load from URL (should rarely happen)
        else if (imageUrl) {
          if (import.meta.env.DEV) console.log('⚠️ Preloaded image not found, loading from URL')
          const result = await loadImage(imageUrl)
          image = result.image
        } else {
          return
        }

        if (!mounted) return

        imageRef.current = image

        // Wait for next frame to ensure canvas is mounted
        requestAnimationFrame(() => {
          if (mounted) {
            render()
            setIsLoading(false)
            if (import.meta.env.DEV) console.log('✅ Canvas rendered with image')
          }
        })
      } catch (err) {
        console.error('Failed to load image:', err)
        if (mounted) {
          setError('Failed to load image')
          setIsLoading(false)
        }
      }
    }

    loadAndRender()

    return () => {
      mounted = false
    }
  }, [preloadedImage, imageUrl, render])

  /**
   * Re-render when adjustments change
   */
  useEffect(() => {
    if (imageRef.current) {
      render()
    }
  }, [render])

  // ✅ No window resize handler - CSS handles viewport scaling

  return {
    canvasRef,
    containerRef,
    isLoading,
    error,
    dimensions,
    render, // Expose render for manual triggers
  }
}
