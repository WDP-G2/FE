import WalletPanel from '@/components/wallet/WalletPanel'

export default function SpectatorWallet() {
  return (
    <div className="space-y-6">
      <section>
        <p className="text-sm font-bold uppercase tracking-wide text-[#D4A017]">Wallet</p>
        <h2 className="text-3xl font-black text-white">Vi khan gia</h2>
        <p className="mt-2 text-sm text-white/50">
          Nap tien, rut tien va theo doi giao dich phuc vu dat cuoc.
        </p>
      </section>

      <WalletPanel
        walletMode="user"
        title="Vi khan gia"
        description="Nap tien de dat cuoc du doan va theo doi lich su giao dich."
      />
    </div>
  )
}
