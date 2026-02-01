import useAuth from '../hooks/useAuth'
import { usePhotoData } from '../hooks/usePhotoData'
import { useTranslation } from 'react-i18next'
import { Server, ArrowUp } from 'lucide-react'
import Badge from './Badge'

const StorageIndicator = () => {
  const { t } = useTranslation()
  const { user, userProfile, isAdmin, tier } = useAuth()
  const { photos } = usePhotoData()

  // Get user tier via useAuth (single source of truth)
  const userTier = tier()

  // Storage limits (in bytes) — harmonized with Stripe webhook
  const limits = {
    FREE: 500 * 1024 * 1024, // 500 MB
    LITE: 5 * 1024 * 1024 * 1024,  // 5 GB
    PRO: 50 * 1024 * 1024 * 1024    // 50 GB
  }

  // Admin users: use Firestore storageLimit; others: tier-based lookup
  const limit = isAdmin()
    ? (userProfile?.storageLimit || limits.PRO)
    : (userProfile?.storageLimit || limits[userTier] || limits.FREE)

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
          <Server className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('storage:title')}
          </h3>
        </div>

        <Badge variant="purple">{t(`common:tiers.${userTier}`)}</Badge>
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
      {(percentage > 80 || userTier === 'FREE') && (
        <div className="mt-4 p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold mb-1">
                {percentage > 80
                  ? t('storage:nearLimit')
                  : t('storage:upgradeMessage')}
              </p>
              <p className="text-sm opacity-90">
                {userTier === 'FREE'
                  ? t('storage:liteOffer')
                  : t('storage:proOffer')}
              </p>
            </div>
            <button className="flex items-center gap-1 px-4 py-2 bg-white text-purple-600 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              <ArrowUp className="w-4 h-4" />
              {t('storage:upgrade')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default StorageIndicator
