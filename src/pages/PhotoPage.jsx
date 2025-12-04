// ============================================================================
// PhotoPage - Phase 2A: Fullscreen Photo Viewer
// ============================================================================
import React, { useEffect, useState, useRef, useCallback } from 'react'
import { updatePhoto } from '../firebase'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import {
  ArrowLeft,
  Heart,
  Info,
  MoreVertical,
  Presentation,
} from 'lucide-react'
import { format } from 'date-fns'
import useStore from '../state/store'
import { usePhotoById } from '../hooks/usePhotoById'
import { usePhotoContext } from '../hooks/usePhotoContext'
import { usePrefetchAdjacentPhotos } from '../hooks/usePrefetchAdjacentPhotos'

export default function PhotoPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  // State
  const [uiVisible, setUiVisible] = useState(true)
  const [imageLoaded, setImageLoaded] = useState(false)
  const uiTimerRef = useRef(null)
  const touchStartX = useRef(0)
  const touchEndX = useRef(0)

  // Store
  const setIsWorldView = useStore((state) => state.setIsWorldView)
  const photos = useStore((state) => state.photos)
  const updatePhoto = useStore((state) => state.updatePhoto)

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

    const newFavoriteStatus = !photo.favorite

    // Optimistic update
    updatePhoto(photo.id, { favorite: newFavoriteStatus })

    try {
      await updatePhoto(photo.id, { favorite: newFavoriteStatus })
    } catch (err) {
      console.error('Error updating favorite:', err)
      // Revert UI state on error
      updatePhoto(photo.id, { favorite: !newFavoriteStatus })
    }

    resetUiTimer()
  }, [photo, updatePhoto, resetUiTimer])

  // Start slideshow - Phase 2B
  const handleStartSlideshow = useCallback(() => {
    if (!photo) return
    // Navigate to slideshow page with current photo
    navigate(`/slideshow/${photo.id}`, { state: { from: location } })
  }, [photo, navigate, location])

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
        className={`fixed top-0 inset-x-0 z-[10000] h-14 transition-opacity duration-300 ${
          uiVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%)',
        }}
      >
        <div className="flex items-center justify-between px-4 h-full">
          {/* Left: Back button */}
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-white hover:bg-white/10 rounded-full p-2 transition active:scale-95"
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
          <div className="flex items-center gap-1">
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
              onClick={() => {
                // TODO: Show info modal in future phase
                console.log('Info clicked')
                resetUiTimer()
              }}
              className="text-white hover:bg-white/10 p-2 rounded-full transition active:scale-95"
              aria-label="Photo info"
            >
              <Info className="w-5 h-5" />
            </button>

            {/* More menu */}
            <button
              onClick={() => {
                // TODO: Show more menu in future phase
                console.log('More clicked')
                resetUiTimer()
              }}
              className="text-white hover:bg-white/10 p-2 rounded-full transition active:scale-95"
              aria-label="More options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Image Canvas */}
      <main className="flex-1 flex items-center justify-center p-0">
        <img
          src={photo.displayUrl || photo.url}
          alt={photo.caption || photo.name || 'Photo'}
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
          className={`fixed inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 pointer-events-none transition-opacity duration-300 ${
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
    </div>
  )
}
