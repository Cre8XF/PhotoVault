// ============================================================================
// COMPONENT: UploadModal.jsx – v6.0 SIMPLIFIED
// Refactored to use useUpload hook for better separation of concerns
// ============================================================================
import AlbumModal from './AlbumModal'
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Upload,
  Camera,
  Image as ImageIcon,
  Zap,
  FolderOpen,
  Video,
} from 'lucide-react'
import {
  isNativePlatform,
  takePicture,
  pickImage,
  convertWebPathToBlob,
  checkCameraPermissions,
  requestCameraPermissions,
} from '../utils/nativeCamera'
import { triggerHaptic, showToast } from '../utils/nativeUtils'
import { useTranslation } from 'react-i18next'
import { useUpload } from '../hooks/useUpload'
import useAuth from '../hooks/useAuth'
import useStore from '../state/store' // ✅ ADD
import { auth, addAlbum } from '../firebase'

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

/**
 * ✅ ROBUST video detection that works on mobile and desktop
 * Checks both MIME type AND file extension to catch edge cases
 */
const detectVideo = (file) => {
  const name = file.name?.toLowerCase() || ''
  const extMatch = /\.(mp4|mov|m4v|webm|avi|3gp|mkv|flv)$/i.test(name)

  const mime = file.type?.toLowerCase() || ''
  const mimeMatch = mime.startsWith('video/')

  return extMatch || mimeMatch
}

