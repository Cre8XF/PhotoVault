/**
 * CropLayer - Phase 8: EditorViewport Rebuild
 *
 * Interactive crop overlay with handles
 * - Lives in same coordinate space as ImageLayer
 * - Draggable crop box
 * - 8 resize handles (4 corners + 4 edges)
 * - Dimmed overlay outside crop area
 * - Supports aspect ratio lock
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { constrainCropRect } from './mathUtils';

const CropLayer = ({
  cropRect,
  imageBounds,
  aspectRatio = null,
  onCropChange,
  enabled = true,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragType, setDragType] = useState(null);
  const dragStartRef = useRef({ x: 0, y: 0, cropRect: null });

  // Handle pointer down (mouse or touch)
  const handlePointerDown = useCallback(
    (e, type) => {
      if (!enabled) return;

      e.preventDefault();
      e.stopPropagation();

      const point = e.touches ? e.touches[0] : e;
      dragStartRef.current = {
        x: point.clientX,
        y: point.clientY,
        cropRect: { ...cropRect },
      };

      setIsDragging(true);
      setDragType(type);
    },
    [cropRect, enabled]
  );

  // Handle pointer move
  const handlePointerMove = useCallback(
    (e) => {
      if (!isDragging || !dragType || !imageBounds) return;

      const point = e.touches ? e.touches[0] : e;
      const deltaX = point.clientX - dragStartRef.current.x;
      const deltaY = point.clientY - dragStartRef.current.y;
      const startBox = dragStartRef.current.cropRect;

      let newBox = { ...startBox };

      // Apply drag based on type
      if (dragType === 'move') {
        // Move entire crop box
        newBox.x = startBox.x + deltaX;
        newBox.y = startBox.y + deltaY;
      } else {
        // Resize based on handle
        if (dragType.includes('n')) {
          newBox.y = startBox.y + deltaY;
          newBox.height = startBox.height - deltaY;
        }
        if (dragType.includes('s')) {
          newBox.height = startBox.height + deltaY;
        }
        if (dragType.includes('w')) {
          newBox.x = startBox.x + deltaX;
          newBox.width = startBox.width - deltaX;
        }
        if (dragType.includes('e')) {
          newBox.width = startBox.width + deltaX;
        }

        // Apply aspect ratio constraint
        if (aspectRatio && dragType !== 'move') {
          const currentRatio = newBox.width / newBox.height;

          if (Math.abs(currentRatio - aspectRatio) > 0.01) {
            if (dragType.includes('e') || dragType.includes('w')) {
              // Width changed, adjust height
              newBox.height = newBox.width / aspectRatio;
              if (dragType.includes('n')) {
                newBox.y = startBox.y + startBox.height - newBox.height;
              }
            } else {
              // Height changed, adjust width
              newBox.width = newBox.height * aspectRatio;
              if (dragType.includes('w')) {
                newBox.x = startBox.x + startBox.width - newBox.width;
              }
            }
          }
        }
      }

      // Constrain to image bounds
      newBox = constrainCropRect(newBox, imageBounds);

      onCropChange(newBox);
    },
    [isDragging, dragType, imageBounds, aspectRatio, onCropChange]
  );

  // Handle pointer up
  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    setDragType(null);
  }, []);

  // Global event listeners
  useEffect(() => {
    if (isDragging) {
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
    }
  }, [isDragging, handlePointerMove, handlePointerUp]);

  if (!enabled || !cropRect || !imageBounds) return null;

  // Render crop box and handles
  return (
    <div className="viewport-crop-layer">
      {/* Crop box */}
      <div
        className="crop-box"
        style={{
          left: `${cropRect.x}px`,
          top: `${cropRect.y}px`,
          width: `${cropRect.width}px`,
          height: `${cropRect.height}px`,
        }}
        onMouseDown={(e) => handlePointerDown(e, 'move')}
        onTouchStart={(e) => handlePointerDown(e, 'move')}
      >
        {/* Grid lines (rule of thirds) */}
        <div className="crop-grid">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="crop-grid-cell" />
          ))}
        </div>

        {/* Corner handles */}
        {['nw', 'ne', 'sw', 'se'].map((corner) => {
          const isNorth = corner.includes('n');
          const isWest = corner.includes('w');

          return (
            <div
              key={corner}
              className={`crop-handle crop-handle-corner crop-handle-${corner}`}
              style={{
                [isNorth ? 'top' : 'bottom']: '-6px',
                [isWest ? 'left' : 'right']: '-6px',
              }}
              onMouseDown={(e) => handlePointerDown(e, corner)}
              onTouchStart={(e) => handlePointerDown(e, corner)}
            />
          );
        })}

        {/* Edge handles */}
        {['n', 's', 'e', 'w'].map((edge) => {
          const isVertical = edge === 'n' || edge === 's';
          const style = isVertical
            ? {
                left: '25%',
                width: '50%',
                height: '12px',
                [edge]: '-6px',
              }
            : {
                top: '25%',
                height: '50%',
                width: '12px',
                [edge]: '-6px',
              };

          return (
            <div
              key={edge}
              className={`crop-handle crop-handle-edge crop-handle-${edge}`}
              style={style}
              onMouseDown={(e) => handlePointerDown(e, edge)}
              onTouchStart={(e) => handlePointerDown(e, edge)}
            />
          );
        })}
      </div>
    </div>
  );
};

export default CropLayer;
