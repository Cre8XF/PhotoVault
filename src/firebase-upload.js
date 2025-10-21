// ============================================================================
// FIREBASE UPLOAD HELPER – Lagre bilder til Storage og Firestore
// ============================================================================
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from './firebase';

/**
 * Laster opp et bilde til Firebase Storage og lagrer metadata i Firestore
 *
 * @param {File} file - Bildefilen som skal lastes opp
 * @param {string} userId - Brukerens ID
 * @param {string|null} albumId - Album-ID (valgfritt)
 * @param {Function} onProgress - Callback for fremdrift (0-100)
 * @returns {Promise<object>} - Det opprettede foto-dokumentet
 */
export const uploadPhoto = async (file, userId, albumId = null, onProgress = null) => {
  try {
    // 1. Last opp til Firebase Storage
    const timestamp = Date.now();
    const fileName = `${userId}/${timestamp}_${file.name}`;
    const storageRef = ref(storage, `photos/${fileName}`);

    const uploadTask = uploadBytesResumable(storageRef, file);

    // Lytt til fremdrift
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        snapshot => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(progress);
          }
        },
        error => {
          console.error('Upload error:', error);
          reject(error);
        },
        async () => {
          try {
            // 2. Hent download-URL
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            // 3. Lagre metadata i Firestore
            const photoData = {
              name: file.name,
              url: downloadURL,
              storagePath: fileName,
              userId: userId,
              albumId: albumId,
              size: file.size,
              type: file.type,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              favorite: false,
              faces: 0
            };

            const docRef = await addDoc(collection(db, 'photos'), photoData);

            resolve({
              id: docRef.id,
              ...photoData,
              createdAt: new Date().toISOString(), // For lokal visning
              updatedAt: new Date().toISOString()
            });
          } catch (firestoreError) {
            console.error('Firestore save error:', firestoreError);
            reject(firestoreError);
          }
        }
      );
    });
  } catch (error) {
    console.error('Upload initialization error:', error);
    throw error;
  }
};

/**
 * Laster opp flere bilder samtidig
 *
 * @param {Array<{file: File}>} files - Array med filobjekter
 * @param {string} userId - Brukerens ID
 * @param {string|null} albumId - Album-ID (valgfritt)
 * @param {Function} onProgress - Callback for total fremdrift
 * @returns {Promise<Array>} - Array med opprettede foto-dokumenter
 */
export const uploadMultiplePhotos = async (files, userId, albumId = null, onProgress = null) => {
  const totalFiles = files.length;
  let completedFiles = 0;

  const uploadPromises = files.map(fileObj =>
    uploadPhoto(fileObj.file, userId, albumId, fileProgress => {
      // Oppdater total fremdrift basert på alle filer
      if (onProgress) {
        const totalProgress = ((completedFiles + fileProgress / 100) / totalFiles) * 100;
        onProgress(totalProgress);
      }
    }).then(result => {
      completedFiles++;
      if (onProgress) {
        onProgress((completedFiles / totalFiles) * 100);
      }
      return result;
    })
  );

  return Promise.all(uploadPromises);
};
