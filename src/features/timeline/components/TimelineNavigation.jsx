/**
 * Timeline Feature - Phase 2: Timeline UI
 *
 * TimelineNavigation Component - Toggle between day/month/year view
 */

import React from 'react'
import { Calendar, CalendarDays, CalendarRange } from 'lucide-react'

const TimelineNavigation = ({ currentView, onViewChange, totalPhotos }) => {
  const views = [
    { id: 'day', label: 'Dag', icon: Calendar },
    { id: 'month', label: 'Måned', icon: CalendarDays },
    { id: 'year', label: 'År', icon: CalendarRange }
  ]

  return (
    <div className="timeline-navigation bg-gray-900/80 backdrop-blur-sm border-b border-white/10 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Title */}
          <div>
            <h1 className="text-xl font-bold">Tidslinje</h1>
            <p className="text-sm text-gray-400">
              {totalPhotos} {totalPhotos === 1 ? 'bilde' : 'bilder'}
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2 bg-gray-800/50 rounded-xl p-1">
            {views.map(view => {
              const Icon = view.icon
              const isActive = currentView === view.id

              return (
                <button
                  key={view.id}
                  onClick={() => onViewChange(view.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
                    isActive
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium hidden sm:inline">{view.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TimelineNavigation
