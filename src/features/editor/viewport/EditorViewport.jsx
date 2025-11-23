/**
 * EditorViewport - Phase 8: Core Viewport Engine
 *
 * Master viewport container that orchestrates:
 * - ImageLayer (renders photo with transforms)
 * - CropLayer (interactive crop overlay)
 * - GestureLayer (input handling)
 *
 * This is the SINGLE SOURCE OF TRUTH for:
 * - Viewport geometry
 * - Image geometry
 * - Transform state
 * - Crop state
 *
 * Behavior: Google Photos / Snapseed style
 * - Image always visible
 * - Stable coordinate system
 * - Perfect zoom, pan, rotate
 * - No flexbox dependencies
 */

import React, { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import ImageLayer from './ImageLayer';
import CropLayer from './CropLayer';
import GestureLayer from './GestureLayer';
import {
  calculateFitScale,
  calculateCenterPosition,
  constrainPan,
  calculateAspectRatioCrop,
} from './mathUtils';
import { createInitialTransform } from './transforms';
import './viewport.css';

const EditorViewport = forwardRef(({
  photo,
  activeMode = 'none',
  editorTransform = {},
  onTransformChange,
  debug = false,
}, ref) => {
  const containerRef = useRef(null);
  const [viewportRect, setViewportRect] = useState(null);
  const [imageRect, setImageRect] = useState(null);
  const [imageBounds, setImageBounds] = useState(null);
  const [transform, setTransform] = useState(createInitialTransform());
  const [cropRect, setCropRect] = useState(null);
  const imageElementRef = useRef(null);

  // ============================================================================
  // VIEWPORT GEOMETRY
  // ============================================================================

  // Measure viewport dimensions
  const updateViewportRect = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setViewportRect({
        x: 0,
        y: 0,
        width: rect.width,
        height: rect.height,
      });
    }
  }, []);

  // Initialize viewport on mount and window resize
  useEffect(() => {
    updateViewportRect();

    window.addEventListener('resize', updateViewportRect);
    return () => window.removeEventListener('resize', updateViewportRect);
  }, [updateViewportRect]);

  // ============================================================================
  // IMAGE GEOMETRY
  // ============================================================================

  // Handle image load - calculate fit-to-viewport
  const handleImageLoad = useCallback((e) => {
    const img = e.target;
    const naturalWidth = img.naturalWidth;
    const naturalHeight = img.naturalHeight;

    if (!viewportRect || naturalWidth === 0 || naturalHeight === 0) return;

    // Calculate scale to fit image in viewport
    const fitScale = calculateFitScale(
      naturalWidth,
      naturalHeight,
      viewportRect.width,
      viewportRect.height
    );

    // Calculate displayed dimensions
    const displayWidth = naturalWidth * fitScale;
    const displayHeight = naturalHeight * fitScale;

    // Store image rect (in natural pixels)
    setImageRect({
      naturalWidth,
      naturalHeight,
      width: displayWidth,
      height: displayHeight,
      fitScale,
    });

    // Calculate image bounds in viewport coordinates
    const centerPos = calculateCenterPosition(
      displayWidth,
      displayHeight,
      viewportRect.width,
      viewportRect.height,
      1 // scale is 1 at this point
    );

    setImageBounds({
      x: centerPos.x,
      y: centerPos.y,
      width: displayWidth,
      height: displayHeight,
    });

    // Initialize transform
    setTransform(createInitialTransform());

    console.log('✅ EditorViewport: Image loaded', {
      natural: `${naturalWidth}x${naturalHeight}`,
      display: `${displayWidth}x${displayHeight}`,
      fitScale,
    });
  }, [viewportRect]);

  // Update image bounds when transform changes
  useEffect(() => {
    if (!imageRect || !viewportRect) return;

    const { width, height } = imageRect;
    const { width: vpWidth, height: vpHeight } = viewportRect;

    // Center position
    const centerX = vpWidth / 2;
    const centerY = vpHeight / 2;

    // Image position (before transform)
    const imageX = centerX - (width / 2);
    const imageY = centerY - (height / 2);

    // Update bounds (accounts for current transform)
    setImageBounds({
      x: imageX + transform.translateX,
      y: imageY + transform.translateY,
      width: width * transform.scale,
      height: height * transform.scale,
    });
  }, [imageRect, viewportRect, transform]);

  // ============================================================================
  // TRANSFORM MANAGEMENT
  // ============================================================================

  // Apply editor transforms (from store)
  useEffect(() => {
    if (!editorTransform) return;

    setTransform((prev) => ({
      ...prev,
      rotate: editorTransform.rotate || 0,
      flipH: editorTransform.flipH || false,
      flipV: editorTransform.flipV || false,
      brightness: editorTransform.brightness || 0,
      contrast: editorTransform.contrast || 0,
      saturation: editorTransform.saturation || 0,
      blur: editorTransform.blur || 0,
    }));
  }, [editorTransform]);

  // Handle zoom
  const handleZoom = useCallback(
    (newZoom, pointerX, pointerY) => {
      if (!imageRect || !viewportRect) return;

      const clampedZoom = Math.max(0.5, Math.min(3, newZoom));

      setTransform((prev) => {
        // Calculate zoom around pointer
        const scaleDelta = clampedZoom - prev.scale;

        // Adjust pan to zoom around pointer
        const centerX = viewportRect.width / 2;
        const centerY = viewportRect.height / 2;
        const offsetX = pointerX - centerX;
        const offsetY = pointerY - centerY;

        let newTranslateX = prev.translateX - (offsetX * scaleDelta);
        let newTranslateY = prev.translateY - (offsetY * scaleDelta);

        // Constrain pan
        const constrained = constrainPan(
          newTranslateX,
          newTranslateY,
          imageRect.width,
          imageRect.height,
          viewportRect.width,
          viewportRect.height,
          clampedZoom
        );

        return {
          ...prev,
          scale: clampedZoom,
          translateX: constrained.x,
          translateY: constrained.y,
        };
      });
    },
    [imageRect, viewportRect]
  );

  // Handle pan
  const handlePan = useCallback(
    (deltaX, deltaY) => {
      if (!imageRect || !viewportRect) return;

      setTransform((prev) => {
        let newTranslateX = prev.translateX + deltaX;
        let newTranslateY = prev.translateY + deltaY;

        // Constrain pan
        const constrained = constrainPan(
          newTranslateX,
          newTranslateY,
          imageRect.width,
          imageRect.height,
          viewportRect.width,
          viewportRect.height,
          prev.scale
        );

        return {
          ...prev,
          translateX: constrained.x,
          translateY: constrained.y,
        };
      });
    },
    [imageRect, viewportRect]
  );

  // Handle double-tap (smart zoom)
  const handleDoubleTap = useCallback(
    (tapX, tapY) => {
      setTransform((prev) => {
        // Toggle between 1x and 2x
        const newZoom = prev.scale > 1 ? 1 : 2;

        if (newZoom === 1) {
          // Reset to center
          return {
            ...prev,
            scale: 1,
            translateX: 0,
            translateY: 0,
          };
        } else {
          // Zoom to tap point
          const centerX = viewportRect.width / 2;
          const centerY = viewportRect.height / 2;
          const offsetX = tapX - centerX;
          const offsetY = tapY - centerY;

          return {
            ...prev,
            scale: newZoom,
            translateX: -offsetX,
            translateY: -offsetY,
          };
        }
      });
    },
    [viewportRect]
  );

  // ============================================================================
  // CROP MANAGEMENT
  // ============================================================================

  // Initialize crop when entering crop mode
  useEffect(() => {
    if (activeMode === 'crop' && !cropRect && imageBounds) {
      // Default crop: 80% of image, centered
      const cropWidth = imageBounds.width * 0.8;
      const cropHeight = imageBounds.height * 0.8;
      const cropX = imageBounds.x + (imageBounds.width - cropWidth) / 2;
      const cropY = imageBounds.y + (imageBounds.height - cropHeight) / 2;

      setCropRect({
        x: cropX,
        y: cropY,
        width: cropWidth,
        height: cropHeight,
      });

      console.log('✅ EditorViewport: Initialized crop', { x: cropX, y: cropY, width: cropWidth, height: cropHeight });
    }
  }, [activeMode, cropRect, imageBounds]);

  // Handle crop change
  const handleCropChange = useCallback((newCropRect) => {
    setCropRect(newCropRect);

    if (onTransformChange) {
      onTransformChange({ crop: newCropRect });
    }
  }, [onTransformChange]);

  // ============================================================================
  // PUBLIC API (exposed via ref)
  // ============================================================================

  useImperativeHandle(ref, () => ({
    getTransforms: () => transform,
    applyTransforms: (newTransforms) => {
      setTransform((prev) => ({ ...prev, ...newTransforms }));
    },
    applyCrop: (newCropRect) => {
      setCropRect(newCropRect);
    },
    getCropResult: () => {
      if (!cropRect || !imageRect) return null;

      // Convert viewport crop to image coordinates
      const scaleRatio = imageRect.naturalWidth / imageRect.width;

      return {
        x: (cropRect.x - imageBounds.x) * scaleRatio,
        y: (cropRect.y - imageBounds.y) * scaleRatio,
        width: cropRect.width * scaleRatio,
        height: cropRect.height * scaleRatio,
      };
    },
    resetView: () => {
      setTransform(createInitialTransform());
      setCropRect(null);
    },
    setAspectRatio: (ratio) => {
      if (!imageRect || !imageBounds) return;

      const newCrop = calculateAspectRatioCrop(
        imageBounds.width,
        imageBounds.height,
        ratio
      );

      setCropRect({
        x: imageBounds.x + newCrop.x,
        y: imageBounds.y + newCrop.y,
        width: newCrop.width,
        height: newCrop.height,
      });
    },
  }), [transform, cropRect, imageRect, imageBounds]);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div ref={containerRef} className="editor-viewport">
      {/* Image Layer */}
      <ImageLayer
        photo={photo}
        imageRect={imageRect}
        viewportRect={viewportRect}
        transform={transform}
        onImageLoad={handleImageLoad}
      />

      {/* Crop Layer */}
      {activeMode === 'crop' && (
        <CropLayer
          cropRect={cropRect}
          imageBounds={imageBounds}
          aspectRatio={editorTransform.crop?.aspectRatio || null}
          onCropChange={handleCropChange}
          enabled={true}
        />
      )}

      {/* Gesture Layer */}
      <GestureLayer
        enabled={true}
        mode={activeMode}
        onZoom={handleZoom}
        onPan={handlePan}
        onDoubleTap={handleDoubleTap}
        currentZoom={transform.scale}
        minZoom={0.5}
        maxZoom={3}
      />

      {/* Debug Overlay */}
      {debug && viewportRect && imageRect && (
        <div className="viewport-debug">
          <div>Viewport: {Math.round(viewportRect.width)}x{Math.round(viewportRect.height)}</div>
          <div>Image: {Math.round(imageRect.width)}x{Math.round(imageRect.height)}</div>
          <div>Zoom: {transform.scale.toFixed(2)}x</div>
          <div>Pan: ({Math.round(transform.translateX)}, {Math.round(transform.translateY)})</div>
          <div>Rotate: {transform.rotate}°</div>
          {cropRect && <div>Crop: {Math.round(cropRect.width)}x{Math.round(cropRect.height)}</div>}
        </div>
      )}
    </div>
  );
});

EditorViewport.displayName = 'EditorViewport';

export default EditorViewport;
