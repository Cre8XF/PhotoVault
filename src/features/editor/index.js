/**
 * Photo Editor Feature - Phase 1: Crop & Rotate
 *
 * Main exports for the photo editor feature module
 */

// Main Component
export { default as PhotoEditor } from './components/PhotoEditor'

// Sub-components
export { default as CropTool } from './components/CropTool'
export { default as RotateTool } from './components/RotateTool'
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

// Phase 2: Filter utilities will be added later
// export { FILTERS, applyFilter, adjustBrightness } from './utils/filterUtils'
