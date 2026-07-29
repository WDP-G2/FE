import { Lock, Plus, UserCheck } from 'lucide-react'
import { GlassCard } from '@/pages/admin/AdminLayout'
import { refereeInitial } from '@/data/adminJudgeMock'

export default function AvailableRefereesPanel({
  referees = [],
  loading = false,
  error = '',
  assignedIds,
  locked = false,
  maxReached = false,
  onAdd,
}) {
  const available = referees.filter((referee) => !assignedIds.has(referee.id))
  const canAdd = !locked && !maxReached

  return (
    <GlassCard>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-5">
        <div className="flex items-center gap-3">
          <UserCheck className="h-5 w-5 text-[#D4A017]" />
          <div>
            <h3 className="font-bold text-white">Bước 1 · Chọn trọng tài</h3>
            <p className="text-xs text-white/50">
              {loading
                ? 'Đang tải trọng tài từ hệ thống...'
                : locked
                  ? 'Phân công đã khóa sau khi thanh toán'
                  : maxReached
                    ? 'Đã chọn trọng tài chính — gỡ để chọn người khác'
                    : `${available.length} trọng tài khả dụng`}
            </p>
          </div>
        </div>
      </div>

      {locked ? (
        <div className="mx-5 mt-5 flex items-start gap-3 rounded-2xl border border-emerald-300/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
          <Lock className="mt-0.5 h-4 w-4 shrink-0" />
          <p>Cuộc đua này đã thanh toán lương trọng tài. Không thể thêm hoặc thay trọng tài.</p>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-3 p-5 sm:grid-cols-2">
        {loading ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-xs text-white/40 sm:col-span-2">
            Đang tải danh sách trọng tài...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-400/25 bg-rose-400/[0.07] p-6 text-center text-xs text-rose-200 sm:col-span-2">
            {error}
          </div>
        ) : available.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-xs text-white/40 sm:col-span-2">
            {referees.length === 0
              ? 'Chưa có trọng tài hoạt động trong hệ thống.'
              : 'Tất cả trọng tài đã được phân công cho cuộc đua này.'}
          </div>
        ) : (
          available.map((referee) => (
            <div
              key={referee.id}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 font-bold text-white/70">
                {refereeInitial(referee.name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="truncate text-sm font-semibold text-white">{referee.name}</span>
                </div>
                <div className="truncate text-[10px] text-white/40">
                  {referee.experience > 0 ? `${referee.experience} năm` : 'Chưa có kinh nghiệm'} ·{' '}
                  {referee.specialty}
                </div>
              </div>
              <button
                type="button"
                onClick={() => onAdd(referee.id)}
                disabled={!canAdd}
                className={`shrink-0 rounded-lg p-2 transition-all ${
                  canAdd
                    ? 'text-emerald-300/80 hover:bg-emerald-500/10 hover:text-emerald-300'
                    : 'cursor-not-allowed text-white/20'
                }`}
                title={
                  locked
                    ? 'Đã thanh toán — không thể thêm'
                    : maxReached
                      ? 'Đã có trọng tài chính'
                      : 'Thêm vào tổ trọng tài'
                }
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </GlassCard>
  )
}
