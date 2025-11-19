// ============================================================================
// COMPONENT: PhotoCell.jsx - Individual photo cell in collage preview
// Handles image rendering with transforms, click interactions, and loading states
// ============================================================================
import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { ImageIcon } from 'lucide-react'
import { normalizePhotoFields } from '../../../utils/photoHelpers'

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

  // Normalize photo field names at component level
  const normalizedPhoto = normalizePhotoFields(photo)

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
    if (onClick && normalizedPhoto && !isLoading) {
      onClick(normalizedPhoto.id)
    }
  }

  // Grid area from slot configuration
  const gridArea = slot?.area || 'auto'

  // Use normalized field names for image URL
  const photoUrl = normalizedPhoto?.thumbnailUrl || normalizedPhoto?.url || ''

  return (
    <div
      style={{ gridArea }}
      className={`relative overflow-hidden bg-black/20 ${
        onClick && normalizedPhoto && !isLoading ? 'cursor-pointer' : ''
      } group transition-all duration-300`}
      onClick={handleClick}
    >
      {/* Photo image */}
      {normalizedPhoto && !imageError && (
        <img
          src={photoUrl}
          alt={normalizedPhoto.filename || normalizedPhoto.name || t('collage:photo.untitled')}
          onLoad={handleImageLoad}
          onError={handleImageError}
          className={`w-full h-full transition-all duration-200 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            objectFit: slot?.objectFit || 'cover',
            objectPosition: slot?.crop || 'center',
            transform: `scale(${scale}) translate(${translateX}px, ${translateY}px)`,
            transformOrigin: 'center',
          }}
        />
      )}

      {/* Loading skeleton */}
      {(!imageLoaded || isLoading) && !imageError && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/5 animate-pulse">
          <ImageIcon className="w-12 h-12 opacity-20" />
        </div>
      )}

      {/* Error state */}
      {imageError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-500/10 border-2 border-red-500/50">
          <ImageIcon className="w-8 h-8 text-red-500 mb-2" />
          <p className="text-xs text-red-500">
            {t('collage:errors.imageLoadFailed')}
          </p>
        </div>
      )}

      {/* Empty slot placeholder */}
      {!normalizedPhoto && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center border-2 border-dashed border-white/20">
          <ImageIcon className="w-8 h-8 opacity-20" />
        </div>
      )}

      {/* Click hint (on hover) */}
      {onClick && normalizedPhoto && !isLoading && (
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <p className="text-xs text-white bg-black/60 px-3 py-1 rounded-full">
            {t('collage:hints.clickToAdjust')}
          </p>
        </div>
      )}

      {/* Transform indicator (shows zoom %) */}
      {normalizedPhoto &&
        transform &&
        (transform.scale !== 1 ||
          transform.translateX !== 0 ||
          transform.translateY !== 0) && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            {Math.round(transform.scale * 100)}%
          </div>
        )}
    </div>
  )
}

// ✅ FIKSET: Bruker korrekte Firestore feltnavn
PhotoCell.propTypes = {
  photo: PropTypes.shape({
    id: PropTypes.string.isRequired,
    url: PropTypes.string.isRequired, // ← Fikset fra downloadURL
    thumbnailUrl: PropTypes.string, // ← Fikset fra thumbnail
    name: PropTypes.string,
    filename: PropTypes.string,
  }),
  slot: PropTypes.shape({
    id: PropTypes.string.isRequired,
    area: PropTypes.string.isRequired,
    crop: PropTypes.string,
    objectFit: PropTypes.string,
  }).isRequired,
  transform: PropTypes.shape({
    scale: PropTypes.number,
    translateX: PropTypes.number,
    translateY: PropTypes.number,
  }),
  onClick: PropTypes.func,
  isLoading: PropTypes.bool,
}

export default PhotoCell
