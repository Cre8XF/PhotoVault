// ============================================================================
// utils/imageCompression.js – Client-side image compression
// ============================================================================
import imageCompression from 'browser-image-compression';

/**
 * Komprimer bilder før upload
 * @param {File} file - Original bildefil
 * @param {Object} options - Komprimeringsinnstillinger
 * @returns {Promise<File>} Komprimert fil
 */
export async function compressImage(file, options = {}) {
  // Standardinnstillinger
  const defaultOptions = {
    maxSizeMB: 1,              // Max filstørrelse i MB
    maxWidthOrHeight: 1920,    // Max dimensjon (bredde eller høyde)
    useWebWorker: true,        // Bruk Web Worker for bedre ytelse
    initialQuality: 0.85,      // Kvalitet (0-1)
  };

  const compressionOptions = { ...defaultOptions, ...options };

  try {
    if (import.meta.env.DEV) console.log(`🖼️ Original størrelse: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
    
    const compressedFile = await imageCompression(file, compressionOptions);
    
    if (import.meta.env.DEV) console.log(`✅ Komprimert størrelse: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
    if (import.meta.env.DEV) console.log(`📉 Reduksjon: ${((1 - compressedFile.size / file.size) * 100).toFixed(1)}%`);
    
    return compressedFile;
  } catch (error) {
    console.error('❌ Komprimering feilet:', error);
    // Returner original fil hvis komprimering feiler
    return file;
  }
}

/**
 * Komprimer flere bilder parallelt
 * @param {File[]} files - Array av bildefiler
 * @param {Object} options - Komprimeringsinnstillinger
 * @param {Function} onProgress - Progress callback (optional)
 * @returns {Promise<File[]>} Array av komprimerte filer
 */
export async function compressMultipleImages(files, options = {}, onProgress = null) {
  const totalFiles = files.length;
  let completed = 0;

  const compressionPromises = files.map(async (file, index) => {
    try {
      const compressed = await compressImage(file, options);
      completed++;
      
      if (onProgress) {
        onProgress({
          completed,
          total: totalFiles,
          percentage: Math.round((completed / totalFiles) * 100),
          currentFile: file.name
        });
      }
      
      return compressed;
    } catch (error) {
      console.error(`❌ Feil ved komprimering av ${file.name}:`, error);
      completed++;
      
      if (onProgress) {
        onProgress({
          completed,
          total: totalFiles,
          percentage: Math.round((completed / totalFiles) * 100),
          currentFile: file.name,
          error: true
        });
      }
      
      return file; // Returner original ved feil
    }
  });

  return Promise.all(compressionPromises);
}

/**
 * Sjekk om fil trenger komprimering
 * @param {File} file - Bildefil
 * @param {Number} maxSizeMB - Maks størrelse i MB
 * @returns {Boolean} True hvis fil er større enn grensen
 */
export function needsCompression(file, maxSizeMB = 1) {
  const fileSizeMB = file.size / 1024 / 1024;
  return fileSizeMB > maxSizeMB;
}

/**
 * Få lesbar filstørrelse
 * @param {Number} bytes - Størrelse i bytes
 * @returns {String} Formatert størrelse (KB/MB)
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Komprimer kun store bilder
 * @param {File[]} files - Array av bildefiler
 * @param {Number} threshold - Terskel i MB (standard 1 MB)
 * @returns {Promise<File[]>} Array med komprimerte/originale filer
 */
export async function compressLargeImages(files, threshold = 1) {
  return Promise.all(
    files.map(async (file) => {
      if (needsCompression(file, threshold)) {
        if (import.meta.env.DEV) console.log(`🔄 Komprimerer stor fil: ${file.name}`);
        return await compressImage(file);
      } else {
        if (import.meta.env.DEV) console.log(`✅ Fil under ${threshold}MB, hopper over: ${file.name}`);
        return file;
      }
    })
  );
}

export default {
  compressImage,
  compressMultipleImages,
  needsCompression,
  formatFileSize,
  compressLargeImages
};