// src/utils/searchPhotos.js
export function searchPhotos(photos, query) {
  const q = query.toLowerCase();
  return photos.filter(p =>
    [p.name, ...(p.aiTags || [])].some(v => (v || "").toLowerCase().includes(q))
  );
}
