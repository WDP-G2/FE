import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  FileText,
  Image,
  Info,
  Save,
  Sparkles,
  Trophy,
  Upload,
} from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { FormCard, FormCardHeader } from "@/components/ui/Card";
import Field from "@/components/ui/Field";
import { Input, Select, TextArea } from "@/components/ui/Input";
import {
  controlClass,
  primaryButtonLg,
  secondaryButton,
} from "@/components/ui/styles";
import { tournamentService } from "@/services/tournamentService";
import { locationSettingsService } from "@/services/locationSettingsService";
import { systemSettingsService } from "@/services/systemSettingsService";
import { getApiErrorMessage } from "@/utils/apiError";

const defaultBanner =
  "https://images.unsplash.com/photo-1507514604110-ba3347c457f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080";

function dateTime(date, time) {
  return `${date}T${time}:00`;
}

function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date, days) {
  if (!date) return "";
  const value = new Date(`${date}T00:00:00`);
  value.setDate(value.getDate() + days);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildTournamentPayload(form, bannerUrl) {
  return {
    name: form.name.trim(),
    description: form.description.trim(),
    location: form.location.trim(),
    provinceId: form.provinceId || null,
    bannerUrl,
    registrationOpenAt: dateTime(form.registrationOpenDate, "08:00"),
    registrationCloseAt: dateTime(form.registrationCloseDate, "17:00"),
    startAt: dateTime(form.startDate, "08:00"),
    endAt: dateTime(form.endDate, "18:00"),
    checkInDeadlineAt: dateTime(form.registrationCloseDate, "17:30"),
    rules: form.rules,
    minTeams: Number(form.minTeams),
    maxTeams: Number(form.maxTeams),
    minHorsesPerOwner: Number(form.minHorsesPerOwner),
    maxHorsesPerOwner: Number(form.maxHorsesPerOwner),
    jockeyChallengeEnabled: false,
    jockeyChallengeFirstPoints: 3,
    jockeyChallengeSecondPoints: 2,
    jockeyChallengeThirdPoints: 1,
    jockeyChallengePrizes: [],
  };
}

export default function AdminTournamentCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    description: "",
    location: "",
    provinceId: "",
    registrationOpenDate: "",
    registrationCloseDate: "",
    startDate: "",
    endDate: "",
    rules: "",
    banner: defaultBanner,
    minTeams: 1,
    maxTeams: 100,
    minHorsesPerOwner: 4,
    maxHorsesPerOwner: 10,
  });
  const [bannerFile, setBannerFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const [loadingProvinces, setLoadingProvinces] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadDefaultRules() {
      try {
        const response = await systemSettingsService.getAdminSettings();
        if (!cancelled) {
          setForm((previous) => ({
            ...previous,
            rules: response.data.defaultTournamentRules || "",
          }));
        }
      } catch {
        // Keep empty rules; backend will apply its own default on create.
      }
    }

    loadDefaultRules();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadProvinces() {
      try {
        setLoadingProvinces(true);
        const response = await locationSettingsService.getProvinces();
        if (!cancelled) {
          setProvinces(response.data.filter((province) => province.active));
        }
      } catch {
        if (!cancelled) setProvinces([]);
      } finally {
        if (!cancelled) setLoadingProvinces(false);
      }
    }

    loadProvinces();
    return () => {
      cancelled = true;
    };
  }, []);

  const today = getTodayDate();
  const registrationOpenMin = addDays(today, 1);
  const startDateMin = addDays(today, 7);
  const registrationCloseMax = form.startDate
    ? addDays(form.startDate, -2)
    : "";
  const endDateMin = form.startDate ? addDays(form.startDate, 1) : startDateMin;
  const valid =
    form.name.trim().length > 3 &&
    Boolean(form.provinceId) &&
    form.registrationOpenDate &&
    form.registrationCloseDate &&
    form.startDate &&
    form.endDate &&
    form.registrationOpenDate >= registrationOpenMin &&
    form.registrationOpenDate <= form.registrationCloseDate &&
    (!registrationCloseMax ||
      form.registrationCloseDate <= registrationCloseMax) &&
    form.startDate >= startDateMin &&
    form.endDate > form.startDate &&
    Number(form.minTeams) > 0 &&
    Number(form.maxTeams) >= Number(form.minTeams) &&
    Number(form.minHorsesPerOwner) > 0 &&
    Number(form.maxHorsesPerOwner) >= Number(form.minHorsesPerOwner);

  const update = (key, value) =>
    setForm((previous) => {
      if (key === "startDate") {
        const nextRegistrationCloseMax = addDays(value, -2);
        return {
          ...previous,
          startDate: value,
          endDate:
            previous.endDate && previous.endDate <= value
              ? addDays(value, 1)
              : previous.endDate,
          registrationCloseDate:
            previous.registrationCloseDate &&
            previous.registrationCloseDate > nextRegistrationCloseMax
              ? nextRegistrationCloseMax
              : previous.registrationCloseDate,
        };
      }

      if (key === "registrationOpenDate") {
        return {
          ...previous,
          registrationOpenDate: value,
          registrationCloseDate:
            previous.registrationCloseDate &&
            previous.registrationCloseDate < value
              ? value
              : previous.registrationCloseDate,
        };
      }

      return { ...previous, [key]: value };
    });

  const uploadBanner = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setBannerFile(file);
    update("banner", URL.createObjectURL(file));
  };

  const createTournament = async () => {
    if (!valid || submitting) return;

    try {
      setSubmitting(true);
      let bannerUrl = form.banner;

      if (bannerFile) {
        const uploadResponse =
          await tournamentService.uploadTournamentBanner(bannerFile);
        bannerUrl = uploadResponse?.bannerUrl || bannerUrl;
      }

      const response = await tournamentService.createTournament(
        buildTournamentPayload(form, bannerUrl),
      );
      const tournamentId = response.raw?.id ?? response.data.id;

      toast.success("Tạo giải đấu thành công");
      navigate(`/admin/tournaments/${tournamentId}?tab=races&new=1`, {
        state: { tournament: response.data },
      });
    } catch (error) {
      toast.error(getApiErrorMessage(error) || "Không thể tạo giải đấu");
    } finally {
      setSubmitting(false);
    }
  };

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
          <button
            type="button"
            disabled={!valid || submitting}
            onClick={createTournament}
            className={secondaryButton}
          >
            <Save className="h-5 w-5" />
            {submitting ? "Đang lưu..." : "Lưu nháp"}
          </button>
        </div>
      }
    >
      <section className="mb-9 flex gap-5 rounded-3xl border border-[#dda50e]/20 bg-gradient-to-r from-[#dda50e]/10 to-white/[0.045] p-7 text-white/72">
        <Info className="h-7 w-7 shrink-0 text-[#dda50e]" />
        <p className="text-base leading-7">
          Trang này chỉ tạo{" "}
          <strong className="text-[#dda50e]">thông tin cơ bản</strong> của giải
          đấu. Sau khi tạo, bạn sẽ vào trang chi tiết để{" "}
          <strong className="text-[#dda50e]">thêm các cuộc đua</strong>, cấu
          hình giải thưởng, lệ phí và mở đăng ký cho từng cuộc đua riêng biệt.
        </p>
      </section>

      <div className="grid items-start gap-8 xl:grid-cols-[2.05fr_1fr]">
        <FormCard>
          <FormCardHeader
            icon={Trophy}
            title="Thông tin giải đấu"
            subtitle="Các trường có (*) bắt buộc"
          />

          <form
            className="grid gap-7 p-8 md:grid-cols-2"
            onSubmit={(event) => event.preventDefault()}
          >
            <Field label="Tên giải đấu *" full>
              <Input
                variant="form"
                value={form.name}
                onChange={(event) => update("name", event.target.value)}
                placeholder="VD: Vietnam Grand Prix 2026"
              />
            </Field>
            <Field label="Mô tả ngắn" full>
              <TextArea
                variant="form"
                value={form.description}
                onChange={(event) => update("description", event.target.value)}
                placeholder="Giới thiệu tổng quan giải đấu..."
              />
            </Field>
            <Field label="Tỉnh/Thành phố *">
              <Select
                value={form.provinceId}
                onChange={(event) => {
                  const provinceId = event.target.value;
                  const province = provinces.find(
                    (item) => item.id === provinceId,
                  );
                  setForm((previous) => ({
                    ...previous,
                    provinceId,
                    location: province?.name || "",
                  }));
                }}
                disabled={loadingProvinces}
              >
                <option value="">
                  {loadingProvinces ? "Đang tải..." : "Chọn tỉnh/thành phố"}
                </option>
                {provinces.map((province) => (
                  <option key={province.id} value={province.id}>
                    {province.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Ngày bắt đầu *">
              <DateField
                value={form.startDate}
                min={startDateMin}
                onChange={(event) => update("startDate", event.target.value)}
              />
            </Field>
            <Field label="Ngày kết thúc *">
              <DateField
                value={form.endDate}
                min={endDateMin}
                onChange={(event) => update("endDate", event.target.value)}
              />
            </Field>
            <Field label="Ngày mở đăng ký *">
              <DateField
                value={form.registrationOpenDate}
                min={registrationOpenMin}
                max={form.registrationCloseDate || registrationCloseMax}
                onChange={(event) =>
                  update("registrationOpenDate", event.target.value)
                }
              />
            </Field>
            <Field label="Ngày kết thúc đăng ký *">
              <DateField
                value={form.registrationCloseDate}
                min={form.registrationOpenDate || registrationOpenMin}
                max={registrationCloseMax}
                onChange={(event) =>
                  update("registrationCloseDate", event.target.value)
                }
              />
            </Field>
            <Field label="Trạng thái">
              <Input variant="form" disabled value="Nháp" />
            </Field>
            <Field label="Số đội tối thiểu">
              <Input
                variant="form"
                type="number"
                min="1"
                value={form.minTeams}
                onChange={(event) =>
                  update("minTeams", Number(event.target.value))
                }
              />
            </Field>
            <Field label="Số đội tối đa">
              <Input
                variant="form"
                type="number"
                min={Math.max(1, Number(form.minTeams))}
                value={form.maxTeams}
                onChange={(event) =>
                  update("maxTeams", Number(event.target.value))
                }
              />
            </Field>
            <Field label="Số ngựa tối thiểu / tài khoản">
              <Input
                variant="form"
                type="number"
                min="1"
                value={form.minHorsesPerOwner}
                onChange={(event) => {
                  const value = Number(event.target.value);
                  setForm((previous) => ({
                    ...previous,
                    minHorsesPerOwner: value,
                    maxHorsesPerOwner: Math.max(
                      Number(previous.maxHorsesPerOwner),
                      value,
                    ),
                  }));
                }}
              />
            </Field>
            <Field label="Số ngựa tối đa / tài khoản">
              <Input
                variant="form"
                type="number"
                min={Number(form.minHorsesPerOwner)}
                value={form.maxHorsesPerOwner}
                onChange={(event) =>
                  update("maxHorsesPerOwner", Number(event.target.value))
                }
              />
            </Field>

            <Field label="Tóm tắt luật giải đấu" full icon={FileText}>
              <textarea
                rows={6}
                value={form.rules}
                readOnly
                disabled
                className={`${controlClass} h-auto resize-none py-4 leading-7`}
              />
              <p className="mt-3 text-sm text-white/42">
                Luật được đồng bộ từ{" "}
                <span className="text-[#dda50e]">Cài đặt hệ thống → Luật mặc định</span>.
                Chỉnh sửa tại đó để áp dụng cho giải mới.
              </p>
            </Field>

            <div className="flex justify-end md:col-span-2">
              <button
                type="button"
                disabled={!valid || submitting}
                onClick={createTournament}
                className={`${primaryButtonLg} disabled:cursor-not-allowed disabled:bg-[#a48123] disabled:text-white/50 disabled:shadow-none`}
              >
                <CheckCircle2 className="h-5 w-5" />
                {submitting ? "Đang tạo..." : "Tạo giải đấu"}
              </button>
            </div>
          </form>
        </FormCard>

        <div className="space-y-8">
          <FormCard>
            <FormCardHeader
              icon={Image}
              title="Banner giải đấu"
              subtitle="Hình ảnh quảng bá chính"
            />
            <div className="p-7">
              <div className="relative mb-5 h-64 overflow-hidden rounded-2xl border border-white/10">
                <img
                  src={form.banner}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <p className="truncate text-xl font-bold">
                    {form.name || "Tên giải đấu sẽ hiển thị tại đây"}
                  </p>
                  <p className="mt-1 truncate text-base text-white/70">
                    {form.location || "Địa điểm tổ chức"}
                  </p>
                </div>
              </div>

              <label className="flex h-16 cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-[#dda50e]/55 bg-[#dda50e]/8 font-semibold text-[#dda50e] transition hover:bg-[#dda50e]/15">
                <Upload className="h-5 w-5" />
                Tải lên banner
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  onChange={uploadBanner}
                />
              </label>
              <p className="mt-4 text-center text-sm text-white/42">
                Khuyến nghị: 1920x600px · JPG/PNG · &lt; 5MB
              </p>
            </div>
          </FormCard>

          <FormCard className="p-7">
            <div className="mb-6 flex items-center gap-3">
              <Sparkles className="h-6 w-6 text-[#dda50e]" />
              <h2 className="text-xl font-bold">Sau khi tạo</h2>
            </div>
            <ul className="space-y-5 text-base text-white/68">
              {[
                "Vào trang chi tiết giải đấu",
                "Thêm nhiều cuộc đua (1 giải có thể có nhiều cuộc đua)",
                "Cấu hình giải thưởng & lệ phí cho từng cuộc đua",
                "Mở đăng ký cho từng cuộc đua riêng biệt",
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
  );
}

function DateField(props) {
  return (
    <div className="relative">
      <CalendarDays className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#dda50e]" />
      <Input {...props} variant="form" type="date" className="pl-14" />
    </div>
  );
}
