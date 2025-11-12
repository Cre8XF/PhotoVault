/**
 * Timeline Feature - Phase 2: Timeline UI
 *
 * TimelineView Component - Main timeline view with date grouping
 */

import React, { useMemo, useState } from 'react'
import { groupPhotosByDate, groupPhotosByMonth, groupPhotosByYear } from '../utils/dateGrouping'
import DateSection from './DateSection'
import TimelineNavigation from './TimelineNavigation'

const TimelineView = ({ photos, onPhotoClick }) => {
  const [groupBy, setGroupBy] = useState('day') // 'day' | 'month' | 'year'

  // Group photos based on selected view
  const groups = useMemo(() => {
    console.log(`📊 Timeline: Grouping ${photos?.length || 0} photos by ${groupBy}`)

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

  console.log(`✅ Timeline: Created ${groups.length} ${groupBy} groups`)

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
            <h2 className="text-2xl font-bold mb-2">Ingen bilder å vise</h2>
            <p className="text-gray-400">
              Last opp bilder for å se dem organisert i tidslinjen
            </p>
          </div>
        ) : (
          // Timeline sections
          <div className="space-y-8">
            {groups.map((group, index) => (
              <DateSection
                key={group.dateKey || index}
                date={group.displayDate}
                photos={group.photos}
                onPhotoClick={onPhotoClick}
              />
            ))}
          </div>
        )}

        {/* Stats Footer */}
        {groups.length > 0 && (
          <div className="mt-12 text-center text-gray-500 text-sm pb-8">
            Viser {photos.length} {photos.length === 1 ? 'bilde' : 'bilder'} i {groups.length} {
              groupBy === 'day' ? 'dager' :
              groupBy === 'month' ? 'måneder' :
              'år'
            }
          </div>
        )}
      </div>
    </div>
  )
}

export default TimelineView
