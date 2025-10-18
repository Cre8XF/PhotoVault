// APP.JS – v2.1 med auto-refresh og favoritt-støtte
// ============================================================================
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Grid,
  Users,
  User,
  Moon,
  Sun,
  Home,
  Folder,
  Plus,
} from "lucide-react";

import Notification from "./components/Notification";
import ConfirmModal from "./components/ConfirmModal";
import UploadModal from "./components/UploadModal";
import Particles from "./components/Particles";
import DashboardPage from "./pages/DashboardPage";
import GalleryPage from "./pages/GalleryPage";
import AlbumPage from "./pages/AlbumPage";
import ProfilePage from "./pages/ProfilePage";
import AdminDashboard from "./pages/AdminDashboard";
import LoginPage from "./pages/LoginPage";
import DatabaseTools from "./pages/DatabaseTools";

import { getAlbumsByUser, getPhotosByUser } from "./firebase";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import {
  doc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import { getStorage, ref, deleteObject } from "firebase/storage";
const storage = getStorage();

const App = () => {
  const [user, setUser] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [currentPage, setCurrentPage] = useState("login");
  const [currentAlbum, setCurrentAlbum] = useState(null);
  const [notification, setNotification] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const auth = getAuth();

  // 🎨 Toggle darkMode and update body class
  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      document.body.classList.toggle('light-mode', !newMode);
      return newMode;
    });
  };

  useEffect(() => {
    document.body.classList.toggle('light-mode', !darkMode);
  }, [darkMode]);

  // 🎨 Tema (med lyst tema support)
  const colors = useMemo(
    () => ({
      text: darkMode ? "text-gray-100" : "text-gray-900",
      textSecondary: darkMode ? "text-gray-400" : "text-gray-600",
      bg: darkMode 
        ? "from-gray-900 to-gray-800" 
        : "from-indigo-50 via-purple-50 to-pink-50",
      cardBg: darkMode ? "bg-gray-700/60" : "bg-white/80",
      buttonPrimary: darkMode
        ? "bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/50"
        : "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg",
      buttonSecondary: darkMode
        ? "bg-white/10 hover:bg-white/20"
        : "bg-purple-100 hover:bg-purple-200 text-purple-900",
      glass: darkMode
        ? "backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl"
        : "backdrop-blur-xl border border-purple-200/50 rounded-2xl shadow-xl bg-white/60",
    }),
    [darkMode]
  );

  // 🔄 FORBEDRET: Hent album og bilder (med loading-state)
  const refreshUserData = useCallback(async (uid) => {
    if (!uid || isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      const [userAlbums, userPhotos] = await Promise.all([
        getAlbumsByUser(uid),
        getPhotosByUser(uid),
      ]);
      
      setAlbums(userAlbums);
      setPhotos(userPhotos);
      
      // Global referanse for AlbumPage cover-oppdatering
      window.albums = userAlbums;
      
      console.log("✅ Data oppdatert:", {
        albums: userAlbums.length,
        photos: userPhotos.length,
      });
    } catch (err) {
      console.error("Feil ved lasting av Firestore-data:", err);
      setNotification({ 
        message: "Kunne ikke laste data fra Firestore.", 
        type: "error" 
      });
    } finally {
      setIsRefreshing(false);
    }
  }, [isRefreshing]);

  // 🟣 Firebase Auth overvåking
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await firebaseUser.reload();
        const adminEmails = ["rogsor80@gmail.com"];
        const role = adminEmails.includes(firebaseUser.email) ? "admin" : "user";

        setUser((prevUser) => {
          // Kun oppdater bruker hvis det er en endring
          const newUser = {
            email: firebaseUser.email,
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName,
            role,
          };
          
          // Hvis bruker allerede er satt, ikke endre currentPage
          if (prevUser?.uid === newUser.uid) {
            return newUser;
          }
          
          // Første innlogging - gå til dashboard
          setCurrentPage("dashboard");
          return newUser;
        });

        await refreshUserData(firebaseUser.uid);
      } else {
        setUser(null);
        setCurrentPage("login");
      }
    });
    return () => unsubscribe();
  }, []);

  // 🚪 Logg ut
  const handleLogout = async () => {
    try {
      await signOut(auth);
      setNotification({ message: "Du er logget ut.", type: "success" });
      setUser(null);
      setCurrentPage("login");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // 📂 Åpne album
  const handleOpenAlbum = (album) => {
    setCurrentAlbum(album);
    setCurrentPage("album");
  };

  // 🗑️ Slett album + bilder
  const handleDeleteAlbum = async (albumId) => {
    try {
      const confirm = window.confirm("Vil du slette hele albumet og bildene?");
      if (!confirm) return;
      
      const q = query(collection(db, "photos"), where("albumId", "==", albumId));
      const snap = await getDocs(q);
      
      for (const docSnap of snap.docs) {
        const data = docSnap.data();
        if (data.storagePath) {
          const fileRef = ref(storage, data.storagePath);
          await deleteObject(fileRef).catch(() => {});
        }
        await deleteDoc(docSnap.ref);
      }
      
      await deleteDoc(doc(db, "albums", albumId));
      await refreshUserData(user.uid);
      
      setNotification({ message: "Album slettet.", type: "success" });
    } catch (err) {
      console.error("Feil ved sletting av album:", err);
      setNotification({ message: "Kunne ikke slette album.", type: "error" });
    }
  };

  // 🗑️ Slett bilde
  const handleDeletePhoto = async (photo) => {
    try {
      const confirm = window.confirm("Vil du slette dette bildet?");
      if (!confirm) return;
      
      if (photo.storagePath) {
        const fileRef = ref(storage, photo.storagePath);
        await deleteObject(fileRef).catch(() => {});
      }
      
      await deleteDoc(doc(db, "photos", photo.id));
      await refreshUserData(user.uid);
      
      setNotification({ message: "Bilde slettet.", type: "success" });
    } catch (err) {
      console.error("Feil ved sletting av bilde:", err);
      setNotification({ message: "Kunne ikke slette bilde.", type: "error" });
    }
  };

  // 🧭 Sider
  const renderPage = () => {
    if (!user)
      return <LoginPage colors={colors} setNotification={setNotification} />;

    switch (currentPage) {
      case "dashboard":
        return (
          <DashboardPage
            colors={colors}
            user={user}
            albums={albums}
            photos={photos}
            onNavigate={setCurrentPage}
            refreshData={() => refreshUserData(user.uid)}
          />
        );
        
      case "gallery":
        return (
          <GalleryPage
            albums={albums}
            photos={photos}
            colors={colors}
            user={user}
            onAlbumOpen={(a) => {
              setCurrentAlbum(a);
              setCurrentPage("album");
            }}
            onDeletePhoto={handleDeletePhoto}
            refreshData={() => refreshUserData(user.uid)}
          />
        );

      case "album":
        return (
          <AlbumPage
            album={currentAlbum}
            colors={colors}
            user={user}
            photos={photos}
            onDeletePhoto={handleDeletePhoto}
            onBack={() => setCurrentPage("gallery")}
            refreshData={() => refreshUserData(user.uid)}
          />
        );
        
      case "profile":
        return (
          <ProfilePage
            user={user}
            albums={albums}
            photos={photos}
            colors={colors}
            onSignOut={handleLogout}
            setNotification={setNotification}
          />
        );
        
      case "admin":
        return (
          <AdminDashboard
            users={[user]}
            albums={albums}
            photos={photos}
            colors={colors}
          />
        );
        
      case "database":
        return <DatabaseTools colors={colors} setNotification={setNotification} />;
        
      default:
        return <div className="text-center p-8">Side ikke funnet</div>;
    }
  };

  // ⚙️ Bunnmeny
  const Navigation = () =>
    user && (
      <footer className="fixed bottom-0 inset-x-0 bg-black/30 backdrop-blur-md flex justify-around items-center py-3 border-t border-white/10">
        <button
          onClick={() => setCurrentPage("dashboard")}
          className={`flex flex-col items-center ${
            currentPage === "dashboard" ? "text-purple-400" : colors.textSecondary
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-xs">Dashboard</span>
        </button>

        <button
          onClick={() => setCurrentPage("gallery")}
          className={`flex flex-col items-center ${
            currentPage === "gallery" ? "text-purple-400" : colors.textSecondary
          }`}
        >
          <Grid className="w-5 h-5" />
          <span className="text-xs">Galleri</span>
        </button>

        {/* Sentrert + knapp */}
        <button
          onClick={() => setShowUploadModal(true)}
          className="relative bg-purple-600 hover:bg-purple-700 text-white rounded-full p-4 shadow-lg -mt-10 transition-all duration-300 hover:scale-110 before:absolute before:inset-0 before:rounded-full before:bg-purple-500/40 before:blur-xl before:opacity-0 hover:before:opacity-100"
        >
          <Plus className="w-6 h-6 relative z-10" />
        </button>

        <button
          onClick={() => setCurrentPage("profile")}
          className={`flex flex-col items-center ${
            currentPage === "profile" ? "text-purple-400" : colors.textSecondary
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-xs">Profil</span>
        </button>

        {user?.role === "admin" && (
          <button
            onClick={() => setCurrentPage("admin")}
            className={`flex flex-col items-center ${
              currentPage === "admin" ? "text-purple-400" : colors.textSecondary
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-xs">Admin</span>
          </button>
        )}

        <button
          onClick={toggleDarkMode}
          className={`flex flex-col items-center ${colors.textSecondary}`}
        >
          {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          <span className="text-xs">{darkMode ? "Lys" : "Mørk"}</span>
        </button>
      </footer>
    );

  // 🧩 UI
  return (
    <div
      className={`min-h-screen ${colors.text} bg-gradient-to-br ${colors.bg} font-sans pb-20 relative overflow-hidden`}
    >
      <Particles darkMode={darkMode} />
      <div className="relative z-10">
        {renderPage()}
        <Navigation />
      </div>

      {showUploadModal && (
        <UploadModal
          user={user}
          albums={albums}
          colors={colors}
          onClose={() => setShowUploadModal(false)}
          onUploadComplete={async () => {
            await refreshUserData(user.uid);
            setShowUploadModal(false);
            setNotification({ 
              message: "Bilder lastet opp!", 
              type: "success" 
            });
          }}
        />
      )}

      {notification && (
        <Notification
          notification={notification}
          onClose={() => setNotification(null)}
        />
      )}
      
      {confirmAction && (
        <ConfirmModal
          message={confirmAction.message}
          onConfirm={() => {
            confirmAction.onConfirm();
            setConfirmAction(null);
          }}
          onCancel={() => setConfirmAction(null)}
          colors={colors}
        />
      )}
    </div>
  );
};

export default App;