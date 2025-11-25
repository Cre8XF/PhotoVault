// ============================================================================
// COMPONENT: FiltersPanel.jsx - Filter Presets (Phase 8B-5)
// ============================================================================

import React from 'react';
import { useTranslation } from 'react-i18next';
import { X } from 'lucide-react';
import useEditorStore from '../editorStore';

/**
 * FiltersPanel - Filter Preset Selection (Phase 8B-5)
 *
 * Provides horizontal scrollable filter presets (Google Photos style).
 * Phase 8B-5: GUI only
 * Phase 1A: Connected to real filter engine
 *
 * @param {React.RefObject} viewportRef - Reference to EditorViewport
 * @param {Object} photo - Photo object for thumbnails
 */

// Filter presets (static list for Phase 8B-5)
const FILTERS = [
  { id: 'original', name: 'Original' },
  { id: 'bright', name: 'Bright' },
  { id: 'warm', name: 'Warm' },
  { id: 'cool', name: 'Cool' },
  { id: 'fade', name: 'Fade' },
  { id: 'mono', name: 'Mono' },
  { id: 'vintage', name: 'Vintage' },
];

const FiltersPanel = ({ viewportRef, photo }) => {
  const { t } = useTranslation();
  const { filter, setFilter } = useEditorStore();

  /**
   * Handle filter selection (Phase 1A: Real filter engine)
   */
  const handleFilterSelect = (filterId) => {
    setFilter(filterId);
    console.log('🎨 Filter selected:', filterId);
  };

  /**
   * Clear filter (Phase 1A: Real filter engine)
   */
  const handleClearFilter = () => {
    setFilter('original');
    console.log('🎨 Filter cleared');
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white">
          {t('editor.filters.title', 'Filters')}
        </h3>

        {/* Clear Filter Button */}
        {filter !== 'original' && (
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
        {FILTERS.map((filterItem) => (
          <button
            key={filterItem.id}
            onClick={() => handleFilterSelect(filterItem.id)}
            className={`filter-item ${filter === filterItem.id ? 'filter-item--selected active' : ''}`}
            aria-label={t(`editor.filters.${filterItem.id}`, filterItem.name)}
          >
            {/* Filter Thumbnail Preview */}
            <div className="filter-thumbnail">
              {photo?.url ? (
                <img
                  src={photo.url}
                  alt={filterItem.name}
                  className="w-full h-full object-cover"
                  style={{
                    // Phase 1A: Real filter preview
                    opacity: 1,
                    filter: getPreviewFilter(filterItem.id),
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
              {t(`editor.filters.${filterItem.id}`, filterItem.name)}
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
 * Get CSS filter for preview (Phase 1A)
 */
const getPreviewFilter = (filterId) => {
  switch (filterId) {
    case 'original':
      return 'none';
    case 'bright':
      return 'brightness(1.2) contrast(1.05)';
    case 'warm':
      return 'brightness(1.05) sepia(0.3) saturate(1.2)';
    case 'cool':
      return 'brightness(0.95) saturate(1.3) hue-rotate(10deg)';
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
