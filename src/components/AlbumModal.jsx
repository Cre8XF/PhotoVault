// ============================================================================
// COMPONENT: AlbumModal.jsx – oppretting og redigering av album
// ============================================================================
import React, { useState, useEffect } from "react";
import { X, FolderPlus, Image as ImageIcon } from "lucide-react";

const AlbumModal = ({ onClose, onSave, editingAlbum, colors }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [cover, setCover] = useState("");

  useEffect(() => {
    if (editingAlbum) {
      setName(editingAlbum.name || "");
      setDescription(editingAlbum.description || "");
      setCover(editingAlbum.cover || "");
    }
  }, [editingAlbum]);

  const handleSave = (e) => {
    e.preventDefault();
    if (!name.trim()) return alert("Skriv inn et navn på albumet.");

    const albumData = {
      id: editingAlbum ? editingAlbum.id : Date.now().toString(),
      name: name.trim(),
      description: description.trim(),
      cover: cover.trim(),
      createdAt: editingAlbum?.createdAt || new Date().toISOString(),
    };

    onSave(albumData);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md rounded-2xl shadow-2xl border border-gray-700/40
                    bg-gradient-to-b from-gray-800/90 to-gray-900/90 p-6 backdrop-blur-xl`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-purple-400" />
            {editingAlbum ? "Rediger album" : "Nytt album"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Navn</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="F.eks. Sommerferien 2025"
              className="w-full p-3 rounded-xl bg-gray-800/60 border border-gray-600/50 
                         text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Beskrivelse</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Valgfritt – skriv kort om hva albumet inneholder"
              rows="3"
              className="w-full p-3 rounded-xl bg-gray-800/60 border border-gray-600/50 
                         text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-purple-400" />
              Cover-bilde-URL (valgfritt)
            </label>
            <input
              type="url"
              value={cover}
              onChange={(e) => setCover(e.target.value)}
              placeholder="https://..."
              className="w-full p-3 rounded-xl bg-gray-800/60 border border-gray-600/50 
                         text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {cover && (
              <img
                src={cover}
                alt="Cover preview"
                className="w-full h-40 object-cover rounded-xl mt-2 border border-gray-700"
              />
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-gray-700/60 hover:bg-gray-600/70 
                         text-gray-200 text-sm font-semibold transition-colors"
            >
              Avbryt
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 
                         hover:from-purple-600 hover:to-pink-600 text-white text-sm font-semibold transition-colors"
            >
              {editingAlbum ? "Lagre endringer" : "Opprett album"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AlbumModal;
