import { Link } from 'react-router-dom';
import {
  Calendar,
  Trophy,
  BarChart3,
  MapPin,
  ChevronRight,
  Users,
  Award,
  User
} from 'lucide-react';
import HomeFeaturedNews from '@/components/news/HomeFeaturedNews';
export default function HomePage() {
  // Mock data
  const upcomingTournaments = [
    {
      id: 1,
      name: 'Vietnam Grand Prix 2026',
      date: '15 Tháng 6, 2026',
      location: 'Sân đua Phú Thọ',
      prize: '5,000,000,000 VNĐ',
      participants: 24,
      image: 'https://images.unsplash.com/photo-1507514604110-ba3347c457f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3JzZSUyMHJhY2luZyUyMGpvY2tleSUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3Nzg5MTU1NzB8MA&ixlib=rb-4.1.0&q=80&w=1080',
      status: 'Sắp diễn ra'
    },
    {
      id: 2,
      name: 'Championship Cup 2026',
      date: '22 Tháng 6, 2026',
      location: 'Sân đua Vũng Tàu',
      prize: '3,500,000,000 VNĐ',
      participants: 20,
      image: 'https://images.unsplash.com/photo-1580831800257-f83135932664?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3JzZSUyMHJhY2luZyUyMGNoYW1waW9uc2hpcCUyMHRyb3BoeXxlbnwxfHx8fDE3Nzg5MTU1NzF8MA&ixlib=rb-4.1.0&q=80&w=1080',
      status: 'Đăng ký'
    },
    {
      id: 3,
      name: 'Golden Stakes Classic',
      date: '30 Tháng 6, 2026',
      location: 'Sân đua Long Thành',
      prize: '4,200,000,000 VNĐ',
      participants: 18,
      image: 'https://images.unsplash.com/photo-1760041870925-0a6ed8220ce4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlcXVlc3RyaWFuJTIwc3RhZGl1bSUyMGNyb3dkfGVufDF8fHx8MTc3ODkxNTU3M3ww&ixlib=rb-4.1.0&q=80&w=1080',
      status: 'Sắp diễn ra'
    }
  ];

  const topHorses = [
    { rank: 1, name: 'Thunder Strike', owner: 'Nguyễn Văn A', wins: 28, points: 2850, winRate: 87, image: '🏆' },
    { rank: 2, name: 'Golden Flash', owner: 'Trần Thị B', wins: 25, points: 2720, winRate: 83, image: '🥈' },
    { rank: 3, name: 'Midnight Runner', owner: 'Lê Văn C', wins: 23, points: 2650, winRate: 81, image: '🥉' },
    { rank: 4, name: 'Royal Destiny', owner: 'Phạm Thị D', wins: 22, points: 2580, winRate: 79, image: '⭐' },
    { rank: 5, name: 'Speed Demon', owner: 'Hoàng Văn E', wins: 21, points: 2520, winRate: 77, image: '⚡' }
  ];


  const statistics = [
    { label: 'Tổng giải đấu', value: '156', icon: Trophy },
    { label: 'Ngựa tham gia', value: '328', icon: Award },
    { label: 'Jockeys', value: '145', icon: Users },
    { label: 'Spectators', value: '2,845', icon: BarChart3 }
  ];

   
  return (
    
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F0] via-white to-[#FAFAFA]">
      {/* Hero Section */}
       
      <section className="relative min-h-[85vh] pt-28 pb-20 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1507514604110-ba3347c457f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3JzZSUyMHJhY2luZyUyMGpvY2tleSUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3Nzg5MTU1NzB8MA&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Hero"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/80"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-[#FFF8F0]/50 via-transparent to-white"></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-[#D4A017]/10 border border-[#D4A017]/30 rounded-full mb-6">
              <Trophy className="w-4 h-4 text-[#D4A017]" />
              <span className="text-[#D4A017] font-semibold text-sm">Nền tảng quản lý giải đua ngựa chuyên nghiệp</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-[#1E3A5F] mb-6 leading-tight">
              Trải nghiệm giải đua ngựa
              <span className="block text-[#D4A017]">chuyên nghiệp</span>
            </h1>

            <p className="text-xl text-[#1E3A5F]/70 mb-10 leading-relaxed">
              Hệ thống quản lý giải đua ngựa hiện đại - Theo dõi các giải đấu,
              bảng xếp hạng ngựa và kết quả thi đấu một cách dễ dàng.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/tournaments"
                className="group px-8 py-4 bg-[#D4A017] text-white rounded-2xl font-semibold hover:bg-[#B8941F] transition-all duration-200 shadow-xl shadow-[#D4A017]/30 flex items-center justify-center space-x-2"
              >
                <Calendar className="w-5 h-5" />
                <span>Xem giải đấu</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/register"
                className="px-8 py-4 bg-white text-[#1E3A5F] border-2 border-[#1E3A5F]/20 rounded-2xl font-semibold hover:bg-[#1E3A5F]/5 hover:border-[#1E3A5F]/40 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg"
              >
                <User className="w-5 h-5" />
                <span>Đăng ký tham gia</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-[#D4A017]/10 rounded-full blur-3xl"></div>
      </section>

      {/* Upcoming Tournaments */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-[#1E3A5F] mb-2">Giải đấu sắp diễn ra</h2>
              <p className="text-[#1E3A5F]/60">Đừng bỏ lỡ những giải đấu đỉnh cao</p>
            </div>
            <Link to="/tournaments" className="hidden md:flex items-center space-x-2 text-[#D4A017] hover:text-[#B8941F] transition-colors font-semibold">
              <span>Xem tất cả</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {upcomingTournaments.map((tournament) => (
              <div
                key={tournament.id}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-[#D4A017] transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={tournament.image}
                    alt={tournament.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-[#D4A017] text-white rounded-full text-xs font-semibold">
                      {tournament.status}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-[#1E3A5F] mb-4 group-hover:text-[#D4A017] transition-colors">
                    {tournament.name}
                  </h3>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center space-x-2 text-[#1E3A5F]/60 text-sm">
                      <Calendar className="w-4 h-4 text-[#D4A017]" />
                      <span>{tournament.date}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-[#1E3A5F]/60 text-sm">
                      <MapPin className="w-4 h-4 text-[#D4A017]" />
                      <span>{tournament.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-[#1E3A5F]/60 text-sm">
                      <Trophy className="w-4 h-4 text-[#D4A017]" />
                      <span className="text-[#D4A017] font-semibold">{tournament.prize}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-2 text-[#1E3A5F]/60 text-sm">
                      <Users className="w-4 h-4" />
                      <span>{tournament.participants} tham gia</span>
                    </div>
                    <button className="text-[#D4A017] hover:text-[#B8941F] transition-colors font-semibold">
                      Chi tiết →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Horses Ranking */}
      <section className="py-20 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-[#1E3A5F] mb-2">Bảng xếp hạng ngựa</h2>
              <p className="text-[#1E3A5F]/60">Top những chú ngựa xuất sắc nhất</p>
            </div>
            <Link to="/rankings" className="hidden md:flex items-center space-x-2 text-[#D4A017] hover:text-[#B8941F] transition-colors font-semibold">
              <span>Xem tất cả</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-[#FFF8F0]">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#1E3A5F]/70">Hạng</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#1E3A5F]/70">Tên ngựa</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-[#1E3A5F]/70">Chủ sở hữu</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-[#1E3A5F]/70">Chiến thắng</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-[#1E3A5F]/70">Điểm</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-[#1E3A5F]/70">Tỷ lệ thắng</th>
                  </tr>
                </thead>
                <tbody>
                  {topHorses.map((horse) => (
                    <tr
                      key={horse.rank}
                      className="border-b border-gray-100 hover:bg-[#FFF8F0]/50 transition-colors"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{horse.image}</span>
                          <span className="text-[#1E3A5F] font-bold">#{horse.rank}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[#1E3A5F] font-semibold">{horse.name}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[#1E3A5F]/60">{horse.owner}</span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="text-[#D4A017] font-semibold">{horse.wins}</span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="text-[#1E3A5F] font-semibold">{horse.points}</span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="inline-flex items-center px-3 py-1 bg-green-500/10 text-green-600 rounded-full text-sm font-semibold">
                          {horse.winRate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>


      {/* Statistics Dashboard */}
      <section className="py-20 bg-[#FAFAFA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-[#1E3A5F] mb-4">Thống kê hệ thống</h2>
            <p className="text-[#1E3A5F]/60">Những con số ấn tượng của chúng tôi</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statistics.map((stat, index) => (
              <div
                key={index}
                className="relative group bg-white rounded-2xl p-8 border border-gray-200 hover:border-[#D4A017] transition-all duration-300 hover:shadow-xl overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4A017]/5 rounded-full blur-2xl group-hover:bg-[#D4A017]/10 transition-colors"></div>

                <div className="relative">
                  {(() => { const StatIcon = stat.icon; return <StatIcon className="w-12 h-12 text-[#D4A017] mb-4" /> })()}
                  <div className="text-4xl font-bold text-[#1E3A5F] mb-2">{stat.value}</div>
                  <div className="text-[#1E3A5F]/60 text-sm">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HomeFeaturedNews />

      {/* About Us Section */}
      <section id="about-us" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 mb-3 text-xs font-semibold tracking-widest uppercase text-[#D4A017] bg-[#D4A017]/10 border border-[#D4A017]/30 rounded-full">
              About Us
            </span>
            <h2 className="text-4xl font-bold text-[#1E3A5F] mb-4">Giới thiệu hệ thống</h2>
            <p className="text-[#1E3A5F]/60 max-w-2xl mx-auto mb-6">
              Nền tảng quản lý giải đua ngựa chuyên nghiệp - Hỗ trợ toàn diện từ tổ chức giải đấu đến theo dõi kết quả
            </p>
            <Link
              to="/about"
              className="inline-flex items-center space-x-2 text-[#D4A017] hover:text-[#B8941F] transition-colors font-semibold"
            >
              <span>Xem chi tiết</span>
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center group">
              <div className="w-20 h-20 bg-[#D4A017]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-[#D4A017]/20 group-hover:scale-110 transition-all duration-300">
                <Trophy className="w-10 h-10 text-[#D4A017]" />
              </div>
              <h3 className="text-xl font-bold text-[#1E3A5F] mb-3">Quản lý giải đấu</h3>
              <p className="text-[#1E3A5F]/60 text-sm leading-relaxed">
                Tổ chức và quản lý các giải đua ngựa chuyên nghiệp
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-[#D4A017]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-[#D4A017]/20 group-hover:scale-110 transition-all duration-300">
                <Award className="w-10 h-10 text-[#D4A017]" />
              </div>
              <h3 className="text-xl font-bold text-[#1E3A5F] mb-3">Đăng ký ngựa</h3>
              <p className="text-[#1E3A5F]/60 text-sm leading-relaxed">
                Hệ thống đăng ký ngựa đua minh bạch và chi tiết
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-[#D4A017]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-[#D4A017]/20 group-hover:scale-110 transition-all duration-300">
                <Users className="w-10 h-10 text-[#D4A017]" />
              </div>
              <h3 className="text-xl font-bold text-[#1E3A5F] mb-3">Phối hợp Jockey</h3>
              <p className="text-[#1E3A5F]/60 text-sm leading-relaxed">
                Quản lý jockeys chuyên nghiệp cho giải đấu
              </p>
            </div>

            <div className="text-center group">
              <div className="w-20 h-20 bg-[#D4A017]/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-[#D4A017]/20 group-hover:scale-110 transition-all duration-300">
                <BarChart3 className="w-10 h-10 text-[#D4A017]" />
              </div>
              <h3 className="text-xl font-bold text-[#1E3A5F] mb-3">Theo dõi kết quả</h3>
              <p className="text-[#1E3A5F]/60 text-sm leading-relaxed">
                Cập nhật kết quả và bảng xếp hạng theo thời gian thực
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
                Sẵn sàng tham gia cuộc đua?
              </h2>
              <p className="text-xl text-white/90 mb-8">
                Đăng ký ngay hôm nay để không bỏ lỡ những giải đấu hấp dẫn
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/register"
                  className="px-8 py-4 bg-white text-[#D4A017] rounded-2xl font-semibold hover:bg-[#FAFAFA] transition-all duration-200 shadow-xl flex items-center justify-center space-x-2"
                >
                  <span>Đăng ký miễn phí</span>
                  <ChevronRight className="w-5 h-5" />
                </Link>
                <Link
                  to="/login"
                  className="px-8 py-4 bg-transparent text-white border-2 border-white rounded-2xl font-semibold hover:bg-white/10 transition-all duration-200 flex items-center justify-center space-x-2"
                >
                  <span>Đăng nhập</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
