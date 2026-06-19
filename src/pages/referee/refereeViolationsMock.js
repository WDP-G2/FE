// TODO: Tích hợp API Violations sau — Backend chưa có endpoint referee/violations

import { useSyncExternalStore } from 'react'

const STORAGE_KEY = 'referee_recorded_violations_v1'
const store = globalThis
const listeners = new Set()

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function persist(list) {
  try {
    const serializable = list.map((item) => ({
      ...item,
      evidence: Array.isArray(item.evidence)
        ? item.evidence.map((file) => ({
            name: file.name,
            size: file.size,
            storageKey: file.storageKey ?? undefined,
            mimeType: file.mimeType ?? undefined,
            url: file.url && !String(file.url).startsWith('data:') && !String(file.url).startsWith('blob:')
              ? file.url
              : undefined,
          }))
        : [],
    }))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serializable))
  } catch {
    // ignore quota / private mode errors
  }
}

if (!store.__ref_violations_initialized__) {
  store.__ref_violations__ = loadFromStorage()
  store.__ref_violations_initialized__ = true
}

export const violations = store.__ref_violations__

function emitChange() {
  listeners.forEach((listener) => listener())
}

export function getViolationsSnapshot() {
  return violations
}

export function subscribeViolations(listener) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useRefereeViolations() {
  return useSyncExternalStore(subscribeViolations, getViolationsSnapshot, getViolationsSnapshot)
}

export function addViolation(v) {
  violations.unshift(v)
  persist(violations)
  emitChange()
}

export function getEvidenceMediaUrl(file) {
  return file?.url || file?.previewUrl || ''
}

export function isEvidenceImage(file) {
  if (!file) return false
  if (file.storageKey && file.mimeType?.startsWith('image/')) return true
  if (/\.(jpe?g|png|webp|gif)$/i.test(file?.name || '')) return true
  const url = getEvidenceMediaUrl(file)
  if (!url) return false
  if (file?.mimeType?.startsWith('image/')) return true
  return /^data:image\//i.test(url) || /\.(jpe?g|png|webp|gif)(\?|$)/i.test(url) || /res\.cloudinary\.com/i.test(url)
}

export function isEvidenceVideo(file) {
  if (!file) return false
  if (file.storageKey && file.mimeType?.startsWith('video/')) return true
  const url = getEvidenceMediaUrl(file)
  if (!url) return false
  if (file?.mimeType?.startsWith('video/')) return true
  if (/\.(mp4|mov|webm)$/i.test(file?.name || '')) return true
  return /^data:video\//i.test(url) || /\.(mp4|mov|webm)(\?|$)/i.test(url)
}
