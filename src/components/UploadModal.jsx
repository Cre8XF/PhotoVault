// ============================================================================
// COMPONENT: UploadModal.jsx – v4.0 med AI Auto-Tagging (Fase 4.1)
// ============================================================================

import React, { useState, useRef, useEffect, useCallback } from "react";
import { X, Upload, Camera, Image as ImageIcon, Zap, Sparkles } from "lucide-react";
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
  const fileInputRef = useRef(null);
  const modalRef = useRef(null);
  const isNative = isNativePlatform();
  const { t } = useTranslation(["common", "upload"]);
  const [showAlbums, setShowAlbums] = useState(false);
  const [autoCompress, setAutoCompress] = useState(false);
  
  // ✨ AI Auto-tagging state (Fase 4.1)
  const [aiTagging, setAiTagging] = useState(() => {
    const saved = localStorage.getItem('aiAutoTag');
    return saved !== 'false'; // Default true
  });

  useEffect(() => {
    if (isNative) checkPermissions();
  }, [isNative]);

  const checkPermissions = async () => {
    const perms = await checkCameraPermissions();
    setPermissions(perms);
  };

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

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

  const handleFiles = (files) => {
    const imageFiles = files.filter((file) => file.type.startsWith("image/"));
    
    if (imageFiles.length !== files.length) {
        showToast(t("upload:nonImageWarning"), "warning"); 
    }

    const newFiles = imageFiles.map((file) => ({
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
    await triggerHaptic("medium");

    try {
      // ✨ Pass aiTagging-parameter til onUpload (Fase 4.1)
      await onUpload(selectedFiles, selectedAlbumId, aiTagging);
      selectedFiles.forEach((file) => URL.revokeObjectURL(file.preview));
      setSelectedFiles([]);
      setSelectedAlbumId(selectedAlbum || "");
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
    }
  };

  // ✨ Toggle AI-tagging og lagre preference (Fase 4.1)
  const handleAiToggle = () => {
    const newValue = !aiTagging;
    setAiTagging(newValue);
    localStorage.setItem('aiAutoTag', newValue.toString());
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        tabIndex="-1"
        className="bg-[var(--bg-secondary)] rounded-2xl shadow-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-hidden modal-content-enhanced"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">{t("upload:title")}</h2>
          <button
            onClick={onClose}
            className="ripple-effect p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-visible max-h-none">
          {isNative && (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleNativeCamera}
                className="ripple-effect flex flex-col items-center justify-center p-6 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl hover:scale-105 transition-transform"
              >
                <Camera className="w-12 h-12 text-white mb-3" />
                <span className="text-white font-medium">{t("upload:takePhoto")}</span>
              </button>
              <button
                onClick={handleNativeGallery}
                className="ripple-effect flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl hover:scale-105 transition-transform"
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
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="w-16 h-16 text-purple-500 mx-auto mb-4" />
              <p className="text-white text-lg font-medium mb-2">
                {t("upload:dragDrop")}
              </p>
              <p className="text-gray-400 mb-4">{t("upload:or")}</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="ripple-effect px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
              >
                {t("upload:selectFiles")}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileInput}
                className="hidden"
              />
            </div>
          )}
          
          {selectedFiles.length > 0 && (
            <div>
              <h3 className="text-white font-medium mb-3">
                {t("upload:selectedPhotos", { count: selectedFiles.length })}
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={file.preview}
                      alt={file.name}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeFile(index)}
                      className="ripple-effect absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
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

          {/* ✨ AI Auto-tagging Toggle (Fase 4.1) */}
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
                className={`relative w-14 h-7 rounded-full transition ${
                  aiTagging ? "bg-purple-600" : "bg-gray-600"
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    aiTagging ? "translate-x-7" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Auto-komprimering */}
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
                onClick={() => setAutoCompress(!autoCompress)}
                className={`relative w-14 h-7 rounded-full transition ${
                  autoCompress ? "bg-blue-600" : "bg-gray-600"
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    autoCompress ? "translate-x-7" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Album selection */}
        {true && (  /* always show album section */
          <div className="px-6 pt-4 pb-4 space-y-3 border-t border-white/10"> 
            <button
              onClick={() => {
                const name = prompt(t("upload:newAlbumPrompt"));
                if (name && onCreateAlbum) {
                  onCreateAlbum(name);
                }
              }}
              className="ripple-effect w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-medium py-3 rounded-lg transition-transform hover:scale-[1.02]"
            >
              {t("upload:newAlbum")}
            </button>

            <label className="block text-white font-medium mb-1">
              {t("upload:chooseAlbum")}
            </label>

            <div className="relative">
              <button
                onClick={() => setShowAlbums(!showAlbums)}
                className={`ripple-effect w-full flex justify-between items-center bg-[var(--bg-secondary)] text-white border border-white/10 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 transition 
                           ${showAlbums ? 'ring-2 ring-purple-500' : 'hover:border-white/40'}`} 
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

              {showAlbums && (
                <div 
                  className="absolute z-50 bottom-full mb-1 w-full bg-[var(--bg-secondary)] border border-white/10 rounded-lg shadow-xl overflow-hidden upload-modal-albumlist"
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
        )}

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-white/10 bg-[var(--bg-primary)]">
          <button
            onClick={onClose}
            className="ripple-effect px-6 py-3 text-gray-400 hover:text-white transition-colors"
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
              ? t("upload:uploading")
              : t("upload:uploadPhotos", { count: selectedFiles.length })}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;