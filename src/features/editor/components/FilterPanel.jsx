/**
 * Photo Editor - Phase 2: Filters & Adjustments
 *
 * FilterPanel Component - Filter selection and adjustments UI
 */

import React, { useState } from 'react'
import { Palette, Sun, Contrast, Droplet } from 'lucide-react'
import { FILTERS } from '../utils/filterUtils'

const FilterPanel = ({ onFilterApply, onAdjustmentsChange }) => {
  const [selectedFilter, setSelectedFilter] = useState('none')
  const [adjustments, setAdjustments] = useState({
    brightness: 0,    // -100 to +100
    contrast: 1.0,    // 0.5 to 2.0
    saturation: 1.0   // 0.0 to 2.0
  })

  const handleFilterSelect = (filterName) => {
    setSelectedFilter(filterName)
    if (onFilterApply) {
      onFilterApply(filterName)
    }
    console.log(`🎨 Selected filter: ${filterName}`)
  }

  const handleAdjustmentChange = (type, value) => {
    const newAdjustments = {
      ...adjustments,
      [type]: value
    }
    setAdjustments(newAdjustments)

    if (onAdjustmentsChange) {
      onAdjustmentsChange(newAdjustments)
    }
  }

  const resetAdjustments = () => {
    const defaultAdjustments = {
      brightness: 0,
      contrast: 1.0,
      saturation: 1.0
    }
    setAdjustments(defaultAdjustments)
    if (onAdjustmentsChange) {
      onAdjustmentsChange(defaultAdjustments)
    }
    console.log('↩️ Reset adjustments')
  }

  return (
    <div className="filter-panel bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 space-y-4">
      {/* Header */}
      <h3 className="font-bold text-sm flex items-center gap-2">
        <Palette className="w-4 h-4" />
        Filtre og justeringer
      </h3>

      {/* Filter Presets */}
      <div>
        <label className="text-xs text-gray-400 mb-2 block">Filterforhåndsvisninger</label>
        <div className="grid grid-cols-2 gap-2">
          {Object.keys(FILTERS).map((filterKey) => {
            const filter = FILTERS[filterKey]
            const isSelected = selectedFilter === filterKey

            return (
              <button
                key={filterKey}
                onClick={() => handleFilterSelect(filterKey)}
                className={`px-3 py-2 rounded-lg text-sm transition ${
                  isSelected
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-700/50 hover:bg-gray-700'
                }`}
              >
                {filter.nameNo}
              </button>
            )
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/10" />

      {/* Brightness */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-gray-400 flex items-center gap-1">
            <Sun className="w-3 h-3" />
            Lysstyrke
          </label>
          <span className="text-xs font-mono text-gray-400">
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
          <label className="text-xs text-gray-400 flex items-center gap-1">
            <Contrast className="w-3 h-3" />
            Kontrast
          </label>
          <span className="text-xs font-mono text-gray-400">
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
          <label className="text-xs text-gray-400 flex items-center gap-1">
            <Droplet className="w-3 h-3" />
            Metning
          </label>
          <span className="text-xs font-mono text-gray-400">
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

      {/* Reset Button */}
      <button
        onClick={resetAdjustments}
        className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition"
      >
        Tilbakestill justeringer
      </button>

      {/* Help Text */}
      <p className="text-xs text-gray-500 text-center">
        Velg filter og juster lysstyrke, kontrast og metning
      </p>
    </div>
  )
}

export default FilterPanel
