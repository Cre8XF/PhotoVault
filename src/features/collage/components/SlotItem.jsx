// ============================================================================
// COMPONENT: SlotItem.jsx - Individual slot in collage grid
// ============================================================================

import React from 'react';
import { useTranslation } from 'react-i18next';
import { ImagePlus, RotateCw, X } from 'lucide-react';
import { getSlotGridStyle, getTransformStyle } from '../collageUtils';

/**
 * SlotItem Component
 *
 * Renders a single slot in the collage grid
 * Shows photo if assigned, or empty state
 * Provides actions: add photo, rotate, remove
 */
const SlotItem = ({
  slot,
  slotIndex,
  isSelected,
  onClick,
  onRotate,
  onRemove,
  onAddPhoto,
}) => {
  const { t } = useTranslation();

  const handleClick = (e) => {
    e.stopPropagation();
    if (onClick) onClick(slotIndex);
  };

  const handleRotate = (e) => {
    e.stopPropagation();
    if (onRotate) onRotate(slotIndex);
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    if (onRemove) onRemove(slotIndex);
  };

  const handleAddPhoto = (e) => {
    e.stopPropagation();
    if (onAddPhoto) onAddPhoto(slotIndex);
  };

  const hasPhoto = slot.photo !== null;
  const transformStyle = hasPhoto ? getTransformStyle(slot.transform) : '';

  return (
    <div
      className={`relative overflow-hidden rounded-lg border-2 transition-all cursor-pointer ${
        isSelected
          ? 'border-purple-500 ring-2 ring-purple-500/50'
          : 'border-white/10 hover:border-white/30'
      } ${!hasPhoto ? 'bg-white/5' : 'bg-black'}`}
      style={getSlotGridStyle(slot)}
      onClick={handleClick}
    >
      {/* Photo or Empty State */}
      {hasPhoto ? (
        <div className="w-full h-full overflow-hidden">
          <img
            src={slot.photo.url}
            alt={slot.photo.name || 'Photo'}
            className="w-full h-full object-cover"
            style={{
              transform: transformStyle,
              transition: 'transform 0.3s ease',
            }}
          />
        </div>
      ) : (
        <div
          className="w-full h-full flex items-center justify-center"
          onClick={handleAddPhoto}
        >
          <div className="text-center">
            <ImagePlus className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-xs opacity-50">{t('collage.builder.addPhoto', 'Add photo')}</p>
          </div>
        </div>
      )}

      {/* Actions Toolbar (only show when slot has photo and is selected/hovered) */}
      {hasPhoto && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-on-glass">
          <button
            onClick={handleRotate}
            className="p-1.5 bg-black/60 backdrop-blur-sm rounded-lg hover:bg-black/80 transition"
            title={t('collage.builder.rotate', 'Rotate')}
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleRemove}
            className="p-1.5 bg-black/60 backdrop-blur-sm rounded-lg hover:bg-red-600/80 transition"
            title={t('collage.builder.remove', 'Remove')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Slot Number Indicator (debug mode) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-1 left-1 text-[10px] bg-black/50 px-1 rounded opacity-50">
          {slotIndex + 1}
        </div>
      )}
    </div>
  );
};

export default SlotItem;
