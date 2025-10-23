// ============================================================================
// COMPONENT: PhotoGrid.jsx – v2.2 med forside-funksjonalitet
// ============================================================================
import React, { useState } from "react";
import PhotoModal from "./PhotoModal";
import { ImageOff, Trash2, Star, Image as ImageIcon } from "lucide-react";
import { deletePhoto, toggleFavorite, setAlbumCover } from "../firebase";

const PhotoGrid = ({
  photos = [],
  title,
  onPhotoClick,
  refreshPhotos,
  compact = false,
  filterUnassigned = false,
  showFavoriteButton = true,
  editMode = false,
  currentAlbum = null,
}) => {
  const list = filterUnassigned ? photos.filter((p) => !p.albumId) : photos;
  const [photoModal, setPhotoModal] = useState({ open: false, index: 0 });
  const [loading, setLoading] = useState(false);

  // 🔹 Håndter sletting
  const handleDelete = async (photo) => {
    const confirmed = window.confirm("Vil du slette dette bildet?");
    if (!confirmed) return;

    setLoading(true);
    try {
      await deletePhoto(photo.id, photo.storagePath);
      if (refreshPhotos) await refreshPhotos();
      console.log("🗑️ Bilde slettet:", photo.id);
    } catch (err) {
      console.error("Feil ved sletting:", err);
    } finally {
      setLoading(false);
    }
  };

  // ⭐ Håndter favoritt-toggle
  const handleToggleFavorite = async (e, photo) => {
    e.stopPropagation();
    try {
      await toggleFavorite(photo.id, photo.favorite);
      if (refreshPhotos) await refreshPhotos();
    } catch (err) {
      console.error("Feil ved favoritt-toggle:", err);
    }
  };

  // 🖼️ Håndter sett som forside
  const handleSetCover = async (e, photo) => {
    e.stopPropagation();
    
    if (!photo.albumId) {
      alert("Dette bildet tilhører ikke et album");
      return;
    }

    try {
      await setAlbumCover(photo.albumId, photo.url);
      console.log(`🖼️ Forsidebilde satt for album ${photo.albumId}`);
      if (refreshPhotos) await refreshPhotos();
    } catch (err) {
      console.error("Feil ved oppdatering av forside:", err);
      alert("Kunne ikke sette forsidebilde");
    }
  };

  if (!list || list.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <ImageOff className="w-10 h-10 mb-2 opacity-60" />
        <p className="text-sm">Ingen bilder å vise</p>
      </div>
    );
  }

  return (
    <>
      {title && (
        <h2 className="text-xl font-semibold text-gray-100 mb-4 capitalize">
          {title}
        </h2>
      )}

      <div
        className={`${
          compact
            ? "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8"
            : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
        } gap-4`}
      >
        {list.map((photo, i) => (
          <div key={photo.id} className="relative group overflow-hidden rounded-xl">
            <img
              src={photo.url}
              alt={photo.title || photo.name || ""}
              className={`w-full ${
                compact ? "h-40" : "h-56"
              } object-contain bg-gray-900 rounded-xl border border-gray-700 shadow-md transform transition duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-purple-500/20 cursor-pointer`}
              onClick={() =>
                onPhotoClick
                  ? onPhotoClick(photo.url)
                  : setPhotoModal({ open: true, index: i })
              }
              loading="lazy"
            />

            {/* Cover-indikator (vises hvis bildet er albumforside) */}
            {currentAlbum && currentAlbum.cover === photo.url && (
              <div className="absolute top-2 left-2 bg-yellow-500 text-black px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
                <ImageIcon className="w-3 h-3" />
                Forside
              </div>
            )}

            {/* Overlay-knapper */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
              {/* 🖼️ Sett som forside (kun i editMode og hvis bildet har albumId) */}
              {editMode && photo.albumId && (
                <button
                  onClick={(e) => handleSetCover(e, photo)}
                  title="Sett som albumforside"
                  className="p-1.5 rounded-full bg-yellow-500/80 hover:bg-yellow-600 text-white transition shadow-lg"
                >
                  <ImageIcon className="w-4 h-4" />
                </button>
              )}

              {/* ⭐ Favoritt-knapp */}
              {showFavoriteButton && (
                <button
                  onClick={(e) => handleToggleFavorite(e, photo)}
                  title={photo.favorite ? "Fjern favoritt" : "Legg til favoritt"}
                  className={`p-1.5 rounded-full ${
                    photo.favorite
                      ? "bg-yellow-500/80 text-white"
                      : "bg-black/50 text-gray-300 hover:bg-yellow-500/70"
                  } transition shadow-lg`}
                >
                  <Star className="w-4 h-4" fill={photo.favorite ? "currentColor" : "none"} />
                </button>
              )}

              {/* 🗑️ Slett-knapp */}
              {editMode && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(photo);
                  }}
                  title="Slett bilde"
                  disabled={loading}
                  className={`p-1.5 rounded-full ${
                    loading
                      ? "bg-gray-500 cursor-not-allowed"
                      : "bg-black/50 hover:bg-red-600/70 text-white"
                  } transition shadow-lg`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Bildetekst */}
            {(photo.title || photo.name) && (
              <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 px-2 truncate opacity-0 group-hover:opacity-100 transition">
                {photo.title || photo.name}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Lysboks (PhotoModal) */}
      {!onPhotoClick && photoModal.open && (
        <PhotoModal
          photos={list}
          currentIndex={photoModal.index}
          onClose={() => setPhotoModal({ open: false, index: 0 })}
          onToggleFavorite={async (photo) => {
            await toggleFavorite(photo.id, photo.favorite);
            if (refreshPhotos) await refreshPhotos();
          }}
        />
      )}
    </>
  );
};

export default PhotoGrid;