// ============================================================================
// COMPONENT: CollagePreview.jsx - Collage preview with layout grid
// Main preview component for displaying photos in selected layout
// ============================================================================
import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import PhotoCell from './PhotoCell'
import { normalizePhotosArray } from '../../../utils/photoHelpers'

/**
 * CollagePreview Component
 * Displays photos in a grid layout with transform support
 *
 * @param {Array} photos - Array of photo objects from Firestore
 * @param {Object} layout - Layout configuration (from layouts_v3.js)
 * @param {Object} transforms - Transform data { [photoId]: { scale, translateX, translateY } }
 * @param {Function} onImageClick - Click handler (photoId) => void
 * @param {boolean} isLoading - Loading state overlay
 * @param {string} className - Additional CSS classes
 */
const CollagePreview = ({
  photos = [],
  layout,
  transforms = {},
  onImageClick,
  isLoading = false,
  className = '',
}) => {
  const { t } = useTranslation(['collage'])

  // Normalize photo field names for consistent access (memoized)
  const normalizedPhotos = useMemo(() => normalizePhotosArray(photos), [photos])

  // Memoize grid style to prevent recalculation on every render
  const gridStyle = useMemo(() => ({
    gridTemplateColumns: layout.grid.desktop,
    gridTemplateRows: layout.grid.desktop,
    gap: `${layout.gap || 8}px`,
  }), [layout.grid.desktop, layout.gap])

  // Validate photo count matches layout requirements
  const photoCount = normalizedPhotos.length
  const minPhotos = layout.minPhotos
  const maxPhotos = layout.maxPhotos

  if (photoCount < minPhotos) {
    console.warn(
      `CollagePreview: Expected at least ${minPhotos} photos, got ${photoCount}`
    )
  }

  return (
    <div className={`collage-preview ${className}`}>
      <div
        className="relative w-full overflow-hidden rounded-xl border border-white/20 bg-black/5"
        style={{ aspectRatio: layout.aspectRatio }}
      >
        {/* Grid layout */}
        <div
          className="grid w-full h-full p-2"
          style={gridStyle}
        >
          {layout.slots.map((slot, index) => {
            const photo = normalizedPhotos[index] || null
            const transform =
              photo && transforms[photo.id] ? transforms[photo.id] : null

            return (
              <PhotoCell
                key={slot.id}
                photo={photo}
                slot={slot}
                transform={transform}
                onClick={onImageClick}
                isLoading={isLoading}
              />
            )
          })}
        </div>

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-white/20 border-t-blue-500 rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-white">
                {t('collage:loading.preview')}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Layout info (optional) */}
      <div className="mt-4 flex items-center justify-between text-xs opacity-60">
        <div>
          <span className="font-medium">{t(layout.nameKey)}</span>
          <span className="mx-2">•</span>
          <span>{layout.aspectRatio}</span>
          <span className="mx-2">•</span>
          <span>
            {photoCount}/{layout.maxPhotos} {t('collage:layout.photos')}
          </span>
        </div>
        <div>
          {layout.canvas.width} × {layout.canvas.height}px
        </div>
      </div>
    </div>
  )
}

// ✅ FIKSET: Bruker korrekte Firestore feltnavn
CollagePreview.propTypes = {
  photos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired, // ← Fikset fra downloadURL
      thumbnailUrl: PropTypes.string, // ← Fikset fra thumbnail
      name: PropTypes.string,
      filename: PropTypes.string,
    })
  ),
  layout: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    nameKey: PropTypes.string.isRequired,
    minPhotos: PropTypes.number.isRequired,
    maxPhotos: PropTypes.number.isRequired,
    aspectRatio: PropTypes.string.isRequired,
    canvas: PropTypes.shape({
      width: PropTypes.number.isRequired,
      height: PropTypes.number.isRequired,
    }).isRequired,
    grid: PropTypes.shape({
      desktop: PropTypes.string.isRequired,
      mobile: PropTypes.string.isRequired,
    }).isRequired,
    slots: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        area: PropTypes.string.isRequired,
        crop: PropTypes.string,
        objectFit: PropTypes.string,
      })
    ).isRequired,
    gap: PropTypes.number,
    padding: PropTypes.number,
  }).isRequired,
  transforms: PropTypes.object,
  onImageClick: PropTypes.func,
  isLoading: PropTypes.bool,
  className: PropTypes.string,
}

export default CollagePreview
