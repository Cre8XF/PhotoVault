/**
 * SMART ORGANIZATION: Smart Views Component
 *
 * Quick Views with filter groups - canonical filter system
 * Groups: Media Type, Time, Album Status, Favorites
 * Rule: Only one active per group (except Favorites which can combine)
 */

import React, { useMemo } from 'react'
import { Star, Image, Video, LayoutGrid, FolderX, Calendar, Clock } from 'lucide-react'
import { resolvePhotoDate } from '../utils/photoDateUtils'

const SmartViews = ({ photos, activeFilters, onFilterChange }) => {
  // Calculate counts for each smart view
  const counts = useMemo(() => {
    if (!photos || photos.length === 0) {
      return {
        favorites: 0,
        photos: 0,
        videos: 0,
        collages: 0,
        withoutAlbum: 0,
        thisYear: 0,
        lastYear: 0,
      }
    }

    const now = new Date()
    const currentYear = now.getFullYear()
    const lastYear = currentYear - 1

    // EXCLUDE DOCUMENTS from all counts
    const mediaPhotos = photos.filter(p => p.type !== 'document')

    return {
      favorites: mediaPhotos.filter(p => p.favorite).length,
      photos: mediaPhotos.filter(p => p.type === 'photo').length,
      videos: mediaPhotos.filter(p => p.type === 'video').length,
      collages: mediaPhotos.filter(p => p.contentType === 'collage').length,
      withoutAlbum: mediaPhotos.filter(p => !p.albumId || p.albumId === '').length,
      thisYear: mediaPhotos.filter(p => {
        // Use dateTaken (not upload date)
        const photoDate = resolvePhotoDate(p)
        if (!photoDate) return false
        return new Date(photoDate).getFullYear() === currentYear
      }).length,
      lastYear: mediaPhotos.filter(p => {
        // Use dateTaken (not upload date)
        const photoDate = resolvePhotoDate(p)
        if (!photoDate) return false
        return new Date(photoDate).getFullYear() === lastYear
      }).length,
    }
  }, [photos])

  // Filter group definitions
  const filterGroups = [
    {
      id: 'favorites',
      label: 'Favorites',
      icon: Star,
      count: counts.favorites,
      color: 'from-yellow-600 to-amber-600',
      group: 'favorites', // Special: can combine with other groups
      filterKey: 'favorites',
      filterValue: true,
      isActive: activeFilters.favorites === true,
    },
    {
      id: 'photos',
      label: 'Photos',
      icon: Image,
      count: counts.photos,
      color: 'from-blue-600 to-cyan-600',
      group: 'mediaType',
      filterKey: 'contentTypes',
      filterValue: ['photo'],
      isActive:
        activeFilters.contentTypes?.length === 1 &&
        activeFilters.contentTypes[0] === 'photo',
    },
    {
      id: 'videos',
      label: 'Videos',
      icon: Video,
      count: counts.videos,
      color: 'from-purple-600 to-indigo-600',
      group: 'mediaType',
      filterKey: 'contentTypes',
      filterValue: ['video'],
      isActive:
        activeFilters.contentTypes?.length === 1 &&
        activeFilters.contentTypes[0] === 'video',
    },
    {
      id: 'collages',
      label: 'Collages',
      icon: LayoutGrid,
      count: counts.collages,
      color: 'from-emerald-600 to-teal-600',
      group: 'mediaType',
      filterKey: 'contentTypes',
      filterValue: ['collage'],
      isActive:
        activeFilters.contentTypes?.length === 1 &&
        activeFilters.contentTypes[0] === 'collage',
    },
    {
      id: 'this-year',
      label: 'This Year',
      icon: Calendar,
      count: counts.thisYear,
      color: 'from-indigo-600 to-blue-600',
      group: 'time',
      filterKey: 'dateRange',
      filterValue: 'year',
      isActive: activeFilters.dateRange === 'year',
    },
    {
      id: 'last-year',
      label: 'Last Year',
      icon: Clock,
      count: counts.lastYear,
      color: 'from-cyan-600 to-sky-600',
      group: 'time',
      filterKey: 'dateRange',
      filterValue: 'lastyear',
      isActive: activeFilters.dateRange === 'lastyear',
    },
    {
      id: 'without-album',
      label: 'Without Album',
      icon: FolderX,
      count: counts.withoutAlbum,
      color: 'from-orange-600 to-red-600',
      group: 'albumStatus',
      filterKey: 'albumId',
      filterValue: 'noAlbum',
      isActive: activeFilters.albumId === 'noAlbum',
    },
  ]

  const handleViewClick = (view) => {
    if (view.isActive) {
      // Toggle off: clear this filter
      onFilterChange({ [view.filterKey]: null })
    } else {
      // Toggle on: set this filter
      onFilterChange({ [view.filterKey]: view.filterValue })
    }
  }

  return (
    <div className="mb-4">
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory scrollbar-hide">
        {filterGroups.map((view) => (
          <button
            key={view.id}
            onClick={() => handleViewClick(view)}
            className={`flex-shrink-0 snap-start px-3 py-2 rounded-xl border-2 transition-all flex items-center gap-2 font-medium text-sm ${
              view.isActive
                ? `bg-gradient-to-r ${view.color} border-transparent scale-105 shadow-lg`
                : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30'
            }`}
            disabled={view.count === 0}
            style={{ opacity: view.count === 0 ? 0.5 : 1 }}
          >
            <view.icon size={16} />
            <span className="whitespace-nowrap">{view.label}</span>
            <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${
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
