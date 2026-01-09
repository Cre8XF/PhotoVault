import useEditorStore from '../store/editorStore'
import { FILTER_PRESETS, getFilterMetadata } from '../utils/adjustments'
import useAuth from '../../../hooks/useAuth'
import { useTranslation } from 'react-i18next'

/**
 * Filters Panel - Filter presets with intensity control
 */
export default function FiltersPanel() {
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
    <div className="p-2 md:p-3 editor-bg-primary">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="editor-text-primary font-semibold text-sm">Filters</h3>
        {hasFilter && (
          <button
            onClick={handleReset}
            className="text-xs editor-text-muted hover:editor-text-secondary transition-colors"
          >
            {t('reset')}
          </button>
        )}
      </div>

      {/* 🆕 FREEMIUM: Preview Banner for FREE users */}
      {tier === 'FREE' && (
        <div className="mb-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-xs text-blue-300">
            🎨 Try all filters! Upgrade to LITE to save.
          </p>
        </div>
      )}

      {/* Filter Grid */}
      <div className="grid grid-cols-4 gap-2 mb-2">
        {FILTER_PRESETS.map((filterName) => {
          const metadata = getFilterMetadata(filterName)
          const isActive = filter.active === filterName

          return (
            <button
              key={filterName}
              onClick={() => handleFilterSelect(filterName)}
              className={`filter-thumb transition-all ${
                isActive
                  ? 'bg-blue-600 editor-text-primary ring-2 ring-blue-400'
                  : 'editor-bg-tertiary editor-text-secondary editor-bg-tertiary-hover'
              }`}
              title={metadata.description}
            >
              <span className="text-lg leading-none">{metadata.icon}</span>
              <span className="text-[11px] font-medium leading-tight">
                {metadata.name}
              </span>
            </button>
          )
        })}
      </div>

      {/* Intensity Slider - only show when filter is active */}
      {hasFilter && (
        <div className="mb-2">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm editor-text-secondary font-medium">
              Intensity
            </label>
            <span className="text-sm font-mono editor-text-muted">
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
            className="w-full h-2 editor-bg-tertiary rounded-lg appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none
                       [&::-webkit-slider-thumb]:w-4
                       [&::-webkit-slider-thumb]:h-4
                       [&::-webkit-slider-thumb]:bg-blue-400
                       [&::-webkit-slider-thumb]:rounded-full
                       [&::-webkit-slider-thumb]:cursor-pointer
                       [&::-moz-range-thumb]:w-4
                       [&::-moz-range-thumb]:h-4
                       [&::-moz-range-thumb]:bg-blue-400
                       [&::-moz-range-thumb]:rounded-full
                       [&::-moz-range-thumb]:border-0
                       [&::-moz-range-thumb]:cursor-pointer"
          />

          <div className="flex justify-between text-xs editor-text-muted mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      )}

      {/* Current Filter Display */}
      {hasFilter && (
        <div className="p-2 editor-bg-secondary rounded-lg">
          <p className="text-xs editor-text-muted mb-1">Active Filter:</p>
          <div className="flex items-center gap-2">
            <span className="text-xl">
              {getFilterMetadata(filter.active).icon}
            </span>
            <div>
              <p className="text-sm editor-text-primary font-medium">
                {getFilterMetadata(filter.active).name}
              </p>
              <p className="text-xs editor-text-muted">
                {getFilterMetadata(filter.active).description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      {!hasFilter && (
        <p className="text-xs editor-text-muted text-center">
          Select a filter to enhance your photo
        </p>
      )}
    </div>
  )
}
