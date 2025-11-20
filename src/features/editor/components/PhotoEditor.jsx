/**
 * Photo Editor V4 - Simplified Hybrid Solution
 * Combines v2 (working drag) + v3 (keyboard prevention) in simpler way
 *
 * PhotoEditor Component - Main photo editing interface
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
 * PhotoEditor Component
 */
const PhotoEditor = ({ photo, imageUrl, onClose, onSave }) => {
  const { t } = useTranslation(['editor'])
  const [activeTab, setActiveTab] = useState('adjust')
  const [saving, setSaving] = useState(false)
  const [cropArea, setCropArea] = useState(null)

  // Drag state - simplified
  const [draggedTextId, setDraggedTextId] = useState(null)
  const dragInfoRef = useRef({
    isDragging: false,
    layerId: null,
    startX: 0,
    startY: 0,
    hasMoved: false,
  })

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

  // Blur active element when changing tabs
  useEffect(() => {
    if (document.activeElement && document.activeElement !== document.body) {
      document.activeElement.blur()
    }
  }, [activeTab])

  /**
   * Handle crop area change
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
      if (!canvas) return null

      const rect = canvas.getBoundingClientRect()
      const x = (clientX - rect.left) / rect.width
      const y = (clientY - rect.top) / rect.height

      // Constrain to canvas bounds
      const constrainedX = Math.max(0, Math.min(1, x))
      const constrainedY = Math.max(0, Math.min(1, y))

      return { x: constrainedX, y: constrainedY }
    },
    [canvasRef]
  )

  /**
   * Handle text layer drag/touch start
   */
  const handleTextDragStart = useCallback((e, layerId, isTouch = false) => {
    console.log('🎯 Touch/Drag START for layer:', layerId)

    const clientX = isTouch ? e.touches[0].clientX : e.clientX
    const clientY = isTouch ? e.touches[0].clientY : e.clientY

    dragInfoRef.current = {
      isDragging: true,
      layerId,
      startX: clientX,
      startY: clientY,
      hasMoved: false,
    }

    setDraggedTextId(layerId)
  }, [])

  /**
   * Handle text layer drag/touch move
   */
  const handleTextDragMove = useCallback(
    (e, layerId, isTouch = false) => {
      if (
        !dragInfoRef.current.isDragging ||
        dragInfoRef.current.layerId !== layerId
      ) {
        return
      }

      const clientX = isTouch ? e.touches[0].clientX : e.clientX
      const clientY = isTouch ? e.touches[0].clientY : e.clientY

      // Calculate distance moved
      const deltaX = Math.abs(clientX - dragInfoRef.current.startX)
      const deltaY = Math.abs(clientY - dragInfoRef.current.startY)

      // Mark as moved if moved more than threshold
      if (deltaX > 10 || deltaY > 10) {
        dragInfoRef.current.hasMoved = true
      }

      const pos = getRelativePosition(clientX, clientY)
      if (!pos) return

      // Update layer position in real-time
      const layer = textLayers.find((l) => l.id === layerId)
      if (layer) {
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
   * Handle text layer drag/touch end
   */
  const handleTextDragEnd = useCallback(
    (e, layerId, isTouch = false) => {
      console.log(
        '🎯 Touch/Drag END for layer:',
        layerId,
        'hasMoved:',
        dragInfoRef.current.hasMoved
      )

      if (!dragInfoRef.current.isDragging) return

      const clientX = isTouch ? e.changedTouches[0].clientX : e.clientX
      const clientY = isTouch ? e.changedTouches[0].clientY : e.clientY

      // If it was a drag (not a tap), prevent keyboard
      if (dragInfoRef.current.hasMoved) {
        console.log('🚫 Was a DRAG - preventing keyboard')
        // Force blur to prevent keyboard
        if (document.activeElement) {
          document.activeElement.blur()
        }

        // Final position update
        const pos = getRelativePosition(clientX, clientY)
        if (pos) {
          const layer = textLayers.find((l) => l.id === layerId)
          if (layer) {
            updateTextLayer({
              ...layer,
              x: pos.x,
              y: pos.y,
            })
          }
        }
      } else {
        console.log('✅ Was a TAP - allowing selection')
        // It was a tap, allow selection (but still blur to be safe)
        const layer = textLayers.find((l) => l.id === layerId)
        if (layer) {
          updateTextLayer(layer)
        }
        // Blur anyway to prevent keyboard on canvas
        setTimeout(() => {
          if (
            document.activeElement &&
            document.activeElement !== document.body
          ) {
            document.activeElement.blur()
          }
        }, 50)
      }

      // Reset drag state
      dragInfoRef.current = {
        isDragging: false,
        layerId: null,
        startX: 0,
        startY: 0,
        hasMoved: false,
      }
      setDraggedTextId(null)
    },
    [textLayers, updateTextLayer, getRelativePosition]
  )

  /**
   * Draw text layers on canvas for save/download
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
            {saving ? t('editor:buttons.saving') : t('editor:buttons.save')}
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
            <div className="relative max-w-full max-h-full">
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-full"
                style={{ objectFit: 'contain' }}
              />

              {/* Crop overlay */}
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
                  <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white rounded-full" />
                  <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white rounded-full" />
                  <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white rounded-full" />
                  <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white rounded-full" />
                </div>
              )}

              {/* Text overlays - SIMPLIFIED inline approach */}
              {activeTab === 'more' &&
                textLayers &&
                textLayers.map((layer) => {
                  const canvas = canvasRef.current
                  if (!canvas) return null

                  const rect = canvas.getBoundingClientRect()

                  return (
                    <div
                      key={layer.id}
                      // Touch events - with inline handlers
                      onTouchStart={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleTextDragStart(e, layer.id, true)
                      }}
                      onTouchMove={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleTextDragMove(e, layer.id, true)
                      }}
                      onTouchEnd={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleTextDragEnd(e, layer.id, true)
                      }}
                      // Mouse events for desktop
                      onMouseDown={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        handleTextDragStart(e, layer.id, false)
                      }}
                      onMouseMove={(e) => {
                        if (!dragInfoRef.current.isDragging) return
                        e.preventDefault()
                        e.stopPropagation()
                        handleTextDragMove(e, layer.id, false)
                      }}
                      onMouseUp={(e) => {
                        if (!dragInfoRef.current.isDragging) return
                        e.preventDefault()
                        e.stopPropagation()
                        handleTextDragEnd(e, layer.id, false)
                      }}
                      className={`
                      absolute select-none transition-opacity
                      ${
                        draggedTextId === layer.id
                          ? 'opacity-70 cursor-grabbing'
                          : 'opacity-100 cursor-grab'
                      }
                      ${
                        currentTextLayer?.id === layer.id
                          ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-black/50'
                          : ''
                      }
                    `}
                      style={{
                        left: `${layer.x * rect.width}px`,
                        top: `${layer.y * rect.height}px`,
                        fontSize: `${
                          (layer.fontSize || 48) *
                          (rect.width / (canvas.width || 1))
                        }px`,
                        fontFamily: layer.fontFamily || 'Arial',
                        color: layer.color || '#ffffff',
                        fontWeight: layer.bold ? 'bold' : 'normal',
                        fontStyle: layer.italic ? 'italic' : 'normal',
                        textAlign: layer.align || 'center',
                        transform: 'translate(-50%, -50%)',
                        textShadow: layer.shadow?.enabled
                          ? `${layer.shadow.offsetX ?? 2}px ${
                              layer.shadow.offsetY ?? 2
                            }px ${layer.shadow.blur ?? 4}px ${
                              layer.shadow.color || 'rgba(0,0,0,0.5)'
                            }`
                          : 'none',
                        WebkitTextStroke: layer.stroke?.enabled
                          ? `${layer.stroke.width || 2}px ${
                              layer.stroke.color || '#000000'
                            }`
                          : 'none',
                        touchAction: 'none',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        WebkitTouchCallout: 'none',
                      }}
                    >
                      {layer.text}
                    </div>
                  )
                })}
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM TABS */}
      <div className="border-t border-white/10 bg-gray-900/95 backdrop-blur">
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
                if (applyAdjustments) {
                  applyAdjustments(adjustments)
                }
              }}
            />
          )}

          {activeTab === 'filters' && (
            <FiltersPanel
              onFilter={(filterName) => applyFilter(filterName)}
              onReset={() => reset()}
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
