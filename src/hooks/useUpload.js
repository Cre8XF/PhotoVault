// ============================================================================
// HOOK: useUpload.js – OPPDATERT: Viser antall filer i progress
// ============================================================================
// ENDRING: Returner både processingProgress OG uploadCount/totalFiles

import { useState } from 'react'
import { uploadPhoto } from '../firebase'
import { compressImage } from '../utils/imageCompression'
import { showToast } from '../utils/nativeUtils'
import { useTranslation } from 'react-i18next'
import {
  extractVideoMetadata,
  generateThumbnail,
  compressVideo,
} from '../utils/videoTools'

export function useUpload() {
  const { t } = useTranslation(['upload'])
  const [uploading, setUploading] = useState(false)
  const [processingProgress, setProcessingProgress] = useState(0)
  const [compressionStats, setCompressionStats] = useState(null)

  // ✅ NY: Legg til state for antall filer
  const [uploadCount, setUploadCount] = useState(0)
  const [totalFiles, setTotalFiles] = useState(0)

  /**
   * Validate files before upload
   */
  const validateFiles = async (files) => {
    const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
    const ALLOWED_TYPES = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/heic',
      'image/heif',
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo',
      'video/webm',
    ]

    const validFiles = []
    const errors = []
    const warnings = []

    for (const file of files) {
      const fileErrors = []

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        fileErrors.push(t('errors.fileTooLarge', { size: '100MB' }))
      }

      // Check file type
      const fileType = file.type.toLowerCase()
      const isVideo = fileType.startsWith('video/')
      const isImage = fileType.startsWith('image/')

      if (!ALLOWED_TYPES.includes(fileType) && !isVideo && !isImage) {
        fileErrors.push(t('errors.unsupportedType'))
      }

      // Add to results
      if (fileErrors.length > 0) {
        errors.push({ file: file.name, errors: fileErrors })
      } else {
        file.fileType = isVideo ? 'video' : 'photo'
        validFiles.push(file)

        // Warn about large files
        if (file.size > 10 * 1024 * 1024) {
          warnings.push({
            file: file.name,
            message: t('warnings.largeFile'),
          })
        }
      }
    }

    return { validFiles, errors, warnings }
  }

  /**
   * Upload files with compression
   */
  const uploadFiles = async (
    selectedFiles,
    albumId,
    aiTagging,
    onUpload,
    t
  ) => {
    if (uploading || !selectedFiles || selectedFiles.length === 0) {
      return { success: false, error: 'No files selected' }
    }

    setUploading(true)
    setProcessingProgress(0)
    // ✅ NY: Sett totalFiles
    setTotalFiles(selectedFiles.length)
    setUploadCount(0)

    try {
      const processedFiles = []
      let totalOriginalSize = 0
      let totalCompressedSize = 0

      // Process each file
      for (let i = 0; i < selectedFiles.length; i++) {
        const fileObj = selectedFiles[i]
        const file = fileObj.file
        const autoCompress = localStorage.getItem('autoCompress') !== 'false'

        totalOriginalSize += file.size

        // Process videos
        if (fileObj.type === 'video') {
          let videoToUpload = file
          let thumbnailBlob = null
          let metadata = null

          try {
            // Extract metadata
            metadata = await extractVideoMetadata(file)

            // Generate thumbnail
            thumbnailBlob = await generateThumbnail(file, 2.0)

            // Compress if enabled and file > 50MB
            if (autoCompress && file.size > 50 * 1024 * 1024) {
              const compressedVideo = await compressVideo(file)
              videoToUpload = new File([compressedVideo], file.name, {
                type: file.type,
                lastModified: Date.now(),
              })
              console.log(
                `📹 Video compressed: ${(file.size / 1024 / 1024).toFixed(
                  1
                )}MB → ${(videoToUpload.size / 1024 / 1024).toFixed(1)}MB`
              )
              totalCompressedSize += videoToUpload.size
            } else {
              totalCompressedSize += file.size
            }
          } catch (error) {
            console.error(`Failed to process video ${file.name}:`, error)
            totalCompressedSize += file.size
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
              fps: null,
            },
          })

          setProcessingProgress(
            Math.round(((i + 1) / selectedFiles.length) * 50)
          )
        }
        // Process images
        else {
          if (autoCompress) {
            const compressedBlob = await compressImage(file, {
              maxWidth: 1920,
              maxHeight: 1080,
              quality: 0.85,
            })

            const compressedFile = new File([compressedBlob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            })

            totalCompressedSize += compressedFile.size

            processedFiles.push({
              file: compressedFile,
              preview: fileObj.preview,
              name: compressedFile.name,
              size: compressedFile.size,
              type: 'photo',
            })
          } else {
            totalCompressedSize += file.size
            processedFiles.push({
              file: file,
              preview: fileObj.preview,
              name: file.name,
              size: file.size,
              type: 'photo',
            })
          }

          setProcessingProgress(
            Math.round(((i + 1) / selectedFiles.length) * 50)
          )
        }
      }

      // Set compression stats
      if (totalOriginalSize > 0) {
        const savedPercentage = Math.round(
          ((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100
        )
        setCompressionStats({
          originalSize: totalOriginalSize,
          compressedSize: totalCompressedSize,
          savedPercentage,
        })
      }

      // Upload to Firebase
      // ✅ FIKSET: Kaller onUpload én fil av gangen og oppdaterer count
      for (let i = 0; i < processedFiles.length; i++) {
        const fileObj = processedFiles[i]

        // Last opp én fil
        await onUpload([fileObj], albumId, aiTagging)

        // Oppdater count og progress
        setUploadCount(i + 1)
        setProcessingProgress(
          50 + Math.round(((i + 1) / processedFiles.length) * 50)
        )
      }
      await showToast(t('success.uploaded'), 'success')

      return { success: true }
    } catch (error) {
      console.error('Upload error:', error)
      await showToast(error.message || t('errors.uploadFailed'), 'error')
      return { success: false, error: error.message }
    } finally {
      setTimeout(() => {
        setUploading(false)
        setProcessingProgress(0)
        setCompressionStats(null)
        // ✅ NY: Reset counts
        setUploadCount(0)
        setTotalFiles(0)
      }, 1000)
    }
  }

  return {
    uploading,
    processingProgress,
    compressionStats,
    uploadCount, // ✅ NY
    totalFiles, // ✅ NY
    validateFiles,
    uploadFiles,
  }
}
