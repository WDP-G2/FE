import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Trophy, Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react'
import { toast } from 'sonner'
import { useAuthStore } from '@/store/authStore'
import { normalizeRole, getRoleHomePath } from '@/utils/roleRedirect'

const PUBLIC_LINKS = [
  { name: 'Trang chủ', path: '/' },
  { name: 'Giải đấu', path: '/tournaments' },
  { name: 'Bảng xếp hạng', path: '/rankings' },
]

const ROLE_LINKS = {
  ADMIN: [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Quản trị', path: '/admin' },
    { name: 'Giải đấu', path: '/tournaments' },
  ],
  OWNER: [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Chủ ngựa', path: '/horse-owner' },
  ],
  JOCKEY: [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Kỵ sĩ', path: '/jockey' },
  ],
  REFEREE: [
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Trọng tài', path: '/referee' },
  ],
  SPECTATOR: [{ name: 'Dashboard', path: '/dashboard' }],
  USER: [{ name: 'Dashboard', path: '/dashboard' }],
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const role = normalizeRole(user?.role)

  const isActive = (path) => location.pathname === path

  const navLinks = isAuthenticated
    ? ROLE_LINKS[role] || ROLE_LINKS.USER
    : PUBLIC_LINKS

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Đăng xuất thành công')
      navigate('/', { replace: true })
    } catch {
      toast.error('Không thể đăng xuất')
    }
    setIsMenuOpen(false)
  }

  const dashboardPath = getRoleHomePath(role)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-[#D4A017] blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
              <Trophy className="w-10 h-10 text-[#D4A017] relative z-10" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-[#1E3A5F] tracking-tight">HORSE RACING</span>
              <span className="text-xs text-[#D4A017] tracking-widest font-semibold">CHAMPIONSHIP</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-xl transition-all duration-200 font-medium ${
                  isActive(link.path)
                    ? 'bg-[#D4A017] text-white shadow-lg'
                    : 'text-[#1E3A5F]/70 hover:text-[#D4A017] hover:bg-[#FFF8F0]'
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <Link
                  to={dashboardPath}
                  className="px-4 py-2.5 text-[#1E3A5F] rounded-xl hover:bg-[#FFF8F0] flex items-center gap-2 font-medium"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  to="/profile"
                  className="px-4 py-2.5 text-[#1E3A5F] border border-[#1E3A5F]/20 rounded-xl hover:bg-[#1E3A5F]/5 flex items-center gap-2 font-medium"
                >
                  <User className="w-4 h-4" />
                  Hồ sơ
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-4 py-2.5 bg-[#1E3A5F] text-white rounded-xl hover:bg-[#152a45] flex items-center gap-2 font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-6 py-2.5 text-[#1E3A5F] border border-[#1E3A5F]/20 rounded-xl hover:bg-[#1E3A5F]/5 font-medium flex items-center gap-2"
                >
                  <User className="w-4 h-4" />
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-2.5 bg-[#D4A017] text-white rounded-xl hover:bg-[#B8941F] shadow-lg font-semibold"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-xl text-[#1E3A5F] hover:bg-[#FFF8F0]"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 py-6 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl font-medium ${
                  isActive(link.path)
                    ? 'bg-[#D4A017] text-white'
                    : 'text-[#1E3A5F]/70 hover:bg-[#FFF8F0]'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-gray-200 space-y-3">
              {isAuthenticated ? (
                <>
                  <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 text-center border rounded-xl">
                    Hồ sơ
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full px-4 py-3 bg-[#1E3A5F] text-white rounded-xl font-medium"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block px-4 py-3 text-center border rounded-xl">
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-3 text-center bg-[#D4A017] text-white rounded-xl font-semibold"
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
