export function calculateBetBreakdown({
  stakeAmount,
  payoutMultiplier = 2,
  winningTaxPercent,
}) {
  if (winningTaxPercent == null || winningTaxPercent === '') return null

  const stake = Number(stakeAmount)
  const multiplier = Number(payoutMultiplier)
  const taxPercent = Number(winningTaxPercent)

  if (
    !Number.isSafeInteger(stake) ||
    stake < 0 ||
    !Number.isFinite(multiplier) ||
    multiplier < 1 ||
    !Number.isFinite(taxPercent) ||
    taxPercent < 0 ||
    taxPercent > 100
  ) {
    return null
  }

  const potentialPayoutAmount = Math.round(stake * multiplier)
  const grossProfitAmount = Math.max(0, potentialPayoutAmount - stake)
  const winningTaxAmount = Math.max(
    0,
    Math.round((grossProfitAmount * taxPercent) / 100),
  )
  const netProfitAmount = grossProfitAmount - winningTaxAmount

  return {
    stakeAmount: stake,
    potentialPayoutAmount,
    grossProfitAmount,
    winningTaxAmount,
    netProfitAmount,
    actualPayoutAmount: stake + netProfitAmount,
  }
}
