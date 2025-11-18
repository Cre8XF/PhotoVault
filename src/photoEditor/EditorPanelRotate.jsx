/**
 * EditorPanelRotate.jsx
 * 360° rotation tool with slider and snap points
 */
import React, { useState, useEffect } from 'react'
import { RotateCcw, RotateCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const EditorPanelRotate = ({ rotation, onRotationChange }) => {
  const { t } = useTranslation(['editor'])
  const [tempRotation, setTempRotation] = useState(rotation)

  useEffect(() => {
    setTempRotation(rotation)
  }, [rotation])

  const handleSliderChange = (e) => {
    const value = parseFloat(e.target.value)
    setTempRotation(value)
  }

  const handleSliderRelease = () => {
    // Snap to nearest 90° if within 5°
    const snapAngles = [0, 90, 180, 270, 360]
    let finalRotation = tempRotation

    for (const angle of snapAngles) {
      if (Math.abs(tempRotation - angle) < 5) {
        finalRotation = angle % 360
        break
      }
    }

    setTempRotation(finalRotation)
    onRotationChange(finalRotation)
  }

  const rotate90 = (direction) => {
    const newRotation = (rotation + (direction === 'cw' ? 90 : -90)) % 360
    const normalized = newRotation < 0 ? newRotation + 360 : newRotation
    setTempRotation(normalized)
    onRotationChange(normalized)
  }

  const resetRotation = () => {
    setTempRotation(0)
    onRotationChange(0)
  }

  return (
    <div className="editor-panel">
      <div className="editor-panel-header">
        <h3 className="editor-panel-title">{t('editor:rotate.title')}</h3>
        <p className="editor-panel-subtitle">{t('editor:rotate.subtitle')}</p>
      </div>

      {/* Rotation Display */}
      <div className="editor-panel-section">
        <div className="editor-rotation-display">
          <span className="editor-rotation-value">{Math.round(tempRotation)}°</span>
        </div>
      </div>

      {/* Rotation Slider */}
      <div className="editor-panel-section">
        <label className="editor-label">{t('editor:rotate.angle')}</label>
        <input
          type="range"
          min="0"
          max="360"
          step="1"
          value={tempRotation}
          onChange={handleSliderChange}
          onMouseUp={handleSliderRelease}
          onTouchEnd={handleSliderRelease}
          className="editor-slider editor-slider-rotation"
        />
        <div className="editor-slider-marks">
          <span>0°</span>
          <span>90°</span>
          <span>180°</span>
          <span>270°</span>
          <span>360°</span>
        </div>
      </div>

      {/* Quick Rotate Buttons */}
      <div className="editor-panel-section">
        <label className="editor-label">{t('editor:rotate.quickRotate')}</label>
        <div className="editor-rotate-buttons">
          <button
            onClick={() => rotate90('ccw')}
            className="editor-btn editor-btn-secondary"
          >
            <RotateCcw className="w-5 h-5" />
            <span>{t('editor:rotate.rotateLeft')}</span>
          </button>
          <button
            onClick={() => rotate90('cw')}
            className="editor-btn editor-btn-secondary"
          >
            <RotateCw className="w-5 h-5" />
            <span>{t('editor:rotate.rotateRight')}</span>
          </button>
        </div>
      </div>

      {/* Reset Button */}
      <div className="editor-panel-section">
        <button
          onClick={resetRotation}
          className="editor-btn editor-btn-outline editor-btn-full"
        >
          {t('editor:rotate.reset')}
        </button>
      </div>
    </div>
  )
}

export default EditorPanelRotate
