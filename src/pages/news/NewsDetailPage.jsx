import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Calendar, Tag, User } from 'lucide-react'
import { toast } from 'sonner'
import { newsService } from '@/services/newsService'
import RelatedNews from '@/components/news/RelatedNews'

function formatLongDate(dateString) {
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export default function NewsDetailPage() {
  const { id } = useParams()
  const [news, setNews] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    async function loadNews() {
      try {
        setLoading(true)
        const response = await newsService.getNewsById(id)
        setNews(response.data)
      } catch (error) {
        console.error('Error loading news:', error)
        setNews(null)
        toast.error('Khong the tai bai viet')
      } finally {
        setLoading(false)
      }
    }

    loadNews()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF8F0] via-white to-[#FAFAFA] pb-16 pt-10">
        <div className="mx-auto max-w-4xl animate-pulse px-4 sm:px-6 lg:px-8">
          <div className="mb-8 h-8 w-24 rounded bg-gray-200" />
          <div className="mb-8 h-96 rounded-2xl bg-gray-200" />
          <div className="space-y-4">
            <div className="h-12 rounded bg-gray-200" />
            <div className="h-6 w-1/3 rounded bg-gray-200" />
            <div className="h-4 rounded bg-gray-200" />
            <div className="h-4 rounded bg-gray-200" />
            <div className="h-4 w-5/6 rounded bg-gray-200" />
          </div>
        </div>
      </div>
    )
  }

  if (!news) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF8F0] via-white to-[#FAFAFA] pb-16 pt-10">
        <div className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <h2 className="mb-4 text-2xl font-bold text-gray-800">Khong tim thay bai viet</h2>
          <Link
            to="/news"
            className="inline-flex items-center font-semibold text-[#D4A017] hover:text-[#B8941F]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lai trang tin tuc
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F0] via-white to-[#FAFAFA] pb-20 pt-10">
      <article>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Link
            to="/news"
            className="group mb-10 inline-flex items-center rounded-xl border border-gray-200 bg-white px-4 py-2.5 font-semibold text-[#1E3A5F] shadow-sm transition-all hover:border-[#D4A017]/30 hover:bg-[#FFF8F0] hover:text-[#D4A017] hover:shadow-md"
          >
            <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Quay lai tin tuc
          </Link>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="group relative mb-10 h-[500px] overflow-hidden rounded-3xl shadow-2xl">
                <img
                  src={news.thumbnail}
                  alt={news.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                <div className="absolute left-6 top-6">
                  <div className="flex items-center space-x-2 rounded-full bg-gradient-to-r from-[#D4A017] to-[#B8941F] px-5 py-2.5 text-white shadow-xl">
                    <Tag className="h-4 w-4" />
                    <span className="text-sm font-bold">{news.category}</span>
                  </div>
                </div>

                {news.featured && (
                  <div className="absolute right-6 top-6 rounded-full bg-red-500 px-5 py-2.5 text-sm font-bold text-white shadow-xl">
                    Noi bat
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-gray-100 bg-white p-10 shadow-xl">
                <h1 className="mb-8 text-5xl font-bold leading-tight text-[#1E3A5F]">{news.title}</h1>

                <div className="mb-10 flex flex-wrap items-center gap-6 border-b-2 border-gray-100 pb-8">
                  <div className="flex items-center rounded-xl bg-[#FFF8F0] px-4 py-2.5">
                    <User className="mr-2.5 h-5 w-5 text-[#D4A017]" />
                    <span className="font-semibold text-[#1E3A5F]">{news.author}</span>
                  </div>
                  <div className="flex items-center rounded-xl bg-[#FFF8F0] px-4 py-2.5">
                    <Calendar className="mr-2.5 h-5 w-5 text-[#D4A017]" />
                    <span className="font-semibold text-[#1E3A5F]">
                      {formatLongDate(news.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="relative mb-10 rounded-2xl border-l-4 border-[#D4A017] bg-gradient-to-br from-[#FFF8F0] via-[#FFFBF5] to-white p-8 shadow-md">
                  <div className="absolute right-4 top-4 h-12 w-12 rounded-full bg-[#D4A017]/10 blur-xl" />
                  <p className="relative text-xl font-semibold leading-relaxed text-[#1E3A5F]">
                    {news.shortDescription}
                  </p>
                </div>

                <div className="max-w-none prose prose-xl">
                  {news.content.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-8 text-lg leading-relaxed text-[#1E3A5F]/80">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <RelatedNews currentNewsId={news.id} />
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}
