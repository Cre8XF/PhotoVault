// ============================================================================
// COMPONENT: PhotoGridOptimized.jsx – med støtte for flervalg (robust versjon)
// ============================================================================
import React, { useState } from "react";
import { Check } from "lucide-react";
import LazyImage from "./LazyImage";

const PhotoGridOptimized = ({
  photos = [],
  onPhotoClick,
  selectedPhotos,
  setSelectedPhotos,
  enableSelection = true,
}) => {
  // Lokal fallback hvis props ikke er sendt inn
  const [localSelected, setLocalSelected] = useState([]);
  const currentSelected = selectedPhotos ?? localSelected;
  const updateSelected = setSelectedPhotos ?? setLocalSelected;

  const toggleSelect = (photoId) => {
    if (!enableSelection) return;
    updateSelected((prev) =>
      prev.includes(photoId)
        ? prev.filter((id) => id !== photoId)
        : [...prev, photoId]
    );
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {photos.map((photo) => {
        const selected = currentSelected.includes(photo.id);
        return (
          <div
            key={photo.id}
            className={`relative group cursor-pointer rounded-xl overflow-hidden border ${
              selected ? "border-purple-500" : "border-white/10"
            }`}
            onClick={(e) => {
              if (enableSelection && (e.ctrlKey || e.metaKey)) {
                toggleSelect(photo.id);
              } else if (onPhotoClick) {
                onPhotoClick(photo);
              }
            }}
          >
            <LazyImage
              src={photo.url}
              thumbnail={photo.thumbnailSmall}
              alt={photo.name || ""}
              className="w-full h-48 object-contain bg-gray-900 transition-transform group-hover:scale-105"
            />

            {enableSelection && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSelect(photo.id);
                }}
                className={`absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full border border-white/20 transition ${
                  selected
                    ? "bg-purple-600 text-white"
                    : "bg-black/50 text-gray-300 hover:bg-white/20"
                }`}
              >
                <Check size={14} />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PhotoGridOptimized;
