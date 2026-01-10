import React from 'react';
import useEditorV5Store from '../store/editorV5Store';

/**
 * EditorViewportV5 - Stable Image Canvas
 * Renders the image with CSS filter adjustments applied.
 * Height is dynamically set to remain stable regardless of tool panel state.
 */
const EditorViewportV5 = ({ height }) => {
  const imageUrl = useEditorV5Store((state) => state.imageUrl);
  const adjustments = useEditorV5Store((state) => state.adjustments);

  // Build CSS filter string from adjustments
  const filterStyle = {
    filter: `brightness(${adjustments.brightness}%) contrast(${adjustments.contrast}%) saturate(${adjustments.saturate}%)`,
  };

  return (
    <div className="editor-v5-viewport" style={{ height: `${height}px` }}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Photo being edited"
          className="editor-v5-viewport-image"
          style={filterStyle}
        />
      ) : (
        <div style={{ color: 'rgba(255, 255, 255, 0.5)' }}>Loading image...</div>
      )}
    </div>
  );
};

export default EditorViewportV5;
