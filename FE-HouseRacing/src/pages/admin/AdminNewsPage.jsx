import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Edit, Plus, Search, Trash2, User } from 'lucide-react'
import { toast } from 'sonner'
import AdminLayout from '@/components/AdminLayout'
import { PrimaryLink } from '@/components/ui/AdminButton'
import { newsService } from '@/services/newsService'
import NewsImage from '@/components/news/NewsImage'
import { NEWS_IMAGE_PRESETS } from '@/utils/cloudinary'
import { formatDisplayDate } from '@/utils/dateFormat'
import { useFetch } from '@/hooks/useFetch'
import { useApiCacheStore } from '@/store/apiCacheStore'

export default function AdminNewsPage() {
  const { data, loading, refetch: loadNews } = useFetch(
    async () => {
      const response = await newsService.getAllNews({ admin: true })
      return response.data
    },
    { cacheKey: 'admin:news' },
  )
  const news = data ?? []
  const [search, setSearch] = useState('')

  const filteredNews = useMemo(() => {
    const normalized = search.trim().toLocaleLowerCase('vi')
    if (!normalized) return news
    return news.filter((item) =>
      `${item.title} ${item.shortDescription} ${item.author}`
        .toLocaleLowerCase('vi')
        .includes(normalized),
    )
  }, [news, search])

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Xóa bài viết "${title}"? Hành động này không thể hoàn tác.`)) return

    try {
      await newsService.deleteNews(id)
      toast.success('Xóa bài viết thành công')
      useApiCacheStore.getState().removeCache('admin:news')
      await loadNews({ force: true })
    } catch (error) {
      console.error(error)
      toast.error('Không thể xóa bài viết')
    }
  }

  return (
    <AdminLayout
      heading="Tin tức"
      highlight="Quản lý"
      subtitle="Tạo và quản lý bài viết tin tức"
      action={
        <PrimaryLink to="/admin/news/create" icon={Plus}>
          Tạo bài viết mới
        </PrimaryLink>
      }
    >
      <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045]">
        <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-lg font-semibold text-white">Danh sách bài viết</p>
            <p className="text-sm text-white/45">
              {loading ? 'Đang tải...' : `${filteredNews.length} bài viết`}
            </p>
          </div>

          <label className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm kiếm bài viết..."
              className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.04] pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#dda50e]/60"
            />
          </label>
        </div>

        {loading ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="flex animate-pulse gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4"
              >
                <div className="h-20 w-28 rounded-xl bg-white/10" />
                <div className="flex-1 space-y-2 py-1">
                  <div className="h-4 w-2/3 rounded bg-white/10" />
                  <div className="h-3 w-full rounded bg-white/10" />
                  <div className="h-3 w-1/3 rounded bg-white/10" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-white/50">Không có bài viết phù hợp.</p>
            <Link
              to="/admin/news/create"
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#dda50e] hover:text-[#efbb2c]"
            >
              <Plus className="h-4 w-4" />
              Tạo bài viết đầu tiên
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-white/5">
            {filteredNews.map((item) => (
              <li
                key={item.id}
                className="group flex flex-col gap-4 p-5 transition hover:bg-white/[0.03] sm:flex-row sm:items-center"
              >
                <NewsImage
                  src={item.imageUrl || item.thumbnail}
                  alt={item.title}
                  preset={NEWS_IMAGE_PRESETS.thumb}
                  className="h-24 w-full rounded-2xl border border-white/10 object-cover sm:h-20 sm:w-32"
                />

                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-base font-semibold text-white group-hover:text-[#efbb2c]">
                    {item.title}
                  </p>
                  <p className="mt-1 line-clamp-2 text-sm text-white/45">{item.shortDescription}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-white/40">
                    <span className="inline-flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5" />
                      {item.author}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatDisplayDate(item.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 gap-2 sm:ml-2">
                  <Link
                    to={`/admin/news/${item.id}/edit`}
                    className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-white/75 transition hover:border-[#dda50e]/40 hover:text-[#dda50e]"
                  >
                    <Edit className="h-4 w-4" />
                    Sửa
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.id, item.title)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-rose-400/25 bg-rose-500/10 text-rose-300 transition hover:bg-rose-500/20"
                    aria-label="Xóa"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </AdminLayout>
  )
}
