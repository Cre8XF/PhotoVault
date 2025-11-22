// ============================================================================
// PAGE: CollageEditPage.jsx - Edit Existing Collage World (Phase 3B)
// ============================================================================

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Save, AlertCircle, Loader } from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import useStore from '../state/store';
import useCollageStore from '../features/collage/collageStore';
import { getTemplateById, expandTemplate } from '../features/collage/templateEngine';
import { serializeCollage, validateCollageData, migrateCollageV1ToV2 } from '../features/collage/collageUtils';
import CollageCanvas from '../features/collage/components/CollageCanvas';
import PhotoPickerPanel from '../features/collage/components/PhotoPickerPanel';
import CollageToolbar from '../features/collage/components/CollageToolbar';
import { PageWrapper } from '../components/layout/PageWrapper';

/**
 * CollageEditPage - Edit Existing Collage World
 *
 * Features:
 * - Load collage from Firestore by ID
 * - Support v1 → v2 migration (non-destructive)
 * - Full editing capabilities
 * - Update existing collage
 * - Auto-save warning
 */
const CollageEditPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();

  // Global store
  const { setIsWorldView, setCollageEditId, photos } = useStore();

  // Collage store
  const {
    template,
    slots,
    selectedSlotIndex,
    isPhotoPickerOpen,
    isDirty,
    loadCollage,
    setSlotPhoto,
    removeSlotPhoto,
    rotateSlotPhoto,
    setSelectedSlot,
    openPhotoPicker,
    closePhotoPicker,
    markAsSaved,
    reset,
    getCollageData,
    isReadyToSave,
  } = useCollageStore();

  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [showExitWarning, setShowExitWarning] = useState(false);

  // ============================================================================
  // LOAD COLLAGE
  // ============================================================================

  useEffect(() => {
    setIsWorldView(true);
    setCollageEditId(id);

    const loadCollageData = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

        const user = auth.currentUser;
        if (!user) {
          throw new Error('Not authenticated');
        }

        // Load collage from Firestore
        const collageRef = doc(db, 'users', user.uid, 'collages', id);
        const collageSnap = await getDoc(collageRef);

        if (!collageSnap.exists()) {
          throw new Error('Collage not found');
        }

        const collageData = {
          id: collageSnap.id,
          ...collageSnap.data(),
        };

        // Load template
        const templateData = getTemplateById(collageData.templateId);
        if (!templateData) {
          throw new Error(`Template "${collageData.templateId}" not found`);
        }

        const expandedTemplate = expandTemplate(templateData);

        // Check version and migrate if needed
        let finalData = collageData;
        if (collageData.version === 1) {
          console.log('🔄 Migrating collage from v1 to v2...');
          finalData = migrateCollageV1ToV2(collageData, expandedTemplate);
        }

        // Load into store
        loadCollage(finalData, expandedTemplate);

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading collage:', error);
        setLoadError(error.message);
        setIsLoading(false);
      }
    };

    loadCollageData();

    return () => {
      setIsWorldView(false);
      setCollageEditId(null);
      reset();
    };
  }, [setIsWorldView, setCollageEditId, id, loadCollage, reset]);

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

  const handleSlotClick = useCallback(
    (slotIndex) => {
      setSelectedSlot(slotIndex);
    },
    [setSelectedSlot]
  );

  const handleSlotRotate = useCallback(
    (slotIndex) => {
      rotateSlotPhoto(slotIndex);
    },
    [rotateSlotPhoto]
  );

  const handleSlotRemove = useCallback(
    (slotIndex) => {
      removeSlotPhoto(slotIndex);
    },
    [removeSlotPhoto]
  );

  const handleSlotAddPhoto = useCallback(
    (slotIndex) => {
      openPhotoPicker(slotIndex);
    },
    [openPhotoPicker]
  );

  const handlePhotoSelect = useCallback(
    (photo) => {
      if (selectedSlotIndex !== null) {
        setSlotPhoto(selectedSlotIndex, photo);
        closePhotoPicker();
      }
    },
    [selectedSlotIndex, setSlotPhoto, closePhotoPicker]
  );

  const handleSave = useCallback(async () => {
    if (!isReadyToSave()) {
      setSaveError(t('collage.errors.noPhotos', 'Add at least one photo before saving'));
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);

      const collageData = getCollageData();
      const validation = validateCollageData(collageData);

      if (!validation.valid) {
        setSaveError(validation.error);
        return;
      }

      const serialized = serializeCollage(collageData);

      // Update in Firestore
      const user = auth.currentUser;
      if (!user) {
        throw new Error('Not authenticated');
      }

      const collageRef = doc(db, 'users', user.uid, 'collages', id);
      await updateDoc(collageRef, {
        ...serialized,
        updatedAt: new Date().toISOString(),
      });

      markAsSaved(id);

      // Show success message
      console.log('✅ Collage updated:', id);

      // Navigate back
      navigate(-1);
    } catch (error) {
      console.error('Error updating collage:', error);
      setSaveError(t('collage.errors.saveFailed', 'Failed to save collage'));
    } finally {
      setIsSaving(false);
    }
  }, [
    id,
    isReadyToSave,
    getCollageData,
    markAsSaved,
    navigate,
    t,
  ]);

  // ============================================================================
  // RENDER
  // ============================================================================

  // Loading state
  if (isLoading) {
    return (
      <PageWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader className="w-12 h-12 mx-auto mb-4 animate-spin text-purple-500" />
            <p className="text-sm opacity-70">
              {t('collage.loading', 'Loading collage...')}
            </p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  // Error state
  if (loadError) {
    return (
      <PageWrapper>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <h2 className="text-xl font-bold mb-2">
              {t('collage.errors.loadFailed', 'Failed to load collage')}
            </h2>
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

  // No template loaded
  if (!template) {
    return (
      <PageWrapper>
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <h2 className="text-xl font-bold mb-2">
              {t('collage.errors.noTemplate', 'No template found')}
            </h2>
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

  const selectedSlot = selectedSlotIndex !== null ? slots[selectedSlotIndex] : null;
  const hasSelectedPhoto = selectedSlot?.photo !== null;

  return (
    <PageWrapper>
      <div className="min-h-screen flex flex-col pb-20">
        {/* Top Bar */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            {/* Left: Back Button */}
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-3 py-2 hover:bg-white/10 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="text-sm font-medium">
                {t('common:back', 'Back')}
              </span>
            </button>

            {/* Center: Title */}
            <div className="text-center">
              <h1 className="font-bold text-lg">
                {t('collage.edit.title', 'Edit Collage')}
              </h1>
              <p className="text-xs opacity-50">{template.name}</p>
            </div>

            {/* Right: Save Button */}
            <button
              onClick={handleSave}
              disabled={isSaving || !isReadyToSave()}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition font-medium"
            >
              <Save className="w-4 h-4" />
              <span className="text-sm">
                {isSaving ? t('common:saving', 'Saving...') : t('common:save', 'Save')}
              </span>
            </button>
          </div>

          {/* Error Banner */}
          {saveError && (
            <div className="bg-red-500/20 border-t border-red-500/30 px-4 py-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-sm text-red-400">{saveError}</span>
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 pt-20 p-4 md:p-8">
          <div className="max-w-4xl mx-auto">
            <CollageCanvas
              template={template}
              slots={slots}
              selectedSlotIndex={selectedSlotIndex}
              onSlotClick={handleSlotClick}
              onSlotRotate={handleSlotRotate}
              onSlotRemove={handleSlotRemove}
              onSlotAddPhoto={handleSlotAddPhoto}
            />

            {/* Helper Text */}
            <div className="mt-6 text-center">
              <p className="text-sm opacity-50">
                {t('collage.builder.helpText', 'Tap a slot to add or edit photos')}
              </p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <CollageToolbar
          selectedSlotIndex={selectedSlotIndex}
          hasPhoto={hasSelectedPhoto}
          onReplace={() => openPhotoPicker(selectedSlotIndex)}
          onRotate={() => handleSlotRotate(selectedSlotIndex)}
          onRemove={() => handleSlotRemove(selectedSlotIndex)}
          canSwap={false} // Future feature
        />

        {/* Photo Picker Panel */}
        <PhotoPickerPanel
          isOpen={isPhotoPickerOpen}
          onClose={closePhotoPicker}
          photos={photos}
          onSelectPhoto={handlePhotoSelect}
          selectedSlotIndex={selectedSlotIndex}
        />

        {/* Exit Warning Modal */}
        {showExitWarning && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in">
            <div className="glass rounded-2xl p-6 max-w-md w-full border-2 border-yellow-500/30 animate-scale-in">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-6 h-6 text-yellow-400" />
                <h3 className="text-xl font-bold">
                  {t('collage.unsavedChanges', 'Unsaved Changes')}
                </h3>
              </div>
              <p className="opacity-70 mb-6">
                {t('collage.unsavedWarning', 'You have unsaved changes. Are you sure you want to leave?')}
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
                  {t('collage.discardChanges', 'Discard')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default CollageEditPage;
