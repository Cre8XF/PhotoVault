// ============================================================================
// PhotoGridOptimized.jsx - Performance optimized photo grid
// ============================================================================
import React, { useState, useMemo } from "react";
import PhotoModal from "./PhotoModal";
import LazyImage from "./LazyImage";
import { ImageOff, Trash2, Star, Loader2 } from "lucide-react";
import { deletePhoto, toggleFavorite } from "../firebase";
import { useInfiniteScroll } from "../hooks/useInfiniteScroll";

const PhotoGridOptimized = ({
  photos = [],
  title,
  onPhotoClick,
  refreshPhotos,
  compact = false,
  filterUnassigned = false,
  showFavoriteButton = true,
  itemsPerPage = 20,
  enableInfiniteScroll = true,
}) => {
  const [photoModal, setPhotoModal] = useState({ open: false, index: 0 });
  const [loading, setLoading] = useState(false);

  // Filter photos
  const filteredPhotos = useMemo(() => {
    return filterUnassigned ? photos.filter((p) => !p.albumId) : photos;
  }, [photos, filterUnassigned]);

  // Infinite scroll hook
  const {
    displayedItems,
    hasMore,
    isLoading: scrollLoading,
    sentinelRef,
    stats
  } = useInfiniteScroll(
    filteredPhotos,
    itemsPerPage,
    { threshold: 0.8 }
  );

  // Use all photos if infinite scroll is disabled
  const photosToDisplay = enableInfiniteScroll ? displayedItems : filteredPhotos;

  // Handle delete
  const handleDelete = async (photo) => {
    const confirmed = window.confirm("Vil du slette dette bildet?");
    if (!confirmed) return;

    setLoading(true);
    try {
      await deletePhoto(photo.id, photo.storagePath);
      if (refreshPhotos) await refreshPhotos();
      console.log("🗑️ Bilde slettet:", photo.id);
    } catch (err) {
      console.error("Feil ved sletting:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle toggle favorite
  const handleToggleFavorite = async (e, photo) => {
    e.stopPropagation();
    try {
      await toggleFavorite(photo.id, photo.favorite);
      if (refreshPhotos) await refreshPhotos();
    } catch (err) {
      console.error("Feil ved favoritt-toggle:", err);
    }
  };

  if (!filteredPhotos || filteredPhotos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <ImageOff className="w-10 h-10 mb-2 opacity-60" />
        <p className="text-sm">Ingen bilder å vise</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header with stats */}
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-100 capitalize">
            {title}
          </h2>
          {enableInfiniteScroll && (
            <div className="text-sm text-gray-400">
              {stats.displayed} / {stats.total} bilder
            </div>
          )}
        </div>
      )}

      {/* Photo Grid */}
      <div
        className={`${
          compact
            ? "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8"
            : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
        } gap-4`}
      >
        {photosToDisplay.map((photo, i) => (
          <div key={photo.id} className="relative group overflow-hidden rounded-xl">
            <LazyImage
              src={photo.url}
              thumbnail={photo.thumbnailUrl || photo.url}
              photoId={photo.id}
              alt={photo.title || ""}
              className={`w-full ${
                compact ? "h-40" : "h-56"
              } object-contain bg-gray-900 rounded-xl border border-gray-700 shadow-md transform transition duration-300 hover:scale-[1.03] hover:shadow-lg hover:shadow-purple-500/20 cursor-pointer`}
              onClick={() =>
                onPhotoClick
                  ? onPhotoClick(photo.url)
                  : setPhotoModal({ open: true, index: i })
              }
            />

            {/* Overlay buttons */}
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
              {/* Favorite button */}
              {showFavoriteButton && (
                <button
                  onClick={(e) => handleToggleFavorite(e, photo)}
                  title={photo.favorite ? "Fjern favoritt" : "Legg til favoritt"}
                  className={`p-1.5 rounded-full ${
                    photo.favorite
                      ? "bg-yellow-500/80 text-white"
                      : "bg-black/50 text-gray-300 hover:bg-yellow-500/70"
                  } transition`}
                >
                  <Star className="w-4 h-4" fill={photo.favorite ? "currentColor" : "none"} />
                </button>
              )}

              {/* Delete button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(photo);
                }}
                title="Slett bilde"
                disabled={loading}
                className={`p-1.5 rounded-full ${
                  loading
                    ? "bg-gray-500 cursor-not-allowed"
                    : "bg-black/50 hover:bg-red-600/70 text-white"
                } transition`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Image title or "Set as cover" */}
            {onPhotoClick ? (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition">
                <span className="text-white text-sm font-medium">
                  Sett som cover
                </span>
              </div>
            ) : (
              photo.title && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs py-1 px-2 truncate opacity-0 group-hover:opacity-100 transition">
                  {photo.title}
                </div>
              )
            )}
          </div>
        ))}
      </div>

      {/* Infinite scroll sentinel */}
      {enableInfiniteScroll && hasMore && (
        <div
          ref={sentinelRef}
          className="flex items-center justify-center py-8"
        >
          {scrollLoading && (
            <div className="flex items-center gap-2 text-gray-400">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Laster flere bilder...</span>
            </div>
          )}
        </div>
      )}

      {/* End message */}
      {enableInfiniteScroll && !hasMore && photosToDisplay.length > itemsPerPage && (
        <div className="text-center py-8 text-gray-500 text-sm">
          Du har sett alle {stats.total} bildene
        </div>
      )}

      {/* Lightbox Modal */}
      {!onPhotoClick && photoModal.open && (
        <PhotoModal
          photos={photosToDisplay}
          currentIndex={photoModal.index}
          onClose={() => setPhotoModal({ open: false, index: 0 })}
          onToggleFavorite={async (photo) => {
            await toggleFavorite(photo.id, photo.favorite);
            if (refreshPhotos) await refreshPhotos();
          }}
        />
      )}
    </div>
  );
};

export default PhotoGridOptimized;
