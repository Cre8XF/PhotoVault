// src/utils/aiSort.js
import { runPicsartTool } from "./picsartClient";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

export async function autoSortAndTag(photo) {
  const [faces, tags] = await Promise.all([
    runPicsartTool("face-detection", photo.url),
    runPicsartTool("tags/extract", photo.url),
  ]);

  const tagList = tags?.data?.tags?.map(t => t.tag) || [];
  const facesCount = faces?.data?.faces?.length || 0;

  await updateDoc(doc(db, "photos", photo.id), {
    aiTags: tagList,
    faces: facesCount,
  });

  return { facesCount, tagList };
}
