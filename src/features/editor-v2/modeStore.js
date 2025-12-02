// src/features/editor-v2/modeStore.js
import { create } from 'zustand';

/**
 * Editor V2 Mode Store
 * Manages the current editing mode (view, crop, adjust, rotate, filters, text, markup)
 */
const useEditorModeStore = create((set) => ({
  // Current mode
  mode: 'view', // 'view' | 'crop' | 'adjust' | 'rotate' | 'filters' | 'text' | 'markup'

  // Actions
  setMode: (newMode) => set({ mode: newMode }),
  resetMode: () => set({ mode: 'view' }),
}));

export default useEditorModeStore;
