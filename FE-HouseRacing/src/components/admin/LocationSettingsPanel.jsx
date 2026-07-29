import { useEffect, useState } from 'react'
import {
  Building2,
  Check,
  ChevronRight,
  CirclePlus,
  MapPin,
  MapPinned,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import Field from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { locationSettingsService } from '@/services/locationSettingsService'
import { getApiErrorMessage } from '@/utils/apiError'

const emptyProvince = { name: '', code: '' }
const emptyVenue = { name: '', address: '' }

export default function LocationSettingsPanel() {
  const [provinces, setProvinces] = useState([])
  const [selectedProvinceId, setSelectedProvinceId] = useState('')
  const [venues, setVenues] = useState([])
  const [provinceDraft, setProvinceDraft] = useState(emptyProvince)
  const [venueDraft, setVenueDraft] = useState(emptyVenue)
  const [editingProvinceId, setEditingProvinceId] = useState('')
  const [editingVenueId, setEditingVenueId] = useState('')
  const [dialog, setDialog] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const selectedProvince = provinces.find((province) => province.id === selectedProvinceId)
  const activeProvinceCount = provinces.filter((province) => province.active).length
  const activeVenueCount = venues.filter((venue) => venue.active).length

  const loadProvinces = async (preferredId = selectedProvinceId) => {
    const response = await locationSettingsService.getProvinces()
    setProvinces(response.data)
    const nextId =
      response.data.find((province) => province.id === preferredId)?.id ||
      response.data[0]?.id ||
      ''
    setSelectedProvinceId(nextId)
    return nextId
  }

  const loadVenues = async (provinceId) => {
    if (!provinceId) {
      setVenues([])
      return
    }
    const response = await locationSettingsService.getVenuesByProvince(provinceId)
    setVenues(response.data)
  }

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        setLoading(true)
        const response = await locationSettingsService.getProvinces()
        if (cancelled) return
        setProvinces(response.data)
        setSelectedProvinceId(response.data[0]?.id || '')
      } catch (error) {
        if (!cancelled) toast.error(getApiErrorMessage(error))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        if (!selectedProvinceId) {
          setVenues([])
          return
        }
        const response = await locationSettingsService.getVenuesByProvince(selectedProvinceId)
        if (!cancelled) setVenues(response.data)
      } catch (error) {
        if (!cancelled) toast.error(getApiErrorMessage(error))
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [selectedProvinceId])

  useEffect(() => {
    if (!dialog) return undefined
    const closeOnEscape = (event) => {
      if (event.key === 'Escape' && !saving) {
        setDialog('')
        setEditingProvinceId('')
        setEditingVenueId('')
        setProvinceDraft(emptyProvince)
        setVenueDraft(emptyVenue)
      }
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [dialog, saving])

  const openProvinceDialog = (province) => {
    setEditingProvinceId(province?.id || '')
    setProvinceDraft(province ? { name: province.name, code: province.code } : emptyProvince)
    setDialog('province')
  }

  const openVenueDialog = (venue) => {
    if (!selectedProvinceId) {
      toast.error('Vui lòng chọn tỉnh/thành phố')
      return
    }
    setEditingVenueId(venue?.id || '')
    setVenueDraft(venue ? { name: venue.name, address: venue.address } : emptyVenue)
    setDialog('venue')
  }

  const closeDialog = () => {
    if (saving) return
    setDialog('')
    setEditingProvinceId('')
    setEditingVenueId('')
    setProvinceDraft(emptyProvince)
    setVenueDraft(emptyVenue)
  }

  const submitProvince = async (event) => {
    event.preventDefault()
    if (!provinceDraft.name.trim() || !provinceDraft.code.trim()) {
      toast.error('Tên và mã tỉnh/thành phố là bắt buộc')
      return
    }
    try {
      setSaving(true)
      const payload = {
        name: provinceDraft.name.trim(),
        code: provinceDraft.code.trim().toUpperCase(),
        active: editingProvinceId
          ? provinces.find((province) => province.id === editingProvinceId)?.active !== false
          : true,
      }
      const response = editingProvinceId
        ? await locationSettingsService.updateProvince(editingProvinceId, payload)
        : await locationSettingsService.createProvince(payload)
      const nextId = await loadProvinces(response.data.id)
      await loadVenues(nextId)
      toast.success(editingProvinceId ? 'Đã cập nhật tỉnh/thành phố' : 'Đã thêm tỉnh/thành phố')
      setDialog('')
      setProvinceDraft(emptyProvince)
      setEditingProvinceId('')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  const submitVenue = async (event) => {
    event.preventDefault()
    if (!selectedProvinceId) {
      toast.error('Vui lòng chọn tỉnh/thành phố')
      return
    }
    if (!venueDraft.name.trim()) {
      toast.error('Tên địa điểm đua là bắt buộc')
      return
    }
    try {
      setSaving(true)
      const payload = {
        name: venueDraft.name.trim(),
        address: venueDraft.address.trim(),
        active: editingVenueId
          ? venues.find((venue) => venue.id === editingVenueId)?.active !== false
          : true,
      }
      if (editingVenueId) {
        await locationSettingsService.updateVenue(editingVenueId, payload)
      } else {
        await locationSettingsService.createVenue(selectedProvinceId, payload)
      }
      await loadVenues(selectedProvinceId)
      toast.success(editingVenueId ? 'Đã cập nhật địa điểm đua' : 'Đã thêm địa điểm đua')
      setDialog('')
      setVenueDraft(emptyVenue)
      setEditingVenueId('')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  const toggleProvince = async (province) => {
    try {
      setSaving(true)
      await locationSettingsService.updateProvinceActive(province.id, !province.active)
      await loadProvinces(province.id)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  const toggleVenue = async (venue) => {
    try {
      setSaving(true)
      await locationSettingsService.updateVenueActive(venue.id, !venue.active)
      await loadVenues(selectedProvinceId)
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  const deleteProvince = async (province) => {
    if (!window.confirm(`Xóa tỉnh/thành phố "${province.name}"?`)) return
    try {
      setSaving(true)
      await locationSettingsService.deleteProvince(province.id)
      const nextId = await loadProvinces('')
      await loadVenues(nextId)
      toast.success('Đã xóa tỉnh/thành phố')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  const deleteVenue = async (venue) => {
    if (!window.confirm(`Xóa địa điểm đua "${venue.name}"?`)) return
    try {
      setSaving(true)
      await locationSettingsService.deleteVenue(venue.id)
      await loadVenues(selectedProvinceId)
      toast.success('Đã xóa địa điểm đua')
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-white/55">
        Đang tải tỉnh và địa điểm đua...
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-5 p-5 xl:grid-cols-[380px_minmax(0,1fr)] xl:p-6">
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1729]/70 shadow-xl shadow-black/10">
          <PanelHeader
            icon={Building2}
            title="Tỉnh / thành phố"
            description={`${activeProvinceCount}/${provinces.length} đang hoạt động`}
            actionLabel="Thêm tỉnh/TP"
            onAction={() => openProvinceDialog()}
          />

          <div className="max-h-[650px] space-y-2 overflow-y-auto p-3">
            {provinces.length === 0 ? (
              <EmptyState
                icon={Building2}
                title="Chưa có tỉnh/thành phố"
                description="Thêm tỉnh hoặc thành phố đầu tiên để quản lý địa điểm đua."
                actionLabel="Thêm tỉnh/TP"
                onAction={() => openProvinceDialog()}
              />
            ) : (
              provinces.map((province) => {
                const selected = province.id === selectedProvinceId
                return (
                  <article
                    key={province.id}
                    className={`group rounded-xl border transition ${
                      selected
                        ? 'border-[#dda50e]/60 bg-[#dda50e]/10 shadow-lg shadow-[#dda50e]/5'
                        : 'border-white/10 bg-white/[0.025] hover:border-white/20 hover:bg-white/[0.045]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedProvinceId(province.id)}
                      className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
                    >
                      <span
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                          selected
                            ? 'border-[#dda50e]/35 bg-[#dda50e]/15 text-[#f4bd24]'
                            : 'border-white/10 bg-white/[0.04] text-white/45'
                        }`}
                      >
                        <Building2 className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-white">{province.name}</span>
                        <span className="mt-1 flex items-center gap-2 text-xs text-white/45">
                          <span className="font-medium uppercase tracking-wide">{province.code}</span>
                          <span className="h-1 w-1 rounded-full bg-white/25" />
                          <StatusBadge active={province.active} compact />
                        </span>
                      </span>
                      <ChevronRight
                        className={`h-4 w-4 transition ${
                          selected ? 'text-[#dda50e]' : 'text-white/25 group-hover:text-white/50'
                        }`}
                      />
                    </button>

                    <div className="mx-3 flex gap-2 border-t border-white/10 py-3">
                      <IconButton label="Sửa tỉnh/thành phố" onClick={() => openProvinceDialog(province)}>
                        <Pencil className="h-4 w-4" />
                      </IconButton>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => toggleProvince(province)}
                        className="flex-1 rounded-lg border border-white/10 bg-white/[0.025] px-3 py-2 text-xs font-semibold text-white/60 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white disabled:opacity-50"
                      >
                        {province.active ? 'Tắt hoạt động' : 'Kích hoạt'}
                      </button>
                      <IconButton
                        label="Xóa tỉnh/thành phố"
                        danger
                        onClick={() => deleteProvince(province)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </IconButton>
                    </div>
                  </article>
                )
              })
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b1729]/70 shadow-xl shadow-black/10">
          <PanelHeader
            icon={MapPinned}
            title="Địa điểm đua"
            description={
              selectedProvince
                ? `${activeVenueCount}/${venues.length} địa điểm hoạt động tại ${selectedProvince.name}`
                : 'Chọn tỉnh/thành phố để xem địa điểm'
            }
            actionLabel="Thêm địa điểm"
            onAction={() => openVenueDialog()}
            actionDisabled={!selectedProvinceId}
          />

          {selectedProvince && (
            <div className="mx-4 mt-4 flex items-center gap-3 rounded-xl border border-[#dda50e]/20 bg-[#dda50e]/[0.07] px-4 py-3">
              <MapPin className="h-4 w-4 shrink-0 text-[#dda50e]" />
              <p className="min-w-0 text-sm text-white/60">
                Đang hiển thị địa điểm thuộc{' '}
                <span className="font-semibold text-white">{selectedProvince.name}</span>
              </p>
              <span className="ml-auto rounded-lg border border-white/10 bg-black/10 px-2.5 py-1 text-xs font-semibold text-white/55">
                {selectedProvince.code}
              </span>
            </div>
          )}

          <div className="grid gap-3 p-4 md:grid-cols-2">
            {!selectedProvince ? (
              <div className="md:col-span-2">
                <EmptyState
                  icon={MapPin}
                  title="Chưa chọn tỉnh/thành phố"
                  description="Chọn một tỉnh ở danh sách bên trái để xem và quản lý địa điểm đua."
                />
              </div>
            ) : venues.length === 0 ? (
              <div className="md:col-span-2">
                <EmptyState
                  icon={MapPinned}
                  title="Chưa có địa điểm đua"
                  description={`Thêm địa điểm đua đầu tiên cho ${selectedProvince.name}.`}
                  actionLabel="Thêm địa điểm"
                  onAction={() => openVenueDialog()}
                />
              </div>
            ) : (
              venues.map((venue) => (
                <article
                  key={venue.id}
                  className="group flex min-h-48 flex-col rounded-2xl border border-white/10 bg-white/[0.025] p-4 transition hover:-translate-y-0.5 hover:border-[#dda50e]/30 hover:bg-white/[0.04] hover:shadow-lg hover:shadow-black/10"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#dda50e]/25 bg-[#dda50e]/10 text-[#e9b323]">
                      <MapPin className="h-5 w-5" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="truncate font-semibold text-white">{venue.name}</h4>
                        <StatusBadge active={venue.active} />
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/45">
                        {venue.address || 'Chưa cập nhật địa chỉ'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-auto flex gap-2 border-t border-white/10 pt-4">
                    <IconButton label="Sửa địa điểm" onClick={() => openVenueDialog(venue)}>
                      <Pencil className="h-4 w-4" />
                    </IconButton>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => toggleVenue(venue)}
                      className="flex-1 rounded-lg border border-white/10 bg-white/[0.025] px-3 py-2 text-xs font-semibold text-white/60 transition hover:border-white/20 hover:bg-white/[0.05] hover:text-white disabled:opacity-50"
                    >
                      {venue.active ? 'Tắt hoạt động' : 'Kích hoạt'}
                    </button>
                    <IconButton label="Xóa địa điểm" danger onClick={() => deleteVenue(venue)}>
                      <Trash2 className="h-4 w-4" />
                    </IconButton>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>

      <LocationDialog
        type={dialog}
        editing={dialog === 'province' ? Boolean(editingProvinceId) : Boolean(editingVenueId)}
        provinceName={selectedProvince?.name}
        provinceDraft={provinceDraft}
        venueDraft={venueDraft}
        saving={saving}
        onProvinceChange={setProvinceDraft}
        onVenueChange={setVenueDraft}
        onProvinceSubmit={submitProvince}
        onVenueSubmit={submitVenue}
        onClose={closeDialog}
      />
    </>
  )
}

function PanelHeader({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  actionDisabled = false,
}) {
  return (
    <header className="flex flex-col gap-4 border-b border-white/10 bg-white/[0.025] p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-[#dda50e]">
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h3 className="font-bold text-white">{title}</h3>
          <p className="mt-0.5 truncate text-xs text-white/45">{description}</p>
        </div>
      </div>
      <button
        type="button"
        disabled={actionDisabled}
        onClick={onAction}
        className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#dda50e] px-4 text-sm font-semibold text-white shadow-lg shadow-[#dda50e]/15 transition hover:bg-[#c8940f] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus className="h-4 w-4" />
        {actionLabel}
      </button>
    </header>
  )
}

function StatusBadge({ active, compact = false }) {
  if (compact) {
    return (
      <span className={active ? 'text-emerald-400/80' : 'text-white/35'}>
        {active ? 'Đang hoạt động' : 'Đã tắt'}
      </span>
    )
  }

  return (
    <span
      className={`shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold ${
        active
          ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
          : 'border-white/10 bg-white/[0.04] text-white/40'
      }`}
    >
      {active ? 'Hoạt động' : 'Đã tắt'}
    </span>
  )
}

function EmptyState({ icon: Icon, title, description, actionLabel, onAction }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.015] px-6 py-10 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/35">
        <Icon className="h-6 w-6" />
      </span>
      <h4 className="mt-4 font-semibold text-white">{title}</h4>
      <p className="mt-2 max-w-sm text-sm leading-6 text-white/45">{description}</p>
      {actionLabel && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 flex items-center gap-2 rounded-xl border border-[#dda50e]/30 bg-[#dda50e]/10 px-4 py-2.5 text-sm font-semibold text-[#efbd37] transition hover:bg-[#dda50e]/15"
        >
          <CirclePlus className="h-4 w-4" />
          {actionLabel}
        </button>
      )}
    </div>
  )
}

function LocationDialog({
  type,
  editing,
  provinceName,
  provinceDraft,
  venueDraft,
  saving,
  onProvinceChange,
  onVenueChange,
  onProvinceSubmit,
  onVenueSubmit,
  onClose,
}) {
  if (!type) return null

  const isProvince = type === 'province'
  const title = editing
    ? isProvince
      ? 'Chỉnh sửa tỉnh/thành phố'
      : 'Chỉnh sửa địa điểm đua'
    : isProvince
      ? 'Thêm tỉnh/thành phố'
      : 'Thêm địa điểm đua'
  const description = isProvince
    ? 'Nhập thông tin khu vực dùng để phân nhóm địa điểm đua.'
    : `Địa điểm mới sẽ được thêm vào ${provinceName || 'tỉnh/thành phố đang chọn'}.`
  const Icon = isProvince ? Building2 : MapPinned

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020817]/75 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="location-dialog-title"
        className="w-full max-w-xl overflow-hidden rounded-3xl border border-white/15 bg-[#101d31] shadow-2xl shadow-black/40"
      >
        <header className="flex items-start justify-between gap-4 border-b border-white/10 bg-white/[0.025] px-6 py-5">
          <div className="flex min-w-0 items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#dda50e]/30 bg-[#dda50e]/10 text-[#e8b324]">
              <Icon className="h-6 w-6" />
            </span>
            <div>
              <h2 id="location-dialog-title" className="text-xl font-bold text-white">
                {title}
              </h2>
              <p className="mt-1 text-sm leading-5 text-white/45">{description}</p>
            </div>
          </div>
          <button
            type="button"
            aria-label="Đóng"
            disabled={saving}
            onClick={onClose}
            className="rounded-xl border border-transparent p-2 text-white/45 transition hover:border-white/10 hover:bg-white/5 hover:text-white disabled:opacity-40"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <form
          onSubmit={isProvince ? onProvinceSubmit : onVenueSubmit}
          className="space-y-5 px-6 py-6"
        >
          {isProvince ? (
            <>
              <Field label="Tên tỉnh/thành phố">
                <Input
                  autoFocus
                  value={provinceDraft.name}
                  placeholder="Ví dụ: Thành phố Hồ Chí Minh"
                  onChange={(event) =>
                    onProvinceChange((current) => ({ ...current, name: event.target.value }))
                  }
                />
              </Field>
              <Field label="Mã tỉnh/thành phố">
                <Input
                  value={provinceDraft.code}
                  placeholder="Ví dụ: HCM"
                  maxLength={20}
                  onChange={(event) =>
                    onProvinceChange((current) => ({ ...current, code: event.target.value }))
                  }
                />
                <p className="mt-2 text-xs text-white/35">
                  Mã sẽ tự động được chuyển thành chữ in hoa.
                </p>
              </Field>
            </>
          ) : (
            <>
              <Field label="Tên địa điểm đua">
                <Input
                  autoFocus
                  value={venueDraft.name}
                  placeholder="Ví dụ: Trường đua Phú Thọ"
                  onChange={(event) =>
                    onVenueChange((current) => ({ ...current, name: event.target.value }))
                  }
                />
              </Field>
              <Field label="Địa chỉ">
                <Input
                  value={venueDraft.address}
                  placeholder="Nhập địa chỉ chi tiết"
                  onChange={(event) =>
                    onVenueChange((current) => ({ ...current, address: event.target.value }))
                  }
                />
              </Field>
            </>
          )}

          <footer className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="h-11 rounded-xl border border-white/10 bg-white/[0.035] px-5 font-semibold text-white/65 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white disabled:opacity-40"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex h-11 min-w-40 items-center justify-center gap-2 rounded-xl bg-[#dda50e] px-5 font-semibold text-white shadow-lg shadow-[#dda50e]/20 transition hover:bg-[#c8940f] disabled:opacity-50"
            >
              {saving ? (
                'Đang lưu...'
              ) : (
                <>
                  {editing ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {editing ? 'Lưu thay đổi' : isProvince ? 'Thêm tỉnh/TP' : 'Thêm địa điểm'}
                </>
              )}
            </button>
          </footer>
        </form>
      </section>
    </div>
  )
}

function IconButton({ label, onClick, children, danger = false }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`rounded-lg border p-2 transition ${
        danger
          ? 'border-red-400/10 text-white/40 hover:border-red-400/25 hover:bg-red-400/10 hover:text-red-300'
          : 'border-white/10 text-white/45 hover:border-white/20 hover:bg-white/[0.05] hover:text-white'
      }`}
    >
      {children}
    </button>
  )
}
