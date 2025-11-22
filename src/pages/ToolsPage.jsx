// ============================================================================
// ToolsPage - Phase 1 Placeholder
// ============================================================================
import React, { useEffect } from 'react';
import { PageWrapper } from '../components/layout/PageWrapper';
import useStore from '../state/store';

export default function ToolsPage() {
  const setIsWorldView = useStore((state) => state.setIsWorldView);

  useEffect(() => {
    setIsWorldView(true);
    return () => setIsWorldView(false);
  }, [setIsWorldView]);

  return (
    <PageWrapper
      title="Tools"
      empty
      emptyMessage="Tools page placeholder (Phase 1)"
    >
      {/* will be filled in future phases */}
    </PageWrapper>
  );
}
