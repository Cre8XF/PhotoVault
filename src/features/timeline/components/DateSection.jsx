/**
 * Timeline Feature - Phase 2: Timeline UI
 *
 * DateSection Component - Displays photos grouped by a specific date
 */

import React from 'react'
import { Calendar } from 'lucide-react'

const DateSection = ({ date, photos, onPhotoClick }) => {
  if (!photos || photos.length === 0) {
    return null
  }

  return (
    <div className="date-section mb-8">
      {/* Date Header */}
      <div className="flex items-center gap-3 mb-4 sticky top-0 bg-gradient-to-b from-gray-900 via-gray-900 to-transparent pb-2 z-10">
        <Calendar className="w-5 h-5 text-purple-400" />
        <div>
          <h2 className="text-xl font-bold">{date}</h2>
          <p className="text-sm text-gray-400">{photos.length} {photos.length === 1 ? 'bilde' : 'bilder'}</p>
        </div>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
        {photos.map((photo) => (
          <div
            key={photo.id}
            onClick={() => onPhotoClick && onPhotoClick(photo)}
            className="relative aspect-square rounded-lg overflow-hidden bg-gray-800 cursor-pointer group"
          >
            {/* Photo */}
            <img
              src={photo.thumbnailUrl || photo.url}
              alt={photo.name || 'Photo'}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />

            {/* Video Badge */}
            {photo.type === 'video' && (
              <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg">
                <span className="text-xs">🎥</span>
              </div>
            )}

            {/* Favorite Badge */}
            {photo.isFavorite && (
              <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg">
                <span className="text-xs">⭐</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default DateSection
