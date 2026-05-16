import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Trophy, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate sending reset link
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1507514604110-ba3347c457f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3JzZSUyMHJhY2luZyUyMGpvY2tleSUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3Nzg5MTU1NzB8MA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Background"
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0A0E14] via-[#0A0E14]/95 to-[#0A0E14]/90"></div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4A017]/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#D4A017]/5 rounded-full blur-3xl"></div>

      {/* Forgot Password Card */}
      <div className="relative w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center space-x-3 mb-8 group">
          <div className="relative">
            <div className="absolute inset-0 bg-[#D4A017] blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <Trophy className="w-12 h-12 text-[#D4A017] relative z-10" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-[#1E3A5F] tracking-tight">HORSE RACING</span>
            <span className="text-xs text-[#D4A017] tracking-widest">CHAMPIONSHIP</span>
          </div>
        </Link>

        <div className="bg-white/90 backdrop-blur-lg rounded-2xl border border-gray-200 p-8 shadow-2xl">
          {!isSuccess ? (
            <>
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-[#D4A017]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-[#D4A017]" />
                </div>
                <h1 className="text-3xl font-bold text-[#1E3A5F] mb-2">Quên mật khẩu?</h1>
                <p className="text-[#1E3A5F]/60">
                  Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Input */}
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
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-[#FAFAFA] border border-gray-200 rounded-xl text-[#1E3A5F] placeholder-[#1E3A5F]/40 focus:outline-none focus:border-[#D4A017] focus:ring-2 focus:ring-[#D4A017]/20 transition-all"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>

                {/* Submit Button */}
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
                      <span>Đang gửi...</span>
                    </span>
                  ) : (
                    'Gửi link đặt lại mật khẩu'
                  )}
                </button>
              </form>

              {/* Back to Login */}
              <Link
                to="/login"
                className="flex items-center justify-center space-x-2 text-[#1E3A5F]/60 hover:text-[#B8941F] mt-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Quay lại đăng nhập</span>
              </Link>
            </>
          ) : (
            // Success State
            <div className="text-center">
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
              
              <h2 className="text-2xl font-bold text-[#1E3A5F] mb-4">Email đã được gửi!</h2>
              
              <p className="text-[#1E3A5F]/60 mb-8 leading-relaxed">
                Chúng tôi đã gửi link đặt lại mật khẩu đến email <span className="text-[#D4A017] font-semibold">{email}</span>. 
                Vui lòng kiểm tra hộp thư của bạn.
              </p>

              <div className="bg-[#D4A017]/10 border border-[#D4A017]/30 rounded-xl p-4 mb-8">
                <p className="text-sm text-[#1E3A5F]">
                  <strong className="text-[#D4A017]">Lưu ý:</strong> Link sẽ hết hạn sau 24 giờ. 
                  Nếu không thấy email, vui lòng kiểm tra thư mục spam.
                </p>
              </div>

              <div className="space-y-3">
                <Link
                  to="/login"
                  className="block w-full py-3 bg-[#D4A017] text-white rounded-xl font-semibold hover:bg-[#B8941F] transition-all duration-200 shadow-lg shadow-[#D4A017]/20"
                >
                  Quay lại đăng nhập
                </Link>
                
                <button
                  onClick={() => setIsSuccess(false)}
                  className="w-full py-3 bg-transparent text-[#1E3A5F]/60 border border-gray-200 rounded-xl hover:text-[#B8941F] hover:border-[#D4A017] transition-all"
                >
                  Gửi lại email
                </button>
              </div>
            </div>
          )}
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
