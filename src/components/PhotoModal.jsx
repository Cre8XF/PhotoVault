// ============================================================================
// COMPONENT: PhotoModal.jsx – v5.0 Google Photos-Style Redesign
// ============================================================================
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  X,
  ArrowLeft,
  ArrowRight,
  Download,
  Info,
  Star,
  Calendar,
  Tag,
  Sparkles,
  Users,
  Edit2,
  Presentation,
} from 'lucide-react'
import useAuth from '../hooks/useAuth'
import useStore from '../state/store'
import { formatDuration, formatFileSize } from '../utils/videoTools'
import PhotoEditor from '../features/editor/components/PhotoEditor'
import { saveEditedPhoto } from '../features/editor'
import SlideshowControls from './SlideshowControls'

const PhotoModal = ({
  photos,
  currentIndex,
  onClose,
  onToggleFavorite,
  onPhotoEdited,
}) => {
  const { t } = useTranslation(['common'])
  const { user } = useAuth()
  const [index, setIndex] = useState(currentIndex)
  const [showInfo, setShowInfo] = useState(false)
  const [showEditor, setShowEditor] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const photo = photos[index]
  const startX = useRef(0)

  // Caption state
  const [captionValue, setCaptionValue] = useState(photo?.caption || '')
  const [isEditingCaption, setIsEditingCaption] = useState(false)
  const [isSavingCaption, setIsSavingCaption] = useState(false)

  // Slideshow state
  const [slideshowActive, setSlideshowActive] = useState(false)
  const [slideshowPlaying, setSlideshowPlaying] = useState(false)
  const [slideshowInterval, setSlideshowInterval] = useState(3) // seconds

  // Global fullscreen state from Zustand
  const isFullscreen = useStore((state) => state.isFullscreen)
  const setIsFullscreen = useStore((state) => state.setIsFullscreen)

  // Auto-hide UI state (Google Photos style)
  const [uiVisible, setUiVisible] = useState(true)
  const uiTimerRef = useRef(null)

  // Auto-hide UI after 3 seconds of inactivity
  const resetUiTimer = () => {
    setUiVisible(true)

    if (uiTimerRef.current) {
      clearTimeout(uiTimerRef.current)
    }

    uiTimerRef.current = setTimeout(() => {
      setUiVisible(false)
    }, 3000)
  }

  // Handle tap/click on image to toggle UI
  const handleToggleUi = () => {
    if (uiVisible) {
      // Hide immediately
      setUiVisible(false)
      if (uiTimerRef.current) {
        clearTimeout(uiTimerRef.current)
      }
    } else {
      // Show and start timer
      resetUiTimer()
    }
  }

  // Reset UI timer when slideshow is active and UI should auto-hide
  useEffect(() => {
    if (slideshowActive || isFullscreen) {
      resetUiTimer()
    }

    return () => {
      if (uiTimerRef.current) {
        clearTimeout(uiTimerRef.current)
      }
    }
  }, [slideshowActive, isFullscreen])

  const nextPhoto = () => {
    setImageLoaded(false)
    setIndex((i) => (i + 1) % photos.length)
    resetUiTimer()
  }

  const prevPhoto = () => {
    setImageLoaded(false)
    setIndex((i) => (i - 1 + photos.length) % photos.length)
    resetUiTimer()
  }

  // Handle close - clear fullscreen state
  const handleClose = () => {
    setIsFullscreen(false)
    setSlideshowActive(false)
    setSlideshowPlaying(false)
    onClose()
  }

  useEffect(() => {
    const handleKey = (e) => {
      if (!photo) return

      // Don't handle keys if editor is open
      if (showEditor) return

      switch (e.key) {
        case 'ArrowRight':
          nextPhoto()
          break
        case 'ArrowLeft':
          prevPhoto()
          break
        case 'Escape':
          // If slideshow is active, exit slideshow but keep modal open
          if (slideshowActive) {
            setSlideshowActive(false)
            setSlideshowPlaying(false)
            setIsFullscreen(false)
          } else {
            handleClose()
          }
          break
        case 'i':
        case 'I':
          if (!isFullscreen) {
            setShowInfo((s) => !s)
          }
          break
        case 'f':
        case 'F':
          setIsFullscreen((prev) => !prev)
          break
        default:
          break
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [photo, photos.length, slideshowActive, isFullscreen, showEditor])

  // Update caption value when photo changes
  useEffect(() => {
    setCaptionValue(photo?.caption || '')
    setIsEditingCaption(false)
  }, [photo?.id])

  // Slideshow auto-advance (only when playing)
  useEffect(() => {
    if (!slideshowActive || !slideshowPlaying) return

    const timer = setTimeout(() => {
      nextPhoto()
    }, slideshowInterval * 1000)

    return () => clearTimeout(timer)
  }, [slideshowActive, slideshowPlaying, slideshowInterval, index])

  // Auto-enable fullscreen when slideshow starts
  useEffect(() => {
    if (slideshowActive) {
      setIsFullscreen(true)
    }
  }, [slideshowActive])

  // Keyboard shortcuts for slideshow - Spacebar to pause/play
  useEffect(() => {
    if (!slideshowActive) return

    const handleKeyPress = (e) => {
      if (e.key === ' ') {
        e.preventDefault()
        setSlideshowPlaying((prev) => !prev)
        resetUiTimer()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [slideshowActive])

  // Listen for external slideshow trigger
  useEffect(() => {
    const handleStartSlideshow = () => {
      setSlideshowActive(true)
      setSlideshowPlaying(true)
    }

    window.addEventListener('startSlideshow', handleStartSlideshow)
    return () => window.removeEventListener('startSlideshow', handleStartSlideshow)
  }, [])

  const handleTouchStart = (e) => {
    if (showEditor) return
    startX.current = e.touches[0].clientX
  }

  const handleTouchEnd = (e) => {
    if (showEditor) return
    const diff = e.changedTouches[0].clientX - startX.current
    if (diff > 50) prevPhoto()
    if (diff < -50) nextPhoto()
  }

  const handleDownload = async () => {
    try {
      const response = await fetch(photo.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${photo.name || 'photo'}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Download error:', err)
    }
  }

  const handleEditClick = () => {
    if (photo.type === 'video') {
      alert(t('common:grid.videoEditingNotSupported'))
      return
    }

    const resolvedUrl =
      photo.fullUrl ||
      photo.downloadUrl ||
      photo.url ||
      photo.src ||
      photo.path ||
      ''

    console.log('📸 Opening editor with URL:', resolvedUrl)
    if (!resolvedUrl) {
      console.error('❌ No valid image URL found for photo:', photo)
      alert(t('common:grid.noImageUrl'))
      return
    }

    setShowEditor(true)
  }

  const handleEditSave = async (blob, originalPhoto) => {
    try {
      if (!user?.uid) {
        throw new Error('User not authenticated')
      }

      console.log('💾 Saving edited photo...')
      const newPhoto = await saveEditedPhoto(blob, originalPhoto, user.uid)
      console.log('✅ Photo saved successfully:', newPhoto.id)

      if (onPhotoEdited) {
        onPhotoEdited(newPhoto)
      }

      setShowEditor(false)
      alert(t('common:grid.photoSaved'))
    } catch (error) {
      console.error('❌ Failed to save edited photo:', error)
      alert(t('common:grid.photoSaveError'))
    }
  }

  const handleEditorClose = () => {
    setShowEditor(false)
  }

  const handleSaveCaption = async () => {
    if (isSavingCaption) return

    setIsSavingCaption(true)
    try {
      const { updatePhotoCaption } = await import('../firebase')
      await updatePhotoCaption(photo.id, captionValue, user.uid)

      photo.caption = captionValue
      setIsEditingCaption(false)
    } catch (error) {
      console.error('Error saving caption:', error)
      alert('Could not save caption. Please try again.')
    } finally {
      setIsSavingCaption(false)
    }
  }

  const handleCancelCaption = () => {
    setCaptionValue(photo.caption || '')
    setIsEditingCaption(false)
  }

  if (!photo) return null

  const formatDate = (dateStr) => {
    if (!dateStr) return t('common:unknown')
    const d = new Date(dateStr)
    return d.toLocaleDateString('no-NO', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div
      className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ===================================================================== */}
      {/* CLOSE BUTTON - Always visible, top-right */}
      {/* ===================================================================== */}
      <button
        className="fixed top-4 right-4 z-[10001] p-3 rounded-full bg-black/40 dark:bg-black/60 backdrop-blur-md text-white drop-shadow-md active:scale-95 transition"
        onClick={handleClose}
        aria-label={t('common:close')}
      >
        <X className="w-6 h-6" />
      </button>

      {/* ===================================================================== */}
      {/* TOP BAR - Auto-hide in fullscreen/slideshow */}
      {/* ===================================================================== */}
      {!isFullscreen && !slideshowActive && (
        <div
          className={`absolute top-0 left-0 right-0 bg-gradient-to-b from-black/90 via-black/60 to-transparent px-4 py-4 z-[9998] transition-opacity duration-300 ${
            uiVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex items-center justify-between w-full">
            <div
              className="bg-white/90 backdrop-blur-md text-gray-900 text-sm font-semibold px-4 py-2 rounded-lg shadow-lg select-none"
              aria-label={`${index + 1} av ${photos.length} bilder`}
            >
              {index + 1} / {photos.length}
            </div>

            <div className="flex items-center gap-2">
              {onToggleFavorite && (
                <button
                  aria-label={
                    photo.favorite
                      ? t('common:removeFavorite')
                      : t('common:addToFavorites')
                  }
                  onClick={(e) => {
                    e.stopPropagation()
                    onToggleFavorite(photo)
                    resetUiTimer()
                  }}
                  className={`p-3 rounded-full backdrop-blur-md text-white drop-shadow-md active:scale-95 transition ${
                    photo.favorite
                      ? 'bg-yellow-500/90 hover:bg-yellow-600'
                      : 'bg-black/40 dark:bg-black/60 hover:bg-black/50'
                  }`}
                  title={
                    photo.favorite
                      ? t('common:removeFavorite')
                      : t('common:addToFavorites')
                  }
                >
                  <Star
                    className="w-5 h-5"
                    fill={photo.favorite ? 'currentColor' : 'none'}
                  />
                </button>
              )}

              <button
                aria-label={t('common:showInfo')}
                onClick={(e) => {
                  e.stopPropagation()
                  setShowInfo(!showInfo)
                  resetUiTimer()
                }}
                className={`p-3 rounded-full backdrop-blur-md text-white drop-shadow-md active:scale-95 transition ${
                  showInfo
                    ? 'bg-purple-600/90 hover:bg-purple-700'
                    : 'bg-black/40 dark:bg-black/60 hover:bg-black/50'
                }`}
                title={t('common:showInfo')}
              >
                <Info className="w-5 h-5" />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setSlideshowActive(true)
                  setSlideshowPlaying(true)
                }}
                className="p-3 rounded-full bg-black/40 dark:bg-black/60 backdrop-blur-md hover:bg-black/50 text-white drop-shadow-md active:scale-95 transition"
                title={t('common:slideshow.start')}
              >
                <Presentation className="w-5 h-5" />
              </button>

              {photo.type !== 'video' && (
                <button
                  aria-label={t('common:edit')}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEditClick()
                  }}
                  className="p-3 rounded-full bg-black/40 dark:bg-black/60 backdrop-blur-md hover:bg-black/50 text-white drop-shadow-md active:scale-95 transition"
                  title={t('common:edit')}
                >
                  <Edit2 className="w-5 h-5" />
                </button>
              )}

              <button
                aria-label={t('common:download')}
                onClick={(e) => {
                  e.stopPropagation()
                  handleDownload()
                }}
                className="p-3 rounded-full bg-black/40 dark:bg-black/60 backdrop-blur-md hover:bg-black/50 text-white drop-shadow-md active:scale-95 transition"
                title={t('common:download')}
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* NAVIGATION BUTTONS - Auto-hide */}
      {/* ===================================================================== */}
      {photos.length > 1 && !showEditor && (
        <>
          <button
            aria-label={t('common:previous')}
            className={`hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2
                       p-4 rounded-full bg-black/40 dark:bg-black/60 backdrop-blur-md
                       hover:bg-black/50 text-white drop-shadow-md active:scale-95
                       transition-all z-[9998] ${
                         uiVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
                       }`}
            onClick={(e) => {
              e.stopPropagation()
              prevPhoto()
            }}
            title={t('common:previous')}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <button
            aria-label={t('common:next')}
            className={`hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2
                       p-4 rounded-full bg-black/40 dark:bg-black/60 backdrop-blur-md
                       hover:bg-black/50 text-white drop-shadow-md active:scale-95
                       transition-all z-[9998] ${
                         uiVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
                       }`}
            onClick={(e) => {
              e.stopPropagation()
              nextPhoto()
            }}
            title={t('common:next')}
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* ===================================================================== */}
      {/* MAIN IMAGE/VIDEO - Tap to toggle UI */}
      {/* ===================================================================== */}
      <div
        onClick={handleToggleUi}
        className="w-full h-full flex items-center justify-center"
      >
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="spinner" />
          </div>
        )}

        {photo.type === 'video' ? (
          <video
            key={photo.id}
            controls
            poster={photo.thumbnailUrl}
            className="max-w-full max-h-[95vh] object-contain shadow-2xl"
            onLoadedData={() => setImageLoaded(true)}
            autoPlay
          >
            <source src={photo.url} type="video/mp4" />
            <source src={photo.url} type="video/quicktime" />
            <source src={photo.url} type="video/webm" />
            {t('common:video.notSupported')}
          </video>
        ) : (
          <img
            src={photo.url}
            alt={photo.name || ''}
            className={`max-w-full max-h-[95vh] object-contain shadow-2xl transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
          />
        )}
      </div>

      {/* ===================================================================== */}
      {/* INFO PANEL - Hidden in fullscreen */}
      {/* ===================================================================== */}
      {showInfo && !isFullscreen && !slideshowActive && (
        <div
          role="dialog"
          tabIndex="0"
          aria-label={t('common:photoInfo')}
          className="absolute right-4 top-20 bottom-4 w-80 bg-gray-900/95 backdrop-blur-xl rounded-2xl p-6 overflow-y-auto shadow-2xl border border-white/10 z-[9998]"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-lg font-semibold mb-4 text-white">
            {t('common:photoInfo')}
          </h3>

          <div className="space-y-4 text-sm">
            {/* Name */}
            <div>
              <p className="text-gray-400 mb-1">{t('common:name')}</p>
              <p className="text-white font-medium">
                {photo.name || t('common:noName')}
              </p>
            </div>

            {/* Date */}
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-gray-400 mb-1">{t('common:uploaded')}</p>
                <p className="text-white">{formatDate(photo.createdAt)}</p>
              </div>
            </div>

            {/* Size */}
            {photo.size && (
              <div>
                <p className="text-gray-400 mb-1">{t('common:size')}</p>
                <p className="text-white">{formatFileSize(photo.size)}</p>
              </div>
            )}

            {/* Video metadata */}
            {photo.type === 'video' && photo.metadata && (
              <>
                {photo.metadata.duration && (
                  <div>
                    <p className="text-gray-400 mb-1">{t('common:video.duration')}</p>
                    <p className="text-white">
                      {formatDuration(photo.metadata.duration)}
                    </p>
                  </div>
                )}
                {photo.metadata.resolution && (
                  <div>
                    <p className="text-gray-400 mb-1">{t('common:video.resolution')}</p>
                    <p className="text-white">{photo.metadata.resolution}</p>
                  </div>
                )}
              </>
            )}

            {/* Favorite */}
            <div>
              <p className="text-gray-400 mb-1">{t('common:status')}</p>
              <div className="flex items-center gap-2">
                {photo.favorite ? (
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs flex items-center gap-1">
                    <Star className="w-3 h-3" fill="currentColor" />
                    {t('common:favorite')}
                  </span>
                ) : (
                  <span className="text-gray-500 text-xs">
                    {t('common:notFavorite')}
                  </span>
                )}
              </div>
            </div>

            {/* Caption */}
            <div className="border-t border-white/10 pt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400">{t('common:caption')}</p>
                {!isEditingCaption && (
                  <button
                    onClick={() => setIsEditingCaption(true)}
                    className="text-xs text-purple-400 hover:text-purple-300 transition"
                  >
                    {photo.caption ? t('common:edit') : t('common:addCaption')}
                  </button>
                )}
              </div>

              {isEditingCaption ? (
                <div className="space-y-2">
                  <textarea
                    value={captionValue}
                    onChange={(e) => setCaptionValue(e.target.value)}
                    autoFocus
                    rows={3}
                    maxLength={500}
                    placeholder={t('common:captionPlaceholder')}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-purple-400 transition resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {captionValue.length}/500
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancelCaption}
                        disabled={isSavingCaption}
                        className="px-3 py-1 text-xs rounded-lg bg-white/5 hover:bg-white/10 transition disabled:opacity-50"
                      >
                        {t('common:cancel')}
                      </button>
                      <button
                        onClick={handleSaveCaption}
                        disabled={isSavingCaption}
                        className="px-3 py-1 text-xs rounded-lg bg-purple-600 hover:bg-purple-700 transition disabled:opacity-50"
                      >
                        {isSavingCaption ? t('common:saving') : t('common:save')}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p
                  className="text-white text-sm cursor-pointer hover:bg-white/5 rounded-lg p-2 transition min-h-[40px]"
                  onClick={() => setIsEditingCaption(true)}
                >
                  {photo.caption || (
                    <span className="text-gray-500 italic">
                      {t('common:addCaption')}
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* AI status */}
            {photo.aiAnalyzed && (
              <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <p className="text-purple-400 font-medium">{t('common:aiAnalyzed')}</p>
                </div>
                {photo.analyzedAt && (
                  <p className="text-xs text-gray-400">
                    {formatDate(photo.analyzedAt)}
                  </p>
                )}
              </div>
            )}

            {/* AI tags */}
            {photo.aiTags && photo.aiTags.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-4 h-4 text-purple-400" />
                  <p className="text-gray-400">{t('common:aiTags')}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {photo.aiTags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Faces */}
            {photo.faces > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Users className="w-4 h-4 text-blue-400" />
                  <p className="text-gray-400">{t('common:facesDetected')}</p>
                </div>
                <p className="text-white flex items-center gap-1">
                  <span className="text-2xl">👤</span>
                  <span className="font-medium">{photo.faces}</span>
                </p>
              </div>
            )}

            {/* Category */}
            {photo.category && (
              <div>
                <p className="text-gray-400 mb-1">{t('common:category')}</p>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-lg text-sm font-medium">
                  {photo.category}
                </span>
              </div>
            )}

            {/* File path */}
            <div>
              <p className="text-gray-400 mb-1">{t('common:filePath')}</p>
              <p className="text-white text-xs break-all opacity-60">
                {photo.storagePath || t('common:unknown')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* AI BADGES - Hidden in fullscreen */}
      {/* ===================================================================== */}
      {!showInfo && !isFullscreen && !slideshowActive && (
        <div className="absolute top-20 left-4 flex flex-col gap-2 z-[9998]">
          {photo.aiAnalyzed && (
            <div className="bg-purple-600/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg">
              <Sparkles className="w-3 h-3" />
              <span>AI</span>
            </div>
          )}
          {photo.faces > 0 && (
            <div className="bg-blue-600/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 shadow-lg">
              <Users className="w-3 h-3" />
              <span>{photo.faces}</span>
            </div>
          )}
        </div>
      )}

      {/* ===================================================================== */}
      {/* PHOTO TITLE - Bottom center */}
      {/* ===================================================================== */}
      {photo.name && !showInfo && !showEditor && !slideshowActive && (
        <div
          className={`absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md text-gray-900 px-6 py-3 rounded-lg font-medium shadow-lg select-none z-[9998] transition-opacity duration-300 ${
            uiVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {photo.name}
        </div>
      )}

      {/* ===================================================================== */}
      {/* SLIDESHOW CONTROLS */}
      {/* ===================================================================== */}
      {slideshowActive && (
        <SlideshowControls
          isPlaying={slideshowPlaying}
          onTogglePlay={() => {
            setSlideshowPlaying((prev) => !prev)
            resetUiTimer()
          }}
          onPrevious={prevPhoto}
          onNext={nextPhoto}
          onExit={() => {
            setSlideshowActive(false)
            setSlideshowPlaying(false)
            setIsFullscreen(false)
          }}
          interval={slideshowInterval}
          onIntervalChange={(newInterval) => {
            setSlideshowInterval(newInterval)
            resetUiTimer()
          }}
          uiVisible={uiVisible}
        />
      )}

      {/* ===================================================================== */}
      {/* PHOTO EDITOR - Highest z-index */}
      {/* ===================================================================== */}
      {showEditor && (() => {
        const resolvedImageUrl =
          photo.fullUrl ||
          photo.downloadUrl ||
          photo.url ||
          photo.src ||
          photo.path ||
          ''

        return (
          <div
            className="fixed inset-0 z-[10002] flex items-center justify-center bg-black/95"
            onClick={(e) => e.stopPropagation()}
          >
            <PhotoEditor
              photo={{
                ...photo,
                imageUrl: resolvedImageUrl
              }}
              imageUrl={resolvedImageUrl}
              onClose={handleEditorClose}
              onSave={handleEditSave}
            />
          </div>
        )
      })()}
    </div>
  )
}

export default PhotoModal
