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
import { softDeletePhoto, setAlbumCover, updateAlbumPhotoCount } from '../firebase'
import MoveModal from '../components/MoveModal'
import ConfirmModal from '../components/ConfirmModal'
import CollageCard from '../components/CollageCard'
import useStore from '../state/store'
import {
  resolvePhotoDate,
  sortPhotosByDate,
  groupPhotosByMonth,
} from '../utils/photoDateUtils'
import useCollageData from '../hooks/useCollageData'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { devLog, devWarn } from '../utils/log'

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

  // 🆕 PHASE 3A: Virtual pagination state
  const [displayLimit, setDisplayLimit] = useState(50)
  const ITEMS_PER_PAGE = 50

  // Photo context setters - Phase 2A
  const setCurrentPhotoId = useStore((state) => state.setCurrentPhotoId)
  const setPhotoContext = useStore((state) => state.setPhotoContext)
  const setPhotoOrder = useStore((state) => state.setPhotoOrder)
  const setPhotoIndex = useStore((state) => state.setPhotoIndex)

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
    withFaces: false,
    withTags: false,
    aiAnalyzed: false,
    dateRange: null,
    albumId: null,
    category: null,
    contentTypes: ['photo', 'video'], // Default: hide collages
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
  const {
    collages,
    collagesLoading,
    deleteCollage,
  } = useCollageData()

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
        devLog('✅ Applied filters from URL params:', newFilters)
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
        devLog(`✅ Search complete: ${res.length} results for "${q}"`)
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

  // 🎨 MERGE PHOTOS AND COLLAGES: Combine content chronologically
  const allContent = useMemo(() => {
    // Tag photos with contentType - differentiate between photos and videos
    const photosWithType = filteredPhotos.map(p => ({
      ...p,
      contentType: p.type === 'video' ? 'video' : 'photo',
      sortDate: new Date(p.createdAt || p.uploadedAt || Date.now())
    }))

    // Tag collages with contentType - ensure valid ID
    const collagesWithType = collages
      .map(c => ({
        ...c,
        id: c.id || c.collageId, // Normalize ID: prefer id, fallback to collageId
        contentType: 'collage',
        sortDate: new Date(c.createdAt || Date.now())
      }))
      .filter(c => c.id) // Filter out collages without valid ID

    if (import.meta.env.DEV && collagesWithType.length < collages.length) {
      devWarn('⚠️ Filtered out', collages.length - collagesWithType.length, 'collages without valid ID')
    }

  // 🔀 MERGE: Photos + Collages → unified content list
  const merged = [...photosWithType, ...collagesWithType].sort(
    (a, b) => b.sortDate - a.sortDate
  )

  // 🎯 FILTER BY CONTENT TYPE: Apply contentTypes filter
  const selectedContentTypes = activeFilters.contentTypes || ['photo', 'video']
  const filtered = merged.filter(item =>
    selectedContentTypes.includes(item.contentType)
  )

  if (import.meta.env.DEV) {
    devLog('🎨 Merged content:', {
      photos: photosWithType.filter(p => p.contentType === 'photo').length,
      videos: photosWithType.filter(p => p.contentType === 'video').length,
      collages: collagesWithType.length,
      total: merged.length,
      filtered: filtered.length,
      activeContentTypes: selectedContentTypes,
    })
  }

  return filtered
}, [filteredPhotos, collages, activeFilters.contentTypes])

