import { useState, useRef, useEffect } from 'react'

/**
 * InteractiveCropOverlayV4 - Interactive crop rectangle with resize handles
 *
 * V4 DESIGN:
 * - Glass-morphism styling
 * - Larger touch targets (44x44px)
 * - Modern visual feedback
 * - Same functionality as V3 CropOverlay
 *
 * @param {Object} crop - Crop rect { x1, y1, x2, y2, aspectRatio }
 * @param {function} onChange - Callback when crop changes
 * @param {Object} containerDimensions - { width, height } of canvas container
 */
export default function InteractiveCropOverlayV4({ crop, onChange, containerDimensions }) {
  // ============================================================================
  // ALL HOOKS MUST BE CALLED UNCONDITIONALLY (React Rules of Hooks)
  // ============================================================================
  const overlayRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragMode, setDragMode] = useState(null) // 'move', 'nw', 'ne', 'sw', 'se'
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [visualDimensions, setVisualDimensions] = useState({ width: 0, height: 0 })

  // Update visual dimensions when overlay mounts or resizes
  useEffect(() => {
    if (!overlayRef.current) return

    const updateDimensions = () => {
      const rect = overlayRef.current?.getBoundingClientRect()
      if (rect) {
        setVisualDimensions({ width: rect.width, height: rect.height })
      }
    }

    updateDimensions()

    // Update on window resize
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  // Add global pointer listeners when dragging
  // MUST be defined before early returns to avoid hook order violation
  useEffect(() => {
    if (!isDragging || !crop) return

    const { width, height } = visualDimensions
    if (!width || !height) return

    const handlePointerMove = (e) => {
      if (!dragMode) return

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

    const handlePointerUp = () => {
      setIsDragging(false)
      setDragMode(null)
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [isDragging, dragMode, dragStart, visualDimensions, crop, onChange])

  // ============================================================================
  // CONDITIONAL RETURNS (after all hooks)
  // ============================================================================
  if (!crop) return null

  const { width, height } = visualDimensions

  // If dimensions not ready yet, don't render
  if (!width || !height) return <div ref={overlayRef} className="absolute inset-0 pointer-events-none" />

  // Convert normalized coordinates (0-1) to pixels
  const rect = {
    left: crop.x1 * width,
    top: crop.y1 * height,
    width: (crop.x2 - crop.x1) * width,
    height: (crop.y2 - crop.y1) * height,
  }

  /**
   * Start drag operation (Pointer Events)
   */
  const handlePointerDown = (e, mode) => {
    e.preventDefault()
    e.stopPropagation()

    // Capture pointer for stable dragging (prevents losing events if finger moves off handle)
    e.currentTarget.setPointerCapture(e.pointerId)

    setIsDragging(true)
    setDragMode(mode)
    setDragStart({
      x: e.clientX,
      y: e.clientY,
      crop: { ...crop },
    })
  }

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 15 }}
    >
      {/* V4 DESIGN: Darkened backdrop with blur */}
      <div
        className="absolute inset-0"
        style={{
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(2px)',
        }}
      />

      {/* Clear area for crop with V4 styling */}
      <div
        className="absolute pointer-events-auto cursor-move"
        style={{
          left: `${rect.left}px`,
          top: `${rect.top}px`,
          width: `${rect.width}px`,
          height: `${rect.height}px`,
          touchAction: 'none',
          border: '2px solid rgba(255, 255, 255, 0.9)',
          boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(255, 255, 255, 0.05)',
          transition: isDragging ? 'none' : 'all 0.1s ease-out',
        }}
        onPointerDown={(e) => handlePointerDown(e, 'move')}
      >
        {/* Grid overlay (rule of thirds) with V4 styling */}
        <div
          className="absolute inset-0 grid grid-cols-3 grid-rows-3"
          style={{ pointerEvents: 'none' }}
        >
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              style={{
                border: '1px solid rgba(255, 255, 255, 0.25)',
              }}
            />
          ))}
        </div>

        {/* V4 DESIGN: Corner handles - 44x44px touch-safe, glass-morphism */}
        {/* Northwest */}
        <div
          className="absolute"
          style={{
            width: '44px',
            height: '44px',
            left: '-22px',
            top: '-22px',
            touchAction: 'none',
            pointerEvents: 'auto',
            cursor: 'nwse-resize',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPointerDown={(e) => handlePointerDown(e, 'nw')}
        >
          <div
            style={{
              width: '16px',
              height: '16px',
              background: 'rgba(255, 255, 255, 0.95)',
              border: '3px solid rgba(59, 130, 246, 0.8)',
              borderRadius: '50%',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              transition: isDragging ? 'none' : 'transform 0.2s',
              transform: dragMode === 'nw' ? 'scale(1.3)' : 'scale(1)',
            }}
          />
        </div>

        {/* Northeast */}
        <div
          className="absolute"
          style={{
            width: '44px',
            height: '44px',
            right: '-22px',
            top: '-22px',
            touchAction: 'none',
            pointerEvents: 'auto',
            cursor: 'nesw-resize',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPointerDown={(e) => handlePointerDown(e, 'ne')}
        >
          <div
            style={{
              width: '16px',
              height: '16px',
              background: 'rgba(255, 255, 255, 0.95)',
              border: '3px solid rgba(59, 130, 246, 0.8)',
              borderRadius: '50%',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              transition: isDragging ? 'none' : 'transform 0.2s',
              transform: dragMode === 'ne' ? 'scale(1.3)' : 'scale(1)',
            }}
          />
        </div>

        {/* Southwest */}
        <div
          className="absolute"
          style={{
            width: '44px',
            height: '44px',
            left: '-22px',
            bottom: '-22px',
            touchAction: 'none',
            pointerEvents: 'auto',
            cursor: 'nesw-resize',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPointerDown={(e) => handlePointerDown(e, 'sw')}
        >
          <div
            style={{
              width: '16px',
              height: '16px',
              background: 'rgba(255, 255, 255, 0.95)',
              border: '3px solid rgba(59, 130, 246, 0.8)',
              borderRadius: '50%',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              transition: isDragging ? 'none' : 'transform 0.2s',
              transform: dragMode === 'sw' ? 'scale(1.3)' : 'scale(1)',
            }}
          />
        </div>

        {/* Southeast */}
        <div
          className="absolute"
          style={{
            width: '44px',
            height: '44px',
            right: '-22px',
            bottom: '-22px',
            touchAction: 'none',
            pointerEvents: 'auto',
            cursor: 'nwse-resize',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onPointerDown={(e) => handlePointerDown(e, 'se')}
        >
          <div
            style={{
              width: '16px',
              height: '16px',
              background: 'rgba(255, 255, 255, 0.95)',
              border: '3px solid rgba(59, 130, 246, 0.8)',
              borderRadius: '50%',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              transition: isDragging ? 'none' : 'transform 0.2s',
              transform: dragMode === 'se' ? 'scale(1.3)' : 'scale(1)',
            }}
          />
        </div>
      </div>
    </div>
  )
}
