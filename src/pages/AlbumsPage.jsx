// ============================================================================
// PAGE: AlbumsPage.jsx – v4.1 med LazyImage
// ============================================================================
import React, { useState, useMemo } from "react";
import { Folder, Image, Star, Calendar, FolderOpen, Grid, List, ChevronDown } from "lucide-react";
import AlbumCard from "../components/AlbumCard";
import LazyImage from "../components/LazyImage";

const AlbumsPage = ({ 
  albums, 
  photos, 
  onNavigate, 
  onAlbumClick,
  onPhotoClick,
  toggleFavorite 
}) => {
  const [viewMode, setViewMode] = useState("all");
  const [gridView, setGridView] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);

  const stats = useMemo(() => ({
    totalPhotos: photos.length,
    totalAlbums: albums.length,
    favorites: photos.filter(p => p.favorite).length,
    unassigned: photos.filter(p => !p.albumId).length,
  }), [photos, albums]);

  const filteredPhotos = useMemo(() => {
    switch(viewMode) {
      case 'allPhotos':
        return photos;
      case 'favorites':
        return photos.filter(p => p.favorite);
      case 'unassigned':
        return photos.filter(p => !p.albumId);
      case 'byDate':
        return [...photos].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      default:
        return [];
    }
  }, [photos, viewMode]);

  const viewOptions = [
    { value: 'all', label: 'Alt', icon: Grid },
    { value: 'albums', label: 'Kun album', icon: Folder },
    { value: 'allPhotos', label: 'Alle bilder', icon: Image },
    { value: 'favorites', label: 'Favoritter', icon: Star },
    { value: 'unassigned', label: 'Uten album', icon: FolderOpen },
    { value: 'byDate', label: 'Etter dato', icon: Calendar },
  ];

  const currentView = viewOptions.find(opt => opt.value === viewMode);

  return (
    <div className="min-h-screen p-6 md:p-10 pb-24 animate-fade-in">
      {/* Header med dropdown */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Album</h1>
        
        <div className="flex gap-3">
          {/* View mode dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="glass px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-white/15 transition"
            >
              <currentView.icon className="w-4 h-4" />
              <span className="hidden sm:inline">Vis: {currentView.label}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 glass rounded-xl overflow-hidden shadow-2xl z-10 border border-white/20">
                {viewOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setViewMode(option.value);
                      setShowDropdown(false);
                    }}
                    className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-white/10 transition ${
                      viewMode === option.value ? 'bg-white/10' : ''
                    }`}
                  >
                    <option.icon className="w-4 h-4" />
                    <span>{option.label}</span>
                    {viewMode === option.value && (
                      <span className="ml-auto text-purple-400">✓</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Grid/List toggle */}
          {['allPhotos', 'favorites', 'unassigned', 'byDate'].includes(viewMode) && (
            <button
              onClick={() => setGridView(!gridView)}
              className="glass p-2 rounded-xl hover:bg-white/15 transition"
              title={gridView ? "Bytt til liste" : "Bytt til rutenett"}
            >
              {gridView ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Content based on viewMode */}
      {viewMode === 'all' && (
        <div className="space-y-10">
          {/* Alle bilder preview */}
          {stats.totalPhotos > 0 && (
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Image className="w-5 h-5 text-purple-400" />
                  Alle bilder ({stats.totalPhotos})
                </h2>
                <button
                  onClick={() => setViewMode('allPhotos')}
                  className="text-sm text-purple-400 hover:text-purple-300 transition"
                >
                  Se alle →
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {photos.slice(0, 4).map((photo) => (
                  <LazyImage
                    key={photo.id}
                    src={photo.url}
                    thumbnail={photo.thumbnailSmall}
                    photoId={photo.id}
                    alt={photo.name || ''}
                    onClick={() => onPhotoClick && onPhotoClick(photo)}
                    className="w-full h-32 object-contain bg-gray-900 rounded-xl cursor-pointer hover:scale-105 transition border border-white/10"
                  />
                ))}
              </div>
            </section>
          )}

          {/* Mine album */}
          {stats.totalAlbums > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Folder className="w-5 h-5 text-purple-400" />
                Mine album ({stats.totalAlbums})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {albums.map((album, i) => (
                  <AlbumCard
                    key={album.id}
                    album={album}
                    onClick={() => onAlbumClick(album)}
                    className={`animate-scale-in stagger-${(i % 6) + 1}`}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Bilder uten album */}
          {stats.unassigned > 0 && (
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-amber-400" />
                  Bilder uten album ({stats.unassigned})
                </h2>
                <button
                  onClick={() => setViewMode('unassigned')}
                  className="text-sm text-amber-400 hover:text-amber-300 transition"
                >
                  Organiser →
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {photos.filter(p => !p.albumId).slice(0, 4).map((photo) => (
                  <LazyImage
                    key={photo.id}
                    src={photo.url}
                    thumbnail={photo.thumbnailSmall}
                    photoId={photo.id}
                    alt={photo.name || ''}
                    onClick={() => onPhotoClick && onPhotoClick(photo)}
                    className="w-full h-32 object-contain bg-gray-900 rounded-xl cursor-pointer hover:scale-105 transition border border-white/10"
                  />
                ))}
              </div>
            </section>
          )}

          {/* Empty state */}
          {stats.totalAlbums === 0 && stats.totalPhotos === 0 && (
            <div className="text-center py-20">
              <Folder className="w-20 h-20 mx-auto mb-4 opacity-30" />
              <h3 className="text-xl font-semibold mb-2">Ingen album ennå</h3>
              <p className="opacity-70 mb-6">Last opp bilder for å komme i gang</p>
            </div>
          )}
        </div>
      )}

      {/* Kun album */}
      {viewMode === 'albums' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {albums.map((album, i) => (
            <AlbumCard
              key={album.id}
              album={album}
              onClick={() => onAlbumClick(album)}
              className={`animate-scale-in stagger-${(i % 6) + 1}`}
            />
          ))}
          {albums.length === 0 && (
            <div className="col-span-full text-center py-20">
              <Folder className="w-20 h-20 mx-auto mb-4 opacity-30" />
              <h3 className="text-xl font-semibold mb-2">Ingen album</h3>
              <p className="opacity-70">Opprett et album for å organisere bilder</p>
            </div>
          )}
        </div>
      )}

      {/* Alle bilder / Favoritter / Uten album / Etter dato */}
      {['allPhotos', 'favorites', 'unassigned', 'byDate'].includes(viewMode) && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <p className="opacity-70">
              {filteredPhotos.length} {filteredPhotos.length === 1 ? 'bilde' : 'bilder'}
            </p>
          </div>

          {filteredPhotos.length > 0 ? (
            <div className={gridView 
              ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
              : "space-y-4"
            }>
              {filteredPhotos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => onPhotoClick && onPhotoClick(photo)}
                  className={gridView 
                    ? "relative group cursor-pointer"
                    : "glass p-4 rounded-xl flex items-center gap-4 cursor-pointer hover:bg-white/10 transition"
                  }
                >
                  <LazyImage
                    src={photo.url}
                    thumbnail={photo.thumbnailSmall}
                    photoId={photo.id}
                    alt={photo.name || ''}
                    className={gridView
                      ? "w-full h-40 object-contain bg-gray-900 rounded-xl transition-transform group-hover:scale-105 border border-white/10"
                      : "w-20 h-20 object-contain bg-gray-900 rounded-lg border border-white/10"
                    }
                  />
                  {!gridView && (
                    <div className="flex-1">
                      <p className="font-medium">{photo.name || 'Uten navn'}</p>
                      <p className="text-sm opacity-70">
                        {new Date(photo.createdAt).toLocaleDateString('no-NO')}
                      </p>
                    </div>
                  )}
                  {photo.favorite && (
                    <Star
                      className={gridView ? "absolute top-2 right-2 w-5 h-5 text-yellow-400" : "w-5 h-5 text-yellow-400"}
                      fill="currentColor"
                    />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <currentView.icon className="w-20 h-20 mx-auto mb-4 opacity-30" />
              <h3 className="text-xl font-semibold mb-2">Ingen bilder</h3>
              <p className="opacity-70">
                {viewMode === 'favorites' && 'Du har ingen favoritter ennå'}
                {viewMode === 'unassigned' && 'Alle bilder er organisert i album'}
                {viewMode === 'allPhotos' && 'Last opp bilder for å komme i gang'}
                {viewMode === 'byDate' && 'Ingen bilder funnet'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AlbumsPage;
