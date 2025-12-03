// src/features/editor-v2/utils/transformUtils.js

/**
 * Draw image with transforms applied (rotate + flip)
 * @param {CanvasRenderingContext2D} ctx - Canvas context
 * @param {HTMLImageElement} img - Image to draw
 * @param {object} transforms - { rotate, flipH, flipV }
 * @param {number} canvasW - Canvas width
 * @param {number} canvasH - Canvas height
 */
export function drawTransformedImage(ctx, img, transforms, canvasW, canvasH) {
  const { rotate, flipH, flipV } = transforms;

  console.log('[TRANSFORM] drawTransformedImage called with:', {
    rotate,
    rotateType: typeof rotate,
    flipH,
    flipV,
    canvasW,
    canvasH,
    imgW: img.width,
    imgH: img.height
  });

  ctx.save();

  // Move origin to center for rotation
  ctx.translate(canvasW / 2, canvasH / 2);

  // Apply rotation
  const rad = (rotate * Math.PI) / 180;
  console.log('[TRANSFORM] Applying rotation:', { rotate, rad, radiansCalc: `${rotate} * PI / 180 = ${rad}` });
  ctx.rotate(rad);

  // Apply flips
  ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
  console.log('[TRANSFORM] Applied scale for flips:', { flipH, flipV, scaleX: flipH ? -1 : 1, scaleY: flipV ? -1 : 1 });

  // Calculate dimensions based on rotation
  let drawW = img.width;
  let drawH = img.height;

  // Swap dimensions for 90° and 270° rotations
  if (rotate === 90 || rotate === 270) {
    [drawW, drawH] = [drawH, drawW];
    console.log('[TRANSFORM] Swapped dimensions for 90°/270°:', { drawW, drawH });
  }

  // Calculate scale to fit canvas (object-contain)
  const scale = Math.min(canvasW / drawW, canvasH / drawH);
  console.log('[TRANSFORM] Calculated scale:', { scale, drawW, drawH, canvasW, canvasH });

  // Draw image centered
  const drawX = -(img.width * scale) / 2;
  const drawY = -(img.height * scale) / 2;
  const drawWidth = img.width * scale;
  const drawHeight = img.height * scale;
  console.log('[TRANSFORM] Drawing at:', { drawX, drawY, drawWidth, drawHeight });
  ctx.drawImage(
    img,
    drawX,
    drawY,
    drawWidth,
    drawHeight
  );

  console.log('[TRANSFORM] ✅ Image drawn, restoring context');
  ctx.restore();
}

/**
 * Commit transform pipeline to image (high-resolution export)
 * @param {string} workingUrl - Current working image URL
 * @param {object} transforms - { rotate, flipH, flipV }
 * @returns {Promise<string>} - DataURL of transformed image
 */
export function commitTransformPipelineToImage(workingUrl, transforms) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const { rotate } = transforms;

      // Determine output dimensions based on rotation
      let outputW = img.width;
      let outputH = img.height;

      // Swap dimensions for 90° and 270° rotations
      if (rotate === 90 || rotate === 270) {
        [outputW, outputH] = [outputH, outputW];
      }

      const canvas = document.createElement('canvas');
      canvas.width = outputW;
      canvas.height = outputH;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to get canvas context'));
        return;
      }

      // Apply transforms
      ctx.save();
      ctx.translate(outputW / 2, outputH / 2);

      const rad = (rotate * Math.PI) / 180;
      ctx.rotate(rad);

      ctx.scale(
        transforms.flipH ? -1 : 1,
        transforms.flipV ? -1 : 1
      );

      ctx.drawImage(
        img,
        -img.width / 2,
        -img.height / 2,
        img.width,
        img.height
      );

      ctx.restore();

      // Convert to dataURL (high quality JPEG)
      const output = canvas.toDataURL('image/jpeg', 0.92);
      resolve(output);
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = workingUrl;
  });
}
