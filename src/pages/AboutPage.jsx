import { Link } from 'react-router-dom';
import {
  Trophy,
  Award,
  Users,
  BarChart3,
  Calendar,
  CheckCircle2,
  Target,
  Zap,
  Shield
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function AboutPage() {
  const features = [
    {
      icon: Trophy,
      title: 'Quản lý giải đấu',
      description: 'Tổ chức và quản lý các giải đua ngựa chuyên nghiệp với quy trình rõ ràng, minh bạch'
    },
    {
      icon: Award,
      title: 'Đăng ký ngựa tham gia',
      description: 'Hệ thống đăng ký ngựa đua minh bạch với quản lý thông tin chi tiết và chính xác'
    },
    {
      icon: Users,
      title: 'Phối hợp Jockey',
      description: 'Quản lý và phối hợp các jockeys chuyên nghiệp cho từng giải đấu một cách hiệu quả'
    },
    {
      icon: BarChart3,
      title: 'Theo dõi kết quả',
      description: 'Cập nhật kết quả thi đấu và bảng xếp hạng ngựa theo thời gian thực'
    }
  ];

  const benefits = [
    {
      icon: Target,
      title: 'Chuyên nghiệp',
      description: 'Nền tảng được thiết kế theo tiêu chuẩn quốc tế'
    },
    {
      icon: Zap,
      title: 'Hiệu quả',
      description: 'Tối ưu hóa quy trình quản lý và vận hành'
    },
    {
      icon: Shield,
      title: 'Bảo mật',
      description: 'Đảm bảo an toàn thông tin và dữ liệu'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F0] via-white to-[#FAFAFA]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#D4A017]/5 to-[#1E3A5F]/5"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-[#D4A017]/10 border border-[#D4A017]/30 rounded-full mb-6">
            <Trophy className="w-4 h-4 text-[#D4A017]" />
            <span className="text-[#D4A017] font-semibold text-sm">Horse Racing Tournament Management</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-[#1E3A5F] mb-6 leading-tight">
            Giới thiệu hệ thống
          </h1>

          <p className="text-xl text-[#1E3A5F]/70 max-w-3xl mx-auto leading-relaxed">
            Nền tảng quản lý giải đua ngựa chuyên nghiệp - Hỗ trợ toàn diện từ tổ chức giải đấu,
            đăng ký ngựa, phối hợp jockey đến theo dõi kết quả thi đấu
          </p>
        </div>
      </section>

      {/* Main Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#1E3A5F] mb-4">Tính năng chính</h2>
            <p className="text-[#1E3A5F]/60 max-w-2xl mx-auto">
              Hệ thống cung cấp đầy đủ các tính năng cần thiết cho việc quản lý giải đua ngựa chuyên nghiệp
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white border border-gray-200 rounded-2xl p-8 hover:border-[#D4A017] hover:shadow-xl transition-all group"
              >
                <div className="flex items-start space-x-6">
                  <div className="w-16 h-16 bg-[#D4A017]/10 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#D4A017]/20 transition-all">
                    <feature.icon className="w-8 h-8 text-[#D4A017]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-[#1E3A5F] mb-3">{feature.title}</h3>
                    <p className="text-[#1E3A5F]/70 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#1E3A5F] mb-4">Lợi ích</h2>
            <p className="text-[#1E3A5F]/60 max-w-2xl mx-auto">
              Những giá trị mà hệ thống mang lại cho người dùng
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="text-center group"
              >
                <div className="w-20 h-20 bg-[#D4A017]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-[#D4A017]/20 transition-all">
                  <benefit.icon className="w-10 h-10 text-[#D4A017]" />
                </div>
                <h3 className="text-xl font-bold text-[#1E3A5F] mb-3">{benefit.title}</h3>
                <p className="text-[#1E3A5F]/70 leading-relaxed">{benefit.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#1E3A5F] mb-4">Quy trình hoạt động</h2>
            <p className="text-[#1E3A5F]/60 max-w-2xl mx-auto">
              Hệ thống hoạt động theo quy trình chuyên nghiệp và khoa học
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#D4A017] text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                1
              </div>
              <h3 className="text-lg font-bold text-[#1E3A5F] mb-3">Đăng ký tài khoản</h3>
              <p className="text-[#1E3A5F]/60 text-sm">
                Tạo tài khoản với vai trò phù hợp (Spectator, Owner, Jockey)
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#D4A017] text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                2
              </div>
              <h3 className="text-lg font-bold text-[#1E3A5F] mb-3">Tham gia giải đấu</h3>
              <p className="text-[#1E3A5F]/60 text-sm">
                Đăng ký ngựa hoặc jockey tham gia các giải đấu
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#D4A017] text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                3
              </div>
              <h3 className="text-lg font-bold text-[#1E3A5F] mb-3">Theo dõi diễn biến</h3>
              <p className="text-[#1E3A5F]/60 text-sm">
                Cập nhật kết quả và bảng xếp hạng theo thời gian thực
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#D4A017] text-white rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                4
              </div>
              <h3 className="text-lg font-bold text-[#1E3A5F] mb-3">Xem kết quả</h3>
              <p className="text-[#1E3A5F]/60 text-sm">
                Kiểm tra kết quả cuối cùng và thống kê chi tiết
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative bg-gradient-to-r from-[#D4A017] to-[#F5E6C8] rounded-3xl p-12 md:p-16 overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9IjAuMDUiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-40"></div>

            <div className="relative text-center max-w-3xl mx-auto">
              <Trophy className="w-16 h-16 text-white mx-auto mb-6" />
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Bắt đầu ngay hôm nay
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Tham gia cùng chúng tôi để trải nghiệm hệ thống quản lý giải đua ngựa chuyên nghiệp
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="px-8 py-4 bg-white text-[#D4A017] rounded-2xl font-semibold hover:bg-[#FAFAFA] transition-all duration-200 shadow-xl"
                >
                  Đăng ký miễn phí
                </Link>
                <Link
                  to="/tournaments"
                  className="px-8 py-4 bg-transparent text-white border-2 border-white rounded-2xl font-semibold hover:bg-white/10 transition-all duration-200"
                >
                  Xem giải đấu
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
