// src/features/editor-v2/modes/CropMode.jsx
import React, { useRef, useEffect } from 'react';
import { X, Check, RotateCw, FlipHorizontal2, FlipVertical2 } from 'lucide-react';
import useEditorModeStore from '../modeStore';

/**
 * CropMode - Interactive crop mode
 * Google Photos-inspired crop interface with:
 * - Draggable crop window
 * - Resizable handles (8 handles: 4 corners + 4 edges)
 * - Normalized coordinates (0-1)
 * - Aspect ratio constraints (Phase 2)
 * - Canvas crop preview (Phase 3A)
 */
const CropMode = ({ photo, viewportRef }) => {
  const {
    setMode,
    crop,
    setCropRect,
    setActiveHandle,
    setCropActive,
    resetCrop,
    setAspectRatio
  } = useEditorModeStore();

  // Refs
  const cropAreaRef = useRef(null);
  const dragContextRef = useRef({
    startPointer: null,
    startRect: null,
    container: null,
  });

  // Aspect ratio presets
  const aspectRatios = [
    { id: 'free', label: 'Free', ratio: null },
    { id: '1:1', label: '1:1', ratio: 1 },
    { id: '4:5', label: '4:5', ratio: 4/5 },
    { id: '5:4', label: '5:4', ratio: 5/4 },
    { id: '16:9', label: '16:9', ratio: 16/9 },
    { id: '9:16', label: '9:16', ratio: 9/16 },
    { id: '3:2', label: '3:2', ratio: 3/2 },
    { id: '2:3', label: '2:3', ratio: 2/3 },
  ];

  // Activate crop when component mounts
  useEffect(() => {
    setCropActive(true);
    return () => {
      setCropActive(false);
    };
  }, [setCropActive]);

  // Handle cancel
  const handleCancel = () => {
    resetCrop();
    setMode('view');
  };

  // Handle done (TODO: Apply crop to image)
  const handleDone = () => {
    console.log('Apply crop:', crop.rect);
    setMode('view');
  };

  // Handle quick actions (TODO: Implement)
  const handleRotate = () => {
    console.log('Rotate 90°');
  };

  const handleFlipH = () => {
    console.log('Flip horizontal');
  };

  const handleFlipV = () => {
    console.log('Flip vertical');
  };

  // Pointer event handlers
  const handlePointerDown = (handle, event) => {
    event.preventDefault();

    if (!cropAreaRef.current) return;

    const rect = cropAreaRef.current.getBoundingClientRect();

    dragContextRef.current = {
      startPointer: { x: event.clientX, y: event.clientY },
      startRect: { ...crop.rect },
      container: { width: rect.width, height: rect.height },
    };

    setActiveHandle(handle);

    console.log('Drag start:', handle, crop.rect);
  };

  const handlePointerMove = (event) => {
    if (!crop.activeHandle || !dragContextRef.current.startPointer) return;

    const { startPointer, startRect, container } = dragContextRef.current;

    // Calculate normalized delta
    const dx = (event.clientX - startPointer.x) / container.width;
    const dy = (event.clientY - startPointer.y) / container.height;

    let newRect = { ...startRect };

    // Apply delta based on active handle
    switch (crop.activeHandle) {
      case 'move':
        // Move entire crop window
        newRect.x1 = startRect.x1 + dx;
        newRect.y1 = startRect.y1 + dy;
        newRect.x2 = startRect.x2 + dx;
        newRect.y2 = startRect.y2 + dy;
        break;

      case 'tl':
        // Top-left corner
        newRect.x1 = startRect.x1 + dx;
        newRect.y1 = startRect.y1 + dy;
        break;

      case 'tr':
        // Top-right corner
        newRect.x2 = startRect.x2 + dx;
        newRect.y1 = startRect.y1 + dy;
        break;

      case 'bl':
        // Bottom-left corner
        newRect.x1 = startRect.x1 + dx;
        newRect.y2 = startRect.y2 + dy;
        break;

      case 'br':
        // Bottom-right corner
        newRect.x2 = startRect.x2 + dx;
        newRect.y2 = startRect.y2 + dy;
        break;

      case 't':
        // Top edge
        newRect.y1 = startRect.y1 + dy;
        break;

      case 'b':
        // Bottom edge
        newRect.y2 = startRect.y2 + dy;
        break;

      case 'l':
        // Left edge
        newRect.x1 = startRect.x1 + dx;
        break;

      case 'r':
        // Right edge
        newRect.x2 = startRect.x2 + dx;
        break;

      default:
        return;
    }

    // Apply aspect ratio constraint (if active and not moving)
    if (crop.aspectRatio !== null && crop.activeHandle !== 'move') {
      console.log('Applying aspect ratio constraint:', crop.aspectRatio);

      let width = newRect.x2 - newRect.x1;
      let height = newRect.y2 - newRect.y1;

      switch (crop.activeHandle) {
        case 'l':
        case 'r':
          // Width changed, adjust height to maintain aspect ratio
          const targetHeight = width / crop.aspectRatio;
          const centerY = (newRect.y1 + newRect.y2) / 2;
          newRect.y1 = centerY - targetHeight / 2;
          newRect.y2 = centerY + targetHeight / 2;
          console.log('Edge L/R: width =', width, '→ height =', targetHeight);
          break;

        case 't':
        case 'b':
          // Height changed, adjust width to maintain aspect ratio
          const targetWidth = height * crop.aspectRatio;
          const centerX = (newRect.x1 + newRect.x2) / 2;
          newRect.x1 = centerX - targetWidth / 2;
          newRect.x2 = centerX + targetWidth / 2;
          console.log('Edge T/B: height =', height, '→ width =', targetWidth);
          break;

        case 'tl':
        case 'tr':
        case 'bl':
        case 'br':
          // Corner handles - use width as driver, adjust height
          const constrainedHeight = width / crop.aspectRatio;

          // Adjust y based on which corner
          if (crop.activeHandle === 'tl' || crop.activeHandle === 'tr') {
            // Top corners - adjust y1 (keep bottom fixed)
            newRect.y1 = newRect.y2 - constrainedHeight;
            console.log('Corner top: width =', width, '→ height =', constrainedHeight);
          } else {
            // Bottom corners - adjust y2 (keep top fixed)
            newRect.y2 = newRect.y1 + constrainedHeight;
            console.log('Corner bottom: width =', width, '→ height =', constrainedHeight);
          }
          break;

        default:
          break;
      }
    }

    setCropRect(newRect);

    // Trigger canvas re-render
    if (viewportRef?.current?.renderCropPreview) {
      viewportRef.current.renderCropPreview();
    }
  };

  const handlePointerUp = () => {
    if (crop.activeHandle) {
      console.log('Drag end:', crop.rect);
      setActiveHandle(null);
    }
  };

  if (!photo || !photo.url) {
    return null;
  }

  // Calculate crop window style based on normalized rect
  const cropWindowStyle = {
    position: 'absolute',
    left: `${crop.rect.x1 * 100}%`,
    top: `${crop.rect.y1 * 100}%`,
    width: `${(crop.rect.x2 - crop.rect.x1) * 100}%`,
    height: `${(crop.rect.y2 - crop.rect.y1) * 100}%`,
  };

  return (
    <div className="crop-mode-overlay">
      {/* HEADER */}
      <div className="crop-header">
        <button
          className="crop-header-btn crop-header-cancel"
          onClick={handleCancel}
          aria-label="Cancel crop"
        >
          <X size={20} />
          <span>Cancel</span>
        </button>

        <button
          className="crop-header-btn crop-header-done"
          onClick={handleDone}
          aria-label="Apply crop"
        >
          <Check size={20} />
          <span>Done</span>
        </button>
      </div>

      {/* MAIN CROP AREA */}
      <div className="crop-main">
        {/* Aspect Ratio Selector */}
        <div className="aspect-ratio-bar">
          {aspectRatios.map((aspect) => (
            <button
              key={aspect.id}
              className={`aspect-chip ${crop.aspectRatio === aspect.ratio ? 'active' : ''}`}
              onClick={() => setAspectRatio(aspect.ratio)}
            >
              {aspect.label}
            </button>
          ))}
        </div>

        {/* Crop Window Area */}
        <div
          className="crop-area"
          ref={cropAreaRef}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Crop Window (positioned absolutely based on crop.rect) */}
          <div
            className="crop-window"
            style={cropWindowStyle}
            onPointerDown={(e) => handlePointerDown('move', e)}
          >
            {/* Image */}
            <img
              src={photo.url}
              alt={photo.caption || 'Photo'}
              className="crop-image"
              draggable={false}
            />

            {/* 3×3 Grid Overlay */}
            <div className="crop-grid">
              {/* Horizontal lines */}
              <div className="crop-grid-line crop-grid-h" style={{ top: '33.333%' }} />
              <div className="crop-grid-line crop-grid-h" style={{ top: '66.666%' }} />
              {/* Vertical lines */}
              <div className="crop-grid-line crop-grid-v" style={{ left: '33.333%' }} />
              <div className="crop-grid-line crop-grid-v" style={{ left: '66.666%' }} />
            </div>

            {/* 8 Handles (interactive) */}
            <div
              className="crop-handle crop-handle-tl"
              onPointerDown={(e) => {
                e.stopPropagation();
                handlePointerDown('tl', e);
              }}
            />
            <div
              className="crop-handle crop-handle-t"
              onPointerDown={(e) => {
                e.stopPropagation();
                handlePointerDown('t', e);
              }}
            />
            <div
              className="crop-handle crop-handle-tr"
              onPointerDown={(e) => {
                e.stopPropagation();
                handlePointerDown('tr', e);
              }}
            />
            <div
              className="crop-handle crop-handle-r"
              onPointerDown={(e) => {
                e.stopPropagation();
                handlePointerDown('r', e);
              }}
            />
            <div
              className="crop-handle crop-handle-br"
              onPointerDown={(e) => {
                e.stopPropagation();
                handlePointerDown('br', e);
              }}
            />
            <div
              className="crop-handle crop-handle-b"
              onPointerDown={(e) => {
                e.stopPropagation();
                handlePointerDown('b', e);
              }}
            />
            <div
              className="crop-handle crop-handle-bl"
              onPointerDown={(e) => {
                e.stopPropagation();
                handlePointerDown('bl', e);
              }}
            />
            <div
              className="crop-handle crop-handle-l"
              onPointerDown={(e) => {
                e.stopPropagation();
                handlePointerDown('l', e);
              }}
            />
          </div>
        </div>
      </div>

      {/* FOOTER QUICK ACTIONS */}
      <div className="crop-footer">
        <button
          className="crop-action-btn"
          onClick={handleRotate}
          aria-label="Rotate 90°"
        >
          <RotateCw size={20} />
          <span>Rotate</span>
        </button>

        <button
          className="crop-action-btn"
          onClick={handleFlipH}
          aria-label="Flip horizontal"
        >
          <FlipHorizontal2 size={20} />
          <span>Flip H</span>
        </button>

        <button
          className="crop-action-btn"
          onClick={handleFlipV}
          aria-label="Flip vertical"
        >
          <FlipVertical2 size={20} />
          <span>Flip V</span>
        </button>
      </div>
    </div>
  );
};

export default CropMode;
