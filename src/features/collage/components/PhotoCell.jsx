// ============================================================================
// COMPONENT: PhotoCell.jsx - Individual photo cell in collage preview
// Handles image rendering with transforms, click interactions, and loading states
// ============================================================================
import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { ImageIcon } from 'lucide-react'

/**
 * PhotoCell Component
 * Renders a single photo in the collage grid with transform support
 *
 * @param {Object} photo - Photo object from Firestore
 * @param {Object} slot - Layout slot configuration
 * @param {Object} transform - Transform data { scale, translateX, translateY }
 * @param {Function} onClick - Click handler (opens reposition modal)
 * @param {boolean} isLoading - Loading state
 */
const PhotoCell = ({ photo, slot, transform, onClick, isLoading = false }) => {
  const { t } = useTranslation(['collage'])
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Extract transform values with defaults
  const scale = transform?.scale || 1
  const translateX = transform?.translateX || 0
  const translateY = transform?.translateY || 0

  // Handle image load success
  const handleImageLoad = () => {
    setImageLoaded(true)
    setImageError(false)
  }

  // Handle image load error
  const handleImageError = () => {
    setImageError(true)
    setImageLoaded(false)
  }

  // Handle cell click
  const handleClick = () => {
    if (onClick && photo && !isLoading) {
      onClick(photo.id)
    }
  }

  // Grid area from slot configuration
  const gridArea = slot?.area || 'auto'

  return (
    <div
      style={{ gridArea }}
      className={`relative overflow-hidden bg-black/20 ${
        onClick && photo && !isLoading ? 'cursor-pointer' : ''
      } group transition-all duration-300`}
      onClick={handleClick}
    >
      {/* Photo image */}
      {photo && !imageError && (
        <img
          src={photo.thumbnail || photo.downloadURL}
          alt={photo.filename || t('collage:photo.untitled')}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`w-full h-full transition-all duration-200 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            objectFit: slot?.objectFit || 'cover',
            objectPosition: slot?.crop || 'center',
            transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
            transformOrigin: 'center center'
          }}
          loading="lazy"
        />
      )}

      {/* Loading skeleton */}
      {(!photo || !imageLoaded) && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/5 animate-pulse">
          <ImageIcon className="w-8 h-8 opacity-20" />
        </div>
      )}

      {/* Error placeholder */}
      {imageError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-500/10 border border-red-500/30">
          <ImageIcon className="w-8 h-8 text-red-400 mb-2" />
          <p className="text-xs text-red-400">{t('collage:photo.loadError')}</p>
        </div>
      )}

      {/* Empty slot placeholder */}
      {!photo && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/5 border-2 border-dashed border-white/10">
          <div className="text-center opacity-50">
            <ImageIcon className="w-8 h-8 mx-auto mb-2" />
            <p className="text-xs">{t('collage:photo.empty')}</p>
          </div>
        </div>
      )}

      {/* Click hint overlay (shows on hover) */}
      {onClick && photo && imageLoaded && !isLoading && (
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="text-center text-white px-4">
            <p className="text-sm font-medium">{t('collage:photo.clickToAdjust')}</p>
            {transform && (transform.scale !== 1 || transform.translateX !== 0 || transform.translateY !== 0) && (
              <p className="text-xs opacity-70 mt-1">{t('collage:photo.adjusted')}</p>
            )}
          </div>
        </div>
      )}

      {/* Transform indicator (shows when photo is adjusted) */}
      {photo && imageLoaded && transform && (transform.scale !== 1 || transform.translateX !== 0 || transform.translateY !== 0) && (
        <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          {Math.round(transform.scale * 100)}%
        </div>
      )}
    </div>
  )
}

PhotoCell.propTypes = {
  photo: PropTypes.shape({
    id: PropTypes.string.isRequired,
    downloadURL: PropTypes.string.isRequired,
    thumbnail: PropTypes.string,
    filename: PropTypes.string
  }),
  slot: PropTypes.shape({
    id: PropTypes.string.isRequired,
    area: PropTypes.string.isRequired,
    crop: PropTypes.string,
    objectFit: PropTypes.string
  }).isRequired,
  transform: PropTypes.shape({
    scale: PropTypes.number,
    translateX: PropTypes.number,
    translateY: PropTypes.number
  }),
  onClick: PropTypes.func,
  isLoading: PropTypes.bool
}

PhotoCell.defaultProps = {
  photo: null,
  transform: { scale: 1, translateX: 0, translateY: 0 },
  onClick: null,
  isLoading: false
}

export default PhotoCell
