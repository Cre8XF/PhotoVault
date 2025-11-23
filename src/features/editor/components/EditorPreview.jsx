// ============================================================================
// COMPONENT: EditorPreview.jsx - Photo Preview (Phase 7B - Masterplan Aligned)
// ============================================================================

import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { getPreviewStyle, applyVignette } from '../utils/photoTransforms';
import CropOverlay from './CropOverlay';
import useEditorStore from '../editorStore';

/**
 * EditorPreview Component
 *
 * Renders photo inside fixed preview container with all applied transforms
 * - Container is fixed position, fills space between topbar and toolbar
 * - Image always visible, centered within container
 * - CSS filters for color adjustments
 * - CSS transform for rotation and flipping
 * - Vignette overlay
 * - Interactive crop overlay
 * - Zoom and pan support
 */
const EditorPreview = ({ photo, transform, activeMode }) => {
  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const wrapperRef = useRef(null);
  const [imageBounds, setImageBounds] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
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
    if (!imageLoaded || !wrapperRef.current || !containerRef.current) return;

    const wrapper = wrapperRef.current;
    const container = containerRef.current;
    const wrapperRect = wrapper.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    setImageBounds({
      x: wrapperRect.left - containerRect.left,
      y: wrapperRect.top - containerRect.top,
      width: wrapperRect.width,
      height: wrapperRect.height,
    });
  }, [imageLoaded]);

  // Update bounds when image loads, mode changes, or zoom changes
  useEffect(() => {
    if (imageLoaded) {
      updateImageBounds();
    }
  }, [imageLoaded, updateImageBounds, activeMode, zoom.currentZoom, transform.crop]);

  useEffect(() => {
    if (!imageLoaded) return;

    window.addEventListener('resize', updateImageBounds);
    return () => window.removeEventListener('resize', updateImageBounds);
  }, [imageLoaded, updateImageBounds]);

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
      <div className="w-full h-full flex items-center justify-center bg-black">
        <p className="text-sm opacity-50 text-white">No photo loaded</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden bg-black relative"
      onWheel={handleWheel}
      onMouseDown={activeMode === 'crop' && zoom.currentZoom > 1 ? handlePanStart : undefined}
      onTouchStart={activeMode === 'crop' && zoom.currentZoom > 1 ? handlePanStart : undefined}
      style={{ cursor: isPanning ? 'grabbing' : zoom.currentZoom > 1 && activeMode === 'crop' ? 'grab' : 'default' }}
    >
      {/* Wrapper for absolute centering - provides stable coordinate system */}
      <div ref={wrapperRef} className="editor-preview-wrapper">
        {/* Main Photo - ALWAYS VISIBLE */}
        <img
          ref={imageRef}
          src={photo.url}
          alt={photo.name || 'Photo'}
          className="max-w-full max-h-full object-contain transition-transform duration-200"
          style={{
            ...previewStyle,
            transform: `${previewStyle.transform || ''} scale(${zoom.currentZoom}) translate(${zoom.panX}px, ${zoom.panY}px)`,
          }}
          onLoad={() => {
            setImageLoaded(true);
            updateImageBounds();
          }}
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

      {/* Interactive Crop Overlay - Only show when image is loaded */}
      {activeMode === 'crop' && imageLoaded && transform.crop && imageBounds && (
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
