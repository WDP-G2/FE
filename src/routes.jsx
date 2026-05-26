import { createBrowserRouter } from 'react-router-dom'
import HomePage from '@/pages/HomePage'
import AboutPage from '@/pages/AboutPage'
import LoginPage from '@/pages/LoginPage'
import RegisterPage from '@/pages/RegisterPage'
import ForgotPasswordPage from '@/pages/ForgotPasswordPage'
import DemoLogoutModal from '@/pages/DemoLogoutModal'
import NotFoundPage from '@/pages/NotFoundPage'
import ProfilePage from '@/pages/ProfilePage'
import AdminDashboardPage from '@/pages/AdminDashboardPage'

export const router = createBrowserRouter([
  { path: '/', Component: HomePage },
  { path: '/login', Component: LoginPage },
  { path: '/register', Component: RegisterPage },
  { path: '/forgot-password', Component: ForgotPasswordPage },
  { path: '/logout-demo', Component: DemoLogoutModal },
  { path: '/profile', Component: ProfilePage },
  { path: '/about', Component: AboutPage },
  { path: '/admin', Component: AdminDashboardPage },
  { path: '/admin/tournaments', Component: AdminDashboardPage },
  { path: '/admin/tournaments/new', Component: AdminDashboardPage },
  { path: '/admin/tournaments/:id', Component: AdminDashboardPage },
  { path: '/admin/news', Component: AdminDashboardPage },
  { path: '/admin/users', Component: AdminDashboardPage },
  { path: '/admin/statistics', Component: AdminDashboardPage },
  { path: '/admin/notifications', Component: AdminDashboardPage },
  { path: '/admin/settings', Component: AdminDashboardPage },
  { path: '/tournaments', Component: HomePage },
  { path: '/rankings', Component: HomePage },
  { path: '*', Component: NotFoundPage },
])
