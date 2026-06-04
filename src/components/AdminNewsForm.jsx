import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Send } from 'lucide-react'
import NewsImageUpload from '@/components/news/NewsImageUpload'
import { toast } from 'sonner'
import AdminLayout from '@/components/AdminLayout'
import { GhostButton, PrimaryButton } from '@/components/ui/AdminButton'
import { inputClass, selectClass, selectOptionClass } from '@/components/ui/styles'
import { newsService } from '@/services/newsService'

const CATEGORIES = ['Kết quả đua', 'Sự kiện', 'Chân dung', 'Công nghệ', 'Quy định', 'Phỏng vấn']

const emptyForm = {
  title: '',
  shortDescription: '',
  content: '',
  category: 'Kết quả đua',
  featured: false,
}

export default function AdminNewsForm({ articleId }) {
  const navigate = useNavigate()
  const isEdit = Boolean(articleId)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [existingImageUrl, setExistingImageUrl] = useState('')
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    if (!isEdit) return

    async function load() {
      try {
        setLoading(true)
        const { data } = await newsService.getAdminNewsById(articleId)
        setForm({
          title: data.title,
          shortDescription: data.shortDescription,
          content: data.content,
          category: data.category,
          featured: data.featured,
        })
        setExistingImageUrl(data.imageUrl || '')
      } catch (error) {
        console.error(error)
        toast.error('Không thể tải bài viết')
        navigate('/admin/news')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [articleId, isEdit, navigate])

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const submit = async () => {
    if (!form.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề')
      return
    }
    if (!form.content.trim()) {
      toast.error('Vui lòng nhập nội dung bài viết')
      return
    }

    try {
      setSaving(true)
      const payload = {
        title: form.title.trim(),
        summary: form.shortDescription.trim(),
        content: form.content.trim(),
        category: form.category,
        featured: form.featured,
      }

      if (isEdit) {
        await newsService.updateNews(articleId, payload, imageFile)
        toast.success('Cập nhật bài viết thành công')
      } else {
        await newsService.createNews(payload, imageFile)
        toast.success('Tạo bài viết thành công')
      }
      navigate('/admin/news')
    } catch (error) {
      console.error(error)
      toast.error(isEdit ? 'Không thể cập nhật bài viết' : 'Không thể tạo bài viết')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout heading="Tin tức" highlight="Đang tải" subtitle="Đang tải bài viết...">
        <div className="h-64 animate-pulse rounded-3xl border border-white/10 bg-white/[0.04]" />
      </AdminLayout>
    )
  }

  return (
    <AdminLayout
      heading="Tin tức"
      highlight={isEdit ? 'Chỉnh sửa' : 'Tạo mới'}
      subtitle={isEdit ? 'Cập nhật thông tin bài viết' : 'Tạo bài viết tin tức mới'}
      action={
        <div className="flex flex-wrap gap-3">
          <GhostButton icon={ArrowLeft} onClick={() => navigate('/admin/news')}>
            Quay lại
          </GhostButton>
          <PrimaryButton icon={Send} disabled={saving} onClick={submit}>
            {isEdit ? 'Lưu thay đổi' : 'Xuất bản'}
          </PrimaryButton>
        </div>
      }
    >
      <div className="mb-6">
        <Link
          to="/admin/news"
          className="inline-flex items-center gap-2 text-sm font-semibold text-white/60 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Danh sách tin tức
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-3xl border border-white/10 bg-white/[0.045] p-6">
            <label className="mb-2 block text-sm font-semibold text-white/70">Tiêu đề bài viết *</label>
            <input
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
              placeholder="Nhập tiêu đề bài viết..."
              className={inputClass}
            />
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.045] p-6">
            <label className="mb-2 block text-sm font-semibold text-white/70">Mô tả ngắn</label>
            <textarea
              rows={3}
              value={form.shortDescription}
              onChange={(e) => update('shortDescription', e.target.value)}
              placeholder="Nhập mô tả ngắn..."
              className={`${inputClass} h-auto resize-none py-4`}
            />
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.045] p-6">
            <label className="mb-2 block text-sm font-semibold text-white/70">Nội dung bài viết *</label>
            <textarea
              rows={16}
              value={form.content}
              onChange={(e) => update('content', e.target.value)}
              placeholder="Nhập nội dung bài viết..."
              className={`${inputClass} h-auto resize-none py-4 leading-7`}
            />
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl border border-white/10 bg-white/[0.045] p-6">
            <NewsImageUpload
              existingUrl={existingImageUrl}
              file={imageFile}
              onFileChange={setImageFile}
              disabled={saving}
            />
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.045] p-6">
            <label className="mb-2 block text-sm font-semibold text-white/70">Danh mục</label>
            <select
              value={form.category}
              onChange={(e) => update('category', e.target.value)}
              className={selectClass}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat} className={selectOptionClass}>
                  {cat}
                </option>
              ))}
            </select>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.045] p-6">
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => update('featured', e.target.checked)}
                className="mt-1 h-5 w-5 rounded border-white/20 bg-white/5 text-[#dda50e] focus:ring-[#dda50e]"
              />
              <span>
                <span className="block text-sm font-semibold text-white/80">Bài viết nổi bật</span>
                <span className="block text-sm text-white/50">Hiển thị ở trang chủ và mục nổi bật</span>
              </span>
            </label>
          </section>
        </div>
      </div>
    </AdminLayout>
  )
}
