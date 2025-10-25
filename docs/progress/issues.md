# PhotoVault Troubleshooting Guide

## 🚨 Common Issues & Solutions

### Installation & Setup

#### Issue: `npm install` fails

**Symptoms:** Dependency resolution errors, peer dependency conflicts

**Solutions:**

```bash
# Try with legacy peer deps
npm install --legacy-peer-deps

# Or use force
npm install --force

# Clear cache first
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### Issue: Build fails with Vite errors

**Symptoms:** `Cannot find module`, ESM errors

**Solutions:**

- Ensure all imports have file extensions for non-JS files
- Check vite.config.js for correct alias configuration
- Verify all dependencies are installed

### Animation Performance

#### Issue: Animations are laggy (<60fps)

**Symptoms:** Choppy transitions, dropped frames

**Solutions:**

1. **Use CSS transforms instead of position changes:**

   ```jsx
   // ❌ Bad - causes layout recalculation
   animate={{ top: 100, left: 100 }}

   // ✅ Good - GPU accelerated
   animate={{ x: 100, y: 100 }}
   ```

2. **Use `will-change` for complex animations:**

   ```css
   .animated-element {
     will-change: transform, opacity;
   }
   ```

3. **Reduce animation complexity:**

   ```jsx
   // Limit number of animated elements
   // Use React.memo for static components
   // Debounce state updates
   ```

4. **Check Chrome DevTools Performance tab:**
   - Record interaction
   - Look for long tasks (>50ms)
   - Identify expensive re-renders

#### Issue: Layout shift during animations

**Symptoms:** Content jumps, flickers

**Solutions:**

```jsx
// Use layoutId for smooth transitions
<motion.div layoutId="unique-id">

// Or use AnimatePresence
<AnimatePresence mode="wait">
  <motion.div key={key} {...animations} />
</AnimatePresence>

// Reserve space for dynamic content
<div style={{ minHeight: '200px' }}>
  {content}
</div>
```

### Framer Motion Issues

#### Issue: Exit animations not working

**Symptoms:** Components disappear instantly

**Solutions:**

```jsx
// Wrap in AnimatePresence
<AnimatePresence>
  {show && (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      Content
    </motion.div>
  )}
</AnimatePresence>

// Ensure unique keys
<AnimatePresence>
  <motion.div key={item.id} />
</AnimatePresence>
```

#### Issue: Animations trigger on mount unexpectedly

**Symptoms:** Page loads with all animations playing

**Solutions:**

```jsx
// Use initial={false} if you don't want animation on mount
<motion.div initial={false} animate={{ opacity: 1 }} />;

// Or check if page is first load
const [isFirstLoad, setIsFirstLoad] = useState(true);

<motion.div initial={isFirstLoad ? false : { opacity: 0 }} animate={{ opacity: 1 }} />;
```

### Mobile/Responsive Issues

#### Issue: Touch interactions not working

**Symptoms:** Buttons don't respond, swipes fail

**Solutions:**

```jsx
// Use both mouse and touch events
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  onTouchStart={handleTouch}
  onMouseDown={handleMouse}
>

// Increase touch target size (minimum 44x44px)
<button className="min-w-[44px] min-h-[44px] p-3">

// Disable hover effects on touch devices
@media (hover: hover) {
  .element:hover { ... }
}
```

#### Issue: Layout breaks on small screens

**Symptoms:** Overflow, cut-off content

**Solutions:**

```jsx
// Use responsive classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">

// Test at 320px width (iPhone SE)
// Use viewport units carefully
// Add horizontal scrolling for wide content
<div className="overflow-x-auto">
```

### i18n Issues

#### Issue: Translations not loading

**Symptoms:** Keys show instead of text

**Solutions:**

```js
// Check i18n initialization
import i18n from './i18n';

// Verify translation files exist
// src/locales/no/common.json
// src/locales/en/common.json

// Use correct namespace
t('common:key'); // not t('key')

// Debug missing translations
i18n.on('missingKey', (lngs, namespace, key) => {
  console.warn(`Missing: ${namespace}:${key}`);
});
```

#### Issue: Language switching not working

**Symptoms:** UI stays in same language

**Solutions:**

```jsx
// Ensure i18n.changeLanguage is called
const changeLanguage = lang => {
  i18n.changeLanguage(lang);
  localStorage.setItem('language', lang);
};

// Force re-render after change
const { i18n } = useTranslation();

