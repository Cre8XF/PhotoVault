/**
 * Photo Editor V2 - Mobile-First with Bottom Tabs
 * FIXED v2: Proper touch support for real mobile devices
 *
 * PhotoEditor Component - Main photo editing interface
 * Uses explicit event listeners with passive: false for touch support
 */

import React, { useState, useCallback, useRef, useEffect } from 'react'
import {
  ArrowLeft,
  Download,
  Crop,
  Sliders,
  Palette,
  MoreHorizontal,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import '../editor.css'
import { usePhotoEditor } from '../hooks/usePhotoEditor'
import CropPanel from './CropPanel'
import AdjustPanel from './AdjustPanel'
import FiltersPanel from './FiltersPanel'
import MorePanel from './MorePanel'

/**
 * TabButton Component
 * Reusable bottom tab button
 */
const TabButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`
      flex flex-col items-center gap-1 px-4 py-2 rounded-lg
      min-h-[44px] min-w-[60px] transition-colors touch-target
      ${
        active
          ? 'bg-purple-600 text-white'
          : 'text-gray-400 hover:text-white hover:bg-white/5'
      }
    `}
  >
    <Icon className="w-5 h-5" />
    <span className="text-xs font-medium">{label}</span>
  </button>
)

/**
 * DraggableText Component
 * Separate component for each text layer with explicit touch handling
 */
