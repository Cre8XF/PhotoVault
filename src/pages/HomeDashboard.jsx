// ============================================================================
// PAGE: HomeDashboard.jsx – FREE USER OPTIMIZED v5.0
// ============================================================================
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addAlbum } from "../firebase";
import { auth } from "../firebase";
import UploadModal from "../components/UploadModal";
import { SkeletonCard, SkeletonPhoto } from "../components/SkeletonCard";
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
import logoLight from "../assets/logo_light.png";
import logoDark from "../assets/logo_dark.png";

const HomeDashboard = ({ albums, photos, colors, user, refreshData, onUpload, onPhotoClick }) => {
  const navigate = useNavigate();
  const { t } = useTranslation(["common", "home"]);
  const [isUploadOpen, setUploadOpen] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Determine user plan (default to "free" if not set)
  const plan = user?.plan || "free";
  const isFreeUser = plan === "free";

  // Track initial data loading
  useEffect(() => {
    // Show skeleton until we have data or after a timeout
    if ((albums && albums.length > 0) || (photos && photos.length > 0)) {
      setIsInitialLoading(false);
    } else {
      // Set timeout to hide skeleton after 2 seconds even if no data
      const timer = setTimeout(() => setIsInitialLoading(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [albums, photos]);

  const stats = useMemo(
    () => {
      const safePhotos = Array.isArray(photos) ? photos : [];
      return {
        total: safePhotos.length,
        favorites: safePhotos.filter((p) => p.favorite).length,
        recent: safePhotos.filter((p) => {
          const daysDiff =
            Math.floor((Date.now() - new Date(p.createdAt)) / (1000 * 60 * 60 * 24));
          return daysDiff <= 1;
        }).length,
        unassigned: safePhotos.filter((p) => !p.albumId).length,
        withFaces: safePhotos.filter((p) => p.faces > 0).length
      };
    },
    [photos]
  );

  const favoritePhotos = useMemo(
    () => {
      const safePhotos = Array.isArray(photos) ? photos : [];
      // Limit favorites to 6 for free users, 8 for others
      const limit = isFreeUser ? 6 : 8;
      return safePhotos.filter((p) => p.favorite).slice(0, limit);
    },
    [photos, isFreeUser]
  );

  const recentPhotos = useMemo(
    () => {
      const safePhotos = Array.isArray(photos) ? photos : [];
      return [...safePhotos]
        .sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        )
        .slice(0, 12);
    },
    [photos]
  );

  const safePhotosForSmartAlbums = Array.isArray(photos) ? photos : [];

  // Smart albums - filter based on plan
  const smartAlbums = useMemo(() => {
    const allAlbums = [
      {
        id: "last30days",
        icon: Calendar,
        name: t("home:last30days"),
        count: safePhotosForSmartAlbums.filter((p) => {
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
        color: "from-pink-500 to-rose-500",
        planRequired: ["lite", "pro", "admin"] // Not available for free
      },
      {
        id: "unassigned",
        icon: FolderOpen,
        name: t("home:unassigned"),
        count: stats.unassigned,
        color: "from-amber-500 to-orange-500"
      }
    ];

    // Filter out albums that require a plan the user doesn't have
    return allAlbums.filter(album =>
      !album.planRequired || album.planRequired.includes(plan)
    );
  }, [safePhotosForSmartAlbums, stats, t, plan]);

  // Handler for smart album navigation
  const handleSmartAlbumClick = (albumId) => {
    switch (albumId) {
      case "last30days":
        navigate("/search?range=30days");
        break;
      case "withFaces":
        navigate("/search?faces=true");
        break;
      case "unassigned":
        navigate("/search?unassigned=true");
        break;
      default:
        navigate("/search");
    }
  };

  const handleCreateAlbum = async (albumData) => {
    try {
      // Album already created by UploadModal - just refresh UI
      if (refreshData) await refreshData();
    } catch (error) {
      console.error(t("home:albumCreationError"), error);
      alert(t("home:couldNotCreateAlbum"));
    }
  };

  return (
    <div className="min-h-screen p-6 md:p-10 animate-fade-in pb-20 md:pb-10">
      {/* Hero-velkomst with PIXTR Logo */}
      <section className="mb-5 md:mb-8 free-hero">
        <div className="flex items-center gap-3 mb-2">
          <img
            src={logoLight}
            alt="PIXTR"
            className="w-8 h-8 object-contain"
          />
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

      {/* Loading Skeletons */}
      {isInitialLoading ? (
        <>
          <section className="mb-10">
            <div className="h-8 w-48 bg-white/10 rounded mb-4 skeleton-premium" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array(8).fill(0).map((_, i) => (
                <SkeletonPhoto key={i} />
              ))}
            </div>
          </section>
          <section className="mb-10">
            <div className="h-8 w-56 bg-white/10 rounded mb-4 skeleton-premium" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array(8).fill(0).map((_, i) => (
                <SkeletonPhoto key={i} />
              ))}
            </div>
          </section>
        </>
      ) : (
        <>
          {/* Favoritter */}
          {favoritePhotos.length > 0 && (
        <section className="mb-6 md:mb-10 animate-scale-in free-section">
          <div className="flex justify-between items-center mb-3 md:mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-400" fill="currentColor" />
              {t("home:favoritesTitle")}
            </h2>
            <button
              onClick={() => navigate("/search?favorites=true")}
              className="ripple-effect text-sm text-purple-400 hover:text-purple-300 transition whitespace-nowrap flex items-center"
            >
              {t("common:seeAll", { count: stats.favorites })} →
            </button>
          </div>
          <div className={`grid grid-cols-2 md:grid-cols-${isFreeUser ? '3' : '4'} gap-3 md:gap-4`}>
            {favoritePhotos.map((photo, i) => {
              // Limit stagger animation to 3 for free users
              const staggerClass = isFreeUser && i >= 3 ? 'stagger-3' : `stagger-${(i % 4) + 1}`;
              return (
                <div
                  key={photo.id}
                  className={`relative group cursor-pointer animate-scale-in ${staggerClass} free-thumbnail`}
                  onClick={() => onPhotoClick(photo, favoritePhotos)}
                >
                  <LazyImage
                    src={photo.type === 'video' ? (photo.thumbnailUrl || photo.url) : photo.url}
                    thumbnail={photo.thumbnailSmall}
                    photoId={photo.id}
                    alt={photo.name || t("common:photo")}
                    className="w-full h-36 md:h-40 object-contain bg-gray-900 rounded-xl transition-transform duration-300 group-hover:scale-105 border border-white/10 free-fav-thumb"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl" />
                  <Star
                    className="absolute top-2 right-2 w-5 h-5 text-yellow-400"
                    fill="currentColor"
                  />
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Siste opplastninger */}
      {recentPhotos.length > 0 && (
        <section className="mb-6 md:mb-10 free-section">
          <div className="flex justify-between items-center mb-3 md:mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2 whitespace-nowrap">
              <Clock className="w-6 h-6 text-purple-400" />
              {t("home:recentUploads")}
            </h2>
            <button
              onClick={() => navigate("/search?recent=true")}
              className="ripple-effect text-sm text-purple-400 hover:text-purple-300 transition whitespace-nowrap flex items-center ml-2"
            >
              {t("common:seeAll", { count: recentPhotos.length })} →
            </button>
          </div>
          <div className="overflow-x-auto">
            <div className="flex gap-4 pb-4">
              {recentPhotos.map((photo, index) => {
                // Limit stagger animation to 3 for free users
                const staggerClass = isFreeUser && index >= 3 ? 'stagger-3' : `stagger-${(index % 12) + 1}`;
                return (
                  <div
                    key={photo.id}
                    className={`flex-shrink-0 w-32 md:w-48 cursor-pointer group animate-fade-in-up ${staggerClass} free-thumbnail free-recent-thumb`}
                    onClick={() => onPhotoClick(photo, recentPhotos)}
                  >
                    <LazyImage
                      src={photo.type === 'video' ? (photo.thumbnailUrl || photo.url) : photo.url}
                      thumbnail={photo.thumbnailSmall}
                      photoId={photo.id}
                      alt={photo.name || t("common:photo")}
                      className="w-full h-32 md:h-48 object-contain bg-gray-900 rounded-xl transition-transform duration-300 group-hover:scale-105 border border-white/10"
                    />
                    {photo.name && (
                      <p className="mt-2 text-sm truncate opacity-70">
                        {photo.name}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Upload Button - Moved here for FREE users (primary action) */}
      <button
        onClick={() => setUploadOpen(true)}
        className="ripple-effect glass p-4 md:p-5 rounded-xl hover:bg-white/15 transition flex items-center justify-center gap-3 mb-6 md:mb-10 w-full bg-purple-600/20 border-2 border-purple-500/30 hover:border-purple-400/50 free-upload-btn"
      >
        <ImagePlus className="w-5 h-5 md:w-6 md:h-6 text-purple-400" />
        <span className="font-semibold text-base md:text-lg">{t("home:uploadOrCreateAlbum")}</span>
      </button>

      {/* Smarte album */}
      <section className="mb-6 md:mb-10 free-section">
        <h2 className="text-2xl font-bold mb-3 md:mb-4 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-purple-400" />
          {t("home:smartAlbums")}
        </h2>
        <div className={`grid grid-cols-1 md:grid-cols-${isFreeUser ? '2' : '3'} gap-3 md:gap-4`}>
          {smartAlbums.map((album, index) => {
            // Limit stagger to 3 for free users
            const staggerClass = isFreeUser && index >= 3 ? 'stagger-3' : `stagger-${index + 1}`;
            return (
              <button
                key={album.id}
                onClick={() => handleSmartAlbumClick(album.id)}
                className={`ripple-effect glass p-4 md:p-6 rounded-2xl text-left hover:scale-105 transition-transform group animate-fade-in-up ${staggerClass} free-shadow free-smart-card`}
              >
                <div
                  className={`inline-flex p-2 md:p-3 rounded-xl bg-gradient-to-br ${album.color} mb-2 md:mb-3`}
                >
                  <album.icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                </div>
                <h3 className="font-semibold text-lg mb-1">{album.name}</h3>
                <p className="text-sm opacity-70">
                  {album.count} {album.count === 1 ? t("common:photo") : t("common:photos")}
                </p>
              </button>
            );
          })}
        </div>
      </section>
        </>
      )}

      {/* AI-verktøy - HIDDEN for FREE users */}
      {!isFreeUser && (
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
      )}

      {/* Quick stats - Reduced padding for FREE users */}
      <section className={`glass ${isFreeUser ? 'p-4' : 'p-6'} rounded-2xl free-overview`}>
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
        onUpload={onUpload}
        onCreateAlbum={handleCreateAlbum}
        albums={albums}
      />
    </div>
  );
};

export default HomeDashboard;
