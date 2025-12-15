import { useParams, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
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
  const resetAll = useEditorStore((state) => state.resetAll)
  const cleanup = useEditorStore((state) => state.cleanup)
  const isProcessing = useEditorStore((state) => state.isProcessing)
  const setProcessing = useEditorStore((state) => state.setProcessing)

  // App store
  const user = useStore((state) => state.user)
  const showNotification = useStore((state) => state.showNotification)

  // Get photo from data layer
  const photo = getPhotoById(photoId)

  // Initialize store with photo URL
  useEffect(() => {
    if (photo) {
      // Prefer R2 URL to avoid Firebase Storage CORS issues
      const imageUrl = photo.r2Url || photo.url

      console.log(
        '📸 Editor loading image from:',
        imageUrl.includes('r2.dev') || imageUrl.includes('r2')
          ? 'R2 ✅'
          : 'Firebase Storage ⚠️'
      )

      setOriginalUrl(imageUrl)
    }

    // Cleanup on unmount
    return () => {
      cleanup()
    }
  }, [photo, setOriginalUrl, cleanup])

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
      const imageUrl = photo.r2Url || photo.url
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

  // Render editor
  return (
    <EditorShell
      imageUrl={photo.r2Url || photo.url}
      photoName={photo.name || 'Untitled'}
      onClose={handleClose}
      onSave={handleSave}
      onReset={handleReset}
      isSaving={isProcessing}
    />
  )
}
