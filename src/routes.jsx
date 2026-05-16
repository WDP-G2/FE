import { createBrowserRouter } from 'react-router-dom'
import HomePage from '@/pages/HomePage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import DemoLogoutModal from '@/pages/DemoLogoutModal'
import NotFoundPage from '@/pages/NotFoundPage'
import ProfilePage from '@/pages/ProfilePage'

export const router = createBrowserRouter([
  { path: '/', Component: HomePage },
  { path: '/login', Component: LoginPage },
  { path: '/register', Component: RegisterPage },
  { path: '/forgot-password', Component: ForgotPasswordPage },
  { path: '/logout-demo', Component: DemoLogoutModal },
  { path: '/profile', Component: ProfilePage },
  { path: '/tournaments', Component: HomePage },
  { path: '/rankings', Component: HomePage },
  { path: '*', Component: NotFoundPage },
])
