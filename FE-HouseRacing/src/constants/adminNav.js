import {
  BadgePercent,
  Gavel,
  LayoutDashboard,
  Newspaper,
  PawPrint,
  Settings,
  Trophy,
  Users,
  Wallet,
} from 'lucide-react'

export const ADMIN_NAV = [
  { label: 'Tổng quan', to: '/admin', icon: LayoutDashboard },
  { label: 'Giải đấu', to: '/admin/tournaments', icon: Trophy },
  { label: 'Phân công trọng tài', to: '/admin/judges', icon: Gavel },
  { label: 'Tin tức', to: '/admin/news', icon: Newspaper },
  { label: 'Người dùng', to: '/admin/users', icon: Users },
  { label: 'Ngựa', to: '/admin/horses', icon: PawPrint },
  { label: 'Ví hệ thống', to: '/admin/wallet', icon: Wallet },
  { label: 'Cài đặt', to: '/admin/settings', icon: Settings },
  { label: 'Cấu hình cược', to: '/admin/bet-markets', icon: BadgePercent },
]
