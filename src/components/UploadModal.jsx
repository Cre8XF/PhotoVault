// ============================================================================
// COMPONENT: UploadModal.jsx – laster opp bilder til Firebase Storage
// Strukturert per bruker og album: users/{uid}/albums/{albumId}/{file}
// ============================================================================
import React, { useState } from "react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addAlbum, addPhoto } from "../firebase";

const UploadModal = ({
  user,
  albums,
  onClose,
  onUploadComplete,
  refreshData,
  colors,
}) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState("");
  const [newAlbumName, setNewAlbumName] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUpload = async () => {
    if (!selectedFiles.length) {
      alert("Velg minst ett bilde før du laster opp.");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      const storage = getStorage();

      // 🔹 Opprett nytt album hvis valgt
      let albumId = selectedAlbum || null;
      if (newAlbumName.trim()) {
        const createdId = await addAlbum({
          name: newAlbumName.trim(),
          userId: user.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        albumId = createdId;
      }

      let completed = 0;
      for (const file of selectedFiles) {
        // 🔹 Lag sti basert på bruker og album
        const albumPath = albumId ? `albums/${albumId}` : "unassigned";
        const storagePath = `users/${user.uid}/${albumPath}/${file.name}`;
        const fileRef = ref(storage, storagePath);

        // 🔹 Last opp til Firebase Storage
        const snapshot = await uploadBytes(fileRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        // 🔹 Lag metadata for Firestore
        const photoData = {
          id: `${file.name}_${Date.now()}`,
          userId: user.uid,
          albumId,
          name: file.name.replace(/\.[^/.]+$/, ""),
          url: downloadURL,
          storagePath,
          size: file.size || 0,
          type: file.type || "image/jpeg",
          favorite: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await addPhoto(photoData);

        completed++;
        setUploadProgress(Math.round((completed / selectedFiles.length) * 100));
      }

      // 🔁 Oppdater visninger
      if (typeof onUploadComplete === "function") onUploadComplete();
      if (typeof refreshData === "function") refreshData();
      onClose();
    } catch (err) {
      console.error("🔥 Feil ved opplasting:", err);
      alert("Kunne ikke laste opp bilder: " + (err?.message || ""));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
      <div
        className={`w-full max-w-md ${colors.cardBg} ${colors.glass} p-6 rounded-2xl`}
      >
        <h2 className={`text-xl font-semibold mb-4 ${colors.text}`}>
          Last opp bilder
        </h2>

        {/* Filvalg */}
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setSelectedFiles([...e.target.files])}
          className="w-full p-2 rounded-lg border border-purple-500/50 mb-4 bg-transparent"
        />

        {/* Albumvalg */}
        <label className={`${colors.textSecondary} text-sm`}>
          Velg eksisterende album (valgfritt)
        </label>
        <select
          value={selectedAlbum}
          onChange={(e) => setSelectedAlbum(e.target.value)}
          className="w-full p-2 rounded-lg border border-purple-500/50 mb-4 bg-transparent"
        >
          <option value="">Uten album</option>
          {albums.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>

        {/* Nytt album */}
        <label className={`${colors.textSecondary} text-sm`}>
          Opprett nytt album (valgfritt)
        </label>
        <input
          type="text"
          placeholder="F.eks. Sommer 2024"
          value={newAlbumName}
          onChange={(e) => setNewAlbumName(e.target.value)}
          className="w-full p-2 rounded-lg border border-purple-500/50 mb-4 bg-transparent"
        />

        {/* Fremdrift */}
        {uploading && (
          <div className="w-full h-2 bg-gray-700/50 rounded mb-4">
            <div
              className="h-2 bg-purple-500 rounded"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        {/* Knapper */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white"
          >
            Avbryt
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading}
            className={`px-4 py-2 rounded-xl ${
              uploading ? "bg-purple-700/70" : colors.buttonPrimary
            } text-white`}
          >
            {uploading ? `Laster opp... ${uploadProgress}%` : "Last opp"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
