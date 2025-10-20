// ============================================================================
// APP.js – v5.0 FASE 3: Sikkerhet & Privacy
// ============================================================================
import React, { useState, useEffect, useMemo } from "react";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";

// Pages
import LoginPage from "./pages/LoginPage";
import HomeDashboard from "./pages/HomeDashboard";
import AlbumsPage from "./pages/AlbumsPage";
import SearchPage from "./pages/SearchPage";
import MorePage from "./pages/MorePage";
import AlbumPage from "./pages/AlbumPage";
import AdminDashboard from "./pages/AdminDashboard";
import SecuritySettings from "./pages/SecuritySettings"; // NEW

// Components
import UploadModal from "./components/UploadModal";
import PhotoModal from "./components/PhotoModal";
import AlbumModal from "./components/AlbumModal";
import ConfirmModal from "./components/ConfirmModal";
import Notification from "./components/Notification";
import Particles from "./components/Particles";
import PINLockScreen from "./components/PINLockScreen"; // NEW

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

// Security Context (NEW)
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
  // Auth
  const auth = getAuth();
  
  // Security context
  const { isLocked, pinEnabled } = useSecurityContext();
  
  // Auth state
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Navigation state
  const [currentPage, setCurrentPage] = useState("home"); // home, albums, search, more, album, admin, security
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
        // Small delay to ensure modal is mounted
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
      setNotification({ message: "Feil ved lasting av data", type: "error" });
    }
  };

  // Handle logout
  const handleLogout = async () => {
    setConfirmModal({
      title: "Bekreft utlogging",
      message: "Er du sikker på at du vil logge ut?",
      onConfirm: async () => {
        try {
          await signOut(auth);
          setCurrentPage("home");
          setNotification({ message: "Du er nå logget ut", type: "success" });
        } catch (err) {
          console.error("Logout error:", err);
          setNotification({ message: "Feil ved utlogging", type: "error" });
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
        message: photo.favorite ? "Fjernet fra favoritter" : "Lagt til i favoritter",
        type: "success"
      });
    } catch (err) {
      console.error("Error toggling favorite:", err);
      setNotification({ message: "Feil ved oppdatering", type: "error" });
    }
  };

  // Handle upload
  const handleUpload = async (files, albumId, aiTagging) => {
    try {
      setUploadModalOpen(false);
      setNotification({ message: "Laster opp bilder...", type: "info" });
      
      for (const file of files) {
        await uploadPhoto(user.uid, file, albumId, aiTagging);
      }
      
      await refreshData();
      setNotification({ 
        message: `${files.length} ${files.length === 1 ? 'bilde' : 'bilder'} lastet opp`, 
        type: "success" 
      });
    } catch (err) {
      console.error("Upload error:", err);
      setNotification({ message: "Feil ved opplasting", type: "error" });
    }
  };

  // Handle create/edit album
  const handleAlbumSave = async (albumData) => {
    try {
      if (editingAlbum) {
        await updateAlbum(editingAlbum.id, albumData);
        setNotification({ message: "Album oppdatert", type: "success" });
      } else {
        await addAlbum({ ...albumData, userId: user.uid });
        setNotification({ message: "Album opprettet", type: "success" });
      }
      setAlbumModalOpen(false);
      setEditingAlbum(null);
      await refreshData();
    } catch (err) {
      console.error("Album save error:", err);
      setNotification({ message: "Feil ved lagring av album", type: "error" });
    }
  };

  // Handle create album from upload modal (returns album ID)
  const handleCreateAlbumFromUpload = async (albumData) => {
    try {
      const albumId = await addAlbum({ ...albumData, userId: user.uid });
      await refreshData();
      setNotification({ message: "Album opprettet", type: "success" });
      return albumId;
    } catch (err) {
      console.error("Album creation error:", err);
      setNotification({ message: "Feil ved opprettelse av album", type: "error" });
      throw err;
    }
  };

  // Handle delete album
  const handleDeleteAlbum = (album) => {
    const albumPhotos = photos.filter(p => p.albumId === album.id);
    setConfirmModal({
      title: "Slett album",
      message: `Er du sikker på at du vil slette "${album.name}"? ${
        albumPhotos.length > 0 
          ? `${albumPhotos.length} bilder vil bli flyttet til "Uten album".`
          : 'Albumet er tomt.'
      }`,
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
          setNotification({ message: "Album slettet", type: "success" });
        } catch (err) {
          console.error("Delete album error:", err);
          setNotification({ message: "Feil ved sletting", type: "error" });
        }
      }
    });
  };

  // Handle delete photo
  const handleDeletePhoto = (photo) => {
    setConfirmModal({
      title: "Slett bilde",
      message: "Er du sikker på at du vil slette dette bildet? Dette kan ikke angres.",
      onConfirm: async () => {
        try {
          await deletePhoto(photo.id, photo.storagePath);
          await refreshData();
          setPhotoModalOpen(false);
          setNotification({ message: "Bilde slettet", type: "success" });
        } catch (err) {
          console.error("Delete photo error:", err);
          setNotification({ message: "Feil ved sletting", type: "error" });
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

  // Show PIN lock screen if locked (NEW)
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
            photos={photos.filter(p => p.albumId === selectedAlbum.id)}
            onBack={() => {
              setCurrentPage("albums");
              setSelectedAlbum(null);
            }}
            onPhotoClick={handlePhotoClick}
            onEditAlbum={() => {
              setEditingAlbum(selectedAlbum);
              setAlbumModalOpen(true);
            }}
            onDeleteAlbum={() => handleDeleteAlbum(selectedAlbum)}
            toggleFavorite={toggleFavorite}
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
        <nav className="fixed bottom-0 left-0 right-0 bg-gray-900/80 backdrop-blur-xl border-t border-white/10 z-50">
          <div className="flex justify-around items-center py-3 px-2">
            {/* Home */}
            <button
              onClick={() => setCurrentPage("home")}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition ${
                currentPage === "home" 
                  ? "text-purple-400 bg-white/10" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Home className="w-6 h-6" />
              <span className="text-xs font-medium">Hjem</span>
            </button>

            {/* Albums */}
            <button
              onClick={() => setCurrentPage("albums")}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition ${
                currentPage === "albums" 
                  ? "text-purple-400 bg-white/10" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <FolderOpen className="w-6 h-6" />
              <span className="text-xs font-medium">Album</span>
            </button>

            {/* Upload (center FAB) */}
            <button
              onClick={() => setUploadModalOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 p-4 rounded-full shadow-lg transition transform hover:scale-110 -mt-6"
            >
              <Plus className="w-7 h-7 text-white" />
            </button>

            {/* Search */}
            <button
              onClick={() => setCurrentPage("search")}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition ${
                currentPage === "search" 
                  ? "text-purple-400 bg-white/10" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Search className="w-6 h-6" />
              <span className="text-xs font-medium">Søk</span>
            </button>

            {/* More */}
            <button
              onClick={() => setCurrentPage("more")}
              className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition ${
                currentPage === "more" 
                  ? "text-purple-400 bg-white/10" 
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Menu className="w-6 h-6" />
              <span className="text-xs font-medium">Mer</span>
            </button>
          </div>
        </nav>
      )}

      {/* Modals */}
      {uploadModalOpen && (
        <UploadModal
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
          title={confirmModal.title}
          message={confirmModal.message}
          onConfirm={() => {
            confirmModal.onConfirm();
            setConfirmModal(null);
          }}
          onCancel={() => setConfirmModal(null)}
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
