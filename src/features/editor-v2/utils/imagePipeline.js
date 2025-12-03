// src/features/editor-v2/utils/imagePipeline.js

/**
 * Unified pipeline for rendering full image with all transforms, adjustments, and crop
 * Used by both viewport preview and final commit
 */

/**
 * Render full pipeline to an offscreen canvas and return dataURL
 * @param {object} options - Pipeline options
 * @param {string} options.imageUrl - Source image URL
 * @param {object} options.crop - Crop state {isActive, rect: {x1, y1, x2, y2}}
 * @param {object} options.transform - Transform state {rotate, flipH, flipV}
 * @param {object} options.adjust - Adjust state {brightness, contrast, saturation, warmth}
 * @param {object} options.filter - Filter state {name, intensity}
 * @param {string} options.mimeType - Output MIME type (default: 'image/jpeg')
 * @param {number} options.quality - JPEG quality 0-1 (default: 0.92)
 * @returns {Promise<string>} - DataURL of rendered image
 */
export async function renderFullPipelineToDataUrl({
  imageUrl,
  crop = { isActive: false, rect: null },
  transform = { rotate: 0, flipH: false, flipV: false },
  adjust = { brightness: 0, contrast: 0, saturation: 0, warmth: 0 },
  filter = { name: null, intensity: 1 },
  mimeType = 'image/jpeg',
  quality = 0.92,
}) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      try {
        // Determine canvas dimensions based on rotation
        let canvasWidth = img.width;
        let canvasHeight = img.height;

        // Swap dimensions for 90° and 270° rotations
        if (transform.rotate === 90 || transform.rotate === 270) {
          [canvasWidth, canvasHeight] = [canvasHeight, canvasWidth];
        }

        // If crop is active, adjust output dimensions
        let finalWidth = canvasWidth;
        let finalHeight = canvasHeight;

        if (crop.isActive && crop.rect) {
          const { x1, y1, x2, y2 } = crop.rect;
          finalWidth = Math.round((x2 - x1) * canvasWidth);
          finalHeight = Math.round((y2 - y1) * canvasHeight);
        }

        // Create offscreen canvas
        const canvas = document.createElement('canvas');
        canvas.width = finalWidth;
        canvas.height = finalHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }

        // Build CSS filter string from adjust values
        const { brightness = 0, contrast = 0, saturation = 0, warmth = 0 } = adjust;
        const brightnessPct = 100 + brightness;
        const contrastPct = 100 + contrast;
        const saturatePct = 100 + saturation;
        const sepiaPct = warmth > 0 ? warmth : 0;

        let filterString = `brightness(${brightnessPct}%) contrast(${contrastPct}%) saturate(${saturatePct}%) sepia(${sepiaPct}%)`;

        // Add filter preset if active
        if (filter?.name) {
          switch (filter.name) {
            case 'warm':
              filterString += ' sepia(20%) saturate(120%)';
              break;
            case 'cool':
              filterString += ' hue-rotate(180deg) saturate(110%)';
              break;
            case 'film':
              filterString += ' contrast(90%) brightness(110%)';
              break;
            case 'noir':
              filterString += ' grayscale(100%) contrast(120%)';
              break;
            case 'fade':
              filterString += ' opacity(80%) brightness(110%)';
              break;
            case 'punch':
              filterString += ' contrast(135%) saturate(130%)';
              break;
            default:
              break;
          }
        }

        // Apply filter
        ctx.filter = filterString;

        // Apply transforms and draw
        ctx.save();

        // If crop is active, we need to handle transforms differently
        if (crop.isActive && crop.rect) {
          // For cropped images, apply transform to the full rotated canvas first
          // then extract the crop region

          // Create temporary canvas for full transform
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = canvasWidth;
          tempCanvas.height = canvasHeight;
          const tempCtx = tempCanvas.getContext('2d');

          if (!tempCtx) {
            reject(new Error('Failed to get temp canvas context'));
            return;
          }

          // Apply filter to temp canvas
          tempCtx.filter = filterString;
          tempCtx.save();
          tempCtx.translate(canvasWidth / 2, canvasHeight / 2);
          tempCtx.rotate((transform.rotate * Math.PI) / 180);
          tempCtx.scale(transform.flipH ? -1 : 1, transform.flipV ? -1 : 1);
          tempCtx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);
          tempCtx.restore();

          // Extract crop region from temp canvas
          const { x1, y1 } = crop.rect;
          const cropX = Math.round(x1 * canvasWidth);
          const cropY = Math.round(y1 * canvasHeight);

          ctx.drawImage(
            tempCanvas,
            cropX, cropY, finalWidth, finalHeight,
            0, 0, finalWidth, finalHeight
          );
        } else {
          // No crop, just apply transforms
          ctx.translate(finalWidth / 2, finalHeight / 2);
          ctx.rotate((transform.rotate * Math.PI) / 180);
          ctx.scale(transform.flipH ? -1 : 1, transform.flipV ? -1 : 1);
          ctx.drawImage(img, -img.width / 2, -img.height / 2, img.width, img.height);
        }

        ctx.restore();
        ctx.filter = 'none';

        // Convert to dataURL
        const dataUrl = canvas.toDataURL(mimeType, quality);
        resolve(dataUrl);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = imageUrl;
  });
}
