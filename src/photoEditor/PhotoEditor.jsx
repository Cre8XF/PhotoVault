/**
 * PhotoEditor.jsx
 * Main orchestrator for Photo Editor V2
 * Includes undo/redo stack, state management, and export logic
 */
import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import EditorHeader from './EditorHeader'
import EditorTabs from './EditorTabs'
import EditorCanvas from './EditorCanvas'
import EditorPanelCrop from './EditorPanelCrop'
import EditorPanelRotate from './EditorPanelRotate'
import EditorPanelFilters from './EditorPanelFilters'
import EditorPanelAdjust from './EditorPanelAdjust'
import EditorPanelText from './EditorPanelText'
import './editor.css'

const PhotoEditor = ({ photo, imageUrl: propImageUrl, onClose, onSave }) => {
  const { t } = useTranslation(['editor'])
  const canvasRef = useRef(null)

  // Resolve image URL with comprehensive fallback
  const resolvedImageUrl =
    propImageUrl ||
    photo?.imageUrl ||
    photo?.fullUrl ||
    photo?.downloadUrl ||
    photo?.url ||
    photo?.src ||
    photo?.path ||
    ''

  console.log('🎨 PhotoEditor received imageUrl:', resolvedImageUrl)

  // Validate URL
  if (!resolvedImageUrl) {
    console.error('❌ PhotoEditor: No valid image URL provided')
  }

  // State
  const [activeTab, setActiveTab] = useState('rotate')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [imageDimensions, setImageDimensions] = useState(null)
  const [error, setError] = useState(resolvedImageUrl ? null : 'No image URL provided')

  // Transform state
  const [transform, setTransform] = useState({
    scale: 1,
    rotation: 0,
    offsetX: 0,
    offsetY: 0
  })

  // Tool states
  const [cropBox, setCropBox] = useState(null)
  const [filters, setFilters] = useState({ type: 'none' })
  const [adjustments, setAdjustments] = useState({
    brightness: 0,
    contrast: 1,
    saturation: 1,
    shadows: 0,
    highlights: 0,
    temperature: 0
  })
  const [textLayers, setTextLayers] = useState([])

  // Undo/Redo stack
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Initialize history with initial state
  useEffect(() => {
    if (imageDimensions && history.length === 0) {
      const initialState = {
        transform: { scale: 1, rotation: 0, offsetX: 0, offsetY: 0 },
        cropBox: null,
        filters: { type: 'none' },
        adjustments: {
          brightness: 0,
          contrast: 1,
          saturation: 1,
          shadows: 0,
          highlights: 0,
          temperature: 0
        },
        textLayers: []
      }
      setHistory([initialState])
      setHistoryIndex(0)
    }
  }, [imageDimensions, history.length])

  // Save state to history
  const saveToHistory = (newState) => {
    const updatedHistory = history.slice(0, historyIndex + 1)
    updatedHistory.push(newState)

    // Limit history to 50 states
    if (updatedHistory.length > 50) {
      updatedHistory.shift()
    } else {
      setHistoryIndex(historyIndex + 1)
    }

    setHistory(updatedHistory)
  }

  // Undo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const previousState = history[historyIndex - 1]
      setTransform(previousState.transform)
      setCropBox(previousState.cropBox)
      setFilters(previousState.filters)
      setAdjustments(previousState.adjustments)
      setTextLayers(previousState.textLayers)
      setHistoryIndex(historyIndex - 1)
    }
  }

  // Redo
  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1]
      setTransform(nextState.transform)
      setCropBox(nextState.cropBox)
      setFilters(nextState.filters)
      setAdjustments(nextState.adjustments)
      setTextLayers(nextState.textLayers)
      setHistoryIndex(historyIndex + 1)
    }
  }

  // Handle transform change
  const handleTransformChange = (newTransform) => {
    setTransform(newTransform)
  }

  // Handle rotation change
  const handleRotationChange = (rotation) => {
    const newTransform = { ...transform, rotation }
    setTransform(newTransform)

    saveToHistory({
      transform: newTransform,
      cropBox,
      filters,
      adjustments,
      textLayers
    })
  }

  // Handle crop box change
  const handleCropChange = (newCropBox) => {
    setCropBox(newCropBox)
  }

  // Handle crop apply
  const handleApplyCrop = () => {
    saveToHistory({
      transform,
      cropBox,
      filters,
      adjustments,
      textLayers
    })

    // Switch back to rotate tool after applying crop
    setActiveTab('rotate')
  }

  // Handle crop cancel
  const handleCropCancel = () => {
    setCropBox(null)
    setActiveTab('rotate')
  }

  // Handle filter change
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)

    if (!newFilters.temporary) {
      saveToHistory({
        transform,
        cropBox,
        filters: newFilters,
        adjustments,
        textLayers
      })
    }
  }

  // Handle adjustment change
  const handleAdjustmentChange = (newAdjustments) => {
    setAdjustments(newAdjustments)

    saveToHistory({
      transform,
      cropBox,
      filters,
      adjustments: newAdjustments,
      textLayers
    })
  }

  // Handle text layers change
  const handleTextLayersChange = (newTextLayers) => {
    setTextLayers(newTextLayers)

    saveToHistory({
      transform,
      cropBox,
      filters,
      adjustments,
      textLayers: newTextLayers
    })
  }

  // Handle image load
  const handleImageLoad = (dimensions) => {
    setImageDimensions(dimensions)
    setIsImageLoaded(true)
    setLoading(false)
  }

  // Handle tab change
  const handleTabChange = (tab) => {
    // If switching to crop, enable crop mode
    if (tab === 'crop' && !cropBox && imageDimensions) {
      setCropBox({
        x: imageDimensions.width * 0.1,
        y: imageDimensions.height * 0.1,
        width: imageDimensions.width * 0.8,
        height: imageDimensions.height * 0.8
      })
    }

    // If switching away from crop without applying, reset crop box
    if (activeTab === 'crop' && tab !== 'crop') {
      setCropBox(null)
    }

    // Normalize transform when switching tools
    setTransform(prev => ({
      ...prev,
      scale: Math.max(0.7, Math.min(4, prev.scale)),
      offsetX: 0,
      offsetY: 0
    }))

    setActiveTab(tab)
  }

  // Export final image
  const exportImage = async () => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      const img = new Image()
      img.crossOrigin = 'anonymous'

      img.onload = () => {
        try {
          // Calculate final dimensions
          let finalWidth = img.width
          let finalHeight = img.height

          // Apply crop if any
          let sourceX = 0
          let sourceY = 0
          let sourceWidth = img.width
          let sourceHeight = img.height

          if (cropBox) {
            sourceX = cropBox.x
            sourceY = cropBox.y
            sourceWidth = cropBox.width
            sourceHeight = cropBox.height
            finalWidth = cropBox.width
            finalHeight = cropBox.height
          }

          // Set canvas size
          canvas.width = finalWidth
          canvas.height = finalHeight

          // Save context
          ctx.save()

          // Apply rotation
          if (transform.rotation !== 0) {
            ctx.translate(finalWidth / 2, finalHeight / 2)
            ctx.rotate((transform.rotation * Math.PI) / 180)
            ctx.translate(-finalWidth / 2, -finalHeight / 2)
          }

          // Draw image
          ctx.drawImage(
            img,
            sourceX,
            sourceY,
            sourceWidth,
            sourceHeight,
            0,
            0,
            finalWidth,
            finalHeight
          )

          ctx.restore()

          // Apply filters
          if (filters.type !== 'none') {
            applyFiltersToCanvas(ctx, canvas, filters)
          }

          // Apply adjustments
          if (adjustments) {
            applyAdjustmentsToCanvas(ctx, canvas, adjustments)
          }

          // Apply text layers
          if (textLayers.length > 0) {
            drawTextLayersToCanvas(ctx, textLayers, canvas)
          }

          // Convert to blob
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error(t('editor:errors.blobError')))
              }
            },
            'image/jpeg',
            0.95
          )
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => {
        reject(new Error(t('editor:errors.imageLoadError')))
      }

      img.src = resolvedImageUrl
    })
  }

  // Apply filters to canvas (same logic as EditorCanvas)
  const applyFiltersToCanvas = (ctx, canvas, filters) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    switch (filters.type) {
      case 'warm':
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.min(255, data[i] * 1.1)
          data[i + 2] = Math.max(0, data[i + 2] * 0.9)
        }
        break
      case 'cool':
        for (let i = 0; i < data.length; i += 4) {
          data[i] = Math.max(0, data[i] * 0.9)
          data[i + 2] = Math.min(255, data[i + 2] * 1.1)
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

  // Apply adjustments to canvas
  const applyAdjustmentsToCanvas = (ctx, canvas, adj) => {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i]
      let g = data[i + 1]
      let b = data[i + 2]

      if (adj.brightness !== 0) {
        r += adj.brightness
        g += adj.brightness
        b += adj.brightness
      }

      if (adj.contrast !== 1) {
        r = ((r - 128) * adj.contrast + 128)
        g = ((g - 128) * adj.contrast + 128)
        b = ((b - 128) * adj.contrast + 128)
      }

      if (adj.saturation !== 1) {
        const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b
        r = gray + (r - gray) * adj.saturation
        g = gray + (g - gray) * adj.saturation
        b = gray + (b - gray) * adj.saturation
      }

      if (adj.temperature !== 0) {
        r += adj.temperature
        b -= adj.temperature
      }

      if (adj.shadows !== 0) {
        const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b
        if (luminance < 128) {
          const shadowFactor = 1 + (adj.shadows / 100)
          r *= shadowFactor
          g *= shadowFactor
          b *= shadowFactor
        }
      }

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

  // Draw text layers to canvas
  const drawTextLayersToCanvas = (ctx, layers, canvas) => {
    layers.forEach(layer => {
      if (!layer.text) return

      ctx.save()

      ctx.font = `${layer.bold ? 'bold' : ''} ${layer.italic ? 'italic' : ''} ${layer.size}px ${layer.font || 'Arial'}`
      ctx.fillStyle = layer.color || '#ffffff'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      if (layer.shadow) {
        ctx.shadowColor = 'rgba(0,0,0,0.8)'
        ctx.shadowBlur = 4
      }

      if (layer.strokeWidth) {
        ctx.strokeStyle = layer.strokeColor || '#000'
        ctx.lineWidth = layer.strokeWidth
        ctx.strokeText(layer.text, layer.x, layer.y)
      }

      ctx.fillText(layer.text, layer.x, layer.y)

      ctx.restore()
    })
  }

  // Handle download
  const handleDownload = async () => {
    try {
      const blob = await exportImage()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.download = `edited_${photo?.name || 'photo'}.jpg`
      link.href = url
      link.click()
      window.URL.revokeObjectURL(url)
      console.log('📥 Downloaded edited photo')
    } catch (error) {
      console.error('Failed to download photo:', error)
      alert(t('editor:errors.downloadError'))
    }
  }

  // Handle save
  const handleSave = async () => {
    if (!onSave) {
      console.warn('No onSave handler provided')
      return
    }

    setSaving(true)

    try {
      const blob = await exportImage()
      await onSave(blob, photo)
      console.log('✅ Saved edited photo')
      onClose()
    } catch (error) {
      console.error('Failed to save photo:', error)
      alert(t('editor:errors.saveError'))
    } finally {
      setSaving(false)
    }
  }

  // Render active panel
  const renderPanel = () => {
    switch (activeTab) {
      case 'crop':
        return (
          <EditorPanelCrop
            cropBox={cropBox}
            onCropChange={handleCropChange}
            onApplyCrop={handleApplyCrop}
            onCancel={handleCropCancel}
            imageDimensions={imageDimensions}
          />
        )
      case 'rotate':
        return (
          <EditorPanelRotate
            rotation={transform.rotation}
            onRotationChange={handleRotationChange}
          />
        )
      case 'filters':
        return (
          <EditorPanelFilters
            currentFilter={filters}
            onFilterChange={handleFilterChange}
          />
        )
      case 'adjust':
        return (
          <EditorPanelAdjust
            adjustments={adjustments}
            onAdjustmentChange={handleAdjustmentChange}
          />
        )
      case 'text':
        return (
          <EditorPanelText
            textLayers={textLayers}
            onTextLayersChange={handleTextLayersChange}
            canvasDimensions={imageDimensions}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="photo-editor-v2">
      {/* Header */}
      <EditorHeader
        onClose={onClose}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onDownload={handleDownload}
        onSave={onSave ? handleSave : null}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        saving={saving}
      />

      {/* Tabs */}
      <EditorTabs activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Main Layout */}
      <div className="editor-layout">
        {/* Canvas */}
        <div className="editor-canvas-wrapper">
          {loading && (
            <div className="editor-loading">
              <div className="editor-spinner"></div>
              <p className="editor-loading-text">{t('editor:loading.image')}</p>
            </div>
          )}

          {!loading && !error && (
            <EditorCanvas
              ref={canvasRef}
              imageUrl={resolvedImageUrl}
              transform={transform}
              onTransformChange={handleTransformChange}
              cropBox={activeTab === 'crop' ? cropBox : null}
              filters={filters}
              adjustments={adjustments}
              textLayers={textLayers}
              onImageLoad={handleImageLoad}
              onError={(err) => {
                console.error('Canvas error:', err)
                setError(err)
                setLoading(false)
              }}
            />
          )}

          {error && (
            <div className="editor-loading">
              <p className="text-red-400 text-center mb-4">❌ {error}</p>
              <button
                onClick={onClose}
                className="editor-btn editor-btn-secondary"
              >
                {t('editor:buttons.close')}
              </button>
            </div>
          )}
        </div>

        {/* Tools Panel */}
        <div className="editor-panel-wrapper">{renderPanel()}</div>
      </div>
    </div>
  )
}

export default PhotoEditor
