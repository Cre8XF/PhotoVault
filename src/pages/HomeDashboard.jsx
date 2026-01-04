// ============================================================================
// PAGE: HomeDashboard.jsx – FREE USER OPTIMIZED v5.0
// ============================================================================
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { addAlbum } from "../firebase";
import { auth } from "../firebase";
import UploadModal from "../components/UploadModal";
import Button from "../components/Button";
import Loading from "../components/Loading";
import {
  Star,
  Clock,
  Sparkles,
  Calendar,
  Users,
  FolderOpen,
  Wand2,
  ImagePlus,
  Scan,
  Heart,
  Upload,
  FolderPlus,
  Image
} from "lucide-react";
import LazyImage from "../components/LazyImage";
import { useTranslation } from "react-i18next";
import logoLight from "../assets/logo_light.png";
import logoDark from "../assets/logo_dark.png";
import { usePullToRefresh } from "../hooks/usePullToRefresh";
import EmptyState from "../components/EmptyState";
import ScrollToTop from "../components/ScrollToTop";
import QuickActionsBar from "../components/QuickActionsBar";
import HomeMemoriesWidget from "../components/HomeMemoriesWidget";
import TimeGroupSection from "../components/TimeGroupSection";
import CollageTeaser from "../components/CollageTeaser";
import StatsCard from "../components/StatsCard";
import ActivityFeed from "../components/ActivityFeed";
import TipsCarousel from "../components/TipsCarousel";
import { Chip } from "../components/Chip";
import { groupPhotosByTime } from "../utils/groupPhotosByTime";
import "../styles/emptyState.css";
import "../styles/scrollToTop.css";
import "../styles/quickActions.css";
import "../styles/memories.css";
import "../styles/timeGroups.css";
import "../styles/collageTeaser.css";

