const stableKeys = new Map()

export function createIdempotencyKey() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(16).slice(2)}-${Math.random().toString(16).slice(2)}`
}

export function stableIdempotencyKey(scope) {
  const key = String(scope || '')
  if (!stableKeys.has(key)) stableKeys.set(key, createIdempotencyKey())
  return stableKeys.get(key)
}

export function clearIdempotencyKey(scope) {
  stableKeys.delete(String(scope || ''))
}

export function idempotencyConfig(key) {
  return { headers: { 'Idempotency-Key': key || createIdempotencyKey() } }
}
