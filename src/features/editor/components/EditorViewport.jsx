/**
 * EditorViewport - Phase 8B-1: Canvas Engine Foundation
 *
 * Canvas-based viewport with HiDPI support and auto-sizing.
 * - Uses <canvas> instead of <img> (Phase 8B-1)
 * - Responds to panel state (shrinks when panel opens)
 * - Google Photos behavior: entire image always visible
 * - GPU-accelerated rendering
 * - Auto-resize on window/orientation change
 *
 * Phase 8B-1: Canvas rendering, no transforms yet
 */

import React from 'react';
import { useCanvasRenderer } from '../hooks/useCanvasRenderer';

/**
 * EditorViewport Component
 *
 * @param {Object} photo - Photo object with url, name, etc.
 * @param {boolean} hasActivePanel - Whether a panel (Adjust/Crop/Rotate/Filters) is open
 * @param {React.ReactNode} children - Child components (e.g., CropOverlay in future phases)
 */
export function EditorViewport({ photo, hasActivePanel, children }) {
  const { canvasRef, containerRef } = useCanvasRenderer(photo);

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
}

export default EditorViewport;
