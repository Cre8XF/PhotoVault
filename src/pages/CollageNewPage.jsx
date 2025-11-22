// ============================================================================
// CollageNewPage - Phase 3A: Receives template ID (builder in Phase 3B)
// ============================================================================
import React, { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Loader } from 'lucide-react';
import { PageWrapper } from '../components/layout/PageWrapper';
import useStore from '../state/store';
import { ROUTES } from '../routes';
import { getTemplateById } from '../features/collage/collageTemplates';

export default function CollageNewPage() {
  const setIsWorldView = useStore((state) => state.setIsWorldView);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get template ID from query string
  const templateId = searchParams.get('template');

  // Find the template
  const template = useMemo(() => {
    if (!templateId) return null;
    return getTemplateById(templateId);
  }, [templateId]);

  useEffect(() => {
    setIsWorldView(true);
    return () => setIsWorldView(false);
  }, [setIsWorldView]);

  const handleBack = () => {
    navigate(ROUTES.COLLAGE_TEMPLATES);
  };

  // No template selected
  if (!templateId) {
    return (
      <PageWrapper
        title="New Collage"
        error="No template selected. Please choose a template first."
      >
        <button
          onClick={handleBack}
          className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
        >
          Choose template
        </button>
      </PageWrapper>
    );
  }

  // Template not found
  if (!template) {
    return (
      <PageWrapper
        title="New Collage"
        error={`Template "${templateId}" not found.`}
      >
        <button
          onClick={handleBack}
          className="mt-4 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
        >
          Choose different template
        </button>
      </PageWrapper>
    );
  }

  // Template selected - Placeholder for Phase 3B
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="px-4 pt-4 pb-3 border-b border-border/40">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-muted rounded-full transition"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold">New Collage</h1>
            <p className="text-xs text-muted-foreground">{template.name}</p>
          </div>
        </div>
      </header>

      {/* Placeholder Content - Phase 3B will add the actual builder */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
            <Loader className="w-10 h-10 text-white animate-spin" />
          </div>

          <h2 className="text-2xl font-bold mb-2">Collage Builder Coming Soon</h2>
          <p className="text-muted-foreground mb-6">
            Phase 3A complete! Template "{template.name}" selected successfully.
          </p>

          <div className="bg-muted/50 rounded-lg p-4 text-sm text-left space-y-2 mb-6">
            <p><strong>Template ID:</strong> {template.id}</p>
            <p><strong>Photos needed:</strong> {template.minPhotos === template.maxPhotos
              ? template.minPhotos
              : `${template.minPhotos}–${template.maxPhotos}`}</p>
            <p><strong>Aspect ratio:</strong> {template.aspectRatio}:1</p>
            <p><strong>Slots:</strong> {template.previewSlots.length}</p>
          </div>

          <p className="text-xs text-muted-foreground">
            The full collage builder will be implemented in Phase 3B.
          </p>

          <button
            onClick={handleBack}
            className="mt-6 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
          >
            Choose different template
          </button>
        </div>
      </main>
    </div>
  );
}
