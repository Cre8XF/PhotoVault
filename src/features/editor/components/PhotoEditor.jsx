/**
 * Photo Editor V2 - Mobile-First with Bottom Tabs
 *
 * PhotoEditor Component - Main photo editing interface
 * Refactored to mobile-first layout with bottom navigation tabs
 */

import React, { useState, useCallback } from 'react'
import { ArrowLeft, Download, Crop, Sliders, Palette, MoreHorizontal, RotateCw } from 'lucide-react'
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
      ${active
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
  const [draggedTextId, setDraggedTextId] = useState(null)

  // usePhotoEditor hook - UNCHANGED, keeping existing architecture
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
  } = usePhotoEditor(
    imageUrl ||
    photo?.imageUrl ||
    photo?.url
  )

  /**
   * Handle crop area change (for live preview)
   */
  const handleCropAreaChange = useCallback((newCropArea) => {
    setCropArea(newCropArea)
  }, [])

  /**
   * Handle crop apply
   */
  const handleCropApply = useCallback((applyCropArea) => {
    const success = crop(applyCropArea)
    if (success) {
      setCropArea(null)
      setActiveTab('adjust')
    }
  }, [crop])

  /**
   * Handle text drag
   */
  const handleTextDragStart = useCallback((e, layerId) => {
    console.log('🖱️ Drag started for layer:', layerId)
    setDraggedTextId(layerId)
    e.dataTransfer.effectAllowed = 'move'
  }, [])

  const handleTextDragEnd = useCallback((e, layerId) => {
    console.log('🖱️ Drag ended for layer:', layerId)
    console.log('🖱️ Drop position:', e.clientX, e.clientY)

    const canvas = canvasRef.current
    if (!canvas) {
      console.error('❌ No canvas ref for drag')
      return
    }

    const rect = canvas.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height

    console.log('🖱️ Calculated relative position:', { x, y })

    // Constrain to canvas bounds
    const constrainedX = Math.max(0, Math.min(1, x))
    const constrainedY = Math.max(0, Math.min(1, y))

    console.log('🖱️ Constrained position:', { x: constrainedX, y: constrainedY })

    // Find layer and update position
    const layer = textLayers.find(l => l.id === layerId)
    if (layer) {
      console.log('✅ Found layer to update:', layer.id)
      updateTextLayer({
        ...layer,
        x: constrainedX,
        y: constrainedY
      })
    } else {
      console.error('❌ Layer not found:', layerId)
    }

    setDraggedTextId(null)
  }, [canvasRef, textLayers, updateTextLayer])

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
      <div className="flex items-center justify-between p-3 md:p-4 bg-gray-900/90 backdrop-blur border-b border-white/10">
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-lg transition touch-target"
          aria-label={t('editor:buttons.close')}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <h2 className="text-sm md:text-lg font-semibold truncate max-w-[150px] md:max-w-[300px]">
          {photo?.name || t('editor:title')}
        </h2>

        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="p-2 hover:bg-white/10 rounded-lg transition touch-target"
            aria-label={t('editor:buttons.download')}
          >
            <Download className="w-5 h-5" />
          </button>

          {onSave && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-3 md:px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium min-w-[70px] md:min-w-[80px] transition disabled:opacity-50 touch-target"
            >
              {saving ? t('editor:buttons.saving') : t('editor:buttons.save')}
            </button>
          )}
        </div>
      </div>

      {/* CANVAS AREA */}
      <div className="flex-1 relative overflow-hidden bg-black">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4" />
              <p className="text-gray-400">{t('editor:loading.image')}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-red-400 mb-2">❌ {error}</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg touch-target"
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
              {activeTab === 'more' && textLayers && textLayers.map(layer => {
                const canvas = canvasRef.current
                if (!canvas) return null

                const rect = canvas.getBoundingClientRect()

                return (
                  <div
                    key={layer.id}
                    draggable
                    onDragStart={(e) => handleTextDragStart(e, layer.id)}
                    onDragEnd={(e) => handleTextDragEnd(e, layer.id)}
                    className={`
                      absolute cursor-move select-none
                      ${draggedTextId === layer.id ? 'opacity-50' : 'opacity-100'}
                      ${currentTextLayer?.id === layer.id ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-black/50' : ''}
                    `}
                    style={{
                      left: `${layer.x * rect.width}px`,
                      top: `${layer.y * rect.height}px`,
                      fontSize: `${(layer.fontSize || 48) * (rect.width / (canvas.width || 1))}px`,
                      fontFamily: layer.fontFamily || 'Arial',
                      color: layer.color || '#ffffff',
                      fontWeight: layer.bold ? 'bold' : 'normal',
                      fontStyle: layer.italic ? 'italic' : 'normal',
                      textAlign: layer.align || 'center',
                      transform: 'translate(-50%, -50%)',
                      textShadow: layer.shadow?.enabled
                        ? `${layer.shadow.offsetX ?? 2}px ${layer.shadow.offsetY ?? 2}px ${layer.shadow.blur ?? 4}px ${layer.shadow.color || 'rgba(0,0,0,0.5)'}`
                        : 'none',
                      WebkitTextStroke: layer.stroke?.enabled
                        ? `${layer.stroke.width || 2}px ${layer.stroke.color || '#000000'}`
                        : 'none',
                      pointerEvents: 'all',
                    }}
                    onClick={() => updateTextLayer(layer)}
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
