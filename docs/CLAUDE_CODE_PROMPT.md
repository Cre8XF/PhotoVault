# Claude Code Task: PhotoVault MVP Preparation

## 🎯 Objective
Prepare PhotoVault for MVP launch by **temporarily disabling all AI features** while keeping the codebase ready for future activation. This is a strategic cost-reduction approach for initial launch.

---

## 📋 Context

### Current Situation
- **Status:** All features are functional, including AI services
- **Problem:** AI API costs (1,200-2,300 NOK/month) are too high for initial launch
- **Solution:** Launch as MVP without AI, activate later when user base justifies cost

### Strategic Decision
Following "Scenario 1" from project strategy:
1. **Phase 1 (NOW):** MVP without AI features (0-100 NOK/month)
2. **Phase 2 (3-6 months):** Activate AI when 500+ users or Pro subscriptions cover costs
3. **Keep codebase AI-ready:** Don't delete code, just disable with "Coming Soon" modals

---

## 📁 Repository Structure

```
src/
├── components/
│   └── [20 React components - DO NOT MODIFY]
├── pages/
│   ├── MorePage.jsx           [MODIFY: Disable AI buttons, add modals]
│   ├── SearchPage.jsx         [MODIFY: Disable AI search features]
│   ├── GalleryPage.jsx        [MODIFY: Disable AI tools button]
│   └── [Other pages - DO NOT MODIFY]
├── services/
│   ├── googleVision.js        [MODIFY: Comment out API calls, keep structure]
│   ├── picsart.js             [MODIFY: Comment out API calls, keep structure]
│   └── openai.js              [MODIFY: Comment out API calls, keep structure]
├── hooks/
│   └── useAIQueue.js          [KEEP AS-IS: Ready for Phase 2]
├── locales/
│   ├── en/
│   │   └── common.json        [MODIFY: Add "comingSoon" translations]
│   └── no/
│       └── common.json        [MODIFY: Add "comingSoon" translations]
└── utils/
    ├── firebase.js            [DO NOT MODIFY]
    └── googleVision.js        [DELETE: Duplicate file]
```

---

## ✅ Tasks to Complete

### Task 1: Create ComingSoonModal Component
**Location:** `src/components/ComingSoonModal.jsx`

**Requirements:**
- Reusable modal component
- Displays feature name and description
- Shows list of upcoming AI features
- Optional email signup for early access
- i18n support (EN/NO)
- Close button
- Backdrop blur effect

**Design:**
```jsx
<ComingSoonModal 
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  featureName="AI Auto-Tagging"
  description="Automatically detect objects, scenes, and people in your photos"
/>
```

**Content to Display:**
- Title: "Coming Soon" / "Kommer snart"
- Feature-specific description
- List of upcoming AI features:
  - Auto-tagging
  - Face recognition
  - Smart search
  - Image enhancement
  - Background removal
- Call-to-action: "Contact us at support@fotio.app to test early"
- Optional: Email signup form (store in Firestore collection `early_access`)

---

### Task 2: Disable AI Features in MorePage.jsx
**Location:** `src/pages/MorePage.jsx`

**Current State:**
- Contains 3 AI functions that make direct API calls:
  - `analyzeImageWithVision()` (line ~198)
  - `callOpenAI()` (line ~427)
  - `enhanceImageWithPicsart()` (line ~461)

**Actions Required:**

#### A. Add ComingSoonModal State
```jsx
const [showAIModal, setShowAIModal] = useState(false);
const [aiFeatureName, setAIFeatureName] = useState('');
```

#### B. Replace AI Button onClick Handlers
**Find these buttons:**
- "Auto-sort photos" button
- "Face recognition" button
- "Smart tagging" button
- "Enhance image" button (if exists)

**Replace with:**
```jsx
onClick={() => {
  setAIFeatureName('AI Auto-Tagging'); // or appropriate feature name
  setShowAIModal(true);
}}
disabled
className="opacity-50 cursor-not-allowed"
```

#### C. Comment Out AI Functions
**Wrap these functions with comments:**
```javascript
// PHASE 2: AI Feature - Temporarily disabled for MVP
// Will be re-enabled when user base reaches 500+ users
/*
const analyzeImageWithVision = async (imageUrl) => {
  // ... existing code ...
};
*/

// Add similar comments for other AI functions
```

**Keep the function structure intact** - don't delete, just comment out.

---

### Task 3: Disable AI Features in SearchPage.jsx
**Location:** `src/pages/SearchPage.jsx`

**Current State:**
- May have AI-powered search toggle or smart search features

