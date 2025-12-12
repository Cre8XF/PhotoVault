import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { usePhotoData } from '../hooks/usePhotoData'
import { Image, Folder, Heart, Clock } from 'lucide-react'

const ActivityFeed = () => {
  const { t } = useTranslation()
  const { photos, albums } = usePhotoData()

  const [activities, setActivities] = useState([])
  const [open, setOpen] = useState(true)

  // Collapse som default på mobil
  useEffect(() => {
    if (window.innerWidth < 768) {
      setOpen(false)
    }
  }, [])

  // Helper function to safely convert various date formats to Date object
  const toDate = (dateValue) => {
    if (!dateValue) return new Date(0)

    if (dateValue instanceof Date) return dateValue
    if (dateValue.toDate && typeof dateValue.toDate === 'function') {
      return dateValue.toDate()
    }
    if (typeof dateValue === 'number') return new Date(dateValue)
    if (typeof dateValue === 'string') return new Date(dateValue)

    return new Date(0)
  }

  useEffect(() => {
    const items = []

    // Recent photos (last 5)
    const recentPhotos = [...photos]
      .sort((a, b) => toDate(b.uploadedAt) - toDate(a.uploadedAt))
      .slice(0, 5)

    recentPhotos.forEach((photo) => {
      items.push({
        id: photo.id,
        type: 'photo',
        timestamp: toDate(photo.uploadedAt),
        data: photo,
      })
    })

    // Recent albums (last 3)
    const recentAlbums = [...albums]
      .sort((a, b) => toDate(b.createdAt) - toDate(a.createdAt))
      .slice(0, 3)

    recentAlbums.forEach((album) => {
      items.push({
        id: album.id,
        type: 'album',
        timestamp: toDate(album.createdAt),
        data: album,
      })
    })

    // Recent favorites (last 3)
    const recentFavorites = photos
      .filter((p) => p.favorite)
      .sort((a, b) => toDate(b.updatedAt) - toDate(a.updatedAt))
      .slice(0, 3)

    recentFavorites.forEach((photo) => {
      items.push({
        id: `fav-${photo.id}`,
        type: 'favorite',
        timestamp: toDate(photo.updatedAt),
        data: photo,
      })
    })

    items.sort((a, b) => b.timestamp - a.timestamp)
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
        label: (data) =>
          t('activity:photoUploaded', {
            name: data.filename || t('common:photo'),
          }),
      },
      album: {
        icon: Folder,
        color: 'text-purple-600 dark:text-purple-400',
        bgColor: 'bg-purple-100 dark:bg-purple-900/30',
        label: (data) => t('activity:albumCreated', { name: data.name }),
      },
      favorite: {
        icon: Heart,
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        label: () => t('activity:addedToFavorites'),
      },
    }

    return configs[type]
  }

  if (activities.length === 0) {
    return null
  }

  return (
    <div className="activity-feed glass card-premium p-6 rounded-2xl mb-6">
      {/* Header / Toggle */}
      <div
        className="flex items-center justify-between gap-2 mb-4 cursor-pointer select-none"
        onClick={() => setOpen((prev) => !prev)}
      >
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('activity:recentActivity')}
          </h3>
        </div>

        <span
          className={`transition-transform duration-300 ${
            open ? 'rotate-180' : ''
          }`}
        >
          ▾
        </span>
      </div>

      {/* Collapsible content */}
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="space-y-3 pt-1">
          {activities.map((activity) => {
            const config = getActivityConfig(activity.type)
            if (!config) return null

            const Icon = config.icon

            return (
              <div
                key={activity.id}
                className="activity-item flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
              >
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center`}
                >
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
      </div>
    </div>
  )
}

export default ActivityFeed
