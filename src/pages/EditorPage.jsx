// ============================================================================
// PAGE: EditorPage.jsx - Photo Editor World (Phase 7C-1 - Foundation)
// ============================================================================

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Save, AlertCircle, Loader, Sliders, Crop as CropIcon, RotateCw, Sparkles, RotateCcw } from 'lucide-react';
import useStore from '../state/store';
import useEditorStore from '../features/editor/editorStore';
import { EditorViewport } from '../features/editor/components/EditorViewport';
import PanelShell from '../features/editor/panels/PanelShell';
import '../features/editor/editor.css';

/**
 * EditorPage - Photo Editor World (Phase 8A)
 *
 * Architecture follows World Masterplan:
 * - isWorldView = true
 * - Fixed topbar (56px) - flex: 0 0 56px
 * - Viewport shell (flexible) - flex: 1 1 auto
 * - Fixed toolbar (72px) - flex: 0 0 72px
 * - Bottom sheet panel slides up/down
 *
 * Phase 8A: Simple viewport with Google Photos behavior
 * - Image scales down when panel opens (padding-bottom approach)
 * - Entire image always visible
 * - CSS-based layout (no canvas yet - that's Phase 8B)
 */
const EditorPage = () => {
  const navigate = useNavigate();
  const { id: photoId } = useParams();
  const { t } = useTranslation();

  // Global store - World pattern
  const { setIsWorldView, setCurrentPhotoId, photos } = useStore();

  // Editor store
  const {
    originalPhoto,
    transform,
    isDirty,
    initializeEditor,
    clearEditor,
    hasTransforms,
  } = useEditorStore();

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [activeTool, setActiveTool] = useState('none');

  // Viewport ref for zoom/pan controls (Phase 8B-2)
  const viewportRef = useRef(null);

  // ============================================================================
  // INITIALIZATION - World Pattern
  // ============================================================================

  useEffect(() => {
    // Set isWorldView = true (masterplan requirement)
    setIsWorldView(true);
    setCurrentPhotoId(photoId);

    // Find photo in store
    const photo = photos?.find((p) => p.id === photoId);

    if (photo) {
      initializeEditor(photo);
      setIsLoading(false);
    } else {
      setLoadError('Photo not found');
      setIsLoading(false);
    }

    // Cleanup: Set isWorldView = false (masterplan requirement)
    return () => {
      setIsWorldView(false);
      setCurrentPhotoId(null);
      clearEditor();
    };
  }, [setIsWorldView, setCurrentPhotoId, photoId, photos, initializeEditor, clearEditor]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleBack = useCallback(() => {
    // Simple back navigation (masterplan requirement)
    navigate(-1);
  }, [navigate]);

  const handleToolChange = useCallback(
    (tool) => {
      // Toggle tool: clicking same tool closes it
      setActiveTool(activeTool === tool ? 'none' : tool);
    },
    [activeTool]
  );

  const handleReset = useCallback(() => {
    // Phase 8B-2: Reset viewport transforms
    if (viewportRef.current) {
      viewportRef.current.resetTransform();
    }
    // Reset editor store transforms
    const { resetToOriginal } = useEditorStore.getState();
    resetToOriginal();
    console.log('✅ Phase 8B-2: Reset zoom, pan, and transforms');
  }, []);

  const handleSave = useCallback(() => {
    // Phase 8A: Save functionality will be implemented in 8B/8C
    console.log('💾 Phase 8A: Save will be implemented in Phase 8B/8C');
  }, []);

  // ============================================================================
  // TOOLBAR CONFIGURATION
  // ============================================================================

  const tools = [
    { id: 'adjust', icon: Sliders, label: t('editor.adjust', 'Adjust') },
    { id: 'crop', icon: CropIcon, label: t('editor.crop', 'Crop') },
    { id: 'rotate', icon: RotateCw, label: t('editor.rotate', 'Rotate') },
    { id: 'filters', icon: Sparkles, label: t('editor.filters', 'Filters') },
  ];

  // ============================================================================
  // RENDER - World Pattern
  // ============================================================================

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-[9999]">
        <div className="text-center">
          <Loader className="w-12 h-12 mx-auto mb-4 animate-spin text-purple-500" />
          <p className="text-sm opacity-70 text-white">{t('editor.loading', 'Loading editor...')}</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center p-6 z-[9999]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <h2 className="text-xl font-bold mb-2 text-white">{t('editor.errors.loadFailed', 'Failed to load photo')}</h2>
          <p className="text-sm opacity-70 mb-4 text-white">{loadError}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition text-white font-medium"
          >
            {t('common:back', 'Back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="editor-world">
      {/* Fixed Topbar */}
      <div className="editor-topbar">
        <div className="flex items-center justify-between h-full px-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-2 py-2 hover:bg-white/10 rounded-lg transition text-white"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium hidden sm:inline">{t('common:back', 'Back')}</span>
          </button>

          <h1 className="font-bold text-base text-white">{t('editor.title', 'Edit Photo')}</h1>

          <button
            onClick={handleSave}
            disabled={!hasTransforms()}
            className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition font-medium text-white text-sm"
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">{t('editor.save', 'Save')}</span>
          </button>
        </div>
      </div>

      {/* Viewport Shell - Phase 8B-2: Canvas with Zoom/Pan */}
      <EditorViewport
        ref={viewportRef}
        photo={originalPhoto}
        hasActivePanel={activeTool !== 'none'}
      >
        {/* TODO Phase 8C: CropOverlay will be added here */}
      </EditorViewport>

      {/* Fixed Toolbar */}
      <div className="editor-toolbar">
        <div className="flex items-center justify-center gap-1 h-full px-2">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => handleToolChange(tool.id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white'
                    : 'hover:bg-white/10 text-white/70 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[9px] font-medium">{tool.label}</span>
              </button>
            );
          })}

          <div className="w-px h-8 bg-white/20 mx-1" />

          <button
            onClick={handleReset}
            disabled={!hasTransforms()}
            className="flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-white/70 hover:text-white"
          >
            <RotateCcw className="w-5 h-5" />
            <span className="text-[9px] font-medium">{t('editor.reset', 'Reset')}</span>
          </button>
        </div>
      </div>

      {/* Panel Shell - Slides up when tool is active (Phase 8B-5: photo prop) */}
      <PanelShell activeTool={activeTool} viewportRef={viewportRef} photo={originalPhoto} />
    </div>
  );
};

export default EditorPage;
