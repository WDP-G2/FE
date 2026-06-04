import { RouterProvider } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import AuthProvider from '@/auth/AuthProvider'
import { router } from '@/routes/routes'
import { ENV } from '@/config/env'

export default function App() {
  return (
    <GoogleOAuthProvider clientId={ENV.GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </GoogleOAuthProvider>
  )
}
