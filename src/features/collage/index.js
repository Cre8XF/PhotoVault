/**
 * Collage Maker Feature - Phase 1: Canvas Engine & Layouts
 *
 * Main exports for the collage maker feature module
 */

// Main component
export { default as CollageBuilder } from './components/CollageBuilder'

// Sub-components
export { default as LayoutSelector } from './components/LayoutSelector'
export { default as PhotoSelector } from './components/PhotoSelector'

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
