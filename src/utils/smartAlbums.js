// ============================================================================
// utils/smartAlbums.js - Smart Albums Generator
// ============================================================================

/**
 * Generer smarte album basert på AI-analyse
 */

/**
 * Generer smarte album fra bilder med AI-tags
 * @param {Array} photos - Array av bilder med aiTags
 * @returns {Array} - Array av smarte album
 */
export const generateSmartAlbums = (photos) => {
  if (!photos || photos.length === 0) return [];

  const smartAlbums = [];

  // 1. Bilder med mennesker
  const peoplePhotos = photos.filter(
    (p) => p.faces > 0 || hasTag(p, ['person', 'people', 'human', 'face'])
  );
  if (peoplePhotos.length > 0) {
    smartAlbums.push({
      id: 'smart-people',
      name: 'Mennesker',
      icon: '👤',
      description: 'Bilder med mennesker',
      count: peoplePhotos.length,
      photos: peoplePhotos,
      color: 'from-pink-500 to-rose-500',
    });
  }

  // 2. Naturbilder
  const naturePhotos = photos.filter((p) =>
    hasTag(p, ['nature', 'landscape', 'mountain', 'forest', 'tree', 'sky', 'sunset'])
  );
  if (naturePhotos.length > 0) {
    smartAlbums.push({
      id: 'smart-nature',
      name: 'Natur',
      icon: '🌲',
      description: 'Landskaper og natur',
      count: naturePhotos.length,
      photos: naturePhotos,
      color: 'from-green-500 to-emerald-500',
    });
  }

  // 3. Mat-bilder
  const foodPhotos = photos.filter((p) =>
    hasTag(p, ['food', 'dish', 'meal', 'cuisine', 'dessert', 'drink'])
  );
  if (foodPhotos.length > 0) {
    smartAlbums.push({
      id: 'smart-food',
      name: 'Mat & Drikke',
      icon: '🍽️',
      description: 'Mat og drikke',
      count: foodPhotos.length,
      photos: foodPhotos,
      color: 'from-orange-500 to-red-500',
    });
  }

  // 4. Dyr
  const animalPhotos = photos.filter((p) =>
    hasTag(p, ['animal', 'dog', 'cat', 'bird', 'pet', 'wildlife'])
  );
  if (animalPhotos.length > 0) {
    smartAlbums.push({
      id: 'smart-animals',
      name: 'Dyr',
      icon: '🐾',
      description: 'Kjæledyr og dyr',
      count: animalPhotos.length,
      photos: animalPhotos,
      color: 'from-amber-500 to-yellow-500',
    });
  }

  // 5. Arkitektur & Bygninger
  const architecturePhotos = photos.filter((p) =>
    hasTag(p, ['building', 'architecture', 'city', 'urban', 'street'])
  );
  if (architecturePhotos.length > 0) {
    smartAlbums.push({
      id: 'smart-architecture',
      name: 'Arkitektur',
      icon: '🏛️',
      description: 'Bygninger og arkitektur',
      count: architecturePhotos.length,
      photos: architecturePhotos,
      color: 'from-gray-500 to-slate-500',
    });
  }

  // 6. Reise & Ferie
  const travelPhotos = photos.filter((p) =>
    hasTag(p, ['travel', 'tourism', 'vacation', 'beach', 'ocean', 'landmark'])
  );
  if (travelPhotos.length > 0) {
    smartAlbums.push({
      id: 'smart-travel',
      name: 'Reise',
      icon: '✈️',
      description: 'Ferie og reisebilder',
      count: travelPhotos.length,
      photos: travelPhotos,
      color: 'from-blue-500 to-cyan-500',
    });
  }

  // 7. Events & Feiringer
  const eventPhotos = photos.filter((p) =>
    hasTag(p, ['event', 'party', 'celebration', 'wedding', 'birthday', 'concert'])
  );
  if (eventPhotos.length > 0) {
    smartAlbums.push({
      id: 'smart-events',
      name: 'Arrangementer',
      icon: '🎉',
      description: 'Fester og feiringer',
      count: eventPhotos.length,
      photos: eventPhotos,
      color: 'from-purple-500 to-pink-500',
    });
  }

  // 8. Sport & Aktiviteter
  const sportPhotos = photos.filter((p) =>
    hasTag(p, ['sport', 'game', 'athlete', 'fitness', 'exercise'])
  );
  if (sportPhotos.length > 0) {
    smartAlbums.push({
      id: 'smart-sport',
      name: 'Sport',
      icon: '⚽',
      description: 'Sport og aktiviteter',
      count: sportPhotos.length,
      photos: sportPhotos,
      color: 'from-red-500 to-orange-500',
    });
  }

  // 9. Kunst & Kreativitet
  const artPhotos = photos.filter((p) =>
    hasTag(p, ['art', 'painting', 'drawing', 'creative', 'design'])
  );
  if (artPhotos.length > 0) {
    smartAlbums.push({
      id: 'smart-art',
      name: 'Kunst',
      icon: '🎨',
      description: 'Kunst og kreativitet',
      count: artPhotos.length,
      photos: artPhotos,
      color: 'from-indigo-500 to-purple-500',
    });
  }

  // 10. Innendørs
  const indoorPhotos = photos.filter((p) =>
    hasTag(p, ['indoor', 'room', 'interior', 'furniture', 'home'])
  );
  if (indoorPhotos.length > 0) {
    smartAlbums.push({
      id: 'smart-indoor',
      name: 'Innendørs',
      icon: '🏠',
      description: 'Interiør og innendørs',
      count: indoorPhotos.length,
      photos: indoorPhotos,
      color: 'from-teal-500 to-cyan-500',
    });
  }

  // Sorter etter antall bilder (mest populære først)
  return smartAlbums.sort((a, b) => b.count - a.count);
};

