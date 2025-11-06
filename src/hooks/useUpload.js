/**
 * useUpload Hook
 * Handles file upload logic including validation, compression, and Firebase upload
 * Extracted from UploadModal.jsx for better separation of concerns
 */

import { useState } from 'react';
import { compressImage, generateThumbnails, validateImage, calculateSavings } from '../utils/imageOptimization';
import { isVideoFile, generateThumbnail, extractVideoMetadata, compressVideo } from '../utils/videoTools';
import { showToast } from '../utils/nativeUtils';

export const useUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [compressionStats, setCompressionStats] = useState(null);

  /**
   * Validate and prepare files for upload
   */
  const validateFiles = async (files) => {
    const validFiles = [];
    const errors = [];
    const warnings = [];
    const maxVideoSize = 100 * 1024 * 1024; // 100 MB
    const maxImageSize = 50 * 1024 * 1024; // 50 MB

    for (const file of files) {
      // Handle images
      if (file.type.startsWith("image/")) {
        const validation = validateImage(file, {
          maxSize: maxImageSize,
          allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        });

        if (validation.valid) {
          file.fileType = 'image';
          validFiles.push(file);

          // Warn about large files
          if (file.size > 10 * 1024 * 1024) {
            warnings.push({
              file: file.name,
              message: `Stort bilde (${(file.size / 1024 / 1024).toFixed(1)}MB) - vil bli komprimert`
            });
          }
        } else {
          errors.push({ file: file.name, errors: validation.errors });
        }
      }
      // Handle videos
      else if (isVideoFile(file)) {
        if (file.size > maxVideoSize) {
          errors.push({
            file: file.name,
            errors: ['Videofiler må være under 100 MB']
          });
        } else {
          file.fileType = 'video';
          validFiles.push(file);
        }
      }
    }

    return { validFiles, errors, warnings };
  };

  /**
   * Process files (compression, thumbnail generation)
   */
  const processFiles = async (selectedFiles, autoCompress) => {
    const processedFiles = [];
    let totalOriginalSize = 0;
    let totalCompressedSize = 0;

    for (let i = 0; i < selectedFiles.length; i++) {
      const fileObj = selectedFiles[i];
      const file = fileObj.file;
      totalOriginalSize += file.size;

      try {
        // Process videos
        if (fileObj.type === 'video') {
          await showToast("Genererer forhåndsvisning...", "info");
          const thumbnailBlob = await generateThumbnail(file);

          if (!thumbnailBlob) {
            console.warn('Thumbnail generation failed, continuing without');
            await showToast('Kunne ikke generere forhåndsvisning - fortsetter uten', 'warning');
          }

          const metadata = await extractVideoMetadata(file);

          if (!metadata) {
            console.warn('Metadata extraction failed, continuing without');
            await showToast('Metadata kunne ikke leses - video lastes opp uten varighet', 'info');
          }

          // Compress if >50MB
          let videoToUpload = file;
          if (file.size > 50 * 1024 * 1024 && autoCompress) {
            await showToast("Komprimerer video...", "info");
            const compressedBlob = await compressVideo(file, (progress) => {
              setProcessingProgress(Math.round(progress / 2));
            });

            if (compressedBlob) {
              videoToUpload = new File([compressedBlob], file.name, {
                type: 'video/mp4',
                lastModified: Date.now()
              });
              totalCompressedSize += videoToUpload.size;
            } else {
              await showToast("Komprimering feilet, laster opp original", "warning");
              totalCompressedSize += file.size;
            }
          } else {
            totalCompressedSize += file.size;
          }

          processedFiles.push({
            file: videoToUpload,
            thumbnail: thumbnailBlob || null,
            preview: fileObj.preview,
            name: videoToUpload.name,
            size: videoToUpload.size,
            type: 'video',
            metadata: metadata || {
              duration: 0,
              resolution: 'unknown',
              fps: null
            }
          });

          setProcessingProgress(Math.round(((i + 1) / selectedFiles.length) * 50));
        }
        // Process images
        else {
          if (autoCompress) {
            const compressedBlob = await compressImage(file, {
              maxWidth: 1920,
              maxHeight: 1080,
              quality: 0.85
            });

            const thumbnails = await generateThumbnails(file);

            const compressedFile = new File(
              [compressedBlob],
              file.name,
              { type: 'image/jpeg', lastModified: Date.now() }
            );

            totalCompressedSize += compressedFile.size;
            compressedFile.thumbnails = thumbnails;

            processedFiles.push({
              file: compressedFile,
              preview: fileObj.preview,
              name: compressedFile.name,
              size: compressedFile.size,
              type: 'photo'
            });
          } else {
            totalCompressedSize += file.size;
            processedFiles.push({
              file: file,
              preview: fileObj.preview,
              name: file.name,
              size: file.size,
              type: 'photo'
            });
          }

          setProcessingProgress(Math.round(((i + 1) / selectedFiles.length) * 50));
        }
      } catch (error) {
        console.error(`Failed to process ${file.name}:`, error);
        await showToast(`Feil ved prosessering av ${file.name}`, "error");
      }
    }

    // Calculate compression savings
    let stats = null;
    if (totalOriginalSize > 0 && totalCompressedSize > 0 && totalOriginalSize !== totalCompressedSize) {
      stats = calculateSavings(totalOriginalSize, totalCompressedSize);
      console.log('Compression savings:', stats);
    }

    return { processedFiles, compressionStats: stats };
  };

  /**
   * Main upload function
   */
  const uploadFiles = async (selectedFiles, selectedAlbumId, aiTagging, onUpload, t) => {
    if (selectedFiles.length === 0) return { success: false };

    setUploading(true);
    setProcessingProgress(0);
    setCompressionStats(null);

    try {
      // Get autoCompress from localStorage
      const autoCompress = localStorage.getItem('autoCompress') !== 'false';

      // Process files
      const { processedFiles, compressionStats } = await processFiles(selectedFiles, autoCompress);

      if (compressionStats) {
        setCompressionStats(compressionStats);
      }

      // Upload to Firebase
      await onUpload(processedFiles, selectedAlbumId, aiTagging);

      // Save preferences
      localStorage.setItem('aiAutoTag', aiTagging.toString());
      localStorage.setItem('autoCompress', autoCompress.toString());

      setProcessingProgress(0);
      setCompressionStats(null);

      if (aiTagging) {
        await showToast(t("upload:successWithAI", { count: selectedFiles.length }));
      } else {
        await showToast(t("upload:success", { count: selectedFiles.length }));
      }

      return { success: true };
    } catch (error) {
      console.error("Upload error:", error);
      await showToast(t("upload:failed"));
      return { success: false, error };
    } finally {
      setUploading(false);
      setProcessingProgress(0);
    }
  };

  return {
    uploading,
    processingProgress,
    compressionStats,
    validateFiles,
    uploadFiles
  };
};
