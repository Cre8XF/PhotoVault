## FILE: issues.md

# Issues & Solutions

Track problems encountered and their solutions.

---

## 🐛 Active Issues

### Issue #1

- **Date:** YYYY-MM-DD
- **Session:** [Session name]
- **Description:**
- **Impact:** High / Medium / Low
- **Status:** Open / In Progress / Resolved
- **Solution:**

---

## ✅ Resolved Issues

### Issue #1

- **Date:** YYYY-MM-DD
- **Session:** [Session name]
- **Description:**
- **Solution:**
- **Lessons learned:**

---

## 🔍 Common Patterns

Document recurring issues:

### Performance Issues

- **Pattern:**
- **Solution:**

### Animation Problems

- **Pattern:**
- **Solution:**

### Mobile Responsiveness

- **Pattern:**
- **Solution:**

### i18n Issues

- **Pattern:**
- **Solution:**

---

## 📚 Knowledge Base

Quick reference for common solutions:

### Framer Motion Issues

```jsx
// Issue: Layout shift during animation
// Solution: Use layoutId and AnimatePresence
```

### Performance Optimization

```jsx
// Issue: Re-renders on every interaction
// Solution: Use React.memo and useCallback
const PhotoItem = React.memo(({ photo }) => {
  // Component code
});
```

### Mobile Touch Issues

```jsx
// Issue: Hover states stuck on mobile
// Solution: Use @media hover
@media (hover: hover) {
  .element:hover { ... }
}
```

---

END OF issues.md
