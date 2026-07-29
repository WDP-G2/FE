import { useCallback, useEffect, useMemo, useState } from 'react'
import { Grid3x3, RefreshCcw } from 'lucide-react'
import Card from '@/components/ui/Card'
import { PanelHeader } from '@/components/ui/Panel'
import { raceParticipantService } from '@/services/raceParticipantService'
import { findHorseByGate, getAssignedGate } from '@/utils/refereeRaceUtils'
import { getApiErrorMessage } from '@/utils/apiError'

function buildGateMap(participants = []) {
  const map = {}
  participants.forEach((participant) => {
    map[String(participant.id)] = participant.gateNumber ?? null
  })
  return map
}

export default function RaceGates({ race, active = true }) {
  const [participants, setParticipants] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const gateMap = useMemo(() => buildGateMap(participants), [participants])
  const gateCount = participants.length

  const loadParticipants = useCallback(async () => {
    if (!race?.id || race.isNew) {
      setParticipants([])
      setError('')
      return
    }

    try {
      setLoading(true)
      setError('')
      const data = await raceParticipantService.getAdminRaceParticipants(race.id)
      setParticipants(data)
    } catch (requestError) {
      console.error('Không thể tải vị trí xuất phát', requestError?.response?.data || requestError)
      setParticipants([])
      setError(getApiErrorMessage(requestError) || 'Không thể tải vị trí xuất phát')
    } finally {
      setLoading(false)
    }
  }, [race?.id, race?.isNew])

  useEffect(() => {
    if (!active) return undefined
    loadParticipants()
    return undefined
  }, [active, loadParticipants])

  useEffect(() => {
    if (!active || !race?.id || race.isNew) return undefined

    const timer = window.setInterval(loadParticipants, 15000)
    return () => window.clearInterval(timer)
  }, [active, loadParticipants, race?.id, race?.isNew])

  if (race?.isNew) {
    return (
      <Card>
        <PanelHeader
          icon={Grid3x3}
          title="Vị trí xuất phát"
          subtitle="Phân làn các ngựa đã được duyệt"
        />
        <div className="p-8 text-center text-sm text-white/50">
          Lưu cuộc đua trước, sau đó trọng tài phân cổng xuất phát trên console trọng tài.
        </div>
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 px-6 py-5">
        <PanelHeader
          icon={Grid3x3}
          title="Vị trí xuất phát"
          subtitle="Đồng bộ từ trọng tài sau khi bốc số / lưu phân công cổng"
        />
        <button
          type="button"
          onClick={loadParticipants}
          disabled={loading}
          className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 text-xs font-semibold text-white/70 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Làm mới
        </button>
      </div>

      {error && (
        <div className="mx-6 mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {loading && participants.length === 0 ? (
        <div className="p-8 text-center text-sm text-white/50">Đang tải vị trí xuất phát...</div>
      ) : participants.length === 0 ? (
        <div className="p-8 text-center text-sm text-white/50">
          Chưa có ngựa được duyệt cho cuộc đua này.
        </div>
      ) : (
        <>
          <div className="border-b border-white/10 px-6 py-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-white/40">
              Sơ đồ cổng xuất phát
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {Array.from({ length: gateCount }, (_, index) => index + 1).map((gate) => {
                const participant = findHorseByGate(participants, gateMap, gate)
                return (
                  <div
                    key={`gate-${gate}`}
                    className="w-24 flex-shrink-0 rounded-xl border border-[#dda50e]/40 bg-gradient-to-b from-[#dda50e]/20 to-[#dda50e]/5 p-2.5 text-center"
                  >
                    <div className="mb-0.5 text-xs text-white/40">Cổng</div>
                    <div className="text-2xl font-bold text-[#dda50e]">{gate}</div>
                    {participant ? (
                      <>
                        <div className="mt-0.5 truncate text-[10px] font-semibold text-white">
                          {participant.horse}
                        </div>
                        <div className="truncate text-[9px] text-white/40">{participant.jockey}</div>
                      </>
                    ) : (
                      <div className="mt-1 text-[10px] text-white/30">Chưa gán</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          <div className="grid gap-4 p-6 md:grid-cols-2">
            {[...participants]
              .sort(
                (left, right) =>
                  getAssignedGate(left, gateMap) - getAssignedGate(right, gateMap),
              )
              .map((participant) => {
                const gate = getAssignedGate(participant, gateMap)
                return (
                  <div
                    key={participant.id}
                    className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#dda50e] text-xl font-bold">
                      {gate}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold">{participant.horse}</p>
                      <p className="truncate text-sm text-white/55">{participant.jockey}</p>
                      <p className="mt-1 text-xs text-white/40">Chủ ngựa: {participant.owner}</p>
                    </div>
                  </div>
                )
              })}
          </div>

          <div className="border-t border-white/10 px-6 py-3 text-xs text-white/40">
            Tự động làm mới mỗi 15 giây khi đang xem tab này. Trọng tài lưu phân công tại mục Vị trí xuất phát.
          </div>
        </>
      )}
    </Card>
  )
}
