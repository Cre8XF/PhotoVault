// ============================================================================
// COMPONENT: CropOverlay.jsx - Transform-Aware Crop Overlay (Phase 8C-2)
// ============================================================================

import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  screenToImageCoords,
  imageToScreenCoords,
  normalizeCropRect,
  clampCropRect,
  applyCropAspectRatio,
  getCropHandleAtPoint,
} from '../utils/cropTransformBridge';

/**
 * CropOverlay Component (Phase 8C-2)
 *
 * Transform-aware interactive crop overlay that works correctly with zoom/pan/rotate.
 * - Uses normalized 0-1 coordinate space internally
 * - Converts to screen space for rendering via imageToScreenCoords()
 * - Converts from screen space for interaction via screenToImageCoords()
 * - Fully stateless (crop state managed by parent)
 * - Works correctly with all transform combinations
 *
 * @param {Object} cropRect - Normalized crop rect { x1, y1, x2, y2, aspectRatio }
 * @param {Function} onCropChange - Callback when crop changes (receives normalized rect)
 * @param {React.RefObject} viewportRef - Reference to EditorViewport
 * @param {number} canvasWidth - Canvas width in pixels
 * @param {number} canvasHeight - Canvas height in pixels
 * @param {number} imageWidth - Base image width (at zoom=1)
 * @param {number} imageHeight - Base image height (at zoom=1)
 * @param {Object} transform - Current transform state
 */
