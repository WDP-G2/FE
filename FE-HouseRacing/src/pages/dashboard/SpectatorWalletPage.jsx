import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import WalletPanel from '@/components/wallet/WalletPanel'

export default function SpectatorWalletPage() {
  return (
    <div className="min-h-screen bg-[#0A1628] text-white">
      <div className="max-w-6xl mx-auto px-4 py-8 md:px-8">
        <Link
          to="/spectator/dashboard"
          className="inline-flex items-center gap-2 text-white/60 hover:text-[#D4A017] mb-6 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Về dashboard
        </Link>

        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            Ví của tôi · <span className="text-[#D4A017]">Khán giả</span>
          </h1>
          <p className="text-sm text-white/55 mt-1">
            Nạp tiền để mua vé, đặt cược dự đoán và theo dõi lịch sử giao dịch
          </p>
        </div>

        <WalletPanel
          walletMode="user"
          title="Ví khán giả"
          description="Nạp tiền để mua vé, đặt cược dự đoán và theo dõi lịch sử giao dịch."
        />
      </div>
    </div>
  )
}
