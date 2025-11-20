/**
 * Photo Editor V2 - AdjustPanel Component
 *
 * Brightness, Contrast, and Saturation adjustments
 */

import React, { useState } from 'react'
import { Sliders, Sun, Contrast, Droplet, RotateCcw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const AdjustPanel = ({ onAdjust }) => {
  const { t } = useTranslation(['editor'])
  const [adjustments, setAdjustments] = useState({
    brightness: 0,    // -100 to +100
    contrast: 1.0,    // 0.5 to 2.0
    saturation: 1.0   // 0.0 to 2.0
  })

  const handleAdjustmentChange = (type, value) => {
    const newAdjustments = {
      ...adjustments,
      [type]: value
    }
    setAdjustments(newAdjustments)

    // VIKTIG: Call parent immediately for real-time update
    if (onAdjust) {
      console.log('🔍 AdjustPanel calling onAdjust:', newAdjustments)
      onAdjust(newAdjustments)
    }
  }

  const resetAdjustments = () => {
    const defaultAdjustments = {
      brightness: 0,
      contrast: 1.0,
      saturation: 1.0
    }
    setAdjustments(defaultAdjustments)
    if (onAdjust) {
      onAdjust(defaultAdjustments)
    }
    console.log('↩️ Reset adjustments')
  }

  return (
    <>
      <style>{`
        .adjust-panel input[type="range"] {
          height: 8px;
        }
        .adjust-panel input[type="range"]::-webkit-slider-thumb {
          width: 24px;
          height: 24px;
          cursor: pointer;
        }
        .adjust-panel input[type="range"]::-moz-range-thumb {
          width: 24px;
          height: 24px;
          cursor: pointer;
        }
      `}</style>
      <div className="adjust-panel space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold text-sm">{t('editor:adjust.title')}</h3>
          </div>

          {/* Reset button */}
          <button
            onClick={resetAdjustments}
            className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition touch-target"
            title={t('editor:adjust.reset')}
          >
            <RotateCcw className="w-4 h-4" />
            <span className="text-xs font-medium hidden sm:inline">
              {t('editor:buttons.reset')}
            </span>
          </button>
        </div>

        {/* Brightness */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-gray-400 flex items-center gap-2 font-medium">
              <Sun className="w-4 h-4" />
              {t('editor:filters.brightness')}
            </label>
            <span className="text-xs font-mono px-2 py-1 bg-white/5 rounded">
              {adjustments.brightness > 0 ? '+' : ''}{adjustments.brightness}
            </span>
          </div>
          <input
            type="range"
            min="-100"
            max="100"
            value={adjustments.brightness}
            onChange={(e) => handleAdjustmentChange('brightness', Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* Contrast */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-gray-400 flex items-center gap-2 font-medium">
              <Contrast className="w-4 h-4" />
              {t('editor:filters.contrast')}
            </label>
            <span className="text-xs font-mono px-2 py-1 bg-white/5 rounded">
              {adjustments.contrast.toFixed(2)}x
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={adjustments.contrast}
            onChange={(e) => handleAdjustmentChange('contrast', Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* Saturation */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-gray-400 flex items-center gap-2 font-medium">
              <Droplet className="w-4 h-4" />
              {t('editor:filters.saturation')}
            </label>
            <span className="text-xs font-mono px-2 py-1 bg-white/5 rounded">
              {adjustments.saturation.toFixed(2)}x
            </span>
          </div>
          <input
            type="range"
            min="0.0"
            max="2.0"
            step="0.1"
            value={adjustments.saturation}
            onChange={(e) => handleAdjustmentChange('saturation', Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>

        {/* Help Text */}
        <p className="text-xs text-gray-500 text-center pt-2">
          {t('editor:adjust.help')}
        </p>
      </div>
    </>
  )
}

export default AdjustPanel
