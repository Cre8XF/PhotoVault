import { useAuth } from '../contexts/AuthContext'
import { usePhotoData } from '../hooks/usePhotoData'
import { useTranslation } from 'react-i18next'
import { ServerIcon, ArrowUpIcon } from '@heroicons/react/24/outline'

const StorageIndicator = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { photos } = usePhotoData()

  // Get user tier (from Firestore user document)
  const userTier = user?.tier || 'GRATIS'

  // Storage limits (in bytes)
  const limits = {
    GRATIS: 1 * 1024 * 1024 * 1024, // 1 GB
    LITE: 5 * 1024 * 1024 * 1024,   // 5 GB
    PRO: 50 * 1024 * 1024 * 1024    // 50 GB
  }

  const limit = limits[userTier]

  // Calculate storage used
  const storageUsed = photos.reduce((sum, photo) => sum + (photo.size || 0), 0)
  const percentage = Math.min((storageUsed / limit) * 100, 100)

  // Format bytes to readable format
  const formatBytes = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB'
  }

  // Color based on usage
  const getColor = () => {
    if (percentage < 60) return 'bg-green-500'
    if (percentage < 80) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="storage-indicator glass card-premium p-6 rounded-2xl mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ServerIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('storage:title')}
          </h3>
        </div>

        <span className="text-sm font-medium px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
          {userTier}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
        <div
          className={`h-full ${getColor()} transition-all duration-500 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-400">
          {formatBytes(storageUsed)} {t('storage:of')} {formatBytes(limit)} {t('storage:used')}
        </span>
        <span className="font-medium text-gray-900 dark:text-white">
          {percentage.toFixed(1)}%
        </span>
      </div>

      {/* Upgrade CTA if near limit or on free tier */}
      {(percentage > 80 || userTier === 'GRATIS') && (
        <div className="mt-4 p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold mb-1">
                {percentage > 80
                  ? t('storage:nearLimit')
                  : t('storage:upgradeMessage')}
              </p>
              <p className="text-sm opacity-90">
                {userTier === 'GRATIS'
                  ? t('storage:liteOffer')
                  : t('storage:proOffer')}
              </p>
            </div>
            <button className="flex items-center gap-1 px-4 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              <ArrowUpIcon className="w-4 h-4" />
              {t('storage:upgrade')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default StorageIndicator
