import { useState } from 'react';
import LogoutModal from '@/components/LogoutModal';
import { Link } from 'react-router-dom';
import { Trophy, LogOut } from 'lucide-react';

export default function DemoLogoutModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogout = () => {
    console.log('User logged out');
    setIsModalOpen(false);
    // Navigate to login or perform logout logic
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-white to-[#FAFAFA] flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <Trophy className="w-16 h-16 text-[#D4A017] mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-[#1E3A5F] mb-2">Logout Modal Demo</h1>
        <p className="text-[#1E3A5F]/60">Click vào nút bên dưới để xem modal đăng xuất</p>
      </div>

      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center space-x-2 px-8 py-4 bg-[#D4A017] text-white rounded-2xl font-semibold hover:bg-[#B8941F] transition-all duration-200 shadow-lg shadow-[#D4A017]/20"
      >
        <LogOut className="w-5 h-5" />
        <span>Mở Logout Modal</span>
      </button>

      <Link
        to="/"
        className="mt-8 text-[#1E3A5F]/60 hover:text-[#D4A017] transition-colors font-medium"
      >
        ← Quay lại trang chủ
      </Link>

      <LogoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}
