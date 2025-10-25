# PhotoVault Design System

## 🎨 Color Palette

```css
/* Primary */
--primary-purple: #8b5cf6;
--primary-pink: #ec4899;
--primary-orange: #f97316;

/* Gradients */
--gradient-primary: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%);
--gradient-hero: linear-gradient(135deg, #8b5cf6 0%, #ec4899 50%, #f97316 100%);
--gradient-blue: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
--gradient-green: linear-gradient(135deg, #10b981 0%, #14b8a6 100%);

/* Status Colors */
--success: #10b981;
--warning: #f59e0b;
--error: #ef4444;
--info: #3b82f6;

/* Dark Theme */
--bg-primary: #0f0f0f;
--bg-secondary: #1a1a1a;
--bg-tertiary: #2a2a2a;

/* Text */
--text-primary: #ffffff;
--text-secondary: rgba(255, 255, 255, 0.7);
--text-tertiary: rgba(255, 255, 255, 0.5);

/* Glass */
--glass-bg: rgba(255, 255, 255, 0.05);
--glass-border: rgba(255, 255, 255, 0.1);
--glass-hover: rgba(255, 255, 255, 0.1);
```

## 📏 Spacing

```css
--space-1: 0.25rem; /* 4px */
--space-2: 0.5rem; /* 8px */
--space-3: 0.75rem; /* 12px */
--space-4: 1rem; /* 16px */
--space-6: 1.5rem; /* 24px */
--space-8: 2rem; /* 32px */
--space-12: 3rem; /* 48px */
--space-16: 4rem; /* 64px */
```

## 🎭 Animations

### Durations

```css
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-slow: 500ms;
```

### Easings

```css
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
--ease-elastic: cubic-bezier(0.68, -0.55, 0.265, 1.55);
```

### Framer Motion Variants

```jsx
// Fade in
export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3 }
};

// Slide up
export const slideUp = {
  initial: { y: 20, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  transition: { duration: 0.3 }
};

// Stagger container
export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.05
    }
  }
};

// Scale on hover
export const scaleHover = {
  whileHover: { scale: 1.05 },
  whileTap: { scale: 0.95 }
};
```

## 🎴 Components

### Glass Card

```jsx
<div className="
  bg-white/5
  backdrop-blur-xl
  border border-white/10
  rounded-2xl
  shadow-lg shadow-black/20
  p-6
  hover:bg-white/10
  transition-all duration-300
">
```

### Button Primary

```jsx
<button className="
  px-6 py-3
  bg-gradient-to-r from-purple-600 to-pink-600
  hover:from-purple-700 hover:to-pink-700
  text-white font-semibold
  rounded-xl
  transition-all duration-300
  shadow-lg shadow-purple-500/25
  hover:shadow-xl hover:shadow-purple-500/40
  hover:scale-105
">
```

### Input Field

```jsx
<input className="
  w-full px-4 py-3
  bg-white/5
  border border-white/10
  focus:border-purple-500/50
  focus:ring-2 focus:ring-purple-500/20
  rounded-xl
  transition-all duration-300
  outline-none
  text-white
  placeholder-white/50
">
```

## 🔤 Typography

```css
/* Sizes */
--text-xs: 0.75rem; /* 12px */
--text-sm: 0.875rem; /* 14px */
--text-base: 1rem; /* 16px */
--text-lg: 1.125rem; /* 18px */
--text-xl: 1.25rem; /* 20px */
--text-2xl: 1.5rem; /* 24px */
--text-3xl: 1.875rem; /* 30px */
--text-4xl: 2.25rem; /* 36px */

/* Weights */
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

## 📐 Breakpoints

```css
/* Mobile First */
sm: 640px; /* Mobile landscape */
md: 768px; /* Tablet */
lg: 1024px; /* Desktop */
xl: 1280px; /* Large desktop */
2xl: 1536px; /* Extra large */
```

## 🎬 Loading States

```jsx
// Skeleton
<div className="animate-pulse space-y-3">
  <div className="h-4 bg-white/10 rounded w-3/4"></div>
  <div className="h-4 bg-white/10 rounded w-1/2"></div>
</div>

// Spinner
<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
```

## 🏷️ Status Badges

```jsx
<span className="px-3 py-1 rounded-full text-sm font-medium
  bg-green-500/20 text-green-400 border border-green-500/30">
  Success
</span>

<span className="px-3 py-1 rounded-full text-sm font-medium
  bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
  Warning
</span>

<span className="px-3 py-1 rounded-full text-sm font-medium
  bg-red-500/20 text-red-400 border border-red-500/30">
  Error
</span>
```

## 🌊 Shadows

```css
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

/* Colored shadows */
--shadow-purple: 0 10px 30px rgba(139, 92, 246, 0.3);
--shadow-pink: 0 10px 30px rgba(236, 72, 153, 0.3);
```

## 📱 Touch Targets

Minimum touch target: 44x44px (iOS/Android standard)

```jsx
<button className="min-w-[44px] min-h-[44px] p-2">
```

## ♿ Accessibility

```jsx
// Focus visible
className="focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"

// Skip to content
<a href="#main" className="sr-only focus:not-sr-only">
  Skip to content
</a>

// ARIA labels
<button aria-label="Close modal">
  <X className="w-5 h-5" />
</button>
```

---

END OF design-system.md
