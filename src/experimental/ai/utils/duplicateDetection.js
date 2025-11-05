/**
 * Duplicate Detection Utility
 * Uses perceptual hashing to find similar/duplicate images
 */

/**
 * Load image from URL
 * @param {string} url - Image URL
 * @returns {Promise<HTMLImageElement>} Loaded image
 */
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Generate perceptual hash for an image
 * Uses difference hash (dHash) algorithm
 * @param {string} imageUrl - URL of the image
 * @returns {Promise<string>} 64-bit hash as binary string
 */
export async function generatePerceptualHash(imageUrl) {
  try {
    const img = await loadImage(imageUrl);
    const canvas = document.createElement('canvas');
    canvas.width = 9; // Need 9x9 for difference hash
    canvas.height = 8;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, 9, 8);

    const imageData = ctx.getImageData(0, 0, 9, 8);
    const pixels = imageData.data;

    // Convert to grayscale
    const grayscale = [];
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 9; x++) {
        const i = (y * 9 + x) * 4;
        const avg = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
        grayscale.push(avg);
      }
    }

    // Compute horizontal differences
    let hash = '';
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const left = grayscale[y * 9 + x];
        const right = grayscale[y * 9 + x + 1];
        hash += left < right ? '1' : '0';
      }
    }

    return hash;
  } catch (error) {
    console.error('Error generating perceptual hash:', error);
    return null;
  }
}

/**
 * Calculate Hamming distance between two hashes
 * @param {string} hash1 - First hash
 * @param {string} hash2 - Second hash
 * @returns {number} Hamming distance
 */
export function hammingDistance(hash1, hash2) {
  if (!hash1 || !hash2 || hash1.length !== hash2.length) {
    return Infinity;
  }

  let distance = 0;
  for (let i = 0; i < hash1.length; i++) {
    if (hash1[i] !== hash2[i]) distance++;
  }
  return distance;
}

/**
 * Find duplicate and similar images
 * @param {Array<Object>} photos - Array of photo objects with similarityHash
 * @param {number} threshold - Hamming distance threshold (0-64, lower = more similar)
 * @returns {Array<Object>} Array of duplicate pairs
 */
export function findDuplicates(photos, threshold = 5) {
  const duplicates = [];
  const processed = new Set();

  for (let i = 0; i < photos.length; i++) {
    if (!photos[i].similarityHash) continue;

    for (let j = i + 1; j < photos.length; j++) {
      if (!photos[j].similarityHash) continue;

      const pairKey = [photos[i].id, photos[j].id].sort().join('-');
      if (processed.has(pairKey)) continue;

      const distance = hammingDistance(photos[i].similarityHash, photos[j].similarityHash);

      if (distance <= threshold) {
        duplicates.push({
          photo1: photos[i],
          photo2: photos[j],
          distance: distance,
          similarity: ((64 - distance) / 64) * 100 // Percentage
        });
        processed.add(pairKey);
      }
    }
  }

  // Sort by similarity (highest first)
  duplicates.sort((a, b) => b.similarity - a.similarity);

  return duplicates;
}

/**
 * Group photos by similarity
 * Creates clusters of similar images
 * @param {Array<Object>} photos - Array of photo objects
 * @param {number} threshold - Similarity threshold
 * @returns {Array<Array<Object>>} Array of photo groups
 */
export function groupSimilarPhotos(photos, threshold = 5) {
  const groups = [];
  const assigned = new Set();

  for (let i = 0; i < photos.length; i++) {
    if (assigned.has(photos[i].id) || !photos[i].similarityHash) continue;

    const group = [photos[i]];
    assigned.add(photos[i].id);

    for (let j = i + 1; j < photos.length; j++) {
      if (assigned.has(photos[j].id) || !photos[j].similarityHash) continue;

      const distance = hammingDistance(photos[i].similarityHash, photos[j].similarityHash);

      if (distance <= threshold) {
        group.push(photos[j]);
        assigned.add(photos[j].id);
      }
    }

    if (group.length > 1) {
      groups.push(group);
    }
  }

  return groups;
}

/**
 * Check if two images are likely duplicates
 * @param {string} hash1 - First image hash
 * @param {string} hash2 - Second image hash
 * @param {number} threshold - Threshold for considering duplicates
 * @returns {boolean} True if likely duplicates
 */
export function areDuplicates(hash1, hash2, threshold = 5) {
  const distance = hammingDistance(hash1, hash2);
  return distance <= threshold;
}

/**
 * Calculate similarity percentage between two hashes
 * @param {string} hash1 - First hash
 * @param {string} hash2 - Second hash
 * @returns {number} Similarity percentage (0-100)
 */
export function calculateSimilarity(hash1, hash2) {
  if (!hash1 || !hash2) return 0;
  const distance = hammingDistance(hash1, hash2);
  return ((64 - distance) / 64) * 100;
}

/**
 * Batch generate hashes for multiple images
 * @param {Array<string>} imageUrls - Array of image URLs
 * @param {Function} onProgress - Progress callback
 * @returns {Promise<Array<string>>} Array of hashes
 */
export async function batchGenerateHashes(imageUrls, onProgress = null) {
  const hashes = [];

  for (let i = 0; i < imageUrls.length; i++) {
    const hash = await generatePerceptualHash(imageUrls[i]);
    hashes.push(hash);

    if (onProgress) {
      onProgress(i + 1, imageUrls.length);
    }
  }

  return hashes;
}

export default {
  generatePerceptualHash,
  hammingDistance,
  findDuplicates,
  groupSimilarPhotos,
  areDuplicates,
  calculateSimilarity,
  batchGenerateHashes
};
