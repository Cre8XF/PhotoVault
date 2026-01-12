// ============================================================================
// COMPONENT: PhotoGridUnified.jsx – Unified photo grid (Phase 5B Session 5)
// ============================================================================
import React, { useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import {
  ImageOff,
  Trash2,
  Star,
  Image as ImageIcon,
  Play,
  Video,
  Check,
  GripVertical,
  Layout,
} from 'lucide-react'
import { softDeletePhoto, toggleFavorite, setAlbumCover } from '../firebase'
import { formatDuration } from '../utils/videoTools'
import { useTranslation } from 'react-i18next'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

/**
 * Sortable Photo Card Wrapper (for drag-and-drop)
 */
const SortablePhotoCard = ({ photo, children }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 'var(--opacity-dragging)' : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="relative">
      {/* Drag Handle - Touch-friendly 44x44px minimum */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 left-2 z-20 bg-black/50 p-2.5 rounded opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
        style={{ minWidth: '44px', minHeight: '44px' }}
      >
        <GripVertical className="w-6 h-6 text-white" />
      </div>
      {children}
    </div>
  )
}

SortablePhotoCard.propTypes = {
  photo: PropTypes.object.isRequired,
  children: PropTypes.node.isRequired,
}

/**
 * Unified PhotoGrid Component - Consolidates 5 grid implementations
 *
 * Features:
 * - Base grid with video/photo support
 * - Selection modes (modifier/toggle)
 * - Time-based grouping
 * - Drag-and-drop reordering
 * - Actions: favorite, delete, set cover
 * - WCAG AA compliant
 * - Dark/light mode support
 *
 * Replaces:
 * - PhotoGrid.jsx
 * - PhotoGridOptimized.jsx
 * - PhotoGridGrouped.jsx
 * - DraggablePhotoGrid.jsx
 * - PhotoGridLazy.jsx (unused)
 */
const PhotoGridUnified = ({
  // ===== Data =====
  photos = [],

  // ===== Layout =====
  layout = 'default', // 'default' | 'compact'

  // ===== Grouping =====
  groupBy = null, // null | 'dateTaken' | 'createdAt' | 'uploadDate'

  // ===== Selection =====
  selectionMode = 'none', // 'none' | 'modifier' | 'toggle'
  selectedPhotos = [],
  onSelectionChange,
  maxSelection = null,

  // ===== Drag & Drop =====
  enableDragDrop = false,
  onReorder,

  // ===== Actions (callbacks enable features) =====
  onPhotoClick,
  onToggleFavorite,
  onDelete,
  onSetCover,

  // ===== Context =====
  currentAlbum = null,

  // ===== Filtering =====
  filterUnassigned = false,

  // ===== UI =====
  title = null,
  emptyMessage,
  className = '',

  // ===== Edit Mode =====
  editMode = false,

  // ===== Callbacks =====
  refreshPhotos,
}) => {
  const { t } = useTranslation(['common'])
  const [loading, setLoading] = useState(false)

  // ===== Drag & Drop Setup =====
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts (prevents accidental drags)
      },
    })
  )

  const handleDragEnd = (event) => {
    const { active, over } = event

    if (!over || active.id === over.id || !onReorder) return

    const oldIndex = filteredPhotos.findIndex((p) => p.id === active.id)
    const newIndex = filteredPhotos.findIndex((p) => p.id === over.id)

    if (oldIndex !== -1 && newIndex !== -1) {
      onReorder(oldIndex, newIndex)
    }
  }

  // ===== Data Processing =====
  const safePhotos = Array.isArray(photos) ? photos : []
  const filteredPhotos = filterUnassigned
    ? safePhotos.filter((p) => !p.albumId)
    : safePhotos

  // ===== Grouping Logic =====
  const groupedPhotos = useMemo(() => {
    if (!groupBy) {
      return [{ label: null, photos: filteredPhotos }]
    }

    const now = Date.now()
    const oneDay = 24 * 60 * 60 * 1000
    const oneWeek = 7 * oneDay
    const oneMonth = 30 * oneDay

    const groups = {
      today: [],
      yesterday: [],
      thisWeek: [],
      thisMonth: [],
      older: [],
    }

    filteredPhotos.forEach((photo) => {
      // Determine the date field to use
      let dateValue
      if (groupBy === 'dateTaken' && photo.dateTaken) {
        dateValue = photo.dateTaken
      } else if (groupBy === 'createdAt' && photo.createdAt) {
        dateValue = photo.createdAt
      } else if (
        groupBy === 'uploadDate' &&
        (photo.uploadedAt || photo.uploadDate)
      ) {
        dateValue = photo.uploadedAt || photo.uploadDate
      } else {
        // Fallback: try createdAt or uploadedAt
        dateValue = photo.createdAt || photo.uploadedAt
      }

      if (!dateValue) {
        groups.older.push(photo)
        return
      }

      const photoDate = new Date(dateValue)
      const diff = now - photoDate.getTime()

      if (diff < oneDay) groups.today.push(photo)
      else if (diff < 2 * oneDay) groups.yesterday.push(photo)
      else if (diff < oneWeek) groups.thisWeek.push(photo)
      else if (diff < oneMonth) groups.thisMonth.push(photo)
      else groups.older.push(photo)
    })

    const result = []
    if (groups.today.length)
      result.push({
        label: t('common:grid.groups.today') || 'Today',
        photos: groups.today,
      })
    if (groups.yesterday.length)
      result.push({
        label: t('common:grid.groups.yesterday') || 'Yesterday',
        photos: groups.yesterday,
      })
    if (groups.thisWeek.length)
      result.push({
        label: t('common:grid.groups.thisWeek') || 'This Week',
        photos: groups.thisWeek,
      })
    if (groups.thisMonth.length)
      result.push({
        label: t('common:grid.groups.thisMonth') || 'This Month',
        photos: groups.thisMonth,
      })
    if (groups.older.length)
      result.push({
        label: t('common:grid.groups.older') || 'Older',
        photos: groups.older,
      })

    return result
  }, [filteredPhotos, groupBy, t])

  // ===== Selection State =====
  const safeSelectedPhotos = Array.isArray(selectedPhotos) ? selectedPhotos : []

  const isSelected = (photo) => {
    return safeSelectedPhotos.some((p) =>
      typeof p === 'string' ? p === photo.id : p.id === photo.id
    )
  }

  const toggleSelection = (photo) => {
    if (selectionMode === 'none' || !onSelectionChange) return

    const selected = isSelected(photo)
    let newSelection

    if (selected) {
      // Remove from selection
      newSelection = safeSelectedPhotos.filter((p) =>
        typeof p === 'string' ? p !== photo.id : p.id !== photo.id
      )
    } else {
      // Add to selection
      const maxReached =
        maxSelection && safeSelectedPhotos.length >= maxSelection
      if (maxReached) {
        // If max reached, don't add
        return
      }
      newSelection = [...safeSelectedPhotos, photo]
    }

    onSelectionChange(newSelection)
  }

  // Handle photo click based on selection mode
  const handlePhotoClick = (e, photo) => {
    if (selectionMode === 'modifier' && (e.ctrlKey || e.metaKey)) {
      // Modifier mode: Ctrl/Cmd + click to select
      toggleSelection(photo)
    } else if (selectionMode === 'toggle') {
      // Toggle mode: Click to toggle selection
      toggleSelection(photo)
    } else if (onPhotoClick) {
      // Default: Open photo (use thumbnailUrl first for grid optimization)
      onPhotoClick(photo.thumbnailUrl || photo.displayUrl || photo.url)
    }
  }

  // Check if selection is maxed out
  const maxReached = maxSelection && safeSelectedPhotos.length >= maxSelection

  // ===== Action Handlers =====

  // Delete handler (soft delete - moved to trash)
  const handleDelete = async (photo) => {
    const confirmed = window.confirm(
      'Photo will be moved to trash. You can restore it within 7 days.'
    )
    if (!confirmed) return

    setLoading(true)
    try {
      await softDeletePhoto(photo.id)
      if (refreshPhotos) await refreshPhotos()
      console.log('🗑️ Photo moved to trash:', photo.id)
    } catch (err) {
      console.error('Error moving to trash:', err)
    } finally {
      setLoading(false)
    }
  }

  // Favorite toggle handler
  const handleToggleFavorite = async (e, photo) => {
    e.stopPropagation()
    try {
      await toggleFavorite(photo.id, photo.favorite)
      if (refreshPhotos) await refreshPhotos()
    } catch (err) {
      console.error('Feil ved favoritt-toggle:', err)
    }
  }

  // Set cover handler
  const handleSetCover = async (e, photo) => {
    e.stopPropagation()

    if (!photo.albumId) {
      alert(t('common:grid.noAlbum'))
      return
    }

    try {
      // Phase 3.5 FIX: Use displayUrl for edited versions
      await setAlbumCover(photo.albumId, photo.displayUrl || photo.url)
      console.log(`🖼️ Forsidebilde satt for album ${photo.albumId}`)
      if (refreshPhotos) await refreshPhotos()
    } catch (err) {
      console.error('Feil ved oppdatering av forside:', err)
      alert(t('common:grid.setCoverError'))
    }
  }

  // ===== Grid Styling =====
  const gridClasses =
    layout === 'compact'
      ? 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4'
      : 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4'

  const photoHeight = layout === 'compact' ? 'h-40' : 'h-56'

  // ===== Empty State =====
  if (!filteredPhotos || filteredPhotos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <ImageOff className="w-10 h-10 mb-2 opacity-60" />
        <p className="text-sm">{emptyMessage || t('common:grid.noPhotos')}</p>
      </div>
    )
  }

  // ===== Render Photo Card =====
  const renderPhotoCard = (photo, i) => {
    const selected = isSelected(photo)
    const selectable = selectionMode !== 'none' && (!maxReached || selected)

    const isCollage = photo.type === 'collage' || photo.isCollage
    const imageSrc = photo.thumbnailUrl || photo.displayUrl || photo.url

    const photoCardContent = (
      <div
        key={photo.id}
        className={`relative group overflow-hidden rounded-xl cursor-pointer ripple-effect card-press ${
          selected && selectionMode !== 'none'
            ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-gray-900'
            : ''
        }`}
        onClick={(e) => handlePhotoClick(e, photo)}
      >
        {/* ===== VIDEO CARD ===== */}
        {photo.type === 'video' ? (
          <div
            className={`w-full ${photoHeight} relative bg-gray-900 rounded-xl border border-gray-700 shadow-md transform transition duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-purple-500/20`}
          >
            {/* Video Thumbnail or Gradient Placeholder */}
            {photo.thumbnailUrl ? (
              <img
                src={photo.thumbnailUrl}
                alt={photo.name || 'Video'}
                className="w-full h-full object-cover rounded-xl"
                loading="lazy"
              />
            ) : (
              /* Styled placeholder when thumbnail is missing */
              <div className="w-full h-full bg-gradient-to-br from-purple-900 via-purple-800 to-purple-700 flex items-center justify-center rounded-xl">
                <Video className="w-20 h-20 text-white/50" />
              </div>
            )}

            {/* Play Icon Overlay */}
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-on-glass">
              <div className="bg-white/30 backdrop-blur-sm rounded-full p-4 scale-90 group-hover:scale-100 transition-transform duration-200">
                <Play className="w-10 h-10 fill-white" />
              </div>
            </div>

            {/* Duration Badge (if metadata exists) */}
            {photo.metadata?.duration && photo.metadata.duration > 0 && (
              <div className="absolute bottom-2 right-2 bg-black/80 text-on-glass text-xs font-medium px-2 py-1 rounded backdrop-blur-sm">
                {formatDuration(photo.metadata.duration)}
              </div>
            )}

            {/* Video Type Badge */}
            <div className="absolute top-2 left-2 bg-purple-600/90 text-on-glass text-xs font-medium px-2 py-1 rounded flex items-center gap-1 backdrop-blur-sm">
              <Video className="w-3 h-3" />
              <span>{t('common:grid.video')}</span>
            </div>
          </div>
        ) : isCollage ? (
          /* ===== COLLAGE CARD (wrapped for layout stability) ===== */
          <div
            className="w-full aspect-square relative bg-gray-900 rounded-xl border border-gray-700 shadow-md transform transition duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-purple-500/20 overflow-hidden"
          >
            <img
              src={imageSrc}
              alt={photo.title || photo.name || ''}
              className="w-full h-full object-contain"
              loading="lazy"
            />
            {/* Collage Type Badge */}
            <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-medium px-2 py-1 rounded flex items-center gap-1 backdrop-blur-sm z-10">
              <Layout className="w-3 h-3" />
              <span>Collage</span>
            </div>
          </div>
        ) : (
          /* ===== PHOTO CARD ===== */
          <img
            src={photo.thumbnailUrl || photo.displayUrl || photo.url}
            alt={photo.title || photo.name || ''}
            className={`w-full ${photoHeight} object-contain bg-gray-900 rounded-xl border border-gray-700 shadow-md transform transition duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-purple-500/20`}
            loading="lazy"
          />
        )}

        {/* ===== COVER INDICATOR ===== */}
        {/* For regular photos (no type badge) - position at left */}
        {currentAlbum &&
          currentAlbum.cover === (photo.displayUrl || photo.url) &&
          photo.type !== 'video' &&
          photo.type !== 'collage' &&
          !photo.isCollage && (
            <div className="absolute top-2 left-2 bg-yellow-500 text-black px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              {t('common:grid.coverBadge')}
            </div>
          )}

        {/* Cover indicator for videos and collages (adjusted position to not overlap type badge) */}
        {currentAlbum &&
          currentAlbum.cover === (photo.displayUrl || photo.url) &&
          (photo.type === 'video' ||
            photo.type === 'collage' ||
            photo.isCollage) && (
            <div className="absolute top-2 left-20 bg-yellow-500 text-black px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
              <ImageIcon className="w-3 h-3" />
              {t('common:grid.coverBadge')}
            </div>
          )}

        {/* ===== SELECTION CHECKBOX (if selection enabled) ===== */}
        {selectionMode !== 'none' && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              toggleSelection(photo)
            }}
            disabled={!selectable}
            className={`absolute top-2 ${
              enableDragDrop
                ? 'left-16'
                : editMode || onToggleFavorite || onSetCover
                ? 'left-2'
                : 'right-2'
            } w-6 h-6 flex items-center justify-center rounded-full border border-white/20 transition z-10 ${
              selected
                ? 'bg-purple-600 text-white'
                : selectable
                ? 'bg-black/50 text-gray-300 hover:bg-white/20'
                : 'bg-black/70 text-gray-500 cursor-not-allowed opacity-50'
            }`}
          >
            <Check size={14} />
          </button>
        )}

        {/* ===== MAX REACHED OVERLAY (toggle mode only) ===== */}
        {selectionMode === 'toggle' && !selected && maxReached && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center pointer-events-none">
            <p className="text-xs text-white/70">
              {t('common:grid.maxReached') || 'Max selection reached'}
            </p>
          </div>
        )}

        {/* ===== OVERLAY BUTTONS ===== */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
          {/* Set as cover button (only in editMode and if photo has albumId) */}
          {editMode && photo.albumId && onSetCover && (
            <button
              onClick={(e) => handleSetCover(e, photo)}
              title={t('common:grid.setAsCover')}
              className="p-1.5 rounded-full bg-yellow-500/80 hover:bg-yellow-600 text-white transition shadow-lg ripple-effect"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
          )}

          {/* Favorite button (if onToggleFavorite callback exists) */}
          {onToggleFavorite && (
            <button
              onClick={(e) => handleToggleFavorite(e, photo)}
              title={
                photo.favorite
                  ? t('common:removeFavorite')
                  : t('common:addToFavorites')
              }
              className={`p-1.5 rounded-full ${
                photo.favorite
                  ? 'bg-red-500/80 text-white'
                  : 'bg-black/50 text-gray-300 hover:bg-red-500/70'
              } transition shadow-lg ripple-effect`}
            >
              <Star
                className="w-4 h-4"
                fill={photo.favorite ? 'currentColor' : 'none'}
              />
            </button>
          )}

          {/* Delete button (only in editMode) */}
          {editMode && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleDelete(photo)
              }}
              title={t('common:notifications.deletePhotoTitle')}
              disabled={loading}
              className={`p-1.5 rounded-full ${
                loading
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-black/50 hover:bg-red-600/70 text-white'
              } transition shadow-lg ripple-effect`}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* ===== PHOTO CAPTION ===== */}
        {(photo.title || photo.name) && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 px-2 truncate opacity-0 group-hover:opacity-100 transition">
            {photo.title || photo.name}
          </div>
        )}
      </div>
    )

    // Wrap in sortable if drag-and-drop is enabled
    if (enableDragDrop && !groupBy) {
      return (
        <SortablePhotoCard key={photo.id} photo={photo}>
          {photoCardContent}
        </SortablePhotoCard>
      )
    }

    return photoCardContent
  }

  // ===== Render Grid Content =====
  const renderGrid = () => {
    if (groupBy) {
      // Grouped rendering (no drag-and-drop support for grouped view)
      return (
        <div className="space-y-6">
          {groupedPhotos.map((group, groupIndex) => (
            <div key={groupIndex}>
              {group.label && (
                <h3 className="text-sm font-semibold text-muted mb-3">
                  {group.label}
                </h3>
              )}
              <div className={`${gridClasses} ${className}`}>
                {group.photos.map((photo, i) => renderPhotoCard(photo, i))}
              </div>
            </div>
          ))}
        </div>
      )
    }

    // Standard rendering
    const gridContent = (
      <div className={`${gridClasses} ${className}`}>
        {filteredPhotos.map((photo, i) => renderPhotoCard(photo, i))}
      </div>
    )

    // Wrap in DndContext if drag-and-drop is enabled
    if (enableDragDrop) {
      return (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredPhotos.map((p) => p.id)}
            strategy={rectSortingStrategy}
          >
            {gridContent}
          </SortableContext>
        </DndContext>
      )
    }

    return gridContent
  }

  // ===== Render =====
  return (
    <>
      {title && (
        <h2 className="text-xl font-semibold text-gray-100 mb-4 capitalize">
          {title}
        </h2>
      )}

      {renderGrid()}
    </>
  )
}

PhotoGridUnified.propTypes = {
  // Data
  photos: PropTypes.array,

  // Layout
  layout: PropTypes.oneOf(['default', 'compact']),

  // Grouping
  groupBy: PropTypes.oneOf([null, 'dateTaken', 'createdAt', 'uploadDate']),

  // Selection
  selectionMode: PropTypes.oneOf(['none', 'modifier', 'toggle']),
  selectedPhotos: PropTypes.array,
  onSelectionChange: PropTypes.func,
  maxSelection: PropTypes.number,

  // Drag & Drop
  enableDragDrop: PropTypes.bool,
  onReorder: PropTypes.func,

  // Actions
  onPhotoClick: PropTypes.func,
  onToggleFavorite: PropTypes.func,
  onDelete: PropTypes.func,
  onSetCover: PropTypes.func,

  // Context
  currentAlbum: PropTypes.object,

  // Filtering
  filterUnassigned: PropTypes.bool,

  // UI
  title: PropTypes.string,
  emptyMessage: PropTypes.string,
  className: PropTypes.string,

  // Edit Mode
  editMode: PropTypes.bool,

  // Callbacks
  refreshPhotos: PropTypes.func,
}

export default PhotoGridUnified
