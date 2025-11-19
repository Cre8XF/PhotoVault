/**
 * Photo Editor - Phase 1, 2 & 3: Crop, Rotate, Filters, Adjustments & Text
 *
 * PhotoEditor Component - Main photo editing interface
 */

import React, { useState } from 'react'
import { X, Download, Save, Maximize2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import '../editor.css'
import { usePhotoEditor } from '../hooks/usePhotoEditor'
import EditorToolbar from './EditorToolbar'
import CropTool from './CropTool'
import RotateTool from './RotateTool'
import FilterPanel from './FilterPanel'
import TextTool from './TextTool'

const PhotoEditor = ({ photo, imageUrl, onClose, onSave }) => {
  const { t } = useTranslation(['editor'])
  const [activeTool, setActiveTool] = useState('rotate') // 'crop' | 'rotate' | 'filters' | 'text'
  const [saving, setSaving] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const {
    canvasRef,
    loading,
    error,
    rotation,
    // currentFilter,
    // currentAdjustments,
    textLayers,
    currentTextLayer,
    rotate90,
    crop,
    applyFilter,
    applyAdjustments,
    addTextLayer,
    updateTextLayer,
    removeTextLayer,
    // selectTextLayer,
    // clearTextLayers,
    reset,
    // exportImage,
    // exportDataURL,
    getDimensions,
  } = usePhotoEditor(
    imageUrl ||
    photo?.imageUrl ||
    photo?.url
  )

  const handleCropApply = (cropArea) => {
    const success = crop(cropArea)
    if (success) {
      setActiveTool('rotate') // Switch back to rotate tool after crop
    }
  }

  /**
   * Tegn alle tekstlag inn på canvas.
   * Dette brukes både ved "Last ned" og "Lagre" slik at teksten faktisk
   * blir bakt inn i bildefilen.
   */
  const drawTextLayersOnCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas || !textLayers || textLayers.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    textLayers.forEach((layer) => {
      if (!layer || !layer.text) return

      ctx.save()

      const fontSize = layer.size || 40
      const fontFamily = layer.font || 'system-ui'
      const weight = layer.bold ? 'bold ' : ''
      const style = layer.italic ? 'italic ' : ''

      ctx.font = `${weight}${style}${fontSize}px ${fontFamily}`
      ctx.fillStyle = layer.color || '#ffffff'
      ctx.textAlign = layer.align || 'left'
      ctx.textBaseline = 'middle'

      // Skygge
      if (layer.shadow) {
        ctx.shadowColor = layer.shadowColor || 'rgba(0,0,0,0.8)'
        ctx.shadowBlur = layer.shadowBlur ?? 4
        ctx.shadowOffsetX = layer.shadowOffsetX ?? 0
        ctx.shadowOffsetY = layer.shadowOffsetY ?? 0
      } else {
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 0
      }

      const x = layer.x ?? canvas.width / 2
      const y = layer.y ?? canvas.height / 2

      // Stroke (outline)
      if (layer.strokeWidth && layer.strokeWidth > 0) {
        ctx.lineWidth = layer.strokeWidth
        ctx.strokeStyle = layer.strokeColor || '#000000'
        ctx.strokeText(layer.text, x, y)
      }

      // Fill text
      ctx.fillText(layer.text, x, y)

      ctx.restore()
    })
  }

  /**
   * LAST NED – inkluderer nå tekstlag
   */
  const handleDownload = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Bak tekstlagene inn i canvas
    drawTextLayersOnCanvas()

    const dataURL = canvas.toDataURL('image/jpeg', 0.95)
    const link = document.createElement('a')
    link.download = `edited_${photo?.name || 'photo'}.jpg`
    link.href = dataURL
    link.click()
    console.log('📥 Downloaded edited photo')
  }

  /**
   * LAGRE – laster opp bilde med tekst til Firebase via onSave(blob, photo)
   */
  const handleSave = async () => {
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

      // Bak tekstlagene inn i canvas før vi konverterer til Blob
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
  }

  return (
    <div className="photo-editor fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="editor-header flex items-center justify-between p-4">
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-lg transition"
        >
          <X className="w-6 h-6" />
        </button>

        <h1 className="text-xl font-bold">{t('editor:title')}</h1>

        <div className="flex gap-2">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 hover:bg-white/10 rounded-lg transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            <Maximize2 className="w-5 h-5" />
          </button>
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            <span className="hidden sm:inline">{t('editor:buttons.download')}</span>
          </button>
          {onSave && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span className="hidden sm:inline">
                {saving ? t('editor:buttons.saving') : t('editor:buttons.save')}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="editor-toolbar">
        <EditorToolbar
          activeTool={activeTool}
          onToolChange={setActiveTool}
          onReset={reset}
        />
      </div>

      {/* Main Content */}
      <div className="editor-main">
        {/* Sidebar */}
        <div className="editor-sidebar">
          {activeTool === 'crop' && (
            <CropTool
              canvasDimensions={getDimensions()}
              onCropApply={handleCropApply}
              onCancel={() => setActiveTool('rotate')}
            />
          )}

          {activeTool === 'rotate' && (
            <RotateTool onRotate={rotate90} rotation={rotation} />
          )}

          {activeTool === 'filters' && (
            <FilterPanel
              onFilterApply={applyFilter}
              onAdjustmentsChange={applyAdjustments}
            />
          )}

          {activeTool === 'text' && (
            <TextTool
              currentTextLayer={currentTextLayer}
              onTextLayerChange={updateTextLayer}
              onAddTextLayer={addTextLayer}
              onRemoveTextLayer={removeTextLayer}
            />
          )}
        </div>

        {/* Canvas Preview */}
        <div className={`editor-canvas-container ${isFullscreen ? 'fullscreen' : ''}`}>
          {loading && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-gray-400">{t('editor:loading.image')}</p>
            </div>
          )}

          {error && (
            <div className="text-center">
              <p className="text-red-400 mb-2">❌ {error}</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
              >
                {t('editor:buttons.close')}
              </button>
            </div>
          )}

          {!loading && !error && (
            <div className="relative max-w-full max-h-full">
              <canvas
                ref={canvasRef}
                className="max-w-full max-h-full shadow-2xl"
                style={{
                  maxWidth: '100%',
                  maxHeight: 'calc(100vh - 200px)',
                  objectFit: 'contain',
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default PhotoEditor
