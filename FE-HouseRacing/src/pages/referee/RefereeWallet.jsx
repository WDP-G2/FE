import { RefereeLayout } from './RefereeLayout'
import WalletPanel from '@/components/wallet/WalletPanel'
import RefereeSalaryPanel from '@/components/referee/RefereeSalaryPanel'

export function RefereeWallet() {
  return (
    <RefereeLayout
      title="Ví của tôi · Trọng tài"
      subtitle="Lương cuộc đua được cộng vào ví sau khi admin thanh toán (sau khi chốt kết quả)"
    >
      <RefereeSalaryPanel />
      <WalletPanel
        walletMode="user"
        title="Ví trọng tài"
        description="Nhận lương từ hệ thống và phụ cấp theo từng giải đấu được phân công."
      />
    </RefereeLayout>
  )
}
