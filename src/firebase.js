// ============================================================================
// firebase.js – komplett integrasjon (v2.1) med favoritt-toggle
// ============================================================================
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  setDoc,
  doc,
  query,
  where,
  orderBy,
  deleteDoc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

// 🔗 Firebase-konfig
const firebaseConfig = {
  apiKey: "AIzaSyCv3HzcHXoo2Xk-cmOOiVElLuLx3XZpEXI",
  authDomain: "photovault-app-a0946.firebaseapp.com",
  projectId: "photovault-app-a0946",
  storageBucket: "photovault-app-a0946.firebasestorage.app",
  messagingSenderId: "727453609889",
  appId: "1:727453609889:web:ea04b86e7774a7fea565e0",
};

// 🚀 Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// ============================================================================
// 📁 Firestore-funksjoner
// ============================================================================

// 🔹 Hent alle album for en bruker
export async function getAlbumsByUser(userId) {
  try {
    const q = query(collection(db, "albums"), where("userId", "==", userId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      if (!data.createdAt) data.createdAt = new Date().toISOString();
      if (!data.updatedAt) data.updatedAt = data.createdAt;
      if (!("photoCount" in data)) data.photoCount = 0;
      return { id: d.id, ...data };
    });
  } catch (err) {
    console.error("🔥 getAlbumsByUser:", err);
    return [];
  }
}

// 🔹 Legg til nytt album
export async function addAlbum(data) {
  const now = new Date().toISOString();
  const payload = {
    ...data,
    createdAt: data.createdAt || now,
    updatedAt: now,
    photoCount: 0,
    cover: data.cover || "",
  };
  const refDoc = await addDoc(collection(db, "albums"), payload);
  console.log(`📁 Album opprettet: ${payload.name}`);
  return refDoc.id;
}

// 🔹 Oppdater album
export async function updateAlbum(albumId, updates) {
  try {
    const refDoc = doc(db, "albums", albumId);
    await updateDoc(refDoc, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
    console.log(`📁 Album oppdatert (${albumId})`);
  } catch (err) {
    console.error("🔥 updateAlbum:", err);
  }
}

// 🔹 Sett cover-bilde
export async function setAlbumCover(albumId, photoUrl) {
  try {
    const refDoc = doc(db, "albums", albumId);
    await updateDoc(refDoc, {
      cover: photoUrl,
      updatedAt: new Date().toISOString(),
    });
    console.log(`🖼️ Cover oppdatert for album ${albumId}`);
  } catch (err) {
    console.error("🔥 setAlbumCover:", err);
  }
}

// 🔹 Hent alle bilder for bruker
export async function getPhotosByUser(userId) {
  try {
    const q = query(collection(db, "photos"), where("userId", "==", userId));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      if (!data.createdAt) data.createdAt = new Date().toISOString();
      if (!data.updatedAt) data.updatedAt = data.createdAt;
      if (!("favorite" in data)) data.favorite = false;
      return { id: d.id, ...data };
    });
  } catch (err) {
    console.error("🔥 getPhotosByUser:", err);
    return [];
  }
}

// 🔹 Legg til nytt bilde
export async function addPhoto(data) {
  const now = new Date().toISOString();
  const payload = {
    ...data,
    createdAt: data.createdAt || now,
    updatedAt: now,
    favorite: data.favorite || false,
  };
  
  // ✅ La Firestore generere ID automatisk
  const refDoc = await addDoc(collection(db, "photos"), payload);
  console.log(`📸 Bilde lagret: ${refDoc.id}`);
  return refDoc.id;
}

// 🔹 Oppdater metadata for et bilde
export async function updatePhoto(photoId, updates) {
  try {
    const refDoc = doc(db, "photos", photoId);
    await updateDoc(refDoc, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("🔥 updatePhoto:", err);
  }
}

// ⭐ NYTT: Toggle favoritt-status
export async function toggleFavorite(photoId, currentStatus) {
  try {
    const refDoc = doc(db, "photos", photoId);
    const newStatus = !currentStatus;
    
    await updateDoc(refDoc, {
      favorite: newStatus,
      updatedAt: new Date().toISOString(),
    });
    
    console.log(`⭐ Favoritt oppdatert: ${photoId} → ${newStatus}`);
    return newStatus;
  } catch (err) {
    console.error("🔥 toggleFavorite error:", err);
    console.error("PhotoId:", photoId, "CurrentStatus:", currentStatus);
    throw err;
  }
}

// 🔹 Slett bilde fra Firestore + Storage
export async function deletePhoto(photoId, storagePath) {
  try {
    if (storagePath) {
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
    }
    await deleteDoc(doc(db, "photos", photoId));
  } catch (err) {
    console.error("🔥 deletePhoto:", err);
  }
}

// 🔹 Oppdater antall bilder i et album
export async function updateAlbumPhotoCount(albumId, newCount) {
  try {
    const refDoc = doc(db, "albums", albumId);
    await updateDoc(refDoc, {
      photoCount: newCount,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("🔥 updateAlbumPhotoCount:", err);
  }
}

// ============================================================================
// ☁️ Storage-funksjoner
// ============================================================================

// 🔹 Last opp bildefil og returner URL + sti
export async function uploadPhoto(file, userId, albumId = "root") {
  try {
    const timestamp = Date.now();
    const safeName = file.name.replace(/\s+/g, "_");
    const storagePath = `users/${userId}/${albumId}/${timestamp}_${safeName}`;
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return { downloadURL, storagePath };
  } catch (error) {
    console.error("🔥 uploadPhoto:", error);
    throw new Error(error.message);
  }
}

// Etter uploadPhoto funksjonen:
export async function uploadThumbnail(blob, userId, photoId, size = "small") {
  try {
    const storagePath = `users/${userId}/thumbnails/${photoId}_${size}.jpg`;
    const storageRef = ref(storage, storagePath);
    await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(storageRef);
    return { downloadURL, storagePath };
  } catch (error) {
    console.error("🔥 uploadThumbnail:", error);
    throw new Error(error.message);
  }
}

// ============================================================================
// 📦 Eksporter Firebase-objekter
// ============================================================================
export { db, storage };