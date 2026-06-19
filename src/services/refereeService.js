import axiosClient from '@/api/axiosClient'
import { ENDPOINTS } from '@/api/endpoints'
import { unwrapResponse } from '@/api/response'
import { mapUser } from '@/services/adminUserService'

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

  async assignRaceReferee(raceId, refereeId) {
    return axiosClient
      .put(ENDPOINTS.races.assignReferee(raceId), {
        refereeId: Number(refereeId),
      })
      .then(unwrapResponse)
  },

  async getAssignedRaces() {
    const data = await axiosClient.get(ENDPOINTS.referee.races).then(unwrapResponse)
    return Array.isArray(data) ? data : []
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
}
