import { useState, useRef, useEffect } from 'react'

/**
 * Crop Overlay Component
 * Interactive crop rectangle with resize handles
 *
 * @param {Object} crop - Crop rect { x1, y1, x2, y2, aspectRatio }
 * @param {function} onChange - Callback when crop changes
 * @param {Object} containerDimensions - { width, height } of canvas container
 */
export default function CropOverlay({ crop, onChange, containerDimensions }) {
  const overlayRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragMode, setDragMode] = useState(null) // 'move', 'nw', 'ne', 'sw', 'se'
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  if (!crop || !containerDimensions.width) return null

  const { width, height } = containerDimensions

  // Convert normalized coordinates (0-1) to pixels
  const rect = {
    left: crop.x1 * width,
    top: crop.y1 * height,
    width: (crop.x2 - crop.x1) * width,
    height: (crop.y2 - crop.y1) * height,
  }

  /**
   * Start drag operation
   */
  const handleMouseDown = (e, mode) => {
    e.preventDefault()
    e.stopPropagation()

    setIsDragging(true)
    setDragMode(mode)
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      crop: { ...crop },
    })
  }

  /**
   * Handle drag move
   */
  const handleMouseMove = (e) => {
    if (!isDragging || !dragMode) return

    const deltaX = (e.clientX - dragStart.x) / width
    const deltaY = (e.clientY - dragStart.y) / height

    let newCrop = { ...dragStart.crop }

    // Handle different drag modes
    if (dragMode === 'move') {
      // Move entire rectangle
      const cropWidth = newCrop.x2 - newCrop.x1
      const cropHeight = newCrop.y2 - newCrop.y1

      newCrop.x1 = Math.max(
        0,
        Math.min(1 - cropWidth, dragStart.crop.x1 + deltaX)
      )
      newCrop.y1 = Math.max(
        0,
        Math.min(1 - cropHeight, dragStart.crop.y1 + deltaY)
      )
      newCrop.x2 = newCrop.x1 + cropWidth
      newCrop.y2 = newCrop.y1 + cropHeight
    } else if (dragMode === 'nw') {
      // Northwest corner
      newCrop.x1 = Math.max(
        0,
        Math.min(dragStart.crop.x2 - 0.1, dragStart.crop.x1 + deltaX)
      )
      newCrop.y1 = Math.max(
        0,
        Math.min(dragStart.crop.y2 - 0.1, dragStart.crop.y1 + deltaY)
      )
    } else if (dragMode === 'ne') {
      // Northeast corner
      newCrop.x2 = Math.max(
        dragStart.crop.x1 + 0.1,
        Math.min(1, dragStart.crop.x2 + deltaX)
      )
      newCrop.y1 = Math.max(
        0,
        Math.min(dragStart.crop.y2 - 0.1, dragStart.crop.y1 + deltaY)
      )
    } else if (dragMode === 'sw') {
      // Southwest corner
      newCrop.x1 = Math.max(
        0,
        Math.min(dragStart.crop.x2 - 0.1, dragStart.crop.x1 + deltaX)
      )
      newCrop.y2 = Math.max(
        dragStart.crop.y1 + 0.1,
        Math.min(1, dragStart.crop.y2 + deltaY)
      )
    } else if (dragMode === 'se') {
      // Southeast corner
      newCrop.x2 = Math.max(
        dragStart.crop.x1 + 0.1,
        Math.min(1, dragStart.crop.x2 + deltaX)
      )
      newCrop.y2 = Math.max(
        dragStart.crop.y1 + 0.1,
        Math.min(1, dragStart.crop.y2 + deltaY)
      )
    }

    // Maintain aspect ratio if set
    if (crop.aspectRatio) {
      const cropWidth = newCrop.x2 - newCrop.x1
      const cropHeight = newCrop.y2 - newCrop.y1
      const currentAspect = cropWidth / cropHeight

      if (Math.abs(currentAspect - crop.aspectRatio) > 0.01) {
        // Adjust height to match aspect ratio
        const targetHeight = cropWidth / crop.aspectRatio
        const normalizedHeight = targetHeight

        if (dragMode === 'nw' || dragMode === 'ne') {
          newCrop.y1 = newCrop.y2 - normalizedHeight
        } else {
          newCrop.y2 = newCrop.y1 + normalizedHeight
        }

        // Clamp to bounds
        if (newCrop.y1 < 0) {
          newCrop.y1 = 0
          newCrop.y2 = normalizedHeight
        }
        if (newCrop.y2 > 1) {
          newCrop.y2 = 1
          newCrop.y1 = 1 - normalizedHeight
        }
      }
    }

    onChange(newCrop)
  }

  /**
   * End drag operation
   */
  const handleMouseUp = () => {
    setIsDragging(false)
    setDragMode(null)
  }

  // Add global mouse listeners when dragging
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)

      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragMode, dragStart])

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 pointer-events-none"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {/* Darkened areas outside crop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Clear area for crop */}
      <div
        className="absolute bg-transparent border-2 border-white pointer-events-auto cursor-move"
        style={{
          left: `${rect.left}px`,
          top: `${rect.top}px`,
          width: `${rect.width}px`,
          height: `${rect.height}px`,
        }}
        onMouseDown={(e) => handleMouseDown(e, 'move')}
      >
        {/* Grid overlay (rule of thirds) */}
        <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="border border-white/30" />
          ))}
        </div>

        {/* Corner handles */}
        <div
          className="absolute w-4 h-4 bg-white border-2 border-blue-400 rounded-full -left-2 -top-2 cursor-nwse-resize"
          onMouseDown={(e) => handleMouseDown(e, 'nw')}
        />
        <div
          className="absolute w-4 h-4 bg-white border-2 border-blue-400 rounded-full -right-2 -top-2 cursor-nesw-resize"
          onMouseDown={(e) => handleMouseDown(e, 'ne')}
        />
        <div
          className="absolute w-4 h-4 bg-white border-2 border-blue-400 rounded-full -left-2 -bottom-2 cursor-nesw-resize"
          onMouseDown={(e) => handleMouseDown(e, 'sw')}
        />
        <div
          className="absolute w-4 h-4 bg-white border-2 border-blue-400 rounded-full -right-2 -bottom-2 cursor-nwse-resize"
          onMouseDown={(e) => handleMouseDown(e, 'se')}
        />
      </div>
    </div>
  )
}
