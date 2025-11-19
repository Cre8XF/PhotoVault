/**
 * Photo Editor V2 - FiltersPanel Component
 *
 * Filter presets gallery
 */

import React, { useState } from 'react'
import { Palette } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { FILTERS } from '../utils/filterUtils'

const FiltersPanel = ({ onFilter }) => {
  const { t, i18n } = useTranslation(['editor'])
  const [selectedFilter, setSelectedFilter] = useState('none')

  const handleFilterSelect = (filterName) => {
    setSelectedFilter(filterName)
    if (onFilter) {
      onFilter(filterName)
    }
    console.log(`🎨 Selected filter: ${filterName}`)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Palette className="w-5 h-5 text-purple-400" />
        <h3 className="font-semibold text-sm">{t('editor:filters.title')}</h3>
      </div>

      {/* Filter Presets */}
      <div>
        <label className="text-xs text-gray-400 mb-3 block font-medium">
          {t('editor:filters.presets')}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {Object.keys(FILTERS).map((filterKey) => {
            const filter = FILTERS[filterKey]
            const isSelected = selectedFilter === filterKey

            return (
              <button
                key={filterKey}
                onClick={() => handleFilterSelect(filterKey)}
                className={`
                  min-h-[44px] px-4 py-3 rounded-lg text-sm font-medium transition touch-target
                  ${isSelected
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/5 hover:bg-white/10 text-gray-300'
                  }
                `}
              >
                {i18n.language === 'no' ? filter.nameNo : filter.name}
              </button>
            )
          })}
        </div>
      </div>

      {/* Help Text */}
      <p className="text-xs text-gray-500 text-center pt-2">
        {t('editor:filters.help')}
      </p>
    </div>
  )
}

export default FiltersPanel