useEffect(() => {
  // Component will re-render when language changes
}, [i18n.language]);
```

### Performance Issues

#### Issue: App is slow on load

**Symptoms:** Long initial load time

**Solutions:**

1. **Code splitting:**

   ```jsx
   const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));

   <Suspense fallback={<Loading />}>
     <AdminDashboard />
   </Suspense>;
   ```

2. **Optimize images:**

   ```jsx
   // Use thumbnails for grids
   <img src={photo.thumbnailSmall} />

   // Lazy load images
   <img loading="lazy" src={photo.url} />
   ```

3. **Memoize expensive computations:**
   ```jsx
   const sortedPhotos = useMemo(
     () => photos.sort(...),
     [photos, sortBy]
   );
   ```

#### Issue: Memory leaks

**Symptoms:** Increasing memory usage, browser crashes

**Solutions:**

```jsx
// Clean up event listeners
useEffect(() => {
  const handler = () => {};
  window.addEventListener('resize', handler);

  return () => window.removeEventListener('resize', handler);
}, []);

// Cancel pending requests
useEffect(() => {
  const controller = new AbortController();

  fetch(url, { signal: controller.signal });

  return () => controller.abort();
}, []);

// Clear intervals/timeouts
useEffect(() => {
  const timer = setInterval(() => {}, 1000);

  return () => clearInterval(timer);
}, []);
```

### Claude Code Specific Issues

#### Issue: Token limit reached mid-session

**Symptoms:** Claude stops responding, incomplete work

**Solutions:**

1. **Save progress immediately:**

   ```
   Stop. Commit what's done so far:
   git add .
   git commit -m "wip: [description]"
   ```

2. **Start new chat with context:**

   ```
   Continue from where we left off in Session [N].
   Reference @docs/progress/completed.md
   Last completed: [feature]
   ```

3. **Split large tasks:**
   - Break into smaller sub-tasks
   - Complete and commit each piece
   - Reference previous work with @file

#### Issue: Claude asks for approval unnecessarily

**Symptoms:** Workflow interrupted for confirmation

**Response:**

```
No approval needed. Just implement it directly.
Test and commit when done.
```

#### Issue: Implementation doesn't match design system

**Symptoms:** Wrong colors, spacing, animations

**Solutions:**

```
Reference @docs/design-system.md for:
- Colors: Use --primary-purple, --gradient-primary
- Spacing: Use --space-4, --space-8
- Animations: Use fadeIn, slideUp variants
- Components: Use glass, button patterns
```

### Git/GitHub Issues

#### Issue: Merge conflicts

**Symptoms:** Cannot push changes

**Solutions:**

```bash
# Pull latest changes
git pull origin main

# Resolve conflicts in files
# Look for <<<<<<< HEAD markers

# After resolving
git add .
git commit -m "fix: resolve merge conflicts"
git push
```

#### Issue: Accidentally committed sensitive data

**Symptoms:** API keys in repo

**Solutions:**

```bash
# Remove from history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch path/to/file" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (CAREFUL!)
git push origin --force --all

# Change all exposed credentials immediately
```

### Testing Issues

#### Issue: Tests failing after implementation

**Symptoms:** Jest errors, component not rendering

**Solutions:**

1. **Mock Framer Motion:**

   ```js
   jest.mock('framer-motion', () => ({
     motion: {
       div: 'div',
       button: 'button'
     },
     AnimatePresence: ({ children }) => children
   }));
   ```

2. **Mock i18n:**
   ```js
   jest.mock('react-i18next', () => ({
     useTranslation: () => ({
       t: key => key,
       i18n: { changeLanguage: jest.fn() }
     })
   }));
   ```

## 🔍 Debugging Strategies

### 1. Chrome DevTools

```
F12 → Elements → Check computed styles
F12 → Console → Look for errors/warnings
F12 → Performance → Record and analyze
F12 → Network → Check API calls
F12 → Application → Check localStorage
```

### 2. React DevTools

```
Components tab → Inspect props/state
Profiler tab → Find slow renders
Highlight updates → See re-render frequency
```

### 3. Framer Motion DevTools

```jsx
// Add debug mode
<motion.div animate={{ x: 100 }} onAnimationStart={() => console.log('Animation started')} onAnimationComplete={() => console.log('Animation done')} />
```

### 4. Logging Strategy

```jsx
// Add strategic console logs
console.log('[Component] Rendering with:', props);
console.log('[Effect] Running with deps:', deps);
console.log('[Event] Handler called:', data);

// Use error boundaries
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('Caught error:', error, errorInfo);
  }
}
```

## 📞 When to Ask for Help

1. **Issue persists after 30 minutes** of troubleshooting
2. **Multiple related errors** appear
3. **Production site is broken**
4. **Security concern** discovered
5. **Data loss** risk

## 📚 Additional Resources

- [Framer Motion Docs](https://www.framer.com/motion/)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Vite Troubleshooting](https://vitejs.dev/guide/troubleshooting.html)
- [Chrome DevTools Guide](https://developer.chrome.com/docs/devtools/)

---

**Remember:** Most issues are caused by:

1. Missing dependencies
2. Incorrect imports
3. Async/state timing issues
4. CSS specificity conflicts
5. Browser caching

Clear cache, restart dev server, check console first!

---

END OF TROUBLESHOOTING.md
