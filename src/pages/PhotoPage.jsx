// ============================================================================
// PhotoPage - Phase 2A: Fullscreen Photo Viewer + XSS Protection
// ============================================================================
import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react'
import { toggleFavorite as firebaseToggleFavorite } from '../firebase'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import {
  ArrowLeft,
  Heart,
  Info,
  MoreVertical,
  Presentation,
  Trash2,
  Download,
  Share2,
  FolderInput,
  X,
  Edit2,
  Tag as TagIcon,
} from 'lucide-react'
import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'
import useStore from '../state/store'
import { usePhotoById } from '../hooks/usePhotoById'
import { usePhotoContext } from '../hooks/usePhotoContext'
import { usePrefetchAdjacentPhotos } from '../hooks/usePrefetchAdjacentPhotos'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { deletePhoto as firebaseDeletePhoto } from '../firebase'
import { usePhotoData } from '../hooks/usePhotoData'
import ConfirmModal from '../components/ConfirmModal'
import { sanitizeImageUrl, PLACEHOLDER_IMAGE } from '../utils/security'
import DocumentCard from '../components/DocumentCard'
import TagInput from '../components/TagInput'
import EmptyState from '../components/EmptyState'

const getPhotoUrl = (photo) =>
  photo.url || photo.displayUrl || photo.thumbnailUrl

