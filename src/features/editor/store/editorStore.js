import { create } from 'zustand'

/**
 * Editor State Store
 *
 * Manages all editor state including:
 * - Image URLs (original, working, preview)
 * - Transform state (crop, rotate, adjustments, filters)
 * - History for undo/redo
 * - UI state (active tool, loading)
 */
const useEditorStore = create((set, get) => ({
  // ============================================================================
  // IMAGE STATE
  // ============================================================================

  originalUrl: null,
  workingUrl: null, // Current state after transforms
  previewUrl: null, // Temporary preview during adjustment
  preloadedImage: null, // ✅ Preloaded HTMLImageElement for canvas (CORS fix)
  canvasRef: null, // ✅ Active editor canvas for export

  setOriginalUrl: (url) => set({ originalUrl: url, workingUrl: url }),
  setWorkingUrl: (url) => set({ workingUrl: url }),
  setPreviewUrl: (url) => set({ previewUrl: url }),
  setPreloadedImage: (image) => set({ preloadedImage: image }),
  setCanvasRef: (ref) => set({ canvasRef: ref }),

  // ============================================================================
  // TRANSFORM STATE
  // ============================================================================

  transform: {
    // Crop
    crop: null, // { x1, y1, x2, y2, aspectRatio }

    // Rotate & Flip
    rotation: 0, // 0, 90, 180, 270
    flipH: false,
    flipV: false,

    // Adjustments
    adjustments: {
      brightness: 0, // -100 to 100
      contrast: 0, // -100 to 100
      saturation: 0, // -100 to 100
      temperature: 0, // -100 to 100 (warmth)
      tint: 0, // -100 to 100
      highlights: 0, // -100 to 100
      shadows: 0, // -100 to 100
      sharpness: 0, // 0 to 100
      vignette: 0, // 0 to 100
    },

    // Filters
    filter: {
      active: null, // 'vivid', 'warm', 'cool', 'bw', etc.
      intensity: 100, // 0 to 100
    },
  },

  /**
   * Apply a transform update
   * @param {string} key - Transform key (crop, rotation, adjustments, filter)
   * @param {*} value - New value
   */
  applyTransform: (key, value) => {
    const state = get()

    // Deep merge for nested objects like adjustments
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      set({
        transform: {
          ...state.transform,
          [key]: {
            ...state.transform[key],
            ...value,
          },
        },
      })
    } else {
      // Simple value update
      set({
        transform: {
          ...state.transform,
          [key]: value,
        },
      })
    }

    // Add to history
    state.addToHistory()
  },

  /**
   * Reset specific transform
   */
  resetTransform: (key) => {
    const state = get()
    const defaults = {
      crop: null,
      rotation: 0,
      flipH: false,
      flipV: false,
      adjustments: {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        temperature: 0,
        tint: 0,
        highlights: 0,
        shadows: 0,
        sharpness: 0,
        vignette: 0,
      },
      filter: {
        active: null,
        intensity: 100,
      },
    }

    set({
      transform: {
        ...state.transform,
        [key]: defaults[key],
      },
    })

    state.addToHistory()
  },

  /**
   * Reset ALL transforms to original
   */
  resetAll: () => {
    set({
      transform: {
        crop: null,
        rotation: 0,
        flipH: false,
        flipV: false,
        adjustments: {
          brightness: 0,
          contrast: 0,
          saturation: 0,
          temperature: 0,
          tint: 0,
          highlights: 0,
          shadows: 0,
          sharpness: 0,
          vignette: 0,
        },
        filter: {
          active: null,
          intensity: 100,
        },
      },
      workingUrl: get().originalUrl,
    })

    // Clear history
    set({ history: [], historyIndex: -1 })
  },

  // ============================================================================
  // HISTORY (Undo/Redo)
  // ============================================================================

  history: [],
  historyIndex: -1,
  maxHistorySize: 50,

  addToHistory: () => {
    const state = get()
    const snapshot = {
      transform: JSON.parse(JSON.stringify(state.transform)),
      workingUrl: state.workingUrl,
      timestamp: Date.now(),
    }

    // Remove any history after current index (if we undid and then made new change)
    const newHistory = state.history.slice(0, state.historyIndex + 1)

    // Add new snapshot
    newHistory.push(snapshot)

    // Limit history size
    if (newHistory.length > state.maxHistorySize) {
      newHistory.shift()
    }

    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    })
  },

  undo: () => {
    const state = get()
    if (state.historyIndex > 0) {
      const newIndex = state.historyIndex - 1
      const snapshot = state.history[newIndex]

      set({
        transform: snapshot.transform,
        workingUrl: snapshot.workingUrl,
        historyIndex: newIndex,
      })
    }
  },

  redo: () => {
    const state = get()
    if (state.historyIndex < state.history.length - 1) {
      const newIndex = state.historyIndex + 1
      const snapshot = state.history[newIndex]

      set({
        transform: snapshot.transform,
        workingUrl: snapshot.workingUrl,
        historyIndex: newIndex,
      })
    }
  },

  canUndo: () => {
    return get().historyIndex > 0
  },

  canRedo: () => {
    const state = get()
    return state.historyIndex < state.history.length - 1
  },

  // ============================================================================
  // UI STATE
  // ============================================================================

  activeTool: null, // 'adjust', 'crop', 'rotate', 'filters'
  isProcessing: false,

  setActiveTool: (tool) => set({ activeTool: tool }),
  setProcessing: (value) => set({ isProcessing: value }),

  // ============================================================================
  // CLEANUP
  // ============================================================================

  /**
   * Reset store to initial state (call on unmount)
   */
  cleanup: () => {
    set({
      originalUrl: null,
      workingUrl: null,
      previewUrl: null,
      preloadedImage: null,
      canvasRef: null,
      transform: {
        crop: null,
        rotation: 0,
        flipH: false,
        flipV: false,
        adjustments: {
          brightness: 0,
          contrast: 0,
          saturation: 0,
          temperature: 0,
          tint: 0,
          highlights: 0,
          shadows: 0,
          sharpness: 0,
          vignette: 0,
        },
        filter: {
          active: null,
          intensity: 100,
        },
      },
      history: [],
      historyIndex: -1,
      activeTool: null,
      isProcessing: false,
    })
  },
}))

export default useEditorStore
