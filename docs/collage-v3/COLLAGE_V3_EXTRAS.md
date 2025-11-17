Advanced Features: Replace Photo + Reorder Photos + UI Refinements

IMPORTANT — READ BEFORE STARTING

You (Claude Code) must read this entire file before writing any code.
This document extends the previously loaded:

COLLAGE_V3_PROMPT.md

COLLAGE_V3_ARCHITECTURE.md

COLLAGE_V3_DESIGN_REFERENCE.md

This file defines two additional core features required for Collage Builder V3:

Replace Photo inside a completed layout

Reorder Photos inside selected layout

It also includes UI refinements based on the latest mobile screenshots from Pixtr.

You must implement these features after completing PHASE C and PHASE D of the main prompt.

NEW FEATURE 1 — Replace Photo (After Layout Selection)
Goal

Allow users to replace any individual photo after layout and selection are done — without restarting the collage process.

Requirements

1. Update CollagePreview

When a user interacts with a photo tile:

Mobile

Tap: opens Adjust Position (RepositionModal)

Long press: opens action menu

Adjust Photo
Replace Photo
Cancel

Desktop

Add a small overlay button (⋮) in the top-right corner of each photo (hidden until hover):

Clicking it opens the same action menu as long-press on mobile.

2. New Modal — ReplacePhotoModal.jsx

Create a new file:

/src/components/ReplacePhotoModal.jsx

ReplacePhotoModal Requirements

Reuses ImagePickerV3, but in single-select mode:

maxPhotos = 1

initialSelection = []

Only one selected item allowed

Replace the “Continue” button with:

Use This Photo →

Once selected:

Return the new photo to CollageBuilder

Close modal

Refresh preview

3. CollageBuilder Integration

Add state:

const [replaceIndex, setReplaceIndex] = useState(null)
const openReplaceModal = (index) => setReplaceIndex(index)

When ReplacePhotoModal returns a photo:

selectedPhotos[replaceIndex] = newPhoto

// Reset transform for replaced slot
transforms[newPhoto.id] = {
scale: 1,
translateX: 0,
translateY: 0,
}

Clear modal:

setReplaceIndex(null)

Everything must update instantly.

NEW FEATURE 2 — Reorder Photos (Drag & Drop)
Goal

Allow users to rearrange the order of selected photos inside the chosen layout without reselecting them.

The order of selectedPhotos[] determines which photo fills each slot.

Requirements

1. Add “Reorder Photos” button in step 3 (Customize)

UI:

[ ↕ Reorder Photos ]

Button must match Pixtr design (glassmorphism).

2. Add new state
   const [isReorderMode, setIsReorderMode] = useState(false)

3. Reorder Mode Behavior

When active:

CollagePreview switches to “grid reorder mode”

Every image tile shows a drag handle [≡]

User can drag tiles to reorder them

Drag & drop implementation:

Prefer native HTML drag + pointer events

Avoid adding new dependencies unless needed

Disable:

Replace Photo

Adjust Position

Layout selection

Save button

4. When user drops

Rebuild selectedPhotos array:

setSelectedPhotos(reorderedArray)

Rebuild transforms:

const newTransforms = {}
reorderedArray.forEach(photo => {
newTransforms[photo.id] = existingTransforms[photo.id] || defaultTransform
})
setTransforms(newTransforms)

5. Exit Reorder

Show a “Done” button:

[ Done Reordering ]

UI REQUIREMENTS BASED ON REAL SCREENSHOTS

Based on your uploaded mobile images, the following UI refinements are required:

A. Image Picker V3

Increase spacing between grid tiles (gap-3 instead of gap-2)

Make selected border color slightly brighter (border-blue-400)

Improve sticky tab + search bar (fix overlap bug)

Ensure “6/6 selected” bar always stays pinned

Improve visibility of “Maximum reached”

B. Layout Selection

Increase icon size by ~10%

Brighten active state (use bg-blue-500/20 instead of 10)

Add faint drop-shadow on layout icons

Improve category headings ("5–6 Photos", "6 Photos")

C. Preview

Slightly increase rounding of collage (rounded-2xl)

Improve hover hint:

Tap to adjust
Hold for options

Fix scaling issue on tall images (object-fit adjustments)

D. Save Page

Add tiny icons:

layout icon

photo count

resolution

Improve font weight of metadata

INTERACTION FLOW
✔ Replace Photo

User taps long-press or ⋮

Menu opens

Replace Photo

ImagePickerV3 opens

User picks one

Preview updates

✔ Reorder Photos

User presses “↕ Reorder Photos”

Grid grows slightly and shows drag handles

User drags items

New order is reflected in preview

User presses “Done”

FILES TO MODIFY

You must update or create:

src/components/
CollageBuilder.jsx (modify)
CollagePreview.jsx (modify)
ReplacePhotoModal.jsx (new)
ReorderHandle.jsx (maybe new)
GridReorderOverlay.jsx (new or integrated)
PhotoCell.jsx (modify)
ImagePickerV3.jsx (modify to support single-select mode)
ActionMenu.jsx (new shared popup menu)

IMPLEMENTATION RULES

Follow these rules strictly:

Match Pixtr style (glass, blur, neon-purple theme)

Use i18n for all text:

collage.replacePhoto

collage.reorderPhotos

collage.longPressOptions

collage.useThisPhoto

etc.

No inline styles → use Tailwind

Must be fully responsive

Reorder and Replace must work with:

1–6 photos

all layouts (including magazine layouts)

Do not break previously implemented phases

DELIVERABLE

When implementing this feature, produce:

Updated files

New modal components

New drag logic

Full integration in CollageBuilder

Updated translation keys (EN + NO)

A test checklist

Stop before merging, wait for user approval.

READY SIGNAL

After reading this file, print:

READY FOR EXTRA FEATURES — PHASE X: Replace + Reorder

Do not generate code until explicitly instructed.

END OF FILE
