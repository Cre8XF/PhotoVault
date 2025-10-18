// ============================================================================
// COMPONENT: PhotoModal.jsx – Lysboks med tastatur og sveipnavigasjon + teller
// ============================================================================
import React, { useEffect, useRef, useState } from "react";
import { X, ArrowLeft, ArrowRight } from "lucide-react";

const PhotoModal = ({ photos, currentIndex, onClose }) => {
  const [index, setIndex] = useState(currentIndex);
  const photo = photos[index];
  const startX = useRef(0);

  // Bla mellom bilder
  const nextPhoto = () => setIndex((i) => (i + 1) % photos.length);
  const prevPhoto = () => setIndex((i) => (i - 1 + photos.length) % photos.length);

  // Tastaturnavigasjon
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowRight") nextPhoto();
      if (e.key === "ArrowLeft") prevPhoto();
      if (e.key === "Escape") onClose();
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

  if (!photo) return null;

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center select-none"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Lukke-knapp */}
      <button
        className="absolute top-5 right-5 text-gray-300 hover:text-white transition"
        onClick={onClose}
      >
        <X className="w-7 h-7" />
      </button>

      {/* Bilde-teller */}
      <div className="absolute top-5 left-5 bg-black/50 text-white text-xs px-2 py-1 rounded">
        Bilde {index + 1} av {photos.length}
      </div>

      {/* Venstre / høyre knapper */}
      {photos.length > 1 && (
        <>
          <button
            className="absolute left-5 text-gray-300 hover:text-white transition"
            onClick={(e) => {
              e.stopPropagation();
              prevPhoto();
            }}
          >
            <ArrowLeft className="w-8 h-8" />
          </button>

          <button
            className="absolute right-5 text-gray-300 hover:text-white transition"
            onClick={(e) => {
              e.stopPropagation();
              nextPhoto();
            }}
          >
            <ArrowRight className="w-8 h-8" />
          </button>
        </>
      )}

      {/* Selve bildet */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-w-[90vw] max-h-[85vh] flex flex-col items-center"
      >
        <img
          src={photo.url}
          alt={photo.title || ""}
          className="max-h-[80vh] rounded-xl shadow-2xl object-contain transition-transform duration-300"
        />

        {/* Bildetittel */}
        {photo.title && (
          <p className="text-gray-300 mt-3 text-sm text-center">
            {photo.title}
          </p>
        )}
      </div>
    </div>
  );
};

export default PhotoModal;
