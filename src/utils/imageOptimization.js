// ============================================================================
// imageOptimization.js - Image compression & thumbnail generation
// ============================================================================

/**
 * Compress image to specified max dimensions and quality
 * @param {File} file - Original image file
 * @param {Object} options - Compression options
 * @returns {Promise<Blob>} Compressed image blob
 */
export async function compressImage(file, options = {}) {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 0.85,
    format = 'image/jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        
        // Create canvas and compress
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Canvas to Blob failed'));
            }
          },
          format,
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Image load failed'));
      img.src = e.target.result;
    };
    
    reader.onerror = () => reject(new Error('FileReader failed'));
    reader.readAsDataURL(file);
  });
}

/**
 * Generate thumbnail from image file
 * @param {File|Blob} file - Original image
 * @param {number} size - Thumbnail size (width/height)
 * @returns {Promise<Blob>} Thumbnail blob
 */
export async function generateThumbnail(file, size = 300) {
  return compressImage(file, {
    maxWidth: size,
    maxHeight: size,
    quality: 0.7,
    format: 'image/jpeg'
  });
}

/**
 * Generate multiple thumbnail sizes
 * @param {File} file - Original image
 * @returns {Promise<Object>} Object with different thumbnail sizes
 */
export async function generateThumbnails(file) {
  try {
    const [small, medium] = await Promise.all([
      generateThumbnail(file, 150),  // Grid thumbnail
      generateThumbnail(file, 600),  // Preview thumbnail
    ]);
    
    return {
      small,
      medium
    };
  } catch (error) {
    console.error('🔥 Thumbnail generation failed:', error);
    throw error;
  }
}

/**
 * Get optimized image dimensions
 * @param {File} file - Image file
 * @returns {Promise<Object>} Image dimensions and metadata
 */
export async function getImageMetadata(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          aspectRatio: img.width / img.height,
          size: file.size,
          type: file.type,
          name: file.name
        });
      };
      
      img.onerror = () => reject(new Error('Image metadata extraction failed'));
      img.src = e.target.result;
    };
    
    reader.onerror = () => reject(new Error('FileReader failed'));
    reader.readAsDataURL(file);
  });
}

/**
 * Validate image file
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result
 */
export function validateImage(file, options = {}) {
  const {
    maxSize = 10 * 1024 * 1024, // 10MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  } = options;
  
  const errors = [];
  
  if (!file) {
    errors.push('No file provided');
  } else {
    if (!allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} not allowed`);
    }
    
    if (file.size > maxSize) {
      errors.push(`File size ${(file.size / 1024 / 1024).toFixed(2)}MB exceeds ${maxSize / 1024 / 1024}MB limit`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Batch compress multiple images
 * @param {File[]} files - Array of image files
 * @param {Object} options - Compression options
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Blob[]>} Array of compressed images
 */
export async function batchCompressImages(files, options = {}, onProgress = null) {
  const results = [];
  
  for (let i = 0; i < files.length; i++) {
    try {
      const compressed = await compressImage(files[i], options);
      results.push(compressed);
      
      if (onProgress) {
        onProgress({
          current: i + 1,
          total: files.length,
          percentage: Math.round(((i + 1) / files.length) * 100)
        });
      }
    } catch (error) {
      console.error(`🔥 Failed to compress ${files[i].name}:`, error);
      results.push(null);
    }
  }
  
  return results;
}

/**
 * Convert blob to File object
 * @param {Blob} blob - Blob to convert
 * @param {string} filename - Desired filename
 * @returns {File} File object
 */
export function blobToFile(blob, filename) {
  return new File([blob], filename, {
    type: blob.type,
    lastModified: Date.now()
  });
}

/**
 * Calculate storage size reduction
 * @param {number} originalSize - Original file size in bytes
 * @param {number} compressedSize - Compressed file size in bytes
 * @returns {Object} Size reduction stats
 */
export function calculateSavings(originalSize, compressedSize) {
  const savedBytes = originalSize - compressedSize;
  const savedPercentage = ((savedBytes / originalSize) * 100).toFixed(1);
  
  return {
    originalSize,
    compressedSize,
    savedBytes,
    savedPercentage: parseFloat(savedPercentage),
    ratio: (compressedSize / originalSize).toFixed(2)
  };
}