export default function PhotoPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation(['common'])

  // State
  const [uiVisible, setUiVisible] = useState(true)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [showInfo, setShowInfo] = useState(false)
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const uiTimerRef = useRef(null)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  // Store
  const setIsWorldView = useStore((state) => state.setIsWorldView)
  const photos = useStore((state) => state.photos)
  const albums = useStore((state) => state.albums)
  const updatePhotoInStore = useStore((state) => state.updatePhoto)
  const deletePhotoFromStore = useStore((state) => state.deletePhoto)
  const setNotification = useStore((state) => state.setNotification)

  // Custom hooks
  const { photo, loading, error } = usePhotoById(id)
  const {
    photoContext,
    photoOrder,
    photoIndex,
    setPhotoIndex,
    setCurrentPhotoId,
  } = usePhotoContext()

  // Tag management
  const { addTag, removeTag } = usePhotoData()

  // Get all unique tags from all photos for suggestions
  const allTags = useMemo(() => {
    const tagSet = new Set()
    photos.forEach((p) => {
      if (p.tags && Array.isArray(p.tags)) {
        p.tags.forEach((tag) => tagSet.add(tag))
      }
    })
    return Array.from(tagSet).sort()
  }, [photos])

  // Get suggestions (exclude already-added tags)
  const tagSuggestions = useMemo(() => {
    if (!photo || !photo.tags) return allTags.slice(0, 5)
    return allTags.filter((tag) => !photo.tags.includes(tag)).slice(0, 5)
  }, [allTags, photo])

  // Prefetch adjacent photos
  usePrefetchAdjacentPhotos(photoOrder, photoIndex, photos)

  // 🐛 DEBUG: Log when photo changes (especially tags)
  useEffect(() => {
    if (photo) {
      console.log('📸 PhotoPage - photo updated:', {
        id: photo.id,
        tags: photo.tags,
        tagsLength: photo.tags?.length,
        isArray: Array.isArray(photo.tags),
        fullPhoto: photo,
      })
    }
  }, [photo])

  // 📍 DIAGNOSTIC: Log component mount
  useEffect(() => {
    console.log('📍 [PhotoPage] mounted', {
      pathname: location.pathname,
      params: { id },
      state: location.state,
      photoContext,
      photoOrder: photoOrder?.slice(0, 5), // First 5 IDs
      photoIndex,
      timestamp: new Date().toISOString(),
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // 🔍 NAV DEBUG: Log navigation state changes
  useEffect(() => {
    console.log('🔍 [NAV DEBUG] Navigation state:', {
      photoId: id,
      photoOrder,
      photoOrderLength: photoOrder?.length,
      photoIndex,
      hasMultipleItems: photoOrder?.length > 1,
      canNavigate: Array.isArray(photoOrder) && photoOrder.length > 1,
      prevAvailable: photoIndex > 0,
      nextAvailable: photoIndex < (photoOrder?.length - 1),
    })
  }, [id, photoOrder, photoIndex])

  // Set world view on mount
  useEffect(() => {
    setIsWorldView(true)
    setCurrentPhotoId(id)
    return () => {
      setIsWorldView(false)
      setCurrentPhotoId(null)
    }
  }, [setIsWorldView, setCurrentPhotoId, id])

  // Reset UI timer on any interaction
  const resetUiTimer = useCallback(() => {
    setUiVisible(true)
    if (uiTimerRef.current) {
      clearTimeout(uiTimerRef.current)
    }
    uiTimerRef.current = setTimeout(() => {
      setUiVisible(false)
    }, 3000)
  }, [])

  // Helper: Get correct viewer route based on item type
  const getViewerRouteForId = useCallback((itemId) => {
    // Look up item in photos array
    const item = photos?.find((p) => p.id === itemId)

    // Check if it's a collage (multiple ways to identify)
    if (item && (item.isCollage === true || item.category === 'collage' || item.type === 'collage')) {
      return `/collage/view/${itemId}`
    }

    // Default to photo route
    return `/photo/${itemId}`
  }, [photos])

  // Handle navigation
  const handleNext = useCallback(() => {
    console.log('🔍 [NAV DEBUG] handleNext called', {
      photoOrder,
      photoOrderLength: photoOrder?.length,
      photoIndex,
      nextIndex: photoIndex + 1,
      nextId: photoOrder?.[photoIndex + 1],
    })

    if (!Array.isArray(photoOrder) || photoOrder.length === 0) {
      console.warn('⚠️ [NAV DEBUG] handleNext blocked: photoOrder invalid')
      return
    }
    if (photoIndex >= photoOrder.length - 1) {
      console.warn('⚠️ [NAV DEBUG] handleNext blocked: at end of sequence')
      return // Hard boundary
    }

    const nextIndex = photoIndex + 1
    const nextId = photoOrder[nextIndex]
    const nextRoute = getViewerRouteForId(nextId)

    console.log('✅ [NAV DEBUG] Navigating to next:', {
      nextIndex,
      nextId,
      nextRoute,
    })

    setPhotoIndex(nextIndex)
    setCurrentPhotoId(nextId)
    setImageLoaded(false)
    navigate(nextRoute, { replace: true })
    resetUiTimer()
  }, [
    photoOrder,
    photoIndex,
    setPhotoIndex,
    setCurrentPhotoId,
    navigate,
    getViewerRouteForId,
    resetUiTimer,
  ])

  const handlePrev = useCallback(() => {
    console.log('🔍 [NAV DEBUG] handlePrev called', {
      photoOrder,
      photoOrderLength: photoOrder?.length,
      photoIndex,
      prevIndex: photoIndex - 1,
      prevId: photoOrder?.[photoIndex - 1],
    })

    if (!Array.isArray(photoOrder) || photoOrder.length === 0) {
      console.warn('⚠️ [NAV DEBUG] handlePrev blocked: photoOrder invalid')
      return
    }
    if (photoIndex <= 0) {
      console.warn('⚠️ [NAV DEBUG] handlePrev blocked: at start of sequence')
      return // Hard boundary
    }

    const prevIndex = photoIndex - 1
    const prevId = photoOrder[prevIndex]
    const prevRoute = getViewerRouteForId(prevId)

    console.log('✅ [NAV DEBUG] Navigating to prev:', {
      prevIndex,
      prevId,
      prevRoute,
    })

    setPhotoIndex(prevIndex)
    setCurrentPhotoId(prevId)
    setImageLoaded(false)
    navigate(prevRoute, { replace: true })
    resetUiTimer()
  }, [
    photoOrder,
    photoIndex,
    setPhotoIndex,
    setCurrentPhotoId,
    navigate,
    getViewerRouteForId,
    resetUiTimer,
  ])

  // Handle back navigation
  const handleBack = useCallback(() => {
    if (location.state?.from) {
      navigate(-1)
    } else {
      navigate('/')
    }
  }, [navigate, location])

  // Toggle favorite
  const handleToggleFavorite = useCallback(async () => {
    if (!photo) return

    if (import.meta.env.DEV)
      console.log('🎯 PhotoPage.handleToggleFavorite called:', {
        photoId: photo.id,
        currentFavorite: photo.favorite,
        timestamp: new Date().toISOString(),
      })

    const newFavoriteStatus = !photo.favorite

    // Optimistic update in Zustand
    if (import.meta.env.DEV)
      console.log('⚡ Optimistically updating Zustand store...')
    updatePhotoInStore(photo.id, { favorite: newFavoriteStatus })

    try {
      // Sync to Firestore using toggleFavorite
      if (import.meta.env.DEV)
        console.log('🔥 Calling firebase.toggleFavorite()...')
      const result = await firebaseToggleFavorite(photo.id, photo.favorite)
      if (import.meta.env.DEV)
        console.log('✅ firebase.toggleFavorite() returned:', result)
    } catch (err) {
      console.error('❌ PhotoPage favorite toggle failed:', err)
      // Revert UI state on error
      if (import.meta.env.DEV) console.log('↩️ Reverting optimistic update...')
      updatePhotoInStore(photo.id, { favorite: !newFavoriteStatus })
    }

    resetUiTimer()
  }, [photo, updatePhotoInStore, resetUiTimer])

  // Start slideshow - Phase 2B
  const handleStartSlideshow = useCallback(() => {
    if (!photo) return

    // Check if current photo is a document
    if (photo.type === 'document') {
      setNotification({
        message: 'Documents cannot be shown in slideshow.',
        type: 'info',
      })
      return
    }

    // Navigate to slideshow page with current photo
    navigate(`/slideshow/${photo.id}`, { state: { from: location } })
  }, [photo, navigate, location, setNotification])

  // Delete photo
  const handleDelete = useCallback(() => {
    if (!photo) return

    if (import.meta.env.DEV)
      console.log('🗑️ PhotoPage: Delete button clicked, showing confirm modal')
    setShowDeleteConfirm(true)
    resetUiTimer()
  }, [photo, resetUiTimer])

  // Execute delete after confirmation
  const executeDelete = useCallback(async () => {
    if (!photo) return

    if (import.meta.env.DEV) console.log('✅ Delete confirmed, executing...')
    if (import.meta.env.DEV)
      console.log('🗑️ Deleting photo:', {
        photoId: photo.id,
        storagePath: photo.storagePath,
        filename: photo.name,
      })

    // CRITICAL: Navigate away IMMEDIATELY to prevent "Photo not found" error
    // The usePhotoById hook will try to re-fetch the photo after deletion,
    // causing a "not found" error. By navigating first, we unmount the component
    // before that can happen.
    if (import.meta.env.DEV)
      console.log('🚀 Navigating away immediately to prevent re-fetch')

    // Close confirmation modal first
    setShowDeleteConfirm(false)

    // Optimistically remove from UI
    deletePhotoFromStore(photo.id)

    // Navigate back to home BEFORE async delete
    handleBack()

    // Delete from Firebase in background
    // This happens after navigation, so any errors won't affect the user
    try {
      if (import.meta.env.DEV)
        console.log('🗑️ Deleting photo from Firebase + R2 in background...')
      await firebaseDeletePhoto(photo.id, photo)
      if (import.meta.env.DEV)
        console.log('✅ Photo deleted successfully from Firebase + R2')

      // Show success notification (user already on Home page)
      setNotification({
        message: t('common:notifications.photoDeleted'),
        type: 'success',
      })
    } catch (error) {
      console.error('❌ Background delete failed:', error)

      // Show error notification (user already on Home page)
      setNotification({
        message:
          t('common:notifications.photoDeleteError') ||
          'Failed to delete photo',
        type: 'error',
      })

      // Note: Photo already removed from UI, so error is just logged
      // Consider refreshing data from server to restore photo if needed
    }
  }, [
    photo,
    deletePhotoFromStore,
    setNotification,
    handleBack,
    t,
    setShowDeleteConfirm,
  ])

  // Toggle info panel
  const handleToggleInfo = useCallback(() => {
    if (import.meta.env.DEV)
      console.log('ℹ️ PhotoPage: Info toggled', {
        photoId: photo?.id,
        currentState: showInfo,
      })
    setShowInfo(!showInfo)
    resetUiTimer()
  }, [photo, showInfo, resetUiTimer])

  // Download photo
  const handleDownload = useCallback(() => {
    if (!photo) return

    if (import.meta.env.DEV)
      console.log('📥 PhotoPage: Download clicked', { photoId: photo.id })

    const link = document.createElement('a')
    link.href = getPhotoUrl(photo)
    link.download = photo.name || 'photo.jpg'
    link.click()

    setShowMoreMenu(false)
    resetUiTimer()
  }, [photo, resetUiTimer])

  // Share photo
  const handleShare = useCallback(() => {
    if (!photo) return

    if (import.meta.env.DEV)
      console.log('🔗 PhotoPage: Share clicked', { photoId: photo.id })

    if (navigator.share) {
      navigator
        .share({
          title: photo.name || 'Photo',
          url: photo.url || photo.displayUrl,
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            console.error('Share failed:', err)
          }
        })
    } else {
      alert('Share not supported on this browser')
    }

    setShowMoreMenu(false)
    resetUiTimer()
  }, [photo, resetUiTimer])

  // Format file size
  const formatFileSize = useCallback(
    (bytes) => {
      if (!bytes) return t('common:unknown')
      if (bytes < 1024) return bytes + ' B'
      if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    },
    [t]
  )

  // Get album name
  const getAlbumName = useCallback(() => {
    if (!photo?.albumId) return t('common:unassigned')
    const album = albums.find((a) => a.id === photo.albumId)
    return album?.name || t('common:unknown')
  }, [photo, albums, t])

  // 🆕 PHASE 3B: Keyboard shortcuts (replaces old keyboard navigation)
  const keyboardShortcuts = [
    {
      key: 'ArrowRight',
      action: handleNext,
    },
    {
      key: 'ArrowLeft',
      action: handlePrev,
    },
    {
      key: 'Escape',
      action: handleBack,
    },
    {
      key: 'Delete',
      action: () => setShowDeleteConfirm(true),
    },
    {
      key: 'Backspace',
      action: () => setShowDeleteConfirm(true),
    },
    {
      key: 'f',
      action: handleToggleFavorite,
    },
  ]

  console.log('🔍 [NAV DEBUG] Keyboard shortcuts registered:', {
    shortcutsType: Array.isArray(keyboardShortcuts) ? 'array' : 'object',
    shortcutsCount: keyboardShortcuts.length,
    shortcuts: keyboardShortcuts,
  })

  useKeyboardShortcuts(keyboardShortcuts)

  // Touch/swipe navigation
  useEffect(() => {
    const handleTouchStart = (e) => {
      touchStartX.current = e.changedTouches[0].screenX
    }

    const handleTouchEnd = (e) => {
      touchEndX.current = e.changedTouches[0].screenX
      handleSwipe()
    }

    const handleSwipe = () => {
      const swipeThreshold = 50
      const diff = touchStartX.current - touchEndX.current

      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          // Swipe left → next
          handleNext()
        } else {
          // Swipe right → prev
          handlePrev()
        }
      }
    }

    window.addEventListener('touchstart', handleTouchStart)
    window.addEventListener('touchend', handleTouchEnd)

    return () => {
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [handleNext, handlePrev])

  // Reset timer on mouse move
  useEffect(() => {
    const handleMouseMove = () => {
      resetUiTimer()
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [resetUiTimer])

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (uiTimerRef.current) {
        clearTimeout(uiTimerRef.current)
      }
    }
  }, [])

  // Toggle UI on image click
  const handleImageClick = () => {
    if (uiVisible) {
      setUiVisible(false)
      if (uiTimerRef.current) {
        clearTimeout(uiTimerRef.current)
      }
    } else {
      resetUiTimer()
    }
  }

  // Get canonical display date (EXIF date taken OR upload date)
  const getDisplayDate = () => {
    if (!photo) return null
    // Prefer EXIF/metadata date if available
    if (photo.dateTaken) {
      return typeof photo.dateTaken === 'string'
        ? new Date(photo.dateTaken)
        : photo.dateTaken.toDate
        ? photo.dateTaken.toDate()
        : null
    }
    // Fallback to upload date
    if (photo.uploadedAt) {
      return typeof photo.uploadedAt === 'string'
        ? new Date(photo.uploadedAt)
        : photo.uploadedAt.toDate
        ? photo.uploadedAt.toDate()
        : null
    }
    // Last resort: createdAt
    if (photo.createdAt) {
      return new Date(photo.createdAt)
    }
    return null
  }

  // Format date for title
  const getPhotoTitle = () => {
    if (!photo) return ''
    if (photo.caption) return photo.caption

    const displayDate = getDisplayDate()
    if (displayDate) {
      try {
        return format(displayDate, 'MMMM d, yyyy')
      } catch {
        return photo.name || 'Photo'
      }
    }
    return photo.name || 'Photo'
  }

  // Loading state
  if (loading) {
    console.log('⏳ [PhotoPage] Loading state', {
      id,
      loading,
      photo: !!photo,
      timestamp: new Date().toISOString(),
    })
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
        <div className="spinner" />
      </div>
    )
  }

  // Error state
  if (error || !photo) {
    console.warn('⛔ [PhotoPage] render blocked', {
      reason: error || 'Photo not found',
      id,
      photo: !!photo,
      loading,
      error,
      availablePhotosCount: photos?.length,
      timestamp: new Date().toISOString(),
    })
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
        <EmptyState
          variant="error"
          title={t('common:errors.title') || 'Photo not found'}
          description={
            error ||
            t('common:errors.description') ||
            'This photo could not be found or has been deleted'
          }
          action={t('common:close') || 'Go back'}
          onAction={handleBack}
          size="md"
        />
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
      {/* Top Bar */}
      <header
        className={`fixed top-0 inset-x-0 z-[10000] h-14 backdrop-blur-xl transition-opacity duration-300 ${
          uiVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          backgroundColor: 'var(--glass-bg)',
          color: 'var(--text-primary)',
        }}
      >
        <div className="flex items-center justify-between px-4 h-full">
          {/* Left: Back button */}
          <button
            onClick={handleBack}
            className="flex items-center gap-2 rounded-full p-2 transition active:scale-95"
            style={{ color: 'var(--text-primary)' }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor =
                'var(--interactive-hover)')
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = 'transparent')
            }
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          {/* Center: Title */}
          <div className="flex-1 text-center px-4">
            <h1 className="text-primary text-sm font-medium truncate">
              {getPhotoTitle()}
            </h1>
            {photoContext && photoOrder && photoOrder.length > 0 && (
              <p className="text-muted text-xs">
                {photoIndex + 1} / {photoOrder.length}
              </p>
            )}
          </div>

          {/* Right: Desktop-only actions */}
          <div className="hidden sm:flex items-center gap-1 relative">
            {/* Favorite button */}
            <button
              onClick={handleToggleFavorite}
              className={`p-2 rounded-full transition active:scale-95 ${
                photo.favorite
                  ? 'text-red-500 hover:bg-red-500/10'
                  : 'text-white hover:bg-white/10'
              }`}
              aria-label="Toggle favorite"
            >
              <Heart
                className="w-5 h-5"
                fill={photo.favorite ? 'currentColor' : 'none'}
              />
            </button>

            {/* Edit button (for regular photos) or Re-edit button (for collages) */}
            {photo.isCollage || photo.type === 'collage' ? (
              <button
                onClick={() => {
                  if (import.meta.env.DEV)
                    console.log('🎨 Re-edit collage button clicked')
                  navigate(`/collage/edit/${id}`, {
                    state: { returnPath: location.pathname },
                  })
                }}
                className="text-white hover:bg-purple-500/10 hover:text-purple-400 p-2 rounded-full transition active:scale-95"
                aria-label="Re-edit Collage"
                title="Re-edit Collage"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => {
                  if (import.meta.env.DEV)
                    console.log('✏️ Edit button clicked, navigating to editor')
                  navigate(`/edit/${id}`)
                }}
                className="text-white hover:bg-blue-500/10 hover:text-blue-400 p-2 rounded-full transition active:scale-95"
                aria-label={t('common:edit')}
                title={t('common:edit')}
              >
                <Edit2 className="w-5 h-5" />
              </button>
            )}

            {/* Delete button */}
            <button
              onClick={handleDelete}
              className="text-white hover:bg-red-500/10 hover:text-red-400 p-2 rounded-full transition active:scale-95"
              aria-label={t('common:delete')}
            >
              <Trash2 className="w-5 h-5" />
            </button>

            {/* Info button */}
            <button
              onClick={handleToggleInfo}
              className={`p-2 rounded-full transition active:scale-95 ${
                showInfo
                  ? 'text-blue-400 bg-blue-500/10'
                  : 'text-white hover:bg-white/10'
              }`}
              aria-label={t('common:showInfo')}
            >
              <Info className="w-5 h-5" />
            </button>

            {/* More menu */}
            <button
              onClick={() => {
                if (import.meta.env.DEV)
                  console.log('📋 PhotoPage: More menu toggled')
                setShowMoreMenu(!showMoreMenu)
                resetUiTimer()
              }}
              className={`p-2 rounded-full transition active:scale-95 ${
                showMoreMenu
                  ? 'text-blue-400 bg-blue-500/10'
                  : 'text-white hover:bg-white/10'
              }`}
              aria-label={t('common:more') || 'More options'}
            >
              <MoreVertical className="w-5 h-5" />
            </button>

            {/* More menu dropdown */}
            {showMoreMenu && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                {/* Slideshow option */}
                {photoOrder && photoOrder.length > 1 && (
                  <button
                    onClick={() => {
                      handleStartSlideshow()
                      setShowMoreMenu(false)
                    }}
                    className="flex items-center gap-3 w-full px-4 py-3 text-left text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                  >
                    <Presentation className="w-5 h-5" />
                    <span>{t('common:slideshow') || 'Slideshow'}</span>
                  </button>
                )}

                {/* Standard menu items */}
                <button
                  onClick={handleDownload}
                  className="flex items-center gap-3 w-full px-4 py-3 text-left text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <Download className="w-5 h-5" />
                  <span>{t('common:download')}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-3 w-full px-4 py-3 text-left text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <Share2 className="w-5 h-5" />
                  <span>{t('common:share') || 'Share'}</span>
                </button>

                <button
                  onClick={() => {
                    if (import.meta.env.DEV)
                      console.log('📁 Move to album - TODO')
                    alert(t('common:comingSoon.title') || 'Coming soon')
                    setShowMoreMenu(false)
                    resetUiTimer()
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 text-left text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                >
                  <FolderInput className="w-5 h-5" />
                  <span>{t('common:moveToAlbum')}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Media Canvas (Image, Video, or Document) */}
      <main className="flex-1 flex items-center justify-center p-0">
        {photo.type === 'document' ? (
          <div className="max-w-md w-full px-4">
            <DocumentCard item={photo} />
          </div>
        ) : photo.type === 'video' ? (
          <video
            src={photo.url}
            controls
            preload="metadata"
            poster={photo.thumbnailUrl || undefined}
            className={`max-w-full max-h-[100vh] object-contain transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoadedData={() => setImageLoaded(true)}
            onCanPlay={() => setImageLoaded(true)}
            style={{ cursor: 'default' }}
          >
            Your browser does not support video playback.
          </video>
        ) : (
          <img
            src={sanitizeImageUrl(
              photo.displayUrl || photo.url,
              PLACEHOLDER_IMAGE
            )}
            alt={photo.caption || photo.name || 'Photo'}
            onError={(e) => {
              console.error(
                '❌ Failed to load photo:',
                photo.displayUrl || photo.url
              )
              e.target.src = PLACEHOLDER_IMAGE
            }}
            className={`max-w-full max-h-[100vh] object-contain transition-opacity duration-300 cursor-pointer ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onClick={handleImageClick}
            draggable={false}
          />
        )}

        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="spinner" />
          </div>
        )}
      </main>

      {/* Navigation Arrows */}
      {photoOrder && photoOrder.length > 1 && (
        <div
          className={`fixed inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 pointer-events-none transition-opacity duration-300 text-on-glass ${
            uiVisible ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Previous arrow */}
          {photoIndex > 0 ? (
            <button
              onClick={handlePrev}
              className="pointer-events-auto bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full p-3 text-white drop-shadow-md active:scale-95 transition"
              aria-label="Previous photo"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          ) : (
            <div />
          )}

          {/* Next arrow */}
          {photoIndex < photoOrder.length - 1 ? (
            <button
              onClick={handleNext}
              className="pointer-events-auto bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full p-3 text-white drop-shadow-md active:scale-95 transition"
              aria-label="Next photo"
            >
              <ArrowLeft className="w-6 h-6 rotate-180" />
            </button>
          ) : (
            <div />
          )}
        </div>
      )}

      {/* Info Panel */}
      {showInfo && (
        <div
          className="fixed right-0 top-0 h-full w-80 backdrop-blur-md border-l z-[10001] overflow-y-auto"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)',
            animation: 'slideInRight 0.3s ease-out',
          }}
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-xl font-bold"
                style={{ color: 'var(--text-primary)' }}
              >
                {t('common:photoInfo')}
              </h2>
              <button
                onClick={() => setShowInfo(false)}
                className="p-2 rounded-full transition"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor =
                    'var(--interactive-hover)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = 'transparent')
                }
                aria-label="Close info"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Info content */}
            <div className="space-y-4 text-sm">
              {/* Filename */}
              <div>
                <div className="mb-1" style={{ color: 'var(--text-muted)' }}>
                  {t('common:name')}
                </div>
                <div
                  className="break-all"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {photo.name || t('common:unknown')}
                </div>
              </div>

              {/* Size */}
              {photo.size && (
                <div>
                  <div className="mb-1" style={{ color: 'var(--text-muted)' }}>
                    {t('common:size')}
                  </div>
                  <div style={{ color: 'var(--text-primary)' }}>
                    {formatFileSize(photo.size)}
                  </div>
                </div>
              )}

              {/* Date taken (EXIF) */}
              {photo.dateTaken && (
                <div>
                  <div className="mb-1" style={{ color: 'var(--text-muted)' }}>
                    {t('common:dateTaken') || 'Date taken'}
                  </div>
                  <div style={{ color: 'var(--text-primary)' }}>
                    {typeof photo.dateTaken === 'string'
                      ? format(new Date(photo.dateTaken), 'PPP p')
                      : photo.dateTaken.toDate
                      ? format(photo.dateTaken.toDate(), 'PPP p')
                      : t('common:unknown')}
                  </div>
                </div>
              )}

              {/* Date uploaded - shown as secondary info */}
              {photo.uploadedAt && (
                <div>
                  <div
                    className="mb-1 text-xs"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {t('common:uploaded') || 'Uploaded'}
                  </div>
                  <div
                    className="text-xs"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {typeof photo.uploadedAt === 'string'
                      ? format(new Date(photo.uploadedAt), 'PPP')
                      : photo.uploadedAt.toDate
                      ? format(photo.uploadedAt.toDate(), 'PPP')
                      : t('common:unknown')}
                  </div>
                </div>
              )}

              {/* GPS Location (EXIF) */}
              {photo.location &&
                photo.location.latitude &&
                photo.location.longitude && (
                  <div>
                    <div
                      className="mb-1"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {t('common:location') || 'Location'}
                    </div>
                    <div
                      className="font-mono text-xs"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {photo.location.latitude.toFixed(6)},{' '}
                      {photo.location.longitude.toFixed(6)}
                    </div>
                    {photo.location.altitude && (
                      <div
                        className="text-xs mt-1"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {t('common:altitude') || 'Altitude'}:{' '}
                        {Math.round(photo.location.altitude)}m
                      </div>
                    )}
                  </div>
                )}

              {/* Camera info (EXIF) */}
              {photo.camera && (photo.camera.make || photo.camera.model) && (
                <div>
                  <div className="mb-1" style={{ color: 'var(--text-muted)' }}>
                    {t('common:camera') || 'Camera'}
                  </div>
                  <div style={{ color: 'var(--text-primary)' }}>
                    {photo.camera.make && photo.camera.model
                      ? `${photo.camera.make} ${photo.camera.model}`
                      : photo.camera.make || photo.camera.model}
                  </div>
                  {photo.camera.lens && (
                    <div
                      className="text-xs mt-1"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      {t('common:lens') || 'Lens'}: {photo.camera.lens}
                    </div>
                  )}
                </div>
              )}

              {/* Technical details (EXIF) */}
              {photo.technicalDetails &&
                (photo.technicalDetails.iso ||
                  photo.technicalDetails.shutterSpeed ||
                  photo.technicalDetails.aperture ||
                  photo.technicalDetails.focalLength) && (
                  <div>
                    <div
                      className="mb-1"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      {t('common:technicalDetails') || 'Technical Details'}
                    </div>
                    <div className="text-primary space-y-1 text-xs">
                      {photo.technicalDetails.iso && (
                        <div>ISO {photo.technicalDetails.iso}</div>
                      )}
                      {photo.technicalDetails.shutterSpeed && (
                        <div>
                          {t('common:shutterSpeed') || 'Shutter'}:{' '}
                          {photo.technicalDetails.shutterSpeed < 1
                            ? `1/${Math.round(
                                1 / photo.technicalDetails.shutterSpeed
                              )}s`
                            : `${photo.technicalDetails.shutterSpeed}s`}
                        </div>
                      )}
                      {photo.technicalDetails.aperture && (
                        <div>f/{photo.technicalDetails.aperture}</div>
                      )}
                      {photo.technicalDetails.focalLength && (
                        <div>{photo.technicalDetails.focalLength}mm</div>
                      )}
                      {(photo.technicalDetails.width ||
                        photo.technicalDetails.height) && (
                        <div>
                          {photo.technicalDetails.width} ×{' '}
                          {photo.technicalDetails.height}
                        </div>
                      )}
                    </div>
                  </div>
                )}

              {/* Album */}
              <div>
                <div className="text-muted mb-1">{t('common:album')}</div>
                <div className="text-primary">{getAlbumName()}</div>
              </div>

              {/* Resolution */}
              {(photo.width || photo.height) && (
                <div>
                  <div className="text-muted mb-1">
                    {t('common:video.resolution') || 'Resolution'}
                  </div>
                  <div className="text-primary">
                    {photo.width} × {photo.height}
                  </div>
                </div>
              )}

              {/* File type */}
              {photo.type && (
                <div>
                  <div className="text-muted mb-1">Type</div>
                  <div className="text-primary">{photo.type}</div>
                </div>
              )}

              {/* Favorite status */}
              <div>
                <div className="text-muted mb-1">{t('common:favorite')}</div>
                <div className="text-primary">
                  {photo.favorite ? '⭐ Yes' : 'No'}
                </div>
              </div>

              {/* Caption (if exists) */}
              {photo.caption && (
                <div>
                  <div className="text-muted mb-1">{t('common:caption')}</div>
                  <div className="text-primary break-words">
                    {photo.caption}
                  </div>
                </div>
              )}

              {/* Tags Section */}
              <div>
                <div
                  className="mb-2 flex items-center gap-2"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <TagIcon className="w-4 h-4" />
                  <span>Tags</span>
                </div>
                <TagInput
                  tags={photo.tags || []}
                  onAddTag={(tag) => addTag(photo.id, tag)}
                  onRemoveTag={(tag) => removeTag(photo.id, tag)}
                  suggestions={tagSuggestions}
                  placeholder="Legg til tag (f.eks. familie, sommer, hytta)"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Action Bar */}
      <div
        className={`sm:hidden fixed bottom-0 inset-x-0 z-[10000] backdrop-blur-xl border-t transition-opacity duration-300 mobile-bottom-bar ${
          uiVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          backgroundColor: 'var(--glass-bg)',
          borderColor: 'var(--glass-border)',
          paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))',
        }}
      >
        <div className="flex items-center justify-around h-16 px-4">
          {/* Favorite */}
          <button
            onClick={handleToggleFavorite}
            className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] rounded-lg transition active:scale-95 ${
              photo.favorite ? 'text-red-500' : ''
            }`}
            style={{
              color: photo.favorite
                ? 'var(--color-error)'
                : 'var(--text-primary)',
            }}
            aria-label="Toggle favorite"
          >
            <Heart
              className="w-6 h-6"
              fill={photo.favorite ? 'currentColor' : 'none'}
            />
            <span className="text-xs mt-1" style={{ color: 'inherit' }}>
              {photo.favorite ? 'Loved' : 'Love'}
            </span>
          </button>

          {/* Edit */}
          <button
            onClick={() => {
              if (import.meta.env.DEV)
                console.log(
                  '✏️ Edit button clicked (mobile), navigating to editor'
                )
              navigate(`/edit/${id}`)
            }}
            className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] rounded-lg transition active:scale-95"
            style={{ color: 'var(--text-primary)' }}
            aria-label={t('common:edit')}
          >
            <Edit2 className="w-6 h-6" />
            <span className="text-xs mt-1">{t('common:edit')}</span>
          </button>

          {/* Delete */}
          <button
            onClick={handleDelete}
            className="flex flex-col items-center justify-center min-w-[44px] min-h-[44px] rounded-lg transition active:scale-95"
            style={{ color: 'var(--text-primary)' }}
            aria-label={t('common:delete')}
          >
            <Trash2 className="w-6 h-6" />
            <span className="text-xs mt-1">{t('common:delete')}</span>
          </button>

          {/* Info */}
          <button
            onClick={handleToggleInfo}
            className={`flex flex-col items-center justify-center min-w-[44px] min-h-[44px] rounded-lg transition active:scale-95 ${
              showInfo ? 'text-blue-400' : ''
            }`}
            style={{
              color: showInfo ? 'var(--color-info)' : 'var(--text-primary)',
            }}
            aria-label={t('common:showInfo')}
          >
            <Info className="w-6 h-6" />
            <span className="text-xs mt-1">{t('common:info') || 'Info'}</span>
          </button>
        </div>
      </div>

      {/* Inline keyframe animation */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <ConfirmModal
          isOpen={showDeleteConfirm}
          title={t('common:notifications.deletePhotoTitle')}
          message={t('common:notifications.deletePhotoMessage')}
          confirmLabel={t('common:delete')}
          cancelLabel={t('common:cancel')}
          onConfirm={executeDelete}
          onClose={() => {
            if (import.meta.env.DEV) console.log('❌ Delete cancelled')
            setShowDeleteConfirm(false)
          }}
        />
      )}
    </div>
  )
}
