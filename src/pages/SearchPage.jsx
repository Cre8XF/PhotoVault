// ============================================================================
// PAGE: SearchPage.jsx – v5.1 med AI-søk og flytt-funksjon
// ============================================================================
import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { getFirestore, doc, updateDoc } from "firebase/firestore";

import {
  Search,
  X,
  Calendar,
  Tag,
  Star,
  Users,
  Folder,
  SlidersHorizontal,
  Sparkles,
  Move,
} from "lucide-react";
import PhotoGridOptimized from "../components/PhotoGridOptimized";
import MoveModal from "../components/MoveModal";

const SearchPage = ({ photos, albums, onPhotoClick, toggleFavorite, refreshData }) => {
  const { t } = useTranslation(["common", "albums"]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [isMoveOpen, setMoveOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    favorites: false,
    withFaces: false,
    withTags: false,
    aiAnalyzed: false,
    dateRange: null,
    albumId: null,
    category: null,
  });
  const [showFilters, setShowFilters] = useState(false);

  // ✨ Finn unike kategorier
  const categories = useMemo(() => {
    const cats = new Set();
    photos.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return Array.from(cats).sort();
  }, [photos]);

  // ✨ Finn populære AI-tags
  const popularTags = useMemo(() => {
    const tagCount = {};
    photos.forEach((p) => {
      if (p.aiTags) {
        p.aiTags.forEach((tag) => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      }
    });
    return Object.entries(tagCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([tag, count]) => ({ tag, count }));
  }, [photos]);

  // ✨ Filtrering og søk
  const filteredPhotos = useMemo(() => {
    let results = photos;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter((photo) => {
        const nameMatch = photo.name?.toLowerCase().includes(query);
        const tagsMatch = photo.aiTags?.some((tag) => tag.toLowerCase().includes(query));
        const categoryMatch = photo.category?.toLowerCase().includes(query);
        return nameMatch || tagsMatch || categoryMatch;
      });
    }
    if (activeFilters.favorites) results = results.filter((p) => p.favorite);
    if (activeFilters.withFaces) results = results.filter((p) => p.faces > 0);
    if (activeFilters.withTags) results = results.filter((p) => p.aiTags?.length > 0);
    if (activeFilters.aiAnalyzed) results = results.filter((p) => p.aiAnalyzed);
    if (activeFilters.category)
      results = results.filter((p) => p.category === activeFilters.category);
    if (activeFilters.albumId)
      results = results.filter((p) => p.albumId === activeFilters.albumId);
    if (activeFilters.dateRange) {
      const now = Date.now();
      const ranges = { today: 1, week: 7, month: 30, year: 365 };
      const days = ranges[activeFilters.dateRange];
      if (days) {
        const cutoff = now - days * 24 * 60 * 60 * 1000;
        results = results.filter((p) => new Date(p.createdAt).getTime() >= cutoff);
      }
    }
    return results;
  }, [photos, searchQuery, activeFilters]);

  const activeFilterCount = Object.values(activeFilters).filter(Boolean).length;

  return (
    <div className="min-h-screen p-6 md:p-10 pb-24 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t("common:search")}</h1>
        {selectedPhotos.length > 0 && (
          <button
            onClick={() => setMoveOpen(true)}
            className="ripple-effect px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            <Move size={18} /> Flytt til album
          </button>
        )}
      </div>

      {/* Søkefelt */}
      <div className="glass rounded-2xl p-4 mb-6">
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 opacity-50" />
          <input
            type="text"
            placeholder={t("albums:searchPlaceholder")}
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

      {/* Resultater */}
      {filteredPhotos.length > 0 ? (
        <PhotoGridOptimized
          photos={filteredPhotos}
          onPhotoClick={onPhotoClick}
          selectedPhotos={selectedPhotos}
          setSelectedPhotos={setSelectedPhotos}
        />
      ) : (
        <div className="text-center py-20 opacity-60">
          <Search className="w-16 h-16 mx-auto mb-4" />
          <p>{t("albums:noPhotosFound")}</p>
        </div>
      )}

      {/* Flytt til album-modal */}
     <MoveModal
  isOpen={isMoveOpen}
  onClose={() => setMoveOpen(false)}
  albums={albums}
  onConfirm={async (albumId) => {
  try {
    const db = getFirestore();

    const updates = selectedPhotos
      .filter(Boolean)
      .map(async (photo) => {
        const photoId = typeof photo === "string" ? photo : photo.id || photo.docId;
        if (!photoId) return console.warn("Mangler id for:", photo);
        const photoRef = doc(db, "photos", photoId);
        await updateDoc(photoRef, { albumId });
      });

    await Promise.all(updates);
    console.log(`Flyttet ${selectedPhotos.length} bilder til album ${albumId}`);

    if (refreshData) await refreshData();
    setSelectedPhotos([]);
  } catch (error) {
    console.error("Feil ved flytting:", error);
    alert("Kunne ikke flytte alle bildene. Sjekk konsollen for detaljer.");
  }
}}
  />

    </div>
  );
};

export default SearchPage;
