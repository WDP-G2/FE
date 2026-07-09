import axiosClient from '@/api/axiosClient'
import { ENDPOINTS } from '@/api/endpoints'
import { unwrapResponse } from '@/api/response'
import { cachedRequest, invalidateCachedRequest } from '@/utils/requestCache'

const STATUS_LABELS = {
  PENDING: 'Chờ duyệt',
  APPROVED: 'Đã duyệt',
  REJECTED: 'Từ chối',
  SUSPENDED: 'Tạm khóa',
}

const STATUS_TONES = {
  PENDING: 'gold',
  APPROVED: 'green',
  REJECTED: 'red',
  SUSPENDED: 'gray',
}

export const HORSE_STATUS_VALUES = [
  { value: 'PENDING', label: STATUS_LABELS.PENDING },
  { value: 'APPROVED', label: STATUS_LABELS.APPROVED },
  { value: 'REJECTED', label: STATUS_LABELS.REJECTED },
  { value: 'SUSPENDED', label: STATUS_LABELS.SUSPENDED },
]

function appendIfPresent(formData, key, value) {
  if (value === undefined || value === null || value === '') return
  formData.append(key, value)
}

function horseFormData(horse) {
  const formData = new FormData()

  appendIfPresent(formData, 'name', horse.name?.trim())
  appendIfPresent(formData, 'breed', horse.breed?.trim())
  appendIfPresent(formData, 'age', horse.age)
  appendIfPresent(formData, 'gender', horse.gender?.trim())
  appendIfPresent(formData, 'color', horse.color?.trim())
  appendIfPresent(formData, 'heightCm', horse.height)
  appendIfPresent(formData, 'weightKg', horse.weight)
  appendIfPresent(formData, 'image', horse.imageFile)
  appendIfPresent(formData, 'document', horse.documentFile)

  return formData
}

export function mapHorse(horse) {
  const statusCode = horse?.status ?? horse?.approvalStatus ?? 'PENDING'

  return {
    id: String(horse?.id ?? ''),
    rawId: horse?.id,
    ownerId: horse?.ownerId == null ? '' : String(horse.ownerId),
    ownerUsername: horse?.ownerUsername ?? '',
    name: horse?.name ?? '',
    breed: horse?.breed ?? '',
    age: Number(horse?.age ?? 0),
    gender: horse?.gender ?? '',
    color: horse?.color ?? '',
    height: Number(horse?.heightCm ?? 0),
    weight: Number(horse?.weightKg ?? 0),
    imageUrl: horse?.imageUrl ?? '',
    documentUrl: horse?.documentUrl ?? '',
    reviewReason: horse?.reviewReason ?? '',
    statusCode,
    status: STATUS_LABELS[statusCode] ?? statusCode,
    health: STATUS_LABELS[statusCode] ?? statusCode,
    healthTone: STATUS_TONES[statusCode] ?? 'gray',
    wins: 0,
    races: 0,
    jockey: null,
    raw: horse,
  }
}

export const horseService = {
  async getOwnerHorses() {
    const data = await axiosClient.get(ENDPOINTS.horses.ownerList).then(unwrapResponse)
    return Array.isArray(data) ? data.map(mapHorse) : []
  },

  async createOwnerHorse(horse) {
    const data = await axiosClient
      .post(ENDPOINTS.horses.ownerList, horseFormData(horse), {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(unwrapResponse)
    return mapHorse(data)
  },

  async updateOwnerHorse(id, horse) {
    const data = await axiosClient
      .put(ENDPOINTS.horses.ownerById(id), horseFormData(horse), {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(unwrapResponse)
    return mapHorse(data)
  },

  async deleteOwnerHorse(id) {
    await axiosClient.delete(ENDPOINTS.horses.ownerById(id)).then(unwrapResponse)
  },

  async getAdminHorses(status) {
    const data = await axiosClient
      .get(ENDPOINTS.horses.adminList, { params: status ? { status } : undefined })
      .then(unwrapResponse)
    return Array.isArray(data) ? data.map(mapHorse) : []
  },

  async getAllAdminHorses() {
    return cachedRequest('admin:horses', async () => {
      const results = await Promise.all(
        HORSE_STATUS_VALUES.map((status) => this.getAdminHorses(status.value)),
      )
      return results.flat()
    })
  },

  async approveHorse(id) {
    const data = await axiosClient.put(ENDPOINTS.horses.adminApprove(id)).then(unwrapResponse)
    invalidateCachedRequest('admin:horses')
    return mapHorse(data)
  },

  async rejectHorse(id, reason) {
    const data = await axiosClient
      .put(ENDPOINTS.horses.adminReject(id), { reason })
      .then(unwrapResponse)
    invalidateCachedRequest('admin:horses')
    return mapHorse(data)
  },

  async suspendHorse(id, reason) {
    const data = await axiosClient
      .put(ENDPOINTS.horses.adminSuspend(id), { reason })
      .then(unwrapResponse)
    invalidateCachedRequest('admin:horses')
    return mapHorse(data)
  },

  async getOwnerResults() {
    return axiosClient.get(ENDPOINTS.horses.ownerResults).then(unwrapResponse)
  },

  async getOwnerDashboard() {
    return axiosClient.get(ENDPOINTS.horses.ownerDashboard).then(unwrapResponse)
  },
}
