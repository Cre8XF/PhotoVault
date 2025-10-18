// ============================================================================
// PAGE: ProfilePage.jsx – brukerprofil for PhotoVault (Firebase-versjon)
// ============================================================================
import React from "react";
import { getAuth, deleteUser } from "firebase/auth";
import { doc, updateDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import { LogOut, Trash2, Star } from "lucide-react";

const ProfilePage = ({ user, albums, photos, colors, onSignOut, setNotification }) => {
  const auth = getAuth();

  // ⭐ Oppgrader til Pro
  const handleUpgrade = async () => {
    if (!user?.email) return;
    try {
      // Opprett dokumentet hvis det ikke finnes, så oppdater feltet
      await setDoc(doc(db, "users", user.email), { isPro: true }, { merge: true });
      await updateDoc(doc(db, "users", user.email), { isPro: true });
      setNotification({ message: "Du er nå Pro-bruker!", type: "success" });
    } catch (err) {
      console.error("Feil ved oppgradering:", err);
      setNotification({ message: "Kunne ikke oppgradere til Pro.", type: "error" });
    }
  };

  // 🗑️ Slett konto
  const handleDeleteAccount = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    const confirmed = window.confirm("Er du sikker på at du vil slette kontoen din?");
    if (!confirmed) return;
    try {
      await deleteUser(currentUser);
      setNotification({ message: "Konto slettet.", type: "success" });
    } catch (err) {
      console.error("Feil ved sletting:", err);
      setNotification({
        message: "Du må logge inn igjen før sletting (sikkerhetskrav).",
        type: "error",
      });
    }
  };

  const totalPhotos = photos?.length || 0;
  const totalAlbums = albums?.length || 0;

  return (
    <div className="p-6 md:p-10">
      <h1 className={`text-2xl font-bold mb-6 ${colors.text}`}>Profil</h1>

     <div className={`${colors.cardBg} ${colors.glass} mb-8`}>
  <div className="flex items-center gap-2">
    <p className="text-lg font-semibold">{user.displayName || user.email}</p>

    {/* ⭐ Pro-merke */}
    {user.isPro && (
      <span className="px-2 py-0.5 text-xs rounded-full bg-purple-600/70 text-white">
        ⭐ Pro
      </span>
    )}

    {/* 🔰 Admin-merke */}
    {user.role === "admin" && (
      <span className="px-2 py-0.5 text-xs rounded-full bg-indigo-600/70 text-white">
        🔰 Admin
      </span>
    )}
  </div>

  <p className="text-sm text-gray-400 mb-2">{user.email}</p>
  <p className="text-sm text-gray-400">
    Album: {totalAlbums} &nbsp;•&nbsp; Bilder: {totalPhotos}
  </p>
</div>


      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onSignOut}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl ${colors.buttonSecondary}`}
        >
          <LogOut className="w-5 h-5" />
          Logg ut
        </button>

        <button
          onClick={handleUpgrade}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl ${colors.buttonPrimary} text-white`}
        >
          <Star className="w-5 h-5" />
          Oppgrader til Pro
        </button>

        <button
          onClick={handleDeleteAccount}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white"
        >
          <Trash2 className="w-5 h-5" />
          Slett konto
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;
