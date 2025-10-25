# FILE: 04-album-features.md

# AlbumPage - Filters & Bulk Actions

## INSTRUCTIONS

Implement directly. Test. Commit: "feat(album): advanced filters and bulk operations"

## IMPLEMENTATION

### 1. Advanced Filter Panel

```jsx
const [filters, setFilters] = useState({
  dateRange: null,
  category: 'all',
  aiStatus: 'all',
  quality: 'all',
  faces: 'all'
});



    {/* Date Range */}
    <select
      value={filters.dateRange}
      onChange={e => setFilters(f => ({ ...f, dateRange: e.target.value }))}
      className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
    >
      Alle datoer
      I dag
      Siste uke
      Siste måned
      Siste år


    {/* Category */}
    <select
      value={filters.category}
      onChange={e => setFilters(f => ({ ...f, category: e.target.value }))}
      className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
    >
      Alle kategorier
      👥 People
      🌳 Nature
      🍽️ Food
      {/* Add more categories */}


    {/* AI Status */}
    <select
      value={filters.aiStatus}
      onChange={e => setFilters(f => ({ ...f, aiStatus: e.target.value }))}
      className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
    >
      AI Status
      ✅ Analysert
      ⏳ Ikke analysert


    {/* Faces */}
    <select
      value={filters.faces}
      onChange={e => setFilters(f => ({ ...f, faces: e.target.value }))}
      className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg"
    >
      Ansikter
      Med ansikter
      Uten ansikter



  {/* Active Filters */}
  {Object.values(filters).some(v => v !== 'all' && v !== null) && (

      <button
        onClick={() => setFilters({
          dateRange: null,
          category: 'all',
          aiStatus: 'all',
          quality: 'all',
          faces: 'all'
        })}
        className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30"
      >
        Nullstill alle


  )}

```

### 2. Bulk Actions Toolbar

```jsx
{selectedPhotos.length > 0 && (





            {selectedPhotos.length}


            {selectedPhotos.length} valgt






            Flytt



            Last ned



            Favoritt



            Slett

          <button
            onClick={() => setSelectedPhotos([])}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl"
          >
            Avbryt





)}
```

### 3. Smart Selection

```jsx
// Select all visible
const selectAllVisible = () => {
  setSelectedPhotos([...filteredPhotos]);
};

// Select by AI criteria
const selectByAI = (criteria) => {
  const selected = filteredPhotos.filter(p => {
    if (criteria === 'faces') return p.faces > 0;
    if (criteria === 'quality') return p.aiQuality > 0.8;
    if (criteria === 'analyzed') return p.aiAnalyzed;
    return false;
  });
  setSelectedPhotos(selected);
};

// Add to toolbar


    Velg alle ({filteredPhotos.length})





      Smart valg




      <button
        onClick={() => selectByAI('faces')}
        className="w-full px-3 py-2 hover:bg-white/10 rounded-lg text-left text-sm"
      >
        Med ansikter

      <button
        onClick={() => selectByAI('quality')}
        className="w-full px-3 py-2 hover:bg-white/10 rounded-lg text-left text-sm"
      >
        Høy kvalitet

      <button
        onClick={() => selectByAI('analyzed')}
        className="w-full px-3 py-2 hover:bg-white/10 rounded-lg text-left text-sm"
      >
        AI-analysert




```

## TESTING

- [ ] Filters work correctly
- [ ] Bulk selection smooth
- [ ] Actions apply to all selected
- [ ] Smart selection accurate
- [ ] Mobile toolbar accessible

---
