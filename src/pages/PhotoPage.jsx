// ============================================================================
// PhotoPage - Phase 1 Placeholder
// ============================================================================
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PageWrapper } from '../components/layout/PageWrapper';
import useStore from '../state/store';

export default function PhotoPage() {
  const { id } = useParams();
  const setIsWorldView = useStore((state) => state.setIsWorldView);
  const setCurrentPhotoId = useStore((state) => state.setCurrentPhotoId);

  useEffect(() => {
    setIsWorldView(true);
    setCurrentPhotoId(id);
    return () => {
      setIsWorldView(false);
      setCurrentPhotoId(null);
    };
  }, [setIsWorldView, setCurrentPhotoId, id]);

  return (
    <PageWrapper
      title="Photo"
      empty
      emptyMessage="Photo page placeholder (Phase 1)"
    >
      {/* will be filled in Phase 2 */}
    </PageWrapper>
  );
}
