// ============================================================================
// firebase.js – komplett integrasjon (v3.1) med konsolidert cover-funksjon
// ============================================================================
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

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

// 🔗 Firebase-konfig (from environment variables)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

// Validate required environment variables
const requiredEnvVars = [
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_AUTH_DOMAIN',
  'REACT_APP_FIREBASE_PROJECT_ID',
  'REACT_APP_FIREBASE_STORAGE_BUCKET',
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  console.error('Please check your .env file and ensure all Firebase config variables are set.');
}

// 🚀 Initialiser Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

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
    name: data.name || data.title || "Uten navn",
    createdAt: data.createdAt || now,
    updatedAt: now,
    photoCount: 0,
    cover: data.cover || "",
    userId: data.userId || "",
  };
  const refDoc = await addDoc(collection(db, "albums"), payload);
  console.log(`📂 Album opprettet: ${payload.name}`);
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
    console.log(`📝 Album oppdatert (${albumId})`);
  } catch (err) {
    console.error("🔥 updateAlbum:", err);
  }
}

// 🔹 Sett cover-bilde (KONSOLIDERT FUNKSJON)
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
    throw err;
  }
}

// 🔹 Hent alle bilder for bruker
export async function getPhotosByUser(userId) {
  try {
    const q = query(collection(db, "photos"), where("userId", "==", userId));
    const snap = await getDocs(q);

    return snap.docs.map((d) => {
      const data = d.data();

      // 🔧 Konverter Firestore Timestamp til ISO-streng
      if (data.createdAt?.toDate)
        data.createdAt = data.createdAt.toDate().toISOString();
      if (data.updatedAt?.toDate)
        data.updatedAt = data.updatedAt.toDate().toISOString();

      if (!data.createdAt) data.createdAt = new Date().toISOString();
      if (!data.updatedAt) data.updatedAt = data.createdAt;
      if (!("favorite" in data)) data.favorite = false;
      
      // AI-felt defaults
      if (!data.aiTags) data.aiTags = [];
      if (!("faces" in data)) data.faces = 0;
      if (!("aiAnalyzed" in data)) data.aiAnalyzed = false;

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
    
    // AI-defaults
    aiTags: data.aiTags || [],
    faces: data.faces || 0,
    category: data.category || null,
    aiAnalyzed: data.aiAnalyzed || false,
    analyzedAt: data.analyzedAt || null,
    enhanced: data.enhanced || false,
    enhancedUrl: data.enhancedUrl || null,
    enhancedAt: data.enhancedAt || null,
    bgRemoved: data.bgRemoved || false,
    noBgUrl: data.noBgUrl || null,
    bgRemovedAt: data.bgRemovedAt || null,
  };

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

// ⭐ Toggle favoritt-status
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

// 🔹 Oppdater hvilket album et bilde tilhører
export async function updatePhotoAlbum(photoId, targetAlbumId) {
  try {
    const photoRef = doc(db, "photos", photoId);
    await updateDoc(photoRef, { 
      albumId: targetAlbumId,
      updatedAt: new Date().toISOString()
    });
  } catch (err) {
    console.error("🔥 updatePhotoAlbum:", err);
    throw err;
  }
}

// ============================================================================
// ☁️ Storage-funksjoner
// ============================================================================

// 🔹 Last opp bildefil komplett (Storage + Firestore) med AI-støtte
export async function uploadPhoto(userId, file, albumId = null, aiTagging = false) {
  try {
    // 1. Last opp til Storage
    const timestamp = Date.now();
    const safeName = file.name.replace(/\s+/g, "_");
    const folderPath = albumId || "unassigned";
    const storagePath = `users/${userId}/${folderPath}/${timestamp}_${safeName}`;
    const storageRef = ref(storage, storagePath);
    
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);

    console.log(`📸 Bilde lastet opp til Storage: ${safeName}`);

    // 2. Forbered metadata
    const photoData = {
      name: file.name,
      url: downloadURL,
      userId: userId,
      albumId: albumId,
      storagePath: storagePath,
      size: file.size,
      type: file.type,
      favorite: false,
      
      // AI-felt (Fase 4.0)
      aiTags: [],
      faces: 0,
      category: null,
      aiAnalyzed: false,
      analyzedAt: null,
      enhanced: false,
      enhancedUrl: null,
      enhancedAt: null,
      bgRemoved: false,
      noBgUrl: null,
      bgRemovedAt: null,
      
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 3. AI-tagging (hvis aktivert) - Fase 4.1
    if (aiTagging) {
      try {
        console.log("🤖 Starter AI-analyse...");
        
        // Import gjøres her for å unngå circular dependency
        const { analyzeImage } = await import('./utils/googleVision');
        
        const analysis = await analyzeImage(downloadURL, {
          detectLabels: true,
          detectFaces: true,
          detectSafeSearch: true,
          maxLabels: 10
        });
        
        // Oppdater photoData med AI-resultater
        photoData.aiTags = analysis.labels.map(l => l.name);
        photoData.faces = analysis.faces;
        photoData.category = analysis.category || null;
        photoData.aiAnalyzed = true;
        photoData.analyzedAt = new Date().toISOString();
        
        console.log(`✅ AI-analyse fullført: ${photoData.aiTags.length} tags, ${photoData.faces} ansikter`);
        
      } catch (aiError) {
        console.warn("⚠️ AI-analyse feilet:", aiError.message);
        // Fortsett med opplasting selv om AI feiler
      }
    }

    // 4. Lagre metadata i Firestore
    const photoId = await addPhoto(photoData);
    console.log(`✅ Bilde lagret i Firestore: ${photoId}`);

    // 5. Oppdater album photoCount (hvis albumId finnes)
    if (albumId) {
      try {
        const albumRef = doc(db, "albums", albumId);
        const albumSnap = await getDoc(albumRef);
        if (albumSnap.exists()) {
          const currentCount = albumSnap.data().photoCount || 0;
          await updateAlbumPhotoCount(albumId, currentCount + 1);
          console.log(`📂 Album photoCount oppdatert: ${albumId}`);
        }
      } catch (err) {
        console.warn("⚠️ Kunne ikke oppdatere album count:", err);
      }
    }

    return photoId;

  } catch (error) {
    console.error("🔥 uploadPhoto error:", error);
    throw new Error(`Upload feilet: ${error.message}`);
  }
}

// 🔹 Last opp thumbnail
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
export { db, storage, auth };