import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, CheckCircle2, Crown, Flag, Play, RefreshCw, Sparkles, Trophy, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { raceSimulationService } from '@/services/raceSimulationService'
import { getApiErrorMessage } from '@/utils/apiError'

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value))

function formatTime(milliseconds) {
  const total = Math.max(0, Number(milliseconds) || 0)
  const minutes = Math.floor(total / 60000)
  const seconds = Math.floor((total % 60000) / 1000)
  const centiseconds = Math.floor((total % 1000) / 10)
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}:${String(centiseconds).padStart(2, '0')}`
}
function progressAt(checkpoints, elapsed) {
  const points = checkpoints?.length ? checkpoints : [{ at: 0, progress: 0 }, { at: 1, progress: 1 }]
  if (elapsed <= points[0].at) return points[0].progress
  for (let index = 1; index < points.length; index += 1) {
    const next = points[index]
    const previous = points[index - 1]
    if (elapsed <= next.at) {
      const span = Math.max(0.0001, next.at - previous.at)
      const ratio = (elapsed - previous.at) / span
      return clamp(previous.progress + (next.progress - previous.progress) * ratio)
    }
  }
  return 1
}

export function RaceSimulationTrack({ raceId, canOperate = false, onConfirmed, onStateChange }) {
  const [simulation, setSimulation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [now, setNow] = useState(0)
  const [clockOffset, setClockOffset] = useState(0)

  const load = useCallback(async ({ silent = false } = {}) => {
    if (!raceId) return
    if (!silent) setLoading(true)
    try {
      const data = await raceSimulationService.get(raceId)
      setSimulation(data)
      if (data?.serverTime) setClockOffset(new Date(data.serverTime).getTime() - Date.now())
      setNow(Date.now())
      onStateChange?.(data?.status || null)
    } catch (error) {
      if (!silent) toast.error(getApiErrorMessage(error) || 'Không tải được mô phỏng')
    } finally {
      if (!silent) setLoading(false)
    }
  }, [onStateChange, raceId])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load()
  }, [load])

  useEffect(() => {
    if (!simulation || simulation.status === 'CONFIRMED') return undefined
    const timer = window.setInterval(() => setNow(Date.now()), 100)
    const poll = window.setInterval(() => load({ silent: true }), 2000)
    return () => {
      window.clearInterval(timer)
      window.clearInterval(poll)
    }
  }, [load, simulation])

  const elapsed = useMemo(() => {
    if (!simulation?.generatedAt) return 0
    const serverNow = now + clockOffset
    return clamp((serverNow - new Date(simulation.generatedAt).getTime()) / simulation.playbackDurationMs)
  }, [clockOffset, now, simulation])
  const finished = simulation && (elapsed >= 1 || simulation.status === 'CONFIRMED')

  const liveOrder = useMemo(() => {
    if (!simulation) return []
    return simulation.participants
      .map((participant) => ({ ...participant, progress: progressAt(participant.checkpoints, elapsed) }))
      .sort((a, b) => b.progress - a.progress || a.rank - b.rank)
  }, [elapsed, simulation])

  const generate = async () => {
    if (!window.confirm('Mỗi cuộc đua chỉ được mô phỏng một lần và không thể chạy lại. Tiếp tục?')) return
    setGenerating(true)
    try {
      const data = await raceSimulationService.generate(raceId)
      setSimulation(data)
      onStateChange?.(data?.status || null)
      toast.success('Đã bắt đầu mô phỏng cuộc đua')
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Không tạo được mô phỏng')
      await load({ silent: true })
    } finally {
      setGenerating(false)
    }
  }

  const confirm = async () => {
    setConfirming(true)
    try {
      await raceSimulationService.confirm(raceId, simulation.runId)
      toast.success('Đã xác nhận kết quả mô phỏng')
      await load({ silent: true })
      await onConfirmed?.()
    } catch (error) {
      toast.error(getApiErrorMessage(error) || 'Không xác nhận được kết quả')
    } finally {
      setConfirming(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center rounded-2xl border border-white/5 bg-white/[0.02] p-8 text-sm text-white/45 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-4 w-4 animate-spin text-[#D4A017]" />
          <span>Đang tải mô phỏng cuộc đua...</span>
        </div>
      </div>
    )
  }

  if (!simulation) {
    if (!canOperate) return null
    return (
      <div className="relative overflow-hidden rounded-2xl border border-[#D4A017]/20 bg-gradient-to-br from-[#0c2217] via-[#05110a] to-[#030a06] p-6 shadow-xl">
        <div className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 h-36 w-36 rounded-full bg-[#D4A017]/5 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 text-base font-black text-white">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D4A017]/10 text-[#D4A017] border border-[#D4A017]/20">
                <Sparkles className="h-5 w-5" />
              </div>
              Mô phỏng cuộc đua
            </div>
            <p className="max-w-xl text-xs leading-relaxed text-white/55">
              Hệ thống sẽ mô phỏng diễn biến cuộc đua dựa trên thuật toán tích hợp các yếu tố hiệu năng lịch sử và chỉ số may mắn.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1 rounded bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-white/70 border border-white/5">
                <Crown className="h-2.5 w-2.5 text-[#D4A017]" /> 25% Lịch sử Ngựa
              </span>
              <span className="inline-flex items-center gap-1 rounded bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-white/70 border border-white/5">
                <Activity className="h-2.5 w-2.5 text-emerald-400" /> 25% Lịch sử Jockey
              </span>
              <span className="inline-flex items-center gap-1 rounded bg-white/5 px-2 py-0.5 text-[10px] font-semibold text-white/70 border border-white/5">
                <Zap className="h-2.5 w-2.5 text-amber-500" /> 50% May mắn
              </span>
            </div>
          </div>

          <button
            onClick={generate}
            disabled={generating}
            className="group shrink-0 inline-flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-amber-400 via-[#D4A017] to-amber-600 px-5 py-3.5 text-sm font-black text-black shadow-lg shadow-amber-500/10 hover:shadow-amber-500/25 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
          >
            {generating ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4 fill-current transition-transform group-hover:scale-110" />
            )}
            {generating ? 'Đang tạo mô phỏng...' : 'Bắt đầu mô phỏng cuộc đua'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-white/5 bg-[#040c09] shadow-2xl backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 bg-gradient-to-r from-emerald-950/40 via-emerald-950/20 to-transparent px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Activity className="h-5 w-5 text-[#D4A017] animate-pulse" />
            {!finished && simulation.status !== 'CONFIRMED' && (
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 text-base font-black tracking-tight text-white">
              Đường đua mô phỏng trực tiếp
            </div>

          </div>
        </div>
        <div className={`rounded-full border px-3 py-1 text-xs font-black tracking-wide shadow-sm transition-all ${simulation.status === 'CONFIRMED'
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]'
            : simulation.status === 'CONFIRMING'
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
              : finished
                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                : 'bg-[#D4A017]/10 text-[#D4A017] border-[#D4A017]/20'
          }`}>
          {simulation.status === 'CONFIRMED'
            ? '✓ ĐÃ XÁC NHẬN'
            : simulation.status === 'CONFIRMING'
              ? 'ĐANG XÁC NHẬN...'
              : finished
                ? 'ĐÃ VỀ ĐÍCH'
                : `ĐANG MÔ PHỎNG: ${Math.round(elapsed * 100)}%`}
        </div>
      </div>

      <div className="space-y-3 p-4 sm:p-5 bg-gradient-to-b from-transparent to-black/30">
        {[...simulation.participants].sort((a, b) => a.gateNumber - b.gateNumber).map((participant) => {
          const progress = progressAt(participant.checkpoints, elapsed)
          const liveRank = liveOrder.findIndex((item) => item.participantId === participant.participantId) + 1
          const currentRank = finished ? participant.rank : liveRank

          let rankBadgeClass = "bg-white/5 text-white/50 border-white/10"
          let horseBg = "from-emerald-600 to-emerald-800 border-emerald-400/50 shadow-emerald-500/30"
          let trailColor = "via-emerald-500/5 to-emerald-500/20"
          let laneBorder = "border-white/5"

          if (currentRank === 1) {
            rankBadgeClass = "bg-gradient-to-r from-amber-400 to-amber-600 text-black font-extrabold shadow-[0_0_8px_rgba(245,158,11,0.4)] border-amber-300"
            horseBg = "from-amber-400 via-yellow-500 to-amber-600 border-yellow-300 shadow-amber-500/40"
            trailColor = "via-amber-500/10 to-amber-500/30"
            if (finished) {
              laneBorder = "border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.05)] bg-[#0c160f]"
            }
          } else if (currentRank === 2) {
            rankBadgeClass = "bg-gradient-to-r from-slate-300 to-slate-500 text-black font-extrabold shadow-[0_0_8px_rgba(148,163,184,0.3)] border-slate-200"
            horseBg = "from-slate-300 via-slate-400 to-slate-500 border-slate-200 shadow-slate-400/30"
            trailColor = "via-slate-400/5 to-slate-400/25"
          } else if (currentRank === 3) {
            rankBadgeClass = "bg-gradient-to-r from-amber-700 to-amber-900 text-white font-extrabold shadow-[0_0_8px_rgba(180,83,9,0.3)] border-amber-600"
            horseBg = "from-amber-700 via-amber-800 to-amber-900 border-amber-600 shadow-amber-700/30"
            trailColor = "via-amber-800/5 to-amber-800/25"
          }

          return (
            <div key={participant.participantId} className="grid grid-cols-[68px_1fr] items-center gap-3">
              <div className="flex flex-col items-center justify-center gap-1 flex-shrink-0">
                <div className={`flex h-6 w-11 items-center justify-center rounded-md text-[10px] font-black border ${rankBadgeClass}`}>
                  #{currentRank}
                </div>
                <div className="truncate text-[9px] font-bold uppercase tracking-wider text-white/40">
                  Cổng {participant.gateNumber}
                </div>
              </div>
              <div className={`relative h-16 overflow-hidden rounded-xl border bg-gradient-to-r from-emerald-950/40 via-[#071810]/50 to-emerald-950/40 transition-all duration-300 ${laneBorder}`}>
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent 0, transparent 9%, rgba(255,255,255,.1) 10%)' }} />

                {/* Distance markers */}
                <div className="absolute left-1/4 top-0 bottom-0 w-px border-l border-dashed border-white/10 pointer-events-none flex items-end pb-1 pl-1">
                  <span className="text-[8px] font-mono text-white/20 select-none font-semibold">25%</span>
                </div>
                <div className="absolute left-2/4 top-0 bottom-0 w-px border-l border-dashed border-white/10 pointer-events-none flex items-end pb-1 pl-1">
                  <span className="text-[8px] font-mono text-white/20 select-none font-semibold">50%</span>
                </div>
                <div className="absolute left-3/4 top-0 bottom-0 w-px border-l border-dashed border-white/10 pointer-events-none flex items-end pb-1 pl-1">
                  <span className="text-[8px] font-mono text-white/20 select-none font-semibold">75%</span>
                </div>

                {/* Track highlight trail */}
                <div
                  className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-emerald-500/5 to-emerald-500/15 pointer-events-none transition-all duration-100"
                  style={{ width: `${progress * 100}%` }}
                />

                {/* Checkered Finish Gate */}
                <div
                  className="absolute right-0 top-0 bottom-0 w-5 pointer-events-none"
                  style={{
                    backgroundImage: 'repeating-conic-gradient(#091711 0% 25%, #10b981 0% 50%)',
                    backgroundSize: '4px 8px',
                    opacity: 0.3
                  }}
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-35">
                  <Flag className="h-4 w-4 text-emerald-400" />
                </div>

                <motion.div
                  className="absolute left-1 top-1/2 z-10 -translate-y-1/2"
                  animate={{ left: `calc(${Math.min(progress * 91, 91)}% + 4px)` }}
                  transition={{ duration: 0.12, ease: 'linear' }}
                >
                  <div className="relative">
                    <div className={`absolute right-full top-1/2 -translate-y-1/2 h-8 w-20 bg-gradient-to-r from-transparent ${trailColor} rounded-l-full blur-[3px] pointer-events-none`} />
                    <div className={`relative flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-b ${horseBg} shadow-lg border border-white/20 transition-transform duration-100`}>
                      <span
                        className="text-xl leading-none select-none drop-shadow-md inline-block"
                        style={{ transform: 'scaleX(-1)' }}
                      >
                        🏇
                      </span>
                      <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-black/85 text-[8px] font-black text-[#D4A017] border border-white/10 shadow-sm font-mono">
                        {participant.gateNumber}
                      </span>
                    </div>
                  </div>
                </motion.div>

                <div className="absolute top-1.5 left-3 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2 py-0.5 rounded border border-white/5 pointer-events-none">
                  <span className={`inline-block w-1.5 h-1.5 rounded-full ${currentRank === 1 ? 'bg-amber-400 animate-ping' : 'bg-emerald-500'
                    }`} />
                  <span className="text-[10px] font-black text-white leading-none tracking-wide">{participant.horseName}</span>
                  <span className="text-[8px] text-white/40 leading-none">· {participant.jockeyName}</span>
                  <span className="ml-1 text-[8px] font-mono text-emerald-400/90 font-bold bg-emerald-950/60 px-1 rounded border border-emerald-500/10">
                    {(participant.initialWinProbability * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {finished && (
        <div className="border-t border-white/5 bg-black/35 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 font-black text-white">
              <Trophy className="h-5 w-5 text-amber-500 animate-bounce" />
              <span>Bảng xếp hạng mô phỏng</span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-white/35 font-mono">Chung cuộc</span>
          </div>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[...simulation.participants].sort((a, b) => a.rank - b.rank).slice(0, 3).map((participant) => {
              const is1st = participant.rank === 1
              const is2nd = participant.rank === 2
              const is3rd = participant.rank === 3

              let cardTheme = "bg-white/[0.02] border-white/5"
              let rankGlow = ""
              let rankBadge = "bg-white/10 text-white/60"
              let rankName = "Hạng"
              let iconElement = null

              if (is1st) {
                cardTheme = "bg-gradient-to-br from-amber-500/10 via-yellow-600/5 to-transparent border-amber-500/30"
                rankGlow = "shadow-[0_0_15px_rgba(245,158,11,0.08)]"
                rankBadge = "bg-amber-500 text-black font-extrabold"
                rankName = "Vô Địch"
                iconElement = <Crown className="h-4 w-4 text-amber-400 absolute right-3 top-3 animate-pulse" />
              } else if (is2nd) {
                cardTheme = "bg-gradient-to-br from-slate-400/5 to-transparent border-slate-500/20"
                rankBadge = "bg-slate-400 text-black font-extrabold"
                rankName = "Hạng 2"
              } else if (is3rd) {
                cardTheme = "bg-gradient-to-br from-amber-900/5 to-transparent border-amber-950/20"
                rankBadge = "bg-amber-800 text-white font-extrabold"
                rankName = "Hạng 3"
              }

              return (
                <div key={participant.participantId} className={`relative overflow-hidden rounded-xl border p-4 transition-all duration-300 hover:-translate-y-0.5 ${cardTheme} ${rankGlow}`}>
                  <div className="absolute right-2 -bottom-4 text-7xl font-black text-white/[0.02] select-none font-mono">
                    {participant.rank}
                  </div>

                  {iconElement}

                  <div className="flex items-center gap-2">
                    <div className={`rounded px-1.5 py-0.5 text-[9px] uppercase tracking-wider ${rankBadge}`}>
                      {rankName}
                    </div>
                    <span className="text-[10px] font-mono text-white/35">Cổng {participant.gateNumber}</span>
                  </div>

                  <div className="mt-2 text-base font-black text-white tracking-tight truncate">
                    {participant.horseName}
                  </div>
                  <div className="text-[11px] text-white/50 truncate">
                    Jockey: {participant.jockeyName}
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2">
                    <div className="flex flex-col">
                      <span className="text-[8px] uppercase tracking-wider text-white/35">Thời gian</span>
                      <span className="text-xs font-mono font-bold text-emerald-400">{formatTime(participant.finishTimeMillis)}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] uppercase tracking-wider text-white/35">Tỷ lệ thắng ban đầu</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-mono font-bold text-white/80">{(participant.initialWinProbability * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${is1st ? 'bg-amber-500' : is2nd ? 'bg-slate-400' : 'bg-amber-800'
                        }`}
                      style={{ width: `${participant.initialWinProbability * 100}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {canOperate && simulation.status === 'GENERATED' && (
            <div className="mt-5 flex justify-end">
              <button
                onClick={confirm}
                disabled={confirming}
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 text-sm font-black text-black shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
              >
                {confirming ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 transition-transform group-hover:scale-110" />
                )}
                {confirming ? 'Đang xác nhận...' : 'Xác nhận kết quả mô phỏng'}
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
