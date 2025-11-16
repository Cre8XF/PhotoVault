// ============================================================================
// LAYOUTS V3 - Professional Collage Layout System
// 12 layouts covering 1-6 photos with responsive rules and transform support
// ============================================================================

/**
 * Layout V3 Schema:
 * {
 *   id: string,                    // Unique identifier
 *   name: string,                  // Display name (English fallback)
 *   nameKey: string,               // i18n translation key
 *   minPhotos: number,             // Minimum photos required
 *   maxPhotos: number,             // Maximum photos allowed
 *   aspectRatio: string,           // Display aspect ratio (e.g., '16:9')
 *   canvas: {
 *     width: number,               // Canvas width in pixels
 *     height: number               // Canvas height in pixels
 *   },
 *   grid: {
 *     desktop: string,             // CSS Grid template for desktop (>768px)
 *     mobile: string               // CSS Grid template for mobile (<768px)
 *   },
 *   slots: [{
 *     id: string,                  // Slot identifier
 *     area: string,                // CSS Grid area (row-start / col-start / row-end / col-end)
 *     crop: string,                // Crop position: 'center', 'top', 'bottom', 'left', 'right'
 *     objectFit: string,           // CSS object-fit: 'cover', 'contain'
 *     canvas: { x, y, w, h }       // Canvas drawing coordinates (for useCollageCanvas)
 *   }],
 *   gap: number,                   // Gap between cells in pixels
 *   padding: number,               // Outer padding in pixels
 *   preview: string                // ASCII art for icon preview
 * }
 */

