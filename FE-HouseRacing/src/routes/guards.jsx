import ProtectedRoute from '@/auth/ProtectedRoute'
import RoleProtectedRoute from '@/auth/RoleProtectedRoute'

export function withAuth(children) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}

export function withAdminRole(children) {
  return (
    <ProtectedRoute>
      <RoleProtectedRoute allowedRoles={['ADMIN']}>{children}</RoleProtectedRoute>
    </ProtectedRoute>
  )
}
