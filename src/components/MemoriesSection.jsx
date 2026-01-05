/**
 * SMART ORGANIZATION: Memories Section Component
 *
 * Displays rule-based memories at the top of Photos page
 * NO AI - purely deterministic memory detection
 * Uses dateTaken (not upload date) - excludes Documents
 */

import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar } from 'lucide-react'
import { getMemories } from '../features/timeline/utils/dateGrouping'
import LazyImage from './LazyImage'

const MemoriesSection = ({ photos, onPhotoClick }) => {
  const { t } = useTranslation(['timeline'])

  // Calculate memories using priority-based logic
  // EXCLUDE DOCUMENTS - only photos and videos
  const memory = useMemo(() => {
    if (!photos || photos.length === 0) {
      return null
    }

    // Filter out documents before passing to getMemories
    const mediaPhotos = photos.filter(p => p.type !== 'document')

    if (mediaPhotos.length === 0) {
      return null
    }

    const today = new Date()
    return getMemories(mediaPhotos, today)
  }, [photos])

  // Generate title and subtitle from structured data
  const getMemoryText = (memory) => {
    if (!memory) return { title: '', subtitle: '' }

    const monthName = t(`timeline:monthsCapitalized.${memory.monthIndex}`)

    switch (memory.type) {
      case 'on-this-day':
        return {
          title: t('timeline:memories.onThisDay.title', { day: memory.day, month: monthName }),
          subtitle: memory.yearsAgo
            ? t('timeline:memories.onThisDay.subtitle_single', { yearsAgo: memory.yearsAgo })
            : t('timeline:memories.onThisDay.subtitle_multiple', { count: memory.count })
        }

      case 'same-month':
        return {
          title: t('timeline:memories.sameMonth.title', { month: monthName }),
          subtitle: memory.count === 1
            ? t('timeline:memories.sameMonth.subtitle_single', { count: memory.count })
            : t('timeline:memories.sameMonth.subtitle_multiple', { count: memory.count })
        }

      case 'last-year':
        return {
          title: t('timeline:memories.lastYear.title', { year: memory.year }),
          subtitle: memory.hasFavorites
            ? t('timeline:memories.lastYear.subtitle_favorites')
            : t('timeline:memories.lastYear.subtitle_recent')
        }

      default:
        return { title: '', subtitle: '' }
    }
  }

  // Don't render if no memories
  if (!memory || !memory.photos || memory.photos.length === 0) {
    return null
  }

  const { title, subtitle } = getMemoryText(memory)

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
            <h3 className="text-lg font-bold">{title}</h3>
            <p className="text-sm text-muted">{subtitle}</p>
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
                  {t('timeline:yearBadge', { yearsAgo: photo.yearsAgo })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Show count if more photos available */}
        {memory.count > displayPhotos.length && (
          <p className="text-xs text-muted mt-2 text-center">
            {t('timeline:memories.morePhotos', { count: memory.count - displayPhotos.length })}
          </p>
        )}
      </div>
    </div>
  )
}

export default MemoriesSection
