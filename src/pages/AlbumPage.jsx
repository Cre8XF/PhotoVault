// ============================================================================
// PAGE: AlbumPage.jsx – med støtte for flervalg og flytt til album
// ============================================================================
import React, { useState, useMemo } from "react";
import { ArrowLeft, Trash2, Edit3, Check, Move } from "lucide-react";
import { deletePhoto, setAlbumCover, uploadPhoto, addAlbum } from "../firebase";
import { auth } from "../firebase";
import PhotoGridOptimized from "../components/PhotoGridOptimized";
import LazyImage from "../components/LazyImage";
import UploadModal from "../components/UploadModal";
import MoveModal from "../components/MoveModal";

const AlbumPage = ({ album, albums = [], user, photos, onBack, refreshData }) => {
  const [editMode, setEditMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [isMoveOpen, setMoveOpen] = useState(false);
  const [isUploadOpen, setUploadOpen] = useState(false);

  const albumPhotos = useMemo(
    () => photos.filter((p) => p.albumId === album.id),
    [photos, album.id]
  );

  const handleDelete = async (photo) => {
    if (window.confirm("Vil du slette dette bildet permanent?")) {
      await deletePhoto(photo.id, photo.storagePath);
      if (refreshData) await refreshData();
    }
  };

  const handleSetCover = async (photo) => {
    if (window.confirm(`Vil du bruke "${photo.name}" som forside?`)) {
      await setAlbumCover(album.id, photo.url);
      album.cover = photo.url;
      if (refreshData) await refreshData();
    }
  };

  const handleUpload = async (files, albumId, aiTagging) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert("Du må være innlogget for å laste opp bilder");
      return;
    }
    try {
      for (const fileObj of files) {
        await uploadPhoto(currentUser.uid, fileObj.file, albumId || album.id, aiTagging);
      }
      await refreshData();
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const handleCreateAlbum = async (name) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("Bruker ikke innlogget");

    const newAlbum = {
      name: name.trim(),
      userId: user.uid,
    };

    const albumId = await addAlbum(newAlbum);
    console.log("✅ Album opprettet:", albumId);
  } catch (error) {
    console.error("Feil ved oppretting av album:", error);
  }
};

  return (
    <div className="album-page p-4 md:p-8 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="ripple-effect p-2 rounded-full bg-white/10 hover:bg-white/20"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-semibold">{album.name}</h1>
        </div>

        <div className="flex gap-2">
          {selectedPhotos.length > 0 && (
            <button
              onClick={() => setMoveOpen(true)}
              className="ripple-effect px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
            >
              <Move size={18} /> Flytt
            </button>
          )}
          <button
            onClick={() => setUploadOpen(true)}
            className="ripple-effect px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700"
          >
            Last opp
          </button>
          <button
            onClick={() => setEditMode(!editMode)}
            className={`ripple-effect px-4 py-2 rounded-xl ${
              editMode ? "bg-green-600 hover:bg-green-700" : "bg-white/10 hover:bg-white/20"
            } flex items-center gap-2`}
          >
            {editMode ? <Check size={18} /> : <Edit3 size={18} />}
            {editMode ? "Ferdig" : "Rediger"}
          </button>
        </div>
      </div>

      {/* Bilder */}
      <PhotoGridOptimized
        photos={albumPhotos}
        onPhotoClick={() => {}}
        selectedPhotos={selectedPhotos}
        setSelectedPhotos={setSelectedPhotos}
      />

      {/* Modaler */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setUploadOpen(false)}
        onUpload={handleUpload}
        onCreateAlbum={handleCreateAlbum}
        albums={albums}
        selectedAlbum={album.id}
      />
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

export default AlbumPage;
