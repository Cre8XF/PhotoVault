import { useParams, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import EditorShell from '../components/EditorShell'
import { usePhotoData } from '../../../hooks/usePhotoData'
import useEditorStore from '../store/editorStore'
import { exportEditedImage } from '../utils/imageExport'
import { uploadEditedPhoto } from '../../../firebase'
import useStore from '../../../state/store'

/**
 * Smart URL selection helper for editor
 * Priority: r2Url > editedUrl > enhancedUrl > url (with environment checks)
 * @param {Object} photo - Photo object
 * @returns {string|null} - Selected URL or null if invalid
 */
function selectEditorImageUrl(photo) {
  if (!photo) return null

  const isDev = import.meta.env.DEV

  // Priority 1: R2 URL (future-proof, CORS-friendly)
  if (photo.r2Url) {
    return photo.r2Url
  }

  // Priority 2: Edited URL (might be R2 in future)
  if (photo.editedUrl) {
    return photo.editedUrl
  }

  // Priority 3: Enhanced URL (AI-enhanced version)
  if (photo.enhancedUrl) {
    return photo.enhancedUrl
  }

  // Priority 4: Original URL (with environment-based validation)
  if (photo.url) {
    const isFirebaseStorage = !photo.url.includes('r2.dev') && !photo.url.includes('r2')

    // PRODUCTION: Block Firebase Storage URLs
    if (isFirebaseStorage && !isDev) {
      console.error('❌ PRODUCTION: Firebase Storage URLs blocked in editor')
      return null
    }

    return photo.url
  }

  return null
}

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
      const imageUrl = selectEditorImageUrl(photo)
      const isDev = import.meta.env.DEV

      // Determine source for logging
      let source = 'Unknown'
      if (imageUrl) {
        const isR2 = imageUrl.includes('r2.dev') || imageUrl.includes('r2')
        if (photo.r2Url && imageUrl === photo.r2Url) {
          source = 'R2 ✅'
        } else if (photo.editedUrl && imageUrl === photo.editedUrl) {
          source = isR2 ? 'R2 (Edited) ✅' : 'Firebase Storage (Edited) ⚠️'
        } else if (photo.enhancedUrl && imageUrl === photo.enhancedUrl) {
          source = isR2 ? 'R2 (Enhanced) ✅' : 'Firebase Storage (Enhanced) ⚠️'
        } else {
          source = isR2 ? 'R2 (Original) ✅' : `Firebase Storage (Original) ${isDev ? '(DEV ONLY) ⚠️' : '❌ BLOCKED'}`
        }
      }

      // Final validation
      if (!imageUrl) {
        console.error('❌ No valid image URL found for photo:', photo.id)
        console.error('Available fields:', {
          hasR2Url: !!photo.r2Url,
          hasEditedUrl: !!photo.editedUrl,
          hasEnhancedUrl: !!photo.enhancedUrl,
          hasUrl: !!photo.url,
        })
        console.error('Environment:', isDev ? 'DEV' : 'PRODUCTION')
        setOriginalUrl(null)
        return
      }

      console.log('📸 Editor loading image from:', source)
      console.log('   URL:', imageUrl.substring(0, 80) + '...')
      console.log('   Environment:', isDev ? 'DEV' : 'PRODUCTION')

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
      const imageUrl = selectEditorImageUrl(photo)

      if (!imageUrl) {
        throw new Error('No valid image URL available for export')
      }

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
  const imageUrl = selectEditorImageUrl(photo)

  // Show error state if no valid URL
  if (!imageUrl) {
    const isDev = import.meta.env.DEV
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0a0a0a] p-8">
        <div className="max-w-md text-center">
          <p className="text-red-400 text-lg mb-4">❌ Cannot load image in editor</p>
          <p className="text-gray-400 text-sm mb-4">
            {isDev
              ? 'Photo URL is invalid or unavailable.'
              : 'This photo uses Firebase Storage which is not supported in production. Photo must be migrated to R2 storage.'}
          </p>
          <div className="text-xs text-gray-500 mb-6 space-y-1">
            <p>Photo ID: {photo.id}</p>
            <p>Has R2 URL: {photo.r2Url ? '✅' : '❌'}</p>
            <p>Has Edited URL: {photo.editedUrl ? '✅' : '❌'}</p>
            <p>Has Enhanced URL: {photo.enhancedUrl ? '✅' : '❌'}</p>
            <p>Has Original URL: {photo.url ? '✅' : '❌'}</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="text-blue-400 hover:text-blue-300 transition-colors px-4 py-2 bg-blue-400/10 rounded-lg"
          >
            Go back
          </button>
        </div>
      </div>
    )
  }

  return (
    <EditorShell
      imageUrl={imageUrl}
      photoName={photo.name || 'Untitled'}
      onClose={handleClose}
      onSave={handleSave}
      onReset={handleReset}
      isSaving={isProcessing}
    />
  )
}
