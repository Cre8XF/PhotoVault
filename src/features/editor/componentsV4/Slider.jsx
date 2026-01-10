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
    <div className="mb-2">
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-sm editor-text-secondary font-medium">{label}</label>
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono editor-text-muted min-w-[3rem] text-right">
            {displayValue}
          </span>
          {value !== 0 && onReset && (
            <button
              onClick={onReset}
              className="text-xs editor-text-muted hover:editor-text-secondary transition-colors"
              title="Reset to 0"
            >
              ↺
            </button>
          )}
        </div>
      </div>

      {/* Touch-safe padding wrapper */}
      <div className="px-1 py-2">
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="slider-touch-safe w-full h-2 editor-bg-tertiary rounded-lg appearance-none
                     [&::-webkit-slider-thumb]:appearance-none
                     [&::-webkit-slider-thumb]:w-5
                     [&::-webkit-slider-thumb]:h-5
                     [&::-webkit-slider-thumb]:bg-blue-400
                     [&::-webkit-slider-thumb]:rounded-full
                     [&::-webkit-slider-thumb]:cursor-grab
                     [&::-webkit-slider-thumb]:active:cursor-grabbing
                     [&::-moz-range-thumb]:w-5
                     [&::-moz-range-thumb]:h-5
                     [&::-moz-range-thumb]:bg-blue-400
                     [&::-moz-range-thumb]:rounded-full
                     [&::-moz-range-thumb]:border-0
                     [&::-moz-range-thumb]:cursor-grab
                     [&::-moz-range-thumb]:active:cursor-grabbing"
        />
      </div>
    </div>
  )
}
