import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Trophy, Menu, X, User, LogOut, UserCircle2, LayoutDashboard } from 'lucide-react'
import { toast } from 'sonner'
import NavWalletMenu from '@/components/layout/NavWalletMenu'
import { useAuthStore } from '@/store/authStore'
import { normalizeRole, getRoleHomePath } from '@/utils/roleRedirect'

const NAV_LINKS = [
  { name: 'Trang chủ', path: '/' },
  { name: 'Giải đấu', path: '/tournaments' },
  { name: 'Bảng xếp hạng', path: '/rankings' },
  { name: 'Tin tức', path: '/news' },
  { name: 'Giới thiệu', path: '/about' },
]

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const storeRole = useAuthStore((s) => s.role)
  const role = normalizeRole(storeRole || user?.role)

  const displayName = user?.fullName || user?.username || 'Tài khoản'
  const dashboardPath = getRoleHomePath(role)

  const isActive = (path) => {
    if (path === '/') return location.pathname === path
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      toast.success('Đăng xuất thành công')
      navigate('/', { replace: true })
    } catch {
      toast.error('Không thể đăng xuất')
    }
    setIsMenuOpen(false)
    setIsUserMenuOpen(false)
  }

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
            {NAV_LINKS.map((link) => (
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

          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <NavWalletMenu userRole={role} />
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="px-4 py-2.5 text-[#1E3A5F] border border-[#1E3A5F]/20 rounded-xl hover:bg-[#1E3A5F]/5 hover:border-[#D4A017] transition-all flex items-center space-x-2 font-medium"
                  >
                    <UserCircle2 className="w-5 h-5 text-[#D4A017]" />
                    <span className="max-w-[140px] truncate">{displayName}</span>
                  </button>
                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50">
                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center space-x-3 px-4 py-3 hover:bg-[#FFF8F0] text-[#1E3A5F]"
                      >
                        <User className="w-4 h-4 text-[#D4A017]" />
                        <span>Hồ sơ của tôi</span>
                      </Link>
                      {role && role !== 'USER' && (
                        <Link
                          to={dashboardPath}
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center space-x-3 px-4 py-3 hover:bg-[#FFF8F0] text-[#1E3A5F] border-t border-gray-100"
                        >
                          <LayoutDashboard className="w-4 h-4 text-[#D4A017]" />
                          <span>Dashboard</span>
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-red-50 text-red-600 border-t border-gray-100"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  )}
                </div>
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
            {NAV_LINKS.map((link) => (
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
                  <Link
                    to="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-3 text-center border rounded-xl font-medium"
                  >
                    Hồ sơ — {displayName}
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
                  <Link
                    to="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-3 text-center border rounded-xl"
                  >
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
