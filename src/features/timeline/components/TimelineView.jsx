/**
 * Timeline Feature - Phase 2, 3 & 4: Timeline UI with Navigation
 *
 * TimelineView Component - Main timeline view with date grouping and jump-to-date
 */

import React, { useMemo, useState, useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { groupPhotosByDate, groupPhotosByMonth, groupPhotosByYear, getAvailableYears } from '../utils/dateGrouping'
import DateSection from './DateSection'
import TimelineNavigation from './TimelineNavigation'
import OnThisDayWidget from './OnThisDayWidget'
import JumpToDatePicker from './JumpToDatePicker'

const TimelineView = ({ photos, onPhotoClick }) => {
  const { t } = useTranslation(['timeline'])
  const [groupBy, setGroupBy] = useState('day') // 'day' | 'month' | 'year'
  const [showDatePicker, setShowDatePicker] = useState(false)
  const sectionRefs = useRef({})

  // Group photos based on selected view
  const groups = useMemo(() => {
    if (import.meta.env.DEV) console.log(`📊 Timeline: Grouping ${photos?.length || 0} photos by ${groupBy}`)

    if (!photos || photos.length === 0) {
      return []
    }

    if (groupBy === 'day') {
      return groupPhotosByDate(photos)
    } else if (groupBy === 'month') {
      return groupPhotosByMonth(photos)
    } else {
      return groupPhotosByYear(photos)
    }
  }, [photos, groupBy])

  if (import.meta.env.DEV) console.log(`✅ Timeline: Created ${groups.length} ${groupBy} groups`)

  // Get available years for date picker
  const availableYears = useMemo(() => {
    return getAvailableYears(photos || [])
  }, [photos])

  // Handle jump to date
  const handleJumpToDate = useCallback((selectedDate) => {
    if (import.meta.env.DEV) console.log('🎯 Jumping to date:', selectedDate)

    // Find the closest group to scroll to
    let targetKey = null

    if (groupBy === 'day') {
      // Format as YYYY-MM-DD
      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
      const day = String(selectedDate.getDate()).padStart(2, '0')
      targetKey = `${year}-${month}-${day}`
    } else if (groupBy === 'month') {
      // Format as YYYY-MM
      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
      targetKey = `${year}-${month}`
    } else {
      // Year view
      targetKey = String(selectedDate.getFullYear())
    }

    if (import.meta.env.DEV) console.log('🔍 Looking for section with key:', targetKey)

    // Try exact match first
    if (sectionRefs.current[targetKey]) {
      if (import.meta.env.DEV) console.log('✅ Found exact match, scrolling...')
      sectionRefs.current[targetKey].scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
      return
    }

    // If no exact match, find closest earlier date
    const sortedKeys = Object.keys(sectionRefs.current).sort().reverse()
    const closestKey = sortedKeys.find(key => key <= targetKey)

    if (closestKey && sectionRefs.current[closestKey]) {
      if (import.meta.env.DEV) console.log('✅ Found closest match:', closestKey, '- scrolling...')
      sectionRefs.current[closestKey].scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    } else {
      if (import.meta.env.DEV) console.warn('⚠️ No matching section found for:', targetKey)
    }
  }, [groupBy])

  return (
    <div className="timeline-view min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Navigation */}
      <TimelineNavigation
        currentView={groupBy}
        onViewChange={setGroupBy}
        totalPhotos={photos?.length || 0}
      />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {groups.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-6xl mb-4">📅</div>
            <h2 className="text-2xl font-bold mb-2">{t('timeline:emptyState.title')}</h2>
            <p className="text-gray-400">
              {t('timeline:emptyState.description')}
            </p>
          </div>
        ) : (
          <>
            {/* On This Day Widget */}
            <OnThisDayWidget
              photos={photos}
              onPhotoClick={onPhotoClick}
            />

            {/* Jump to Date Picker */}
            <JumpToDatePicker
              onDateSelect={handleJumpToDate}
              availableYears={availableYears}
            />

            {/* Timeline sections */}
            <div className="space-y-8">
              {groups.map((group, index) => (
                <div
                  key={group.dateKey || index}
                  ref={(el) => {
                    if (el && group.dateKey) {
                      sectionRefs.current[group.dateKey] = el
                    }
                  }}
                >
                  <DateSection
                    date={group.displayDate}
                    photos={group.photos}
                    onPhotoClick={onPhotoClick}
                  />
                </div>
              ))}
            </div>
          </>
        )}

        {/* Stats Footer */}
        {groups.length > 0 && (
          <div className="mt-12 text-center text-gray-500 text-sm pb-8">
            {t('timeline:stats.showing')} {photos.length} {photos.length === 1 ? t('timeline:stats.photo') : t('timeline:stats.photo_plural')} {t('timeline:stats.in')} {groups.length} {
              groupBy === 'day' ? (groups.length === 1 ? t('timeline:stats.day') : t('timeline:stats.day_plural')) :
              groupBy === 'month' ? (groups.length === 1 ? t('timeline:stats.month') : t('timeline:stats.month_plural')) :
              (groups.length === 1 ? t('timeline:stats.year') : t('timeline:stats.year_plural'))
            }
          </div>
        )}
      </div>
    </div>
  )
}

export default TimelineView
