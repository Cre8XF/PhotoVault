// ============================================================================
// PAGE: SearchPage.jsx – v5.8 WITH DATE GROUPING (Month + Year)
// ============================================================================
import React, { useState, useMemo, useEffect, useRef } from 'react'
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
  LayoutGrid,
  Image,
  Video,
  Loader2,
} from 'lucide-react'
import { getFirestore, doc, updateDoc } from 'firebase/firestore'
import { format } from 'date-fns'
import { nb } from 'date-fns/locale'
import {
  softDeletePhoto,
  setAlbumCover,
  updateAlbumPhotoCount,
} from '../firebase'
import MoveModal from '../components/MoveModal'
import ConfirmModal from '../components/ConfirmModal'
import CollageCard from '../components/CollageCard'
import EmptyState from '../components/EmptyState'
import MemoriesSection from '../components/MemoriesSection'
import SmartViews from '../components/SmartViews'
import useStore from '../state/store'
import {
  resolvePhotoDate,
  sortPhotosByDate,
  groupPhotosByMonth,
} from '../utils/photoDateUtils'
import useCollageData from '../hooks/useCollageData'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { devLog, devWarn } from '../utils/log'

// 🔧 Resolve logical date for collages (based on slot photos)
function resolveCollageDate(collage) {
  if (!Array.isArray(collage.slots)) return null

  const timestamps = collage.slots
    .map((slot) => {
      const p = slot.photo
      return p?.takenAt || p?.createdAt || p?.uploadedAt || null
    })
    .filter(Boolean)
    .map((d) => new Date(d).getTime())
    .filter((t) => !Number.isNaN(t))

  if (timestamps.length === 0) return null

  return new Date(Math.min(...timestamps))
}

