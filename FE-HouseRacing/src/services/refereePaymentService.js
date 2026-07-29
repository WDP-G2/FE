import { refereeService } from '@/services/refereeService'

export const REFEREE_PAYOUTS_UPDATED_EVENT = 'referee-payments-updated'

function mapPaymentFromApi(item, raceId) {
  const status = item?.status ?? null
  return {
    id: item?.id ?? null,
    raceId: item?.raceId ?? raceId ?? null,
    raceName: item?.raceName ?? '',
    tournamentId: item?.tournamentId ?? null,
    tournamentName: item?.tournamentName ?? '',
    refereeId: item?.refereeId != null ? String(item.refereeId) : null,
    refereeName: item?.refereeUsername ?? '',
    amount: Number(item?.amount ?? 0),
    status,
    paid: status === 'PAID',
    paidAt: item?.paidAt ?? null,
    heldAt: item?.heldAt ?? null,
    releasedAt: item?.releasedAt ?? null,
    salaryConfigName: item?.salaryConfigName ?? '',
  }
}

function isAssignmentLocked(status) {
  return status === 'HELD' || status === 'PAID'
}

export function isRacePayoutLocked(payout) {
  if (!payout) return false
  if (typeof payout === 'object') return isAssignmentLocked(payout.status)
  return false
}

export const refereePaymentService = {
  async getRacePayoutStatus(raceId) {
    if (!raceId) {
      return mapPaymentFromApi(null, raceId)
    }

    try {
      const data = await refereeService.getAdminRacePayment(raceId)
      return mapPaymentFromApi(data, raceId)
    } catch {
      return mapPaymentFromApi(null, raceId)
    }
  },

  async getRefereePaymentsFromApi() {
    const data = await refereeService.getPayments()
    return (Array.isArray(data) ? data : []).map((item) => mapPaymentFromApi(item))
  },

  async getRefereePayoutsForUser() {
    const payments = await this.getRefereePaymentsFromApi()
    return payments
      .filter((item) => item.status === 'PAID')
      .sort((first, second) => String(second.paidAt).localeCompare(String(first.paidAt)))
  },

  async getRefereePayoutTotal() {
    const payouts = await this.getRefereePayoutsForUser()
    return payouts.reduce((sum, item) => sum + Number(item.amount ?? 0), 0)
  },
}
