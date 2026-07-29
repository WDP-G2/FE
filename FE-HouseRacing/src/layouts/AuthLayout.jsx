import { Link } from 'react-router-dom'
import { Trophy } from 'lucide-react'

const BG =
  'https://images.unsplash.com/photo-1507514604110-ba3347c457f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3JzZSUyMHJhY2luZyUyMGpvY2tleSUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3Nzg5MTU1NzB8MA&ixlib=rb-4.1.0&q=80&w=1080'

export default function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF8F0] via-white to-[#FAFAFA] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0">
        <img src={BG} alt="" className="w-full h-full object-cover opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/90 via-[#FFF8F0]/95 to-white/90" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4A017] to-[#B8860B] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Trophy className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1E3A5F]">Horse Racing</h1>
            <p className="text-xs text-gray-500">Tournament Management</p>
          </div>
        </Link>

        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/60 p-8">
          {title && (
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-[#1E3A5F]">{title}</h2>
              {subtitle && <p className="text-sm text-gray-500 mt-2">{subtitle}</p>}
            </div>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}
