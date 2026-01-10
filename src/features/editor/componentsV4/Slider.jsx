import { useRef } from 'react'

/**
 * Slider (V4)
 * - Touch-safe on mobile
 * - No vertical scroll hijacking
 * - Keyboard accessible
 * - Desktop + mobile compatible
 */
export default function Slider({
  label,
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
  unit = '',
}) {
  const inputRef = useRef(null)

  const handleChange = (e) => {
    const newValue = Number(e.target.value)
    onChange(newValue)
  }

  return (
    <div className="editor-slider">
      {label && (
        <div className="editor-slider-header">
          <span className="editor-slider-label">{label}</span>
          <span className="editor-slider-value">
            {value}
            {unit}
          </span>
        </div>
      )}

      <input
        ref={inputRef}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="editor-slider-input"
        aria-label={label}
      />
    </div>
  )
}
