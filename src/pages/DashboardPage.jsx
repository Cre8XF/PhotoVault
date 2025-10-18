// ============================================================================
// PAGE: DashboardPage.jsx – Oversikt, status, lagring og hurtigvalg
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

  const totalAlbums = albums.length;
  const totalPhotos = photos.length;
  const favorites = photos.filter((p) => p.favorite).length;
  const latest = [...photos].sort((a, b) => b.createdAt - a.createdAt).slice(0, 4);


  // ----------------------------------------------------------
  // Beregn total lagringsbruk fra Storage metadata
  // ----------------------------------------------------------
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
          total += await sumFolder(sub); // rekursivt for albums/
        }
        return total;
      }

      const totalBytes = await sumFolder(rootRef);
      setStorageUsage((totalBytes / 1024 / 1024).toFixed(1));
      setLastSync(new Date().toLocaleString());
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
    // ---------- Pro-konto-banner logikk ----------
const isPro = user?.role === "pro";
const planColor = isPro
  ? "bg-green-600/30 text-green-200"
  : "bg-yellow-600/30 text-yellow-100";
const planLabel = isPro
  ? "Pro-konto (5 GB)"
  : "Gratis-konto (500 MB)";


  return (
    <div className={`min-h-screen ${colors.text} bg-gradient-to-br ${colors.bg} p-6 md:p-10`}>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      {/* Pro-banner */}
<div className={`${planColor} backdrop-blur-lg rounded-2xl p-4 mb-8 flex items-center justify-between`}>
  <div className="flex items-center gap-3">
    <Crown className="w-6 h-6" />
    <div>
      <p className="font-semibold">{planLabel}</p>
      <p className="text-sm opacity-80">
        {isPro
          ? "Takk for at du støtter PhotoVault Pro!"
          : "Oppgrader for høyere lagringsgrense og AI-funksjoner."}
      </p>
    </div>
  </div>
  {!isPro && (
    <button
      onClick={() => alert("Stripe-betaling kommer i PhotoVault v2.")}
      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-sm transition"
    >
      Oppgrader
    </button>
  )}
</div>


      {/* Statistikk */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { icon: Album, label: "Album", value: totalAlbums },
          { icon: Image, label: "Bilder", value: totalPhotos },
          { icon: Star, label: "Favoritter", value: favorites },
          {
            icon: HardDrive,
            label: "Lagring (MB)",
            value: storageUsage ?? "…",
          },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white/10 backdrop-blur-lg rounded-xl p-4 text-center hover:bg-white/20 transition"
          >
            <item.icon className="mx-auto mb-2 w-6 h-6 opacity-80" />
            <p className="text-sm opacity-70">{item.label}</p>
            <p className="text-xl font-semibold">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Lagringsstatus */}
      <div className="mb-10">
        <div className="flex justify-between mb-2">
          <p className="text-sm opacity-70">
            Brukt {storageUsage ?? "…"} MB av {storageLimit} MB
          </p>
          <p className="text-sm opacity-70">{usagePercent.toFixed(0)} %</p>
        </div>
        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-500 transition-all duration-500"
            style={{ width: `${usagePercent}%` }}
          />
        </div>
      </div>

      {/* Siste opplastninger */}
      <section className="mb-10">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">Siste opplastninger</h2>
          <button
            onClick={() => onNavigate("gallery")}
            className="text-sm opacity-70 hover:opacity-100"
          >
            Se alle →
          </button>
        </div>
        {latest.length === 0 ? (
          <p className="opacity-70">Ingen bilder lastet opp ennå.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {latest.map((p) => (
              <img
                key={p.id}
                src={p.url}
                alt=""
                className="w-full h-40 object-cover rounded-xl hover:scale-105 transition cursor-pointer"
                onClick={() => onNavigate("gallery")}
              />
            ))}
          </div>
        )}
      </section>

      {/* Hurtigvalg */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-3">Hurtigvalg</h2>
        <div className="flex flex-wrap gap-4">
          <button
            onClick={() => onNavigate("gallery")}
            className={`${colors.buttonSecondary} flex items-center gap-2 px-4 py-2 rounded-xl`}
          >
            <Image className="w-5 h-5" /> Åpne galleri
          </button>
          {user?.role === "admin" && (
            <button
              onClick={() => onNavigate("admin")}
              className={`${colors.buttonSecondary} flex items-center gap-2 px-4 py-2 rounded-xl`}
            >
              <Settings className="w-5 h-5" /> Adminpanel
            </button>
          )}
        </div>
      </section>

   {/* AI-verktøy (Picsart integrasjon – full pakke) */}
<section className="mb-10">
  <h2 className="text-xl font-semibold mb-3">AI-verktøy</h2>

  {/* Bildevelger */}
  <div className="mb-4">
    <label className="block text-sm opacity-70 mb-1">
      Velg bilde å analysere eller redigere
    </label>
    <select
      id="selectedPhoto"
      className="w-full p-2 rounded-xl bg-black/20 border border-white/10"
    >
      {photos.length === 0 ? (
        <option>Ingen bilder funnet</option>
      ) : (
        photos.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))
      )}
    </select>
  </div>

  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
    {/* 1️⃣ Auto-sortering (faces + tags) */}
    <button
      onClick={async () => {
        const select = document.getElementById("selectedPhoto");
        const photoId = select?.value;
        const photo = photos.find((p) => p.id === photoId);
        if (!photo) return alert("Velg et bilde først.");
        try {
          alert("AI-analyse starter …");

          const apiKey = process.env.REACT_APP_PICSART_KEY;
          const makeForm = (url) => {
            const f = new FormData();
            f.append("image_url", url);
            return f;
          };

          const [facesRes, tagsRes] = await Promise.all([
            fetch("https://api.picsart.io/tools/face-detection", {
              method: "POST",
              headers: { "x-picsart-api-key": apiKey },
              body: makeForm(photo.url),
            }),
            fetch("https://api.picsart.io/tags/extract", {
              method: "POST",
              headers: { "x-picsart-api-key": apiKey },
              body: makeForm(photo.url),
            }),
          ]);

          const faces = await facesRes.json();
          const tags = await tagsRes.json();

          const facesCount = faces?.data?.faces?.length || 0;
          const tagList = tags?.data?.tags?.map((t) => t.tag) || [];

          const { doc, updateDoc } = await import("firebase/firestore");
          const { db } = await import("../firebase");
          await updateDoc(doc(db, "photos", photo.id), {
            aiTags: tagList,
            faces: facesCount,
            updatedAt: new Date().toISOString(),
          });

          alert(
            `AI-sortering ferdig!\nAnsikter: ${facesCount}\nTags: ${tagList.join(
              ", "
            )}`
          );
          if (typeof refreshData === "function") refreshData(user.uid);
        } catch (err) {
          console.error(err);
          alert("Feil under AI-sortering: " + err.message);
        }
      }}
      className="bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-xl p-6 text-left transition"
    >
      <Activity className="w-6 h-6 mb-2" />
      <p className="font-semibold">Auto-sortering</p>
      <p className="text-sm opacity-70">
        Gjenkjenner personer, objekter og emner automatisk.
      </p>
    </button>

    {/* 2️⃣, 3️⃣, 4️⃣ – Redigeringsverktøy med automatisk lagring */}
    {[
      {
        label: "Fjern bakgrunn",
        endpoint: "removebg",
        desc: "Fjerner bakgrunnen på valgt bilde.",
      },
      {
        label: "Forbedre bilde",
        endpoint: "enhance",
        desc: "Forbedrer klarhet, kontrast og detaljer.",
      },
      {
        label: "Uskarp bakgrunn",
        endpoint: "blurbg",
        desc: "Gjør bakgrunnen mykere for portrett-effekt.",
      },
    ].map((tool) => (
      <button
        key={tool.endpoint}
        onClick={async () => {
          const select = document.getElementById("selectedPhoto");
          const photoId = select?.value;
          const photo = photos.find((p) => p.id === photoId);
          if (!photo) return alert("Velg et bilde først.");
          try {
            const apiKey = process.env.REACT_APP_PICSART_KEY;
            const formData = new FormData();
            formData.append("image_url", photo.url);

            const res = await fetch(
              `https://api.picsart.io/tools/${tool.endpoint}`,
              {
                method: "POST",
                headers: { "x-picsart-api-key": apiKey },
                body: formData,
              }
            );
            if (!res.ok) throw new Error("Picsart-API-feil");
            const data = await res.json();
            const newUrl = data.data.url;

            const blob = await fetch(newUrl).then((r) => r.blob());
            const fileName = `${photo.name}_AI_${tool.endpoint}.jpg`;

            const storage = getStorage();
            const storagePath = `users/${user.uid}/albums/${
              photo.albumId || "AI"
            }/${fileName}`;
            const fileRef = ref(storage, storagePath);
            const snap = await uploadBytes(fileRef, blob);
            const finalUrl = await getDownloadURL(snap.ref);

            const photoData = {
              id: `${photo.id}_${tool.endpoint}_${Date.now()}`,
              userId: user.uid,
              albumId: photo.albumId || null,
              name: fileName.replace(/\.[^/.]+$/, ""),
              url: finalUrl,
              storagePath,
              size: blob.size,
              type: blob.type,
              favorite: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            await addPhoto(photoData);

            alert(`Ferdig! Kopi lagret som ${fileName}`);
            if (typeof refreshData === "function") refreshData(user.uid);
          } catch (err) {
            console.error(err);
            alert("Feil ved behandling: " + err.message);
          }
        }}
        className="bg-white/10 hover:bg-white/20 backdrop-blur-lg rounded-xl p-6 text-left transition"
      >
        <Wand2 className="w-6 h-6 mb-2" />
        <p className="font-semibold">{tool.label}</p>
        <p className="text-sm opacity-70">{tool.desc}</p>
      </button>
    ))}
  </div>
</section>


      {/* Sist synkronisert */}
      <div className="flex items-center gap-2 mt-4 text-sm opacity-60">
        <Clock className="w-4 h-4" />
        <p>Sist synkronisert: {lastSync || "Henter..."}</p>
      </div>
    </div>
  );
};

export default DashboardPage;
