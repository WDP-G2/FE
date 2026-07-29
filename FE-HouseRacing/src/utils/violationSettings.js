export const VIOLATION_SEVERITY_ORDER = ['WARNING', 'MINOR', 'MAJOR', 'DISQUALIFICATION']

export const VIOLATION_SEVERITY_LABELS = {
  WARNING: 'Cảnh cáo',
  MINOR: 'Phạt nhẹ',
  MAJOR: 'Phạt nặng',
  DISQUALIFICATION: 'Loại',
}

export const VIOLATION_RESULT_ACTION_LABELS = {
  NONE: 'Chỉ ghi biên bản',
  TIME_PENALTY: 'Cộng thời gian phạt',
  DISQUALIFY: 'Loại khỏi kết quả',
}

const DEFAULT_RULES = {
  WARNING: { resultAction: 'NONE', timePenaltySeconds: 0 },
  MINOR: { resultAction: 'TIME_PENALTY', timePenaltySeconds: 3 },
  MAJOR: { resultAction: 'TIME_PENALTY', timePenaltySeconds: 10 },
  DISQUALIFICATION: { resultAction: 'DISQUALIFY', timePenaltySeconds: 0 },
}

export function mapViolationTypesFromApi(types = []) {
  return (Array.isArray(types) ? types : []).map((item, index) => ({
    localId: item?.code || `type-${index}`,
    code: item?.code || '',
    label: item?.label || '',
    active: item?.active !== false,
  }))
}

export function mapViolationRulesFromApi(rules = []) {
  const bySeverity = Object.fromEntries(
    (Array.isArray(rules) ? rules : []).map((rule) => [rule.severity, rule]),
  )

  return VIOLATION_SEVERITY_ORDER.map((severity) => {
    const current = bySeverity[severity]
    const fallback = DEFAULT_RULES[severity]

    return {
      severity,
      resultAction: current?.resultAction || fallback.resultAction,
      timePenaltySeconds: Math.round(Number(current?.timePenaltyMillis ?? fallback.timePenaltySeconds * 1000) / 1000),
    }
  })
}

export function buildViolationTypesPayload(types = []) {
  return types.map((item) => ({
    code: item.code?.trim() || undefined,
    label: item.label.trim(),
    active: Boolean(item.active),
  }))
}

export function buildViolationRulesPayload(rules = []) {
  return rules.map((rule) => ({
    severity: rule.severity,
    resultAction: rule.resultAction,
    timePenaltyMillis:
      rule.resultAction === 'TIME_PENALTY'
        ? Math.max(0, Number(rule.timePenaltySeconds) || 0) * 1000
        : 0,
  }))
}

export function validateViolationTypes(types = []) {
  if (!types.length) return 'Phải có ít nhất một loại vi phạm'
  if (types.some((item) => !item.label?.trim())) return 'Tên hiển thị loại vi phạm không được để trống'
  if (types.some((item) => item.label.trim().length > 100)) {
    return 'Tên hiển thị loại vi phạm tối đa 100 ký tự'
  }

  const seenLabels = new Set()
  for (const item of types) {
    const key = item.label.trim().toLowerCase()
    if (seenLabels.has(key)) return `Loại vi phạm "${item.label.trim()}" đang bị trùng`
    seenLabels.add(key)
  }

  if (!types.some((item) => item.active)) return 'Phải có ít nhất một loại vi phạm đang bật'
  return ''
}

export function validateViolationRules(rules = []) {
  for (const rule of rules) {
    if (rule.resultAction === 'TIME_PENALTY' && Number(rule.timePenaltySeconds) <= 0) {
      return `Mức "${VIOLATION_SEVERITY_LABELS[rule.severity]}" cần số giây phạt lớn hơn 0`
    }
  }
  return ''
}
