import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <h1 className="text-6xl font-bold text-[#D4A017]">404</h1>
      <p className="text-gray-600 mt-2">Trang không tồn tại</p>
      <Link to="/" className="mt-6 text-[#1E3A5F] font-semibold hover:text-[#D4A017]">
        Về trang chủ
      </Link>
    </div>
  )
}
