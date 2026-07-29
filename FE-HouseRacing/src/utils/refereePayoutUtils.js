export function resolveRaceStatusCode(race) {
  const code = race?.statusCode ?? race?.raw?.status ?? ''
  return String(code).toUpperCase()
}

/** Chỉ thanh toán lương khi trọng tài đã chốt kết quả (cuộc đua hoàn thành). */
export function isRaceCompletedForRefereePayout(race, tournament) {
  const raceCode = resolveRaceStatusCode(race)
  if (raceCode === 'RESULT_CONFIRMED') return true
  if (String(tournament?.statusCode ?? '').toUpperCase() === 'COMPLETED') return true
  return false
}

export function refereePayoutBlockedMessage(race, tournament) {
  if (isRaceCompletedForRefereePayout(race, tournament)) return ''

  const raceCode = resolveRaceStatusCode(race)
  if (raceCode === 'ONGOING') {
    return 'Cuộc đua đang diễn ra — chỉ thanh toán sau khi trọng tài chốt kết quả.'
  }
  if (raceCode === 'SCHEDULED' || raceCode === 'PUBLISHED' || raceCode === 'OPEN_REGISTRATION') {
    return 'Cuộc đua chưa diễn ra — thanh toán lương sau khi hoàn thành và chốt kết quả.'
  }
  return 'Cuộc đua chưa hoàn thành — trọng tài cần chốt kết quả trước khi thanh toán lương.'
}
