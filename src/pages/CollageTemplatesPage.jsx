// ============================================================================
// CollageTemplatesPage - Phase 3A: Template Selection + Freemium Gate
// ============================================================================
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import useStore from '../state/store';
import useAuth from '../hooks/useAuth';
import { ROUTES } from '../routes';
import { collageTemplates } from '../features/collage/collageTemplates';
import CollageUpgradeModal from '../components/CollageUpgradeModal';

/**
 * TemplatePreview - Visual representation of template layout
 */
function TemplatePreview({ template }) {
  // Determine grid setup based on max columns
  const maxCol = Math.max(...template.previewSlots.map((s) => s.col + s.colSpan - 1));
  const maxRow = Math.max(...template.previewSlots.map((s) => s.row + s.rowSpan - 1));

  return (
    <div
      className="w-20 aspect-square rounded-xl bg-muted/50 overflow-hidden grid gap-0.5 p-0.5"
      style={{
        gridTemplateColumns: `repeat(${maxCol}, 1fr)`,
        gridTemplateRows: `repeat(${maxRow}, 1fr)`,
      }}
    >
      {template.previewSlots.map((slot) => (
        <div
          key={slot.id}
          className="bg-gradient-to-br from-purple-500/60 to-pink-500/60 rounded-sm"
          style={{
            gridColumn: `${slot.col} / span ${slot.colSpan}`,
            gridRow: `${slot.row} / span ${slot.rowSpan}`,
          }}
        />
      ))}
    </div>
  );
}

export default function CollageTemplatesPage() {
  const setIsWorldView = useStore((state) => state.setIsWorldView);
  const navigate = useNavigate();
  const { tier, isAdmin } = useAuth();

  // Upgrade modal state
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  useEffect(() => {
    console.log('═══════════════════════════════════════');
    console.log('📍 COLLAGE TEMPLATES PAGE MOUNTED');
    console.log('═══════════════════════════════════════');
    console.log('Current path:', window.location.pathname);
    console.log('History length:', window.history.length);
    console.log('Referrer:', document.referrer);
    console.log('═══════════════════════════════════════');

    setIsWorldView(true);
    return () => setIsWorldView(false);
  }, [setIsWorldView]);

  const handleBack = () => {
    console.log('═══════════════════════════════════════');
    console.log('⬅️ COLLAGE TEMPLATES BACK BUTTON DEBUG');
    console.log('═══════════════════════════════════════');
    console.log('Current path:', window.location.pathname);
    console.log('History length:', window.history.length);
    console.log('🏠 Navigating to Home with replace: true');
    console.log('═══════════════════════════════════════');
    // FIX: Navigate to Home (not to /tools!)
    // Using replace: true removes templates page from history
    navigate('/', { replace: true });
  };

  /**
   * Check if user can create collage (tier-based)
   */
  const canCreateCollage = () => {
    if (isAdmin()) return true;
    const userTier = tier();
    return userTier === 'LITE' || userTier === 'PRO';
  };

  /**
   * Handle template selection with freemium gate
   */
  const handleSelectTemplate = (template) => {
    console.log('═══════════════════════════════════════');
    console.log('📐 TEMPLATE SELECTED');
    console.log('═══════════════════════════════════════');
    console.log('Template:', template.name, `(${template.id})`);
    console.log('User tier:', tier());
    console.log('Can create collage:', canCreateCollage());

    // FREEMIUM GATE: Check tier before allowing access
    if (!canCreateCollage()) {
      console.log('🚫 FREE user - showing upgrade modal');
      setSelectedTemplate(template);
      setShowUpgradeModal(true);
      return;
    }

    // LITE/PRO/ADMIN: Allow access
    console.log('✅ Tier allows collage creation - navigating to builder');
    console.log('Navigating to:', `${ROUTES.COLLAGE_NEW}?template=${template.id}`);
    console.log('Preserving state:', location.state);
    console.log('═══════════════════════════════════════');
    navigate(`${ROUTES.COLLAGE_NEW}?template=${template.id}`, {
      state: location.state // Preserve albumId from previous navigation
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="px-4 pt-4 pb-3 border-b border-border/40">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-muted rounded-full transition"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-semibold flex-1">Choose a layout</h1>
        </div>
        <p className="text-xs text-muted-foreground pl-12">
          Select a template to start your collage.
        </p>
      </header>

      {/* Template List */}
      <main className="flex-1 px-4 py-4 overflow-y-auto">
        <div className="space-y-3 max-w-2xl">
          {collageTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleSelectTemplate(template)}
              className="w-full rounded-2xl border border-border/50 bg-card hover:bg-card/70 hover:border-border transition-all shadow-sm hover:shadow-md text-left p-4 flex gap-4 items-center active:scale-[0.98]"
            >
              {/* Left: Visual Preview */}
              <TemplatePreview template={template} />

              {/* Right: Info */}
              <div className="flex-1">
                <h3 className="font-semibold text-base mb-1">{template.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {template.minPhotos === template.maxPhotos
                    ? `${template.minPhotos} photos`
                    : `${template.minPhotos}–${template.maxPhotos} photos`}
                </p>
              </div>

              {/* Arrow Indicator */}
              <div className="text-muted-foreground">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* Info Footer */}
        <div className="mt-8 mb-4 text-center text-sm text-muted-foreground max-w-md mx-auto">
          <p>More layouts coming soon. Each template helps you create beautiful collages in seconds.</p>
        </div>
      </main>

      {/* Upgrade Modal */}
      <CollageUpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => {
          setShowUpgradeModal(false);
          setSelectedTemplate(null);
        }}
        template={selectedTemplate}
      />
    </div>
  );
}
