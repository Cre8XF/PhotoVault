// src/features/editor-v2/EditorPageV2.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useStore from '../../state/store';
import EditorShellV2 from './EditorShellV2';
import './editor-v2.css';

/**
 * EditorPageV2 - Wrapper page component for Editor V2
 * Responsibilities:
 * - Extract photoId from route params
 * - Fetch photo from global store (same as Editor V1)
 * - Render EditorShellV2 with photo data
 */
const EditorPageV2 = () => {
  const { id: photoId } = useParams();
  const navigate = useNavigate();
  const photos = useStore((state) => state.photos);
  const [photo, setPhoto] = useState(null);

  useEffect(() => {
    if (!photoId) {
      console.error('No photo ID provided');
      navigate('/');
      return;
    }

    // Find photo in global store
    const foundPhoto = photos.find((p) => p.id === photoId);

    if (!foundPhoto) {
      console.error('Photo not found:', photoId);
      // Photo might still be loading, so wait a moment
      const timer = setTimeout(() => {
        const retryPhoto = photos.find((p) => p.id === photoId);
        if (!retryPhoto) {
          navigate('/');
        } else {
          setPhoto(retryPhoto);
        }
      }, 1000);
      return () => clearTimeout(timer);
    }

    setPhoto(foundPhoto);
  }, [photoId, photos, navigate]);

  if (!photo) {
    return (
      <div className="editor-v2-loading">
        <p>Loading photo...</p>
      </div>
    );
  }

  return <EditorShellV2 photo={photo} />;
};

export default EditorPageV2;
