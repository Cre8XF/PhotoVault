// ============================================================================
// PAGE: DashboardPage.jsx – Twilight Theme med Hero Section
// ============================================================================
import React, { useMemo, useEffect, useState } from "react";
import {
  Image,
  Album,
  Star,
  Settings,
  UploadCloud,
  Crown,
  Wand2,
  HardDrive,
  Activity,
  Clock,
  Sparkles,
} from "lucide-react";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  getMetadata,
  listAll,
} from "firebase/storage";
import { addPhoto } from "../firebase";

const DashboardPage = ({ albums, photos, colors, user, onNavigate, refreshData }) => {
  const [storageUsage, setStorageUsage] = useState(null);
  const [lastSync, setLastSync] = useState(null);
  const [heroIndex, setHeroIndex] = useState(0);

  const totalAlbums = albums.length;
  const totalPhotos = photos.length;
  
  const favorites = useMemo(
    () => photos.filter((p) => p.favorite).length,
    [photos]
  );
  
  const favoritePhotos = useMemo(
    () => photos.filter((p) => p.favorite).slice(0, 8),
    [photos]
  );

  const latest = useMemo(
    () => [...photos].sort((a, b) => 
      new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
    ).slice(0, 4),
    [photos]
  );

  // Hero image rotation
  const heroPhotos = useMemo(
    () => photos.slice(0, 5),
    [photos]
  );

  useEffect(() => {
    if (heroPhotos.length > 1) {
      const interval = setInterval(() => {
        setHeroIndex((prev) => (prev + 1) % heroPhotos.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [heroPhotos.length]);

  // Beregn lagringsbruk
  useEffect(() => {
    const calcStorageUsage = async () => {
      try {
        const storage = getStorage();
        const rootRef = ref(storage, `users/${user.uid}/`);

        async function sumFolder(folderRef) {
          let total = 0;
          const res = await listAll(folderRef);
          for (const item of res.items) {
            const meta = await getMetadata(item).catch(() => null);
            if (meta?.size) total += meta.size;
          }
          for (const sub of res.prefixes) {
            total += await sumFolder(sub);
          }
          return total;
        }

        const totalBytes = await sumFolder(rootRef);
        setStorageUsage((totalBytes / 1024 / 1024).toFixed(1));
        setLastSync(new Date().toLocaleString("no-NO", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        }));
      } catch {
        setStorageUsage("?");
      }
    };
    calcStorageUsage();
  }, [user]);

  const storageLimit = user?.role === "pro" ? 5120 : 500;
  const usagePercent = storageUsage
    ? Math.min((storageUsage / storageLimit) * 100, 100)
    : 0;

  const isPro = user?.role === "pro";
  const planColor = isPro
    ? "bg-gradient-to-r from-green-600/30 to-emerald-600/30 border-green-500/30"
    : "bg-gradient-to-r from-amber-600/30 to-yellow-600/30 border-amber-500/30";

  return (
    <div className="min-h-screen p-6 md:p-10 animate-fade-in">
      {/* Hero Section */}
      {heroPhotos.length > 0 && (
        <section className="relative mb-12 rounded-3xl overflow-hidden h-80 glass shadow-2xl">
          <div className="absolute inset-0">
            {heroPhotos.map((photo, i) => (
              <img
                key={photo.id}
                src={photo.url}
                alt=""
                className={`absolute inset-0 w-full h-full object-contain bg-gradient-to-br from-gray-900 to-indigo-900 transition-opacity duration-1000 ${
                  i === heroIndex ? "opacity-100" : "opacity-0"
                }`}
              />
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
          </div>

          <div className="relative h-full flex flex-col justify-end p-8">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-8 h-8 text-yellow-400 animate-float" />
              <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
                Velkommen tilbake
              </h1>
            </div>
            <p className="text-lg text-gray-200 opacity-90">
              {totalPhotos} {totalPhotos === 1 ? 'minne' : 'minner'} venter på deg
            </p>
          </div>

          {heroPhotos.length > 1 && (
            <div className="absolute bottom-4 right-4 flex gap-2">
              {heroPhotos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setHeroIndex(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === heroIndex
                      ? "bg-white w-8"
                      : "bg-white/40 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Pro Banner */}
      <div className={`${planColor} backdrop-blur-lg rounded-2xl p-5 mb-8 border glass-sm animate-scale-in`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Crown className="w-6 h-6 text-yellow-400" />
            <div>
              <p className="font-semibold text-white">
                {isPro ? "Pro-konto (5 GB)" : "Gratis-konto (500 MB)"}
              </p>
              <p className="text-sm opacity-80">
                {isPro
                  ? "Takk for at du støtter PhotoVault Pro!"
                  : "Oppgrader for høyere lagringsgrense og AI-funksjoner."}
              </p>
            </div>
          </div>
          {!isPro && (
            <button
              onClick={() => alert("Stripe-betaling kommer snart!")}
              className="btn-premium px-5 py-2 rounded-xl text-white font-semibold"
            >
              Oppgrader
            </button>
          )}
        </div>
      </div>

      {/* Statistikk Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { icon: Album, label: "Album", value: totalAlbums, color: "text-blue-400" },
          { icon: Image, label: "Bilder", value: totalPhotos, color: "text-purple-400" },
          { icon: Star, label: "Favoritter", value: favorites, color: "text-yellow-400" },
          { icon: HardDrive, label: "Lagring (MB)", value: storageUsage ?? "…", color: "text-green-400" },
        ].map((item, idx) => (
          <div
            key={item.label}
            className={`card-premium text-center hover:scale-105 animate-scale-in stagger-${idx + 1}`}
          >
            <item.icon className={`mx-auto mb-3 w-7 h-7 ${item.color}`} />
            <p className="text-sm opacity-70">{item.label}</p>
            <p className="text-2xl font-bold mt-1">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Lagringsstatus */}
      <div className="mb-10 glass p-6 rounded-2xl">
        <div className="flex justify-between mb-3">
          <p className="text-sm font-medium">
            Brukt {storageUsage ?? "…"} MB av {storageLimit} MB
          </p>
          <p className="text-sm font-semibold text-purple-400">
            {usagePercent.toFixed(0)}%
          </p>
        </div>
        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-yellow-500 transition-all duration-700 rounded-full"
            style={{ width: `${usagePercent}%` }}
          />
        </div>
      </div>

      {/* Favoritter */}
      {favoritePhotos.length > 0 && (
        <section className="mb-10 animate-fade-in">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Star className="w-6 h-6 text-yellow-400" fill="currentColor" />
              Mine favoritter
            </h2>
            <button
              onClick={() => onNavigate("gallery")}
              className="text-sm text-purple-300 hover:text-purple-200 transition"
            >
              Se alle →
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {favoritePhotos.map((p, i) => (
              <div
                key={p.id}
                className={`relative group cursor-pointer animate-scale-in stagger-${(i % 4) + 1}`}
                onClick={() => onNavigate("gallery")}
              >
                <img
                  src={p.url}
                  alt=""
                  className="w-full h-40 object-contain bg-gray-900 rounded-xl transition-transform duration-300 group-hover:scale-105 border border-white/10"
                />
                <Star
                  className="absolute top-2 right-2 w-5 h-5 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  fill="currentColor"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Siste opplastninger */}
      <section className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Siste opplastninger</h2>
          <button
            onClick={() => onNavigate("gallery")}
            className="text-sm text-purple-300 hover:text-purple-200 transition"
          >
            Se alle →
          </button>
        </div>
        {latest.length === 0 ? (
          <p className="opacity-70 text-center py-8">Ingen bilder lastet opp ennå.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {latest.map((p, i) => (
              <img
                key={p.id}
                src={p.url}
                alt=""
                className={`w-full h-40 object-contain bg-gray-900 rounded-xl hover:scale-105 transition-transform cursor-pointer border border-white/10 animate-scale-in stagger-${i + 1}`}
                onClick={() => onNavigate("gallery")}
              />
            ))}
          </div>
        )}
      </section>

      {/* Hurtigvalg */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4">Hurtigvalg</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => onNavigate("gallery")}
            className="glass-sm hover:glass px-5 py-3 rounded-xl flex items-center gap-2 transition"
          >
            <Image className="w-5 h-5" /> Åpne galleri
          </button>
          {user?.role === "admin" && (
            <button
              onClick={() => onNavigate("admin")}
              className="glass-sm hover:glass px-5 py-3 rounded-xl flex items-center gap-2 transition"
            >
              <Settings className="w-5 h-5" /> Adminpanel
            </button>
          )}
        </div>
      </section>

      {/* Sist synkronisert */}
      <div className="flex items-center gap-2 text-sm opacity-60">
        <Clock className="w-4 h-4" />
        <p>Sist synkronisert: {lastSync || "Henter..."}</p>
      </div>
    </div>
  );
};

export default DashboardPage;