// ============================================================================
// PAGE: SearchPage.jsx – v5.8 WITH DATE GROUPING (Month + Year)
// ============================================================================
import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
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
import { format } from 'date-fns'
import { nb } from 'date-fns/locale'
import { deletePhoto, setAlbumCover, updateAlbumPhotoCount } from '../firebase'
import MoveModal from '../components/MoveModal'
import ConfirmModal from '../components/ConfirmModal'
import useStore from '../state/store'
import { resolvePhotoDate, sortPhotosByDate, groupPhotosByMonth } from '../utils/photoDateUtils'

const SearchPage = ({
  photos = [],
  albums = [],
  onPhotoClick,
  toggleFavorite,
  refreshData,
}) => {
  const { t } = useTranslation(['search', 'common'])
  const navigate = useNavigate()
  const location = useLocation()

  // Photo context setters - Phase 2A
  const setCurrentPhotoId = useStore((state) => state.setCurrentPhotoId)
  const setPhotoContext = useStore((state) => state.setPhotoContext)
  const setPhotoOrder = useStore((state) => state.setPhotoOrder)
  const setPhotoIndex = useStore((state) => state.setPhotoIndex)

  // 🔒 SIKRE AT PROPS ER ARRAYS
  const safePhotos = useMemo(() => {
    if (!Array.isArray(photos)) {
      if (import.meta.env.DEV) {
        console.warn(
          '⚠️ SearchPage received non-array photos:',
          typeof photos,
          photos
        )
      }
      return []
    }
    return photos
  }, [photos])

  const safeAlbums = useMemo(() => {
    if (!Array.isArray(albums)) {
      if (import.meta.env.DEV) {
        console.warn(
          '⚠️ SearchPage received non-array albums:',
          typeof albums,
          albums
        )
      }
      return []
    }
    return albums
  }, [albums])

  // Søk og filter
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const debounceTimerRef = useRef(null)
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

  // Track special filters that bypass normal filtering
  const [specialFilter, setSpecialFilter] = useState(null)

  // Debounce search query for performance
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    debounceTimerRef.current = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [searchQuery])

  // Read filters from URL query params
  useEffect(() => {
    const params = new URLSearchParams(location.search)

    const newFilters = { ...activeFilters }
    let hasChanges = false

    // Check for range filter (30days, week, month, year)
    if (params.has('range')) {
      const range = params.get('range')
      if (range === '30days') {
        newFilters.dateRange = 'month'
        hasChanges = true
      } else if (range === 'week') {
        newFilters.dateRange = 'week'
        hasChanges = true
      } else if (range === 'year') {
        newFilters.dateRange = 'year'
        hasChanges = true
      }
    }

    // Check for favorites filter
    if (params.has('favorites') && params.get('favorites') === 'true') {
      newFilters.favorites = true
      hasChanges = true
    }

    // Check for recent filter (FIXED - Issue 1)
    if (params.has('recent') && params.get('recent') === 'true') {
      const limit = parseInt(params.get('limit')) || 50
      if (import.meta.env.DEV) {
        console.log('🔵 RECENT FILTER ACTIVATED:', {
          limit,
          totalPhotos: safePhotos.length,
          explanation:
            'Will show most recent photos sorted by createdAt/uploadedAt',
        })
      }
      setSpecialFilter({ type: 'recent', limit })
    } else {
      setSpecialFilter(null)
    }

    // Check for day filter (FIXED - Issue 2)
    if (params.has('day')) {
      const dayValue = params.get('day')
      if (import.meta.env.DEV) {
        console.log('🔵 DAY FILTER ACTIVATED:', dayValue)
      }

      if (dayValue === 'today') {
        newFilters.dateRange = 'today'
        hasChanges = true
      } else if (dayValue === 'yesterday') {
        newFilters.dateRange = 'yesterday'
        hasChanges = true
      } else {
        // Specific date (YYYY-MM-DD format)
        newFilters.dateRange = `date:${dayValue}`
        hasChanges = true
      }
    }

    // Check for week filter (FIXED - Issue 2)
    if (params.has('week') && params.get('week') === 'true') {
      if (import.meta.env.DEV) {
        console.log('🔵 WEEK FILTER ACTIVATED')
      }
      newFilters.dateRange = 'week'
      hasChanges = true
    }

    // Check for faces filter
    if (params.has('faces') && params.get('faces') === 'true') {
      newFilters.withFaces = true
      hasChanges = true
    }

    // Check for unassigned filter
    if (params.has('unassigned') && params.get('unassigned') === 'true') {
      newFilters.albumId = 'noAlbum'
      hasChanges = true
    }

    // Check for AI analyzed filter
    if (params.has('aiAnalyzed') && params.get('aiAnalyzed') === 'true') {
      newFilters.aiAnalyzed = true
      hasChanges = true
    }

    // Apply filters if any were found in URL
    if (hasChanges) {
      setActiveFilters(newFilters)
      if (import.meta.env.DEV) {
        console.log('✅ Applied filters from URL params:', newFilters)
      }
    }
  }, [location.search, safePhotos.length]) // Re-run when URL query params change

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
    // ✅ EXCLUDE DOCUMENTS: SearchPage shows only images and videos by default
    let res = safePhotos.filter((p) => p.type !== 'document')

    // SPECIAL FILTER: Recent photos (Issue 1 fix)
    if (specialFilter?.type === 'recent') {
      if (import.meta.env.DEV) {
        console.log('🔍 Applying RECENT filter...')
      }
      // Sort by most recent first (createdAt or uploadedAt)
      const sorted = [...res].sort((a, b) => {
        const dateA = new Date(a.createdAt || a.uploadedAt || 0).getTime()
        const dateB = new Date(b.createdAt || b.uploadedAt || 0).getTime()
        return dateB - dateA // Most recent first
      })
      // Limit to specified number
      res = sorted.slice(0, specialFilter.limit)
      if (import.meta.env.DEV) {
        console.log(`✅ Recent filter applied: showing ${res.length} photos`)
      }
      return res // Skip other filters when showing recent
    }

    if (debouncedSearchQuery.trim()) {
      const q = debouncedSearchQuery.toLowerCase()
      if (import.meta.env.DEV) {
        console.log('🔍 Searching for:', q)
      }

      res = res.filter((p) => {
        // Search in filename
        const inName = p.name?.toLowerCase().includes(q)

        // Search in AI tags
        const inTags = Array.isArray(p.aiTags)
          ? p.aiTags.some((t) => t.toLowerCase().includes(q))
          : false

        // Search in category
        const inCat = p.category?.toLowerCase().includes(q)

        // Search in album name (FIXED - Issue 3)
        const album = safeAlbums.find((a) => a.id === p.albumId)
        const inAlbum = album?.name?.toLowerCase().includes(q)

        return inName || inTags || inCat || inAlbum
      })

      if (import.meta.env.DEV) {
        console.log(`✅ Search complete: ${res.length} results for "${q}"`)
      }
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

      // Handle special day filters (today, yesterday) - Issue 2 fix
      if (activeFilters.dateRange === 'today') {
        const todayStart = new Date()
        todayStart.setHours(0, 0, 0, 0)
        const todayEnd = new Date()
        todayEnd.setHours(23, 59, 59, 999)

        if (import.meta.env.DEV) {
          console.log('🔍 Filtering photos from TODAY:', {
            start: todayStart.toISOString(),
            end: todayEnd.toISOString(),
          })
        }

        res = res.filter((p) => {
          const photoDate = new Date(p.createdAt || p.uploadedAt || 0).getTime()
          return (
            photoDate >= todayStart.getTime() && photoDate <= todayEnd.getTime()
          )
        })
        if (import.meta.env.DEV) {
          console.log(`✅ Today filter applied: ${res.length} photos`)
        }
      } else if (activeFilters.dateRange === 'yesterday') {
        const yesterdayStart = new Date()
        yesterdayStart.setDate(yesterdayStart.getDate() - 1)
        yesterdayStart.setHours(0, 0, 0, 0)
        const yesterdayEnd = new Date()
        yesterdayEnd.setDate(yesterdayEnd.getDate() - 1)
        yesterdayEnd.setHours(23, 59, 59, 999)

        if (import.meta.env.DEV) {
          console.log('🔍 Filtering photos from YESTERDAY:', {
            start: yesterdayStart.toISOString(),
            end: yesterdayEnd.toISOString(),
          })
        }

        res = res.filter((p) => {
          const photoDate = new Date(p.createdAt || p.uploadedAt || 0).getTime()
          return (
            photoDate >= yesterdayStart.getTime() &&
            photoDate <= yesterdayEnd.getTime()
          )
        })
        if (import.meta.env.DEV) {
          console.log(`✅ Yesterday filter applied: ${res.length} photos`)
        }
      } else if (activeFilters.dateRange.startsWith('date:')) {
        // Specific date (YYYY-MM-DD)
        const dateStr = activeFilters.dateRange.replace('date:', '')
        const targetDate = new Date(dateStr)
        targetDate.setHours(0, 0, 0, 0)
        const nextDay = new Date(targetDate)
        nextDay.setDate(nextDay.getDate() + 1)

        if (import.meta.env.DEV) {
          console.log('🔍 Filtering photos from specific date:', dateStr)
        }

        res = res.filter((p) => {
          const photoDate = new Date(p.createdAt || p.uploadedAt || 0).getTime()
          return (
            photoDate >= targetDate.getTime() && photoDate < nextDay.getTime()
          )
        })
        if (import.meta.env.DEV) {
          console.log(`✅ Date filter applied: ${res.length} photos`)
        }
      } else {
        // Original range-based filtering (week, month, year)
        const days =
          { week: 7, month: 30, year: 365 }[activeFilters.dateRange] || 0
        if (days > 0) {
          const cutoff = now - days * 24 * 60 * 60 * 1000
          res = res.filter(
            (p) =>
              new Date(p.createdAt || p.uploadedAt || 0).getTime() >= cutoff
          )
        }
      }
    }

    return res
  }, [
    safePhotos,
    debouncedSearchQuery,
    activeFilters,
    specialFilter,
    safeAlbums,
  ])

  // 📅 DATE GROUPING: Group filtered photos by Month + Year (using unified utility)
  const photoGroups = useMemo(() => {
    if (filteredPhotos.length === 0) {
      return []
    }

    if (import.meta.env.DEV) {
      console.log('📅 Grouping photos by Month + Year (unified utility)...')
    }

    // Use canonical date resolution utility
    const groups = groupPhotosByMonth(filteredPhotos, 'nb')

    if (import.meta.env.DEV) {
      console.log(
        `✅ Created ${groups.length} month groups:`,
        groups.map((g) => `${g.label} (${g.photos.length})`)
      )
    }

    return groups
  }, [filteredPhotos])

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

  // Phase 2A: Navigate to PhotoPage
  const handlePhotoClick = (photo, index) => {
    // Set global photo context state
    const photoIds = filteredPhotos.map((p) => p.id)
    setCurrentPhotoId(photo.id)
    setPhotoContext('search')
    setPhotoOrder(photoIds)
    setPhotoIndex(index)

    // Navigate to PhotoPage
    navigate(`/photo/${photo.id}`, { state: { from: location } })
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
      await deletePhoto(photoToDelete.id, photoToDelete)
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

      if (import.meta.env.DEV) {
        console.log('🔵 Moving photos:', {
          count: safeSelected.length,
          targetAlbumId,
          selectedIds: safeSelected,
        })
      }

      // Track source albums to update their counts
      const sourceAlbums = new Set()

      for (const id of safeSelected) {
        const photo = safePhotos.find((p) => p.id === id)

        // Track source album (if photo has one)
        if (photo?.albumId) {
          sourceAlbums.add(photo.albumId)
          if (import.meta.env.DEV) {
            console.log(
              `📦 Photo ${id} moving from album ${photo.albumId} to ${targetAlbumId}`
            )
          }
        } else {
          if (import.meta.env.DEV) {
            console.log(
              `📦 Photo ${id} moving from "Uten album" to ${targetAlbumId}`
            )
          }
        }

        const docRef = doc(db, 'photos', id)
        await updateDoc(docRef, { albumId: targetAlbumId })
      }

      // Update target album count
      if (import.meta.env.DEV) {
        console.log(`✅ Updating target album ${targetAlbumId} count`)
      }
      await updateAlbumPhotoCount(targetAlbumId)

      // Update source album counts (decrement)
      for (const sourceAlbumId of sourceAlbums) {
        if (import.meta.env.DEV) {
          console.log(`✅ Updating source album ${sourceAlbumId} count`)
        }
        await updateAlbumPhotoCount(sourceAlbumId)
      }

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
      {/* Header - FIXED LAYOUT (Issue 4) */}
      <div
        className={`sticky top-0 z-40 bg-gradient-to-b from-gray-900 to-transparent pb-4 mb-4 ${
          editMode ? 'edit-mode' : ''
        }`}
      >
        {/* Top row - always visible */}
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold flex items-center gap-2">
            <SearchIcon className="w-6 h-6 md:w-7 md:h-7" />
            <span className="hidden sm:inline">{t('search:title')}</span>
            <span className="sm:hidden">Søk</span>
          </h1>

          <div className="flex gap-2">
            {/* Filter button - always show */}
            <button
              onClick={() => setShowFilters((v) => !v)}
              className="ripple-effect px-3 py-2 md:px-4 md:py-2 rounded-xl bg-white/10 hover:bg-white/20 flex items-center gap-2"
              title={t('search:filters')}
            >
              <SlidersHorizontal size={18} />
              <span className="hidden md:inline">{t('search:filters')}</span>
              {activeFilterCount > 0 && (
                <span className="ml-1 rounded-md px-2 py-0.5 text-sm bg-purple-600">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Edit/Done toggle */}
            <button
              onClick={() => {
                setEditMode(!editMode)
                if (editMode) {
                  setSelectedPhotos([])
                }
              }}
              className={`ripple-effect px-3 py-2 md:px-4 md:py-2 rounded-xl flex items-center gap-2 transition ${
                editMode
                  ? 'bg-purple-600 hover:bg-purple-700'
                  : 'bg-white/10 hover:bg-white/20'
              }`}
            >
              {editMode ? <Check size={18} /> : <Edit3 size={18} />}
              <span className="hidden sm:inline">
                {editMode ? t('search:done') : t('search:edit')}
              </span>
            </button>
          </div>
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
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setMoveOpen(true)
                }}
                onTouchEnd={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setMoveOpen(true)
                }}
                className="ripple-effect px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 flex items-center gap-2 touch-target"
                style={{ touchAction: 'manipulation' }}
              >
                <Move size={18} /> {t('search:move')}
              </button>
              <button
                onClick={async () => {
                  // FIXED - Issue 5: Support multiple photo deletion
                  if (import.meta.env.DEV) {
                    console.log('🗑️ Delete button clicked:', {
                      count: selectedPhotos.length,
                      photoIds: selectedPhotos,
                    })
                  }

                  if (selectedPhotos.length === 0) {
                    if (import.meta.env.DEV) {
                      console.warn('No photos selected')
                    }
                    return
                  }

                  // Confirmation message
                  const confirmMessage =
                    selectedPhotos.length === 1
                      ? t('search:confirmDeleteMessage')
                      : t('search:confirmDeleteMultiple', {
                          count: selectedPhotos.length,
                        })

                  if (!window.confirm(confirmMessage)) {
                    if (import.meta.env.DEV) {
                      console.log('Delete cancelled by user')
                    }
                    return
                  }

                  try {
                    if (import.meta.env.DEV) {
                      console.log('🔥 Starting deletion process...')
                    }

                    // Delete each selected photo
                    for (const photoId of selectedPhotos) {
                      const photo = safePhotos.find((p) => p.id === photoId)
                      if (photo) {
                        if (import.meta.env.DEV) {
                          console.log(
                            `Deleting photo: ${photo.name} (${photoId})`
                          )
                        }
                        await deletePhoto(photo.id, photo)
                      }
                    }

                    if (import.meta.env.DEV) {
                      console.log('✅ All photos deleted successfully')
                    }

                    // Clear selection and exit edit mode
                    setSelectedPhotos([])
                    setEditMode(false)

                    // Refresh data
                    if (refreshData) {
                      await refreshData()
                    }

                    // Success message
                    const successMessage =
                      selectedPhotos.length === 1
                        ? t('common:notifications.photoDeleted')
                        : t('search:photosDeleted', {
                            count: selectedPhotos.length,
                          })

                    alert(successMessage)
                  } catch (error) {
                    console.error('❌ Delete failed:', error)
                    alert(t('search:errors.couldNotDelete'))
                  }
                }}
                className="ripple-effect px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 flex items-center gap-2 touch-target"
              >
                <Trash2 size={18} />
                <span>
                  {t('search:delete')} ({selectedPhotos.length})
                </span>
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

      {/* 📅 DATE GROUPED RESULTS */}
      {photoGroups.length > 0 ? (
        <div className="space-y-8">
          {photoGroups.map((group) => (
            <section key={group.key}>
              {/* Date header - sticky on mobile */}
              <h2 className="search-date-header search-date-header-sticky">
                {group.label}
              </h2>

              {/* Photo grid for this month */}
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                {group.photos.map((photo) => {
                  // Get the original index from filteredPhotos for navigation
                  const photoIndex = filteredPhotos.findIndex(
                    (p) => p.id === photo.id
                  )

                  return (
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
                        src={
                          photo.type === 'video'
                            ? photo.thumbnailUrl || photo.url
                            : photo.url
                        }
                        alt={photo.name}
                        onClick={() =>
                          !editMode && handlePhotoClick(photo, photoIndex)
                        }
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
                  )
                })}
              </div>
            </section>
          ))}
        </div>
      ) : (
        /* No results */
        <div className="text-center py-12 opacity-60">
          <SearchIcon className="w-12 h-12 mx-auto mb-3" />
          <p>{t('search:noResults')}</p>
        </div>
      )}

      {/* Modals */}
      <MoveModal
        isOpen={isMoveOpen}
        onClose={() => setMoveOpen(false)}
        albums={safeAlbums}
        onConfirm={handleMovePhotos}
      />

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
    </div>
  )
}

export default SearchPage
