// ============================================================================
// PAGE: AlbumPage.jsx – viser bilder i ett spesifikt album med cover-funksjon
// ============================================================================
import React, { useEffect, useState } from "react";
import { ArrowLeft, Trash2, Edit3, Check } from "lucide-react";
import {
  getPhotosByUser,
  deletePhoto,
  updateAlbumPhotoCount,
  setAlbumCover,
} from "../firebase";
import "../styles/album.css";

const AlbumPage = ({ album, user, photos, onBack, refreshData, colors }) => {
  const [albumPhotos, setAlbumPhotos] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  // Hent bilder som hører til dette albumet
  useEffect(() => {
    const fetchPhotos = async () => {
      setLoading(true);
      const allPhotos = await getPhotosByUser(user.email);
      const filtered = allPhotos.filter((p) => p.albumId === album.id);
      setAlbumPhotos(filtered);
      setLoading(false);
    };
    fetchPhotos();
  }, [album.id, user.email]);

  // Slett bilde
  const handleDelete = async (photo) => {
    if (window.confirm("Vil du slette dette bildet permanent?")) {
      await deletePhoto(photo.id, photo.storagePath);
      const updated = albumPhotos.filter((p) => p.id !== photo.id);
      setAlbumPhotos(updated);
      await updateAlbumPhotoCount(album.id, updated.length);
      if (refreshData) refreshData();
    }
  };

  // Sett valgt bilde som album-cover
const handleSetCover = async (photo) => {
  if (
    window.confirm(
      `Vil du bruke "${photo.name}" som forside for albumet "${album.name}"?`
    )
  ) {
    await setAlbumCover(album.id, photo.url);

    // 🔹 Oppdater global kopi slik at HomePage ser endringen umiddelbart
    if (window.albums && Array.isArray(window.albums)) {
      const index = window.albums.findIndex((a) => a.id === album.id);
      if (index !== -1) window.albums[index].cover = photo.url;
    }

    // 🔹 Oppdater lokalt for umiddelbar visning
    album.cover = photo.url;
    setAlbumPhotos((prev) => [...prev]);

    // 🔹 Hent nye data fra Firestore slik at HomePage oppdateres
    if (typeof refreshData === "function") {
      console.log("🔄 Henter nye data etter cover-endring …");
      await new Promise(r => setTimeout(r, 400));
      await refreshData();
    }

    alert("Album-cover oppdatert ✅");
  }
};



  return (
    <div className="album-page p-4 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-full bg-gray-700/60 hover:bg-gray-600/70 text-gray-200"
            title="Tilbake"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl md:text-2xl font-semibold">
            {album.name}{" "}
            <span className="text-gray-400 text-sm">
              ({albumPhotos.length} bilder)
            </span>
          </h1>
        </div>

        <button
          onClick={() => setEditMode(!editMode)}
          className={`px-4 py-2 rounded-xl ${
            editMode ? "bg-green-600" : "bg-gray-700"
          } hover:opacity-80 flex items-center gap-2`}
        >
          {editMode ? <Check size={18} /> : <Edit3 size={18} />}
          {editMode ? "Ferdig" : "Rediger"}
        </button>
      </div>

      {/* Bilder i album */}
      {loading ? (
        <p>Laster bilder...</p>
      ) : albumPhotos.length ? (
        <div className="photo-grid">
          {albumPhotos.map((photo) => (
            <div key={photo.id} className="photo-item relative group">
              <img
                src={photo.url}
                alt={photo.name || ""}
                className="w-full rounded-xl object-cover transition-transform duration-200 group-hover:scale-[1.02]"
              />

              {/* Overlay ved redigering */}
              {editMode && (
                <div
                  className="photo-overlay absolute inset-0 flex items-center justify-center bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 transition"
                  onClick={() => handleSetCover(photo)}
                >
                  <span className="text-white font-medium">
                    Sett som cover
                  </span>
                </div>
              )}

              {/* Sletteknapp */}
              {editMode && (
                <button
                  onClick={() => handleDelete(photo)}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-red-600 text-white rounded-full p-2 transition"
                  title="Slett bilde"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">Ingen bilder i dette albumet.</p>
      )}
    </div>
  );
};

export default AlbumPage;
