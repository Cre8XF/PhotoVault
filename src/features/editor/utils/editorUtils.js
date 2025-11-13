/**
 * Editor Utilities - Phase 4: Save & Integration
 *
 * Utilities for saving edited photos to Firebase
 */

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { collection, addDoc } from 'firebase/firestore'
import { storage, db } from '../../../firebase.js'

/**
 * Save edited photo to Firebase Storage and Firestore
 * @param {Blob} blob - The edited photo blob
 * @param {Object} originalPhoto - The original photo object
 * @param {string} userId - The user ID
 * @returns {Promise<Object>} The new photo document
 */
export const saveEditedPhoto = async (blob, originalPhoto, userId) => {
  if (!blob) {
    throw new Error('No blob provided')
  }

  if (!originalPhoto) {
    throw new Error('No original photo provided')
  }

  if (!userId) {
    throw new Error('No user ID provided')
  }

  try {
    console.log('💾 Saving edited photo...', {
      originalName: originalPhoto.name,
      blobSize: blob.size,
      userId
    })

    // 1. Prepare file name and path
    const timestamp = Date.now()
    const originalName = originalPhoto.name || 'photo.jpg'
    const baseName = originalName.replace(/\.[^.]+$/, '') // Remove extension
    const safeName = `${baseName}_edited_${timestamp}.jpg`.replace(/\s+/g, '_')

    // Use same albumId as original photo if it exists
    const albumId = originalPhoto.albumId || 'unassigned'
    const storagePath = `users/${userId}/${albumId}/${safeName}`

    console.log('📁 Storage path:', storagePath)

    // 2. Upload blob to Firebase Storage
    const storageRef = ref(storage, storagePath)
    await uploadBytes(storageRef, blob, { contentType: 'image/jpeg' })
    const downloadURL = await getDownloadURL(storageRef)

    console.log('✅ Uploaded to Storage:', downloadURL)

    // 3. Create Firestore document
    const photoData = {
      name: safeName,
      url: downloadURL,
      userId: userId,
      albumId: albumId,
      storagePath: storagePath,
      size: blob.size,
      type: 'image/jpeg',
      favorite: originalPhoto.favorite || false,

      // Link to original photo
      editedFrom: originalPhoto.id,
      isEditedVersion: true,

      // Copy relevant metadata from original
      ...(originalPhoto.aiTags && { aiTags: originalPhoto.aiTags }),
      ...(originalPhoto.faces !== undefined && { faces: originalPhoto.faces }),
      ...(originalPhoto.category && { category: originalPhoto.category }),

      // AI fields (default values)
      aiAnalyzed: originalPhoto.aiAnalyzed || false,
      analyzedAt: originalPhoto.analyzedAt || null,
      enhanced: false,
      enhancedUrl: null,
      enhancedAt: null,
      bgRemoved: false,
      noBgUrl: null,
      bgRemovedAt: null,

      // Timestamps
      createdAt: new Date().toISOString(),
      uploadedAt: new Date().toISOString()
    }

    // Add to Firestore
    const docRef = await addDoc(collection(db, 'photos'), photoData)

    console.log('✅ Firestore document created:', docRef.id)

    // Return complete photo object with ID
    const newPhoto = {
      id: docRef.id,
      ...photoData
    }

    return newPhoto
  } catch (error) {
    console.error('❌ Failed to save edited photo:', error)
    throw error
  }
}

/**
 * Generate a preview of edited photo (data URL)
 * @param {Blob} blob - The edited photo blob
 * @returns {Promise<string>} Data URL
 */
export const generatePreviewUrl = async (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Check if a photo is an edited version
 * @param {Object} photo - The photo object
 * @returns {boolean} True if photo is edited version
 */
export const isEditedPhoto = (photo) => {
  return photo?.isEditedVersion === true || photo?.editedFrom !== undefined
}

/**
 * Get original photo ID from edited photo
 * @param {Object} photo - The photo object
 * @returns {string|null} Original photo ID or null
 */
export const getOriginalPhotoId = (photo) => {
  return photo?.editedFrom || null
}
