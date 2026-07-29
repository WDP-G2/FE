import { useEffect, useState } from 'react'
import { Camera, XCircle } from 'lucide-react'
import { getCloudinaryImageUrl } from '@/utils/cloudinary'
import { getEvidenceFile } from './violationEvidenceStore'
import {
  getEvidenceMediaUrl,
  isEvidenceImage,
  isEvidenceVideo,
} from '@/utils/violationUtils'

function isCloudinaryUrl(url) {
  return /res\.cloudinary\.com/i.test(String(url || ''))
}

export async function resolveEvidenceMediaUrl(file) {
  if (!file) return ''

  const directUrl = getEvidenceMediaUrl(file)
  if (directUrl) {
    if (isCloudinaryUrl(directUrl) && isEvidenceImage(file)) {
      return getCloudinaryImageUrl(directUrl, { width: 1600, quality: 'auto', format: 'auto' })
    }
    return directUrl
  }

  if (file.storageKey) {
    const blob = await getEvidenceFile(file.storageKey)
    if (blob instanceof Blob) {
      return URL.createObjectURL(blob)
    }
  }

  return ''
}

export function ViolationEvidencePreviewModal({ file, onClose }) {
  const [mediaUrl, setMediaUrl] = useState('')
  const [loading, setLoading] = useState(Boolean(file))

  useEffect(() => {
    if (!file) {
      setMediaUrl('')
      setLoading(false)
      return undefined
    }

    let cancelled = false
    let objectUrl = ''

    setLoading(true)
    resolveEvidenceMediaUrl(file)
      .then((url) => {
        if (cancelled) {
          if (url.startsWith('blob:')) URL.revokeObjectURL(url)
          return
        }
        objectUrl = url.startsWith('blob:') ? url : ''
        setMediaUrl(url)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [file])

  if (!file) return null

  const isImage = isEvidenceImage(file)
  const isVideo = isEvidenceVideo(file)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#0F1E3A] border border-white/10 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-bold text-white truncate">{file.name || 'Bằng chứng'}</h3>
            {file.size && <p className="text-xs text-white/50 mt-0.5">{file.size}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/60 hover:text-white shrink-0"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 overflow-auto max-h-[calc(90vh-80px)] min-h-[240px] flex items-center justify-center">
          {loading && (
            <div className="text-center text-white/50 text-sm py-16">Đang tải bằng chứng...</div>
          )}

          {!loading && !mediaUrl && (
            <div className="text-center py-16 text-white/50 text-sm space-y-2">
              <Camera className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>Không tìm thấy ảnh đã lưu.</p>
              <p className="text-xs text-white/40">Vi phạm ghi trước khi cập nhật có thể mất file — hãy ghi nhận lại.</p>
            </div>
          )}

          {!loading && mediaUrl && isImage && (
            <img
              src={mediaUrl}
              alt={file.name || 'Bằng chứng'}
              className="mx-auto max-h-[70vh] w-auto max-w-full rounded-xl border border-white/10 object-contain"
            />
          )}

          {!loading && mediaUrl && isVideo && (
            <video
              src={mediaUrl}
              controls
              className="mx-auto max-h-[70vh] w-full max-w-full rounded-xl border border-white/10 bg-black"
            />
          )}

          {!loading && mediaUrl && !isImage && !isVideo && (
            <div className="text-center py-16 text-white/50 text-sm space-y-3">
              <p>Không xem trực tiếp được định dạng này.</p>
              <a
                href={mediaUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex text-[#D4A017] hover:underline font-semibold"
              >
                Mở file bằng chứng
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function ViolationEvidenceThumbnail({ file, onClick, className = 'h-16 w-16' }) {
  const [thumbUrl, setThumbUrl] = useState('')

  useEffect(() => {
    if (!file || !isEvidenceImage(file)) {
      setThumbUrl('')
      return undefined
    }

    let cancelled = false
    let objectUrl = ''

    resolveEvidenceMediaUrl(file)
      .then((url) => {
        if (cancelled) {
          if (url.startsWith('blob:')) URL.revokeObjectURL(url)
          return
        }
        objectUrl = url.startsWith('blob:') ? url : ''
        setThumbUrl(url)
      })
      .catch(() => {
        if (!cancelled) setThumbUrl('')
      })

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [file])

  if (!file) return null

  if (thumbUrl) {
    return (
      <button type="button" onClick={onClick} className={`overflow-hidden rounded-lg border border-white/10 ${className}`}>
        <img src={thumbUrl} alt={file.name} className="h-full w-full object-cover" />
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center rounded-lg border border-white/10 bg-white/5 ${className}`}
    >
      <Camera className="h-5 w-5 text-[#D4A017]" />
    </button>
  )
}
