import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import AdminLayout from '@/components/AdminLayout'
import Card from '@/components/ui/Card'
import {
  ADMIN_JUDGES_PUBLISHED_TOURNAMENTS_CACHE_KEY,
  tournamentService,
} from '@/services/tournamentService'
import { useFetch } from '@/hooks/useFetch'
import { getApiErrorMessage } from '@/utils/apiError'
import {
  isPublishedTournament,
  loadPublishedJudgeTournaments,
  mapTournamentForJudges,
} from '@/utils/judgeTournamentUtils'
import TournamentJudgeWorkspace from '@/components/admin/judges/TournamentJudgeWorkspace'
import TournamentPickerGrid from '@/components/admin/judges/TournamentPickerGrid'

export default function AdminJudgesPage() {
  const location = useLocation()
  const [tournamentId, setTournamentId] = useState(null)
  const [selectedTournament, setSelectedTournament] = useState(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  const { data: tournaments = [], loading, error, refetch } = useFetch(
    () => loadPublishedJudgeTournaments(tournamentService),
    { cacheKey: ADMIN_JUDGES_PUBLISHED_TOURNAMENTS_CACHE_KEY, staleTime: 0 },
  )

  useEffect(() => {
    if (location.pathname !== '/admin/judges') return undefined

    const refresh = () => {
      refetch({ force: true }).catch(() => {})
    }

    const onVisible = () => {
      if (document.visibilityState === 'visible') refresh()
    }

    window.addEventListener('focus', refresh)
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      window.removeEventListener('focus', refresh)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [location.pathname, refetch])

  useEffect(() => {
    if (!tournamentId) {
      setSelectedTournament(null)
      return undefined
    }

    let cancelled = false

    async function loadTournamentDetail() {
      try {
        setLoadingDetail(true)
        const response = await tournamentService.getAdminTournament(tournamentId)
        const mapped = mapTournamentForJudges(response.data)

        if (!cancelled) {
          if (!isPublishedTournament(mapped)) {
            toast.error('Chỉ giải đấu đã công bố mới được phân công trọng tài')
            setTournamentId(null)
            setSelectedTournament(null)
            return
          }

          setSelectedTournament(mapped)
        }
      } catch (requestError) {
        if (!cancelled) {
          toast.error(getApiErrorMessage(requestError) || 'Không thể tải chi tiết giải đấu')
          setTournamentId(null)
          setSelectedTournament(null)
        }
      } finally {
        if (!cancelled) setLoadingDetail(false)
      }
    }

    loadTournamentDetail()

    return () => {
      cancelled = true
    }
  }, [tournamentId])

  if (loadingDetail) {
    return (
      <AdminLayout
        heading="Phân công trọng tài"
        highlight="Admin"
        subtitle="Đang tải chi tiết giải đấu..."
      >
        <Card className="p-16 text-center text-white/55">Đang tải dữ liệu giải đấu...</Card>
      </AdminLayout>
    )
  }

  if (selectedTournament) {
    return (
      <TournamentJudgeWorkspace
        tournament={selectedTournament}
        onBack={() => setTournamentId(null)}
        onTournamentUpdated={setSelectedTournament}
      />
    )
  }

  const errorMessage =
    error?.response?.data?.message ||
    error?.message ||
    (error ? 'Không thể tải danh sách giải đấu.' : '')

  return (
    <AdminLayout
      heading="Phân công trọng tài"
      highlight="Admin"
      subtitle="Chỉ giải ở trạng thái Đã công bố mới hiển thị và được phân công trọng tài."
    >
      {loading ? (
        <Card className="p-16 text-center text-white/55">Đang tải giải đấu đã công bố...</Card>
      ) : errorMessage ? (
        <Card className="p-16 text-center text-red-200">{errorMessage}</Card>
      ) : tournaments.length === 0 ? (
        <Card className="p-16 text-center text-white/55">
          Chưa có giải đấu nào được công bố. Hãy công bố giải ở trang quản lý giải đấu trước.
        </Card>
      ) : (
        <TournamentPickerGrid tournaments={tournaments} onSelect={setTournamentId} />
      )}
    </AdminLayout>
  )
}
