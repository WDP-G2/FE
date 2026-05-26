import { createBrowserRouter, Navigate } from 'react-router-dom'
import MainLayout from '@/layouts/MainLayout'
import ProtectedRoute from '@/auth/ProtectedRoute'
import RoleProtectedRoute from '@/auth/RoleProtectedRoute'

import HomePage from '@/pages/HomePage'
import AboutPage from '@/pages/AboutPage'
import NewsPage from '@/pages/news/NewsPage'
import NewsDetailPage from '@/pages/news/NewsDetailPage'
import LoginPage from '@/pages/auth/LoginPage'
import RegisterPage from '@/pages/auth/RegisterPage'
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage'
import VerifyOtpPage from '@/pages/auth/VerifyOtpPage'
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import ProfilePage from '@/pages/profile/ProfilePage'
import AdminHomePage from '@/pages/admin/AdminHomePage'
import HorseOwnerPage from '@/pages/dashboard/HorseOwnerPage'
import JockeyPage from '@/pages/dashboard/JockeyPage'
import RefereePage from '@/pages/dashboard/RefereePage'
import NotFoundPage from '@/pages/errors/NotFoundPage'
import UnauthorizedPage from '@/pages/errors/UnauthorizedPage'

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: '/', Component: HomePage },
      { path: '/about', Component: AboutPage },
      { path: '/news', Component: NewsPage },
      { path: '/news/:id', Component: NewsDetailPage },
      { path: '/tournaments', Component: HomePage },
      { path: '/rankings', Component: HomePage },
      {
        path: '/dashboard',
        element: (
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/profile',
        element: (
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/unauthorized',
        element: (
          <ProtectedRoute>
            <UnauthorizedPage />
          </ProtectedRoute>
        ),
      },
      {
        path: '/admin',
        element: (
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={['ADMIN']}>
              <AdminHomePage />
            </RoleProtectedRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: '/horse-owner',
        element: (
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={['OWNER']}>
              <HorseOwnerPage />
            </RoleProtectedRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: '/jockey',
        element: (
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={['JOCKEY']}>
              <JockeyPage />
            </RoleProtectedRoute>
          </ProtectedRoute>
        ),
      },
      {
        path: '/referee',
        element: (
          <ProtectedRoute>
            <RoleProtectedRoute allowedRoles={['REFEREE']}>
              <RefereePage />
            </RoleProtectedRoute>
          </ProtectedRoute>
        ),
      },
    ],
  },
  { path: '/login', Component: LoginPage },
  { path: '/register', Component: RegisterPage },
  { path: '/forgot-password', Component: ForgotPasswordPage },
  { path: '/verify-otp', Component: VerifyOtpPage },
  { path: '/reset-password', Component: ResetPasswordPage },
  { path: '/logout-demo', element: <Navigate to="/" replace /> },
  { path: '*', Component: NotFoundPage },
])
