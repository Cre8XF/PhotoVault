import { create } from 'zustand';

/**
 * EditorV5 Store - Minimal state for MVP
 * Manages photo state, active tool, and CSS filter adjustments
 */
const useEditorV5Store = create((set) => ({
  // Core photo state
  photoId: null,
  imageUrl: null,

  // Active tool: 'adjust' | 'crop' | 'rotate' | 'filters' | null
  activeTool: null,

  // Adjustment values (used for CSS filters)
  adjustments: {
    brightness: 100, // 0-200, default 100
    contrast: 100,   // 0-200, default 100
    saturate: 100,   // 0-200, default 100
  },

  // Actions
  setPhotoData: (photoId, imageUrl) =>
    set({ photoId, imageUrl }),

  setActiveTool: (tool) =>
    set({ activeTool: tool }),

  setAdjustment: (key, value) =>
    set((state) => ({
      adjustments: {
        ...state.adjustments,
        [key]: value,
      },
    })),

  resetAdjustments: () =>
    set({
      adjustments: {
        brightness: 100,
        contrast: 100,
        saturate: 100,
      },
    }),

  reset: () =>
    set({
      photoId: null,
      imageUrl: null,
      activeTool: null,
      adjustments: {
        brightness: 100,
        contrast: 100,
        saturate: 100,
      },
    }),
}));

export default useEditorV5Store;
