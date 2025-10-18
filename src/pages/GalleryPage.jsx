// ============================================================================
// PAGE: GalleryPage.jsx – kombinert og feilsikker visning av album + bilder
// ============================================================================
import React, { useState, useMemo } from "react";
import { Search, Folder } from "lucide-react";

const GalleryPage = ({
  albums = [],
  photos = [],
  colors = {},
  onAlbumOpen,
  onPhotoClick,
}) => {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("alle");

  // 🔎 Søk og filtrering
  const filteredPhotos = useMemo(() => {
    if (!Array.isArray(photos)) return [];
    return photos.filter((p) => {
      const matchesQuery =
        (p.name || "")
          .toLowerCase()
          .includes(query.toLowerCase()) ||
        (p.aiTags || []).some((t) =>
          t.toLowerCase().includes(query.toLowerCase())
        );

      if (filter === "favoritter") return p.favorite && matchesQuery;
      if (filter === "faces") return p.faces > 0 && matchesQuery;
      if (filter === "ai") return (p.aiTags || []).length > 0 && matchesQuery;
      return matchesQuery;
    });
  }, [photos, query, filter]);

  return (
    <div
      className={`min-h-screen ${colors.text} bg-gradient-to-br ${colors.bg} p-6 md:p-10`}
    >
      <h1 className="text-3xl font-bold mb-6">Mitt Galleri</h1>

      {/* 🔍 Søkefelt og filter */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-3 opacity-60" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Søk etter bilder eller tags..."
          className="w-full bg-white/10 pl-10 pr-4 py-2 rounded-xl focus:outline-none"
        />
        <button
          onClick={() =>
            setFilter(
              filter === "alle"
                ? "favoritter"
                : filter === "favoritter"
                ? "faces"
                : filter === "faces"
                ? "ai"
                : "alle"
            )
          }
          className="absolute right-3 top-2 text-sm px-3 py-1 bg-pink-600 rounded-xl hover:bg-pink-700 transition"
        >
          {filter === "alle"
            ? "Alle"
            : filter === "favoritter"
            ? "Favoritter"
            : filter === "faces"
            ? "Med ansikter"
            : "AI-tagget"}
        </button>
      </div>

      {/* 📁 ALBUMVISNING */}
      {Array.isArray(albums) && albums.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-3">Album</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {albums.map((a) => (
              <div
                key={a.id}
                onClick={() => onAlbumOpen && onAlbumOpen(a)}
                className="cursor-pointer bg-white/10 hover:bg-white/20 rounded-xl p-4 flex flex-col items-center transition"
              >
                <Folder className="w-10 h-10 mb-2" />
                <p className="font-semibold">{a.name || "Uten navn"}</p>
               <p className="text-sm opacity-60">
  {photos.filter((p) => p.albumId === a.id).length} bilder
</p>

              </div>
            ))}
          </div>
        </section>
      )}

      {/* 🖼️ BILDEVISNING */}
      <section>
        <h2 className="text-xl font-semibold mb-3">Alle bilder</h2>
        {filteredPhotos.length === 0 ? (
          <p className="opacity-70">Ingen bilder funnet.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {filteredPhotos.map((p) => (
              <div
                key={p.id}
                onClick={() => onPhotoClick && onPhotoClick(p)}
                className="relative group cursor-pointer"
              >
                <img
                  src={p.url}
                  alt={p.name}
                  className="w-full h-48 object-cover rounded-xl transition-transform group-hover:scale-105"
                />
                {Array.isArray(p.aiTags) && p.aiTags.length > 0 && (
                  <div className="absolute bottom-2 left-2 bg-black/50 text-xs px-2 py-1 rounded">
                    {p.aiTags.slice(0, 2).join(", ")}
                    {p.aiTags.length > 2 && " …"}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default GalleryPage;
