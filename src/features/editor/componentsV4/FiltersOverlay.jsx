import useEditorStore from '../store/editorStore'
import { FILTER_PRESETS, getFilterMetadata } from '../utils/adjustments'
import useAuth from '../../../hooks/useAuth'
import { useTranslation } from 'react-i18next'

/**
 * FiltersOverlay - Filter presets with intensity control
 *
 * SAME functionality as V3 FiltersPanel
 * DIFFERENT styling - overlay style
 */
export default function FiltersOverlay() {
  const { t } = useTranslation('common')
  const transform = useEditorStore((state) => state.transform)
  const applyTransform = useEditorStore((state) => state.applyTransform)
  const resetTransform = useEditorStore((state) => state.resetTransform)
  const { userProfile } = useAuth()

  const tier = userProfile?.subscriptionTier || 'FREE'
  const filter = transform.filter || { active: null, intensity: 100 }

  /**
   * Apply filter preset
   */
  const handleFilterSelect = (filterName) => {
    applyTransform('filter', {
      active: filterName,
      intensity: filter.intensity,
    })
  }

  /**
   * Change filter intensity
   */
  const handleIntensityChange = (value) => {
    applyTransform('filter', {
      ...filter,
      intensity: value,
    })
  }

  /**
   * Reset filter
   */
  const handleReset = () => {
    resetTransform('filter')
  }

  const hasFilter = filter.active && filter.active !== 'none'

  return (
    <div className="editor-v4-overlay">
      {/* Header */}
      <div className="editor-v4-overlay-header">
        <h3>Filters</h3>
        {hasFilter && (
          <button onClick={handleReset}>{t('reset')}</button>
        )}
      </div>

      {/* FREEMIUM: Preview Banner for FREE users */}
      {tier === 'FREE' && (
        <div className="mb-3 p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-xs text-blue-300">
            🎨 Try all filters! Upgrade to LITE to save.
          </p>
        </div>
      )}

      {/* Filter Grid */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {FILTER_PRESETS.map((filterName) => {
          const metadata = getFilterMetadata(filterName)
          const isActive = filter.active === filterName

          return (
            <button
              key={filterName}
              onClick={() => handleFilterSelect(filterName)}
              className={`filter-thumb transition-all p-2.5 rounded-lg flex flex-col items-center gap-1 ${
                isActive
                  ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
              title={metadata.description}
            >
              <span className="text-lg leading-none">{metadata.icon}</span>
              <span className="text-[11px] font-medium leading-tight text-center">
                {metadata.name}
              </span>
            </button>
          )
        })}
      </div>

      {/* Intensity Slider - only show when filter is active */}
      {hasFilter && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-300 font-medium">
              Intensity
            </label>
            <span className="text-sm font-mono text-gray-400">
              {filter.intensity}%
            </span>
          </div>

          <input
            type="range"
            min={0}
            max={100}
            step={5}
            value={filter.intensity}
            onChange={(e) => handleIntensityChange(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none
                       [&::-webkit-slider-thumb]:w-5
                       [&::-webkit-slider-thumb]:h-5
                       [&::-webkit-slider-thumb]:bg-blue-400
                       [&::-webkit-slider-thumb]:rounded-full
                       [&::-webkit-slider-thumb]:cursor-pointer
                       [&::-moz-range-thumb]:w-5
                       [&::-moz-range-thumb]:h-5
                       [&::-moz-range-thumb]:bg-blue-400
                       [&::-moz-range-thumb]:rounded-full
                       [&::-moz-range-thumb]:border-0
                       [&::-moz-range-thumb]:cursor-pointer"
          />

          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      )}

      {/* Current Filter Display */}
      {hasFilter && (
        <div className="p-3 bg-gray-800 rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Active Filter:</p>
          <div className="flex items-center gap-2">
            <span className="text-xl">
              {getFilterMetadata(filter.active).icon}
            </span>
            <div>
              <p className="text-sm text-white font-medium">
                {getFilterMetadata(filter.active).name}
              </p>
              <p className="text-xs text-gray-400">
                {getFilterMetadata(filter.active).description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      {!hasFilter && (
        <p className="text-xs text-gray-400 text-center py-2">
          Select a filter to enhance your photo
        </p>
      )}
    </div>
  )
}
