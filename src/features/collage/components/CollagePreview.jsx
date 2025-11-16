// ============================================================================
// COMPONENT: CollagePreview.jsx - Main collage preview with live rendering
// Displays photos in selected layout with CSS Grid, supports transforms
// ============================================================================
import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import PhotoCell from './PhotoCell'
import { getResponsiveGrid } from '../layouts/layouts_v3'

/**
 * CollagePreview Component
 * Renders photos in a grid layout with responsive behavior and transform support
 *
 * @param {Array} photos - Photo objects from Firestore
 * @param {Object} layout - LayoutV3 object
 * @param {Object} transforms - Transform data { [photoId]: { scale, translateX, translateY } }
 * @param {Function} onImageClick - Click handler (photoId) => void
 * @param {boolean} isLoading - Loading state
 * @param {string} className - Additional CSS classes
 */
const CollagePreview = ({
  photos = [],
  layout,
  transforms = {},
  onImageClick,
  isLoading = false,
  className = ''
}) => {
  const { t } = useTranslation(['collage'])
  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  )

  // Update screen width on resize for responsive grid
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleResize = () => {
      setScreenWidth(window.innerWidth)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Validate layout
  if (!layout) {
    return (
      <div className="flex items-center justify-center p-8 text-center">
        <div className="text-red-400">
          <p className="font-medium">{t('collage:errors.noLayout')}</p>
        </div>
      </div>
    )
  }

  // Validate photo count
  const photoCount = photos.length
  const isValidPhotoCount = photoCount >= layout.minPhotos && photoCount <= layout.maxPhotos

  if (!isValidPhotoCount && photoCount > 0) {
    return (
      <div className="flex items-center justify-center p-8 text-center">
        <div className="text-yellow-400">
          <p className="font-medium">{t('collage:errors.invalidPhotoCount')}</p>
          <p className="text-sm opacity-70 mt-2">
            {t('collage:errors.photoCountDetails', {
              current: photoCount,
              min: layout.minPhotos,
              max: layout.maxPhotos
            })}
          </p>
        </div>
      </div>
    )
  }

  // Get responsive grid template
  const gridTemplate = getResponsiveGrid(layout, screenWidth)

  // Parse aspect ratio for container
  const [ratioW, ratioH] = layout.aspectRatio.split(':').map(Number)
  const aspectRatioPadding = ((ratioH / ratioW) * 100).toFixed(2)

  return (
    <div className={`w-full ${className}`}>
      {/* Preview container with aspect ratio */}
      <div
        className="relative w-full overflow-hidden rounded-xl border border-white/20 bg-black/10 backdrop-blur-sm"
        style={{
          paddingBottom: `${aspectRatioPadding}%`
        }}
      >
        {/* Grid container */}
        <div
          className="absolute inset-0 p-0"
          style={{
            display: 'grid',
            gridTemplate,
            gap: `${layout.gap}px`,
            padding: `${layout.padding}px`
          }}
        >
          {/* Render photo cells */}
          {layout.slots.map((slot, index) => {
            const photo = photos[index] || null
            const transform = photo ? transforms[photo.id] : null

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
              <p className="text-sm text-white">{t('collage:loading.preview')}</p>
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

CollagePreview.propTypes = {
  photos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      downloadURL: PropTypes.string.isRequired,
      thumbnail: PropTypes.string,
      filename: PropTypes.string
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
      height: PropTypes.number.isRequired
    }).isRequired,
    grid: PropTypes.shape({
      desktop: PropTypes.string.isRequired,
      mobile: PropTypes.string.isRequired
    }).isRequired,
    slots: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        area: PropTypes.string.isRequired,
        crop: PropTypes.string,
        objectFit: PropTypes.string
      })
    ).isRequired,
    gap: PropTypes.number,
    padding: PropTypes.number
  }).isRequired,
  transforms: PropTypes.object,
  onImageClick: PropTypes.func,
  isLoading: PropTypes.bool,
  className: PropTypes.string
}

export default CollagePreview
