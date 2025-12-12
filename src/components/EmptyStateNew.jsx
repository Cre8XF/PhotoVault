import { useTranslation } from 'react-i18next'
import { PhotoIcon, FolderIcon, MagnifyingGlassIcon, HeartIcon } from '@heroicons/react/24/outline'

const EmptyStateNew = ({ type, action }) => {
  const { t } = useTranslation()

  const config = {
    photos: {
      icon: PhotoIcon,
      title: t('empty:noPhotos'),
      message: t('empty:noPhotosMessage'),
      actionLabel: t('empty:uploadPhotos')
    },
    albums: {
      icon: FolderIcon,
      title: t('empty:noAlbums'),
      message: t('empty:noAlbumsMessage'),
      actionLabel: t('empty:createAlbum')
    },
    search: {
      icon: MagnifyingGlassIcon,
      title: t('empty:noResults'),
      message: t('empty:noResultsMessage'),
      actionLabel: null
    },
    favorites: {
      icon: HeartIcon,
      title: t('empty:noFavorites'),
      message: t('empty:noFavoritesMessage'),
      actionLabel: null
    }
  }

  const { icon: Icon, title, message, actionLabel } = config[type]

  return (
    <div className="empty-state flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
        <Icon className="w-12 h-12 text-gray-400 dark:text-gray-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 text-center max-w-md mb-6">
        {message}
      </p>
      {actionLabel && action && (
        <button
          onClick={action}
          className="px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default EmptyStateNew
