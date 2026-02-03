import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import EditorShell from '../components/EditorShell'
import { usePhotoData } from '../../../hooks/usePhotoData'
import useEditorStore from '../store/editorStore'
import { uploadEditedPhoto, updatePhoto } from '../../../firebase'
import useStore from '../../../state/store'
import useAuth from '../../../hooks/useAuth'

export default function EditorPage() {
  const { photoId } = useParams()
  const navigate = useNavigate()
  const { t } = useTranslation(['editor', 'common'])
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
  const tier = userProfile?.subscriptionTier || 'FREE'

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

    // ✅ CRITICAL: crossOrigin must be set BEFORE src (for canvas export)
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
      setImageError(true)
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

  // Zustand store updater for syncing after save
  const updatePhotoInStore = useStore((state) => state.updatePhoto)

  /**
   * Save edited image — atomic pipeline:
   * 1. Render final canvas (rotation baked in)
   * 2. Generate thumbnail
   * 3. Upload both → await success
   * 4. Receive final URLs
   * 5. Update Firestore (inside uploadEditedPhoto)
   * 6. Update local Zustand store
   * 7. Navigate away
   *
   * If any step fails → error shown, NO state change, NO navigation.
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

    // FREEMIUM: Block save for FREE users with filters/adjustments
    if (tier === 'FREE') {
      const hasFilterOrAdjustments =
        (transform.filter?.active && transform.filter.active !== 'none') ||
        Object.values(transform.adjustments).some((v) => v !== 0)

      if (hasFilterOrAdjustments) {
        showNotification(
          'Upgrade to LITE to save filters and adjustments',
          'error'
        )
        return
      }
    }

    try {
      setProcessing(true)

      // Step 1: Export from active canvas (rotation is already baked into canvas pixels)
      if (import.meta.env.DEV) console.log('Exporting from editor canvas...')

      if (!canvasRef) {
        throw new Error('Editor canvas not found. Cannot save.')
      }

      if (import.meta.env.DEV) console.log('Using active editor canvas', {
        width: canvasRef.width,
        height: canvasRef.height,
        hasCrop: !!transform.crop,
      })

      // Determine which canvas to export
      let canvasToExport = canvasRef

      // If crop is active, create offscreen canvas with cropped region
      if (transform.crop) {
        if (import.meta.env.DEV) console.log('Applying crop before export:', transform.crop)

        const crop = transform.crop
        const cropX = crop.x1 * canvasRef.width
        const cropY = crop.y1 * canvasRef.height
        const cropWidth = (crop.x2 - crop.x1) * canvasRef.width
        const cropHeight = (crop.y2 - crop.y1) * canvasRef.height

        if (import.meta.env.DEV) console.log('Crop region (pixels):', {
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
        if (import.meta.env.DEV) console.log('Cropped canvas ready', {
          width: offscreenCanvas.width,
          height: offscreenCanvas.height,
        })
      }

      // Step 1a: Export full-resolution edited image
      const editedBlob = await new Promise((resolve, reject) => {
        canvasToExport.toBlob(
          (blob) => {
            if (blob) {
              if (import.meta.env.DEV) console.log('Canvas exported successfully', {
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

      // Step 1b: Generate thumbnail from the edited canvas
      let thumbnailBlob = null
      try {
        const MAX_THUMB = 400
        const thumbScale = Math.min(
          MAX_THUMB / canvasToExport.width,
          MAX_THUMB / canvasToExport.height,
          1
        )
        const thumbCanvas = document.createElement('canvas')
        thumbCanvas.width = Math.round(canvasToExport.width * thumbScale)
        thumbCanvas.height = Math.round(canvasToExport.height * thumbScale)
        const thumbCtx = thumbCanvas.getContext('2d')
        thumbCtx.drawImage(canvasToExport, 0, 0, thumbCanvas.width, thumbCanvas.height)

        thumbnailBlob = await new Promise((resolve) => {
          thumbCanvas.toBlob(
            (blob) => resolve(blob),
            'image/jpeg',
            0.7
          )
        })
        if (import.meta.env.DEV) console.log('Thumbnail generated', {
          size: thumbnailBlob?.size,
          width: thumbCanvas.width,
          height: thumbCanvas.height,
        })
      } catch (thumbError) {
        // Thumbnail generation failure is non-fatal
        console.warn('Thumbnail generation failed, continuing without:', thumbError)
      }

      // Step 2: Upload to storage and update Firestore (atomic — awaited)
      if (import.meta.env.DEV) console.log('Uploading to storage...')
      const filterName = transform.filter?.active || 'none'
      const result = await uploadEditedPhoto(
        user.uid,
        photoId,
        editedBlob,
        transform,
        filterName,
        thumbnailBlob
      )

      // Step 3: Update local Zustand store immediately (no waiting for Firestore listener)
      // This ensures grid, viewer, slideshow, and share all use the same URL
      const storeUpdate = {
        url: result.editedUrl,
        displayUrl: result.editedUrl,
        editedUrl: result.editedUrl,
        thumbnailUrl: result.thumbnailUrl || result.editedUrl,
        edited: true,
        editedAt: new Date().toISOString(),
        transforms: transform,
        filter: filterName,
      }
      updatePhotoInStore(photoId, storeUpdate)

      if (import.meta.env.DEV) console.log('Local store updated with edited URLs', {
        editedUrl: result.editedUrl,
        thumbnailUrl: result.thumbnailUrl,
      })

      // Step 4: Only now — notify success and navigate
      showNotification('Photo saved successfully!', 'success')
      navigate(-1)
    } catch (error) {
      // Save failed — NO state change, NO navigation
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

      if (import.meta.env.DEV) console.log('Reverting to original photo:', {
        photoId: photo.id,
        currentUrl: photo.url,
        originalUrl: photo.originalUrl,
      })

      // Update Firestore: Reset to original URL (including displayUrl + thumbnailUrl)
      const revertUpdates = {
        url: photo.originalUrl,
        displayUrl: photo.originalUrl,
        thumbnailUrl: photo.originalUrl,
        edited: false,
        editedUrl: null,
        editedAt: null,
        transforms: null,
        filter: null,
      }
      await updatePhoto(photo.id, revertUpdates)

      // Update local store immediately
      updatePhotoInStore(photoId, revertUpdates)

      if (import.meta.env.DEV) console.log('Reverted to original successfully')
      showNotification('Reverted to original image', 'success')

      // Navigate back
      navigate(-1)
    } catch (error) {
      console.error('Revert failed:', error)
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
          <p className="text-red-400 text-lg mb-4">{t('editor:photoNotFound')}</p>
          <button
            onClick={() => navigate(-1)}
            className="text-blue-400 hover:text-blue-300 transition-colors px-4 py-2"
          >
            {t('editor:goBack')}
          </button>
        </div>
      </div>
    )
  }

  // ✅ Show error state (image load / CORS failure)
  if (imageError) {
    return (
      <div className="fixed inset-0 flex items-center justify-center editor-bg-primary p-8">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <div className="text-red-400 text-5xl">⚠️</div>
          </div>
          <p className="text-red-300 text-lg mb-2">{t('editor:imageLoadError')}</p>
          <p className="editor-text-muted text-sm mb-6">
            {t('editor:corsHint')}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 editor-text-primary rounded-lg transition"
            >
              {t('editor:retry')}
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 editor-text-primary rounded-lg transition"
            >
              {t('editor:goBack')}
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
          <p className="editor-text-muted">{t('editor:loadingImage')}</p>
          <p className="text-xs editor-text-muted mt-2">
            {t('editor:preparingEditor')}
          </p>
        </div>
      </div>
    )
  }

  // ✅ Render editor (image loaded successfully)
  return (
    <EditorShell
      imageUrl={photo.url}
      photoName={photo.name || t('editor:untitled')}
      onClose={handleClose}
      onSave={handleSave}
      onReset={handleReset}
      onRevert={handleRevertToOriginal}
      isEdited={photo.edited || false}
      isSaving={isProcessing}
    />
  )
}
