import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Trophy,
  Ticket,
  Edit2,
  Clock,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('info');

  // Mock user data
  const user = {
    name: 'Nguyễn Văn A',
    email: 'nguyenvana@example.com',
    phone: '+84 123 456 789',
    role: 'Khán giả',
    joinDate: '15 Tháng 1, 2024',
    avatar: '👨‍💼',
    location: 'TP. Hồ Chí Minh'
  };

  // Mock tournaments data
  const registeredTournaments = [
    {
      id: 1,
      name: 'Vietnam Grand Prix 2026',
      date: '15 Tháng 6, 2026',
      location: 'Sân đua Phú Thọ',
      status: 'Sắp diễn ra',
      image: 'https://images.unsplash.com/photo-1507514604110-ba3347c457f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3JzZSUyMHJhY2luZyUyMGpvY2tleSUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3Nzg5MTU1NzB8MA&ixlib=rb-4.1.0&q=80&w=1080'
    },
    {
      id: 2,
      name: 'Championship Cup 2026',
      date: '22 Tháng 6, 2026',
      location: 'Sân đua Vũng Tàu',
      status: 'Đã đăng ký',
      image: 'https://images.unsplash.com/photo-1580831800257-f83135932664?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3JzZSUyMHJhY2luZyUyMGNoYW1waW9uc2hpcCUyMHRyb3BoeXxlbnwxfHx8fDE3Nzg5MTU1NzF8MA&ixlib=rb-4.1.0&q=80&w=1080'
    }
  ];

  // Mock tickets data
  const ticketHistory = [
    {
      id: 'TKT-001',
      tournament: 'Vietnam Grand Prix 2026',
      purchaseDate: '10 Tháng 5, 2026',
      quantity: 2,
      totalPrice: '2,000,000 VNĐ',
      status: 'confirmed',
      seatSection: 'VIP Section A'
    },
    {
      id: 'TKT-002',
      tournament: 'Championship Cup 2026',
      purchaseDate: '12 Tháng 5, 2026',
      quantity: 1,
      totalPrice: '1,200,000 VNĐ',
      status: 'confirmed',
      seatSection: 'Standard Section B'
    },
    {
      id: 'TKT-003',
      tournament: 'Spring Classic 2026',
      purchaseDate: '20 Tháng 4, 2026',
      quantity: 3,
      totalPrice: '2,500,000 VNĐ',
      status: 'used',
      seatSection: 'VIP Section C'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F0] via-white to-[#FAFAFA]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#D4A017]/10 to-[#1E3A5F]/10"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-xl">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Avatar */}
              <div className="relative">
                <div className="w-32 h-32 bg-gradient-to-br from-[#D4A017] to-[#F5E6C8] rounded-2xl flex items-center justify-center text-6xl shadow-xl">
                  {user.avatar}
                </div>
                <button className="absolute bottom-0 right-0 w-10 h-10 bg-[#D4A017] rounded-full flex items-center justify-center text-white hover:bg-[#B8941F] transition-all shadow-lg">
                  <Edit2 className="w-5 h-5" />
                </button>
              </div>

              {/* User Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-bold text-[#1E3A5F] mb-2">{user.name}</h1>
                <p className="text-[#D4A017] font-semibold mb-4">{user.role}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="flex items-center space-x-3 text-[#1E3A5F]/70">
                    <Mail className="w-5 h-5 text-[#D4A017]" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-[#1E3A5F]/70">
                    <Phone className="w-5 h-5 text-[#D4A017]" />
                    <span>{user.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-[#1E3A5F]/70">
                    <MapPin className="w-5 h-5 text-[#D4A017]" />
                    <span>{user.location}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-[#1E3A5F]/70">
                    <Calendar className="w-5 h-5 text-[#D4A017]" />
                    <span>Tham gia: {user.joinDate}</span>
                  </div>
                </div>
              </div>

              {/* Edit Button */}
              <button className="px-6 py-3 bg-[#D4A017] text-white rounded-xl hover:bg-[#B8941F] transition-all font-semibold shadow-lg">
                Chỉnh sửa hồ sơ
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tab Navigation */}
          <div className="flex space-x-4 mb-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('tournaments')}
              className={`px-6 py-3 font-semibold transition-all border-b-2 ${
                activeTab === 'tournaments'
                  ? 'border-[#D4A017] text-[#D4A017]'
                  : 'border-transparent text-[#1E3A5F]/60 hover:text-[#1E3A5F]'
              }`}
            >
              Giải đấu đã đăng ký
            </button>
            <button
              onClick={() => setActiveTab('tickets')}
              className={`px-6 py-3 font-semibold transition-all border-b-2 ${
                activeTab === 'tickets'
                  ? 'border-[#D4A017] text-[#D4A017]'
                  : 'border-transparent text-[#1E3A5F]/60 hover:text-[#1E3A5F]'
              }`}
            >
              Lịch sử vé
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'tournaments' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {registeredTournaments.map((tournament) => (
                <div
                  key={tournament.id}
                  className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:border-[#D4A017] transition-all hover:shadow-xl"
                >
                  <div className="relative h-48">
                    <img
                      src={tournament.image}
                      alt={tournament.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                    <div className="absolute top-4 right-4">
                      <span className="px-3 py-1 bg-[#D4A017] text-white rounded-full text-xs font-semibold">
                        {tournament.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[#1E3A5F] mb-4">{tournament.name}</h3>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-[#1E3A5F]/60 text-sm">
                        <Calendar className="w-4 h-4 text-[#D4A017]" />
                        <span>{tournament.date}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-[#1E3A5F]/60 text-sm">
                        <MapPin className="w-4 h-4 text-[#D4A017]" />
                        <span>{tournament.location}</span>
                      </div>
                    </div>

                    <button className="mt-6 w-full py-3 bg-[#FAFAFA] text-[#1E3A5F] border border-gray-200 rounded-xl hover:bg-white hover:border-[#D4A017] transition-all font-semibold">
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'tickets' && (
            <div className="space-y-4">
              {ticketHistory.map((ticket) => (
                <div
                  key={ticket.id}
                  className="bg-white rounded-2xl border border-gray-200 p-6 hover:border-[#D4A017] transition-all hover:shadow-lg"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <Ticket className="w-6 h-6 text-[#D4A017]" />
                        <h3 className="text-xl font-bold text-[#1E3A5F]">{ticket.tournament}</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center space-x-2 text-[#1E3A5F]/60">
                          <span className="font-medium">Mã vé:</span>
                          <span>{ticket.id}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-[#1E3A5F]/60">
                          <Clock className="w-4 h-4 text-[#D4A017]" />
                          <span>{ticket.purchaseDate}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-[#1E3A5F]/60">
                          <span className="font-medium">Khu vực:</span>
                          <span>{ticket.seatSection}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-sm text-[#1E3A5F]/60 mb-1">Số lượng: {ticket.quantity}</div>
                        <div className="text-xl font-bold text-[#D4A017]">{ticket.totalPrice}</div>
                      </div>

                      <div>
                        {ticket.status === 'confirmed' ? (
                          <div className="flex items-center space-x-2 px-4 py-2 bg-green-500/10 text-green-600 rounded-xl">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="font-semibold">Đã xác nhận</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 px-4 py-2 bg-gray-500/10 text-gray-600 rounded-xl">
                            <XCircle className="w-5 h-5" />
                            <span className="font-semibold">Đã sử dụng</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
