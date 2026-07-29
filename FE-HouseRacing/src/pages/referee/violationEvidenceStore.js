const DB_NAME = 'referee_violation_evidence_v1'
const STORE_NAME = 'files'

function openDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME)
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export function buildEvidenceStorageKey(violationId, fileName) {
  return `${violationId}:${fileName}`
}

export async function saveEvidenceFile(storageKey, file) {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(file, storageKey)
    tx.oncomplete = () => resolve(storageKey)
    tx.onerror = () => reject(tx.error)
  })
}

export async function getEvidenceFile(storageKey) {
  if (!storageKey) return null
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const request = tx.objectStore(STORE_NAME).get(storageKey)
    request.onsuccess = () => resolve(request.result ?? null)
    request.onerror = () => reject(request.error)
  })
}
