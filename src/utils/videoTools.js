/**
 * Video Processing Utilities
 * Handles thumbnail generation, compression, and metadata extraction
 * Uses ffmpeg.wasm for compression (lazy loaded)
 *
 * All functions return null on failure to allow graceful degradation
 * Updated: 2025-11-02 - Added timeouts, error handling, MIME validation
 */
import { FFmpeg } from '@ffmpeg/ffmpeg'
import { fetchFile } from '@ffmpeg/util'

/**
 * Check if file is a supported video format
 * @param {File} file - File object to check
 * @returns {boolean} True if video file
 */
export function isVideoFile(file) {
  const supportedTypes = [
    'video/mp4',
    'video/quicktime', // .mov
    'video/webm',
  ]
  return file && supportedTypes.includes(file.type)
}

/**
 * Format duration in seconds to MM:SS format
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
export function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Format file size in bytes to human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`
}

/**
 * Generate thumbnail from video file
 * Returns blob on success, null on failure
 * Includes comprehensive logging for debugging
 * @param {File} videoFile - Video file object
 * @returns {Promise<Blob|null>} Thumbnail image blob or null if failed
 */
export async function generateThumbnail(videoFile) {
  if (import.meta.env.DEV) console.log('🎬 [Thumbnail] Starting generation for:', videoFile.name)

  // Validate file type
  if (!videoFile.type || !videoFile.type.startsWith('video/')) {
    if (import.meta.env.DEV) console.warn('❌ [Thumbnail] Invalid MIME type:', videoFile.type)
    return null
  }

  // Validate file size (sanity check)
  if (videoFile.size === 0) {
    if (import.meta.env.DEV) console.warn('❌ [Thumbnail] File is empty')
    return null
  }

  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.muted = true // CRITICAL: Required for autoplay in browsers
    video.playsInline = true // Required for iOS

    let objectUrl = null
    let resolved = false

    // 12 second timeout (generous for large files)
    const timeout = setTimeout(() => {
      if (!resolved) {
        if (import.meta.env.DEV) console.warn('⏱️ [Thumbnail] Timeout after 12 seconds')
        cleanup()
        resolve(null)
        resolved = true
      }
    }, 12000)

    const cleanup = () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl)
        objectUrl = null
      }
      video.src = ''
      video.load()
    }

    video.onloadedmetadata = () => {
      if (resolved) return

      if (import.meta.env.DEV) console.log(
        '✅ [Thumbnail] Metadata loaded - duration:',
        video.duration.toFixed(2),
        'seconds'
      )

      // Validate duration
      if (!video.duration || video.duration === 0) {
        if (import.meta.env.DEV) console.warn('⚠️ [Thumbnail] Video has no duration')
        cleanup()
        clearTimeout(timeout)
        resolve(null)
        resolved = true
        return
      }

      // Seek to 1 second or 5% of duration (whichever is smaller)
      const seekTime = Math.min(1, video.duration * 0.05)
      if (import.meta.env.DEV) console.log('⏩ [Thumbnail] Seeking to:', seekTime.toFixed(2), 'seconds')

      try {
        video.currentTime = seekTime
      } catch (error) {
        console.error('❌ [Thumbnail] Seek failed:', error)
        cleanup()
        clearTimeout(timeout)
        resolve(null)
        resolved = true
      }
    }

    video.onseeked = () => {
      if (resolved) return

      if (import.meta.env.DEV) console.log('📸 [Thumbnail] Seeked successfully, capturing frame...')
      clearTimeout(timeout)

      try {
        // Validate video dimensions
        if (!video.videoWidth || !video.videoHeight) {
          console.error('❌ [Thumbnail] Video has no dimensions')
          cleanup()
          resolve(null)
          resolved = true
          return
        }

        if (import.meta.env.DEV) console.log(
          `📐 [Thumbnail] Video dimensions: ${video.videoWidth}x${video.videoHeight}`
        )

        // Create canvas with optimized size
        const canvas = document.createElement('canvas')
        const maxWidth = 640 // Max thumbnail width
        const scale = Math.min(1, maxWidth / video.videoWidth)

        canvas.width = Math.floor(video.videoWidth * scale)
        canvas.height = Math.floor(video.videoHeight * scale)

        if (import.meta.env.DEV) console.log(
          `🖼️ [Thumbnail] Canvas size: ${canvas.width}x${canvas.height}`
        )

        const ctx = canvas.getContext('2d', { alpha: false })
        if (!ctx) {
          console.error('❌ [Thumbnail] Failed to get canvas context')
          cleanup()
          resolve(null)
          resolved = true
          return
        }

        // Draw video frame to canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob && blob.size > 0) {
              if (import.meta.env.DEV) console.log(
                '✅ [Thumbnail] Generated successfully:',
                (blob.size / 1024).toFixed(1),
                'KB'
              )
              cleanup()
              resolve(blob)
              resolved = true
            } else {
              console.error('❌ [Thumbnail] toBlob returned invalid blob')
              cleanup()
              resolve(null)
              resolved = true
            }
          },
          'image/jpeg',
          0.85 // Quality: 85%
        )
      } catch (error) {
        console.error('❌ [Thumbnail] Canvas error:', error)
        cleanup()
        resolve(null)
        resolved = true
      }
    }

    video.onerror = (error) => {
      if (!resolved) {
        clearTimeout(timeout)
        console.error('❌ [Thumbnail] Video error:', error)
        console.error('Video error details:', {
          error: video.error,
          networkState: video.networkState,
          readyState: video.readyState,
        })
        cleanup()
        resolve(null)
        resolved = true
      }
    }

    // Create object URL and set video source
    try {
      objectUrl = URL.createObjectURL(videoFile)
      video.src = objectUrl
      if (import.meta.env.DEV) console.log('🔗 [Thumbnail] Object URL created')
    } catch (error) {
      clearTimeout(timeout)
      console.error('❌ [Thumbnail] Failed to create object URL:', error)
      resolve(null)
      resolved = true
    }
  })
}

