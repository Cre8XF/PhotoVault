// ============================================================================
// COMPONENT: CollageToolbar.jsx - Quick actions toolbar
// ============================================================================

import React from 'react';
import { useTranslation } from 'react-i18next';
import { ImagePlus, RotateCw, X, Shuffle } from 'lucide-react';

/**
 * CollageToolbar Component
 *
 * Floating toolbar with quick actions for selected slot
 * Shows: Replace, Rotate, Remove, Swap (if applicable)
 */
const CollageToolbar = ({
  selectedSlotIndex,
  hasPhoto,
  onReplace,
  onRotate,
  onRemove,
  onSwap,
  canSwap = false,
  className = '',
}) => {
  const { t } = useTranslation();

  if (selectedSlotIndex === null) {
    return null; // Don't show toolbar if no slot selected
  }

  return (
    <div
      className={`fixed bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-2 backdrop-blur-xl rounded-full px-4 py-3 shadow-2xl z-30 animate-scale-in ${className}`}
      style={{
        backgroundColor: 'var(--glass-bg)',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'var(--glass-border)',
        color: 'var(--text-primary)'
      }}
    >
      {/* Slot indicator */}
      <div className="px-3 py-1 bg-purple-600/30 rounded-full text-xs font-medium mr-1">
        {t('collage.toolbar.slot', 'Slot')} #{selectedSlotIndex + 1}
      </div>

      <div className="w-px h-6" style={{ backgroundColor: 'var(--border-color)' }} />

      {/* Replace/Add Photo */}
      <button
        onClick={onReplace}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full transition"
        style={{
          ':hover': { backgroundColor: 'var(--interactive-hover)' }
        }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--interactive-hover)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        title={hasPhoto ? t('collage.toolbar.replace', 'Replace') : t('collage.toolbar.add', 'Add photo')}
      >
        <ImagePlus className="w-4 h-4" />
        <span className="text-sm font-medium">
          {hasPhoto
            ? t('collage.toolbar.replace', 'Replace')
            : t('collage.toolbar.add', 'Add')}
        </span>
      </button>

      {/* Rotate (only if photo exists) */}
      {hasPhoto && (
        <button
          onClick={onRotate}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full transition"
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--interactive-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          title={t('collage.toolbar.rotate', 'Rotate 90°')}
        >
          <RotateCw className="w-4 h-4" />
          <span className="text-sm font-medium">
            {t('collage.toolbar.rotate', 'Rotate')}
          </span>
        </button>
      )}

      {/* Swap (only if multiple photos and can swap) */}
      {hasPhoto && canSwap && (
        <button
          onClick={onSwap}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full transition"
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--interactive-hover)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          title={t('collage.toolbar.swap', 'Swap with another slot')}
        >
          <Shuffle className="w-4 h-4" />
          <span className="text-sm font-medium">
            {t('collage.toolbar.swap', 'Swap')}
          </span>
        </button>
      )}

      {/* Remove (only if photo exists) */}
      {hasPhoto && (
        <button
          onClick={onRemove}
          className="flex items-center gap-2 px-3 py-1.5 hover:bg-red-500/20 rounded-full transition text-red-400 hover:text-red-300"
          title={t('collage.toolbar.remove', 'Remove photo')}
        >
          <X className="w-4 h-4" />
          <span className="text-sm font-medium">
            {t('collage.toolbar.remove', 'Remove')}
          </span>
        </button>
      )}
    </div>
  );
};

export default CollageToolbar;
