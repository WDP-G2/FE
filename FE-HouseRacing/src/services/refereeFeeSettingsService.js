export const REFEREE_FEE_STORAGE_KEY = 'admin:referee-fee-settings'
export const REFEREE_FEE_UPDATED_EVENT = 'referee-fee-settings-updated'
export const DEFAULT_REFEREE_PER_RACE_FEE = 500_000

export function readRefereeFeeSettings() {
  try {
    const raw = localStorage.getItem(REFEREE_FEE_STORAGE_KEY)
    if (!raw) {
      return { perRaceFee: DEFAULT_REFEREE_PER_RACE_FEE }
    }

    const parsed = JSON.parse(raw)
    const perRaceFee = Number(parsed?.perRaceFee)
    return {
      perRaceFee:
        Number.isFinite(perRaceFee) && perRaceFee > 0
          ? perRaceFee
          : DEFAULT_REFEREE_PER_RACE_FEE,
    }
  } catch {
    return { perRaceFee: DEFAULT_REFEREE_PER_RACE_FEE }
  }
}

export function writeRefereeFeeSettings(settings) {
  const perRaceFee = Number(settings?.perRaceFee)
  const payload = {
    perRaceFee:
      Number.isFinite(perRaceFee) && perRaceFee > 0 ? perRaceFee : DEFAULT_REFEREE_PER_RACE_FEE,
  }

  localStorage.setItem(REFEREE_FEE_STORAGE_KEY, JSON.stringify(payload))
  window.dispatchEvent(new CustomEvent(REFEREE_FEE_UPDATED_EVENT))
  return payload
}
