// ============================================================================
// STORE: editorStore.js - Zustand slice for Photo Editor state
// ============================================================================

/**
 * Editor State Management
 *
 * Manages:
 * - Original and working photo states
 * - Transform parameters (brightness, contrast, saturation, etc.)
 * - Dirty state tracking
 * - Active editing mode
 */

import { create } from 'zustand';

const useEditorStore = create((set, get) => ({
  // ============================================================================
  // STATE
  // ============================================================================

  // Photo data
  originalPhoto: null,
  workingPhoto: null,

  // Transform state
  transform: {
    brightness: 0,      // -100 to 100
    contrast: 0,        // -100 to 100
    saturation: 0,      // -100 to 100
    temperature: 0,     // -100 to 100 (warm/cool)
    blur: 0,            // 0 to 10
    vignette: 0,        // 0 to 100
    rotate: 0,          // 0, 90, 180, 270
    flipH: false,       // horizontal flip
    flipV: false,       // vertical flip
    crop: null,         // { x, y, width, height, aspectRatio } or null
    filter: null,       // filter preset ID or null
  },

  // Zoom & Pan state (Phase 7A)
  zoom: {
    currentZoom: 1,
    minZoom: 0.5,
    maxZoom: 3,
    panX: 0,
    panY: 0,
  },

  // UI state
  activeMode: null,     // 'adjust' | 'crop' | 'rotate' | 'filters' | null
  isDirty: false,

  // ============================================================================
  // ACTIONS
  // ============================================================================

  /**
   * Initialize editor with photo
   */
  initializeEditor: (photo) => {
    set({
      originalPhoto: photo,
      workingPhoto: { ...photo },
      transform: {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        temperature: 0,
        blur: 0,
        vignette: 0,
        rotate: 0,
        flipH: false,
        flipV: false,
        crop: null,
        filter: null,
      },
      zoom: {
        currentZoom: 1,
        minZoom: 0.5,
        maxZoom: 3,
        panX: 0,
        panY: 0,
      },
      activeMode: null,
      isDirty: false,
    });
  },

  /**
   * Apply single transform
   */
  applyTransform: (field, value) => {
    const currentTransform = get().transform;
    set({
      transform: {
        ...currentTransform,
        [field]: value,
      },
      isDirty: true,
    });
  },

  /**
   * Apply batch transform (e.g., from filter preset)
   */
  applyBatch: (transformUpdates) => {
    const currentTransform = get().transform;
    set({
      transform: {
        ...currentTransform,
        ...transformUpdates,
      },
      isDirty: true,
    });
  },

  /**
   * Reset to original (clear all transforms)
   */
  resetToOriginal: () => {
    set({
      transform: {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        temperature: 0,
        blur: 0,
        vignette: 0,
        rotate: 0,
        flipH: false,
        flipV: false,
        crop: null,
        filter: null,
      },
      zoom: {
        currentZoom: 1,
        minZoom: 0.5,
        maxZoom: 3,
        panX: 0,
        panY: 0,
      },
      isDirty: false,
    });
  },

  /**
   * Set zoom level
   */
  setZoom: (zoomValue) => {
    const currentZoom = get().zoom;
    const newZoom = Math.max(currentZoom.minZoom, Math.min(currentZoom.maxZoom, zoomValue));
    set({
      zoom: { ...currentZoom, currentZoom: newZoom },
      isDirty: true,
    });
  },

  /**
   * Set pan position
   */
  setPan: (panX, panY) => {
    const currentZoom = get().zoom;
    set({
      zoom: { ...currentZoom, panX, panY },
      isDirty: true,
    });
  },

  /**
   * Reset zoom and pan
   */
  resetZoomPan: () => {
    const currentZoom = get().zoom;
    set({
      zoom: { ...currentZoom, currentZoom: 1, panX: 0, panY: 0 },
    });
  },

  /**
   * Set crop box
   */
  setCrop: (cropBox) => {
    const currentTransform = get().transform;
    set({
      transform: { ...currentTransform, crop: cropBox },
      isDirty: true,
    });
  },

  /**
   * Reset crop
   */
  resetCrop: () => {
    const currentTransform = get().transform;
    set({
      transform: { ...currentTransform, crop: null },
    });
  },

  /**
   * Set active editing mode
   */
  setActiveMode: (mode) => {
    set({ activeMode: mode });
  },

  /**
   * Mark as dirty
   */
  markDirty: () => {
    set({ isDirty: true });
  },

  /**
   * Mark as clean (after save)
   */
  markClean: () => {
    set({ isDirty: false });
  },

  /**
   * Clear editor state
   */
  clearEditor: () => {
    set({
      originalPhoto: null,
      workingPhoto: null,
      transform: {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        temperature: 0,
        blur: 0,
        vignette: 0,
        rotate: 0,
        flipH: false,
        flipV: false,
        crop: null,
        filter: null,
      },
      zoom: {
        currentZoom: 1,
        minZoom: 0.5,
        maxZoom: 3,
        panX: 0,
        panY: 0,
      },
      activeMode: null,
      isDirty: false,
    });
  },

  /**
   * Get current transform settings
   */
  getTransform: () => {
    return get().transform;
  },

  /**
   * Check if any transforms have been applied
   */
  hasTransforms: () => {
    const t = get().transform;
    return (
      t.brightness !== 0 ||
      t.contrast !== 0 ||
      t.saturation !== 0 ||
      t.temperature !== 0 ||
      t.blur !== 0 ||
      t.vignette !== 0 ||
      t.rotate !== 0 ||
      t.flipH !== false ||
      t.flipV !== false ||
      t.crop !== null ||
      t.filter !== null
    );
  },
}));

export default useEditorStore;
