import AdminLayout from '@/components/admin/AdminLayout'

export default AdminLayout

export function GlassCard({ children, className = '' }) {
  return (
    <div className={`bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl shadow-black/20 ${className}`}>
      {children}
    </div>
  )
}

export function StatCard({ label, value, delta, icon: Icon, tone = 'gold' }) {
  const toneBg = {
    gold: 'from-[#D4A017]/25 to-[#D4A017]/5 text-[#D4A017]',
    green: 'from-emerald-500/25 to-emerald-500/5 text-emerald-300',
    blue: 'from-sky-500/25 to-sky-500/5 text-sky-300',
    purple: 'from-purple-500/25 to-purple-500/5 text-purple-300',
  }

  return (
    <GlassCard className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${toneBg[tone]} flex items-center justify-center border border-white/10`}>
          <Icon className="w-5 h-5" />
        </div>
        {delta && <span className="text-[11px] text-emerald-300 font-bold bg-emerald-500/10 px-2 py-1 rounded-lg">{delta}</span>}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-white/50 mt-1">{label}</div>
    </GlassCard>
  )
}

export function Pill({ children, tone = 'gold' }) {
  const tones = {
    gold: 'bg-[#D4A017]/15 text-[#D4A017] border-[#D4A017]/30',
    green: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    red: 'bg-red-500/15 text-red-300 border-red-500/30',
    blue: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
    purple: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
    gray: 'bg-white/10 text-white/60 border-white/10',
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold border rounded-full whitespace-nowrap ${tones[tone]}`}>
      {children}
    </span>
  )
}

export function PrimaryButton({ children, onClick, className = '', icon: Icon, disabled, type }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`px-5 py-2.5 bg-[#D4A017] hover:bg-[#B8941F] text-white rounded-xl font-semibold text-sm transition-all shadow-lg shadow-[#D4A017]/30 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none ${className}`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span>{children}</span>
    </button>
  )
}

export function GhostButton({ children, onClick, className = '', icon: Icon, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed ${className}`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span>{children}</span>
    </button>
  )
}

export function TextInput({ className = '', ...rest }) {
  return (
    <input
      {...rest}
      className={`w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:border-[#D4A017] focus:ring-2 focus:ring-[#D4A017]/20 ${className}`}
    />
  )
}
