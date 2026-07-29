import { CheckCircle2, Circle, Lock } from 'lucide-react'

const STEPS = [
  { key: 'pick', label: 'Mời & chọn trọng tài' },
  { key: 'assign', label: 'Gửi phân công' },
  { key: 'pay', label: 'Thanh toán lương' },
]

function stepState(key, { hasSelection, isAssigned, isRaceCompleted, isPaid, isLocked }) {
  if (key === 'pick') {
    if (isLocked) return 'done'
    return hasSelection ? 'done' : 'current'
  }
  if (key === 'assign') {
    if (isLocked || isPaid) return 'done'
    if (isAssigned) return 'done'
    return hasSelection ? 'current' : 'upcoming'
  }
  if (key === 'pay') {
    if (isPaid) return 'done'
    if (isAssigned && isRaceCompleted) return 'current'
    if (isAssigned) return 'upcoming'
    return 'upcoming'
  }
  return 'upcoming'
}

export default function JudgeWorkflowSteps({
  hasSelection,
  isAssigned,
  isRaceCompleted = false,
  isPaid,
  isLocked,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-white/45">Quy trình phân công</p>
        {isLocked ? (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/40 bg-emerald-500/15 px-3 py-1 text-[11px] font-semibold text-emerald-100">
            <Lock className="h-3.5 w-3.5" />
            Đã thanh toán — không thể thay đổi
          </span>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {STEPS.map((step, index) => {
          const state = stepState(step.key, {
            hasSelection,
            isAssigned,
            isRaceCompleted,
            isPaid,
            isLocked,
          })
          const isDone = state === 'done'
          const isCurrent = state === 'current'

          return (
            <div key={step.key} className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
                  isDone
                    ? 'border-emerald-300/50 bg-emerald-500/20 text-emerald-100'
                    : isCurrent
                      ? 'border-[#D4A017]/60 bg-[#D4A017]/20 text-[#fff4c2]'
                      : 'border-white/15 bg-white/5 text-white/35'
                }`}
              >
                {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-white/35">
                  Bước {index + 1}
                </p>
                <p
                  className={`text-sm font-semibold ${
                    isCurrent ? 'text-[#D4A017]' : isDone ? 'text-white' : 'text-white/45'
                  }`}
                >
                  {step.label}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
