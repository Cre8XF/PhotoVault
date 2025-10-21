import React, { useState, useRef, useEffect } from "react";
import { X, Upload, Camera, Image as ImageIcon, FolderOpen } from "lucide-react";
import { 
  isNativePlatform, 
  takePicture, 
  pickImage, 
  convertWebPathToBlob,
  checkCameraPermissions,
  requestCameraPermissions 
} from "../utils/nativeCamera";
import { triggerHaptic, showToast } from "../utils/nativeUtils";

const UploadModal = ({ 
  isOpen, 
  onClose, 
  onUpload, 
  albums = [], 
  selectedAlbum = null 
}) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState(selectedAlbum);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [permissions, setPermissions] = useState({ camera: 'prompt', photos: 'prompt' });
  const fileInputRef = useRef(null);
  const isNative = isNativePlatform();

  useEffect(() => {
    if (isNative) {
      checkPermissions();
    }
  }, [isNative]);

  const checkPermissions = async () => {
    const perms = await checkCameraPermissions();
    setPermissions(perms);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleNativeCamera = async () => {
    try {
      await triggerHaptic('light');
      
      if (permissions.camera === 'denied') {
        const newPerms = await requestCameraPermissions();
        setPermissions(newPerms);
        
        if (newPerms.camera === 'denied') {
          await showToast('Camera permission required');
          return;
        }
      }

      const image = await takePicture();
      const blob = await convertWebPathToBlob(image.uri);
      const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
      
      handleFiles([file]);
      await triggerHaptic('medium');
    } catch (error) {
      console.error('Camera error:', error);
      await showToast('Failed to take picture');
    }
  };

  const handleNativeGallery = async () => {
    try {
      await triggerHaptic('light');
      
      if (permissions.photos === 'denied') {
        const newPerms = await requestCameraPermissions();
        setPermissions(newPerms);
        
        if (newPerms.photos === 'denied') {
          await showToast('Photos permission required');
          return;
        }
      }

      const images = await pickImage(true);
      
      const files = await Promise.all(
        images.map(async (img, index) => {
          const blob = await convertWebPathToBlob(img.uri);
          return new File([blob], `photo-${Date.now()}-${index}.jpg`, { type: 'image/jpeg' });
        })
      );
      
      handleFiles(files);
      await triggerHaptic('medium');
    } catch (error) {
      console.error('Gallery error:', error);
      await showToast('Failed to select photos');
    }
  };

  const handleFiles = (files) => {
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    const newFiles = imageFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size
    }));

    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev];
      URL.revokeObjectURL(newFiles[index].preview);
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    await triggerHaptic('medium');

    try {
      await onUpload(selectedFiles, selectedAlbumId);
      
      selectedFiles.forEach(file => URL.revokeObjectURL(file.preview));
      setSelectedFiles([]);
      setSelectedAlbumId(selectedAlbum);
      
      await triggerHaptic('heavy');
      await showToast(`${selectedFiles.length} photos uploaded`);
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      await showToast('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div 
        className="bg-[var(--bg-secondary)] rounded-2xl shadow-2xl border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-2xl font-bold text-white">Last opp bilder</h2>
          <button
            onClick={onClose}
            className="ripple-effect p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Native Camera Options */}
          {isNative && (
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleNativeCamera}
                className="ripple-effect flex flex-col items-center justify-center p-6 bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl hover:scale-105 transition-transform"
              >
                <Camera className="w-12 h-12 text-white mb-3" />
                <span className="text-white font-medium">Ta bilde</span>
              </button>

              <button
                onClick={handleNativeGallery}
                className="ripple-effect flex flex-col items-center justify-center p-6 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl hover:scale-105 transition-transform"
              >
                <ImageIcon className="w-12 h-12 text-white mb-3" />
                <span className="text-white font-medium">Velg fra galleri</span>
              </button>
            </div>
          )}

          {/* Web File Input / Drag & Drop */}
          {!isNative && (
            <>
              <div
                className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
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
                  Dra og slipp bilder her
                </p>
                <p className="text-gray-400 mb-4">eller</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="ripple-effect px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
                >
                  Velg filer
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
            </>
          )}

          {/* Album Selection */}
          {albums.length > 0 && (
            <div>
              <label className="block text-white font-medium mb-2">
                Velg album (valgfritt)
              </label>
              <select
                value={selectedAlbumId || ""}
                onChange={(e) => setSelectedAlbumId(e.target.value || null)}
                className="w-full bg-[var(--bg-primary)] text-white border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Uten album</option>
                {albums.map((album) => (
                  <option key={album.id} value={album.id}>
                    {album.name} ({album.photoCount || 0} bilder)
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Selected Files Preview */}
          {selectedFiles.length > 0 && (
            <div>
              <h3 className="text-white font-medium mb-3">
                Valgte bilder ({selectedFiles.length})
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
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white text-xs p-1 rounded-b-lg truncate">
                      {(file.size / 1024).toFixed(0)} KB
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-white/10 bg-[var(--bg-primary)]">
          <button
            onClick={onClose}
            className="ripple-effect px-6 py-3 text-gray-400 hover:text-white transition-colors"
          >
            Avbryt
          </button>
          <button
            onClick={handleUpload}
            disabled={selectedFiles.length === 0 || uploading}
            className="ripple-effect px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium"
          >
            {uploading ? "Laster opp..." : `Last opp ${selectedFiles.length} bilder`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
