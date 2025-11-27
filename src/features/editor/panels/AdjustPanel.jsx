// ============================================================================
// COMPONENT: AdjustPanel.jsx - Adjust Sliders (Phase 8C-1)
// ============================================================================

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { RotateCcw } from 'lucide-react'

/**
 * AdjustPanel - Google Photos-style adjust sliders (Phase 8C-1)
 *
 * Provides real-time adjustment controls:
 * - Brightness, Contrast, Saturation, Warmth
 * - Highlights, Shadows, Clarity
 * - Blur, Vignette
 *
 * All changes apply instantly via viewportRef.current.setAdjustValue()
 *
 * @param {React.RefObject} viewportRef - Reference to EditorViewport
 */

// Slider configurations
const ADJUST_SLIDERS = [
  {
    key: 'brightness',
    label: 'Brightness',
    min: -100,
    max: 100,
    step: 1,
    default: 0,
  },
  {
    key: 'contrast',
    label: 'Contrast',
    min: -100,
    max: 100,
    step: 1,
    default: 0,
  },
  {
    key: 'saturation',
    label: 'Saturation',
    min: -100,
    max: 100,
    step: 1,
    default: 0,
  },
  { key: 'warmth', label: 'Warmth', min: -100, max: 100, step: 1, default: 0 },
  {
    key: 'highlights',
    label: 'Highlights',
    min: -100,
    max: 100,
    step: 1,
    default: 0,
  },
  {
    key: 'shadows',
    label: 'Shadows',
    min: -100,
    max: 100,
    step: 1,
    default: 0,
  },
  {
    key: 'clarity',
    label: 'Clarity',
    min: -100,
    max: 100,
    step: 1,
    default: 0,
  },
  { key: 'blur', label: 'Blur', min: 0, max: 20, step: 1, default: 0 },
  { key: 'vignette', label: 'Vignette', min: 0, max: 100, step: 1, default: 0 },
]

const AdjustPanel = ({ viewportRef }) => {
  const { t } = useTranslation()

  // Local state for sliders (mirrors viewport state)
  const [sliderValues, setSliderValues] = useState(() => {
    const initial = {}
    ADJUST_SLIDERS.forEach((slider) => {
      initial[slider.key] = slider.default
    })
    return initial
  })

  // Sync with viewport on mount
  useEffect(() => {
    if (viewportRef?.current) {
      const adjustState = viewportRef.current.getAdjustState?.()
      if (adjustState) {
        setSliderValues(adjustState)
      }
    }
  }, [viewportRef])

  /**
   * Handle slider change
   */
  const handleSliderChange = (key, value) => {
    const numValue = Number(value)

    // Update local state
    setSliderValues((prev) => ({ ...prev, [key]: numValue }))

    // Update viewport (real-time)
    if (viewportRef?.current) {
      viewportRef.current.setAdjustValue(key, numValue)
    }

    console.log(`🎨 Adjust: ${key} = ${numValue}`)
  }

  /**
   * Reset all sliders to defaults
   */
  const handleResetAll = () => {
    const defaults = {}
    ADJUST_SLIDERS.forEach((slider) => {
      defaults[slider.key] = slider.default
    })

    setSliderValues(defaults)

    if (viewportRef?.current) {
      viewportRef.current.resetAdjustValues()
    }

    console.log('🎨 Reset all adjust values')
  }

  /**
   * Check if any slider has changed
   */
  const hasChanges = Object.keys(sliderValues).some((key) => {
    const slider = ADJUST_SLIDERS.find((s) => s.key === key)
    return sliderValues[key] !== slider.default
  })

  return (
    <section className="panel-content-wrapper editor-panel editor-panel--active">
      <div className="adjust-panel">
        {/* Header */}
        <div className="adjust-panel-header">
          <h2 className="panel-title">{t('editor.adjust.title', 'Adjust')}</h2>

          {/* Reset All Button */}
          {hasChanges && (
            <button
              onClick={handleResetAll}
              className="adjust-reset-btn"
              aria-label={t('editor.adjust.resetAll', 'Reset All')}
            >
              <RotateCcw className="w-4 h-4" />
              {t('editor.adjust.resetAll', 'Reset All')}
            </button>
          )}
        </div>

        {/* Scroll Container with Cards */}
        <div className="adjust-scroll">
          {ADJUST_SLIDERS.map((slider) => (
            <section key={slider.key} className="adjust-card">
              {/* Card Header: Label + Value */}
              <div className="adjust-card-header">
                <span className="adjust-label">
                  {t(`editor.adjust.${slider.key}`, slider.label)}
                </span>
                <span className="adjust-value">{sliderValues[slider.key]}</span>
              </div>

              {/* Slider Row */}
              <div className="adjust-slider-row">
                <input
                  type="range"
                  min={slider.min}
                  max={slider.max}
                  step={slider.step}
                  value={sliderValues[slider.key]}
                  onChange={(e) =>
                    handleSliderChange(slider.key, e.target.value)
                  }
                  className="adjust-slider"
                  aria-label={slider.label}
                />
              </div>
            </section>
          ))}
        </div>
      </div>
    </section>
  )
}

export default AdjustPanel