const CropOverlay = ({
  cropRect,
  onCropChange,
  viewportRef,
  canvasWidth,
  canvasHeight,
  imageWidth,
  imageHeight,
  transform,
}) => {
  // ============================================================================
  // STATE & REFS (must be at top level, before any early returns)
  // ============================================================================
  const [isDragging, setIsDragging] = useState(false);
  const [dragHandle, setDragHandle] = useState(null); // 'tl', 'tr', 'bl', 'br', 'edge-t', etc., or 'move'
  const dragStartRef = useRef({ screenX: 0, screenY: 0, cropRect: null });

  // ============================================================================
  // CALLBACKS (must be at top level, before any early returns)
  // ============================================================================

  /**
   * Convert crop rect to screen coordinates for rendering
   */
  const getScreenRect = useCallback(() => {
    if (!cropRect || !canvasWidth || !canvasHeight || !imageWidth || !imageHeight) {
      return { x1: 0, y1: 0, x2: 0, y2: 0, width: 0, height: 0 };
    }

    const topLeft = imageToScreenCoords(
      cropRect.x1,
      cropRect.y1,
      transform,
      canvasWidth,
      canvasHeight,
      imageWidth,
      imageHeight
    );

    const bottomRight = imageToScreenCoords(
      cropRect.x2,
      cropRect.y2,
      transform,
      canvasWidth,
      canvasHeight,
      imageWidth,
      imageHeight
    );

    return {
      x1: topLeft.x,
      y1: topLeft.y,
      x2: bottomRight.x,
      y2: bottomRight.y,
      width: bottomRight.x - topLeft.x,
      height: bottomRight.y - topLeft.y,
    };
  }, [cropRect, transform, canvasWidth, canvasHeight, imageWidth, imageHeight]);

  /**
   * Handle pointer down (start drag)
   */
  const handlePointerDown = useCallback(
    (e, handle) => {
      if (!cropRect) return;

      e.preventDefault();
      e.stopPropagation();

      const point = e.touches ? e.touches[0] : e;

      dragStartRef.current = {
        screenX: point.clientX,
        screenY: point.clientY,
        cropRect: { ...cropRect },
      };

      setIsDragging(true);
      setDragHandle(handle);
    },
    [cropRect]
  );

  /**
   * Handle pointer move (drag)
   */
  const handlePointerMove = useCallback(
    (e) => {
      if (!isDragging || !dragHandle || !cropRect) return;

      const point = e.touches ? e.touches[0] : e;
      const currentScreenX = point.clientX;
      const currentScreenY = point.clientY;

      // Get canvas-relative coordinates
      const canvas = viewportRef?.current?.canvasRef?.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const startCanvasX = dragStartRef.current.screenX - rect.left;
      const startCanvasY = dragStartRef.current.screenY - rect.top;
      const currentCanvasX = currentScreenX - rect.left;
      const currentCanvasY = currentScreenY - rect.top;

      // Convert both to image coords
      const startImg = screenToImageCoords(
        startCanvasX,
        startCanvasY,
        transform,
        canvasWidth,
        canvasHeight,
        imageWidth,
        imageHeight
      );

      const currentImg = screenToImageCoords(
        currentCanvasX,
        currentCanvasY,
        transform,
        canvasWidth,
        canvasHeight,
        imageWidth,
        imageHeight
      );

      const deltaX = currentImg.x - startImg.x;
      const deltaY = currentImg.y - startImg.y;

      const startCrop = dragStartRef.current.cropRect;
      let newCrop = { ...startCrop };

      // Apply delta based on handle type
      if (dragHandle === 'move') {
        // Move entire rect
        newCrop.x1 = startCrop.x1 + deltaX;
        newCrop.y1 = startCrop.y1 + deltaY;
        newCrop.x2 = startCrop.x2 + deltaX;
        newCrop.y2 = startCrop.y2 + deltaY;
      } else if (dragHandle === 'tl') {
        newCrop.x1 = startCrop.x1 + deltaX;
        newCrop.y1 = startCrop.y1 + deltaY;
      } else if (dragHandle === 'tr') {
        newCrop.x2 = startCrop.x2 + deltaX;
        newCrop.y1 = startCrop.y1 + deltaY;
      } else if (dragHandle === 'bl') {
        newCrop.x1 = startCrop.x1 + deltaX;
        newCrop.y2 = startCrop.y2 + deltaY;
      } else if (dragHandle === 'br') {
        newCrop.x2 = startCrop.x2 + deltaX;
        newCrop.y2 = startCrop.y2 + deltaY;
      } else if (dragHandle === 'edge-t') {
        newCrop.y1 = startCrop.y1 + deltaY;
      } else if (dragHandle === 'edge-b') {
        newCrop.y2 = startCrop.y2 + deltaY;
      } else if (dragHandle === 'edge-l') {
        newCrop.x1 = startCrop.x1 + deltaX;
      } else if (dragHandle === 'edge-r') {
        newCrop.x2 = startCrop.x2 + deltaX;
      }

      // Normalize and clamp
      newCrop = normalizeCropRect(newCrop);

      // Apply aspect ratio if set
      if (cropRect.aspectRatio && dragHandle !== 'move') {
        newCrop = applyCropAspectRatio(newCrop, cropRect.aspectRatio, 'center');
      }

      // Clamp to 0-1 bounds
      newCrop = clampCropRect(newCrop);

      // Ensure minimum size (2% of image)
      const minSize = 0.02;
      if (newCrop.x2 - newCrop.x1 < minSize || newCrop.y2 - newCrop.y1 < minSize) {
        return; // Don't update if too small
      }

      // Keep aspect ratio property
      newCrop.aspectRatio = cropRect.aspectRatio;

      onCropChange(newCrop);
    },
    [isDragging, dragHandle, cropRect, transform, canvasWidth, canvasHeight, imageWidth, imageHeight, viewportRef, onCropChange]
  );

  /**
   * Handle pointer up (end drag)
   */
  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    setDragHandle(null);
  }, []);

  // ============================================================================
  // EFFECTS (must be at top level, before any early returns)
  // ============================================================================

  // Add global listeners when dragging
  useEffect(() => {
    if (!isDragging) return;

    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('touchmove', handlePointerMove, { passive: false });
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchend', handlePointerUp);

    return () => {
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, [isDragging, handlePointerMove, handlePointerUp]);

  // ============================================================================
  // EARLY RETURN CHECK (after all hooks)
  // ============================================================================

  // Don't render if no crop rect or missing dimensions
  if (!cropRect || !canvasWidth || !canvasHeight || !imageWidth || !imageHeight) {
    return null;
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  const screenRect = getScreenRect();
  const handleSize = 12;
  const handleHitArea = 24; // Larger touch target

  return (
    <div className="absolute inset-0 z-20 pointer-events-none">
      {/* Dimmed overlay (4 sections) */}
      {/* Top */}
      <div
        className="absolute left-0 right-0 bg-black/60 pointer-events-none"
        style={{
          top: 0,
          height: Math.max(0, screenRect.y1),
        }}
      />

      {/* Bottom */}
      <div
        className="absolute left-0 right-0 bg-black/60 pointer-events-none"
        style={{
          top: screenRect.y2,
          bottom: 0,
        }}
      />

      {/* Left */}
      <div
        className="absolute bg-black/60 pointer-events-none"
        style={{
          top: screenRect.y1,
          left: 0,
          width: Math.max(0, screenRect.x1),
          height: screenRect.height,
        }}
      />

      {/* Right */}
      <div
        className="absolute bg-black/60 pointer-events-none"
        style={{
          top: screenRect.y1,
          left: screenRect.x2,
          right: 0,
          height: screenRect.height,
        }}
      />

      {/* Crop box */}
      <div
        className="absolute border-2 border-white cursor-move pointer-events-auto"
        style={{
          left: screenRect.x1,
          top: screenRect.y1,
          width: screenRect.width,
          height: screenRect.height,
        }}
        onMouseDown={(e) => handlePointerDown(e, 'move')}
        onTouchStart={(e) => handlePointerDown(e, 'move')}
      >
        {/* Grid lines (rule of thirds) */}
        <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="border border-white/30" />
          ))}
        </div>

        {/* Corner handles */}
        {[
          { handle: 'tl', top: -handleSize/2, left: -handleSize/2, cursor: 'cursor-nwse-resize' },
          { handle: 'tr', top: -handleSize/2, right: -handleSize/2, cursor: 'cursor-nesw-resize' },
          { handle: 'bl', bottom: -handleSize/2, left: -handleSize/2, cursor: 'cursor-nesw-resize' },
          { handle: 'br', bottom: -handleSize/2, right: -handleSize/2, cursor: 'cursor-nwse-resize' },
        ].map(({ handle, cursor, ...pos }) => (
          <div
            key={handle}
            className={`absolute bg-white border-2 border-blue-500 ${cursor} pointer-events-auto`}
            style={{
              width: handleSize,
              height: handleSize,
              ...pos,
              padding: (handleHitArea - handleSize) / 2,
            }}
            onMouseDown={(e) => handlePointerDown(e, handle)}
            onTouchStart={(e) => handlePointerDown(e, handle)}
          />
        ))}

        {/* Edge handles */}
        {[
          { handle: 'edge-t', top: -handleSize/2, left: '25%', width: '50%', height: handleSize, cursor: 'cursor-ns-resize' },
          { handle: 'edge-b', bottom: -handleSize/2, left: '25%', width: '50%', height: handleSize, cursor: 'cursor-ns-resize' },
          { handle: 'edge-l', left: -handleSize/2, top: '25%', width: handleSize, height: '50%', cursor: 'cursor-ew-resize' },
          { handle: 'edge-r', right: -handleSize/2, top: '25%', width: handleSize, height: '50%', cursor: 'cursor-ew-resize' },
        ].map(({ handle, cursor, ...style }) => (
          <div
            key={handle}
            className={`absolute bg-white border-2 border-blue-500 ${cursor} pointer-events-auto`}
            style={{
              ...style,
              padding: (handleHitArea - handleSize) / 2,
            }}
            onMouseDown={(e) => handlePointerDown(e, handle)}
            onTouchStart={(e) => handlePointerDown(e, handle)}
          />
        ))}
      </div>
    </div>
  );
};

export default CropOverlay;
