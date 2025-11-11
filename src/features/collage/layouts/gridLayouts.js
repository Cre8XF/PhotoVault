// Grid layout definitions for collage maker
// Each layout defines canvas dimensions and photo slot positions

export const GRID_LAYOUTS = {
  '2-photos-horizontal': {
    id: '2-photos-horizontal',
    name: '2 bilder (horisontal)',
    slots: 2,
    canvas: { width: 1200, height: 600 },
    positions: [
      { x: 0, y: 0, w: 600, h: 600 },
      { x: 600, y: 0, w: 600, h: 600 }
    ]
  },

  '2-photos-vertical': {
    id: '2-photos-vertical',
    name: '2 bilder (vertikal)',
    slots: 2,
    canvas: { width: 600, height: 1200 },
    positions: [
      { x: 0, y: 0, w: 600, h: 600 },
      { x: 0, y: 600, w: 600, h: 600 }
    ]
  },

  '3-photos-vertical': {
    id: '3-photos-vertical',
    name: '3 bilder (vertikal)',
    slots: 3,
    canvas: { width: 800, height: 1200 },
    positions: [
      { x: 0, y: 0, w: 800, h: 400 },
      { x: 0, y: 400, w: 800, h: 400 },
      { x: 0, y: 800, w: 800, h: 400 }
    ]
  },

  '3-photos-mixed': {
    id: '3-photos-mixed',
    name: '3 bilder (mikset)',
    slots: 3,
    canvas: { width: 1200, height: 900 },
    positions: [
      { x: 0, y: 0, w: 800, h: 900 },    // Large left
      { x: 800, y: 0, w: 400, h: 450 },  // Small top right
      { x: 800, y: 450, w: 400, h: 450 } // Small bottom right
    ]
  },

  '4-photos-grid': {
    id: '4-photos-grid',
    name: '4 bilder (grid)',
    slots: 4,
    canvas: { width: 1200, height: 1200 },
    positions: [
      { x: 0, y: 0, w: 600, h: 600 },
      { x: 600, y: 0, w: 600, h: 600 },
      { x: 0, y: 600, w: 600, h: 600 },
      { x: 600, y: 600, w: 600, h: 600 }
    ]
  },

  '4-photos-collage': {
    id: '4-photos-collage',
    name: '4 bilder (kollasj)',
    slots: 4,
    canvas: { width: 1200, height: 1200 },
    positions: [
      { x: 0, y: 0, w: 800, h: 600 },    // Large top
      { x: 800, y: 0, w: 400, h: 600 },  // Right top
      { x: 0, y: 600, w: 400, h: 600 },  // Left bottom
      { x: 400, y: 600, w: 800, h: 600 } // Large bottom right
    ]
  },

  '5-photos-creative': {
    id: '5-photos-creative',
    name: '5 bilder (kreativ)',
    slots: 5,
    canvas: { width: 1200, height: 1200 },
    positions: [
      { x: 0, y: 0, w: 600, h: 600 },    // Top left
      { x: 600, y: 0, w: 600, h: 600 },  // Top right
      { x: 0, y: 600, w: 400, h: 600 },  // Bottom left
      { x: 400, y: 600, w: 400, h: 600 },// Bottom middle
      { x: 800, y: 600, w: 400, h: 600 } // Bottom right
    ]
  },

  '6-photos-grid': {
    id: '6-photos-grid',
    name: '6 bilder (grid)',
    slots: 6,
    canvas: { width: 1200, height: 1600 },
    positions: [
      { x: 0, y: 0, w: 600, h: 533 },
      { x: 600, y: 0, w: 600, h: 533 },
      { x: 0, y: 533, w: 600, h: 533 },
      { x: 600, y: 533, w: 600, h: 533 },
      { x: 0, y: 1066, w: 600, h: 534 },
      { x: 600, y: 1066, w: 600, h: 534 }
    ]
  },

  '9-photos-grid': {
    id: '9-photos-grid',
    name: '9 bilder (grid)',
    slots: 9,
    canvas: { width: 1200, height: 1200 },
    positions: [
      { x: 0, y: 0, w: 400, h: 400 },
      { x: 400, y: 0, w: 400, h: 400 },
      { x: 800, y: 0, w: 400, h: 400 },
      { x: 0, y: 400, w: 400, h: 400 },
      { x: 400, y: 400, w: 400, h: 400 },
      { x: 800, y: 400, w: 400, h: 400 },
      { x: 0, y: 800, w: 400, h: 400 },
      { x: 400, y: 800, w: 400, h: 400 },
      { x: 800, y: 800, w: 400, h: 400 }
    ]
  }
}

// Get all layouts as an array
export const getAllLayouts = () => {
  return Object.values(GRID_LAYOUTS)
}

// Get layouts by number of slots
export const getLayoutsBySlots = (slots) => {
  return Object.values(GRID_LAYOUTS).filter(layout => layout.slots === slots)
}

// Get layout by ID
export const getLayoutById = (id) => {
  return GRID_LAYOUTS[id] || null
}
