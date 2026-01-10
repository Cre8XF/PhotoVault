# Firestore Index Setup for Phase 4B

## Required Composite Indexes

Phase 4B requires the following Firestore composite indexes to work properly:

### 1. Photos - Deleted Filter Index

**Collection:** `photos`

**Fields:**
- `userId` (Ascending)
- `deleted` (Ascending)
- `uploadedAt` (Descending) - Optional, for sorting

**Why needed:**
This index is required for queries that filter photos by user AND deleted status, such as:
- Getting all non-deleted photos for a user
- Getting all deleted photos for trash page

### 2. Photos - Deleted At Index (for Trash Page)

**Collection:** `photos`

**Fields:**
- `userId` (Ascending)
- `deleted` (Ascending)
- `deletedAt` (Descending)

**Why needed:**
This index is used by TrashPage to show deleted photos sorted by deletion date.

## How to Create Indexes

### Method 1: Automatic (Recommended)

The indexes will be automatically created when you first run a query that needs them. Firebase will show an error with a link to create the index.

1. Navigate to TrashPage or delete a photo
2. Check browser console for Firestore index error
3. Click the provided link to auto-create the index in Firebase Console
4. Wait 1-2 minutes for index to build

### Method 2: Manual (Firebase Console)

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to **Firestore Database** → **Indexes** tab
4. Click **Create Index**
5. Fill in the fields:
   - Collection ID: `photos`
   - Fields to index:
     - `userId` (Ascending)
     - `deleted` (Ascending)
     - `deletedAt` (Descending) - for trash page
6. Click **Create**
7. Wait for index to build (usually 1-2 minutes)

### Method 3: Firebase CLI (Advanced)

Create a `firestore.indexes.json` file:

```json
{
  "indexes": [
    {
      "collectionGroup": "photos",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "deleted", "order": "ASCENDING" },
        { "fieldPath": "uploadedAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "photos",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "deleted", "order": "ASCENDING" },
        { "fieldPath": "deletedAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

Then deploy:
```bash
firebase deploy --only firestore:indexes
```

## Verifying Indexes

After creating indexes, verify they are active:

1. Go to Firebase Console → Firestore Database → Indexes
2. Check that both indexes show status **Enabled** (not "Building")
3. Test queries:
   - Delete a photo → should move to trash
   - Visit `/trash` → should show deleted photos
   - No Firestore errors in console

## Troubleshooting

### Error: "The query requires an index"

**Solution:** Follow Method 1 above - click the link in the error message to auto-create the index.

### Index stuck on "Building"

**Solution:** Wait 2-5 minutes. For large databases, it can take longer. Check status in Firebase Console.

### Queries still fail after index is created

**Solution:**
1. Clear browser cache and reload
2. Verify index status in Firebase Console
3. Check that field names match exactly (`userId`, `deleted`, `deletedAt`)
4. Ensure field types are correct (boolean for `deleted`, string for timestamp fields)

## Performance Notes

- Indexes improve query performance significantly
- Each index increases write costs slightly (negligible for most apps)
- Indexes are required for compound queries (multiple where clauses)
- Firebase automatically creates single-field indexes

## Related Files

- `/src/firebase.js` - Query functions using these indexes
- `/src/pages/TrashPage.jsx` - Uses deleted photos index
- `/src/utils/photoMigrations.js` - Migration script for deleted field
