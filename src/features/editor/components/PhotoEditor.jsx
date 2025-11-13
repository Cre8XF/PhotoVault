/**
 * Photo Editor - Phase 1, 2 & 3: Crop, Rotate, Filters, Adjustments & Text
 *
 * PhotoEditor Component - Main photo editing interface
 */

import React, { useState } from 'react'
import { X, Download, Save } from 'lucide-react'
import { usePhotoEditor } from '../hooks/usePhotoEditor'
import EditorToolbar from './EditorToolbar'
import CropTool from './CropTool'
import RotateTool from './RotateTool'
import FilterPanel from './FilterPanel'
import TextTool from './TextTool'

const PhotoEditor = ({ photo, onClose, onSave }) => {
  const [activeTool, setActiveTool] = useState('rotate') // 'crop' | 'rotate' | 'filters'
  const [saving, setSaving] = useState(false)

  const {
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
    applyFilter,
    applyAdjustments,
    addTextLayer,
    updateTextLayer,
    removeTextLayer,
    selectTextLayer,
    clearTextLayers,
    reset,
    exportImage,
    exportDataURL,
    getDimensions
  } = usePhotoEditor(photo?.url)

  const handleCropApply = (cropArea) => {
    const success = crop(cropArea)
    if (success) {
      setActiveTool('rotate') // Switch back to rotate tool after crop
    }
  }

  const handleDownload = () => {
    const dataURL = exportDataURL('image/jpeg', 0.95)
    const link = document.createElement('a')
    link.download = `edited_${photo?.name || 'photo'}.jpg`
    link.href = dataURL
    link.click()
    console.log('📥 Downloaded edited photo')
  }

  const handleSave = async () => {
    if (!onSave) {
      console.warn('No onSave handler provided')
      return
    }

    setSaving(true)

    try {
      const blob = await exportImage('image/jpeg', 0.95)
      await onSave(blob, photo)
      console.log('✅ Saved edited photo')
      onClose()
    } catch (error) {
      console.error('Failed to save photo:', error)
      alert('Kunne ikke lagre bildet')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="photo-editor fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-gray-900 border-b border-white/10">
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-lg transition"
        >
          <X className="w-6 h-6" />
        </button>

        <h1 className="text-xl font-bold">Rediger bilde</h1>

        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition flex items-center gap-2"
          >
            <Download className="w-5 h-5" />
            <span className="hidden sm:inline">Last ned</span>
          </button>
          {onSave && (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span className="hidden sm:inline">{saving ? 'Lagrer...' : 'Lagre'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <EditorToolbar
        activeTool={activeTool}
        onToolChange={setActiveTool}
        onReset={reset}
      />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden flex">
        {/* Sidebar */}
        <div className="w-80 bg-gray-900 border-r border-white/10 overflow-y-auto p-4">
          {activeTool === 'crop' && (
            <CropTool
              canvasDimensions={getDimensions()}
              onCropApply={handleCropApply}
              onCancel={() => setActiveTool('rotate')}
            />
          )}

          {activeTool === 'rotate' && (
            <RotateTool
              onRotate={rotate90}
              rotation={rotation}
            />
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
        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8 overflow-auto">
          {loading && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p className="text-gray-400">Laster bilde...</p>
            </div>
          )}

          {error && (
            <div className="text-center">
              <p className="text-red-400 mb-2">❌ {error}</p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
              >
                Lukk
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
                  objectFit: 'contain'
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
