/**
 * useCanvasRenderer - Phase 8C-3
 *
 * React hook for canvas rendering with full transform support
 * - Auto-sizes canvas to container
 * - Handles window resize and device rotation
 * - HiDPI support
 * - Image loading and rendering
 * - Zoom, pan, rotation, and flip transforms
 * - Mouse wheel, touch pinch, and drag support
 * - Crop mode with high-quality rendering (Phase 8C-3)
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import {
  setCanvasSize,
  loadImage,
  drawImageWithFullTransform,
  drawCroppedImageToCanvas,
  initCanvasContext,
  calculateFitScale,
} from '../utils/canvasUtils';
import {
  createInitialTransform,
  calculatePanBoundsWithRotation,
  clampPan,
  zoomAroundPoint,
  clamp,
  getTouchDistance,
  getTouchMidpoint,
  normalizeRotation,
} from '../utils/transformUtils';
import { getEffectiveCropBox } from '../utils/cropTransformBridge';

/**
 * useCanvasRenderer Hook
 *
 * @param {Object} photo - Photo object with url
 * @param {Object} externalTransform - External transform state (optional)
 * @returns {Object} Canvas ref, container ref, transform controls
 */
export const useCanvasRenderer = (photo, externalTransform = null) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const imageRef = useRef(null); // Cached loaded image
  const animationFrameRef = useRef(null);

  // Transform state
  const [transform, setTransform] = useState(createInitialTransform());

  // Crop state (Phase 8C-3)
  const [appliedCropBox, setAppliedCropBox] = useState(null);

  // Gesture state
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0, panX: 0, panY: 0 });
  const pinchStartRef = useRef({ distance: 0, zoom: 1 });

  /**
   * Get current image dimensions
   */
  const getImageDimensions = useCallback(() => {
    const image = imageRef.current;
    const container = containerRef.current;

    if (!image || !container) return null;

    const rect = container.getBoundingClientRect();
    const fitScale = calculateFitScale(
      image.naturalWidth,
      image.naturalHeight,
      rect.width,
      rect.height
    );

    return {
      canvasWidth: rect.width,
      canvasHeight: rect.height,
      imageWidth: image.naturalWidth * fitScale,
      imageHeight: image.naturalHeight * fitScale,
    };
  }, []);

  /**
   * Render current image to canvas with transforms (Phase 8C-3)
   * Uses crop mode if appliedCropBox is set OR if external crop preview exists
   */
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const image = imageRef.current;

    if (!canvas || !container || !image) return;

    const ctx = canvas.getContext('2d');
    const rect = container.getBoundingClientRect();

    // Auto-size canvas to container
    const { width, height } = setCanvasSize(canvas, rect.width, rect.height);

    // Use external transform if provided, otherwise use internal
    const activeTransform = externalTransform || transform;

    // Crop mode (Phase 8C-3): render only cropped portion
    if (appliedCropBox) {
      // Final applied crop - locked and permanent
      drawCroppedImageToCanvas(ctx, image, width, height, appliedCropBox, activeTransform.adjust);
    } else if (externalTransform?.crop && !appliedCropBox) {
      // Real-time crop preview (Phase 8C-5 FIX #3) - while adjusting crop handles
      const previewCropBox = getEffectiveCropBox(externalTransform.crop, {
        width: image.naturalWidth,
        height: image.naturalHeight,
      });
      if (previewCropBox) {
        drawCroppedImageToCanvas(ctx, image, width, height, previewCropBox, activeTransform.adjust);
      }
    } else {
      // Normal mode: draw image with full transforms (zoom, pan, rotation, flip)
      drawImageWithFullTransform(ctx, image, width, height, activeTransform);
    }
  }, [transform, externalTransform, appliedCropBox]);

  /**
   * Set zoom level with pan clamping (Phase 8B-3: rotation-aware)
   */
  const setZoom = useCallback(
    (newZoom, pointerX = 0, pointerY = 0) => {
      const dimensions = getImageDimensions();
      if (!dimensions) return;

      const { canvasWidth, canvasHeight, imageWidth, imageHeight } = dimensions;

      // Clamp zoom to bounds
      const clampedZoom = clamp(newZoom, transform.minZoom, transform.maxZoom);

      // Calculate new pan if zooming around a point
      let newPan = { panX: transform.panX, panY: transform.panY };

      if (pointerX !== 0 || pointerY !== 0) {
        newPan = zoomAroundPoint(
          transform.zoom,
          clampedZoom,
          transform.panX,
          transform.panY,
          pointerX,
          pointerY
        );
      }

      // Calculate and apply pan bounds (rotation-aware)
      const bounds = calculatePanBoundsWithRotation(
        canvasWidth,
        canvasHeight,
        imageWidth,
        imageHeight,
        clampedZoom,
        transform.rotation
      );

      const clampedPan = clampPan(newPan.panX, newPan.panY, bounds);

      setTransform((prev) => ({
        ...prev,
        zoom: clampedZoom,
        panX: clampedPan.panX,
        panY: clampedPan.panY,
      }));
    },
    [transform, getImageDimensions]
  );

  /**
   * Emit custom event when transform changes (Phase 8C-5 FIX)
   * Used by CropOverlay for real-time sync without polling
   */
  const emitTransformUpdate = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const event = new CustomEvent('transformUpdate', {
        detail: {
          zoom: transform.zoom,
          panX: transform.panX,
          panY: transform.panY,
          rotation: transform.rotation,
          flipX: transform.flipX,
          flipY: transform.flipY,
        }
      });
      canvas.dispatchEvent(event);
    }
  }, [transform]);

  // Emit event whenever transform changes
  useEffect(() => {
    emitTransformUpdate();
  }, [transform.zoom, transform.panX, transform.panY, transform.rotation, transform.flipX, transform.flipY, emitTransformUpdate]);

  /**
   * Set pan with bounds clamping (Phase 8B-3: rotation-aware)
   */
  const setPan = useCallback(
    (newPanX, newPanY) => {
      const dimensions = getImageDimensions();
      if (!dimensions) return;

      const { canvasWidth, canvasHeight, imageWidth, imageHeight } = dimensions;

      // Calculate pan bounds (rotation-aware)
      const bounds = calculatePanBoundsWithRotation(
        canvasWidth,
        canvasHeight,
        imageWidth,
        imageHeight,
        transform.zoom,
        transform.rotation
      );

      // Clamp pan to bounds
      const clampedPan = clampPan(newPanX, newPanY, bounds);

      setTransform((prev) => ({
        ...prev,
        panX: clampedPan.panX,
        panY: clampedPan.panY,
      }));
    },
    [transform.zoom, transform.rotation, getImageDimensions]
  );

  /**
   * Reset zoom and pan to defaults
   */
  const resetTransform = useCallback(() => {
    setTransform(createInitialTransform());
  }, []);

  /**
   * Rotate clockwise by 90 degrees (Phase 8B-3)
   */
  const rotateClockwise = useCallback(() => {
    setTransform((prev) => ({
      ...prev,
      rotation: normalizeRotation(prev.rotation + 90),
      // Reset pan to center after rotation
      panX: 0,
      panY: 0,
      // Reset zoom to 1 to auto-fit rotated image
      zoom: 1.0,
    }));
  }, []);

  /**
   * Rotate counter-clockwise by 90 degrees (Phase 8B-3)
   */
  const rotateCounterClockwise = useCallback(() => {
    setTransform((prev) => ({
      ...prev,
      rotation: normalizeRotation(prev.rotation - 90),
      // Reset pan to center after rotation
      panX: 0,
      panY: 0,
      // Reset zoom to 1 to auto-fit rotated image
      zoom: 1.0,
    }));
  }, []);

  /**
   * Flip horizontal (Phase 8B-3)
   */
  const flipHorizontal = useCallback(() => {
    setTransform((prev) => ({
      ...prev,
      flipX: !prev.flipX,
    }));
  }, []);

  /**
   * Flip vertical (Phase 8B-3)
   */
  const flipVertical = useCallback(() => {
    setTransform((prev) => ({
      ...prev,
      flipY: !prev.flipY,
    }));
  }, []);

  /**
   * Set individual adjust value (Phase 8C-1)
   * @param {string} key - Adjust key (brightness, contrast, etc.)
   * @param {number} value - Adjust value
   */
  const setAdjustValue = useCallback((key, value) => {
    setTransform((prev) => ({
      ...prev,
      adjust: {
        ...prev.adjust,
        [key]: value,
      },
    }));
  }, []);

  /**
   * Reset all adjust values to defaults (Phase 8C-1)
   */
  const resetAdjustValues = useCallback(() => {
    setTransform((prev) => ({
      ...prev,
      adjust: {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        warmth: 0,
        highlights: 0,
        shadows: 0,
        clarity: 0,
        blur: 0,
        vignette: 0,
      },
    }));
  }, []);

  /**
   * Get current adjust state (Phase 8C-1)
   */
  const getAdjustState = useCallback(() => {
    return transform.adjust;
  }, [transform.adjust]);

  /**
   * Apply crop (Phase 8C-3)
   * Converts normalized crop rect to pixel coordinates and switches to crop mode
   * Resets transform to zoom=1, pan=0 for clean crop view
   *
   * @param {Object} cropRect - Normalized crop rect { x1, y1, x2, y2 } in 0-1 space
   */
  const applyCrop = useCallback((cropRect) => {
    const image = imageRef.current;
    if (!image) {
      console.warn('Cannot apply crop: no image loaded');
      return;
    }

    // Convert normalized crop rect to pixel coordinates
    const cropBox = getEffectiveCropBox(cropRect, {
      width: image.naturalWidth,
      height: image.naturalHeight,
    });

    if (!cropBox) {
      console.warn('Invalid crop rect:', cropRect);
      return;
    }

    console.log('Applying crop');

    // Set crop box
    setAppliedCropBox(cropBox);

    // Reset transform to clean state (zoom=1, pan=0)
    setTransform((prev) => ({
      ...prev,
      zoom: 1.0,
      panX: 0,
      panY: 0,
    }));
  }, []);

  /**
   * Clear crop (Phase 8C-3)
   * Returns to normal transform mode
   */
  const clearCrop = useCallback(() => {
    console.log('Clearing crop');
    setAppliedCropBox(null);
  }, []);

  /**
   * Get current applied crop box (Phase 8C-3)
   * @returns {Object|null} Crop box in pixels or null
   */
  const getAppliedCrop = useCallback(() => {
    return appliedCropBox;
  }, [appliedCropBox]);

  /**
   * Get image size (Phase 8C-3)
   * @returns {Object|null} { width, height } in natural pixels or null
   */
  const getImageSize = useCallback(() => {
    const image = imageRef.current;
    if (!image) return null;

    return {
      width: image.naturalWidth,
      height: image.naturalHeight,
    };
  }, []);

  /**
   * Handle mouse wheel zoom
   */
  const handleWheel = useCallback(
    (e) => {
      e.preventDefault();

      const rect = canvasRef.current.getBoundingClientRect();
      const pointerX = e.clientX - rect.left - rect.width / 2;
      const pointerY = e.clientY - rect.top - rect.height / 2;

      // Calculate zoom delta (negative deltaY = zoom in)
      const delta = -e.deltaY * 0.001;
      const newZoom = transform.zoom + delta;

      setZoom(newZoom, pointerX, pointerY);
    },
    [transform.zoom, setZoom]
  );

  /**
   * Handle mouse down (start drag)
   */
  const handleMouseDown = useCallback(
    (e) => {
      // Only allow drag when zoomed in
      if (transform.zoom <= 1) return;

      isDraggingRef.current = true;
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        panX: transform.panX,
        panY: transform.panY,
      };
    },
    [transform]
  );

  /**
   * Handle mouse move (drag pan)
   */
  const handleMouseMove = useCallback(
    (e) => {
      if (!isDraggingRef.current) return;

      const deltaX = e.clientX - dragStartRef.current.x;
      const deltaY = e.clientY - dragStartRef.current.y;

      setPan(
        dragStartRef.current.panX + deltaX,
        dragStartRef.current.panY + deltaY
      );
    },
    [setPan]
  );

  /**
   * Handle mouse up (end drag)
   */
  const handleMouseUp = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  /**
   * Handle touch start (drag or pinch)
   */
  const handleTouchStart = useCallback(
    (e) => {
      if (e.touches.length === 1) {
        // Single touch - pan
        if (transform.zoom > 1) {
          isDraggingRef.current = true;
          dragStartRef.current = {
            x: e.touches[0].clientX,
            y: e.touches[0].clientY,
            panX: transform.panX,
            panY: transform.panY,
          };
        }
      } else if (e.touches.length === 2) {
        // Two touches - pinch zoom
        e.preventDefault();
        const distance = getTouchDistance(e.touches[0], e.touches[1]);
        pinchStartRef.current = {
          distance,
          zoom: transform.zoom,
        };
      }
    },
    [transform]
  );

  /**
   * Handle touch move (drag or pinch)
   */
  const handleTouchMove = useCallback(
    (e) => {
      if (e.touches.length === 1 && isDraggingRef.current) {
        // Single touch drag
        e.preventDefault();
        const deltaX = e.touches[0].clientX - dragStartRef.current.x;
        const deltaY = e.touches[0].clientY - dragStartRef.current.y;

        setPan(
          dragStartRef.current.panX + deltaX,
          dragStartRef.current.panY + deltaY
        );
      } else if (e.touches.length === 2) {
        // Pinch zoom
        e.preventDefault();

        const distance = getTouchDistance(e.touches[0], e.touches[1]);
        const scale = distance / pinchStartRef.current.distance;
        const newZoom = pinchStartRef.current.zoom * scale;

        // Get pinch center point
        const rect = canvasRef.current.getBoundingClientRect();
        const midpoint = getTouchMidpoint(e.touches[0], e.touches[1]);
        const pointerX = midpoint.x - rect.left - rect.width / 2;
        const pointerY = midpoint.y - rect.top - rect.height / 2;

        setZoom(newZoom, pointerX, pointerY);
      }
    },
    [setPan, setZoom]
  );

  /**
   * Handle touch end
   */
  const handleTouchEnd = useCallback(() => {
    isDraggingRef.current = false;
  }, []);

  /**
   * Handle window resize with debounce via requestAnimationFrame
   */
  const handleResize = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      render();
    });
  }, [render]);

  /**
   * Load and render image when photo changes
   */
  useEffect(() => {
    if (!photo || !photo.url) {
      imageRef.current = null;
      return;
    }

    console.log('📸 Loading image:', photo.url);

    let cancelled = false;

    loadImage(photo.url)
      .then((img) => {
        if (cancelled) return;

        imageRef.current = img;
        render();

        console.log('Image loaded:', img.naturalWidth + 'x' + img.naturalHeight);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('❌ Failed to load image:', err);
      });

    return () => {
      cancelled = true;
    };
  }, [photo, render]);

  /**
   * Re-render when transform changes
   */
  useEffect(() => {
    if (imageRef.current) {
      render();
    }
  }, [transform, externalTransform, render]);

  /**
   * Handle resize events
   */
  useEffect(() => {
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [handleResize]);

  /**
   * Add mouse/touch event listeners to canvas
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Mouse events
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('mousedown', handleMouseDown);

    // Touch events
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleWheel, handleMouseDown, handleTouchStart, handleTouchMove, handleTouchEnd]);

  /**
   * Add global mouse listeners for drag
   */
  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  /**
   * Initialize canvas context on mount
   */
  useEffect(() => {
    if (canvasRef.current) {
      initCanvasContext(canvasRef.current);
    }
  }, []);

  return {
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
  };
};

export default useCanvasRenderer;
