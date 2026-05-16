import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User as UserIcon, Trophy, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'spectator'
  });
  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: ''
  });

  const roles = [
    { value: 'spectator', label: 'Khán giả', description: 'Theo dõi và đặt vé giải đấu', icon: '👤' },
    { value: 'owner', label: 'Chủ ngựa', description: 'Đăng ký và quản lý ngựa đua', icon: '🏇' },
    { value: 'jockey', label: 'Jockey', description: 'Tham gia thi đấu chuyên nghiệp', icon: '🎖️' }
  ];

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
    const error = validatePassword(password);
    setErrors({ ...errors, password: error });
  };

  const handleConfirmPasswordChange = (confirmPassword) => {
    setFormData({ ...formData, confirmPassword });
    const error = confirmPassword !== formData.password ? 'Mật khẩu không khớp' : '';
    setErrors({ ...errors, confirmPassword: error });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const passwordError = validatePassword(formData.password);
    const confirmError = formData.password !== formData.confirmPassword ? 'Mật khẩu không khớp' : '';
    
    if (passwordError || confirmError) {
      setErrors({ password: passwordError, confirmPassword: confirmError });
      return;
    }

    setIsLoading(true);
    // Simulate registration
    setTimeout(() => {
      setIsLoading(false);
      console.log('Register with:', formData);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-white to-[#FAFAFA] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1580831800257-f83135932664?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3JzZSUyMHJhY2luZyUyMGNoYW1waW9uc2hpcCUyMHRyb3BoeXxlbnwxfHx8fDE3Nzg5MTU1NzF8MA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Background"
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-white/80 via-white/90 to-white/80"></div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4A017]/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#D4A017]/10 rounded-full blur-3xl"></div>

      {/* Register Card */}
      <div className="relative w-full max-w-2xl my-8">
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
            <h1 className="text-3xl font-bold text-[#1E3A5F] mb-2">Tạo tài khoản mới</h1>
            <p className="text-[#1E3A5F]/60">Tham gia cộng đồng đua ngựa hàng đầu</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name */}
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

            {/* Email */}
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

            {/* Password */}
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1E3A5F]/60 hover:text-[#B8941F] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-400">{errors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1E3A5F]/60 hover:text-[#B8941F] transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-400">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-[#1E3A5F] mb-3">
                Chọn vai trò
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {roles.map((role) => (
                  <label
                    key={role.value}
                    className={`relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      formData.role === role.value
                        ? 'border-[#D4A017] bg-[#D4A017]/10'
                        : 'border-gray-200 bg-[#FAFAFA] hover:border-[#D4A017]/40'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={formData.role === role.value}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                      className="sr-only"
                    />
                    {formData.role === role.value && (
                      <CheckCircle2 className="absolute top-2 right-2 w-5 h-5 text-[#D4A017]" />
                    )}
                    <div className="text-3xl mb-2">{role.icon}</div>
                    <div className="text-[#1E3A5F] font-semibold mb-1">{role.label}</div>
                    <div className="text-xs text-[#1E3A5F]/60">{role.description}</div>
                  </label>
                ))}
              </div>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={isLoading || !!errors.password || !!errors.confirmPassword}
              className="w-full py-3 bg-[#D4A017] text-white rounded-xl font-semibold hover:bg-[#B8941F] transition-all duration-200 shadow-lg shadow-[#D4A017]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Đang đăng ký...</span>
                </span>
              ) : (
                'Đăng ký tài khoản'
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-[#1E3A5F]/60 mt-6">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-[#D4A017] hover:text-[#B8941F] font-semibold transition-colors">
              Đăng nhập
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <Link
          to="/"
          className="block text-center text-[#1E3A5F]/60 hover:text-[#B8941F] mt-6 transition-colors"
        >
          ← Quay lại trang chủ
        </Link>
      </div>
    </div>
  );
}
