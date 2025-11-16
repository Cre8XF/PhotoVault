// ============================================================================
// COMPONENT: LayoutIcon.jsx - Visual icon representation of layout
// Renders miniature preview of grid layout structure
// ============================================================================
import React from 'react'
import PropTypes from 'prop-types'

/**
 * LayoutIcon Component
 * Renders a visual preview icon for a collage layout
 *
 * @param {Object} layout - Layout object from layouts_v3.js
 * @param {string} className - Additional CSS classes
 */
const LayoutIcon = ({ layout, className = '' }) => {
  if (!layout) return null

  // Parse grid template to get column/row structure
  const gridTemplate = layout.grid.desktop

  // Create simplified SVG representation of the layout
  // Each slot becomes a rectangle in the SVG
  return (
    <svg
      viewBox="0 0 100 100"
      className={`w-full h-full ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background */}
      <rect
        x="0"
        y="0"
        width="100"
        height="100"
        fill="currentColor"
        opacity="0.1"
        rx="4"
      />

      {/* Render each slot as a rectangle */}
      {layout.slots.map((slot, index) => {
        // Parse slot.area (CSS Grid area format: "row-start / col-start / row-end / col-end")
        const [rowStart, colStart, rowEnd, colEnd] = slot.area
          .split('/')
          .map(s => parseInt(s.trim()))

        // Calculate total grid dimensions from all slots
        const maxCols = Math.max(...layout.slots.map(s => {
          const parts = s.area.split('/').map(p => parseInt(p.trim()))
          return parts[3] // col-end
        }))
        const maxRows = Math.max(...layout.slots.map(s => {
          const parts = s.area.split('/').map(p => parseInt(p.trim()))
          return parts[2] // row-end
        }))

        // Convert grid coordinates to SVG coordinates (with gap consideration)
        const gap = layout.gap || 0
        const gapPercent = (gap / 12) // Scale gap for icon (assuming 12px gap = 1%)

        const cellWidth = 100 / maxCols
        const cellHeight = 100 / maxRows

        const x = (colStart - 1) * cellWidth + gapPercent
        const y = (rowStart - 1) * cellHeight + gapPercent
        const width = (colEnd - colStart) * cellWidth - (gapPercent * 2)
        const height = (rowEnd - rowStart) * cellHeight - (gapPercent * 2)

        return (
          <rect
            key={slot.id || index}
            x={x}
            y={y}
            width={width}
            height={height}
            fill="currentColor"
            opacity="0.7"
            rx="2"
            className="transition-opacity duration-200"
          />
        )
      })}
    </svg>
  )
}

LayoutIcon.propTypes = {
  layout: PropTypes.shape({
    id: PropTypes.string.isRequired,
    grid: PropTypes.shape({
      desktop: PropTypes.string.isRequired
    }).isRequired,
    slots: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        area: PropTypes.string.isRequired
      })
    ).isRequired,
    gap: PropTypes.number
  }),
  className: PropTypes.string
}

export default LayoutIcon