// 📅 DATE GROUPING: Group merged content by Month + Year
const photoGroups = useMemo(() => {
  if (!Array.isArray(allContent) || allContent.length === 0) {
    return []
  }

  if (import.meta.env.DEV) {
    devLog('📅 Grouping content by Month + Year (unified utility)...')
  }

  // Works for BOTH photos and collages
  const groups = groupPhotosByMonth(allContent, 'nb')

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
    if (activeFilters.withFaces) count++
    if (activeFilters.withTags) count++
    if (activeFilters.aiAnalyzed) count++

    // Count selection filters
    if (activeFilters.dateRange) count++
    if (activeFilters.albumId) count++
    if (activeFilters.category) count++

    // Count contentTypes only if different from default
    const defaultContentTypes = ['photo', 'video']
    const currentContentTypes = activeFilters.contentTypes || defaultContentTypes
    const isDefaultContentTypes =
      currentContentTypes.length === defaultContentTypes.length &&
      defaultContentTypes.every(type => currentContentTypes.includes(type))
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
      contentTypes: ['photo', 'video'], // Reset to default: hide collages
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
        devLog(
          `✅ All ${moveResults.success.length} photos moved successfully`
        )
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
        <div className="glass rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <SearchIcon className="w-5 h-5 opacity-60" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={t('search:searchIn')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent outline-none text-lg"
              autoFocus
            />
            <button
              onClick={() => {
                setSearchExpanded(false)
                setSearchQuery('') // Clear search when closing
              }}
              className="ripple-effect p-2 hover:bg-white/10 rounded-lg transition"
              aria-label="Close search"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Filterpanel */}
      {showFilters && (
        <div className="glass rounded-2xl p-4 mb-6 space-y-4">
          {/* Content Type Filters */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted">Content Type:</p>
              <button
                onClick={() => {
                  const allTypes = ['photo', 'video', 'collage']
                  const currentTypes = activeFilters.contentTypes || []
                  const allSelected = allTypes.every(type => currentTypes.includes(type))
                  setActiveFilters(f => ({
                    ...f,
                    contentTypes: allSelected ? ['photo', 'video'] : allTypes
                  }))
                }}
                className="text-xs px-2 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10"
              >
                {(activeFilters.contentTypes || []).length === 3 ? 'Reset' : 'All'}
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  const current = activeFilters.contentTypes || []
                  const hasPhoto = current.includes('photo')
                  setActiveFilters(f => ({
                    ...f,
                    contentTypes: hasPhoto
                      ? current.filter(t => t !== 'photo')
                      : [...current, 'photo']
                  }))
                }}
                className={`px-3 py-2 rounded-lg border ${
                  (activeFilters.contentTypes || []).includes('photo')
                    ? 'bg-blue-600 border-blue-500'
                    : 'border-white/10 opacity-50'
                } flex items-center gap-2`}
              >
                <Image size={16} /> Photos
              </button>

              <button
                onClick={() => {
                  const current = activeFilters.contentTypes || []
                  const hasVideo = current.includes('video')
                  setActiveFilters(f => ({
                    ...f,
                    contentTypes: hasVideo
                      ? current.filter(t => t !== 'video')
                      : [...current, 'video']
                  }))
                }}
                className={`px-3 py-2 rounded-lg border ${
                  (activeFilters.contentTypes || []).includes('video')
                    ? 'bg-purple-600 border-purple-500'
                    : 'border-white/10 opacity-50'
                } flex items-center gap-2`}
              >
                <Video size={16} /> Videos
              </button>

              <button
                onClick={() => {
                  const current = activeFilters.contentTypes || []
                  const hasCollage = current.includes('collage')
                  setActiveFilters(f => ({
                    ...f,
                    contentTypes: hasCollage
                      ? current.filter(t => t !== 'collage')
                      : [...current, 'collage']
                  }))
                }}
                className={`px-3 py-2 rounded-lg border ${
                  (activeFilters.contentTypes || []).includes('collage')
                    ? 'bg-emerald-600 border-emerald-500'
                    : 'border-white/10 opacity-50'
                } flex items-center gap-2`}
              >
                <LayoutGrid size={16} /> Collages
              </button>
            </div>
          </div>

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
              <p className="text-sm text-muted mb-2">
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

      {/* Active filters banner - Only show when filters are active */}
      {(activeFilterCount > 0 || searchQuery.trim()) && (
        <div className="glass rounded-2xl p-4 mb-4 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted">
              {t('search:activeFilters')}:
            </span>
            <div className="flex flex-wrap gap-2">
              {searchQuery.trim() && (
                <span className="px-2 py-1 rounded-lg bg-blue-600/30 text-sm border border-blue-500/50">
                  Search: "{searchQuery}"
                </span>
              )}
              {activeFilters.favorites && (
                <span className="px-2 py-1 rounded-lg bg-yellow-600/30 text-sm border border-yellow-500/50">
                  Favorites
                </span>
              )}
              {activeFilters.withFaces && (
                <span className="px-2 py-1 rounded-lg bg-blue-600/30 text-sm border border-blue-500/50">
                  With faces
                </span>
              )}
              {activeFilters.withTags && (
                <span className="px-2 py-1 rounded-lg bg-emerald-600/30 text-sm border border-emerald-500/50">
                  With tags
                </span>
              )}
              {activeFilters.aiAnalyzed && (
                <span className="px-2 py-1 rounded-lg bg-purple-600/30 text-sm border border-purple-500/50">
                  AI analyzed
                </span>
              )}
              {activeFilters.albumId && (
                <span className="px-2 py-1 rounded-lg bg-indigo-600/30 text-sm border border-indigo-500/50">
                  Album:{' '}
                  {activeFilters.albumId === 'noAlbum'
                    ? t('search:filterOptions.noAlbum')
                    : safeAlbums.find((a) => a.id === activeFilters.albumId)
                        ?.name || 'Unknown'}
                </span>
              )}
              {activeFilters.category && (
                <span className="px-2 py-1 rounded-lg bg-teal-600/30 text-sm border border-teal-500/50">
                  Category: {activeFilters.category}
                </span>
              )}
              {activeFilters.dateRange && (
                <span className="px-2 py-1 rounded-lg bg-orange-600/30 text-sm border border-orange-500/50">
                  {activeFilters.dateRange === 'today' && 'Today'}
                  {activeFilters.dateRange === 'week' && 'This week'}
                  {activeFilters.dateRange === 'month' && 'This month'}
                  {activeFilters.dateRange === 'year' && 'This year'}
                  {activeFilters.dateRange.startsWith('date:') &&
                    `Date: ${activeFilters.dateRange.replace('date:', '')}`}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={clearFilters}
            className="ripple-effect px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm whitespace-nowrap transition"
          >
            {t('search:resetFilters')}
          </button>
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
                      <div key={`collage-${item.id}`} className="col-span-2">
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
        /* No results - Enhanced empty state */
        <div className="text-center py-16 px-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-500/10 rounded-full mb-4">
            <SearchIcon className="w-10 h-10 text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold mb-2">
            {t('search:noResults') || 'Ingen resultater'}
          </h3>
          <p className="text-gray-400 mb-6 max-w-md mx-auto">
            Prøv å endre søkekriteriene eller filteret for å finne bilder.
          </p>
          {(searchQuery || Object.values(activeFilters).some((v) => v)) && (
            <button
              onClick={() => {
                setSearchQuery('')
                setActiveFilters({
                  favorites: false,
                  withFaces: false,
                  withTags: false,
                  aiAnalyzed: false,
                  dateRange: null,
                  albumId: null,
                  category: null,
                  contentTypes: ['photo', 'video'], // Reset to default: hide collages
                })
              }}
              className="ripple-effect px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex items-center gap-2 mx-auto transition"
            >
              <X className="w-5 h-5" />
              {t('search:resetFilters') || 'Nullstill filtre'}
            </button>
          )}
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
