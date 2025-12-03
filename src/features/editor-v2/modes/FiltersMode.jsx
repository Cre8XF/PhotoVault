// src/features/editor-v2/modes/FiltersMode.jsx
import React from 'react';
import { X, Check } from 'lucide-react';
import useEditorModeStore from '../modeStore';
import EditorViewportV2 from '../EditorViewportV2';
import { renderFullPipelineToDataUrl } from '../utils/imagePipeline';

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
 * - Permanent filter commit (Phase 6B)
 */
const FiltersMode = ({ photo }) => {
  const {
    setMode,
    filter,
    setFilter,
    resetFilter,
    crop,
    transform,
    adjust,
    workingImageUrl,
    setWorkingImageUrl,
  } = useEditorModeStore();

  // Handle cancel
  const handleCancel = () => {
    resetFilter();
    setMode('view');
  };

  // Handle done - Apply filter permanently (Phase 6B)
  const handleDone = async () => {
    try {
      const imageUrl = workingImageUrl || photo.url;

      console.log('Applying filter:', filter.name);

      // Render full pipeline with filter
      const dataUrl = await renderFullPipelineToDataUrl({
        imageUrl,
        crop,
        transform,
        adjust,
        filter,
      });

      // Commit to working image
      setWorkingImageUrl(dataUrl);

      // Reset filter state
      resetFilter();

      // Return to view mode
      setMode('view');
    } catch (error) {
      console.error('Failed to apply filter:', error);
      alert('Failed to apply filter. Please try again.');
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
