/**
 * EditorPanelCrop.jsx
 * Crop tool with draggable crop box and aspect ratio presets
 */
import React, { useState, useEffect } from 'react'
import { Square, RectangleHorizontal, Monitor, Maximize } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const EditorPanelCrop = ({ cropBox, onCropChange, onApplyCrop, onCancel, imageDimensions }) => {
  const { t } = useTranslation(['editor'])
  const [selectedRatio, setSelectedRatio] = useState('free')

  const aspectRatios = [
    { id: 'free', label: t('editor:crop.free'), icon: Maximize, ratio: null },
    { id: '1:1', label: '1:1', icon: Square, ratio: 1 },
    { id: '3:2', label: '3:2', icon: RectangleHorizontal, ratio: 3 / 2 },
    { id: '4:3', label: '4:3', icon: Monitor, ratio: 4 / 3 },
    { id: '16:9', label: '16:9', icon: RectangleHorizontal, ratio: 16 / 9 },
  ]

  // Initialize crop box if not set
  useEffect(() => {
    if (!cropBox && imageDimensions) {
      const initialCropBox = {
        x: imageDimensions.width * 0.1,
        y: imageDimensions.height * 0.1,
        width: imageDimensions.width * 0.8,
        height: imageDimensions.height * 0.8
      }
      onCropChange(initialCropBox)
    }
  }, [imageDimensions, cropBox, onCropChange])

  const handleRatioChange = (ratioId, ratio) => {
    setSelectedRatio(ratioId)

    if (!cropBox || !ratio) return

    // Calculate new dimensions maintaining aspect ratio
    const currentAspect = cropBox.width / cropBox.height

    let newWidth = cropBox.width
    let newHeight = cropBox.height

    if (currentAspect > ratio) {
      // Width is larger, adjust width
      newWidth = cropBox.height * ratio
    } else {
      // Height is larger, adjust height
      newHeight = cropBox.width / ratio
    }

    // Center the crop box
    const newX = cropBox.x + (cropBox.width - newWidth) / 2
    const newY = cropBox.y + (cropBox.height - newHeight) / 2

    onCropChange({
      x: Math.max(0, newX),
      y: Math.max(0, newY),
      width: newWidth,
      height: newHeight
    })
  }

  return (
    <div className="editor-panel">
      <div className="editor-panel-header">
        <h3 className="editor-panel-title">{t('editor:crop.title')}</h3>
        <p className="editor-panel-subtitle">{t('editor:crop.subtitle')}</p>
      </div>

      {/* Aspect Ratio Presets */}
      <div className="editor-panel-section">
        <label className="editor-label">{t('editor:crop.aspectRatio')}</label>
        <div className="editor-ratio-grid">
          {aspectRatios.map((ratio) => {
            const Icon = ratio.icon
            const isActive = selectedRatio === ratio.id

            return (
              <button
                key={ratio.id}
                onClick={() => handleRatioChange(ratio.id, ratio.ratio)}
                className={`editor-ratio-btn ${isActive ? 'active' : ''}`}
              >
                <Icon className="w-5 h-5" />
                <span>{ratio.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Crop Info */}
      {cropBox && (
        <div className="editor-panel-section">
          <div className="editor-crop-info">
            <div className="editor-crop-info-item">
              <span className="label">{t('editor:crop.width')}</span>
              <span className="value">{Math.round(cropBox.width)}px</span>
            </div>
            <div className="editor-crop-info-item">
              <span className="label">{t('editor:crop.height')}</span>
              <span className="value">{Math.round(cropBox.height)}px</span>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="editor-panel-actions">
        <button onClick={onCancel} className="editor-btn editor-btn-secondary editor-btn-full">
          {t('editor:buttons.cancel')}
        </button>
        <button onClick={onApplyCrop} className="editor-btn editor-btn-primary editor-btn-full">
          {t('editor:buttons.apply')}
        </button>
      </div>
    </div>
  )
}

export default EditorPanelCrop
