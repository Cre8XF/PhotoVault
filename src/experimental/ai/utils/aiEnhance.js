// src/utils/aiEnhance.js
import { runPicsartTool } from "./picsartClient";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

export async function enhancePhoto(photo) {
  const result = await runPicsartTool("enhance", photo.url);
  const enhancedUrl = result?.data?.url;

  if (enhancedUrl) {
    await updateDoc(doc(db, "photos", photo.id), {
      enhancedUrl,
      enhancedAt: new Date().toISOString(),
    });
  }
  return enhancedUrl;
}
