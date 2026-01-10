import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useEditorV5Store from '../store/editorV5Store';
import EditorViewportV5 from './EditorViewportV5';
import EditorToolbarV5 from './EditorToolbarV5';
import AdjustPanelV5 from '../panels/AdjustPanelV5';

/**
 * EditorShellV5 - Main Layout Container
 * Implements stable canvas principle with:
 * - Fixed viewport height (never changes when tools open/close)
 * - Sticky header and toolbar
 * - Tool panel below viewport (scrollable)
 * - One scroll container for everything
 */
const EditorShellV5 = () => {
  const navigate = useNavigate();
  const activeTool = useEditorV5Store((state) => state.activeTool);
  const panelRef = useRef(null);

  // Calculate stable viewport height
  // 100dvh - header(56px) - toolbar(64px) - safe areas
  const [viewportHeight, setViewportHeight] = useState(0);

  useEffect(() => {
    const calculateHeight = () => {
      // Get viewport height in pixels
      const dvh = window.innerHeight;

      // Header and toolbar heights
      const headerHeight = 56;
      const toolbarHeight = 64;

      // Safe area insets (approximate, real values come from CSS env())
      // For height calculation, we use window.innerHeight which already accounts for safe areas
      const availableHeight = dvh - headerHeight - toolbarHeight;

      setViewportHeight(availableHeight);
    };

    calculateHeight();
    window.addEventListener('resize', calculateHeight);

    return () => window.removeEventListener('resize', calculateHeight);
  }, []);

  // Scroll to panel when tool is activated
  useEffect(() => {
    if (activeTool && panelRef.current) {
      panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [activeTool]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleDone = () => {
    // TODO: Save changes and navigate back
    navigate(-1);
  };

  const renderToolPanel = () => {
    if (!activeTool) return null;

    switch (activeTool) {
      case 'adjust':
        return <AdjustPanelV5 />;
      case 'crop':
        return (
          <div className="editor-v5-panel">
            <div className="editor-v5-placeholder">Crop tool coming soon...</div>
          </div>
        );
      case 'rotate':
        return (
          <div className="editor-v5-panel">
            <div className="editor-v5-placeholder">Rotate tool coming soon...</div>
          </div>
        );
      case 'filters':
        return (
          <div className="editor-v5-panel">
            <div className="editor-v5-placeholder">Filters coming soon...</div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="editor-v5-shell">
      {/* Sticky Header */}
      <header className="editor-v5-header">
        <button onClick={handleBack} className="editor-v5-header-back">
          ← Back
        </button>
        <h1 className="editor-v5-header-title">Edit Photo</h1>
        <button onClick={handleDone} className="editor-v5-header-done">
          Done
        </button>
      </header>

      {/* Stable Viewport */}
      <EditorViewportV5 height={viewportHeight} />

      {/* Sticky Toolbar */}
      <EditorToolbarV5 />

      {/* Tool Panel (Below Viewport, Scrollable) */}
      {activeTool && (
        <div ref={panelRef}>
          {renderToolPanel()}
        </div>
      )}
    </div>
  );
};

export default EditorShellV5;
