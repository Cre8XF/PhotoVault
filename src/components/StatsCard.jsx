import { usePhotoData } from '../hooks/usePhotoData'
import { useTranslation } from 'react-i18next'
import { PhotoIcon, FolderIcon, SparklesIcon, ServerIcon } from '@heroicons/react/24/outline'

const StatsCard = () => {
  const { t } = useTranslation()
  const { photos, albums } = usePhotoData()

  // Calculate stats
  const photoCount = photos.length
  const albumCount = albums.length
  const collageCount = photos.filter(p => p.isCollage).length

  // Calculate storage used (bytes to MB)
  const storageUsed = photos.reduce((sum, photo) => sum + (photo.size || 0), 0)
  const storageUsedMB = (storageUsed / (1024 * 1024)).toFixed(1)

  const stats = [
    {
      icon: PhotoIcon,
      label: t('stats:photos'),
      value: photoCount.toLocaleString(),
      color: 'text-blue-600'
    },
    {
      icon: FolderIcon,
      label: t('stats:albums'),
      value: albumCount,
      color: 'text-purple-600'
    },
    {
      icon: SparklesIcon,
      label: t('stats:collages'),
      value: collageCount,
      color: 'text-pink-600'
    },
    {
      icon: ServerIcon,
      label: t('stats:storage'),
      value: `${storageUsedMB} MB`,
      color: 'text-green-600'
    }
  ]

  return (
    <div className="stats-card glass card-premium p-6 rounded-2xl mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('stats:yourStats')}
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon
          return (
            <div
              key={idx}
              className="stat-item flex flex-col items-center p-4 rounded-xl bg-white/50 dark:bg-gray-800/50 transition-transform hover:scale-105"
            >
              <Icon className={`w-8 h-8 mb-2 ${stat.color}`} />
              <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {stat.value}
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {stat.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default StatsCard
