import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, ChevronRight, Newspaper } from 'lucide-react'
import { newsService } from '@/services/newsService'

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function HomeFeaturedNews() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const response = await newsService.getFeaturedNews(3)
        setItems(response.data)
      } catch (error) {
        console.error('Error loading homepage news:', error)
        setItems([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  if (!loading && items.length === 0) {
    return null
  }

  return (
    <section className="bg-gradient-to-b from-white to-[#FAFAFA] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col items-center justify-between gap-6 md:flex-row md:items-end">
          <div>
            <span className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#D4A017]/20 bg-[#D4A017]/10 px-4 py-1.5 text-sm font-semibold text-[#D4A017]">
              <Newspaper className="h-4 w-4" />
              Tin tức
            </span>
            <h2 className="text-4xl font-bold text-[#1E3A5F]">Tin tức nổi bật</h2>
          </div>
          <Link
            to="/news"
            className="inline-flex items-center gap-2 font-semibold text-[#D4A017] transition hover:text-[#B8941F]"
          >
            Xem tất cả
            <ChevronRight className="h-5 w-5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {[1, 2, 3].map((key) => (
              <div key={key} className="animate-pulse overflow-hidden rounded-2xl border border-gray-100 bg-white">
                <div className="h-48 bg-gray-200" />
                <div className="space-y-3 p-6">
                  <div className="h-4 w-1/3 rounded bg-gray-200" />
                  <div className="h-6 rounded bg-gray-200" />
                  <div className="h-4 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {items.map((item) => (
              <Link
                key={item.id}
                to={`/news/${item.id}`}
                className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-4 top-4 rounded-full bg-[#D4A017] px-3 py-1 text-xs font-bold text-white">
                    {item.category}
                  </span>
                </div>
                <div className="p-6">
                  <div className="mb-3 flex items-center gap-2 text-sm text-[#1E3A5F]/50">
                    <Calendar className="h-4 w-4" />
                    {formatDate(item.createdAt)}
                  </div>
                  <h3 className="line-clamp-2 text-lg font-bold text-[#1E3A5F] transition group-hover:text-[#D4A017]">
                    {item.title}
                  </h3>
                  <p className="mt-2 line-clamp-2 text-sm text-[#1E3A5F]/60">{item.shortDescription}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
