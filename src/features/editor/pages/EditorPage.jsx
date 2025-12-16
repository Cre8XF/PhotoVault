import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import EditorShell from '../components/EditorShell'
import { usePhotoData } from '../../../hooks/usePhotoData'
import useEditorStore from '../store/editorStore'
import { exportEditedImage } from '../utils/imageExport'
import { uploadEditedPhoto } from '../../../firebase'
import useStore from '../../../state/store'

export default function EditorPage() {
  const { photoId } = useParams()
  const navigate = useNavigate()
  const { getPhotoById } = usePhotoData()

  // Editor store
  const transform = useEditorStore((state) => state.transform)
  const setOriginalUrl = useEditorStore((state) => state.setOriginalUrl)
  const setPreloadedImage = useEditorStore((state) => state.setPreloadedImage)
  const resetAll = useEditorStore((state) => state.resetAll)
  const cleanup = useEditorStore((state) => state.cleanup)
  const isProcessing = useEditorStore((state) => state.isProcessing)
  const setProcessing = useEditorStore((state) => state.setProcessing)

  // App store
  const user = useStore((state) => state.user)
  const showNotification = useStore((state) => state.showNotification)

  // Get photo from data layer
  const photo = getPhotoById(photoId)

  // ✅ Image loading state (Firebase Storage CORS fix)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(null)

  // ✅ Preload image with crossOrigin for Firebase Storage
  useEffect(() => {
    if (!photo?.url) return

    console.log('🔍 Preloading image from Firebase Storage')
    console.log('   URL:', photo.url.substring(0, 80) + '...')

    const img = new Image()

    // ✅ KRITISK: crossOrigin må settes FØR src (for canvas export)
    img.crossOrigin = 'anonymous'

    img.onload = () => {
      console.log('🎨 Image ready for canvas render', {
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

    try {
      setProcessing(true)

      // Step 1: Export edited image
      console.log('Exporting edited image...')
      const imageUrl = photo.url
      const editedBlob = await exportEditedImage(imageUrl, transform)

      // Step 2: Upload to storage and update Firestore
      console.log('Uploading to storage...')
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
    console.log('✅ Reset to original')
  }

  // Simple guard - no photo found
  if (!photo) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0a0a0a]">
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
      <div className="fixed inset-0 flex items-center justify-center bg-[#0a0a0a] p-8">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <div className="text-red-400 text-5xl">⚠️</div>
          </div>
          <p className="text-red-300 text-lg mb-2">{imageError}</p>
          <p className="text-gray-400 text-sm mb-4">
            Firebase Storage CORS must be configured by Roger.
          </p>
          <div className="text-xs text-gray-500 mb-6 p-3 bg-[#1a1a1a] rounded-lg break-all">
            <p className="font-mono">{photo.url.substring(0, 100)}...</p>
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              Retry
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
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
      <div className="fixed inset-0 flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Loading image from Firebase Storage...</p>
          <p className="text-xs text-gray-600 mt-2">
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
      isSaving={isProcessing}
    />
  )
}
