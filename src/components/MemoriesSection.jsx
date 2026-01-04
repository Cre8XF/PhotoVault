/**
 * SMART ORGANIZATION: Memories Section Component
 *
 * Displays rule-based memories at the top of Photos page
 * NO AI - purely deterministic memory detection
 */

import React, { useMemo } from 'react'
import { Calendar } from 'lucide-react'
import { getMemories } from '../features/timeline/utils/dateGrouping'
import LazyImage from './LazyImage'

const MemoriesSection = ({ photos, onPhotoClick }) => {
  // Calculate memories using priority-based logic
  const memory = useMemo(() => {
    if (!photos || photos.length === 0) {
      return null
    }

    const today = new Date()
    return getMemories(photos, today)
  }, [photos])

  // Don't render if no memories
  if (!memory || !memory.photos || memory.photos.length === 0) {
    return null
  }

  // Show max 6 photos in compact grid
  const displayPhotos = memory.photos.slice(0, 6)

  return (
    <div className="mb-6">
      <div className="glass rounded-2xl p-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold">{memory.title}</h3>
            <p className="text-sm text-muted">{memory.subtitle}</p>
          </div>
        </div>

        {/* Memories Grid - Compact horizontal scroll */}
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory">
          {displayPhotos.map((photo, index) => (
            <div
              key={photo.id}
              className="flex-shrink-0 w-32 h-32 relative group cursor-pointer snap-start rounded-lg overflow-hidden"
              onClick={() => onPhotoClick && onPhotoClick(photo, memory.photos)}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <LazyImage
                src={photo.type === 'video' ? (photo.thumbnailUrl || photo.url) : photo.url}
                thumbnail={photo.thumbnailSmall}
                photoId={photo.id}
                alt={photo.name || 'Memory'}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              {/* Year badge for "on this day" memories */}
              {memory.type === 'on-this-day' && photo.yearsAgo && (
                <div className="absolute bottom-1 left-1 right-1 bg-black/80 text-white text-xs py-0.5 px-1 rounded text-center font-medium">
                  {photo.yearsAgo} år siden
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Show count if more photos available */}
        {memory.count > displayPhotos.length && (
          <p className="text-xs text-muted mt-2 text-center">
            +{memory.count - displayPhotos.length} flere
          </p>
        )}
      </div>
    </div>
  )
}

export default MemoriesSection
