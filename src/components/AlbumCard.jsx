// ============================================================================
// COMPONENT: AlbumCard.jsx – viser ett album som kort
// ============================================================================
import React from "react";

const AlbumCard = ({ album, photos = [], onOpen }) => {
  // 1) Bruk cover fra album hvis satt. 2) Fallback til første bilde i albumet.
  const fallback = photos.find((p) => p.albumId === album.id) || null;
  const coverUrl = album.cover || (fallback ? fallback.url || fallback.src : "");
  const count = photos.filter((p) => p.albumId === album.id).length;

  // Ryddig dato
  let updatedStr = "";
  const updatedAt = album.updatedAt || album.createdAt;
  if (updatedAt) {
    const d = new Date(updatedAt);
    if (!isNaN(d.getTime())) {
      updatedStr = d.toLocaleDateString("no-NO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    }
  }

  return (
    <div
      className="album-card glass cursor-pointer"
      onClick={() => onOpen && onOpen(album)}
      role="button"
    >
      {coverUrl ? (
        <img
          src={coverUrl}
          alt={album.name || "Album"}
          className="album-thumb"
          loading="lazy"
        />
      ) : (
        <div
          className="album-thumb flex items-center justify-center text-gray-400"
          style={{ background: "#e5e7eb" }}
        >
          Ingen bilde
        </div>
      )}

      <div className="album-meta">
        <div className="album-title font-semibold">
          {album.name || "Uten navn"}
        </div>
        <div className="album-sub text-sm text-gray-500">
          {count} {count === 1 ? "bilde" : "bilder"}
          {updatedStr ? " • " + updatedStr : ""}
        </div>
      </div>
    </div>
  );
};

export default AlbumCard;
