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
import { auth, addAlbum } from '../firebase'

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

const UploadModal = ({
  isOpen,
  onClose,
  onUpload,
  onCreateAlbum,
  albums = [],
  selectedAlbum = null,
}) => {
  // UI State
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
    const saved = localStorage.getItem('autoCompress')
    return saved !== 'false'
  })
  const [aiTagging] = useState(false) // Always false for MVP
  const [isCreatingAlbum, setIsCreatingAlbum] = useState(false) // Reentrancy guard

  // Refs
  const fileInputRef = useRef(null)
  const modalRef = useRef(null)

  // Hooks
  const isNative = isNativePlatform()
  const { t } = useTranslation(['common', 'upload'])
  const {
    uploading,
    processingProgress,
    compressionStats,
    validateFiles,
    uploadFiles,
  } = useUpload()

  // Permission check for native platforms
  useEffect(() => {
    if (isNative) checkPermissionsAsync()
  }, [isNative])

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
    const { validFiles, errors, warnings } = await validateFiles(files)

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

  // Toggle compression
  const handleCompressToggle = () => {
    const newValue = !autoCompress
    setAutoCompress(newValue)
    localStorage.setItem('autoCompress', newValue.toString())
  }

  // Handle upload
  const handleUploadClick = async () => {
    const result = await uploadFiles(
      selectedFiles,
      selectedAlbumId,
      aiTagging,
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

      // Single Firestore write - creates album document
      const newAlbumRef = await addAlbum(cleanAlbum)

      window.showToast?.('Album created 🎉', 'success')
      setShowAlbumModal(false)

      // Notify parent to refresh UI - does NOT create another document
      if (onCreateAlbum) onCreateAlbum({ id: newAlbumRef.id, ...cleanAlbum })
    } catch (error) {
      console.error('Error creating album:', error)
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
              <p className="text-sm text-gray-400">{t('upload:subtitle')}</p>
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

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
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
            accept="image/*,video/*"
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
                      className="absolute top-1 right-1 p-1 bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition disabled:opacity-50"
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
                    ? albums.find((a) => a.id === selectedAlbumId)?.name ||
                      t('upload:selectAlbum')
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
                  className="w-full p-3 text-left hover:bg-white/10 transition text-sm"
                >
                  {t('upload:noAlbum')}
                </button>
                {albums.map((album) => (
                  <button
                    key={album.id}
                    onClick={() => {
                      setSelectedAlbumId(album.id)
                      setShowAlbums(false)
                    }}
                    className="w-full p-3 text-left hover:bg-white/10 transition text-sm border-t border-white/5"
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
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-600/30 rounded-lg">
                    <Zap className="w-5 h-5 text-green-400" />
                  </div>
                  <div>
                    <p className="font-medium">{t('upload:autoCompress')}</p>
                    <p className="text-xs text-gray-400">
                      {t('upload:autoCompressDesc')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCompressToggle}
                  disabled={uploading}
                  className={`relative w-14 h-7 rounded-full transition ${
                    autoCompress ? 'bg-green-600' : 'bg-gray-600'
                  } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div
                    className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                      autoCompress ? 'translate-x-7' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {uploading && (
            <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                <span>{t('upload:processing')}</span>
                <span>{processingProgress}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-300"
                  style={{ width: `${processingProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Compression Stats */}
          {compressionStats && (
            <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
              <p className="text-sm text-green-400 font-medium">
                {t('upload:compressionSaved')}:{' '}
                {compressionStats.savedPercentage}%
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {formatFileSize(compressionStats.originalSize)} →{' '}
                {formatFileSize(compressionStats.compressedSize)}
              </p>
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
            disabled={selectedFiles.length === 0 || uploading}
            className="ripple-effect w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 rounded-lg transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {uploading
              ? t('upload:uploading', { count: selectedFiles.length })
              : t('upload:uploadButton', { count: selectedFiles.length })}
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
