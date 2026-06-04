import { useLocation } from 'react-router-dom'
import { RefereeLayout } from './RefereeLayout'
import { RefereeWallet } from './RefereeWallet'

function RefereePlaceholder({ title }) {
  return (
    <RefereeLayout title={title} subtitle="Trang đang được phát triển">
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 text-white/60">
        Nội dung sẽ được cập nhật sớm.
      </div>
    </RefereeLayout>
  )
}

export default function RefereePage() {
  const { pathname } = useLocation()

  if (pathname.startsWith('/referee/wallet')) return <RefereeWallet />
  if (pathname.startsWith('/referee/races')) return <RefereePlaceholder title="Cuộc đua được giao" />
  if (pathname.startsWith('/referee/violations'))
    return <RefereePlaceholder title="Vi phạm đã ghi" />
  if (pathname.startsWith('/referee/history')) return <RefereePlaceholder title="Lịch sử" />
  if (pathname.startsWith('/referee/notifications'))
    return <RefereePlaceholder title="Thông báo" />

  return (
    <RefereeLayout title="Tổng quan · Trọng tài" subtitle="Bảng điều khiển trọng tài">
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-8">
        <p className="text-white/70">Chào mừng cổng trọng tài. Dùng menu bên trái để mở ví và các chức năng khác.</p>
      </div>
    </RefereeLayout>
  )
}
