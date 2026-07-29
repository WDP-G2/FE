const DEFAULT_TTL_MS = 120_000

const store = new Map()
const inflight = new Map()

export function cachedRequest(key, fetcher, ttlMs = DEFAULT_TTL_MS) {
  const hit = store.get(key)
  if (hit && Date.now() - hit.at < ttlMs) {
    return Promise.resolve(hit.data)
  }

  const pending = inflight.get(key)
  if (pending) return pending

  const promise = Promise.resolve()
    .then(fetcher)
    .then((data) => {
      store.set(key, { data, at: Date.now() })
      inflight.delete(key)
      return data
    })
    .catch((error) => {
      inflight.delete(key)
      throw error
    })

  inflight.set(key, promise)
  return promise
}

export function peekCachedRequest(key, ttlMs = DEFAULT_TTL_MS) {
  const hit = store.get(key)
  if (hit && Date.now() - hit.at < ttlMs) return hit.data
  return null
}

export function invalidateCachedRequest(key) {
  store.delete(key)
  inflight.delete(key)
}

export function invalidateCachedRequestPrefix(prefix) {
  for (const key of [...store.keys(), ...inflight.keys()]) {
    if (String(key).startsWith(prefix)) {
      store.delete(key)
      inflight.delete(key)
    }
  }
}
