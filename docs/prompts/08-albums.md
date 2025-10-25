# AlbumsPage - Enhanced Album Grid

## INSTRUCTIONS FOR CLAUDE CODE

Read @docs/design-system.md for design tokens. Implement all changes directly - no approval needed. Test your changes before finishing. Commit with message: "feat(albums): enhanced grid with masonry and quick stats"

## FILES TO MODIFY

- @src/pages/AlbumsPage.jsx
- Create @src/components/AlbumCard.jsx

## CURRENT STATE ANALYSIS

AlbumsPage currently has:

- Basic grid layout
- Simple album thumbnails
- Limited interaction
- No quick stats

## TARGET STATE

Premium album browsing with:

- Masonry layout for varied sizes
- Hover effects with quick stats
- Drag-to-reorder capability
- Smart album indicators
- Quick actions overlay

## IMPLEMENTATION STEPS

### 1. Create AlbumCard Component

**File:** `src/components/AlbumCard.jsx`

```jsx
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FolderOpen, Star, Lock, Users, Sparkles,
  MoreVertical, Edit2, Trash2, Share2
} from 'lucide-react';

export const AlbumCard = ({
  album,
  index,
  onNavigate,
  onEdit,
  onDelete,
  onShare
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <motion.div
      className="group relative bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden
                 border border-white/10 hover:border-purple-500/50 transition-all
                 cursor-pointer"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onNavigate('album', album.id)}
    >
      {/* Album Cover */}
      <div className="relative aspect-square overflow-hidden bg-gradient-to-br
                      from-purple-900/20 to-pink-900/20">
        {album.coverPhoto ? (
          <img
            src={album.coverPhoto.thumbnailSmall || album.coverPhoto.url}
            alt={album.name}
            className="w-full h-full object-cover transition-transform duration-500
                       group-hover:scale-110"
          />
        ) : (
          <div className="flex items-center gap-2 text-sm opacity-70 mb-2">
          <stat.icon className="w-4 h-4" />
          {stat.label}
        </div>
        <div className="text-2xl font-bold">{stat.value}</div>
      </motion.div>
    ))}
  </motion.div>

  {/* Albums Grid/Masonry */}
  {viewMode === 'masonry' ? (
    <Masonry
      breakpointCols={masonryBreakpoints}
      className="flex -ml-4 w-auto"
      columnClassName="pl-4 bg-clip-padding"
    >
      {sortedAlbums.map((album, index) => (
        <div key={album.id} className="mb-4">
          <AlbumCard
            album={album}
            index={index}
            onNavigate={onNavigate}
            onEdit={handleEditAlbum}
            onDelete={handleDeleteAlbum}
            onShare={handleShareAlbum}
          />
        </div>
      ))}
    </Masonry>
  ) : viewMode === 'grid' ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {sortedAlbums.map((album, index) => (
        <AlbumCard
          key={album.id}
          album={album}
          index={index}
          onNavigate={onNavigate}
          onEdit={handleEditAlbum}
          onDelete={handleDeleteAlbum}
          onShare={handleShareAlbum}
        />
      ))}
    </div>
  ) : (
    <div className="space-y-3">
      {sortedAlbums.map((album, index) => (
        <motion.div
          key={album.id}
          className="glass p-4 rounded-xl hover:bg-white/10 transition cursor-pointer
                     flex items-center gap-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ x: 4 }}
          onClick={() => onNavigate('album', album.id)}
        >
          <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0
                          bg-gradient-to-br from-purple-900/20 to-pink-900/20">
            {album.coverPhoto ? (
              <img
                src={album.coverPhoto.thumbnailSmall}
                alt={album.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FolderOpen className="w-6 h-6 opacity-30" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold truncate">{album.name}</h3>
            <div className="flex items-center gap-4 mt-1 text-sm opacity-70">
              <span>{album.photoCount} bilder</span>
              {album.isShared && <span className="text-blue-400">Delt</span>}
              {album.isSmartAlbum && <span className="text-purple-400">Smart</span>}
            </div>
          </div>

          <div className="text-sm opacity-50">
            {new Date(album.lastUpdated).toLocaleDateString('no-NO', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </div>
        </motion.div>
      ))}
    </div>
  )}

  {/* Empty State */}
  {albums.length === 0 && (
    <motion.div
      className="text-center py-20"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-purple-600 to-pink-600
                      rounded-full flex items-center justify-center">
        <FolderOpen className="w-10 h-10" />
      </div>
      <h3 className="text-xl font-semibold mb-2">Ingen album ennå</h3>
      <p className="text-sm opacity-70 mb-6">
        Opprett ditt første album for å organisere bildene dine
      </p>
      <motion.button
        onClick={handleCreateAlbum}
        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600
                   hover:from-purple-700 hover:to-pink-700 rounded-xl
                   font-semibold inline-flex items-center gap-2"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Plus className="w-5 h-5" />
        Opprett album
      </motion.button>
    </motion.div>
  )}
</div>
```

