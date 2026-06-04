import { HorseOwnerLayout } from './HorseOwnerLayout'
import WalletPanel from '@/components/wallet/WalletPanel'

export function HorseOwnerWallet() {
  return (
    <HorseOwnerLayout
      title="Ví của tôi · Chủ ngựa"
      subtitle="Thanh toán phí đăng ký giải đấu và nhận tiền thưởng"
    >
      <WalletPanel
        walletMode="user"
        title="Ví chủ ngựa"
        description="Dùng để thanh toán phí đăng ký, thuê jockey và nhận thưởng khi ngựa về đích."
      />
    </HorseOwnerLayout>
  )
}
