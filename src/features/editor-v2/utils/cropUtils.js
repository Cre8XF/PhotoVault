// src/features/editor-v2/utils/cropUtils.js

/**
 * Apply normalized crop to an image
 * @param {string} imageUrl - Source image URL
 * @param {object} rect - Normalized crop rect { x1, y1, x2, y2 } (0-1)
 * @returns {Promise<string>} - DataURL of cropped image
 */
export const applyNormalizedCropToImage = (imageUrl, rect) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const { x1, y1, x2, y2 } = rect;

      // Convert normalized coordinates to pixel coordinates
      const cropX = x1 * img.width;
      const cropY = y1 * img.height;
      const cropW = (x2 - x1) * img.width;
      const cropH = (y2 - y1) * img.height;

      // Create canvas with crop dimensions
      const canvas = document.createElement('canvas');
      canvas.width = cropW;
      canvas.height = cropH;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Draw cropped portion
      ctx.drawImage(
        img,
        cropX, cropY, cropW, cropH,  // Source rect
        0, 0, cropW, cropH            // Dest rect
      );

      // Convert to dataURL
      const dataUrl = canvas.toDataURL('image/png');
      resolve(dataUrl);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = imageUrl;
  });
};
