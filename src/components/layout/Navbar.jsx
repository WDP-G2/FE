import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Trophy, Menu, X, User } from 'lucide-react';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { name: 'Trang chủ', path: '/' },
    { name: 'Giải đấu', path: '/tournaments' },
    { name: 'Xếp hạng', path: '/rankings' },
    { name: 'Hồ sơ', path: '/profile' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-[#D4A017] blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <Trophy className="w-10 h-10 text-[#D4A017] relative z-10" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-[#1E3A5F] tracking-tight">HORSE RACING</span>
              <span className="text-xs text-[#D4A017] tracking-widest font-semibold">CHAMPIONSHIP</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
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

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              to="/login"
              className="px-6 py-2.5 text-[#1E3A5F] border border-[#1E3A5F]/20 rounded-xl hover:bg-[#1E3A5F]/5 hover:border-[#1E3A5F]/40 transition-all duration-200 flex items-center space-x-2 font-medium"
            >
              <User className="w-4 h-4" />
              <span>Đăng nhập</span>
            </Link>
            <Link
              to="/register"
              className="px-6 py-2.5 bg-[#D4A017] text-white rounded-xl hover:bg-[#B8941F] transition-all duration-200 shadow-lg shadow-[#D4A017]/20 font-semibold"
            >
              Đăng ký
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-xl text-[#1E3A5F] hover:bg-[#FFF8F0] transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 py-6 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl transition-all font-medium ${
                  isActive(link.path)
                    ? 'bg-[#D4A017] text-white'
                    : 'text-[#1E3A5F]/70 hover:text-[#D4A017] hover:bg-[#FFF8F0]'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 text-center text-[#1E3A5F] border border-[#1E3A5F]/20 rounded-xl hover:bg-[#1E3A5F]/5 hover:border-[#1E3A5F]/40 transition-all font-medium"
              >
                Đăng nhập
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMenuOpen(false)}
                className="block px-4 py-3 text-center bg-[#D4A017] text-white rounded-xl hover:bg-[#B8941F] transition-all font-semibold"
              >
                Đăng ký
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
