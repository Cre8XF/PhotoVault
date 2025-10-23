import { deleteObject, ref } from "firebase/storage";
import { deleteDoc, doc } from "firebase/firestore";
import { storage, db } from "../firebase";

export async function deletePhoto(photoId, photoUrl) {
  try {
    // 1. Slett fra Storage
    const storageRef = ref(storage, photoUrl);
    await deleteObject(storageRef);

    // 2. Slett fra Firestore
    const photoDoc = doc(db, "photos", photoId);
    await deleteDoc(photoDoc);

    console.log(`✅ Deleted photo ${photoId}`);
    return true;
  } catch (err) {
    console.error("❌ Error deleting photo:", err);
    return false;
  }
}
