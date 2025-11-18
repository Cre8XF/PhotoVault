/**
 * EditorCanvas.jsx
 * Advanced canvas engine with transform matrix, pinch zoom, pan, and rotation
 */
import React, { useRef, useEffect, useState, useCallback } from 'react'

const EditorCanvas = ({
  imageUrl,
  transform,
  onTransformChange,
  cropBox,
  filters,
  adjustments,
  textLayers,
  onImageLoad
}) => {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const imageRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [lastTouch, setLastTouch] = useState(null)
  const [lastPinchDistance, setLastPinchDistance] = useState(null)
  const animationFrameRef = useRef(null)

  // Load image
  useEffect(() => {
    if (!imageUrl) return

    const img = new Image()
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      imageRef.current = img
      if (onImageLoad) {
        onImageLoad({ width: img.width, height: img.height })
      }
      renderCanvas()
    }

    img.onerror = (err) => {
      console.error('Failed to load image:', err)
    }

    img.src = imageUrl
  }, [imageUrl])

  // Render canvas with current transform
  const renderCanvas = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      const canvas = canvasRef.current
      const image = imageRef.current

      if (!canvas || !image) return

      const ctx = canvas.getContext('2d')
      const container = containerRef.current

      if (!container) return

      // Set canvas size to container size
      const rect = container.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Save context state
      ctx.save()

      // Apply transform matrix
      const { scale, rotation, offsetX, offsetY } = transform

      // Move to center
      ctx.translate(canvas.width / 2, canvas.height / 2)

      // Apply rotation
      ctx.rotate((rotation * Math.PI) / 180)

      // Apply scale
      ctx.scale(scale, scale)

      // Apply offset
      ctx.translate(offsetX, offsetY)

      // Calculate image dimensions to fit canvas while maintaining aspect ratio
      const imgAspect = image.width / image.height
      const canvasAspect = canvas.width / canvas.height

      let drawWidth, drawHeight
      if (imgAspect > canvasAspect) {
        drawWidth = canvas.width / scale
        drawHeight = drawWidth / imgAspect
      } else {
        drawHeight = canvas.height / scale
        drawWidth = drawHeight * imgAspect
      }

      // Draw image centered
      ctx.drawImage(
        image,
        -drawWidth / 2,
        -drawHeight / 2,
        drawWidth,
        drawHeight
      )

      // Apply filters if any
      if (filters && filters.type !== 'none') {
        applyCanvasFilters(ctx, canvas, filters)
      }

      // Apply adjustments if any
      if (adjustments) {
        applyCanvasAdjustments(ctx, canvas, adjustments)
      }

      // Draw crop box if active
      if (cropBox) {
        drawCropBox(ctx, cropBox, canvas)
      }

      // Restore context
      ctx.restore()

      // Draw text layers on top (not transformed)
      if (textLayers && textLayers.length > 0) {
        drawTextLayers(ctx, textLayers, canvas)
      }
    })
  }, [transform, cropBox, filters, adjustments, textLayers])

  // Redraw when dependencies change
  useEffect(() => {
    renderCanvas()
  }, [renderCanvas])

  // Apply canvas filters using pixel manipulation
  const applyCanvasFilters = (ctx, canvas, filters) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    switch (filters.type) {
      case 'warm':
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, data[i] * 1.1)     // R+
          data[i + 2] = Math.max(0, data[i + 2] * 0.9) // B-
        }
        break
      case 'cool':
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.max(0, data[i] * 0.9)       // R-
          data[i + 2] = Math.min(255, data[i + 2] * 1.1) // B+
        }
        break
      case 'vintage':
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i]
          const g = data[i + 1]
          const b = data[i + 2]
          data[i] = r * 0.9 + g * 0.5 + b * 0.1
          data[i + 1] = r * 0.3 + g * 0.8 + b * 0.1
          data[i + 2] = r * 0.2 + g * 0.3 + b * 0.5
        }
        break
      case 'contrast':
        const factor = 1.3
        for (let i = 0; i < data.length; i += 4) {
          data[i] = ((data[i] - 128) * factor + 128)
          data[i + 1] = ((data[i + 1] - 128) * factor + 128)
          data[i + 2] = ((data[i + 2] - 128) * factor + 128)
        }
        break
      case 'fade':
        for (let i = 0; i < data.length; i += 4) {
          data[i] = data[i] * 0.8 + 50
          data[i + 1] = data[i + 1] * 0.8 + 50
          data[i + 2] = data[i + 2] * 0.8 + 50
        }
        break
      case 'bw':
        for (let i = 0; i < data.length; i += 4) {
          const gray = data[i] * 0.3 + data[i + 1] * 0.59 + data[i + 2] * 0.11
          data[i] = data[i + 1] = data[i + 2] = gray
        }
        break
    }

    ctx.putImageData(imageData, 0, 0)
  }

  // Apply adjustments using pixel manipulation
  const applyCanvasAdjustments = (ctx, canvas, adj) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i]
      let g = data[i + 1]
      let b = data[i + 2]

      // Brightness
      if (adj.brightness !== 0) {
        r += adj.brightness
        g += adj.brightness
        b += adj.brightness
      }

      // Contrast
      if (adj.contrast !== 1) {
        r = ((r - 128) * adj.contrast + 128)
        g = ((g - 128) * adj.contrast + 128)
        b = ((b - 128) * adj.contrast + 128)
      }

      // Saturation
      if (adj.saturation !== 1) {
        const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b
        r = gray + (r - gray) * adj.saturation
        g = gray + (g - gray) * adj.saturation
        b = gray + (b - gray) * adj.saturation
      }

      // Temperature
      if (adj.temperature !== 0) {
        r += adj.temperature
        b -= adj.temperature
      }

      // Shadows
      if (adj.shadows !== 0) {
        const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
        if (luminance < 128) {
          const shadowFactor = 1 + (adj.shadows / 100)
          r *= shadowFactor
          g *= shadowFactor
          b *= shadowFactor
        }
      }

      // Highlights
      if (adj.highlights !== 0) {
        const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
        if (luminance >= 128) {
          const highlightFactor = 1 + (adj.highlights / 100)
          r *= highlightFactor
          g *= highlightFactor
          b *= highlightFactor
        }
      }

      data[i] = Math.max(0, Math.min(255, r))
      data[i + 1] = Math.max(0, Math.min(255, g))
      data[i + 2] = Math.max(0, Math.min(255, b))
    }

    ctx.putImageData(imageData, 0, 0)
  }

  // Draw crop box overlay
  const drawCropBox = (ctx, cropBox, canvas) => {
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0) // Reset transform

    // Semi-transparent overlay outside crop area
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Clear crop area
    ctx.clearRect(cropBox.x, cropBox.y, cropBox.width, cropBox.height)

    // Draw crop box border
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    ctx.strokeRect(cropBox.x, cropBox.y, cropBox.width, cropBox.height)

    // Draw handles
    const handleSize = 12
    const handles = [
      { x: cropBox.x, y: cropBox.y }, // TL
      { x: cropBox.x + cropBox.width, y: cropBox.y }, // TR
      { x: cropBox.x, y: cropBox.y + cropBox.height }, // BL
      { x: cropBox.x + cropBox.width, y: cropBox.y + cropBox.height }, // BR
    ]

    ctx.fillStyle = '#fff'
    handles.forEach(handle => {
      ctx.fillRect(
        handle.x - handleSize / 2,
        handle.y - handleSize / 2,
        handleSize,
        handleSize
      )
    })

    ctx.restore()
  }

  // Draw text layers
  const drawTextLayers = (ctx, layers, canvas) => {
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0) // Reset transform

    layers.forEach(layer => {
      if (!layer.text) return

      ctx.font = `${layer.bold ? 'bold' : ''} ${layer.italic ? 'italic' : ''} ${layer.size}px ${layer.font || 'Arial'}`
      ctx.fillStyle = layer.color || '#ffffff'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // Shadow
      if (layer.shadow) {
        ctx.shadowColor = 'rgba(0,0,0,0.8)'
        ctx.shadowBlur = 4
      }

      // Stroke
      if (layer.strokeWidth) {
        ctx.strokeStyle = layer.strokeColor || '#000'
        ctx.lineWidth = layer.strokeWidth
        ctx.strokeText(layer.text, layer.x, layer.y)
      }

      // Fill
      ctx.fillText(layer.text, layer.x, layer.y)

      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
    })

    ctx.restore()
  }

  // Touch handlers for pinch zoom and pan
  const handleTouchStart = (e) => {
    if (e.touches.length === 1) {
      setLastTouch({ x: e.touches[0].clientX, y: e.touches[0].clientY })
      setIsDragging(true)
    } else if (e.touches.length === 2) {
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )
      setLastPinchDistance(distance)
    }
  }

  const handleTouchMove = (e) => {
    e.preventDefault()

    if (e.touches.length === 1 && isDragging && lastTouch) {
      // Pan
      const deltaX = e.touches[0].clientX - lastTouch.x
      const deltaY = e.touches[0].clientY - lastTouch.y

      onTransformChange({
        ...transform,
        offsetX: transform.offsetX + deltaX / transform.scale,
        offsetY: transform.offsetY + deltaY / transform.scale
      })

      setLastTouch({ x: e.touches[0].clientX, y: e.touches[0].clientY })
    } else if (e.touches.length === 2 && lastPinchDistance) {
      // Pinch zoom
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      )

      const scale = (distance / lastPinchDistance) * transform.scale
      const clampedScale = Math.max(0.5, Math.min(5, scale))

      onTransformChange({
        ...transform,
        scale: clampedScale
      })

      setLastPinchDistance(distance)
    }
  }

  const handleTouchEnd = () => {
    setIsDragging(false)
    setLastTouch(null)
    setLastPinchDistance(null)
  }

  // Mouse handlers for desktop pan
  const handleMouseDown = (e) => {
    setLastTouch({ x: e.clientX, y: e.clientY })
    setIsDragging(true)
  }

  const handleMouseMove = (e) => {
    if (!isDragging || !lastTouch) return

    const deltaX = e.clientX - lastTouch.x
    const deltaY = e.clientY - lastTouch.y

    onTransformChange({
      ...transform,
      offsetX: transform.offsetX + deltaX / transform.scale,
      offsetY: transform.offsetY + deltaY / transform.scale
    })

    setLastTouch({ x: e.clientX, y: e.clientY })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setLastTouch(null)
  }

  // Double-tap/click to toggle zoom
  const lastTapRef = useRef(0)
  const handleDoubleTap = () => {
    const now = Date.now()
    if (now - lastTapRef.current < 300) {
      // Double tap detected
      const newScale = transform.scale === 1 ? 2 : 1
      onTransformChange({
        ...transform,
        scale: newScale,
        offsetX: 0,
        offsetY: 0
      })
    }
    lastTapRef.current = now
  }

  // Mouse wheel for zoom
  const handleWheel = (e) => {
    e.preventDefault()

    const delta = e.deltaY > 0 ? 0.9 : 1.1
    const newScale = Math.max(0.5, Math.min(5, transform.scale * delta))

    onTransformChange({
      ...transform,
      scale: newScale
    })
  }

  return (
    <div
      ref={containerRef}
      className="editor-canvas-container"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleDoubleTap}
      onWheel={handleWheel}
    >
      <canvas ref={canvasRef} className="editor-canvas" />
    </div>
  )
}

export default EditorCanvas
