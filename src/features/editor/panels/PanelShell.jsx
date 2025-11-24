// ============================================================================
// COMPONENT: PanelShell.jsx - Editor Panel Container (Phase 8C-1)
// ============================================================================

import React from 'react';
import { useTranslation } from 'react-i18next';
import useEditorStore from '../editorStore';
import { applyCropAspectRatio, clampCropRect } from '../utils/cropTransformBridge';
import AdjustPanel from './AdjustPanel';
import RotatePanel from './RotatePanel';
import FiltersPanel from './FiltersPanel';
import '../editor.css';

/**
 * PanelShell - Bottom-sheet panel for editor tools
 *
 * Phase 7C-2: Crop controls implemented
 * Phase 8B-4: Rotate & Flip controls implemented
 * Phase 8B-5: Filters presets implemented
 * Phase 8C-1: Adjust sliders implemented
 * Future phases will add:
 * - 8C-2: Real filter rendering
 * - 8C-3: Crop compute engine
 *
 * @param {string} activeTool - Current active tool ("adjust", "crop", "rotate", "filters", or "none")
 * @param {React.RefObject} viewportRef - Reference to EditorViewport (Phase 8B-4, 8C-1)
 * @param {Object} photo - Photo object for filter thumbnails (Phase 8B-5)
 */
