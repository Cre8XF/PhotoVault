// ============================================================================
// COMPONENT: EditorPreview.jsx - Photo preview with transforms (Phase 7A Enhanced)
// ============================================================================

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { getPreviewStyle, applyVignette } from '../utils/photoTransforms';
import CropOverlay from './CropOverlay';
import useEditorStore from '../editorStore';

/**
 * EditorPreview Component
 *
 * Renders photo with all applied transforms
 * - CSS filters for color adjustments
 * - CSS transform for rotation and flipping
 * - Vignette overlay
 * - Interactive crop overlay (Phase 7A)
 * - Zoom and pan support (Phase 7A)
 */
const EditorPreview = ({ photo, transform, activeMode, className = '' }) => {
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const [imageBounds, setImageBounds] = useState(null);
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });

  // Get zoom and pan from store
  const { zoom, setZoom, setPan, setCrop } = useEditorStore();

  // Get combined style from transforms
  const previewStyle = useMemo(() => getPreviewStyle(transform), [transform]);

  // Get vignette opacity
  const vignetteOpacity = useMemo(
    () => applyVignette(transform.vignette),
    [transform.vignette]
  );

  // Update image bounds when image loads or zoom changes
  const updateImageBounds = useCallback(() => {
    if (imageRef.current && containerRef.current) {
      const img = imageRef.current;
      const container = containerRef.current;
      const imgRect = img.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      setImageBounds({
        x: imgRect.left - containerRect.left,
        y: imgRect.top - containerRect.top,
        width: imgRect.width,
        height: imgRect.height,
      });
    }
  }, []);

  useEffect(() => {
    updateImageBounds();
    window.addEventListener('resize', updateImageBounds);
    return () => window.removeEventListener('resize', updateImageBounds);
  }, [updateImageBounds, zoom.currentZoom]);

  // Handle zoom (wheel or pinch)
  const handleWheel = useCallback(
    (e) => {
      if (activeMode !== 'crop') return;

      e.preventDefault();
      const delta = -e.deltaY * 0.001;
      const newZoom = zoom.currentZoom + delta;
      setZoom(newZoom);
    },
    [activeMode, zoom.currentZoom, setZoom]
  );

  // Handle pan start
  const handlePanStart = useCallback(
    (e) => {
      if (activeMode !== 'crop' || zoom.currentZoom <= 1) return;

      const point = e.touches ? e.touches[0] : e;
      panStartRef.current = {
        x: point.clientX,
        y: point.clientY,
        panX: zoom.panX,
        panY: zoom.panY,
      };
      setIsPanning(true);
    },
    [activeMode, zoom]
  );

  // Handle pan move
  const handlePanMove = useCallback(
    (e) => {
      if (!isPanning) return;

      const point = e.touches ? e.touches[0] : e;
      const deltaX = point.clientX - panStartRef.current.x;
      const deltaY = point.clientY - panStartRef.current.y;

      setPan(
        panStartRef.current.panX + deltaX,
        panStartRef.current.panY + deltaY
      );
    },
    [isPanning, setPan]
  );

  // Handle pan end
  const handlePanEnd = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Add pan listeners
  useEffect(() => {
    if (isPanning) {
      window.addEventListener('mousemove', handlePanMove);
      window.addEventListener('touchmove', handlePanMove);
      window.addEventListener('mouseup', handlePanEnd);
      window.addEventListener('touchend', handlePanEnd);

      return () => {
        window.removeEventListener('mousemove', handlePanMove);
        window.removeEventListener('touchmove', handlePanMove);
        window.removeEventListener('mouseup', handlePanEnd);
        window.removeEventListener('touchend', handlePanEnd);
      };
    }
  }, [isPanning, handlePanMove, handlePanEnd]);

  // Handle crop change
  const handleCropChange = useCallback(
    (newCropBox) => {
      setCrop(newCropBox);
    },
    [setCrop]
  );

  // Initialize default crop when entering crop mode
  useEffect(() => {
    if (activeMode === 'crop' && !transform.crop && imageBounds) {
      // Set default crop to 80% of image size, centered
      const cropWidth = imageBounds.width * 0.8;
      const cropHeight = imageBounds.height * 0.8;
      const cropX = imageBounds.x + (imageBounds.width - cropWidth) / 2;
      const cropY = imageBounds.y + (imageBounds.height - cropHeight) / 2;

      setCrop({
        x: cropX,
        y: cropY,
        width: cropWidth,
        height: cropHeight,
        aspectRatio: null,
      });
    }
  }, [activeMode, transform.crop, imageBounds, setCrop]);

  if (!photo) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-black/50 ${className}`}>
        <p className="text-sm opacity-50">No photo loaded</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden bg-black ${className}`}
      onWheel={handleWheel}
      onMouseDown={activeMode === 'crop' && zoom.currentZoom > 1 ? handlePanStart : undefined}
      onTouchStart={activeMode === 'crop' && zoom.currentZoom > 1 ? handlePanStart : undefined}
      style={{ cursor: isPanning ? 'grabbing' : zoom.currentZoom > 1 && activeMode === 'crop' ? 'grab' : 'default' }}
    >
      {/* Main Photo */}
      <div className="w-full h-full flex items-center justify-center">
        <img
          ref={imageRef}
          src={photo.url}
          alt={photo.name || 'Photo'}
          className="max-w-full max-h-full object-contain transition-transform duration-200"
          style={{
            ...previewStyle,
            transform: `${previewStyle.transform || ''} scale(${zoom.currentZoom}) translate(${zoom.panX}px, ${zoom.panY}px)`,
          }}
          onLoad={updateImageBounds}
        />
      </div>

      {/* Vignette Overlay */}
      {transform.vignette > 0 && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, transparent 30%, black 150%)',
            opacity: vignetteOpacity,
          }}
        />
      )}

      {/* Interactive Crop Overlay (Phase 7A) */}
      {activeMode === 'crop' && transform.crop && imageBounds && (
        <CropOverlay
          cropBox={transform.crop}
          onCropChange={handleCropChange}
          imageBounds={imageBounds}
          aspectRatio={transform.crop.aspectRatio}
          zoom={zoom.currentZoom}
        />
      )}
    </div>
  );
};

export default EditorPreview;
