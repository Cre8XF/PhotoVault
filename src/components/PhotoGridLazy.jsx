// ============================================================================
// components/PhotoGridLazy.jsx – v1.0 med react-window lazy loading
// ============================================================================
import React, { useState, useRef, useEffect } from "react";
import { FixedSizeGrid as Grid } from "react-window";
import { Star, Heart, ImageOff } from "lucide-react";
import { toggleFavorite } from "../firebase";

/**
 * Optimalisert PhotoGrid med lazy loading
 * Renderer kun synlige bilder for betydelig bedre ytelse
 */
const PhotoGridLazy = ({
  photos = [],
  onPhotoClick,
  refreshPhotos,
  showFavoriteButton = true,
  filterUnassigned = false,
  columnCount = 4, // Antall kolonner (desktop)
  rowHeight = 220,  // Høyde per rad
  gap = 16,         // Gap mellom bilder
}) => {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(600);

  // Filtrer bilder
  const list = filterUnassigned 
    ? photos.filter((p) => !p.albumId) 
    : photos;

  // Responsive columns
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const height = window.innerHeight - 200; // Juster etter header/footer
        setContainerWidth(width);
        setContainerHeight(height);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Beregn antall kolonner basert på skjermstørrelse
  const getColumnCount = () => {
    if (containerWidth < 640) return 2;  // Mobile
    if (containerWidth < 1024) return 3; // Tablet
    return columnCount;                   // Desktop
  };

  const columns = getColumnCount();
  const columnWidth = (containerWidth - (gap * (columns + 1))) / columns;

  // Toggle favoritt
  const handleToggleFavorite = async (e, photo) => {
    e.stopPropagation();
    try {
      await toggleFavorite(photo.id, photo.favorite);
      if (refreshPhotos) await refreshPhotos();
    } catch (err) {
      console.error("Feil ved favoritt-toggle:", err);
    }
  };

  // Celle-renderer for react-window
  const Cell = ({ columnIndex, rowIndex, style }) => {
    const index = rowIndex * columns + columnIndex;
    
    if (index >= list.length) {
      return null; // Tom celle
    }

    const photo = list[index];

    return (
      <div
        style={{
          ...style,
          left: style.left + gap,
          top: style.top + gap,
          width: columnWidth,
          height: rowHeight - gap,
        }}
      >
        <div
          onClick={() => onPhotoClick && onPhotoClick(photo, index)}
          className="relative group cursor-pointer rounded-lg overflow-hidden bg-gray-800 h-full animate-fade-in"
        >
          {/* Bilde */}
          <img
            src={photo.url}
            alt={photo.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
            loading="lazy"
          />

          {/* Overlay med gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Favoritt badge (hvis favoritt) */}
          {photo.favorite && (
            <div className="absolute top-2 right-2 bg-yellow-500/90 backdrop-blur-sm p-1.5 rounded-full">
              <Star className="w-4 h-4 text-white fill-white" />
            </div>
          )}

          {/* Hover controls */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            {showFavoriteButton && (
              <button
                onClick={(e) => handleToggleFavorite(e, photo)}
                className={`p-2 rounded-full transition ${
                  photo.favorite
                    ? "bg-yellow-500 hover:bg-yellow-600"
                    : "bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                }`}
                title={photo.favorite ? "Fjern fra favoritter" : "Legg til i favoritter"}
              >
                <Heart
                  className={`w-5 h-5 ${
                    photo.favorite ? "fill-white text-white" : "text-white"
                  }`}
                />
              </button>
            )}
          </div>

          {/* Navn (vises på hover) */}
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform">
            <p className="text-white text-sm font-medium truncate">
              {photo.name}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Tom state
  if (!list || list.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <ImageOff className="w-16 h-16 mb-4 opacity-50" />
        <p className="text-lg">Ingen bilder å vise</p>
      </div>
    );
  }

  const rowCount = Math.ceil(list.length / columns);

  return (
    <div ref={containerRef} className="w-full">
      {containerWidth > 0 && (
        <Grid
          columnCount={columns}
          columnWidth={columnWidth + gap}
          height={containerHeight}
          rowCount={rowCount}
          rowHeight={rowHeight}
          width={containerWidth}
          className="scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-gray-800"
          overscanRowCount={2} // Pre-render 2 rader utenfor viewport
        >
          {Cell}
        </Grid>
      )}
    </div>
  );
};

export default PhotoGridLazy;