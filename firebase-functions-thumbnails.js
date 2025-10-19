// ============================================================================
// Firebase Cloud Function: generateThumbnails
// Deploys to: functions/index.js
// ============================================================================

/**
 * SETUP INSTRUCTIONS:
 * 
 * 1. Install Firebase CLI:
 *    npm install -g firebase-tools
 * 
 * 2. Initialize Functions in your project:
 *    firebase init functions
 * 
 * 3. Install dependencies:
 *    cd functions
 *    npm install sharp
 *    npm install @google-cloud/storage
 * 
 * 4. Copy this code to functions/index.js
 * 
 * 5. Deploy:
 *    firebase deploy --only functions
 * 
 * 6. Verify in Firebase Console > Functions
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const sharp = require('sharp');
const path = require('path');
const os = require('os');
const fs = require('fs');

admin.initializeApp();

const storage = admin.storage();
const db = admin.firestore();

/**
 * Cloud Function: Automatically generate thumbnails when images are uploaded
 * Triggers on: New file upload to Firebase Storage
 */
exports.generateThumbnails = functions.storage.object().onFinalize(async (object) => {
  const filePath = object.name; // File path in storage
  const contentType = object.contentType; // File content type
  const bucket = storage.bucket(object.bucket);

  // Exit if not an image
  if (!contentType || !contentType.startsWith('image/')) {
    console.log('Not an image, skipping...');
    return null;
  }

  // Exit if already a thumbnail
  if (filePath.includes('/thumbnails/')) {
    console.log('Already a thumbnail, skipping...');
    return null;
  }

  const fileName = path.basename(filePath);
  const tempFilePath = path.join(os.tmpdir(), fileName);

  try {
    // Download file from bucket
    console.log(`Downloading ${fileName}...`);
    await bucket.file(filePath).download({ destination: tempFilePath });

    // Generate thumbnail sizes
    const sizes = [
      { name: 'small', width: 150, height: 150 },
      { name: 'medium', width: 600, height: 600 },
    ];

    const thumbnailPromises = sizes.map(async (size) => {
      const thumbnailPath = path.join(os.tmpdir(), `${size.name}_${fileName}`);
      
      // Generate thumbnail with sharp
      await sharp(tempFilePath)
        .resize(size.width, size.height, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 80 })
        .toFile(thumbnailPath);

      // Get photo ID from filename (assumes format: timestamp_photoId_filename.jpg)
      const photoId = fileName.split('_')[0];
      
      // Upload thumbnail to storage
      const uploadPath = `users/${filePath.split('/')[1]}/thumbnails/${photoId}_${size.name}.jpg`;
      
      await bucket.upload(thumbnailPath, {
        destination: uploadPath,
        metadata: {
          contentType: 'image/jpeg',
          metadata: {
            originalFile: filePath,
            thumbnailSize: size.name
          }
        }
      });

      // Get thumbnail URL
      const thumbnailFile = bucket.file(uploadPath);
      const [thumbnailUrl] = await thumbnailFile.getSignedUrl({
        action: 'read',
        expires: '03-01-2500'
      });

      // Clean up temp file
      fs.unlinkSync(thumbnailPath);

      console.log(`✓ Generated ${size.name} thumbnail for ${fileName}`);
      
      return { size: size.name, url: thumbnailUrl, path: uploadPath };
    });

    const thumbnails = await Promise.all(thumbnailPromises);

    // Update Firestore document with thumbnail URLs
    // Assumes you have a 'photos' collection with documents that have storagePath field
    const photosRef = db.collection('photos');
    const snapshot = await photosRef.where('storagePath', '==', filePath).get();

    if (!snapshot.empty) {
      const photoDoc = snapshot.docs[0];
      const updateData = {
        thumbnailSmall: thumbnails.find(t => t.size === 'small')?.url,
        thumbnailMedium: thumbnails.find(t => t.size === 'medium')?.url,
        thumbnailsGenerated: true,
        thumbnailsGeneratedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await photoDoc.ref.update(updateData);
      console.log(`✓ Updated Firestore document for ${fileName}`);
    }

    // Clean up original temp file
    fs.unlinkSync(tempFilePath);

    return { success: true, thumbnails };
  } catch (error) {
    console.error('Error generating thumbnails:', error);
    
    // Clean up temp files on error
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }
    
    return { success: false, error: error.message };
  }
});

