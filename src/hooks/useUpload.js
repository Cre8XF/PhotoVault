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

export function useUpload() {
  const { t } = useTranslation(['upload'])
  const { tier, canUploadVideo, shouldCompress } = useAuth() // ✅ ADD
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

      console.log(`🔍 Validating: ${file.name}, MIME: ${file.type}, isVideo: ${isVideo}, canUploadVideo: ${canUploadVideo}`)

      // ✅ VIDEO TIER CHECK
      if (isVideo) {
        if (!canUploadVideo) {
          const tierName = tier === 'GRATIS' ? 'GRATIS' : 'LITE'
          fileErrors.push(
            tier === 'GRATIS'
              ? 'Video-opplasting er ikke tilgjengelig på GRATIS-kontoen. Oppgrader til PRO.'
              : 'Video-opplasting er ikke tilgjengelig på LITE-kontoen. Oppgrader til PRO.'
          )
          console.log(`❌ Video blocked: ${file.name} (tier: ${tier})`)
        } else if (!ALLOWED_VIDEO_TYPES.includes(fileType) && !hasVideoExtension) {
          fileErrors.push(t('errors.unsupportedVideoType') || 'Videoformat ikke støttet')
          console.log(`❌ Unsupported video type: ${file.name} (${file.type})`)
        }
      }

      // Image validation
      if (isImage && !ALLOWED_IMAGE_TYPES.includes(fileType)) {
        fileErrors.push(t('errors.unsupportedImageType') || 'Bildeformat ikke støttet')
      }

      // File size check
      if (file.size > MAX_FILE_SIZE) {
        fileErrors.push(t('errors.fileTooLarge', { size: '100MB' }) || 'Fil for stor (maks 100MB)')
      }

      // Add to results
      if (fileErrors.length > 0) {
        errors.push({ file: file.name, errors: fileErrors })
        console.log(`❌ File validation failed: ${file.name}`, fileErrors)
      } else {
        file.fileType = isVideo ? 'video' : 'photo'
        validFiles.push(file)
        console.log(`✅ File validated: ${file.name} (${file.fileType})`)

        // Warn about large files
        if (file.size > 10 * 1024 * 1024) {
          warnings.push({
            file: file.name,
            message: t('warnings.largeFile') || 'Stor fil - kan ta tid å laste opp',
          })
        }
      }
    }

    console.log(`📊 Validation complete: ${validFiles.length} valid, ${errors.length} errors`)
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

        totalOriginalSize += file.size

        // ✅ TIER-AWARE VIDEO PROCESSING
        if (fileObj.type === 'video') {
          // Double-check video permission (should be caught in validation)
          if (!canUploadVideo) {
            console.warn('Video upload blocked for tier:', tier)
            continue
          }

          let videoToUpload = file
          let thumbnailBlob = null
          let metadata = null

          try {
            metadata = await extractVideoMetadata(file)
            thumbnailBlob = await generateThumbnail(file, 2.0)

            // ✅ Compress video only if tier allows AND file > 50MB
            if (shouldCompress && file.size > 50 * 1024 * 1024) {
              const compressedVideo = await compressVideo(file)
              if (compressedVideo) {
                videoToUpload = new File([compressedVideo], file.name, {
                  type: file.type,
                  lastModified: Date.now(),
                })
                console.log(
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
          if (shouldCompress) {
            // LITE and PRO: Compress images
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

            console.log(
              `🖼️ Image compressed: ${(file.size / 1024 / 1024).toFixed(1)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(1)}MB`
            )
          } else {
            // GRATIS: Original quality, no compression
            totalCompressedSize += file.size
            processedFiles.push({
              file: file, // ✅ Original file
              preview: fileObj.preview,
              name: file.name,
              size: file.size,
              type: 'photo',
            })

            console.log(
              `🖼️ Image uploaded (original): ${(file.size / 1024 / 1024).toFixed(1)}MB`
            )
          }

          setProcessingProgress(
            Math.round(((i + 1) / selectedFiles.length) * 50)
          )
        }
      }

      // Store compression stats
      if (shouldCompress) {
        setCompressionStats({
          originalSize: totalOriginalSize,
          compressedSize: totalCompressedSize,
          savings: totalOriginalSize - totalCompressedSize,
          savingsPercent:
            ((totalOriginalSize - totalCompressedSize) / totalOriginalSize) * 100,
        })
      } else {
        setCompressionStats({
          originalSize: totalOriginalSize,
          compressedSize: totalOriginalSize,
          savings: 0,
          savingsPercent: 0,
          message: 'Original quality (GRATIS tier)'
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
