// ============================================================================
// PAGE: SearchPage.jsx – v5.4 med filtrering, sletting, forside og ConfirmModal
// ============================================================================
import React, { useState, useMemo } from 'react';
import { Search as SearchIcon, X, Calendar, Tag, Star, Users, Folder, SlidersHorizontal, Sparkles, Move, Trash2, Edit3, Check } from 'lucide-react';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { deletePhoto, setAlbumCover, updateAlbumPhotoCount } from '../firebase';
import MoveModal from '../components/MoveModal';
import ConfirmModal from '../components/ConfirmModal';

const DATE_RANGES = [
  { key: 'today', label: 'I dag' },
  { key: 'week', label: 'Siste uke' },
  { key: 'month', label: 'Siste måned' },
  { key: 'year', label: 'Siste år' }
];

const SearchPage = ({ photos = [], albums = [], onPhotoClick, refreshData }) => {
  // Søk og filter
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState({
    favorites: false,
    withFaces: false,
    withTags: false,
    aiAnalyzed: false,
    dateRange: null,
    albumId: null,
    category: null
  });
  const [showFilters, setShowFilters] = useState(false);

  // Redigeringsmodus og flytting
  const [editMode, setEditMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [isMoveOpen, setMoveOpen] = useState(false);

  // Bekreftelsesdialog for sletting
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [photoToDelete, setPhotoToDelete] = useState(null);

  // Kategorier og AI-tags
  const categories = useMemo(() => {
    const set = new Set();
    photos.forEach(p => p.category && set.add(p.category));
    return Array.from(set).sort();
  }, [photos]);

  const popularTags = useMemo(() => {
    const counts = {};
    photos.forEach(p =>
      (p.aiTags || []).forEach(t => {
        counts[t] = (counts[t] || 0) + 1;
      })
    );
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([tag, count]) => ({ tag, count }));
  }, [photos]);

  // --- Filtrering ---
  const filteredPhotos = useMemo(() => {
    let res = photos;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      res = res.filter(p => {
        const inName = p.name?.toLowerCase().includes(q);
        const inTags = p.aiTags?.some(t => t.toLowerCase().includes(q));
        const inCat = p.category?.toLowerCase().includes(q);
        return inName || inTags || inCat;
      });
    }
    if (activeFilters.favorites) res = res.filter(p => p.favorite);
    if (activeFilters.withFaces) res = res.filter(p => (p.faces || 0) > 0);
    if (activeFilters.withTags) res = res.filter(p => (p.aiTags || []).length > 0);
    if (activeFilters.aiAnalyzed) res = res.filter(p => !!p.aiAnalyzed);
    if (activeFilters.category) res = res.filter(p => p.category === activeFilters.category);
    if (activeFilters.albumId) res = res.filter(p => p.albumId === activeFilters.albumId);
    if (activeFilters.dateRange) {
      const now = Date.now();
      const days = { today: 1, week: 7, month: 30, year: 365 }[activeFilters.dateRange] || 0;
      if (days > 0) {
        const cutoff = now - days * 24 * 60 * 60 * 1000;
        res = res.filter(p => new Date(p.createdAt || p.uploadedAt || 0).getTime() >= cutoff);
      }
    }
    return res;
  }, [photos, searchQuery, activeFilters]);

  const activeFilterCount = useMemo(() => {
    return Object.values(activeFilters).filter(Boolean).length;
  }, [activeFilters]);

  // --- Sletting ---
  const requestDelete = photo => {
    setPhotoToDelete(photo);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!photoToDelete) return;
    try {
      await deletePhoto(photoToDelete.id, photoToDelete.storagePath);
      console.log(`🗑️ Slettet bilde: ${photoToDelete.name || photoToDelete.id}`);
      setPhotoToDelete(null);
      if (refreshData) await refreshData();
    } catch (error) {
      console.error('Feil ved sletting:', error);
      alert('Kunne ikke slette bildet.');
    }
  };

  // --- Sett forside ---
  const handleSetCover = async photo => {
    try {
      await setAlbumCover(photo.albumId, photo.url);
      console.log(`⭐ Forsidebilde satt til: ${photo.name}`);
      if (refreshData) await refreshData();
    } catch (error) {
      console.error('Feil ved oppdatering av forside:', error);
    }
  };

  // --- Flytting ---
  const handleMovePhotos = async targetAlbumId => {
    try {
      const db = getFirestore();
      const selectedIds = selectedPhotos.map(sp => (typeof sp === 'string' ? sp : sp?.id || sp?.docId));
      const ops = selectedIds.map(async photoId => {
        const ref = doc(db, 'photos', photoId);
        await updateDoc(ref, { albumId: targetAlbumId });
      });
      await Promise.all(ops);

      const targetBefore = photos.filter(p => p.albumId === targetAlbumId).length;
      await updateAlbumPhotoCount(targetAlbumId, targetBefore + selectedIds.length);

      if (refreshData) await refreshData();
      setSelectedPhotos([]);
    } catch (e) {
      console.error('Flytt-feil:', e);
      alert('Kunne ikke flytte bildene. Prøv igjen.');
    }
  };

  // --- Nullstill filtre ---
  const clearFilters = () =>
    setActiveFilters({
      favorites: false,
      withFaces: false,
      withTags: false,
      aiAnalyzed: false,
      dateRange: null,
      albumId: null,
      category: null
    });

  return (
    <div className="min-h-screen p-6 md:p-10 pb-24 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-3xl font-bold">Søk</h1>
        <div className="flex items-center gap-2">
        <button
  onClick={() => setEditMode(!editMode)}
  title="Redigeringsmodus: klikk på bilder for å slette eller sette som forside"
  className={`ripple-effect px-4 py-2 rounded-xl flex items-center gap-2 transition ${
    editMode ? "btn-edit-active" : "bg-white/10 hover:bg-white/20"
  }`}
>
  {editMode && (
    <span
      className="text-sm text-indigo-200 dark:text-indigo-100
                 bg-indigo-700/30 dark:bg-indigo-500/40
                 px-3 py-1 rounded-lg ml-2 transition"
    >
      Klikk på bilder for å slette eller sette som forside.
    </span>
  )}
  {editMode ? <Check size={18} /> : <Edit3 size={18} />}
  {editMode ? "Ferdig" : "Rediger"}
</button>


          <button onClick={() => setShowFilters(v => !v)} className="ripple-effect px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 flex items-center gap-2">
            <SlidersHorizontal size={18} />
            Filtre
            {activeFilterCount > 0 && <span className="ml-1 rounded-md px-2 py-0.5 text-sm bg-purple-600">{activeFilterCount}</span>}
          </button>
          {selectedPhotos.length > 0 && (
            <button onClick={() => setMoveOpen(true)} className="ripple-effect px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
              <Move size={18} /> Flytt
            </button>
          )}
        </div>
      </div>

      {/* Søkefelt */}
      <div className="glass rounded-2xl p-4 mb-4">
        <div className="flex items-center gap-3">
          <SearchIcon className="w-5 h-5 opacity-60" />
          <input
            type="text"
            placeholder="Søk i navn, AI-tags eller kategori"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-lg"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="ripple-effect p-1 hover:bg-white/10 rounded-lg transition">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Filterpanel */}
      {showFilters && (
        <div className="glass rounded-2xl p-4 mb-6 space-y-4">
          {/* Primærfiltre */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveFilters(f => ({ ...f, favorites: !f.favorites }))}
              className={`px-3 py-2 rounded-lg border ${activeFilters.favorites ? 'bg-yellow-600 border-yellow-500' : 'border-white/10'} flex items-center gap-2`}
            >
              <Star size={16} /> Favoritter
            </button>

            <button
              onClick={() => setActiveFilters(f => ({ ...f, withFaces: !f.withFaces }))}
              className={`px-3 py-2 rounded-lg border ${activeFilters.withFaces ? 'bg-blue-600 border-blue-500' : 'border-white/10'} flex items-center gap-2`}
            >
              <Users size={16} /> Med ansikter
            </button>

            <button
              onClick={() => setActiveFilters(f => ({ ...f, withTags: !f.withTags }))}
              className={`px-3 py-2 rounded-lg border ${activeFilters.withTags ? 'bg-emerald-600 border-emerald-500' : 'border-white/10'} flex items-center gap-2`}
            >
              <Tag size={16} /> Med AI-tags
            </button>

            <button
              onClick={() => setActiveFilters(f => ({ ...f, aiAnalyzed: !f.aiAnalyzed }))}
              className={`px-3 py-2 rounded-lg border ${activeFilters.aiAnalyzed ? 'bg-purple-600 border-purple-500' : 'border-white/10'} flex items-center gap-2`}
            >
              <Sparkles size={16} /> AI-analysert
            </button>
          </div>

          {/* Avanserte valg */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Album */}
            <label className="flex items-center gap-2">
              <Folder size={16} />
              <select
                value={activeFilters.albumId || ''}
                onChange={e => setActiveFilters(f => ({ ...f, albumId: e.target.value || null }))}
                className="flex-1 bg-transparent border border-white/10 rounded-lg px-3 py-2"
              >
                <option value="">Alle album</option>
                {albums.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </label>

            {/* Kategori */}
            <label className="flex items-center gap-2">
              <Tag size={16} />
              <select
                value={activeFilters.category || ''}
                onChange={e => setActiveFilters(f => ({ ...f, category: e.target.value || null }))}
                className="flex-1 bg-transparent border border-white/10 rounded-lg px-3 py-2"
              >
                <option value="">Alle kategorier</option>
                {categories.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>

            {/* Dato */}
            <label className="flex items-center gap-2">
              <Calendar size={16} />
              <select
                value={activeFilters.dateRange || ''}
                onChange={e => setActiveFilters(f => ({ ...f, dateRange: e.target.value || null }))}
                className="flex-1 bg-transparent border border-white/10 rounded-lg px-3 py-2"
              >
                <option value="">Alle datoer</option>
                {DATE_RANGES.map(r => (
                  <option key={r.key} value={r.key}>
                    {r.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Populære AI-tags */}
          {popularTags.length > 0 && (
            <div>
              <div className="text-sm opacity-70 mb-2">Populære AI-tags</div>
              <div className="flex flex-wrap gap-2">
                {popularTags.map(({ tag, count }) => (
                  <button key={tag} onClick={() => setSearchQuery(tag)} className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-sm" title={`${count} treff`}>
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Handling */}
      <div className="flex justify-between">
        <div className="text-sm opacity-60">
          Aktive filtre: <b>{activeFilterCount}</b>
        </div>
        <button
          onClick={() => {
            clearFilters(); // nullstiller filtrene
            setSearchQuery(''); // legger til denne linjen
          }}
          className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20"
        >
          Nullstill filtre
        </button>
      </div>

   {/* Resultater */}
<div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
  {filteredPhotos.map((photo) => (
    <div
      key={photo.id}
      className="relative group aspect-[4/5] bg-black/10 rounded-lg flex items-center justify-center overflow-hidden"
    >
      <img
        src={photo.url}
        alt={photo.name}
        onClick={() => !editMode && onPhotoClick(photo)}
        className="max-h-full max-w-full object-contain cursor-pointer transition-transform duration-300 group-hover:scale-[1.03]"
      />
      {editMode && (
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition">
          <button
            onClick={() => handleSetCover(photo)}
            className="bg-black/60 hover:bg-yellow-500 text-white p-1.5 rounded-full"
            title="Sett som forside"
          >
            <Star className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => requestDelete(photo)}
            className="bg-black/60 hover:bg-red-600 text-white p-1.5 rounded-full"
            title="Slett bilde"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  ))}
</div>



      {/* Flytt-modal */}
      <MoveModal isOpen={isMoveOpen} onClose={() => setMoveOpen(false)} albums={albums} onConfirm={handleMovePhotos} />

      {/* Bekreft sletting */}
      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Bekreft sletting"
        message="Er du sikker på at du vil slette dette bildet permanent?"
        confirmLabel="Slett bilde"
        cancelLabel="Avbryt"
      />
    </div>
  );
};

export default SearchPage;
