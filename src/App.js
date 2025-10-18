// ============================================================================
// APP.JS – hovedkontroller for PhotoVault (Firebase Auth + Firestore + Storage)
// ============================================================================
import React, { useState, useEffect, useMemo } from "react";
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
  const [refreshKey, setRefreshKey] = useState(0);
  const [darkMode, setDarkMode] = useState(true);

  const auth = getAuth();

  // 🎨 Tema
  const colors = useMemo(
    () => ({
      text: darkMode ? "text-gray-100" : "text-gray-800",
      textSecondary: darkMode ? "text-gray-400" : "text-gray-600",
      bg: darkMode ? "from-gray-900 to-gray-800" : "from-indigo-50 to-white",
      cardBg: darkMode ? "bg-gray-700/60" : "bg-white/70",
      buttonPrimary:
        "bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/50",
      buttonSecondary: darkMode
        ? "bg-white/10 hover:bg-white/20"
        : "bg-gray-200/50 hover:bg-gray-300/50",
      glass:
        "backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-6 transition-all duration-300",
    }),
    [darkMode]
  );

 // 🟣 Firebase Auth overvåking
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      await firebaseUser.reload();
      const adminEmails = ["rogsor80@gmail.com"];
      const role = adminEmails.includes(firebaseUser.email) ? "admin" : "user";

      setUser({
        email: firebaseUser.email,
        uid: firebaseUser.uid,
        displayName: firebaseUser.displayName,
        role,
      });

      setCurrentPage("dashboard");
      await refreshUserData(firebaseUser.uid); // ✅ Bruk UID her
    } else {
      setUser(null);
      setCurrentPage("login");
    }
  });
  return () => unsubscribe();
}, []);

// 🔄 Hent album og bilder
async function refreshUserData(uid) {
  if (!uid) return;
  try {
    const [userAlbums, userPhotos] = await Promise.all([
      getAlbumsByUser(uid),  // ✅ UID
      getPhotosByUser(uid),  // ✅ UID
    ]);
    setAlbums(userAlbums);
    window.albums = userAlbums;
    setPhotos(userPhotos);
  } catch (err) {
    console.error("Feil ved lasting av Firestore-data:", err);
  }
}

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
      setAlbums((prev) => prev.filter((a) => a.id !== albumId));
      setPhotos((prev) => prev.filter((p) => p.albumId !== albumId));
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
      setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
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
          key={refreshKey} 
            colors={colors}
            user={user}
            albums={albums}
            photos={photos}
            onNavigate={setCurrentPage}
          />
        );
     case "gallery":
  return (
    <GalleryPage
      albums={albums}                // ✅ send inn album-listen
      photos={photos}
      colors={colors}
      user={user}
      onAlbumOpen={(a) => {          // ✅ åpne valgt album
        setCurrentAlbum(a);
        setCurrentPage("album");
      }}
      onPhotoClick={(p) => console.log("Åpnet bilde:", p.name)} // evt. detalj-modal
      onDeletePhoto={handleDeletePhoto}
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
            refreshData={refreshUserData}
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

  // ⚙️ Bunnmeny med “+”-knapp
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

        {/* Sentrert + knapp med plasma-effekt */}
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
          onClick={() => setDarkMode(!darkMode)}
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
      className={`min-h-screen ${colors.text} bg-gradient-to-br ${colors.bg} font-sans pb-20`}
    >
      {renderPage()}
      <Navigation />

    {showUploadModal && (
  <UploadModal
    user={user}
    albums={albums}
    colors={colors}
    onClose={() => setShowUploadModal(false)}
    onUploadComplete={async () => {
      await refreshUserData(user.uid);  // ✅ bruker UID
      setShowUploadModal(false);
      setRefreshKey(prev => prev + 1);
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
