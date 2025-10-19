// ============================================================================
// components/SmartAlbumsView.jsx - Smart Albums Visning
// ============================================================================
import React, { useMemo } from "react";
import { generateAllSmartAlbums } from "../utils/smartAlbums";
import { Sparkles, Clock, Star, FolderOpen } from "lucide-react";

const SmartAlbumsView = ({ photos, onAlbumClick }) => {
  const smartAlbums = useMemo(() => {
    return generateAllSmartAlbums(photos);
  }, [photos]);

  const allAlbums = [
    ...(smartAlbums.favorites ? [smartAlbums.favorites] : []),
    ...(smartAlbums.unassigned ? [smartAlbums.unassigned] : []),
    ...smartAlbums.time,
    ...smartAlbums.content,
  ].filter(Boolean);

  if (allAlbums.length === 0) {
    return (
      <div className="text-center py-20">
        <Sparkles className="w-20 h-20 mx-auto mb-4 opacity-30" />
        <h3 className="text-xl font-semibold mb-2">Ingen smarte album ennå</h3>
        <p className="opacity-70">
          Last opp bilder med AI-tagging for å generere smarte album
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Favoritter & Uten album (viktigst) */}
      {(smartAlbums.favorites || smartAlbums.unassigned) && (
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Hurtiglenker
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {smartAlbums.favorites && (
              <SmartAlbumCard
                album={smartAlbums.favorites}
                onClick={() => onAlbumClick(smartAlbums.favorites)}
              />
            )}
            {smartAlbums.unassigned && (
              <SmartAlbumCard
                album={smartAlbums.unassigned}
                onClick={() => onAlbumClick(smartAlbums.unassigned)}
              />
            )}
          </div>
        </section>
      )}

      {/* Tidsbaserte album */}
      {smartAlbums.time.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-400" />
            Tidsbaserte album
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {smartAlbums.time.map((album) => (
              <SmartAlbumCard
                key={album.id}
                album={album}
                onClick={() => onAlbumClick(album)}
                compact
              />
            ))}
          </div>
        </section>
      )}

      {/* Innholdsbaserte album */}
      {smartAlbums.content.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            Innholdsbaserte album
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {smartAlbums.content.map((album) => (
              <SmartAlbumCard
                key={album.id}
                album={album}
                onClick={() => onAlbumClick(album)}
                compact
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

// Smart Album Card Component
const SmartAlbumCard = ({ album, onClick, compact = false }) => {
  return (
    <button
      onClick={onClick}
      className={`glass rounded-xl p-${compact ? '4' : '6'} text-left hover:scale-105 transition-transform group`}
    >
      {/* Preview bilder (2x2 grid) */}
      {!compact && album.photos.length > 0 && (
        <div className="grid grid-cols-2 gap-1 mb-4 rounded-lg overflow-hidden">
          {album.photos.slice(0, 4).map((photo, i) => (
            <img
              key={i}
              src={photo.url}
              alt=""
              className="w-full h-20 object-contain bg-gray-900"
            />
          ))}
          {album.photos.length < 4 &&
            Array(4 - album.photos.length)
              .fill(0)
              .map((_, i) => (
                <div key={`empty-${i}`} className="w-full h-20 bg-gray-900" />
              ))}
        </div>
      )}

      {/* Info */}
      <div className="flex items-center gap-3">
        <div
          className={`${compact ? 'p-2' : 'p-3'} rounded-xl bg-gradient-to-br ${album.color}`}
        >
          <span className="text-2xl">{album.icon}</span>
        </div>
        <div className="flex-1">
          <h3 className={`font-semibold ${compact ? 'text-sm' : 'text-base'}`}>
            {album.name}
          </h3>
          <p className="text-xs opacity-70">
            {album.count} {album.count === 1 ? 'bilde' : 'bilder'}
          </p>
        </div>
      </div>

      {!compact && (
        <p className="text-xs opacity-60 mt-2">{album.description}</p>
      )}
    </button>
  );
};

export default SmartAlbumsView;
