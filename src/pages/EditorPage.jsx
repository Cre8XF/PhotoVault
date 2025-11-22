// ============================================================================
// PAGE: EditorPage.jsx - Photo Editor World (Phase 4)
// ============================================================================

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Save, AlertCircle, Loader, Sliders, Crop as CropIcon, RotateCw, Sparkles, RotateCcw } from 'lucide-react';
import { PageWrapper } from '../components/layout/PageWrapper';
import useStore from '../state/store';
import useEditorStore from '../features/editor/editorStore';
import EditorPreview from '../features/editor/components/EditorPreview';
import { getFilterPreset } from '../features/editor/utils/filterPresets';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import '../features/editor/editor.css';

/**
 * EditorPage - Photo Editor World
 *
 * Full-featured photo editor as a function world
 * - Non-destructive editing with CSS transforms
 * - Adjust, Crop, Rotate, Filters modes
 * - Save copy or replace original
 * - Exit guard on unsaved changes
 */
const EditorPage = () => {
  const navigate = useNavigate();
  const { id: photoId } = useParams();
  const { t } = useTranslation();

  // Global store
  const { setIsWorldView, setCurrentPhotoId, photos } = useStore();

  // Editor store
  const {
    originalPhoto,
    transform,
    activeMode,
    isDirty,
    initializeEditor,
    applyTransform,
    applyBatch,
    resetToOriginal,
    setActiveMode,
    clearEditor,
    hasTransforms,
  } = useEditorStore();

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showExitWarning, setShowExitWarning] = useState(false);
  const [showSaveOptions, setShowSaveOptions] = useState(false);

  // Mobile detection (Phase 7A.1)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  useEffect(() => {
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
    if (isDirty) {
      setShowExitWarning(true);
    } else {
      navigate(-1);
    }
  }, [isDirty, navigate]);

  const handleModeChange = useCallback(
    (mode) => {
      setActiveMode(activeMode === mode ? null : mode);
    },
    [activeMode, setActiveMode]
  );

  const handleReset = useCallback(() => {
    resetToOriginal();
  }, [resetToOriginal]);

  const handleSave = useCallback(() => {
    setShowSaveOptions(true);
  }, []);

  const handleSaveCopy = useCallback(async () => {
    try {
      setIsSaving(true);

      const user = auth.currentUser;
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Create new photo entry with transforms
      const photosRef = collection(db, 'users', user.uid, 'photos');
      await addDoc(photosRef, {
        ...originalPhoto,
        name: `${originalPhoto.name} (edited)`,
        editTransform: transform,
        edited: true,
        editedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      });

      setShowSaveOptions(false);
      navigate(-1);
    } catch (error) {
      console.error('Error saving copy:', error);
      alert(t('editor.errors.saveFailed', 'Failed to save photo'));
    } finally {
      setIsSaving(false);
    }
  }, [originalPhoto, transform, navigate, t]);

  const handleReplaceOriginal = useCallback(async () => {
    try {
      setIsSaving(true);

      const user = auth.currentUser;
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Update original photo with transforms
      const photoRef = doc(db, 'users', user.uid, 'photos', photoId);
      await updateDoc(photoRef, {
        editTransform: transform,
        edited: true,
        editedAt: new Date().toISOString(),
      });

      setShowSaveOptions(false);
      navigate(-1);
    } catch (error) {
      console.error('Error replacing original:', error);
      alert(t('editor.errors.saveFailed', 'Failed to save photo'));
    } finally {
      setIsSaving(false);
    }
  }, [photoId, transform, navigate, t]);

  // ============================================================================
  // PANEL RENDERING
  // ============================================================================

  const renderPanel = () => {
    if (!activeMode) return null;

    return (
      <>
        <h3 className="text-lg font-bold mb-4">{modes.find((m) => m.id === activeMode)?.label}</h3>

        {/* Adjust Panel */}
        {activeMode === 'adjust' && (
          <div className="space-y-4">
            {['brightness', 'contrast', 'saturation', 'temperature', 'blur', 'vignette'].map((prop) => (
              <div key={prop}>
                <label className="text-sm font-medium mb-2 block capitalize">
                  {t(`editor.${prop}`, prop)}
                </label>
                <input
                  type="range"
                  min={prop === 'blur' ? 0 : -100}
                  max={prop === 'blur' || prop === 'vignette' ? 10 : 100}
                  value={transform[prop]}
                  onChange={(e) => applyTransform(prop, Number(e.target.value))}
                  className="w-full"
                />
                <span className="text-xs opacity-50">{transform[prop]}</span>
              </div>
            ))}
          </div>
        )}

        {/* Crop Panel */}
        {activeMode === 'crop' && (
          <div className="space-y-4">
            <p className="text-sm opacity-70 mb-4">
              {t('editor.crop.instructions', 'Drag handles to adjust crop area')}
            </p>

            {/* Zoom Controls */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t('editor.crop.zoomIn', 'Zoom')} ({(useEditorStore.getState().zoom.currentZoom * 100).toFixed(0)}%)
              </label>
              <input
                type="range"
                min={50}
                max={300}
                value={useEditorStore.getState().zoom.currentZoom * 100}
                onChange={(e) => useEditorStore.getState().setZoom(Number(e.target.value) / 100)}
                className="w-full"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => useEditorStore.getState().setZoom(useEditorStore.getState().zoom.currentZoom - 0.1)}
                  className="flex-1 px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition text-sm"
                >
                  {t('editor.crop.zoomOut', 'Zoom Out')}
                </button>
                <button
                  onClick={() => useEditorStore.getState().setZoom(useEditorStore.getState().zoom.currentZoom + 0.1)}
                  className="flex-1 px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition text-sm"
                >
                  {t('editor.crop.zoomIn', 'Zoom In')}
                </button>
              </div>
            </div>

            {/* Reset Zoom */}
            <button
              onClick={() => useEditorStore.getState().resetZoomPan()}
              disabled={useEditorStore.getState().zoom.currentZoom === 1}
              className="w-full px-4 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('editor.crop.resetZoom', 'Reset Zoom')}
            </button>

            {/* Aspect Ratio Presets */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                {t('editor.crop.aspectRatio', 'Aspect Ratio')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const crop = transform.crop;
                    if (crop) applyTransform('crop', { ...crop, aspectRatio: null });
                  }}
                  className="px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition text-sm"
                >
                  {t('editor.crop.free', 'Free')}
                </button>
                <button
                  onClick={() => {
                    const crop = transform.crop;
                    if (crop) applyTransform('crop', { ...crop, aspectRatio: 1 });
                  }}
                  className="px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition text-sm"
                >
                  {t('editor.crop.square', 'Square')}
                </button>
                <button
                  onClick={() => {
                    const crop = transform.crop;
                    if (crop) applyTransform('crop', { ...crop, aspectRatio: 4/5 });
                  }}
                  className="px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition text-sm"
                >
                  {t('editor.crop.portrait', 'Portrait')}
                </button>
                <button
                  onClick={() => {
                    const crop = transform.crop;
                    if (crop) applyTransform('crop', { ...crop, aspectRatio: 16/9 });
                  }}
                  className="px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition text-sm"
                >
                  {t('editor.crop.landscape', 'Landscape')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rotate Panel */}
        {activeMode === 'rotate' && (
          <div className="space-y-4">
            <button
              onClick={() => applyTransform('rotate', (transform.rotate + 90) % 360)}
              className="w-full px-4 py-3 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
            >
              {t('editor.rotate90', 'Rotate 90°')}
            </button>
            <button
              onClick={() => applyTransform('flipH', !transform.flipH)}
              className="w-full px-4 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition"
            >
              {t('editor.flipHorizontal', 'Flip Horizontal')}
            </button>
            <button
              onClick={() => applyTransform('flipV', !transform.flipV)}
              className="w-full px-4 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition"
            >
              {t('editor.flipVertical', 'Flip Vertical')}
            </button>
          </div>
        )}

        {/* Filters Panel */}
        {activeMode === 'filters' && (
          <div className="grid grid-cols-2 gap-3">
            {['none', 'vintage', 'bright', 'bw', 'cinematic', 'warm', 'cool', 'fade'].map((filterId) => {
              const preset = getFilterPreset(filterId);
              return (
                <button
                  key={filterId}
                  onClick={() => applyBatch(preset.transform)}
                  className="px-4 py-3 bg-white/10 rounded-lg hover:bg-white/20 transition text-sm"
                >
                  {t(`editor.filters.${filterId}`, preset.name)}
                </button>
              );
            })}
          </div>
        )}
      </>
    );
  };

  const modes = [
    { id: 'adjust', icon: Sliders, label: t('editor.adjust', 'Adjust') },
    { id: 'crop', icon: CropIcon, label: t('editor.crop', 'Crop') },
    { id: 'rotate', icon: RotateCw, label: t('editor.rotate', 'Rotate') },
    { id: 'filters', icon: Sparkles, label: t('editor.filters', 'Filters') },
  ];

  // ============================================================================
  // RENDER
  // ============================================================================

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-12 h-12 mx-auto mb-4 animate-spin text-purple-500" />
            <p className="text-sm opacity-70">{t('editor.loading', 'Loading editor...')}</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (loadError) {
    return (
      <PageWrapper>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <h2 className="text-xl font-bold mb-2">{t('editor.errors.loadFailed', 'Failed to load photo')}</h2>
            <p className="text-sm opacity-70 mb-4">{loadError}</p>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition"
            >
              {t('common:back', 'Back')}
            </button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="min-h-screen flex flex-col bg-black">
        {/* Top Bar */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">{t('common:back', 'Back')}</span>
            </button>

            <h1 className="font-bold text-lg">{t('editor.title', 'Edit Photo')}</h1>

            <button
              onClick={handleSave}
              disabled={!hasTransforms()}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition font-medium"
            >
              <Save className="w-4 h-4" />
              <span className="text-sm">{t('editor.save', 'Save')}</span>
            </button>
          </div>
        </div>

        {/* MOBILE LAYOUT */}
        {isMobile ? (
          <div className="flex flex-col w-full h-full relative">
            {/* Preview Section (always visible on mobile) */}
            <div className="editor-preview-mobile relative overflow-hidden">
              <EditorPreview
                photo={originalPhoto}
                transform={transform}
                activeMode={activeMode}
              />
            </div>

            {/* Toolbar – fixed on mobile */}
            <div className="editor-toolbar-mobile fixed left-0 right-0 z-50">
              <div className="flex items-center justify-center gap-2 bg-black/90 backdrop-blur-xl border-t border-white/20 px-4 py-3">
                {modes.map((mode) => {
                  const Icon = mode.icon;
                  const isActive = activeMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => handleModeChange(mode.id)}
                      className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                        isActive ? 'bg-purple-600 text-white' : 'hover:bg-white/10 text-white/70 hover:text-white'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-[10px] font-medium">{mode.label}</span>
                    </button>
                  );
                })}

                <div className="w-px h-10 bg-white/20 mx-1" />

                <button
                  onClick={handleReset}
                  disabled={!hasTransforms()}
                  className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-white/70 hover:text-white"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span className="text-[10px] font-medium">{t('editor.reset', 'Reset')}</span>
                </button>
              </div>
            </div>

            {/* Bottom Sheet Panel */}
            {activeMode && (
              <div className="editor-panel-mobile fixed bottom-0 left-0 right-0 bg-black/95 rounded-t-2xl overflow-y-auto z-40 p-4">
                {renderPanel()}
              </div>
            )}
          </div>
        ) : (
          /* DESKTOP LAYOUT (unchanged) */
          <>
            {/* Main Editor Area */}
            <div className="flex-1 pt-16 pb-32">
              <EditorPreview photo={originalPhoto} transform={transform} activeMode={activeMode} className="h-full" />
            </div>

            {/* Floating Toolbar */}
            <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/90 backdrop-blur-xl border border-white/20 rounded-full px-4 py-3 shadow-2xl z-30">
              {modes.map((mode) => {
                const Icon = mode.icon;
                const isActive = activeMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    onClick={() => handleModeChange(mode.id)}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                      isActive ? 'bg-purple-600 text-white' : 'hover:bg-white/10 text-white/70 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[10px] font-medium">{mode.label}</span>
                  </button>
                );
              })}

              <div className="w-px h-10 bg-white/20 mx-1" />

              <button
                onClick={handleReset}
                disabled={!hasTransforms()}
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg hover:bg-white/10 transition-all disabled:opacity-30 disabled:cursor-not-allowed text-white/70 hover:text-white"
              >
                <RotateCcw className="w-5 h-5" />
                <span className="text-[10px] font-medium">{t('editor.reset', 'Reset')}</span>
              </button>
            </div>

            {/* Editor Panel (Right Side / Bottom) */}
            {activeMode && (
              <div className="fixed right-0 top-16 bottom-0 md:w-80 w-full bg-black/95 backdrop-blur-xl border-l border-white/10 z-40 overflow-y-auto">
                <div className="p-6">
                  {renderPanel()}
                </div>
              </div>
            )}
          </>
        )}

        {/* Save Options Modal */}
        {showSaveOptions && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="glass rounded-2xl p-6 max-w-md w-full border-2 border-purple-500/30">
              <h3 className="text-xl font-bold mb-4">{t('editor.saveOptions', 'Save Options')}</h3>
              <div className="space-y-3">
                <button
                  onClick={handleSaveCopy}
                  disabled={isSaving}
                  className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition font-medium disabled:opacity-50"
                >
                  {t('editor.saveCopy', 'Save a Copy')}
                </button>
                <button
                  onClick={handleReplaceOriginal}
                  disabled={isSaving}
                  className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition font-medium disabled:opacity-50"
                >
                  {t('editor.replaceOriginal', 'Replace Original')}
                </button>
                <button
                  onClick={() => setShowSaveOptions(false)}
                  className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition font-medium"
                >
                  {t('common:cancel', 'Cancel')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Exit Warning Modal */}
        {showExitWarning && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
            <div className="glass rounded-2xl p-6 max-w-md w-full border-2 border-yellow-500/30">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-yellow-400" />
                <h3 className="text-xl font-bold">{t('editor.unsavedChanges', 'Unsaved Changes')}</h3>
              </div>
              <p className="opacity-70 mb-6">
                {t('editor.unsavedWarning', 'You have unsaved changes. Are you sure you want to leave?')}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowExitWarning(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 py-3 rounded-xl font-semibold transition"
                >
                  {t('common:cancel', 'Cancel')}
                </button>
                <button
                  onClick={() => navigate(-1)}
                  className="flex-1 bg-red-600 hover:bg-red-700 py-3 rounded-xl font-semibold transition"
                >
                  {t('editor.discardChanges', 'Discard')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default EditorPage;
