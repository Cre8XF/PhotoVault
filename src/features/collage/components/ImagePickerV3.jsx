// ============================================================================
// COMPONENT: ImagePickerV3.jsx - Enhanced photo picker with filters and search
// Main photo selection interface for collage builder
// ============================================================================
import React, { useState, useMemo } from 'react'
import PropTypes from 'prop-types'
import { useTranslation } from 'react-i18next'
import { ArrowLeft } from 'lucide-react'
import FilterTabs from './FilterTabs'
import SearchBar from './SearchBar'
import SelectionCounter from './SelectionCounter'
import PhotoGridGrouped from './PhotoGridGrouped'

/**
 * ImagePickerV3 Component
 * Enhanced photo picker with filtering, search, and grouping
 *
 * @param {Array} photos - All available photos from usePhotoData
 * @param {Function} onSelect - Selection complete handler (photos) => void
 * @param {number} maxPhotos - Maximum photos allowed (default 6)
 * @param {Array} initialSelection - Pre-selected photos (for editing)
 * @param {Function} onBack - Back button handler
 * @param {boolean} showBack - Show back button
 */
const ImagePickerV3 = ({
  photos = [],
  onSelect,
  maxPhotos = 6,
  initialSelection = [],
  onBack,
  showBack = false
}) => {
  const { t } = useTranslation(['collage'])

  // State
  const [selectedPhotos, setSelectedPhotos] = useState(initialSelection)
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Calculate photo counts per filter
  const photoCounts = useMemo(() => {
    return {
      all: photos.length,
      favorites: photos.filter(p => p.isFavorite || p.favorite).length,
      screenshots: photos.filter(p => p.isScreenshot).length,
      recent: photos.filter(p => {
        const uploadDate = new Date(p.uploadedAt || p.createdAt)
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
        return uploadDate.getTime() >= thirtyDaysAgo
      }).length,
      ai: photos.filter(p => Array.isArray(p.aiTags) && p.aiTags.length > 0).length
    }
  }, [photos])

  // Filter photos by active filter
  const filteredByCategory = useMemo(() => {
    let result = photos

    switch (activeFilter) {
      case 'favorites':
        result = photos.filter(p => p.isFavorite || p.favorite)
        break
      case 'screenshots':
        result = photos.filter(p => p.isScreenshot)
        break
      case 'recent':
        result = photos.filter(p => {
          const uploadDate = new Date(p.uploadedAt || p.createdAt)
          const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
          return uploadDate.getTime() >= thirtyDaysAgo
        })
        break
      case 'ai':
        result = photos.filter(p => Array.isArray(p.aiTags) && p.aiTags.length > 0)
        break
      case 'all':
      default:
        result = photos
        break
    }

    return result
  }, [photos, activeFilter])

  // Filter by search query
  const filteredPhotos = useMemo(() => {
    if (!searchQuery.trim()) {
      return filteredByCategory
    }

    const query = searchQuery.toLowerCase()
    return filteredByCategory.filter(photo => {
      const inFilename = photo.filename?.toLowerCase().includes(query)
      const inName = photo.name?.toLowerCase().includes(query)
      const inTags = Array.isArray(photo.aiTags)
        ? photo.aiTags.some(tag => tag.toLowerCase().includes(query))
        : false

      return inFilename || inName || inTags
    })
  }, [filteredByCategory, searchQuery])

  // Handle photo toggle
  const handleToggle = (photo) => {
    const isSelected = selectedPhotos.some(p => p.id === photo.id)

    if (isSelected) {
      // Deselect
      setSelectedPhotos(selectedPhotos.filter(p => p.id !== photo.id))
    } else {
      // Select (if not at max)
      if (selectedPhotos.length < maxPhotos) {
        setSelectedPhotos([...selectedPhotos, photo])
      }
    }
  }

  // Handle continue
  const handleContinue = () => {
    if (selectedPhotos.length > 0) {
      onSelect(selectedPhotos)
    }
  }

  // Check if max reached
  const maxReached = selectedPhotos.length >= maxPhotos

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="p-4 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-3 mb-4">
          {showBack && onBack && (
            <button
              onClick={onBack}
              className="ripple-effect p-2 hover:bg-white/10 rounded-lg transition"
              aria-label={t('collage:picker.back')}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h2 className="text-xl font-bold">{t('collage:picker.title')}</h2>
            <p className="text-sm opacity-70">
              {t('collage:picker.subtitle', { max: maxPhotos })}
            </p>
          </div>
        </div>

        {/* Filter tabs */}
        <FilterTabs
          activeFilter={activeFilter}
          onChange={setActiveFilter}
          photoCounts={photoCounts}
        />

        {/* Search bar */}
        <div className="mt-3">
          <SearchBar
            query={searchQuery}
            onChange={setSearchQuery}
          />
        </div>
      </div>

      {/* Selection counter */}
      <SelectionCounter
        count={selectedPhotos.length}
        maxPhotos={maxPhotos}
        onContinue={handleContinue}
      />

      {/* Photo grid */}
      <div className="flex-1 overflow-y-auto p-4">
        <PhotoGridGrouped
          photos={filteredPhotos}
          selectedPhotos={selectedPhotos}
          onToggle={handleToggle}
          maxReached={maxReached}
          showGrouping={activeFilter === 'all' || activeFilter === 'recent'}
        />
      </div>

      {/* Search results info */}
      {searchQuery && (
        <div className="px-4 py-2 bg-white/5 border-t border-white/10 text-sm opacity-70 text-center">
          {filteredPhotos.length === 0
            ? t('collage:picker.noSearchResults', { query: searchQuery })
            : t('collage:picker.searchResults', { count: filteredPhotos.length, query: searchQuery })
          }
        </div>
      )}
    </div>
  )
}

ImagePickerV3.propTypes = {
  photos: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      url: PropTypes.string.isRequired,
      thumbnailUrl: PropTypes.string,
      filename: PropTypes.string,
      name: PropTypes.string,
      uploadedAt: PropTypes.any,
      createdAt: PropTypes.any,
      isFavorite: PropTypes.bool,
      favorite: PropTypes.bool,
      isScreenshot: PropTypes.bool,
      aiTags: PropTypes.arrayOf(PropTypes.string)
    })
  ).isRequired,
  onSelect: PropTypes.func.isRequired,
  maxPhotos: PropTypes.number,
  initialSelection: PropTypes.array,
  onBack: PropTypes.func,
  showBack: PropTypes.bool
}

ImagePickerV3.defaultProps = {
  maxPhotos: 6,
  initialSelection: [],
  onBack: null,
  showBack: false
}

export default ImagePickerV3