/**
 * Cloud Function: Delete thumbnails when original image is deleted
 */
exports.deleteThumbnails = functions.storage.object().onDelete(async (object) => {
  const filePath = object.name;
  const bucket = storage.bucket(object.bucket);

  // Exit if already a thumbnail
  if (filePath.includes('/thumbnails/')) {
    console.log('Thumbnail deleted, no cleanup needed');
    return null;
  }

  // Exit if not an image
  if (!object.contentType || !object.contentType.startsWith('image/')) {
    return null;
  }

  try {
    const fileName = path.basename(filePath);
    const photoId = fileName.split('_')[0];
    const userId = filePath.split('/')[1];

    // Delete thumbnail files
    const thumbnailPaths = [
      `users/${userId}/thumbnails/${photoId}_small.jpg`,
      `users/${userId}/thumbnails/${photoId}_medium.jpg`
    ];

    const deletePromises = thumbnailPaths.map(async (thumbPath) => {
      try {
        await bucket.file(thumbPath).delete();
        console.log(`✓ Deleted thumbnail: ${thumbPath}`);
      } catch (err) {
        console.log(`Thumbnail not found: ${thumbPath}`);
      }
    });

    await Promise.all(deletePromises);

    return { success: true, message: 'Thumbnails deleted' };
  } catch (error) {
    console.error('Error deleting thumbnails:', error);
    return { success: false, error: error.message };
  }
});

/**
 * HTTP Function: Manually trigger thumbnail generation for existing images
 * Usage: POST https://REGION-PROJECT_ID.cloudfunctions.net/regenerateThumbnails
 * Body: { "userId": "user123" }
 */
exports.regenerateThumbnails = functions.https.onCall(async (data, context) => {
  // Verify authentication
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'User must be authenticated to regenerate thumbnails'
    );
  }

  const userId = data.userId || context.auth.uid;
  
  try {
    // Get all photos for user from Firestore
    const photosRef = db.collection('photos');
    const snapshot = await photosRef.where('userId', '==', userId).get();

    if (snapshot.empty) {
      return { success: true, message: 'No photos found', processed: 0 };
    }

    let processed = 0;
    const errors = [];

    // Process each photo
    for (const doc of snapshot.docs) {
      const photo = doc.data();
      
      if (!photo.storagePath) continue;

      try {
        const bucket = storage.bucket();
        const file = bucket.file(photo.storagePath);
        const [exists] = await file.exists();

        if (!exists) {
          console.log(`File not found: ${photo.storagePath}`);
          continue;
        }

        // Trigger thumbnail generation by creating a temporary download
        const tempFilePath = path.join(os.tmpdir(), path.basename(photo.storagePath));
        await file.download({ destination: tempFilePath });

        // Use the same logic as generateThumbnails function
        const sizes = [
          { name: 'small', width: 150, height: 150 },
          { name: 'medium', width: 600, height: 600 }
        ];

        const thumbnails = [];

        for (const size of sizes) {
          const thumbnailPath = path.join(os.tmpdir(), `${size.name}_${path.basename(photo.storagePath)}`);
          
          await sharp(tempFilePath)
            .resize(size.width, size.height, { fit: 'cover', position: 'center' })
            .jpeg({ quality: 80 })
            .toFile(thumbnailPath);

          const uploadPath = `users/${userId}/thumbnails/${doc.id}_${size.name}.jpg`;
          
          await bucket.upload(thumbnailPath, {
            destination: uploadPath,
            metadata: { contentType: 'image/jpeg' }
          });

          const thumbnailFile = bucket.file(uploadPath);
          const [thumbnailUrl] = await thumbnailFile.getSignedUrl({
            action: 'read',
            expires: '03-01-2500'
          });

          thumbnails.push({ size: size.name, url: thumbnailUrl });

          fs.unlinkSync(thumbnailPath);
        }

        // Update Firestore
        await doc.ref.update({
          thumbnailSmall: thumbnails.find(t => t.size === 'small')?.url,
          thumbnailMedium: thumbnails.find(t => t.size === 'medium')?.url,
          thumbnailsGenerated: true,
          thumbnailsGeneratedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        fs.unlinkSync(tempFilePath);
        processed++;
      } catch (err) {
        errors.push({ photoId: doc.id, error: err.message });
      }
    }

    return {
      success: true,
      processed,
      total: snapshot.size,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (error) {
    console.error('Error regenerating thumbnails:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
