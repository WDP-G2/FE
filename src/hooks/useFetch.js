import { useCallback, useEffect, useRef, useState } from 'react'

export function useFetch(fetchFn, options = {}) {
  const { enabled = true, deps = [] } = options

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(Boolean(enabled))
  const [error, setError] = useState(null)

  const fetchFnRef = useRef(fetchFn)
  fetchFnRef.current = fetchFn

  const refetch = useCallback(async () => {
    if (!enabled) {
      setLoading(false)
      return null
    }

    setLoading(true)
    setError(null)

    try {
      const result = await fetchFnRef.current()
      setData(result)
      return result
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [enabled, ...deps])

  useEffect(() => {
    if (enabled) {
      refetch().catch(() => {})
    } else {
      setLoading(false)
    }
  }, [enabled, refetch])

  return { data, loading, error, refetch, setData }
}
