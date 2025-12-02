// src/features/editor-v2/modes/CropMode.jsx
import React, { useState } from 'react';
import { X, Check, RotateCw, FlipHorizontal2, FlipVertical2 } from 'lucide-react';
import useEditorModeStore from '../modeStore';

/**
 * CropMode - Crop mode UI skeleton
 * Google Photos-inspired crop interface with:
 * - Fullscreen overlay
 * - Centered crop window
 * - 3×3 grid overlay
 * - 8 static handles (not interactive yet)
 * - Aspect ratio selector bar
 * - Quick action buttons (rotate, flip)
 */
const CropMode = ({ photo }) => {
  const { setMode } = useEditorModeStore();
  const [selectedAspect, setSelectedAspect] = useState('free');

  // Aspect ratio presets
  const aspectRatios = [
    { id: 'free', label: 'Free', ratio: null },
    { id: '1:1', label: '1:1', ratio: 1 },
    { id: '4:5', label: '4:5', ratio: 4/5 },
    { id: '5:4', label: '5:4', ratio: 5/4 },
    { id: '16:9', label: '16:9', ratio: 16/9 },
    { id: '9:16', label: '9:16', ratio: 9/16 },
    { id: '3:2', label: '3:2', ratio: 3/2 },
    { id: '2:3', label: '2:3', ratio: 2/3 },
  ];

  // Handle cancel
  const handleCancel = () => {
    setMode('view');
  };

  // Handle done (TODO: Apply crop)
  const handleDone = () => {
    console.log('Apply crop');
    setMode('view');
  };

  // Handle quick actions (TODO: Implement)
  const handleRotate = () => {
    console.log('Rotate 90°');
  };

  const handleFlipH = () => {
    console.log('Flip horizontal');
  };

  const handleFlipV = () => {
    console.log('Flip vertical');
  };

  if (!photo || !photo.url) {
    return null;
  }

  return (
    <div className="crop-mode-overlay">
      {/* HEADER */}
      <div className="crop-header">
        <button
          className="crop-header-btn crop-header-cancel"
          onClick={handleCancel}
          aria-label="Cancel crop"
        >
          <X size={20} />
          <span>Cancel</span>
        </button>

        <button
          className="crop-header-btn crop-header-done"
          onClick={handleDone}
          aria-label="Apply crop"
        >
          <Check size={20} />
          <span>Done</span>
        </button>
      </div>

      {/* MAIN CROP AREA */}
      <div className="crop-main">
        {/* Aspect Ratio Selector */}
        <div className="aspect-ratio-bar">
          {aspectRatios.map((aspect) => (
            <button
              key={aspect.id}
              className={`aspect-chip ${selectedAspect === aspect.id ? 'active' : ''}`}
              onClick={() => setSelectedAspect(aspect.id)}
            >
              {aspect.label}
            </button>
          ))}
        </div>

        {/* Crop Window Area */}
        <div className="crop-area">
          {/* Crop Window (centered) */}
          <div className="crop-window">
            {/* Image */}
            <img
              src={photo.url}
              alt={photo.caption || 'Photo'}
              className="crop-image"
            />

            {/* 3×3 Grid Overlay */}
            <div className="crop-grid">
              {/* Horizontal lines */}
              <div className="crop-grid-line crop-grid-h" style={{ top: '33.333%' }} />
              <div className="crop-grid-line crop-grid-h" style={{ top: '66.666%' }} />
              {/* Vertical lines */}
              <div className="crop-grid-line crop-grid-v" style={{ left: '33.333%' }} />
              <div className="crop-grid-line crop-grid-v" style={{ left: '66.666%' }} />
            </div>

            {/* 8 Handles (static, not interactive yet) */}
            <div className="crop-handle crop-handle-tl" data-position="top-left" />
            <div className="crop-handle crop-handle-t" data-position="top" />
            <div className="crop-handle crop-handle-tr" data-position="top-right" />
            <div className="crop-handle crop-handle-r" data-position="right" />
            <div className="crop-handle crop-handle-br" data-position="bottom-right" />
            <div className="crop-handle crop-handle-b" data-position="bottom" />
            <div className="crop-handle crop-handle-bl" data-position="bottom-left" />
            <div className="crop-handle crop-handle-l" data-position="left" />
          </div>
        </div>
      </div>

      {/* FOOTER QUICK ACTIONS */}
      <div className="crop-footer">
        <button
          className="crop-action-btn"
          onClick={handleRotate}
          aria-label="Rotate 90°"
        >
          <RotateCw size={20} />
          <span>Rotate</span>
        </button>

        <button
          className="crop-action-btn"
          onClick={handleFlipH}
          aria-label="Flip horizontal"
        >
          <FlipHorizontal2 size={20} />
          <span>Flip H</span>
        </button>

        <button
          className="crop-action-btn"
          onClick={handleFlipV}
          aria-label="Flip vertical"
        >
          <FlipVertical2 size={20} />
          <span>Flip V</span>
        </button>
      </div>
    </div>
  );
};

export default CropMode;
