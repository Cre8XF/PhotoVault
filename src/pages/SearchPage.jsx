// ============================================================================
// PAGE: SearchPage.jsx – v5.0 med AI-søk (Fase 4.1)
// ============================================================================
import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Search, X, Calendar, Tag, Star, Users, Folder, SlidersHorizontal, Sparkles } from "lucide-react";
import PhotoGridOptimized from "../components/PhotoGridOptimized";

const SearchPage = ({ photos, albums, onPhotoClick, toggleFavorite, refreshData }) => {
  const { t } = useTranslation(['common', 'albums']);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState({
    favorites: false,
    withFaces: false,
    withTags: false,
    aiAnalyzed: false,  // ✨ Nytt filter (Fase 4.1)
    dateRange: null,
    albumId: null,
    category: null,     // ✨ Nytt filter (Fase 4.1)
  });
  const [showFilters, setShowFilters] = useState(false);

  // ✨ Finn unike kategorier fra bilder (Fase 4.1)
  const categories = useMemo(() => {
    const cats = new Set();
    photos.forEach(p => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats).sort();
  }, [photos]);

  // ✨ Finn populære AI-tags (Fase 4.1)
  const popularTags = useMemo(() => {
    const tagCount = {};
    photos.forEach(p => {
      if (p.aiTags) {
        p.aiTags.forEach(tag => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      }
    });
    return Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));
  }, [photos]);

  const filteredPhotos = useMemo(() => {
    let results = photos;

    // ✨ Søk i både navn og AI-tags (Fase 4.1)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(photo => {
        const nameMatch = photo.name?.toLowerCase().includes(query);
        const tagsMatch = photo.aiTags?.some(tag => tag.toLowerCase().includes(query));
        const categoryMatch = photo.category?.toLowerCase().includes(query);
        return nameMatch || tagsMatch || categoryMatch;
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

    // ✨ Filter: Kun AI-analysert (Fase 4.1)
    if (activeFilters.aiAnalyzed) {
      results = results.filter(p => p.aiAnalyzed);
    }

    // ✨ Filter: Kategori (Fase 4.1)
    if (activeFilters.category) {
      results = results.filter(p => p.category === activeFilters.category);
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
    { label: t('albums:dateRanges.today'), action: () => setActiveFilters({ ...activeFilters, dateRange: 'today' }) },
    { label: t('albums:dateRanges.lastWeek'), action: () => setActiveFilters({ ...activeFilters, dateRange: 'week' }) },
    { label: t('albums:filters.withFaces'), action: () => setActiveFilters({ ...activeFilters, withFaces: true }) },
    { label: t('common:favorites'), action: () => setActiveFilters({ ...activeFilters, favorites: true }) },
  ];

  const clearFilters = () => {
    setActiveFilters({
      favorites: false,
      withFaces: false,
      withTags: false,
      aiAnalyzed: false,
      dateRange: null,
      albumId: null,
      category: null,
    });
    setSearchQuery("");
  };

  const activeFilterCount = Object.values(activeFilters).filter(v => v).length;

  return (
    <div className="min-h-screen p-6 md:p-10 pb-24 animate-fade-in">
      {/* Header */}
      <h1 className="text-3xl font-bold mb-6">{t('common:search')}</h1>

      {/* Søkefelt */}
      <div className="glass rounded-2xl p-4 mb-6">
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 opacity-50" />
          <input
            type="text"
            placeholder={t('albums:searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-lg"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="ripple-effect p-1 hover:bg-white/10 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* ✨ Populære AI-tags (Fase 4.1) */}
      {!searchQuery && activeFilterCount === 0 && popularTags.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium opacity-70 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            Populære AI-tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {popularTags.map(({ tag, count }) => (
              <button
                key={tag}
                onClick={() => setSearchQuery(tag)}
                className="ripple-effect glass px-4 py-2 rounded-xl hover:bg-purple-500/20 transition text-sm flex items-center gap-2"
              >
                <span>{tag}</span>
                <span className="text-xs opacity-60">({count})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter toggle */}
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="ripple-effect glass px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-white/15 transition"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>{t('albums:filters.title')}</span>
          {activeFilterCount > 0 && (
            <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
              {activeFilterCount}
            </span>
          )}
        </button>

        {activeFilterCount > 0 && (
          <button
            onClick={clearFilters}
            className="ripple-effect text-sm text-purple-400 hover:text-purple-300 transition"
          >
            {t('albums:filters.reset')}
          </button>
        )}
      </div>

      {/* Filtre */}
      {showFilters && (
        <div className="glass rounded-2xl p-6 mb-6 space-y-6 animate-scale-in">
          {/* ✨ AI-filtre (Fase 4.1) */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="font-medium">AI-funksjoner</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveFilters({ ...activeFilters, aiAnalyzed: !activeFilters.aiAnalyzed })}
                className={`ripple-effect px-3 py-1.5 rounded-lg text-sm transition ${
                  activeFilters.aiAnalyzed
                    ? 'bg-purple-600 text-white'
                    : 'glass hover:bg-white/10'
                }`}
              >
                Kun AI-analysert
              </button>
              <button
                onClick={() => setActiveFilters({ ...activeFilters, withTags: !activeFilters.withTags })}
                className={`ripple-effect px-3 py-1.5 rounded-lg text-sm transition ${
                  activeFilters.withTags
                    ? 'bg-purple-600 text-white'
                    : 'glass hover:bg-white/10'
                }`}
              >
                Med AI-tagger
              </button>
              <button
                onClick={() => setActiveFilters({ ...activeFilters, withFaces: !activeFilters.withFaces })}
                className={`ripple-effect px-3 py-1.5 rounded-lg text-sm transition ${
                  activeFilters.withFaces
                    ? 'bg-purple-600 text-white'
                    : 'glass hover:bg-white/10'
                }`}
              >
                {t('albums:filters.withFaces')}
              </button>
            </div>
          </div>

          {/* ✨ Kategorier (Fase 4.1) */}
          {categories.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Tag className="w-4 h-4 text-purple-400" />
                <span className="font-medium">Kategorier</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveFilters({ 
                      ...activeFilters, 
                      category: activeFilters.category === cat ? null : cat 
                    })}
                    className={`ripple-effect px-3 py-1.5 rounded-lg text-sm transition capitalize ${
                      activeFilters.category === cat
                        ? 'bg-purple-600 text-white'
                        : 'glass hover:bg-white/10'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Dato */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-purple-400" />
              <span className="font-medium">{t('albums:filters.date')}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {['today', 'week', 'month', 'year'].map((range) => (
                <button
                  key={range}
                  onClick={() => setActiveFilters({ ...activeFilters, dateRange: range })}
                  className={`ripple-effect px-3 py-1.5 rounded-lg text-sm transition ${
                    activeFilters.dateRange === range
                      ? 'bg-purple-600 text-white'
                      : 'glass hover:bg-white/10'
                  }`}
                >
                  {t(`albums:dateRanges.${range}`)}
                </button>
              ))}
            </div>
          </div>

          {/* Favoritter */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-purple-400" />
              <span className="font-medium">{t('common:favorites')}</span>
            </div>
            <button
              onClick={() => setActiveFilters({ ...activeFilters, favorites: !activeFilters.favorites })}
              className={`ripple-effect px-3 py-1.5 rounded-lg text-sm transition ${
                activeFilters.favorites
                  ? 'bg-purple-600 text-white'
                  : 'glass hover:bg-white/10'
              }`}
            >
              {t('albums:filters.favoritesOnly')}
            </button>
          </div>

          {/* Album */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Folder className="w-4 h-4 text-purple-400" />
              <span className="font-medium">{t('common:album')}</span>
            </div>
            <select
              value={activeFilters.albumId || ''}
              onChange={(e) => setActiveFilters({ ...activeFilters, albumId: e.target.value || null })}
              className="w-full glass px-3 py-2 rounded-lg text-sm outline-none"
            >
              <option value="">{t('albums:filters.allAlbums')}</option>
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
          <h3 className="text-sm font-medium opacity-70 mb-3">{t('albums:popularSearches')}</h3>
          <div className="flex flex-wrap gap-2">
            {popularSearches.map((search, i) => (
              <button
                key={i}
                onClick={search.action}
                className="ripple-effect glass px-4 py-2 rounded-xl hover:bg-white/10 transition text-sm"
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
            {searchQuery || activeFilterCount > 0 ? t('albums:searchResults') : t('albums:allPhotos', { count: filteredPhotos.length })}
          </h2>
          <p className="opacity-70">
            {t('common:photoCount', { count: filteredPhotos.length })}
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
            <h3 className="text-xl font-semibold mb-2">{t('albums:noPhotosFound')}</h3>
            <p className="opacity-70">
              {searchQuery || activeFilterCount > 0
                ? t('albums:tryDifferentSearch')
                : t('albums:uploadToStart')
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;