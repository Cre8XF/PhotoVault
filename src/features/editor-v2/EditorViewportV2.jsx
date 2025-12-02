// src/features/editor-v2/EditorViewportV2.jsx
import React from 'react';

/**
 * EditorViewportV2 - Simple viewport for displaying the photo
 * No canvas, no cropping logic yet - just displays the image
 * Future: Will integrate canvas rendering
 */
const EditorViewportV2 = ({ photo }) => {
  if (!photo || !photo.url) {
    return (
      <div className="editor-v2-viewport">
        <div className="editor-v2-viewport-empty">
          <p>No photo loaded</p>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-v2-viewport">
      <div className="editor-v2-viewport-content">
        <img
          src={photo.url}
          alt={photo.caption || 'Photo'}
          className="editor-v2-image"
        />
      </div>
    </div>
  );
};

export default EditorViewportV2;
