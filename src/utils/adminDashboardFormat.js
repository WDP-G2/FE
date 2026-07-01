import { fmtVND } from '@/utils/formatCurrency'

export function formatCompactVND(amount) {
  const value = Number(amount ?? 0)
  if (value >= 1_000_000_000) {
    const billions = value / 1_000_000_000
    const text = billions.toLocaleString('vi-VN', { maximumFractionDigits: 1 })
    return `${text} tỷ`
  }
  if (value >= 1_000_000) {
    const millions = value / 1_000_000
    const text = millions.toLocaleString('vi-VN', { maximumFractionDigits: 1 })
    return `${text} triệu`
  }
  return fmtVND(value)
}

export function toRevenueChartPoints(revenue = []) {
  return (Array.isArray(revenue) ? revenue : []).map((item) => ({
    label: item?.label || `T${item?.month ?? ''}`,
    value: Number(item?.amount ?? 0) / 1_000_000,
    growthPercent: item?.growthPercent,
  }))
}
