import React from 'react'
import { LayoutGrid } from 'lucide-react'

/**
 * CollageCard Component
 * Displays a collage thumbnail in the photo grid (2x1 size)
 *
 * @param {Object} collage - Collage object from Firestore
 * @param {Function} onClick - Click handler
 * @param {String} className - Additional CSS classes
 */
const CollageCard = ({ collage, onClick, className = '' }) => {
  // Use staticImageUrl (rendered JPEG) or fallback to imageUrl/url/thumbnailUrl
  const thumbnailUrl = collage.staticImageUrl || collage.imageUrl || collage.url || collage.thumbnailUrl

  // Count photos in collage
  const photoCount = collage.slots?.filter(s => s.photo).length ||
                     collage.photoIds?.length ||
                     0

  return (
    <div
      onClick={onClick}
      className={`relative cursor-pointer group rounded-lg overflow-hidden border-2 border-purple-500/30 hover:border-purple-500 transition ${className}`}
    >
      {/* Collage Image */}
      <div className="aspect-[4/5] bg-gray-900">
        {thumbnailUrl ? (
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

      {/* Collage Badge */}
      <div className="absolute top-2 left-2 px-2 py-1 bg-purple-600 rounded-md flex items-center gap-1 shadow-lg">
        <LayoutGrid className="w-3 h-3" />
        <span className="text-xs font-semibold">Collage</span>
      </div>

      {/* Title (optional, on hover) */}
      {collage.title && (
        <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition">
          <p className="text-sm font-medium truncate">{collage.title}</p>
        </div>
      )}

      {/* Photo count indicator */}
      {photoCount > 0 && (
        <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 rounded-md text-xs shadow-lg">
          {photoCount} {photoCount === 1 ? 'photo' : 'photos'}
        </div>
      )}
    </div>
  )
}

export default CollageCard
