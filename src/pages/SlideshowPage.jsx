// ============================================================================
// SlideshowPage - Phase 1 Placeholder
// ============================================================================
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PageWrapper } from '../components/layout/PageWrapper';
import useStore from '../state/store';

export default function SlideshowPage() {
  const { id } = useParams();
  const setIsWorldView = useStore((state) => state.setIsWorldView);
  const setSlideshowActive = useStore((state) => state.setSlideshowActive);
  const setCurrentAlbumId = useStore((state) => state.setCurrentAlbumId);

  useEffect(() => {
    setIsWorldView(true);
    setSlideshowActive(true);
    setCurrentAlbumId(id);
    return () => {
      setIsWorldView(false);
      setSlideshowActive(false);
      setCurrentAlbumId(null);
    };
  }, [setIsWorldView, setSlideshowActive, setCurrentAlbumId, id]);

  return (
    <PageWrapper
      title="Slideshow"
      empty
      emptyMessage="Slideshow page placeholder (Phase 1)"
    >
      {/* will be filled in Phase 2 */}
    </PageWrapper>
  );
}
