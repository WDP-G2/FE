import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import WalletPanel from '@/components/wallet/WalletPanel'

export default function SpectatorWalletPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-2 text-[#1E3A5F]/70 hover:text-[#D4A017] mb-6 font-medium"
      >
        <ArrowLeft className="w-4 h-4" />
        Về dashboard
      </Link>
      <WalletPanel
        walletMode="user"
        title="Ví khán giả"
        description="Nạp tiền để mua vé, đặt cược dự đoán và theo dõi lịch sử giao dịch."
        bgPanelClass="bg-gradient-to-br from-[#1E3A5F] to-[#0F1E3A] text-white"
      />
    </div>
  )
}
