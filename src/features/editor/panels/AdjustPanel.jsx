// ============================================================================
// COMPONENT: AdjustPanel.jsx - Adjust Sliders (Phase 8C-2: Horizontal Slider Rows)
// ============================================================================

import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { RotateCcw } from 'lucide-react'

/**
 * AdjustPanel - Google Photos-style adjust sliders (Phase 8C-2)
 *
 * Now updated with horizontal scroll containers for each slider row:
 * - Prevents accidental vertical scroll grabbing a slider on mobile
 */

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

  const [sliderValues, setSliderValues] = useState(() => {
    const initial = {}
    ADJUST_SLIDERS.forEach((s) => (initial[s.key] = s.default))
    return initial
  })

  useEffect(() => {
    if (viewportRef?.current) {
      const adjustState = viewportRef.current.getAdjustState?.()
      if (adjustState) setSliderValues(adjustState)
    }
  }, [viewportRef])

  const handleSliderChange = (key, value) => {
    const val = Number(value)
    setSliderValues((prev) => ({ ...prev, [key]: val }))
    viewportRef?.current?.setAdjustValue(key, val)
  }

  const handleResetAll = () => {
    const defaults = {}
    ADJUST_SLIDERS.forEach((s) => (defaults[s.key] = s.default))
    setSliderValues(defaults)
    viewportRef?.current?.resetAdjustValues()
  }

  const hasChanges = Object.keys(sliderValues).some((key) => {
    const config = ADJUST_SLIDERS.find((s) => s.key === key)
    return sliderValues[key] !== config.default
  })

  return (
    <section className="panel-content-wrapper editor-panel editor-panel--active">
      <div className="adjust-panel">
        {/* Header */}
        <div className="adjust-panel-header">
          <h2 className="panel-title">{t('editor.adjust.title', 'Adjust')}</h2>

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

        {/* Content */}
        <div className="adjust-content">
          <div className="adjust-sliders-list">
            {ADJUST_SLIDERS.map((s) => (
              <div key={s.key} className="adjust-slider-item">
                {/* Label + value */}
                <div className="adjust-slider-label">
                  <span>{t(`editor.adjust.${s.key}`, s.label)}</span>
                  <span className="text-xs text-white/60">
                    {sliderValues[s.key]}
                  </span>
                </div>

                {/* Horizontal slider row */}
                <div className="slider-row slider-scroll-x">
                  <input
                    type="range"
                    min={s.min}
                    max={s.max}
                    step={s.step}
                    value={sliderValues[s.key]}
                    onChange={(e) => handleSliderChange(s.key, e.target.value)}
                    className="adjust-slider"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Scroll-safe zone */}
          <div className="adjust-scrollzone" />
        </div>

        <p className="text-xs text-white/50 text-center mt-2">
          {t(
            'editor.adjust.instructions',
            'Drag sliders to adjust. Changes apply instantly. Use Reset All to undo.'
          )}
        </p>
      </div>
    </section>
  )
}

export default AdjustPanel
