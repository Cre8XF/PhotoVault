/**
 * Analytics tracking for QR-sharing feature
 *
 * Simple console-based analytics that can be extended
 * to send data to Google Analytics, Mixpanel, or other services
 */

/**
 * Track when a QR code is generated
 * @param {string} albumId - Album ID
 * @param {string} userId - User ID
 */
export const trackQRGenerated = (albumId, userId) => {
  const event = {
    event: 'qr_generated',
    albumId,
    userId,
    timestamp: new Date().toISOString(),
  }

  console.log('📊 Analytics - QR Generated:', event)

  // TODO: Send to analytics service
  // Example: gtag('event', 'qr_generated', { albumId, userId })
  // Example: mixpanel.track('QR Generated', { albumId, userId })
}

/**
 * Track when a public album is viewed
 * @param {string} slug - Album slug
 * @param {string} referrer - Document referrer (where user came from)
 */
export const trackPublicView = (slug, referrer) => {
  const event = {
    event: 'public_album_viewed',
    slug,
    referrer: referrer || 'direct',
    timestamp: new Date().toISOString(),
  }

  console.log('📊 Analytics - Public Album Viewed:', event)

  // TODO: Send to analytics service
  // Example: gtag('event', 'public_album_viewed', { slug, referrer })
}

/**
 * Track when a photo is uploaded to a public album
 * @param {string} slug - Album slug
 * @param {number} photoCount - Number of photos uploaded
 */
export const trackPublicUpload = (slug, photoCount) => {
  const event = {
    event: 'public_upload',
    slug,
    photoCount,
    timestamp: new Date().toISOString(),
  }

  console.log('📊 Analytics - Public Upload:', event)

  // TODO: Send to analytics service
  // Example: gtag('event', 'public_upload', { slug, photoCount })
}

/**
 * Track when QR code is downloaded
 * @param {string} albumId - Album ID
 * @param {string} albumName - Album name
 */
export const trackQRDownload = (albumId, albumName) => {
  const event = {
    event: 'qr_downloaded',
    albumId,
    albumName,
    timestamp: new Date().toISOString(),
  }

  console.log('📊 Analytics - QR Downloaded:', event)

  // TODO: Send to analytics service
}

/**
 * Track when public link is copied
 * @param {string} albumId - Album ID
 * @param {string} url - Public URL
 */
export const trackLinkCopied = (albumId, url) => {
  const event = {
    event: 'link_copied',
    albumId,
    url,
    timestamp: new Date().toISOString(),
  }

  console.log('📊 Analytics - Link Copied:', event)

  // TODO: Send to analytics service
}

/**
 * Track when album sharing is toggled
 * @param {string} albumId - Album ID
 * @param {boolean} isPublic - New public state
 */
export const trackSharingToggled = (albumId, isPublic) => {
  const event = {
    event: 'sharing_toggled',
    albumId,
    isPublic,
    timestamp: new Date().toISOString(),
  }

  console.log('📊 Analytics - Sharing Toggled:', event)

  // TODO: Send to analytics service
}
