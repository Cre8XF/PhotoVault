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
import useAuth from './useAuth' // ✅ ADD
import useStore from '../state/store' // ✅ P0: For storageUsed
import * as exifr from 'exifr' // ✅ ADD: For EXIF extraction BEFORE compression

export function useUpload() {
  const { t } = useTranslation(['upload'])
  const { tier, canUploadVideo, getTierLimit, isAdmin } = useAuth() // ✅ P0: Add getTierLimit, isAdmin
  const storageUsed = useStore((state) => state.storageUsed) // ✅ P0: Get current storage usage
  const setNotification = useStore((state) => state.setNotification) // ✅ P0: For error notifications
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
    const ALLOWED_IMAGE_TYPES = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/heic',
      'image/heif',
    ]
    const ALLOWED_VIDEO_TYPES = [
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
      const fileType = file.type.toLowerCase()

      // ✅ IMPROVED: Check both MIME and extension for videos
      const hasMimeType = fileType && fileType.startsWith('video/')
      const hasVideoExtension = /\.(mp4|mov|webm|avi|mkv|m4v|3gp|flv)$/i.test(file.name)
      const isVideo = hasMimeType || hasVideoExtension
      const isImage = fileType.startsWith('image/')

      if (import.meta.env.DEV) console.log(`🔍 Validating: ${file.name}, MIME: ${file.type}, isVideo: ${isVideo}, canUploadVideo: ${canUploadVideo}`)

      // ✅ VIDEO TIER CHECK
      if (isVideo) {
        if (!canUploadVideo) {
          fileErrors.push(
            tier() === 'GRATIS'
              ? t('errors.videoNotAllowedGratis')
              : t('errors.videoNotAllowedLite')
          )
          if (import.meta.env.DEV) console.log(`❌ Video blocked: ${file.name} (tier: ${tier()})`)
        } else if (!ALLOWED_VIDEO_TYPES.includes(fileType) && !hasVideoExtension) {
          fileErrors.push(t('errors.unsupportedVideoType'))
          if (import.meta.env.DEV) console.log(`❌ Unsupported video type: ${file.name} (${file.type})`)
        }
      }

      // Image validation
      if (isImage && !ALLOWED_IMAGE_TYPES.includes(fileType)) {
        fileErrors.push(t('errors.unsupportedImageType'))
      }

      // File size check
      if (file.size > MAX_FILE_SIZE) {
        fileErrors.push(t('errors.fileTooLarge', { size: '100MB' }))
      }

      // Add to results
      if (fileErrors.length > 0) {
        errors.push({ file: file.name, errors: fileErrors })
        if (import.meta.env.DEV) console.log(`❌ File validation failed: ${file.name}`, fileErrors)
      } else {
        file.fileType = isVideo ? 'video' : 'photo'
        validFiles.push(file)
        if (import.meta.env.DEV) console.log(`✅ File validated: ${file.name} (${file.fileType})`)

        // Warn about large files
        if (file.size > 10 * 1024 * 1024) {
          warnings.push({
            file: file.name,
            message: t('warnings.largeFile'),
          })
        }
      }
    }

    if (import.meta.env.DEV) console.log(`📊 Validation complete: ${validFiles.length} valid, ${errors.length} errors`)
    return { validFiles, errors, warnings }
  }

  /**
   * Upload files with compression
   */
  const uploadFiles = async (
    selectedFiles,
    albumId,
    aiTagging,
    shouldCompressFiles, // ✅ Explicit compression flag from caller
    onUpload,
    t
  ) => {
    if (uploading || !selectedFiles || selectedFiles.length === 0) {
      return { success: false, error: 'No files selected' }
    }

    // ✅ P0: HARD STORAGE LIMIT ENFORCEMENT
    // Calculate total size of new files BEFORE upload starts
    const newFileBytes = selectedFiles.reduce((total, fileObj) => {
      return total + (fileObj.file?.size || 0)
    }, 0)

    const currentTier = tier()
    const tierLimit = getTierLimit(currentTier)

    // Admin bypass
    if (!isAdmin()) {
      const wouldExceed = storageUsed + newFileBytes > tierLimit

      if (wouldExceed) {
        const formatBytes = (bytes) => {
          if (bytes === 0) return '0 B'
          const k = 1024
          const sizes = ['B', 'KB', 'MB', 'GB']
          const i = Math.floor(Math.log(bytes) / Math.log(k))
          return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
        }

        const errorMessage = `Du har ikke nok lagringsplass.\n\nBruk: ${formatBytes(storageUsed)} / ${formatBytes(tierLimit)}\nNye filer: ${formatBytes(newFileBytes)}\n\nOppgrader abonnementet ditt for mer plass.`

        setNotification({
          message: errorMessage,
          type: 'error',
        })

        if (import.meta.env.DEV) console.warn('❌ Storage limit exceeded:', {
          currentUsage: storageUsed,
          newFiles: newFileBytes,
          limit: tierLimit,
          tier: currentTier,
        })

        return { success: false, error: 'Storage limit exceeded' }
      }

      if (import.meta.env.DEV) console.log('✅ Storage check passed:', {
        currentUsage: storageUsed,
        newFiles: newFileBytes,
        afterUpload: storageUsed + newFileBytes,
        limit: tierLimit,
        tier: currentTier,
      })
    } else {
      if (import.meta.env.DEV) console.log('✅ Admin bypass - no storage limit')
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

        totalOriginalSize += file.size

        // ✅ TIER-AWARE VIDEO PROCESSING
        if (fileObj.type === 'video') {
          // Double-check video permission (should be caught in validation)
          if (!canUploadVideo) {
            if (import.meta.env.DEV) console.warn('Video upload blocked for tier:', tier())
            continue
          }

          let videoToUpload = file
          let thumbnailBlob = null
          let metadata = null

          try {
            metadata = await extractVideoMetadata(file)
            thumbnailBlob = await generateThumbnail(file, 2.0)

            // ✅ Compress video only if caller permits AND file > 50MB
            if (shouldCompressFiles && file.size > 50 * 1024 * 1024) {
              const compressedVideo = await compressVideo(file)
              if (compressedVideo) {
                videoToUpload = new File([compressedVideo], file.name, {
                  type: file.type,
                  lastModified: Date.now(),
                })
                if (import.meta.env.DEV) console.log(
                  `📹 Video compressed: ${(file.size / 1024 / 1024).toFixed(1)}MB → ${(videoToUpload.size / 1024 / 1024).toFixed(1)}MB`
                )
                totalCompressedSize += videoToUpload.size
              } else {
                totalCompressedSize += file.size
              }
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
        // ✅ TIER-AWARE IMAGE PROCESSING
        else {
          // ✅ CRITICAL FIX: Extract EXIF from ORIGINAL file BEFORE compression
          // Compression strips all EXIF metadata, so we must extract it first!
          let exifData = null
          try {
            if (import.meta.env.DEV) console.log(`📊 [PRE-COMPRESSION] Extracting EXIF from: ${file.name}`)
            exifData = await exifr.parse(file, {
              tiff: true,
              exif: true,
              gps: true,
              interop: true,
              ifd0: true,
              ifd1: true,
              iptc: true,
              jfif: true,
              ihdr: true,
            })
            if (exifData) {
              if (import.meta.env.DEV) console.log(`✅ [PRE-COMPRESSION] EXIF extracted successfully:`, {
                hasDate: !!(exifData.DateTimeOriginal || exifData.DateTime),
                hasGPS: !!(exifData.latitude && exifData.longitude),
                hasCamera: !!(exifData.Make || exifData.Model)
              })
            } else {
              if (import.meta.env.DEV) console.log(`⚠️ [PRE-COMPRESSION] No EXIF data in original file`)
            }
          } catch (exifError) {
            if (import.meta.env.DEV) console.warn(`⚠️ [PRE-COMPRESSION] EXIF extraction failed:`, exifError.message)
          }

          // ✅ Use explicit compression flag from caller
          if (shouldCompressFiles) {
            // LITE and PRO: Compress images (only if toggle is ON)
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
              exifData: exifData, // ✅ Pass pre-extracted EXIF
            })

            if (import.meta.env.DEV) console.log(
              `🖼️ Image compressed: ${(file.size / 1024 / 1024).toFixed(1)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(1)}MB`
            )
          } else {
            // Original quality (GRATIS tier OR toggle OFF)
            totalCompressedSize += file.size
            processedFiles.push({
              file: file, // ✅ Original file
              preview: fileObj.preview,
              name: file.name,
              size: file.size,
              type: 'photo',
              exifData: exifData, // ✅ Pass pre-extracted EXIF
            })

            if (import.meta.env.DEV) console.log(
              `🖼️ Image uploaded (original): ${(file.size / 1024 / 1024).toFixed(1)}MB`
            )
          }

          setProcessingProgress(
            Math.round(((i + 1) / selectedFiles.length) * 50)
          )
        }
      }

      // Store compression stats - only if compression was actually applied
      if (shouldCompressFiles) {
        setCompressionStats({
          originalSize: totalOriginalSize,
          compressedSize: totalCompressedSize,
          savings: totalOriginalSize - totalCompressedSize,
          savingsPercent:
            ((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100,
        })
      } else {
        // No compression applied
        setCompressionStats({
          originalSize: totalOriginalSize,
          compressedSize: totalOriginalSize,
          savings: 0,
          savingsPercent: 0,
          message: 'Original quality (compression disabled)'
        })
      }

      // Upload to Firebase
      // ✅ P2-A FIX: Call onUpload ONCE with all processed files
      // This prevents multiple success notifications (one per file)
      // onUpload callback (handleUpload) will show a single success message with correct count
      await onUpload(processedFiles, albumId, aiTagging)

      // Update progress to 100%
      setUploadCount(processedFiles.length)
      setProcessingProgress(100)

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