export const LAYOUTS_V3 = {
  // ==========================================
  // 1-PHOTO LAYOUTS (3 layouts)
  // ==========================================

  hero_single: {
    id: 'hero_single',
    name: 'Hero',
    nameKey: 'collage:layouts.hero_single',
    minPhotos: 1,
    maxPhotos: 1,
    aspectRatio: '1:1',
    canvas: {
      width: 1200,
      height: 1200
    },
    grid: {
      desktop: '1fr',
      mobile: '1fr'
    },
    slots: [
      {
        id: 'slot-0',
        area: '1 / 1 / 2 / 2',
        crop: 'center',
        objectFit: 'cover',
        canvas: { x: 0, y: 0, w: 1200, h: 1200 }
      }
    ],
    gap: 0,
    padding: 0,
    preview: `
┌──────────┐
│          │
│    1     │
│          │
└──────────┘`
  },

  hero_wide: {
    id: 'hero_wide',
    name: 'Hero Wide',
    nameKey: 'collage:layouts.hero_wide',
    minPhotos: 1,
    maxPhotos: 1,
    aspectRatio: '16:9',
    canvas: {
      width: 1920,
      height: 1080
    },
    grid: {
      desktop: '1fr',
      mobile: '1fr'
    },
    slots: [
      {
        id: 'slot-0',
        area: '1 / 1 / 2 / 2',
        crop: 'center',
        objectFit: 'cover',
        canvas: { x: 0, y: 0, w: 1920, h: 1080 }
      }
    ],
    gap: 0,
    padding: 0,
    preview: `
┌────────────────┐
│       1        │
└────────────────┘`
  },

  hero_portrait: {
    id: 'hero_portrait',
    name: 'Hero Portrait',
    nameKey: 'collage:layouts.hero_portrait',
    minPhotos: 1,
    maxPhotos: 1,
    aspectRatio: '3:4',
    canvas: {
      width: 900,
      height: 1200
    },
    grid: {
      desktop: '1fr',
      mobile: '1fr'
    },
    slots: [
      {
        id: 'slot-0',
        area: '1 / 1 / 2 / 2',
        crop: 'center',
        objectFit: 'cover',
        canvas: { x: 0, y: 0, w: 900, h: 1200 }
      }
    ],
    gap: 0,
    padding: 0,
    preview: `
┌────────┐
│   1    │
│        │
│        │
└────────┘`
  },

  // ==========================================
  // 2-PHOTO LAYOUTS (3 layouts)
  // ==========================================

  side_by_side: {
    id: 'side_by_side',
    name: 'Side by Side',
    nameKey: 'collage:layouts.side_by_side',
    minPhotos: 2,
    maxPhotos: 2,
    aspectRatio: '2:1',
    canvas: {
      width: 2400,
      height: 1200
    },
    grid: {
      desktop: '1fr 1fr',
      mobile: '1fr' // Stack vertically on mobile
    },
    slots: [
      {
        id: 'slot-0',
        area: '1 / 1 / 2 / 2',
        crop: 'center',
        objectFit: 'cover',
        canvas: { x: 0, y: 0, w: 1200, h: 1200 }
      },
      {
        id: 'slot-1',
        area: '1 / 2 / 2 / 3',
        crop: 'center',
        objectFit: 'cover',
        canvas: { x: 1200, y: 0, w: 1200, h: 1200 }
      }
    ],
    gap: 0,
    padding: 0,
    preview: `
┌─────┬─────┐
│  1  │  2  │
└─────┴─────┘`
  },

  stacked: {
    id: 'stacked',
    name: 'Stacked',
    nameKey: 'collage:layouts.stacked',
    minPhotos: 2,
    maxPhotos: 2,
    aspectRatio: '1:2',
    canvas: {
      width: 1200,
      height: 2400
    },
    grid: {
      desktop: '1fr / 1fr',
      mobile: '1fr / 1fr'
    },
    slots: [
      {
        id: 'slot-0',
        area: '1 / 1 / 2 / 2',
        crop: 'center',
        objectFit: 'cover',
        canvas: { x: 0, y: 0, w: 1200, h: 1200 }
      },
      {
        id: 'slot-1',
        area: '2 / 1 / 3 / 2',
        crop: 'center',
        objectFit: 'cover',
        canvas: { x: 0, y: 1200, w: 1200, h: 1200 }
      }
    ],
    gap: 0,
    padding: 0,
    preview: `
┌──────────┐
│    1     │
├──────────┤
│    2     │
└──────────┘`
  },

  dominant_left: {
    id: 'dominant_left',
    name: 'Dominant Left',
    nameKey: 'collage:layouts.dominant_left',
    minPhotos: 2,
    maxPhotos: 2,
    aspectRatio: '4:3',
    canvas: {
      width: 1600,
      height: 1200
    },
    grid: {
      desktop: '3fr 1fr',
      mobile: '1fr' // Stack on mobile
    },
    slots: [
      {
        id: 'slot-0',
        area: '1 / 1 / 2 / 2',
        crop: 'center',
        objectFit: 'cover',
        canvas: { x: 0, y: 0, w: 1200, h: 1200 }
      },
      {
        id: 'slot-1',
        area: '1 / 2 / 2 / 3',
        crop: 'center',
        objectFit: 'cover',
        canvas: { x: 1200, y: 0, w: 400, h: 1200 }
      }
    ],
    gap: 0,
    padding: 0,
    preview: `
┌──────────┬──┐
│    1     │ 2│
└──────────┴──┘`
  },

  // ==========================================
  // 3-PHOTO LAYOUTS (3 layouts)
  // ==========================================

  triple_row: {
    id: 'triple_row',
    name: 'Triple Row',
    nameKey: 'collage:layouts.triple_row',
    minPhotos: 3,
    maxPhotos: 3,
    aspectRatio: '3:1',
    canvas: {
      width: 3600,
      height: 1200
    },
    grid: {
      desktop: '1fr 1fr 1fr',
      mobile: '1fr' // Stack on mobile
    },
    slots: [
      {
        id: 'slot-0',
        area: '1 / 1 / 2 / 2',
        crop: 'center',
        objectFit: 'cover',
        canvas: { x: 0, y: 0, w: 1200, h: 1200 }
      },
      {
        id: 'slot-1',
        area: '1 / 2 / 2 / 3',
        crop: 'center',
        objectFit: 'cover',
        canvas: { x: 1200, y: 0, w: 1200, h: 1200 }
      },
      {
        id: 'slot-2',
        area: '1 / 3 / 2 / 4',
        crop: 'center',
        objectFit: 'cover',
        canvas: { x: 2400, y: 0, w: 1200, h: 1200 }
      }
    ],
    gap: 0,
    padding: 0,
    preview: `
┌───┬───┬───┐
│ 1 │ 2 │ 3 │
└───┴───┴───┘`
  },

  l_shape: {
    id: 'l_shape',
    name: 'L-Shape',
    nameKey: 'collage:layouts.l_shape',
    minPhotos: 3,
    maxPhotos: 3,
    aspectRatio: '4:3',
    canvas: {
      width: 1600,
      height: 1200
    },
    grid: {
      desktop: '1fr 1fr / 2fr 1fr',
      mobile: '1fr / 1fr'
    },
    slots: [
      {
        id: 'slot-0',
        area: '1 / 1 / 3 / 2', // Spans 2 rows, 1 column
        crop: 'center',
        objectFit: 'cover',
        canvas: { x: 0, y: 0, w: 1200, h: 1200 }
      },
      {
        id: 'slot-1',
        area: '1 / 2 / 2 / 3',
        crop: 'center',
        objectFit: 'cover',
        canvas: { x: 1200, y: 0, w: 400, h: 600 }
      },
      {
        id: 'slot-2',
        area: '2 / 2 / 3 / 3',
        crop: 'center',
        objectFit: 'cover',
        canvas: { x: 1200, y: 600, w: 400, h: 600 }
      }
    ],
    gap: 0,
    padding: 0,
    preview: `
┌────────┬──┐
│   1    │ 2│
│        ├──┤
│        │ 3│
└────────┴──┘`
  },

  reverse_l: {
    id: 'reverse_l',
    name: 'Reverse L',
    nameKey: 'collage:layouts.reverse_l',
    minPhotos: 3,
    maxPhotos: 3,
    aspectRatio: '4:3',
    canvas: {
      width: 1600,
      height: 1200
    },
    grid: {
      desktop: '1fr 1fr / 1fr 2fr',
      mobile: '1fr / 1fr'
    },
    slots: [
      {
        id: 'slot-0',
        area: '1 / 1 / 2 / 2',
        crop: 'center',
        objectFit: 'cover',
        canvas: { x: 0, y: 0, w: 400, h: 600 }
      },
      {
        id: 'slot-1',
        area: '2 / 1 / 3 / 2',
        crop: 'center',
        objectFit: 'cover',
        canvas: { x: 0, y: 600, w: 400, h: 600 }
      },
      {
        id: 'slot-2',
        area: '1 / 2 / 3 / 3', // Spans 2 rows
        crop: 'center',
        objectFit: 'cover',
        canvas: { x: 400, y: 0, w: 1200, h: 1200 }
      }
    ],
    gap: 0,
    padding: 0,
    preview: `
┌──┬────────┐
│ 1│   3    │
├──┤        │
│ 2│        │
└──┴────────┘`
  },

  // ==========================================
  // 4-PHOTO LAYOUTS (2 layouts)
  // ==========================================

  classic_grid: {
    id: 'classic_grid',
    name: 'Classic Grid',
    nameKey: 'collage:layouts.classic_grid',
    minPhotos: 4,
    maxPhotos: 4,
    aspectRatio: '1:1',
    canvas: {
      width: 2400,
      height: 2400
    },
    grid: {
      desktop: '1fr 1fr / 1fr 1fr',
      mobile: '1fr 1fr / 1fr 1fr' // Same on mobile (2x2)
    },
    slots: [
      {
        id: 'slot-0',
        area: '1 / 1 / 2 / 2',
        crop: 'center',
        objectFit: 'cover',
        canvas: { x: 0, y: 0, w: 1200, h: 1200 }
      },
      {
        id: 'slot-1',
        area: '1 / 2 / 2 / 3',
        crop: 'center',
        objectFit: 'cover',
        canvas: { x: 1200, y: 0, w: 1200, h: 1200 }
      },
      {
        id: 'slot-2',
        area: '2 / 1 / 3 / 2',
        crop: 'center',
        objectFit: 'cover',
        canvas: { x: 0, y: 1200, w: 1200, h: 1200 }
      },
      {
        id: 'slot-3',
        area: '2 / 2 / 3 / 3',
        crop: 'center',
        objectFit: 'cover',
        canvas: { x: 1200, y: 1200, w: 1200, h: 1200 }
      }
    ],
    gap: 0,
    padding: 0,
    preview: `
┌─────┬─────┐
│  1  │  2  │
├─────┼─────┤
│  3  │  4  │
└─────┴─────┘`
  },

  timeline: {
    id: 'timeline',
    name: 'Timeline',
    nameKey: 'collage:layouts.timeline',
    minPhotos: 4,
    maxPhotos: 4,
    aspectRatio: '4:1',
    canvas: {
      width: 4800,
      height: 1200
    },
    grid: {
      desktop: '1fr 1fr 1fr 1fr',
      mobile: '1fr 1fr / 1fr 1fr' // 2x2 grid on mobile
    },
    slots: [
      {
        id: 'slot-0',
        area: '1 / 1 / 2 / 2',
        crop: 'center',
        objectFit: 'cover',
        canvas: { x: 0, y: 0, w: 1200, h: 1200 }
      },
      {
        id: 'slot-1',
        area: '1 / 2 / 2 / 3',
        crop: 'center',
        objectFit: 'cover',
        canvas: { x: 1200, y: 0, w: 1200, h: 1200 }
      },
      {
        id: 'slot-2',
        area: '1 / 3 / 2 / 4',
        crop: 'center',
        objectFit: 'cover',
        canvas: { x: 2400, y: 0, w: 1200, h: 1200 }
      },
      {
        id: 'slot-3',
        area: '1 / 4 / 2 / 5',
        crop: 'center',
        objectFit: 'cover',
        canvas: { x: 3600, y: 0, w: 1200, h: 1200 }
      }
    ],
    gap: 0,
    padding: 0,
    preview: `
┌──┬──┬──┬──┐
│ 1│ 2│ 3│ 4│
└──┴──┴──┴──┘`
  },

  // ==========================================
  // 5-6 PHOTO LAYOUTS (2 layouts)
  // ==========================================

  magazine: {
    id: 'magazine',
    name: 'Magazine',
    nameKey: 'collage:layouts.magazine',
    minPhotos: 5,
    maxPhotos: 6,
    aspectRatio: '4:3',
    canvas: {
      width: 2400,
      height: 1800
    },
    grid: {
      desktop: '1fr 1fr 1fr / 1fr 1fr 1fr',
      mobile: '1fr 1fr / 1fr 1fr' // 2 columns on mobile
    },
    slots: [
      {
        id: 'slot-0',
        area: '1 / 1 / 3 / 3', // Large: 2 rows x 2 cols
        crop: 'center',
        objectFit: 'cover',
        canvas: { x: 0, y: 0, w: 1600, h: 1200 }
      },
      {
        id: 'slot-1',
        area: '1 / 3 / 2 / 4',
        crop: 'center',
        objectFit: 'cover',
        canvas: { x: 1600, y: 0, w: 800, h: 600 }
      },
      {
        id: 'slot-2',
        area: '2 / 3 / 3 / 4',
        crop: 'center',
        objectFit: 'cover',
        canvas: { x: 1600, y: 600, w: 800, h: 600 }
      },
      {
        id: 'slot-3',
        area: '3 / 1 / 4 / 2',
        crop: 'center',
        objectFit: 'cover',
        canvas: { x: 0, y: 1200, w: 800, h: 600 }
      },
      {
        id: 'slot-4',
        area: '3 / 2 / 4 / 3',
        crop: 'center',
        objectFit: 'cover',
        canvas: { x: 800, y: 1200, w: 800, h: 600 }
      },
      {
        id: 'slot-5',
        area: '3 / 3 / 4 / 4',
        crop: 'center',
        objectFit: 'cover',
        canvas: { x: 1600, y: 1200, w: 800, h: 600 }
      }
    ],
    gap: 0,
    padding: 0,
    preview: `
┌──────┬──┐
│  1   │ 2│
│      ├──┤
│      │ 3│
├──┬──┬──┤
│ 4│ 5│ 6│
└──┴──┴──┘`
  },

  polaroid: {
    id: 'polaroid',
    name: 'Polaroid',
    nameKey: 'collage:layouts.polaroid',
    minPhotos: 6,
    maxPhotos: 6,
    aspectRatio: '3:2',
    canvas: {
      width: 3600,
      height: 2400
    },
    grid: {
      desktop: '1fr 1fr / 1fr 1fr 1fr',
      mobile: '1fr 1fr 1fr / 1fr 1fr' // 2 columns, 3 rows on mobile
    },
    slots: [
      {
        id: 'slot-0',
        area: '1 / 1 / 2 / 2',
        crop: 'center',
        objectFit: 'cover',
        canvas: { x: 0, y: 0, w: 1200, h: 1200 }
      },
      {
        id: 'slot-1',
        area: '1 / 2 / 2 / 3',
        crop: 'center',
        objectFit: 'cover',
        canvas: { x: 1200, y: 0, w: 1200, h: 1200 }
      },
      {
        id: 'slot-2',
        area: '1 / 3 / 2 / 4',
        crop: 'center',
        objectFit: 'cover',
        canvas: { x: 2400, y: 0, w: 1200, h: 1200 }
      },
      {
        id: 'slot-3',
        area: '2 / 1 / 3 / 2',
        crop: 'center',
        objectFit: 'cover',
        canvas: { x: 0, y: 1200, w: 1200, h: 1200 }
      },
      {
        id: 'slot-4',
        area: '2 / 2 / 3 / 3',
        crop: 'center',
        objectFit: 'cover',
        canvas: { x: 1200, y: 1200, w: 1200, h: 1200 }
      },
      {
        id: 'slot-5',
        area: '2 / 3 / 3 / 4',
        crop: 'center',
        objectFit: 'cover',
        canvas: { x: 2400, y: 1200, w: 1200, h: 1200 }
      }
    ],
    gap: 0,
    padding: 0,
    preview: `
┌───┬───┬───┐
│ 1 │ 2 │ 3 │
├───┼───┼───┤
│ 4 │ 5 │ 6 │
└───┴───┴───┘`
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get all layouts as an array
 * @returns {Array} Array of layout objects
 */
export function getAllLayouts() {
  return Object.values(LAYOUTS_V3)
}

/**
 * Get layouts compatible with given photo count
 * @param {number} photoCount - Number of selected photos
 * @returns {Array} Compatible layouts sorted by minPhotos
 */
export function getCompatibleLayouts(photoCount) {
  if (!photoCount || photoCount < 1) return []

  return Object.values(LAYOUTS_V3)
    .filter((layout) => photoCount >= layout.minPhotos && photoCount <= layout.maxPhotos)
    .sort((a, b) => a.minPhotos - b.minPhotos)
}

/**
 * Get layout by ID
 * @param {string} layoutId - Layout identifier
 * @returns {Object|null} Layout object or null if not found
 */
export function getLayoutById(layoutId) {
  return LAYOUTS_V3[layoutId] || null
}

/**
 * Get layouts by exact photo count
 * @param {number} photoCount - Exact number of photos
 * @returns {Array} Layouts that work best with this exact count
 */
export function getLayoutsByPhotoCount(photoCount) {
  return Object.values(LAYOUTS_V3)
    .filter((layout) => layout.minPhotos === photoCount)
    .sort((a, b) => a.name.localeCompare(b.name))
}

/**
 * Generate layout preview data for icon rendering
 * Returns grid structure for visual preview
 * @param {Object} layout - Layout object
 * @returns {Object} Preview data with grid dimensions and cell positions
 */
export function generateLayoutPreview(layout) {
  // Parse grid template to determine preview structure
  const gridCols = layout.grid.desktop.split(' ').length
  const gridRows = Math.ceil(layout.slots.length / gridCols)

  return {
    cols: gridCols,
    rows: gridRows,
    cells: layout.slots.map((slot, index) => ({
      id: slot.id,
      index: index + 1,
      area: slot.area,
      label: String(index + 1)
    })),
    aspectRatio: layout.aspectRatio,
    preview: layout.preview
  }
}

/**
 * Validate transform data for a layout
 * @param {Object} transforms - Transform data { [photoId]: { scale, translateX, translateY } }
 * @param {Object} layout - Layout object
 * @returns {Object} Validated transforms with defaults
 */
export function validateTransforms(transforms, layout) {
  const validated = {}

  layout.slots.forEach((slot, index) => {
    const photoId = `photo-${index}` // Placeholder, will be replaced with actual photo IDs
    validated[photoId] = {
      scale: transforms?.[photoId]?.scale || 1,
      translateX: transforms?.[photoId]?.translateX || 0,
      translateY: transforms?.[photoId]?.translateY || 0
    }
  })

  return validated
}

/**
 * Calculate responsive grid template based on screen size
 * @param {Object} layout - Layout object
 * @param {number} screenWidth - Current screen width in pixels
 * @returns {string} CSS Grid template string
 */
export function getResponsiveGrid(layout, screenWidth) {
  const MOBILE_BREAKPOINT = 768
  return screenWidth < MOBILE_BREAKPOINT ? layout.grid.mobile : layout.grid.desktop
}

/**
 * Get layout categories for filtering
 * @returns {Array} Categories with layout IDs
 */
export function getLayoutCategories() {
  return [
    {
      id: '1-photo',
      name: '1 Photo',
      nameKey: 'collage:categories.single',
      layouts: ['hero_single', 'hero_wide', 'hero_portrait']
    },
    {
      id: '2-photos',
      name: '2 Photos',
      nameKey: 'collage:categories.duo',
      layouts: ['side_by_side', 'stacked', 'dominant_left']
    },
    {
      id: '3-photos',
      name: '3 Photos',
      nameKey: 'collage:categories.trio',
      layouts: ['triple_row', 'l_shape', 'reverse_l']
    },
    {
      id: '4-photos',
      name: '4 Photos',
      nameKey: 'collage:categories.quad',
      layouts: ['classic_grid', 'timeline']
    },
    {
      id: '5-6-photos',
      name: '5-6 Photos',
      nameKey: 'collage:categories.multi',
      layouts: ['magazine', 'polaroid']
    }
  ]
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default LAYOUTS_V3
