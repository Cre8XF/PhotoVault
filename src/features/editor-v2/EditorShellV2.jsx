// src/features/editor-v2/EditorShellV2.jsx
import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Check, RotateCcw } from 'lucide-react';
import EditorViewportV2 from './EditorViewportV2';
import useEditorModeStore from './modeStore';

// Import mode overlays
import ViewMode from './modes/ViewMode';
import CropMode from './modes/CropMode';
import AdjustMode from './modes/AdjustMode';
import RotateMode from './modes/RotateMode';
import FiltersMode from './modes/FiltersMode';
import TextMode from './modes/TextMode';
import MarkupMode from './modes/MarkupMode';

/**
 * EditorShellV2 - Main layout shell for Editor V2
 * Layout inspired by Google Photos:
 * - Header: Back button + Mode title + Done button
 * - Viewport: Image display area
 * - Footer: Mode selector buttons
 * - Mode Overlays: Conditional overlays based on active mode
 */
const EditorShellV2 = ({ photo }) => {
  const navigate = useNavigate();
  const { mode, setMode, setOriginalUrl, setWorkingImageUrl, resetAll } = useEditorModeStore();
  const viewportRef = useRef(null);

  // Store original URL + working URL once when photo loads
  useEffect(() => {
    if (photo?.url) {
      setOriginalUrl(photo.url);
      setWorkingImageUrl(photo.url);  // ✅ CRITICAL: Initialize working image
    }
  }, [photo?.url, setOriginalUrl, setWorkingImageUrl]);

  // Mode configuration
  const modes = [
    { id: 'crop', label: 'Crop', icon: '⊡' },
    { id: 'adjust', label: 'Adjust', icon: '☀' },
    { id: 'rotate', label: 'Rotate', icon: '↻' },
    { id: 'filters', label: 'Filters', icon: '◐' },
    { id: 'text', label: 'Text', icon: 'A' },
    { id: 'markup', label: 'Markup', icon: '✎' },
  ];

  // Get mode title
  const getModeTitle = () => {
    if (mode === 'view') return 'Editor V2';
    const activeMode = modes.find(m => m.id === mode);
    return activeMode ? activeMode.label : 'Editor V2';
  };

  // Handle back/close
  const handleClose = () => {
    setMode('view');
    navigate(-1);
  };

  // Handle done
  const handleDone = () => {
    // TODO: Save changes logic
    console.log('Save changes');
    handleClose();
  };

  // Render mode overlay
  const renderModeOverlay = () => {
    switch (mode) {
      case 'crop': return <CropMode photo={photo} viewportRef={viewportRef} />;
      case 'adjust': return <AdjustMode photo={photo} />;
      case 'rotate': return <RotateMode photo={photo} />;
      case 'filters': return <FiltersMode photo={photo} />;
      case 'text': return <TextMode photo={photo} />;
      case 'markup': return <MarkupMode photo={photo} />;
      default: return <ViewMode photo={photo} />;
    }
  };

  // Check if we're in a fullscreen mode (crop takes over entire UI)
  const isFullscreenMode = mode === 'crop';

  return (
    <div className="editor-v2-shell">
      {/* HEADER - Hidden in fullscreen modes */}
      {!isFullscreenMode && (
        <div className="editor-v2-header">
        <button
          className="editor-v2-header-btn"
          onClick={handleClose}
          aria-label="Close editor"
        >
          <X size={24} />
        </button>

        <h1 className="editor-v2-header-title">{getModeTitle()}</h1>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="editor-v2-header-btn"
            onClick={resetAll}
            aria-label="Reset to original"
            title="Reset to original"
          >
            <RotateCcw size={20} />
          </button>

          <button
            className="editor-v2-header-btn editor-v2-header-btn-done"
            onClick={handleDone}
            aria-label="Save changes"
          >
            <Check size={24} />
          </button>
        </div>
      </div>
      )}

      {/* VIEWPORT - Hidden in fullscreen modes */}
      {!isFullscreenMode && (
        <div className="editor-v2-viewport-container">
        <EditorViewportV2 ref={viewportRef} photo={photo} />

        {/* Mode overlay */}
        <div className="editor-v2-mode-overlay">
          {renderModeOverlay()}
        </div>
      </div>
      )}

      {/* FULLSCREEN MODE OVERLAYS */}
      {isFullscreenMode && renderModeOverlay()}

      {/* FOOTER - Mode Selector - Hidden in fullscreen modes */}
      {!isFullscreenMode && (
        <div className="editor-v2-footer">
        <div className="editor-v2-mode-buttons">
          {modes.map((m) => (
            <button
              key={m.id}
              className={`editor-v2-mode-btn ${mode === m.id ? 'active' : ''}`}
              onClick={() => setMode(m.id)}
            >
              <span className="editor-v2-mode-icon">{m.icon}</span>
              <span className="editor-v2-mode-label">{m.label}</span>
            </button>
          ))}
        </div>
      </div>
      )}
    </div>
  );
};

export default EditorShellV2;
