// ============================================================================
// MODULE: templateEngine.js - Template expansion and utilities
// ============================================================================

/**
 * Template Engine
 *
 * Handles:
 * - Template loading and validation
 * - Slot expansion from template definitions
 * - Grid calculations
 * - Template metadata helpers
 */

import { collageTemplates } from './collageTemplates';

/**
 * Get template by ID
 */
export const getTemplateById = (templateId) => {
  return collageTemplates.find((t) => t.id === templateId);
};

/**
 * Expand template into full slot structure
 * Converts previewSlots into detailed slot objects and generates missing layout properties
 */
export const expandTemplate = (template) => {
  if (!template || !template.previewSlots) {
    throw new Error('Invalid template: missing previewSlots');
  }

  // Calculate grid dimensions
  const gridDims = calculateGridDimensions(template);

  // Generate CSS grid template strings
  const gridTemplate = `repeat(${gridDims.rows}, 1fr) / repeat(${gridDims.cols}, 1fr)`;

  // Calculate canvas size based on aspect ratio
  const aspectRatio = template.aspectRatio || 1;
  const baseSize = 1200; // Standard base size
  const canvasWidth = aspectRatio >= 1
    ? baseSize
    : Math.round(baseSize * aspectRatio);
  const canvasHeight = aspectRatio >= 1
    ? Math.round(baseSize / aspectRatio)
    : baseSize;

  // Convert aspectRatio to string format if it's a number
  const aspectRatioString = typeof template.aspectRatio === 'number'
    ? `${Math.round(template.aspectRatio * 100) / 100}:1`
    : template.aspectRatio;

  return {
    ...template,
    // Generate nameKey for i18n (fallback to name if not present)
    nameKey: template.nameKey || `collage:templates.${template.id}`,
    // Ensure aspectRatio is string format
    aspectRatio: aspectRatioString,
    // Generate canvas dimensions
    canvas: {
      width: canvasWidth,
      height: canvasHeight,
    },
    // Generate grid CSS templates
    grid: {
      desktop: gridTemplate,
      mobile: gridTemplate, // Use same grid for mobile (templates are simple)
    },
    // Expand preview slots into full slot structure
    slots: template.previewSlots.map((slot, index) => {
      // Calculate cell dimensions for pixel-based canvas coordinates
      const cellWidth = canvasWidth / gridDims.cols;
      const cellHeight = canvasHeight / gridDims.rows;

      return {
        id: slot.id,
        slotIndex: index,
        row: slot.row,
        col: slot.col,
        rowSpan: slot.rowSpan,
        colSpan: slot.colSpan,
        area: `${slot.row} / ${slot.col} / ${slot.row + slot.rowSpan} / ${slot.col + slot.colSpan}`,
        crop: 'center',
        objectFit: 'cover',
        // ✅ PHASE 1 FIX: Generate pixel-based canvas coordinates for renderer
        canvas: {
          x: (slot.col - 1) * cellWidth,
          y: (slot.row - 1) * cellHeight,
          w: slot.colSpan * cellWidth,
          h: slot.rowSpan * cellHeight,
        },
      };
    }),
    // Add default gap and padding (gap: 0 for edge-to-edge Instagram-style)
    gap: template.gap || 0,
    padding: template.padding || 0,
  };
};

/**
 * Calculate grid dimensions from template
 */
export const calculateGridDimensions = (template) => {
  if (!template || !template.previewSlots) {
    return { rows: 1, cols: 1 };
  }

  const maxRow = Math.max(
    ...template.previewSlots.map((s) => s.row + s.rowSpan - 1)
  );
  const maxCol = Math.max(
    ...template.previewSlots.map((s) => s.col + s.colSpan - 1)
  );

  return {
    rows: maxRow,
    cols: maxCol,
  };
};

/**
 * Get aspect ratio as decimal (e.g., 1 for square, 1.5 for 3:2)
 */
export const getTemplateAspectRatio = (template) => {
  return template?.aspectRatio || 1;
};

/**
 * Validate template structure
 */
export const validateTemplate = (template) => {
  if (!template) return false;
  if (!template.id || !template.name) return false;
  if (!template.previewSlots || !Array.isArray(template.previewSlots)) {
    return false;
  }
  if (template.previewSlots.length === 0) return false;

  // Validate each slot has required properties
  for (const slot of template.previewSlots) {
    if (!slot.id) return false;
    if (typeof slot.row !== 'number') return false;
    if (typeof slot.col !== 'number') return false;
    if (typeof slot.rowSpan !== 'number') return false;
    if (typeof slot.colSpan !== 'number') return false;
  }

  return true;
};

/**
 * Get all available templates
 */
export const getAllTemplates = () => {
  return collageTemplates;
};

/**
 * Get template display name (for i18n)
 */
export const getTemplateDisplayName = (template, t) => {
  // Future: support i18n keys like t(`collage.templates.${template.id}`)
  // For now, return template name
  return template.name;
};

/**
 * Check if photo count is valid for template
 */
export const isPhotoCountValid = (template, photoCount) => {
  if (!template) return false;
  const min = template.minPhotos || 0;
  const max = template.maxPhotos || Infinity;
  return photoCount >= min && photoCount <= max;
};

/**
 * Get slot at specific grid position
 */
export const getSlotAtPosition = (template, row, col) => {
  if (!template || !template.previewSlots) return null;

  return template.previewSlots.find(
    (slot) =>
      row >= slot.row &&
      row < slot.row + slot.rowSpan &&
      col >= slot.col &&
      col < slot.col + slot.colSpan
  );
};

/**
 * Calculate canvas size based on template and container
 */
export const calculateCanvasSize = (template, maxWidth, maxHeight) => {
  const aspectRatio = getTemplateAspectRatio(template);

  let width = maxWidth;
  let height = width / aspectRatio;

  if (height > maxHeight) {
    height = maxHeight;
    width = height * aspectRatio;
  }

  return {
    width: Math.floor(width),
    height: Math.floor(height),
  };
};
