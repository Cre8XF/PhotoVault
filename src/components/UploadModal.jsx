// ============================================================================
// COMPONENT: UploadModal.jsx – v5.0 Kombinert versjon
// Kombinerer funksjonalitet fra original + optimalisert versjon
// ============================================================================

import React, { useState, useRef, useEffect, useCallback } from "react";
import { X, Upload, Camera, Image as ImageIcon, Zap, Sparkles, FolderOpen } from "lucide-react";
import { auth } from "../firebase";
import {
  isNativePlatform,
  takePicture,
  pickImage,
  convertWebPathToBlob,
  checkCameraPermissions,
  requestCameraPermissions
} from "../utils/nativeCamera";
import { triggerHaptic, showToast } from "../utils/nativeUtils";
import { useTranslation } from "react-i18next";
import { compressImage, generateThumbnails, validateImage, calculateSavings } from "../utils/imageOptimization";

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

const UploadModal = ({
  isOpen,
  onClose,
  onUpload,
  onCreateAlbum,
  albums = [],
  selectedAlbum = null,
}) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState(selectedAlbum || "");
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [permissions, setPermissions] = useState({ camera: "prompt", photos: "prompt" });
  const [processingProgress, setProcessingProgress] = useState(0);
  const [compressionStats, setCompressionStats] = useState(null);
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);
  const isNative = isNativePlatform();
  const { t } = useTranslation(["common", "upload"]);
  const [showAlbums, setShowAlbums] = useState(false);
  
  const [autoCompress, setAutoCompress] = useState(() => {
    const saved = localStorage.getItem('autoCompress');
    return saved !== 'false';
  });
  
  const [aiTagging, setAiTagging] = useState(() => {
    const saved = localStorage.getItem('aiAutoTag');
    return saved !== 'false';
  });

  useEffect(() => {
    if (isNative) checkPermissions();
  }, [isNative]);

  const checkPermissions = async () => {
    const perms = await checkCameraPermissions();
    setPermissions(perms);
  };

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape' && !uploading) {
      onClose();
    }
  }, [onClose, uploading]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      setTimeout(() => modalRef.current?.focus(), 0); 
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.length > 0) handleFiles(Array.from(e.dataTransfer.files));
  };

  const handleFileInput = (e) => {
    if (e.target.files?.length > 0) handleFiles(Array.from(e.target.files));
  };

  const handleFiles = async (files) => {
    const validFiles = [];
    const errors = [];

    for (const file of files) {
      if (file.type.startsWith("image/")) {
        const validation = validateImage(file, {
          maxSize: 10 * 1024 * 1024,
          allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
        });

        if (validation.valid) {
          validFiles.push(file);
        } else {
          errors.push({ file: file.name, errors: validation.errors });
        }
      }
    }

    if (errors.length > 0) {
      console.warn('Some files were invalid:', errors);
    }

    if (files.length !== validFiles.length) {
      showToast(t("upload:nonImageWarning"), "warning");
    }

    const newFiles = validFiles.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size
    }));
    
    setSelectedFiles((prev) => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setSelectedFiles((prev) => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleNativeCamera = async () => {
    try {
      await triggerHaptic("light");
      if (permissions.camera === "denied") {
        const newPerms = await requestCameraPermissions();
        setPermissions(newPerms);
        if (newPerms.camera === "denied") {
          await showToast(t("upload:cameraPermission"));
          return;
        }
      }
      const image = await takePicture();
      const blob = await convertWebPathToBlob(image.uri);
      const file = new File([blob], `camera-${Date.now()}.jpg`, { type: "image/jpeg" });
      handleFiles([file]);
      await triggerHaptic("medium");
    } catch (error) {
      console.error("Camera error:", error);
      await showToast(t("upload:cameraError"));
    }
  };

  const handleNativeGallery = async () => {
    try {
      await triggerHaptic("light");
      if (permissions.photos === "denied") {
        const newPerms = await requestCameraPermissions();
        setPermissions(newPerms);
        if (newPerms.photos === "denied") {
          await showToast(t("upload:galleryPermission"));
          return;
        }
      }
      const images = await pickImage(true);
      const files = await Promise.all(
        images.map(async (img, index) => {
          const blob = await convertWebPathToBlob(img.uri);
          return new File([blob], `photo-${Date.now()}-${index}.jpg`, { type: "image/jpeg" });
        })
      );
      handleFiles(files);
      await triggerHaptic("medium");
    } catch (error) {
      console.error("Gallery error:", error);
      await showToast(t("upload:galleryError"));
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    
    setUploading(true);
    setProcessingProgress(0);
    setCompressionStats(null);
    await triggerHaptic("medium");

    try {
      let processedFiles = selectedFiles;
      let totalOriginalSize = 0;
      let totalCompressedSize = 0;

      if (autoCompress) {
        const compressed = [];
        
        for (let i = 0; i < selectedFiles.length; i++) {
          const fileObj = selectedFiles[i];
          const file = fileObj.file;
          totalOriginalSize += file.size;

          try {
            const compressedBlob = await compressImage(file, {
              maxWidth: 1920,
              maxHeight: 1080,
              quality: 0.85
            });

            const thumbnails = await generateThumbnails(file);

            const compressedFile = new File(
              [compressedBlob],
              file.name,
              { type: 'image/jpeg', lastModified: Date.now() }
            );

            totalCompressedSize += compressedFile.size;
            compressedFile.thumbnails = thumbnails;
            
            compressed.push({
              file: compressedFile,
              preview: fileObj.preview,
              name: compressedFile.name,
              size: compressedFile.size
            });

            setProcessingProgress(Math.round(((i + 1) / selectedFiles.length) * 50));
          } catch (error) {
            console.error(`Failed to process ${file.name}:`, error);
            compressed.push(fileObj);
          }
        }

        processedFiles = compressed;

        if (totalOriginalSize > 0 && totalCompressedSize > 0) {
          const savings = calculateSavings(totalOriginalSize, totalCompressedSize);
          setCompressionStats(savings);
          console.log('Compression savings:', savings);
        }
      }

      await onUpload(processedFiles, selectedAlbumId, aiTagging);
      
      localStorage.setItem('aiAutoTag', aiTagging.toString());
      localStorage.setItem('autoCompress', autoCompress.toString());
      
      selectedFiles.forEach((file) => URL.revokeObjectURL(file.preview));
      setSelectedFiles([]);
      setSelectedAlbumId(selectedAlbum || "");
      setProcessingProgress(0);
      setCompressionStats(null);
      
      await triggerHaptic("heavy");
      
      if (aiTagging) {
        await showToast(t("upload:successWithAI", { count: selectedFiles.length }));
      } else {
        await showToast(t("upload:success", { count: selectedFiles.length }));
      }
      
      onClose();
    } catch (error) {
      console.error("Upload error:", error);
      await showToast(t("upload:failed"));
    } finally {
      setUploading(false);
      setProcessingProgress(0);
    }
  };

  const handleAiToggle = () => {
    const newValue = !aiTagging;
    setAiTagging(newValue);
    localStorage.setItem('aiAutoTag', newValue.toString());
  };

  const handleCompressToggle = () => {
    const newValue = !autoCompress;
    setAutoCompress(newValue);
    localStorage.setItem('autoCompress', newValue.toString());
  };

  const handleCreateAlbumClick = async () => {
    const name = prompt(t("upload:newAlbumPrompt"));
    if (!name || !name.trim()) return;

    const user = auth.currentUser;
    if (!user) {
      await showToast("Du må være innlogget");
      return;
    }

    if (onCreateAlbum) {
      await onCreateAlbum(name.trim(), user.uid);
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !uploading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        tabIndex="-1"
        className="bg-[var(--bg-secondary)] rounded-2xl shadow-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-hidden modal-content-enhanced"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">{t("upload:title")}</h2>
          <button
            onClick={onClose}
            disabled={uploading}
            className="ripple-effect p-2 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {isNative && (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleNativeCamera}
                disabled={uploading}
                className="ripple-effect flex flex-col items-center justify-center p-6 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl hover:scale-105 transition-transform disabled:opacity-50"
              >
                <Camera className="w-12 h-12 text-white mb-3" />
                <span className="text-white font-medium">{t("upload:takePhoto")}</span>
              </button>
              <button
                onClick={handleNativeGallery}
                disabled={uploading}
                className="ripple-effect flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl hover:scale-105 transition-transform disabled:opacity-50"
              >
                <ImageIcon className="w-12 h-12 text-white mb-3" />
                <span className="text-white font-medium">{t("upload:chooseGallery")}</span>
              </button>
            </div>
          )}

          {!isNative && (
            <div
               className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors upload-modal-dropzone ${
                dragActive
                  ? "border-purple-500 bg-purple-500/10"
                  : "border-white/20 hover:border-white/40"
              } ${uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => !uploading && fileInputRef.current?.click()}
            >
              <Upload className="w-16 h-16 text-purple-500 mx-auto mb-4" />
              <p className="text-white text-lg font-medium mb-2">
                {t("upload:dragDrop")}
              </p>
              <p className="text-gray-400 mb-4">{t("upload:or")}</p>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
                disabled={uploading}
                className="ripple-effect px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t("upload:selectFiles")}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileInput}
                disabled={uploading}
                className="hidden"
              />
            </div>
          )}
          
          {selectedFiles.length > 0 && (
            <div>
              <h3 className="text-white font-medium mb-3">
                {t("upload:selectedPhotos", { count: selectedFiles.length })}
              </h3>
              <div className="grid grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeFile(index)}
                      disabled={uploading}
                      className="ripple-effect absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                      aria-label={t("common:remove")}
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 rounded-b-lg truncate">
                      {formatFileSize(file.size)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploading && processingProgress > 0 && processingProgress < 50 && (
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
              <p className="text-sm mb-2 text-purple-300">Komprimerer bilder...</p>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full transition-all"
                  style={{ width: `${processingProgress * 2}%` }}
                />
              </div>
            </div>
          )}

          {compressionStats && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
              <p className="text-sm text-green-400">
                ✓ Lagringsplass spart: {(compressionStats.savedBytes / 1024 / 1024).toFixed(2)} MB 
                ({compressionStats.savedPercentage}%)
              </p>
            </div>
          )}

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600/30 rounded-lg">
                  <Zap className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="font-medium">{t("upload:autoCompress")}</p>
                  <p className="text-xs text-gray-400">{t("upload:autoCompressDesc")}</p>
                </div>
              </div>
              <button
                onClick={handleCompressToggle}
                disabled={uploading}
                className={`relative w-14 h-7 rounded-full transition ${
                  autoCompress ? "bg-blue-600" : "bg-gray-600"
                } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div
                  className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    autoCompress ? "translate-x-7" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-600/30 rounded-lg">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <p className="font-medium flex items-center gap-2">
                    {t("upload:aiAutoTagging")} 
                    <span className="text-xs bg-purple-600/30 px-2 py-0.5 rounded-full">Beta</span>
                  </p>
                  <p className="text-xs text-gray-400">{t("upload:aiAutoTaggingDesc")}</p>
                </div>
              </div>
              <button
                onClick={handleAiToggle}
                disabled={uploading}
                className={`relative w-14 h-7 rounded-full transition ${
                  aiTagging ? "bg-purple-600" : "bg-gray-600"
                } ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div
                  className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    aiTagging ? "translate-x-7" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 pt-4 pb-4 space-y-3 border-t border-white/10"> 
          <button
            onClick={handleCreateAlbumClick}
            disabled={uploading}
            className="ripple-effect w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium py-3 rounded-lg transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {t("upload:newAlbum")}
          </button>

          <label className="block text-white font-medium mb-1 flex items-center gap-2">
            <FolderOpen className="w-4 h-4" />
            {t("upload:chooseAlbum")}
          </label>

          <div className="relative">
            <button
              onClick={() => !uploading && setShowAlbums(!showAlbums)}
              disabled={uploading}
              className={`ripple-effect w-full flex justify-between items-center bg-[var(--bg-secondary)] text-white border border-white/10 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 transition 
                         ${showAlbums ? 'ring-2 ring-purple-500' : 'hover:border-white/40'} 
                         ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`} 
            >
              <span>
                {selectedAlbumId
                  ? albums.find((a) => a.id === selectedAlbumId)?.name
                  : t("upload:noAlbum")}
              </span>
              <span className="text-gray-400">
                {showAlbums ? '▲' : '▼'}
              </span>
            </button>

            {showAlbums && !uploading && (
              <div 
                className="absolute z-50 bottom-full mb-1 w-full bg-[var(--bg-secondary)] border border-white/10 rounded-lg shadow-xl overflow-hidden upload-modal-albumlist max-h-60 overflow-y-auto"
              >
                <div
                  onClick={() => {
                    setSelectedAlbumId("");
                    setShowAlbums(false);
                  }}
                  className="px-4 py-2 hover:bg-purple-600/30 cursor-pointer"
                >
                  {t("upload:noAlbum")}
                </div>
                {albums.map((album) => (
                  <div
                    key={album.id}
                    onClick={() => {
                      setSelectedAlbumId(album.id);
                      setShowAlbums(false);
                    }}
                    className="px-4 py-2 hover:bg-purple-600/30 cursor-pointer"
                  >
                    {album.name} ({album.photoCount || 0} {t("common:photos")})
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t border-white/10 bg-[var(--bg-primary)]">
          <button
            onClick={onClose}
            disabled={uploading}
            className="ripple-effect px-6 py-3 text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t("common:cancel")}
          </button>
          <button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || uploading}
            className="ripple-effect px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium flex items-center gap-2"
          >
            {uploading && <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />}
            {uploading
              ? (processingProgress < 50 ? t("upload:processing") || "Prosesserer..." : t("upload:uploading"))
              : t("upload:uploadPhotos", { count: selectedFiles.length })}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal