import { useEffect, useMemo, useState } from 'react'
import {
  Ban,
  CheckCircle2,
  FileText,
  PawPrint,
  RefreshCw,
  Search,
  ShieldCheck,
  XCircle,
} from 'lucide-react'
import { toast } from 'sonner'
import AdminLayout from '@/components/AdminLayout'
import { horseService, HORSE_STATUS_VALUES } from '@/services/horseService'
import { getApiErrorMessage } from '@/utils/apiError'

function pillTone(value) {
  const tones = {
    PENDING: 'bg-[#dda50e]/15 text-[#dda50e] border-[#dda50e]/30',
    APPROVED: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    REJECTED: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    SUSPENDED: 'bg-white/10 text-white/60 border-white/10',
  }

  return tones[value] || 'bg-white/10 text-white/65 border-white/10'
}

function actionButtonClass(tone) {
  const tones = {
    green: 'border-emerald-400/25 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/15',
    red: 'border-rose-400/25 bg-rose-500/10 text-rose-300 hover:bg-rose-500/15',
    gray: 'border-white/10 bg-white/[0.04] text-white/60 hover:bg-white/[0.08] hover:text-white',
  }

  return `inline-flex items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 ${tones[tone]}`
}

export default function AdminHorsesPage() {
  const [horses, setHorses] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const [section, setSection] = useState('all')
  const [query, setQuery] = useState('')
  const [ownerFilter, setOwnerFilter] = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')

  const loadHorses = async () => {
    try {
      setLoading(true)
      const data = await horseService.getAllAdminHorses()
      setHorses(data)
    } catch (error) {
      console.error('Không thể tải danh sách ngựa', error?.response?.data || error)
      toast.error(getApiErrorMessage(error) || 'Không thể tải danh sách ngựa')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHorses()
  }, [])

  const owners = useMemo(() => {
    const seen = new Map()
    horses.forEach((horse) => {
      if (!horse.ownerId && !horse.ownerUsername) return
      const key = horse.ownerId || horse.ownerUsername
      seen.set(key, {
        value: key,
        label: horse.ownerUsername || `Owner #${horse.ownerId}`,
      })
    })
    return Array.from(seen.values()).sort((a, b) => a.label.localeCompare(b.label, 'vi'))
  }, [horses])

  const visibleHorses = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('vi')

    return horses.filter((horse) => {
      if (section === 'pending' && horse.statusCode !== 'PENDING') return false
      if (statusFilter !== 'ALL' && horse.statusCode !== statusFilter) return false
      if (ownerFilter !== 'ALL' && horse.ownerId !== ownerFilter && horse.ownerUsername !== ownerFilter) return false
      if (!normalized) return true

      return `${horse.name} ${horse.breed} ${horse.color} ${horse.ownerUsername}`
        .toLocaleLowerCase('vi')
        .includes(normalized)
    })
  }, [horses, ownerFilter, query, section, statusFilter])

  const stats = useMemo(
    () => [
      { label: 'Tổng ngựa', value: horses.length, icon: PawPrint, tone: 'bg-[#dda50e]/15 text-[#dda50e]' },
      {
        label: 'Chờ duyệt',
        value: horses.filter((horse) => horse.statusCode === 'PENDING').length,
        icon: ShieldCheck,
        tone: 'bg-sky-500/15 text-sky-300',
      },
      {
        label: 'Đã duyệt',
        value: horses.filter((horse) => horse.statusCode === 'APPROVED').length,
        icon: CheckCircle2,
        tone: 'bg-emerald-500/15 text-emerald-300',
      },
      {
        label: 'Từ chối/Tạm khóa',
        value: horses.filter((horse) => ['REJECTED', 'SUSPENDED'].includes(horse.statusCode)).length,
        icon: XCircle,
        tone: 'bg-rose-500/15 text-rose-300',
      },
    ],
    [horses],
  )

  const replaceHorse = (nextHorse) => {
    setHorses((prev) => prev.map((horse) => (horse.id === nextHorse.id ? nextHorse : horse)))
  }

  const approveHorse = async (horse) => {
    try {
      setBusyId(horse.id)
      const nextHorse = await horseService.approveHorse(horse.id)
      replaceHorse(nextHorse)
      toast.success('Đã duyệt ngựa')
    } catch (error) {
      console.error('Không thể duyệt ngựa', error?.response?.data || error)
      toast.error(getApiErrorMessage(error) || 'Không thể duyệt ngựa')
    } finally {
      setBusyId(null)
    }
  }

  const rejectHorse = async (horse) => {
    const reason = window.prompt('Nhập lý do từ chối ngựa')
    if (reason === null) return

    try {
      setBusyId(horse.id)
      const nextHorse = await horseService.rejectHorse(horse.id, reason.trim() || 'Không đạt yêu cầu duyệt')
      replaceHorse(nextHorse)
      toast.success('Đã từ chối ngựa')
    } catch (error) {
      console.error('Không thể từ chối ngựa', error?.response?.data || error)
      toast.error(getApiErrorMessage(error) || 'Không thể từ chối ngựa')
    } finally {
      setBusyId(null)
    }
  }

  const suspendHorse = async (horse) => {
    const reason = window.prompt('Nhập lý do tạm khóa ngựa')
    if (reason === null) return

    try {
      setBusyId(horse.id)
      const nextHorse = await horseService.suspendHorse(horse.id, reason.trim() || 'Tạm khóa bởi admin')
      replaceHorse(nextHorse)
      toast.success('Đã tạm khóa ngựa')
    } catch (error) {
      console.error('Không thể tạm khóa ngựa', error?.response?.data || error)
      toast.error(getApiErrorMessage(error) || 'Không thể tạm khóa ngựa')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <AdminLayout
      heading="Ngựa"
      highlight="Quản lý"
      subtitle="Theo dõi toàn bộ ngựa của chủ ngựa, lọc theo owner và duyệt hồ sơ chờ xử lý"
      action={
        <button
          type="button"
          onClick={loadHorses}
          className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white/70 transition hover:bg-white/[0.08] hover:text-white"
        >
          <RefreshCw className="h-4 w-4" />
          Làm mới
        </button>
      }
    >
      <section className="mb-8 grid gap-5 md:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.label} className="rounded-3xl border border-white/10 bg-white/[0.045] p-6">
              <div className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ${item.tone}`}>
                <Icon className="h-7 w-7" />
              </div>
              <p className="text-3xl font-bold">{item.value}</p>
              <p className="mt-2 text-sm text-white/50">{item.label}</p>
            </div>
          )
        })}
      </section>

      <section className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setSection('all')}
            className={`rounded-2xl px-5 py-3 text-sm font-semibold transition ${
              section === 'all'
                ? 'bg-[#dda50e] text-white shadow-lg shadow-[#d4a017]/30'
                : 'border border-white/10 bg-white/[0.04] text-white/60 hover:text-white'
            }`}
          >
            Tất cả ngựa
          </button>
          <button
            type="button"
            onClick={() => setSection('pending')}
            className={`rounded-2xl px-5 py-3 text-sm font-semibold transition ${
              section === 'pending'
                ? 'bg-[#dda50e] text-white shadow-lg shadow-[#d4a017]/30'
                : 'border border-white/10 bg-white/[0.04] text-white/60 hover:text-white'
            }`}
          >
            Ngựa chờ duyệt
          </button>
        </div>
      </section>

      <section className="mb-8 rounded-3xl border border-white/10 bg-white/[0.045] p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_240px_220px]">
          <label className="relative">
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-white/40" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tìm theo tên ngựa, giống, màu lông hoặc chủ ngựa..."
              className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] pl-14 pr-4 text-white outline-none placeholder:text-white/30 focus:border-[#dda50e]/60"
            />
          </label>

          <select
            value={ownerFilter}
            onChange={(event) => setOwnerFilter(event.target.value)}
            className="h-14 rounded-2xl border border-white/10 bg-[#162338] px-5 text-white outline-none focus:border-[#dda50e]/60"
          >
            <option value="ALL">Tất cả chủ ngựa</option>
            {owners.map((owner) => (
              <option key={owner.value} value={owner.value}>
                {owner.label}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-14 rounded-2xl border border-white/10 bg-[#162338] px-5 text-white outline-none focus:border-[#dda50e]/60"
          >
            <option value="ALL">Tất cả trạng thái</option>
            {HORSE_STATUS_VALUES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-white/45">
                <th className="px-6 py-4">Ngựa</th>
                <th className="px-6 py-4">Chủ ngựa</th>
                <th className="px-6 py-4">Thông tin</th>
                <th className="px-6 py-4">Hồ sơ</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-6 py-10 text-center text-white/50" colSpan={6}>
                    Đang tải danh sách ngựa...
                  </td>
                </tr>
              ) : visibleHorses.length > 0 ? (
                visibleHorses.map((horse) => (
                  <tr key={horse.id} className="border-b border-white/5 text-white/70 last:border-0">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white/5">
                          {horse.imageUrl ? (
                            <img src={horse.imageUrl} alt={horse.name} className="h-full w-full object-cover object-top" />
                          ) : (
                            <PawPrint className="h-7 w-7 text-white/30" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{horse.name}</p>
                          <p className="mt-1 text-sm text-white/45">
                            {horse.breed || 'Chưa cập nhật'} · {horse.color || 'Chưa cập nhật'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <p className="font-semibold text-white">{horse.ownerUsername || 'Chưa cập nhật'}</p>
                      {horse.ownerId && <p className="mt-1 text-xs text-white/40">Owner #{horse.ownerId}</p>}
                    </td>
                    <td className="px-6 py-5 text-sm text-white/55">
                      <p>{horse.age || 0} tuổi · {horse.gender || 'Chưa rõ'}</p>
                      <p className="mt-1">{horse.weight || 0} kg · {horse.height || 0} cm</p>
                    </td>
                    <td className="px-6 py-5">
                      {horse.documentUrl ? (
                        <a
                          href={horse.documentUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-white/65 transition hover:bg-white/[0.08] hover:text-white"
                        >
                          <FileText className="h-4 w-4" />
                          Xem giấy
                        </a>
                      ) : (
                        <span className="text-sm text-white/35">Chưa upload</span>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${pillTone(horse.statusCode)}`}>
                        {horse.status}
                      </span>
                      {horse.reviewReason && <p className="mt-2 max-w-[220px] text-xs text-rose-200">{horse.reviewReason}</p>}
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-2">
                        {horse.statusCode !== 'APPROVED' && (
                          <button
                            type="button"
                            onClick={() => approveHorse(horse)}
                            disabled={busyId === horse.id}
                            className={actionButtonClass('green')}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Duyệt
                          </button>
                        )}
                        {horse.statusCode !== 'REJECTED' && (
                          <button
                            type="button"
                            onClick={() => rejectHorse(horse)}
                            disabled={busyId === horse.id}
                            className={actionButtonClass('red')}
                          >
                            <XCircle className="h-4 w-4" />
                            Từ chối
                          </button>
                        )}
                        {horse.statusCode !== 'SUSPENDED' && (
                          <button
                            type="button"
                            onClick={() => suspendHorse(horse)}
                            disabled={busyId === horse.id}
                            className={actionButtonClass('gray')}
                          >
                            <Ban className="h-4 w-4" />
                            Tạm khóa
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="px-6 py-10 text-center text-white/50" colSpan={6}>
                    Không tìm thấy ngựa nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AdminLayout>
  )
}
