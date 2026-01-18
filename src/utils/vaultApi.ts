/**
 * Vault API - Cloudflare R2 Worker Transport Layer
 * Handles encrypted blob upload/download/delete via Worker endpoint
 * Keeps encryption/decryption and Firestore metadata unchanged
 */

/**
 * Get the Vault API base URL from environment
 * @throws {Error} if VITE_VAULT_API is not configured
 */
export function getVaultApiBase(): string {
  const base = import.meta.env.VITE_VAULT_API
  if (!base) {
    throw new Error('VAULT_API_NOT_CONFIGURED')
  }
  return base
}

/**
 * Check if Vault API is configured
 */
export function isVaultApiConfigured(): boolean {
  return !!import.meta.env.VITE_VAULT_API
}

interface UploadVaultBlobParams {
  id: string
  token: string
  bytes: Uint8Array | ArrayBuffer
  fileName: string
  fileType: string
}

/**
 * Upload encrypted blob to R2 via Worker
 * @param params Upload parameters
 * @throws {Error} if upload fails
 */
export async function uploadVaultBlob({
  id,
  token,
  bytes,
  fileName,
  fileType,
}: UploadVaultBlobParams): Promise<void> {
  const base = getVaultApiBase()
  const url = `${base}/vault/upload/${id}`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/octet-stream',
      'X-File-Name': fileName,
      'X-File-Type': fileType,
    },
    body: bytes,
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error')
    throw new Error(
      `Vault upload failed (${response.status}): ${errorText}`
    )
  }
}

interface FetchVaultBlobParams {
  id: string
  token: string
}

/**
 * Fetch encrypted blob from R2 via Worker
 * @param params Fetch parameters
 * @returns ArrayBuffer of encrypted blob
 * @throws {Error} if fetch fails
 */
export async function fetchVaultBlob({
  id,
  token,
}: FetchVaultBlobParams): Promise<ArrayBuffer> {
  const base = getVaultApiBase()
  const url = `${base}/vault/file/${id}`

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error')
    throw new Error(
      `Vault fetch failed (${response.status}): ${errorText}`
    )
  }

  return await response.arrayBuffer()
}

interface DeleteVaultBlobParams {
  id: string
  token: string
}

/**
 * Delete encrypted blob from R2 via Worker
 * @param params Delete parameters
 * @throws {Error} if delete fails (best effort - caller should handle gracefully)
 */
export async function deleteVaultBlob({
  id,
  token,
}: DeleteVaultBlobParams): Promise<void> {
  const base = getVaultApiBase()
  const url = `${base}/vault/delete/${id}`

  const response = await fetch(url, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error')
    throw new Error(
      `Vault delete failed (${response.status}): ${errorText}`
    )
  }
}
