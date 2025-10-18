// ============================================================================
// PAGE: GalleryPage.jsx – v2.5 Enhanced med avansert søk og filtrering
// ============================================================================
import React, { useState, useMemo } from "react";
import { Search, Folder, Star, Image as ImageIcon, Calendar, Tag, X } from "lucide-react";
import PhotoGrid from "../components/PhotoGrid";
import PhotoModal from "../components/PhotoModal";

const GalleryPage = ({
  albums = [],
  photos = [],
  colors = {},
  onAlbumOpen,
  refreshData,
}) => {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("alle");
  const [dateFilter, setDateFilter] = useState("all");
  const [photoModal, setPhotoModal] = useState({ open: false, index: 0 });
  const [showFilters, setShowFilters] = useState(false);

  // 🔎 Avansert søk og filtrering
  const filteredPhotos = useMemo(() => {
    if (!Array.isArray(photos)) return [];
    
    let result = photos.filter((p) => {
      // Tekstsøk
      const matchesQuery =
        (p.name || "").toLowerCase().includes(query.toLowerCase()) ||
        (p.aiTags || []).some((t) =>
          t.toLowerCase().includes(query.toLowerCase())
        );

      // Type-filter
      let matchesFilter = true;
      if (filter === "favoritter") matchesFilter = p.favorite;
      else if (filter === "faces") matchesFilter = p.faces > 0;
      else if (filter === "ai") matchesFilter = (p.aiTags || []).length > 0;

      // Dato-filter
      let matchesDate = true;
      if (dateFilter !== "all" && p.createdAt) {
        const photoDate = new Date(p.createdAt);
        const now = new Date();
        const daysDiff = Math.floor((now - photoDate) / (1000 * 60 * 60 * 24));

        if (dateFilter === "today") matchesDate = daysDiff === 0;
        else if (dateFilter === "week") matchesDate = daysDiff <= 7;
        else if (dateFilter === "month") matchesDate = daysDiff <= 30;
        else if (dateFilter === "year") matchesDate = daysDiff <= 365;
      }

      return matchesQuery && matchesFilter && matchesDate;
    });

    return result;
  }, [photos, query, filter, dateFilter]);

  // Statistikk
  const stats = useMemo(() => ({
    total: photos.length,
    favorites: photos.filter(p => p.favorite).length,
    withAI: photos.filter(p => (p.aiTags || []).length > 0).length,
    withFaces: photos.filter(p => p.faces > 0).length,
  }), [photos]);

  return (
    <div className={`min-h-screen ${colors.text} bg-gradient-to-br ${colors.bg} p-6 md:p-10`}>
      {/* Header med statistikk */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-3">Mitt Galleri</h1>
        <div className="flex gap-3 flex-wrap text-sm opacity-70">
          <span>📸 {stats.total} bilder</span>
          <span>⭐ {stats.favorites} favoritter</span>
          <span>🤖 {stats.withAI} AI-tagget</span>
          <span>👤 {stats.withFaces} med ansikter</span>
        </div>
      </div>

      {/* Søk og filtre */}
      <div className="space-y-3 mb-8">
        {/* Hovedsøk */}
        <div className="relative">
          <Search className="absolute left-3 top-3 opacity-60 w-5 h-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Søk etter bilder, tags eller album..."
            className="w-full bg-white/10 pl-10 pr-12 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute right-3 top-3 opacity-60 hover:opacity-100"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filter-knapper */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2 rounded-xl transition ${
              showFilters ? "bg-purple-600" : "bg-white/10 hover:bg-white/20"
            }`}
          >
            🔧 Filtre
          </button>

          {["alle", "favoritter", "faces", "ai"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl transition ${
                filter === f
                  ? "bg-purple-600 text-white"
                  : "bg-white/10 hover:bg-white/20"
              }`}
            >
              {f === "alle" && "📂 Alle"}
              {f === "favoritter" && "⭐ Favoritter"}
              {f === "faces" && "👤 Ansikter"}
              {f === "ai" && "🤖 AI-tagget"}
            </button>
          ))}
        </div>

        {/* Avanserte filtre */}
        {showFilters && (
          <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-semibold">Dato</span>
            </div>
            <div className="flex gap-2 flex-wrap">
              {[
                { id: "all", label: "Alle" },
                { id: "today", label: "I dag" },
                { id: "week", label: "Siste uke" },
                { id: "month", label: "Siste måned" },
                { id: "year", label: "Siste år" },
              ].map((d) => (
                <button
                  key={d.id}
                  onClick={() => setDateFilter(d.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition ${
                    dateFilter === d.id
                      ? "bg-purple-600 text-white"
                      : "bg-white/10 hover:bg-white/20"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Aktive filtre */}
        {(filter !== "alle" || dateFilter !== "all" || query) && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm opacity-70">Aktive filtre:</span>
            {query && (
              <span className="px-3 py-1 bg-purple-600/30 rounded-full text-sm flex items-center gap-1">
                Søk: "{query}"
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => setQuery("")}
                />
              </span>
            )}
            {filter !== "alle" && (
              <span className="px-3 py-1 bg-purple-600/30 rounded-full text-sm flex items-center gap-1">
                {filter}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => setFilter("alle")}
                />
              </span>
            )}
            {dateFilter !== "all" && (
              <span className="px-3 py-1 bg-purple-600/30 rounded-full text-sm flex items-center gap-1">
                {dateFilter}
                <X
                  className="w-3 h-3 cursor-pointer"
                  onClick={() => setDateFilter("all")}
                />
              </span>
            )}
            <button
              onClick={() => {
                setQuery("");
                setFilter("alle");
                setDateFilter("all");
              }}
              className="text-sm text-purple-400 hover:text-purple-300"
            >
              Nullstill alle
            </button>
          </div>
        )}

        {/* Resultat-teller */}
        <p className="text-sm opacity-70">
          Viser {filteredPhotos.length} av {photos.length} bilder
        </p>
      </div>

      {/* 📁 ALBUMVISNING */}
      {Array.isArray(albums) && albums.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Folder className="w-5 h-5" />
            Album ({albums.length})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {albums.map((a) => {
              const albumPhotos = photos.filter((p) => p.albumId === a.id);
              const coverUrl = a.cover || albumPhotos[0]?.url || "";

              return (
                <div
                  key={a.id}
                  onClick={() => onAlbumOpen && onAlbumOpen(a)}
                  className="cursor-pointer bg-white/10 hover:bg-white/20 rounded-xl overflow-hidden transition group"
                >
                  {coverUrl ? (
                    <img
                      src={coverUrl}
                      alt={a.name}
                      className="w-full h-40 object-contain bg-gray-900 group-hover:scale-105 transition duration-300"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gray-800/50 flex items-center justify-center">
                      <Folder className="w-10 h-10 opacity-30" />
                    </div>
                  )}
                  <div className="p-3">
                    <p className="font-semibold truncate">{a.name || "Uten navn"}</p>
                    <p className="text-sm opacity-60">{albumPhotos.length} bilder</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 🖼️ BILDEVISNING */}
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <ImageIcon className="w-5 h-5" />
          {filter === "favoritter" ? "Favorittbilder" : "Alle bilder"}
        </h2>

        {filteredPhotos.length === 0 ? (
          <div className="text-center py-16 bg-white/5 rounded-2xl">
            <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="opacity-70">Ingen bilder funnet.</p>
            <p className="text-sm opacity-50 mt-1">Prøv å endre søket eller filtrene.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredPhotos.map((p, i) => (
              <div
                key={p.id}
                onClick={() => setPhotoModal({ open: true, index: i })}
                className="relative group cursor-pointer"
              >
                <img
                  src={p.url}
                  alt={p.name}
                  className="w-full h-48 object-contain bg-gray-900 rounded-xl transition-transform group-hover:scale-105 border border-gray-700"
                />

                {/* Favoritt-indikator */}
                {p.favorite && (
                  <div className="absolute top-2 right-2 bg-yellow-500/80 rounded-full p-1">
                    <Star className="w-4 h-4 text-white" fill="currentColor" />
                  </div>
                )}

                {/* AI tags */}
                {Array.isArray(p.aiTags) && p.aiTags.length > 0 && (
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {p.aiTags.slice(0, 2).join(", ")}
                    {p.aiTags.length > 2 && " …"}
                  </div>
                )}

                {/* Ansikter */}
                {p.faces > 0 && (
                  <div className="absolute top-2 left-2 bg-blue-500/80 text-white text-xs px-2 py-1 rounded">
                    👤 {p.faces}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 📸 Photo Modal (lysboks) */}
      {photoModal.open && (
        <PhotoModal
          photos={filteredPhotos}
          currentIndex={photoModal.index}
          onClose={() => setPhotoModal({ open: false, index: 0 })}
          onToggleFavorite={async (photo) => {
            const { toggleFavorite } = await import("../firebase");
            await toggleFavorite(photo.id, photo.favorite);
            if (refreshData) await refreshData();
          }}
        />
      )}
    </div>
  );
};

export default GalleryPage;