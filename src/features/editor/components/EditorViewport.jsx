/**
 * EditorViewport - Phase 8A: Simple Layout Foundation
 *
 * Simple viewport component that displays photo with CSS-based layout.
 * - Uses <img> tag (canvas comes in Phase 8B)
 * - Responds to panel state (shrinks when panel opens)
 * - Google Photos behavior: entire image always visible
 *
 * Phase 8A: DOM + CSS only, no transforms yet
 */

import React from 'react';

/**
 * EditorViewport Component
 *
 * @param {Object} photo - Photo object with url, name, etc.
 * @param {boolean} hasActivePanel - Whether a panel (Adjust/Crop/Rotate/Filters) is open
 * @param {React.ReactNode} children - Child components (e.g., CropOverlay in future phases)
 */
export function EditorViewport({ photo, hasActivePanel, children }) {
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
        className={
          hasActivePanel
            ? 'editor-viewport-inner editor-viewport-inner--with-panel'
            : 'editor-viewport-inner'
        }
      >
        <img
          src={photo.url}
          alt={photo.name || 'Photo'}
          className="editor-viewport-image"
        />
        {children /* CropOverlay will be added in Phase 8C */}
      </div>
    </div>
  );
}

export default EditorViewport;
