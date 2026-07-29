import { useEffect, useMemo, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { getAssignedRacesForReferee } from '@/services/refereeAssignmentService'

export function useAssignedRaces() {
  const user = useAuthStore((state) => state.user)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    const refresh = () => setVersion((value) => value + 1)
    window.addEventListener('referee-assignments-updated', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('referee-assignments-updated', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  return useMemo(
    () => getAssignedRacesForReferee(user),
    [user, version],
  )
}
