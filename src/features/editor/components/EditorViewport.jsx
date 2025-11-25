/**
 * EditorViewport - Phase 8C-3: Crop Rendering
 *
 * Canvas-based viewport with full transform support.
 * - Canvas rendering with GPU acceleration (Phase 8B-1)
 * - Zoom and pan transforms (Phase 8B-2)
 * - Rotation and flip transforms (Phase 8B-3)
 * - Adjust filters (brightness, contrast, etc.) (Phase 8C-1)
 * - Crop rendering with high-quality preview (Phase 8C-3)
 * - Mouse wheel zoom
 * - Touch pinch zoom
 * - Drag to pan (when zoomed)
 * - Responds to panel state (shrinks when panel opens)
 * - Google Photos behavior: entire image always visible
 *
 * Phase 8C-3: Crop rendering engine with applyCrop API
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
    rotateClockwise,
    rotateCounterClockwise,
    flipHorizontal,
    flipVertical,
    setAdjustValue,
    resetAdjustValues,
    getAdjustState,
    applyCrop,
    clearCrop,
    getAppliedCrop,
    getImageSize,
    render,
  } = useCanvasRenderer(photo);

  // Expose imperative API to parent (Phase 8C-3)
  useImperativeHandle(ref, () => ({
    // Transform controls
    setZoom: (zoom) => setZoom(zoom),
    setPan: (panX, panY) => setPan(panX, panY),
    resetTransform,

    // Rotation controls (Phase 8B-3)
    rotateClockwise,
    rotateCounterClockwise,

    // Flip controls (Phase 8B-3)
    flipHorizontal,
    flipVertical,

    // Adjust controls (Phase 8C-1)
    setAdjustValue,
    resetAdjustValues,
    getAdjustState,

    // Crop controls (Phase 8C-3)
    applyCrop,
    clearCrop,
    getAppliedCrop,
    getImageSize,

    // Get current state
    getTransform: () => transform,
    getZoom: () => transform.zoom,
    getPan: () => ({ panX: transform.panX, panY: transform.panY }),
    getRotation: () => transform.rotation,
    getFlip: () => ({ flipX: transform.flipX, flipY: transform.flipY }),
    getAdjust: () => transform.adjust,

    // Refs (Phase 8C-2: for CropOverlay)
    canvasRef,
    containerRef,

    // Manual render (if needed)
    render,
  }), [transform, setZoom, setPan, resetTransform, rotateClockwise, rotateCounterClockwise, flipHorizontal, flipVertical, setAdjustValue, resetAdjustValues, getAdjustState, applyCrop, clearCrop, getAppliedCrop, getImageSize, canvasRef, containerRef, render]);

  if (!photo) {
    return (
      <div className={`editor-viewport-shell ${hasActivePanel ? 'has-active-panel' : ''}`}>
        <div className="editor-viewport-inner">
          <p className="text-sm opacity-50 text-white">No photo loaded</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`editor-viewport-shell ${hasActivePanel ? 'has-active-panel' : ''}`}>
      <div ref={containerRef} className="editor-viewport-inner">
        <canvas
          ref={canvasRef}
          className="editor-viewport-canvas"
        />
        {children /* CropOverlay renders here */}
      </div>
    </div>
  );
});

EditorViewport.displayName = 'EditorViewport';

export default EditorViewport;
