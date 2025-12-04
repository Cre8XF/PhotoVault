// src/features/editor-v2/modes/RotateMode.jsx
import React from 'react';
import { X, Check, RotateCw, RotateCcw, FlipHorizontal2, FlipVertical2 } from 'lucide-react';
import useEditorModeStore from '../modeStore';
import EditorViewportV2 from '../EditorViewportV2';

/**
 * RotateMode - Rotate and flip mode
 * Features:
 * - Rotate 90° CW/CCW
 * - Flip horizontal/vertical
 * - Real-time preview
 * - Apply transforms permanently
 */
const RotateMode = ({ photo, onDone }) => {
  const {
    setMode,
    transform,
    setRotate,
    setFlipH,
    setFlipV,
    resetTransforms,
  } = useEditorModeStore();

  // Handle rotate clockwise
  const handleRotateCW = () => {
    // ✅ Ensure numeric, modeStore will normalize to [0, 90, 180, 270]
    const current = Number(transform.rotate) || 0;
    setRotate(current + 90);
  };

  // Handle rotate counter-clockwise
  const handleRotateCCW = () => {
    // ✅ Ensure numeric, modeStore will normalize to [0, 90, 180, 270]
    const current = Number(transform.rotate) || 0;
    setRotate(current + 270);
  };

  // Handle flip horizontal
  const handleFlipH = () => {
    setFlipH(!transform.flipH);
  };

  // Handle flip vertical
  const handleFlipV = () => {
    setFlipV(!transform.flipV);
  };

  // Handle cancel - Model A: just reset transform state
  const handleCancel = () => {
    resetTransforms();
    setMode('view');
  };

  // Handle done - Model A commit pattern
  const handleDone = () => {
    if (onDone) {
      onDone();
    }
  };

  return (
    <div className="mode-rotate-fullscreen">
      {/* Header */}
      <div className="mode-rotate-header">
        <button className="mode-rotate-cancel" onClick={handleCancel}>
          <X size={24} />
        </button>
        <h2 className="mode-rotate-title">Rotate</h2>
        <button className="mode-rotate-done" onClick={handleDone}>
          <Check size={24} />
        </button>
      </div>

      {/* Viewport */}
      <div className="mode-rotate-viewport">
        <EditorViewportV2 photo={photo} />
      </div>

      {/* Controls */}
      <div className="mode-rotate-controls">
        <div className="mode-rotate-buttons">
          <button
            className={`mode-rotate-btn ${transform.rotate !== 0 ? 'active' : ''}`}
            onClick={handleRotateCCW}
            title="Rotate 90° counter-clockwise"
          >
            <RotateCcw size={24} />
            <span>Rotate CCW</span>
          </button>

          <button
            className={`mode-rotate-btn ${transform.rotate !== 0 ? 'active' : ''}`}
            onClick={handleRotateCW}
            title="Rotate 90° clockwise"
          >
            <RotateCw size={24} />
            <span>Rotate CW</span>
          </button>

          <button
            className={`mode-rotate-btn ${transform.flipH ? 'active' : ''}`}
            onClick={handleFlipH}
            title="Flip horizontal"
          >
            <FlipHorizontal2 size={24} />
            <span>Flip H</span>
          </button>

          <button
            className={`mode-rotate-btn ${transform.flipV ? 'active' : ''}`}
            onClick={handleFlipV}
            title="Flip vertical"
          >
            <FlipVertical2 size={24} />
            <span>Flip V</span>
          </button>
        </div>

        {/* Transform info */}
        <div className="mode-rotate-info">
          {transform.rotate !== 0 && <span>Rotated: {transform.rotate}°</span>}
          {transform.flipH && <span>Flipped H</span>}
          {transform.flipV && <span>Flipped V</span>}
          {transform.rotate === 0 && !transform.flipH && !transform.flipV && (
            <span>No transforms applied</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default RotateMode;
