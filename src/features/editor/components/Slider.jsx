/**
 * Slider Component - Theme-aware
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
        <label className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</label>
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono min-w-[3rem] text-right" style={{ color: 'var(--text-muted)' }}>
            {displayValue}
          </span>
          {value !== 0 && onReset && (
            <button
              onClick={onReset}
              className="text-xs transition-colors"
              style={{
                color: 'var(--text-muted)',
                minHeight: '44px',
                padding: '8px'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
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
          style={{
            width: '100%',
            height: '8px',
            background: 'var(--bg-editor-elevated)',
            borderRadius: '8px',
            appearance: 'none',
            cursor: 'grab'
          }}
        />
      </div>
    </div>
  )
}
