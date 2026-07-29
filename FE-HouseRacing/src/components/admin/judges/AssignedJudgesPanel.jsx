import { CheckCircle2, Gavel, Lock, Send, Trash2 } from 'lucide-react'
import { GlassCard, Pill, PrimaryButton } from '@/pages/admin/AdminLayout'
import { judgeStatusTone, refereeInitial } from '@/data/adminJudgeMock'

export default function AssignedJudgesPanel({
  race,
  assignments,
  refereesById,
  saving = false,
  locked = false,
  isOfficiallyAssigned = false,
  onRemove,
  onSubmit,
}) {
  return (
    <GlassCard>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D4A017]/15">
            <Gavel className="h-5 w-5 text-[#D4A017]" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Bước 2 · Tổ trọng tài · {race.name}</h2>
            <p className="text-xs text-white/50">
              {assignments.length} trọng tài · {race.date} · {race.time}
              {isOfficiallyAssigned ? ' · Đã gửi phân công' : ''}
            </p>
          </div>
        </div>
        <Pill tone={judgeStatusTone(race.status)}>{race.status}</Pill>
      </div>

      {isOfficiallyAssigned && !locked ? (
        <div className="mx-5 mt-5 flex items-start gap-3 rounded-2xl border border-sky-300/25 bg-sky-500/10 px-4 py-3 text-sm text-sky-100">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Phân công đã gửi. Bạn có thể chuyển sang bước thanh toán lương bên dưới.</p>
        </div>
      ) : null}

      <div className="space-y-2 p-5">
        {assignments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-white/40">
            Chưa chọn trọng tài. Chọn một trọng tài từ danh sách phía trên.
          </div>
        ) : null}

        {assignments.map((assignment) => {
          const referee = refereesById.get(assignment.refereeId)
          if (!referee) return null

          return (
            <div
              key={assignment.refereeId}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 transition-all"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 font-bold text-white/70">
                {refereeInitial(referee.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-sm font-bold text-white">{referee.name}</span>
                </div>
                <div className="truncate text-[11px] text-white/50">
                  {referee.license}
                  {referee.experience > 0 ? ` · ${referee.experience} năm KN` : ''}
                  {referee.specialty ? ` · ${referee.specialty}` : ''}
                </div>
              </div>
              {!locked ? (
                <button
                  type="button"
                  onClick={() => onRemove(assignment.refereeId)}
                  className="shrink-0 rounded-lg p-2 text-white/50 transition-all hover:bg-red-500/10 hover:text-red-300"
                  title="Gỡ khỏi tổ trọng tài"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-semibold text-emerald-200/80">
                  <Lock className="h-3.5 w-3.5" />
                  Đã khóa
                </span>
              )}
            </div>
          )
        })}
      </div>

      {assignments.length > 0 && !locked ? (
        <div className="flex justify-end p-5 pt-0">
          <PrimaryButton icon={Send} disabled={saving} onClick={onSubmit}>
            {saving ? 'Đang gửi...' : 'Gửi quyết định phân công'}
          </PrimaryButton>
        </div>
      ) : null}
    </GlassCard>
  )
}
