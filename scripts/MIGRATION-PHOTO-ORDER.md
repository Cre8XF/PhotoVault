# Photo Order Migration Guide

## Overview

This migration script adds the `order` field to existing photos in Firestore to support manual drag-drop reordering in albums.

## What It Does

1. **Finds** all non-deleted photos without an `order` field
2. **Assigns** order values based on photo dates (dateTaken/displayDate/createdAt)
3. **Batches** updates in chunks of 500 to respect Firestore limits
4. **Preserves** chronological order for stable manual reordering

## Prerequisites

- Node.js 20+ installed
- Firebase credentials in `.env.local` file
- Required environment variables:
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_STORAGE_BUCKET`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - `VITE_FIREBASE_APP_ID`

## How to Run

### Step 1: Ensure .env.local exists

Create a `.env.local` file in the project root if it doesn't exist:

```bash
cp .env.example .env.local
```

Then populate it with your Firebase credentials.

### Step 2: Run the migration

```bash
node scripts/migrate-photo-order.mjs
```

### Step 3: Verify results

The script will output:
- Number of photos found
- Number of photos migrated
- Any errors encountered
- Summary statistics

## Expected Output

```
🚀 Starting photo order migration...

📋 Migration Logic:
   • Only migrate non-deleted photos (deleted: false)
   • Set order based on dateTaken/displayDate/createdAt
   • Use timestamp value for stable ordering
   • Batch updates in chunks of 500

📊 Found 1234 total photos

📝 Need to migrate 856 photos

📦 Processing batch 1 (500 photos)
   ✅ IMG_001.jpg: order=1704067200000 (2024-01-01T00:00:00.000Z)
   ✅ IMG_002.jpg: order=1704153600000 (2024-01-02T00:00:00.000Z)
   ...
   💾 Batch committed successfully

📦 Processing batch 2 (356 photos)
   ...

============================================================
📊 MIGRATION SUMMARY
============================================================
✅ Successfully updated: 856
❌ Errors:               0
📦 Total photos:          1234
📝 Needed migration:      856
============================================================

✨ Migration completed successfully!

📝 NEXT STEPS:
   1. Test manual ordering in the app
   2. Verify photos can be dragged and reordered
   3. Check that order persists after page refresh
```

## What Gets Changed

For each photo without an `order` field:

```javascript
// BEFORE
{
  id: "photo123",
  name: "IMG_001.jpg",
  userId: "user123",
  albumId: "album456",
  createdAt: "2024-01-01T00:00:00.000Z",
  deleted: false,
  // ... other fields ...
  // NO order field
}

// AFTER
{
  id: "photo123",
  name: "IMG_001.jpg",
  userId: "user123",
  albumId: "album456",
  createdAt: "2024-01-01T00:00:00.000Z",
  deleted: false,
  order: 1704067200000,  // ✅ ADDED
  updatedAt: "2024-01-02T10:30:00.000Z",  // ✅ UPDATED
  // ... other fields ...
}
```

## Safety Features

- ✅ Only processes non-deleted photos (`deleted: false`)
- ✅ Checks if photos already have `order` field (idempotent)
- ✅ Uses batched writes (max 500 per batch)
- ✅ Handles errors gracefully per photo
- ✅ Provides detailed logging and summary

## Rollback

If you need to remove the `order` field (not recommended):

```javascript
// Manual Firestore query to remove order field
const photosRef = collection(db, 'photos')
const snapshot = await getDocs(photosRef)

const batch = writeBatch(db)
snapshot.docs.forEach(doc => {
  batch.update(doc.ref, { order: deleteField() })
})
await batch.commit()
```

## Troubleshooting

### Error: "Missing required environment variables"

Ensure your `.env.local` file has all required Firebase configuration variables with the `VITE_` prefix.

### Error: "PERMISSION_DENIED"

Your Firebase credentials may not have write access to the `photos` collection. Verify your Firestore security rules.

### Error: "Quota exceeded"

If you have a very large photo collection (50,000+), you may need to run the migration in smaller batches or request a quota increase from Firebase.

## Post-Migration Testing

After running the migration:

1. Open the app and navigate to an album
2. Enable "Manual Order" sort mode
3. Drag a photo to a new position
4. Verify the order updates
5. Refresh the page
6. Verify the order persists

## Support

For issues or questions, contact the development team or check the project documentation.
