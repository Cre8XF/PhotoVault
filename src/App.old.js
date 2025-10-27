// ============================================================================
// APP.js – v5.2 med komplett i18n-støtte
// ============================================================================
import React, { useState, useEffect, useMemo } from "react";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { useTranslation } from 'react-i18next';

// Pages
import LoginPage from "./pages/LoginPage";
import HomeDashboard from "./pages/HomeDashboard";
import AlbumsPage from "./pages/AlbumsPage";
import SearchPage from "./pages/SearchPage";
import MorePage from "./pages/MorePage";
import AlbumPage from "./pages/AlbumPage";
import AdminDashboard from "./pages/AdminDashboard";
import SecuritySettings from "./pages/SecuritySettings";

// Components
import UploadModal from "./components/UploadModal";
import PhotoModal from "./components/PhotoModal";
import AlbumModal from "./components/AlbumModal";
import ConfirmModal from "./components/ConfirmModal";
import Notification from "./components/Notification";
import Particles from "./components/Particles";
import PINLockScreen from "./components/PINLockScreen";

// Icons
import { Home, FolderOpen, Plus, Search, Menu } from "lucide-react";

// Firebase & Utils
import {
  addAlbum,
  getAlbumsByUser,
  updateAlbum,
  uploadPhoto,
  getPhotosByUser,
  deletePhoto,
  updatePhoto,
} from "./firebase";

// Security Context
import { SecurityProvider, useSecurityContext } from "./contexts/SecurityContext";
import { ToastProvider } from './contexts/ToastContext';

function App() {
  return (
    <ToastProvider>
      <SecurityProvider>
        <AppContent />
      </SecurityProvider>
    </ToastProvider>
  );
}

