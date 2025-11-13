/**
 * Photo Editor - Phase 1 & 2: Crop, Rotate, Filters & Adjustments
 *
 * usePhotoEditor Hook - Manages canvas state and editor operations
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import { loadImageToCanvas, rotateCanvas90, applyCrop, canvasToBlob } from '../utils/cropUtils'
import { applyFilter, applyAdjustments } from '../utils/filterUtils'

export const usePhotoEditor = (initialImageUrl) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [rotation, setRotation] = useState(0) // 0, 90, 180, 270
  const [currentFilter, setCurrentFilter] = useState('none')
  const [currentAdjustments, setCurrentAdjustments] = useState({
    brightness: 0,
    contrast: 1.0,
    saturation: 1.0
  })

  const canvasRef = useRef(null)
  const originalCanvasRef = useRef(null) // Keep original for reset
  const currentCanvasRef = useRef(null) // Current working canvas

  /**
   * Load initial image
   */
  useEffect(() => {
    if (!initialImageUrl) {
      setError('No image URL provided')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    loadImageToCanvas(initialImageUrl)
      .then((canvas) => {
        originalCanvasRef.current = canvas
        currentCanvasRef.current = canvas
        setLoading(false)
        console.log('✅ Image loaded in editor')
      })
      .catch((err) => {
        console.error('Failed to load image:', err)
        setError('Failed to load image')
        setLoading(false)
      })
  }, [initialImageUrl])

  /**
   * Rotate image 90 degrees clockwise
   */
  const rotate90 = useCallback(() => {
    if (!currentCanvasRef.current) {
      console.warn('No canvas to rotate')
      return
    }

    const rotatedCanvas = rotateCanvas90(currentCanvasRef.current)
    currentCanvasRef.current = rotatedCanvas

    setRotation((prev) => (prev + 90) % 360)
    console.log(`🔄 Rotated to ${(rotation + 90) % 360}°`)

    // Trigger re-render by updating canvas ref
    if (canvasRef.current) {
      renderCurrentCanvas()
    }
  }, [rotation])

  /**
   * Apply crop to current canvas
   */
  const crop = useCallback((cropArea) => {
    if (!currentCanvasRef.current) {
      console.warn('No canvas to crop')
      return false
    }

    const croppedCanvas = applyCrop(currentCanvasRef.current, cropArea)

    if (croppedCanvas) {
      currentCanvasRef.current = croppedCanvas
      console.log('✂️ Crop applied')

      // Trigger re-render
      if (canvasRef.current) {
        renderCurrentCanvas()
      }

      return true
    }

    return false
  }, [])

  /**
   * Apply filter to current canvas
   */
  const applyFilterToCanvas = useCallback((filterName) => {
    if (!currentCanvasRef.current) {
      console.warn('No canvas to apply filter')
      return false
    }

    const filteredCanvas = applyFilter(currentCanvasRef.current, filterName)

    if (filteredCanvas) {
      currentCanvasRef.current = filteredCanvas
      setCurrentFilter(filterName)
      console.log(`🎨 Filter applied: ${filterName}`)

      // Trigger re-render
      if (canvasRef.current) {
        renderCurrentCanvas()
      }

      return true
    }

    return false
  }, [])

  /**
   * Apply adjustments (brightness, contrast, saturation) to current canvas
   */
  const applyAdjustmentsToCanvas = useCallback((adjustments) => {
    if (!currentCanvasRef.current) {
      console.warn('No canvas to apply adjustments')
      return false
    }

    const adjustedCanvas = applyAdjustments(currentCanvasRef.current, adjustments)

    if (adjustedCanvas) {
      currentCanvasRef.current = adjustedCanvas
      setCurrentAdjustments(adjustments)
      console.log('🔧 Adjustments applied:', adjustments)

      // Trigger re-render
      if (canvasRef.current) {
        renderCurrentCanvas()
      }

      return true
    }

    return false
  }, [])

  /**
   * Reset to original image
   */
  const reset = useCallback(() => {
    if (originalCanvasRef.current) {
      currentCanvasRef.current = originalCanvasRef.current
      setRotation(0)
      setCurrentFilter('none')
      setCurrentAdjustments({
        brightness: 0,
        contrast: 1.0,
        saturation: 1.0
      })
      console.log('↩️ Reset to original')

      if (canvasRef.current) {
        renderCurrentCanvas()
      }
    }
  }, [])

  /**
   * Render current canvas to display canvas
   */
  const renderCurrentCanvas = useCallback(() => {
    if (!canvasRef.current || !currentCanvasRef.current) return

    const displayCanvas = canvasRef.current
    const sourceCanvas = currentCanvasRef.current

    // Update display canvas size
    displayCanvas.width = sourceCanvas.width
    displayCanvas.height = sourceCanvas.height

    // Copy current canvas to display
    const ctx = displayCanvas.getContext('2d')
    ctx.clearRect(0, 0, displayCanvas.width, displayCanvas.height)
    ctx.drawImage(sourceCanvas, 0, 0)
  }, [])

  /**
   * Export current canvas as blob
   */
  const exportImage = useCallback(async (type = 'image/jpeg', quality = 0.95) => {
    if (!currentCanvasRef.current) {
      throw new Error('No image to export')
    }

    const blob = await canvasToBlob(currentCanvasRef.current, type, quality)
    console.log('📤 Image exported:', blob.size, 'bytes')

    return blob
  }, [])

  /**
   * Export current canvas as data URL
   */
  const exportDataURL = useCallback((type = 'image/jpeg', quality = 0.95) => {
    if (!currentCanvasRef.current) {
      throw new Error('No image to export')
    }

    const dataURL = currentCanvasRef.current.toDataURL(type, quality)
    console.log('📤 Image exported as data URL')

    return dataURL
  }, [])

  /**
   * Get current canvas dimensions
   */
  const getDimensions = useCallback(() => {
    if (!currentCanvasRef.current) {
      return { width: 0, height: 0 }
    }

    return {
      width: currentCanvasRef.current.width,
      height: currentCanvasRef.current.height
    }
  }, [])

  // Initial render when canvas ref is attached
  useEffect(() => {
    if (canvasRef.current && currentCanvasRef.current && !loading) {
      renderCurrentCanvas()
    }
  }, [loading, renderCurrentCanvas])

  return {
    canvasRef,
    loading,
    error,
    rotation,
    currentFilter,
    currentAdjustments,
    rotate90,
    crop,
    applyFilter: applyFilterToCanvas,
    applyAdjustments: applyAdjustmentsToCanvas,
    reset,
    exportImage,
    exportDataURL,
    getDimensions,
    currentCanvas: currentCanvasRef.current
  }
}
