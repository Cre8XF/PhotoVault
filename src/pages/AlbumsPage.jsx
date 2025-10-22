// ============================================================================
// PAGE: AlbumsPage.jsx – med støtte for flervalg og flytt til album
// ============================================================================
import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Folder, Image, Star, Calendar, Move } from "lucide-react";
import AlbumCard from "../components/AlbumCard";
import LazyImage from "../components/LazyImage";
import PhotoGridOptimized from "../components/PhotoGridOptimized";
import MoveModal from "../components/MoveModal";

const AlbumsPage = ({ albums, photos, onAlbumClick, onPhotoClick }) => {
  const { t } = useTranslation(["common", "albums"]);
  const [viewMode, setViewMode] = useState("albums");
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [isMoveOpen, setMoveOpen] = useState(false);

  const albumPhotos = useMemo(() => photos.filter((p) => !p.albumId), [photos]);

  return (
    <div className="min-h-screen p-6 md:p-10 pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t("common:albums")}</h1>
        {selectedPhotos.length > 0 && (
          <button
            onClick={() => setMoveOpen(true)}
            className="ripple-effect px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            <Move size={18} /> Flytt til album
          </button>
        )}
      </div>

      {viewMode === "albums" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map((album) => (
            <AlbumCard
              key={album.id}
              album={album}
              photos={photos}
              onOpen={() => onAlbumClick(album)}
            />
          ))}
        </div>
      )}

      {viewMode === "photos" && (
        <PhotoGridOptimized
          photos={albumPhotos}
          onPhotoClick={onPhotoClick}
          selectedPhotos={selectedPhotos}
          setSelectedPhotos={setSelectedPhotos}
        />
      )}

      <MoveModal
        isOpen={isMoveOpen}
        onClose={() => setMoveOpen(false)}
        albums={albums}
        onConfirm={(albumId) => {
          console.log("Flytt", selectedPhotos, "til", albumId);
          setSelectedPhotos([]);
        }}
      />
    </div>
  );
};

export default AlbumsPage;
