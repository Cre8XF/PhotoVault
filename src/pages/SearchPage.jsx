// ============================================================================
// PAGE: SearchPage.jsx – v5.7 MED MULTISELECT + VELG ALLE
// ============================================================================
import React, { useState, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Search as SearchIcon,
  X,
  Calendar,
  Tag,
  Star,
  Users,
  Folder,
  SlidersHorizontal,
  Sparkles,
  Move,
  Trash2,
  Edit3,
  Check,
  CheckSquare,
  Square,
} from 'lucide-react'
import { getFirestore, doc, updateDoc } from 'firebase/firestore'
import { deletePhoto, setAlbumCover, updateAlbumPhotoCount } from '../firebase'
import MoveModal from '../components/MoveModal'
import ConfirmModal from '../components/ConfirmModal'
import PhotoModal from '../components/PhotoModal'

const SearchPage = ({
  photos = [],
  albums = [],
  onPhotoClick,
  toggleFavorite,
  refreshData,
}) => {
  const { t } = useTranslation(['search', 'common'])

  // 🔒 SIKRE AT PROPS ER ARRAYS
  const safePhotos = useMemo(() => {
    if (!Array.isArray(photos)) {
      console.warn(
        '⚠️ SearchPage received non-array photos:',
        typeof photos,
        photos
      )
      return []
    }
    return photos
  }, [photos])

  const safeAlbums = useMemo(() => {
    if (!Array.isArray(albums)) {
      console.warn(
        '⚠️ SearchPage received non-array albums:',
        typeof albums,
        albums
      )
      return []
    }
    return albums
  }, [albums])

  // Søk og filter
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilters, setActiveFilters] = useState({
    favorites: false,
    withFaces: false,
    withTags: false,
    aiAnalyzed: false,
    dateRange: null,
    albumId: null,
    category: null,
  })
  const [showFilters, setShowFilters] = useState(false)

  // Redigeringsmodus og flytting
  const [editMode, setEditMode] = useState(false)
  const [selectedPhotos, setSelectedPhotos] = useState([])
  const [isMoveOpen, setMoveOpen] = useState(false)

  // Bekreftelsesdialog for sletting
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [photoToDelete, setPhotoToDelete] = useState(null)

  // PhotoModal state
  const [photoModal, setPhotoModal] = useState({ open: false, index: 0 })

  // 🔒 SIKRET: Kategorier med array-guard
  const categories = useMemo(() => {
    const set = new Set()
    safePhotos.forEach((p) => p.category && set.add(p.category))
    return Array.from(set).sort()
  }, [safePhotos])

  // 🔒 SIKRET: PopularTags med array-guard
  const popularTags = useMemo(() => {
    const counts = {}
    safePhotos.forEach((p) =>
      (Array.isArray(p.aiTags) ? p.aiTags : []).forEach((t) => {
        counts[t] = (counts[t] || 0) + 1
      })
    )
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([tag, count]) => ({ tag, count }))
  }, [safePhotos])

  // 🔒 SIKRET: Filtrering med array-guards
  const filteredPhotos = useMemo(() => {
    let res = safePhotos

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      res = res.filter((p) => {
        const inName = p.name?.toLowerCase().includes(q)
        const inTags = Array.isArray(p.aiTags)
          ? p.aiTags.some((t) => t.toLowerCase().includes(q))
          : false
        const inCat = p.category?.toLowerCase().includes(q)
        return inName || inTags || inCat
      })
    }

    if (activeFilters.favorites) res = res.filter((p) => p.favorite)
    if (activeFilters.withFaces) res = res.filter((p) => (p.faces || 0) > 0)
    if (activeFilters.withTags)
      res = res.filter((p) => Array.isArray(p.aiTags) && p.aiTags.length > 0)
    if (activeFilters.aiAnalyzed) res = res.filter((p) => !!p.aiAnalyzed)
    if (activeFilters.category)
      res = res.filter((p) => p.category === activeFilters.category)

    if (activeFilters.albumId) {
      if (activeFilters.albumId === 'noAlbum') {
        res = res.filter((p) => !p.albumId || p.albumId === '')
      } else {
        res = res.filter((p) => p.albumId === activeFilters.albumId)
      }
    }

    if (activeFilters.dateRange) {
      const now = Date.now()
      const days =
        { today: 1, week: 7, month: 30, year: 365 }[activeFilters.dateRange] ||
        0
      if (days > 0) {
        const cutoff = now - days * 24 * 60 * 60 * 1000
        res = res.filter(
          (p) => new Date(p.createdAt || p.uploadedAt || 0).getTime() >= cutoff
        )
      }
    }

    return res
  }, [safePhotos, searchQuery, activeFilters])

  const activeFilterCount = useMemo(() => {
    return Object.values(activeFilters).filter(Boolean).length
  }, [activeFilters])

  // --- Toggle photo selection ---
  const togglePhotoSelection = (photoId) => {
    setSelectedPhotos((prev) => {
      if (prev.includes(photoId)) {
        return prev.filter((id) => id !== photoId)
      } else {
        return [...prev, photoId]
      }
    })
  }

  // --- Select all / deselect all ---
  const selectAllPhotos = () => {
    const allIds = filteredPhotos.map((p) => p.id)
    setSelectedPhotos(allIds)
  }

  const deselectAllPhotos = () => {
    setSelectedPhotos([])
  }

  // --- Clear filters ---
  const clearFilters = () => {
    setActiveFilters({
      favorites: false,
      withFaces: false,
      withTags: false,
      aiAnalyzed: false,
      dateRange: null,
      albumId: null,
      category: null,
    })
    setSearchQuery('')
  }

  // --- Sletting ---
  const requestDelete = (photo) => {
    setPhotoToDelete(photo)
    setConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!photoToDelete) return
    try {
      await deletePhoto(photoToDelete.id, photoToDelete.storagePath)
      setPhotoToDelete(null)
      if (refreshData) await refreshData()
    } catch (error) {
      console.error('Delete error:', error)
      alert(t('search:errors.couldNotDelete', 'Kunne ikke slette bildet.'))
    }
  }

  // --- Sett forside ---
  const handleSetCover = async (photo) => {
    try {
      await setAlbumCover(photo.albumId, photo.url)
      if (refreshData) await refreshData()
    } catch (error) {
      console.error('Cover update error:', error)
    }
  }

  // 🔒 SIKRET: Flytting med array-guards
  const handleMovePhotos = async (targetAlbumId) => {
    try {
      const db = getFirestore()
      const safeSelected = Array.isArray(selectedPhotos) ? selectedPhotos : []

      for (const id of safeSelected) {
        const docRef = doc(db, 'photos', id)
        await updateDoc(docRef, { albumId: targetAlbumId })
      }

      await updateAlbumPhotoCount(targetAlbumId)
      setSelectedPhotos([])
      setMoveOpen(false)
      setEditMode(false)

      if (refreshData) await refreshData()
    } catch (error) {
      console.error('Move error:', error)
      alert(t('search:errors.couldNotMove', 'Kunne ikke flytte bilder.'))
    }
  }

  return (
    <div className="container-premium max-w-7xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
          <SearchIcon className="w-7 h-7" />
          {t('search:title')}
        </h1>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setEditMode(!editMode)
              if (editMode) {
                setSelectedPhotos([])
              }
            }}
            className={`ripple-effect px-4 py-2 rounded-xl flex items-center gap-2 transition ${
              editMode
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'bg-white/10 hover:bg-white/20'
            }`}
          >
            {editMode && (
              <span className="text-sm text-indigo-200 dark:text-indigo-100 bg-indigo-700/30 dark:bg-indigo-500/40 px-3 py-1 rounded-lg ml-2 transition">
                {t('search:clickToManage')}
              </span>
            )}
            {editMode ? <Check size={18} /> : <Edit3 size={18} />}
            {editMode ? t('search:done') : t('search:edit')}
          </button>

          <button
            onClick={() => setShowFilters((v) => !v)}
            className="ripple-effect px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 flex items-center gap-2"
          >
            <SlidersHorizontal size={18} />
            {t('search:filters')}
            {activeFilterCount > 0 && (
              <span className="ml-1 rounded-md px-2 py-0.5 text-sm bg-purple-600">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Edit mode action bar */}
      {editMode && (
        <div className="glass rounded-2xl p-3 mb-4 flex flex-wrap gap-2 items-center justify-between">
          <div className="flex gap-2 items-center">
            <span className="text-sm opacity-70">
              {selectedPhotos.length} {t('search:selected')}
            </span>
            <button
              onClick={selectAllPhotos}
              className="ripple-effect px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 flex items-center gap-2 text-sm"
            >
              <CheckSquare size={16} />
              {t('search:selectAll')}
            </button>
            {selectedPhotos.length > 0 && (
              <button
                onClick={deselectAllPhotos}
                className="ripple-effect px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 flex items-center gap-2 text-sm"
              >
                <Square size={16} />
                {t('search:deselectAll')}
              </button>
            )}
          </div>

          {selectedPhotos.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => setMoveOpen(true)}
                className="ripple-effect px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                <Move size={18} /> {t('search:move')}
              </button>
              <button
                onClick={() => {
                  if (selectedPhotos.length === 1) {
                    const photo = safePhotos.find(
                      (p) => p.id === selectedPhotos[0]
                    )
                    if (photo) requestDelete(photo)
                  } else {
                    alert(t('search:errors.multiDeleteNotSupported'))
                  }
                }}
                className="ripple-effect px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 flex items-center gap-2"
              >
                <Trash2 size={18} /> {t('search:delete')}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Søkefelt */}
      <div className="glass rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-3">
          <SearchIcon className="w-5 h-5 opacity-60" />
          <input
            type="text"
            placeholder={t('search:searchIn')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-lg"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="ripple-effect p-1 hover:bg-white/10 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Filterpanel */}
      {showFilters && (
        <div className="glass rounded-2xl p-4 mb-6 space-y-4">
          {/* Primærfiltre */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() =>
                setActiveFilters((f) => ({ ...f, favorites: !f.favorites }))
              }
              className={`px-3 py-2 rounded-lg border ${
                activeFilters.favorites
                  ? 'bg-yellow-600 border-yellow-500'
                  : 'border-white/10'
              } flex items-center gap-2`}
            >
              <Star size={16} /> {t('search:filterOptions.favorites')}
            </button>

            <button
              onClick={() =>
                setActiveFilters((f) => ({ ...f, withFaces: !f.withFaces }))
              }
              className={`px-3 py-2 rounded-lg border ${
                activeFilters.withFaces
                  ? 'bg-blue-600 border-blue-500'
                  : 'border-white/10'
              } flex items-center gap-2`}
            >
              <Users size={16} /> {t('search:filterOptions.withFaces')}
            </button>

            <button
              onClick={() =>
                setActiveFilters((f) => ({ ...f, withTags: !f.withTags }))
              }
              className={`px-3 py-2 rounded-lg border ${
                activeFilters.withTags
                  ? 'bg-emerald-600 border-emerald-500'
                  : 'border-white/10'
              } flex items-center gap-2`}
            >
              <Tag size={16} /> {t('search:filterOptions.withTags')}
            </button>

            <button
              onClick={() =>
                setActiveFilters((f) => ({ ...f, aiAnalyzed: !f.aiAnalyzed }))
              }
              className={`px-3 py-2 rounded-lg border ${
                activeFilters.aiAnalyzed
                  ? 'bg-purple-600 border-purple-500'
                  : 'border-white/10'
              } flex items-center gap-2`}
            >
              <Sparkles size={16} /> {t('search:filterOptions.aiAnalyzed')}
            </button>
          </div>

          {/* Avanserte valg */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Album */}
            <label className="flex items-center gap-2">
              <Folder size={16} />
              <select
                value={
                  activeFilters.albumId === 'noAlbum'
                    ? 'noAlbum'
                    : activeFilters.albumId || ''
                }
                onChange={(e) =>
                  setActiveFilters((f) => ({
                    ...f,
                    albumId: e.target.value || null,
                  }))
                }
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none"
              >
                <option value="">{t('search:filterOptions.allAlbums')}</option>
                <option value="noAlbum">
                  {t('search:filterOptions.noAlbum')}
                </option>
                {safeAlbums.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </label>

            {/* Kategori */}
            <label className="flex items-center gap-2">
              <Tag size={16} />
              <select
                value={activeFilters.category || ''}
                onChange={(e) =>
                  setActiveFilters((f) => ({
                    ...f,
                    category: e.target.value || null,
                  }))
                }
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none"
              >
                <option value="">
                  {t('search:filterOptions.allCategories')}
                </option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            {/* Dato */}
            <label className="flex items-center gap-2">
              <Calendar size={16} />
              <select
                value={activeFilters.dateRange || ''}
                onChange={(e) =>
                  setActiveFilters((f) => ({
                    ...f,
                    dateRange: e.target.value || null,
                  }))
                }
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none"
              >
                <option value="">{t('search:filterOptions.allDates')}</option>
                <option value="today">{t('search:filterOptions.today')}</option>
                <option value="week">{t('search:filterOptions.week')}</option>
                <option value="month">{t('search:filterOptions.month')}</option>
                <option value="year">{t('search:filterOptions.year')}</option>
              </select>
            </label>
          </div>

          {/* Populære AI-tagger */}
          {popularTags.length > 0 && (
            <div>
              <p className="text-sm opacity-70 mb-2">
                {t('search:popularAITags')}:
              </p>
              <div className="flex flex-wrap gap-2">
                {popularTags.map(({ tag, count }) => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-sm"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Handling */}
      <div className="flex justify-between mb-4">
        <div className="text-sm opacity-60">
          {t('search:activeFilters')}: <b>{activeFilterCount}</b>
        </div>
        <button
          onClick={clearFilters}
          className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20"
        >
          {t('search:resetFilters')}
        </button>
      </div>

      {/* 🔒 SIKRET: Resultater med array-guard */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
        {filteredPhotos.map((photo, index) => (
          <div
            key={photo.id}
            className="relative group aspect-[4/5] bg-black/10 rounded-lg flex items-center justify-center overflow-hidden"
          >
            {/* Checkbox overlay in edit mode */}
            {editMode && (
              <div
                className="absolute inset-0 z-10 cursor-pointer"
                onClick={() => togglePhotoSelection(photo.id)}
              >
                <div
                  className={`absolute top-2 right-2 w-6 h-6 rounded border-2 flex items-center justify-center transition ${
                    selectedPhotos.includes(photo.id)
                      ? 'bg-purple-600 border-purple-600'
                      : 'bg-black/60 border-white/60'
                  }`}
                >
                  {selectedPhotos.includes(photo.id) && (
                    <Check className="w-4 h-4 text-white" />
                  )}
                </div>
                {selectedPhotos.includes(photo.id) && (
                  <div className="absolute inset-0 bg-purple-600/20 border-2 border-purple-600 rounded-lg" />
                )}
              </div>
            )}

            <img
              src={photo.url}
              alt={photo.name}
              onClick={() => !editMode && setPhotoModal({ open: true, index })}
              className="max-h-full max-w-full object-contain cursor-pointer transition-transform duration-300 group-hover:scale-[1.03]"
            />

            {/* Favorite toggle - always visible */}
            {!editMode && toggleFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleFavorite(photo)
                }}
                className={`absolute top-2 left-2 p-1.5 rounded-full transition opacity-0 group-hover:opacity-100 ${
                  photo.favorite
                    ? 'bg-yellow-500/90 hover:bg-yellow-600'
                    : 'bg-black/60 hover:bg-white/30'
                }`}
                title={
                  photo.favorite
                    ? t('common:removeFavorite')
                    : t('common:addToFavorites')
                }
              >
                <Star
                  className="w-3.5 h-3.5"
                  fill={photo.favorite ? 'currentColor' : 'none'}
                />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* No results */}
      {filteredPhotos.length === 0 && (
        <div className="text-center py-12 opacity-60">
          <SearchIcon className="w-12 h-12 mx-auto mb-3" />
          <p>{t('search:noResults')}</p>
        </div>
      )}

      {/* Modals */}
      {isMoveOpen && (
        <MoveModal
          photos={selectedPhotos.map((id) =>
            safePhotos.find((p) => p.id === id)
          )}
          albums={safeAlbums}
          onClose={() => setMoveOpen(false)}
          onMove={handleMovePhotos}
        />
      )}

      {confirmOpen && (
        <ConfirmModal
          title={t('search:confirmDelete')}
          message={t('search:confirmDeleteMessage')}
          onConfirm={handleConfirmDelete}
          onCancel={() => {
            setConfirmOpen(false)
            setPhotoToDelete(null)
          }}
        />
      )}

      {photoModal.open && (
        <PhotoModal
          photos={filteredPhotos}
          initialIndex={photoModal.index}
          onClose={() => setPhotoModal({ open: false, index: 0 })}
          toggleFavorite={toggleFavorite}
        />
      )}
    </div>
  )
}

export default SearchPage
