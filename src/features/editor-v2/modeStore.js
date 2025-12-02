// src/features/editor-v2/modeStore.js
import { create } from 'zustand';

/**
 * Editor V2 Mode Store
 * Manages the current editing mode (view, crop, adjust, rotate, filters, text, markup)
 */
const useEditorModeStore = create((set, get) => ({
  // Current mode
  mode: 'view', // 'view' | 'crop' | 'adjust' | 'rotate' | 'filters' | 'text' | 'markup'

  // Working image URL (committed edits)
  workingImageUrl: null,

  // Transform state
  transform: {
    rotate: 0,      // 0 | 90 | 180 | 270
    flipH: false,
    flipV: false,
  },

  // Adjust state
  adjust: {
    brightness: 0,   // -100 to +100
    contrast: 0,     // -100 to +100
    saturation: 0,   // -100 to +100
    warmth: 0,       // -100 to +100
  },

  // Crop state
  crop: {
    isActive: false,
    // Normalized coordinates [0..1] relative to the viewport/image
    rect: {
      x1: 0.1,
      y1: 0.1,
      x2: 0.9,
      y2: 0.9,
    },
    aspectRatio: null, // null = free; number = width/height ratio
    activeHandle: null, // 'move' | 'tl' | 'tr' | 'bl' | 'br' | 't' | 'b' | 'l' | 'r' | null
  },

  // Mode actions
  setMode: (newMode) => set({ mode: newMode }),
  resetMode: () => set({ mode: 'view' }),

  // Working image actions
  setWorkingImageUrl: (url) => set({ workingImageUrl: url }),

  // Transform actions
  setRotate: (deg) => {
    // Normalize to [0, 90, 180, 270]
    const normalized = Math.round(deg / 90) * 90 % 360;
    const final = normalized < 0 ? normalized + 360 : normalized;
    set((state) => ({
      transform: {
        ...state.transform,
        rotate: final,
      },
    }));
  },

  setFlipH: (val) => {
    set((state) => ({
      transform: {
        ...state.transform,
        flipH: typeof val === 'boolean' ? val : !state.transform.flipH,
      },
    }));
  },

  setFlipV: (val) => {
    set((state) => ({
      transform: {
        ...state.transform,
        flipV: typeof val === 'boolean' ? val : !state.transform.flipV,
      },
    }));
  },

  resetTransforms: () => {
    set({
      transform: {
        rotate: 0,
        flipH: false,
        flipV: false,
      },
    });
  },

  // Adjust actions
  setAdjustValue: (key, value) => {
    // Clamp value between -100 and +100
    const clampedValue = Math.max(-100, Math.min(100, value));
    set((state) => ({
      adjust: {
        ...state.adjust,
        [key]: clampedValue,
      },
    }));
  },

  resetAdjust: () => {
    set({
      adjust: {
        brightness: 0,
        contrast: 0,
        saturation: 0,
        warmth: 0,
      },
    });
  },

  // Crop actions
  setCropRect: (rect) => {
    const MIN_SIZE = 0.05; // Minimum 5% of viewport

    // Clamp and validate
    let { x1, y1, x2, y2 } = rect;

    // Ensure values are between 0 and 1
    x1 = Math.max(0, Math.min(1, x1));
    y1 = Math.max(0, Math.min(1, y1));
    x2 = Math.max(0, Math.min(1, x2));
    y2 = Math.max(0, Math.min(1, y2));

    // Ensure x1 < x2 and y1 < y2
    if (x1 > x2) [x1, x2] = [x2, x1];
    if (y1 > y2) [y1, y2] = [y2, y1];

    // Ensure minimum size
    const width = x2 - x1;
    const height = y2 - y1;

    if (width < MIN_SIZE) {
      const center = (x1 + x2) / 2;
      x1 = Math.max(0, center - MIN_SIZE / 2);
      x2 = Math.min(1, center + MIN_SIZE / 2);
    }

    if (height < MIN_SIZE) {
      const center = (y1 + y2) / 2;
      y1 = Math.max(0, center - MIN_SIZE / 2);
      y2 = Math.min(1, center + MIN_SIZE / 2);
    }

    set((state) => ({
      crop: {
        ...state.crop,
        rect: { x1, y1, x2, y2 },
      },
    }));
  },

  setActiveHandle: (handle) => {
    set((state) => ({
      crop: {
        ...state.crop,
        activeHandle: handle,
      },
    }));
  },

  setCropActive: (isActive) => {
    set((state) => ({
      crop: {
        ...state.crop,
        isActive,
      },
    }));
  },

  setAspectRatio: (ratio) => {
    console.log('Aspect ratio changed:', ratio);
    set((state) => ({
      crop: {
        ...state.crop,
        aspectRatio: ratio,
      },
    }));
  },

  resetCrop: () => {
    set({
      crop: {
        isActive: false,
        rect: {
          x1: 0.1,
          y1: 0.1,
          x2: 0.9,
          y2: 0.9,
        },
        aspectRatio: null,
        activeHandle: null,
      },
    });
  },
}));

export default useEditorModeStore;
