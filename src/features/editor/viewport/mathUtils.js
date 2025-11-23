/**
 * Math Utilities for Editor Viewport
 *
 * Pure math functions for viewport geometry calculations
 */

/**
 * Clamp a value between min and max
 */
export const clamp = (value, min, max) => {
  return Math.max(min, Math.min(max, value));
};

/**
 * Calculate fit-to-viewport scale
 * Returns the scale factor to fit image inside viewport
 */
export const calculateFitScale = (imageWidth, imageHeight, viewportWidth, viewportHeight) => {
  const scaleX = viewportWidth / imageWidth;
  const scaleY = viewportHeight / imageHeight;

  // Use the smaller scale to ensure entire image fits
  return Math.min(scaleX, scaleY);
};

/**
 * Calculate center position for image in viewport
 */
export const calculateCenterPosition = (imageWidth, imageHeight, viewportWidth, viewportHeight, scale) => {
  const scaledWidth = imageWidth * scale;
  const scaledHeight = imageHeight * scale;

  return {
    x: (viewportWidth - scaledWidth) / 2,
    y: (viewportHeight - scaledHeight) / 2,
  };
};

/**
 * Constrain pan to keep image visible
 * Ensures at least 10% of image is visible in viewport
 */
export const constrainPan = (panX, panY, imageWidth, imageHeight, viewportWidth, viewportHeight, scale) => {
  const scaledWidth = imageWidth * scale;
  const scaledHeight = imageHeight * scale;

  // Calculate bounds - allow 90% of image to go off-screen
  const maxPanX = scaledWidth * 0.9;
  const minPanX = -(scaledWidth * 0.9) + viewportWidth;
  const maxPanY = scaledHeight * 0.9;
  const minPanY = -(scaledHeight * 0.9) + viewportHeight;

  return {
    x: clamp(panX, minPanX, maxPanX),
    y: clamp(panY, minPanY, maxPanY),
  };
};

/**
 * Convert viewport coordinates to image coordinates
 */
export const viewportToImageCoords = (viewportX, viewportY, imageX, imageY, scale) => {
  return {
    x: (viewportX - imageX) / scale,
    y: (viewportY - imageY) / scale,
  };
};

/**
 * Convert image coordinates to viewport coordinates
 */
export const imageToViewportCoords = (imageX, imageY, viewportOriginX, viewportOriginY, scale) => {
  return {
    x: imageX * scale + viewportOriginX,
    y: imageY * scale + viewportOriginY,
  };
};

/**
 * Calculate rect after rotation
 * Returns new dimensions when rotating by angle (in degrees)
 */
export const rotateRect = (width, height, angle) => {
  const rad = (angle * Math.PI) / 180;
  const cos = Math.abs(Math.cos(rad));
  const sin = Math.abs(Math.sin(rad));

  return {
    width: width * cos + height * sin,
    height: width * sin + height * cos,
  };
};

/**
 * Constrain crop rect within image bounds
 */
export const constrainCropRect = (cropRect, imageBounds) => {
  const minSize = 50;

  let { x, y, width, height } = cropRect;

  // Ensure minimum size
  width = Math.max(minSize, width);
  height = Math.max(minSize, height);

  // Constrain to image bounds
  x = clamp(x, imageBounds.x, imageBounds.x + imageBounds.width - width);
  y = clamp(y, imageBounds.y, imageBounds.y + imageBounds.height - height);

  // Ensure dimensions don't exceed image
  width = Math.min(width, imageBounds.width);
  height = Math.min(height, imageBounds.height);

  return { x, y, width, height };
};

/**
 * Calculate crop rect for aspect ratio
 */
export const calculateAspectRatioCrop = (imageWidth, imageHeight, aspectRatio) => {
  let width, height;

  const imageRatio = imageWidth / imageHeight;

  if (aspectRatio > imageRatio) {
    // Aspect ratio is wider than image
    width = imageWidth;
    height = width / aspectRatio;
  } else {
    // Aspect ratio is taller than image
    height = imageHeight;
    width = height * aspectRatio;
  }

  // Center the crop
  const x = (imageWidth - width) / 2;
  const y = (imageHeight - height) / 2;

  return { x, y, width, height };
};

/**
 * Get distance between two points
 */
export const getDistance = (x1, y1, x2, y2) => {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
};

/**
 * Get midpoint between two points
 */
export const getMidpoint = (x1, y1, x2, y2) => {
  return {
    x: (x1 + x2) / 2,
    y: (y1 + y2) / 2,
  };
};
