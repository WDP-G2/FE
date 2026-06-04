import AdminLayout from '@/components/AdminLayout'
import WalletPanel from '@/components/wallet/WalletPanel'

export default function AdminWalletPage() {
  return (
    <AdminLayout
      heading="Ví hệ thống"
      highlight="Quản trị"
      subtitle="Nhận tiền đăng ký giải đấu và phát thưởng cho người chiến thắng"
    >
      <WalletPanel
        walletMode="admin"
        title="Ví quỹ hệ thống"
        description="Quản lý dòng tiền giải đấu: thu phí đăng ký, phát thưởng, chi trả lương trọng tài."
        bgPanelClass="bg-gradient-to-br from-[#0F1E3A] to-[#1E3A5F] text-white"
      />
    </AdminLayout>
  )
}