### 3. Add Drag-to-Reorder (Optional Enhancement)

```jsx
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const [isDragging, setIsDragging] = useState(false);

const handleDragEnd = result => {
  if (!result.destination) return;

  const items = Array.from(sortedAlbums);
  const [reorderedItem] = items.splice(result.source.index, 1);
  items.splice(result.destination.index, 0, reorderedItem);

  // Update order in backend
  updateAlbumOrder(items);
  setIsDragging(false);
};

// Wrap albums in DragDropContext
<DragDropContext onDragEnd={handleDragEnd} onDragStart={() => setIsDragging(true)}>
  <Droppable droppableId="albums">
    {provided => (
      <div ref={provided.innerRef} {...provided.droppableProps} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedAlbums.map((album, index) => (
          <Draggable key={album.id} draggableId={album.id} index={index}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.draggableProps}
                {...provided.dragHandleProps}
                style={{
                  ...provided.draggableProps.style,
                  opacity: snapshot.isDragging ? 0.5 : 1
                }}
              >
                <AlbumCard album={album} index={index} onNavigate={onNavigate} onEdit={handleEditAlbum} onDelete={handleDeleteAlbum} onShare={handleShareAlbum} />
              </div>
            )}
          </Draggable>
        ))}
        {provided.placeholder}
      </div>
    )}
  </Droppable>
</DragDropContext>;
```

## TESTING CHECKLIST

- [ ] Masonry layout works on all breakpoints
- [ ] View mode switching smooth (masonry/grid/list)
- [ ] Sort options work correctly
- [ ] Album cards hover effects smooth
- [ ] Quick stats overlay displays correctly
- [ ] Context menu appears on click
- [ ] Badges display for shared/private/smart albums
- [ ] Empty state shows when no albums
- [ ] Create album button functional
- [ ] Mobile: cards stack properly
- [ ] Touch interactions work
- [ ] All animations 60fps
- [ ] No layout shift
- [ ] i18n works (NO/EN)

## PERFORMANCE REQUIREMENTS

- Album grid renders in <500ms
- Hover animations 60fps
- View mode switching <200ms
- Smooth masonry reflow
- Lazy load album covers

## COMMIT MESSAGE

```
feat(albums): enhanced grid with masonry and quick stats

- Add masonry layout with responsive breakpoints
- Implement AlbumCard component with hover effects
- Add quick stats overlay on hover
- Create view mode toggle (masonry/grid/list)
- Add sort options (updated/name/size)
- Implement context menu for quick actions
- Add badges for album types (shared/private/smart)
- Create empty state with CTA
- Optional: Add drag-to-reorder capability

All animations run at 60fps with GPU acceleration
```

## NEXT SESSION

After this is complete and committed, proceed to: `@docs/prompts/09-ai-settings.md`

---

