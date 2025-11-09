// ============================================================================
// Zustand Global Store - Phase 2: State Management
// ============================================================================
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { createVaultSlice } from './vaultSlice';

/**
 * PhotoVault Global Store
 * Centralizes all application state to eliminate prop drilling
 */
const useStore = create(
  devtools(
    persist(
      (set, get) => ({
        // =====================================================================
        // AUTH STATE
        // =====================================================================
        user: null,
        userProfile: null,
        loading: true,

        setUser: (user) => set({ user }),
        setUserProfile: (profile) => set({ userProfile: profile }),
        setLoading: (loading) => set({ loading }),

        logout: () => set({
          user: null,
          userProfile: null,
          albums: [],
          photos: [],
          currentPage: 'home',
          selectedAlbum: null,
          notification: null,
          confirmModal: null,
        }),

        // =====================================================================
        // DATA STATE
        // =====================================================================
        albums: [],
        photos: [],

        setAlbums: (albums) => set({ albums }),
        setPhotos: (photos) => set({ photos }),

        addAlbum: (album) => set((state) => ({
          albums: Array.isArray(state.albums) ? [...state.albums, album] : [album]
        })),

        updateAlbum: (albumId, updates) => set((state) => ({
          albums: Array.isArray(state.albums)
            ? state.albums.map(album =>
                album.id === albumId ? { ...album, ...updates } : album
              )
            : []
        })),

        deleteAlbum: (albumId) => set((state) => ({
          albums: Array.isArray(state.albums)
            ? state.albums.filter(album => album.id !== albumId)
            : []
        })),

        addPhoto: (photo) => set((state) => ({
          photos: Array.isArray(state.photos) ? [...state.photos, photo] : [photo]
        })),

        updatePhoto: (photoId, updates) => set((state) => ({
          photos: Array.isArray(state.photos)
            ? state.photos.map(photo =>
                photo.id === photoId ? { ...photo, ...updates } : photo
              )
            : []
        })),

        deletePhoto: (photoId) => set((state) => ({
          photos: Array.isArray(state.photos)
            ? state.photos.filter(photo => photo.id !== photoId)
            : []
        })),

        // =====================================================================
        // NAVIGATION STATE
        // =====================================================================
        currentPage: 'home',
        selectedAlbum: null,
        selectedPhotoIndex: 0,

        setCurrentPage: (page) => set({ currentPage: page }),
        setSelectedAlbum: (album) => set({ selectedAlbum: album }),
        setSelectedPhotoIndex: (index) => set({ selectedPhotoIndex: index }),

        navigateToAlbum: (album) => set({
          selectedAlbum: album,
          currentPage: 'album'
        }),

        navigateBack: () => set({
          currentPage: 'albums',
          selectedAlbum: null
        }),

        // =====================================================================
        // MODAL STATE
        // =====================================================================
        uploadModalOpen: false,
        albumModalOpen: false,
        photoModalOpen: false,
        confirmModal: null,
        editingAlbum: null,

        setUploadModalOpen: (open) => set({ uploadModalOpen: open }),
        setAlbumModalOpen: (open) => set({ albumModalOpen: open }),
        setPhotoModalOpen: (open) => set({ photoModalOpen: open }),
        setConfirmModal: (modal) => set({ confirmModal: modal }),
        setEditingAlbum: (album) => set({ editingAlbum: album }),

        openUploadModal: () => set({ uploadModalOpen: true }),
        closeUploadModal: () => set({ uploadModalOpen: false }),

        openAlbumModal: (album = null) => set({
          albumModalOpen: true,
          editingAlbum: album
        }),

        closeAlbumModal: () => set({
          albumModalOpen: false,
          editingAlbum: null
        }),

        openPhotoModal: (photoIndex) => set({
          photoModalOpen: true,
          selectedPhotoIndex: photoIndex
        }),

        closePhotoModal: () => set({ photoModalOpen: false }),

        // =====================================================================
        // UI STATE
        // =====================================================================
        notification: null,
        isDarkMode: true,

        setNotification: (notification) => set({ notification }),
        clearNotification: () => set({ notification: null }),

        showNotification: (message, type = 'info') => set({
          notification: { message, type }
        }),

        setTheme: (isDark) => {
          set({ isDarkMode: isDark });
          if (isDark) {
            document.body.classList.remove('light-mode');
            localStorage.setItem('theme', 'dark');
          } else {
            document.body.classList.add('light-mode');
            localStorage.setItem('theme', 'light');
          }
        },

        toggleTheme: () => {
          const newTheme = !get().isDarkMode;
          get().setTheme(newTheme);
        },

        // =====================================================================
        // AI QUEUE STATE
        // =====================================================================
        aiQueue: [],
        processingAI: false,

        addToAIQueue: (task) => set((state) => ({
          aiQueue: [...state.aiQueue, { ...task, id: Date.now(), status: 'pending' }]
        })),

        removeFromAIQueue: (taskId) => set((state) => ({
          aiQueue: state.aiQueue.filter(task => task.id !== taskId)
        })),

        updateAIQueueTask: (taskId, updates) => set((state) => ({
          aiQueue: state.aiQueue.map(task =>
            task.id === taskId ? { ...task, ...updates } : task
          )
        })),

        setProcessingAI: (processing) => set({ processingAI: processing }),

        // =====================================================================
        // STORAGE STATE
        // =====================================================================
        storageUsed: 0,
        storageLimit: 524288000, // 500 MB default

        updateStorageUsed: () => {
          const photos = get().photos;
          const total = Array.isArray(photos)
            ? photos.reduce((acc, photo) => acc + (photo.size || 0), 0)
            : 0;
          set({ storageUsed: total });
        },

        setStorageLimit: (limit) => set({ storageLimit: limit }),

        // =====================================================================
        // COMPUTED GETTERS
        // =====================================================================
        getAlbumById: (albumId) => {
          const albums = get().albums;
          return Array.isArray(albums) ? albums.find(album => album.id === albumId) : null;
        },

        getPhotoById: (photoId) => {
          const photos = get().photos;
          return Array.isArray(photos) ? photos.find(photo => photo.id === photoId) : null;
        },

        getPhotosByAlbum: (albumId) => {
          const photos = get().photos;
          return Array.isArray(photos) ? photos.filter(photo => photo.albumId === albumId) : [];
        },

        getFavoritePhotos: () => {
          const photos = get().photos;
          return Array.isArray(photos) ? photos.filter(photo => photo.favorite) : [];
        },

        getPhotosWithoutAlbum: () => {
          const photos = get().photos;
          return Array.isArray(photos) ? photos.filter(photo => !photo.albumId) : [];
        },

        isAdmin: () => {
          return get().userProfile?.role === 'admin';
        },

        // =====================================================================
        // UTILITY ACTIONS
        // =====================================================================
        reset: () => set({
          user: null,
          userProfile: null,
          albums: [],
          photos: [],
          currentPage: 'home',
          selectedAlbum: null,
          uploadModalOpen: false,
          albumModalOpen: false,
          photoModalOpen: false,
          confirmModal: null,
          notification: null,
          aiQueue: [],
          processingAI: false,
        }),

        // =====================================================================
        // VAULT SLICE
        // =====================================================================
        ...createVaultSlice(set, get),
      }),
      {
        name: 'photovault-storage',
        partialize: (state) => ({
          isDarkMode: state.isDarkMode,
          // Vault settings (but not unlocked state or photos)
          vaultPasswordHash: state.vaultPasswordHash,
          vaultSettings: state.vaultSettings,
        }),
      }
    ),
    { name: 'PhotoVault Store' }
  )
);

export default useStore;
