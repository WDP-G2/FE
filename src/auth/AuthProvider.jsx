import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

export default function AuthProvider({ children }) {
  const initAuth = useAuthStore((s) => s.initAuth)

  useEffect(() => {
    initAuth()
  }, [initAuth])

  return children
}
