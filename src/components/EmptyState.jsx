// ============================================================================
// COMPONENT: EmptyState.jsx - Unified empty and error states (Phase 5B Session 6)
// ============================================================================
import React from 'react'
import PropTypes from 'prop-types'
import {
  ImageOff,
  Inbox,
  Search,
  Heart,
  Grid3x3,
  AlertCircle,
  FolderPlus,
  Upload
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

/**
 * EmptyState Component
 *
 * Provides helpful empty and error states with clear messaging
 * and optional call-to-action buttons.
 *
 * Features:
 * - Multiple variants for different contexts
 * - Custom icons support
 * - Dark/light mode compatible
 * - Mobile responsive
 * - WCAG AA compliant
 */
const EmptyState = ({
  variant = 'no-photos',
  title,
  description,
  action,
  onAction,
  icon: CustomIcon,
  className = '',
  size = 'md',
}) => {
  const { t } = useTranslation(['common', 'home', 'albums', 'search', 'collage'])

  // Variant configurations
  const variants = {
    'no-photos': {
      icon: ImageOff,
      defaultTitle: t('common:emptyStates.noPhotos.title') || 'No Photos Yet',
      defaultDescription: t('common:emptyStates.noPhotos.description') || 'Upload your first photo to get started',
      defaultAction: t('common:emptyStates.noPhotos.action') || 'Upload Photos',
      iconColor: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    'no-albums': {
      icon: Inbox,
      defaultTitle: t('common:emptyStates.noAlbums.title') || 'No Albums Yet',
      defaultDescription: t('common:emptyStates.noAlbums.description') || 'Create your first album to organize your photos',
      defaultAction: t('common:emptyStates.noAlbums.action') || 'Create Album',
      iconColor: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    'no-results': {
      icon: Search,
      defaultTitle: t('common:emptyStates.noResults.title') || 'No Results Found',
      defaultDescription: t('common:emptyStates.noResults.description') || 'Try adjusting your search or filters',
      defaultAction: t('common:emptyStates.noResults.action') || 'Clear Filters',
      iconColor: 'text-gray-400',
      bgColor: 'bg-gray-500/10',
    },
    'no-favorites': {
      icon: Heart,
      defaultTitle: t('common:emptyStates.noFavorites.title') || 'No Favorites Yet',
      defaultDescription: t('common:emptyStates.noFavorites.description') || 'Tap the heart icon on photos to save them here',
      defaultAction: null,
      iconColor: 'text-red-400',
      bgColor: 'bg-red-500/10',
    },
    'no-collages': {
      icon: Grid3x3,
      defaultTitle: t('common:emptyStates.noCollages.title') || 'No Collages Yet',
      defaultDescription: t('common:emptyStates.noCollages.description') || 'Create beautiful photo collages from your gallery',
      defaultAction: t('common:emptyStates.noCollages.action') || 'Create Collage',
      iconColor: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
    'error': {
      icon: AlertCircle,
      defaultTitle: t('common:emptyStates.error.title') || 'Something Went Wrong',
      defaultDescription: t('common:emptyStates.error.description') || 'Please try again or contact support if the problem persists',
      defaultAction: t('common:emptyStates.error.action') || 'Try Again',
      iconColor: 'text-red-400',
      bgColor: 'bg-red-500/10',
    },
  }

  const config = variants[variant] || variants['no-photos']
  const Icon = CustomIcon || config.icon

  // Size configurations
  const sizes = {
    sm: {
      icon: 'w-12 h-12',
      iconWrapper: 'w-20 h-20',
      title: 'text-lg',
      description: 'text-sm',
      padding: 'py-8',
    },
    md: {
      icon: 'w-16 h-16',
      iconWrapper: 'w-24 h-24',
      title: 'text-xl',
      description: 'text-base',
      padding: 'py-16',
    },
    lg: {
      icon: 'w-20 h-20',
      iconWrapper: 'w-28 h-28',
      title: 'text-2xl',
      description: 'text-lg',
      padding: 'py-20',
    },
  }

  const sizeConfig = sizes[size]

  return (
    <div
      className={`flex flex-col items-center justify-center ${sizeConfig.padding} px-4 text-center ${className}`}
      role="status"
      aria-live="polite"
    >
      {/* Icon */}
      <div
        className={`inline-flex items-center justify-center ${sizeConfig.iconWrapper} ${config.bgColor} rounded-full mb-4`}
        aria-hidden="true"
      >
        <Icon className={`${sizeConfig.icon} ${config.iconColor}`} />
      </div>

      {/* Title */}
      <h3 className={`${sizeConfig.title} font-semibold mb-2 text-gray-900 dark:text-white`}>
        {title || config.defaultTitle}
      </h3>

      {/* Description */}
      <p className={`${sizeConfig.description} text-muted mb-6 max-w-md`}>
        {description || config.defaultDescription}
      </p>

      {/* Action Button */}
      {(action || config.defaultAction) && onAction && (
        <button
          onClick={onAction}
          className="ripple-effect px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium flex items-center gap-2 transition-all duration-200 hover:scale-[1.02]"
        >
          {variant === 'no-photos' && <Upload className="w-5 h-5" />}
          {variant === 'no-albums' && <FolderPlus className="w-5 h-5" />}
          {variant === 'no-collages' && <Grid3x3 className="w-5 h-5" />}
          {action || config.defaultAction}
        </button>
      )}
    </div>
  )
}

EmptyState.propTypes = {
  variant: PropTypes.oneOf([
    'no-photos',
    'no-albums',
    'no-results',
    'no-favorites',
    'no-collages',
    'error',
  ]),
  title: PropTypes.string,
  description: PropTypes.string,
  action: PropTypes.string,
  onAction: PropTypes.func,
  icon: PropTypes.elementType,
  className: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
}

export default EmptyState
