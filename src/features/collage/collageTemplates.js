// ============================================================================
// Collage Templates - Phase 3A
// ============================================================================

/**
 * Collage template definitions
 * Each template defines a grid layout with slots for photos
 */
export const collageTemplates = [
  {
    id: 'grid-2',
    name: 'Grid (2 photos)',
    minPhotos: 2,
    maxPhotos: 2,
    aspectRatio: 2, // 2:1 landscape
    previewSlots: [
      { id: 'a', row: 1, col: 1, rowSpan: 1, colSpan: 1 },
      { id: 'b', row: 1, col: 2, rowSpan: 1, colSpan: 1 },
    ],
  },
  {
    id: 'grid-4',
    name: 'Grid (4 photos)',
    minPhotos: 4,
    maxPhotos: 4,
    aspectRatio: 1, // square
    previewSlots: [
      { id: 'a', row: 1, col: 1, rowSpan: 1, colSpan: 1 },
      { id: 'b', row: 1, col: 2, rowSpan: 1, colSpan: 1 },
      { id: 'c', row: 2, col: 1, rowSpan: 1, colSpan: 1 },
      { id: 'd', row: 2, col: 2, rowSpan: 1, colSpan: 1 },
    ],
  },
  {
    id: 'grid-6',
    name: 'Grid (6 photos)',
    minPhotos: 6,
    maxPhotos: 6,
    aspectRatio: 1, // square
    previewSlots: [
      { id: 'a', row: 1, col: 1, rowSpan: 1, colSpan: 1 },
      { id: 'b', row: 1, col: 2, rowSpan: 1, colSpan: 1 },
      { id: 'c', row: 1, col: 3, rowSpan: 1, colSpan: 1 },
      { id: 'd', row: 2, col: 1, rowSpan: 1, colSpan: 1 },
      { id: 'e', row: 2, col: 2, rowSpan: 1, colSpan: 1 },
      { id: 'f', row: 2, col: 3, rowSpan: 1, colSpan: 1 },
    ],
  },
  {
    id: 'spotlight-3',
    name: 'Spotlight (3 photos)',
    minPhotos: 3,
    maxPhotos: 3,
    aspectRatio: 1.5, // 3:2
    previewSlots: [
      { id: 'a', row: 1, col: 1, rowSpan: 2, colSpan: 2 }, // Large left
      { id: 'b', row: 1, col: 3, rowSpan: 1, colSpan: 1 }, // Small top right
      { id: 'c', row: 2, col: 3, rowSpan: 1, colSpan: 1 }, // Small bottom right
    ],
  },
  {
    id: 'hero-5',
    name: 'Hero (5 photos)',
    minPhotos: 5,
    maxPhotos: 5,
    aspectRatio: 1, // square
    previewSlots: [
      { id: 'a', row: 1, col: 1, rowSpan: 2, colSpan: 2 }, // Hero top-left
      { id: 'b', row: 1, col: 3, rowSpan: 1, colSpan: 1 },
      { id: 'c', row: 2, col: 3, rowSpan: 1, colSpan: 1 },
      { id: 'd', row: 3, col: 1, rowSpan: 1, colSpan: 1 },
      { id: 'e', row: 3, col: 2, rowSpan: 1, colSpan: 1 },
    ],
  },
  {
    id: 'vertical-3',
    name: 'Vertical (3 photos)',
    minPhotos: 3,
    maxPhotos: 3,
    aspectRatio: 0.75, // 3:4 portrait
    previewSlots: [
      { id: 'a', row: 1, col: 1, rowSpan: 1, colSpan: 1 },
      { id: 'b', row: 2, col: 1, rowSpan: 1, colSpan: 1 },
      { id: 'c', row: 3, col: 1, rowSpan: 1, colSpan: 1 },
    ],
  },
];

/**
 * Get template by ID
 * @param {string} templateId
 * @returns {object|null}
 */
export function getTemplateById(templateId) {
  return collageTemplates.find((t) => t.id === templateId) || null;
}
