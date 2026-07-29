import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { normalizeRole } from '@/utils/roleRedirect'
import SpectatorWalletPage from './SpectatorWalletPage'

export default function DashboardWalletRedirectPage() {
  const user = useAuthStore((s) => s.user)
  const role = normalizeRole(user?.role)

  if (role === 'SPECTATOR') {
    return <Navigate to="/spectator/wallet" replace />
  }

  return <SpectatorWalletPage />
}
