# PIXTR FREE TIER - Quick Testing Guide

## 🎯 Current Status

### ✅ Already Working
- Upload photos (original quality)
- Create/edit/delete albums
- Batch operations (select, move, delete)
- QR-code sharing
- Collage Builder
- Search & filters
- Timeline view
- Favorites
- 1 GB storage limit

### ❌ Missing for Complete FREE Experience
1. **Captions/Notes** - Let users add personal notes to photos
2. **Slideshow** - Auto-play photo viewer

---

## 🧪 Quick Test Script for FREE Users

### Test 1: Upload & Basic Operations (5 min)
```
1. Upload 3-5 photos to an album
2. Try to upload a video → Should block with message
3. Check that photos are original quality (not compressed)
4. Add to favorites
5. Move to different album
6. Delete one photo
```

### Test 2: Batch Operations (3 min)
```
1. Go to SearchPage
2. Click "Edit" mode
3. Select multiple photos
4. Click "Select All"
5. Click "Move" → Choose album → Confirm
6. Verify photos moved
```

### Test 3: Album Features (5 min)
```
1. Create new album
2. Set album cover
3. Edit album name
4. Generate QR code for sharing
5. Download QR code image
6. Delete album
```

### Test 4: Search & Filter (3 min)
```
1. Search by filename
2. Filter by favorites
3. Filter by album
4. Reset filters
5. Check that results update correctly
```

### Test 5: Collage Builder (5 min)
```
1. Select 4 photos
2. Choose "Create Collage"
3. Pick a layout
4. Adjust photo positions
5. Save collage to album
6. Download collage locally
```

### Test 6: NEW - Captions (After Implementation)
```
1. Open photo in modal
2. Click "Add caption"
3. Type: "This is my test caption"
4. Save
5. Close and reopen photo
6. Verify caption persists
7. Edit caption
8. Delete caption (save empty)
```

### Test 7: NEW - Slideshow (After Implementation)
```
1. Go to an album with 10+ photos
2. Click "Start Slideshow"
3. Verify auto-advance every 3 seconds
4. Press spacebar to pause/play
5. Change interval to 5 seconds
6. Use arrow keys for manual navigation
7. Press Escape to exit
```

---

## 🐛 Known Issues to Watch For

### Captions
- [ ] Long captions (300+ chars) wrap correctly
- [ ] Special characters don't break (emoji, æøå)
- [ ] Multiple rapid saves don't duplicate
- [ ] Caption saves even if modal is closed quickly

### Slideshow
- [ ] No memory leak with 100+ photos
- [ ] Videos are skipped or shown with thumbnail
- [ ] Transition is smooth, no flickering
- [ ] Controls don't block photo on mobile

### General FREE Tier
- [ ] Storage limit enforced (1 GB)
- [ ] Video upload blocked with friendly message
- [ ] No compression applied to images
- [ ] AI features show "Coming Soon" or "Pro Feature"

---

## 📱 Mobile-Specific Tests

### iPhone Safari
```
1. Upload from camera roll
2. Take photo with camera
3. Test caption keyboard (doesn't block buttons)
4. Test slideshow touch controls
5. Test batch selection with touch
```

### Android Chrome
```
1. Upload multiple files
2. Test drag-and-drop (if supported)
3. Test caption in portrait/landscape
4. Test slideshow controls in fullscreen
```

---

## 🔒 Security Tests

### Test Caption Permissions
```
1. User A uploads photo
2. User A adds caption
3. User B tries to view photo (if shared)
   → Caption should be visible
4. User B tries to edit caption
   → Should fail (not implemented, but verify)
```

### Test Storage Limits
```
1. Upload photos until close to 1 GB
2. Try uploading another large photo
3. Verify error message
4. Verify storage bar updates correctly
```

---

## ⚡ Performance Benchmarks

### Load Times (Target)
- Album page load: < 2 seconds
- Photo modal open: < 500ms
- Caption save: < 1 second
- Slideshow transition: < 200ms

### Memory Usage
- Idle: < 150 MB
- Viewing photos: < 300 MB
- Slideshow active: < 400 MB
- After 1 hour use: < 500 MB (no leaks)

---

## ✅ Complete FREE Tier Checklist

Use this before declaring FREE tier "done":

**Core Features:**
- [ ] Upload photos (original quality)
- [ ] Create/edit albums
- [ ] Batch select/move/delete
- [ ] QR-code sharing
- [ ] Collage builder
- [ ] Search & filters
- [ ] Captions/notes ← NEW
- [ ] Slideshow ← NEW

**Restrictions Working:**
- [ ] Video upload blocked
- [ ] 1 GB storage enforced
- [ ] No compression applied
- [ ] AI features disabled/unavailable

**UI/UX:**
- [ ] All text translated (NO/EN)
- [ ] Mobile-friendly
- [ ] No console errors
- [ ] Toast notifications work
- [ ] Loading states clear

**Performance:**
- [ ] Fast page loads
- [ ] Smooth animations
- [ ] No memory leaks
- [ ] Works offline (PWA cache)

---

## 🚀 Ready for LITE?

FREE tier is ready when:
1. All checkboxes above are ✅
2. No P0 bugs reported
3. 10+ test users have tried it
4. Mobile testing complete
5. Norwegian translations verified

Then proceed to LITE tier implementation:
- Add compression toggle
- Increase storage to 5 GB
- Keep video upload blocked
- Keep AI features disabled

---

**Last Updated**: 2024-11-21  
**For**: Pixtr v1.0 FREE Tier  
**Next**: LITE Tier → PRO Tier → ADMIN Tools
