import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  FileText,
  Image,
  Info,
  MapPin,
  Save,
  Sparkles,
  Trophy,
  Upload,
} from 'lucide-react'
import AdminLayout from '@/components/admin/AdminLayout'
import { FormCard, FormCardHeader } from '@/components/admin/ui/Card'
import Field from '@/components/admin/ui/Field'
import { Input, TextArea } from '@/components/admin/ui/Input'
import { controlClass, primaryButtonLg, secondaryButton } from '@/components/admin/ui/styles'
import { createSlug } from '@/utils/createSlug'

const defaultBanner =
  'https://images.unsplash.com/photo-1507514604110-ba3347c457f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'

const defaultRules =
  '1. Ngựa phải có giấy chứng nhận sức khỏe hợp lệ.\n2. Jockey phải có chứng chỉ FIA hoặc tương đương.\n3. Tiền phí hoàn lại sau khi giải đấu kết thúc.\n4. Kiểm tra doping bắt buộc với ngựa thắng cuộc.'

export default function AdminTournamentCreatePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    description: '',
    location: '',
    startDate: '',
    endDate: '',
    status: 'Nháp',
    rules: defaultRules,
    banner: defaultBanner,
  })

  const slug = createSlug(form.name)
  const valid =
    form.name.trim().length > 3 &&
    form.location.trim().length > 0 &&
    form.startDate &&
    form.endDate &&
    form.startDate <= form.endDate

  const update = (key, value) => setForm((previous) => ({ ...previous, [key]: value }))

  const uploadBanner = (event) => {
    const file = event.target.files?.[0]
    if (file) update('banner', URL.createObjectURL(file))
  }

  const createTournament = () => {
    if (!valid) return

    const tournament = {
      ...form,
      id: slug || `giai-dau-${Date.now()}`,
      races: [],
    }

    navigate(`/admin/tournaments/${tournament.id}?tab=races&new=1`, {
      state: { tournament },
    })
  }

  return (
    <AdminLayout
      heading="Tạo"
      highlight="Giải đấu mới"
      subtitle="Bước 1: Khởi tạo giải đấu · Cấu hình cuộc đua & giải thưởng thực hiện sau khi tạo"
      action={
        <div className="flex flex-wrap gap-4">
          <Link to="/admin/tournaments" className={secondaryButton}>
            <ArrowLeft className="h-5 w-5" />
            Trở về danh sách
          </Link>
          <button type="button" className={secondaryButton}>
            <Save className="h-5 w-5" />
            Lưu nháp
          </button>
          <button
            type="button"
            disabled={!valid}
            onClick={createTournament}
            className={`${primaryButtonLg} disabled:cursor-not-allowed disabled:bg-[#a48123] disabled:text-white/50 disabled:shadow-none`}
          >
            <CheckCircle2 className="h-5 w-5" />
            Tạo giải đấu
          </button>
        </div>
      }
    >
      <section className="mb-9 flex gap-5 rounded-3xl border border-[#dda50e]/20 bg-gradient-to-r from-[#dda50e]/10 to-white/[0.045] p-7 text-white/72">
        <Info className="h-7 w-7 shrink-0 text-[#dda50e]" />
        <p className="text-base leading-7">
          Trang này chỉ tạo <strong className="text-[#dda50e]">thông tin cơ bản</strong> của giải đấu.
          Sau khi tạo, bạn sẽ vào trang chi tiết để <strong className="text-[#dda50e]">thêm các cuộc đua</strong>,
          cấu hình giải thưởng, lệ phí và mở đăng ký cho từng cuộc đua riêng biệt.
        </p>
      </section>

      <div className="grid items-start gap-8 xl:grid-cols-[2.05fr_1fr]">
        <FormCard>
          <FormCardHeader icon={Trophy} title="Thông tin giải đấu" subtitle="Các trường có (*) bắt buộc" />

          <form className="grid gap-7 p-8 md:grid-cols-2" onSubmit={(event) => event.preventDefault()}>
            <Field label="Tên giải đấu *" full>
              <Input
                variant="form"
                value={form.name}
                onChange={(event) => update('name', event.target.value)}
                placeholder="VD: Vietnam Grand Prix 2026"
              />
            </Field>
            <Field label="Mô tả ngắn" full>
              <TextArea
                variant="form"
                value={form.description}
                onChange={(event) => update('description', event.target.value)}
                placeholder="Giới thiệu tổng quan giải đấu..."
              />
            </Field>
            <Field label="Địa điểm *" full>
              <div className="relative">
                <MapPin className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#dda50e]" />
                <Input
                  variant="form"
                  className="pl-14"
                  value={form.location}
                  onChange={(event) => update('location', event.target.value)}
                  placeholder="Sân đua Phú Thọ, TP. HCM"
                />
              </div>
            </Field>
            <Field label="Ngày bắt đầu *">
              <DateField value={form.startDate} onChange={(event) => update('startDate', event.target.value)} />
            </Field>
            <Field label="Ngày kết thúc *">
              <DateField value={form.endDate} onChange={(event) => update('endDate', event.target.value)} />
            </Field>
            <Field label="Trạng thái">
              <select
                value={form.status}
                onChange={(event) => update('status', event.target.value)}
                className={controlClass}
              >
                <option>Nháp</option>
                <option>Đang mở đăng ký</option>
                <option>Đang diễn ra</option>
                <option>Đã kết thúc</option>
              </select>
            </Field>
            <Field label="Mã giải đấu">
              <Input variant="form" disabled value={slug} placeholder="Tự sinh từ tên" />
            </Field>
            <Field label="Tóm tắt luật giải đấu" full icon={FileText}>
              <textarea
                rows={6}
                value={form.rules}
                onChange={(event) => update('rules', event.target.value)}
                className={`${controlClass} h-auto resize-none py-4 leading-7`}
              />
              <p className="mt-3 text-sm text-white/42">
                Luật chi tiết theo từng cuộc đua có thể chỉnh sửa sau trong tab{' '}
                <span className="text-[#dda50e]">Cấu hình cuộc đua</span>.
              </p>
            </Field>
          </form>
        </FormCard>

        <div className="space-y-8">
          <FormCard>
            <FormCardHeader icon={Image} title="Banner giải đấu" subtitle="Hình ảnh quảng bá chính" />
            <div className="p-7">
              <div className="relative mb-5 h-64 overflow-hidden rounded-2xl border border-white/10">
                <img src={form.banner} alt="" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <p className="truncate text-xl font-bold">{form.name || 'Tên giải đấu sẽ hiển thị tại đây'}</p>
                  <p className="mt-1 truncate text-base text-white/70">{form.location || 'Địa điểm tổ chức'}</p>
                </div>
              </div>

              <label className="flex h-16 cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#dda50e]/55 bg-[#dda50e]/8 font-semibold text-[#dda50e] transition hover:bg-[#dda50e]/15">
                <Upload className="h-5 w-5" />
                Tải lên banner
                <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={uploadBanner} />
              </label>
              <p className="mt-4 text-center text-sm text-white/42">Khuyến nghị: 1920×600px · JPG/PNG · &lt; 5MB</p>
            </div>
          </FormCard>

          <FormCard className="p-7">
            <div className="mb-6 flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-[#dda50e]" />
              <h2 className="text-xl font-bold">Sau khi tạo</h2>
            </div>
            <ul className="space-y-5 text-base text-white/68">
              {[
                'Vào trang chi tiết giải đấu',
                'Thêm nhiều cuộc đua (1 giải có thể có nhiều cuộc đua)',
                'Cấu hình giải thưởng & lệ phí cho từng cuộc đua',
                'Mở đăng ký cho từng cuộc đua riêng biệt',
              ].map((item) => (
                <li key={item} className="flex items-start gap-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                  {item}
                </li>
              ))}
            </ul>
          </FormCard>
        </div>
      </div>
    </AdminLayout>
  )
}

function DateField(props) {
  return (
    <div className="relative">
      <CalendarDays className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#dda50e]" />
      <Input {...props} variant="form" type="date" className="pl-14" />
    </div>
  )
}

