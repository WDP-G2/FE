import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User as UserIcon, Trophy, Globe } from 'lucide-react';
import { authService } from '@/services/authService';
import { getApiErrorMessage } from '@/utils/httpError';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: '',
  });

  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'Mật khẩu phải có ít nhất 8 ký tự';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Mật khẩu phải có ít nhất 1 chữ hoa';
    }
    if (!/[0-9]/.test(password)) {
      return 'Mật khẩu phải có ít nhất 1 số';
    }
    return '';
  };

  const handlePasswordChange = (password) => {
    setFormData({ ...formData, password });
    setErrors({ ...errors, password: validatePassword(password) });
  };

  const handleConfirmPasswordChange = (confirmPassword) => {
    setFormData({ ...formData, confirmPassword });
    setErrors({
      ...errors,
      confirmPassword: confirmPassword !== formData.password ? 'Mật khẩu không khớp' : '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const passwordError = validatePassword(formData.password);
    const confirmError =
      formData.password !== formData.confirmPassword ? 'Mật khẩu không khớp' : '';

    if (passwordError || confirmError) {
      setErrors({ password: passwordError, confirmPassword: confirmError });
      return;
    }

    setIsLoading(true);
    try {
      await authService.register({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });
      navigate('/login', {
        replace: true,
        state: {
          message: 'Đăng ký thành công. Vui lòng chờ quản trị viên xác minh tài khoản.',
        },
      });
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-white to-[#FAFAFA] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1580831800257-f83135932664?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3JzZSUyMHJhY2luZyUyMGNoYW1waW9uc2hpcCUyMHRyb3BoeXxlbnwxfHx8fDE3Nzg5MTU1NzF8MA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Background"
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/90 to-white/80" />
      </div>

      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4A017]/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#D4A017]/10 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md my-8">
        <Link to="/" className="flex items-center justify-center space-x-3 mb-8 group">
          <div className="relative">
            <div className="absolute inset-0 bg-[#D4A017] blur-lg opacity-30 group-hover:opacity-50 transition-opacity" />
            <Trophy className="w-12 h-12 text-[#D4A017] relative z-10" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-[#1E3A5F] tracking-tight">HORSE RACING</span>
            <span className="text-xs text-[#D4A017] tracking-widest font-semibold">CHAMPIONSHIP</span>
          </div>
        </Link>

        <div className="bg-white/90 backdrop-blur-lg rounded-2xl border border-gray-200 p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-[#1E3A5F] mb-2">Tạo tài khoản mới</h1>
            <p className="text-[#1E3A5F]/60">Tham gia hệ thống quản lý giải đua ngựa</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-[#1E3A5F] mb-2">
                Họ và tên
              </label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1E3A5F]/60" />
                <input
                  id="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 bg-[#FAFAFA] border border-gray-200 rounded-xl text-[#1E3A5F] placeholder-[#1E3A5F]/40 focus:outline-none focus:border-[#D4A017] focus:ring-2 focus:ring-[#D4A017]/20 transition-all"
                  placeholder="Nguyễn Văn A"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#1E3A5F] mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1E3A5F]/60" />
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

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#1E3A5F] mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1E3A5F]/60" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  className={`w-full pl-12 pr-12 py-3 bg-[#FAFAFA] border rounded-xl text-[#1E3A5F] placeholder-[#1E3A5F]/40 focus:outline-none focus:ring-2 transition-all ${
                    errors.password
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-gray-200 focus:border-[#D4A017] focus:ring-[#D4A017]/20'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1E3A5F]/60 hover:text-[#D4A017] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-2 text-sm text-red-500">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#1E3A5F] mb-2">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1E3A5F]/60" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => handleConfirmPasswordChange(e.target.value)}
                  className={`w-full pl-12 pr-12 py-3 bg-[#FAFAFA] border rounded-xl text-[#1E3A5F] placeholder-[#1E3A5F]/40 focus:outline-none focus:ring-2 transition-all ${
                    errors.confirmPassword
                      ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                      : 'border-gray-200 focus:border-[#D4A017] focus:ring-[#D4A017]/20'
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1E3A5F]/60 hover:text-[#D4A017] transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            <p className="text-sm text-[#1E3A5F]/60 bg-[#FFF8F0] border border-[#D4A017]/20 rounded-xl p-4">
              Tài khoản sẽ được quản trị viên xác minh và cấp quyền phù hợp.
            </p>

            <button
              type="submit"
              disabled={isLoading || !!errors.password || !!errors.confirmPassword}
              className="w-full py-3 bg-[#D4A017] text-white rounded-xl font-semibold hover:bg-[#B8941F] transition-all duration-200 shadow-lg shadow-[#D4A017]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-[#1E3A5F]/60">Hoặc đăng ký với</span>
            </div>
          </div>

          <button
            type="button"
            className="w-full flex items-center justify-center space-x-3 py-3 bg-[#FAFAFA] border border-gray-200 rounded-xl hover:border-[#D4A017] hover:bg-white transition-all"
          >
            <Globe className="w-5 h-5 text-[#1E3A5F]/60" />
            <span className="text-[#1E3A5F] font-medium">Tiếp tục với Google</span>
          </button>

          <p className="text-center text-[#1E3A5F]/70 mt-8">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-[#D4A017] hover:text-[#B8941F] font-semibold transition-colors">
              Đăng nhập
            </Link>
          </p>
        </div>

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
