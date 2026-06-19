import axiosClient from '@/api/axiosClient'
import { ENDPOINTS } from '@/api/endpoints'
import { unwrapResponse } from '@/api/response'

const DEFAULT_TOURNAMENT_RULES_KEY = 'admin:default-tournament-rules'
export const EXTRA_FEES_STORAGE_KEY = 'admin:extra-system-fees'

export const DEFAULT_TOURNAMENT_RULES = `1. Ngựa phải có giấy chứng nhận sức khỏe hợp lệ.
2. Jockey phải có chứng chỉ FIA.
3. Kiểm tra doping bắt buộc.`

function mapDistance(option) {
  const meters = Number(option?.meters ?? 0)
  return {
    meters,
    label: option?.label || (meters > 0 ? `${meters}m` : ''),
    value: option?.label || (meters > 0 ? `${meters}m` : ''),
  }
}

function readStoredDefaultRules() {
  try {
    const stored = localStorage.getItem(DEFAULT_TOURNAMENT_RULES_KEY)
    return stored == null ? null : stored
  } catch {
    return null
  }
}

function writeStoredDefaultRules(rules) {
  localStorage.setItem(DEFAULT_TOURNAMENT_RULES_KEY, rules)
}

function resolveDefaultRules(apiRules) {
  const storedRules = readStoredDefaultRules()
  if (storedRules != null) return storedRules
  if (typeof apiRules === 'string' && apiRules.trim()) return apiRules
  return DEFAULT_TOURNAMENT_RULES
}

function mapSettings(settings) {
  const defaultTournamentRules = resolveDefaultRules(settings?.defaultTournamentRules)

  return {
    data: {
      ...settings,
      defaultTournamentRules,
      raceDistances: (Array.isArray(settings?.raceDistances) ? settings.raceDistances : [])
        .map(mapDistance)
        .filter((item) => item.meters > 0),
    },
    raw: settings,
  }
}

export function readExtraFeeGroups() {
  try {
    const stored = localStorage.getItem(EXTRA_FEES_STORAGE_KEY)
    if (!stored) return []
    const parsed = JSON.parse(stored)
    if (!Array.isArray(parsed)) return []

    return parsed
      .map((group) => ({
        id: group?.id || `fee-${Math.random().toString(36).slice(2, 9)}`,
        registrationFee: String(group?.registrationFee ?? group?.amount ?? ''),
        lateFee: String(group?.lateFee ?? ''),
      }))
      .filter((group) => group.id)
  } catch {
    return []
  }
}

export function writeExtraFeeGroups(groups) {
  localStorage.setItem(EXTRA_FEES_STORAGE_KEY, JSON.stringify(groups))
}

function formatFeeAmount(amount) {
  return Number(amount || 0).toLocaleString('vi-VN')
}

export function buildRegistrationFeeOptions(settings = {}) {
  const options = []
  const defaultRegistrationFee = Number(settings.defaultRegistrationFee ?? 0)
  const defaultLateFee = Number(settings.lateCheckInFee ?? 0)

  options.push({
    id: 'default',
    label: `Lệ phí mặc định · ${formatFeeAmount(defaultRegistrationFee)} VND`,
    registrationFee: defaultRegistrationFee,
    lateFee: defaultLateFee,
  })

  readExtraFeeGroups().forEach((group, index) => {
    const registrationFee = Number(group.registrationFee)
    const lateFee = Number(group.lateFee)

    if (!Number.isFinite(registrationFee) || registrationFee < 0) return

    options.push({
      id: group.id,
      label: `Lệ phí bổ sung ${index + 1} · ${formatFeeAmount(registrationFee)} VND`,
      registrationFee,
      lateFee: Number.isFinite(lateFee) ? lateFee : 0,
    })
  })

  return options
}

export function findRegistrationFeeOptionId(entryFee, options = []) {
  const amount = Number(entryFee)
  if (!Number.isFinite(amount)) return options[0]?.id ?? 'default'
  return options.find((option) => Number(option.registrationFee) === amount)?.id ?? ''
}

export function getRegistrationFeeByOptionId(optionId, options = []) {
  return Number(options.find((option) => option.id === optionId)?.registrationFee ?? 0)
}

export const systemSettingsService = {
  async getAdminSettings() {
    const settings = await axiosClient.get(ENDPOINTS.systemSettings.admin).then(unwrapResponse)
    const mapped = mapSettings(settings)
    return {
      ...mapped,
      data: {
        ...mapped.data,
        registrationFeeOptions: buildRegistrationFeeOptions(mapped.data),
      },
    }
  },

  async updateRaceDistances(distancesMeters) {
    const settings = await axiosClient
      .put(ENDPOINTS.systemSettings.raceDistances, { distancesMeters })
      .then(unwrapResponse)

    return mapSettings(settings)
  },

  async updateFees({ defaultRegistrationFee, lateCheckInFee }) {
    const settings = await axiosClient
      .put(ENDPOINTS.systemSettings.fees, {
        defaultRegistrationFee: Number(defaultRegistrationFee),
        lateCheckInFee: Number(lateCheckInFee),
      })
      .then(unwrapResponse)

    return mapSettings(settings)
  },

  async updateDefaultRules(defaultTournamentRules) {
    const trimmedRules = String(defaultTournamentRules ?? '').trim()
    writeStoredDefaultRules(trimmedRules)

    try {
      const settings = await axiosClient.get(ENDPOINTS.systemSettings.admin).then(unwrapResponse)
      return mapSettings({
        ...settings,
        defaultTournamentRules: trimmedRules,
      })
    } catch {
      return mapSettings({
        defaultTournamentRules: trimmedRules,
        raceDistances: [],
      })
    }
  },
}

export async function fetchDefaultTournamentRules() {
  try {
    const response = await systemSettingsService.getAdminSettings()
    return response.data.defaultTournamentRules || DEFAULT_TOURNAMENT_RULES
  } catch {
    const stored = readStoredDefaultRules()
    if (stored?.trim()) return stored.trim()
    return DEFAULT_TOURNAMENT_RULES
  }
}
