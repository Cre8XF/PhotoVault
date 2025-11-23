/**
 * useCanvasRenderer - Phase 8B-1
 *
 * React hook for canvas rendering lifecycle
 * - Auto-sizes canvas to container
 * - Handles window resize
 * - Handles device rotation
 * - HiDPI support
 * - Image loading and rendering
 */

import { useEffect, useRef, useCallback } from 'react';
import {
  setCanvasSize,
  loadImage,
  drawImageCentered,
  initCanvasContext,
} from '../utils/canvasUtils';

/**
 * useCanvasRenderer Hook
 *
 * @param {Object} photo - Photo object with url
 * @returns {Object} Canvas ref and state
 */
export const useCanvasRenderer = (photo) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const imageRef = useRef(null); // Cached loaded image
  const animationFrameRef = useRef(null);

  /**
   * Render current image to canvas
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

    // Draw image centered (Phase 8B-1: no transforms yet)
    drawImageCentered(ctx, image, width, height);

    console.log('🎨 Canvas rendered:', { width, height, dpr: window.devicePixelRatio });
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

        console.log('✅ Image loaded:', img.naturalWidth, 'x', img.naturalHeight);
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
   * Handle resize events
   */
  useEffect(() => {
    window.addEventListener('resize', handleResize);

    // Also listen for orientation change (mobile)
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
    render, // Expose render for manual re-renders if needed
  };
};

export default useCanvasRenderer;
