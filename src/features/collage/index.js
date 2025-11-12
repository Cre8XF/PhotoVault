/**
 * Collage Maker Feature - Phase 1 & 2: Canvas Engine, Layouts, Text & Stickers
 *
 * Main exports for the collage maker feature module
 */

// Main component
export { default as CollageBuilder } from './components/CollageBuilder'

// Sub-components
export { default as LayoutSelector } from './components/LayoutSelector'
export { default as PhotoSelector } from './components/PhotoSelector'
export { default as TextToolPanel } from './components/TextToolPanel'
export { default as StickerPanel } from './components/StickerPanel'

// Layouts
export {
  GRID_LAYOUTS,
  getAllLayouts,
  getLayoutsBySlots,
  getLayoutById
} from './layouts/gridLayouts'

// Hooks
export { useCollageCanvas } from './hooks/useCollageCanvas'

// Utilities - Canvas
export {
  canvasToBlob,
  canvasToDataURL,
  clearCanvas,
  drawSlotBorder,
  drawPlaceholder,
  drawRoundedRect,
  drawRoundedImage,
  downloadCanvas,
  getOptimalCanvasDimensions
} from './utils/canvasUtils'

// Utilities - Image Loading
export {
  loadImage,
  loadImages,
  resizeImage,
  drawImageCover,
  drawImageContain,
  createThumbnail
} from './utils/imageLoader'

// Phase 2: Text Utilities
export {
  drawText,
  drawMultilineText,
  measureText,
  wrapText,
  FONT_FAMILIES,
  FONT_WEIGHTS,
  TEXT_COLORS
} from './utils/textUtils'

// Phase 2: Sticker Utilities
export {
  STICKERS,
  getStickerCategories,
  getStickersByCategory,
  drawSticker,
  drawStickerRotated,
  getStickerBounds,
  STICKER_SIZES
} from './utils/stickers'