/**
 * Generer tidsbaserte album
 * @param {Array} photos - Array av bilder
 * @returns {Array} - Tidsbaserte album
 */
export const generateTimeBasedAlbums = (photos) => {
  if (!photos || photos.length === 0) return [];

  const now = Date.now();
  const albums = [];

  // Siste 24 timer
  const last24h = photos.filter((p) => {
    const diff = now - new Date(p.createdAt).getTime();
    return diff < 24 * 60 * 60 * 1000;
  });
  if (last24h.length > 0) {
    albums.push({
      id: 'time-24h',
      name: 'I dag',
      icon: '📅',
      description: 'Siste 24 timer',
      count: last24h.length,
      photos: last24h,
      color: 'from-blue-500 to-cyan-500',
    });
  }

  // Siste 7 dager
  const last7days = photos.filter((p) => {
    const diff = now - new Date(p.createdAt).getTime();
    return diff < 7 * 24 * 60 * 60 * 1000;
  });
  if (last7days.length > 0) {
    albums.push({
      id: 'time-7days',
      name: 'Siste uke',
      icon: '📆',
      description: 'Siste 7 dager',
      count: last7days.length,
      photos: last7days,
      color: 'from-indigo-500 to-blue-500',
    });
  }

  // Siste 30 dager
  const last30days = photos.filter((p) => {
    const diff = now - new Date(p.createdAt).getTime();
    return diff < 30 * 24 * 60 * 60 * 1000;
  });
  if (last30days.length > 0) {
    albums.push({
      id: 'time-30days',
      name: 'Siste måned',
      icon: '🗓️',
      description: 'Siste 30 dager',
      count: last30days.length,
      photos: last30days,
      color: 'from-purple-500 to-indigo-500',
    });
  }

  // Siste år
  const lastYear = photos.filter((p) => {
    const diff = now - new Date(p.createdAt).getTime();
    return diff < 365 * 24 * 60 * 60 * 1000;
  });
  if (lastYear.length > 0) {
    albums.push({
      id: 'time-year',
      name: 'Siste år',
      icon: '📊',
      description: 'Siste 12 måneder',
      count: lastYear.length,
      photos: lastYear,
      color: 'from-pink-500 to-purple-500',
    });
  }

  return albums;
};

/**
 * Generer favoritt-album
 * @param {Array} photos - Array av bilder
 * @returns {Object|null} - Favoritt-album
 */
export const generateFavoritesAlbum = (photos) => {
  const favorites = photos.filter((p) => p.favorite);
  
  if (favorites.length === 0) return null;

  return {
    id: 'smart-favorites',
    name: 'Favoritter',
    icon: '⭐',
    description: 'Alle favorittbilder',
    count: favorites.length,
    photos: favorites,
    color: 'from-yellow-500 to-amber-500',
  };
};

/**
 * Generer album for bilder uten album
 * @param {Array} photos - Array av bilder
 * @returns {Object|null} - Usortert-album
 */
export const generateUnassignedAlbum = (photos) => {
  const unassigned = photos.filter((p) => !p.albumId);
  
  if (unassigned.length === 0) return null;

  return {
    id: 'smart-unassigned',
    name: 'Uten album',
    icon: '📁',
    description: 'Bilder som ikke er organisert',
    count: unassigned.length,
    photos: unassigned,
    color: 'from-gray-500 to-slate-500',
  };
};

/**
 * Generer alle smarte album
 * @param {Array} photos - Array av bilder
 * @returns {Object} - Alle smarte album kategorisert
 */
export const generateAllSmartAlbums = (photos) => {
  return {
    content: generateSmartAlbums(photos),
    time: generateTimeBasedAlbums(photos),
    favorites: generateFavoritesAlbum(photos),
    unassigned: generateUnassignedAlbum(photos),
  };
};

/**
 * Finn beste album for et bilde
 * @param {Object} photo - Bilde
 * @returns {string} - Album ID
 */
export const suggestAlbumForPhoto = (photo) => {
  if (!photo.aiTags || photo.aiTags.length === 0) {
    return 'smart-unassigned';
  }

  // Prioriter basert på tags
  if (hasTag(photo, ['person', 'people'])) return 'smart-people';
  if (hasTag(photo, ['nature', 'landscape'])) return 'smart-nature';
  if (hasTag(photo, ['food', 'dish'])) return 'smart-food';
  if (hasTag(photo, ['animal', 'pet'])) return 'smart-animals';
  if (hasTag(photo, ['building', 'architecture'])) return 'smart-architecture';
  if (hasTag(photo, ['travel', 'beach'])) return 'smart-travel';
  
  return 'smart-unassigned';
};

// Helper functions
const hasTag = (photo, tags) => {
  if (!photo.aiTags || photo.aiTags.length === 0) return false;
  const photoTags = photo.aiTags.map((t) => t.toLowerCase());
  return tags.some((tag) => photoTags.some((pt) => pt.includes(tag)));
};

export default {
  generateSmartAlbums,
  generateTimeBasedAlbums,
  generateFavoritesAlbum,
  generateUnassignedAlbum,
  generateAllSmartAlbums,
  suggestAlbumForPhoto,
};
