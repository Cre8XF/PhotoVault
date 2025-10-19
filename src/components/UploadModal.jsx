// ============================================================================
// components/UploadModal.jsx – v4.1 med AI auto-tagging
// ============================================================================
import React, { useState } from "react";
import { X, Upload, FolderOpen, Sparkles } from "lucide-react";

const UploadModal = ({ albums, onClose, onUpload }) => {
  const [files, setFiles] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState("");
  const [aiTagging, setAiTagging] = useState(
    localStorage.getItem('aiAutoTag') !== 'false'
  );
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    const imageFiles = droppedFiles.filter((file) =>
      file.type.startsWith("image/")
    );
    setFiles(imageFiles);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    try {
      await onUpload(files, selectedAlbum || null, aiTagging);
      onClose();
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass rounded-2xl max-w-2xl w-full p-6 md:p-8 animate-scale-in">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Upload className="w-7 h-7 text-purple-400" />
            Last opp bilder
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition"
            disabled={uploading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Drag & Drop Area */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-white/20 rounded-xl p-12 text-center mb-6 hover:border-purple-400 transition cursor-pointer"
          onClick={() => document.getElementById("file-input").click()}
        >
          <Upload className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg mb-2">
            Dra og slipp bilder her, eller klikk for å velge
          </p>
          <p className="text-sm opacity-70">
            Støtter JPG, PNG, GIF, WebP
          </p>
          <input
            id="file-input"
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
        </div>

        {/* Selected Files */}
        {files.length > 0 && (
          <div className="mb-6">
            <p className="text-sm opacity-70 mb-2">
              {files.length} {files.length === 1 ? "fil" : "filer"} valgt
            </p>
            <div className="max-h-40 overflow-y-auto space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-white/5 p-3 rounded-lg"
                >
                  <span className="text-sm truncate">{file.name}</span>
                  <span className="text-xs opacity-70 ml-2">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Album Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2 flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            Velg album (valgfritt)
          </label>
          <select
            value={selectedAlbum}
            onChange={(e) => setSelectedAlbum(e.target.value)}
            className="w-full glass px-4 py-3 rounded-xl outline-none border border-white/10 focus:border-purple-400 transition"
            disabled={uploading}
          >
            <option value="">Uten album</option>
            {albums.map((album) => (
              <option key={album.id} value={album.id}>
                {album.name}
              </option>
            ))}
          </select>
        </div>

        {/* AI Tagging Toggle */}
        <div className="mb-6 bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600/30 rounded-lg">
                <Sparkles className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="font-medium flex items-center gap-2">
                  AI Auto-tagging
                  <span className="text-xs bg-purple-600/30 px-2 py-0.5 rounded-full">
                    Beta
                  </span>
                </p>
                <p className="text-xs opacity-70">
                  Analyser bilder automatisk med AI ved opplasting
                </p>
              </div>
            </div>
            <button
              onClick={() => setAiTagging(!aiTagging)}
              disabled={uploading}
              className={`relative w-14 h-7 rounded-full transition ${
                aiTagging ? 'bg-purple-600' : 'bg-gray-600'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  aiTagging ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          {aiTagging && (
            <div className="mt-3 text-xs opacity-70">
              ℹ️ Gratis tier: 1000 bilder/måned. Se AI-innstillinger for mer info.
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={uploading}
            className="flex-1 glass px-6 py-3 rounded-xl hover:bg-white/15 transition disabled:opacity-50"
          >
            Avbryt
          </button>
          <button
            onClick={handleUpload}
            disabled={files.length === 0 || uploading}
            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-6 py-3 rounded-xl font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {uploading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Laster opp...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Last opp {files.length > 0 && `(${files.length})`}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
