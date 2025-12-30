import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import PhotoCell from './PhotoCell'

/**
 * CollagePreview Component
 *
 * Displays a preview of a collage with photos placed in layout slots.
 * Supports custom transforms, loading states, and click handlers.
 */
function CollagePreview({
  photos = [],
  layout,
  transforms = {},
  onImageClick,
  isLoading = false,
  className = '',
}) {
  const { t } = useTranslation('collage')
  const [previewPhotos, setPreviewPhotos] = useState([])

  // Prepare photos for preview
  useEffect(() => {
    if (!photos || photos.length === 0) return

    const prepared = photos.map((photo) => ({
      id: photo.id || photo.photoId,
      url: photo.url || photo.downloadURL || '',
      thumbnailUrl:
        photo.thumbnailUrl || photo.thumbnail || photo.url || photo.downloadURL,
      name: photo.name || photo.filename || 'Untitled',
    }))

    setPreviewPhotos(prepared)
  }, [photos])

  if (!layout) {
    return (
      <div className="collage-preview-error bg-red-500/10 border border-red-500/20 rounded-lg p-8 text-center">
        <p className="text-red-400">{t('collage:error.layoutMissing')}</p>
      </div>
    )
  }

  const photoCount = previewPhotos.length

  // Normalize aspectRatio to CSS-compatible value
  const aspectRatioValue =
    typeof layout.aspectRatio === 'number'
      ? layout.aspectRatio
      : layout.aspectRatio || '1'

  return (
    <div className={`collage-preview relative ${className}`}>
      {/* Canvas wrapper with aspect ratio */}
      <div
        className="relative w-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden shadow-2xl"
        style={{
          aspectRatio: aspectRatioValue,
          paddingTop: layout.padding || 0,
          paddingBottom: layout.padding || 0,
          paddingLeft: layout.padding || 0,
          paddingRight: layout.padding || 0,
        }}
      >
        {/* Grid container */}
        <div
          className="absolute inset-0 grid"
          style={{
            gridTemplateColumns: layout.grid?.desktop || 'repeat(2, 1fr)',
            gap: `${layout.gap || 8}px`,
          }}
        >
          {layout.slots?.map((slot, index) => {
            const photo = previewPhotos[index]
            if (!photo) return null

            const transform =
              transforms && transforms[photo.id] ? transforms[photo.id] : null

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
          <span className="font-medium">
            {layout.nameKey ? t(layout.nameKey) : layout.name || 'Custom'}
          </span>
          <span className="mx-2">•</span>
          <span>{layout.aspectRatio}</span>
          <span className="mx-2">•</span>
          <span>
            {photoCount}/{layout.maxPhotos} {t('collage:layout.photos')}
          </span>
        </div>
        <div>
          {layout.canvas?.width} × {layout.canvas?.height}px
        </div>
      </div>
    </div>
  )
}

CollagePreview.propTypes = {
  photos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
      thumbnailUrl: PropTypes.string,
      name: PropTypes.string,
      filename: PropTypes.string,
    })
  ),
  layout: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    nameKey: PropTypes.string, // ✅ Optional
    minPhotos: PropTypes.number.isRequired,
    maxPhotos: PropTypes.number.isRequired,
    aspectRatio: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired, // ✅ Kan være string eller number
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
