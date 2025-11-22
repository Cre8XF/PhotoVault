// ============================================================================
// STORE: collageStore.js - Zustand slice for Collage Builder state
// ============================================================================

/**
 * Collage Builder State Management
 *
 * Manages:
 * - Template selection and slot initialization
 * - Photo assignment to slots
 * - Slot transformations (rotation, position, scale)
 * - Dirty state tracking for unsaved changes
 * - Photo picker panel state
 */

import { create } from 'zustand';

const useCollageStore = create((set, get) => ({
  // ============================================================================
  // STATE
  // ============================================================================

  // Core collage data
  collageId: null,
  template: null,
  slots: [],
  title: '',

  // UI state
  selectedSlotIndex: null,
  isPhotoPickerOpen: false,
  isDirty: false,

  // Metadata
  createdAt: null,
  updatedAt: null,
  version: 2, // Always create v2 collages

  // ============================================================================
  // ACTIONS
  // ============================================================================

  /**
   * Initialize a new collage from template
   */
  initializeFromTemplate: (template) => {
    const slots = template.slots.map((slot, index) => ({
      id: slot.id,
      slotIndex: index,
      photo: null,
      transform: {
        rotation: 0,
        scale: 1,
        offsetX: 0,
        offsetY: 0,
      },
      // Grid position from template
      row: slot.row,
      col: slot.col,
      rowSpan: slot.rowSpan,
      colSpan: slot.colSpan,
    }));

    set({
      template,
      slots,
      title: '',
      selectedSlotIndex: null,
      isPhotoPickerOpen: false,
      isDirty: false,
      collageId: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 2,
    });
  },

  /**
   * Load existing collage (with migration support)
   */
  loadCollage: (collageData, template) => {
    const { id, title, slots, version = 1, createdAt, updatedAt } = collageData;

    // If v1, migrate to v2 format
    let migratedSlots = slots;
    if (version === 1) {
      migratedSlots = get().migrateV1Slots(slots, template);
    }

    set({
      collageId: id,
      template,
      slots: migratedSlots,
      title: title || '',
      selectedSlotIndex: null,
      isPhotoPickerOpen: false,
      isDirty: false,
      createdAt: createdAt || new Date().toISOString(),
      updatedAt: updatedAt || new Date().toISOString(),
      version: 2, // Always use v2 after migration
    });
  },

  /**
   * Migrate v1 slots to v2 format
   */
  migrateV1Slots: (v1Slots, template) => {
    return template.slots.map((templateSlot, index) => {
      const oldSlot = v1Slots[index];
      return {
        id: templateSlot.id,
        slotIndex: index,
        photo: oldSlot?.photo || null,
        transform: oldSlot?.transform || {
          rotation: 0,
          scale: 1,
          offsetX: 0,
          offsetY: 0,
        },
        row: templateSlot.row,
        col: templateSlot.col,
        rowSpan: templateSlot.rowSpan,
        colSpan: templateSlot.colSpan,
      };
    });
  },

  /**
   * Set photo for a slot
   */
  setSlotPhoto: (slotIndex, photo) => {
    const slots = [...get().slots];
    if (slots[slotIndex]) {
      slots[slotIndex] = {
        ...slots[slotIndex],
        photo,
        transform: {
          rotation: 0,
          scale: 1,
          offsetX: 0,
          offsetY: 0,
        },
      };
      set({ slots, isDirty: true, updatedAt: new Date().toISOString() });
    }
  },

  /**
   * Remove photo from a slot
   */
  removeSlotPhoto: (slotIndex) => {
    const slots = [...get().slots];
    if (slots[slotIndex]) {
      slots[slotIndex] = {
        ...slots[slotIndex],
        photo: null,
        transform: {
          rotation: 0,
          scale: 1,
          offsetX: 0,
          offsetY: 0,
        },
      };
      set({ slots, isDirty: true, updatedAt: new Date().toISOString() });
    }
  },

  /**
   * Rotate photo in a slot (90° clockwise)
   */
  rotateSlotPhoto: (slotIndex) => {
    const slots = [...get().slots];
    if (slots[slotIndex]?.photo) {
      const currentRotation = slots[slotIndex].transform.rotation;
      slots[slotIndex] = {
        ...slots[slotIndex],
        transform: {
          ...slots[slotIndex].transform,
          rotation: (currentRotation + 90) % 360,
        },
      };
      set({ slots, isDirty: true, updatedAt: new Date().toISOString() });
    }
  },

  /**
   * Update slot transform
   */
  updateSlotTransform: (slotIndex, transform) => {
    const slots = [...get().slots];
    if (slots[slotIndex]) {
      slots[slotIndex] = {
        ...slots[slotIndex],
        transform: {
          ...slots[slotIndex].transform,
          ...transform,
        },
      };
      set({ slots, isDirty: true, updatedAt: new Date().toISOString() });
    }
  },

  /**
   * Swap photos between two slots
   */
  swapSlots: (slotIndex1, slotIndex2) => {
    const slots = [...get().slots];
    if (slots[slotIndex1] && slots[slotIndex2]) {
      const temp1Photo = slots[slotIndex1].photo;
      const temp1Transform = slots[slotIndex1].transform;

      slots[slotIndex1] = {
        ...slots[slotIndex1],
        photo: slots[slotIndex2].photo,
        transform: slots[slotIndex2].transform,
      };

      slots[slotIndex2] = {
        ...slots[slotIndex2],
        photo: temp1Photo,
        transform: temp1Transform,
      };

      set({ slots, isDirty: true, updatedAt: new Date().toISOString() });
    }
  },

  /**
   * Set collage title
   */
  setTitle: (title) => {
    set({ title, isDirty: true, updatedAt: new Date().toISOString() });
  },

  /**
   * Set selected slot
   */
  setSelectedSlot: (slotIndex) => {
    set({ selectedSlotIndex: slotIndex });
  },

  /**
   * Open photo picker for slot
   */
  openPhotoPicker: (slotIndex) => {
    set({ selectedSlotIndex: slotIndex, isPhotoPickerOpen: true });
  },

  /**
   * Close photo picker
   */
  closePhotoPicker: () => {
    set({ isPhotoPickerOpen: false });
  },

  /**
   * Mark as saved (clear dirty flag)
   */
  markAsSaved: (collageId) => {
    set({ isDirty: false, collageId, updatedAt: new Date().toISOString() });
  },

  /**
   * Reset store to initial state
   */
  reset: () => {
    set({
      collageId: null,
      template: null,
      slots: [],
      title: '',
      selectedSlotIndex: null,
      isPhotoPickerOpen: false,
      isDirty: false,
      createdAt: null,
      updatedAt: null,
      version: 2,
    });
  },

  /**
   * Get collage data for saving
   */
  getCollageData: () => {
    const state = get();
    return {
      id: state.collageId,
      templateId: state.template?.id,
      title: state.title,
      slots: state.slots,
      version: state.version,
      createdAt: state.createdAt,
      updatedAt: state.updatedAt,
    };
  },

  /**
   * Check if collage is ready to save (has at least one photo)
   */
  isReadyToSave: () => {
    const state = get();
    return state.slots.some(slot => slot.photo !== null);
  },
}));

export default useCollageStore;
