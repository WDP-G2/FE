import { create } from 'zustand'

function stableSerialize(value) {
  if (value === null || typeof value !== 'object') return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(',')}]`

  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableSerialize(value[key])}`)
    .join(',')}}`
}

function isSameData(currentData, nextData) {
  return stableSerialize(currentData) === stableSerialize(nextData)
}

export const useApiCacheStore = create((set, get) => ({
  cache: {},

  getCache: (key) => get().cache[key],

  isFresh: (key, staleTimeMs = 120_000) => {
    const entry = get().cache[key]
    if (!entry?.data) return false
    return Date.now() - entry.updatedAt < staleTimeMs
  },

  setCache: (key, data) => {
    const current = get().cache[key]
    if (current && isSameData(current.data, data)) return false

    set((state) => ({
      cache: {
        ...state.cache,
        [key]: {
          data,
          updatedAt: Date.now(),
        },
      },
    }))

    return true
  },

  removeCache: (key) =>
    set((state) => {
      const cache = { ...state.cache }
      delete cache[key]
      return { cache }
    }),

  clearCache: () => set({ cache: {} }),
}))
