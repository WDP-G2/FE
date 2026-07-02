import axiosClient from '@/api/axiosClient'
import { ENDPOINTS } from '@/api/endpoints'
import { unwrapResponse } from '@/api/response'
import { mapUser } from '@/services/adminUserService'
import {
  readRefereeFeeSettings,
  DEFAULT_REFEREE_PER_RACE_FEE,
} from '@/services/refereeFeeSettingsService'
import {
  buildTournamentNameMap,
  buildTournamentStatusMap,
  summarizeParticipantCheckIn,
  mapRaceFromApi,
  isRefereeRaceHistory,
  pickWinnerFromRaceResults,
  sumRacePrizeAmount,
} from '@/utils/refereeRaceUtils'
import { fmtVND } from '@/utils/formatCurrency'

function mapReferee(user, profile) {
  const experienceYears = Number(profile?.experienceYears ?? 0)

  return {
    id: String(user.rawId ?? user.id),
    name: user.name,
    license: profile?.licenseNumber?.trim() || 'Chưa có giấy phép',
    experience: Number.isFinite(experienceYears) ? experienceYears : 0,
    specialty: profile?.specialty?.trim() || user.location?.trim() || 'Chưa cập nhật',
    email: user.email,
    phone: user.phone,
    active: user.active,
  }
}

