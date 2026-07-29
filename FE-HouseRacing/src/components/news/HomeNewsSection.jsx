import { Link } from 'react-router-dom'
import { ArrowRight, ChevronRight, Newspaper } from 'lucide-react'
import { newsService } from '@/services/newsService'
import { useFetch } from '@/hooks/useFetch'
import NewsCard from '@/components/news/NewsCard'

export default function HomeNewsSection() {
  const { data, loading } = useFetch(
    async () => {
      const response = await newsService.getAllNews()
      return response.data.slice(0, 3)
    },
    { cacheKey: 'home:news-preview' },
  )

  const preview = data ?? []

  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D4A017]/25 bg-[#D4A017]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#B8941F]">
              <Newspaper className="h-3.5 w-3.5" />
              Tin tức
            </span>
            <h2 className="text-3xl font-bold text-[#1E3A5F] md:text-4xl">Tin tức mới nhất</h2>
            <p className="mt-2 max-w-xl text-[#1E3A5F]/60">
              Cập nhật giải đấu, sự kiện và hoạt động đua ngựa.
            </p>
          </div>

          <Link
            to="/news"
            className="inline-flex items-center gap-2 self-start rounded-xl border border-[#D4A017]/30 bg-[#FFF8F0] px-5 py-3 text-sm font-semibold text-[#1E3A5F] transition hover:border-[#D4A017] hover:text-[#D4A017] sm:self-auto"
          >
            Xem tất cả
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="animate-pulse overflow-hidden rounded-2xl border border-gray-100 bg-white">
                <div className="h-48 bg-gray-200" />
                <div className="space-y-3 p-5">
                  <div className="h-4 w-1/3 rounded bg-gray-200" />
                  <div className="h-6 rounded bg-gray-200" />
                  <div className="h-4 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : preview.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {preview.map((item) => (
              <NewsCard key={item.id} news={item} compact />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#1E3A5F]/15 bg-[#FAFAFA] px-6 py-14 text-center">
            <Newspaper className="mx-auto mb-4 h-12 w-12 text-[#D4A017]/40" />
            <p className="mb-4 text-[#1E3A5F]/60">Chưa có bài viết nào.</p>
            <Link
              to="/news"
              className="inline-flex items-center gap-2 font-semibold text-[#D4A017] hover:text-[#B8941F]"
            >
              Đến trang tin tức
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