/**
 * Extract video metadata (duration, resolution)
 * Returns object with metadata or null on failure
 * @param {File} videoFile - Video file object
 * @returns {Promise<Object|null>} { duration, resolution, fps, size } or null
 */
export async function extractVideoMetadata(videoFile) {
  if (import.meta.env.DEV) console.log('📊 [Metadata] Extracting for:', videoFile.name)

  // Validate file type
  if (!videoFile.type || !videoFile.type.startsWith('video/')) {
    if (import.meta.env.DEV) console.warn('❌ [Metadata] Invalid MIME type:', videoFile.type)
    return null
  }

  return new Promise((resolve) => {
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.muted = true

    let resolved = false
    let objectUrl = null

    // 8 second timeout
    const timeout = setTimeout(() => {
      if (!resolved) {
        if (import.meta.env.DEV) console.warn('⏱️ [Metadata] Timeout after 8 seconds')
        if (objectUrl) URL.revokeObjectURL(objectUrl)
        video.src = ''
        resolve(null)
        resolved = true
      }
    }, 8000)

    video.onloadedmetadata = () => {
      if (!resolved) {
        clearTimeout(timeout)

        const metadata = {
          duration: video.duration || 0,
          resolution:
            video.videoWidth && video.videoHeight
              ? `${video.videoWidth}x${video.videoHeight}`
              : 'unknown',
          width: video.videoWidth || 0,
          height: video.videoHeight || 0,
          fps: null, // FPS detection is complex, leave as null
          size: videoFile.size,
        }

        if (import.meta.env.DEV) console.log('✅ [Metadata] Extracted:', metadata)
        if (objectUrl) URL.revokeObjectURL(objectUrl)
        video.src = ''
        resolve(metadata)
        resolved = true
      }
    }

    video.onerror = (error) => {
      if (!resolved) {
        clearTimeout(timeout)
        console.error('❌ [Metadata] Error:', error)
        if (objectUrl) URL.revokeObjectURL(objectUrl)
        video.src = ''
        resolve(null)
        resolved = true
      }
    }

    try {
      objectUrl = URL.createObjectURL(videoFile)
      video.src = objectUrl
      if (import.meta.env.DEV) console.log('🔗 [Metadata] Object URL created')
    } catch (error) {
      clearTimeout(timeout)
      console.error('❌ [Metadata] Failed to create object URL:', error)
      resolve(null)
      resolved = true
    }
  })
}

/**
 * Compresses video using ffmpeg.wasm (lazy loaded)
 * Only compresses if file size >50 MB
 * Target: 720p max, H.264 codec, CRF 23
 * @param {File} videoFile - Video file to compress
 * @param {Function} onProgress - Callback(percentage: number)
 * @returns {Promise<Blob|null>} Compressed video or null if failed/skipped
 */
export async function compressVideo(videoFile, onProgress = () => {}) {
  const COMPRESSION_THRESHOLD = 50 * 1024 * 1024 // 50 MB

  // Skip compression for small files
  if (videoFile.size < COMPRESSION_THRESHOLD) {
    if (import.meta.env.DEV) console.log('Video size below threshold, skipping compression')
    return null
  }

  try {
    // Lazy load ffmpeg
    const ffmpeg = new FFmpeg()

    // Setup progress callback
    ffmpeg.on('progress', ({ progress }) => {
      const percentage = Math.round(progress * 100)
      onProgress(percentage)
    })

    // Load ffmpeg core
    await ffmpeg.load()
    if (import.meta.env.DEV) console.log('FFmpeg loaded successfully')

    // Write input file to ffmpeg virtual filesystem
    const inputName = 'input.mp4'
    const outputName = 'output.mp4'
    await ffmpeg.writeFile(inputName, await fetchFile(videoFile))

    // Run compression
    // -i input: input file
    // -vf scale=1280:-2: scale to 720p (maintain aspect ratio)
    // -c:v libx264: use H.264 codec
    // -crf 23: quality level (lower = better quality, 23 is good balance)
    // -preset medium: encoding speed (medium is balanced)
    // -c:a aac: use AAC audio codec
    // -b:a 128k: audio bitrate
    await ffmpeg.exec([
      '-i',
      inputName,
      '-vf',
      'scale=1280:-2',
      '-c:v',
      'libx264',
      '-crf',
      '23',
      '-preset',
      'medium',
      '-c:a',
      'aac',
      '-b:a',
      '128k',
      outputName,
    ])

    // Read output file
    const data = await ffmpeg.readFile(outputName)
    const blob = new Blob([data.buffer], { type: 'video/mp4' })

    if (import.meta.env.DEV) console.log('Compression complete:', {
      original: formatFileSize(videoFile.size),
      compressed: formatFileSize(blob.size),
      savings: `${Math.round((1 - blob.size / videoFile.size) * 100)}%`,
    })

    return blob
  } catch (err) {
    console.error('Video compression failed:', err)
    return null
  }
}

/**
 * FUTURE: Transcode unsupported formats (.mkv, .avi) to .mp4
 * Currently not implemented - would require additional ffmpeg work
 * @param {File} videoFile - Video file to transcode
 * @returns {Promise<Blob|null>}
 */
export async function transcodeToMP4(videoFile) {
  if (import.meta.env.DEV) console.warn('Transcoding not yet implemented')
  return null
}

export default {
  isVideoFile,
  formatDuration,
  formatFileSize,
  generateThumbnail,
  extractVideoMetadata,
  compressVideo,
  transcodeToMP4,
}
