import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Globe, Trophy } from 'lucide-react';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login
    setTimeout(() => {
      setIsLoading(false);
      console.log('Login with:', formData);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-white to-[#FAFAFA] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1507514604110-ba3347c457f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3JzZSUyMHJhY2luZyUyMGpvY2tleSUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3Nzg5MTU1NzB8MA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Background"
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/90 to-white/80"></div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4A017]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#D4A017]/10 rounded-full blur-3xl"></div>

      {/* Login Card */}
      <div className="relative w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center space-x-3 mb-8 group">
          <div className="relative">
            <div className="absolute inset-0 bg-[#D4A017] blur-lg opacity-30 group-hover:opacity-50 transition-opacity"></div>
            <Trophy className="w-12 h-12 text-[#D4A017] relative z-10" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-[#1E3A5F] tracking-tight">HORSE RACING</span>
            <span className="text-xs text-[#D4A017] tracking-widest font-semibold">CHAMPIONSHIP</span>
          </div>
        </Link>

        <div className="bg-white/90 backdrop-blur-lg rounded-2xl border border-gray-200 p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#1E3A5F] mb-2">Chào mừng trở lại</h1>
            <p className="text-[#1E3A5F]/60">Đăng nhập để tiếp tục</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#1E3A5F] mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1E3A5F]/40" />
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-[#FAFAFA] border border-gray-200 rounded-xl text-[#1E3A5F] placeholder-[#1E3A5F]/40 focus:outline-none focus:border-[#D4A017] focus:ring-2 focus:ring-[#D4A017]/20 transition-all"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#1E3A5F] mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1E3A5F]/40" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-12 pr-12 py-3 bg-[#FAFAFA] border border-gray-200 rounded-xl text-[#1E3A5F] placeholder-[#1E3A5F]/40 focus:outline-none focus:border-[#D4A017] focus:ring-2 focus:ring-[#D4A017]/20 transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1E3A5F]/40 hover:text-[#D4A017] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 bg-[#FAFAFA] text-[#D4A017] focus:ring-2 focus:ring-[#D4A017]/20 cursor-pointer"
                />
                <span className="text-sm text-[#1E3A5F]/70 group-hover:text-[#1E3A5F] transition-colors">
                  Ghi nhớ đăng nhập
                </span>
              </label>
              <Link
                to="/forgot-password"
                className="text-sm text-[#D4A017] hover:text-[#B8941F] font-medium transition-colors"
              >
                Quên mật khẩu?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#D4A017] text-white rounded-xl font-semibold hover:bg-[#B8941F] transition-all duration-200 shadow-lg shadow-[#D4A017]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Đang đăng nhập...</span>
                </span>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-[#1E3A5F]/60">Hoặc đăng nhập với</span>
            </div>
          </div>

          {/* Social Login */}
          <button className="w-full flex items-center justify-center space-x-3 py-3 bg-[#FAFAFA] border border-gray-200 rounded-xl hover:border-[#D4A017] hover:bg-white transition-all">
            <Globe className="w-5 h-5 text-[#1E3A5F]/60" />
            <span className="text-[#1E3A5F] font-medium">Tiếp tục với Google</span>
          </button>

          {/* Register Link */}
          <p className="text-center text-[#1E3A5F]/70 mt-8">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-[#D4A017] hover:text-[#B8941F] font-semibold transition-colors">
              Đăng ký ngay
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <Link
          to="/"
          className="block text-center text-[#1E3A5F]/60 hover:text-[#D4A017] mt-6 transition-colors font-medium"
        >
          ← Quay lại trang chủ
        </Link>
      </div>
    </div>
  );
}
