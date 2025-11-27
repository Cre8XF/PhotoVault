// ============================================================================
// COMPONENT: RotatePanel.jsx - Rotate & Flip Controls (Phase 8B-4)
// ============================================================================

import React from 'react';
import { useTranslation } from 'react-i18next';
import { RotateCcw, RotateCw, FlipHorizontal, FlipVertical } from 'lucide-react';

/**
 * RotatePanel - Rotation and Flip Controls (Phase 8B-4)
 *
 * Provides UI for rotation and flip transforms using the Phase 8B-3 API:
 * - rotateCounterClockwise() - Rotate 90° CCW
 * - rotateClockwise() - Rotate 90° CW
 * - flipHorizontal() - Mirror left/right
 * - flipVertical() - Flip up/down
 *
 * @param {React.RefObject} viewportRef - Reference to EditorViewport for imperative API
 */
const RotatePanel = ({ viewportRef }) => {
  const { t } = useTranslation();

  const handleRotateLeft = () => {
    if (viewportRef?.current) {
      viewportRef.current.rotateCounterClockwise();
      console.log('🔄 Rotated 90° counter-clockwise');
    }
  };

  const handleRotateRight = () => {
    if (viewportRef?.current) {
      viewportRef.current.rotateClockwise();
      console.log('🔄 Rotated 90° clockwise');
    }
  };

  const handleFlipHorizontal = () => {
    if (viewportRef?.current) {
      viewportRef.current.flipHorizontal();
      console.log('↔️ Flipped horizontal');
    }
  };

  const handleFlipVertical = () => {
    if (viewportRef?.current) {
      viewportRef.current.flipVertical();
      console.log('↕️ Flipped vertical');
    }
  };

  return (
    <section className="panel-content-wrapper">
      <div className="space-y-3">
        <h2 className="panel-title">
          {t('editor.rotate.title', 'Rotate & Flip')}
        </h2>

        {/* Rotate & Flip Grid - 2x2 */}
        <div className="rotate-panel-grid">
          {/* Rotate Left */}
          <button
            onClick={handleRotateLeft}
            className="rotate-panel-button"
            aria-label={t('editor.rotate.rotateLeft', 'Rotate Left')}
          >
            <RotateCcw className="w-5 h-5" />
            <span>
              {t('editor.rotate.rotateLeft', 'Rotate Left')}
            </span>
          </button>

          {/* Rotate Right */}
          <button
            onClick={handleRotateRight}
            className="rotate-panel-button"
            aria-label={t('editor.rotate.rotateRight', 'Rotate Right')}
          >
            <RotateCw className="w-5 h-5" />
            <span>
              {t('editor.rotate.rotateRight', 'Rotate Right')}
            </span>
          </button>

          {/* Flip Horizontal */}
          <button
            onClick={handleFlipHorizontal}
            className="rotate-panel-button"
            aria-label={t('editor.rotate.flipHorizontal', 'Flip Horizontal')}
          >
            <FlipHorizontal className="w-5 h-5" />
            <span>
              {t('editor.rotate.flipHorizontal', 'Flip Horizontal')}
            </span>
          </button>

          {/* Flip Vertical */}
          <button
            onClick={handleFlipVertical}
            className="rotate-panel-button"
            aria-label={t('editor.rotate.flipVertical', 'Flip Vertical')}
          >
            <FlipVertical className="w-5 h-5" />
            <span>
              {t('editor.rotate.flipVertical', 'Flip Vertical')}
            </span>
          </button>
        </div>

        {/* Instructions */}
        <p className="text-xs text-white/50 text-center mt-2">
          {t('editor.rotate.instructions', 'Tap buttons to rotate or flip the image. Use Reset to undo all changes.')}
        </p>
      </div>
    </section>
  );
};

export default RotatePanel;
