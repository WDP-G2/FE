import { createBrowserRouter } from 'react-router-dom'
import HomePage from '@/pages/HomePage'
import AboutPage from '@/pages/AboutPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import ResetPasswordPage from '@/pages/ResetPasswordPage'
import DemoLogoutModal from '@/pages/DemoLogoutModal'
import NotFoundPage from '@/pages/NotFoundPage'
import ProfilePage from '@/pages/ProfilePage'

export const router = createBrowserRouter([
  { path: '/', Component: HomePage },
  { path: '/login', Component: LoginPage },
  { path: '/register', Component: RegisterPage },
  { path: '/forgot-password', Component: ForgotPasswordPage },
  { path: '/reset-password', Component: ResetPasswordPage },
  { path: '/logout-demo', Component: DemoLogoutModal },
  { path: '/profile', Component: ProfilePage },
  { path: '/about', Component: AboutPage },
  { path: '/tournaments', Component: HomePage },
  { path: '/rankings', Component: HomePage },
  { path: '*', Component: NotFoundPage },
])