**Actions Required:**
1. Find any AI-related UI elements (toggles, buttons)
2. Disable with same pattern as MorePage
3. Add ComingSoonModal trigger
4. Keep search functionality working for manual tags

---

### Task 4: Disable AI Features in GalleryPage.jsx
**Location:** `src/pages/GalleryPage.jsx`

**Current State:**
- May have "AI Tools" button in photo viewer

**Actions Required:**
1. Find AI-related buttons in photo detail view
2. Disable with ComingSoonModal pattern
3. Keep manual editing/tagging functional

---

### Task 5: Disable AI Features in UploadModal.jsx
**Location:** `src/components/UploadModal.jsx`

**Current State:**
- May have "Auto-enhance" or "AI tagging" checkbox during upload

**Actions Required:**
1. Find AI-related checkboxes/toggles
2. Disable or hide (your choice)
3. If disabled, add tooltip: "Coming in Phase 2"

---

### Task 6: Comment Out AI Service API Calls
**Locations:** 
- `src/services/googleVision.js`
- `src/services/picsart.js`
- `src/services/openai.js`

**Actions Required for Each File:**

#### Keep File Structure
```javascript
// File: src/services/googleVision.js

// PHASE 2: AI Service - Temporarily disabled for MVP
// This service will be re-enabled when:
// - User base reaches 500+ users, OR
// - Pro subscriptions cover AI costs, OR
// - 3+ months of stable operation

const getApiKey = () => {
  return process.env.REACT_APP_GOOGLE_VISION_KEY;
};

// DISABLED - Uncomment for Phase 2
/*
export const analyzeImage = async (imageUrl, features) => {
  // ... existing implementation ...
};

export const detectFaces = async (imageUrl) => {
  // ... existing implementation ...
};
*/

// TEMPORARY: Return placeholder data for MVP
export const analyzeImage = async (imageUrl, features) => {
  console.log('AI feature disabled - Phase 2 activation required');
  return { labels: [], faces: 0 };
};

export const detectFaces = async (imageUrl) => {
  console.log('AI feature disabled - Phase 2 activation required');
  return { faceCount: 0, coordinates: [] };
};
```

**Repeat for:**
- `picsart.js` → Comment out enhancement/background removal
- `openai.js` → Comment out smart suggestions

---

### Task 7: Update i18n Translations
**Locations:** 
- `src/locales/en/common.json`
- `src/locales/no/common.json`

**Add New Keys:**

#### English (`en/common.json`)
```json
{
  "comingSoon": {
    "title": "Coming Soon",
    "description": "This feature is under development",
    "aiFeatures": {
      "title": "AI-Powered Features Coming Soon",
      "description": "We're building powerful AI features that will include:",
      "autoTagging": "Automatic photo tagging",
      "faceRecognition": "Face recognition and grouping",
      "smartSearch": "Natural language search",
      "imageEnhancement": "One-tap photo enhancement",
      "backgroundRemoval": "Background removal tool",
      "duplicateDetection": "Duplicate photo detection"
    },
    "contact": "Contact us at support@fotio.app to test early",
    "notify": "Notify me when ready",
    "close": "Close"
  }
}
```

#### Norwegian (`no/common.json`)
```json
{
  "comingSoon": {
    "title": "Kommer snart",
    "description": "Denne funksjonen er under utvikling",
    "aiFeatures": {
      "title": "AI-drevne funksjoner kommer snart",
      "description": "Vi bygger kraftige AI-funksjoner som vil inkludere:",
      "autoTagging": "Automatisk bildemerking",
      "faceRecognition": "Ansiktsgjenkjenning og gruppering",
      "smartSearch": "Naturlig språksøk",
      "imageEnhancement": "Bildeforbedring med ett trykk",
      "backgroundRemoval": "Bakgrunnsfjernelse",
      "duplicateDetection": "Oppdaging av duplikater"
    },
    "contact": "Kontakt oss på support@fotio.app for å teste tidlig",
    "notify": "Varsle meg når det er klart",
    "close": "Lukk"
  }
}
```

---

### Task 8: Delete Duplicate File
**Location:** `src/utils/googleVision.js`

**Reason:** 
- This is a duplicate of `/src/services/googleVision.js`
- Causes confusion and maintenance issues
- Audit report (VISION_API_AUDIT_REPORT.md) recommends removal

**Action:** 
```bash
rm src/utils/googleVision.js
```

**Verify no imports reference this file:**
```bash
grep -r "from.*utils/googleVision" src/
grep -r "import.*utils/googleVision" src/
```

If imports exist, replace with `import from '../services/googleVision'`

---

### Task 9: Update README.md
**Location:** `README.md`

**Update Feature List:**

