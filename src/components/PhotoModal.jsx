// ============================================================================
// COMPONENT: PhotoModal.jsx – v3.2 med i18n
// ============================================================================
import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { X, ArrowLeft, ArrowRight, Download, Info, Star, Calendar, Tag } from "lucide-react";

const PhotoModal = ({ photos, currentIndex, onClose, onToggleFavorite }) => {
  const { t } = useTranslation(['common']);
  const [index, setIndex] = useState(currentIndex);
  const [showInfo, setShowInfo] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const photo = photos[index];
  const startX = useRef(0);

  // Bla mellom bilder
  const nextPhoto = () => {
    setImageLoaded(false);
    setIndex((i) => (i + 1) % photos.length);
  };
  
  const prevPhoto = () => {
    setImageLoaded(false);
    setIndex((i) => (i - 1 + photos.length) % photos.length);
  };

  // Tastaturnavigasjon
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowRight") nextPhoto();
      if (e.key === "ArrowLeft") prevPhoto();
      if (e.key === "Escape") onClose();
      if (e.key === "i" || e.key === "I") setShowInfo((s) => !s);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [photos.length]);

  // Sveip for mobil
  const handleTouchStart = (e) => (startX.current = e.touches[0].clientX);
  const handleTouchEnd = (e) => {
    const diff = e.changedTouches[0].clientX - startX.current;
    if (diff > 50) prevPhoto();
    if (diff < -50) nextPhoto();
  };

  // Last ned bilde
  const handleDownload = async () => {
    try {
      const response = await fetch(photo.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${photo.name || "photo"}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  if (!photo) return null;

  // Formater dato
  const formatDate = (dateStr) => {
    if (!dateStr) return t('common:unknown');
    const d = new Date(dateStr);
    return d.toLocaleDateString('no-NO', {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center select-none animate-fade-in"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Topbar med forbedret synlighet */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/90 via-black/60 to-transparent p-4 z-10">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Teller */}
          <div className="bg-white/90 backdrop-blur-md text-gray-900 text-sm font-semibold px-4 py-2 rounded-lg shadow-lg">
            {index + 1} / {photos.length}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(photo);
                }}
                className={`ripple-effect backdrop-blur-md text-white p-2.5 rounded-lg transition shadow-lg ${
                  photo.favorite
                    ? "bg-yellow-500/90 hover:bg-yellow-600"
                    : "bg-white/20 hover:bg-white/30"
                }`}
                title={photo.favorite ? t('common:removeFavorite') : t('common:addToFavorites')}
              >
                <Star
                  className="w-5 h-5"
                  fill={photo.favorite ? "currentColor" : "none"}
                />
              </button>
            )}
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowInfo(!showInfo);
              }}
              className={`ripple-effect backdrop-blur-md text-white p-2.5 rounded-lg transition shadow-lg ${
                showInfo ? "bg-purple-600/90" : "bg-white/20 hover:bg-white/30"
              }`}
              title={t('common:showInfo')}
            >
              <Info className="w-5 h-5" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload();
              }}
              className="ripple-effect bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-2.5 rounded-lg transition shadow-lg"
              title={t('common:download')}
            >
              <Download className="w-5 h-5" />
            </button>

            <button
              onClick={onClose}
              className="ripple-effect bg-red-600/90 backdrop-blur-md hover:bg-red-700 text-white p-2.5 rounded-lg transition shadow-lg"
              title={t('common:close')}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigasjonsknapper */}
      {photos.length > 1 && (
        <>
          <button
            className="ripple-effect absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-4 rounded-full transition shadow-2xl z-10 border-2 border-white/30"
            onClick={(e) => {
              e.stopPropagation();
              prevPhoto();
            }}
            title={t('common:previous')}
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <button
            className="ripple-effect absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/30 text-white p-4 rounded-full transition shadow-2xl z-10 border-2 border-white/30"
            onClick={(e) => {
              e.stopPropagation();
              nextPhoto();
            }}
            title={t('common:next')}
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </>
      )}

      {/* Hovedbilde */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-w-[90vw] max-h-[85vh] flex items-center justify-center relative"
      >
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="spinner" />
          </div>
        )}
        
        <img
          src={photo.url}
          alt={photo.name || ""}
          className={`max-h-[80vh] max-w-full rounded-xl shadow-2xl object-contain transition-opacity duration-300 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
        />
      </div>

      {/* Info-panel */}
      {showInfo && (
        <div
          className="absolute right-4 top-20 bottom-4 w-80 bg-gray-900/95 backdrop-blur-xl rounded-2xl p-6 overflow-y-auto animate-slide-in shadow-2xl border border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-lg font-semibold mb-4 text-white">
            {t('common:photoInfo')}
          </h3>

          <div className="space-y-4 text-sm">
            {/* Navn */}
            <div>
              <p className="text-gray-400 mb-1">{t('common:name')}</p>
              <p className="text-white font-medium">{photo.name || t('common:noName')}</p>
            </div>

            {/* Dato */}
            <div className="flex items-start gap-2">
              <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p className="text-gray-400 mb-1">{t('common:uploaded')}</p>
                <p className="text-white">{formatDate(photo.createdAt)}</p>
              </div>
            </div>

            {/* Størrelse */}
            {photo.size && (
              <div>
                <p className="text-gray-400 mb-1">{t('common:size')}</p>
                <p className="text-white">
                  {(photo.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}

            {/* Favoritt */}
            <div>
              <p className="text-gray-400 mb-1">{t('common:status')}</p>
              <div className="flex items-center gap-2">
                {photo.favorite && (
                  <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs flex items-center gap-1">
                    <Star className="w-3 h-3" fill="currentColor" />
                    {t('common:favorite')}
                  </span>
                )}
                {!photo.favorite && (
                  <span className="text-gray-500 text-xs">{t('common:notFavorite')}</span>
                )}
              </div>
            </div>

            {/* AI Tags */}
            {photo.aiTags && photo.aiTags.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-4 h-4 text-gray-400" />
                  <p className="text-gray-400">{t('common:aiTags')}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {photo.aiTags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Ansikter */}
            {photo.faces > 0 && (
              <div>
                <p className="text-gray-400 mb-1">{t('common:facesDetected')}</p>
                <p className="text-white">👤 {photo.faces}</p>
              </div>
            )}

            {/* URL (for debugging) */}
            <div>
              <p className="text-gray-400 mb-1">{t('common:filePath')}</p>
              <p className="text-white text-xs break-all opacity-60">
                {photo.storagePath || t('common:unknown')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Bildetittel nederst */}
      {photo.name && !showInfo && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-md text-gray-900 px-6 py-3 rounded-lg font-medium shadow-lg">
          {photo.name}
        </div>
      )}
    </div>
  );
};

export default PhotoModal;
