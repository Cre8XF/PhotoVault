/**
 * Slider Component
 *
 * @param {string} label - Slider label
 * @param {number} value - Current value
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {function} onChange - Callback when value changes
 * @param {function} onReset - Callback to reset to default
 */
export default function Slider({ label, value, min, max, onChange, onReset }) {
  // Format value for display
  const displayValue = value > 0 ? `+${value}` : value

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm text-gray-300 font-medium">{label}</label>
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono text-gray-400 min-w-[3rem] text-right">
            {displayValue}
          </span>
          {value !== 0 && onReset && (
            <button
              onClick={onReset}
              className="text-xs text-gray-500 hover:text-gray-400 transition-colors"
              title="Reset to 0"
            >
              º
            </button>
          )}
        </div>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
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
    </div>
  )
}
