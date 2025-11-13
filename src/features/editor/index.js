/**
 * Photo Editor Feature - Phase 1, 2 & 3: Crop, Rotate, Filters, Adjustments & Text
 *
 * Main exports for the photo editor feature module
 */

// Main Component
export { default as PhotoEditor } from './components/PhotoEditor'

// Sub-components
export { default as CropTool } from './components/CropTool'
export { default as RotateTool } from './components/RotateTool'
export { default as FilterPanel } from './components/FilterPanel'
export { default as TextTool } from './components/TextTool'
export { default as EditorToolbar } from './components/EditorToolbar'

// Hooks
export { usePhotoEditor } from './hooks/usePhotoEditor'

// Utilities - Crop
export {
  applyCrop,
  constrainCropArea,
  getCropAreaForRatio,
  rotateCropArea90,
  loadImageToCanvas,
  canvasToBlob,
  rotateCanvas90
} from './utils/cropUtils'

// Utilities - Filters & Adjustments
export {
  FILTERS,
  applyFilter,
  adjustBrightness,
  adjustContrast,
  adjustSaturation,
  applyAdjustments
} from './utils/filterUtils'

// Utilities - Text Overlay
export {
  DEFAULT_TEXT_LAYER,
  FONT_FAMILIES,
  renderTextLayer,
  applyTextLayers,
  generateTextLayerId,
  createTextLayer,
  updateTextLayer,
  measureText,
  getTextBoundingBox
} from './utils/textUtils'
