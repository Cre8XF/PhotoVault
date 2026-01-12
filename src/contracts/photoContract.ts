export type PhotoContract = {
  // Identity
  userId: string
  albumId: string | null

  // Display
  displayUrl: string
  thumbnailUrl: string

  // Dimensions & size
  width: number
  height: number
  size: number

  // Type
  type: 'photo'
  mediaType: 'image'

  // Query-critical
  deleted: boolean
  deletedAt: string | null
  deletedBy: string | null

  // Ordering & timeline
  order: number
  createdAt: any
  updatedAt: any
  uploadedAt: string
  displayDate: string

  // Metadata
  favorite: boolean
  tags: string[]
  aiTags: string[]
  category: string | null
  aiAnalyzed: boolean
  analyzedAt: string | null
  faces: number

  // Flags
  isCollage?: boolean

  // Extensions
  collageData?: any
  collageEditorData?: any
}