const DraggableText = ({
  layer,
  canvasRect,
  canvasWidth,
  isActive,
  isDragging,
  onDragStart,
  onDragMove,
  onDragEnd,
  onSelect,
}) => {
  const textRef = useRef(null)
  const dragStateRef = useRef({
    startX: 0,
    startY: 0,
    hasMoved: false,
  })

  useEffect(() => {
    const element = textRef.current
    if (!element) return

    // Touch handlers with passive: false to allow preventDefault
    const handleTouchStart = (e) => {
      console.log('📱 Touch start on layer:', layer.id)
      e.preventDefault()
      e.stopPropagation()

      // Store start position
      dragStateRef.current = {
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        hasMoved: false,
      }

      onDragStart(e.touches[0].clientX, e.touches[0].clientY, layer.id)
    }

    const handleTouchMove = (e) => {
      if (!isDragging) return
      e.preventDefault()
      e.stopPropagation()

      // Calculate distance moved
      const deltaX = Math.abs(
        e.touches[0].clientX - dragStateRef.current.startX
      )
      const deltaY = Math.abs(
        e.touches[0].clientY - dragStateRef.current.startY
      )

      // If moved more than 10px, it's a drag (not a tap)
      if (deltaX > 10 || deltaY > 10) {
        dragStateRef.current.hasMoved = true
      }

      onDragMove(e.touches[0].clientX, e.touches[0].clientY, layer.id)
    }

    const handleTouchEnd = (e) => {
      if (!isDragging) return
      console.log(
        '📱 Touch end on layer:',
        layer.id,
        'hasMoved:',
        dragStateRef.current.hasMoved
      )
      e.preventDefault()
      e.stopPropagation()

      const touch = e.changedTouches[0]

      // If it was a drag (not a tap), prevent keyboard
      if (dragStateRef.current.hasMoved) {
        console.log('🚫 Preventing focus - was a drag')
        // Blur any active element to ensure keyboard doesn't show
        if (document.activeElement) {
          document.activeElement.blur()
        }
      } else {
        console.log('✅ Allowing focus - was a tap')
        // It was a tap, allow selection
        onSelect(layer)
      }

      onDragEnd(touch.clientX, touch.clientY, layer.id)

      // Reset
      dragStateRef.current.hasMoved = false
    }

    // Add listeners with passive: false
    element.addEventListener('touchstart', handleTouchStart, { passive: false })
    element.addEventListener('touchmove', handleTouchMove, { passive: false })
    element.addEventListener('touchend', handleTouchEnd, { passive: false })

    // Cleanup
    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
    }
  }, [layer.id, isDragging, onDragStart, onDragMove, onDragEnd, onSelect])

  return (
    <div
      ref={textRef}
      // Mouse events for desktop
      onMouseDown={(e) => {
        e.preventDefault()
        e.stopPropagation()

        dragStateRef.current = {
          startX: e.clientX,
          startY: e.clientY,
          hasMoved: false,
        }

        onDragStart(e.clientX, e.clientY, layer.id)
      }}
      onMouseMove={(e) => {
        if (!isDragging) return
        e.preventDefault()
        e.stopPropagation()

        const deltaX = Math.abs(e.clientX - dragStateRef.current.startX)
        const deltaY = Math.abs(e.clientY - dragStateRef.current.startY)

        if (deltaX > 5 || deltaY > 5) {
          dragStateRef.current.hasMoved = true
        }

        onDragMove(e.clientX, e.clientY, layer.id)
      }}
      onMouseUp={(e) => {
        if (!isDragging) return
        e.preventDefault()
        e.stopPropagation()

        // If was just a click (not drag), select layer
        if (!dragStateRef.current.hasMoved) {
          onSelect(layer)
        }

        onDragEnd(e.clientX, e.clientY, layer.id)
        dragStateRef.current.hasMoved = false
      }}
      className={`
        absolute select-none transition-opacity
        ${isDragging ? 'opacity-70 z-50' : 'opacity-100 z-40'}
        ${
          isActive
            ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-black/50'
            : ''
        }
      `}
      tabIndex={-1}
      style={{
        left: `${layer.x * canvasRect.width}px`,
        top: `${layer.y * canvasRect.height}px`,
        fontSize: `${
          (layer.fontSize || 48) * (canvasRect.width / (canvasWidth || 1))
        }px`,
        fontFamily: layer.fontFamily || 'Arial',
        color: layer.color || '#ffffff',
        fontWeight: layer.bold ? 'bold' : 'normal',
        fontStyle: layer.italic ? 'italic' : 'normal',
        textAlign: layer.align || 'center',
        transform: 'translate(-50%, -50%)',
        textShadow: layer.shadow?.enabled
          ? `${layer.shadow.offsetX ?? 2}px ${layer.shadow.offsetY ?? 2}px ${
              layer.shadow.blur ?? 4
            }px ${layer.shadow.color || 'rgba(0,0,0,0.5)'}`
          : 'none',
        WebkitTextStroke: layer.stroke?.enabled
          ? `${layer.stroke.width || 2}px ${layer.stroke.color || '#000000'}`
          : 'none',
        cursor: isDragging ? 'grabbing' : 'grab',
        touchAction: 'none',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        outline: 'none', // Remove focus outline
      }}
    >
      {layer.text}
    </div>
  )
}

/**
 * PhotoEditor Component
 */
