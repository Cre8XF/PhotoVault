/**
 * Photo Editor Feature - Phase 6: Function Worlds Architecture
 *
 * Main exports for the photo editor feature module
 * Note: Old modal-based editor components removed in Phase 6 cleanup
 */

// Components (Phase 1+: Function Worlds only)
export { default as EditorPreview } from './components/EditorPreview'

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

// Utilities - Save & Integration
export {
  saveEditedPhoto,
  generatePreviewUrl,
  isEditedPhoto,
  getOriginalPhotoId
} from './utils/editorUtils'
