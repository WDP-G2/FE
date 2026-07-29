import AdminDashboardPage from '@/pages/admin/AdminDashboardPage'
import AdminTournamentsPage from '@/pages/admin/AdminTournamentsPage'
import AdminTournamentCreatePage from '@/pages/admin/AdminTournamentCreatePage'
import AdminTournamentDetailPage from '@/pages/admin/AdminTournamentDetailPage'
import AdminNewsPage from '@/pages/admin/AdminNewsPage'
import AdminNewsCreatePage from '@/pages/admin/AdminNewsCreatePage'
import AdminNewsEditPage from '@/pages/admin/AdminNewsEditPage'
import AdminUsersPage from '@/pages/admin/AdminUsersPage'
import AdminHorsesPage from '@/pages/admin/AdminHorsesPage'
import AdminSettingsPage from '@/pages/admin/AdminSettingsPage'
import AdminWalletPage from '@/pages/admin/AdminWalletPage'
import AdminJudgesPage from '@/pages/admin/AdminJudgesPage'
import AdminBetMarketsPage from '@/pages/admin/AdminBetMarketsPage'
import { withAdminRole } from './guards'

function adminRoute(path, Page) {
  return { path, element: withAdminRole(<Page />) }
}

export const adminRoutes = [
  adminRoute('/admin', AdminDashboardPage),
  adminRoute('/admin/tournaments', AdminTournamentsPage),
  adminRoute('/admin/tournaments/new', AdminTournamentCreatePage),
  adminRoute('/admin/tournaments/:id', AdminTournamentDetailPage),
  adminRoute('/admin/judges', AdminJudgesPage),
  adminRoute('/admin/news', AdminNewsPage),
  adminRoute('/admin/news/create', AdminNewsCreatePage),
  adminRoute('/admin/news/:id/edit', AdminNewsEditPage),
  adminRoute('/admin/users', AdminUsersPage),
  adminRoute('/admin/horses', AdminHorsesPage),
  adminRoute('/admin/wallet', AdminWalletPage),
  adminRoute('/admin/settings', AdminSettingsPage),
  adminRoute('/admin/bet-markets', AdminBetMarketsPage),
]
