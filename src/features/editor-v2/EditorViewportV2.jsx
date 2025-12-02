// src/features/editor-v2/EditorViewportV2.jsx
import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import useEditorModeStore from './modeStore';

/**
 * EditorViewportV2 - Simple viewport for displaying the photo
 * Phase 3A: Canvas rendering with crop clipping
 * - Renders photo on canvas
 * - Applies crop rect clipping when active
 * - Exposes renderCropPreview() method via ref
 */
const EditorViewportV2 = forwardRef(({ photo }, ref) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const imageCache = useRef(null);

  const { crop, workingImageUrl } = useEditorModeStore();

  // Use workingImageUrl if available, otherwise use original photo.url
  const imageUrl = workingImageUrl || photo?.url;

  /**
   * Render crop preview on canvas
   * - Converts normalized rect (0-1) to pixel coordinates
   * - Applies clipping if crop is active
   * - Draws full image if crop inactive
   */
  const renderCropPreview = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (!canvas || !container || !imageUrl) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get container dimensions
    const { width: containerWidth, height: containerHeight } = container.getBoundingClientRect();

    // Set canvas size (HiDPI support)
    const dpr = window.devicePixelRatio || 1;
    canvas.width = containerWidth * dpr;
    canvas.height = containerHeight * dpr;
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerHeight}px`;
    ctx.scale(dpr, dpr);

    // Load image (use cache)
    if (!imageCache.current || imageCache.current.src !== imageUrl) {
      imageCache.current = new Image();
      imageCache.current.crossOrigin = 'anonymous';
      imageCache.current.src = imageUrl;

      imageCache.current.onload = () => {
        renderCropPreview(); // Re-render when image loads
      };

      if (!imageCache.current.complete) return; // Wait for load
    }

    const img = imageCache.current;
    if (!img.complete) return;

    // Clear canvas
    ctx.clearRect(0, 0, containerWidth, containerHeight);

    // Calculate image dimensions to fit container (object-contain)
    const imgAspect = img.width / img.height;
    const containerAspect = containerWidth / containerHeight;

    let renderWidth, renderHeight, offsetX, offsetY;

    if (imgAspect > containerAspect) {
      // Image wider than container
      renderWidth = containerWidth;
      renderHeight = containerWidth / imgAspect;
      offsetX = 0;
      offsetY = (containerHeight - renderHeight) / 2;
    } else {
      // Image taller than container
      renderWidth = containerHeight * imgAspect;
      renderHeight = containerHeight;
      offsetX = (containerWidth - renderWidth) / 2;
      offsetY = 0;
    }

    // Apply crop clipping if crop is active and rect is defined
    if (crop.isActive && crop.rect) {
      const { x1, y1, x2, y2 } = crop.rect;

      // Convert normalized coordinates to pixel coordinates
      const cropX = offsetX + x1 * renderWidth;
      const cropY = offsetY + y1 * renderHeight;
      const cropW = (x2 - x1) * renderWidth;
      const cropH = (y2 - y1) * renderHeight;

      console.log('Rendering crop preview:', { x1, y1, x2, y2 }, '→', { cropX, cropY, cropW, cropH });

      // Apply clipping path
      ctx.save();
      ctx.beginPath();
      ctx.rect(cropX, cropY, cropW, cropH);
      ctx.clip();
    }

    // Draw image
    ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight);

    // Restore context if clipping was applied
    if (crop.isActive && crop.rect) {
      ctx.restore();
    }
  };

  // Expose renderCropPreview via ref
  useImperativeHandle(ref, () => ({
    renderCropPreview,
  }));

  // Re-render when crop changes
  useEffect(() => {
    renderCropPreview();
  }, [crop.rect, crop.isActive, imageUrl]);

  // Re-render on window resize
  useEffect(() => {
    const handleResize = () => {
      renderCropPreview();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initial render
  useEffect(() => {
    renderCropPreview();
  }, []);

  if (!photo || !photo.url) {
    return (
      <div className="editor-v2-viewport">
        <div className="editor-v2-viewport-empty">
          <p>No photo loaded</p>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-v2-viewport" ref={containerRef}>
      <div className="editor-v2-viewport-content" style={{ width: '100%', height: '100%' }}>
        <canvas ref={canvasRef} style={{ display: 'block', width: '100%', height: '100%' }} />
      </div>
    </div>
  );
});

EditorViewportV2.displayName = 'EditorViewportV2';

export default EditorViewportV2;
