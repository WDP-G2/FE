import { RefereeLayout } from './RefereeLayout'
import WalletPanel from '@/components/wallet/WalletPanel'

export function RefereeWallet() {
  return (
    <RefereeLayout
      title="Ví của tôi · Trọng tài"
      subtitle="Nhận lương và phụ cấp sau mỗi giải đấu"
    >
      <WalletPanel
        walletMode="user"
        title="Ví trọng tài"
        description="Theo dõi lương, phụ cấp và lịch sử giao dịch liên quan giải đấu."
      />
    </RefereeLayout>
  )
}
