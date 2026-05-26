import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Calendar } from 'lucide-react'
import { toast } from 'sonner'
import { newsApi } from '@/api/newsApi'

function titleClampStyle() {
  return {
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  }
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export default function RelatedNews({ currentNewsId }) {
  const [relatedNews, setRelatedNews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadRelatedNews() {
      try {
        setLoading(true)
        const response = await newsApi.getRelatedNews(currentNewsId)
        setRelatedNews(response.data)
      } catch (error) {
        console.error('Error loading related news:', error)
        toast.error('Khong the tai tin tuc lien quan')
      } finally {
        setLoading(false)
      }
    }

    loadRelatedNews()
  }, [currentNewsId])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((item) => (
          <div key={item} className="flex gap-4 rounded-xl bg-white p-4 animate-pulse">
            <div className="h-24 w-24 flex-shrink-0 rounded-lg bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded bg-gray-200" />
              <div className="h-3 w-1/2 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (relatedNews.length === 0) {
    return null
  }

  return (
    <div className="rounded-3xl border border-gray-100 bg-gradient-to-br from-[#FAFAFA] to-white p-8 shadow-xl">
      <h3 className="mb-8 flex items-center text-2xl font-bold text-[#1E3A5F]">
        <span className="mr-3 h-8 w-1.5 rounded-full bg-gradient-to-b from-[#D4A017] to-[#B8941F]" />
        Tin tuc lien quan
      </h3>

      <div className="space-y-5">
        {relatedNews.map((news) => (
          <Link
            key={news.id}
            to={`/news/${news.id}`}
            className="group flex gap-4 rounded-2xl border border-gray-50 bg-white p-4 shadow-sm transition-all duration-300 hover:border-[#D4A017]/20 hover:bg-gradient-to-r hover:from-[#FFF8F0] hover:to-white hover:shadow-lg"
          >
            <div className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-xl shadow-md">
              <img
                src={news.thumbnail}
                alt={news.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>

            <div className="flex min-w-0 flex-1 flex-col justify-center">
              <h4
                className="mb-2.5 text-lg font-bold leading-snug text-[#1E3A5F] transition-colors group-hover:text-[#D4A017]"
                style={titleClampStyle()}
              >
                {news.title}
              </h4>
              <div className="w-fit rounded-lg bg-[#FFF8F0] px-3 py-1.5 text-sm text-[#1E3A5F]/60">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-[#D4A017]" />
                  <span className="font-medium">{formatDate(news.createdAt)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <ArrowRight className="h-6 w-6 text-[#D4A017] opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
