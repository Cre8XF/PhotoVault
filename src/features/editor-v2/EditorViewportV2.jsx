// src/features/editor-v2/EditorViewportV2.jsx
import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import useEditorModeStore from './modeStore';
import { drawTransformedImage } from './utils/transformUtils';

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

  const { crop, workingImageUrl, transform, adjust } = useEditorModeStore();

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

    // Build CSS filter string from adjust values
    const { brightness = 0, contrast = 0, saturation = 0, warmth = 0 } = adjust || {};
    const brightnessPct = 100 + brightness;  // -100 → 0%, 0 → 100%, +100 → 200%
    const contrastPct = 100 + contrast;
    const saturatePct = 100 + saturation;
    const sepiaPct = warmth > 0 ? warmth : 0;  // Warmth approximated via sepia (positive values only)

    const filterString = `brightness(${brightnessPct}%) contrast(${contrastPct}%) saturate(${saturatePct}%) sepia(${sepiaPct}%)`;

    // Apply CSS filters to canvas context
    ctx.filter = filterString;

    // PIPELINE ORDER:
    // 1. Apply transforms (rotate + flip)
    // 2. Apply adjust filters (brightness, contrast, saturation, warmth)
    // 3. Apply crop clipping (if active)
    // 4. Draw final result

    // Check if any transforms are active
    const hasTransforms = transform.rotate !== 0 || transform.flipH || transform.flipV;

    if (hasTransforms) {
      // Use transform pipeline
      drawTransformedImage(ctx, img, transform, containerWidth, containerHeight);
    } else {
      // Original rendering logic (no transforms)
      // Calculate image dimensions to fit container (object-contain)
      const imgAspect = img.width / img.height;
      const containerAspect = containerWidth / containerHeight;

      let renderWidth, renderHeight, offsetX, offsetY;

      if (imgAspect > containerAspect) {
        renderWidth = containerWidth;
        renderHeight = containerWidth / imgAspect;
        offsetX = 0;
        offsetY = (containerHeight - renderHeight) / 2;
      } else {
        renderWidth = containerHeight * imgAspect;
        renderHeight = containerHeight;
        offsetX = (containerWidth - renderWidth) / 2;
        offsetY = 0;
      }

      // Apply crop clipping if crop is active
      if (crop.isActive && crop.rect) {
        const { x1, y1, x2, y2 } = crop.rect;

        const cropX = offsetX + x1 * renderWidth;
        const cropY = offsetY + y1 * renderHeight;
        const cropW = (x2 - x1) * renderWidth;
        const cropH = (y2 - y1) * renderHeight;

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
    }

    // Reset filter to prevent bleeding to other draws
    ctx.filter = 'none';
  };

  // Expose renderCropPreview via ref
  useImperativeHandle(ref, () => ({
    renderCropPreview,
  }));

  // Re-render when crop, transform, or adjust changes
  useEffect(() => {
    renderCropPreview();
  }, [crop.rect, crop.isActive, imageUrl, transform.rotate, transform.flipH, transform.flipV, adjust.brightness, adjust.contrast, adjust.saturation, adjust.warmth]);

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
