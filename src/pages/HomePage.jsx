// ============================================================================
// PAGE: HomePage.jsx – v2.1 med favoritt-seksjon og auto-refresh
// ============================================================================
import React, { useMemo, useState, useEffect } from "react";
import {
  Search,
  Filter,
  Image as ImageIcon,
  Folder,
  Star,
  UploadCloud,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import PhotoGrid from "../components/PhotoGrid";
import AlbumCard from "../components/AlbumCard";
import UploadModal from "../components/UploadModal";
import "../styles/home.css";

const sorters = {
  newest: (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0),
  oldest: (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0),
  name: (a, b) => (a.name || "").localeCompare(b.name || ""),
};

const HomePage = ({
  user,
  colors,
  refreshData,
  albums = [],
  photos = [],
  onOpenAlbum,
}) => {
  const [tab, setTab] = useState("albums");
  const [q, setQ] = useState("");
  const [sortKey, setSortKey] = useState("newest");
  const [showUpload, setShowUpload] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // fallback-timestamp for sortering
  useEffect(() => {
    albums.forEach((a) => {
      if (!a.createdAt) a.createdAt = new Date().toISOString();
    });
    photos.forEach((p) => {
      if (!p.createdAt) p.createdAt = new Date().toISOString();
    });
  }, [albums, photos]);

  // ⭐ NYTT: Favoritt-bilder
  const favoritePhotos = useMemo(
    () => (photos || []).filter((p) => p.favorite),
    [photos]
  );

  // 📸 Siste bilder
  const recentPhotos = useMemo(() => {
    return (photos || [])
      .filter((p) => !!p.url)
      .slice()
      .sort(
        (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
      )
      .slice(0, 12);
  }, [photos]);

  // 📂 Filtrerte album
  const filteredAlbums = useMemo(() => {
    const list = (albums || []).slice().sort(sorters[sortKey]);
    if (!q) return list;
    return list.filter((a) =>
      (a.name || "").toLowerCase().includes(q.toLowerCase())
    );
  }, [albums, q, sortKey]);

  // 🖼️ Bilder uten album
  const unassigned = useMemo(
    () => (photos || []).filter((p) => !p.albumId),
    [photos]
  );

  const filteredUnassigned = useMemo(() => {
    let list = unassigned.slice().sort(sorters[sortKey]);
    if (!q) return list;
    return list.filter((p) =>
      (p.name || "").toLowerCase().includes(q.toLowerCase())
    );
  }, [unassigned, q, sortKey]);

  // 🔄 Refresh-handler
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshData();
    } finally {
      setTimeout(() => setIsRefreshing(false), 800);
    }
  };

  return (
    <div className="home-wrap min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="glass rounded-2xl p-4 md:p-6 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5" />
          <h1 className="text-xl md:text-2xl font-semibold">
            Mine bilder og album
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`px-3 py-2 rounded-lg glass-sm flex items-center gap-2 ${
              isRefreshing ? "opacity-50 cursor-not-allowed" : ""
            }`}
            title="Oppdater"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
            <span className="hidden md:inline">
              {isRefreshing ? "Oppdaterer..." : "Oppdater"}
            </span>
          </button>
          <button
            onClick={() => setShowUpload(true)}
            className="px-3 py-2 rounded-lg glass-sm flex items-center gap-2"
            title="Last opp"
          >
            <UploadCloud className="w-4 h-4" />
            <span className="hidden md:inline">Last opp</span>
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="home-toolbar">
        <div className="glass rounded-2xl p-2 flex items-center gap-2">
          <button
            className={`px-3 py-2 rounded-lg flex items-center gap-2 transition ${
              tab === "albums" ? "bg-white/20 shadow" : ""
            }`}
            onClick={() => setTab("albums")}
          >
            <Folder className="w-4 h-4" /> Album
          </button>
          <button
            className={`px-3 py-2 rounded-lg flex items-center gap-2 transition ${
              tab === "unassigned" ? "bg-white/20 shadow" : ""
            }`}
            onClick={() => setTab("unassigned")}
          >
            <ImageIcon className="w-4 h-4" /> Løse bilder
          </button>
        </div>

        <div className="glass rounded-2xl p-2 flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10">
            <Search className="w-4 h-4" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Søk..."
              className="bg-transparent outline-none text-sm w-24 md:w-32"
            />
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10">
            <Filter className="w-4 h-4" />
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
              className="bg-transparent outline-none text-sm"
            >
              <option value="newest">Nyeste</option>
              <option value="oldest">Eldste</option>
              <option value="name">Navn</option>
            </select>
          </div>
        </div>
      </div>

      {/* Seksjoner */}
      <div className="home-sections mt-4">
        {/* ⭐ NYTT: Favoritter */}
        {favoritePhotos.length > 0 && (
          <div className="glass rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
              <h2 className="font-semibold">Favoritter</h2>
              <span className="text-xs text-gray-400">
                ({favoritePhotos.length})
              </span>
            </div>
            <div className="fav-row">
              {favoritePhotos.map((p) => (
                <img
                  key={p.id}
                  src={p.url}
                  alt={p.name || ""}
                  className="rounded-xl h-32 w-full object-contain bg-gray-900 cursor-pointer hover:scale-105 transition"
                  loading="lazy"
                  onClick={() => {
                    // Vis lightbox eller detaljer
                    console.log("Åpne favoritt:", p.name);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Sist opplastet */}
        {recentPhotos.length > 0 && (
          <div className="glass rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <UploadCloud className="w-4 h-4" />
              <h2 className="font-semibold">Sist opplastet</h2>
            </div>
            <div className="recent-row">
              {recentPhotos.map((p) => (
                <img
                  key={p.id}
                  src={p.url}
                  alt={p.name || ""}
                  className="rounded-xl h-28 w-full object-contain bg-gray-900"
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        )}

        {/* Album eller løse bilder */}
        {tab === "albums" ? (
          <div className="glass rounded-2xl p-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Folder className="w-4 h-4" />
              <h2 className="font-semibold">Album</h2>
            </div>
            {filteredAlbums.length ? (
              <div className="album-grid">
                {filteredAlbums.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => onOpenAlbum(a)}
                    className="cursor-pointer"
                  >
                    <AlbumCard album={a} photos={photos} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">Ingen album funnet.</div>
            )}
          </div>
        ) : (
          <div className="glass rounded-2xl p-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <ImageIcon className="w-4 h-4" />
              <h2 className="font-semibold">Bilder uten album</h2>
            </div>
            {filteredUnassigned.length ? (
              <PhotoGrid 
                photos={filteredUnassigned} 
                compact 
                refreshPhotos={refreshData}
              />
            ) : (
              <div className="empty-state">Ingen løse bilder funnet.</div>
            )}
          </div>
        )}
      </div>

      {/* UploadModal */}
      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          user={user}
          albums={albums}
          colors={colors}
          onUploadComplete={() => {
            refreshData();
            setShowUpload(false);
          }}
        />
      )}
    </div>
  );
};

export default HomePage;