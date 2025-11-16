import React, { useMemo } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { Check, ImageIcon } from 'lucide-react'

// ✅ FIKSET: Bruker korrekte feltnavn fra Firestore
const getPhotoUrl = (photo) =>
  photo.thumbnailUrl || // Video thumbnail
  photo.url || // Standard felt fra Firestore
  ''

const PhotoGridGrouped = ({
  photos = [],
  selectedPhotos = [],
  onToggle,
  maxReached = false,
  showGrouping = true,
}) => {
  const { t } = useTranslation(['collage'])

  const groupedPhotos = useMemo(() => {
    if (!showGrouping) return [{ label: null, photos }]

    const now = Date.now()
    const oneDay = 24 * 60 * 60 * 1000
    const oneWeek = 7 * oneDay
    const oneMonth = 30 * oneDay

    const groups = {
      today: [],
      yesterday: [],
      thisWeek: [],
      thisMonth: [],
      older: [],
    }

    photos.forEach((photo) => {
      const uploadDate = new Date(photo.uploadedAt || photo.createdAt)
      const diff = now - uploadDate.getTime()

      if (diff < oneDay) groups.today.push(photo)
      else if (diff < 2 * oneDay) groups.yesterday.push(photo)
      else if (diff < oneWeek) groups.thisWeek.push(photo)
      else if (diff < oneMonth) groups.thisMonth.push(photo)
      else groups.older.push(photo)
    })

    const result = []
    if (groups.today.length)
      result.push({
        label: t('collage:picker.groups.today'),
        photos: groups.today,
      })
    if (groups.yesterday.length)
      result.push({
        label: t('collage:picker.groups.yesterday'),
        photos: groups.yesterday,
      })
    if (groups.thisWeek.length)
      result.push({
        label: t('collage:picker.groups.thisWeek'),
        photos: groups.thisWeek,
      })
    if (groups.thisMonth.length)
      result.push({
        label: t('collage:picker.groups.thisMonth'),
        photos: groups.thisMonth,
      })
    if (groups.older.length)
      result.push({
        label: t('collage:picker.groups.older'),
        photos: groups.older,
      })

    return result
  }, [photos, showGrouping, t])

  const isSelected = (photo) => selectedPhotos.some((p) => p.id === photo.id)

  return (
    <div className="space-y-6">
      {groupedPhotos.map((group, groupIndex) => (
        <div key={groupIndex}>
          {group.label && (
            <h3 className="text-sm font-semibold opacity-60 mb-3">
              {group.label}
            </h3>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {group.photos.map((photo) => {
              const selected = isSelected(photo)
              const selectable = !maxReached || selected
              const src = getPhotoUrl(photo)

              return (
                <div
                  key={photo.id}
                  onClick={() => selectable && onToggle(photo)}
                  className={`
                    group relative aspect-square rounded-lg overflow-hidden cursor-pointer
                    border-2 transition-all duration-200
                    ${
                      selected
                        ? 'border-blue-500 scale-95 shadow-lg shadow-blue-500/20'
                        : 'border-transparent hover:border-white/30'
                    }
                    ${
                      !selectable && !selected
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }
                  `}
                >
                  <img
                    src={src}
                    alt={
                      photo.filename ||
                      photo.fileName ||
                      photo.name ||
                      t('collage:photo.untitled')
                    }
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />

                  {selected && (
                    <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                        <Check className="w-6 h-6 text-white" strokeWidth={3} />
                      </div>
                    </div>
                  )}

                  {!selected && selectable && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-10 h-10 border-2 border-white rounded-full"></div>
                    </div>
                  )}

                  {!selectable && !selected && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <p className="text-xs text-white/70">
                        {t('collage:picker.maxReached')}
                      </p>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}

      {photos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ImageIcon className="w-16 h-16 opacity-20 mb-4" />
          <p className="text-lg opacity-70">{t('collage:picker.noPhotos')}</p>
          <p className="text-sm opacity-50 mt-2">
            {t('collage:picker.noPhotosDesc')}
          </p>
        </div>
      )}
    </div>
  )
}

PhotoGridGrouped.propTypes = {
  photos: PropTypes.array,
  selectedPhotos: PropTypes.array,
  onToggle: PropTypes.func.isRequired,
  maxReached: PropTypes.bool,
  showGrouping: PropTypes.bool,
}

export default PhotoGridGrouped