const HomeDashboard = ({ albums, photos, colors, user, refreshData, onUpload, onPhotoClick }) => {
  const navigate = useNavigate();
  const { t } = useTranslation(["common", "home"]);
  const [isUploadOpen, setUploadOpen] = useState(false);
  const [uploadMode, setUploadMode] = useState('upload'); // 'upload' or 'album'
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [selectedTags, setSelectedTags] = useState([]);

  // ✅ DEFENSIVE GUARD: Prevent render before user is ready (mobile resume stability)
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Determine user plan (default to "free" if not set)
  const plan = user?.plan || "free";
  const isFreeUser = plan === "free";

  // Pull-to-refresh functionality
  const { isPulling, pullDistance, handlers } = usePullToRefresh(
    async () => {
      await refreshData();
    },
    80
  );

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

  // Get all unique tags
  const allTags = useMemo(() => {
    const safePhotos = Array.isArray(photos) ? photos : []
    const tagSet = new Set()
    safePhotos.forEach((photo) => {
      if (photo.tags && Array.isArray(photo.tags)) {
        photo.tags.forEach((tag) => tagSet.add(tag))
      }
    })
    return Array.from(tagSet).sort()
  }, [photos])

  // Filter photos by tags (AND logic - all selected tags must match)
  const filteredPhotosByTags = useMemo(() => {
    const safePhotos = Array.isArray(photos) ? photos : []
    if (selectedTags.length === 0) return safePhotos

    return safePhotos.filter((photo) => {
      if (!photo.tags || !Array.isArray(photo.tags)) return false
      return selectedTags.every((tag) => photo.tags.includes(tag))
    })
  }, [photos, selectedTags])

  const stats = useMemo(
    () => {
      const safePhotos = Array.isArray(filteredPhotosByTags) ? filteredPhotosByTags : [];
      // ✅ EXCLUDE DOCUMENTS: Only count images and videos
      const mediaOnly = safePhotos.filter((p) => p.type !== 'document');
      return {
        total: mediaOnly.length,
        favorites: mediaOnly.filter((p) => p.favorite).length,
        recent: mediaOnly.filter((p) => {
          const daysDiff =
            Math.floor((Date.now() - new Date(p.createdAt)) / (1000 * 60 * 60 * 24));
          return daysDiff <= 1;
        }).length,
        unassigned: mediaOnly.filter((p) => !p.albumId).length,
        withFaces: mediaOnly.filter((p) => p.faces > 0).length
      };
    },
    [filteredPhotosByTags]
  );

  const favoritePhotos = useMemo(
    () => {
      const safePhotos = Array.isArray(filteredPhotosByTags) ? filteredPhotosByTags : [];
      // ✅ EXCLUDE DOCUMENTS: Only show image/video favorites
      const mediaOnly = safePhotos.filter((p) => p.type !== 'document');
      // Limit favorites to 6 for compact view
      const limit = 6;
      return mediaOnly.filter((p) => p.favorite).slice(0, limit);
    },
    [filteredPhotosByTags]
  );

  // Group recent photos by time periods
  const timeGroups = useMemo(() => {
    if (!filteredPhotosByTags || filteredPhotosByTags.length === 0) {
      return []
    }

    // ✅ EXCLUDE DOCUMENTS: Only show images and videos in recent uploads
    const mediaOnly = filteredPhotosByTags.filter(p => p.type !== 'document');

    // Get recent photos (last 50, sorted by date)
    const recent = mediaOnly
      .filter(p => p.createdAt || p.dateTaken)
      .sort((a, b) => {
        const dateA = a.dateTaken?.toMillis?.() || a.createdAt?.toMillis?.() || new Date(a.createdAt || 0).getTime()
        const dateB = b.dateTaken?.toMillis?.() || b.createdAt?.toMillis?.() || new Date(b.createdAt || 0).getTime()
        return dateB - dateA
      })
      .slice(0, 50) // Max 50 recent photos

    return groupPhotosByTime(recent)
  }, [filteredPhotosByTags]);

  const safePhotosForSmartAlbums = Array.isArray(photos) ? photos : [];

  // Smart albums - filter based on plan
  const smartAlbums = useMemo(() => {
    // ✅ EXCLUDE DOCUMENTS: Smart albums only count media
    const mediaOnly = safePhotosForSmartAlbums.filter((p) => p.type !== 'document');

    const allAlbums = [
      {
        id: "last30days",
        icon: Calendar,
        name: t("home:last30days"),
        count: mediaOnly.filter((p) => {
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
    <div
      className="min-h-screen p-6 md:p-10 animate-fade-in pb-20 md:pb-10"
      {...handlers}
    >
      {/* Pull indicator */}
      {isPulling && (
        <div
          className="pull-indicator"
          style={{
            transform: `translateY(${Math.min(pullDistance, 80)}px)`,
            opacity: Math.min(pullDistance / 80, 1)
          }}
        >
          <div className="spinner-small" />
          <span>{t('home:pullToRefresh')}</span>
        </div>
      )}

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

      {/* Stats Card */}
      {!isInitialLoading && <StatsCard />}

      {/* Tips Carousel */}
      {!isInitialLoading && <TipsCarousel />}

      {/* Activity Feed */}
      {!isInitialLoading && <ActivityFeed />}

      {/* Tag Filter Section */}
      {!isInitialLoading && allTags.length > 0 && (
        <section className="mb-5 md:mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="text-purple">🏷️</span>
              Filtrer på tags
            </h3>
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="text-sm text-purple hover:underline"
              >
                Fjern filter ({selectedTags.length})
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {allTags.map((tag) => (
              <Chip
                key={tag}
                variant="filter"
                active={selectedTags.includes(tag)}
                onClick={() => {
                  setSelectedTags((prev) =>
                    prev.includes(tag)
                      ? prev.filter((t) => t !== tag)
                      : [...prev, tag]
                  )
                }}
              >
                {tag}
              </Chip>
            ))}
          </div>
        </section>
      )}

      {/* Memories Widget - "On This Day" */}
      {!isInitialLoading && (
        <HomeMemoriesWidget
          photos={filteredPhotosByTags}
          onPhotoClick={onPhotoClick}
          onViewAll={() => navigate('/timeline')}
        />
      )}

      {/* Quick Actions Bar */}
      {!isInitialLoading && (
        <QuickActionsBar
          onUpload={() => {
            console.log('📤 QUICK ACTION: LAST OPP');
            setUploadMode('upload');
            setUploadOpen(true);
          }}
          onNewAlbum={() => {
            console.log('═══════════════════════════════════════');
            console.log('📁 QUICK ACTION: NYTT ALBUM');
            console.log('═══════════════════════════════════════');
            console.log('Setting upload mode to: album');
            console.log('Opening UploadModal with AlbumModal auto-open');
            console.log('═══════════════════════════════════════');
            setUploadMode('album');
            setUploadOpen(true);
          }}
          onCreateCollage={() => {
            console.log('═══════════════════════════════════════');
            console.log('🎨 QUICK ACTION: LAG KOLLASJ');
            console.log('═══════════════════════════════════════');
            console.log('Starting from:', window.location.pathname);
            console.log('History length:', window.history.length);
            console.log('Navigating to: /tools/collage/templates');
            console.log('═══════════════════════════════════════');
            navigate('/tools/collage/templates');
          }}
          onSearchFaces={() => {
            console.log('═══════════════════════════════════════');
            console.log('👤 QUICK ACTION: SØK ANSIKTER');
            console.log('═══════════════════════════════════════');
            console.log('Navigating to: /search?faces=true');
            console.log('═══════════════════════════════════════');
            navigate('/search?faces=true');
          }}
        />
      )}

      {/* Loading Skeletons */}
      {isInitialLoading ? (
        <>
          <section className="mb-10">
            <Loading variant="skeleton" className="h-8 w-48 rounded mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array(8).fill(0).map((_, i) => (
                <Loading key={i} variant="skeleton" className="aspect-square" />
              ))}
            </div>
          </section>
          <section className="mb-10">
            <Loading variant="skeleton" className="h-8 w-56 rounded mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array(8).fill(0).map((_, i) => (
                <Loading key={i} variant="skeleton" className="aspect-square" />
              ))}
            </div>
          </section>
        </>
      ) : (
        <>
          {/* Favoritter - Compact (Phase 5 Bugfix) */}
          {favoritePhotos.length > 0 ? (
            <section className="mb-5 md:mb-8 animate-scale-in">
              <div className="flex justify-between items-center mb-3 md:mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-400" fill="currentColor" />
                  {t("home:favoritesTitle")}
                </h2>
                <button
                  onClick={() => {
                    console.log('═══════════════════════════════════════');
                    console.log('⭐ SE ALLE FAVORITTER');
                    console.log('═══════════════════════════════════════');
                    console.log('Total favorites:', stats.favorites);
                    console.log('Navigating to: /search?favorites=true');
                    console.log('═══════════════════════════════════════');
                    navigate('/search?favorites=true');
                  }}
                  className="ripple-effect text-sm text-purple hover:text-purple transition whitespace-nowrap flex items-center"
                >
                  {t("common:seeAll", { count: stats.favorites })} →
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {favoritePhotos.map((photo, i) => (
                  <div
                    key={photo.id}
                    className="relative group cursor-pointer aspect-square rounded-xl overflow-hidden"
                    onClick={() => onPhotoClick(photo, favoritePhotos)}
                    style={{ animationDelay: `${Math.min(i * 0.05, 0.2)}s` }}
                  >
                    <LazyImage
                      src={photo.type === 'video' ? (photo.thumbnailUrl || photo.url) : photo.url}
                      thumbnail={photo.thumbnailSmall}
                      photoId={photo.id}
                      alt={photo.name || t("common:photo")}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Star
                      className="absolute top-2 right-2 w-5 h-5 text-yellow-400 drop-shadow-lg"
                      fill="currentColor"
                    />
                  </div>
                ))}
              </div>
            </section>
          ) : (
            <section className="mb-5 md:mb-8">
              <div className="flex justify-between items-center mb-3 md:mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Star className="w-6 h-6 text-yellow-400" fill="currentColor" />
                  {t("home:favoritesTitle")}
                </h2>
              </div>
              <EmptyState
                variant="no-favorites"
                title={t("home:emptyStates.noFavorites.title")}
                description={t("home:emptyStates.noFavorites.description")}
                action={t("home:emptyStates.noFavorites.action")}
                onAction={() => navigate('/search')}
              />
            </section>
          )}

          {/* Collage Teaser - NEW (Phase 5) */}
          {!isInitialLoading && <CollageTeaser />}

      {/* Recent Uploads with Time Grouping */}
      <section className="mb-6 md:mb-10">
        <div className="flex justify-between items-center mb-3 md:mb-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="w-6 h-6 text-blue-400" />
            {t("home:recentUploads")}
          </h2>
          {timeGroups.length > 0 && (
            <button
              onClick={() => {
                const totalRecentPhotos = timeGroups.reduce((sum, g) => sum + g.photos.length, 0);
                console.log('═══════════════════════════════════════');
                console.log('📸 SE ALLE SISTE OPPLASTNINGER');
                console.log('═══════════════════════════════════════');
                console.log('Total recent photos:', totalRecentPhotos);
                console.log('Navigating to: /search?recent=true&limit=50');
                console.log('This should show ONLY recent photos, not all photos');
                console.log('═══════════════════════════════════════');
                navigate('/search?recent=true&limit=50');
              }}
              className="ripple-effect text-sm text-purple hover:text-purple transition whitespace-nowrap flex items-center"
            >
              {t("common:seeAll", { count: timeGroups.reduce((sum, g) => sum + g.photos.length, 0) })} →
            </button>
          )}
        </div>

        {timeGroups.length === 0 ? (
          <EmptyState
            variant="no-photos"
            title={t("home:emptyStates.noRecent.title")}
            description={t("home:emptyStates.noRecent.description")}
            action={t("home:emptyStates.noRecent.action")}
            onAction={() => setUploadOpen(true)}
          />
        ) : (
          <div className="time-groups-container">
            {timeGroups.map((group) => (
              <TimeGroupSection
                key={group.key}
                group={group}
                onPhotoClick={onPhotoClick}
                onHeaderClick={(group) => {
                  console.log('═══════════════════════════════════════');
                  console.log('📅 TIME GROUP CLICKED');
                  console.log('═══════════════════════════════════════');
                  console.log('Group:', group.label || group.labelEN);
                  console.log('Key:', group.key);
                  console.log('Photos:', group.photos.length);

                  // Map time group keys to SearchPage URL params (FIXED - Issue 2)
                  let searchUrl = '/search';

                  switch(group.key) {
                    case 'today':
                      searchUrl = '/search?day=today';
                      console.log('✅ Using day=today filter');
                      break;
                    case 'yesterday':
                      searchUrl = '/search?day=yesterday';
                      console.log('✅ Using day=yesterday filter');
                      break;
                    case 'thisWeek':
                      searchUrl = '/search?week=true';
                      console.log('✅ Using week=true filter');
                      break;
                    default:
                      // If somehow we get a different key, default to month
                      searchUrl = '/search?range=month';
                      console.log('⚠️ Unknown key, using range=month fallback');
                  }

                  console.log('Navigating to:', searchUrl);
                  console.log('═══════════════════════════════════════');

                  navigate(searchUrl);
                }}
              />
            ))}
          </div>
        )}
      </section>

      {/* Upload Button - Moved here for FREE users (primary action) */}
      <Button
        onClick={() => {
          console.log('📤 LARGE UPLOAD BUTTON CLICKED');
          setUploadMode('upload');
          setUploadOpen(true);
        }}
        variant="primary"
        size="lg"
        fullWidth
        icon={ImagePlus}
        iconPosition="left"
        className="mb-6 md:mb-10 free-upload-btn"
      >
        <span className="font-semibold text-base md:text-lg">{t("home:uploadPhotos")}</span>
      </Button>

      {/* Smart Albums - Minimized (Phase 5) */}
      <section className="mb-6 md:mb-10">
        <h2 className="text-xl md:text-2xl font-bold mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-purple" />
          {t("home:smartAlbums")}
        </h2>
        <div className="minimized-smart-grid">
          {smartAlbums.map((album, index) => (
            <button
              key={album.id}
              onClick={() => handleSmartAlbumClick(album.id)}
              className="minimized-smart-card"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className={`minimized-smart-icon bg-gradient-to-br ${album.color}`}>
                <album.icon className="w-5 h-5 text-white" />
              </div>
              <span className="minimized-smart-name">{album.name}</span>
              <span className="minimized-smart-count">
                {album.count}
              </span>
            </button>
          ))}
        </div>
      </section>
        </>
      )}

      {/* AI-verktøy - HIDDEN for FREE users */}
      {!isFreeUser && (
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Wand2 className="w-6 h-6 text-purple" />
            {t("home:aiTools")}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button className="ripple-effect glass p-4 rounded-xl hover:bg-white/15 transition flex items-center gap-3">
              <div className="p-2 bg-purple-600/30 rounded-lg">
                <Scan className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">{t("home:autoSortTitle")}</p>
                <p className="text-xs text-muted">{t("home:autoSortDesc")}</p>
              </div>
            </button>

            <button className="ripple-effect glass p-4 rounded-xl hover:bg-white/15 transition flex items-center gap-3">
              <div className="p-2 bg-blue-600/30 rounded-lg">
                <ImagePlus className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-semibold text-sm">{t("home:enhanceTitle")}</p>
                <p className="text-xs text-muted">{t("home:enhanceDesc")}</p>
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
                <p className="text-xs text-muted">{t("home:viewAllTools")}</p>
              </div>
            </button>
          </div>
        </section>
      )}

      {/* Scroll to Top Button */}
      <ScrollToTop />

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => {
          setUploadOpen(false);
          setUploadMode('upload'); // Reset to default mode
        }}
        onUpload={onUpload}
        onCreateAlbum={handleCreateAlbum}
        albums={albums}
        initialMode={uploadMode}
      />
    </div>
  );
};

export default HomeDashboard;
