import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Trophy } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-white to-[#FAFAFA] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#D4A017]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#D4A017]/5 rounded-full blur-3xl"></div>
      </div>

      {/* Content */}
      <div className="relative text-center max-w-2xl">
        <Trophy className="w-24 h-24 text-[#D4A017] mx-auto mb-8 opacity-50" />
        
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-[#D4A017] mb-4">404</h1>
          <h2 className="text-4xl font-bold text-[#1E3A5F] mb-4">Trang không tồn tại</h2>
          <p className="text-xl text-[#1E3A5F]/60 mb-8">
            Oops! Có vẻ như bạn đã đi lạc đường. Trang bạn tìm kiếm không tồn tại hoặc đã được di chuyển.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-[#D4A017] text-white rounded-2xl font-semibold hover:bg-[#B8941F] transition-all duration-200 shadow-lg shadow-[#D4A017]/20"
          >
            <Home className="w-5 h-5" />
            <span>Về trang chủ</span>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-white text-[#1E3A5F] border-2 border-[#1E3A5F]/20 rounded-2xl font-semibold hover:bg-[#1E3A5F]/5 hover:border-[#1E3A5F]/40 transition-all duration-200 shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại</span>
          </button>
        </div>
      </div>
    </div>
  );
}
