# Visual Enhancements - Quick Reference Guide

## 🎨 Most Used Classes from styles-enhanced.css

### Ripple Effects & Micro-interactions

```jsx
// Basic ripple on any clickable element
<button className="ripple-effect">
  Click me
</button>

// Card with press animation
<div className="card-press ripple-effect">
  Pressable card
</div>

// Combo for buttons
<button className="ripple-effect card-press bg-purple-500">
  Premium Button
</button>
```

---

### Glass-morphism & Premium Cards

```jsx
// Basic glass effect
<div className="glass">
  Content with glass effect
</div>

// Premium card with glass
<div className="glass card-premium">
  Premium card
</div>

// Smaller glass panels
<div className="glass-sm">
  Subtle glass
</div>

// Card with gradient border
<div className="card-gradient-border">
  <div className="bg-gray-900 rounded-xl p-6">
    Inner content
  </div>
</div>
```

---

### 3D Card Effects

```jsx
// Complete 3D hoverable card
<div className="card-3d-hover">
  <div className="card-3d-inner">
    <img className="card-3d-layer-front" src="..." />
    <div className="card-3d-layer-mid">
      Text overlay
    </div>
  </div>
</div>

// Photo container with 3D and gradient overlay
<div className="photo-container-enhanced">
  <img src="photo.jpg" />
</div>
```

---

### Bottom Navigation

```jsx
// Floating premium navigation
<nav className="bottom-nav-float">
  <div className="flex justify-around items-center gap-2">
    <button className="nav-item-premium active">
      <Home className="w-5 h-5" />
      <span className="text-xs">Home</span>
    </button>
    <button className="nav-item-premium">
      <Image className="w-5 h-5" />
      <span className="text-xs">Albums</span>
    </button>
  </div>
</nav>
```

---

### Loading States

```jsx
// Premium skeleton screen
<div className="skeleton-premium" style={{ height: '200px' }}>
  {/* Shimmer effect automatically applied */}
</div>

// Skeleton card layout
<div className="skeleton-premium h-64">
  <div className="h-40 bg-gradient-to-br from-purple-500/10 to-transparent" />
  <div className="p-4 space-y-2">
    <div className="h-4 bg-white/10 rounded w-3/4" />
    <div className="h-3 bg-white/10 rounded w-1/2" />
  </div>
</div>
```

---

### Premium Inputs

```jsx
// Enhanced input field
<input
  type="text"
  className="input-premium"
  placeholder="Enter text..."
/>

// With focus animation
<input
  type="text"
  className="input-premium focus:scale-[1.02] transition-all"
  placeholder="Animated input..."
/>
```

---

### Toast Notifications

```jsx
// Premium toast
<div className="toast-premium">
  <CheckCircle className="w-5 h-5 text-green-400" />
  <p>Action successful!</p>
  <button className="toast-close">
    <X size={16} />
  </button>
</div>
```

---

### Modals

```jsx
// Premium modal content
<div className="modal-content-enhanced">
  <h2>Modal Title</h2>
  <p>Modal content with glass effect and premium styling</p>
</div>
```

---

### Animations

```jsx
// Fade in on mount
<div className="animate-fade-in-up">
  Content
</div>

// Staggered list animation
{items.map((item, index) => (
  <div
    key={item.id}
    className="animate-fade-in-up"
    style={{ animationDelay: `${index * 50}ms` }}
  >
    {item.name}
  </div>
))}
```

---

### Utility Classes

```jsx
// Text gradient
<h1 className="text-gradient">
  Gradient Text
</h1>

// Heavy backdrop blur
<div className="backdrop-blur-heavy">
  Heavily blurred background
</div>

// GPU acceleration
<div className="gpu-layer">
  Performance optimized
</div>

// Will animate (use before animation starts)
<div className="will-animate">
  About to animate
</div>

// Remove will-change after animation
<div className="animate-complete">
  Animation finished
</div>
```

---

### Glow Effects

```jsx
// Golden glow
<div className="glow-gold">
  Premium feature
</div>

// Purple glow
<div className="glow-purple">
  Active state
</div>

// Card with hover glow
<div className="card-glow">
  Hover for glow effect
</div>
```

---

## 🎯 Common Patterns

### Album Card (Complete Example)

```jsx
<div className="card-3d-hover cursor-pointer">
  <div className="card-3d-inner">
    <div className="photo-container-enhanced ripple-effect card-press">
      <img
        src={album.cover}
        className="w-full h-48 object-cover card-3d-layer-front"
      />
      
      {/* Favorite button */}
      <button className="absolute top-3 right-3 p-2 rounded-full 
                       bg-black/30 backdrop-blur-sm hover:bg-black/50 
                       transition-all ripple-effect">
        <Star className="w-5 h-5" />
      </button>

      {/* Info overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 
                    bg-gradient-to-t from-black/80 to-transparent
                    opacity-0 hover:opacity-100 transition-opacity
                    card-3d-layer-mid">
        <p className="text-white font-medium">{album.name}</p>
        <p className="text-white/70 text-sm">{album.photoCount} photos</p>
      </div>
    </div>
  </div>
</div>
```