const UploadModal = ({
  isOpen,
  onClose,
  onUpload,
  onCreateAlbum,
  albums = [],
  selectedAlbum = null,
  initialMode = 'upload', // 'upload' or 'album'
}) => {
  // ✅ FIRST: Get all hook values that provide data
  const [isNative, setIsNative] = useState(false)

  useEffect(() => {
    setIsNative(isNativePlatform())
  }, [])

  const { t } = useTranslation(['common', 'upload'])
  const { tier, canUploadVideo } = useAuth() // ✅ Removed shouldCompress
  const setNotification = useStore((state) => state.setNotification) // ✅ ADD
  const userProfile = useStore((state) => state.userProfile)
  const authReady = Boolean(userProfile)
  // ✅ Storage tracking for upload pre-check
  const storageUsed = useStore((state) => state.storageUsed)
  const storageLimit = useStore((state) => state.storageLimit)
  const {
    uploading,
    processingProgress,
    compressionStats,
    uploadCount,
    totalFiles,
    validateFiles,
    uploadFiles,
  } = useUpload()

  // ✅ THEN: Initialize state that depends on those values
  const [showAlbumModal, setShowAlbumModal] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [selectedAlbumId, setSelectedAlbumId] = useState(selectedAlbum || '')
  const [dragActive, setDragActive] = useState(false)
  const [permissions, setPermissions] = useState({
    camera: 'prompt',
    photos: 'prompt',
  })
  const [showAlbums, setShowAlbums] = useState(false)
  const [autoCompress, setAutoCompress] = useState(() => {
    // FREE users cannot compress - always false
    if (tier() === 'GRATIS') return false

    // LITE/PRO users - read from localStorage
    const saved = localStorage.getItem('autoCompress')
    return saved !== 'false' // Default true for LITE/PRO
  })
  // 🔒 FORCE autoCompress OFF for GRATIS users (visual + state safety)
  // Also prevents race condition where localStorage loads before userProfile
  useEffect(() => {
    if (authReady && tier() === 'GRATIS' && autoCompress) {
      setAutoCompress(false)
    }
  }, [authReady, tier, autoCompress])

  const [aiTagging] = useState(false) // Always false for MVP
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false) // Reentrancy guard

  // Refs
  const fileInputRef = useRef(null)
  const modalRef = useRef(null)

  // Permission check for native platforms
  useEffect(() => {
    if (!isNative) return
    checkPermissionsAsync()
  }, [isNative])

  // Update localStorage when autoCompress changes (only for LITE/PRO users)
  useEffect(() => {
    if (tier() !== 'GRATIS') {
      localStorage.setItem('autoCompress', autoCompress)
    }
  }, [autoCompress, tier])

  const checkPermissionsAsync = async () => {
    const perms = await checkCameraPermissions()
    setPermissions(perms)
  }

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape' && !uploading) {
        onClose()
      }
    },
    [onClose, uploading]
  )

  useEffect(() => {
    // Only focus UploadModal if AlbumModal is NOT open
    if (isOpen && !showAlbumModal) {
      document.addEventListener('keydown', handleKeyDown)
      setTimeout(() => modalRef.current?.focus(), 0)
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, handleKeyDown, showAlbumModal]) // Add showAlbumModal dependency

  // Auto-open AlbumModal if initialMode is 'album'
  useEffect(() => {
    if (isOpen && initialMode === 'album' && !showAlbumModal) {
      console.log('📁 UploadModal opened in ALBUM mode - opening AlbumModal')
      // Delay to ensure modal is fully rendered
      setTimeout(() => {
        setShowAlbumModal(true)
      }, 100)
    }
  }, [isOpen, initialMode])

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Save current overflow style
      const originalOverflow = document.body.style.overflow
      // Lock scroll
      document.body.style.overflow = 'hidden'

      // Cleanup: restore original overflow when modal closes
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isOpen])

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
    else if (e.type === 'dragleave') setDragActive(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files?.length > 0)
      handleFilesAsync(Array.from(e.dataTransfer.files))
  }

  const handleFileInput = (e) => {
    if (e.target.files?.length > 0) handleFilesAsync(Array.from(e.target.files))
  }

  // File validation and preview generation
  const handleFilesAsync = async (files) => {
    // ✅ CRITICAL: Auth readiness guard - prevent race conditions
    if (!authReady) {
      setNotification({
        message: 'Account information is still loading. Please try again.',
        type: 'info',
      })
      return
    }

    // ✅ Filter video files first if user cannot upload videos
    let filesToValidate = files
    let blockedVideos = []

    if (!canUploadVideo()) {
      filesToValidate = []
      files.forEach((file) => {
        // ✅ FIXED: Use robust video detection
        const isVideo = detectVideo(file)
        console.log(
          `🔍 Video check: ${file.name}, MIME: ${file.type}, isVideo: ${isVideo}`
        )
        if (isVideo) {
          blockedVideos.push(file.name)
        } else {
          filesToValidate.push(file)
        }
      })

      // Show feedback if videos were blocked
      if (blockedVideos.length > 0) {
        const baseMessage =
          tier() === 'GRATIS'
            ? t('upload:errors.videoNotAllowedGratis')
            : t('upload:errors.videoNotAllowedLite')

        const message = `${baseMessage}\n\n${t(
          'upload:errors.blockedFiles'
        )}\n${blockedVideos.join('\n')}`

        setNotification({
          message,
          type: 'error',
        })
      }

      if (filesToValidate.length === 0) {
        return // No valid files to process
      }
    }

    const { validFiles, errors, warnings } = await validateFiles(
      filesToValidate
    )

    // Show errors
    if (errors.length > 0) {
      errors.forEach((err) => {
        console.error(`File ${err.file}:`, err.errors)
        showToast(`${err.file}: ${err.errors.join(', ')}`, 'error')
      })
    }

    // Show warnings
    if (warnings.length > 0) {
      warnings.forEach((warn) => {
        console.warn(`File ${warn.file}:`, warn.message)
      })
    }

    // Generate previews
    const filesWithPreviews = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      type: file.fileType,
    }))

    setSelectedFiles((prev) => [...prev, ...filesWithPreviews])

    if (validFiles.length > 0) {
      await triggerHaptic('light')
    }
  }

  // Native camera handlers
  const handleNativeCamera = async () => {
    if (permissions.camera !== 'granted') {
      const granted = await requestCameraPermissions()
      if (!granted) {
        await showToast(t('upload:permissions.cameraRequired'), 'error')
        return
      }
    }

    try {
      const photo = await takePicture()
      if (!photo) return

      const blob = await convertWebPathToBlob(photo.webPath)
      const file = new File([blob], `photo_${Date.now()}.jpg`, {
        type: 'image/jpeg',
      })
      handleFilesAsync([file])
    } catch (error) {
      console.error('Camera error:', error)
      await showToast(t('upload:errors.cameraFailed'), 'error')
    }
  }

  const handleNativeGallery = async () => {
    if (permissions.photos !== 'granted') {
      await showToast(t('upload:permissions.photosRequired'), 'info')
      return
    }

    try {
      const images = await pickImage(true)
      if (!images || images.length === 0) return

      const files = await Promise.all(
        images.map(async (img) => {
          const blob = await convertWebPathToBlob(img.webPath)
          return new File([blob], `photo_${Date.now()}.jpg`, {
            type: 'image/jpeg',
          })
        })
      )

      handleFilesAsync(files)
    } catch (error) {
      console.error('Gallery error:', error)
      await showToast(t('upload:errors.galleryFailed'), 'error')
    }
  }

  // Remove file from selection
  const removeFile = (index) => {
    URL.revokeObjectURL(selectedFiles[index].preview)
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  // Toggle compression (disabled for GRATIS users and before auth is ready)
  const handleCompressToggle = () => {
    if (!authReady || tier() === 'GRATIS') return // Cannot toggle before auth or for FREE users
    const newValue = !autoCompress
    setAutoCompress(newValue)
    localStorage.setItem('autoCompress', newValue.toString())
  }

  // Handle upload
  const handleUploadClick = async () => {
    // ✅ Derive explicit compression permission
    const canUseCompression = tier() !== 'GRATIS' && autoCompress === true

    console.log('🔒 Compression check:', {
      tier: tier(),
      autoCompress,
      canUseCompression,
      willCompress: canUseCompression,
    })

    const result = await uploadFiles(
      selectedFiles,
      selectedAlbumId,
      aiTagging,
      canUseCompression, // ✅ Pass explicit boolean
      onUpload,
      t
    )

    if (result.success) {
      // Cleanup and close
      selectedFiles.forEach((f) => URL.revokeObjectURL(f.preview))
      setSelectedFiles([])
      setSelectedAlbumId(selectedAlbum || '')
      onClose()
    }
  }

  // Handle create album
  const handleAlbumSave = async (albumData) => {
    // Reentrancy guard - prevent double creation in StrictMode
    if (isCreatingAlbum) {
      return
    }

    const cleanAlbum = {
      name: String(albumData.name || '').trim(),
      description: String(albumData.description || '').trim(),
      cover: String(albumData.cover || '').trim(),
      createdAt: new Date().toISOString(),
      userId: auth.currentUser?.uid,
    }

    if (!cleanAlbum.userId) {
      window.showToast?.('You must be logged in to create an album', 'error')
      return
    }

    if (!cleanAlbum.name) {
      window.showToast?.('Album name is required', 'error')
      return
    }

    try {
      setIsCreatingAlbum(true)

      console.log('📁 Creating album:', cleanAlbum.name)

      // Single Firestore write - creates album document
      const newAlbumRef = await addAlbum(cleanAlbum)

      console.log('✅ Album created:', {
        id: newAlbumRef.id,
        name: cleanAlbum.name,
      })

      window.showToast?.(
        `Album "${cleanAlbum.name}" created! 🎉 Ready to upload photos.`,
        'success'
      )

      // Close AlbumModal
      setShowAlbumModal(false)

      // CRITICAL: Pre-select the new album for photo upload
      setSelectedAlbumId(newAlbumRef.id)

      console.log('📸 Album pre-selected for upload:', newAlbumRef.id)

      // Notify parent to refresh UI - does NOT create another document
      if (onCreateAlbum) onCreateAlbum({ id: newAlbumRef.id, ...cleanAlbum })
    } catch (error) {
      console.error('❌ Error creating album:', error)
      window.showToast?.('Failed to create album', 'error')
    } finally {
      // Reset guard after a delay to allow modal close animations
      setTimeout(() => setIsCreatingAlbum(false), 1000)
    }
  }

  const handleCreateAlbumClick = () => {
    setShowAlbumModal(true)
  }

  // Close modal
  const handleClose = () => {
    if (uploading) return
    selectedFiles.forEach((f) => URL.revokeObjectURL(f.preview))
    setSelectedFiles([])
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[1001] p-4 animate-fade-in">
      <div
        ref={modalRef}
        tabIndex="-1"
        className={`bg-[var(--bg-secondary)] rounded-2xl shadow-2xl border border-white/10 w-full max-w-2xl max-h-[85vh] overflow-y-auto modal-content-enhanced pb-24 md:pb-8 ${
          showAlbumModal ? 'pointer-events-none opacity-50' : ''
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <Upload className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{t('upload:title')}</h2>
            </div>
          </div>
          <button
            onClick={handleClose}
            disabled={uploading}
            className="ripple-effect p-2 hover:bg-white/10 rounded-lg transition disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* File Selection Methods */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
            {/* Native Camera */}
            {isNative && (
              <button
                onClick={handleNativeCamera}
                disabled={uploading}
                className="ripple-effect flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition border border-white/10 disabled:opacity-50"
              >
                <Camera className="w-8 h-8 text-green-400" />
                <span className="text-sm font-medium">
                  {t('upload:camera')}
                </span>
              </button>
            )}

            {/* Native Gallery */}
            {isNative && (
              <button
                onClick={handleNativeGallery}
                disabled={uploading}
                className="ripple-effect flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition border border-white/10 disabled:opacity-50"
              >
                <ImageIcon className="w-8 h-8 text-purple-400" />
                <span className="text-sm font-medium">
                  {t('upload:gallery')}
                </span>
              </button>
            )}

            {/* Browse Files */}
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="ripple-effect flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-white/10 rounded-xl transition border border-white/10 disabled:opacity-50"
            >
              <FolderOpen className="w-8 h-8 text-blue-400" />
              <span className="text-sm font-medium">{t('upload:browse')}</span>
            </button>
          </div>

          {/* Drag and Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition ${
              dragActive
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-white/20 hover:border-white/40'
            }`}
          >
            <Upload className="w-12 h-12 mx-auto mb-3 opacity-60" />
            <p className="text-lg font-medium mb-1">{t('upload:dragDrop')}</p>
            <p className="text-sm opacity-60">{t('upload:supportedFormats')}</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
            onChange={handleFileInput}
            className="hidden"
          />

          {/* Selected Files Preview */}
          {selectedFiles.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-medium mb-3">
                {t('upload:selectedFiles')} ({selectedFiles.length})
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-60 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="relative group aspect-square bg-black/20 rounded-lg overflow-hidden"
                  >
                    {file.type === 'video' ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Video className="w-8 h-8 text-white" />
                      </div>
                    ) : (
                      <img
                        src={file.preview}
                        alt={file.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <button
                      onClick={() => removeFile(index)}
                      disabled={uploading}
                      className="ripple-effect absolute top-1 right-1 p-1 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition disabled:opacity-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <p className="text-xs truncate">{file.name}</p>
                      <p className="text-xs opacity-60">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* ✅ FEATURE #2: Storage Pre-Check & File Size Preview */}
              {(() => {
                const totalSelectedSize = selectedFiles.reduce((sum, f) => sum + (f.size || 0), 0)
                const storageAfterUpload = storageUsed + totalSelectedSize
                const willExceedStorage = storageAfterUpload > storageLimit
                const storagePercentageAfterUpload = storageLimit > 0 ? (storageAfterUpload / storageLimit) * 100 : 0

                return (
                  <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-400">Total size:</span>
                      <span className="text-sm font-semibold">{formatFileSize(totalSelectedSize)}</span>
                    </div>

                    <div className="flex justify-between items-center text-xs text-gray-400">
                      <span>Current storage:</span>
                      <span>{formatFileSize(storageUsed)} / {formatFileSize(storageLimit)}</span>
                    </div>

                    {/* Critical warning - will exceed storage */}
                    {willExceedStorage && (
                      <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                        <p className="text-sm text-red-400 font-semibold mb-1">
                          ⚠️ Not enough storage space!
                        </p>
                        <p className="text-xs text-red-300">
                          Upload requires {formatFileSize(totalSelectedSize)} but you only have {formatFileSize(storageLimit - storageUsed)} available.
                          Please remove some files or upgrade your plan.
                        </p>
                      </div>
                    )}

                    {/* Warning - close to limit (80-100%) */}
                    {!willExceedStorage && storagePercentageAfterUpload > 80 && (
                      <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <p className="text-sm text-yellow-400">
                          ⚠️ After upload: {storagePercentageAfterUpload.toFixed(1)}% of storage used
                        </p>
                        <p className="text-xs text-yellow-300 mt-1">
                          You'll have {formatFileSize(storageLimit - storageAfterUpload)} remaining.
                        </p>
                      </div>
                    )}

                    {/* Info - safe upload (< 80%) */}
                    {!willExceedStorage && storagePercentageAfterUpload <= 80 && (
                      <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <p className="text-xs text-blue-400">
                          ✓ After upload: {storagePercentageAfterUpload.toFixed(1)}% of storage used
                        </p>
                      </div>
                    )}
                  </div>
                )
              })()}
            </div>
          )}

          {/* Album Selection */}
          <div className="mt-6">
            <button
              onClick={() => setShowAlbums(!showAlbums)}
              disabled={uploading}
              className="ripple-effect w-full bg-white/5 hover:bg-white/10 p-4 rounded-xl transition flex items-center justify-between border border-white/10 disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <FolderOpen className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {selectedAlbumId
                    ? (Array.isArray(albums) ? albums : []).find(
                        (a) => a.id === selectedAlbumId
                      )?.name || t('upload:selectAlbum')
                    : t('upload:noAlbum')}
                </span>
              </div>
            </button>

            {showAlbums && (
              <div className="mt-2 max-h-40 overflow-y-auto bg-white/5 rounded-xl border border-white/10">
                <button
                  onClick={() => {
                    setSelectedAlbumId('')
                    setShowAlbums(false)
                  }}
                  className="ripple-effect w-full p-3 text-left hover:bg-white/10 transition text-sm"
                >
                  {t('upload:noAlbum')}
                </button>
                {(Array.isArray(albums) ? albums : []).map((album) => (
                  <button
                    key={album.id}
                    onClick={() => {
                      setSelectedAlbumId(album.id)
                      setShowAlbums(false)
                    }}
                    className="ripple-effect w-full p-3 text-left hover:bg-white/10 transition text-sm border-t border-white/5"
                  >
                    {album.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Options */}
          <div className="mt-6 space-y-3">
            {/* Auto Compress Toggle */}
            <div
              className={`rounded-xl p-4 border ${
                tier() === 'GRATIS'
                  ? 'bg-gray-600/10 border-gray-600/20'
                  : 'bg-green-500/10 border-green-500/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      tier() === 'GRATIS' ? 'bg-gray-600/20' : 'bg-green-600/30'
                    }`}
                  >
                    <Zap
                      className={`w-5 h-5 ${
                        tier() === 'GRATIS' ? 'text-gray-400' : 'text-green-400'
                      }`}
                    />
                  </div>
                  <div>
                    <p
                      className={`font-medium ${
                        tier() === 'GRATIS' ? 'text-gray-400' : ''
                      }`}
                    >
                      {t('upload:autoCompress')}
                    </p>
                    <p
                      className={`text-xs ${
                        tier() === 'GRATIS' ? 'text-gray-500' : 'text-gray-400'
                      }`}
                    >
                      {tier() === 'GRATIS'
                        ? 'Available on Lite & Pro'
                        : t('upload:autoCompressDesc')}
                    </p>
                  </div>
                </div>

                {/* Toggle switch */}
                <button
                  onClick={handleCompressToggle}
                  disabled={uploading || !authReady || tier() === 'GRATIS'}
                  className={`relative w-14 h-7 rounded-full transition ${
                    !authReady || tier() === 'GRATIS'
                      ? 'bg-gray-700 cursor-not-allowed'
                      : autoCompress
                      ? 'bg-green-600'
                      : 'bg-gray-600'
                  } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div
                    className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                      authReady && autoCompress && tier() !== 'GRATIS'
                        ? 'translate-x-7'
                        : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Info badge for FREE users */}
              {tier() === 'GRATIS' && (
                <div className="mt-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                  <p className="text-xs text-blue-400">
                    💡 GRATIS-brukere får original bildekvalitet uten
                    komprimering. Oppgrader til LITE eller PRO for
                    bildekomprimering som sparer lagring.
                  </p>
                </div>
              )}

              {/* Compression stats - only show if tier allows compression */}
              {tier() !== 'GRATIS' && compressionStats && (
                <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <p className="text-sm text-green-400 font-medium">
                    {t('upload:compressionSaved')}:{' '}
                    {compressionStats.savingsPercent?.toFixed(1) || 0}%
                  </p>
                  <p className="text-xs opacity-60">
                    {formatFileSize(compressionStats.originalSize)} →{' '}
                    {formatFileSize(compressionStats.compressedSize)}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          {uploading && (
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span>{t('upload:processing')}</span>
                {/* ✅ OPPDATERT: Vis både antall og prosent */}
                <span>
                  {totalFiles > 0 && uploadCount > 0
                    ? `${uploadCount}/${totalFiles} bilder (${processingProgress}%)`
                    : `${processingProgress}%`}
                </span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
                  style={{ width: `${processingProgress}%` }}
                />
              </div>
              {/* ✅ NY: Vise detaljert status */}
              {totalFiles > 0 && uploadCount > 0 && (
                <p className="text-xs text-gray-400 mt-2 text-center">
                  {uploadCount === totalFiles
                    ? t('upload:uploadComplete', 'Opplasting fullført! ✓')
                    : t('upload:uploadingFiles', 'Laster opp bilder...')}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 pt-4 pb-24 space-y-3 border-t border-white/10">
          <button
            onClick={handleCreateAlbumClick}
            disabled={uploading}
            className="ripple-effect w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium py-3 rounded-lg transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {t('upload:newAlbum')}
          </button>

          <button
            onClick={handleUploadClick}
            disabled={(() => {
              if (selectedFiles.length === 0 || uploading) return true
              // ✅ Disable if storage will be exceeded
              const totalSelectedSize = selectedFiles.reduce((sum, f) => sum + (f.size || 0), 0)
              const storageAfterUpload = storageUsed + totalSelectedSize
              return storageAfterUpload > storageLimit
            })()}
            className="ripple-effect w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 rounded-lg transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {uploading
              ? t('upload:uploading', { count: selectedFiles.length })
              : (() => {
                  const totalSelectedSize = selectedFiles.reduce((sum, f) => sum + (f.size || 0), 0)
                  const storageAfterUpload = storageUsed + totalSelectedSize
                  if (storageAfterUpload > storageLimit && selectedFiles.length > 0) {
                    return 'Storage limit exceeded'
                  }
                  return t('upload:uploadButton', { count: selectedFiles.length })
                })()}
          </button>

          {showAlbumModal &&
            createPortal(
              <div
                className="fixed inset-0 z-[1200] flex items-center justify-center bg-black/50 animate-fade-in"
                onClick={() => setShowAlbumModal(false)}
              >
                <div onClick={(e) => e.stopPropagation()}>
                  <AlbumModal
                    onClose={() => setShowAlbumModal(false)}
                    onSave={handleAlbumSave}
                  />
                </div>
              </div>,
              document.body
            )}
        </div>
      </div>
    </div>
  )
}

export default UploadModal
