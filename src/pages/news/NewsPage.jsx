import { useState } from 'react'
import { Newspaper } from 'lucide-react'
import { toast } from 'sonner'
import { newsService } from '@/services/newsService'
import { useDebounce } from '@/hooks/useDebounce'
import { useFetch } from '@/hooks/useFetch'
import FeaturedNews from '@/components/news/FeaturedNews'
import NewsCard from '@/components/news/NewsCard'
import NewsSearch from '@/components/news/NewsSearch'
export default function NewsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 350)

  const { data, loading } = useFetch(
    async () => {
      try {
        const response = await newsService.getAllNews({ search: debouncedSearch })
        return response.data
      } catch (error) {
        console.error('Error loading news:', error)
        toast.error('Khong the tai tin tuc')
        return []
      }
    },
    {
      deps: [debouncedSearch],
    }
  )
  
  const news = data ?? []

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F0] via-white to-[#FAFAFA]">
      <section className="relative overflow-hidden pb-20 pt-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFF8F0] via-white to-[#FAFAFA]" />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #1E3A5F 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="pt-16 text-center">
            <div className="mb-8 inline-flex items-center space-x-2 rounded-full border border-[#D4A017]/20 bg-gradient-to-r from-[#D4A017]/10 to-[#D4A017]/5 px-5 py-2.5 shadow-sm">
              <Newspaper className="h-5 w-5 text-[#D4A017]" />
              <span className="font-semibold text-[#D4A017]">Tin tuc va su kien</span>
            </div>

            <h1 className="mb-6 text-5xl font-bold leading-tight text-[#1E3A5F] md:text-7xl">
              Tin tuc dua ngua
            </h1>

            <p className="mx-auto mb-12 max-w-3xl text-xl leading-relaxed text-[#1E3A5F]/60 md:text-2xl">
              Cap nhat tin tuc moi nhat ve giai dau, ngua dua, jockey va cac su kien dac
              biet.
            </p>

            <div className="mx-auto max-w-2xl">
              <NewsSearch onSearch={setSearchQuery} />
            </div>
          </div>
        </div>

        <div className="absolute left-10 top-20 h-72 w-72 rounded-full bg-[#D4A017]/5 blur-3xl" />
        <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-[#1E3A5F]/5 blur-3xl" />
      </section>

      <FeaturedNews />

      <section className="bg-gradient-to-b from-white to-[#FAFAFA] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-4xl font-bold text-[#1E3A5F]">Tat ca tin tuc</h2>
            <div className="mx-auto h-1 w-24 rounded-full bg-gradient-to-r from-[#D4A017] to-[#F5E6C8]" />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm animate-pulse"
                >
                  <div className="h-56 bg-gray-200" />
                  <div className="space-y-4 p-6">
                    <div className="h-4 w-1/3 rounded bg-gray-200" />
                    <div className="h-7 rounded bg-gray-200" />
                    <div className="h-4 rounded bg-gray-200" />
                    <div className="h-4 w-5/6 rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : news.length > 0 ? (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {news.map((item) => (
                <NewsCard key={item.id} news={item} />
              ))}
            </div>
          ) : (
            <div className="py-32 text-center">
              <div className="relative mb-6 inline-block">
                <div className="absolute inset-0 rounded-full bg-[#D4A017]/10 blur-2xl" />
                <Newspaper className="relative mx-auto h-20 w-20 text-[#D4A017]/40" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-[#1E3A5F]">Khong tim thay tin tuc</h3>
              <p className="text-lg text-[#1E3A5F]/60">Hay thu tim kiem voi tu khoa khac.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
