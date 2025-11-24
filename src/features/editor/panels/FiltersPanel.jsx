// ============================================================================
// COMPONENT: FiltersPanel.jsx - Filter Presets (Phase 8B-5)
// ============================================================================

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';

/**
 * FiltersPanel - Filter Preset Selection (Phase 8B-5)
 *
 * Provides horizontal scrollable filter presets (Google Photos style).
 * Phase 8B-5: GUI only (selection logic, no real filter math)
 * Phase 8C: Will connect to real filter rendering engine
 *
 * @param {React.RefObject} viewportRef - Reference to EditorViewport (for future Phase 8C)
 * @param {Object} photo - Photo object for thumbnails
 */

// Filter presets (static list for Phase 8B-5)
const FILTERS = [
  { id: 'none', name: 'Original' },
  { id: 'bright', name: 'Bright' },
  { id: 'warm', name: 'Warm' },
  { id: 'cool', name: 'Cool' },
  { id: 'fade', name: 'Fade' },
  { id: 'mono', name: 'Mono' },
  { id: 'vintage', name: 'Vintage' },
];

const FiltersPanel = ({ viewportRef, photo }) => {
  const { t } = useTranslation();
  const [selectedFilter, setSelectedFilter] = useState('none');

  /**
   * Handle filter selection (Phase 8B-5: NO-OP)
   * Phase 8C will connect to real filter engine
   */
  const handleFilterSelect = (filterId) => {
    setSelectedFilter(filterId);

    // Phase 8C: Will call viewportRef.current.setFilter(filterId)
    // For now, just update UI state
    console.log('🎨 Filter selected:', filterId);
  };

  /**
   * Clear filter (Phase 8B-5: NO-OP)
   */
  const handleClearFilter = () => {
    setSelectedFilter('none');

    // Phase 8C: Will call viewportRef.current.clearFilter()
    console.log('🎨 Filter cleared');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">
          {t('editor.filters.title', 'Filters')}
        </h3>

        {/* Clear Filter Button */}
        {selectedFilter !== 'none' && (
          <button
            onClick={handleClearFilter}
            className="flex items-center gap-1 px-3 py-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition text-xs text-white font-medium"
          >
            <X className="w-4 h-4" />
            {t('editor.filters.clear', 'Clear Filter')}
          </button>
        )}
      </div>

      {/* Horizontal Scrollable Filter Row */}
      <div className="filters-row">
        {FILTERS.map((filter) => (
          <button
            key={filter.id}
            onClick={() => handleFilterSelect(filter.id)}
            className={`filter-item ${selectedFilter === filter.id ? 'filter-item--selected' : ''}`}
            aria-label={t(`editor.filters.${filter.id}`, filter.name)}
          >
            {/* Filter Thumbnail Preview */}
            <div className="filter-thumbnail">
              {photo?.url ? (
                <img
                  src={photo.url}
                  alt={filter.name}
                  className="w-full h-full object-cover"
                  style={{
                    // Phase 8B-5: Simple dimming for non-original
                    // Phase 8C: Real filter preview
                    opacity: filter.id === 'none' ? 1 : 0.8,
                    filter: getPreviewFilter(filter.id),
                  }}
                />
              ) : (
                // Fallback placeholder if no photo
                <div className="w-full h-full bg-white/5 flex items-center justify-center">
                  <span className="text-white/40 text-xs">?</span>
                </div>
              )}
            </div>

            {/* Filter Name */}
            <span className="filter-name">
              {t(`editor.filters.${filter.id}`, filter.name)}
            </span>
          </button>
        ))}
      </div>

      {/* Instructions */}
      <p className="text-xs text-white/60 text-center mt-2">
        {t(
          'editor.filters.instructions',
          'Tap a filter to preview. Use Clear Filter or Reset to remove.'
        )}
      </p>
    </div>
  );
};

/**
 * Get temporary CSS filter for preview (Phase 8B-5)
 * Phase 8C: Will use real canvas filter rendering
 */
const getPreviewFilter = (filterId) => {
  switch (filterId) {
    case 'none':
      return 'none';
    case 'bright':
      return 'brightness(1.2) contrast(1.05)';
    case 'warm':
      return 'sepia(0.2) saturate(1.2)';
    case 'cool':
      return 'hue-rotate(10deg) saturate(0.9)';
    case 'fade':
      return 'contrast(0.85) brightness(1.1) saturate(0.8)';
    case 'mono':
      return 'grayscale(1) contrast(1.1)';
    case 'vintage':
      return 'sepia(0.4) contrast(0.9) brightness(0.95)';
    default:
      return 'none';
  }
};

export default FiltersPanel;