const SearchPage = ({
  photos = [],
  albums = [],
  onPhotoClick,
  toggleFavorite,
  refreshData,
}) => {
  const { t, i18n } = useTranslation(['search', 'common'])
  const navigate = useNavigate()
  const location = useLocation()

  // 🆕 PHASE 3A: Virtual pagination state
  const [displayLimit, setDisplayLimit] = useState(50)
  const ITEMS_PER_PAGE = 50

  // Photo context setters - Phase 2A
  const setCurrentPhotoId = useStore((state) => state.setCurrentPhotoId)
  const setPhotoContext = useStore((state) => state.setPhotoContext)
  const setPhotoOrder = useStore((state) => state.setPhotoOrder)
  const setPhotoIndex = useStore((state) => state.setPhotoIndex)
  const openUploadModal = useStore((state) => state.openUploadModal)

  // 🔒 SIKRE AT PROPS ER ARRAYS
  const safePhotos = useMemo(() => {
    if (!Array.isArray(photos)) {
      if (import.meta.env.DEV) {
        devWarn(
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
        devWarn(
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
  const searchInputRef = useRef(null) // 🆕 PHASE 3B: For keyboard shortcut
  const [activeFilters, setActiveFilters] = useState({
    favorites: false,
    dateRange: null,
    albumId: null,
    selectedTag: null,
    contentTypes: null, // Default: Show all media types (photos, videos, collages)
    selectedYears: [], // 🆕 Year filter (array for multi-select)
    selectedMonths: [], // 🆕 Month filter (array for multi-select)
  })
  const [showFilters, setShowFilters] = useState(false)
  const [searchExpanded, setSearchExpanded] = useState(false)

  // Redigeringsmodus og flytting
  const [editMode, setEditMode] = useState(false)
  const [selectedPhotos, setSelectedPhotos] = useState([])
  const [isMoveOpen, setMoveOpen] = useState(false)

  // Bekreftelsesdialog for sletting
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [photoToDelete, setPhotoToDelete] = useState(null)

  // Track special filters that bypass normal filtering
  const [specialFilter, setSpecialFilter] = useState(null)

  // Collage data - real-time from Firestore
  const { collages, collagesLoading, deleteCollage } = useCollageData()

  // 🆕 PHASE 3B: Keyboard shortcuts for desktop
  useKeyboardShortcuts([
    {
      key: 'Ctrl+a',
      action: () => {
        if (editMode && filteredPhotos.length > 0) {
          // Select all visible photos
          const allPhotoIds = filteredPhotos.map((p) => p.id)
          setSelectedPhotos(allPhotoIds)
        }
      },
    },
    {
      key: 'Ctrl+f',
      action: () => {
        searchInputRef.current?.focus()
      },
    },
    {
      key: 'Escape',
      action: () => {
        // Clear selection if in edit mode
        if (editMode && selectedPhotos.length > 0) {
          setSelectedPhotos([])
        } else if (searchQuery) {
          // Clear search if there's a query
          setSearchQuery('')
        }
      },
    },
  ])

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
        devLog('🔵 RECENT FILTER ACTIVATED:', {
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
        devLog('🔵 DAY FILTER ACTIVATED:', dayValue)
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
        devLog('🔵 WEEK FILTER ACTIVATED')
      }
      newFilters.dateRange = 'week'
      hasChanges = true
    }

    // Check for unassigned filter
    if (params.has('unassigned') && params.get('unassigned') === 'true') {
      newFilters.albumId = 'noAlbum'
      hasChanges = true
    }

    // Apply filters if any were found in URL
    if (hasChanges) {
      setActiveFilters(newFilters)
      if (import.meta.env.DEV) {
        devLog('✅ Applied filters from URL params:', newFilters)
      }
    }
  }, [location.search, safePhotos.length]) // Re-run when URL query params change

  // 🔒 SIKRET: Manual tags med array-guard
  const manualTags = useMemo(() => {
    const set = new Set()
    safePhotos.forEach((p) => {
      if (Array.isArray(p.tags)) {
        p.tags.forEach((tag) => set.add(tag))
      }
    })
    return Array.from(set).sort()
  }, [safePhotos])

  // 🆕 Extract unique years from photos (dynamically)
  const availableYears = useMemo(() => {
    const years = new Set()
    safePhotos.forEach((p) => {
      const photoDate = resolvePhotoDate(p)
      if (photoDate) {
        years.add(photoDate.getFullYear())
      }
    })
    return Array.from(years).sort((a, b) => b - a) // Newest first
  }, [safePhotos])

  // 🔒 SIKRET: Filtrering med array-guards
  const filteredPhotos = useMemo(() => {
    // ✅ EXCLUDE DOCUMENTS: SearchPage shows only images and videos by default
    let res = safePhotos.filter((p) => p.type !== 'document')

    // SPECIAL FILTER: Recent photos (Issue 1 fix)
    if (specialFilter?.type === 'recent') {
      if (import.meta.env.DEV) {
        devLog('🔍 Applying RECENT filter...')
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
        devLog(`✅ Recent filter applied: showing ${res.length} photos`)
      }
      return res // Skip other filters when showing recent
    }

    if (debouncedSearchQuery.trim()) {
      const q = debouncedSearchQuery.toLowerCase()
      if (import.meta.env.DEV) {
        devLog('🔍 Searching for:', q)
      }

      res = res.filter((p) => {
        // Search in filename
        const inName = p.name?.toLowerCase().includes(q)

        // Search in manual tags
        const inManualTags = Array.isArray(p.tags)
          ? p.tags.some((t) => t.toLowerCase().includes(q))
          : false

        // Search in AI tags
        const inAiTags = Array.isArray(p.aiTags)
          ? p.aiTags.some((t) => t.toLowerCase().includes(q))
          : false

        // Search in category
        const inCat = p.category?.toLowerCase().includes(q)

        // Search in album name (FIXED - Issue 3)
        const album = safeAlbums.find((a) => a.id === p.albumId)
        const inAlbum = album?.name?.toLowerCase().includes(q)

        return inName || inManualTags || inAiTags || inCat || inAlbum
      })

      if (import.meta.env.DEV) {
        devLog(`✅ Search complete: ${res.length} results for "${q}"`)
      }
    }

    if (activeFilters.favorites) res = res.filter((p) => p.favorite)

    // Filter by manual tag
    if (activeFilters.selectedTag) {
      res = res.filter(
        (p) =>
          Array.isArray(p.tags) && p.tags.includes(activeFilters.selectedTag)
      )
    }

    if (activeFilters.albumId) {
      if (activeFilters.albumId === 'noAlbum') {
        res = res.filter((p) => !p.albumId || p.albumId === '')
      } else {
        res = res.filter((p) => p.albumId === activeFilters.albumId)
      }
    }

    if (activeFilters.dateRange) {
      const now = Date.now()

      // Handle "last year" filter - SMART ORGANIZATION
      if (activeFilters.dateRange === 'lastyear') {
        const currentYear = new Date().getFullYear()
        const lastYear = currentYear - 1
        const yearStart = new Date(lastYear, 0, 1).getTime()
        const yearEnd = new Date(lastYear, 11, 31, 23, 59, 59, 999).getTime()

        if (import.meta.env.DEV) {
          devLog('🔍 Filtering photos from LAST YEAR:', {
            year: lastYear,
            start: new Date(yearStart).toISOString(),
            end: new Date(yearEnd).toISOString(),
          })
        }

        res = res.filter((p) => {
          const photoDate = resolvePhotoDate(p)
          if (!photoDate) return false
          const photoTime = new Date(photoDate).getTime()
          return photoTime >= yearStart && photoTime <= yearEnd
        })
        if (import.meta.env.DEV) {
          devLog(`✅ Last year filter applied: ${res.length} photos`)
        }
      } else if (activeFilters.dateRange === 'today') {
        const todayStart = new Date()
        todayStart.setHours(0, 0, 0, 0)
        const todayEnd = new Date()
        todayEnd.setHours(23, 59, 59, 999)

        if (import.meta.env.DEV) {
          devLog('🔍 Filtering photos from TODAY:', {
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
          devLog(`✅ Today filter applied: ${res.length} photos`)
        }
      } else if (activeFilters.dateRange === 'yesterday') {
        const yesterdayStart = new Date()
        yesterdayStart.setDate(yesterdayStart.getDate() - 1)
        yesterdayStart.setHours(0, 0, 0, 0)
        const yesterdayEnd = new Date()
        yesterdayEnd.setDate(yesterdayEnd.getDate() - 1)
        yesterdayEnd.setHours(23, 59, 59, 999)

        if (import.meta.env.DEV) {
          devLog('🔍 Filtering photos from YESTERDAY:', {
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
          devLog(`✅ Yesterday filter applied: ${res.length} photos`)
        }
      } else if (activeFilters.dateRange.startsWith('date:')) {
        // Specific date (YYYY-MM-DD)
        const dateStr = activeFilters.dateRange.replace('date:', '')
        const targetDate = new Date(dateStr)
        targetDate.setHours(0, 0, 0, 0)
        const nextDay = new Date(targetDate)
        nextDay.setDate(nextDay.getDate() + 1)

        if (import.meta.env.DEV) {
          devLog('🔍 Filtering photos from specific date:', dateStr)
        }

        res = res.filter((p) => {
          const photoDate = new Date(p.createdAt || p.uploadedAt || 0).getTime()
          return (
            photoDate >= targetDate.getTime() && photoDate < nextDay.getTime()
          )
        })
        if (import.meta.env.DEV) {
          devLog(`✅ Date filter applied: ${res.length} photos`)
        }
      } else if (activeFilters.dateRange === 'year') {
        // This Year filter - proper calendar year using dateTaken
        const currentYear = new Date().getFullYear()

        if (import.meta.env.DEV) {
          devLog('🔍 Filtering photos from THIS YEAR:', {
            year: currentYear,
          })
        }

        res = res.filter((p) => {
          const photoDate = resolvePhotoDate(p)
          if (!photoDate) return false
          return new Date(photoDate).getFullYear() === currentYear
        })
        if (import.meta.env.DEV) {
          devLog(`✅ This year filter applied: ${res.length} photos`)
        }
      } else {
        // Original range-based filtering (week, month)
        const days = { week: 7, month: 30 }[activeFilters.dateRange] || 0
        if (days > 0) {
          const cutoff = now - days * 24 * 60 * 60 * 1000
          res = res.filter(
            (p) =>
              new Date(p.createdAt || p.uploadedAt || 0).getTime() >= cutoff
          )
        }
      }
    }

    // 🆕 YEAR FILTER: Filter by selected years
    if (activeFilters.selectedYears && activeFilters.selectedYears.length > 0) {
      if (import.meta.env.DEV) {
        devLog('🔍 Filtering photos by selected years:', activeFilters.selectedYears)
      }
      res = res.filter((p) => {
        const photoDate = resolvePhotoDate(p)
        if (!photoDate) return false
        return activeFilters.selectedYears.includes(photoDate.getFullYear())
      })
      if (import.meta.env.DEV) {
        devLog(`✅ Year filter applied: ${res.length} photos`)
      }
    }

    // 🆕 MONTH FILTER: Filter by selected months (1-12)
    if (activeFilters.selectedMonths && activeFilters.selectedMonths.length > 0) {
      if (import.meta.env.DEV) {
        devLog('🔍 Filtering photos by selected months:', activeFilters.selectedMonths)
      }
      res = res.filter((p) => {
        const photoDate = resolvePhotoDate(p)
        if (!photoDate) return false
        // getMonth() returns 0-11, so add 1 to match our 1-12 format
        return activeFilters.selectedMonths.includes(photoDate.getMonth() + 1)
      })
      if (import.meta.env.DEV) {
        devLog(`✅ Month filter applied: ${res.length} photos`)
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

  // 🎨 MERGE PHOTOS AND COLLAGES: Combine content chronologically
  const allContent = useMemo(() => {
    // Tag photos with contentType - differentiate between photos and videos
    const photosWithType = filteredPhotos.map((p) => ({
      ...p,
      contentType: p.type === 'video' ? 'video' : 'photo',
      sortDate: new Date(p.createdAt || p.uploadedAt || Date.now()),
    }))

    // Tag collages with contentType - ensure valid ID
    const collagesWithType = collages
      .map((c) => ({
        ...c,
        id: c.id || c.collageId,
        contentType: 'collage',
        sortDate: resolveCollageDate(c) || new Date(c.createdAt || Date.now()),
      }))
      .filter((c) => c.id)

    if (import.meta.env.DEV && collagesWithType.length < collages.length) {
      devWarn(
        '⚠️ Filtered out',
        collages.length - collagesWithType.length,
        'collages without valid ID'
      )
    }

    // 🔀 MERGE: Photos + Collages → unified content list
    const merged = [...photosWithType, ...collagesWithType].sort(
      (a, b) => b.sortDate - a.sortDate
    )

    // 🎯 APPLY CROSS-CONTENT RULES
    let result = merged

    // Favorites = photos only
    if (activeFilters.favorites === true) {
      result = result.filter((item) => item.contentType !== 'collage')
    }

    // Explicit content type filter
    if (Array.isArray(activeFilters.contentTypes)) {
      result = result.filter((item) =>
        activeFilters.contentTypes.includes(item.contentType)
      )
    }

    return result
  }, [
    filteredPhotos,
    collages,
    activeFilters.favorites,
    activeFilters.contentTypes,
  ])

  // 📅 DATE GROUPING: Group merged content by Month + Year
  const photoGroups = useMemo(() => {
    if (!Array.isArray(allContent) || allContent.length === 0) {
      return []
    }

    if (import.meta.env.DEV) {
      devLog('📅 Grouping content by Month + Year (unified utility)...')
    }

    // Works for BOTH photos and collages
    const groups = groupPhotosByMonth(allContent, i18n.language || 'nb', t)

    if (import.meta.env.DEV) {
      devLog(
        `✅ Created ${groups.length} month groups:`,
        groups.map((g) => `${g.label} (${g.photos.length})`)
      )
    }

    return groups
  }, [allContent])

  // 🆕 PHASE 3A: Virtual pagination - limit displayed items
  const { displayedGroups, totalItems, hasMore } = useMemo(() => {
    if (photoGroups.length === 0) {
      return { displayedGroups: [], totalItems: 0, hasMore: false }
    }

    let itemCount = 0
    const limited = []

    for (const group of photoGroups) {
      if (itemCount >= displayLimit) {
        break
      }

      const remainingSlots = displayLimit - itemCount
      if (group.photos.length <= remainingSlots) {
        // Include entire group
        limited.push(group)
        itemCount += group.photos.length
      } else {
        // Include partial group
        limited.push({
          ...group,
          photos: group.photos.slice(0, remainingSlots),
        })
        itemCount += remainingSlots
      }
    }

    const total = photoGroups.reduce((sum, g) => sum + g.photos.length, 0)

    return {
      displayedGroups: limited,
      totalItems: total,
      hasMore: itemCount < total,
    }
  }, [photoGroups, displayLimit])

  // --- Count of active filters ---
  const activeFilterCount = useMemo(() => {
    let count = 0

    // Count boolean filters
    if (activeFilters.favorites) count++

    // Count selection filters
    if (activeFilters.dateRange) count++
    if (activeFilters.albumId) count++
    if (activeFilters.selectedTag) count++
    if (activeFilters.selectedYears && activeFilters.selectedYears.length > 0) count++ // 🆕 Year filter
    if (activeFilters.selectedMonths && activeFilters.selectedMonths.length > 0) count++ // 🆕 Month filter

    // Count contentTypes only if different from default
    const defaultContentTypes = ['photo', 'video']
    const currentContentTypes =
      activeFilters.contentTypes || defaultContentTypes
    const isDefaultContentTypes =
      currentContentTypes.length === defaultContentTypes.length &&
      defaultContentTypes.every((type) => currentContentTypes.includes(type))
    if (!isDefaultContentTypes) count++

    return count
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
    // Include both photos and collages
    const allIds = allContent.map((item) => item.id).filter(Boolean)
    setSelectedPhotos(allIds)
  }

  const deselectAllPhotos = () => {
    setSelectedPhotos([])
  }

  // Phase 2A: Navigate to PhotoPage
  // Accepts optional sourceList parameter for memories navigation
  const handlePhotoClick = (photo, indexOrSourceList, optionalSourceList) => {
    // Handle different call signatures:
    // 1. handlePhotoClick(photo, index) - from grid
    // 2. handlePhotoClick(photo, index, sourceList) - from memories

    let sourceList = filteredPhotos
    let index = indexOrSourceList

    // If second param is array, it's the old signature from MemoriesSection
    if (Array.isArray(indexOrSourceList)) {
      sourceList = indexOrSourceList
      index = sourceList.findIndex((p) => p.id === photo.id)
    } else if (optionalSourceList) {
      // New signature with explicit source list
      sourceList = optionalSourceList
      index =
        typeof indexOrSourceList === 'number'
          ? indexOrSourceList
          : sourceList.findIndex((p) => p.id === photo.id)
    }

    // Set global photo context state
    const photoIds = sourceList.map((p) => p.id)
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
      dateRange: null,
      albumId: null,
      selectedTag: null,
      contentTypes: null, // Reset to default: Show all media types
      selectedYears: [], // 🆕 Clear year filter
      selectedMonths: [], // 🆕 Clear month filter
    })
    setSearchQuery('')
    setSearchExpanded(false) // Also collapse search when resetting
  }

  // --- Sletting ---
  const requestDelete = (photo) => {
    setPhotoToDelete(photo)
    setConfirmOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!photoToDelete) return
    try {
      await softDeletePhoto(photoToDelete.id)
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

  // 🔒 SIKRET: Flytting med array-guards og error recovery
  const handleMovePhotos = async (targetAlbumId) => {
    const db = getFirestore()
    const safeSelected = Array.isArray(selectedPhotos) ? selectedPhotos : []

    if (import.meta.env.DEV) {
      devLog('🔵 Moving photos with error recovery:', {
        count: safeSelected.length,
        targetAlbumId,
        selectedIds: safeSelected,
      })
    }

    // 🐛 FIX: Track success/failure for each photo
    const moveResults = {
      success: [],
      failed: [],
    }

    // Track source albums to update their counts
    const sourceAlbums = new Map() // Map<albumId, count of photos moved>

    // Move each photo with individual error handling
    for (const id of safeSelected) {
      const photo = safePhotos.find((p) => p.id === id)

      if (!photo) {
        moveResults.failed.push({
          photoId: id,
          name: 'Unknown',
          reason: 'Photo not found',
        })
        continue
      }

      try {
        // Track source album (if photo has one)
        if (photo?.albumId) {
          sourceAlbums.set(
            photo.albumId,
            (sourceAlbums.get(photo.albumId) || 0) + 1
          )
          if (import.meta.env.DEV) {
            devLog(
              `📦 Moving photo ${id} from album ${photo.albumId} to ${targetAlbumId}`
            )
          }
        } else {
          if (import.meta.env.DEV) {
            devLog(
              `📦 Moving photo ${id} from "Uten album" to ${targetAlbumId}`
            )
          }
        }

        const docRef = doc(db, 'photos', id)
        await updateDoc(docRef, { albumId: targetAlbumId })
        moveResults.success.push(id)

        if (import.meta.env.DEV) {
          devLog(`✅ Successfully moved: ${photo.name}`)
        }
      } catch (error) {
        console.error(`❌ Failed to move photo ${id}:`, error)
        moveResults.failed.push({
          photoId: id,
          name: photo.name || 'Unknown',
          reason: error.message,
        })
      }
    }

    // 🐛 FIX: Update album counts only based on successful moves
    if (moveResults.success.length > 0) {
      try {
        // Update target album count
        const targetAlbum = safeAlbums.find((a) => a.id === targetAlbumId)
        if (targetAlbum) {
          const newTargetCount =
            (targetAlbum.photoCount || 0) + moveResults.success.length
          if (import.meta.env.DEV) {
            devLog(
              `✅ Updating target album ${targetAlbumId} count: ${
                targetAlbum.photoCount || 0
              } → ${newTargetCount}`
            )
          }
          await updateAlbumPhotoCount(targetAlbumId, newTargetCount)
        }

        // Update source album counts (decrement)
        for (const [sourceAlbumId, count] of sourceAlbums.entries()) {
          const sourceAlbum = safeAlbums.find((a) => a.id === sourceAlbumId)
          if (sourceAlbum) {
            const newSourceCount = Math.max(
              0,
              (sourceAlbum.photoCount || 0) - count
            )
            if (import.meta.env.DEV) {
              devLog(
                `✅ Updating source album ${sourceAlbumId} count: ${
                  sourceAlbum.photoCount || 0
                } → ${newSourceCount}`
              )
            }
            await updateAlbumPhotoCount(sourceAlbumId, newSourceCount)
          }
        }
      } catch (error) {
        console.error('❌ Error updating album counts:', error)
        // Continue anyway - photos were moved successfully
      }
    }

    setSelectedPhotos([])
    setMoveOpen(false)
    setEditMode(false)

    if (refreshData) await refreshData()

    // 🐛 FIX: Show detailed results based on success/failure
    if (moveResults.failed.length === 0) {
      // All succeeded - no need to alert, move modal closes smoothly
      if (import.meta.env.DEV) {
        devLog(`✅ All ${moveResults.success.length} photos moved successfully`)
      }
    } else if (moveResults.success.length === 0) {
      // All failed
      const failedList = moveResults.failed
        .slice(0, 5)
        .map((f) => `- ${f.name}`)
        .join('\n')
      const moreCount = moveResults.failed.length - 5

      alert(
        `❌ ${t('search:errors.couldNotMove')}\n\n` +
          `Failed to move ${moveResults.failed.length} photo${
            moveResults.failed.length > 1 ? 's' : ''
          }:\n` +
          failedList +
          (moreCount > 0 ? `\n... and ${moreCount} more` : '')
      )
    } else {
      // Partial success
      const failedList = moveResults.failed
        .slice(0, 5)
        .map((f) => `- ${f.name}`)
        .join('\n')
      const moreCount = moveResults.failed.length - 5

      alert(
        `⚠️ Partial success:\n\n` +
          `✅ Moved: ${moveResults.success.length}\n` +
          `❌ Failed: ${moveResults.failed.length}\n\n` +
          `Failed photos:\n` +
          failedList +
          (moreCount > 0 ? `\n... and ${moreCount} more` : '')
      )
    }
  }

  // Smart Views filter handler - simplified for single-field updates
  const handleSmartViewFilter = (filterUpdate) => {
    // filterUpdate is an object with a single key-value pair
    // If value is null, we're clearing that filter
    // Otherwise, we're setting it
    setActiveFilters((prev) => ({
      ...prev,
      ...filterUpdate,
    }))
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
          {!searchExpanded ? (
            // Collapsed state - clean header with Photos title
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold">
              {t('search:title', 'Photos')}
            </h1>
          ) : (
            // Expanded state - show search icon
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold flex items-center gap-2">
              <SearchIcon className="w-6 h-6 md:w-7 md:h-7" />
              <span className="hidden sm:inline">{t('search:title')}</span>
              <span className="sm:hidden">Søk</span>
            </h1>
          )}

          <div className="flex gap-2">
            {/* Search icon button - only show when collapsed */}
            {!searchExpanded && (
              <button
                onClick={() => setSearchExpanded(true)}
                className="ripple-effect p-2 md:p-3 rounded-xl bg-white/10 hover:bg-white/20"
                title="Open search"
                aria-label="Open search"
              >
                <SearchIcon className="w-5 h-5" />
              </button>
            )}

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
            <span className="text-sm text-muted">
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
                className="ripple-effect px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 flex items-center gap-2 touch-target touch-manipulation"
                aria-label={`Move ${selectedPhotos.length} selected photo${
                  selectedPhotos.length > 1 ? 's' : ''
                }`}
              >
                <Move size={18} /> {t('search:move')}
              </button>
              <button
                onClick={async () => {
                  // 🐛 FIX: Improved error recovery with success/failure tracking
                  if (import.meta.env.DEV) {
                    devLog('🗑️ Delete button clicked:', {
                      count: selectedPhotos.length,
                      photoIds: selectedPhotos,
                    })
                  }

                  if (selectedPhotos.length === 0) {
                    if (import.meta.env.DEV) {
                      devWarn('No photos selected')
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
                      devLog('Delete cancelled by user')
                    }
                    return
                  }

                  if (import.meta.env.DEV) {
                    devLog(
                      '🔥 Starting deletion process with error recovery...'
                    )
                  }

                  // 🐛 FIX: Track success/failure for each photo/collage
                  const deleteResults = {
                    success: [],
                    failed: [],
                  }

                  // Separate photos and collages
                  const photoIds = []
                  const collageIds = []

                  for (const itemId of selectedPhotos) {
                    const item = allContent.find((i) => i.id === itemId)
                    if (item?.contentType === 'collage') {
                      collageIds.push(itemId)
                    } else {
                      photoIds.push(itemId)
                    }
                  }

                  // Delete each photo with individual error handling
                  for (const photoId of photoIds) {
                    const photo = safePhotos.find((p) => p.id === photoId)

                    if (!photo) {
                      deleteResults.failed.push({
                        photoId,
                        name: 'Unknown',
                        reason: 'Photo not found',
                      })
                      continue
                    }

                    try {
                      if (import.meta.env.DEV) {
                        devLog(
                          `Soft deleting photo: ${photo.name} (${photoId})`
                        )
                      }

                      await softDeletePhoto(photo.id)
                      deleteResults.success.push(photoId)

                      if (import.meta.env.DEV) {
                        devLog(`✅ Successfully moved to trash: ${photo.name}`)
                      }
                    } catch (error) {
                      console.error(
                        `❌ Failed to delete photo ${photoId}:`,
                        error
                      )
                      deleteResults.failed.push({
                        photoId,
                        name: photo.name || 'Unknown',
                        reason: error.message,
                      })
                    }
                  }

                  // Delete each collage with individual error handling
                  for (const collageId of collageIds) {
                    const collage = collages.find((c) => c.id === collageId)

                    if (!collage) {
                      deleteResults.failed.push({
                        photoId: collageId,
                        name: 'Unknown Collage',
                        reason: 'Collage not found',
                      })
                      continue
                    }

                    try {
                      if (import.meta.env.DEV) {
                        devLog(
                          `Deleting collage: ${collage.title || collage.id}`
                        )
                      }

                      await deleteCollage(collageId)
                      deleteResults.success.push(collageId)

                      if (import.meta.env.DEV) {
                        devLog(
                          `✅ Successfully deleted collage: ${
                            collage.title || collage.id
                          }`
                        )
                      }
                    } catch (error) {
                      console.error(
                        `❌ Failed to delete collage ${collageId}:`,
                        error
                      )
                      deleteResults.failed.push({
                        photoId: collageId,
                        name: collage.title || 'Unknown Collage',
                        reason: error.message,
                      })
                    }
                  }

                  // Clear selection and exit edit mode
                  setSelectedPhotos([])
                  setEditMode(false)

                  // Refresh data to update UI
                  if (refreshData) {
                    await refreshData()
                  }

                  // Real-time listener will auto-update collages on deletion

                  // 🐛 FIX: Show detailed results based on success/failure
                  if (deleteResults.failed.length === 0) {
                    // All succeeded
                    const successMessage =
                      deleteResults.success.length === 1
                        ? t('common:notifications.photoDeleted')
                        : t('search:photosDeleted', {
                            count: deleteResults.success.length,
                          })

                    if (import.meta.env.DEV) {
                      devLog('✅ All photos deleted successfully')
                    }
                    alert(successMessage)
                  } else if (deleteResults.success.length === 0) {
                    // All failed
                    const failedList = deleteResults.failed
                      .slice(0, 5)
                      .map((f) => `- ${f.name}`)
                      .join('\n')
                    const moreCount = deleteResults.failed.length - 5

                    alert(
                      `❌ ${t('search:errors.couldNotDelete')}\n\n` +
                        `Failed to delete ${deleteResults.failed.length} photo${
                          deleteResults.failed.length > 1 ? 's' : ''
                        }:\n` +
                        failedList +
                        (moreCount > 0 ? `\n... and ${moreCount} more` : '')
                    )
                  } else {
                    // Partial success
                    const failedList = deleteResults.failed
                      .slice(0, 5)
                      .map((f) => `- ${f.name}`)
                      .join('\n')
                    const moreCount = deleteResults.failed.length - 5

                    alert(
                      `⚠️ Partial success:\n\n` +
                        `✅ Deleted: ${deleteResults.success.length}\n` +
                        `❌ Failed: ${deleteResults.failed.length}\n\n` +
                        `Failed photos:\n` +
                        failedList +
                        (moreCount > 0 ? `\n... and ${moreCount} more` : '')
                    )
                  }
                }}
                className="ripple-effect px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 flex items-center gap-2 touch-target touch-manipulation"
                aria-label={`Delete ${selectedPhotos.length} selected photo${
                  selectedPhotos.length > 1 ? 's' : ''
                }`}
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

      {/* Search Section - Collapsed by Default */}
      {!searchExpanded ? null : ( // Collapsed state - show search icon in header (no separate search box)
        // Expanded state - full search input
        <div className="glass rounded-2xl p-4 mb-4 focus-within:ring-2 focus-within:ring-purple-400 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 transition-all duration-200">
          <div className="flex items-center gap-3">
            <SearchIcon className="w-5 h-5 opacity-60" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={t('search:searchIn')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent focus:outline-none text-lg"
              aria-label="Search photos, albums, and collages"
              autoFocus
            />
            <button
              onClick={() => {
                setSearchExpanded(false)
                setSearchQuery('') // Clear search when closing
              }}
              className="ripple-effect p-2 hover:bg-white/10 rounded-lg transition-all duration-150 hover:shadow-md active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400"
              aria-label="Close search"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* SMART ORGANIZATION: Memories Section */}
      {!editMode && !searchQuery && !showFilters && (
        <MemoriesSection photos={safePhotos} onPhotoClick={handlePhotoClick} />
      )}

      {/* SMART ORGANIZATION: Smart Views (Quick Filters) */}
      {!editMode && (
        <SmartViews
          allContent={allContent}
          activeFilters={activeFilters}
          onFilterChange={handleSmartViewFilter}
        />
      )}

      {/* Filterpanel */}
      {showFilters && (
        <div className="glass rounded-2xl p-4 mb-6 space-y-4">
          {/* Quick Filters */}
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
          </div>

          {/* Avanserte valg */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

            {/* Tags (Manual) */}
            <label className="flex items-center gap-2">
              <Tag size={16} />
              <select
                value={activeFilters.selectedTag || ''}
                onChange={(e) =>
                  setActiveFilters((f) => ({
                    ...f,
                    selectedTag: e.target.value || null,
                  }))
                }
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none"
              >
                <option value="">All tags</option>
                {manualTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* 🆕 DATE FILTERS: Year and Month (side by side) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* 🆕 YEAR FILTER */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Calendar size={16} />
                Year
              </label>
              <div className="flex flex-wrap gap-2">
                {availableYears.length === 0 ? (
                  <p className="text-sm text-gray-400">No years available</p>
                ) : (
                  availableYears.map((year) => (
                    <button
                      key={year}
                      onClick={() => {
                        setActiveFilters((f) => ({
                          ...f,
                          selectedYears: f.selectedYears.includes(year)
                            ? f.selectedYears.filter((y) => y !== year)
                            : [...f.selectedYears, year],
                        }))
                      }}
                      className={`px-3 py-1.5 rounded-lg border text-sm transition ${
                        activeFilters.selectedYears.includes(year)
                          ? 'bg-purple-600 border-purple-500 text-white'
                          : 'border-white/10 hover:border-white/30'
                      }`}
                    >
                      {year}
                    </button>
                  ))
                )}
                {activeFilters.selectedYears.length > 0 && (
                  <button
                    onClick={() =>
                      setActiveFilters((f) => ({ ...f, selectedYears: [] }))
                    }
                    className="px-3 py-1.5 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10 text-sm transition"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* 🆕 MONTH FILTER */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium">
                <Calendar size={16} />
                Month
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { num: 1, name: 'Jan' },
                  { num: 2, name: 'Feb' },
                  { num: 3, name: 'Mar' },
                  { num: 4, name: 'Apr' },
                  { num: 5, name: 'May' },
                  { num: 6, name: 'Jun' },
                  { num: 7, name: 'Jul' },
                  { num: 8, name: 'Aug' },
                  { num: 9, name: 'Sep' },
                  { num: 10, name: 'Oct' },
                  { num: 11, name: 'Nov' },
                  { num: 12, name: 'Dec' },
                ].map((month) => (
                  <button
                    key={month.num}
                    onClick={() => {
                      setActiveFilters((f) => ({
                        ...f,
                        selectedMonths: f.selectedMonths.includes(month.num)
                          ? f.selectedMonths.filter((m) => m !== month.num)
                          : [...f.selectedMonths, month.num],
                      }))
                    }}
                    className={`px-2.5 py-1.5 rounded-lg border text-sm transition ${
                      activeFilters.selectedMonths.includes(month.num)
                        ? 'bg-purple-600 border-purple-500 text-white'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    {month.name}
                  </button>
                ))}
                {activeFilters.selectedMonths.length > 0 && (
                  <button
                    onClick={() =>
                      setActiveFilters((f) => ({ ...f, selectedMonths: [] }))
                    }
                    className="px-3 py-1.5 rounded-lg border border-red-500/50 text-red-400 hover:bg-red-500/10 text-sm transition"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Legacy date range filter (for Today, Week, Month quick filters) */}
          <div className="grid grid-cols-1 md:grid-cols-1 gap-3">
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
              </select>
            </label>
          </div>
        </div>
      )}

      {/* 📅 DATE GROUPED RESULTS */}
      {displayedGroups.length > 0 ? (
        <div className="space-y-8">
          {displayedGroups.map((group) => (
            <section key={group.key}>
              {/* Date header - sticky on mobile */}
              <h2 className="search-date-header search-date-header-sticky">
                {group.label}
              </h2>

              {/* Photo grid for this month - with collages */}
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                {group.photos.map((item) => {
                  // Check if this is a collage or photo
                  if (item.contentType === 'collage') {
                    return (
                      <div key={`collage-${item.id}`}>
                        <CollageCard
                          collage={item}
                          onClick={(collage) => {
                            if (!editMode) {
                              devLog('🎨 Collage clicked:', collage.id)
                              navigate(`/collage/${collage.id}`)
                            }
                          }}
                          className=""
                          // Edit mode support
                          editMode={editMode}
                          isSelected={selectedPhotos.includes(item.id)}
                          onSelect={(collageId) => {
                            setSelectedPhotos((prev) =>
                              prev.includes(collageId)
                                ? prev.filter((id) => id !== collageId)
                                : [...prev, collageId]
                            )
                          }}
                        />
                      </div>
                    )
                  }

                  // It's a photo - render as before
                  const photo = item
                  // Get the original index from filteredPhotos for navigation
                  const photoIndex = filteredPhotos.findIndex(
                    (p) => p.id === photo.id
                  )

                  return (
                    <div
                      key={photo.id}
                      className="relative group aspect-[4/5] bg-black/10 rounded-lg flex items-center justify-center overflow-hidden"
                    >
                      {/* Checkbox overlay in edit mode - WCAG AA compliant touch targets */}
                      {editMode && (
                        <div
                          className="absolute inset-0 z-10 cursor-pointer"
                          onClick={() => togglePhotoSelection(photo.id)}
                        >
                          <button
                            type="button"
                            className="touch-target absolute top-0 right-0 rounded-full touch-manipulation"
                            onClick={(e) => {
                              e.stopPropagation()
                              togglePhotoSelection(photo.id)
                            }}
                            aria-label={
                              selectedPhotos.includes(photo.id)
                                ? 'Deselect photo'
                                : 'Select photo'
                            }
                            aria-pressed={selectedPhotos.includes(photo.id)}
                          >
                            <div
                              className={`w-6 h-6 rounded border-2 flex items-center justify-center transition ${
                                selectedPhotos.includes(photo.id)
                                  ? 'bg-purple-600 border-purple-600'
                                  : 'bg-black/60 border-white/60'
                              }`}
                            >
                              {selectedPhotos.includes(photo.id) && (
                                <Check className="w-4 h-4 text-white" />
                              )}
                            </div>
                          </button>
                          {selectedPhotos.includes(photo.id) && (
                            <div className="absolute inset-0 bg-purple-600/20 border-2 border-purple-600 rounded-lg pointer-events-none" />
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

          {/* 🆕 PHASE 3A: Load More button */}
          {hasMore && (
            <div className="flex flex-col items-center gap-4 py-8">
              <button
                onClick={() => setDisplayLimit((prev) => prev + ITEMS_PER_PAGE)}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity font-medium flex items-center gap-2"
              >
                Load More Photos
              </button>
              <p className="text-sm text-gray-400">
                Showing {displayLimit} of {totalItems} items
              </p>
            </div>
          )}

          {/* All loaded indicator */}
          {!hasMore && totalItems > 0 && (
            <p className="text-center text-gray-500 py-8 text-sm">
              All {totalItems} items loaded
            </p>
          )}
        </div>
      ) : (
        /* No results - EmptyState component */
        (() => {
          // Determine if this is first-run (no photos at all) or just empty filter results
          const hasAnyPhotos = safePhotos.length > 0
          const hasActiveFiltersOrSearch = searchQuery || Object.values(activeFilters).some((v) => v)
          const isFirstRun = !hasAnyPhotos

          if (isFirstRun) {
            // First-run: User has 0 photos total
            return (
              <EmptyState
                variant="no-photos"
                title={t('common:emptyStates.noPhotos.title') || 'No Photos Yet'}
                description={t('common:emptyStates.noPhotos.description') || 'Upload your first photo to get started'}
                action={t('common:emptyStates.noPhotos.action') || 'Upload Photos'}
                onAction={() => openUploadModal && openUploadModal('photos')}
              />
            )
          } else {
            // Empty filter results: User has photos, but filter/search returns 0
            return (
              <EmptyState
                variant="no-results"
                title={t('search:noResults') || 'No results found'}
                description={t('common:noMatchingPhotos') || 'Try adjusting your search or filters'}
                action={hasActiveFiltersOrSearch ? (t('search:resetFilters') || 'Clear Filters') : null}
                onAction={
                  hasActiveFiltersOrSearch
                    ? () => {
                        setSearchQuery('')
                        setActiveFilters({
                          favorites: false,
                          dateRange: null,
                          albumId: null,
                          selectedTag: null,
                          contentTypes: null,
                          selectedYears: [], // 🆕 Clear year filter
                          selectedMonths: [], // 🆕 Clear month filter
                        })
                      }
                    : null
                }
              />
            )
          }
        })()
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
