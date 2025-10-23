// ============================================================================
// COMPONENT: AlbumCard.jsx – Twilight Theme med 3D Tilt Effect og cover-støtte
// ============================================================================
import React, { useState } from 'react';

const AlbumCard = ({ album, photos = [], onOpen }) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  // Prioriter album.cover, ellers bruk første bilde i albumet
  const coverUrl = album.cover || photos.find(p => p.albumId === album.id)?.url || '';

  const count = photos.filter(p => p.albumId === album.id).length;

  let updatedStr = '';
  const updatedAt = album.updatedAt || album.createdAt;
  if (updatedAt) {
    const d = new Date(updatedAt);
    if (!isNaN(d.getTime())) {
      updatedStr = d.toLocaleDateString('no-NO', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    }
  }

  // 3D Tilt effect on mouse move
  const handleMouseMove = e => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      className="ripple-effect album-card glass cursor-pointer"
      onClick={() => onOpen && onOpen(album)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      role="button"
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: tilt.x === 0 ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
      }}
    >
     {coverUrl ? (
  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-black/10 flex items-center justify-center">
    <img
      src={coverUrl}
      alt={album.name || "Album"}
      className="max-h-full max-w-full object-contain rounded-xl"
      loading="lazy"
    />
  </div>
) : (
  <div className="album-thumb flex items-center justify-center text-gray-400 bg-gradient-to-br from-gray-900 to-indigo-900 aspect-[16/9] rounded-xl">
    <svg
      className="w-16 h-16 opacity-30"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
      />
    </svg>
  </div>
)}

<div className="album-meta mt-2">
  <div className="album-title font-semibold">{album.name || "Uten navn"}</div>
  <div className="album-sub text-sm opacity-80">
    {count} {count === 1 ? "bilde" : "bilder"}
    {updatedStr ? " • " + updatedStr : ""}
  </div>
</div>
    </div>
  );
};

export default AlbumCard;
