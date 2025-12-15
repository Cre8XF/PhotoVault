import useEditorStore from '../store/editorStore'
import { FILTER_PRESETS, getFilterMetadata } from '../utils/adjustments'

/**
 * Filters Panel - Filter presets with intensity control
 */
export default function FiltersPanel() {
  const transform = useEditorStore((state) => state.transform)
  const applyTransform = useEditorStore((state) => state.applyTransform)
  const resetTransform = useEditorStore((state) => state.resetTransform)

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
    <div className="p-4 bg-[#0a0a0a]">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Filters</h3>
        {hasFilter && (
          <button
            onClick={handleReset}
            className="text-xs text-gray-400 hover:text-gray-300 transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* Filter Grid */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {FILTER_PRESETS.map((filterName) => {
          const metadata = getFilterMetadata(filterName)
          const isActive = filter.active === filterName

          return (
            <button
              key={filterName}
              onClick={() => handleFilterSelect(filterName)}
              className={`aspect-square rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${
                isActive
                  ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                  : 'bg-[#2a2a2a] text-gray-300 hover:bg-[#3a3a3a]'
              }`}
              title={metadata.description}
            >
              <span className="text-2xl">{metadata.icon}</span>
              <span className="text-xs font-medium">{metadata.name}</span>
            </button>
          )
        })}
      </div>

      {/* Intensity Slider - only show when filter is active */}
      {hasFilter && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-300 font-medium">Intensity</label>
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
            className="w-full h-2 bg-[#2a2a2a] rounded-lg appearance-none cursor-pointer
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

          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
        </div>
      )}

      {/* Current Filter Display */}
      {hasFilter && (
        <div className="p-3 bg-[#1a1a1a] rounded-lg">
          <p className="text-xs text-gray-400 mb-1">Active Filter:</p>
          <div className="flex items-center gap-2">
            <span className="text-xl">{getFilterMetadata(filter.active).icon}</span>
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
        <p className="text-xs text-gray-500 text-center">
          Select a filter to enhance your photo
        </p>
      )}
    </div>
  )
}
