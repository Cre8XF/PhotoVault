import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import EditorShell from '../components/EditorShell'
import { usePhotoData } from '../../../hooks/usePhotoData'
import useEditorStore from '../store/editorStore'
import { uploadEditedPhoto, updatePhoto } from '../../../firebase'
import useStore from '../../../state/store'
import useAuth from '../../../hooks/useAuth'

export default function EditorPage() {
  const { photoId } = useParams()
  const navigate = useNavigate()
  const { getPhotoById } = usePhotoData()

  // Editor store
  const transform = useEditorStore((state) => state.transform)
  const canvasRef = useEditorStore((state) => state.canvasRef)
  const setOriginalUrl = useEditorStore((state) => state.setOriginalUrl)
  const setPreloadedImage = useEditorStore((state) => state.setPreloadedImage)
  const resetAll = useEditorStore((state) => state.resetAll)
  const cleanup = useEditorStore((state) => state.cleanup)
  const isProcessing = useEditorStore((state) => state.isProcessing)
  const setProcessing = useEditorStore((state) => state.setProcessing)

  // App store
  const user = useStore((state) => state.user)
  const showNotification = useStore((state) => state.showNotification)
  const setUpgradeModal = useStore((state) => state.setUpgradeModal) // 🆕 FREEMIUM

  // 🆕 FREEMIUM: Get user tier
  const { userProfile } = useAuth()
  const tier = userProfile?.subscriptionTier || 'GRATIS'

  // Get photo from data layer
  const photo = getPhotoById(photoId)

  // ✅ Image loading state (Firebase Storage CORS fix)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(null)

  // ✅ Preload image with crossOrigin for Firebase Storage
  useEffect(() => {
    if (!photo?.url) return

    if (import.meta.env.DEV) console.log('🔍 Preloading image from Firebase Storage')
    if (import.meta.env.DEV) console.log('   URL:', photo.url.substring(0, 80) + '...')

    const img = new Image()

    // ✅ KRITISK: crossOrigin må settes FØR src (for canvas export)
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      if (import.meta.env.DEV) console.log('🎨 Image ready for canvas render', {
        width: img.naturalWidth,
        height: img.naturalHeight,
      })
      setImageLoaded(true)
      setImageError(null)
      setOriginalUrl(photo.url)
      setPreloadedImage(img) // ✅ Store HTMLImageElement for canvas
    }

    img.onerror = (e) => {
      console.error('❌ Image load failed:', {
        url: photo.url,
        error: e,
      })
      setImageError(
        'Failed to load image. Check Firebase Storage CORS settings.'
      )
      setImageLoaded(false)
      setPreloadedImage(null)
    }

    // ✅ Set src AFTER crossOrigin
    img.src = photo.url

    // Cleanup on unmount
    return () => {
      cleanup()
    }
  }, [photo?.url, setOriginalUrl, setPreloadedImage, cleanup])

  const handleClose = () => {
    navigate(-1)
  }

  /**
   * Save edited image
   */
  const handleSave = async () => {
    if (!photo || !user) {
      console.error('No photo or user found')
      return
    }

    // Check if any edits were made
    const hasEdits =
      transform.crop !== null ||
      transform.rotation !== 0 ||
      transform.flipH !== false ||
      transform.flipV !== false ||
      Object.values(transform.adjustments).some((v) => v !== 0) ||
      (transform.filter?.active && transform.filter.active !== 'none')

    if (!hasEdits) {
      showNotification('No changes to save', 'info')
      navigate(-1)
      return
    }

    // 🆕 FREEMIUM: Block save for GRATIS users with filters/adjustments
    if (tier === 'GRATIS') {
      const hasFilterOrAdjustments =
        (transform.filter?.active && transform.filter.active !== 'none') ||
        Object.values(transform.adjustments).some((v) => v !== 0)

      if (hasFilterOrAdjustments) {
        showNotification(
          '💎 Upgrade to LITE to save filters and adjustments',
          'error'
        )
        return
      }
    }

    try {
      setProcessing(true)

      // Step 1: Export from active canvas
      if (import.meta.env.DEV) console.log('💾 Exporting from editor canvas...')

      if (!canvasRef) {
        throw new Error('Editor canvas not found. Cannot save.')
      }

      if (import.meta.env.DEV) console.log('✅ Using active editor canvas', {
        width: canvasRef.width,
        height: canvasRef.height,
        hasCrop: !!transform.crop,
      })

      // Determine which canvas to export
      let canvasToExport = canvasRef

      // If crop is active, create offscreen canvas with cropped region
      if (transform.crop) {
        if (import.meta.env.DEV) console.log('🔪 Applying crop before export:', transform.crop)

        const crop = transform.crop
        const cropX = crop.x1 * canvasRef.width
        const cropY = crop.y1 * canvasRef.height
        const cropWidth = (crop.x2 - crop.x1) * canvasRef.width
        const cropHeight = (crop.y2 - crop.y1) * canvasRef.height

        if (import.meta.env.DEV) console.log('   Crop region (pixels):', {
          x: Math.round(cropX),
          y: Math.round(cropY),
          width: Math.round(cropWidth),
          height: Math.round(cropHeight),
        })

        // Create offscreen canvas for cropped output
        const offscreenCanvas = document.createElement('canvas')
        offscreenCanvas.width = Math.round(cropWidth)
        offscreenCanvas.height = Math.round(cropHeight)
        const ctx = offscreenCanvas.getContext('2d')

        // Draw cropped area from main canvas to offscreen canvas
        ctx.drawImage(
          canvasRef,
          cropX,
          cropY,
          cropWidth,
          cropHeight, // source (crop rect on main canvas)
          0,
          0,
          cropWidth,
          cropHeight // destination (full offscreen canvas)
        )

        canvasToExport = offscreenCanvas
        if (import.meta.env.DEV) console.log('✅ Cropped canvas ready', {
          width: offscreenCanvas.width,
          height: offscreenCanvas.height,
        })
      }

      const editedBlob = await new Promise((resolve, reject) => {
        canvasToExport.toBlob(
          (blob) => {
            if (blob) {
              if (import.meta.env.DEV) console.log('✅ Canvas exported successfully', {
                size: blob.size,
                type: blob.type,
              })
              resolve(blob)
            } else {
              reject(new Error('Canvas toBlob failed'))
            }
          },
          'image/jpeg',
          0.92
        )
      })

      // Step 2: Upload to storage and update Firestore
      if (import.meta.env.DEV) console.log('Uploading to storage...')
      const filterName = transform.filter?.active || 'none'
      await uploadEditedPhoto(
        user.uid,
        photoId,
        editedBlob,
        transform,
        filterName,
        null // thumbnailBlob - can be added later
      )

      // Step 3: Success notification
      showNotification('Photo saved successfully!', 'success')

      // Step 4: Navigate back
      navigate(-1)
    } catch (error) {
      console.error('Save failed:', error)

      showNotification(
        'Failed to save photo. Please try again.',
        'error'
      )
    } finally {
      setProcessing(false)
    }
  }

  const handleReset = () => {
    resetAll()
    if (import.meta.env.DEV) console.log('✅ Reset to original')
  }

  /**
   * Revert to original (unedited) photo
   * Only available if photo.edited === true
   */
  const handleRevertToOriginal = async () => {
    if (!photo || !photo.originalUrl) {
      console.error('Cannot revert: No original URL found')
      showNotification('Cannot revert to original', 'error')
      return
    }

    try {
      setProcessing(true)

      if (import.meta.env.DEV) console.log('🔄 Reverting to original photo:', {
        photoId: photo.id,
        currentUrl: photo.url,
        originalUrl: photo.originalUrl,
      })

      // Update Firestore: Reset to original URL
      await updatePhoto(photo.id, {
        url: photo.originalUrl,
        edited: false,
        editedUrl: null,
        editedAt: null,
        transforms: null,
        filter: null,
      })

      if (import.meta.env.DEV) console.log('✅ Reverted to original successfully')
      showNotification('Reverted to original image', 'success')

      // Navigate back
      navigate(-1)
    } catch (error) {
      console.error('❌ Revert failed:', error)
      showNotification('Failed to revert. Please try again.', 'error')
    } finally {
      setProcessing(false)
    }
  }

  // Simple guard - no photo found
  if (!photo) {
    return (
      <div className="fixed inset-0 flex items-center justify-center editor-bg-primary">
        <div className="text-center">
          <p className="text-red-400 text-lg mb-4">Photo not found</p>
          <button
            onClick={() => navigate(-1)}
            className="text-blue-400 hover:text-blue-300 transition-colors px-4 py-2"
          >
            Go back
          </button>
        </div>
      </div>
    )
  }

  // ✅ Show error state (Firebase Storage CORS)
  if (imageError) {
    return (
      <div className="fixed inset-0 flex items-center justify-center editor-bg-primary p-8">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <div className="text-red-400 text-5xl">⚠️</div>
          </div>
          <p className="text-red-300 text-lg mb-2">{imageError}</p>
          <p className="editor-text-muted text-sm mb-4">
            Firebase Storage CORS must be configured by Roger.
          </p>
          <div className="text-xs editor-text-muted mb-6 p-3 editor-bg-secondary rounded-lg break-all">
            <p className="font-mono">{photo.url.substring(0, 100)}...</p>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 editor-text-primary rounded-lg transition"
            >
              Retry
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 editor-text-primary rounded-lg transition"
            >
              Go back
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ✅ Show loading state
  if (!imageLoaded) {
    return (
      <div className="fixed inset-0 flex items-center justify-center editor-bg-primary">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="editor-text-muted">Loading image from Firebase Storage...</p>
          <p className="text-xs editor-text-muted mt-2">
            Verifying CORS configuration...
          </p>
        </div>
      </div>
    )
  }

  // ✅ Render editor (image loaded successfully)
  return (
    <EditorShell
      imageUrl={photo.url}
      photoName={photo.name || 'Untitled'}
      onClose={handleClose}
      onSave={handleSave}
      onReset={handleReset}
      onRevert={handleRevertToOriginal}
      isEdited={photo.edited || false}
      isSaving={isProcessing}
    />
  )
}
