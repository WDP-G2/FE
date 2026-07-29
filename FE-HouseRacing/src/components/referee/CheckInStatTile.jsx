import { GlassCard } from '@/pages/admin/AdminLayout';

const TONE_MAP = {
  green: 'from-emerald-500/25 to-emerald-500/5 text-emerald-300',
  gold: 'from-[#D4A017]/25 to-[#D4A017]/5 text-[#D4A017]',
  gray: 'from-white/15 to-white/5 text-white/60',
  purple: 'from-purple-500/25 to-purple-500/5 text-purple-300',
  blue: 'from-sky-500/25 to-sky-500/5 text-sky-300',
  red: 'from-red-500/25 to-red-500/5 text-red-300',
};

export default function CheckInStatTile({ label, value, tone = 'gold', icon: Icon }) {
  return (
    <GlassCard className="p-4">
      <div className="mb-2">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-gradient-to-br ${TONE_MAP[tone] ?? TONE_MAP.gold}`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="mt-0.5 text-[11px] text-white/50">{label}</div>
    </GlassCard>
  );
}
