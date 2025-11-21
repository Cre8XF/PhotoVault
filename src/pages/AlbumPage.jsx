// ============================================================================
// PAGE: AlbumPage.jsx – OPPDATERT: Fjernet dobbeltbekreftelse
// ============================================================================
// ENDRINGER:
// 1. Fjernet window.confirm() fra handleDelete og handleBulkDelete
// 2. Bruker kun ConfirmModal via onDeletePhoto prop (som kaller usePhotoData)
// 3. Lagt til toast-melding ved handleSetCover
// 4. Forbedret handleMovePhotos med bekreftelsesdialog og auto-refresh

import React, { useState, useMemo, useEffect } from 'react'
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
  Share2,
  Layout,
  Video,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getFirestore, doc, updateDoc } from 'firebase/firestore'
import { formatDuration } from '../utils/videoTools'
import UploadModal from '../components/UploadModal'
import MoveModal from '../components/MoveModal'
import PhotoModal from '../components/PhotoModal'
import PhotoGrid from '../components/PhotoGrid'
import AlbumModal from '../components/AlbumModal'
import QRShareModal from '../features/qr-sharing/components/QRShareModal'
import { CollageBuilder } from '../features/collage'
import { SkeletonPhoto } from '../components/SkeletonCard'
import useStore from '../state/store'

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
  album,
  albums = [],
  user,
  photos,
  onBack,
  refreshData,
  onDeletePhoto,
  onSetAlbumCover,
  onUpload,
  onSaveAlbum,
  onUpdatePhotoCount,
  onToggleFavorite,
}) => {
  const { t } = useTranslation(['common', 'albums'])
  const [editMode, setEditMode] = useState(false)
  const [selectedPhotos, setSelectedPhotos] = useState([])
  const [isMoveOpen, setMoveOpen] = useState(false)
  const [isUploadOpen, setUploadOpen] = useState(false)
  const [photoModal, setPhotoModal] = useState({ open: false, index: 0 })
  const [editingAlbum, setEditingAlbum] = useState(null)
  const [isShareModalOpen, setShareModalOpen] = useState(false)
  const [isCollageOpen, setCollageOpen] = useState(false)

  // Zustand store
  const setNotification = useStore((state) => state.setNotification)
  const setConfirmModal = useStore((state) => state.setConfirmModal)

  // States for sorting and view
  const [sortBy, setSortBy] = useState('date-desc')
  const [gridSize, setGridSize] = useState(4)
  const [viewMode, setViewMode] = useState('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterAI, setFilterAI] = useState('all')
  const [isInitialLoading, setIsInitialLoading] = useState(true)

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
    return safePhotos.filter((p) => p.albumId === album.id)
  }, [photos, album])

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

    // Sorting
    switch (sortBy) {
      case 'date-desc':
        result.sort(
          (a, b) =>
            new Date(b.createdAt || b.uploadedAt || 0) -
            new Date(a.createdAt || a.uploadedAt || 0)
        )
        break
      case 'date-asc':
        result.sort(
          (a, b) =>
            new Date(a.createdAt || a.uploadedAt || 0) -
            new Date(b.createdAt || b.uploadedAt || 0)
        )
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

  // 🔧 FIX 3: handleBulkDelete - Én dialog, deretter slett direkte
  const handleBulkDelete = async () => {
    // ✅ ENDRET: Vis ÉN ConfirmModal for alle bildene
    setConfirmModal({
      title: t('albums:bulkDeleteTitle'),
      message: t('albums:bulkDeleteMessage', { count: selectedPhotos.length }),
      confirmLabel: t('common:delete'),
      cancelLabel: t('common:cancel'),
      onConfirm: async () => {
        try {
          // Slett alle direkte uten ekstra dialoger
          const { deletePhoto } = await import('../firebase')
          for (const photo of selectedPhotos) {
            await deletePhoto(photo.id, photo.storagePath)
          }

          // Refresh for å oppdatere UI
          if (refreshData) {
            await refreshData()
          }

          setSelectedPhotos([])
          setNotification({
            message: t('albums:photosDeleted', {
              count: selectedPhotos.length,
            }),
            type: 'success',
          })
        } catch (error) {
          console.error(t('albums:errors.bulkDeleteError'), error)
          setNotification({
            message: t('albums:errors.couldNotDeleteAll'),
            type: 'error',
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

  // 🔧 FIX 4: handleMovePhotos - Legg til toast + refresh (INGEN ekstra dialog!)
  const handleMovePhotos = async (targetAlbumId) => {
    // MoveModal har allerede spurt brukeren - IKKE legg til ny dialog!
    try {
      const db = getFirestore()
      const targetAlbum = albums.find((a) => a.id === targetAlbumId)
      const targetAlbumName = targetAlbum?.name || 'ukjent album'

      const safeSelected = Array.isArray(selectedPhotos) ? selectedPhotos : []

      // ✅ FIXED: Filter out invalid photos first to avoid undefined in Promise.all
      const validPhotos = safeSelected.filter((photo) => {
        const photoId =
          typeof photo === 'string' ? photo : photo.id || photo.docId
        return Boolean(photoId)
      })

      const updates = validPhotos.map(async (photo) => {
        const photoId =
          typeof photo === 'string' ? photo : photo.id || photo.docId
        const photoRef = doc(db, 'photos', photoId)
        await updateDoc(photoRef, { albumId: targetAlbumId })
      })

      await Promise.all(updates)

      // Oppdater photoCount for begge album
      const safeAlbumPhotos = Array.isArray(albumPhotos) ? albumPhotos : []
      const fromCount = safeAlbumPhotos.length - validPhotos.length
      await onUpdatePhotoCount(album.id, Math.max(0, fromCount))

      const safePhotos = Array.isArray(photos) ? photos : []
      const toCount =
        safePhotos.filter((p) => p.albumId === targetAlbumId).length +
        validPhotos.length
      await onUpdatePhotoCount(targetAlbumId, toCount)

      // ✅ FIXED: Use i18n instead of hardcoded string
      setNotification({
        message: t('albums:photosMoved', {
          count: validPhotos.length,
          album: targetAlbumName,
        }),
        type: 'success',
      })

      // ✅ NY: Auto-refresh
      if (refreshData) {
        await refreshData()
      }

      setSelectedPhotos([])
      setMoveOpen(false)
    } catch (error) {
      console.error('Move error:', error)
      setNotification({
        message: t('albums:errors.couldNotMovePhotos'),
        type: 'error',
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

  // Save collage as a new photo in the album
  const handleSaveCollage = async (file, metadata) => {
    try {
      console.log('💾 Saving collage to album...', metadata)
      console.log('📄 File received:', {
        name: file.name,
        size: file.size,
        type: file.type,
      })

      // Verify file has type property (should be set by CollageBuilder)
      if (!file.type) {
        console.error('❌ File type is missing!')
        throw new Error('File object missing type property')
      }

      // CRITICAL FIX: handleUpload expects array of objects with .file property
      // Not just raw File objects
      await handleUpload(
        [
          {
            file: file,
            thumbnail: null,
            metadata: metadata,
          },
        ],
        album.id,
        false
      )

      console.log('✅ Upload complete, refreshing data...')

      // Refresh data to show the new collage
      if (refreshData && user?.uid) {
        await refreshData(user.uid)
      }

      // Show success notification
      setNotification({
        message: t('albums:collageSaved'),
        type: 'success',
      })

      console.log('✅ Collage saved and data refreshed')
    } catch (error) {
      console.error('❌ Error saving collage:', error)
      setNotification({
        message: t('albums:collageSaveError'),
        type: 'error',
      })
      throw error
    }
  }

  if (!album) {
    return (
      <div className="p-6">
        <p>{t('albums:errors.albumNotFound')}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-3 md:p-6 pb-24 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5 md:mb-3">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="ripple-effect p-2 hover:bg-white/10 rounded-lg transition"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-3xl font-bold">{album.name}</h1>
            {album.description && (
              <p className="text-gray-400 mt-1">{album.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Edit Mode Toggle */}
          <button
            onClick={() => {
              setEditMode(!editMode)
              setSelectedPhotos([])
            }}
            className={`ripple-effect px-3 py-2 md:px-4 md:py-2.5 rounded-lg flex items-center gap-2 transition ${
              editMode
                ? 'bg-purple-600 text-white'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            {editMode ? (
              <Check className="w-5 h-5" />
            ) : (
              <Edit3 className="w-5 h-5" />
            )}
            <span className="hidden sm:inline text-sm md:text-base">
              {editMode ? t('common:done') : t('common:edit')}
            </span>
          </button>

          {/* Create Collage Button */}
          <button
            onClick={() => setCollageOpen(true)}
            disabled={albumPhotos.length < 2}
            className="ripple-effect px-3 py-2 md:px-4 md:py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title={
              albumPhotos.length < 2 ? t('albums:minTwoPhotos') : t('albums:createCollage')
            }
          >
            <Layout className="w-5 h-5" />
            <span className="hidden sm:inline text-sm md:text-base">{t('albums:createCollage')}</span>
          </button>

          {/* Share Album Button */}
          <button
            onClick={() => setShareModalOpen(true)}
            className="ripple-effect px-3 py-2 md:px-4 md:py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            <span className="hidden sm:inline text-sm md:text-base">{t('albums:shareAlbum')}</span>
          </button>

          {/* Edit Album Button */}
          <button
            onClick={() => setEditingAlbum(album)}
            className="ripple-effect p-2 hover:bg-white/10 rounded-lg transition"
            title={t('albums:editAlbum')}
          >
            <Edit3 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Row - Compressed */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 md:gap-3 mb-2.5 md:mb-3">
        <div className="bg-white/5 rounded-lg p-2.5 md:p-3 border border-white/10">
          <p className="text-[10px] md:text-xs text-gray-400 mb-0.5 md:mb-1">{t('albums:photos')}</p>
          <p className="text-xl md:text-2xl font-bold leading-none">{stats.total}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-2.5 md:p-3 border border-white/10">
          <p className="text-[10px] md:text-xs text-gray-400 mb-0.5 md:mb-1">{t('albums:size')}</p>
          <p className="text-xl md:text-2xl font-bold leading-none">{stats.totalSize} MB</p>
        </div>
        <div className="bg-white/5 rounded-lg p-2.5 md:p-3 border border-white/10">
          <p className="text-[10px] md:text-xs text-gray-400 mb-0.5 md:mb-1">{t('albums:aiAnalyzed')}</p>
          <p className="text-xl md:text-2xl font-bold leading-none">{stats.aiAnalyzed}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-2.5 md:p-3 border border-white/10">
          <p className="text-[10px] md:text-xs text-gray-400 mb-0.5 md:mb-1">{t('albums:categories')}</p>
          <p className="text-xl md:text-2xl font-bold leading-none">{stats.categories}</p>
        </div>
      </div>

      {/* Action Bar */}
      {editMode && selectedPhotos.length > 0 && (
        <div className="bg-purple-600/20 border border-purple-500/30 rounded-lg p-3 md:p-4 mb-2.5 md:mb-3 flex items-center justify-between">
          <span className="font-medium text-sm md:text-base">
            {t('albums:selectedCount', { count: selectedPhotos.length })}
          </span>
          <div className="flex gap-1.5 md:gap-2">
            <button
              onClick={() => setMoveOpen(true)}
              className="ripple-effect px-3 py-1.5 md:px-4 md:py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-1.5 md:gap-2 transition text-sm md:text-base"
            >
              <Move className="w-4 h-4" />
              {t('common:move')}
            </button>
            <button
              onClick={handleBulkDelete}
              className="ripple-effect px-3 py-1.5 md:px-4 md:py-2 bg-red-600 hover:bg-red-700 rounded-lg flex items-center gap-1.5 md:gap-2 transition text-sm md:text-base"
            >
              <Trash2 className="w-4 h-4" />
              {t('common:delete')}
            </button>
          </div>
        </div>
      )}

      {/* Grid/List Toggle - Positioned below stats */}
      <div className="flex items-center justify-end gap-2 mb-2 md:mb-2.5">
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

      {/* Filters Panel - Compact */}
      {showFilters && (
        <div className="bg-white/5 border border-white/10 rounded-lg p-2.5 md:p-4 mb-3 space-y-3 md:space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
            {/* Sort */}
            <div>
              <label className="block text-xs md:text-sm font-medium mb-1.5 md:mb-2">
                {t('albums:sortBy')}
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-premium !py-1.5 md:!py-2 text-sm"
              >
                <option value="date-desc">{t('albums:sortDateDesc')}</option>
                <option value="date-asc">{t('albums:sortDateAsc')}</option>
                <option value="name-asc">{t('albums:sortNameAsc')}</option>
                <option value="name-desc">{t('albums:sortNameDesc')}</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs md:text-sm font-medium mb-1.5 md:mb-2">
                {t('albums:category')}
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="input-premium !py-1.5 md:!py-2 text-sm"
              >
                <option value="all">{t('albums:allCategories')}</option>
                <option value="people">👥 {t('albums:categoryPeople')}</option>
                <option value="nature">🌳 {t('albums:categoryNature')}</option>
                <option value="food">🍽️ {t('albums:categoryFood')}</option>
                <option value="animals">
                  🐾 {t('albums:categoryAnimals')}
                </option>
                <option value="indoor">🏠 {t('albums:categoryIndoor')}</option>
                <option value="travel">✈️ {t('albums:categoryTravel')}</option>
              </select>
            </div>

            {/* AI Filter */}
            <div>
              <label className="block text-xs md:text-sm font-medium mb-1.5 md:mb-2">
                {t('albums:aiStatus')}
              </label>
              <select
                value={filterAI}
                onChange={(e) => setFilterAI(e.target.value)}
                className="input-premium !py-1.5 md:!py-2 text-sm"
              >
                <option value="all">{t('albums:allPhotos')}</option>
                <option value="analyzed">{t('albums:aiAnalyzedOnly')}</option>
                <option value="not-analyzed">{t('albums:notAnalyzed')}</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {isInitialLoading && viewMode === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
          {Array(12).fill(0).map((_, i) => (
            <SkeletonPhoto key={i} />
          ))}
        </div>
      )}

      {/* Photos Grid - Using PhotoGrid component for video thumbnail support */}
      {!isInitialLoading && viewMode === 'grid' && filteredPhotos.length > 0 && (
        <PhotoGrid
          photos={filteredPhotos}
          compact={gridSize === 2}
          editMode={editMode}
          currentAlbum={album}
          refreshPhotos={async () => {
            if (refreshData) {
              await refreshData()
            }
          }}
          onPhotoClick={
            editMode
              ? null // In edit mode, don't open modal (use PhotoGrid's built-in edit buttons)
              : (url) => {
                  const index = filteredPhotos.findIndex(
                    (p) => p.url === url || p.thumbnailUrl === url
                  )
                  if (index !== -1) {
                    setPhotoModal({ open: true, index })
                  }
                }
          }
        />
      )}

      {/* Photos List View - Compact Redesign */}
      {!isInitialLoading && viewMode === 'list' && filteredPhotos.length > 0 && (
        <div className="space-y-1.5 md:space-y-2">
          {filteredPhotos.map((photo, index) => (
            <div
              key={photo.id}
              className={`album-list-row flex items-center gap-2 md:gap-3 p-2 md:p-2.5 bg-white/5 rounded-lg md:rounded-xl border border-white/10 hover:bg-white/10 transition cursor-pointer animate-fade-in-up stagger-${(index % 12) + 1} ${
                isPhotoSelected(photo) ? 'ring-2 ring-purple-500' : ''
              }`}
              onClick={() => {
                if (editMode) {
                  togglePhotoSelection(photo)
                } else {
                  setPhotoModal({ open: true, index })
                }
              }}
            >
              <img
                src={photo.type === 'video' ? photo.thumbnailUrl || photo.url : photo.url}
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
                      <span className="flex items-center gap-0.5 text-purple-400">
                        <Video className="w-3 h-3" />
                        {photo.metadata?.duration && (
                          <span>{formatDuration(photo.metadata.duration)}</span>
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
                    <ImageIcon className="w-3.5 h-3.5 md:w-4 md:h-4" style={{ transform: 'scale(0.85)' }} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(photo)
                    }}
                    className="ripple-effect p-1.5 bg-red-500 hover:bg-red-600 rounded-lg transition"
                    title={t('common:delete')}
                  >
                    <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" style={{ transform: 'scale(0.85)' }} />
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
        <div className="text-center py-16">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-xl font-medium mb-2">{t('albums:noPhotos')}</p>
          <p className="text-gray-400 mb-6">
            {t('albums:noPhotosDescription')}
          </p>
          <button
            onClick={() => setUploadOpen(true)}
            className="ripple-effect px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl transition"
          >
            {t('albums:uploadFirstPhotos')}
          </button>
        </div>
      )}

      {/* Action Buttons - Filters & Upload */}
      <div className="flex items-center gap-2 md:gap-3 mt-3 md:mt-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="ripple-effect px-3 py-2 md:px-4 md:py-2.5 bg-white/5 hover:bg-white/10 rounded-lg flex items-center gap-1.5 md:gap-2 transition text-sm md:text-base"
        >
          <Filter className="w-[14px] md:w-4 h-[14px] md:h-4" />
          {t('albums:filters')}
          <ChevronDown
            className={`w-[14px] md:w-4 h-[14px] md:h-4 transition-transform ${
              showFilters ? 'rotate-180' : ''
            }`}
          />
        </button>

        <button
          onClick={() => setUploadOpen(true)}
          className="ripple-effect flex-1 px-3 py-3 md:px-4 md:py-4 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center gap-1.5 md:gap-2 transition font-medium text-sm md:text-base"
        >
          <ImageIcon className="w-[14px] md:w-4 h-[14px] md:h-4" />
          {t('albums:uploadPhotos')}
        </button>
      </div>

      {/* PhotoModal */}
      {photoModal.open && (
        <PhotoModal
          photos={filteredPhotos}
          currentIndex={photoModal.index}
          onClose={() => setPhotoModal({ open: false, index: 0 })}
          onToggleFavorite={onToggleFavorite}
          onPhotoEdited={async (newPhoto) => {
            // Refresh data to show the new edited photo
            if (refreshData) {
              await refreshData()
            }
            // Show notification
            if (setNotification) {
              setNotification({
                type: 'success',
                message: t('albums:editedPhotoSaved')
              })
            }
          }}
        />
      )}

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
          editingAlbum={editingAlbum}
          onClose={() => setEditingAlbum(null)}
          onSave={async (data, editingAlbum) => {
            await onSaveAlbum(data, editingAlbum)
            setEditingAlbum(null)
          }}
        />
      )}

      <QRShareModal
        isOpen={isShareModalOpen}
        onClose={() => setShareModalOpen(false)}
        album={album}
      />

      {/* Collage Builder */}
      {isCollageOpen && (
        <CollageBuilder
          availablePhotos={albumPhotos}
          onClose={() => setCollageOpen(false)}
          onSave={handleSaveCollage}
        />
      )}
    </div>
  )
}

export default AlbumPage
