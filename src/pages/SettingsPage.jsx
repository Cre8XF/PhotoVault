// ============================================================================
// PAGE: SettingsPage.jsx – brukerinnstillinger og profiladministrasjon
// ============================================================================
import React, { useState } from "react";
import { Save, Sun, Moon, Download, User, Lock } from "lucide-react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { put } from "../db";

const SettingsPage = ({ user, photos, colors, onThemeChange, refreshData }) => {
  const [name, setName] = useState(user.name || "");
  const [password, setPassword] = useState(user.password || "");
  const [isSaving, setIsSaving] = useState(false);

  // --- Lagring av brukerinfo ---
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const updated = { ...user, name, password };
    await put("users", updated);
    localStorage.setItem("currentUser", JSON.stringify(updated));
    refreshData();
    setIsSaving(false);
    alert("Profilen er oppdatert.");
  };

  // --- Eksporter alle bilder til ZIP ---
  const handleExport = async () => {
    if (!photos.length) {
      alert("Du har ingen bilder å eksportere.");
      return;
    }

    const zip = new JSZip();
    const folder = zip.folder("PhotoVault");
    const total = photos.length;

    for (let i = 0; i < total; i++) {
      const photo = photos[i];
      const base64Data = photo.url.split(",")[1];
      folder.file(photo.name || `bilde_${i + 1}.jpg`, base64Data, {
        base64: true,
      });
    }

    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, `photovault_export_${user.name || "user"}.zip`);
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className={`text-3xl font-bold mb-6 ${colors.text}`}>
        Innstillinger
      </h1>

      {/* Profilseksjon */}
      <div
        className={`rounded-2xl p-6 mb-8 ${colors.cardBg} ${colors.glass} shadow-lg`}
      >
        <h2 className={`text-xl font-semibold mb-4 ${colors.text}`}>
          Konto og profil
        </h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className={`block font-semibold mb-1 ${colors.text}`}>
              Navn
            </label>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-purple-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full p-2 rounded-xl border border-purple-500/40 ${colors.cardBg.replace(
                  "/60",
                  "/90"
                )} ${colors.text}`}
              />
            </div>
          </div>

          <div>
            <label className={`block font-semibold mb-1 ${colors.text}`}>
              Passord
            </label>
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-purple-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full p-2 rounded-xl border border-purple-500/40 ${colors.cardBg.replace(
                  "/60",
                  "/90"
                )} ${colors.text}`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl ${colors.buttonPrimary} text-white font-semibold`}
          >
            <Save className="w-5 h-5" />
            {isSaving ? "Lagrer..." : "Lagre endringer"}
          </button>
        </form>
      </div>

      {/* Tema-valg */}
      <div
        className={`rounded-2xl p-6 mb-8 ${colors.cardBg} ${colors.glass} shadow-lg`}
      >
        <h2 className={`text-xl font-semibold mb-4 ${colors.text}`}>
          Utseende og tema
        </h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => onThemeChange("light")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-200 text-gray-900 font-semibold hover:bg-gray-300"
          >
            <Sun className="w-5 h-5" />
            Lys
          </button>
          <button
            onClick={() => onThemeChange("dark")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-800 text-white font-semibold hover:bg-gray-700"
          >
            <Moon className="w-5 h-5" />
            Mørk
          </button>
          <button
            onClick={() => onThemeChange("glass")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500/70 to-pink-500/70 text-white font-semibold hover:opacity-90"
          >
            Glass
          </button>
        </div>
      </div>

      {/* Eksport */}
      <div
        className={`rounded-2xl p-6 ${colors.cardBg} ${colors.glass} shadow-lg`}
      >
        <h2 className={`text-xl font-semibold mb-4 ${colors.text}`}>
          Eksporter data
        </h2>
        <p className={`text-sm mb-3 ${colors.textMuted}`}>
          Last ned alle bildene dine som en ZIP-fil.
        </p>
        <button
          onClick={handleExport}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl ${colors.buttonSecondary} ${colors.text} font-semibold`}
        >
          <Download className="w-5 h-5" />
          Eksporter bilder
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