// Main App Component (wrapped in SecurityProvider)
function AppContent() {
  // i18n
  const { t } = useTranslation(['common', 'nav']);

  // Auth
  const auth = getAuth();

  // Security context
  const { isLocked, pinEnabled } = useSecurityContext();
  
  // Auth state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Navigation state
  const [currentPage, setCurrentPage] = useState("home");
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  
  // Data state
  const [albums, setAlbums] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  
  // Modal state
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [albumModalOpen, setAlbumModalOpen] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [photoModalOpen, setPhotoModalOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [confirmModal, setConfirmModal] = useState(null);
  
  // UI state
  const [notification, setNotification] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved !== "light";
  });

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        refreshData(currentUser.uid);
      } else {
        setAlbums([]);
        setPhotos([]);
        setUserProfile(null);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  // Theme effect
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.remove("light-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.add("light-mode");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  // Global drag & drop
  useEffect(() => {
    if (!user) return;

    const handleGlobalDrop = (e) => {
      e.preventDefault();
      const files = Array.from(e.dataTransfer.files);
      const imageFiles = files.filter(f => f.type.startsWith("image/"));
      
      if (imageFiles.length > 0 && !uploadModalOpen) {
        setUploadModalOpen(true);
        setTimeout(() => {
          const event = new CustomEvent('externalFileDrop', { detail: imageFiles });
          window.dispatchEvent(event);
        }, 100);
      }
    };

    const handleGlobalDragOver = (e) => {
      e.preventDefault();
    };

    window.addEventListener('drop', handleGlobalDrop);
    window.addEventListener('dragover', handleGlobalDragOver);

    return () => {
      window.removeEventListener('drop', handleGlobalDrop);
      window.removeEventListener('dragover', handleGlobalDragOver);
    };
  }, [user, uploadModalOpen]);

  // Refresh data
  const refreshData = async (uid = user?.uid) => {
    if (!uid) return;
    try {
      const [albumData, photoData] = await Promise.all([
        getAlbumsByUser(uid),
        getPhotosByUser(uid)
      ]);
      setAlbums(albumData);
      setPhotos(photoData);
    } catch (err) {
      console.error("Error refreshing data:", err);
      setNotification({ message: t('common:notifications.errorLoadingData'), type: "error" });
    }
  };

  // Handle logout
  const handleLogout = async () => {
    setConfirmModal({
      title: t('common:notifications.confirmLogout'),
      message: t('common:notifications.confirmLogoutMessage'),
      onConfirm: async () => {
        try {
          await signOut(auth);
          setCurrentPage("home");
          setNotification({ message: t('common:notifications.loggedOut'), type: "success" });
        } catch (err) {
          console.error("Logout error:", err);
          setNotification({ message: t('common:notifications.logoutError'), type: "error" });
        }
      }
    });
  };

  // Handle photo click
  const handlePhotoClick = (photo) => {
    const index = photos.findIndex(p => p.id === photo.id);
    setSelectedPhotoIndex(index);
    setPhotoModalOpen(true);
  };

  // Handle album click
  const handleAlbumClick = (album) => {
    setSelectedAlbum(album);
    setCurrentPage("album");
  };

  // Toggle favorite
  const toggleFavorite = async (photo) => {
    try {
      await updatePhoto(photo.id, { favorite: !photo.favorite });
      await refreshData();
      setNotification({
        message: photo.favorite ? t('common:notifications.removedFromFavorites') : t('common:notifications.addedToFavorites'),
        type: "success"
      });
    } catch (err) {
      console.error("Error toggling favorite:", err);
      setNotification({ message: t('common:notifications.updateError'), type: "error" });
    }
  };

  // ✅ Handle upload - kaller uploadPhoto fra firebase.js
  const handleUpload = async (selectedFiles, albumId, aiTagging = false) => {
    if (!user) {
      setNotification({ message: t('common:notifications.mustBeLoggedIn'), type: "error" });
      return;
    }

    try {
      let successCount = 0;

      for (const fileObj of selectedFiles) {
        await uploadPhoto(user.uid, fileObj.file, albumId, aiTagging);
        successCount++;
      }

      await refreshData();

      const message = aiTagging
        ? t('common:notifications.photosUploadedWithAI', { count: successCount })
        : t('common:notifications.photosUploaded', { count: successCount });

      setNotification({ message, type: "success" });

    } catch (error) {
      console.error("Upload error:", error);
      setNotification({
        message: t('common:notifications.uploadError', { message: error.message }),
        type: "error"
      });
      throw error;
    }
  };

  // Handle create/edit album
  const handleAlbumSave = async (albumData) => {
    try {
      if (editingAlbum) {
        await updateAlbum(editingAlbum.id, albumData);
        setNotification({ message: t('common:notifications.albumUpdated'), type: "success" });
      } else {
        await addAlbum({ ...albumData, userId: user.uid });
        setNotification({ message: t('common:notifications.albumCreated'), type: "success" });
      }
      setAlbumModalOpen(false);
      setEditingAlbum(null);
      await refreshData();
    } catch (err) {
      console.error("Album save error:", err);
      setNotification({ message: t('common:notifications.albumSaveError'), type: "error" });
    }
  };

  // Handle create album from upload modal (returns album ID)
  const handleCreateAlbumFromUpload = async (albumName) => {
    try {
      const albumData = {
        name: String(albumName).trim(),
        title: String(albumName).trim(),
        userId: user.uid,
        createdAt: new Date().toISOString(),
        photoCount: 0,
        cover: ""
      };
      
      const albumId = await addAlbum(albumData);
      await refreshData();
      setNotification({ message: t('common:notifications.albumCreated'), type: "success" });
      return albumId;
    } catch (err) {
      console.error("Album creation error:", err);
      setNotification({ message: t('common:notifications.albumCreationError'), type: "error" });
      throw err;
    }
  };

  // Handle delete album
  const handleDeleteAlbum = (album) => {
    const albumPhotos = photos.filter(p => p.albumId === album.id);
    const photosNote = albumPhotos.length > 0
      ? t('common:notifications.deleteAlbumPhotosNote', { count: albumPhotos.length })
      : t('common:notifications.deleteAlbumEmptyNote');

    setConfirmModal({
      title: t('common:notifications.deleteAlbumTitle'),
      message: t('common:notifications.deleteAlbumMessage', {
        name: album.name,
        photos: photosNote
      }),
      onConfirm: async () => {
        try {
          // Fjern albumId fra alle bilder i albumet
          for (const photo of albumPhotos) {
            await updatePhoto(photo.id, { albumId: null });
          }

          // Slett albumet fra Firestore
          const { deleteDoc, doc } = await import('firebase/firestore');
          const { db } = await import('./firebase');
          await deleteDoc(doc(db, 'albums', album.id));

          await refreshData();
          if (currentPage === "album" && selectedAlbum?.id === album.id) {
            setCurrentPage("albums");
            setSelectedAlbum(null);
          }
          setNotification({ message: t('common:notifications.albumDeleted'), type: "success" });
        } catch (err) {
          console.error("Delete album error:", err);
          setNotification({ message: t('common:notifications.albumDeleteError'), type: "error" });
        }
      }
    });
  };

  // Handle delete photo
  const handleDeletePhoto = (photo) => {
    setConfirmModal({
      title: t('common:notifications.deletePhotoTitle'),
      message: t('common:notifications.deletePhotoMessage'),
      onConfirm: async () => {
        try {
          await deletePhoto(photo.id, photo.storagePath);
          await refreshData();
          setPhotoModalOpen(false);
          setNotification({ message: t('common:notifications.photoDeleted'), type: "success" });
        } catch (err) {
          console.error("Delete photo error:", err);
          setNotification({ message: t('common:notifications.photoDeleteError'), type: "error" });
        }
      }
    });
  };

  // Calculate storage
  const storageUsed = useMemo(() => {
    return photos.reduce((acc, photo) => acc + (photo.size || 0), 0);
  }, [photos]);

  const storageLimit = userProfile?.storageLimit || 524288000; // 500 MB default

  // Show loading
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="spinner" />
      </div>
    );
  }

  // Show login if not authenticated
  if (!user) {
    return <LoginPage />;
  }

  // Show PIN lock screen if locked
  if (isLocked && pinEnabled) {
    return <PINLockScreen />;
  }

  const isAdmin = userProfile?.role === "admin";

  return (
    <div className="min-h-screen relative">
      <Particles />

      {/* Main content */}
      <main className="relative z-10">
        {currentPage === "home" && (
          <HomeDashboard
            albums={albums}
            photos={photos}
            user={userProfile || user}
            onNavigate={setCurrentPage}
            refreshData={refreshData}
          />
        )}

        {currentPage === "albums" && (
          <AlbumsPage
            albums={albums}
            photos={photos}
            onNavigate={setCurrentPage}
            onAlbumClick={handleAlbumClick}
            onPhotoClick={handlePhotoClick}
            toggleFavorite={toggleFavorite}
          />
        )}

        {currentPage === "search" && (
          <SearchPage
            photos={photos}
            albums={albums}
            onPhotoClick={handlePhotoClick}
            toggleFavorite={toggleFavorite}
          />
        )}

        {currentPage === "more" && (
          <MorePage
            user={userProfile || user}
            storageUsed={storageUsed}
            storageLimit={storageLimit}
            photos={photos}
            albums={albums}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
            onLogout={handleLogout}
            onNavigate={setCurrentPage}
          />
        )}

        {currentPage === "security" && (
          <SecuritySettings
            onBack={() => setCurrentPage("more")}
          />
        )}

        {currentPage === "album" && selectedAlbum && (
          <AlbumPage
            album={selectedAlbum}
            user={userProfile || user}
            photos={photos}
            onBack={() => {
              setCurrentPage("albums");
              setSelectedAlbum(null);
            }}
            refreshData={refreshData}
            colors={{}}
          />
        )}

        {currentPage === "admin" && isAdmin && (
          <AdminDashboard
            onBack={() => setCurrentPage("more")}
          />
        )}
      </main>

      {/* Bottom navigation */}
      {currentPage !== "album" && currentPage !== "admin" && currentPage !== "security" && (
        <nav className="bottom-nav-float">
          <div className="flex justify-around items-center gap-2">
            {/* Home */}
            <button
              onClick={() => setCurrentPage("home")}
              className={`ripple-effect nav-item-premium ${
                currentPage === "home" ? "active" : ""
              }`}
            >
              <Home className="w-6 h-6" />
              <span className="text-xs font-medium">{t('nav:home')}</span>
            </button>

            {/* Albums */}
            <button
              onClick={() => setCurrentPage("albums")}
              className={`ripple-effect nav-item-premium ${
                currentPage === "albums" ? "active" : ""
              }`}
            >
              <FolderOpen className="w-6 h-6" />
              <span className="text-xs font-medium">{t('nav:albums')}</span>
            </button>

            {/* Upload (center FAB) */}
            <button
              onClick={() => setUploadModalOpen(true)}
              className="ripple-effect bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 p-4 rounded-full shadow-lg transition transform hover:scale-110 -mt-6"
              aria-label={t('nav:upload')}
            >
              <Plus className="w-7 h-7 text-white" />
            </button>

            {/* Search */}
            <button
              onClick={() => setCurrentPage("search")}
              className={`ripple-effect nav-item-premium ${
                currentPage === "search" ? "active" : ""
              }`}
            >
              <Search className="w-6 h-6" />
              <span className="text-xs font-medium">{t('nav:search')}</span>
            </button>

            {/* More */}
            <button
              onClick={() => setCurrentPage("more")}
              className={`ripple-effect nav-item-premium ${
                currentPage === "more" ? "active" : ""
              }`}
            >
              <Menu className="w-6 h-6" />
              <span className="text-xs font-medium">{t('nav:more')}</span>
            </button>
          </div>
        </nav>
      )}

      {/* Modals */}
      {uploadModalOpen && (
        <UploadModal
          isOpen={uploadModalOpen}
          albums={albums}
          onClose={() => setUploadModalOpen(false)}
          onUpload={handleUpload}
          onCreateAlbum={handleCreateAlbumFromUpload}
        />
      )}

      {albumModalOpen && (
        <AlbumModal
          album={editingAlbum}
          onClose={() => {
            setAlbumModalOpen(false);
            setEditingAlbum(null);
          }}
          onSave={handleAlbumSave}
        />
      )}

      {photoModalOpen && (
        <PhotoModal
          photos={photos}
          currentIndex={selectedPhotoIndex}
          onClose={() => setPhotoModalOpen(false)}
          onToggleFavorite={toggleFavorite}
        />
      )}

     {confirmModal && (
  <ConfirmModal
    isOpen={true}
    title={confirmModal.title}
    message={confirmModal.message}
    onConfirm={confirmModal.onConfirm}
    onClose={() => setConfirmModal(null)}
    confirmLabel={t('common:notifications.logout')}
    cancelLabel={t('common:cancel')}
  />
)}


      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </div>
  );
}

export default App;