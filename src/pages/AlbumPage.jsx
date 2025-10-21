// ============================================================================
// PAGE: AlbumPage.jsx – v2.2 med PhotoGridOptimized
// ============================================================================
import React, { useEffect, useState, useMemo } from "react";
import { ArrowLeft, Trash2, Edit3, Check } from "lucide-react";
import { deletePhoto, setAlbumCover } from "../firebase";
import PhotoGridOptimized from "../components/PhotoGridOptimized";
import LazyImage from "../components/LazyImage";

const AlbumPage = ({ album, user, photos, onBack, refreshData, colors }) => {
  const [editMode, setEditMode] = useState(false);

  const albumPhotos = useMemo(() => {
    return photos.filter((p) => p.albumId === album.id);
  }, [photos, album.id]);

  const handleDelete = async (photo) => {
    if (window.confirm("Vil du slette dette bildet permanent?")) {
      await deletePhoto(photo.id, photo.storagePath);
      if (refreshData) await refreshData();
    }
  };

  const handleSetCover = async (photo) => {
    if (
      window.confirm(
        `Vil du bruke "${photo.name}" som forside for albumet "${album.name}"?`
      )
    ) {
      await setAlbumCover(album.id, photo.url);

      if (window.albums && Array.isArray(window.albums)) {
        const index = window.albums.findIndex((a) => a.id === album.id);
        if (index !== -1) window.albums[index].cover = photo.url;
      }

      album.cover = photo.url;

      if (typeof refreshData === "function") {
        await new Promise((r) => setTimeout(r, 400));
        await refreshData();
      }

      alert("Album-cover oppdatert ✅");
    }
  };

 return (
  <div className="album-page p-4 md:p-8 min-h-screen">
    {/* Header */}
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="ripple-effect p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-200 transition"
          title="Tilbake"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">{album.name}</h1>
          <p className="text-sm text-gray-400">
            {albumPhotos.length}{" "}
            {albumPhotos.length === 1 ? "bilde" : "bilder"}
          </p>
        </div>
      </div>

      <button
        onClick={() => setEditMode(!editMode)}
        className={`ripple-effect px-4 py-2 rounded-xl ${
          editMode
            ? "bg-green-600 hover:bg-green-700"
            : "bg-white/10 hover:bg-white/20"
        } transition flex items-center gap-2`}
      >
        {editMode ? <Check size={18} /> : <Edit3 size={18} />}
        {editMode ? "Ferdig" : "Rediger"}
      </button>
    </div>

    {/* Cover-bilde */}
    {album.cover && (
      <div className="mb-6 rounded-2xl overflow-hidden border border-white/10">
        <LazyImage
          src={album.cover}
          thumbnail={album.coverThumbnail || album.cover}
          alt="Album cover"
          className="w-full h-64 object-contain bg-gray-900"
        />
      </div>
    )}

    {/* Bilder i album */}
    {albumPhotos.length === 0 ? (
      <div className="text-center py-16">
        <p className="text-gray-400">Ingen bilder i dette albumet.</p>
        <p className="text-sm text-gray-500 mt-2">
          Last opp bilder og velg dette albumet.
        </p>
      </div>
    ) : editMode ? (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {albumPhotos.map((photo) => (
          <div key={photo.id} className="relative group">
            <LazyImage
              src={photo.url}
              thumbnail={photo.thumbnailSmall}
              photoId={photo.id}
              alt={photo.name || ""}
              className="w-full h-48 object-contain bg-gray-900 rounded-xl border border-gray-700 transition-transform group-hover:scale-105"
            />

            <div
              className="ripple-effect absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-xl opacity-0 group-hover:opacity-100 transition cursor-pointer"
              onClick={() => handleSetCover(photo)}
            >
              <span className="text-white font-medium text-sm">
                Sett som cover
              </span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(photo);
              }}
              className="ripple-effect absolute top-2 right-2 bg-black/60 hover:bg-red-600 text-white rounded-full p-2 transition opacity-0 group-hover:opacity-100"
              title="Slett bilde"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    ) : (
      <PhotoGridOptimized
        photos={albumPhotos}
        refreshPhotos={refreshData}
        showFavoriteButton={true}
        enableInfiniteScroll={albumPhotos.length > 50}
        itemsPerPage={20}
      />
    )}
  </div>
);
};

export default AlbumPage;