**Before:**
```markdown
## Features
- Photo upload with AI auto-tagging
- Face recognition
- Smart search
```

**After:**
```markdown
## Features (Current)
- Photo upload with compression
- Album management
- Manual tagging and favorites
- Search and filtering
- Dark/Light theme
- Multi-language support (NO/EN)

## Coming Soon (Phase 2)
- AI-powered auto-tagging
- Face recognition and grouping
- Smart search with natural language
- Image enhancement and background removal
```

---

### Task 10: Update package.json Version
**Location:** `package.json`

**Change:**
```json
{
  "version": "0.x.x"
}
```

**To:**
```json
{
  "version": "1.0.0-mvp"
}
```

---

## 🚫 What NOT to Touch

### DO NOT Modify These:
- ✅ `useAIQueue.js` hook → Keep as-is for Phase 2
- ✅ Firebase configuration files
- ✅ Zustand store structure
- ✅ Core components (AlbumCard, PhotoCard, etc.)
- ✅ firebase.js utility functions
- ✅ Authentication logic
- ✅ Theme and styling files

### DO NOT Delete:
- ❌ AI service files (just comment out)
- ❌ useAIQueue hook
- ❌ Environment variables for AI keys
- ❌ Any AI-related Firestore schema fields (aiTags, faces, etc.)

**Principle:** Keep everything AI-ready, just disabled. Phase 2 should be a simple "uncomment" operation.

---

## ✅ Testing Checklist

After completing all tasks:

### Functional Tests
- [ ] App builds without errors (`npm run build`)
- [ ] No console errors in browser DevTools
- [ ] ComingSoonModal displays correctly
- [ ] AI buttons show "Coming Soon" modal when clicked
- [ ] AI buttons are visually disabled (opacity, cursor)
- [ ] Core features still work (upload, delete, favorites, search)
- [ ] i18n translations display correctly (test both EN/NO)
- [ ] Mobile responsive (test at 375px, 768px, 1920px)

### Code Quality
- [ ] No broken imports after deleting `utils/googleVision.js`
- [ ] All AI functions properly commented (not deleted)
- [ ] Console logs added for disabled AI features
- [ ] No unused variables from removed code

### Documentation
- [ ] README.md updated with MVP feature list
- [ ] package.json version updated to `1.0.0-mvp`
- [ ] Comments explain why AI is disabled

---

## 📊 Expected Outcomes

### Before (Current State)
- ✅ All features working including AI
- ❌ API costs: 1,200-2,300 NOK/month
- ❌ Too expensive for initial launch

### After (MVP State)
- ✅ Core features working perfectly
- ✅ AI features disabled with "Coming Soon" UI
- ✅ API costs: 0-100 NOK/month (free tier only)
- ✅ Ready for cost-free launch
- ✅ Codebase ready for Phase 2 activation

---

## 🔄 Phase 2 Activation (Future)

When ready to activate AI (not part of this task):
1. Uncomment all API calls in service files
2. Remove ComingSoonModal triggers from buttons
3. Re-enable disabled state on AI buttons
4. Remove placeholder functions
5. Test API quotas and costs
6. Deploy gradually (beta users first)

**Estimated time to activate:** 2-4 hours

---

## 📞 Questions or Issues?

If you encounter:
- **Broken imports:** Check if file was referenced elsewhere
- **Missing translations:** Add to both EN and NO locale files
- **Unclear AI feature location:** Search for "Vision", "Picsart", "OpenAI" in codebase
- **Build errors:** Ensure all imports are updated after deletions

---

## 🎯 Success Criteria

Task is complete when:
- ✅ App builds successfully
- ✅ Zero console errors
- ✅ All AI buttons show "Coming Soon" modal
- ✅ Core features unaffected
- ✅ Codebase clean and commented
- ✅ i18n translations complete
- ✅ README and package.json updated

---

## 📋 File Change Summary

**Files to Modify:** 10 files
- ComingSoonModal.jsx (create new)
- MorePage.jsx
- SearchPage.jsx (if AI features exist)
- GalleryPage.jsx (if AI features exist)
- UploadModal.jsx (if AI features exist)
- googleVision.js (service)
- picsart.js (service)
- openai.js (service)
- en/common.json
- no/common.json
- README.md
- package.json

**Files to Delete:** 1 file
- src/utils/googleVision.js

**Estimated Time:** 3-4 hours

---

**References:**
- Strategy: `MVP_STRATEGY.md`
- Current status: `STATUS.md`
- Full roadmap: `ROADMAP.md`
- Vision API audit: `VISION_API_AUDIT_REPORT.md`

---

**Good luck! 🚀**
