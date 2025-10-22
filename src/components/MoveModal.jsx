
// ============================================================================
// COMPONENT: MoveModal.jsx – Flytt valgte bilder til et annet album
// ============================================================================
import React, { useState } from "react";

const MoveModal = ({ isOpen, onClose, albums = [], onConfirm }) => {
  const [selectedAlbumId, setSelectedAlbumId] = useState("");

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[var(--bg-secondary)] rounded-2xl shadow-2xl border border-white/10 w-full max-w-md p-6"
      >
        <h2 className="text-xl font-bold text-white mb-4">Flytt til album</h2>
        <p className="text-sm text-gray-400 mb-4">Velg albumet du vil flytte bildene til.</p>

        <select
          value={selectedAlbumId}
          onChange={(e) => setSelectedAlbumId(e.target.value)}
          className="w-full bg-[var(--bg-primary)] text-white border border-white/10 rounded-lg px-4 py-3 mb-6 focus:ring-2 focus:ring-purple-500"
        >
          <option value="">Velg album...</option>
          {albums.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </select>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
          >
            Avbryt
          </button>
          <button
            disabled={!selectedAlbumId}
            onClick={() => {
              onConfirm(selectedAlbumId);
              onClose();
            }}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            Flytt
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoveModal;
