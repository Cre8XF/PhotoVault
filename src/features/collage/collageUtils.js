// ============================================================================
// MODULE: collageUtils.js - Pure utility functions for collage operations
// ============================================================================

/**
 * Collage Utilities
 *
 * Pure functions for:
 * - Transform calculations
 * - Slot positioning
 * - Image fitting and cropping
 * - Data serialization
 */

/**
 * Apply transform to get CSS transform string
 */
export const getTransformStyle = (transform) => {
  if (!transform) return '';

  const { rotation = 0, scale = 1, offsetX = 0, offsetY = 0 } = transform;

  const transforms = [];

  if (rotation !== 0) {
    transforms.push(`rotate(${rotation}deg)`);
  }

  if (scale !== 1) {
    transforms.push(`scale(${scale})`);
  }

  if (offsetX !== 0 || offsetY !== 0) {
    transforms.push(`translate(${offsetX}px, ${offsetY}px)`);
  }

  return transforms.join(' ');
};

/**
 * Calculate slot bounds within grid
 */
export const calculateSlotBounds = (slot, gridWidth, gridHeight, cols, rows) => {
  const cellWidth = gridWidth / cols;
  const cellHeight = gridHeight / rows;

  const x = (slot.col - 1) * cellWidth;
  const y = (slot.row - 1) * cellHeight;
  const width = slot.colSpan * cellWidth;
  const height = slot.rowSpan * cellHeight;

  return { x, y, width, height };
};

/**
 * Get image fit mode (cover, contain, etc.)
 */
export const getImageFitStyle = (mode = 'cover') => {
  return {
    objectFit: mode,
    width: '100%',
    height: '100%',
  };
};

/**
 * Calculate photo aspect ratio
 */
export const getPhotoAspectRatio = (photo) => {
  if (!photo || !photo.width || !photo.height) {
    return 1; // Default square
  }
  return photo.width / photo.height;
};

/**
 * Determine if photo should be letterboxed or cropped in slot
 */
export const calculatePhotoFit = (photoAspectRatio, slotAspectRatio) => {
  // If photo is wider than slot, it will be cropped horizontally
  // If photo is taller than slot, it will be cropped vertically
  const cropMode = photoAspectRatio > slotAspectRatio ? 'horizontal' : 'vertical';

  return {
    cropMode,
    scale: Math.max(slotAspectRatio / photoAspectRatio, 1),
  };
};

/**
 * Serialize collage data for Firestore
 */
export const serializeCollage = (collageData) => {
  return {
    id: collageData.id || null,
    templateId: collageData.templateId,
    title: collageData.title || '',
    slots: collageData.slots.map((slot) => ({
      id: slot.id,
      slotIndex: slot.slotIndex,
      photo: slot.photo
        ? {
            id: slot.photo.id,
            url: slot.photo.url,
            thumbnailUrl: slot.photo.thumbnailUrl,
            name: slot.photo.name,
            width: slot.photo.width,
            height: slot.photo.height,
          }
        : null,
      transform: slot.transform,
      row: slot.row,
      col: slot.col,
      rowSpan: slot.rowSpan,
      colSpan: slot.colSpan,
    })),
    version: collageData.version || 2,
    createdAt: collageData.createdAt || new Date().toISOString(),
    updatedAt: collageData.updatedAt || new Date().toISOString(),
  };
};

/**
 * Deserialize collage data from Firestore
 */
export const deserializeCollage = (firestoreData) => {
  return {
    id: firestoreData.id,
    templateId: firestoreData.templateId,
    title: firestoreData.title || '',
    slots: firestoreData.slots || [],
    version: firestoreData.version || 1,
    createdAt: firestoreData.createdAt,
    updatedAt: firestoreData.updatedAt,
  };
};

/**
 * Migrate v1 collage to v2 format
 */
export const migrateCollageV1ToV2 = (v1Data, template) => {
  // V1 format may have different slot structure
  // Ensure all slots have proper grid positions from template

  const migratedSlots = template.slots.map((templateSlot, index) => {
    const oldSlot = v1Data.slots?.[index] || {};

    return {
      id: templateSlot.id,
      slotIndex: index,
      photo: oldSlot.photo || null,
      transform: oldSlot.transform || {
        rotation: 0,
        scale: 1,
        offsetX: 0,
        offsetY: 0,
      },
      row: templateSlot.row,
      col: templateSlot.col,
      rowSpan: templateSlot.rowSpan,
      colSpan: templateSlot.colSpan,
    };
  });

  return {
    ...v1Data,
    slots: migratedSlots,
    version: 2,
    updatedAt: new Date().toISOString(),
  };
};

/**
 * Check if all slots are filled
 */
export const areAllSlotsFilled = (slots) => {
  return slots.every((slot) => slot.photo !== null);
};

/**
 * Count filled slots
 */
export const countFilledSlots = (slots) => {
  return slots.filter((slot) => slot.photo !== null).length;
};

/**
 * Get empty slots
 */
export const getEmptySlots = (slots) => {
  return slots.filter((slot) => slot.photo === null);
};

/**
 * Get filled slots
 */
export const getFilledSlots = (slots) => {
  return slots.filter((slot) => slot.photo !== null);
};

/**
 * Generate default title from template
 */
export const generateDefaultTitle = (template, t) => {
  // Future: use i18n
  // return t('collage.defaultTitle', { template: template.name });
  return `${template.name} Collage`;
};

/**
 * Validate collage data before save
 */
export const validateCollageData = (collageData) => {
  if (!collageData.templateId) {
    return { valid: false, error: 'Missing template ID' };
  }

  if (!collageData.slots || collageData.slots.length === 0) {
    return { valid: false, error: 'No slots defined' };
  }

  const filledCount = countFilledSlots(collageData.slots);
  if (filledCount === 0) {
    return { valid: false, error: 'At least one photo required' };
  }

  return { valid: true };
};

/**
 * Get grid style for CSS Grid layout
 */
export const getGridStyle = (rows, cols, gap = 2) => {
  return {
    display: 'grid',
    gridTemplateRows: `repeat(${rows}, 1fr)`,
    gridTemplateColumns: `repeat(${cols}, 1fr)`,
    gap: `${gap}px`,
    width: '100%',
    height: '100%',
  };
};

/**
 * Get slot grid position style
 */
export const getSlotGridStyle = (slot) => {
  return {
    gridRow: `${slot.row} / span ${slot.rowSpan}`,
    gridColumn: `${slot.col} / span ${slot.colSpan}`,
  };
};
