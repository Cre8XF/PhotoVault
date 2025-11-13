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
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getFirestore, doc, updateDoc } from 'firebase/firestore'
import UploadModal from '../components/UploadModal'
import MoveModal from '../components/MoveModal'
import PhotoModal from '../components/PhotoModal'
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
        message: 'Kollasj lagret! 🎨',
        type: 'success',
      })

      console.log('✅ Collage saved and data refreshed')
    } catch (error) {
      console.error('❌ Error saving collage:', error)
      setNotification({
        message: 'Kunne ikke lagre kollasjen',
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
    <div className="min-h-screen p-6 md:p-10 pb-24 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
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
            className={`ripple-effect px-4 py-2 rounded-xl flex items-center gap-2 transition ${
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
            <span className="hidden sm:inline">
              {editMode ? t('common:done') : t('common:edit')}
            </span>
          </button>

          {/* Create Collage Button */}
          <button
            onClick={() => setCollageOpen(true)}
            disabled={albumPhotos.length < 2}
            className="ripple-effect px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title={
              albumPhotos.length < 2 ? 'Trenger minst 2 bilder' : 'Lag kollasj'
            }
          >
            <Layout size={18} />
            <span className="hidden sm:inline">Lag kollasj</span>
          </button>

          {/* Share Album Button */}
          <button
            onClick={() => setShareModalOpen(true)}
            className="ripple-effect px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Share2 size={18} />
            <span className="hidden sm:inline">Del album</span>
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

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-sm text-gray-400">{t('albums:photos')}</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-sm text-gray-400">{t('albums:size')}</p>
          <p className="text-2xl font-bold">{stats.totalSize} MB</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-sm text-gray-400">{t('albums:aiAnalyzed')}</p>
          <p className="text-2xl font-bold">{stats.aiAnalyzed}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <p className="text-sm text-gray-400">{t('albums:categories')}</p>
          <p className="text-2xl font-bold">{stats.categories}</p>
        </div>
      </div>

      {/* Action Bar */}
      {editMode && selectedPhotos.length > 0 && (
        <div className="bg-purple-600/20 border border-purple-500/30 rounded-xl p-4 mb-6 flex items-center justify-between">
          <span className="font-medium">
            {t('albums:selectedCount', { count: selectedPhotos.length })}
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setMoveOpen(true)}
              className="ripple-effect px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 transition"
            >
              <Move className="w-4 h-4" />
              {t('common:move')}
            </button>
            <button
              onClick={handleBulkDelete}
              className="ripple-effect px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg flex items-center gap-2 transition"
            >
              <Trash2 className="w-4 h-4" />
              {t('common:delete')}
            </button>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('albums:searchPhotos')}
            className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="ripple-effect absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* View Mode */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`ripple-effect p-3 rounded-lg transition ${
              viewMode === 'grid'
                ? 'bg-purple-600'
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            <Grid3x3 className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`ripple-effect p-3 rounded-lg transition ${
              viewMode === 'list'
                ? 'bg-purple-600'
                : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            <List className="w-5 h-5" />
          </button>
        </div>

        {/* Filters Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="ripple-effect px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg flex items-center gap-2 transition"
        >
          <Filter className="w-5 h-5" />
          {t('albums:filters')}
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              showFilters ? 'rotate-180' : ''
            }`}
          />
        </button>

        {/* Upload Button */}
        <button
          onClick={() => setUploadOpen(true)}
          className="ripple-effect px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 transition font-medium"
        >
          <ImageIcon className="w-5 h-5" />
          {t('albums:uploadPhotos')}
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Sort */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('albums:sortBy')}
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="date-desc">{t('albums:sortDateDesc')}</option>
                <option value="date-asc">{t('albums:sortDateAsc')}</option>
                <option value="name-asc">{t('albums:sortNameAsc')}</option>
                <option value="name-desc">{t('albums:sortNameDesc')}</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">
                {t('albums:category')}
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
              <label className="block text-sm font-medium mb-2">
                {t('albums:aiStatus')}
              </label>
              <select
                value={filterAI}
                onChange={(e) => setFilterAI(e.target.value)}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(12).fill(0).map((_, i) => (
            <SkeletonPhoto key={i} />
          ))}
        </div>
      )}

      {/* Photos Grid */}
      {!isInitialLoading && viewMode === 'grid' && filteredPhotos.length > 0 && (
        <div
          className={`grid gap-4 ${
            gridSize === 2
              ? 'grid-cols-2'
              : gridSize === 3
              ? 'grid-cols-2 sm:grid-cols-3'
              : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
          }`}
        >
          {filteredPhotos.map((photo, index) => (
            <div
              key={photo.id}
              className={`relative group aspect-square bg-black/20 rounded-xl overflow-hidden cursor-pointer transition hover:scale-105 animate-fade-in-up stagger-${(index % 12) + 1} ${
                isPhotoSelected(photo) ? 'ring-4 ring-purple-500' : ''
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
                src={photo.url}
                alt={photo.name}
                className="w-full h-full object-cover"
                loading="lazy"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition" />

              {/* Info */}
              <div className="absolute bottom-0 left-0 right-0 p-3 text-white opacity-0 group-hover:opacity-100 transition">
                <div className="text-xs space-y-1">
                  {photo.name && (
                    <p className="font-medium truncate">{photo.name}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-gray-300">
                    <Calendar className="w-3 h-3" />
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
                    {photo.aiAnalyzed && (
                      <>
                        <span>•</span>
                        <span>🤖 AI</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {editMode && (
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSetCover(photo)
                    }}
                    className="ripple-effect p-2 bg-yellow-500 hover:bg-yellow-600 rounded-lg transition"
                    title={t('albums:setCover')}
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(photo)
                    }}
                    className="ripple-effect p-2 bg-red-500 hover:bg-red-600 rounded-lg transition"
                    title={t('common:delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {isPhotoSelected(photo) && (
                <div className="absolute top-2 left-2 bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Photos List View */}
      {!isInitialLoading && viewMode === 'list' && filteredPhotos.length > 0 && (
        <div className="space-y-2">
          {filteredPhotos.map((photo, index) => (
            <div
              key={photo.id}
              className={`flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition cursor-pointer animate-fade-in-up stagger-${(index % 12) + 1} ${
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
                src={photo.url}
                alt={photo.name}
                className="w-16 h-16 object-cover rounded-lg"
              />

              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">
                  {photo.name || t('common:noName')}
                </div>
                <div className="text-sm text-gray-400 flex items-center gap-2 mt-1">
                  <Calendar className="w-3 h-3" />
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
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSetCover(photo)
                    }}
                    className="ripple-effect p-2 bg-yellow-500 hover:bg-yellow-600 rounded-lg transition"
                    title={t('albums:setCover')}
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(photo)
                    }}
                    className="ripple-effect p-2 bg-red-500 hover:bg-red-600 rounded-lg transition"
                    title={t('common:delete')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {isPhotoSelected(photo) && (
                <div className="bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center">
                  <Check className="w-4 h-4" />
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
                message: 'Redigert bilde lagret!'
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
