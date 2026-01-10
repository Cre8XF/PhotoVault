import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePhotoData } from '../../../hooks/usePhotoData';
import useEditorV5Store from '../store/editorV5Store';
import EditorShellV5 from '../components/EditorShellV5';
import '../editorV5.css';

/**
 * EditorPageV5 - PIXTR Editor V5 (Mobile-First, Stable Canvas)
 *
 * GREENFIELD implementation with Google Photos stable canvas principle:
 * - Image viewport never moves or shrinks when tools open/close
 * - Tool panels render below the image (scrollable, never overlay)
 * - Uses CSS filters for MVP (brightness/contrast/saturate)
 * - 100dvh + safe-area insets for mobile stability
 */
export default function EditorPageV5() {
  const { photoId } = useParams();
  const navigate = useNavigate();
  const { getPhotoById } = usePhotoData();

  const setPhotoData = useEditorV5Store((state) => state.setPhotoData);
  const reset = useEditorV5Store((state) => state.reset);

  // Get photo from data layer
  const photo = getPhotoById(photoId);

  // Initialize store with photo data
  useEffect(() => {
    if (photo?.url) {
      setPhotoData(photoId, photo.url);
    }
  }, [photo?.url, photoId, setPhotoData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  // Loading/error states
  if (!photo) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#000',
        color: '#fff'
      }}>
        Loading photo...
      </div>
    );
  }

  return <EditorShellV5 />;
}
