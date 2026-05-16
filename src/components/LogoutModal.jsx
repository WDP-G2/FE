import { LogOut, X, AlertTriangle } from 'lucide-react';


export default function LogoutModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white/90 backdrop-blur-lg rounded-2xl border border-gray-200 p-8 max-w-md w-full shadow-2xl shadow-[#D4A017]/10 animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#1E3A5F]/60 hover:text-[#1E3A5F] hover:bg-[#FAFAFA] rounded-xl transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="w-16 h-16 bg-[#D4A017]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-[#D4A017]" />
        </div>

        {/* Content */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#1E3A5F] mb-3">Xác nhận đăng xuất</h2>
          <p className="text-[#1E3A5F]/60 leading-relaxed">
            Bạn có chắc chắn muốn đăng xuất khỏi tài khoản? 
            Bạn sẽ cần đăng nhập lại để tiếp tục sử dụng dịch vụ.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 bg-white text-[#1E3A5F] border border-gray-200 rounded-xl hover:bg-[#FAFAFA] hover:border-gray-300 transition-all font-semibold"
          >
            Hủy bỏ
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-3 bg-[#D4A017] text-white rounded-xl hover:bg-[#B8941F] transition-all font-semibold shadow-lg shadow-[#D4A017]/20 flex items-center justify-center space-x-2"
          >
            <LogOut className="w-5 h-5" />
            <span>Đăng xuất</span>
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-6 p-4 bg-[#FAFAFA] rounded-lg border border-[#D4A017]/10">
          <p className="text-xs text-[#1E3A5F]/60 text-center">
            💡 Dữ liệu của bạn sẽ được lưu an toàn và bạn có thể đăng nhập lại bất cứ lúc nào
          </p>
        </div>
      </div>
    </div>
  );
}
