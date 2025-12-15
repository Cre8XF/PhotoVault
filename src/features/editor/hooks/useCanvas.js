import { useRef, useEffect, useState, useCallback } from 'react'
import { loadImage, drawImageCentered } from '../utils/imagePipeline'
import { getCombinedFilters } from '../utils/adjustments'
import { applyRotationTransform, restoreRotationTransform, getRotatedDimensions } from '../utils/rotation'

/**
 * Custom hook for canvas management
 * NOW WITH ROTATION AND FLIP SUPPORT
 *
 * @param {string} imageUrl - URL of image to render
 * @param {Object} adjustments - Adjustment values to apply
 * @param {number} rotation - Rotation in degrees
 * @param {boolean} flipH - Flip horizontal
 * @param {boolean} flipV - Flip vertical
 * @returns {object} Canvas ref and render state
 */
export function useCanvas(imageUrl, adjustments = {}, rotation = 0, flipH = false, flipV = false) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const imageRef = useRef(null) // Store loaded image

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  /**
   * Render the image to canvas with all transformations
   */
  const render = useCallback(() => {
    const canvas = canvasRef.current
    const image = imageRef.current

    if (!canvas || !image) return

    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1

    // Get container dimensions
    const container = containerRef.current
    if (!container) return

    const rect = container.getBoundingClientRect()
    const width = rect.width
    const height = rect.height

    // Set canvas size (accounting for device pixel ratio)
    canvas.width = width * dpr
    canvas.height = height * dpr

    // Scale context to match device pixel ratio
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Apply CSS filters (adjustments)
    const filterString = getCombinedFilters(adjustments)
    ctx.filter = filterString

    // Apply rotation and flip transformations
    applyRotationTransform(ctx, width, height, rotation, flipH, flipV)

    // Calculate image dimensions considering rotation
    const rotatedDims = getRotatedDimensions(image.naturalWidth, image.naturalHeight, rotation)

    // Calculate fit dimensions for rotated image
    const imageAspect = rotatedDims.width / rotatedDims.height
    const containerAspect = width / height

    let drawWidth, drawHeight
    if (imageAspect > containerAspect) {
      drawWidth = width
      drawHeight = width / imageAspect
    } else {
      drawHeight = height
      drawWidth = height * imageAspect
    }

    // Center position
    const x = (width - drawWidth) / 2
    const y = (height - drawHeight) / 2

    // Draw image
    ctx.drawImage(image, x, y, drawWidth, drawHeight)

    // Restore transformations
    restoreRotationTransform(ctx)

    // Reset filter
    ctx.filter = 'none'

    setDimensions({ width, height })
  }, [adjustments, rotation, flipH, flipV])

  /**
   * Load image and render
   */
  useEffect(() => {
    let mounted = true

    async function loadAndRender() {
      if (!imageUrl) return

      try {
        setIsLoading(true)
        setError(null)

        const { image } = await loadImage(imageUrl)

        if (!mounted) return

        imageRef.current = image

        // Wait for next frame to ensure canvas is mounted
        requestAnimationFrame(() => {
          if (mounted) {
            render()
            setIsLoading(false)
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
  }, [imageUrl, render])

  /**
   * Re-render when adjustments change
   */
  useEffect(() => {
    if (imageRef.current) {
      render()
    }
  }, [render])

  /**
   * Re-render on window resize
   */
  useEffect(() => {
    if (!imageRef.current) return

    const handleResize = () => {
      render()
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [render])

  return {
    canvasRef,
    containerRef,
    isLoading,
    error,
    dimensions,
    render, // Expose render for manual triggers
  }
}
