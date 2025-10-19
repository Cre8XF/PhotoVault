// ============================================================================
// PAGE: SearchPage.jsx – v4.1 med PhotoGridOptimized
// ============================================================================
import React, { useState, useMemo } from "react";
import { Search, X, Calendar, Tag, Star, Users, Folder, SlidersHorizontal } from "lucide-react";
import PhotoGridOptimized from "../components/PhotoGridOptimized";

const SearchPage = ({ photos, albums, onPhotoClick, toggleFavorite, refreshData }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState({
    favorites: false,
    withFaces: false,
    withTags: false,
    dateRange: null,
    albumId: null,
  });
  const [showFilters, setShowFilters] = useState(false);

  const filteredPhotos = useMemo(() => {
    let results = photos;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(photo => {
        const nameMatch = photo.name?.toLowerCase().includes(query);
        const tagsMatch = photo.aiTags?.some(tag => tag.toLowerCase().includes(query));
        return nameMatch || tagsMatch;
      });
    }

    if (activeFilters.favorites) {
      results = results.filter(p => p.favorite);
    }

    if (activeFilters.withFaces) {
      results = results.filter(p => p.faces > 0);
    }

    if (activeFilters.withTags) {
      results = results.filter(p => p.aiTags && p.aiTags.length > 0);
    }

    if (activeFilters.albumId) {
      results = results.filter(p => p.albumId === activeFilters.albumId);
    }

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
              <span className="font-medium">Dato</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['today', 'week', 'month', 'year'].map((range) => (
                <button
                  key={range}
                  onClick={() => setActiveFilters({ ...activeFilters, dateRange: range })}
                  className={`px-3 py-1.5 rounded-lg text-sm transition ${
                    activeFilters.dateRange === range
                      ? 'bg-purple-600 text-white'
                      : 'glass hover:bg-white/10'
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

          {/* Tagger */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Tag className="w-4 h-4 text-purple-400" />
              <span className="font-medium">Tagger</span>
            </div>
            <button
              onClick={() => setActiveFilters({ ...activeFilters, withTags: !activeFilters.withTags })}
              className={`px-3 py-1.5 rounded-lg text-sm transition ${
                activeFilters.withTags
                  ? 'bg-purple-600 text-white'
                  : 'glass hover:bg-white/10'
              }`}
            >
              Med AI-tagger
            </button>
          </div>

          {/* Favoritter */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-purple-400" />
              <span className="font-medium">Favoritter</span>
            </div>
            <button
              onClick={() => setActiveFilters({ ...activeFilters, favorites: !activeFilters.favorites })}
              className={`px-3 py-1.5 rounded-lg text-sm transition ${
                activeFilters.favorites
                  ? 'bg-purple-600 text-white'
                  : 'glass hover:bg-white/10'
              }`}
            >
              Kun favoritter
            </button>
          </div>

          {/* Ansikter */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-purple-400" />
              <span className="font-medium">Ansikter</span>
            </div>
            <button
              onClick={() => setActiveFilters({ ...activeFilters, withFaces: !activeFilters.withFaces })}
              className={`px-3 py-1.5 rounded-lg text-sm transition ${
                activeFilters.withFaces
                  ? 'bg-purple-600 text-white'
                  : 'glass hover:bg-white/10'
              }`}
            >
              Med ansikter
            </button>
          </div>

          {/* Album */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Folder className="w-4 h-4 text-purple-400" />
              <span className="font-medium">Album</span>
            </div>
            <select
              value={activeFilters.albumId || ''}
              onChange={(e) => setActiveFilters({ ...activeFilters, albumId: e.target.value || null })}
              className="w-full glass px-3 py-2 rounded-lg text-sm outline-none"
            >
              <option value="">Alle album</option>
              {albums.map((album) => (
                <option key={album.id} value={album.id}>
                  {album.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Populære søk */}
      {!searchQuery && activeFilterCount === 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium opacity-70 mb-3">Populære søk</h3>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((search, i) => (
              <button
                key={i}
                onClick={search.action}
                className="glass px-4 py-2 rounded-xl hover:bg-white/10 transition text-sm"
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
          <PhotoGridOptimized
            photos={filteredPhotos}
            refreshPhotos={refreshData}
            enableInfiniteScroll={filteredPhotos.length > 50}
            itemsPerPage={20}
            compact={false}
            showFavoriteButton={true}
          />
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
