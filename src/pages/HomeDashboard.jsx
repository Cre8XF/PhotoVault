// ============================================================================
// PAGE: HomeDashboard.jsx – v4.1 med LazyImage + i18n
// ============================================================================
import React, { useMemo } from "react";
import { addAlbum } from "../firebase";
import UploadModal from "../components/UploadModal";
import { useState } from "react";
import {
  Star,
  Clock,
  Sparkles,
  Calendar,
  Users,
  FolderOpen,
  Wand2,
  ImagePlus,
  Scan
} from "lucide-react";
import LazyImage from "../components/LazyImage";
import { useTranslation } from "react-i18next";

const HomeDashboard = ({ albums, photos, colors, user, onNavigate, refreshData }) => {
  const { t } = useTranslation(["common", "home"]);
  const [isUploadOpen, setUploadOpen] = useState(false);   // ← manglet
  const handleUpload = () => {};                           // ← placeholder (hindrer feil)


  const stats = useMemo(
    () => ({
      total: photos.length,
      favorites: photos.filter((p) => p.favorite).length,
      recent: photos.filter((p) => {
        const daysDiff =
          Math.floor((Date.now() - new Date(p.createdAt)) / (1000 * 60 * 60 * 24));
        return daysDiff <= 1;
      }).length,
      unassigned: photos.filter((p) => !p.albumId).length,
      withFaces: photos.filter((p) => p.faces > 0).length
    }),
    [photos]
  );

  const favoritePhotos = useMemo(
    () => photos.filter((p) => p.favorite).slice(0, 8),
    [photos]
  );

  const recentPhotos = useMemo(
    () =>
      [...photos]
        .sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        )
        .slice(0, 12),
    [photos]
  );

  const smartAlbums = [
    {
      id: "last30days",
      icon: Calendar,
      name: t("home:last30days"),
      count: photos.filter((p) => {
        const daysDiff =
          Math.floor((Date.now() - new Date(p.createdAt)) / (1000 * 60 * 60 * 24));
        return daysDiff <= 30;
      }).length,
      color: "from-blue-500 to-cyan-500"
    },
    {
      id: "withFaces",
      icon: Users,
      name: t("home:withFaces"),
      count: stats.withFaces,
      color: "from-pink-500 to-rose-500"
    },
    {
      id: "unassigned",
      icon: FolderOpen,
      name: t("home:unassigned"),
      count: stats.unassigned,
      color: "from-amber-500 to-orange-500"
    }
  ];
  const handleCreateAlbum = async (name) => {
const newAlbum = {
  id: Date.now().toString(),
  name: String(name).trim(), // ← tvinger konvertering til tekst
  title: name,  // ← legg til dette for å matche Firestore-felt
  createdAt: new Date().toISOString(),
  coverUrl: "",
  photoCount: 0,
  userId: user?.uid || "guest",
};


  try {
    await addAlbum(newAlbum);
    await refreshData(); // oppdater listen etterpå
  } catch (error) {
    console.error("Feil ved oppretting av nytt album:", error);
    alert("Kunne ikke opprette album. Prøv igjen.");
  }
};

  return (
    <div className="min-h-screen p-6 md:p-10 animate-fade-in">
      {/* Hero-velkomst */}
      <section className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-7 h-7 text-yellow-400 animate-float" />
          <h1 className="text-3xl md:text-4xl font-bold">
            {t("home:greeting", {
              name:
                user?.displayName || user?.email?.split("@")[0] || t("home:user")
            })}
          </h1>
        </div>
        {stats.recent > 0 && (
          <p className="text-lg opacity-80">
            {stats.recent}{" "}
            {stats.recent === 1 ? t("home:newPhoto") : t("home:newPhotos")}{" "}
            {t("home:sinceYesterday")}
          </p>
        )}
      </section>

      {/* Favoritter */}
      {favoritePhotos.length > 0 && (
        <section className="mb-10 animate-scale-in">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-400" fill="currentColor" />
              {t("home:favoritesTitle")}
            </h2>
            <button
              onClick={() => onNavigate("search")}
              className="ripple-effect text-sm text-purple-400 hover:text-purple-300 transition"
            >
              {t("common:seeAll")} ({stats.favorites}) →
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {favoritePhotos.map((photo, i) => (
              <div
                key={photo.id}
                className={`relative group cursor-pointer animate-scale-in stagger-${
                  (i % 4) + 1
                }`}
                onClick={() => onNavigate("search")}
              >
                <LazyImage
                  src={photo.url}
                  thumbnail={photo.thumbnailSmall}
                  photoId={photo.id}
                  alt={photo.name || ""}
                  className="w-full h-40 object-contain bg-gray-900 rounded-xl transition-transform duration-300 group-hover:scale-105 border border-white/10"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                <Star
                  className="absolute top-2 right-2 w-5 h-5 text-yellow-400"
                  fill="currentColor"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Siste opplastninger */}
      {recentPhotos.length > 0 && (
        <section className="mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Clock className="w-6 h-6 text-purple-400" />
              {t("home:recentUploads")}
            </h2>
            <button
              onClick={() => onNavigate("albums")}
              className="ripple-effect text-sm text-purple-400 hover:text-purple-300 transition"
            >
              {t("common:seeAll")} →
            </button>
          </div>
          <div className="overflow-x-auto">
            <div className="flex gap-4 pb-4">
              {recentPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="flex-shrink-0 w-48 cursor-pointer group"
                  onClick={() => onNavigate("albums")}
                >
                  <LazyImage
                    src={photo.url}
                    thumbnail={photo.thumbnailSmall}
                    photoId={photo.id}
                    alt={photo.name || ""}
                    className="w-full h-48 object-contain bg-gray-900 rounded-xl transition-transform duration-300 group-hover:scale-105 border border-white/10"
                  />
                  {photo.name && (
                    <p className="mt-2 text-sm truncate opacity-70">
                      {photo.name}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Smarte album */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-400" />
          {t("home:smartAlbums")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {smartAlbums.map((album) => (
            <button
              key={album.id}
              onClick={() => onNavigate("search")}
              className="ripple-effect glass p-6 rounded-2xl text-left hover:scale-105 transition-transform group"
            >
              <div
                className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${album.color} mb-3`}
              >
                <album.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-1">{album.name}</h3>
              <p className="text-sm opacity-70">
                {album.count} {album.count === 1 ? t("common:photo") : t("common:photos")}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* AI-verktøy */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Wand2 className="w-6 h-6 text-purple-400" />
          {t("home:aiTools")}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <button className="ripple-effect glass p-4 rounded-xl hover:bg-white/15 transition flex items-center gap-3">
            <div className="p-2 bg-purple-600/30 rounded-lg">
              <Scan className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm">{t("home:autoSortTitle")}</p>
              <p className="text-xs opacity-70">{t("home:autoSortDesc")}</p>
            </div>
          </button>

          <button className="ripple-effect glass p-4 rounded-xl hover:bg-white/15 transition flex items-center gap-3">
            <div className="p-2 bg-blue-600/30 rounded-lg">
              <ImagePlus className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm">{t("home:enhanceTitle")}</p>
              <p className="text-xs opacity-70">{t("home:enhanceDesc")}</p>
            </div>
          </button>

          <button
            onClick={() => onNavigate("more")}
            className="ripple-effect glass p-4 rounded-xl hover:bg-white/15 transition flex items-center gap-3"
          >
            <div className="p-2 bg-pink-600/30 rounded-lg">
              <Wand2 className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm">{t("home:moreAI")}</p>
              <p className="text-xs opacity-70">{t("home:viewAllTools")}</p>
            </div>
          </button>
        </div>
      </section>

      <button
  onClick={() => setUploadOpen(true)}
  className="ripple-effect glass p-4 rounded-xl hover:bg-white/15 transition flex items-center gap-3 mt-6"
>
  <ImagePlus className="w-5 h-5 text-purple-400" />
  <span>Last opp bilder / Opprett nytt album</span>
</button>


      {/* Quick stats */}
      <section className="glass p-6 rounded-2xl">
        <h3 className="font-semibold mb-4 opacity-70">{t("home:quickOverview")}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-2xl font-bold">{albums.length}</p>
            <p className="text-sm opacity-70">{t("common:albums")}</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm opacity-70">{t("common:photos")}</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.favorites}</p>
            <p className="text-sm opacity-70">{t("common:favorites")}</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{stats.unassigned}</p>
            <p className="text-sm opacity-70">{t("common:unassigned")}</p>
          </div>
        </div>
      </section>
      {/* Upload Modal */}
<UploadModal
  isOpen={isUploadOpen}
  onClose={() => setUploadOpen(false)}
  onUpload={handleUpload}
  onCreateAlbum={handleCreateAlbum}
  albums={albums}
/>

    </div>
    
  );
};

export default HomeDashboard;
