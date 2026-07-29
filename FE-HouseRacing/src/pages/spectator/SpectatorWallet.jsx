import WalletPanel from '@/components/wallet/WalletPanel'

export default function SpectatorWallet() {
  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-bold uppercase tracking-wide text-[#D4A017]">Ví</p>
        <h2 className="text-3xl font-black text-white">Ví khán giả</h2>
        <p className="mt-2 text-sm text-white/50">
          Nạp tiền, rút tiền và theo dõi giao dịch phục vụ đặt cược.
        </p>
      </section>

      <WalletPanel
        walletMode="user"
        title="Ví khán giả"
        description="Nạp tiền để đặt cược dự đoán và theo dõi lịch sử giao dịch."
      />
    </div>
  )
}
