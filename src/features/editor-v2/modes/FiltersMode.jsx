// src/features/editor-v2/modes/FiltersMode.jsx
import React from 'react';
import { X, Check } from 'lucide-react';
import useEditorModeStore from '../modeStore';
import EditorViewportV2 from '../EditorViewportV2';

const FILTERS = [
  { name: 'warm', label: 'Warm' },
  { name: 'cool', label: 'Cool' },
  { name: 'film', label: 'Film' },
  { name: 'noir', label: 'Noir' },
  { name: 'fade', label: 'Fade' },
  { name: 'punch', label: 'Punch' },
];

// CSS filter strings for preview thumbnails
const FILTER_CSS = {
  warm: 'sepia(20%) saturate(120%)',
  cool: 'hue-rotate(180deg) saturate(110%)',
  film: 'contrast(90%) brightness(110%)',
  noir: 'grayscale(100%) contrast(120%)',
  fade: 'opacity(80%) brightness(110%)',
  punch: 'contrast(135%) saturate(130%)',
};

/**
 * FiltersMode - Filter selection mode
 * Features:
 * - Preset filters (warm, cool, film, noir, fade, punch)
 * - Live preview
 * - Permanent filter commit (Phase 6B)
 */
const FiltersMode = ({ photo, onDone }) => {
  const {
    setMode,
    filter,
    setFilter,
    resetFilter,
    workingImageUrl,
  } = useEditorModeStore();

  // Handle cancel - Model A: just reset filter state
  const handleCancel = () => {
    resetFilter();
    setMode('view');
  };

  // Handle done - Model A commit pattern
  const handleDone = () => {
    if (onDone) {
      onDone();
    }
  };

  return (
    <div className="mode-filters-fullscreen">
      {/* Header */}
      <div className="mode-filters-header">
        <button className="mode-filters-cancel" onClick={handleCancel}>
          <X size={24} />
        </button>
        <h2 className="mode-filters-title">Filters</h2>
        <button className="mode-filters-done" onClick={handleDone}>
          <Check size={24} />
        </button>
      </div>

      {/* Viewport */}
      <div className="mode-filters-viewport">
        <EditorViewportV2 photo={photo} />
      </div>

      {/* Filter Selection */}
      <div className="mode-filters-controls">
        <div className="filter-grid">
          {/* No Filter tile */}
          <div
            className={`filter-tile ${filter.name === null ? 'active' : ''}`}
            onClick={() => resetFilter()}
          >
            <div className="filter-preview">
              <div className="filter-preview-img" style={{ backgroundImage: `url(${workingImageUrl || photo.url})` }} />
            </div>
            <span className="filter-label">No Filter</span>
          </div>

          {/* Filter preset tiles */}
          {FILTERS.map(f => (
            <div
              key={f.name}
              className={`filter-tile ${filter.name === f.name ? 'active' : ''}`}
              onClick={() => setFilter(f.name)}
            >
              <div className="filter-preview">
                <div
                  className="filter-preview-img"
                  style={{
                    backgroundImage: `url(${workingImageUrl || photo.url})`,
                    filter: FILTER_CSS[f.name]
                  }}
                />
              </div>
              <span className="filter-label">{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FiltersMode;
