// ============================================================================
// PAGE: AlbumPage.jsx – OPPDATERT: Fjernet dobbeltbekreftelse
// ============================================================================
// ENDRINGER:
// 1. Fjernet window.confirm() fra handleDelete og handleBulkDelete
// 2. Bruker kun ConfirmModal via onDeletePhoto prop (som kaller usePhotoData)
// 3. Lagt til toast-melding ved handleSetCover
// 4. Forbedret handleMovePhotos med bekreftelsesdialog og auto-refresh

import React, { useState, useMemo, useEffect } from 'react'
import { softDeletePhoto, updatePhotoOrder } from '../firebase'
import { useNavigate, useLocation, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Trash2,
  Edit3,
  Check,
  Move,
  Image as ImageIcon,
  Grid3x3,
  List,
  Download,
  Star,
  Calendar,
  Search,
  X,
  Filter,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Share2,
  Layout,
  Video,
  Presentation,
  Settings,
  Loader2,
  Tag,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getFirestore, doc, updateDoc } from 'firebase/firestore'
import { formatDuration } from '../utils/videoTools'
import UploadModal from '../components/UploadModal'
import MoveModal from '../components/MoveModal'
import PhotoGridUnified from '../components/PhotoGridUnified'
import AlbumModal from '../components/AlbumModal'
import QRShareModal from '../features/qr-sharing/components/QRShareModal'
import VerificationModal from '../components/VerificationModal'
import Loading from '../components/Loading'
import EmptyState from '../components/EmptyState'
import useStore from '../state/store'
import { ROUTES } from '../routes'
import { resolvePhotoDate, sortPhotosByDate } from '../utils/photoDateUtils'
import { usePhotoData } from '../hooks/usePhotoData'

function getCategoryIcon(category) {
  const icons = {
    people: '👥',
    nature: '🌳',
    food: '🍽️',
    animals: '🐾',
    indoor: '🏠',
    travel: '✈️',
    architecture: '🏛️',
    event: '🎉',
    sport: '⚽',
    art: '🎨',
    other: '📷',
  }
  return icons[category] || icons.other
}

