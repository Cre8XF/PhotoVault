// ============================================================================
// PAGE: AlbumPage.jsx – sletting, flytting, forside og opplasting m. ConfirmModal
// ============================================================================
import React, { useState, useMemo } from "react";
import { ArrowLeft, Trash2, Edit3, Check, Move, Star } from "lucide-react";
import {
  deletePhoto,
  setAlbumCover,
  uploadPhoto,
  addAlbum,
  updateAlbumPhotoCount,
} from "../firebase";
import { auth } from "../firebase";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import UploadModal from "../components/UploadModal";
import MoveModal from "../components/MoveModal";
import ConfirmModal from "../components/ConfirmModal";

const AlbumPage = ({ album, albums = [], user, photos, onBack, refreshData }) => {
  const [editMode, setEditMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [isMoveOpen, setMoveOpen] = useState(false);
  const [isUploadOpen, setUploadOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState(null);

  const albumPhotos = useMemo(
    () => photos.filter((p) => p.albumId === album.id),
    [photos, album.id]
  );

  // --- Forside ---
  const handleSetCover = async (photo) => {
    try {
      await setAlbumCover(album.id, photo.url);
      console.log(`⭐ Forsidebilde satt til: ${photo.name}`);
      if (refreshData) await refreshData();
    } catch (error) {
      console.error("Feil ved oppdatering av forside:", error);
      alert("Kunne ikke sette forsidebilde. Se konsollen for detaljer.");
    }
  };

  // --- Sletting (via ConfirmModal) ---
  const requestDelete = (photo) => {
    setPhotoToDelete(photo);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!photoToDelete) return;
    try {
      await deletePhoto(photoToDelete.id, photoToDelete.storagePath);
      console.log(`🗑️ Slettet bilde: ${photoToDelete.name || photoToDelete.id}`);
      setPhotoToDelete(null);
      if (refreshData) await refreshData();
    } catch (error) {
      console.error("Feil ved sletting:", error);
      alert("Kunne ikke slette bildet. Se konsollen for detaljer.");
    }
  };

  // --- Opplasting ---
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

  // --- Opprett nytt album ---
  const handleCreateAlbum = async (name, userId) => {
    try {
      const currentUser = userId || auth.currentUser;
      if (!currentUser) throw new Error("Bruker ikke innlogget");
      const newAlbum = { name: name.trim(), userId: currentUser.uid || currentUser };
      const albumId = await addAlbum(newAlbum);
      console.log("✅ Album opprettet:", albumId);
      if (refreshData) await refreshData();
    } catch (error) {
      console.error("Feil ved oppretting av album:", error);
      alert("Kunne ikke opprette album.");
    }
  };

  // --- Flytting ---
  const handleMovePhotos = async (targetAlbumId) => {
    try {
      const db = getFirestore();
      const updates = selectedPhotos
        .filter(Boolean)
        .map(async (photo) => {
          const photoId = typeof photo === "string" ? photo : photo.id || photo.docId;
          if (!photoId) return console.warn("Mangler id for:", photo);
          const photoRef = doc(db, "photos", photoId);
          await updateDoc(photoRef, { albumId: targetAlbumId });
        });

      await Promise.all(updates);
      const fromCount = albumPhotos.length - selectedPhotos.length;
      await updateAlbumPhotoCount(album.id, Math.max(0, fromCount));
      const targetAlbumPhotos = photos.filter((p) => p.albumId === targetAlbumId).length;
      await updateAlbumPhotoCount(targetAlbumId, targetAlbumPhotos + selectedPhotos.length);

      if (refreshData) await refreshData();
      setSelectedPhotos([]);
    } catch (error) {
      console.error("Feil ved flytting:", error);
      alert("Kunne ikke flytte bildene.");
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {albumPhotos.map((photo) => (
          <div key={photo.id} className="relative group">
            <img
              src={photo.url}
              alt={photo.name}
              className="rounded-xl w-full h-48 object-cover"
            />
            {editMode && (
              <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition">
                <button
                  onClick={() => handleSetCover(photo)}
                  className="bg-black/60 hover:bg-yellow-500 text-white p-2 rounded-full"
                  title="Sett som forside"
                >
                  <Star className="w-4 h-4" />
                </button>
                <button
                  onClick={() => requestDelete(photo)}
                  className="bg-black/60 hover:bg-red-600 text-white p-2 rounded-full"
                  title="Slett bilde"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

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
        onConfirm={handleMovePhotos}
      />
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Bekreft sletting"
        message="Er du sikker på at du vil slette dette bildet permanent?"
        confirmLabel="Slett bilde"
        cancelLabel="Avbryt"
      />
    </div>
  );
};

export default AlbumPage;
