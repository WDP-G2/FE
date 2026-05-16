import { Link } from 'react-router-dom';
import { Trophy, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#1E3A5F] border-t border-[#D4A017]/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Trophy className="w-8 h-8 text-[#D4A017]" strokeWidth={2.5} />
              <div className="flex flex-col">
                <span className="text-lg font-bold text-white">HORSE RACING</span>
                <span className="text-xs text-[#D4A017] tracking-widest font-semibold">CHAMPIONSHIP</span>
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              Nền tảng quản lý giải đấu đua ngựa hàng đầu Việt Nam. Mang đến trải nghiệm chuyên nghiệp và đẳng cấp.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Liên kết nhanh</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className="text-white/70 hover:text-[#D4A017] transition-colors text-sm">
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link to="/tournaments" className="text-white/70 hover:text-[#D4A017] transition-colors text-sm">
                  Giải đấu
                </Link>
              </li>
              <li>
                <Link to="/rankings" className="text-white/70 hover:text-[#D4A017] transition-colors text-sm">
                  Bảng xếp hạng
                </Link>
              </li>
              <li>
                <Link to="/profile" className="text-white/70 hover:text-[#D4A017] transition-colors text-sm">
                  Hồ sơ
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Hỗ trợ</h3>
            <ul className="space-y-3">
              <li>
                <a href="#" className="text-white/70 hover:text-[#D4A017] transition-colors text-sm">
                  Trung tâm trợ giúp
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-[#D4A017] transition-colors text-sm">
                  Điều khoản dịch vụ
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-[#D4A017] transition-colors text-sm">
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-[#D4A017] transition-colors text-sm">
                  Quy định cá cược
                </a>
              </li>
              <li>
                <a href="#" className="text-white/70 hover:text-[#D4A017] transition-colors text-sm">
                  FAQs
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Liên hệ</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3 text-white/70 text-sm">
                <MapPin className="w-5 h-5 text-[#D4A017] mt-0.5 flex-shrink-0" />
                <span>123 Đường Đua Ngựa, Quận 1, TP. Hồ Chí Minh</span>
              </li>
              <li className="flex items-center space-x-3 text-white/70 text-sm">
                <Phone className="w-5 h-5 text-[#D4A017] flex-shrink-0" />
                <span>+84 123 456 789</span>
              </li>
              <li className="flex items-center space-x-3 text-white/70 text-sm">
                <Mail className="w-5 h-5 text-[#D4A017] flex-shrink-0" />
                <span>contact@horseracing.vn</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-white/50 text-sm">
              © {currentYear} Horse Racing Championship. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-white/50 hover:text-[#D4A017] transition-colors text-sm">
                Quyền riêng tư
              </a>
              <a href="#" className="text-white/50 hover:text-[#D4A017] transition-colors text-sm">
                Điều khoản
              </a>
              <a href="#" className="text-white/50 hover:text-[#D4A017] transition-colors text-sm">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
