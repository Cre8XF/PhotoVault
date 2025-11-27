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
import CropOverlay from '../features/editor/components/CropOverlay';
import PanelShell from '../features/editor/panels/PanelShell';
import '../features/editor/editor.css';

/**
 * Create centered default crop rect (80% of image, centered)
 */
const createCenteredCrop = () => {
  const margin = 0.1; // 10% margin on each side
  return {
    x1: margin,
    y1: margin,
    x2: 1 - margin,
    y2: 1 - margin,
    aspectRatio: null,
  };
};

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
  const [isCropApplied, setIsCropApplied] = useState(false);
  const [viewportDimensions, setViewportDimensions] = useState(null);
  const [viewportTransform, setViewportTransform] = useState({ zoom: 1, panX: 0, panY: 0 });

  // Viewport ref for zoom/pan controls (Phase 8B-2)
  const viewportRef = useRef(null);

  // ============================================================================
  // INITIALIZATION - World Pattern
  // ============================================================================

  // ============================================================================
  // SCROLL LOCK (Phase 8C-5: Critical Overlay Isolation)
  // ============================================================================

  useEffect(() => {
    // Lock background scroll when editor is mounted
    const previousOverflow = document.body.style.overflow;
    const previousPosition = document.body.style.position;

    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';

    return () => {
      // Restore previous scroll behavior
      document.body.style.overflow = previousOverflow;
      document.body.style.position = previousPosition;
      document.body.style.width = '';
    };
  }, []);

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
      // Clear applied crop when switching tools
      if (isCropApplied && viewportRef.current) {
        viewportRef.current.clearCrop();
        setIsCropApplied(false);
        console.log('🔷 Cleared applied crop when switching tools');
      }

      // Toggle tool: clicking same tool closes it
      const newTool = activeTool === tool ? 'none' : tool;
      setActiveTool(newTool);

      // Initialize default crop when crop tool is activated (Phase 8C-3)
      if (newTool === 'crop' && !transform.crop) {
        const centeredCrop = createCenteredCrop();
        const { applyTransform } = useEditorStore.getState();
        applyTransform('crop', centeredCrop);
        console.log('🎯 Initialized centered crop:', centeredCrop);
      }
    },
    [activeTool, transform.crop, isCropApplied]
  );

  const handleReset = useCallback(() => {
    // Phase 8C-4: Reset viewport transforms AND adjust values
    if (viewportRef.current) {
      viewportRef.current.resetTransform();
      viewportRef.current.resetAdjustValues();
    }
    // Reset editor store transforms
    const { resetToOriginal } = useEditorStore.getState();
    resetToOriginal();
    console.log('✅ Phase 8C-4: Reset zoom, pan, adjust, and all transforms');
  }, []);

  const handleSave = useCallback(() => {
    // Phase 8A: Save functionality will be implemented in 8B/8C
    console.log('💾 Phase 8A: Save will be implemented in Phase 8B/8C');
  }, []);

  const handleCropChange = useCallback((newCropRect) => {
    const { applyTransform } = useEditorStore.getState();
    applyTransform('crop', newCropRect);

    // Force CropOverlay re-render by updating viewport dimensions
    if (viewportRef.current) {
      const updateDimensions = () => {
        const imageSize = viewportRef.current.getImageSize();
        const canvas = viewportRef.current.canvasRef?.current;
        const container = viewportRef.current.containerRef?.current;

        if (imageSize && canvas && container) {
          const rect = container.getBoundingClientRect();
          const scaleX = rect.width / imageSize.width;
          const scaleY = rect.height / imageSize.height;
          const fitScale = Math.min(scaleX, scaleY);

          setViewportDimensions({
            canvasWidth: rect.width,
            canvasHeight: rect.height,
            imageWidth: imageSize.width * fitScale,
            imageHeight: imageSize.height * fitScale,
          });
        }
      };
      updateDimensions();
    }
  }, []);

  // Update viewport dimensions when crop tool is active (Phase 8C-3)
  useEffect(() => {
    if (activeTool === 'crop' && viewportRef.current) {
      const updateDimensions = () => {
        const imageSize = viewportRef.current.getImageSize();
        const canvas = viewportRef.current.canvasRef?.current;
        const container = viewportRef.current.containerRef?.current;

        if (imageSize && canvas && container) {
          const rect = container.getBoundingClientRect();

          // Calculate fitted dimensions (base size at zoom=1)
          const scaleX = rect.width / imageSize.width;
          const scaleY = rect.height / imageSize.height;
          const fitScale = Math.min(scaleX, scaleY);

          const fittedWidth = imageSize.width * fitScale;
          const fittedHeight = imageSize.height * fitScale;

          setViewportDimensions({
            canvasWidth: rect.width,
            canvasHeight: rect.height,
            imageWidth: fittedWidth,
            imageHeight: fittedHeight,
          });
        }
      };

      // Update immediately
      updateDimensions();

      // Update on resize
      const handleResize = () => updateDimensions();
      window.addEventListener('resize', handleResize);

      return () => window.removeEventListener('resize', handleResize);
    }
  }, [activeTool]);

  // Sync viewport transform for CropOverlay (Phase 8C-5 FIX: Event-based)
  useEffect(() => {
    if (activeTool !== 'crop' || !viewportRef.current) return;

    // Initial sync
    const initialTransform = viewportRef.current.getTransform();
    if (initialTransform) {
      setViewportTransform({
        zoom: initialTransform.zoom,
        panX: initialTransform.panX,
        panY: initialTransform.panY,
      });
    }

    // Listen for transform changes via custom event
    const handleTransformChange = (event) => {
      const { zoom, panX, panY } = event.detail;
      setViewportTransform({ zoom, panX, panY });
    };

    const canvas = viewportRef.current.canvasRef?.current;
    if (canvas) {
      canvas.addEventListener('transformUpdate', handleTransformChange);

      return () => {
        canvas.removeEventListener('transformUpdate', handleTransformChange);
      };
    }
  }, [activeTool]);

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
      {/* Minimal Header - Back button only */}
      <div className="editor-minimal-header">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-lg transition text-white"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">{t('common:back', 'Back')}</span>
        </button>
      </div>

      {/* Viewport Shell - Phase 8C-4: Canvas with Crop Support */}
      <EditorViewport
        ref={viewportRef}
        photo={originalPhoto}
        hasActivePanel={activeTool !== 'none'}
      >
        {/* CropOverlay - Phase 8C-4: synced with viewport transform */}
        {activeTool === 'crop' && transform.crop && viewportDimensions && (
          <CropOverlay
            cropRect={transform.crop}
            onCropChange={handleCropChange}
            viewportRef={viewportRef}
            canvasWidth={viewportDimensions.canvasWidth}
            canvasHeight={viewportDimensions.canvasHeight}
            imageWidth={viewportDimensions.imageWidth}
            imageHeight={viewportDimensions.imageHeight}
            transform={viewportTransform}
          />
        )}
      </EditorViewport>

      {/* Unified Footer - 3 rows: tools | panel | actions */}
      <div className="editor-unified-footer">
        {/* Row 1: Tool Selector */}
        <div className="tool-selector-row">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => handleToolChange(tool.id)}
                className={`tool-button ${
                  isActive
                    ? 'tool-button--active'
                    : ''
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tool.label}</span>
              </button>
            );
          })}

          <div className="tool-divider" />

          <button
            onClick={handleReset}
            disabled={!hasTransforms()}
            className="tool-button disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <RotateCcw className="w-5 h-5" />
            <span>{t('editor.reset', 'Reset')}</span>
          </button>
        </div>

        {/* Row 2: Panel Content Wrapper - Fixed 260px */}
        <div className="panel-content-wrapper">
          <PanelShell
            activeTool={activeTool}
            viewportRef={viewportRef}
            photo={originalPhoto}
            onCropApplied={() => {
              setIsCropApplied(true);
              setActiveTool('none');
              console.log('✅ Crop applied - closing crop tool');
            }}
          />
        </div>

        {/* Row 3: Action Buttons */}
        <div className="action-buttons-row">
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition font-medium text-white text-sm"
          >
            {t('common:cancel', 'Cancel')}
          </button>
          <button
            onClick={handleSave}
            disabled={!hasTransforms()}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition font-medium text-white text-sm"
          >
            <Save className="w-4 h-4" />
            {t('editor.save', 'Save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditorPage;
