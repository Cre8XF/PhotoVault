/**
 * Photo Editor - Phase 1, 2 & 3: Crop, Rotate, Filters, Adjustments & Text Overlay
 *
 * usePhotoEditor Hook - Manages canvas state and editor operations
 */

import { useState, useRef, useEffect, useCallback } from 'react'
import {
  loadImageToCanvas,
  rotateCanvas90,
  applyCrop,
  canvasToBlob,
} from '../utils/cropUtils'
import { applyFilter, applyAdjustments } from '../utils/filterUtils'
import { applyTextLayers } from '../utils/textUtils'

export const usePhotoEditor = (initialImageUrl) => {
  console.log("🎯 usePhotoEditor initialImageUrl:", initialImageUrl);
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [rotation, setRotation] = useState(0) // 0, 90, 180, 270
  const [currentFilter, setCurrentFilter] = useState('none')
  const [currentAdjustments, setCurrentAdjustments] = useState({
    brightness: 0,
    contrast: 1.0,
    saturation: 1.0,
  })
  const [textLayers, setTextLayers] = useState([]) // Array of text layers
  const [currentTextLayer, setCurrentTextLayer] = useState(null) // Currently editing text layer

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

    console.log("⏳ usePhotoEditor: starting load of:", initialImageUrl);
    setLoading(true)
    setError(null)

    loadImageToCanvas(initialImageUrl)
      .then((canvas) => {
        console.log(
          "🟢 usePhotoEditor: loadImageToCanvas resolved:",
          canvas?.width,
          canvas?.height
        );
        originalCanvasRef.current = canvas
        currentCanvasRef.current = canvas
        setLoading(false)
        console.log('✅ Image loaded in editor')
      })
      .catch((err) => {
        console.log("🟥 usePhotoEditor: loadImageToCanvas rejected:", err);
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
    console.log('🎨 usePhotoEditor.applyAdjustments:', adjustments)

    if (!currentCanvasRef.current) {
      console.error('❌ No current canvas!')
      return false
    }

    if (!originalCanvasRef.current) {
      console.error('❌ No original canvas!')
      return false
    }

    // CRITICAL: Always apply adjustments to ORIGINAL canvas, not current
    // This prevents cumulative adjustments
    const adjustedCanvas = applyAdjustments(
      originalCanvasRef.current,
      adjustments
    )

    if (adjustedCanvas) {
      currentCanvasRef.current = adjustedCanvas
      setCurrentAdjustments(adjustments)
      console.log('✅ Applied adjustments to working canvas')

      // Render to display canvas
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d')
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
        ctx.drawImage(adjustedCanvas, 0, 0)
        console.log('✅ Display canvas updated')
      }

      return true
    }

    console.error('❌ Failed to apply adjustments')
    return false
  }, [])

  /**
   * Add a new text layer
   */
  const addTextLayer = useCallback((textLayer) => {
    setTextLayers((prev) => [...prev, textLayer])
    setCurrentTextLayer(textLayer)
    console.log('✍️ Text layer added:', textLayer.id)

    // Trigger re-render
    if (canvasRef.current) {
      renderCurrentCanvas()
    }
  }, [])

  /**
   * Update a text layer
   */
  const updateTextLayer = useCallback((updatedLayer) => {
    console.log('📝 usePhotoEditor.updateTextLayer called')
    console.log('📝 Updated layer ID:', updatedLayer?.id)
    console.log('📝 Updated layer:', updatedLayer)

    setTextLayers((prev) => {
      console.log('📝 Current layers:', prev)
      console.log('📝 Current layers count:', prev.length)

      const newLayers = prev.map((layer) => {
        if (layer.id === updatedLayer.id) {
          console.log(`✅ Found matching layer ${layer.id}, REPLACING with updated layer`)
          return updatedLayer
        }
        return layer
      })

      console.log('📝 New layers after update:', newLayers)
      console.log('📝 New layers count:', newLayers.length)

      return newLayers
    })

    setCurrentTextLayer(updatedLayer)
    console.log('✅ Text layer updated successfully:', updatedLayer.id)

    // Trigger re-render
    if (canvasRef.current) {
      renderCurrentCanvas()
    }
  }, [])

  /**
   * Remove a text layer
   */
  const removeTextLayer = useCallback((layerId) => {
    setTextLayers((prev) => prev.filter((layer) => layer.id !== layerId))
    setCurrentTextLayer(null)
    console.log('🗑️ Text layer removed:', layerId)

    // Trigger re-render
    if (canvasRef.current) {
      renderCurrentCanvas()
    }
  }, [])

  /**
   * Select a text layer for editing
   */
  const selectTextLayer = useCallback(
    (layerId) => {
      const layer = textLayers.find((l) => l.id === layerId)
      setCurrentTextLayer(layer || null)
    },
    [textLayers]
  )

  /**
   * Clear all text layers
   */
  const clearTextLayers = useCallback(() => {
    setTextLayers([])
    setCurrentTextLayer(null)
    console.log('🗑️ All text layers cleared')

    // Trigger re-render
    if (canvasRef.current) {
      renderCurrentCanvas()
    }
  }, [])

  /**
   * Reset to original image
   */
  const reset = useCallback(() => {
    console.log('🔄 Reset called')

    if (!originalCanvasRef.current) {
      console.error('❌ No original canvas to reset to!')
      return
    }

    // Reset current canvas to original
    currentCanvasRef.current = originalCanvasRef.current

    // Reset all state
    setRotation(0)
    setCurrentFilter('none')
    setCurrentAdjustments({
      brightness: 0,
      contrast: 1.0,
      saturation: 1.0,
    })
    setTextLayers([])
    setCurrentTextLayer(null)

    console.log('✅ State reset to original')

    // CRITICAL: Explicitly update display canvas
    if (canvasRef.current) {
      const displayCanvas = canvasRef.current
      const sourceCanvas = originalCanvasRef.current

      displayCanvas.width = sourceCanvas.width
      displayCanvas.height = sourceCanvas.height

      const ctx = displayCanvas.getContext('2d')
      ctx.clearRect(0, 0, displayCanvas.width, displayCanvas.height)
      ctx.drawImage(sourceCanvas, 0, 0)

      console.log('✅ Display canvas reset to original')
    }
  }, [])

  /**
   * Render current canvas to display canvas
   */
  const renderCurrentCanvas = useCallback(() => {
    if (!canvasRef.current || !currentCanvasRef.current) return

    const displayCanvas = canvasRef.current
    let sourceCanvas = currentCanvasRef.current

    // Apply text layers if any exist
    if (textLayers.length > 0) {
      sourceCanvas = applyTextLayers(currentCanvasRef.current, textLayers)
    }

    // Update display canvas size
    displayCanvas.width = sourceCanvas.width
    displayCanvas.height = sourceCanvas.height

    // Copy current canvas to display
    const ctx = displayCanvas.getContext('2d')
    ctx.clearRect(0, 0, displayCanvas.width, displayCanvas.height)
    ctx.drawImage(sourceCanvas, 0, 0)
  }, [textLayers])

  /**
   * Export current canvas as blob
   */
  const exportImage = useCallback(
    async (type = 'image/jpeg', quality = 0.95) => {
      if (!currentCanvasRef.current) {
        throw new Error('No image to export')
      }

      const blob = await canvasToBlob(currentCanvasRef.current, type, quality)
      console.log('📤 Image exported:', blob.size, 'bytes')

      return blob
    },
    []
  )

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
      height: currentCanvasRef.current.height,
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
    textLayers,
    currentTextLayer,
    rotate90,
    crop,
    applyFilter: applyFilterToCanvas,
    applyAdjustments: applyAdjustmentsToCanvas,
    addTextLayer,
    updateTextLayer,
    removeTextLayer,
    selectTextLayer,
    clearTextLayers,
    reset,
    exportImage,
    exportDataURL,
    getDimensions,
    currentCanvas: currentCanvasRef.current,
  }
}
