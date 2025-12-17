/**
 * Timeline Feature - Phase 3: "On This Day" Widget
 *
 * OnThisDayWidget Component - Shows memories from previous years
 */

import React, { useMemo } from 'react'
import { Calendar, Cake } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getPhotosOnThisDay } from '../utils/dateGrouping'

const OnThisDayWidget = ({ photos, onPhotoClick, referenceDate = new Date() }) => {
  const { t } = useTranslation(['timeline'])
  // Get memories from same day in previous years
  const memories = useMemo(() => {
    if (!photos || photos.length === 0) {
      return []
    }

    const memoriesFromPastYears = getPhotosOnThisDay(photos, referenceDate)
    console.log(`🎂 OnThisDay: Found ${memoriesFromPastYears.length} memories`)

    return memoriesFromPastYears
  }, [photos, referenceDate])

  // Don't render if no memories
  if (memories.length === 0) {
    return null
  }

  // Get today's date formatted
  const today = new Date(referenceDate)
  const dayMonth = today.toLocaleDateString('nb-NO', { day: 'numeric', month: 'long' })

  return (
    <div className="on-this-day-widget glass-card p-6 rounded-2xl mb-8 border border-purple-500/20">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-3 bg-purple-600/20 rounded-xl">
          <Cake className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold flex items-center gap-2">
            {t('timeline:onThisDay.title')}
          </h3>
          <p className="text-sm text-gray-400">
            {t('timeline:onThisDay.description', { date: dayMonth })}
          </p>
        </div>
      </div>

      {/* Memories Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {memories.slice(0, 8).map((photo) => (
          <div
            key={photo.id}
            onClick={() => onPhotoClick && onPhotoClick(photo)}
            className="relative aspect-square rounded-xl overflow-hidden bg-gray-800 cursor-pointer group"
          >
            {/* Photo */}
            <img
              src={photo.thumbnailUrl || photo.url}
              alt={photo.name || 'Memory'}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-100 group-hover:opacity-90 transition-opacity text-on-glass" />

            {/* Year Badge */}
            <div className="absolute bottom-0 left-0 right-0 p-3 text-on-glass">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold">
                    {t('timeline:onThisDay.yearsAgo', { count: photo.yearsAgo })}
                  </p>
                  <p className="text-xs opacity-70">
                    {new Date(photo.createdAt?.toDate ? photo.createdAt.toDate() : photo.createdAt).getFullYear()}
                  </p>
                </div>
                <Calendar className="w-4 h-4 text-purple-400" />
              </div>
            </div>

            {/* Video Badge */}
            {photo.type === 'video' && (
              <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm px-2 py-1 rounded-lg text-on-glass">
                <span className="text-xs">🎥</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Show More Indicator */}
      {memories.length > 8 && (
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-400">
            +{memories.length - 8} {t('timeline:onThisDay.more')} {memories.length - 8 === 1 ? t('timeline:onThisDay.memory') : t('timeline:onThisDay.memory_plural')}
          </p>
        </div>
      )}
    </div>
  )
}

export default OnThisDayWidget
