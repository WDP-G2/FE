import { CreditCard, DollarSign, TrendingUp, Clock } from 'lucide-react';
import { HorseOwnerLayout } from './HorseOwnerLayout';
import { GlassCard, StatCard, Pill, PrimaryButton } from '../admin/AdminLayout';
import { payments, fmt } from './data';
import { toast } from 'sonner';

function payTone(s) {
  if (s === 'Đã thanh toán' || s === 'Đã nhận') return 'green';
  if (s === 'Chờ thanh toán') return 'gold';
  if (s === 'Đang xử lý') return 'blue';
  return 'gray';
}

export function HorseOwnerPayments() {
  const totalPaid = payments.filter((p) => p.status === 'Đã thanh toán').reduce((s, p) => s + p.amount, 0);
  const totalPrize = payments.filter((p) => p.status === 'Đã nhận').reduce((s, p) => s + p.amount, 0);
  const pending = payments.filter((p) => p.status === 'Chờ thanh toán').reduce((s, p) => s + p.amount, 0);

  return (
    <HorseOwnerLayout
      title="Horse Owner · Thanh toán"
      subtitle="Theo dõi lịch sử thanh toán và tiền thưởng"
    >
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Tổng đã thanh toán" value={fmt(totalPaid)} icon={CreditCard} tone="gold" />
        <StatCard label="Tiền thưởng nhận được" value={fmt(totalPrize)} icon={TrendingUp} tone="green" />
        <StatCard label="Chờ thanh toán" value={fmt(pending)} icon={Clock} tone="blue" />
        <StatCard label="Tổng giao dịch" value={String(payments.length)} icon={DollarSign} tone="purple" />
      </div>

      {payments.some((p) => p.status === 'Chờ thanh toán') && (
        <GlassCard className="mb-6 border-[#D4A017]/30">
          <div className="p-5 border-b border-white/10">
            <h2 className="font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#D4A017]" />
              Thanh toán chờ xử lý
            </h2>
          </div>
          <div className="p-5 space-y-3">
            {payments.filter((p) => p.status === 'Chờ thanh toán').map((p) => (
              <div key={p.id} className="flex items-center justify-between gap-4 p-4 bg-[#D4A017]/5 border border-[#D4A017]/20 rounded-xl">
                <div>
                  <div className="text-sm font-bold text-white">{p.tournament}</div>
                  <div className="text-xs text-white/50">{p.horse} · {p.type}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm font-bold text-[#D4A017]">{fmt(p.amount)}</div>
                  <PrimaryButton onClick={() => toast.success(`Đã thanh toán ${fmt(p.amount)} · ${p.tournament}`)}>
                    Thanh toán ngay
                  </PrimaryButton>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      <GlassCard>
        <div className="p-5 border-b border-white/10">
          <h2 className="font-bold text-white">Lịch sử giao dịch</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-5 py-3 text-[11px] text-white/40 font-semibold uppercase tracking-wider">Giải đấu</th>
                <th className="text-left px-5 py-3 text-[11px] text-white/40 font-semibold uppercase tracking-wider">Ngựa</th>
                <th className="text-left px-5 py-3 text-[11px] text-white/40 font-semibold uppercase tracking-wider">Loại</th>
                <th className="text-right px-5 py-3 text-[11px] text-white/40 font-semibold uppercase tracking-wider">Số tiền</th>
                <th className="text-left px-5 py-3 text-[11px] text-white/40 font-semibold uppercase tracking-wider">Trạng thái</th>
                <th className="text-left px-5 py-3 text-[11px] text-white/40 font-semibold uppercase tracking-wider">Ngày</th>
                <th className="text-left px-5 py-3 text-[11px] text-white/40 font-semibold uppercase tracking-wider">PT</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-white/[0.06] hover:bg-white/[0.03] transition-colors">
                  <td className="px-5 py-4">
                    <div className="text-sm font-semibold text-white">{p.tournament}</div>
                  </td>
                  <td className="px-5 py-4 text-sm text-white/70">{p.horse}</td>
                  <td className="px-5 py-4 text-sm text-white/70">{p.type}</td>
                  <td className="px-5 py-4 text-right">
                    <span className={`text-sm font-bold ${p.type === 'Tiền thưởng' ? 'text-emerald-300' : 'text-white'}`}>
                      {p.type === 'Tiền thưởng' ? '+' : '-'}{fmt(p.amount)}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <Pill tone={payTone(p.status)}>{p.status}</Pill>
                  </td>
                  <td className="px-5 py-4 text-sm text-white/50">{p.date ?? '--'}</td>
                  <td className="px-5 py-4 text-sm text-white/50">{p.method ?? '--'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </HorseOwnerLayout>
  );
}
