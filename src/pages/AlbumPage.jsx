// ============================================================================
// PAGE: AlbumPage.jsx – med forside, sletting, flytting og opplasting
// ============================================================================
import React, { useState, useMemo } from "react";
import { ArrowLeft, Trash2, Edit3, Check, Move, Image as ImageIcon } from "lucide-react";
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
import PhotoModal from "../components/PhotoModal";


function getCategoryIcon(category) {
  const icons = {
    people: "👥",
    nature: "🌳",
    food: "🍽️",
    animals: "🐾",
    indoor: "🏠",
    travel: "✈️",
    architecture: "🏛️",
    event: "🎉",
    sport: "⚽",
    art: "🎨",
    other: "📷",
  };
  return icons[category] || icons.other;
}


const AlbumPage = ({ album, albums = [], user, photos, onBack, refreshData }) => {
  const [editMode, setEditMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [isMoveOpen, setMoveOpen] = useState(false);
  const [isUploadOpen, setUploadOpen] = useState(false);

  const albumPhotos = useMemo(
    () => photos.filter((p) => p.albumId === album.id),
    [photos, album.id]
  );

  // --- Sett som forside ---
  const handleSetCover = async (photo) => {
    try {
      await setAlbumCover(album.id, photo.url);
      console.log(`⭐ Forsidebilde satt til: ${photo.name || photo.id}`);
      if (refreshData) await refreshData();
    } catch (error) {
      console.error("Feil ved oppdatering av forside:", error);
      alert("Kunne ikke sette forsidebilde. Se konsollen for detaljer.");
    }
  };

  // --- Sletting ---
  const handleDelete = async (photo) => {
    if (!window.confirm("Vil du slette dette bildet permanent?")) return;
    
    try {
      await deletePhoto(photo.id, photo.storagePath);
      console.log(`🗑️ Slettet bilde: ${photo.name || photo.id}`);
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
      if (!userId) {
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error("Bruker ikke innlogget");
        userId = currentUser.uid;
      }

      const newAlbum = {
        name: name.trim(),
        userId: userId,
      };

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
      
      // Oppdater photoCount for begge album
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

  // --- Valg av bilder ---
  const togglePhotoSelection = (photo) => {
    setSelectedPhotos(prev => {
      const isSelected = prev.some(p => 
        (typeof p === 'string' ? p : p.id) === photo.id
      );
      
      if (isSelected) {
        return prev.filter(p => 
          (typeof p === 'string' ? p : p.id) !== photo.id
        );
      } else {
        return [...prev, photo];
      }
    });
  };

  const isPhotoSelected = (photo) => {
    return selectedPhotos.some(p => 
      (typeof p === 'string' ? p : p.id) === photo.id
    );
  };
  const [photoModal, setPhotoModal] = useState({ open: false, index: 0 });


  return (
    <div className="album-page p-4 md:p-8 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="ripple-effect p-2 rounded-full bg-white/10 hover:bg-white/20 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-semibold">{album.name}</h1>
        </div>

        <div className="flex gap-2">
          {selectedPhotos.length > 0 && (
            <button
              onClick={() => setMoveOpen(true)}
              className="ripple-effect px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 flex items-center gap-2 transition"
            >
              <Move size={18} /> Flytt ({selectedPhotos.length})
            </button>
          )}
          <button
            onClick={() => setUploadOpen(true)}
            className="ripple-effect px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 transition"
          >
            Last opp
          </button>
          <button
            onClick={() => {
              setEditMode(!editMode);
              if (editMode) setSelectedPhotos([]);
            }}
            className={`ripple-effect px-4 py-2 rounded-xl ${
              editMode ? "bg-green-600 hover:bg-green-700" : "bg-white/10 hover:bg-white/20"
            } flex items-center gap-2 transition`}
          >
            {editMode ? <Check size={18} /> : <Edit3 size={18} />}
            {editMode ? "Ferdig" : "Rediger"}
          </button>
        </div>
      </div>

      {/* Info om album */}
      {albumPhotos.length === 0 && (
        <div className="text-center py-20 text-gray-400">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Ingen bilder i dette albumet ennå</p>
          <button
            onClick={() => setUploadOpen(true)}
            className="mt-4 ripple-effect px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
          >
            Last opp bilder
          </button>
        </div>
      )}

  {/* Bilder */}
{albumPhotos.length > 0 && (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    {albumPhotos.map((photo, index) => (
      <div
        key={photo.id}
        className={`relative group cursor-pointer ${
          isPhotoSelected(photo) ? "ring-4 ring-purple-500" : ""
        }`}
        onClick={() => {
          if (editMode) {
            togglePhotoSelection(photo); // redigeringsmodus
          } else {
            setPhotoModal({ open: true, index }); // vis PhotoModal
          }
        }}
      >
       <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-black/10 flex items-center justify-center">
  <img
    src={photo.url}
    alt={photo.name}
    className="max-h-full max-w-full object-contain border border-white/10 transition-transform hover:scale-105 rounded-xl"
  />
</div>


        {/* AI-indikatorer */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {photo.aiAnalyzed && (
            <span className="px-2 py-1 bg-purple-600/80 backdrop-blur rounded-full text-[10px] font-bold flex items-center gap-1 shadow">
              🤖 AI
            </span>
          )}
          {photo.faces > 0 && (
            <span className="px-2 py-1 bg-pink-500/80 backdrop-blur rounded-full text-[10px] font-bold shadow">
              👤 {photo.faces}
            </span>
          )}
          {photo.category && (
            <span className="px-2 py-1 bg-blue-500/80 backdrop-blur rounded-full text-[10px] shadow">
              {getCategoryIcon(photo.category)}
            </span>
          )}
        </div>

        {/* Cover-indikator */}
        {album.cover === photo.url && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-black px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
            <ImageIcon className="w-3 h-3" />
            Forside
          </div>
        )}

        {/* Valgt-indikator */}
        {isPhotoSelected(photo) && (
          <div className="absolute top-2 right-2 bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center">
            <Check className="w-4 h-4" />
          </div>
        )}

        {/* Rediger-knapper */}
        {editMode && !isPhotoSelected(photo) && (
          <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSetCover(photo);
              }}
              className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-full transition shadow-lg"
              title="Sett som forside"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(photo);
              }}
              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition shadow-lg"
              title="Slett bilde"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Bildenavn */}
        {photo.name && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-2 rounded-b-xl truncate opacity-0 group-hover:opacity-100 transition">
            {photo.name}
          </div>
        )}
      </div>
    ))}
  </div>
)}

{/* PhotoModal */}
{photoModal.open && (
  <PhotoModal
    photos={albumPhotos}
    currentIndex={photoModal.index}
    onClose={() => setPhotoModal({ open: false, index: 0 })}
  />
)}

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
    </div>
  );
};

export default AlbumPage;