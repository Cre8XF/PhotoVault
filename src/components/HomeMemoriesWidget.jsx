import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar, Cake, ArrowRight } from 'lucide-react'
import { getPhotosOnThisDay } from '../features/timeline/utils/dateGrouping'
import LazyImage from './LazyImage'

const HomeMemoriesWidget = ({ photos, onPhotoClick, onViewAll }) => {
  const { t } = useTranslation(['home'])

  // Calculate memories from same day in previous years
  const memories = useMemo(() => {
    if (!photos || photos.length === 0) {
      console.log('📸 HomeMemoriesWidget: No photos provided')
      return []
    }

    const today = new Date()
    const memoriesFromPastYears = getPhotosOnThisDay(photos, today)

    console.log(`🎂 HomeMemoriesWidget: Found ${memoriesFromPastYears.length} memories`)

    return memoriesFromPastYears
  }, [photos])

  // Don't render if no memories
  if (memories.length === 0) {
    return null
  }

  // Format today's date
  const today = new Date()
  const dayMonth = today.toLocaleDateString('nb-NO', {
    day: 'numeric',
    month: 'long'
  })

  // Show max 4 photos in grid, rest can be accessed via "View All"
  const displayMemories = memories.slice(0, 4)
  const hasMore = memories.length > 4

  return (
    <div className="memories-widget animate-glow">
      {/* Header */}
      <div className="memories-header">
        <div className="memories-icon-wrapper">
          <Cake className="memories-icon" />
        </div>
        <div className="memories-title-group">
          <h3 className="memories-title">
            {t('home:memories.title')}
          </h3>
          <p className="memories-subtitle">
            {t('home:memories.description', { date: dayMonth })}
          </p>
        </div>
      </div>

      {/* Memories Grid */}
      <div className="memories-grid">
        {displayMemories.map((photo, index) => (
          <div
            key={photo.id}
            className="memory-photo-wrapper"
            onClick={() => onPhotoClick && onPhotoClick(photo, memories)}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <LazyImage
              src={photo.thumbnailUrl || photo.url}
              alt={photo.filename || 'Memory'}
              className="memory-photo"
            />
            {/* Year badge */}
            <div className="memory-year-badge">
              {photo.yearsAgo === 1
                ? t('home:memories.yearsAgo', { count: 1 })
                : t('home:memories.yearsAgo_plural', { count: photo.yearsAgo })
              }
            </div>
          </div>
        ))}
      </div>

      {/* View All Button */}
      {(hasMore || onViewAll) && (
        <button
          onClick={onViewAll}
          className="memories-view-all ripple-effect"
        >
          <span>
            {hasMore
              ? t('home:memories.viewAllWithCount', { count: memories.length })
              : t('home:memories.viewAll')
            }
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

export default HomeMemoriesWidget
