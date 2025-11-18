/**
 * EditorPanelAdjust.jsx
 * Adjustment sliders (brightness, contrast, saturation, shadows, highlights, temperature)
 */
import React from 'react'
import { RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const EditorPanelAdjust = ({ adjustments, onAdjustmentChange }) => {
  const { t } = useTranslation(['editor'])

  const adjustmentControls = [
    {
      id: 'brightness',
      label: t('editor:adjust.brightness'),
      min: -100,
      max: 100,
      step: 1,
      value: adjustments.brightness || 0,
    },
    {
      id: 'contrast',
      label: t('editor:adjust.contrast'),
      min: 0.5,
      max: 2,
      step: 0.01,
      value: adjustments.contrast || 1,
    },
    {
      id: 'saturation',
      label: t('editor:adjust.saturation'),
      min: 0,
      max: 2,
      step: 0.01,
      value: adjustments.saturation || 1,
    },
    {
      id: 'shadows',
      label: t('editor:adjust.shadows'),
      min: -50,
      max: 50,
      step: 1,
      value: adjustments.shadows || 0,
    },
    {
      id: 'highlights',
      label: t('editor:adjust.highlights'),
      min: -50,
      max: 50,
      step: 1,
      value: adjustments.highlights || 0,
    },
    {
      id: 'temperature',
      label: t('editor:adjust.temperature'),
      min: -50,
      max: 50,
      step: 1,
      value: adjustments.temperature || 0,
    },
  ]

  const handleAdjustmentChange = (id, value) => {
    onAdjustmentChange({
      ...adjustments,
      [id]: parseFloat(value)
    })
  }

  const resetAdjustment = (id, defaultValue) => {
    handleAdjustmentChange(id, defaultValue)
  }

  const resetAll = () => {
    onAdjustmentChange({
      brightness: 0,
      contrast: 1,
      saturation: 1,
      shadows: 0,
      highlights: 0,
      temperature: 0,
    })
  }

  return (
    <div className="editor-panel">
      <div className="editor-panel-header">
        <h3 className="editor-panel-title">{t('editor:adjust.title')}</h3>
        <p className="editor-panel-subtitle">{t('editor:adjust.subtitle')}</p>
      </div>

      {/* Adjustment Sliders */}
      <div className="editor-panel-section editor-adjust-section">
        {adjustmentControls.map((control) => {
          const isModified = control.id === 'brightness' || control.id === 'shadows' || control.id === 'highlights' || control.id === 'temperature'
            ? control.value !== 0
            : control.value !== 1

          const displayValue = control.id === 'contrast' || control.id === 'saturation'
            ? Math.round(control.value * 100) + '%'
            : Math.round(control.value)

          return (
            <div key={control.id} className="editor-adjust-control">
              <div className="editor-adjust-header">
                <label className="editor-label">{control.label}</label>
                <div className="editor-adjust-actions">
                  <span className={`editor-adjust-value ${isModified ? 'modified' : ''}`}>
                    {displayValue}
                  </span>
                  {isModified && (
                    <button
                      onClick={() => resetAdjustment(
                        control.id,
                        control.id === 'contrast' || control.id === 'saturation' ? 1 : 0
                      )}
                      className="editor-adjust-reset"
                      aria-label={t('editor:adjust.reset')}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
              <input
                type="range"
                min={control.min}
                max={control.max}
                step={control.step}
                value={control.value}
                onChange={(e) => handleAdjustmentChange(control.id, e.target.value)}
                className="editor-slider"
              />
            </div>
          )
        })}
      </div>

      {/* Reset All Button */}
      <div className="editor-panel-section">
        <button
          onClick={resetAll}
          className="editor-btn editor-btn-outline editor-btn-full"
        >
          {t('editor:adjust.resetAll')}
        </button>
      </div>
    </div>
  )
}

export default EditorPanelAdjust
