// ============================================================================
// Image Processor - Phase 7A: Canvas-based image processing
// ============================================================================

import { applyCrop } from './cropUtils';

/**
 * Process image with transforms and crop
 * @param {string} imageUrl - Source image URL
 * @param {Object} transform - Transform parameters
 * @returns {Promise<{canvas: HTMLCanvasElement, blob: Blob}>}
 */
export const processImageWithTransforms = async (imageUrl, transform) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = async () => {
      try {
        // Create canvas with original image
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          throw new Error('Failed to get canvas context');
        }

        // Apply rotation first
        const rotation = transform.rotate || 0;
        if (rotation !== 0) {
          // Adjust canvas size for rotation
          if (rotation === 90 || rotation === 270) {
            canvas.width = img.height;
            canvas.height = img.width;
          }

          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.drawImage(img, -img.width / 2, -img.height / 2);
          ctx.restore();
        } else {
          ctx.drawImage(img, 0, 0);
        }

        // Apply flip transformations
        if (transform.flipH || transform.flipV) {
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = canvas.width;
          tempCanvas.height = canvas.height;
          const tempCtx = tempCanvas.getContext('2d');

          tempCtx.save();
          tempCtx.scale(transform.flipH ? -1 : 1, transform.flipV ? -1 : 1);
          tempCtx.drawImage(
            canvas,
            transform.flipH ? -canvas.width : 0,
            transform.flipV ? -canvas.height : 0
          );
          tempCtx.restore();

          // Copy back to main canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(tempCanvas, 0, 0);
        }

        // Apply crop if specified
        let finalCanvas = canvas;
        if (transform.crop) {
          // Scale crop coordinates to actual image dimensions
          const scaleX = canvas.width / img.naturalWidth;
          const scaleY = canvas.height / img.naturalHeight;

          const scaledCrop = {
            x: Math.round(transform.crop.x * scaleX),
            y: Math.round(transform.crop.y * scaleY),
            width: Math.round(transform.crop.width * scaleX),
            height: Math.round(transform.crop.height * scaleY),
          };

          // Constrain crop to canvas bounds
          scaledCrop.x = Math.max(0, Math.min(scaledCrop.x, canvas.width - 1));
          scaledCrop.y = Math.max(0, Math.min(scaledCrop.y, canvas.height - 1));
          scaledCrop.width = Math.min(scaledCrop.width, canvas.width - scaledCrop.x);
          scaledCrop.height = Math.min(scaledCrop.height, canvas.height - scaledCrop.y);

          finalCanvas = applyCrop(canvas, scaledCrop);
        }

        // Convert to blob
        finalCanvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ canvas: finalCanvas, blob });
            } else {
              reject(new Error('Failed to create blob from canvas'));
            }
          },
          'image/jpeg',
          0.92 // Quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = imageUrl;
  });
};

/**
 * Upload processed image to Firebase Storage
 * @param {Blob} blob - Image blob
 * @param {string} fileName - File name
 * @param {string} userId - User ID
 * @returns {Promise<string>} - Download URL
 */
export const uploadProcessedImage = async (blob, fileName, userId) => {
  // This will be implemented when we integrate with Firebase Storage
  // For now, we'll use the non-destructive approach (storing transform metadata)
  console.log('Upload processed image:', fileName, userId);
  return null;
};
