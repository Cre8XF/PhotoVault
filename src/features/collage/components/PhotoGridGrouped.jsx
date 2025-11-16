// ============================================================================
// COMPONENT: PhotoGridGrouped.jsx - Photo grid with date grouping headers
// Responsive grid with selection checkboxes and lazy loading
// ============================================================================
import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { Check, ImageIcon } from 'lucide-react'

/**
 * PhotoGridGrouped Component
 * Displays photos grouped by date with selection support
 *
 * @param {Array} photos - Array of photo objects
 * @param {Array} selectedPhotos - Array of selected photo objects
 * @param {Function} onToggle - Toggle selection handler (photo) => void
 * @param {boolean} maxReached - Whether max selection reached
 * @param {boolean} showGrouping - Whether to show date grouping
 */
const PhotoGridGrouped = ({
  photos = [],
  selectedPhotos = [],
  onToggle,
  maxReached = false,
  showGrouping = true
}) => {
  const { t } = useTranslation(['collage'])

  // Group photos by date
  const groupedPhotos = useMemo(() => {
    if (!showGrouping) {
      return [{ label: null, photos }]
    }

    const now = Date.now()
    const oneDay = 24 * 60 * 60 * 1000
    const oneWeek = 7 * oneDay
    const oneMonth = 30 * oneDay

    const groups = {
      today: [],
      yesterday: [],
      thisWeek: [],
      thisMonth: [],
      older: []
    }

    photos.forEach(photo => {
      const uploadDate = new Date(photo.uploadedAt || photo.createdAt)
      const diff = now - uploadDate.getTime()

      if (diff < oneDay) {
        groups.today.push(photo)
      } else if (diff < 2 * oneDay) {
        groups.yesterday.push(photo)
      } else if (diff < oneWeek) {
        groups.thisWeek.push(photo)
      } else if (diff < oneMonth) {
        groups.thisMonth.push(photo)
      } else {
        groups.older.push(photo)
      }
    })

    const result = []
    if (groups.today.length > 0) {
      result.push({ label: t('collage:picker.groups.today'), photos: groups.today })
    }
    if (groups.yesterday.length > 0) {
      result.push({ label: t('collage:picker.groups.yesterday'), photos: groups.yesterday })
    }
    if (groups.thisWeek.length > 0) {
      result.push({ label: t('collage:picker.groups.thisWeek'), photos: groups.thisWeek })
    }
    if (groups.thisMonth.length > 0) {
      result.push({ label: t('collage:picker.groups.thisMonth'), photos: groups.thisMonth })
    }
    if (groups.older.length > 0) {
      result.push({ label: t('collage:picker.groups.older'), photos: groups.older })
    }

    return result
  }, [photos, showGrouping, t])

  // Check if photo is selected
  const isSelected = (photo) => {
    return selectedPhotos.some(p => p.id === photo.id)
  }

  // Check if photo can be selected
  const canSelect = (photo) => {
    return isSelected(photo) || !maxReached
  }

  return (
    <div className="space-y-6">
      {groupedPhotos.map((group, groupIndex) => (
        <div key={groupIndex}>
          {/* Group header */}
          {group.label && (
            <h3 className="text-sm font-semibold opacity-70 mb-3 px-1">
              {group.label}
            </h3>
          )}

          {/* Photo grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
            {group.photos.map(photo => {
              const selected = isSelected(photo)
              const selectable = canSelect(photo)

              return (
                <div
                  key={photo.id}
                  onClick={() => selectable && onToggle(photo)}
                  className={`
                    relative aspect-square rounded-lg overflow-hidden
                    border-2 transition-all cursor-pointer group
                    ${selected
                      ? 'border-blue-500 scale-95 shadow-lg shadow-blue-500/20'
                      : 'border-transparent hover:border-white/30'
                    }
                    ${!selectable && !selected ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {/* Photo image */}
                  <img
                    src={photo.thumbnail || photo.downloadURL}
                    alt={photo.filename || t('collage:photo.untitled')}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />

                  {/* Selection overlay */}
                  {selected && (
                    <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                        <Check className="w-6 h-6 text-white" strokeWidth={3} />
                      </div>
                    </div>
                  )}

                  {/* Hover overlay (when not selected) */}
                  {!selected && selectable && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-10 h-10 border-2 border-white rounded-full" />
                    </div>
                  )}

                  {/* Not selectable overlay */}
                  {!selectable && !selected && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <p className="text-xs text-white/70">{t('collage:picker.maxReached')}</p>
                    </div>
                  )}

                  {/* Photo info on hover */}
                  {photo.filename && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-xs text-white truncate">{photo.filename}</p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {/* Empty state */}
      {photos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ImageIcon className="w-16 h-16 opacity-20 mb-4" />
          <p className="text-lg font-medium opacity-70">{t('collage:picker.noPhotos')}</p>
          <p className="text-sm opacity-50 mt-2">{t('collage:picker.noPhotosDesc')}</p>
        </div>
      )}
    </div>
  )
}

PhotoGridGrouped.propTypes = {
  photos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      downloadURL: PropTypes.string.isRequired,
      thumbnail: PropTypes.string,
      filename: PropTypes.string,
      uploadedAt: PropTypes.any,
      createdAt: PropTypes.any
    })
  ),
  selectedPhotos: PropTypes.array,
  onToggle: PropTypes.func.isRequired,
  maxReached: PropTypes.bool,
  showGrouping: PropTypes.bool
}

PhotoGridGrouped.defaultProps = {
  photos: [],
  selectedPhotos: [],
  maxReached: false,
  showGrouping: true
}

export default PhotoGridGrouped
