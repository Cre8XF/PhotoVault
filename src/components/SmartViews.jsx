/**
 * SMART ORGANIZATION: Smart Views Component
 *
 * Quick access to preconfigured filters (NOT new pages)
 * Reuses existing SearchPage filtering logic
 */

import React, { useMemo } from 'react'
import { Star, Video, FolderX, Calendar, Clock } from 'lucide-react'

const SmartViews = ({ photos, activeFilters, onFilterChange }) => {
  // Calculate counts for each smart view
  const counts = useMemo(() => {
    if (!photos || photos.length === 0) {
      return {
        favorites: 0,
        videos: 0,
        withoutAlbum: 0,
        thisYear: 0,
        lastYear: 0,
      }
    }

    const now = new Date()
    const currentYear = now.getFullYear()
    const lastYear = currentYear - 1

    // Exclude documents from counts
    const mediaPhotos = photos.filter(p => p.type !== 'document')

    return {
      favorites: mediaPhotos.filter(p => p.favorite).length,
      videos: mediaPhotos.filter(p => p.type === 'video').length,
      withoutAlbum: mediaPhotos.filter(p => !p.albumId || p.albumId === '').length,
      thisYear: mediaPhotos.filter(p => {
        const photoDate = new Date(p.createdAt || p.uploadedAt || 0)
        return photoDate.getFullYear() === currentYear
      }).length,
      lastYear: mediaPhotos.filter(p => {
        const photoDate = new Date(p.createdAt || p.uploadedAt || 0)
        return photoDate.getFullYear() === lastYear
      }).length,
    }
  }, [photos])

  // Smart view definitions
  const smartViews = [
    {
      id: 'favorites',
      label: 'Favorites',
      icon: Star,
      count: counts.favorites,
      color: 'from-yellow-600 to-amber-600',
      filter: { favorites: true },
      isActive: activeFilters.favorites,
    },
    {
      id: 'videos',
      label: 'Videos',
      icon: Video,
      count: counts.videos,
      color: 'from-purple-600 to-indigo-600',
      filter: { contentTypes: ['video'] },
      isActive: activeFilters.contentTypes &&
                activeFilters.contentTypes.length === 1 &&
                activeFilters.contentTypes[0] === 'video',
    },
    {
      id: 'without-album',
      label: 'Without Album',
      icon: FolderX,
      count: counts.withoutAlbum,
      color: 'from-orange-600 to-red-600',
      filter: { albumId: 'noAlbum' },
      isActive: activeFilters.albumId === 'noAlbum',
    },
    {
      id: 'this-year',
      label: 'This Year',
      icon: Calendar,
      count: counts.thisYear,
      color: 'from-blue-600 to-cyan-600',
      filter: { dateRange: 'year' },
      isActive: activeFilters.dateRange === 'year',
    },
    {
      id: 'last-year',
      label: 'Last Year',
      icon: Clock,
      count: counts.lastYear,
      color: 'from-teal-600 to-emerald-600',
      filter: { dateRange: 'lastyear' },
      isActive: activeFilters.dateRange === 'lastyear',
    },
  ]

  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-muted mb-2 px-1">Quick Views</h3>
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory">
        {smartViews.map((view) => (
          <button
            key={view.id}
            onClick={() => onFilterChange(view.filter)}
            className={`flex-shrink-0 snap-start px-4 py-2 rounded-xl border-2 transition-all flex items-center gap-2 font-medium text-sm ${
              view.isActive
                ? `bg-gradient-to-r ${view.color} border-transparent scale-105 shadow-lg`
                : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30'
            }`}
            disabled={view.count === 0}
            style={{ opacity: view.count === 0 ? 0.5 : 1 }}
          >
            <view.icon size={16} />
            <span className="whitespace-nowrap">{view.label}</span>
            <span className={`px-1.5 py-0.5 rounded text-xs ${
              view.isActive ? 'bg-white/30' : 'bg-white/10'
            }`}>
              {view.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}

export default SmartViews
