/**
 * Video Processing Utilities
 * Handles thumbnail generation, compression, and metadata extraction
 * Uses ffmpeg.wasm for compression (lazy loaded)
 *
 * All functions return null on failure to allow graceful degradation
 * Updated: 2025-11-02 - Added timeouts, error handling, MIME validation
 */

/**
 * Check if file is a supported video format
 * @param {File} file - File object to check
 * @returns {boolean} True if video file
 */
export function isVideoFile(file) {
  const supportedTypes = [
    'video/mp4',
    'video/quicktime', // .mov
    'video/webm'
  ];
  return file && supportedTypes.includes(file.type);
}

/**
 * Format duration in seconds to MM:SS format
 * @param {number} seconds - Duration in seconds
 * @returns {string} Formatted duration
 */
export function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format file size in bytes to human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

/**
 * Generate thumbnail from video at 1 second mark
 * Returns null on failure (upload continues without thumbnail)
 * @param {File} videoFile - Video file object
 * @returns {Promise<Blob|null>} Thumbnail image blob or null if failed
 */
export async function generateThumbnail(videoFile) {
  // Validate file type
  if (!videoFile.type || !videoFile.type.startsWith('video/')) {
    console.warn('Invalid video MIME type:', videoFile.type);
    return null;
  }

  return new Promise((resolve) => {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    video.preload = 'metadata';
    video.muted = true;

    let resolved = false;
    let objectUrl = null;

    // 8 second timeout
    const timeout = setTimeout(() => {
      if (!resolved) {
        console.warn('Thumbnail generation timeout');
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        video.src = '';
        resolve(null);
        resolved = true;
      }
    }, 8000);

    video.onloadedmetadata = () => {
      // Set canvas size to video dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Seek to 1 second (or 10% of duration if shorter)
      const seekTime = Math.min(1, video.duration * 0.1);
      video.currentTime = seekTime;
    };

    video.onseeked = () => {
      if (!resolved) {
        clearTimeout(timeout);
        try {
          // Draw video frame to canvas
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Convert canvas to blob
          canvas.toBlob((blob) => {
            if (objectUrl) URL.revokeObjectURL(objectUrl);
            video.src = '';
            resolve(blob);
            resolved = true;
          }, 'image/jpeg', 0.8);
        } catch (error) {
          console.error('Thumbnail generation error:', error);
          if (objectUrl) URL.revokeObjectURL(objectUrl);
          video.src = '';
          resolve(null);
          resolved = true;
        }
      }
    };

    video.onerror = (error) => {
      if (!resolved) {
        clearTimeout(timeout);
        console.error('Video load error for thumbnail:', error);
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        video.src = '';
        resolve(null);
        resolved = true;
      }
    };

    try {
      objectUrl = URL.createObjectURL(videoFile);
      video.src = objectUrl;
    } catch (error) {
      clearTimeout(timeout);
      console.error('Failed to create object URL for thumbnail:', error);
      resolve(null);
      resolved = true;
    }
  });
}

/**
 * Extracts video metadata with robust error handling
 * Returns null on failure (upload continues without metadata)
 * @param {File} videoFile - Video file object
 * @returns {Promise<Object|null>} { duration, resolution, fps, size } or null
 */
export async function extractVideoMetadata(videoFile) {
  // Validate file type
  if (!videoFile.type || !videoFile.type.startsWith('video/')) {
    console.warn('Invalid video MIME type:', videoFile.type);
    return null;
  }

  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;

    let resolved = false;
    let objectUrl = null;

    // 8 second timeout
    const timeout = setTimeout(() => {
      if (!resolved) {
        console.warn('Video metadata timeout - continuing without metadata');
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        video.src = '';
        resolve(null);
        resolved = true;
      }
    }, 8000);

    video.onloadedmetadata = () => {
      if (!resolved) {
        clearTimeout(timeout);
        const metadata = {
          duration: video.duration || 0,
          resolution: video.videoWidth && video.videoHeight
            ? `${video.videoWidth}x${video.videoHeight}`
            : 'unknown',
          width: video.videoWidth || 0,
          height: video.videoHeight || 0,
          fps: null, // FPS detection is complex, leave as null
          size: videoFile.size
        };

        if (objectUrl) URL.revokeObjectURL(objectUrl);
        video.src = '';
        resolve(metadata);
        resolved = true;
      }
    };

    video.onerror = (error) => {
      if (!resolved) {
        clearTimeout(timeout);
        console.error('Video metadata extraction error:', error);
        if (objectUrl) URL.revokeObjectURL(objectUrl);
        video.src = '';
        resolve(null);
        resolved = true;
      }
    };

    try {
      objectUrl = URL.createObjectURL(videoFile);
      video.src = objectUrl;
    } catch (error) {
      clearTimeout(timeout);
      console.error('Failed to create object URL for video:', error);
      resolve(null);
      resolved = true;
    }
  });
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
  const COMPRESSION_THRESHOLD = 50 * 1024 * 1024; // 50 MB

  // Skip compression for small files
  if (videoFile.size < COMPRESSION_THRESHOLD) {
    console.log('Video size below threshold, skipping compression');
    return null;
  }

  try {
    // Lazy load ffmpeg
    const { FFmpeg } = await import('@ffmpeg/ffmpeg');
    const { fetchFile } = await import('@ffmpeg/util');

    const ffmpeg = new FFmpeg();

    // Setup progress callback
    ffmpeg.on('progress', ({ progress }) => {
      const percentage = Math.round(progress * 100);
      onProgress(percentage);
    });

    // Load ffmpeg core
    await ffmpeg.load();
    console.log('FFmpeg loaded successfully');

    // Write input file to ffmpeg virtual filesystem
    const inputName = 'input.mp4';
    const outputName = 'output.mp4';
    await ffmpeg.writeFile(inputName, await fetchFile(videoFile));

    // Run compression
    // -i input: input file
    // -vf scale=1280:-2: scale to 720p (maintain aspect ratio)
    // -c:v libx264: use H.264 codec
    // -crf 23: quality level (lower = better quality, 23 is good balance)
    // -preset medium: encoding speed (medium is balanced)
    // -c:a aac: use AAC audio codec
    // -b:a 128k: audio bitrate
    await ffmpeg.exec([
      '-i', inputName,
      '-vf', 'scale=1280:-2',
      '-c:v', 'libx264',
      '-crf', '23',
      '-preset', 'medium',
      '-c:a', 'aac',
      '-b:a', '128k',
      outputName
    ]);

    // Read output file
    const data = await ffmpeg.readFile(outputName);
    const blob = new Blob([data.buffer], { type: 'video/mp4' });

    console.log('Compression complete:', {
      original: formatFileSize(videoFile.size),
      compressed: formatFileSize(blob.size),
      savings: `${Math.round((1 - blob.size / videoFile.size) * 100)}%`
    });

    return blob;

  } catch (err) {
    console.error('Video compression failed:', err);
    return null;
  }
}

/**
 * FUTURE: Transcode unsupported formats (.mkv, .avi) to .mp4
 * Currently not implemented - would require additional ffmpeg work
 * @param {File} videoFile - Video file to transcode
 * @returns {Promise<Blob|null>}
 */
export async function transcodeToMP4(videoFile) {
  console.warn('Transcoding not yet implemented');
  return null;
}

export default {
  isVideoFile,
  formatDuration,
  formatFileSize,
  generateThumbnail,
  extractVideoMetadata,
  compressVideo,
  transcodeToMP4
};
