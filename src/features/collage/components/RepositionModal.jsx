// ============================================================================
// COMPONENT: RepositionModal.jsx - Drag/zoom interface for photo adjustment
// Full-screen modal with pointer events, zoom slider, and keyboard shortcuts
// ============================================================================
import React, { useState, useRef, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { X, RotateCcw, Check, ZoomIn, ZoomOut } from 'lucide-react'

/**
 * RepositionModal Component
 * Allows users to drag and zoom photos within collage layout
 *
 * @param {Object} photo - Photo object from Firestore
 * @param {Object} currentTransform - Current transform { scale, translateX, translateY }
 * @param {Function} onSave - Save handler (transform) => void
 * @param {Function} onClose - Close handler () => void
 * @param {boolean} isOpen - Modal open state
 */
const RepositionModal = ({
  photo,
  currentTransform = { scale: 1, translateX: 0, translateY: 0 },
  onSave,
  onClose,
  isOpen = true
}) => {
  const { t } = useTranslation(['collage'])

  // State
  const [transform, setTransform] = useState(currentTransform)
  const [isDragging, setIsDragging] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // Refs
  const imageRef = useRef(null)
  const containerRef = useRef(null)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const modalRef = useRef(null)

  // Extract transform values
  const { scale, translateX, translateY } = transform

  // Constants
  const MIN_SCALE = 1.0
  const MAX_SCALE = 3.0
  const SCALE_STEP = 0.1

  // Update transform and track changes
  const updateTransform = useCallback((newTransform) => {
    setTransform(newTransform)

    // Check if transform differs from original
    const changed =
      newTransform.scale !== currentTransform.scale ||
      newTransform.translateX !== currentTransform.translateX ||
      newTransform.translateY !== currentTransform.translateY

    setHasChanges(changed)
  }, [currentTransform])

  // Handle pointer down (start drag)
  const handlePointerDown = useCallback((e) => {
    if (!imageRef.current) return

    e.preventDefault()
    setIsDragging(true)

    // Capture pointer for smooth dragging
    imageRef.current.setPointerCapture(e.pointerId)

    // Store initial pointer position
    dragStartRef.current = {
      x: e.clientX - translateX,
      y: e.clientY - translateY
    }
  }, [translateX, translateY])

  // Handle pointer move (drag)
  const handlePointerMove = useCallback((e) => {
    if (!isDragging || !imageRef.current) return

    e.preventDefault()

    // Calculate new position
    const newTranslateX = e.clientX - dragStartRef.current.x
    const newTranslateY = e.clientY - dragStartRef.current.y

    updateTransform({
      scale,
      translateX: newTranslateX,
      translateY: newTranslateY
    })
  }, [isDragging, scale, updateTransform])

  // Handle pointer up (end drag)
  const handlePointerUp = useCallback((e) => {
    if (!imageRef.current) return

    setIsDragging(false)
    imageRef.current.releasePointerCapture(e.pointerId)
  }, [])

  // Handle zoom slider change
  const handleZoomChange = (e) => {
    const newScale = parseFloat(e.target.value)
    updateTransform({
      ...transform,
      scale: newScale
    })
  }

  // Handle zoom in button
  const handleZoomIn = () => {
    const newScale = Math.min(scale + SCALE_STEP, MAX_SCALE)
    updateTransform({
      ...transform,
      scale: parseFloat(newScale.toFixed(2))
    })
  }

  // Handle zoom out button
  const handleZoomOut = () => {
    const newScale = Math.max(scale - SCALE_STEP, MIN_SCALE)
    updateTransform({
      ...transform,
      scale: parseFloat(newScale.toFixed(2))
    })
  }

  // Handle mouse wheel zoom
  const handleWheel = useCallback((e) => {
    e.preventDefault()

    const delta = e.deltaY > 0 ? -SCALE_STEP : SCALE_STEP
    const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale + delta))

    updateTransform({
      ...transform,
      scale: parseFloat(newScale.toFixed(2))
    })
  }, [scale, transform, updateTransform])

  // Handle reset
  const handleReset = () => {
    updateTransform({
      scale: 1,
      translateX: 0,
      translateY: 0
    })
  }

  // Handle save
  const handleSave = () => {
    onSave(transform)
    onClose()
  }

  // Handle close
  const handleClose = () => {
    if (hasChanges) {
      const confirm = window.confirm(t('collage:reposition.confirmClose'))
      if (!confirm) return
    }
    onClose()
  }

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e) => {
    switch (e.key) {
      case 'Escape':
        handleClose()
        break
      case 'Enter':
        handleSave()
        break
      case '+':
      case '=':
        handleZoomIn()
        break
      case '-':
      case '_':
        handleZoomOut()
        break
      case 'r':
      case 'R':
        handleReset()
        break
      default:
        break
    }
  }, [handleClose, handleSave, handleZoomIn, handleZoomOut, handleReset])

  // Setup keyboard listeners
  useEffect(() => {
    if (!isOpen) return

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleKeyDown])

  // Focus modal on open
  useEffect(() => {
    if (isOpen && modalRef.current) {
      modalRef.current.focus()
    }
  }, [isOpen])

  // Don't render if not open
  if (!isOpen || !photo) return null

  // Calculate zoom percentage
  const zoomPercent = Math.round(scale * 100)

  return (
    <div
      ref={modalRef}
      tabIndex={-1}
      className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[1100] flex flex-col animate-fade-in text-on-glass"
      onClick={(e) => {
        // Close on backdrop click (not on image/controls)
        if (e.target === e.currentTarget) {
          handleClose()
        }
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-6 bg-white/5 border-b border-white/10">
        <button
          onClick={handleClose}
          className="ripple-effect flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-lg transition"
          aria-label={t('collage:reposition.close')}
        >
          <X className="w-5 h-5" />
          <span className="hidden sm:inline">{t('collage:reposition.back')}</span>
        </button>

        <h2 className="text-lg font-semibold truncate mx-4">
          {photo.filename || t('collage:reposition.title')}
        </h2>

        <div className="flex items-center gap-2">
          <button
            onClick={handleReset}
            disabled={!hasChanges}
            className="ripple-effect flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={t('collage:reposition.reset')}
          >
            <RotateCcw className="w-5 h-5" />
            <span className="hidden sm:inline">{t('collage:reposition.reset')}</span>
          </button>

          <button
            onClick={handleSave}
            className="ripple-effect flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition"
            aria-label={t('collage:reposition.save')}
          >
            <Check className="w-5 h-5" />
            <span className="hidden sm:inline">{t('collage:reposition.save')}</span>
          </button>
        </div>
      </div>

      {/* Main image area */}
      <div
        ref={containerRef}
        className="flex-1 flex items-center justify-center p-4 md:p-8 overflow-hidden relative"
        onWheel={handleWheel}
      >
        {/* Grid overlay (rule of thirds) */}
        {isDragging && (
          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="w-full h-full grid grid-cols-3 grid-rows-3 opacity-30">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="border border-white/30" />
              ))}
            </div>
          </div>
        )}

        {/* Draggable image */}
        <div
          ref={imageRef}
          className={`relative max-w-full max-h-full ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          } select-none touch-none`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          style={{
            transform: `scale(${scale}) translate(${translateX / scale}px, ${translateY / scale}px)`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.2s ease-out'
          }}
        >
          <img
            src={photo.url || photo.thumbnailUrl}
            alt={photo.name || photo.filename || t('collage:photo.untitled')}
            decoding="async"
            className="max-w-full max-h-[70vh] object-contain pointer-events-none"
            draggable={false}
          />
        </div>

        {/* Instructions overlay */}
        {!isDragging && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-sm opacity-60 pointer-events-none">
            {t('collage:reposition.instructions')}
          </div>
        )}
      </div>

      {/* Footer controls */}
      <div className="p-4 md:p-6 bg-white/5 border-t border-white/10">
        <div className="max-w-2xl mx-auto">
          {/* Zoom control */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleZoomOut}
              disabled={scale <= MIN_SCALE}
              className="ripple-effect p-2 hover:bg-white/10 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={t('collage:reposition.zoomOut')}
            >
              <ZoomOut className="w-5 h-5" />
            </button>

            <div className="flex-1 flex items-center gap-3">
              <span className="text-sm opacity-70 whitespace-nowrap">
                {t('collage:reposition.zoom')}:
              </span>

              <input
                type="range"
                min={MIN_SCALE}
                max={MAX_SCALE}
                step={0.01}
                value={scale}
                onChange={handleZoomChange}
                className="flex-1 accent-blue-500 h-2 bg-white/10 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, rgb(59 130 246) 0%, rgb(59 130 246) ${((scale - MIN_SCALE) / (MAX_SCALE - MIN_SCALE)) * 100}%, rgba(255,255,255,0.1) ${((scale - MIN_SCALE) / (MAX_SCALE - MIN_SCALE)) * 100}%, rgba(255,255,255,0.1) 100%)`
                }}
              />

              <span className="text-sm font-mono font-medium min-w-[4rem] text-right">
                {zoomPercent}%
              </span>
            </div>

            <button
              onClick={handleZoomIn}
              disabled={scale >= MAX_SCALE}
              className="ripple-effect p-2 hover:bg-white/10 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label={t('collage:reposition.zoomIn')}
            >
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>

          {/* Keyboard shortcuts hint */}
          <div className="mt-4 text-xs text-center opacity-50 hidden md:block">
            {t('collage:reposition.shortcuts')}:
            <span className="mx-2">ESC</span>•
            <span className="mx-2">ENTER</span>•
            <span className="mx-2">+/-</span>•
            <span className="mx-2">R</span>
          </div>
        </div>
      </div>
    </div>
  )
}

RepositionModal.propTypes = {
  photo: PropTypes.shape({
    id: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired,
    thumbnailUrl: PropTypes.string,
    name: PropTypes.string,
    filename: PropTypes.string
  }).isRequired,
  currentTransform: PropTypes.shape({
    scale: PropTypes.number,
    translateX: PropTypes.number,
    translateY: PropTypes.number
  }),
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  isOpen: PropTypes.bool
}

RepositionModal.defaultProps = {
  currentTransform: { scale: 1, translateX: 0, translateY: 0 },
  isOpen: true
}

export default RepositionModal
