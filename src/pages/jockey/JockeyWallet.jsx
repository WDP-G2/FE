import { JockeyLayout } from './JockeyLayout'
import WalletPanel from '@/components/wallet/WalletPanel'

export function JockeyWallet() {
  return (
    <JockeyLayout
      title="Ví của tôi · Jockey"
      subtitle="Nhận tiền thuê và thưởng sau mỗi cuộc đua"
    >
      <WalletPanel
        walletMode="user"
        title="Ví jockey"
        description="Nhận tiền thuê từ chủ ngựa, thưởng giải và quản lý rút tiền."
      />
    </JockeyLayout>
  )
}
