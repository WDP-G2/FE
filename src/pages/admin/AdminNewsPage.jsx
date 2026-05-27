import { useEffect, useMemo, useState } from 'react'
import { CalendarDays, Newspaper, Search, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import AdminLayout from '@/components/admin/AdminLayout'
import { newsApi } from '@/api/newsApi'

function statusBadge(status) {
  return status === 'published'
    ? 'border-emerald-400/35 bg-emerald-500/15 text-emerald-300'
    : 'border-white/15 bg-white/10 text-white/65'
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function AdminNewsPage() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    async function loadNews() {
      try {
        setLoading(true)
        const response = await newsApi.getAllNews({ search, admin: true })
        setNews(response.data)
      } catch (error) {
        console.error('Error loading admin news:', error)
        toast.error('Không thể tải tin tức. Hãy đăng nhập admin và kiểm tra backend.')
        setNews([])
      } finally {
        setLoading(false)
      }
    }

    loadNews()
  }, [search])

  const filteredNews = useMemo(() => {
    if (filter === 'featured') return news.filter((item) => item.featured)
    return news
  }, [news, filter])

  const stats = [
    { label: 'Tổng bài viết', value: news.length, icon: Newspaper, tone: 'text-[#dda50e] bg-[#dda50e]/15' },
    {
      label: 'Đã xuất bản',
      value: news.length,
      icon: Sparkles,
      tone: 'text-emerald-300 bg-emerald-500/15',
    },
    {
      label: 'Tin nổi bật',
      value: news.filter((item) => item.featured).length,
      icon: CalendarDays,
      tone: 'text-sky-300 bg-sky-500/15',
    },
  ]

  return (
    <AdminLayout
      heading="Tin tức"
      highlight="Quản lý"
      subtitle="Theo dõi nội dung công khai đang hiển thị trên website"
    >
      <section className="mb-8 grid gap-5 md:grid-cols-3">
        {stats.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="rounded-3xl border border-white/10 bg-white/[0.045] p-6">
              <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${item.tone}`}>
                <Icon className="h-7 w-7" />
              </div>
              <p className="text-3xl font-bold">{item.value}</p>
              <p className="mt-2 text-sm text-white/50">{item.label}</p>
            </div>
          )
        })}
      </section>

      <section className="mb-8 rounded-3xl border border-white/10 bg-white/[0.045] p-6">
        <div className="flex flex-col gap-4 lg:flex-row">
          <label className="relative flex-1">
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm theo tiêu đề hoặc danh mục..."
              className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-14 pr-4 text-white outline-none placeholder:text-white/30 focus:border-[#dda50e]/60"
            />
          </label>

          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            className="h-14 rounded-2xl border border-white/10 bg-[#162338] px-5 text-white outline-none focus:border-[#dda50e]/60 lg:w-64"
          >
            <option value="all">Tất cả bài viết</option>
            <option value="featured">Chỉ tin nổi bật</option>
          </select>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px]">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-white/45">
                <th className="px-6 py-4">Bài viết</th>
                <th className="px-6 py-4">Danh mục</th>
                <th className="px-6 py-4">Tác giả</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Ngày tạo</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-white/50">
                    Đang tải dữ liệu tin tức...
                  </td>
                </tr>
              ) : filteredNews.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-white/50">
                    Không có bài viết phù hợp.
                  </td>
                </tr>
              ) : (
                filteredNews.map((item) => (
                  <tr key={item.id} className="border-b border-white/5 align-top text-white/70 last:border-0">
                    <td className="px-6 py-5">
                      <div className="flex gap-4">
                        <img
                          src={item.thumbnail}
                          alt={item.title}
                          className="h-16 w-24 rounded-xl border border-white/10 object-cover"
                        />
                        <div className="min-w-0">
                          <p className="line-clamp-2 font-semibold text-white">{item.title}</p>
                          <p className="mt-1 line-clamp-2 text-sm text-white/45">
                            {item.shortDescription}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="inline-flex rounded-full bg-[#dda50e]/12 px-3 py-1 text-sm font-semibold text-[#dda50e]">
                        {item.category}
                      </span>
                    </td>
                    <td className="px-6 py-5">{item.author}</td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${
                          item.featured
                            ? 'border-[#dda50e]/35 bg-[#dda50e]/15 text-[#efbb2c]'
                            : statusBadge('published')
                        }`}
                      >
                        {item.featured ? 'Nổi bật' : 'Đã xuất bản'}
                      </span>
                    </td>
                    <td className="px-6 py-5">{formatDate(item.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AdminLayout>
  )
}
