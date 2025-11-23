// ============================================================================
// PAGE: EditorPage.jsx - Photo Editor World (Phase 7B - Masterplan Aligned)
// ============================================================================

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Save, AlertCircle, Loader, Sliders, Crop as CropIcon, RotateCw, Sparkles, RotateCcw } from 'lucide-react';
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
 * Architecture follows PhotoPage world model:
 * - isWorldView = true
 * - Fixed topbar (56px)
 * - Fixed preview container (fills space)
 * - Fixed toolbar (72px)
 * - Bottom sheet panel slides up/down
 * - Back navigation: navigate(-1)
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
    if (isDirty) {
      setShowExitWarning(true);
    } else {
      // Simple back navigation (masterplan requirement)
      navigate(-1);
    }
  }, [isDirty, navigate]);

  const handleModeChange = useCallback(
    (mode) => {
      // Toggle mode: clicking same mode closes it
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

  const renderPanelContent = () => {
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
                {t('editor.crop.zoom', 'Zoom')} ({(useEditorStore.getState().zoom.currentZoom * 100).toFixed(0)}%)
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

      {/* Fixed Preview Container */}
      <div className="editor-preview-container">
        <EditorPreview
          photo={originalPhoto}
          transform={transform}
          activeMode={activeMode}
        />
      </div>

      {/* Fixed Toolbar */}
      <div className="editor-toolbar">
        <div className="flex items-center justify-center gap-1 h-full px-2">
          {modes.map((mode) => {
            const Icon = mode.icon;
            const isActive = activeMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => handleModeChange(mode.id)}
                className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white'
                    : 'hover:bg-white/10 text-white/70 hover:text-white'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[9px] font-medium">{mode.label}</span>
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

      {/* Bottom Sheet Panel */}
      <div className={`editor-panel-sheet ${activeMode ? 'active' : ''}`}>
        <div className="editor-panel-content">
          {renderPanelContent()}
        </div>
      </div>

      {/* Save Options Modal */}
      {showSaveOptions && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border-2 border-purple-500/30">
            <h3 className="text-xl font-bold mb-4 text-white">{t('editor.saveOptions', 'Save Options')}</h3>
            <div className="space-y-3">
              <button
                onClick={handleSaveCopy}
                disabled={isSaving}
                className="w-full px-4 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition font-medium disabled:opacity-50 text-white"
              >
                {t('editor.saveCopy', 'Save a Copy')}
              </button>
              <button
                onClick={handleReplaceOriginal}
                disabled={isSaving}
                className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 rounded-lg transition font-medium disabled:opacity-50 text-white"
              >
                {t('editor.replaceOriginal', 'Replace Original')}
              </button>
              <button
                onClick={() => setShowSaveOptions(false)}
                className="w-full px-4 py-3 bg-white/5 hover:bg-white/10 rounded-lg transition font-medium text-white"
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
          <div className="bg-gray-900 rounded-2xl p-6 max-w-md w-full border-2 border-yellow-500/30">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-yellow-400" />
              <h3 className="text-xl font-bold text-white">{t('editor.unsavedChanges', 'Unsaved Changes')}</h3>
            </div>
            <p className="opacity-70 mb-6 text-white">
              {t('editor.unsavedWarning', 'You have unsaved changes. Are you sure you want to leave?')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowExitWarning(false)}
                className="flex-1 bg-white/10 hover:bg-white/20 py-3 rounded-xl font-semibold transition text-white"
              >
                {t('common:cancel', 'Cancel')}
              </button>
              <button
                onClick={() => navigate(-1)}
                className="flex-1 bg-red-600 hover:bg-red-700 py-3 rounded-xl font-semibold transition text-white"
              >
                {t('editor.discardChanges', 'Discard')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorPage;