---

### Premium Button (Complete Example)

```jsx
<button
  className="ripple-effect card-press
           px-6 py-3 rounded-xl
           bg-gradient-to-r from-purple-500 to-pink-500
           hover:from-purple-600 hover:to-pink-600
           text-white font-medium
           transition-all duration-300
           shadow-lg hover:shadow-2xl
           glow-purple"
>
  Upload Photos
</button>
```

---

### Premium Modal (Complete Example)

```jsx
<div className="fixed inset-0 bg-black/50 backdrop-blur-sm 
              flex items-center justify-center z-50
              animate-fade-in-up">
  <div className="modal-content-enhanced glass card-premium
                max-w-2xl w-full m-4 p-6 rounded-2xl">
    <h2 className="text-2xl font-bold mb-4">Create Album</h2>
    
    <input
      type="text"
      className="input-premium w-full mb-4"
      placeholder="Album name..."
    />
    
    <div className="flex justify-end gap-3">
      <button className="ripple-effect px-5 py-2 rounded-xl
                       bg-gray-700/60 hover:bg-gray-600/70">
        Cancel
      </button>
      <button className="ripple-effect px-5 py-2 rounded-xl
                       bg-gradient-to-r from-purple-500 to-pink-500
                       hover:from-purple-600 hover:to-pink-600">
        Create
      </button>
    </div>
  </div>
</div>
```

---

### Loading State (Complete Example)

```jsx
// When loading
{loading ? (
  <div className="album-grid">
    {Array(6).fill(0).map((_, i) => (
      <div key={i} className="skeleton-premium h-64">
        <div className="h-40 bg-gradient-to-br from-purple-500/10 to-transparent" />
        <div className="p-4 space-y-2">
          <div className="h-4 bg-white/10 rounded w-3/4" />
          <div className="h-3 bg-white/10 rounded w-1/2" />
        </div>
      </div>
    ))}
  </div>
) : (
  <div className="album-grid">
    {albums.map((album, index) => (
      <AlbumCard 
        key={album.id}
        className="animate-fade-in-up"
        style={{ animationDelay: `${index * 50}ms` }}
        {...album} 
      />
    ))}
  </div>
)}
```

---

## 🎨 Color Variables Reference

```css
/* Main theme colors (already defined in styles-enhanced.css) */
--accent: #8b5cf6;        /* Purple */
--gold: #fbbf24;          /* Golden */
--text-primary: #f3f4f6;  /* Light gray */
--text-muted: #9ca3af;    /* Muted gray */

/* Usage in JSX */
<div style={{ color: 'var(--accent)' }}>
  Purple text
</div>
```

---

## 📱 Responsive Helpers

```jsx
// Hide on mobile
<div className="hidden md:block">
  Desktop only
</div>

// Mobile-specific padding
<div className="p-4 md:p-6 lg:p-8">
  Responsive padding
</div>

// Mobile-optimized navigation
<nav className="bottom-nav-float 
              bottom-12 md:bottom-20 
              w-[calc(100%-24px)] md:w-[420px]">
  Navigation
</nav>
```

---

## ⚡ Performance Tips

1. **Use gpu-layer for animated elements:**
```jsx
<div className="gpu-layer animate-fade-in-up">
  GPU accelerated animation
</div>
```

2. **Add will-animate before animation starts:**
```jsx
<div className={isAnimating ? 'will-animate' : 'animate-complete'}>
  Optimized animation
</div>
```

3. **Use backdrop-filter sparingly:**
```jsx
// Good - on fixed elements
<nav className="fixed bottom-0 backdrop-blur-heavy">

// Avoid - on scrolling content
<div className="overflow-scroll backdrop-blur-heavy"> {/* ❌ */}
```

---

## 🎯 Before/After Examples

### Before: Basic Button
```jsx
<button className="bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded">
  Click me
</button>
```

### After: Premium Button
```jsx
<button className="ripple-effect card-press
                 bg-gradient-to-r from-purple-500 to-pink-500
                 hover:from-purple-600 hover:to-pink-600
                 px-6 py-3 rounded-xl
                 transition-all duration-300
                 shadow-lg hover:shadow-2xl">
  Click me
</button>
```

---

### Before: Basic Card
```jsx
<div className="bg-gray-900 rounded p-4">
  Content
</div>
```

### After: Premium Card
```jsx
<div className="glass card-premium rounded-2xl p-6
              card-3d-hover">
  <div className="card-3d-inner">
    Content
  </div>
</div>
```

---

## 📚 Full Documentation

For complete CSS definitions, see:
- `src/styles-enhanced.css` - All premium styles
- `src/index.css` - Base styles and animations
- `src/experimental/ai/components/EnhancedComponents.jsx` - Usage examples

---

**Happy styling! 🎨**
