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

/**
 * FiltersMode - Filter selection mode
 * Features:
 * - Preset filters (warm, cool, film, noir, fade, punch)
 * - Live preview
 * - Cancel/Done buttons
 */
const FiltersMode = ({ photo }) => {
  const {
    setMode,
    filter,
    setFilter,
    resetFilter,
  } = useEditorModeStore();

  // Handle cancel
  const handleCancel = () => {
    resetFilter();
    setMode('view');
  };

  // Handle done (TODO: Phase 6B will commit to workingImageUrl)
  const handleDone = () => {
    console.log('Apply filter:', filter.name);
    // TODO Phase 6B: Commit filter to workingImageUrl
    setMode('view');
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
        <div className="filter-row">
          <button
            className={`filter-btn ${filter.name === null ? 'active' : ''}`}
            onClick={() => setFilter(null)}
          >
            Original
          </button>

          {FILTERS.map(f => (
            <button
              key={f.name}
              className={`filter-btn ${filter.name === f.name ? 'active' : ''}`}
              onClick={() => setFilter(f.name)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FiltersMode;
