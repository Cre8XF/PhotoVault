// src/utils/googleVision.js

export async function analyzeImage(url, options = {}) {
  if (import.meta.env.DEV) console.warn('⚠️ Dummy analyzeImage ble kalt – returnerer tomme data')
  return {
    labels: [],
    faces: 0,
    category: null,
  }
}
