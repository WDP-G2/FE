import { Bell, Clock, Mail, MessageSquare, Send, Smartphone } from 'lucide-react'
import AdminLayout from '@/components/admin/AdminLayout'

const history = [
  { id: 'N-1', title: 'Mở đăng ký Vietnam Grand Prix 2026', channel: 'Email + Push', when: '2 giờ trước', sent: 1248 },
  { id: 'N-2', title: 'Nhắc check-in cuộc đua R3', channel: 'SMS', when: 'Hôm qua', sent: 86 },
  { id: 'N-3', title: 'Công bố kết quả Hanoi Cup 2025', channel: 'Push', when: '3 ngày trước', sent: 2104 },
]

export default function AdminNotificationsPage() {
  return (
    <AdminLayout
      heading="Thông báo"
      highlight="Trung tâm"
      subtitle="Soạn và theo dõi thông báo gửi tới người dùng trong hệ thống"
    >
      <div className="grid gap-7 xl:grid-cols-[1.5fr_1fr]">
        <section className="rounded-3xl border border-white/10 bg-white/[0.045]">
          <div className="flex items-center gap-4 border-b border-white/10 px-6 py-5">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dda50e]/15 text-[#dda50e]">
              <Send className="h-6 w-6" />
            </span>
            <div>
              <h2 className="text-xl font-bold">Soạn thông báo</h2>
              <p className="text-sm text-white/50">Hỗ trợ Email, Push và SMS</p>
            </div>
          </div>

          <div className="grid gap-5 p-6 md:grid-cols-2">
            <Field label="Tiêu đề" full>
              <input
                defaultValue="Lịch đua cuộc đua R4"
                className={inputClass}
                placeholder="Nhập tiêu đề thông báo..."
              />
            </Field>
            <Field label="Đối tượng">
              <select defaultValue="all" className={inputClass}>
                <option value="all">Tất cả người dùng</option>
                <option>Chủ ngựa</option>
                <option>Jockey</option>
                <option>Khán giả</option>
              </select>
            </Field>
            <Field label="Lịch gửi">
              <input type="datetime-local" className={inputClass} />
            </Field>
            <Field label="Kênh gửi" full>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: 'Email', icon: Mail },
                  { label: 'Push', icon: Smartphone },
                  { label: 'SMS', icon: MessageSquare },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <button
                      key={item.label}
                      type="button"
                      className="flex h-14 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] font-semibold text-white transition hover:border-[#dda50e]/35 hover:bg-[#dda50e]/10"
                    >
                      <Icon className="h-5 w-5 text-[#dda50e]" />
                      {item.label}
                    </button>
                  )
                })}
              </div>
            </Field>
            <Field label="Nội dung" full>
              <textarea
                rows={7}
                defaultValue="Cuộc đua R4 sẽ bắt đầu check-in lúc 13:00. Vui lòng có mặt đúng giờ để hoàn tất xác nhận tham gia."
                className={`${inputClass} h-auto resize-none py-4`}
              />
            </Field>
          </div>

          <div className="flex justify-end gap-3 px-6 pb-6">
            <button
              type="button"
              className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 font-semibold text-white/70 transition hover:bg-white/[0.08]"
            >
              Lưu nháp
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-2xl bg-[#dda50e] px-5 py-3 font-semibold text-white shadow-lg shadow-[#d4a017]/20 transition hover:bg-[#c8940f]"
            >
              <Send className="h-5 w-5" />
              Gửi thông báo
            </button>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-white/[0.045]">
          <div className="flex items-center gap-3 border-b border-white/10 px-6 py-5">
            <Bell className="h-5 w-5 text-[#dda50e]" />
            <h2 className="text-xl font-bold">Lịch sử gửi</h2>
          </div>

          <div className="space-y-4 p-5">
            {history.map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
                    {item.sent}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-white/50">
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    {item.channel}
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {item.when}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </AdminLayout>
  )
}

const inputClass =
  'h-14 w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 text-white outline-none placeholder:text-white/30 focus:border-[#dda50e]/60'

function Field({ label, children, full = false }) {
  return (
    <label className={full ? 'md:col-span-2' : ''}>
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/55">
        {label}
      </span>
      {children}
    </label>
  )
}
