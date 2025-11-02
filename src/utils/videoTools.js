/**
 * Video Processing Utilities
 * Handles thumbnail generation, compression, and metadata extraction
 * Uses ffmpeg.wasm for compression (lazy loaded)
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
 * Generates thumbnail from video file at 1 second mark
 * @param {File} videoFile - Video file object
 * @returns {Promise<Blob|null>} Thumbnail image blob or null if failed
 */
export async function generateThumbnail(videoFile) {
  return new Promise((resolve) => {
    try {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      video.preload = 'metadata';
      video.muted = true;

      // Handle video load
      video.onloadedmetadata = () => {
        // Set canvas size to video dimensions
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Seek to 1 second (or 10% of duration if shorter)
        const seekTime = Math.min(1, video.duration * 0.1);
        video.currentTime = seekTime;
      };

      // Capture frame when seeked
      video.onseeked = () => {
        try {
          // Draw video frame to canvas
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          // Convert canvas to blob
          canvas.toBlob((blob) => {
            // Clean up
            video.src = '';
            URL.revokeObjectURL(video.src);
            resolve(blob);
          }, 'image/jpeg', 0.8);
        } catch (err) {
          console.error('Error capturing frame:', err);
          resolve(null);
        }
      };

      // Handle errors
      video.onerror = (err) => {
        console.error('Video load error:', err);
        resolve(null);
      };

      // Load video
      video.src = URL.createObjectURL(videoFile);
    } catch (err) {
      console.error('Thumbnail generation error:', err);
      resolve(null);
    }
  });
}

/**
 * Extracts video metadata without full processing
 * @param {File} videoFile - Video file object
 * @returns {Promise<Object>} { duration, resolution, fps, size }
 */
export async function extractVideoMetadata(videoFile) {
  return new Promise((resolve) => {
    try {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;

      video.onloadedmetadata = () => {
        const metadata = {
          duration: video.duration || 0,
          resolution: `${video.videoWidth}x${video.videoHeight}`,
          width: video.videoWidth,
          height: video.videoHeight,
          fps: null, // FPS detection would require frame analysis
          size: videoFile.size
        };

        // Clean up
        video.src = '';
        URL.revokeObjectURL(video.src);
        resolve(metadata);
      };

      video.onerror = (err) => {
        console.error('Metadata extraction error:', err);
        resolve({
          duration: 0,
          resolution: 'unknown',
          width: 0,
          height: 0,
          fps: null,
          size: videoFile.size
        });
      };

      video.src = URL.createObjectURL(videoFile);
    } catch (err) {
      console.error('Metadata extraction failed:', err);
      resolve({
        duration: 0,
        resolution: 'unknown',
        width: 0,
        height: 0,
        fps: null,
        size: videoFile.size
      });
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
