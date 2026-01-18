/**
 * Vault API – Cloudflare R2 Worker transport
 */

export function getVaultApiBase() {
  const base = import.meta.env.VITE_VAULT_API
  if (!base) {
    throw new Error('VAULT_API_NOT_CONFIGURED')
  }
  return base
}

export function isVaultApiConfigured() {
  return !!import.meta.env.VITE_VAULT_API
}

export async function uploadVaultBlob({
  id,
  token,
  bytes,
  fileName,
  fileType,
}) {
  const base = getVaultApiBase()
  const url = `${base}/vault/upload/${id}`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/octet-stream',
      'X-File-Name': fileName,
      'X-File-Type': fileType,
    },
    body: bytes,
  })

  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error')
    throw new Error(`Vault upload failed (${res.status}): ${text}`)
  }
}

export async function fetchVaultBlob({ id, token }) {
  const base = getVaultApiBase()
  const url = `${base}/vault/file/${id}`

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error')
    throw new Error(`Vault fetch failed (${res.status}): ${text}`)
  }

  return await res.arrayBuffer()
}

export async function deleteVaultBlob({ id, token }) {
  const base = getVaultApiBase()
  const url = `${base}/vault/delete/${id}`

  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => 'Unknown error')
    throw new Error(`Vault delete failed (${res.status}): ${text}`)
  }
}