const AlbumPage = ({
  albums = [],
  user,
  photos,
  refreshData,
  onDeletePhoto,
  onSetAlbumCover,
  onUpload,
  onSaveAlbum,
  onUpdatePhotoCount,
  onToggleFavorite,
}) => {
  const { t } = useTranslation(['common', 'albums'])
  const navigate = useNavigate()
  const location = useLocation()
  const { albumId } = useParams()

  // Get album from route params
  const album = albums.find((a) => a.id === albumId)

  const [editMode, setEditMode] = useState(false)
  const [selectedPhotos, setSelectedPhotos] = useState([])
  const [isMoveOpen, setMoveOpen] = useState(false)
  const [isUploadOpen, setUploadOpen] = useState(false)
  const [editingAlbum, setEditingAlbum] = useState(null)
  const [isShareModalOpen, setShareModalOpen] = useState(false)
  const [isVerificationModalOpen, setVerificationModalOpen] = useState(false)
  const [bulkTagInput, setBulkTagInput] = useState('')

  // Zustand store
  const emailVerified = useStore((state) => state.emailVerified)
  const setNotification = useStore((state) => state.setNotification)
  const setConfirmModal = useStore((state) => state.setConfirmModal)

  // Tag management
  const { bulkAddTag } = usePhotoData()

  // Photo context setters - Phase 2A
  const setCurrentPhotoId = useStore((state) => state.setCurrentPhotoId)
  const setPhotoContext = useStore((state) => state.setPhotoContext)
  const setPhotoOrder = useStore((state) => state.setPhotoOrder)
  const setPhotoIndex = useStore((state) => state.setPhotoIndex)
  const setCurrentAlbumId = useStore((state) => state.setCurrentAlbumId)

  // States for sorting and view
  const [sortBy, setSortBy] = useState('date-desc')
  const [gridSize, setGridSize] = useState(4)
  const [viewMode, setViewMode] = useState('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterAI, setFilterAI] = useState('all')
  const [isInitialLoading, setIsInitialLoading] = useState(true)

  // 🆕 PHASE 3A: Virtual pagination state
  const [displayLimit, setDisplayLimit] = useState(50)
  const ITEMS_PER_PAGE = 50

  // 📍 DIAGNOSTIC: Log component mount
  useEffect(() => {
    console.log('📍 [AlbumPage] mounted', {
      pathname: location.pathname,
      params: { albumId },
      state: location.state,
      album: album ? { id: album.id, name: album.name } : null,
      albumPhotosCount: albumPhotos?.length,
      timestamp: new Date().toISOString(),
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Track initial data loading
  useEffect(() => {
    if (photos && photos.length > 0) {
      setIsInitialLoading(false)
    } else {
      const timer = setTimeout(() => setIsInitialLoading(false), 1500)
      return () => clearTimeout(timer)
    }
  }, [photos])

  const albumPhotos = useMemo(() => {
    if (!album) return []
    const safePhotos = Array.isArray(photos) ? photos : []
    // ✅ EXCLUDE DOCUMENTS: Albums contain only images and videos
    return safePhotos.filter(
      (p) => p.albumId === album.id && p.type !== 'document'
    )
  }, [photos, album])

  // 🐛 DEBUG: Log album items to verify collages are included
  useEffect(() => {
    console.log(
      '🧩 Album items:',
      albumPhotos.map((p) => ({
        id: p.id,
        type: p.type,
        url: p.url,
        thumbnailUrl: p.thumbnailUrl,
        displayUrl: p.displayUrl,
        name: p.name,
      }))
    )
  }, [albumPhotos])

  // Filter and sort photos
  const filteredPhotos = useMemo(() => {
    let result = [...albumPhotos]

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter((p) => {
        const nameMatch = p.name?.toLowerCase().includes(query)
        const tagsMatch = Array.isArray(p.aiTags)
          ? p.aiTags.some((tag) => tag.toLowerCase().includes(query))
          : false
        const categoryMatch = p.category?.toLowerCase().includes(query)
        return nameMatch || tagsMatch || categoryMatch
      })
    }

    // Category filter
    if (filterCategory !== 'all') {
      result = result.filter((p) => p.category === filterCategory)
    }

    // AI filter
    if (filterAI === 'analyzed') {
      result = result.filter((p) => p.aiAnalyzed)
    } else if (filterAI === 'not-analyzed') {
      result = result.filter((p) => !p.aiAnalyzed)
    }

    // Sorting (using unified date resolution)
    switch (sortBy) {
      case 'manual':
        // Manual order - sort by order field
        result.sort((a, b) => {
          const orderA = a.order || 0
          const orderB = b.order || 0
          return orderA - orderB
        })
        break
      case 'date-desc':
        result = sortPhotosByDate(result, 'desc')
        break
      case 'date-asc':
        result = sortPhotosByDate(result, 'asc')
        break
      case 'name-asc':
        result.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
        break
      case 'name-desc':
        result.sort((a, b) => (b.name || '').localeCompare(a.name || ''))
        break
      default:
        break
    }

    return result
  }, [albumPhotos, searchQuery, filterCategory, filterAI, sortBy])

  // 🆕 PHASE 3A: Virtual pagination - limit displayed items
  const { displayedPhotos, hasMore } = useMemo(() => {
    const total = filteredPhotos.length
    const displayed = filteredPhotos.slice(0, displayLimit)

    return {
      displayedPhotos: displayed,
      hasMore: displayLimit < total,
    }
  }, [filteredPhotos, displayLimit])

  // Statistics
  const stats = useMemo(() => {
    const safeAlbumPhotos = Array.isArray(albumPhotos) ? albumPhotos : []
    const totalSize = safeAlbumPhotos.reduce((sum, p) => sum + (p.size || 0), 0)
    const aiCount = safeAlbumPhotos.filter((p) => p.aiAnalyzed).length
    const categories = [
      ...new Set(safeAlbumPhotos.map((p) => p.category).filter(Boolean)),
    ]

    return {
      total: safeAlbumPhotos.length,
      totalSize: (totalSize / (1024 * 1024)).toFixed(1),
      aiAnalyzed: aiCount,
      categories: categories.length,
    }
  }, [albumPhotos])

  // Phase 2A: Navigate to PhotoPage or CollageEditPage
  const handlePhotoClick = (photo, index) => {
    console.log('🖱️ [AlbumPage] handlePhotoClick', {
      photo,
      index,
      photoId: photo?.id,
      type: photo?.type,
      isCollage: photo?.isCollage,
      albumId: album?.id || albumId,
      timestamp: new Date().toISOString(),
    })

    // Check if it's a collage
    if (photo.type === 'collage' || photo.isCollage) {
      console.log('➡️ [AlbumPage] Navigating to collage editor', {
        target: `/collage/${photo.id}/edit`,
        id: photo.id,
        source: 'album',
        returnPath: `/album/${album?.id || albumId}`,
        timestamp: new Date().toISOString(),
      })
      // Navigate to collage edit page
      navigate(`/collage/${photo.id}/edit`, {
        state: {
          returnPath: `/album/${album?.id || albumId}`,
        },
      })
      return
    }

    // For regular photos: Set global photo context state
    const photoIds = filteredPhotos.map((p) => p.id)
    setCurrentPhotoId(photo.id)
    setPhotoContext('album')
    setPhotoOrder(photoIds)
    setPhotoIndex(index)
    setCurrentAlbumId(album?.id || null)

    console.log('➡️ [AlbumPage] Navigating to photo viewer', {
      target: `/photo/${photo.id}`,
      id: photo.id,
      source: 'album',
      photoContext: 'album',
      photoIndex: index,
      totalPhotos: photoIds.length,
      timestamp: new Date().toISOString(),
    })

    // Navigate to PhotoPage
    navigate(`/photo/${photo.id}`, { state: { from: location } })
  }

  const handleSetCover = async (photo) => {
    try {
      await onSetAlbumCover(album.id, photo.url)

      // ✅ TOAST IS HERE (Line 174-177)
      setNotification({
        message: t('albums:coverSet'), // "✓ Image set as cover"
        type: 'success',
      })
    } catch (error) {
      setNotification({
        message: t('albums:errors.couldNotSetCover'),
        type: 'error',
      })
    }
  }

  // Phase 4B-2: Handle photo reordering for manual sort
  const handleReorder = async (oldIndex, newIndex) => {
    // Optimistic update - reorder locally first
    const reorderedPhotos = [...filteredPhotos]
    const [movedPhoto] = reorderedPhotos.splice(oldIndex, 1)
    reorderedPhotos.splice(newIndex, 0, movedPhoto)

    // Update UI immediately (optimistic)
    // Note: Zustand will update via Firestore listener after batch completes

    try {
      // Extract photo IDs in new order
      const photoIds = reorderedPhotos.map((p) => p.id)

      // Batch update in Firestore
      await updatePhotoOrder(photoIds)
      console.log('✅ Photo order updated')
    } catch (error) {
      console.error('❌ Failed to update photo order:', error)
      // Firestore listener will revert to correct order automatically
    }
  }

  // 🔧 FIX 2: handleDelete - Fjern window.confirm, la usePhotoData håndtere ConfirmModal
  const handleDelete = async (photo) => {
    // ✅ ENDRET: Kaller onDeletePhoto direkte (den viser ConfirmModal)
    try {
      await onDeletePhoto(photo)
    } catch (error) {
      console.error(t('albums:errors.photoDeleteError'), error)
      setNotification({
        message: t('albums:errors.couldNotDeletePhoto'),
        type: 'error',
      })
    }
  }

  // 🐛 FIX: handleBulkDelete with error recovery
  const handleBulkDelete = async () => {
    // Show confirmation modal
    setConfirmModal({
      title: t('albums:bulkDeleteTitle'),
      message: t('albums:bulkDeleteMessage', { count: selectedPhotos.length }),
      confirmLabel: t('common:delete'),
      cancelLabel: t('common:cancel'),
      onConfirm: async () => {
        if (import.meta.env.DEV) {
          console.log('🔥 Starting bulk delete with error recovery...')
        }

        // 🐛 FIX: Track success/failure for each photo
        const deleteResults = {
          success: [],
          failed: [],
        }

        // Delete each photo with individual error handling
        for (const photo of selectedPhotos) {
          if (!photo || !photo.id) {
            deleteResults.failed.push({
              photoId: 'unknown',
              name: 'Unknown',
              reason: 'Invalid photo object',
            })
            continue
          }

          try {
            await softDeletePhoto(photo.id)
            deleteResults.success.push(photo.id)

            if (import.meta.env.DEV) {
              console.log(`✅ Successfully moved to trash: ${photo.name}`)
            }
          } catch (error) {
            console.error(`❌ Failed to delete photo ${photo.id}:`, error)
            deleteResults.failed.push({
              photoId: photo.id,
              name: photo.name || 'Unknown',
              reason: error.message,
            })
          }
        }

        // Refresh to update UI
        if (refreshData) {
          await refreshData()
        }

        setSelectedPhotos([])

        // 🐛 FIX: Show detailed results based on success/failure
        if (deleteResults.failed.length === 0) {
          // All succeeded
          setNotification({
            message: t('albums:photosDeleted', {
              count: deleteResults.success.length,
            }),
            type: 'success',
          })
        } else if (deleteResults.success.length === 0) {
          // All failed
          setNotification({
            message:
              t('albums:errors.couldNotDeleteAll') +
              `\n${deleteResults.failed.length} photo${
                deleteResults.failed.length > 1 ? 's' : ''
              } failed`,
            type: 'error',
          })
        } else {
          // Partial success
          setNotification({
            message: `⚠️ Partial success: Deleted ${deleteResults.success.length}, failed ${deleteResults.failed.length}`,
            type: 'warning',
          })
        }
      },
    })
  }

  const handleUpload = async (files, albumId, aiTagging) => {
    try {
      await onUpload(files, albumId || album.id, aiTagging)
    } catch (error) {
      console.error('Upload error:', error)
    }
  }

  const handleCreateAlbum = async (albumData) => {
    // Album already created by UploadModal - no action needed
    // refreshData is called automatically by the upload modal handler
  }

  // 🐛 FIX: handleMovePhotos with error recovery
  const handleMovePhotos = async (targetAlbumId) => {
    const db = getFirestore()
    const targetAlbum = albums.find((a) => a.id === targetAlbumId)
    const targetAlbumName = targetAlbum?.name || 'ukjent album'

    const safeSelected = Array.isArray(selectedPhotos) ? selectedPhotos : []

    if (import.meta.env.DEV) {
      console.log('🔵 Moving photos with error recovery:', {
        count: safeSelected.length,
        targetAlbumId,
      })
    }

    // 🐛 FIX: Track success/failure for each photo
    const moveResults = {
      success: [],
      failed: [],
    }

    // Move each photo with individual error handling
    for (const photo of safeSelected) {
      const photoId =
        typeof photo === 'string' ? photo : photo.id || photo.docId

      if (!photoId) {
        moveResults.failed.push({
          photoId: 'unknown',
          name: photo?.name || 'Unknown',
          reason: 'Invalid photo ID',
        })
        continue
      }

      try {
        const photoRef = doc(db, 'photos', photoId)
        await updateDoc(photoRef, { albumId: targetAlbumId })
        moveResults.success.push(photoId)

        if (import.meta.env.DEV) {
          console.log(`✅ Successfully moved photo: ${photoId}`)
        }
      } catch (error) {
        console.error(`❌ Failed to move photo ${photoId}:`, error)
        moveResults.failed.push({
          photoId,
          name: photo?.name || 'Unknown',
          reason: error.message,
        })
      }
    }

    // 🐛 FIX: Update album counts only based on successful moves
    if (moveResults.success.length > 0) {
      try {
        // Update source album count
        const safeAlbumPhotos = Array.isArray(albumPhotos) ? albumPhotos : []
        const fromCount = safeAlbumPhotos.length - moveResults.success.length
        await onUpdatePhotoCount(album.id, Math.max(0, fromCount))

        // Update target album count
        const safePhotos = Array.isArray(photos) ? photos : []
        const toCount =
          safePhotos.filter((p) => p.albumId === targetAlbumId).length +
          moveResults.success.length
        await onUpdatePhotoCount(targetAlbumId, toCount)
      } catch (error) {
        console.error('❌ Error updating album counts:', error)
        // Continue anyway - photos were moved successfully
      }
    }

    // Auto-refresh
    if (refreshData) {
      await refreshData()
    }

    setSelectedPhotos([])
    setMoveOpen(false)

    // 🐛 FIX: Show detailed results based on success/failure
    if (moveResults.failed.length === 0) {
      // All succeeded
      setNotification({
        message: t('albums:photosMoved', {
          count: moveResults.success.length,
          album: targetAlbumName,
        }),
        type: 'success',
      })
    } else if (moveResults.success.length === 0) {
      // All failed
      setNotification({
        message:
          t('albums:errors.couldNotMovePhotos') +
          `\n${moveResults.failed.length} photo${
            moveResults.failed.length > 1 ? 's' : ''
          } failed`,
        type: 'error',
      })
    } else {
      // Partial success
      setNotification({
        message: `⚠️ Partial success: Moved ${moveResults.success.length}, failed ${moveResults.failed.length}`,
        type: 'warning',
      })
    }
  }

  const togglePhotoSelection = (photo) => {
    setSelectedPhotos((prev) => {
      const isSelected = prev.some((p) => p.id === photo.id)
      return isSelected
        ? prev.filter((p) => p.id !== photo.id)
        : [...prev, photo]
    })
  }

  const isPhotoSelected = (photo) => {
    return selectedPhotos.some((p) => p.id === photo.id)
  }

  // Handle album not found
  if (!album) {
    console.warn('⛔ [AlbumPage] render blocked', {
      reason: 'Album not found',
      albumId,
      availableAlbums: albums?.length,
      albumsList: albums?.map((a) => ({ id: a.id, name: a.name })),
      timestamp: new Date().toISOString(),
    })
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            {t('common:albumNotFound')}
          </h2>
          <button
            onClick={() => navigate('/albums')}
            className="px-4 py-2 bg-purple-600 rounded-lg"
          >
            {t('common:backToAlbums')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-3 md:p-6 pb-24 animate-fade-in">
      {/* Header - Optimized for mobile to prevent button overflow */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2.5 md:mb-3 gap-2">
        <div className="flex items-center gap-3 md:gap-4 min-w-0 flex-1">
          <button
            onClick={() => navigate('/albums')}
            className="ripple-effect p-2 hover:bg-white/10 rounded-lg transition flex-shrink-0"
          >
            <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl md:text-3xl font-bold truncate">
              {album.name}
            </h1>
            {album.description && (
              <p className="text-gray-400 text-sm md:text-base mt-0.5 md:mt-1 truncate">
                {album.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1.5 md:gap-2 flex-wrap justify-end">
          {/* Edit Mode Toggle */}
          <button
            onClick={() => {
              setEditMode(!editMode)
              setSelectedPhotos([])
            }}
            className={`ripple-effect px-2 py-1.5 md:px-4 md:py-2.5 rounded-lg flex items-center gap-1.5 md:gap-2 transition text-xs md:text-base ${
              editMode
                ? 'bg-purple-600 text-white'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            {editMode ? (
              <Check className="w-4 h-4 md:w-5 md:h-5" />
            ) : (
              <Edit3 className="w-4 h-4 md:w-5 md:h-5" />
            )}
            <span className="hidden sm:inline">
              {editMode ? t('common:done') : t('common:edit')}
            </span>
          </button>

          {/* Create Collage Button - Phase 6: Navigate to CollageNewPage */}
          <button
            onClick={() =>
              navigate(ROUTES.COLLAGE_TEMPLATES, {
                state: {
                  albumId: album.id,
                  returnPath: `/album/${album.id}`,
                },
              })
            }
            disabled={albumPhotos.length < 2}
            className="ripple-effect px-2 py-1.5 md:px-4 md:py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 transition flex items-center gap-1.5 md:gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-xs md:text-base"
            title={
              albumPhotos.length < 2
                ? t('albums:minTwoPhotos')
                : t('albums:createCollage')
            }
          >
            <Layout className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">
              {t('albums:createCollage')}
            </span>
          </button>

          {/* Start Slideshow - Phase 2B */}
          {filteredPhotos.length > 0 && (
            <button
              onClick={() => {
                // Filter out documents from slideshow
                const slideshowPhotos = filteredPhotos.filter(
                  (p) => p.type !== 'document'
                )
                if (slideshowPhotos.length === 0) {
                  setNotification({
                    message:
                      'No photos or videos available for slideshow. Documents cannot be shown in slideshow.',
                    type: 'info',
                  })
                  return
                }
                // Navigate to SlideshowPage with first photo
                const firstPhoto = slideshowPhotos[0]
                const photoIds = slideshowPhotos.map((p) => p.id)
                setCurrentPhotoId(firstPhoto.id)
                setPhotoContext('album')
                setPhotoOrder(photoIds)
                setPhotoIndex(0)
                setCurrentAlbumId(album?.id || null)
                navigate(`/slideshow/${firstPhoto.id}`, {
                  state: { from: location },
                })
              }}
              className="ripple-effect px-2 py-1.5 md:px-4 md:py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex items-center gap-1.5 md:gap-2 text-xs md:text-base"
            >
              <Presentation className="w-4 md:w-5 h-4 md:h-5" />
              <span className="hidden sm:inline">
                {t('common:slideshow.start')}
              </span>
            </button>
          )}

          {/* Share Album Button */}
          <button
            onClick={() => {
              if (!emailVerified) {
                setVerificationModalOpen(true)
              } else {
                setShareModalOpen(true)
              }
            }}
            className="ripple-effect px-2 py-1.5 md:px-4 md:py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 transition flex items-center gap-1.5 md:gap-2 text-xs md:text-base"
          >
            <Share2 className="w-4 h-4 md:w-5 md:h-5" />
            <span className="hidden sm:inline">{t('albums:shareAlbum')}</span>
          </button>

          {/* Edit Album Button - Using Settings icon to distinguish from Edit Mode */}
          <button
            onClick={() => {
              if (import.meta.env.DEV)
                console.log('🔧 Edit album clicked:', {
                  albumId: album.id,
                  albumName: album.name,
                  albumDescription: album.description,
                })
              setEditingAlbum(album)
            }}
            className="ripple-effect p-1.5 md:p-2 hover:bg-white/10 rounded-lg transition"
            title={t('albums:editAlbum')}
          >
            <Settings className="w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>
      </div>

      {/* Stats Row - Simplified */}
      <div className="grid grid-cols-2 gap-2.5 md:gap-3 mb-2.5 md:mb-3">
        <div className="bg-white/5 rounded-lg p-2.5 md:p-3 border border-white/10">
          <p className="text-[10px] md:text-xs text-gray-400 mb-0.5 md:mb-1">
            {t('albums:photos')}
          </p>
          <p className="text-xl md:text-2xl font-bold leading-none">
            {stats.total}
          </p>
        </div>
        <div className="bg-white/5 rounded-lg p-2.5 md:p-3 border border-white/10">
          <p className="text-[10px] md:text-xs text-gray-400 mb-0.5 md:mb-1">
            {t('albums:size')}
          </p>
          <p className="text-xl md:text-2xl font-bold leading-none">
            {stats.totalSize} MB
          </p>
        </div>
      </div>

      {/* Action Bar */}
      {editMode && selectedPhotos.length > 0 && (
        <div className="bg-purple-600/20 border border-purple-500/30 rounded-lg p-3 md:p-4 mb-2.5 md:mb-3">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium text-sm md:text-base">
              {t('albums:selectedCount', { count: selectedPhotos.length })}
            </span>
            <div className="flex gap-1.5 md:gap-2">
              <button
                onClick={() => setMoveOpen(true)}
                className="ripple-effect px-3 py-1.5 md:px-4 md:py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 md:gap-2 transition text-sm md:text-base touch-target touch-manipulation"
                aria-label={`Move ${selectedPhotos.length} selected photo${
                  selectedPhotos.length > 1 ? 's' : ''
                }`}
              >
                <Move className="w-4 h-4" />
                {t('common:move')}
              </button>
              <button
                onClick={handleBulkDelete}
                className="ripple-effect px-3 py-1.5 md:px-4 md:py-2 bg-red-600 hover:bg-red-700 rounded-lg flex items-center gap-1.5 md:gap-2 transition text-sm md:text-base touch-target touch-manipulation"
                aria-label={`Delete ${selectedPhotos.length} selected photo${
                  selectedPhotos.length > 1 ? 's' : ''
                }`}
              >
                <Trash2 className="w-4 h-4" />
                {t('common:delete')}
              </button>
            </div>
          </div>

          {/* Bulk Tag Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={bulkTagInput}
              onChange={(e) => setBulkTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && bulkTagInput.trim()) {
                  const selectedPhotoIds = selectedPhotos.map((p) => p.id)
                  bulkAddTag(selectedPhotoIds, bulkTagInput)
                  setBulkTagInput('')
                  setSelectedPhotos([])
                  setEditMode(false)
                }
              }}
              placeholder="Legg til tag på valgte bilder..."
              className="flex-1 px-3 py-1.5 bg-white/10 border border-white/20 rounded-lg text-sm text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
            />
            <button
              onClick={() => {
                if (bulkTagInput.trim()) {
                  const selectedPhotoIds = selectedPhotos.map((p) => p.id)
                  bulkAddTag(selectedPhotoIds, bulkTagInput)
                  setBulkTagInput('')
                  setSelectedPhotos([])
                  setEditMode(false)
                }
              }}
              disabled={!bulkTagInput.trim()}
              className="ripple-effect px-3 py-1.5 md:px-4 md:py-2 bg-purple-600 hover:bg-purple-700 rounded-lg flex items-center gap-1.5 md:gap-2 transition text-sm md:text-base touch-target touch-manipulation disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Tag className="w-4 h-4" />
              <span className="hidden md:inline">Legg til tag</span>
            </button>
          </div>
        </div>
      )}

      {/* Controls Row - Sort + View Toggle */}
      <div className="flex items-center justify-between gap-2 mb-2 md:mb-2.5">
        {/* Left: Sort Dropdown - Now visible, not hidden */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="ripple-effect px-3 py-2 md:px-4 md:py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition text-sm md:text-base font-medium cursor-pointer outline-none"
        >
          <option value="manual">✋ {t('albums:sortManual')}</option>
          <option value="date-desc">📅 {t('albums:sortDateDesc')}</option>
          <option value="date-asc">📅 {t('albums:sortDateAsc')}</option>
          <option value="name-asc">🔤 {t('albums:sortNameAsc')}</option>
          <option value="name-desc">🔤 {t('albums:sortNameDesc')}</option>
        </select>

        {/* Right: Grid/List Toggle */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`ripple-effect p-2 md:p-2.5 rounded-lg transition ${
              viewMode === 'grid'
                ? 'bg-purple-600'
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            <Grid3x3 className="w-[18px] h-[18px] md:w-5 md:h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`ripple-effect p-2 md:p-2.5 rounded-lg transition ${
              viewMode === 'list'
                ? 'bg-purple-600'
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            <List className="w-[18px] h-[18px] md:w-5 md:h-5" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative mb-3">
        <Search className="absolute left-2.5 md:left-3 top-1/2 -translate-y-1/2 w-4 md:w-5 h-4 md:h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('albums:searchPhotos')}
          className="input-premium !pl-9 md:!pl-10 !pr-9 md:!pr-10 !py-2 md:!py-2.5 text-sm md:text-base"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="ripple-effect absolute right-2.5 md:right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-lg transition"
          >
            <X className="w-3.5 md:w-4 h-3.5 md:h-4" />
          </button>
        )}
      </div>

      {/* Manual Order Helper Text */}
      {sortBy === 'manual' && viewMode === 'grid' && (
        <div className="mb-3 p-3 bg-purple-600/10 border border-purple-500/30 rounded-lg flex items-start gap-2">
          <div className="flex-shrink-0 mt-0.5">✋</div>
          <div className="text-xs md:text-sm">
            <p className="font-medium text-purple mb-1">Manual Order Active</p>
            <p className="text-gray-400">
              Drag photos to reorder. Changes save automatically.
            </p>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isInitialLoading && viewMode === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
          {Array(12)
            .fill(0)
            .map((_, i) => (
              <Loading key={i} variant="skeleton" className="aspect-square" />
            ))}
        </div>
      )}

      {/* Photos Grid - Using PhotoGridUnified component */}
      {!isInitialLoading &&
        viewMode === 'grid' &&
        displayedPhotos.length > 0 && (
          <PhotoGridUnified
            photos={displayedPhotos}
            layout={gridSize === 2 ? 'compact' : 'default'}
            editMode={editMode}
            currentAlbum={album}
            refreshPhotos={refreshData}
            onPhotoClick={
              editMode
                ? undefined
                : (photo, index) => {
                    handlePhotoClick(photo, index)
                  }
            }
            enableDragDrop={sortBy === 'manual'}
            onReorder={sortBy === 'manual' ? handleReorder : undefined}
            onToggleFavorite={() => {}}
            onDelete={() => {}}
            onSetCover={() => {}}
          />
        )}

      {/* 🆕 PHASE 3A: Load More button */}
      {viewMode === 'grid' && hasMore && displayedPhotos.length > 0 && (
        <div className="flex flex-col items-center gap-4 py-8">
          <button
            onClick={() => setDisplayLimit((prev) => prev + ITEMS_PER_PAGE)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium flex items-center gap-2"
          >
            Load More Photos
          </button>
          <p className="text-sm text-gray-400">
            Showing {displayedPhotos.length} of {filteredPhotos.length} photos
          </p>
        </div>
      )}

      {/* All loaded indicator */}
      {viewMode === 'grid' &&
        !hasMore &&
        filteredPhotos.length > 0 &&
        filteredPhotos.length > 50 && (
          <p className="text-center text-gray-500 py-8 text-sm">
            All {filteredPhotos.length} photos loaded
          </p>
        )}

      {/* Photos List View - Compact Redesign */}
      {!isInitialLoading &&
        viewMode === 'list' &&
        filteredPhotos.length > 0 && (
          <div className="space-y-1.5 md:space-y-2">
            {filteredPhotos.map((photo, index) => (
              <div
                key={photo.id}
                className={`album-list-row flex items-center gap-2 md:gap-3 p-2 md:p-2.5 bg-white/5 rounded-lg md:rounded-xl border border-white/10 hover:bg-white/10 transition cursor-pointer animate-fade-in-up stagger-${
                  (index % 12) + 1
                } ${isPhotoSelected(photo) ? 'ring-2 ring-purple-500' : ''}`}
                onClick={() => {
                  if (editMode) {
                    togglePhotoSelection(photo)
                  } else {
                    handlePhotoClick(photo, index)
                  }
                }}
              >
                <img
                  src={
                    photo.type === 'video'
                      ? photo.thumbnailUrl || photo.url
                      : photo.url
                  }
                  alt={photo.name}
                  className="album-list-thumb w-14 md:w-16 lg:w-20 h-14 md:h-16 lg:h-20 object-cover rounded-lg md:rounded-xl flex-shrink-0"
                />

                <div className="list-info flex-1 min-w-0">
                  <div className="font-medium truncate text-xs md:text-sm">
                    {photo.name || t('common:noName')}
                  </div>
                  <div className="album-meta text-xs text-gray-400 flex items-center gap-1 md:gap-1.5 mt-0.5">
                    {photo.type === 'video' && (
                      <>
                        <span className="flex items-center gap-0.5 text-purple">
                          <Video className="w-3 h-3" />
                          {photo.metadata?.duration && (
                            <span>
                              {formatDuration(photo.metadata.duration)}
                            </span>
                          )}
                        </span>
                        <span>•</span>
                      </>
                    )}
                    {photo.createdAt
                      ? new Date(photo.createdAt).toLocaleDateString('no-NO')
                      : t('albums:unknownDate')}
                    {photo.category && (
                      <>
                        <span>•</span>
                        <span>
                          {getCategoryIcon(photo.category)} {photo.category}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {editMode && (
                  <div className="flex gap-1 md:gap-1.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSetCover(photo)
                      }}
                      className="ripple-effect p-1.5 bg-yellow-500 hover:bg-yellow-600 rounded-lg transition"
                      title={t('albums:setCover')}
                    >
                      <ImageIcon
                        className="w-3.5 h-3.5 md:w-4 md:h-4"
                        style={{ transform: 'scale(0.85)' }}
                      />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(photo)
                      }}
                      className="ripple-effect p-1.5 bg-red-500 hover:bg-red-600 rounded-lg transition"
                      title={t('common:delete')}
                    >
                      <Trash2
                        className="w-3.5 h-3.5 md:w-4 md:h-4"
                        style={{ transform: 'scale(0.85)' }}
                      />
                    </button>
                  </div>
                )}

                {isPhotoSelected(photo) && (
                  <div className="bg-purple-600 text-white rounded-full w-4 md:w-5 h-4 md:h-5 flex items-center justify-center">
                    <Check className="w-3 md:w-3.5 h-3 md:h-3.5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      {/* Empty State */}
      {!isInitialLoading && filteredPhotos.length === 0 && (
        <EmptyState
          variant="no-photos"
          title={t('albums:noPhotos')}
          description={t('albums:noPhotosDescription')}
          action={t('albums:uploadFirstPhotos')}
          onAction={() => setUploadOpen(true)}
        />
      )}

      {/* Action Button - Upload */}
      <div className="flex items-center gap-2 md:gap-3 mt-3 md:mt-4">
        <button
          onClick={() => setUploadOpen(true)}
          className="ripple-effect w-full px-3 py-3 md:px-4 md:py-4 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center gap-1.5 md:gap-2 transition font-medium text-sm md:text-base"
        >
          <ImageIcon className="w-[14px] md:w-4 h-[14px] md:h-4" />
          {t('albums:uploadPhotos')}
        </button>
      </div>

      {/* Modals */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setUploadOpen(false)}
        onUpload={handleUpload}
        onCreateAlbum={handleCreateAlbum}
        albums={albums}
        selectedAlbum={album.id}
      />

      <MoveModal
        isOpen={isMoveOpen}
        onClose={() => setMoveOpen(false)}
        albums={albums}
        onConfirm={handleMovePhotos}
      />

      {editingAlbum && (
        <AlbumModal
          isOpen={Boolean(editingAlbum)}
          editingAlbum={editingAlbum}
          onClose={() => setEditingAlbum(null)}
          onSave={async (data, editingAlbumParam) => {
            if (import.meta.env.DEV)
              console.log('💾 Saving album changes:', {
                data,
                editingAlbumParam,
                editingAlbumState: editingAlbum,
                currentAlbum: album,
              })

            // Use editingAlbumParam (from modal), fallback to state, then to current album
            const albumToSave = editingAlbumParam || editingAlbum || album

            if (!albumToSave || !albumToSave.id) {
              console.error('❌ No valid album to save')
              setNotification({
                message: t('albums:errors.couldNotSaveAlbum'),
                type: 'error',
              })
              return
            }

            if (import.meta.env.DEV)
              console.log(
                '✅ Using album for save:',
                albumToSave.id,
                albumToSave.name
              )

            try {
              await onSaveAlbum(data, albumToSave)
              if (import.meta.env.DEV)
                console.log('✅ Album saved successfully')
              setEditingAlbum(null)
            } catch (error) {
              console.error('❌ Failed to save album:', error)
              setNotification({
                message: error.message || t('albums:errors.couldNotSaveAlbum'),
                type: 'error',
              })
            }
          }}
        />
      )}

      <QRShareModal
        isOpen={isShareModalOpen}
        onClose={() => setShareModalOpen(false)}
        album={album}
      />

      <VerificationModal
        isOpen={isVerificationModalOpen}
        onClose={() => setVerificationModalOpen(false)}
        feature={t('albums:shareAlbum')}
      />
    </div>
  )
}

export default AlbumPage
