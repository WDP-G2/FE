import { useCallback, useEffect, useState } from 'react'

export function useApi(asyncFn, { immediate = true, deps = [] } = {}) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(immediate)

  const execute = useCallback(
    async (...args) => {
      setLoading(true)
      setError(null)

      try {
        const result = await asyncFn(...args)
        setData(result)
        return result
      } catch (err) {
        setError(err)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [asyncFn],
  )

  useEffect(() => {
    if (immediate) {
      execute()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return { data, error, loading, execute, setData }
}
