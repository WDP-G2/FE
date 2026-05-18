import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Trophy, KeyRound, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { authService } from '@/services/authService';
import { getApiErrorMessage } from '@/utils/httpError';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailFromQuery = searchParams.get('email') ?? '';

  const [form, setForm] = useState({
    email: emailFromQuery,
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDone, setIsDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword({
        email: form.email.trim(),
        otp: form.otp.trim(),
        newPassword: form.newPassword,
      });
      setIsDone(true);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1507514604110-ba3347c457f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3JzZSUyMHJhY2luZyUyMGpvY2tleSUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3Nzg5MTU1NzB8MA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Background"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0E14] via-[#0A0E14]/95 to-[#0A0E14]/90" />
      </div>

      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4A017]/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#D4A017]/5 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md">
        <Link to="/" className="flex items-center justify-center space-x-3 mb-8 group">
          <div className="relative">
            <div className="absolute inset-0 bg-[#D4A017] blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
            <Trophy className="w-12 h-12 text-[#D4A017] relative z-10" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-[#1E3A5F] tracking-tight">HORSE RACING</span>
            <span className="text-xs text-[#D4A017] tracking-widest">CHAMPIONSHIP</span>
          </div>
        </Link>

        <div className="bg-white/90 backdrop-blur-lg rounded-2xl border border-gray-200 p-8 shadow-2xl">
          {!isDone ? (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-[#D4A017]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <KeyRound className="w-8 h-8 text-[#D4A017]" />
                </div>
                <h1 className="text-3xl font-bold text-[#1E3A5F] mb-2">Đặt lại mật khẩu</h1>
                <p className="text-[#1E3A5F]/60">Nhập mã OTP và mật khẩu mới</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-[#1E3A5F] mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-200 rounded-xl text-[#1E3A5F] focus:outline-none focus:border-[#D4A017] focus:ring-2 focus:ring-[#D4A017]/20"
                  />
                </div>

                <div>
                  <label htmlFor="otp" className="block text-sm font-medium text-[#1E3A5F] mb-2">
                    Mã OTP
                  </label>
                  <input
                    id="otp"
                    type="text"
                    required
                    maxLength={6}
                    value={form.otp}
                    onChange={(e) => setForm({ ...form, otp: e.target.value })}
                    placeholder="123456"
                    className="w-full px-4 py-3 bg-[#FAFAFA] border border-gray-200 rounded-xl text-[#1E3A5F] focus:outline-none focus:border-[#D4A017] focus:ring-2 focus:ring-[#D4A017]/20"
                  />
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-[#1E3A5F] mb-2">
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1E3A5F]/60" />
                    <input
                      id="newPassword"
                      type="password"
                      required
                      minLength={6}
                      value={form.newPassword}
                      onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-[#FAFAFA] border border-gray-200 rounded-xl text-[#1E3A5F] focus:outline-none focus:border-[#D4A017] focus:ring-2 focus:ring-[#D4A017]/20"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-[#1E3A5F] mb-2"
                  >
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1E3A5F]/60" />
                    <input
                      id="confirmPassword"
                      type="password"
                      required
                      minLength={6}
                      value={form.confirmPassword}
                      onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-[#FAFAFA] border border-gray-200 rounded-xl text-[#1E3A5F] focus:outline-none focus:border-[#D4A017] focus:ring-2 focus:ring-[#D4A017]/20"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#D4A017] text-white rounded-xl font-semibold hover:bg-[#B8941F] shadow-lg shadow-[#D4A017]/20 disabled:opacity-50 mt-2"
                >
                  {isLoading ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                </button>
              </form>

              <Link
                to="/forgot-password"
                className="flex items-center justify-center space-x-2 text-[#1E3A5F]/60 hover:text-[#B8941F] mt-6 transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Gửi lại mã OTP</span>
              </Link>
            </>
          ) : (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-[#1E3A5F] mb-4">Mật khẩu đã được cập nhật</h2>
              <p className="text-[#1E3A5F]/60 mb-8">Bạn có thể đăng nhập bằng mật khẩu mới.</p>
              <Link
                to="/login"
                className="block w-full py-3 bg-[#D4A017] text-white rounded-xl font-semibold hover:bg-[#B8941F]"
              >
                Đăng nhập
              </Link>
            </div>
          )}
        </div>

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
