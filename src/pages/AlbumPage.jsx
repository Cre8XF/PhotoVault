// ============================================================================
// PAGE: AlbumPage.jsx – forbedret med sortering, filtrering og statistikk
// ============================================================================
import React, { useState, useMemo } from 'react'
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
} from 'lucide-react'
import {
  deletePhoto,
  setAlbumCover,
  uploadPhoto,
  addAlbum,
  updateAlbumPhotoCount,
} from '../firebase'
import { auth } from '../firebase'
import { useTranslation } from 'react-i18next'
import { getFirestore, doc, updateDoc } from 'firebase/firestore'
import UploadModal from '../components/UploadModal'
import MoveModal from '../components/MoveModal'
import PhotoModal from '../components/PhotoModal'

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
}) => {
  const { t } = useTranslation(['common', 'albums'])
  const [editMode, setEditMode] = useState(false)
  const [selectedPhotos, setSelectedPhotos] = useState([])
  const [isMoveOpen, setMoveOpen] = useState(false)
  const [isUploadOpen, setUploadOpen] = useState(false)
  const [photoModal, setPhotoModal] = useState({ open: false, index: 0 })

  // Nye states for sortering og visning
  const [sortBy, setSortBy] = useState('date-desc')
  const [gridSize, setGridSize] = useState(4)
  const [viewMode, setViewMode] = useState('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterAI, setFilterAI] = useState('all')

  const albumPhotos = useMemo(
    () => photos.filter((p) => p.albumId === album.id),
    [photos, album.id]
  )

  // Filtrer og sorter bilder
  const filteredPhotos = useMemo(() => {
    let filtered = [...albumPhotos]

    if (searchQuery) {
      filtered = filtered.filter((p) =>
        (p.name || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter((p) => p.category === filterCategory)
    }

    if (filterAI === 'ai') {
      filtered = filtered.filter((p) => p.aiAnalyzed)
    } else if (filterAI === 'no-ai') {
      filtered = filtered.filter((p) => !p.aiAnalyzed)
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        case 'date-asc':
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
        case 'name-asc':
          return (a.name || '').localeCompare(b.name || '')
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '')
        default:
          return 0
      }
    })

    return filtered
  }, [albumPhotos, searchQuery, sortBy, filterCategory, filterAI])

  // Statistikk
  const stats = useMemo(() => {
    const totalSize = albumPhotos.reduce((sum, p) => sum + (p.size || 0), 0)
    const aiCount = albumPhotos.filter((p) => p.aiAnalyzed).length
    const categories = [
      ...new Set(albumPhotos.map((p) => p.category).filter(Boolean)),
    ]

    return {
      total: albumPhotos.length,
      totalSize: (totalSize / (1024 * 1024)).toFixed(1),
      aiAnalyzed: aiCount,
      categories: categories.length,
    }
  }, [albumPhotos])

  const handleSetCover = async (photo) => {
    try {
      await setAlbumCover(album.id, photo.url)
      if (refreshData) await refreshData()
    } catch (error) {
      console.error(t('albums:errors.coverUpdateError'), error)
      alert(t('albums:errors.couldNotSetCover'))
    }
  }

  const handleDelete = async (photo) => {
    if (!window.confirm(t('albums:errors.confirmDeletePhoto'))) return
    try {
      await deletePhoto(photo.id, photo.storagePath)
      if (refreshData) await refreshData()
    } catch (error) {
      console.error(t('albums:errors.photoDeleteError'), error)
      alert(t('albums:errors.couldNotDeletePhoto'))
    }
  }

  const handleBulkDelete = async () => {
    if (
      !window.confirm(
        t('albums:errors.confirmBulkDelete', { count: selectedPhotos.length })
      )
    )
      return
    try {
      for (const photo of selectedPhotos) {
        await deletePhoto(photo.id, photo.storagePath)
      }
      setSelectedPhotos([])
      if (refreshData) await refreshData()
    } catch (error) {
      console.error(t('albums:errors.bulkDeleteError'), error)
      alert(t('albums:errors.couldNotDeleteAll'))
    }
  }

  const handleUpload = async (files, albumId, aiTagging) => {
    const currentUser = auth.currentUser
    if (!currentUser) {
      alert(t('albums:errors.mustBeLoggedIn'))
      return
    }
    try {
      for (const fileObj of files) {
        await uploadPhoto(
          currentUser.uid,
          fileObj.file,
          albumId || album.id,
          aiTagging
        )
      }
      await refreshData()
    } catch (error) {
      console.error('Upload error:', error)
    }
  }

  const handleCreateAlbum = async (albumData) => {
    try {
      // Album already created by UploadModal - just refresh UI
      if (refreshData) await refreshData()
    } catch (error) {
      console.error(t('albums:errors.albumCreationError'), error)
      alert(t('albums:errors.couldNotCreateAlbum'))
    }
  }

  const handleMovePhotos = async (targetAlbumId) => {
    try {
      const db = getFirestore()
      const updates = selectedPhotos.filter(Boolean).map(async (photo) => {
        const photoId =
          typeof photo === 'string' ? photo : photo.id || photo.docId
        if (!photoId) return
        const photoRef = doc(db, 'photos', photoId)
        await updateDoc(photoRef, { albumId: targetAlbumId })
      })

      await Promise.all(updates)

      const fromCount = albumPhotos.length - selectedPhotos.length
      await updateAlbumPhotoCount(album.id, Math.max(0, fromCount))

      const targetAlbumPhotos = photos.filter(
        (p) => p.albumId === targetAlbumId
      ).length
      await updateAlbumPhotoCount(
        targetAlbumId,
        targetAlbumPhotos + selectedPhotos.length
      )

      if (refreshData) await refreshData()
      setSelectedPhotos([])
    } catch (error) {
      console.error(t('albums:errors.moveError'), error)
      alert(t('albums:errors.couldNotMovePhotos'))
    }
  }

  const togglePhotoSelection = (photo) => {
    setSelectedPhotos((prev) => {
      const isSelected = prev.some(
        (p) => (typeof p === 'string' ? p : p.id) === photo.id
      )
      if (isSelected) {
        return prev.filter(
          (p) => (typeof p === 'string' ? p : p.id) !== photo.id
        )
      } else {
        return [...prev, photo]
      }
    })
  }

  const isPhotoSelected = (photo) => {
    return selectedPhotos.some(
      (p) => (typeof p === 'string' ? p : p.id) === photo.id
    )
  }

  const handleSelectAll = () => {
    if (selectedPhotos.length === filteredPhotos.length) {
      setSelectedPhotos([])
    } else {
      setSelectedPhotos([...filteredPhotos])
    }
  }

  const gridClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
    5: 'grid-cols-3 md:grid-cols-4 lg:grid-cols-5',
  }[gridSize]

  return (
    <div className="album-page p-4 md:p-8 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="ripple-effect p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold">{album.name}</h1>
            <p className="text-sm text-gray-400 mt-1">
              {stats.total} {t('common:photos')} · {stats.totalSize} MB
              {stats.aiAnalyzed > 0 &&
                ` · ${stats.aiAnalyzed} ${t('albums:stats.aiAnalyzed')}`}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {selectedPhotos.length > 0 && (
            <>
              <button
                onClick={() => setMoveOpen(true)}
                className="ripple-effect px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 flex items-center gap-2 transition"
              >
                <Move size={18} /> {t('common:move')} ({selectedPhotos.length})
              </button>
              <button
                onClick={handleBulkDelete}
                className="ripple-effect px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 flex items-center gap-2 transition"
              >
                <Trash2 size={18} /> {t('common:delete')} (
                {selectedPhotos.length})
              </button>
            </>
          )}
          <button
            onClick={() => setUploadOpen(true)}
            className="ripple-effect px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 transition"
          >
            {t('common:upload')}
          </button>
          <button
            onClick={() => {
              setEditMode(!editMode)
              if (editMode) setSelectedPhotos([])
            }}
            className={`ripple-effect px-4 py-2 rounded-xl ${
              editMode
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-white/10 hover:bg-white/20'
            } flex items-center gap-2 transition`}
          >
            {editMode ? <Check size={18} /> : <Edit3 size={18} />}
            {editMode ? t('common:done') : t('common:edit')}
          </button>
        </div>
      </div>

      {/* Statistikk-panel */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <ImageIcon className="w-4 h-4" />
            {t('common:total')}
          </div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <Download className="w-4 h-4" />
            {t('common:size')}
          </div>
          <div className="text-2xl font-bold">{stats.totalSize} MB</div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            🤖 AI
          </div>
          <div className="text-2xl font-bold">{stats.aiAnalyzed}</div>
        </div>
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-1">
            <Star className="w-4 h-4" />
            {t('albums:stats.categories')}
          </div>
          <div className="text-2xl font-bold">{stats.categories}</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/10">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Søk */}
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('albums:searchPlaceholder')}
              className="w-full pl-10 pr-10 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Sortering */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
            >
              <option value="date-desc">
                {t('albums:sorting.newestFirst')}
              </option>
              <option value="date-asc">
                {t('albums:sorting.oldestFirst')}
              </option>
              <option value="name-asc">{t('albums:sorting.nameAZ')}</option>
              <option value="name-desc">{t('albums:sorting.nameZA')}</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Filter-knapp */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`ripple-effect px-4 py-2 rounded-lg flex items-center gap-2 transition ${
              showFilters ? 'bg-purple-600' : 'bg-white/5 hover:bg-white/10'
            }`}
          >
            <Filter className="w-4 h-4" />
            {t('common:filters')}
          </button>

          {/* Grid-størrelse */}
          <div className="flex gap-1 bg-white/5 rounded-lg p-1">
            {[2, 3, 4, 5].map((size) => (
              <button
                key={size}
                onClick={() => setGridSize(size)}
                className={`ripple-effect px-3 py-1 rounded ${
                  gridSize === size ? 'bg-purple-600' : 'hover:bg-white/10'
                } transition text-sm`}
              >
                {size}
              </button>
            ))}
          </div>

          {/* View mode */}
          <div className="flex gap-1 bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`ripple-effect p-2 rounded ${
                viewMode === 'grid' ? 'bg-purple-600' : 'hover:bg-white/10'
              } transition`}
            >
              <Grid3x3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`ripple-effect p-2 rounded ${
                viewMode === 'list' ? 'bg-purple-600' : 'hover:bg-white/10'
              } transition`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Velg alle */}
          {editMode && (
            <button
              onClick={handleSelectAll}
              className="ripple-effect px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition text-sm"
            >
              {selectedPhotos.length === filteredPhotos.length
                ? t('common:removeAll')
                : t('common:selectAll')}
            </button>
          )}
        </div>

        {/* Filter-panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-3">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm text-gray-400 mb-2 block">
                {t('common:category')}
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">{t('albums:categories.all')}</option>
                <option value="people">{t('albums:categories.people')}</option>
                <option value="nature">{t('albums:categories.nature')}</option>
                <option value="food">{t('albums:categories.food')}</option>
                <option value="animals">
                  {t('albums:categories.animals')}
                </option>
                <option value="indoor">{t('albums:categories.indoor')}</option>
                <option value="travel">{t('albums:categories.travel')}</option>
                <option value="architecture">
                  {t('albums:categories.architecture')}
                </option>
                <option value="event">{t('albums:categories.event')}</option>
                <option value="sport">{t('albums:categories.sport')}</option>
                <option value="art">{t('albums:categories.art')}</option>
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm text-gray-400 mb-2 block">
                {t('albums:aiStatus.label')}
              </label>
              <select
                value={filterAI}
                onChange={(e) => setFilterAI(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">{t('albums:aiStatus.all')}</option>
                <option value="ai">{t('albums:aiStatus.aiOnly')}</option>
                <option value="no-ai">{t('albums:aiStatus.notAI')}</option>
              </select>
            </div>
            <button
              onClick={() => {
                setFilterCategory('all')
                setFilterAI('all')
                setSearchQuery('')
              }}
              className="ripple-effect px-4 py-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg transition text-sm self-end"
            >
              {t('common:resetFilters')}
            </button>
          </div>
        )}
      </div>

      {/* Tom tilstand */}
      {albumPhotos.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>{t('albums:noPhotosYet')}</p>
          <button
            onClick={() => setUploadOpen(true)}
            className="mt-4 ripple-effect px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
          >
            {t('common:uploadImages')}
          </button>
        </div>
      )}

      {/* Ingen resultat etter filtrering */}
      {albumPhotos.length > 0 && filteredPhotos.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>{t('common:noMatchingPhotos')}</p>
          <button
            onClick={() => {
              setFilterCategory('all')
              setFilterAI('all')
              setSearchQuery('')
            }}
            className="mt-4 ripple-effect px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition"
          >
            {t('common:resetFilters')}
          </button>
        </div>
      )}

      {/* Bilder - Grid View */}
      {viewMode === 'grid' && filteredPhotos.length > 0 && (
        <div className={`grid ${gridClass} gap-4`}>
          {filteredPhotos.map((photo, index) => (
            <div
              key={photo.id}
              className={`relative group cursor-pointer ${
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
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-lg bg-black/10 flex items-center justify-center">
                <img
                  src={photo.url}
                  alt={photo.name}
                  className="max-h-full max-w-full object-contain border border-white/10 transition-transform duration-300 hover:scale-[1.03] rounded-lg"
                />
              </div>

              {/* AI-indikatorer */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {photo.aiAnalyzed && (
                  <span className="px-2 py-1 bg-purple-600/80 backdrop-blur rounded-full text-[10px] font-bold flex items-center gap-1 shadow">
                    🤖 AI
                  </span>
                )}
                {photo.faces > 0 && (
                  <span className="px-2 py-1 bg-pink-500/80 backdrop-blur rounded-full text-[10px] font-bold shadow">
                    👤 {photo.faces}
                  </span>
                )}
                {photo.category && (
                  <span className="px-2 py-1 bg-blue-500/80 backdrop-blur rounded-full text-[10px] shadow">
                    {getCategoryIcon(photo.category)}
                  </span>
                )}
              </div>

              {/* Cover-indikator */}
              {album.cover === photo.url && (
                <div className="absolute top-2 right-2 bg-yellow-500 text-black px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" />
                  {t('albums:setCover')}
                </div>
              )}

              {/* Valgt-indikator */}
              {isPhotoSelected(photo) && (
                <div className="absolute top-2 right-2 bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center">
                  <Check className="w-4 h-4" />
                </div>
              )}

              {/* Rediger-knapper */}
              {editMode && !isPhotoSelected(photo) && (
                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleSetCover(photo)
                    }}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-full transition shadow-lg"
                    title={t('albums:setCover')}
                  >
                    <ImageIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDelete(photo)
                    }}
                    className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition shadow-lg"
                    title={t('albums:deletePhoto')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Bildenavn */}
              {photo.name && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 rounded-b-xl truncate opacity-0 group-hover:opacity-100 transition">
                  {photo.name}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Bilder - List View */}
      {viewMode === 'list' && filteredPhotos.length > 0 && (
        <div className="space-y-2">
          {filteredPhotos.map((photo, index) => (
            <div
              key={photo.id}
              className={`flex items-center gap-4 p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition cursor-pointer ${
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
                  {photo.aiAnalyzed && (
                    <>
                      <span>•</span>
                      <span>🤖 AI</span>
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

      {/* PhotoModal */}
      {photoModal.open && (
        <PhotoModal
          photos={filteredPhotos}
          currentIndex={photoModal.index}
          onClose={() => setPhotoModal({ open: false, index: 0 })}
        />
      )}

      {/* Modaler */}
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
    </div>
  )
}

export default AlbumPage
