import React, { useState } from "react";
import { X } from "lucide-react";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addAlbum, addPhoto } from "../firebase";

const UploadModal = ({
  user,
  albums,
  onClose,
  onUploadComplete,
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

      let albumId = selectedAlbum || null;
      if (newAlbumName.trim()) {
        albumId = await addAlbum({
          name: newAlbumName.trim(),
          userId: user.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        console.log("📁 Nytt album opprettet:", albumId);
      }

      let completed = 0;
      for (const file of selectedFiles) {
        const albumPath = albumId ? `albums/${albumId}` : "unassigned";
        const storagePath = `users/${user.uid}/${albumPath}/${file.name}`;
        const fileRef = ref(storage, storagePath);

        const snapshot = await uploadBytes(fileRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        const photoData = {
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

        const docId = await addPhoto(photoData);
        console.log(`✅ Bilde lagret med ID: ${docId}`);

        completed++;
        setUploadProgress(Math.round((completed / selectedFiles.length) * 100));
      }

      console.log(`✅ ${completed} bilder lastet opp`);
      await new Promise(resolve => setTimeout(resolve, 500));

      if (typeof onUploadComplete === "function") {
        await onUploadComplete();
      }

    } catch (err) {
      console.error("🔥 Feil ved opplasting:", err);
      alert("Kunne ikke laste opp bilder: " + (err?.message || ""));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
      <div
        className={`w-full max-w-md ${colors.cardBg} ${colors.glass} p-6 rounded-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-semibold ${colors.text}`}>
            Last opp bilder
          </h2>
          <button
            onClick={onClose}
            disabled={uploading}
            className="text-gray-400 hover:text-gray-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <label className={`${colors.textSecondary} text-sm block mb-2`}>
            Velg bilder
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setSelectedFiles([...e.target.files])}
            className="w-full p-2 rounded-lg border border-purple-500/50 bg-transparent text-sm"
            disabled={uploading}
          />
          {selectedFiles.length > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              {selectedFiles.length} fil(er) valgt
            </p>
          )}
        </div>

        <div className="mb-4">
          <label className={`${colors.textSecondary} text-sm block mb-2`}>
            Velg eksisterende album (valgfritt)
          </label>
          <select
            value={selectedAlbum}
            onChange={(e) => setSelectedAlbum(e.target.value)}
            className="w-full p-2 rounded-lg border border-purple-500/50 bg-transparent"
            disabled={uploading}
          >
            <option value="">Uten album</option>
            {albums.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className={`${colors.textSecondary} text-sm block mb-2`}>
            Opprett nytt album (valgfritt)
          </label>
          <input
            type="text"
            placeholder="F.eks. Sommer 2024"
            value={newAlbumName}
            onChange={(e) => setNewAlbumName(e.target.value)}
            className="w-full p-2 rounded-lg border border-purple-500/50 bg-transparent"
            disabled={uploading}
          />
        </div>

        {uploading && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className={colors.textSecondary}>Laster opp...</span>
              <span className={colors.textSecondary}>{uploadProgress}%</span>
            </div>
            <div className="w-full h-2 bg-gray-700/50 rounded-full overflow-hidden">
              <div
                className="h-2 bg-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2 rounded-xl bg-gray-700 hover:bg-gray-600 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Avbryt
          </button>
          <button
            onClick={handleUpload}
            disabled={uploading || selectedFiles.length === 0}
            className={`px-4 py-2 rounded-xl ${colors.buttonPrimary} disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {uploading ? `Laster opp... ${uploadProgress}%` : "Last opp"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;