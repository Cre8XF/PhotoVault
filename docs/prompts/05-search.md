# FILE: 05-search.md

# SearchPage - Intelligent Photo Discovery

## INSTRUCTIONS

Implement directly. Test. Commit: "feat(search): intelligent search with AI filters"

## IMPLEMENTATION

### 1. Smart Search Input

```jsx
import { useState, useCallback } from 'react';
import { debounce } from 'lodash';

const [searchQuery, setSearchQuery] = useState('');
const [searchSuggestions, setSearchSuggestions] = useState([]);
const [isSearching, setIsSearching] = useState(false);

// Debounced search
const debouncedSearch = useCallback(
  debounce(async (query) => {
    if (!query.trim()) {
      setSearchSuggestions([]);
      return;
    }

    setIsSearching(true);

    // Generate suggestions
    const suggestions = [
      ...photos.filter(p =>
        p.name?.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 3).map(p => ({ type: 'photo', value: p.name })),

      ...Array.from(new Set(
        photos.flatMap(p => p.aiTags || [])
          .filter(tag => tag.toLowerCase().includes(query.toLowerCase()))
      )).slice(0, 5).map(tag => ({ type: 'tag', value: tag })),

      // Add smart suggestions
      { type: 'smart', value: `Alle bilder med "${query}"` },
      { type: 'smart', value: `${query} fra siste måned` }
    ];

    setSearchSuggestions(suggestions);
    setIsSearching(false);
  }, 300),
  [photos]
);




    <input
      type="text"
      placeholder="Søk i bilder, tags, personer..."
      value={searchQuery}
      onChange={(e) => {
        setSearchQuery(e.target.value);
        debouncedSearch(e.target.value);
      }}
      className="flex-1 bg-transparent outline-none text-lg"
    />
    {isSearching && (

    )}
    {searchQuery && (
      <button onClick={() => setSearchQuery('')}>


    )}


  {/* Suggestions Dropdown */}
  {searchSuggestions.length > 0 && (


        {searchSuggestions.map((suggestion, i) => (
          <button
            key={i}
            onClick={() => setSearchQuery(suggestion.value)}
            className="w-full px-3 py-2 hover:bg-white/10 rounded-lg text-left flex items-center gap-2 group"
          >
            {suggestion.type === 'photo' && }
            {suggestion.type === 'tag' && }
            {suggestion.type === 'smart' && }
            {suggestion.value}


        ))}


  )}

```

### 2. AI-Powered Filter Chips

```jsx
const aiFilters = [
  { id: 'faces', label: 'Med ansikter', icon: Users, count: photos.filter(p => p.faces > 0).length },
  { id: 'quality', label: 'Høy kvalitet', icon: Star, count: photos.filter(p => p.aiQuality > 0.8).length },
  { id: 'favorites', label: 'Favoritter', icon: Heart, count: photos.filter(p => p.favorite).length },
  { id: 'recent', label: 'Nylig lagt til', icon: Clock, count: photos.filter(p => isRecent(p)).length },
  { id: 'screenshots', label: 'Skjermbilder', icon: Monitor, count: photos.filter(p => p.category === 'screenshot').length },
  { id: 'documents', label: 'Dokumenter', icon: FileText, count: photos.filter(p => p.category === 'document').length }
];


  {aiFilters.map(filter => (
    <motion.button
      key={filter.id}
      onClick={() => toggleFilter(filter.id)}
      className={`px-4 py-2 rounded-full whitespace-nowrap flex items-center gap-2 transition-all ${
        activeFilters.includes(filter.id)
          ? 'bg-purple-600 text-white'
          : 'bg-white/5 hover:bg-white/10'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >

      {filter.label}
      ({filter.count})

  ))}

```

### 3. Visual Similarity Search

```jsx
const [similarSearchPhoto, setSimilarSearchPhoto] = useState(null);

// Add to photo context menu
<button
  onClick={() => findSimilar(photo)}
  className="px-3 py-2 hover:bg-white/10 rounded-lg flex items-center gap-2"
>

  Finn lignende


// Similar search results
{similarSearchPhoto && (





          Bilder lignende dette
          Basert på AI-analyse


      <button
        onClick={() => setSimilarSearchPhoto(null)}
        className="p-2 hover:bg-white/10 rounded-lg"
      >




)}
```

### 4. Search Results with Relevance

```jsx
const SearchResultItem = ({ photo, relevance }) => (





    {/* Relevance Score */}
    {relevance > 0.7 && (

        {Math.round(relevance * 100)}% match

    )}

    {/* Matched Terms */}

      {photo.name}
      {photo.matchedTerms && (

          {photo.matchedTerms.map(term => (

              {term}

          ))}

      )}


);
```

## TESTING

- [ ] Search debounced correctly
- [ ] Suggestions appear instantly
- [ ] AI filters accurate
- [ ] Similar search works
- [ ] Results sorted by relevance
- [ ] Mobile search smooth

---
