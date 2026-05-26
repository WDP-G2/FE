import { RouterProvider } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import AuthProvider from '@/auth/AuthProvider'
import { router } from '@/routes/routes'
import { GOOGLE_CLIENT_ID } from '@/config/env'

export default function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </GoogleOAuthProvider>
  )
}
