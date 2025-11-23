/**
 * ImageLayer - Phase 8: EditorViewport Rebuild
 *
 * Renders the image with GPU-accelerated transforms
 * - Draws actual image pixels
 * - Applies position, zoom, pan, rotation, flip
 * - Uses CSS transform for all geometry
 * - Never depends on flexbox
 */

import React, { useMemo } from 'react';
import { buildImageTransform, buildFilterString } from './transforms';

const ImageLayer = ({
  photo,
  imageRect,
  viewportRect,
  transform,
  onImageLoad,
}) => {
  // Calculate image position (centered in viewport)
  const imageStyle = useMemo(() => {
    if (!imageRect || !viewportRect) return {};

    const { width: imgWidth, height: imgHeight } = imageRect;
    const { width: vpWidth, height: vpHeight } = viewportRect;

    // Center point of viewport
    const centerX = vpWidth / 2;
    const centerY = vpHeight / 2;

    // Position image so its center aligns with viewport center
    const left = centerX - (imgWidth / 2);
    const top = centerY - (imgHeight / 2);

    // Build CSS transform
    const cssTransform = buildImageTransform({
      translateX: transform.translateX,
      translateY: transform.translateY,
      scale: transform.scale,
      rotate: transform.rotate,
    });

    // Build CSS filter
    const cssFilter = buildFilterString({
      brightness: transform.brightness,
      contrast: transform.contrast,
      saturation: transform.saturation,
      blur: transform.blur,
    });

    return {
      position: 'absolute',
      left: `${left}px`,
      top: `${top}px`,
      width: `${imgWidth}px`,
      height: `${imgHeight}px`,
      transform: cssTransform,
      filter: cssFilter,
      transformOrigin: 'center center',
      willChange: 'transform, filter',
    };
  }, [imageRect, viewportRect, transform]);

  if (!photo) return null;

  return (
    <div className="viewport-image-layer">
      <img
        src={photo.url}
        alt={photo.name || 'Photo'}
        className="viewport-image"
        style={imageStyle}
        onLoad={onImageLoad}
        draggable={false}
      />
    </div>
  );
};

export default ImageLayer;
