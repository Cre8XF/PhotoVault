// src/features/editor-v2/EditorPageV2.jsx
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import useStore from '../../state/store'
import EditorShellV2 from './EditorShellV2'
import './editor-v2.css'

const usePhotoData = (photoId) => {
  const store = useStore()
  const [photo, setPhoto] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const foundPhoto = store.photos?.find((p) => p.id === photoId)
    setPhoto(foundPhoto || null)
    setLoading(false)
  }, [photoId, store.photos])

  return { photo, loading }
}

/**
 * EditorPageV2 - Wrapper page component for Editor V2
 * Responsibilities:
 * - Extract photoId from route params
 * - Fetch photo from global store (same as Editor V1)
 * - Render EditorShellV2 with photo data
 */
const EditorPageV2 = () => {
  const { id: photoId } = useParams()
  const { photo, loading } = usePhotoData(photoId)
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="editor-v2-loading">
        <p>Loading photo...</p>
      </div>
    )
  }

  if (!photo) {
    console.warn('Photo not found:', photoId)
    return <div style={{ color: 'white', padding: 20 }}>Photo not found.</div>
  }

  return <EditorShellV2 photo={photo} />
}

export default EditorPageV2
