import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { Bell, CheckCheck } from 'lucide-react'
import { notificationService } from '@/services/notificationService'
import { formatDisplayDateTime } from '@/utils/dateFormat'
import { EmptyState, ErrorState, LoadingState, Panel } from './spectatorUi'

export default function SpectatorNotifications() {
  const [notifications, setNotifications] = useState([])
  const [tab, setTab] = useState('ALL')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadNotifications = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await notificationService.getMyNotifications({ page: 0, size: 50 })
      setNotifications(response.content || [])
    } catch (err) {
      setError(err?.message || 'Không tải được thông báo')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadNotifications()
  }, [])

  const unreadCount = notifications.filter((notification) => !notification.read).length
  const visibleNotifications = useMemo(
    () => (tab === 'UNREAD' ? notifications.filter((notification) => !notification.read) : notifications),
    [notifications, tab],
  )

  const markRead = async (id) => {
    try {
      const updated = await notificationService.markRead(id)
      setNotifications((items) =>
        items.map((item) => (String(item.id) === String(id) ? { ...item, ...updated, read: true } : item)),
      )
    } catch (err) {
      toast.error(err?.message || 'Không đánh dấu được thông báo')
    }
  }

  const markAllRead = async () => {
    setSubmitting(true)
    try {
      await notificationService.markAllRead()
      setNotifications((items) => items.map((item) => ({ ...item, read: true, readStatus: 'READ' })))
      toast.success('Đã đánh dấu tất cả thông báo')
    } catch (err) {
      toast.error(err?.message || 'Không đánh dấu được thông báo')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <LoadingState label="Đang tải thông báo..." />
  if (error) return <ErrorState message={error} onRetry={loadNotifications} />

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-[#D4A017]">Thông báo</p>
          <h2 className="text-3xl font-black text-white">Trung tâm thông báo</h2>
        </div>
        <button
          type="button"
          onClick={markAllRead}
          disabled={submitting || unreadCount === 0}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm font-black text-white transition hover:border-[#D4A017]/40 disabled:cursor-not-allowed disabled:text-white/30"
        >
          <CheckCheck className="h-4 w-4" />
          Đánh dấu tất cả đã đọc
        </button>
      </section>

      <Panel>
        <div className="mb-5 flex gap-2">
          {[
            { id: 'ALL', label: 'Tất cả', count: notifications.length },
            { id: 'UNREAD', label: 'Chưa đọc', count: unreadCount },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`rounded-full border px-4 py-2 text-sm font-black transition ${tab === item.id
                ? 'border-[#D4A017]/50 bg-[#D4A017]/15 text-[#D4A017]'
                : 'border-white/10 bg-white/[0.04] text-white/55 hover:text-white'
                }`}
            >
              {item.label} ({item.count})
            </button>
          ))}
        </div>

        {visibleNotifications.length === 0 ? (
          <EmptyState>Không có thông báo nào trong bộ lọc này.</EmptyState>
        ) : (
          <div className="space-y-3">
            {visibleNotifications.map((notification) => (
              <article
                key={notification.id}
                className={`rounded-xl border p-4 ${notification.read
                  ? 'border-white/10 bg-white/[0.03]'
                  : 'border-[#D4A017]/30 bg-[#D4A017]/10'
                  }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 shrink-0 text-[#D4A017]" />
                      <h3 className="font-black text-white">{notification.title}</h3>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-white/58">{notification.message}</p>
                    <p className="mt-2 text-xs text-white/35">
                      {formatDisplayDateTime(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.read && (
                    <button
                      type="button"
                      onClick={() => markRead(notification.id)}
                      className="shrink-0 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-black text-white/70 hover:border-[#D4A017]/40 hover:text-[#D4A017]"
                    >
                      Đã đọc
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </Panel>
    </div>
  )
}
