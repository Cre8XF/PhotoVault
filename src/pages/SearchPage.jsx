// ============================================================================
// PAGE: SearchPage.jsx – v4.0 Dedikert søk med filtre
// ============================================================================
import React, { useState, useMemo } from "react";
import { Search, X, Calendar, Tag, Star, Users, Folder, SlidersHorizontal } from "lucide-react";

const SearchPage = ({ photos, albums, onPhotoClick, toggleFavorite }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState({
    favorites: false,
    withFaces: false,
    withTags: false,
    dateRange: null,
    albumId: null,
  });
  const [showFilters, setShowFilters] = useState(false);

  // Søk og filtrer bilder
  const filteredPhotos = useMemo(() => {
    let results = photos;

    // Tekstsøk
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(photo => {
        const nameMatch = photo.name?.toLowerCase().includes(query);
        const tagsMatch = photo.aiTags?.some(tag => tag.toLowerCase().includes(query));
        return nameMatch || tagsMatch;
      });
    }

    // Filtrer favoritter
    if (activeFilters.favorites) {
      results = results.filter(p => p.favorite);
    }

    // Filtrer ansikter
    if (activeFilters.withFaces) {
      results = results.filter(p => p.faces > 0);
    }

    // Filtrer AI-tagger
    if (activeFilters.withTags) {
      results = results.filter(p => p.aiTags && p.aiTags.length > 0);
    }

    // Filtrer album
    if (activeFilters.albumId) {
      results = results.filter(p => p.albumId === activeFilters.albumId);
    }

    // Filtrer dato
    if (activeFilters.dateRange) {
      const now = Date.now();
      const ranges = {
        today: 1,
        week: 7,
        month: 30,
        year: 365,
      };
      const days = ranges[activeFilters.dateRange];
      if (days) {
        const cutoff = now - (days * 24 * 60 * 60 * 1000);
        results = results.filter(p => new Date(p.createdAt).getTime() >= cutoff);
      }
    }

    return results;
  }, [photos, searchQuery, activeFilters]);

  // Populære søk (shortcuts)
  const popularSearches = [
    { label: 'I dag', action: () => setActiveFilters({ ...activeFilters, dateRange: 'today' }) },
    { label: 'Siste uke', action: () => setActiveFilters({ ...activeFilters, dateRange: 'week' }) },
    { label: 'Med ansikter', action: () => setActiveFilters({ ...activeFilters, withFaces: true }) },
    { label: 'Favoritter', action: () => setActiveFilters({ ...activeFilters, favorites: true }) },
  ];

  const clearFilters = () => {
    setActiveFilters({
      favorites: false,
      withFaces: false,
      withTags: false,
      dateRange: null,
      albumId: null,
    });
    setSearchQuery("");
  };

  const activeFilterCount = Object.values(activeFilters).filter(v => v).length;

  return (
    <div className="min-h-screen p-6 md:p-10 pb-24 animate-fade-in">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-6">Søk</h1>

      {/* Søkefelt */}
      <div className="glass rounded-2xl p-4 mb-6">
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 opacity-50" />
          <input
            type="text"
            placeholder="Søk i bilder..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-lg"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="p-1 hover:bg-white/10 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Filter toggle */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="glass px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-white/15 transition"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Filtre</span>
          {activeFilterCount > 0 && (
            <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>

        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm text-purple-400 hover:text-purple-300 transition"
          >
            Nullstill filtre
          </button>
        )}
      </div>

      {/* Filtre */}
      {showFilters && (
        <div className="glass rounded-2xl p-6 mb-6 space-y-6 animate-scale-in">
          {/* Dato */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-purple-400" />
              <h3 className="font-semibold">Dato</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {['today', 'week', 'month', 'year'].map((range) => (
                <button
                  key={range}
                  onClick={() => setActiveFilters({ ...activeFilters, dateRange: activeFilters.dateRange === range ? null : range })}
                  className={`px-4 py-2 rounded-lg text-sm transition ${
                    activeFilters.dateRange === range
                      ? 'bg-purple-600 text-white'
                      : 'bg-white/10 hover:bg-white/20'
                  }`}
                >
                  {range === 'today' && 'I dag'}
                  {range === 'week' && 'Siste uke'}
                  {range === 'month' && 'Siste måned'}
                  {range === 'year' && 'Siste år'}
                </button>
              ))}
            </div>
          </div>

          {/* Album */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Folder className="w-4 h-4 text-purple-400" />
              <h3 className="font-semibold">Album</h3>
            </div>
            <select
              value={activeFilters.albumId || ''}
              onChange={(e) => setActiveFilters({ ...activeFilters, albumId: e.target.value || null })}
              className="w-full glass px-4 py-2 rounded-lg outline-none"
            >
              <option value="">Alle album</option>
              {albums.map((album) => (
                <option key={album.id} value={album.id}>
                  {album.name}
                </option>
              ))}
            </select>
          </div>

          {/* Quick filters */}
          <div>
            <h3 className="font-semibold mb-3">Hurtigfiltre</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveFilters({ ...activeFilters, favorites: !activeFilters.favorites })}
                className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition ${
                  activeFilters.favorites
                    ? 'bg-yellow-500 text-white'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                <Star className="w-4 h-4" />
                Favoritter
              </button>

              <button
                onClick={() => setActiveFilters({ ...activeFilters, withFaces: !activeFilters.withFaces })}
                className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition ${
                  activeFilters.withFaces
                    ? 'bg-pink-500 text-white'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                <Users className="w-4 h-4" />
                Med ansikter
              </button>

              <button
                onClick={() => setActiveFilters({ ...activeFilters, withTags: !activeFilters.withTags })}
                className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition ${
                  activeFilters.withTags
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 hover:bg-white/20'
                }`}
              >
                <Tag className="w-4 h-4" />
                Med AI-tagger
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Populære søk (kun når tomt) */}
      {!searchQuery && activeFilterCount === 0 && (
        <div className="mb-6">
          <h3 className="font-semibold mb-3 opacity-70">Populære søk</h3>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((search, i) => (
              <button
                key={i}
                onClick={search.action}
                className="glass px-4 py-2 rounded-xl text-sm hover:bg-white/15 transition"
              >
                {search.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Resultater */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {searchQuery || activeFilterCount > 0 ? 'Søkeresultater' : 'Alle bilder'}
          </h2>
          <p className="opacity-70">
            {filteredPhotos.length} {filteredPhotos.length === 1 ? 'bilde' : 'bilder'}
          </p>
        </div>

        {filteredPhotos.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredPhotos.map((photo) => (
              <div
                key={photo.id}
                onClick={() => onPhotoClick && onPhotoClick(photo)}
                className="relative group cursor-pointer"
              >
                <img
                  src={photo.url}
                  alt={photo.name || ''}
                  className="w-full h-40 object-contain bg-gray-900 rounded-xl transition-transform group-hover:scale-105 border border-white/10"
                  loading="lazy"
                />
                {photo.favorite && (
                  <Star
                    className="absolute top-2 right-2 w-5 h-5 text-yellow-400"
                    fill="currentColor"
                  />
                )}
                {photo.aiTags && photo.aiTags.length > 0 && (
                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs">
                    <Tag className="w-3 h-3 inline mr-1" />
                    {photo.aiTags.length}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Search className="w-20 h-20 mx-auto mb-4 opacity-30" />
            <h3 className="text-xl font-semibold mb-2">Ingen bilder funnet</h3>
            <p className="opacity-70">
              {searchQuery || activeFilterCount > 0
                ? 'Prøv et annet søk eller juster filtrene'
                : 'Last opp bilder for å komme i gang'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