const PanelShell = ({ activeTool, viewportRef, photo, onCropApplied }) => {
  const { t } = useTranslation();
  const { transform, applyTransform } = useEditorStore();

  if (!activeTool || activeTool === 'none') {
    return null;
  }

  // Get current zoom from viewport (Phase 8C-4)
  const currentZoom = viewportRef?.current?.getZoom() || 1.0;
  const currentTransform = viewportRef?.current?.getTransform() || { zoom: 1, panX: 0, panY: 0 };

  // Zoom control handlers wired to viewportRef (Phase 8C-4)
  const handleZoomChange = (newZoom) => {
    if (viewportRef?.current) {
      viewportRef.current.setZoom(newZoom);
    }
  };

  const handleZoomIn = () => {
    if (viewportRef?.current) {
      const current = viewportRef.current.getZoom();
      const newZoom = Math.min(3, current + 0.1);
      viewportRef.current.setZoom(newZoom);
    }
  };

  const handleZoomOut = () => {
    if (viewportRef?.current) {
      const current = viewportRef.current.getZoom();
      const newZoom = Math.max(0.5, current - 0.1);
      viewportRef.current.setZoom(newZoom);
    }
  };

  const handleResetTransform = () => {
    if (viewportRef?.current) {
      viewportRef.current.resetTransform();
    }
  };

  const renderContent = () => {
    switch (activeTool) {
      case 'crop':
        return (
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-white mb-3">{t('editor.crop', 'Crop')}</h3>

            {/* Zoom Controls (Phase 8C-4: wired to viewportRef) */}
            <div>
              <label className="text-sm font-medium mb-2 block text-white">
                {t('editor.crop.zoom', 'Zoom')} ({(currentZoom * 100).toFixed(0)}%)
              </label>
              <input
                type="range"
                min={50}
                max={300}
                value={currentZoom * 100}
                onChange={(e) => handleZoomChange(Number(e.target.value) / 100)}
                className="w-full"
              />
              <div className="flex gap-2 mt-2">
                <button
                  onClick={handleZoomOut}
                  className="flex-1 px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition text-sm text-white"
                >
                  {t('editor.crop.zoomOut', 'Zoom Out')}
                </button>
                <button
                  onClick={handleZoomIn}
                  className="flex-1 px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition text-sm text-white"
                >
                  {t('editor.crop.zoomIn', 'Zoom In')}
                </button>
              </div>
            </div>

            {/* Reset Zoom (Phase 8C-4: wired to viewportRef) */}
            <button
              onClick={handleResetTransform}
              disabled={currentTransform.zoom === 1 && currentTransform.panX === 0 && currentTransform.panY === 0}
              className="w-full px-4 py-2.5 bg-purple-600 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm"
            >
              {t('editor.crop.resetZoom', 'Reset Zoom & Pan')}
            </button>

            {/* Aspect Ratio Presets */}
            <div>
              <label className="text-sm font-medium mb-2 block text-white">
                {t('editor.crop.aspectRatio', 'Aspect Ratio')}
              </label>
              <div className="grid grid-cols-2 gap-2">
                {/* Free aspect ratio */}
                <button
                  onClick={() => {
                    const crop = transform.crop;
                    if (crop) {
                      applyTransform('crop', { ...crop, aspectRatio: null });
                    }
                  }}
                  className={`px-3 py-2 rounded-lg transition text-sm text-white ${
                    transform.crop?.aspectRatio === null
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {t('editor.crop.free', 'Free')}
                </button>

                {/* Square 1:1 */}
                <button
                  onClick={() => {
                    const crop = transform.crop;
                    if (crop) {
                      const newCrop = applyCropAspectRatio(crop, 1, 'center');
                      const clampedCrop = clampCropRect(newCrop);
                      applyTransform('crop', { ...clampedCrop, aspectRatio: 1 });
                    }
                  }}
                  className={`px-3 py-2 rounded-lg transition text-sm text-white ${
                    transform.crop?.aspectRatio === 1
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {t('editor.crop.square', '1:1')}
                </button>

                {/* Portrait 4:5 */}
                <button
                  onClick={() => {
                    const crop = transform.crop;
                    if (crop) {
                      const newCrop = applyCropAspectRatio(crop, 4/5, 'center');
                      const clampedCrop = clampCropRect(newCrop);
                      applyTransform('crop', { ...clampedCrop, aspectRatio: 4/5 });
                    }
                  }}
                  className={`px-3 py-2 rounded-lg transition text-sm text-white ${
                    transform.crop?.aspectRatio === 4/5
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {t('editor.crop.portrait', '4:5')}
                </button>

                {/* Landscape 16:9 */}
                <button
                  onClick={() => {
                    const crop = transform.crop;
                    if (crop) {
                      const newCrop = applyCropAspectRatio(crop, 16/9, 'center');
                      const clampedCrop = clampCropRect(newCrop);
                      applyTransform('crop', { ...clampedCrop, aspectRatio: 16/9 });
                    }
                  }}
                  className={`px-3 py-2 rounded-lg transition text-sm text-white ${
                    transform.crop?.aspectRatio === 16/9
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {t('editor.crop.landscape', '16:9')}
                </button>
              </div>
            </div>

            {/* Apply Crop Button */}
            <button
              onClick={() => {
                const cropRect = transform.crop;
                if (cropRect && viewportRef?.current) {
                  viewportRef.current.applyCrop(cropRect);
                  console.log('🔷 Crop applied to canvas');

                  // Notify parent that crop is applied
                  if (typeof onCropApplied === 'function') {
                    onCropApplied();
                  }
                }
              }}
              disabled={!transform.crop}
              className="w-full px-4 py-2.5 bg-green-600 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm"
            >
              {t('editor.crop.apply', 'Apply Crop')}
            </button>

            {/* Clear Crop Button - shown only when crop is applied */}
            {viewportRef?.current?.getAppliedCrop() && (
              <button
                onClick={() => {
                  if (viewportRef?.current) {
                    viewportRef.current.clearCrop();
                    console.log('🔷 Crop cleared - back to full image');
                  }
                }}
                className="w-full px-4 py-2.5 bg-red-600 rounded-lg hover:bg-red-700 transition text-white font-medium text-sm"
              >
                {t('editor.crop.clear', 'Clear Crop')}
              </button>
            )}

            {/* Instructions */}
            <p className="text-xs text-white/60 text-center mt-2">
              {t('editor.crop.instructions', 'Drag handles to adjust crop area. Pinch or scroll to zoom. Click Apply to render crop.')}
            </p>
          </div>
        );

      case 'adjust':
        return <AdjustPanel viewportRef={viewportRef} />;

      case 'rotate':
        return <RotatePanel viewportRef={viewportRef} />;

      case 'filters':
        return <FiltersPanel viewportRef={viewportRef} photo={photo} />;

      default:
        return null;
    }
  };

  return (
    <div className={`editor-panel-sheet ${activeTool && activeTool !== 'none' ? 'active' : ''}`}>
      <div className="editor-panel-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default PanelShell;
