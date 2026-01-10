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
        <div className="mb-3 p-2.5 rounded-lg" style={{
          backgroundColor: 'var(--interactive-active)',
          border: '1px solid var(--border-color)'
        }}>
          <p className="text-xs" style={{ color: 'var(--color-info)' }}>
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
              className="filter-thumb transition-all p-2.5 rounded-lg flex flex-col items-center gap-1"
              style={{
                backgroundColor: isActive ? 'var(--color-primary-500)' : 'var(--bg-editor-elevated)',
                color: 'var(--text-primary)',
                border: `2px solid ${isActive ? 'var(--color-primary-500)' : 'var(--border-color)'}`,
                minHeight: '44px'
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-editor-hover)'
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-editor-elevated)'
              }}
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
            <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
              Intensity
            </label>
            <span className="text-sm font-mono" style={{ color: 'var(--text-muted)' }}>
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
            style={{
              width: '100%',
              height: '8px',
              background: 'var(--bg-editor-elevated)',
              borderRadius: '8px',
              appearance: 'none',
              cursor: 'pointer'
            }}
          />

          <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      )}

      {/* Current Filter Display */}
      {hasFilter && (
        <div className="p-3 rounded-lg" style={{
          backgroundColor: 'var(--bg-editor-elevated)',
          border: '1px solid var(--border-color)'
        }}>
          <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Active Filter:</p>
          <div className="flex items-center gap-2">
            <span className="text-xl">
              {getFilterMetadata(filter.active).icon}
            </span>
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {getFilterMetadata(filter.active).name}
              </p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {getFilterMetadata(filter.active).description}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info */}
      {!hasFilter && (
        <p className="text-xs text-center py-2" style={{ color: 'var(--text-muted)' }}>
          Select a filter to enhance your photo
        </p>
      )}
    </div>
  )
}
