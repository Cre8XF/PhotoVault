/**
 * Canvas Rendering Utilities - Phase 8C-1
 *
 * Core canvas rendering functions with HiDPI support
 * Phase 8B-1: Basic canvas rendering
 * Phase 8B-2: Zoom and pan transforms
 * Phase 8B-3: Rotation and flip transforms
 * Phase 8C-1: Adjust filters (brightness, contrast, etc.)
 */

import { buildCanvasAdjustString } from './adjustUtils';

/**
 * Get device pixel ratio for HiDPI displays
 */
export const getDevicePixelRatio = () => {
  return window.devicePixelRatio || 1;
};

/**
 * Set canvas size with DPR scaling
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @param {number} displayWidth - CSS display width in pixels
 * @param {number} displayHeight - CSS display height in pixels
 */
export const setCanvasSize = (canvas, displayWidth, displayHeight) => {
  const dpr = getDevicePixelRatio();

  // Set actual canvas buffer size (scaled by DPR)
  canvas.width = displayWidth * dpr;
  canvas.height = displayHeight * dpr;

  // Set CSS display size
  canvas.style.width = `${displayWidth}px`;
  canvas.style.height = `${displayHeight}px`;

  // Scale context to match DPR
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  return { width: displayWidth, height: displayHeight, dpr };
};

/**
 * Load image from URL
 * @param {string} url - Image URL
 * @returns {Promise<HTMLImageElement>} Loaded image
 */
export const loadImage = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Enable CORS for canvas manipulation

    img.onload = () => resolve(img);
    img.onerror = (err) => reject(new Error(`Failed to load image: ${err}`));

    img.src = url;
  });
};

/**
 * Calculate scale to fit image in container (contain mode)
 * @param {number} imageWidth - Natural image width
 * @param {number} imageHeight - Natural image height
 * @param {number} containerWidth - Container width
 * @param {number} containerHeight - Container height
 * @returns {number} Scale factor
 */
export const calculateFitScale = (imageWidth, imageHeight, containerWidth, containerHeight) => {
  const scaleX = containerWidth / imageWidth;
  const scaleY = containerHeight / imageHeight;

  // Use smaller scale to ensure entire image fits (contain behavior)
  return Math.min(scaleX, scaleY);
};

/**
 * Draw image centered in canvas
 * Phase 8B-1: No transforms, just centered rendering
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {HTMLImageElement} image - Image to draw
 * @param {number} canvasWidth - Canvas display width
 * @param {number} canvasHeight - Canvas display height
 */
export const drawImageCentered = (ctx, image, canvasWidth, canvasHeight) => {
  // Clear canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // Calculate scale to fit image in canvas
  const scale = calculateFitScale(
    image.naturalWidth,
    image.naturalHeight,
    canvasWidth,
    canvasHeight
  );

  // Calculate scaled dimensions
  const scaledWidth = image.naturalWidth * scale;
  const scaledHeight = image.naturalHeight * scale;

  // Calculate position to center image
  const x = (canvasWidth - scaledWidth) / 2;
  const y = (canvasHeight - scaledHeight) / 2;

  // Enable smooth rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Draw image
  ctx.drawImage(
    image,
    0, 0, image.naturalWidth, image.naturalHeight, // Source rectangle
    x, y, scaledWidth, scaledHeight                // Destination rectangle
  );
};

/**
 * Draw image with transforms (Phase 8B-2)
 * Applies zoom and pan transforms
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {HTMLImageElement} image - Image to draw
 * @param {number} canvasWidth - Canvas display width
 * @param {number} canvasHeight - Canvas display height
 * @param {Object} transform - Transform state { zoom, panX, panY }
 */
export const drawImageWithTransform = (ctx, image, canvasWidth, canvasHeight, transform) => {
  const { zoom = 1, panX = 0, panY = 0 } = transform;

  // Clear canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // Calculate base scale to fit image in canvas
  const fitScale = calculateFitScale(
    image.naturalWidth,
    image.naturalHeight,
    canvasWidth,
    canvasHeight
  );

  // Calculate scaled dimensions at zoom level 1
  const baseWidth = image.naturalWidth * fitScale;
  const baseHeight = image.naturalHeight * fitScale;

  // Apply zoom
  const scaledWidth = baseWidth * zoom;
  const scaledHeight = baseHeight * zoom;

  // Calculate center position
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  // Calculate position with pan offset
  const x = centerX - (scaledWidth / 2) + panX;
  const y = centerY - (scaledHeight / 2) + panY;

  // Enable smooth rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Draw image with transforms
  ctx.drawImage(
    image,
    0, 0, image.naturalWidth, image.naturalHeight, // Source rectangle
    x, y, scaledWidth, scaledHeight                // Destination rectangle
  );
};

/**
 * Draw vignette overlay (Phase 8C-4)
 * Applies a radial gradient darkening effect from edges to center
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {number} canvasWidth - Canvas width
 * @param {number} canvasHeight - Canvas height
 * @param {number} vignetteAmount - Vignette intensity (0-100)
 */
export const drawVignetteOverlay = (ctx, canvasWidth, canvasHeight, vignetteAmount) => {
  if (vignetteAmount <= 0) return;

  // Calculate vignette parameters
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;

  // Radius extends to corners for full coverage
  const radius = Math.sqrt(centerX * centerX + centerY * centerY);

  // Inner radius (where fade starts) - smaller = more pronounced vignette
  const innerRadius = radius * (1 - vignetteAmount / 100 * 0.6);

  // Create radial gradient from center to edges
  const gradient = ctx.createRadialGradient(
    centerX, centerY, innerRadius,  // Inner circle (transparent)
    centerX, centerY, radius         // Outer circle (dark)
  );

  // Gradient stops: transparent center → dark edges
  const opacity = vignetteAmount / 100 * 0.7; // Max 70% opacity
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(0.5, `rgba(0, 0, 0, ${opacity * 0.3})`);
  gradient.addColorStop(1, `rgba(0, 0, 0, ${opacity})`);

  // Draw vignette overlay
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
};

