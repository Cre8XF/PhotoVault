// ============================================================================
// CollageViewer.jsx - Isolated collage viewer (read-only display)
// ============================================================================
import React, { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import usePhotoData from '../hooks/usePhotoData'
import Loading from '../components/Loading'

/**
 * CollageViewer - Displays a saved collage's final rendered image
 *
 * This is a separate viewer from CollageView (the editor).
 * It ONLY displays the collage.url image in fullscreen.
 *
 * IMPORTANT: Collages are stored as photos with type: "collage"
 * in /users/{uid}/photos/{photoId}, NOT in a separate /collages collection.
 *
 * Route: /collage/view/:id
 */
const CollageViewer = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { photos } = usePhotoData()

  const [imageLoaded, setImageLoaded] = useState(false)

  // Find collage in photos array (single source of truth)
  const collage = useMemo(() => {
    if (!id || !photos) return null
    return photos.find(p => p.id === id && (p.type === 'collage' || p.isCollage))
  }, [id, photos])

  // Handle back navigation
  const handleBack = () => {
    navigate(-1)
  }

  // Loading state - wait for photos to load
  if (!photos) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-black">
        <Loading size="xl" />
      </div>
    )
  }

  // Not found state - inline message, NO redirect
  if (!collage) {
    return (
      <div className="w-full h-screen flex flex-col bg-black">
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 z-20 p-4">
          <button
            onClick={handleBack}
            className="p-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white rounded-lg transition flex items-center gap-2"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </header>

        {/* Error message */}
        <div className="w-full h-full flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-white/70 text-sm mb-4">
              Collage not found
            </p>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Error state: no URL available
  if (!collage.url && !collage.thumbnailUrl) {
    return (
      <div className="w-full h-screen flex flex-col bg-black">
        {/* Header */}
        <header className="absolute top-0 left-0 right-0 z-20 p-4">
          <button
            onClick={handleBack}
            className="p-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white rounded-lg transition flex items-center gap-2"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Back</span>
          </button>
        </header>

        {/* Error message */}
        <div className="w-full h-full flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-white/70 text-sm mb-4">
              Collage image not available
            </p>
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-screen flex flex-col bg-black">
      {/* Header - minimal back button */}
      <header className="absolute top-0 left-0 right-0 z-20 p-4">
        <button
          onClick={handleBack}
          className="p-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white rounded-lg transition flex items-center gap-2"
          aria-label="Go back"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>
      </header>

      {/* Collage image - centered, fullscreen */}
      <div className="w-full h-full flex items-center justify-center">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loading size="lg" />
          </div>
        )}
        <img
          src={collage.url || collage.thumbnailUrl}
          alt={collage.name || collage.title || 'Collage'}
          className="max-w-full max-h-full object-contain"
          onLoad={() => setImageLoaded(true)}
          style={{ display: imageLoaded ? 'block' : 'none' }}
        />
      </div>
    </div>
  )
}

export default CollageViewer