END OF PROMPT className="w-full h-full flex items-center justify-center"> <FolderOpen className="w-16 h-16 opacity-20" /> </div> )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40
                        to-transparent opacity-0 group-hover:opacity-100 transition-opacity
                        duration-300" />

        {/* Quick Stats Overlay */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center gap-6"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="text-center">
            <div className="text-2xl font-bold text-white">
              {album.photoCount}
            </div>
            <div className="text-xs text-white/70">Bilder</div>
          </div>

          {album.favoriteCount > 0 && (
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {album.favoriteCount}
              </div>
              <div className="text-xs text-white/70">Favoritter</div>
            </div>
          )}

          {album.aiAnalyzedCount > 0 && (
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">
                {album.aiAnalyzedCount}
              </div>
              <div className="text-xs text-white/70">AI</div>
            </div>
          )}
        </motion.div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-wrap gap-1">
          {album.isShared && (
            <motion.div
              className="px-2 py-1 bg-blue-600/80 backdrop-blur-sm rounded-full
                         text-xs font-medium flex items-center gap-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Users className="w-3 h-3" />
              Delt
            </motion.div>
          )}

          {album.isPrivate && (
            <motion.div
              className="px-2 py-1 bg-red-600/80 backdrop-blur-sm rounded-full
                         text-xs font-medium flex items-center gap-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.25 }}
            >
              <Lock className="w-3 h-3" />
              Privat
            </motion.div>
          )}

          {album.isSmartAlbum && (
            <motion.div
              className="px-2 py-1 bg-purple-600/80 backdrop-blur-sm rounded-full
                         text-xs font-medium flex items-center gap-1"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Sparkles className="w-3 h-3" />
              Smart
            </motion.div>
          )}
        </div>

        {/* Quick Actions Menu */}
        <div className="absolute top-2 right-2">
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-2 bg-black/50 backdrop-blur-sm rounded-lg hover:bg-black/70
                       transition opacity-0 group-hover:opacity-100"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <MoreVertical className="w-4 h-4" />
          </motion.button>

          {showMenu && (
            <motion.div
              className="absolute right-0 mt-2 w-48 glass rounded-xl overflow-hidden
                         shadow-xl border border-white/10 z-10"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => onEdit(album)}
                className="w-full px-4 py-3 hover:bg-white/10 transition flex
                           items-center gap-3 text-left"
              >
                <Edit2 className="w-4 h-4" />
                Rediger
              </button>
              <button
                onClick={() => onShare(album)}
                className="w-full px-4 py-3 hover:bg-white/10 transition flex
                           items-center gap-3 text-left"
              >
                <Share2 className="w-4 h-4" />
                Del
              </button>
              <button
                onClick={() => onDelete(album)}
                className="w-full px-4 py-3 hover:bg-white/10 transition flex
                           items-center gap-3 text-left text-red-400"
              >
                <Trash2 className="w-4 h-4" />
                Slett
              </button>
            </motion.div>
          )}
        </div>
      </div>

      {/* Album Info */}
      <div className="p-4">
        <h3 className="font-semibold text-lg truncate group-hover:text-purple-400
                       transition-colors">
          {album.name}
        </h3>

        {album.description && (
          <p className="text-sm opacity-70 mt-1 line-clamp-2">
            {album.description}
          </p>
        )}

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2 text-sm opacity-70">
            <FolderOpen className="w-4 h-4" />
            {album.photoCount} {album.photoCount === 1 ? 'bilde' : 'bilder'}
          </div>

          {album.lastUpdated && (
            <div className="text-xs opacity-50">
              {new Date(album.lastUpdated).toLocaleDateString('no-NO', {
                day: 'numeric',
                month: 'short'
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>

); };

````

### 2. Update AlbumsPage.jsx with Masonry Layout

```jsx
import Masonry from 'react-masonry-css';
import { AlbumCard } from '../components/AlbumCard';
import { Plus, Grid, List, SortAsc } from 'lucide-react';

const [viewMode, setViewMode] = useState('masonry'); // masonry, grid, list
const [sortBy, setSortBy] = useState('updated'); // updated, name, size

const masonryBreakpoints = {
  default: 4,
  1536: 4,
  1280: 3,
  1024: 3,
  768: 2,
  640: 1
};

// Sort albums
const sortedAlbums = useMemo(() => {
  const sorted = [...albums];
  switch (sortBy) {
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case 'size':
      return sorted.sort((a, b) => b.photoCount - a.photoCount);
    case 'updated':
    default:
      return sorted.sort((a, b) =>
        new Date(b.lastUpdated) - new Date(a.lastUpdated)
      );
  }
}, [albums, sortBy]);

// In component render:
<div className="container mx-auto px-4 py-8">
  {/* Header */}
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
    <motion.h1
      className="text-3xl font-bold"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      Mine album
    </motion.h1>

    <div className="flex items-center gap-3">
      {/* View Mode Toggle */}
      <div className="flex gap-1 p-1 bg-white/5 rounded-lg">
        {[
          { value: 'masonry', icon: Grid },
          { value: 'grid', icon: Grid },
          { value: 'list', icon: List }
        ].map(({ value, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setViewMode(value)}
            className={`p-2 rounded transition ${
              viewMode === value
                ? 'bg-purple-600'
                : 'hover:bg-white/10'
            }`}
          >
            <Icon className="w-4 h-4" />
          </button>
        ))}
      </div>

      {/* Sort */}
      <select
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg
                   focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20
                   transition outline-none"
      >
        <option value="updated">Sist oppdatert</option>
        <option value="name">Navn</option>
        <option value="size">Størrelse</option>
      </select>

      {/* Create Album */}
      <motion.button
        onClick={handleCreateAlbum}
        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600
                   hover:from-purple-700 hover:to-pink-700 rounded-lg
                   font-semibold flex items-center gap-2 transition"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Plus className="w-5 h-5" />
        Nytt album
      </motion.button>
    </div>
  </div>

  {/* Stats Bar */}
  <motion.div
    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
  >
    {[
      { label: 'Totalt', value: albums.length, icon: FolderOpen },
      { label: 'Bilder', value: totalPhotos, icon: ImagePlus },
      { label: 'Delte', value: sharedAlbums, icon: Users },
      { label: 'Smarte', value: smartAlbums, icon: Sparkles }
    ].map((stat, i) => (
      <motion.div
        key={i}
        className="glass p-4 rounded-xl"
        whileHover={{ y: -4 }}
      >
        <div
````
