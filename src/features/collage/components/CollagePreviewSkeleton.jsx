// ============================================================================
// COMPONENT: CollagePreviewSkeleton.jsx - Loading skeleton for CollagePreview
// Shows placeholder grid while photos are loading
// ============================================================================
import React from 'react'
import PropTypes from 'prop-types'
import { getResponsiveGrid } from '../layouts/layouts_v3'

/**
 * CollagePreviewSkeleton Component
 * Displays animated skeleton while collage preview is loading
 *
 * @param {Object} layout - LayoutV3 object
 * @param {string} className - Additional CSS classes
 */
const CollagePreviewSkeleton = ({ layout, className = '' }) => {
  if (!layout) {
    return (
      <div className={`w-full ${className}`}>
        <div className="w-full aspect-square bg-white/5 rounded-xl animate-pulse" />
      </div>
    )
  }

  // Get responsive grid template
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1024
  const gridTemplate = getResponsiveGrid(layout, screenWidth)

  // Parse aspect ratio for container
  const [ratioW, ratioH] = layout.aspectRatio.split(':').map(Number)
  const aspectRatioPadding = ((ratioH / ratioW) * 100).toFixed(2)

  return (
    <div className={`w-full ${className}`}>
      {/* Skeleton container with aspect ratio */}
      <div
        className="relative w-full overflow-hidden rounded-xl border border-white/10 bg-white/5"
        style={{
          paddingBottom: `${aspectRatioPadding}%`
        }}
      >
        {/* Grid skeleton */}
        <div
          className="absolute inset-0"
          style={{
            display: 'grid',
            gridTemplate,
            gap: `${layout.gap}px`,
            padding: `${layout.padding}px`
          }}
        >
          {/* Render skeleton cells */}
          {layout.slots.map((slot) => (
            <div
              key={slot.id}
              style={{ gridArea: slot.area }}
              className="relative overflow-hidden bg-white/10 animate-pulse"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>
          ))}
        </div>
      </div>

      {/* Info skeleton */}
      <div className="mt-4 flex items-center justify-between">
        <div className="h-3 w-32 bg-white/10 rounded animate-pulse" />
        <div className="h-3 w-24 bg-white/10 rounded animate-pulse" />
      </div>
    </div>
  )
}

CollagePreviewSkeleton.propTypes = {
  layout: PropTypes.shape({
    id: PropTypes.string.isRequired,
    aspectRatio: PropTypes.string.isRequired,
    grid: PropTypes.shape({
      desktop: PropTypes.string.isRequired,
      mobile: PropTypes.string.isRequired
    }).isRequired,
    slots: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        area: PropTypes.string.isRequired
      })
    ).isRequired,
    gap: PropTypes.number,
    padding: PropTypes.number
  }),
  className: PropTypes.string
}

export default CollagePreviewSkeleton
