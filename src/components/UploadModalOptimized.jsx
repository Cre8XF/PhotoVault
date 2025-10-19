// ============================================================================
// UploadModalOptimized.jsx - Optimized upload with compression
// ============================================================================
import React, { useState } from "react";
import { X, Upload, FolderOpen, Sparkles, Zap } from "lucide-react";
import { compressImage, generateThumbnails, validateImage, calculateSavings } from "../utils/imageOptimization";

const UploadModalOptimized = ({ albums, onClose, onUpload }) => {
  const [files, setFiles] = useState([]);
  const [selectedAlbum, setSelectedAlbum] = useState("");
  const [aiTagging, setAiTagging] = useState(
    localStorage.getItem('aiAutoTag') !== 'false'
  );
  const [compression, setCompression] = useState(
    localStorage.getItem('autoCompress') !== 'false'
  );
  const [uploading, setUploading] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [compressionStats, setCompressionStats] = useState(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    processFiles(selectedFiles);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    const imageFiles = droppedFiles.filter((file) =>
      file.type.startsWith("image/")
    );
    processFiles(imageFiles);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const processFiles = async (selectedFiles) => {
    // Validate files
    const validFiles = [];
    const errors = [];

    for (const file of selectedFiles) {
      const validation = validateImage(file, {
        maxSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      });

      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push({ file: file.name, errors: validation.errors });
      }
    }

    if (errors.length > 0) {
      console.warn('Some files were invalid:', errors);
      // You could show these errors to the user
    }

    setFiles(validFiles);
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setProcessingProgress(0);

    try {
      let processedFiles = files;
      let totalOriginalSize = 0;
      let totalCompressedSize = 0;

      // Compress images if enabled
      if (compression) {
        processedFiles = [];
        
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          totalOriginalSize += file.size;

          try {
            // Compress main image
            const compressedBlob = await compressImage(file, {
              maxWidth: 1920,
              maxHeight: 1080,
              quality: 0.85
            });

            // Generate thumbnails
            const thumbnails = await generateThumbnails(file);

            // Convert blob to file
            const compressedFile = new File(
              [compressedBlob],
              file.name,
              { type: 'image/jpeg', lastModified: Date.now() }
            );

            totalCompressedSize += compressedFile.size;

            // Attach thumbnails to file object
            compressedFile.thumbnails = thumbnails;
            processedFiles.push(compressedFile);

            // Update progress
            setProcessingProgress(Math.round(((i + 1) / files.length) * 50));
          } catch (error) {
            console.error(`Failed to process ${file.name}:`, error);
            // Use original file if compression fails
            processedFiles.push(file);
          }
        }

        // Calculate and show savings
        const savings = calculateSavings(totalOriginalSize, totalCompressedSize);
        setCompressionStats(savings);
        console.log('Compression savings:', savings);
      }

      // Upload processed files
      await onUpload(processedFiles, selectedAlbum || null, aiTagging);
      
      // Save preferences
      localStorage.setItem('aiAutoTag', aiTagging);
      localStorage.setItem('autoCompress', compression);
      
      onClose();
    } catch (error) {
      console.error("Upload error:", error);
    } finally {
      setUploading(false);
      setProcessingProgress(0);
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
            Støtter JPG, PNG, GIF, WebP (maks 10MB per fil)
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

        {/* Processing Progress */}
        {uploading && processingProgress > 0 && processingProgress < 50 && (
          <div className="mb-6 bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
            <p className="text-sm mb-2">Komprimerer bilder...</p>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all"
                style={{ width: `${processingProgress * 2}%` }}
              />
            </div>
          </div>
        )}

        {/* Compression Stats */}
        {compressionStats && (
          <div className="mb-6 bg-green-500/10 border border-green-500/20 rounded-xl p-4">
            <p className="text-sm text-green-400">
              ✓ Lagringsplass spart: {(compressionStats.savedBytes / 1024 / 1024).toFixed(2)} MB 
              ({compressionStats.savedPercentage}%)
            </p>
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

        {/* Compression Toggle */}
        <div className="mb-4 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600/30 rounded-lg">
                <Zap className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="font-medium">Auto-komprimering</p>
                <p className="text-xs opacity-70">
                  Reduser filstørrelse uten synlig kvalitetstap
                </p>
              </div>
            </div>
            <button
              onClick={() => setCompression(!compression)}
              disabled={uploading}
              className={`relative w-14 h-7 rounded-full transition ${
                compression ? 'bg-blue-600' : 'bg-gray-600'
              }`}
            >
              <div
                className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                  compression ? 'translate-x-7' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
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
                {processingProgress < 50 ? 'Prosesserer...' : 'Laster opp...'}
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

export default UploadModalOptimized;