/**
 * Draw image with full transforms (Phase 8C-4)
 * Applies rotation, flip, zoom, pan, adjust filters, and vignette overlay
 *
 * Transform order: translate (center) → rotate → flip → scale → pan
 * Filters: Apply adjust filters (brightness, contrast, etc.) + vignette overlay
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {HTMLImageElement} image - Image to draw
 * @param {number} canvasWidth - Canvas display width
 * @param {number} canvasHeight - Canvas display height
 * @param {Object} transform - Transform state { zoom, panX, panY, rotation, flipX, flipY, adjust }
 */
export const drawImageWithFullTransform = (ctx, image, canvasWidth, canvasHeight, transform) => {
  const { zoom = 1, panX = 0, panY = 0, rotation = 0, flipX = false, flipY = false, adjust } = transform;

  // Clear canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // Calculate base scale to fit image in canvas
  const fitScale = calculateFitScale(
    image.naturalWidth,
    image.naturalHeight,
    canvasWidth,
    canvasHeight
  );

  // Calculate scaled dimensions at zoom level 1
  const baseWidth = image.naturalWidth * fitScale;
  const baseHeight = image.naturalHeight * fitScale;

  // Enable smooth rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Apply adjust filters (Phase 8C-1) - excluding vignette
  if (adjust) {
    const filterString = buildCanvasAdjustString(adjust);
    ctx.filter = filterString;
  }

  // Save context state
  ctx.save();

  // 1. Translate to canvas center
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  ctx.translate(centerX, centerY);

  // 2. Apply rotation around center
  if (rotation !== 0) {
    const rotationRadians = (rotation * Math.PI) / 180;
    ctx.rotate(rotationRadians);
  }

  // 3. Apply flip (scale by -1 flips the axis)
  const scaleX = flipX ? -1 : 1;
  const scaleY = flipY ? -1 : 1;
  if (flipX || flipY) {
    ctx.scale(scaleX, scaleY);
  }

  // 4. Apply zoom
  if (zoom !== 1) {
    ctx.scale(zoom, zoom);
  }

  // 5. Apply pan offset
  if (panX !== 0 || panY !== 0) {
    ctx.translate(panX, panY);
  }

  // 6. Draw image centered at origin
  // After all transforms, the origin is where we want the center of the image
  ctx.drawImage(
    image,
    0, 0, image.naturalWidth, image.naturalHeight,  // Source rectangle
    -baseWidth / 2, -baseHeight / 2,                 // Destination position (centered)
    baseWidth, baseHeight                            // Destination size
  );

  // Restore context state (resets transforms and filter)
  ctx.restore();

  // Reset filter explicitly
  ctx.filter = 'none';

  // 7. Apply vignette overlay (Phase 8C-4)
  // Must be drawn AFTER restoring context to avoid transform issues
  if (adjust && adjust.vignette > 0) {
    drawVignetteOverlay(ctx, canvasWidth, canvasHeight, adjust.vignette);
  }
};

/**
 * Initialize GPU-accelerated canvas context
 * @param {HTMLCanvasElement} canvas - Canvas element
 * @returns {CanvasRenderingContext2D} Context with optimal settings
 */
export const initCanvasContext = (canvas) => {
  const ctx = canvas.getContext('2d', {
    alpha: false,           // No transparency needed, better performance
    desynchronized: true,   // Better for animations
  });

  // Enable GPU acceleration
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  return ctx;
};

/**
 * Draw cropped image to canvas (Phase 8C-4)
 * Renders only the selected crop region, centered and scaled to fit canvas
 * No transforms applied - this represents the final cropped result
 *
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {HTMLImageElement} image - Source image
 * @param {number} canvasWidth - Canvas display width
 * @param {number} canvasHeight - Canvas display height
 * @param {Object} cropBox - Crop box in image pixels { x, y, width, height }
 * @param {Object} adjust - Optional adjust filters
 */
export const drawCroppedImageToCanvas = (ctx, image, canvasWidth, canvasHeight, cropBox, adjust = null) => {
  if (!cropBox || cropBox.width < 1 || cropBox.height < 1) {
    console.warn('Invalid crop box:', cropBox);
    return;
  }

  const { x, y, width, height } = cropBox;

  // Clear canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // Calculate scale to fit cropped region in canvas
  const fitScale = calculateFitScale(width, height, canvasWidth, canvasHeight);

  // Calculate scaled dimensions
  const scaledWidth = width * fitScale;
  const scaledHeight = height * fitScale;

  // Calculate position to center cropped image
  const destX = (canvasWidth - scaledWidth) / 2;
  const destY = (canvasHeight - scaledHeight) / 2;

  // Enable smooth rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Apply adjust filters if provided (excluding vignette)
  if (adjust) {
    const filterString = buildCanvasAdjustString(adjust);
    ctx.filter = filterString;
  }

  // Draw only the cropped portion of the image
  // ctx.drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
  ctx.drawImage(
    image,
    x, y, width, height,              // Source rectangle (crop region)
    destX, destY, scaledWidth, scaledHeight  // Destination rectangle (centered)
  );

  // Reset filter
  ctx.filter = 'none';

  // Apply vignette overlay (Phase 8C-4)
  if (adjust && adjust.vignette > 0) {
    drawVignetteOverlay(ctx, canvasWidth, canvasHeight, adjust.vignette);
  }
};
