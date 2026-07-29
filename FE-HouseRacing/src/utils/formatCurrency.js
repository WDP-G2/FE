export function fmtVND(amount) {
  const value = Number(amount ?? 0)
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}

export function parseMoneyInput(value) {
  return String(value ?? '').replace(/\D/g, '')
}

export function formatMoneyInput(value) {
  const digits = parseMoneyInput(value)
  return digits ? Number(digits).toLocaleString('vi-VN') : ''
}

export function moneyInputNumber(value) {
  const digits = parseMoneyInput(value)
  return digits ? Number(digits) : 0
}
