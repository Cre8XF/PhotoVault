# HomeDashboard - Favorites & Content

## INSTRUCTIONS FOR CLAUDE CODE

Read @docs/design-system.md for design tokens. Implement all changes directly. Test before committing. Commit with message: "feat(home): add masonry favorites and enhanced sections"

## FILES TO MODIFY

- @src/pages/HomeDashboard.jsx
- Create @src/components/MasonryGrid.jsx (optional, or use react-masonry-css)

## TARGET CHANGES

Transform favorites, recent uploads, and smart albums sections with:

- Masonry layout for favorites
- Horizontal scroll carousel for recent
- Interactive smart album cards
- Smooth animations and transitions

## IMPLEMENTATION

### 1. Install Dependencies (if needed)

```bash
npm install react-masonry-css
```

### 2. Update Favorites Section

Replace current favorites section:

```jsx
import Masonry from 'react-masonry-css';

// Masonry breakpoints
const masonryBreakpoints = {
  default: 4,
  1280: 3,
  1024: 2,
  768: 2,
  640: 2
};

// In component, replace favorites section:
{
  favoritePhotos.length > 0 && (
    <motion.section className="mb-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
      <div className="flex justify-between items-center mb-4">
        <motion.h2 className="text-2xl font-bold flex items-center gap-2" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.7 }}>
          <Star className="w-6 h-6 text-yellow-400" fill="currentColor" />
          {t('home:favoritesTitle')}
        </motion.h2>
        <button onClick={() => onNavigate('search')} className="ripple-effect text-sm text-purple-400 hover:text-purple-300 transition flex items-center gap-1 group">
          <span>
            {t('common:seeAll')} ({stats.favorites})
          </span>
          <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            →
          </motion.span>
        </button>
      </div>

      <Masonry breakpointCols={masonryBreakpoints} className="flex -ml-4 w-auto" columnClassName="pl-4 bg-clip-padding">
        {favoritePhotos.map((photo, i) => (
          <motion.div
            key={photo.id}
            className="relative group cursor-pointer mb-4"
            onClick={() => onNavigate('search')}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 + i * 0.05 }}
            whileHover={{ scale: 1.05, y: -8 }}
            whileTap={{ scale: 0.95 }}
          >
            <LazyImage
              src={photo.url}
              thumbnail={photo.thumbnailSmall}
              photoId={photo.id}
              alt={photo.name || ''}
              className="w-full rounded-xl transition-all duration-300 border border-white/10 group-hover:border-yellow-400/50 shadow-lg"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl">
              <div className="absolute bottom-3 left-3 right-3">
                {photo.name && <p className="text-white text-sm font-medium truncate">{photo.name}</p>}
                {photo.category && <p className="text-white/70 text-xs mt-1">{photo.category}</p>}
              </div>
            </div>

            <motion.div className="absolute top-2 right-2" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.9 + i * 0.05, type: 'spring' }}>
              <Star className="w-5 h-5 text-yellow-400 drop-shadow-lg" fill="currentColor" />
            </motion.div>
          </motion.div>
        ))}
      </Masonry>
    </motion.section>
  );
}
```

### 3. Update Recent Uploads Section

Replace with horizontal scroll carousel:

```jsx
{
  recentPhotos.length > 0 && (
    <motion.section className="mb-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}>
      <div className="flex justify-between items-center mb-4">
        <motion.h2 className="text-2xl font-bold flex items-center gap-2" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.1 }}>
          <Clock className="w-6 h-6 text-purple-400" />
          {t('home:recentUploads')}
        </motion.h2>
        <button onClick={() => onNavigate('albums')} className="ripple-effect text-sm text-purple-400 hover:text-purple-300 transition flex items-center gap-1">
          <span>{t('common:seeAll')}</span>
          <motion.span animate={{ x: [0, 4, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            →
          </motion.span>
        </button>
      </div>

      <div className="relative">
        {/* Gradient overlays for scroll hint */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[var(--bg-primary)] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[var(--bg-primary)] to-transparent z-10 pointer-events-none" />

        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4">
          <div className="flex gap-4 pb-4">
            {recentPhotos.map((photo, i) => (
              <motion.div
                key={photo.id}
                className="flex-shrink-0 w-48 group cursor-pointer"
                onClick={() => onNavigate('albums')}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 + i * 0.05 }}
                whileHover={{ y: -8, scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="relative overflow-hidden rounded-xl mb-2">
                  <LazyImage
                    src={photo.url}
                    thumbnail={photo.thumbnailSmall}
                    photoId={photo.id}
                    alt={photo.name || ''}
                    className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110 border border-white/10"
                  />

                  {photo.aiAnalyzed && (
                    <div className="absolute top-2 left-2 bg-purple-600/80 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {photo.name && <p className="text-sm truncate opacity-70 group-hover:opacity-100 transition-opacity">{photo.name}</p>}

                <p className="text-xs text-gray-500 mt-1">
                  {new Date(photo.createdAt).toLocaleDateString('no-NO', {
                    day: 'numeric',
                    month: 'short'
                  })}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
```

