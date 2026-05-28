import { useState } from 'react';
import { ClipboardList, Plus, X, CheckCircle } from 'lucide-react';
import { HorseOwnerLayout } from './HorseOwnerLayout';
import { GlassCard, Pill, PrimaryButton, GhostButton } from '../admin/AdminLayout';
import { registrations as initRegs, horses, jockeys, tournaments, fmt } from './data';
import { toast } from 'sonner';

const STATUS_STEPS = ['Pending', 'Deposited', 'Approved', 'Checked-in', 'Racing', 'Completed'];

function statusTone(s) {
  if (s === 'Approved') return 'green';
  if (s === 'Pending') return 'gold';
  if (s === 'Completed') return 'blue';
  if (s === 'Cancelled') return 'red';
  if (s === 'Racing') return 'purple';
  return 'gray';
}

export function HorseOwnerRegistrations() {
  const [regs, setRegs] = useState(initRegs);
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ tournament: '', horse: '', jockey: '' });
  const [filterStatus, setFilterStatus] = useState('Tất cả');
  const filtered = filterStatus === 'Tất cả' ? regs : regs.filter((r) => r.status === filterStatus);

  const handleCancel = (id) => {
    setRegs((prev) => prev.filter((r) => r.id !== id));
    toast.success('Đã hủy đăng ký');
  };

  const handleSubmit = () => {
    if (!form.tournament || !form.horse) { toast.error('Vui lòng điền đầy đủ thông tin'); return; }
    const t = tournaments.find((x) => x.id === form.tournament);
    const h = horses.find((x) => x.id === form.horse);
    const j = jockeys.find((x) => x.id === form.jockey);
    const newReg = {
      id: `r${Date.now()}`,
      tournament: t?.name ?? '',
      horse: h?.name ?? '',
      jockey: j?.name ?? null,
      raceNo: 'R?',
      raceTime: '--:--',
      raceDate: t?.startDate ?? '',
      entryFee: t?.entryFee ?? 0,
      status: 'Pending',
      statusTone: 'gold',
      checkedIn: false,
    };
    setRegs((prev) => [newReg, ...prev]);
    setShowModal(false);
    setStep(0);
    setForm({ tournament: '', horse: '', jockey: '' });
  };

  return (
    <HorseOwnerLayout title="Horse Owner · Đăng ký thi đấu" subtitle={`${regs.length} lượt đăng ký`} actions={<PrimaryButton icon={Plus} onClick={() => setShowModal(true)}>Đăng ký mới</PrimaryButton>}>
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {['Tất cả', 'Pending', 'Approved', 'Completed'].map((s) => (
          <button key={s} onClick={() => setFilterStatus(s)} className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all ${filterStatus === s ? 'bg-[#D4A017] text-white shadow-lg shadow-[#D4A017]/30' : 'bg-white/5 text-white/60 hover:bg-white/10 border border-white/10'}`}>{s}</button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((reg) => {
          const stepIdx = STATUS_STEPS.indexOf(reg.status);
          return (
            <GlassCard key={reg.id}>
              <div className="p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap"><Pill tone={statusTone(reg.status)}>{reg.status}</Pill></div>
                    <h3 className="font-bold text-white text-base">{reg.tournament}</h3>
                    <p className="text-xs text-white/50 mt-1">{reg.raceNo} · {reg.horse} · Jockey: {reg.jockey ?? 'Chưa chọn'}</p>
                  </div>
                  <div className="text-right shrink-0"><div className="text-sm font-bold text-[#D4A017]">{fmt(reg.entryFee)}</div></div>
                </div>
                <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-1">
                  {STATUS_STEPS.map((s, i) => (
                    <div key={s} className={`px-2 py-1 rounded-lg text-[10px] font-semibold ${i === stepIdx ? 'bg-[#D4A017]/20 text-[#D4A017]' : 'bg-white/5 text-white/30'}`}>{s}</div>
                  ))}
                </div>
                {(reg.status === 'Pending' || reg.status === 'Deposited') && (
                  <button onClick={() => handleCancel(reg.id)} className="px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 border border-red-500/20 rounded-xl transition-all font-semibold">Hủy đăng ký</button>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <GlassCard className="w-full max-w-lg">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div><h2 className="font-bold text-white">Đăng ký thi đấu</h2><p className="text-xs text-white/50">Bước {step + 1} / 3</p></div>
              <button onClick={() => { setShowModal(false); setStep(0); }} className="p-1.5 hover:bg-white/10 rounded-lg"><X className="w-4 h-4 text-white/60" /></button>
            </div>
            <div className="p-5 border-t border-white/10 flex items-center justify-between">
              <GhostButton onClick={() => step > 0 ? setStep(step - 1) : setShowModal(false)}>{step > 0 ? 'Quay lại' : 'Hủy'}</GhostButton>
              <PrimaryButton onClick={() => step < 2 ? setStep(step + 1) : handleSubmit()}>{step < 2 ? 'Tiếp theo' : 'Xác nhận đăng ký'}</PrimaryButton>
            </div>
          </GlassCard>
        </div>
      )}
    </HorseOwnerLayout>
  );
}
