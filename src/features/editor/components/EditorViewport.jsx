/**
 * EditorViewport - Phase 8B-2: Canvas Transform Engine
 *
 * Canvas-based viewport with zoom and pan support.
 * - Canvas rendering with GPU acceleration (Phase 8B-1)
 * - Zoom and pan transforms (Phase 8B-2)
 * - Mouse wheel zoom
 * - Touch pinch zoom
 * - Drag to pan (when zoomed)
 * - Responds to panel state (shrinks when panel opens)
 * - Google Photos behavior: entire image always visible
 *
 * Phase 8B-2: Zoom + Pan transform engine
 */

import React, { forwardRef, useImperativeHandle } from 'react';
import { useCanvasRenderer } from '../hooks/useCanvasRenderer';

/**
 * EditorViewport Component
 *
 * @param {Object} photo - Photo object with url, name, etc.
 * @param {boolean} hasActivePanel - Whether a panel (Adjust/Crop/Rotate/Filters) is open
 * @param {React.ReactNode} children - Child components (e.g., CropOverlay in future phases)
 * @param {React.Ref} ref - Forward ref for imperative API
 */
export const EditorViewport = forwardRef(({ photo, hasActivePanel, children }, ref) => {
  const {
    canvasRef,
    containerRef,
    transform,
    setZoom,
    setPan,
    resetTransform,
    render,
  } = useCanvasRenderer(photo);

  // Expose imperative API to parent
  useImperativeHandle(ref, () => ({
    // Transform controls
    setZoom: (zoom) => setZoom(zoom),
    setPan: (panX, panY) => setPan(panX, panY),
    resetTransform,

    // Get current state
    getTransform: () => transform,
    getZoom: () => transform.zoom,
    getPan: () => ({ panX: transform.panX, panY: transform.panY }),

    // Manual render (if needed)
    render,
  }), [transform, setZoom, setPan, resetTransform, render]);

  if (!photo) {
    return (
      <div className="editor-viewport-shell">
        <div className="editor-viewport-inner">
          <p className="text-sm opacity-50 text-white">No photo loaded</p>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-viewport-shell">
      <div
        ref={containerRef}
        className={
          hasActivePanel
            ? 'editor-viewport-inner editor-viewport-inner--with-panel'
            : 'editor-viewport-inner'
        }
      >
        <canvas
          ref={canvasRef}
          className="editor-viewport-canvas"
        />
        {children /* CropOverlay will be added in Phase 8C */}
      </div>
    </div>
  );
});

EditorViewport.displayName = 'EditorViewport';

export default EditorViewport;