const PhotoEditor = ({ photo, imageUrl, onClose, onSave }) => {
  const { t } = useTranslation(['editor'])
  const [activeTab, setActiveTab] = useState('adjust')
  const [saving, setSaving] = useState(false)
  const [cropArea, setCropArea] = useState(null)

  // Drag state
  const [draggedTextId, setDraggedTextId] = useState(null)
  const dragStateRef = useRef({
    isDragging: false,
    layerId: null,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
  })

  // Blur any focused element when changing tabs to prevent keyboard issues
  useEffect(() => {
    if (document.activeElement && document.activeElement !== document.body) {
      document.activeElement.blur()
    }
  }, [activeTab])

  // usePhotoEditor hook
  const {
    canvasRef,
    loading,
    error,
    rotation,
    textLayers,
    currentTextLayer,
    rotate90,
    crop,
    applyFilter,
    applyAdjustments,
    addTextLayer,
    updateTextLayer,
    removeTextLayer,
    reset,
    getDimensions,
  } = usePhotoEditor(imageUrl || photo?.imageUrl || photo?.url)

  /**
   * Handle crop area change (for live preview)
   */
  const handleCropAreaChange = useCallback((newCropArea) => {
    setCropArea(newCropArea)
  }, [])

  /**
   * Handle crop apply
   */
  const handleCropApply = useCallback(
    (applyCropArea) => {
      const success = crop(applyCropArea)
      if (success) {
        setCropArea(null)
        setActiveTab('adjust')
      }
    },
    [crop]
  )

  /**
   * Get relative position from client coordinates
   */
  const getRelativePosition = useCallback(
    (clientX, clientY) => {
      const canvas = canvasRef.current
      if (!canvas) {
        console.error('❌ No canvas ref')
        return null
      }

      const rect = canvas.getBoundingClientRect()
      const x = (clientX - rect.left) / rect.width
      const y = (clientY - rect.top) / rect.height

      console.log('📍 Position calculation:', {
        clientX,
        clientY,
        rect: {
          left: rect.left,
          top: rect.top,
          width: rect.width,
          height: rect.height,
        },
        x,
        y,
      })

      // Constrain to canvas bounds (0-1)
      const constrainedX = Math.max(0, Math.min(1, x))
      const constrainedY = Math.max(0, Math.min(1, y))

      return { x: constrainedX, y: constrainedY }
    },
    [canvasRef]
  )

  /**
   * Handle drag start
   */
  const handleDragStart = useCallback((clientX, clientY, layerId) => {
    console.log('🎯 Drag START:', { layerId, clientX, clientY })

    dragStateRef.current = {
      isDragging: true,
      layerId,
      startX: clientX,
      startY: clientY,
      currentX: clientX,
      currentY: clientY,
    }

    setDraggedTextId(layerId)
  }, [])

  /**
   * Handle drag move
   */
  const handleDragMove = useCallback(
    (clientX, clientY, layerId) => {
      if (
        !dragStateRef.current.isDragging ||
        dragStateRef.current.layerId !== layerId
      ) {
        return
      }

      console.log('🎯 Drag MOVE:', { layerId, clientX, clientY })

      dragStateRef.current.currentX = clientX
      dragStateRef.current.currentY = clientY

      const pos = getRelativePosition(clientX, clientY)
      if (!pos) return

      // Find and update layer
      const layer = textLayers.find((l) => l.id === layerId)
      if (layer) {
        console.log('✅ Updating layer position:', pos)
        updateTextLayer({
          ...layer,
          x: pos.x,
          y: pos.y,
        })
      }
    },
    [textLayers, updateTextLayer, getRelativePosition]
  )

  /**
   * Handle drag end
   */
  const handleDragEnd = useCallback(
    (clientX, clientY, layerId) => {
      console.log('🎯 Drag END:', { layerId, clientX, clientY })

      if (!dragStateRef.current.isDragging) {
        return
      }

      const pos = getRelativePosition(clientX, clientY)
      if (pos) {
        const layer = textLayers.find((l) => l.id === layerId)
        if (layer) {
          console.log('✅ Final position:', pos)
          updateTextLayer({
            ...layer,
            x: pos.x,
            y: pos.y,
          })
        }
      }

      // Reset drag state
      dragStateRef.current = {
        isDragging: false,
        layerId: null,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
      }

      setDraggedTextId(null)
    },
    [textLayers, updateTextLayer, getRelativePosition]
  )

  /**
   * Handle text layer selection
   */
  const handleSelectLayer = useCallback(
    (layer) => {
      console.log('🎯 Selected layer:', layer.id)
      updateTextLayer(layer)
    },
    [updateTextLayer]
  )

  /**
   * Draw text layers on canvas
   * Used for save/download to bake text into image
   */
  const drawTextLayersOnCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !textLayers || textLayers.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    textLayers.forEach((layer) => {
      if (!layer || !layer.text) return

      ctx.save()

      const fontSize = layer.fontSize || 48
      const fontFamily = layer.fontFamily || 'Arial'
      const weight = layer.bold ? 'bold ' : ''
      const style = layer.italic ? 'italic ' : ''

      ctx.font = `${weight}${style}${fontSize}px ${fontFamily}`
      ctx.fillStyle = layer.color || '#ffffff'
      ctx.textAlign = layer.align || 'center'
      ctx.textBaseline = 'middle'

      // Shadow
      if (layer.shadow && layer.shadow.enabled) {
        ctx.shadowColor = layer.shadow.color || 'rgba(0,0,0,0.5)'
        ctx.shadowBlur = layer.shadow.blur ?? 4
        ctx.shadowOffsetX = layer.shadow.offsetX ?? 2
        ctx.shadowOffsetY = layer.shadow.offsetY ?? 2
      } else {
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
      }

      const x = (layer.x ?? 0.5) * canvas.width
      const y = (layer.y ?? 0.5) * canvas.height

      // Stroke (outline)
      if (layer.stroke && layer.stroke.enabled && layer.stroke.width > 0) {
        ctx.lineWidth = layer.stroke.width
        ctx.strokeStyle = layer.stroke.color || '#000000'
        ctx.lineJoin = 'round'
        ctx.strokeText(layer.text, x, y)
      }

      // Fill text
      ctx.fillText(layer.text, x, y)

      ctx.restore()
    })
  }, [canvasRef, textLayers])

  /**
   * Handle download
   */
  const handleDownload = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Bake text layers into canvas
    drawTextLayersOnCanvas()

    const dataURL = canvas.toDataURL('image/jpeg', 0.95)
    const link = document.createElement('a')
    link.download = `edited_${photo?.name || 'photo'}.jpg`
    link.href = dataURL
    link.click()
    console.log('📥 Downloaded edited photo')
  }, [canvasRef, photo, drawTextLayersOnCanvas])

  /**
   * Handle save
   */
  const handleSave = useCallback(async () => {
    if (!onSave) {
      console.warn('No onSave handler provided')
      return
    }

    const canvas = canvasRef.current
    if (!canvas) {
      alert(t('editor:errors.canvasError'))
      return
    }

    setSaving(true)

    try {
      const ctx = canvas.getContext('2d')
      if (!ctx) throw new Error(t('editor:errors.contextError'))

      // Bake text layers into canvas before converting to Blob
      drawTextLayersOnCanvas()

      canvas.toBlob(
        async (blob) => {
          try {
            if (!blob) {
              throw new Error(t('editor:errors.blobError'))
            }

            await onSave(blob, photo)
            console.log('✅ Saved edited photo')
            onClose()
          } catch (err) {
            console.error('Failed to save photo:', err)
            alert(t('editor:errors.saveError'))
          } finally {
            setSaving(false)
          }
        },
        'image/jpeg',
        0.95
      )
    } catch (error) {
      console.error('Failed to save photo:', error)
      alert(t('editor:errors.saveError'))
      setSaving(false)
    }
  }, [onSave, canvasRef, photo, t, drawTextLayersOnCanvas, onClose])

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* TOP BAR */}
      <div className="flex items-center justify-between p-4 border-b border-white/10 bg-gray-900/95 backdrop-blur">
        <button
          onClick={onClose}
          className="min-h-[44px] min-w-[44px] p-2 hover:bg-white/10 rounded-lg transition touch-target"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <h1 className="text-lg font-semibold truncate flex-1 mx-4">
          {photo?.name || t('editor:title')}
        </h1>

        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="min-h-[44px] px-4 py-2 hover:bg-white/10 rounded-lg transition flex items-center gap-2 touch-target"
            title={t('editor:buttons.download')}
          >
            <Download className="w-5 h-5" />
            <span className="hidden sm:inline text-sm">
              {t('editor:buttons.download')}
            </span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="min-h-[44px] px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-600/50 rounded-lg font-medium transition touch-target"
          >
            <span className="hidden sm:inline">
              {saving ? t('editor:buttons.saving') : t('editor:buttons.save')}
            </span>
            <span className="sm:hidden">
              {saving ? t('editor:buttons.saving') : t('editor:buttons.save')}
            </span>
          </button>
        </div>
      </div>

      {/* CANVAS AREA */}
      <div className="flex-1 relative overflow-hidden bg-black">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-400">{t('editor:loading.image')}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center max-w-md p-6">
              <p className="text-red-400 mb-4">
                {t('editor:errors.loadError')}
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition"
              >
                {t('editor:buttons.close')}
              </button>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            {/* Canvas */}
            <div className="relative max-w-full max-h-full">
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-full"
                style={{
                  objectFit: 'contain',
                }}
              />

              {/* Crop overlay - visible when crop tab is active */}
              {activeTab === 'crop' && cropArea && (
                <div
                  className="absolute border-2 border-white pointer-events-none"
                  style={{
                    left: `${cropArea.x}px`,
                    top: `${cropArea.y}px`,
                    width: `${cropArea.width}px`,
                    height: `${cropArea.height}px`,
                    boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
                  }}
                >
                  {/* Corner handles */}
                  <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white rounded-full" />
                  <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white rounded-full" />
                  <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white rounded-full" />
                  <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white rounded-full" />
                </div>
              )}

              {/* Text overlays - draggable when More tab is active */}
              {activeTab === 'more' &&
                textLayers &&
                canvasRef.current &&
                textLayers.map((layer) => {
                  const canvas = canvasRef.current
                  if (!canvas) return null

                  const rect = canvas.getBoundingClientRect()

                  return (
                    <DraggableText
                      key={layer.id}
                      layer={layer}
                      canvasRect={rect}
                      canvasWidth={canvas.width}
                      isActive={currentTextLayer?.id === layer.id}
                      isDragging={draggedTextId === layer.id}
                      onDragStart={handleDragStart}
                      onDragMove={handleDragMove}
                      onDragEnd={handleDragEnd}
                      onSelect={handleSelectLayer}
                    />
                  )
                })}
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM TABS */}
      <div className="border-t border-white/10 bg-gray-900/95 backdrop-blur">
        {/* Tab Navigation */}
        <div className="flex items-center justify-around p-2 border-b border-white/5">
          <TabButton
            active={activeTab === 'crop'}
            onClick={() => setActiveTab('crop')}
            icon={Crop}
            label={t('editor:tabs.crop')}
          />
          <TabButton
            active={activeTab === 'adjust'}
            onClick={() => setActiveTab('adjust')}
            icon={Sliders}
            label={t('editor:tabs.adjust')}
          />
          <TabButton
            active={activeTab === 'filters'}
            onClick={() => setActiveTab('filters')}
            icon={Palette}
            label={t('editor:tabs.filters')}
          />
          <TabButton
            active={activeTab === 'more'}
            onClick={() => setActiveTab('more')}
            icon={MoreHorizontal}
            label={t('editor:tabs.more')}
          />
        </div>

        {/* Tab Content */}
        <div className="max-h-[40vh] overflow-y-auto p-4">
          {activeTab === 'crop' && (
            <CropPanel
              dimensions={getDimensions()}
              onCropChange={handleCropAreaChange}
              onCropApply={handleCropApply}
              onRotate={rotate90}
              rotation={rotation}
            />
          )}

          {activeTab === 'adjust' && (
            <AdjustPanel
              onAdjust={(adjustments) => {
                console.log('📸 PhotoEditor received adjustments:', adjustments)

                if (applyAdjustments) {
                  applyAdjustments(adjustments)
                } else {
                  console.error('❌ applyAdjustments not defined!')
                }
              }}
            />
          )}

          {activeTab === 'filters' && (
            <FiltersPanel
              onFilter={(filterName) => {
                console.log('📸 Applying filter:', filterName)
                applyFilter(filterName)
              }}
              onReset={() => {
                console.log('📸 Resetting to original')
                reset()
              }}
            />
          )}

          {activeTab === 'more' && (
            <MorePanel
              textLayers={textLayers}
              currentLayer={currentTextLayer}
              onAddText={addTextLayer}
              onUpdateText={updateTextLayer}
              onRemoveText={removeTextLayer}
              onReset={reset}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default PhotoEditor
