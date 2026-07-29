import { useCallback, useEffect, useRef, useState } from 'react'
import { useApiCacheStore } from '@/store/apiCacheStore'

export function useFetch(fetchFn, options = {}) {
  const { enabled = true, deps = [], cacheKey, staleTime = 120_000 } = options
  const depsKey = JSON.stringify(deps)
  const cached = cacheKey ? useApiCacheStore.getState().getCache(cacheKey) : null

  const [data, setData] = useState(cached?.data)
  const [loading, setLoading] = useState(Boolean(enabled && !cached))
  const [error, setError] = useState(null)

  const fetchFnRef = useRef(fetchFn)

  useEffect(() => {
    fetchFnRef.current = fetchFn
  }, [fetchFn])

  const refetch = useCallback(
    async ({ force = false } = {}) => {
      if (!enabled) {
        setLoading(false)
        return null
      }

      const cachedEntry = cacheKey ? useApiCacheStore.getState().getCache(cacheKey) : null
      const cachedData = cachedEntry?.data
      const hasCachedData = cachedData !== null && cachedData !== undefined
      const isFresh =
        !force &&
        cacheKey &&
        staleTime > 0 &&
        useApiCacheStore.getState().isFresh(cacheKey, staleTime)

      if (hasCachedData) {
        setData(cachedData)
      }

      if (isFresh) {
        setLoading(false)
        setError(null)
        return cachedData
      }

      if (!hasCachedData) {
        setLoading(true)
      }

      setError(null)

      try {
        const result = await fetchFnRef.current()
        if (cacheKey) {
          const changed = useApiCacheStore.getState().setCache(cacheKey, result)
          if (changed || !hasCachedData) setData(result)
        } else {
          setData(result)
        }
        return result
      } catch (err) {
        setError(err)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [enabled, cacheKey, staleTime],
  )

  useEffect(() => {
    if (enabled) {
      queueMicrotask(() => {
        refetch().catch(() => {})
      })
    }
  }, [depsKey, enabled, refetch])

  return { data, loading, error, refetch, setData }
}
