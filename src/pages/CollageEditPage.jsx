// ============================================================================
// CollageEditPage - Phase 1 Placeholder
// ============================================================================
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { PageWrapper } from '../components/layout/PageWrapper';
import useStore from '../state/store';

export default function CollageEditPage() {
  const { id } = useParams();
  const setIsWorldView = useStore((state) => state.setIsWorldView);
  const setCollageEditId = useStore((state) => state.setCollageEditId);

  useEffect(() => {
    setIsWorldView(true);
    setCollageEditId(id);
    return () => {
      setIsWorldView(false);
      setCollageEditId(null);
    };
  }, [setIsWorldView, setCollageEditId, id]);

  return (
    <PageWrapper
      title={`Edit Collage ${id}`}
      empty
      emptyMessage="Collage edit page placeholder (Phase 1)"
    >
      {/* will be filled in future phases */}
    </PageWrapper>
  );
}
