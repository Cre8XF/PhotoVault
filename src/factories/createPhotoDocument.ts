import { serverTimestamp } from 'firebase/firestore'
import { PhotoContract } from '../contracts/photoContract'

export function createPhotoDocument({
  userId,
  albumId,
  displayUrl,
  thumbnailUrl,
  width,
  height,
  size,
  isCollage = false,
  collageData,
  collageEditorData,
}: {
  userId: string
  albumId: string | null
  displayUrl: string
  thumbnailUrl: string
  width: number
  height: number
  size: number
  isCollage?: boolean
  collageData?: any
  collageEditorData?: any
}): PhotoContract {
  const nowIso = new Date().toISOString()
  const nowOrder = Date.now()

  return {
    userId,
    albumId,

    displayUrl,
    thumbnailUrl,

    width,
    height,
    size,

    type: 'photo',
    mediaType: 'image',

    deleted: false,
    deletedAt: null,
    deletedBy: null,

    order: nowOrder,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    uploadedAt: nowIso,
    displayDate: nowIso,

    favorite: false,
    tags: [],
    aiTags: [],
    category: isCollage ? 'collage' : null,
    aiAnalyzed: isCollage,
    analyzedAt: isCollage ? nowIso : null,
    faces: 0,

    ...(isCollage && {
      isCollage: true,
      collageData,
      collageEditorData,
    }),
  }
}