export const refereeService = {
  async getAvailableReferees() {
    try {
      const [usersResponse, applicationsResponse] = await Promise.all([
        axiosClient.get(ENDPOINTS.admin.activeUsers).then(unwrapResponse),
        axiosClient
          .get(ENDPOINTS.admin.roleApplications, {
            params: { role: 'REFEREE', status: 'APPROVED' },
          })
          .then(unwrapResponse)
          .catch(() => []),
      ])

      const profileByUserId = new Map()
      for (const application of Array.isArray(applicationsResponse) ? applicationsResponse : []) {
        if (application?.userId != null) {
          profileByUserId.set(String(application.userId), application)
        }
      }

      return (Array.isArray(usersResponse) ? usersResponse : [])
        .map(mapUser)
        .filter((user) => user.roleCode === 'REFEREE' && user.active)
        .map((user) => mapReferee(user, profileByUserId.get(String(user.rawId ?? user.id))))
        .sort((first, second) => first.name.localeCompare(second.name, 'vi'))
    } catch {
      return []
    }
  },

  async getSalaryConfigs() {
    const data = await axiosClient.get(ENDPOINTS.refereeSalaryConfigs.list).then(unwrapResponse)
    return Array.isArray(data) ? data : []
  },

  async ensureSalaryConfigId() {
    const configs = await this.getSalaryConfigs()
    const existing = configs.find((config) => config?.active) ?? configs[0]
    if (existing?.id != null) return existing.id

    let amount = DEFAULT_REFEREE_PER_RACE_FEE
    const fee = Number(readRefereeFeeSettings()?.perRaceFee)
    if (Number.isFinite(fee) && fee > 0) amount = fee

    const created = await axiosClient
      .post(ENDPOINTS.refereeSalaryConfigs.list, {
        name: 'Lương trọng tài mặc định',
        raceType: 'Chung',
        amount,
        active: true,
      })
      .then(unwrapResponse)
    return created?.id
  },

  async assignRaceReferee(raceId, refereeId, salaryConfigId) {
    let configId = salaryConfigId
    if (configId == null) {
      configId = await this.ensureSalaryConfigId()
    }
    return axiosClient
      .put(ENDPOINTS.races.assignReferee(raceId), {
        refereeId,
        salaryConfigId: configId,
      })
      .then(unwrapResponse)
  },

  async getAssignedRaces() {
    const data = await axiosClient.get(ENDPOINTS.referee.races).then(unwrapResponse)
    return Array.isArray(data) ? data : []
  },

  async enrichRacesCheckIn(races) {
    const list = Array.isArray(races) ? races : []
    return Promise.all(
      list.map(async (race) => {
        if (!race?.id) return race
        try {
          const participants = await this.getRaceParticipants(race.id)
          const stats = summarizeParticipantCheckIn(participants)
          const participantCount = stats.total || Number(race.participantCount ?? 0)
          return {
            ...race,
            participantCount,
            totalHorses: participantCount,
            checkedInCount: stats.presentCount,
            checkedInDisplay: stats.presentCount,
            pendingCheckInCount: stats.pendingCount,
            absentCount: stats.absentCount,
          }
        } catch {
          return {
            ...race,
            pendingCheckInCount: 0,
            absentCount: 0,
          }
        }
      }),
    )
  },

  /** Tổng có mặt / chờ / vắng trên mọi race & giải được phân công */
  async getCheckInStatsAcrossAllRaces() {
    const races = await this.getAssignedRaces()
    if (!races.length) {
      return { present: 0, pending: 0, absent: 0 }
    }

    const participantLists = await Promise.all(
      races.map((race) => this.getRaceParticipants(race.id).catch(() => [])),
    )

    return participantLists.reduce(
      (totals, participants) => {
        const stats = summarizeParticipantCheckIn(participants)
        return {
          present: totals.present + stats.presentCount,
          pending: totals.pending + stats.pendingCount,
          absent: totals.absent + stats.absentCount,
        }
      },
      { present: 0, pending: 0, absent: 0 },
    )
  },

  async loadAssignedRacesMapped() {
    const list = await this.getAssignedRaces()
    const tournamentIds = list.map((race) => race.tournamentId)

    let nameById = new Map()
    let statusById = new Map()
    try {
      ;[nameById, statusById] = await Promise.all([
        buildTournamentNameMap(tournamentIds),
        buildTournamentStatusMap(tournamentIds),
      ])
    } catch {
      // ignore
    }

    return list.map((raw, index) =>
      mapRaceFromApi(
        {
          ...raw,
          tournamentName: raw.tournamentName || nameById.get(String(raw.tournamentId)),
          tournamentStatus: statusById.get(String(raw.tournamentId)) ?? '',
        },
        index,
      ),
    )
  },

  async loadAssignedRacesEnriched() {
    const mapped = await this.loadAssignedRacesMapped()
    return this.enrichRacesCheckIn(mapped)
  },

  async getPayments() {
    const data = await axiosClient.get(ENDPOINTS.referee.payments).then(unwrapResponse)
    return Array.isArray(data) ? data : []
  },

  async getAdminRacePayment(raceId) {
    return axiosClient.get(ENDPOINTS.races.refereePayment(raceId)).then(unwrapResponse)
  },

  async getDashboard() {
    return axiosClient.get(ENDPOINTS.referee.dashboard).then(unwrapResponse)
  },

  async getCheckedInCount() {
    const data = await axiosClient.get(ENDPOINTS.referee.checkedInCount).then(unwrapResponse)
    return Number(data?.count ?? 0)
  },

  async getPendingCheckInCount() {
    const data = await axiosClient.get(ENDPOINTS.referee.pendingCheckInCount).then(unwrapResponse)
    return Number(data?.count ?? 0)
  },

  async getAssignedRaceById(raceId) {
    const races = await this.getAssignedRaces()
    return races.find((race) => String(race?.id) === String(raceId)) ?? null
  },

  async getRaceParticipants(raceId) {
    const data = await axiosClient
      .get(ENDPOINTS.referee.participants(raceId))
      .then(unwrapResponse)
    return Array.isArray(data) ? data : []
  },

  async updateParticipantGate(raceId, participantId, gateNumber) {
    return axiosClient
      .put(ENDPOINTS.referee.updateGate(raceId, participantId), { gateNumber })
      .then(unwrapResponse)
  },

  async saveParticipantGates(raceId, assignments) {
    const list = Array.isArray(assignments) ? assignments : []
    if (!list.length) return []

    // Giai đoạn 1: chuyển sang cổng tạm để tránh trùng khi hoán đổi (BE kiểm tra unique từng request)
    const TEMP_BASE = 10000
    for (let index = 0; index < list.length; index += 1) {
      await this.updateParticipantGate(raceId, list[index].participantId, TEMP_BASE + index)
    }

    // Giai đoạn 2: gán cổng thật
    const results = []
    for (const item of list) {
      const result = await this.updateParticipantGate(raceId, item.participantId, item.gateNumber)
      results.push(result)
    }
    return results
  },

  async checkInParticipant(raceId, participantId, { status, note }) {
    return axiosClient
      .put(ENDPOINTS.referee.checkIn(raceId, participantId), { status, note })
      .then(unwrapResponse)
  },

  async startRace(raceId) {
    return axiosClient.put(ENDPOINTS.referee.startRace(raceId)).then(unwrapResponse)
  },

  async finalizeRaceResults(raceId, results) {
    return axiosClient
      .post(ENDPOINTS.referee.finalizeResults(raceId), { results })
      .then(unwrapResponse)
  },

  async getRaceResults(raceId) {
    const data = await axiosClient.get(ENDPOINTS.races.results(raceId)).then(unwrapResponse)
    return Array.isArray(data) ? data : []
  },

  async loadRefereeHistoryRaces() {
    const mapped = await this.loadAssignedRacesMapped()
    const history = mapped.filter((race) => isRefereeRaceHistory(race))
    const enriched = await this.enrichRacesCheckIn(history)

    const withResults = await Promise.all(
      enriched.map(async (race) => {
        if (!race?.id) return race
        try {
          const results = await this.getRaceResults(race.id)
          const prizeTotal = sumRacePrizeAmount(results)
          return {
            ...race,
            winnerDisplay: pickWinnerFromRaceResults(results),
            prizeDisplay: prizeTotal > 0 ? fmtVND(prizeTotal) : '—',
            resultsCount: results.length,
          }
        } catch {
          return race
        }
      }),
    )

    return withResults.sort((first, second) => {
      const left = new Date(first.resultFinalizedAt || first.scheduledStartAt || 0).getTime()
      const right = new Date(second.resultFinalizedAt || second.scheduledStartAt || 0).getTime()
      return right - left
    })
  },
}
