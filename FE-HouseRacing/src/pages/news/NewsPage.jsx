import { useEffect, useMemo, useState } from 'react'
import { Newspaper } from 'lucide-react'
import { toast } from 'sonner'
import { newsService } from '@/services/newsService'
import { useDebounce } from '@/hooks/useDebounce'
import { useFetch } from '@/hooks/useFetch'
import NewsListItem from '@/components/news/NewsListItem'
import NewsPagination from '@/components/news/NewsPagination'
import NewsSearch from '@/components/news/NewsSearch'
import { paginateItems } from '@/utils/pagination'

export default function NewsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const debouncedSearch = useDebounce(searchQuery, 350)

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const { data, loading } = useFetch(
    async () => {
      try {
        const response = await newsService.getAllNews({ search: debouncedSearch })
        return response.data
      } catch (error) {
        console.error('Error loading news:', error)
        toast.error('Không thể tải danh sách tin tức')
        return []
      }
    },
    {
      cacheKey: `news:list:${debouncedSearch}`,
      deps: [debouncedSearch],
    },
  )

  const news = data ?? []

  const pagination = useMemo(
    () => paginateItems(news, { page, pageSize: 6 }),
    [news, page],
  )

  return (
    <div className="min-h-screen bg-[#F7F5F0]">
      <div className="border-b border-[#1E3A5F]/8 bg-white">
        <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[#D4A017]">
              Horse Racing
            </p>
            <h1 className="text-3xl font-bold text-[#1E3A5F] md:text-4xl">Tin tức</h1>
            <p className="mt-2 max-w-md text-[#1E3A5F]/60">
              Tin mới về giải đấu, ngựa đua và sự kiện.
            </p>
          </div>

          <div className="w-full md:max-w-sm">
            <NewsSearch onSearch={setSearchQuery} compact />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        {!loading && news.length > 0 && (
          <p className="mb-6 text-sm font-medium text-[#1E3A5F]/50">
            {pagination.totalItems} bài viết
            {pagination.totalPages > 1 && ` · Trang ${pagination.page}/${pagination.totalPages}`}
          </p>
        )}

        {loading ? (
          <div className="space-y-5">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="flex animate-pulse flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white sm:flex-row"
              >
                <div className="h-52 w-full bg-gray-200 sm:w-72" />
                <div className="flex-1 space-y-4 p-6">
                  <div className="h-4 w-1/4 rounded bg-gray-200" />
                  <div className="h-7 w-3/4 rounded bg-gray-200" />
                  <div className="h-4 rounded bg-gray-200" />
                  <div className="h-4 w-5/6 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : pagination.items.length > 0 ? (
          <>
            <div className="space-y-5">
              {pagination.items.map((item) => (
                <NewsListItem key={item.id} news={item} />
              ))}
            </div>

            <NewsPagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={setPage}
            />
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-[#1E3A5F]/15 bg-white px-6 py-20 text-center">
            <Newspaper className="mx-auto mb-4 h-14 w-14 text-[#D4A017]/35" />
            <h3 className="mb-2 text-xl font-bold text-[#1E3A5F]">Không tìm thấy tin tức</h3>
            <p className="text-[#1E3A5F]/60">Hãy thử từ khóa khác.</p>
          </div>
        )}
      </div>
    </div>
  )
}
