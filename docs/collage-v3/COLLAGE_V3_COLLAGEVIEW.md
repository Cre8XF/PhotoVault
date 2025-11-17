Collage Builder V3 — CollageView, Thumbnails, Editing & Album Integration

IMPORTANT — READ BEFORE STARTING

This document must be read after:

COLLAGE_V3_PROMPT.md

COLLAGE_V3_ARCHITECTURE.md

COLLAGE_V3_DESIGN_REFERENCE.md

COLLAGE_V3_EXTRAS.md

It defines Phase CV (Collage View & Thumbnail System) — the missing half of Collage Builder V3.

Claude Code must read this file before implementing any CollageView or Thumbnail logic.

🎯 GOAL

Implement the full lifecycle of a saved collage:

Generate and store thumbnails

Display collages in album list

Open and view full collages

Download / share a collage

Edit existing collages (open builder in edit mode)

Delete collages

Improve album card UI

This brings Collage Builder V3 to completion.

📌 PART 1 — Thumbnail Generation
Why

Right now, saved collages show a placeholder icon because no thumbnail exists.

Requirements
A. Add thumbnail rendering after collage creation

After user saves collage:

Render the final collage preview component to a canvas.

Export as a JPEG (quality ~ 0.8).

Upload to Firebase Storage at:

users/{userId}/collages/thumbnails/{collageId}.jpg

B. Store URL in Firestore

Add field:

thumbnailURL: "https://..."

C. Fallback logic

If thumbnail missing:

Show placeholder icon (the grid icon)

Log warning

📌 PART 2 — CollageView.jsx (Fullscreen Display)

Create:

src/pages/CollageView.jsx

UI Requirements
Header

Back button ←

More (…) menu

Edit

Download

Share

Delete

Main Area
┌───────────────────────────┐
│ [ Full Collage ] │
│ 2400 × 1800 px (or more) │
└───────────────────────────┘

Use full resolution image (downloadURL)

Maintain correct aspect ratio

Add rounded-xl + soft shadow

Metadata section

Show:

Layout name + icon

Number of photos

Resolution

Creation date

File size (if available)

Format:

🖼 Magazine Layout
📷 6 photos
📐 2400 × 1800px
📅 16.11.2025

📌 PART 3 — Routing Setup

Modify:

App.jsx

Add route:

<Route path="/collage/:id" element={<CollageView />} />

📌 PART 4 — Album Integration (CollageCard)

Modify:

src/components/AlbumCard.jsx
src/pages/AlbumsPage.jsx

Requirements
A. Show real thumbnail

Use:

<img src={collage.thumbnailURL} ... />

If missing → show faded grid icon.

B. Click behavior

Tap = open /collage/{id}

Buttons shown on hover (desktop) or floating (mobile):

Edit (✏️)

Delete (🗑️)

C. Metadata under card

E.g.:

Test
6 photos • 16.11.2025

📌 PART 5 — Edit Existing Collage
Flow

User opens /collage/{id}

User taps “Edit”

CollageBuilder opens in edit mode

Edit Mode Rules

When editing:

Preload:

selectedPhotos (array from photo IDs)

selectedLayout

transforms

Skip “Select Photos” step

Jump directly to “Customize layout” step

Show “Editing existing collage” label

State Injection

Add in CollageBuilder:

const [editCollage, setEditCollage] = useState(null)

When editing:

editCollage = {
id,
photos,
layout,
transforms
}

Call:

initializeBuilderFromExistingData(editCollage)

📌 PART 6 — Delete Collage

Add delete support:

A. Delete Firestore document

users/{uid}/collages/{collageId}

B. Delete thumbnail

users/{uid}/collages/thumbnails/{collageId}.jpg

C. Delete full-resolution collage file

(optional depending on architecture)

D. Confirmation modal
Are you sure?
This collage will be permanently deleted.
[Cancel] [Delete]

📌 PART 7 — Share / Download

Implement in CollageView:

A. Share API

Use browser navigator.share() when available.

B. Download

Anchor trick:

const link = document.createElement('a')
link.href = collage.downloadURL
link.download = collage.title + ".jpg"
link.click()

📌 PART 8 — Files to Create / Update
src/pages/CollageView.jsx (new)
src/components/CollageThumbnail.jsx (new)
src/components/AlbumCard.jsx (update)
src/pages/AlbumsPage.jsx (update)
src/components/CollageBuilder.jsx (update)
src/hooks/useCollageData.js (update)
src/utils/renderCollageToCanvas.js (new)
src/i18n/locales/en.json (update)
src/i18n/locales/no.json (update)

📌 PART 9 — Thumbnail Rendering Utility

Create:

src/utils/renderCollageToCanvas.js

Usage inside CollageBuilder after Save:

const blob = await renderCollageToCanvas({ layout, photos, transforms })
await uploadThumbnail(collageId, blob)

📌 PART 10 — i18n keys

Add to both en.json and no.json:

"collage": {
"viewTitle": "Collage",
"edit": "Edit",
"delete": "Delete",
"share": "Share",
"download": "Download",
"metadata": {
"layout": "Layout",
"photos": "Photos",
"resolution": "Resolution",
"created": "Created"
},
"deleteConfirm": {
"title": "Delete collage?",
"body": "This action cannot be undone.",
"confirm": "Delete",
"cancel": "Cancel"
}
}

📌 PART 11 — Validation Checklist (must pass)
Thumbnail

Thumbnail generated correctly

Thumbnail shows in AlbumsPage

Placeholder shows only if missing

CollageView

Full collage visible

Aspect ratio preserved

Metadata all correct

Share / download works

Edit Flow

Editing loads previous layout

Transforms preserved

Editing does NOT create new collage ID unless “Save As Copy”

Delete

Deletes Firestore doc

Deletes thumbnail

Remove from album immediately

READY SIGNAL

After reading this entire file, Claude Code must output:

READY FOR COLLAGE VIEW — PHASE CV

No code should be generated until user explicitly instructs:

Begin Phase CV implementation
