// ============================================================================
// COMPONENT: CollageCanvas.jsx - Main collage grid renderer
// ============================================================================

import React, { useMemo } from 'react';
import SlotItem from './SlotItem';
import { calculateGridDimensions } from '../templateEngine';
import { getGridStyle } from '../collageUtils';

/**
 * CollageCanvas Component
 *
 * Renders the collage grid with all slots
 * Handles layout based on template
 * Manages slot selection and actions
 */
const CollageCanvas = ({
  template,
  slots,
  selectedSlotIndex,
  onSlotClick,
  onSlotRotate,
  onSlotRemove,
  onSlotAddPhoto,
  className = '',
}) => {
  // Calculate grid dimensions from template
  const { rows, cols } = useMemo(
    () => calculateGridDimensions(template),
    [template]
  );

  // Get aspect ratio for canvas container
  const aspectRatio = template?.aspectRatio || 1;

  const gridStyle = useMemo(() => getGridStyle(rows, cols, 0), [rows, cols]);

  if (!template || !slots) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-white/5 rounded-xl">
        <p className="text-sm opacity-50">No template selected</p>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full mx-auto group ${className}`}
      style={{
        aspectRatio: `${aspectRatio}`,
        maxWidth: '100%',
      }}
    >
      {/* Main Grid */}
      <div className="w-full h-full rounded-xl overflow-hidden" style={gridStyle}>
        {slots.map((slot, index) => (
          <SlotItem
            key={slot.id || index}
            slot={slot}
            slotIndex={index}
            isSelected={selectedSlotIndex === index}
            onClick={onSlotClick}
            onRotate={onSlotRotate}
            onRemove={onSlotRemove}
            onAddPhoto={onSlotAddPhoto}
          />
        ))}
      </div>

      {/* Template Info Overlay (subtle) */}
      <div className="absolute bottom-2 left-2 text-xs bg-black/50 backdrop-blur-sm px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
        {template.name}
      </div>
    </div>
  );
};

export default CollageCanvas;
