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

import React, { forwardRef, useImperativeHandle, useEffect, useState } from 'react';
import { useCanvasRenderer } from '../hooks/useCanvasRenderer';

const PANEL_HEIGHT = 280; // Panel height in pixels
const TOOLBAR_HEIGHT = 72; // Toolbar height in pixels
const TOPBAR_HEIGHT = 60; // Topbar height in pixels

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

  const [availableHeight, setAvailableHeight] = useState(0);

  // Calculate available height based on panel state
  useEffect(() => {
    const calculateHeight = () => {
      const viewportHeight = window.innerHeight;
      const usedHeight = TOPBAR_HEIGHT + TOOLBAR_HEIGHT + (hasActivePanel ? PANEL_HEIGHT : 0);
      const available = viewportHeight - usedHeight;
      setAvailableHeight(available);
      console.log('📐 Available height:', available, '(Panel:', hasActivePanel ? 'open' : 'closed', ')');
    };

    calculateHeight();
    window.addEventListener('resize', calculateHeight);
    return () => window.removeEventListener('resize', calculateHeight);
  }, [hasActivePanel]);

  // Re-render canvas when viewport height changes (Phase 8C-5 REFACTOR - Fase 1)
  useEffect(() => {
    if (availableHeight > 0) {
      // Small delay to allow CSS transition to start
      const timer = setTimeout(() => {
        render();
        console.log('🎨 Canvas re-rendered for new viewport height:', availableHeight);
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [availableHeight, render]);

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
      <div className="editor-viewport-shell">
        <div className="editor-viewport-inner">
          <p className="text-sm opacity-50 text-white">No photo loaded</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="editor-viewport-shell"
      style={{
        height: availableHeight > 0 ? `${availableHeight}px` : 'auto',
        transition: 'height 0.25s ease',
      }}
    >
      <div ref={containerRef} className="editor-viewport-inner">
        <canvas
          ref={canvasRef}
          className="editor-viewport-canvas"
        />
        {children /* CropOverlay renders here - Phase 8C-5 HOTFIX: No padding transition */}
      </div>
    </div>
  );
});

EditorViewport.displayName = 'EditorViewport';

export default EditorViewport;
