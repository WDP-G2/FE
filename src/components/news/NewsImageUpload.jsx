import { useEffect, useMemo } from 'react'
import { ImagePlus, Upload } from 'lucide-react'
import NewsImage from '@/components/news/NewsImage'
import { NEWS_IMAGE_PRESETS } from '@/utils/cloudinary'

const ACCEPT = 'image/png,image/jpeg,image/webp'

export default function NewsImageUpload({ existingUrl, file, onFileChange, disabled = false }) {
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const showPreview = Boolean(previewUrl || existingUrl)

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-white/70">Ảnh đại diện</label>

      <input
        type="file"
        accept={ACCEPT}
        disabled={disabled}
        onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
        className="mb-3 w-full text-sm text-white/60 file:mr-3 file:rounded-lg file:border-0 file:bg-[#dda50e] file:px-4 file:py-2 file:font-semibold file:text-white disabled:opacity-50"
      />

      {showPreview ? (
        <div className="overflow-hidden rounded-xl border border-white/10">
          {previewUrl ? (
            <img src={previewUrl} alt="" className="h-48 w-full object-cover" />
          ) : (
            <NewsImage
              src={existingUrl}
              alt=""
              preset={NEWS_IMAGE_PRESETS.card}
              className="h-48 w-full object-cover"
            />
          )}
        </div>
      ) : (
        <div className="flex h-48 flex-col items-center justify-center rounded-xl border border-dashed border-white/15 bg-white/[0.03] text-white/45">
          <Upload className="mb-2 h-10 w-10" />
          <p className="text-sm">Chọn PNG, JPEG hoặc WebP (tối đa theo giới hạn server)</p>
        </div>
      )}

      <p className="mt-3 flex items-start gap-2 text-xs text-white/45">
        <ImagePlus className="mt-0.5 h-4 w-4 shrink-0" />
        Ảnh gửi lên server khi lưu bài; hiển thị qua CDN Cloudinary (cấu hình trong .env).
      </p>
    </div>
  )
}
