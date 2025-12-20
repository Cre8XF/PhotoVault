// ============================================================================
// PhotoPage - Phase 2A: Fullscreen Photo Viewer + XSS Protection
// ============================================================================
import React, { useEffect, useState, useRef, useCallback } from 'react'
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
} from 'lucide-react'
import { format } from 'date-fns'
import { useTranslation } from 'react-i18next'
import useStore from '../state/store'
import { usePhotoById } from '../hooks/usePhotoById'
import { usePhotoContext } from '../hooks/usePhotoContext'
import { usePrefetchAdjacentPhotos } from '../hooks/usePrefetchAdjacentPhotos'
import { deletePhoto as firebaseDeletePhoto } from '../firebase'
import ConfirmModal from '../components/ConfirmModal'
import { sanitizeImageUrl, PLACEHOLDER_IMAGE } from '../utils/security'

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

  // Prefetch adjacent photos
  usePrefetchAdjacentPhotos(photoOrder, photoIndex, photos)

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

  // Handle navigation
  const handleNext = useCallback(() => {
    if (!Array.isArray(photoOrder) || photoOrder.length === 0) return
    if (photoIndex >= photoOrder.length - 1) return // Hard boundary

    const nextIndex = photoIndex + 1
    const nextId = photoOrder[nextIndex]

    setPhotoIndex(nextIndex)
    setCurrentPhotoId(nextId)
    setImageLoaded(false)
    navigate(`/photo/${nextId}`, { replace: true })
    resetUiTimer()
  }, [
    photoOrder,
    photoIndex,
    setPhotoIndex,
    setCurrentPhotoId,
    navigate,
    resetUiTimer,
  ])

  const handlePrev = useCallback(() => {
    if (!Array.isArray(photoOrder) || photoOrder.length === 0) return
    if (photoIndex <= 0) return // Hard boundary

    const prevIndex = photoIndex - 1
    const prevId = photoOrder[prevIndex]

    setPhotoIndex(prevIndex)
    setCurrentPhotoId(prevId)
    setImageLoaded(false)
    navigate(`/photo/${prevId}`, { replace: true })
    resetUiTimer()
  }, [
    photoOrder,
    photoIndex,
    setPhotoIndex,
    setCurrentPhotoId,
    navigate,
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

    console.log('🎯 PhotoPage.handleToggleFavorite called:', {
      photoId: photo.id,
      currentFavorite: photo.favorite,
      timestamp: new Date().toISOString()
    })

    const newFavoriteStatus = !photo.favorite

    // Optimistic update in Zustand
    console.log('⚡ Optimistically updating Zustand store...')
    updatePhotoInStore(photo.id, { favorite: newFavoriteStatus })

    try {
      // Sync to Firestore using toggleFavorite
      console.log('🔥 Calling firebase.toggleFavorite()...')
      const result = await firebaseToggleFavorite(photo.id, photo.favorite)
      console.log('✅ firebase.toggleFavorite() returned:', result)
    } catch (err) {
      console.error('❌ PhotoPage favorite toggle failed:', err)
      // Revert UI state on error
      console.log('↩️ Reverting optimistic update...')
      updatePhotoInStore(photo.id, { favorite: !newFavoriteStatus })
    }

    resetUiTimer()
  }, [photo, updatePhotoInStore, resetUiTimer])

  // Start slideshow - Phase 2B
  const handleStartSlideshow = useCallback(() => {
    if (!photo) return
    // Navigate to slideshow page with current photo
    navigate(`/slideshow/${photo.id}`, { state: { from: location } })
  }, [photo, navigate, location])

  // Delete photo
  const handleDelete = useCallback(() => {
    if (!photo) return

    console.log('🗑️ PhotoPage: Delete button clicked, showing confirm modal')
    setShowDeleteConfirm(true)
    resetUiTimer()
  }, [photo, resetUiTimer])

  // Execute delete after confirmation
  const executeDelete = useCallback(async () => {
    if (!photo) return

    console.log('✅ Delete confirmed, executing...')
    console.log('🗑️ Deleting photo:', {
      photoId: photo.id,
      storagePath: photo.storagePath,
      filename: photo.name
    })

    // CRITICAL: Navigate away IMMEDIATELY to prevent "Photo not found" error
    // The usePhotoById hook will try to re-fetch the photo after deletion,
    // causing a "not found" error. By navigating first, we unmount the component
    // before that can happen.
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
      console.log('🗑️ Deleting photo from Firebase in background...')
      await firebaseDeletePhoto(photo.id, photo.storagePath)
      console.log('✅ Photo deleted successfully from Firebase')

      // Show success notification (user already on Home page)
      setNotification({
        message: t('common:notifications.photoDeleted'),
        type: 'success'
      })
    } catch (error) {
      console.error('❌ Background delete failed:', error)

      // Show error notification (user already on Home page)
      setNotification({
        message: t('common:notifications.photoDeleteError') || 'Failed to delete photo',
        type: 'error'
      })

      // Note: Photo already removed from UI, so error is just logged
      // Consider refreshing data from server to restore photo if needed
    }
  }, [photo, deletePhotoFromStore, setNotification, handleBack, t, setShowDeleteConfirm])

  // Toggle info panel
  const handleToggleInfo = useCallback(() => {
    console.log('ℹ️ PhotoPage: Info toggled', {
      photoId: photo?.id,
      currentState: showInfo
    })
    setShowInfo(!showInfo)
    resetUiTimer()
  }, [photo, showInfo, resetUiTimer])

  // Download photo
  const handleDownload = useCallback(() => {
    if (!photo) return

    console.log('📥 PhotoPage: Download clicked', { photoId: photo.id })

    const link = document.createElement('a')
    link.href = photo.url
    link.download = photo.name || 'photo.jpg'
    link.click()

    setShowMoreMenu(false)
    resetUiTimer()
  }, [photo, resetUiTimer])

  // Share photo
  const handleShare = useCallback(() => {
    if (!photo) return

    console.log('🔗 PhotoPage: Share clicked', { photoId: photo.id })

    if (navigator.share) {
      navigator.share({
        title: photo.name || 'Photo',
        url: photo.url
      }).catch(err => {
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
  const formatFileSize = useCallback((bytes) => {
    if (!bytes) return t('common:unknown')
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }, [t])

  // Get album name
  const getAlbumName = useCallback(() => {
    if (!photo?.albumId) return t('common:unassigned')
    const album = albums.find(a => a.id === photo.albumId)
    return album?.name || t('common:unknown')
  }, [photo, albums, t])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowRight':
          handleNext()
          break
        case 'ArrowLeft':
          handlePrev()
          break
        case 'Escape':
          handleBack()
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleNext, handlePrev, handleBack])

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

  // Format date for title
  const getPhotoTitle = () => {
    if (!photo) return ''
    if (photo.caption) return photo.caption
    if (photo.createdAt) {
      try {
        return format(new Date(photo.createdAt), 'MMMM d, yyyy')
      } catch {
        return photo.name || 'Photo'
      }
    }
    return photo.name || 'Photo'
  }

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center">
        <div className="spinner" />
      </div>
    )
  }

  // Error state
  if (error || !photo) {
    return (
      <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center text-white">
        <div className="text-center max-w-sm px-4">
          <p className="text-lg font-semibold mb-2">Error</p>
          <p className="text-white/60 mb-4">{error || 'Photo not found'}</p>
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full transition"
          >
            Go back
          </button>
        </div>
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
          color: 'var(--text-primary)'
        }}
      >
        <div className="flex items-center justify-between px-4 h-full">
          {/* Left: Back button */}
          <button
            onClick={handleBack}
            className="flex items-center gap-2 rounded-full p-2 transition active:scale-95"
            style={{ color: 'var(--text-primary)' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--interactive-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            aria-label="Go back"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          {/* Center: Title */}
          <div className="flex-1 text-center px-4">
            <h1 className="text-white text-sm font-medium truncate">
              {getPhotoTitle()}
            </h1>
            {photoContext && photoOrder && photoOrder.length > 0 && (
              <p className="text-white/60 text-xs">
                {photoIndex + 1} / {photoOrder.length}
              </p>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1 relative">
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

            {/* Edit button */}
            <button
              onClick={() => {
                console.log('✏️ Edit button clicked, navigating to editor')
                navigate(`/edit/${id}`)
              }}
              className="text-white hover:bg-blue-500/10 hover:text-blue-400 p-2 rounded-full transition active:scale-95"
              aria-label={t('common:edit')}
              title={t('common:edit')}
            >
              <Edit2 className="w-5 h-5" />
            </button>

            {/* Delete button */}
            <button
              onClick={handleDelete}
              className="text-white hover:bg-red-500/10 hover:text-red-400 p-2 rounded-full transition active:scale-95"
              aria-label={t('common:delete')}
            >
              <Trash2 className="w-5 h-5" />
            </button>

            {/* Slideshow button - Phase 2B */}
            {photoOrder && photoOrder.length > 1 && (
              <button
                onClick={handleStartSlideshow}
                className="text-white hover:bg-white/10 p-2 rounded-full transition active:scale-95"
                aria-label="Start slideshow"
              >
                <Presentation className="w-5 h-5" />
              </button>
            )}

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

      {/* Image Canvas */}
      <main className="flex-1 flex items-center justify-center p-0">
        <img
          src={sanitizeImageUrl(photo.displayUrl || photo.url, PLACEHOLDER_IMAGE)}
          alt={photo.caption || photo.name || 'Photo'}
          onError={(e) => {
            console.error('❌ Failed to load photo:', photo.displayUrl || photo.url)
            e.target.src = PLACEHOLDER_IMAGE
          }}
          className={`max-w-full max-h-[100vh] object-contain transition-opacity duration-300 cursor-pointer ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onClick={handleImageClick}
          draggable={false}
        />

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
          className="fixed right-0 top-0 h-full w-80 bg-black/95 backdrop-blur-md border-l border-white/10 z-[10001] overflow-y-auto text-on-glass"
          style={{
            animation: 'slideInRight 0.3s ease-out'
          }}
        >
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                {t('common:photoInfo')}
              </h2>
              <button
                onClick={() => setShowInfo(false)}
                className="text-white/60 hover:text-white hover:bg-white/10 p-2 rounded-full transition"
                aria-label="Close info"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Info content */}
            <div className="space-y-4 text-sm">
              {/* Filename */}
              <div>
                <div className="text-white/60 mb-1">{t('common:name')}</div>
                <div className="text-white break-all">
                  {photo.name || t('common:unknown')}
                </div>
              </div>

              {/* Size */}
              {photo.size && (
                <div>
                  <div className="text-white/60 mb-1">{t('common:size')}</div>
                  <div className="text-white">{formatFileSize(photo.size)}</div>
                </div>
              )}

              {/* Date taken (EXIF) */}
              {photo.dateTaken && (
                <div>
                  <div className="text-white/60 mb-1">{t('common:dateTaken') || 'Date taken'}</div>
                  <div className="text-white">
                    {typeof photo.dateTaken === 'string'
                      ? format(new Date(photo.dateTaken), 'PPP p')
                      : photo.dateTaken.toDate
                      ? format(photo.dateTaken.toDate(), 'PPP p')
                      : t('common:unknown')}
                  </div>
                </div>
              )}

              {/* Date uploaded */}
              {photo.uploadedAt && (
                <div>
                  <div className="text-white/60 mb-1">{t('common:uploaded')}</div>
                  <div className="text-white">
                    {typeof photo.uploadedAt === 'string'
                      ? format(new Date(photo.uploadedAt), 'PPP')
                      : photo.uploadedAt.toDate
                      ? format(photo.uploadedAt.toDate(), 'PPP')
                      : t('common:unknown')}
                  </div>
                </div>
              )}

              {/* GPS Location (EXIF) */}
              {photo.location && photo.location.latitude && photo.location.longitude && (
                <div>
                  <div className="text-white/60 mb-1">{t('common:location') || 'Location'}</div>
                  <div className="text-white font-mono text-xs">
                    {photo.location.latitude.toFixed(6)}, {photo.location.longitude.toFixed(6)}
                  </div>
                  {photo.location.altitude && (
                    <div className="text-white/70 text-xs mt-1">
                      {t('common:altitude') || 'Altitude'}: {Math.round(photo.location.altitude)}m
                    </div>
                  )}
                </div>
              )}

              {/* Camera info (EXIF) */}
              {photo.camera && (photo.camera.make || photo.camera.model) && (
                <div>
                  <div className="text-white/60 mb-1">{t('common:camera') || 'Camera'}</div>
                  <div className="text-white">
                    {photo.camera.make && photo.camera.model
                      ? `${photo.camera.make} ${photo.camera.model}`
                      : photo.camera.make || photo.camera.model}
                  </div>
                  {photo.camera.lens && (
                    <div className="text-white/70 text-xs mt-1">
                      {t('common:lens') || 'Lens'}: {photo.camera.lens}
                    </div>
                  )}
                </div>
              )}

              {/* Technical details (EXIF) */}
              {photo.technicalDetails && (photo.technicalDetails.iso || photo.technicalDetails.shutterSpeed || photo.technicalDetails.aperture || photo.technicalDetails.focalLength) && (
                <div>
                  <div className="text-white/60 mb-1">{t('common:technicalDetails') || 'Technical Details'}</div>
                  <div className="text-white space-y-1 text-xs">
                    {photo.technicalDetails.iso && (
                      <div>ISO {photo.technicalDetails.iso}</div>
                    )}
                    {photo.technicalDetails.shutterSpeed && (
                      <div>
                        {t('common:shutterSpeed') || 'Shutter'}: {
                          photo.technicalDetails.shutterSpeed < 1
                            ? `1/${Math.round(1 / photo.technicalDetails.shutterSpeed)}s`
                            : `${photo.technicalDetails.shutterSpeed}s`
                        }
                      </div>
                    )}
                    {photo.technicalDetails.aperture && (
                      <div>f/{photo.technicalDetails.aperture}</div>
                    )}
                    {photo.technicalDetails.focalLength && (
                      <div>{photo.technicalDetails.focalLength}mm</div>
                    )}
                    {(photo.technicalDetails.width || photo.technicalDetails.height) && (
                      <div>
                        {photo.technicalDetails.width} × {photo.technicalDetails.height}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Album */}
              <div>
                <div className="text-white/60 mb-1">{t('common:album')}</div>
                <div className="text-white">{getAlbumName()}</div>
              </div>

              {/* Resolution */}
              {(photo.width || photo.height) && (
                <div>
                  <div className="text-white/60 mb-1">
                    {t('common:video.resolution') || 'Resolution'}
                  </div>
                  <div className="text-white">
                    {photo.width} × {photo.height}
                  </div>
                </div>
              )}

              {/* File type */}
              {photo.type && (
                <div>
                  <div className="text-white/60 mb-1">Type</div>
                  <div className="text-white">{photo.type}</div>
                </div>
              )}

              {/* Favorite status */}
              <div>
                <div className="text-white/60 mb-1">{t('common:favorite')}</div>
                <div className="text-white">
                  {photo.favorite ? '⭐ Yes' : 'No'}
                </div>
              </div>

              {/* Caption (if exists) */}
              {photo.caption && (
                <div>
                  <div className="text-white/60 mb-1">{t('common:caption')}</div>
                  <div className="text-white break-words">{photo.caption}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
            console.log('❌ Delete cancelled')
            setShowDeleteConfirm(false)
          }}
        />
      )}
    </div>
  )
}
