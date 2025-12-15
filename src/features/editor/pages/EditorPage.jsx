import { useParams, useNavigate } from 'react-router-dom'
import EditorShell from '../components/EditorShell'
import { usePhotoData } from '../../../hooks/usePhotoData'

// TEMP: Minimal page for Patch 01B
// Will be expanded with editorStore in Patch 03
export default function EditorPage() {
  const { photoId } = useParams()
  const navigate = useNavigate()
  const { getPhotoById } = usePhotoData()

  // Get photo from existing data layer (synchronous)
  const photo = getPhotoById(photoId)

  const handleClose = () => {
    navigate(-1)
  }

  const handleSave = () => {
    // TODO: Save logic kommer i Patch 09
    console.log('✅ Save clicked - will implement in Patch 09')
    navigate(-1)
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
    />
  )
}
