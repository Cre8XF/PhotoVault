import React from 'react'
import { ArrowLeft, Image as ImageIcon, Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'

// ✅ FIKSET: Bruker korrekte feltnavn fra Firestore
const getPhotoUrl = (photo) =>
  photo.thumbnailUrl || // Video thumbnail
  photo.url || // Standard felt fra Firestore
  ''

const PhotoSelector = ({
  photos,
  maxPhotos,
  selectedPhotos,
  onSelect,
  onBack,
}) => {
  const { t } = useTranslation(['collage'])

  const handlePhotoClick = (photo) => {
    const isSelected = selectedPhotos.some((p) => p.id === photo.id)
    if (isSelected) {
      onSelect(selectedPhotos.filter((p) => p.id !== photo.id))
    } else if (selectedPhotos.length < maxPhotos) {
      onSelect([...selectedPhotos, photo])
    }
  }

  const isPhotoSelected = (photo) =>
    selectedPhotos.some((p) => p.id === photo.id)
  const getPhotoSelectionOrder = (photo) => {
    const index = selectedPhotos.findIndex((p) => p.id === photo.id)
    return index >= 0 ? index + 1 : null
  }

  return (
    <div className="photo-selector">
      <div className="mb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm opacity-70 hover:opacity-100 transition mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('collage:buttons.backToLayouts')}
        </button>

        <div className="flex items-center gap-2 mb-2">
          <ImageIcon className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-bold">
            {t('collage:photoSelector.title')}
          </h3>
        </div>

        <div className="flex items-center justify-between">
          <p className="text-sm opacity-70">
            {t('collage:photoSelector.selectPhotos', { count: maxPhotos })}
          </p>

          <span className="text-sm font-medium">
            <span
              className={
                selectedPhotos.length === maxPhotos
                  ? 'text-green-400'
                  : 'text-purple-400'
              }
            >
              {selectedPhotos.length}
            </span>
            <span className="opacity-50">/{maxPhotos}</span>
          </span>
        </div>
      </div>

      {selectedPhotos.length > 0 && (
        <div className="mb-4 p-3 glass-card rounded-xl border border-white/10">
          <p className="text-xs opacity-70 mb-2">
            {t('collage:photoSelector.selectedPhotos')}
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedPhotos.map((photo, i) => (
              <div
                key={photo.id}
                className="relative w-12 h-12 rounded-lg overflow-hidden"
              >
                <img
                  src={getPhotoUrl(photo)}
                  alt={photo.name || photo.filename || 'Selected'}
                  className="w-full h-full object-cover"
                />

                <div className="absolute top-0 left-0 w-5 h-5 bg-purple-500 rounded-br-lg flex items-center justify-center">
                  <span className="text-xs font-bold">{i + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {photos && photos.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {photos.map((photo) => {
            const selected = isPhotoSelected(photo)
            const order = getPhotoSelectionOrder(photo)
            const canSelect = selectedPhotos.length < maxPhotos || selected
            const src = getPhotoUrl(photo)

            return (
              <button
                key={photo.id}
                onClick={() => handlePhotoClick(photo)}
                disabled={!canSelect}
                className={`
                  relative aspect-square rounded-lg overflow-hidden transition-all
                  ${selected ? 'ring-4 ring-purple-500' : 'ring-0'}
                  ${
                    !canSelect
                      ? 'opacity-30 cursor-not-allowed'
                      : 'hover:scale-105 cursor-pointer'
                  }
                `}
              >
                <img
                  src={src}
                  alt={photo.name || photo.filename || 'Photo'}
                  className="w-full h-full object-cover"
                />

                {selected && (
                  <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-2xl font-bold">{order}</span>
                    </div>
                  </div>
                )}

                {selected && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                    <Check className="w-4 h-4" />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center opacity-70">
          <ImageIcon className="w-12 h-12 mb-3" />
          <p>{t('collage:photoSelector.noPhotos')}</p>
          <p className="text-sm">{t('collage:photoSelector.uploadFirst')}</p>
        </div>
      )}
    </div>
  )
}

export default PhotoSelector