### 4. Update Smart Albums Section

Add interactive cards with animations:

```jsx
<motion.section className="mb-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}>
  <motion.h2 className="text-2xl font-bold mb-4 flex items-center gap-2" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.5 }}>
    <Sparkles className="w-6 h-6 text-purple-400" />
    {t('home:smartAlbums')}
  </motion.h2>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {smartAlbums.map((album, i) => (
      <motion.button
        key={album.id}
        onClick={() => onNavigate('search')}
        className="glass p-6 rounded-2xl text-left hover:bg-white/10 transition-all duration-300 group relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.6 + i * 0.1 }}
        whileHover={{ scale: 1.05, y: -4 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Animated gradient background */}
        <motion.div className={`absolute inset-0 bg-gradient-to-br ${album.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

        <div className="relative z-10">
          <motion.div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${album.color} mb-3`} whileHover={{ rotate: [0, -10, 10, -10, 0] }} transition={{ duration: 0.5 }}>
            <album.icon className="w-6 h-6 text-white" />
          </motion.div>

          <h3 className="font-semibold text-lg mb-1 group-hover:text-purple-400 transition-colors">{album.name}</h3>

          <div className="flex items-center gap-2">
            <motion.p className="text-sm opacity-70" key={album.count} initial={{ scale: 1.5, color: '#8B5CF6' }} animate={{ scale: 1, color: 'inherit' }} transition={{ duration: 0.3 }}>
              <AnimatedCounter end={album.count} /> {album.count === 1 ? t('common:photo') : t('common:photos')}
            </motion.p>
          </div>
        </div>

        {/* Hover arrow */}
        <motion.div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100" initial={{ x: -10 }} whileHover={{ x: 0 }} transition={{ duration: 0.2 }}>
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">→</div>
        </motion.div>
      </motion.button>
    ))}
  </div>
</motion.section>
```

### 5. Add CSS for Scrollbar Hide

Add to your global CSS or component:

```css
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
```

### 6. Update AI Tools Section

Add interactive cards:

```jsx
<motion.section className="mb-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}>
  <motion.h2 className="text-2xl font-bold mb-4 flex items-center gap-2" initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 1.9 }}>
    <Wand2 className="w-6 h-6 text-purple-400" />
    {t('home:aiTools')}
  </motion.h2>

  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
    {[
      { icon: Scan, title: t('home:autoSortTitle'), desc: t('home:autoSortDesc'), color: 'from-purple-600 to-purple-800' },
      { icon: ImagePlus, title: t('home:enhanceTitle'), desc: t('home:enhanceDesc'), color: 'from-blue-600 to-blue-800' },
      { icon: Wand2, title: t('home:moreAI'), desc: t('home:viewAllTools'), color: 'from-pink-600 to-pink-800' }
    ].map((tool, i) => (
      <motion.button
        key={i}
        className="glass p-4 rounded-xl hover:bg-white/15 transition flex items-center gap-3 text-left group"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2.0 + i * 0.1 }}
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.95 }}
      >
        <motion.div className={`p-2 bg-gradient-to-br ${tool.color} rounded-lg flex-shrink-0`} whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
          <tool.icon className="w-5 h-5" />
        </motion.div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm group-hover:text-purple-400 transition-colors">{tool.title}</p>
          <p className="text-xs opacity-70 truncate">{tool.desc}</p>
        </div>
      </motion.button>
    ))}
  </div>
</motion.section>
```

## TESTING CHECKLIST

- [ ] Masonry layout works on all breakpoints
- [ ] Favorites images load with LazyImage
- [ ] Horizontal scroll smooth on mobile
- [ ] Scroll hints (gradients) visible
- [ ] Smart albums animate on hover
- [ ] AI tools cards rotate on hover
- [ ] All animations 60fps
- [ ] No layout shift
- [ ] Touch interactions work (mobile)
- [ ] i18n strings present

## PERFORMANCE

- Use React.memo for photo items
- Lazy load images with IntersectionObserver
- Debounce scroll events if needed
- CSS transforms for animations (GPU)

## COMMIT MESSAGE

```
feat(home): add masonry favorites and enhanced sections

- Implement masonry layout for favorites
- Add horizontal scroll carousel for recent photos
- Enhance smart album cards with hover animations
- Add interactive AI tools section
- Improve mobile touch interactions

All animations run at 60fps with GPU acceleration
```

## NEXT STEPS

Proceed to: `@docs/prompts/03-album-grid.md`

---

END OF PROMPT
