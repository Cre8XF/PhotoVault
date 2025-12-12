import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePhotoData } from '../hooks/usePhotoData'
import {
  Image,
  Folder,
  Sparkles,
  Heart,
  Clock,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

const ActivityFeed = () => {
  const { t } = useTranslation()
  const { photos, albums } = usePhotoData()
  const [activities, setActivities] = useState([])
  const [isExpanded, setIsExpanded] = useState(false) // Start collapsed

  // Helper function to safely convert various date formats to Date object
  const toDate = (dateValue) => {
    if (!dateValue) return new Date(0)

    // Already a Date object
    if (dateValue instanceof Date) return dateValue

    // Firestore Timestamp with toDate method
    if (dateValue.toDate && typeof dateValue.toDate === 'function') {
      return dateValue.toDate()
    }

    // Unix timestamp (number)
    if (typeof dateValue === 'number') return new Date(dateValue)

    // String date
    if (typeof dateValue === 'string') return new Date(dateValue)

    // Fallback
    return new Date(0)
  }

  useEffect(() => {
    // Generate activity items from photos and albums
    const items = []

    // Recent photos (last 5)
    const recentPhotos = [...photos]
      .sort((a, b) => {
        const dateA = toDate(a.uploadedAt)
        const dateB = toDate(b.uploadedAt)
        return dateB - dateA
      })
      .slice(0, 5)

    recentPhotos.forEach(photo => {
      items.push({
        id: photo.id,
        type: 'photo',
        timestamp: toDate(photo.uploadedAt),
        data: photo
      })
    })

    // Recent albums (last 3)
    const recentAlbums = [...albums]
      .sort((a, b) => {
        const dateA = toDate(a.createdAt)
        const dateB = toDate(b.createdAt)
        return dateB - dateA
      })
      .slice(0, 3)

    recentAlbums.forEach(album => {
      items.push({
        id: album.id,
        type: 'album',
        timestamp: toDate(album.createdAt),
        data: album
      })
    })

    // Recent favorites (last 3)
    const recentFavorites = photos
      .filter(p => p.favorite)
      .sort((a, b) => {
        const dateA = toDate(a.updatedAt)
        const dateB = toDate(b.updatedAt)
        return dateB - dateA
      })
      .slice(0, 3)

    recentFavorites.forEach(photo => {
      items.push({
        id: `fav-${photo.id}`,
        type: 'favorite',
        timestamp: toDate(photo.updatedAt),
        data: photo
      })
    })

    // Sort all by timestamp
    items.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))

    setActivities(items.slice(0, 10))
  }, [photos, albums])

  const getRelativeTime = (date) => {
    if (!date) return ''

    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return t('activity:justNow')
    if (diffMins < 60) return t('activity:minutesAgo', { count: diffMins })
    if (diffHours < 24) return t('activity:hoursAgo', { count: diffHours })
    if (diffDays < 7) return t('activity:daysAgo', { count: diffDays })
    return date.toLocaleDateString('no-NO')
  }

  const getActivityConfig = (type) => {
    const configs = {
      photo: {
        icon: Image,
        color: 'text-blue-600 dark:text-blue-400',
        bgColor: 'bg-blue-100 dark:bg-blue-900/30',
        label: (data) => t('activity:photoUploaded', { name: data.filename || t('common:photo') })
      },
      album: {
        icon: Folder,
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-100 dark:bg-purple-900/30',
        label: (data) => t('activity:albumCreated', { name: data.name })
      },
      favorite: {
        icon: Heart,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        label: (data) => t('activity:addedToFavorites')
      }
    }
    return configs[type]
  }

  if (activities.length === 0) {
    return null
  }

  // Show only first 3 when collapsed
  const displayedActivities = isExpanded ? activities : activities.slice(0, 3)

  return (
    <div className="activity-feed glass card-premium rounded-2xl mb-6 overflow-hidden">
      {/* Header - Always visible, clickable to expand/collapse */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-6 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('activity:recentActivity')}
          </h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            ({activities.length})
          </span>
        </div>

        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {/* Activity list - Only shown when expanded */}
      {isExpanded && (
        <div className="px-6 pb-6 space-y-3 animate-slide-up">
          {displayedActivities.map(activity => {
            const config = getActivityConfig(activity.type)
            if (!config) return null

            const Icon = config.icon

            return (
              <div
                key={activity.id}
                className="activity-item flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${config.color}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {config.label(activity.data)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {getRelativeTime(activity.timestamp)}
                  </p>
                </div>

                {activity.type === 'photo' && activity.data.url && (
                  <img
                    src={activity.data.url}
                    alt=""
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Collapsed preview - Show when NOT expanded */}
      {!isExpanded && displayedActivities.length > 0 && (
        <div className="px-6 pb-6">
          <div className="flex items-center gap-2 overflow-x-auto">
            {displayedActivities.slice(0, 3).map(activity => {
              const config = getActivityConfig(activity.type)
              if (!config) return null
              const Icon = config.icon

              return (
                <div
                  key={activity.id}
                  className={`flex-shrink-0 w-12 h-12 rounded-full ${config.bgColor} flex items-center justify-center`}
                >
                  {activity.type === 'photo' && activity.data.url ? (
                    <img
                      src={activity.data.url}
                      alt=""
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <Icon className={`w-6 h-6 ${config.color}`} />
                  )}
                </div>
              )
            })}

            {activities.length > 3 && (
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                  +{activities.length - 3}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ActivityFeed
