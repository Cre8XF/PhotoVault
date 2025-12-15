import { useParams, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import EditorShell from '../components/EditorShell'
import { usePhotoData } from '../../../hooks/usePhotoData'
import useEditorStore from '../store/editorStore'

// TEMP: Minimal page for Patch 01B-03
// Will be expanded with tools in Patch 04
export default function EditorPage() {
  const { photoId } = useParams()
  const navigate = useNavigate()
  const { getPhotoById } = usePhotoData()

  // Editor store
  const setOriginalUrl = useEditorStore((state) => state.setOriginalUrl)
  const resetAll = useEditorStore((state) => state.resetAll)
  const cleanup = useEditorStore((state) => state.cleanup)

  // Get photo from data layer
  const photo = getPhotoById(photoId)

  // Initialize store with photo URL
  useEffect(() => {
    if (photo?.url) {
      setOriginalUrl(photo.url)
    }

    // Cleanup on unmount
    return () => {
      cleanup()
    }
  }, [photo?.url, setOriginalUrl, cleanup])

  const handleClose = () => {
    navigate(-1)
  }

  const handleSave = () => {
    // TODO: Save logic kommer i Patch 09
    console.log('✅ Save clicked - will implement in Patch 09')
    navigate(-1)
  }

  const handleReset = () => {
    // Reset all transforms
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
      imageUrl={photo.url}
      photoName={photo.name || 'Untitled'}
      onClose={handleClose}
      onSave={handleSave}
      onReset={handleReset}
    />
  )
}
