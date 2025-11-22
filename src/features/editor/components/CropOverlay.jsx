// ============================================================================
// COMPONENT: CropOverlay.jsx - Interactive Crop Overlay (Phase 7A)
// ============================================================================

import React, { useState, useRef, useCallback, useEffect } from 'react';

/**
 * CropOverlay Component
 *
 * Interactive crop overlay with draggable handles
 * - 4 corner handles
 * - 4 edge handles
 * - Draggable crop box
 * - Touch and mouse support
 * - Constrained within image bounds
 * - Optional aspect ratio lock
 */
const CropOverlay = ({
  cropBox,
  onCropChange,
  imageBounds,
  aspectRatio = null,
  zoom = 1,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState(null); // 'move' | 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'e' | 'w'
  const dragStartRef = useRef({ x: 0, y: 0, cropBox: null });

  // Handle mouse/touch down
  const handlePointerDown = useCallback(
    (e, type) => {
      e.preventDefault();
      e.stopPropagation();

      const point = e.touches ? e.touches[0] : e;
      dragStartRef.current = {
        x: point.clientX,
        y: point.clientY,
        cropBox: { ...cropBox },
      };

      setIsDragging(true);
      setDragType(type);
    },
    [cropBox]
  );

  // Handle mouse/touch move
  const handlePointerMove = useCallback(
    (e) => {
      if (!isDragging || !dragType) return;

      const point = e.touches ? e.touches[0] : e;
      const deltaX = (point.clientX - dragStartRef.current.x) / zoom;
      const deltaY = (point.clientY - dragStartRef.current.y) / zoom;
      const startBox = dragStartRef.current.cropBox;

      let newBox = { ...startBox };

      // Calculate new box based on drag type
      if (dragType === 'move') {
        // Move entire box
        newBox.x = startBox.x + deltaX;
        newBox.y = startBox.y + deltaY;
      } else if (dragType.includes('n')) {
        // North edge
        newBox.y = startBox.y + deltaY;
        newBox.height = startBox.height - deltaY;
      } else if (dragType.includes('s')) {
        // South edge
        newBox.height = startBox.height + deltaY;
      }

      if (dragType.includes('w')) {
        // West edge
        newBox.x = startBox.x + deltaX;
        newBox.width = startBox.width - deltaX;
      } else if (dragType.includes('e')) {
        // East edge
        newBox.width = startBox.width + deltaX;
      }

      // Aspect ratio constraint
      if (aspectRatio && dragType !== 'move') {
        const ratio = aspectRatio;
        if (dragType.includes('n') || dragType.includes('s')) {
          // Adjust width to maintain aspect ratio
          newBox.width = newBox.height * ratio;
          if (dragType.includes('w')) {
            newBox.x = startBox.x + startBox.width - newBox.width;
          }
        } else if (dragType.includes('e') || dragType.includes('w')) {
          // Adjust height to maintain aspect ratio
          newBox.height = newBox.width / ratio;
          if (dragType.includes('n')) {
            newBox.y = startBox.y + startBox.height - newBox.height;
          }
        }
      }

      // Constrain to image bounds
      const minSize = 50; // Minimum crop size
      newBox.width = Math.max(minSize, Math.min(newBox.width, imageBounds.width));
      newBox.height = Math.max(minSize, Math.min(newBox.height, imageBounds.height));
      newBox.x = Math.max(imageBounds.x, Math.min(newBox.x, imageBounds.x + imageBounds.width - newBox.width));
      newBox.y = Math.max(imageBounds.y, Math.min(newBox.y, imageBounds.y + imageBounds.height - newBox.height));

      onCropChange(newBox);
    },
    [isDragging, dragType, onCropChange, imageBounds, aspectRatio, zoom]
  );

  // Handle mouse/touch up
  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    setDragType(null);
  }, []);

  // Add global listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handlePointerMove);
      window.addEventListener('touchmove', handlePointerMove);
      window.addEventListener('mouseup', handlePointerUp);
      window.addEventListener('touchend', handlePointerUp);

      return () => {
        window.removeEventListener('mousemove', handlePointerMove);
        window.removeEventListener('touchmove', handlePointerMove);
        window.removeEventListener('mouseup', handlePointerUp);
        window.removeEventListener('touchend', handlePointerUp);
      };
    }
  }, [isDragging, handlePointerMove, handlePointerUp]);

  if (!cropBox) return null;

  const handleSize = 12; // Size of drag handles
  const handleSizeTouch = 20; // Larger for touch

  return (
    <div className={`absolute pointer-events-none ${className}`} style={{ inset: 0 }}>
      {/* Dimmed overlay outside crop */}
      <div
        className="absolute inset-0 bg-black/60 pointer-events-none"
        style={{
          clipPath: `polygon(
            0% 0%,
            0% 100%,
            100% 100%,
            100% 0%,
            0% 0%,
            ${cropBox.x}px ${cropBox.y}px,
            ${cropBox.x}px ${cropBox.y + cropBox.height}px,
            ${cropBox.x + cropBox.width}px ${cropBox.y + cropBox.height}px,
            ${cropBox.x + cropBox.width}px ${cropBox.y}px,
            ${cropBox.x}px ${cropBox.y}px
          )`,
        }}
      />

      {/* Crop box */}
      <div
        className="absolute border-2 border-white cursor-move pointer-events-auto"
        style={{
          left: cropBox.x,
          top: cropBox.y,
          width: cropBox.width,
          height: cropBox.height,
        }}
        onMouseDown={(e) => handlePointerDown(e, 'move')}
        onTouchStart={(e) => handlePointerDown(e, 'move')}
      >
        {/* Grid lines */}
        <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="border border-white/30" />
          ))}
        </div>

        {/* Corner handles */}
        {['nw', 'ne', 'sw', 'se'].map((corner) => {
          const isNorth = corner.includes('n');
          const isWest = corner.includes('w');
          const cursorClass =
            corner === 'nw' || corner === 'se' ? 'cursor-nwse-resize' : 'cursor-nesw-resize';

          return (
            <div
              key={corner}
              className={`absolute bg-white border-2 border-blue-500 ${cursorClass} pointer-events-auto`}
              style={{
                width: handleSize,
                height: handleSize,
                [isNorth ? 'top' : 'bottom']: -handleSize / 2,
                [isWest ? 'left' : 'right']: -handleSize / 2,
                // Larger touch target
                padding: handleSizeTouch / 2 - handleSize / 2,
              }}
              onMouseDown={(e) => handlePointerDown(e, corner)}
              onTouchStart={(e) => handlePointerDown(e, corner)}
            />
          );
        })}

        {/* Edge handles */}
        {['n', 's', 'e', 'w'].map((edge) => {
          const isVertical = edge === 'n' || edge === 's';
          const cursorClass = isVertical ? 'cursor-ns-resize' : 'cursor-ew-resize';
          const style = isVertical
            ? {
                width: '50%',
                height: handleSize,
                left: '25%',
                [edge === 'n' ? 'top' : 'bottom']: -handleSize / 2,
              }
            : {
                width: handleSize,
                height: '50%',
                top: '25%',
                [edge === 'w' ? 'left' : 'right']: -handleSize / 2,
              };

          return (
            <div
              key={edge}
              className={`absolute bg-white border-2 border-blue-500 ${cursorClass} pointer-events-auto`}
              style={{
                ...style,
                // Larger touch target
                padding: handleSizeTouch / 2 - handleSize / 2,
              }}
              onMouseDown={(e) => handlePointerDown(e, edge)}
              onTouchStart={(e) => handlePointerDown(e, edge)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CropOverlay;
