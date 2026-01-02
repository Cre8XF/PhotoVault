import React, { useMemo } from 'react'
import { LayoutGrid, Check } from 'lucide-react'
import { getTemplateById, expandTemplate } from '../features/collage/templateEngine'

/**
 * CollageCard Component
 * Displays a collage thumbnail in the photo grid (2x1 size)
 * Supports edit mode for selection alongside photos
 *
 * @param {Object} collage - Collage object from Firestore
 * @param {Function} onClick - Click handler
 * @param {String} className - Additional CSS classes
 * @param {Boolean} editMode - Whether edit mode is active
 * @param {Boolean} isSelected - Whether this collage is selected
 * @param {Function} onSelect - Selection handler (receives collage.id)
 */
const CollageCard = ({
  collage,
  onClick,
  className = '',
  // Edit mode props
  editMode = false,
  isSelected = false,
  onSelect = null
}) => {
  // Use staticImageUrl (rendered JPEG) or fallback to imageUrl/url/thumbnailUrl
  const thumbnailUrl = collage.staticImageUrl || collage.imageUrl || collage.url || collage.thumbnailUrl

  // Count photos in collage
  const photoCount = collage.slots?.filter(s => s.photo).length ||
                     collage.photoIds?.length ||
                     0

  const handleClick = (e) => {
    if (editMode && onSelect) {
      e.stopPropagation()
      onSelect(collage.id)
    } else if (onClick) {
      onClick(collage)
    }
  }

  // Get layout and photos for dynamic rendering
  const { layout, photos } = useMemo(() => {
    // Only compute if we have slots with photos
    if (!collage.slots || collage.slots.length === 0) {
      return { layout: null, photos: [] }
    }

    // Get layout from template
    let resolvedLayout = null
    if (collage.templateId) {
      const template = getTemplateById(collage.templateId)
      if (template) {
        const expanded = expandTemplate(template)
        const gridTemplate = expanded.grid?.desktop || 'repeat(2, 1fr) / repeat(2, 1fr)'
        const gridParts = gridTemplate.split(' / ')

        resolvedLayout = {
          slots: expanded.slots,
          grid: {
            desktop: gridTemplate,
            rows: gridParts[0] || 'repeat(2, 1fr)',
            cols: gridParts[1] || gridParts[0] || 'repeat(2, 1fr)',
          },
          gap: expanded.gap || 2,
        }
      }
    }

    // Extract photos from slots
    const slotPhotos = collage.slots
      .filter(slot => slot.photo)
      .map(slot => slot.photo)

    return { layout: resolvedLayout, photos: slotPhotos }
  }, [collage.slots, collage.templateId])

  // Should we render dynamically?
  // Always prefer dynamic rendering if we have layout and photos (staticImageUrl might be buggy)
  const shouldRenderDynamic = layout && photos.length > 0

  return (
    <div
      onClick={handleClick}
      className={`relative cursor-pointer group rounded-lg overflow-hidden border-2 transition ${
        isSelected
          ? 'border-purple-500 ring-2 ring-purple-500/50'
          : 'border-purple-500/30 hover:border-purple-500'
      } ${className}`}
    >
      {/* Collage Image */}
      <div className="aspect-[4/5] bg-gray-900">
        {shouldRenderDynamic ? (
          // Dynamic grid rendering (preferred - always use when we have layout/photos)
          <div
            className="w-full h-full"
            style={{
              display: 'grid',
              gridTemplateRows: layout.grid.rows,
              gridTemplateColumns: layout.grid.cols,
              gap: `${layout.gap}px`,
            }}
          >
            {photos.map((photo, index) => {
              const slot = layout.slots?.[index]
              return (
                <div
                  key={photo.id || index}
                  style={{
                    gridColumn: slot ? `${slot.col} / span ${slot.colSpan}` : 'auto',
                    gridRow: slot ? `${slot.row} / span ${slot.rowSpan}` : 'auto',
                    overflow: 'hidden',
                    background: '#000',
                  }}
                >
                  <img
                    src={photo.thumbnailUrl || photo.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
              )
            })}
          </div>
        ) : thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={collage.title || 'Collage'}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            <LayoutGrid className="w-12 h-12 opacity-30" />
          </div>
        )}
      </div>

      {/* Selection Checkbox (Edit Mode) */}
      {editMode && (
        <div className="absolute top-2 right-2 z-10">
          <div className={`w-6 h-6 rounded border-2 flex items-center justify-center transition ${
            isSelected
              ? 'bg-purple-600 border-purple-600'
              : 'bg-black/60 border-white/60'
          }`}>
            {isSelected && (
              <Check className="w-4 h-4 text-white" />
            )}
          </div>
        </div>
      )}

      {/* Collage Badge */}
      {!editMode && (
        <div className="absolute top-2 left-2 px-2 py-1 bg-purple-600 rounded-md flex items-center gap-1 shadow-lg">
          <LayoutGrid className="w-3 h-3" />
          <span className="text-xs font-semibold">Collage</span>
        </div>
      )}

      {/* Title (hover) */}
      {!editMode && collage.title && (
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition">
          <p className="text-sm font-medium truncate">{collage.title}</p>
        </div>
      )}

      {/* Photo count indicator */}
      {!editMode && photoCount > 0 && (
        <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 rounded-md text-xs shadow-lg">
          {photoCount} {photoCount === 1 ? 'photo' : 'photos'}
        </div>
      )}

      {/* Selected overlay */}
      {isSelected && (
        <div className="absolute inset-0 bg-purple-600/20 border-2 border-purple-600 rounded-lg pointer-events-none" />
      )}
    </div>
  )
}

export default CollageCard
