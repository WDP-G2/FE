import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Edit2,
  Eye,
  PawPrint,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { HorseOwnerLayout } from "./HorseOwnerLayout";
import {
  GlassCard,
  Pill,
  PrimaryButton,
  GhostButton,
  TextInput,
} from "../admin/AdminLayout";
import { horseService } from "@/services/horseService";

const EMPTY_FORM = {
  name: "",
  breed: "",
  gender: "",
  birthDate: "",
  ownerName: "",
  notes: "",
  healthStatus: "Chưa cập nhật",
  racingStatus: "can-race",
  imageUrl: "",
  licenseImageUrl: "",
};

const GENDER_OPTIONS = ["Đực", "Cái"];

function formatDate(value) {
  if (!value) return "Chưa cập nhật";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa cập nhật";
  return date.toLocaleDateString("vi-VN");
}

function statusLabel(racingStatus) {
  return racingStatus === "cannot-race" ? "Không thể đua" : "Có thể đua";
}

function statusTone(racingStatus) {
  return racingStatus === "cannot-race" ? "red" : "green";
}

function previewUrl(file, fallback) {
  if (file) return URL.createObjectURL(file);
  return fallback || "";
}

function formatNumber(value) {
  return new Intl.NumberFormat("vi-VN").format(Number(value || 0));
}

function buildHistoryItems(horse) {
  const items = [];

  if (horse?.history?.length) {
    horse.history.forEach((entry, index) => {
      items.push({
        id: `${horse.id}-history-${index}`,
        title:
          typeof entry === "string"
            ? entry
            : entry?.title || `Mốc ${index + 1}`,
        description:
          typeof entry === "string"
            ? ""
            : entry?.description || entry?.notes || "",
        at: typeof entry === "object" ? entry?.at || entry?.date || "" : "",
      });
    });
  }

  if (horse?.createdAt) {
    items.unshift({
      id: `${horse.id}-created`,
      title: "Tạo hồ sơ",
      description: `Hồ sơ ngựa được tạo vào ${formatDate(horse.createdAt)}`,
      at: horse.createdAt,
    });
  }

  if (horse?.updatedAt) {
    items.unshift({
      id: `${horse.id}-updated`,
      title: "Cập nhật gần nhất",
      description: `Cập nhật gần nhất vào ${formatDate(horse.updatedAt)}`,
      at: horse.updatedAt,
    });
  }

  return items;
}

function getHorseApiErrorMessage(error) {
  const payload = error?.response?.data;
  if (typeof payload === "string") return payload;
  if (typeof payload?.error === "string") {
    const raw = payload.error;
    if (raw.trim().startsWith("{")) {
      try {
        const parsed = JSON.parse(raw);
        if (typeof parsed?.error?.message === "string")
          return parsed.error.message;
        if (typeof parsed?.message === "string") return parsed.message;
      } catch {
        // fall through to the raw string
      }
    }
    return raw;
  }
  if (typeof payload?.error?.message === "string") return payload.error.message;
  return error?.message || "Không thể lưu ngựa";
}

export function HorseOwnerHorses() {
  const [horses, setHorses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [licenseFile, setLicenseFile] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [detailTarget, setDetailTarget] = useState(null);
  const navigate = useNavigate();

  const loadHorses = useCallback(async () => {
    try {
      setLoading(true);
      const items = await horseService.listMine({ search });
      setHorses(items);
    } catch (error) {
      console.error("Error loading horses:", error);
      toast.error("Không thể tải danh sách ngựa");
      setHorses([]);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadHorses();
  }, [loadHorses]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return horses;
    return horses.filter((horse) => {
      return (
        horse.name.toLowerCase().includes(query) ||
        horse.breed.toLowerCase().includes(query) ||
        horse.ownerName.toLowerCase().includes(query)
      );
    });
  }, [horses, search]);

  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setImageFile(null);
    setLicenseFile(null);
    setShowModal(true);
  };

  const openEdit = (horse) => {
    setEditTarget(horse);
    setForm({
      name: horse.name || "",
      breed: horse.breed || "",
      gender: horse.gender || "",
      birthDate: horse.birthDate ? String(horse.birthDate).slice(0, 10) : "",
      ownerName: horse.ownerName || "",
      notes: horse.notes || "",
      healthStatus: horse.healthStatus || "Chưa cập nhật",
      racingStatus: horse.racingStatus || "can-race",
      imageUrl: horse.imageUrl || "",
      licenseImageUrl: horse.licenseImageUrl || "",
    });
    setImageFile(null);
    setLicenseFile(null);
    setShowModal(true);
  };

  const openDetail = (horse) => {
    navigate(`/horse-owner/horses/${horse.id}`);
  };

  const closeDetail = () => {
    setDetailTarget(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditTarget(null);
    setImageFile(null);
    setLicenseFile(null);
    setForm(EMPTY_FORM);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Vui lòng nhập tên ngựa");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: form.name.trim(),
        breed: form.breed.trim(),
        gender: form.gender.trim(),
        birthDate: form.birthDate || undefined,
        notes: form.notes.trim(),
      };

      if (editTarget) {
        payload.healthStatus = form.healthStatus;
        payload.racingStatus = form.racingStatus;
        await horseService.update(
          editTarget.id,
          payload,
          imageFile,
          licenseFile,
        );
        toast.success("Cập nhật ngựa thành công");
      } else {
        await horseService.create(payload, imageFile, licenseFile);
        toast.success("Thêm ngựa mới thành công");
      }

      closeModal();
      await loadHorses();
    } catch (error) {
      console.error(error);
      toast.error(getHorseApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (horse) => {
    if (
      !window.confirm(
        `Xóa ngựa "${horse.name}"? Hành động này không thể hoàn tác.`,
      )
    )
      return;

    try {
      await horseService.remove(horse.id);
      toast.success("Đã xóa ngựa");
      await loadHorses();
    } catch (error) {
      console.error(error);
      toast.error(getHorseApiErrorMessage(error));
    }
  };

  return (
    <HorseOwnerLayout
      title="Horse Owner · Quản lý ngựa"
      subtitle={`${horses.length} ngựa trong đội`}
      actions={
        <PrimaryButton icon={Plus} onClick={openAdd}>
          Thêm ngựa
        </PrimaryButton>
      }
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm theo tên, giống hoặc chủ ngựa..."
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#D4A017]/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <div className="col-span-full rounded-3xl border border-white/10 bg-white/[0.045] p-10 text-center text-white/50">
            Đang tải danh sách ngựa...
          </div>
        ) : (
          filtered.map((horse) => (
            <GlassCard key={horse.id}>
              <div className="relative h-44 overflow-hidden rounded-t-2xl bg-gradient-to-br from-[#D4A017]/15 to-[#0F1E3A]">
                <img
                  src={horse.imageUrl}
                  alt={horse.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                <div className="absolute left-4 top-4 flex gap-2">
                  <Pill tone={statusTone(horse.racingStatus)}>
                    {statusLabel(horse.racingStatus)}
                  </Pill>
                  <Pill tone="gold">{horse.healthStatus}</Pill>
                </div>
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-bold text-white">
                      {horse.name}
                    </h3>
                    <p className="truncate text-sm text-white/70">
                      {horse.breed || "Chưa cập nhật"} ·{" "}
                      {horse.gender || "Chưa rõ giới tính"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => openDetail(horse)}
                      className="rounded-xl border border-white/10 bg-white/10 p-2 text-white/80 transition hover:bg-white/20"
                      aria-label="Xem chi tiết"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(horse)}
                      className="rounded-xl border border-white/10 bg-white/10 p-2 text-white/80 transition hover:bg-white/20"
                      aria-label="Chỉnh sửa"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(horse)}
                      className="rounded-xl border border-rose-400/30 bg-rose-500/10 p-2 text-rose-300 transition hover:bg-rose-500/20"
                      aria-label="Xóa"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-5">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <MetaItem
                    label="Ngày sinh"
                    value={formatDate(horse.birthDate)}
                  />
                  <MetaItem
                    label="Chủ ngựa"
                    value={horse.ownerName || "Chưa cập nhật"}
                  />
                  <MetaItem
                    label="Tài liệu"
                    value={horse.licenseImageUrl ? "Đã tải lên" : "Chưa có"}
                  />
                  <MetaItem
                    label="Tình trạng"
                    value={horse.canRace ? "Được phép đua" : "Không được đua"}
                  />
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="text-xs uppercase tracking-wider text-white/40">
                    Ghi chú
                  </div>
                  <p className="mt-1 line-clamp-3 text-sm text-white/70">
                    {horse.notes || "Không có ghi chú"}
                  </p>
                </div>
              </div>
            </GlassCard>
          ))
        )}

        {!loading && filtered.length === 0 && (
          <div className="col-span-full rounded-3xl border border-dashed border-white/10 bg-white/[0.03] py-16 text-center text-white/45">
            <PawPrint className="mx-auto mb-3 h-12 w-12 opacity-30" />
            <p>Không tìm thấy ngựa nào</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <GlassCard className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {editTarget ? "Chỉnh sửa ngựa" : "Thêm ngựa mới"}
                </h2>
                <p className="text-sm text-white/45">
                  Cập nhật thông tin, ảnh ngựa và tài liệu liên quan
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 transition hover:bg-white/10"
              >
                <X className="h-4 w-4 text-white/60" />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Tên ngựa *">
                  <TextInput
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ví dụ: Golden Thunder"
                  />
                </Field>
                <Field label="Giống ngựa">
                  <TextInput
                    value={form.breed}
                    onChange={(e) =>
                      setForm({ ...form, breed: e.target.value })
                    }
                    placeholder="Thoroughbred"
                  />
                </Field>
                <Field label="Giới tính">
                  <select
                    value={form.gender}
                    onChange={(e) =>
                      setForm({ ...form, gender: e.target.value })
                    }
                    className="h-14 w-full rounded-2xl border border-white/10 bg-[#162338] px-4 text-white outline-none focus:border-[#dda50e]/60"
                  >
                    <option value="">Chọn giới tính</option>
                    {GENDER_OPTIONS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Ngày sinh">
                  <TextInput
                    type="date"
                    value={form.birthDate}
                    onChange={(e) =>
                      setForm({ ...form, birthDate: e.target.value })
                    }
                  />
                </Field>
                <Field label="Tình trạng sức khỏe" disabled={!editTarget}>
                  <select
                    value={form.healthStatus}
                    onChange={(e) =>
                      setForm({ ...form, healthStatus: e.target.value })
                    }
                    disabled={!editTarget}
                    className="h-14 w-full rounded-2xl border border-white/10 bg-[#162338] px-4 text-white outline-none focus:border-[#dda50e]/60 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="Chưa cập nhật">Chưa cập nhật</option>
                    <option value="Tốt">Tốt</option>
                    <option value="Trung bình">Trung bình</option>
                    <option value="Cần theo dõi">Cần theo dõi</option>
                    <option value="Không đạt">Không đạt</option>
                  </select>
                </Field>
              </div>

              <Field label="Ghi chú">
                <textarea
                  rows={4}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Mô tả tình trạng, lịch tập, lưu ý..."
                  className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#dda50e]/60"
                />
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <UploadField
                  label="Ảnh ngựa"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={(file) => setImageFile(file)}
                  preview={previewUrl(imageFile, form.imageUrl)}
                  emptyText="Chọn ảnh ngựa hoặc dùng URL đã lưu"
                />
                <UploadField
                  label="Giấy phép / tài liệu"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  onChange={(file) => setLicenseFile(file)}
                  preview={previewUrl(licenseFile, form.licenseImageUrl)}
                  emptyText="Chọn ảnh giấy phép hoặc tài liệu liên quan"
                />
              </div>

              {editTarget && (
                <Field label="Trạng thái đua">
                  <select
                    value={form.racingStatus}
                    onChange={(e) =>
                      setForm({ ...form, racingStatus: e.target.value })
                    }
                    className="h-14 w-full rounded-2xl border border-white/10 bg-[#162338] px-4 text-white outline-none focus:border-[#dda50e]/60"
                  >
                    <option value="can-race">Có thể đua</option>
                    <option value="cannot-race">Không thể đua</option>
                  </select>
                </Field>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-white/10 p-5">
              <GhostButton onClick={closeModal}>Hủy</GhostButton>
              <PrimaryButton onClick={handleSave} disabled={saving}>
                {saving
                  ? "Đang lưu..."
                  : editTarget
                    ? "Lưu thay đổi"
                    : "Thêm ngựa"}
              </PrimaryButton>
            </div>
          </GlassCard>
        </div>
      )}

      {detailTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <GlassCard className="max-h-[90vh] w-full max-w-4xl overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5">
              <div>
                <h2 className="text-xl font-bold text-white">Chi tiết ngựa</h2>
                <p className="text-sm text-white/45">
                  Thông tin, giấy phép, thành tích và lịch sử
                </p>
              </div>
              <button
                type="button"
                onClick={closeDetail}
                className="rounded-lg p-2 transition hover:bg-white/10"
              >
                <X className="h-4 w-4 text-white/60" />
              </button>
            </div>

            <div className="grid gap-5 p-5 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-5">
                <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
                  <div className="relative h-64">
                    <img
                      src={detailTarget.imageUrl}
                      alt={detailTarget.name}
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                    <div className="absolute left-5 top-5 flex gap-2">
                      <Pill tone={statusTone(detailTarget.racingStatus)}>
                        {statusLabel(detailTarget.racingStatus)}
                      </Pill>
                      <Pill tone="gold">{detailTarget.healthStatus}</Pill>
                    </div>
                    <div className="absolute bottom-5 left-5 right-5">
                      <h3 className="text-2xl font-bold text-white">
                        {detailTarget.name}
                      </h3>
                      <p className="text-sm text-white/70">
                        {detailTarget.breed || "Chưa cập nhật"} ·{" "}
                        {detailTarget.gender || "Chưa rõ giới tính"}
                      </p>
                    </div>
                  </div>
                </section>

                <section className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-[#dda50e]" />
                    <h4 className="text-base font-bold text-white">
                      Thành tích & chỉ số
                    </h4>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <StatTile
                      label="Số trận"
                      value={formatNumber(detailTarget.races)}
                    />
                    <StatTile
                      label="Số thắng"
                      value={formatNumber(detailTarget.wins)}
                    />
                    <StatTile
                      label="Tỷ lệ thắng"
                      value={
                        detailTarget.races > 0
                          ? `${Math.round((detailTarget.wins / detailTarget.races) * 100)}%`
                          : "0%"
                      }
                    />
                  </div>
                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-xs uppercase tracking-wider text-white/40">
                      Thành tích nổi bật
                    </div>
                    {detailTarget.achievements?.length ? (
                      <ul className="mt-3 space-y-2 text-sm text-white/75">
                        {detailTarget.achievements.map((item, index) => (
                          <li
                            key={`${detailTarget.id}-achievement-${index}`}
                            className="flex gap-2"
                          >
                            <span className="mt-1 h-2 w-2 rounded-full bg-[#dda50e]" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm text-white/55">
                        Chưa có dữ liệu thành tích.
                      </p>
                    )}
                  </div>
                </section>

                <section className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
                  <h4 className="mb-3 text-base font-bold text-white">
                    Lịch sử
                  </h4>
                  {buildHistoryItems(detailTarget).length ? (
                    <div className="space-y-3">
                      {buildHistoryItems(detailTarget).map((item) => (
                        <div
                          key={item.id}
                          className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="font-semibold text-white">
                                {item.title}
                              </div>
                              {item.description && (
                                <p className="mt-1 text-sm text-white/60">
                                  {item.description}
                                </p>
                              )}
                            </div>
                            <div className="text-xs text-white/40">
                              {formatDate(item.at)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-white/55">Chưa có lịch sử.</p>
                  )}
                </section>
              </div>

              <div className="space-y-5">
                <section className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
                  <h4 className="mb-4 text-base font-bold text-white">
                    Thông tin
                  </h4>
                  <div className="space-y-3 text-sm">
                    <DetailRow label="Tên" value={detailTarget.name} />
                    <DetailRow
                      label="Slug"
                      value={detailTarget.slug || "Chưa cập nhật"}
                    />
                    <DetailRow
                      label="Ngày sinh"
                      value={formatDate(detailTarget.birthDate)}
                    />
                    <DetailRow
                      label="Chủ ngựa"
                      value={detailTarget.ownerName || "Chưa cập nhật"}
                    />
                    <DetailRow
                      label="Trạng thái đua"
                      value={statusLabel(detailTarget.racingStatus)}
                    />
                    <DetailRow
                      label="Sức khỏe"
                      value={detailTarget.healthStatus}
                    />
                    <DetailRow
                      label="Tạo lúc"
                      value={formatDate(detailTarget.createdAt)}
                    />
                    <DetailRow
                      label="Cập nhật"
                      value={formatDate(detailTarget.updatedAt)}
                    />
                  </div>
                </section>

                <section className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
                  <h4 className="mb-4 text-base font-bold text-white">
                    Giấy phép & tài liệu
                  </h4>
                  {detailTarget.licenseImageUrl ? (
                    <a
                      href={detailTarget.licenseImageUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="block overflow-hidden rounded-2xl border border-white/10"
                    >
                      <img
                        src={detailTarget.licenseImageUrl}
                        alt="Giấy phép"
                        className="h-56 w-full object-cover"
                      />
                    </a>
                  ) : (
                    <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.03] text-sm text-white/45">
                      Chưa có giấy phép / tài liệu.
                    </div>
                  )}
                </section>

                <section className="rounded-3xl border border-white/10 bg-white/[0.045] p-5">
                  <h4 className="mb-3 text-base font-bold text-white">
                    Ghi chú
                  </h4>
                  <p className="whitespace-pre-line text-sm leading-6 text-white/70">
                    {detailTarget.notes || "Không có ghi chú."}
                  </p>
                </section>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </HorseOwnerLayout>
  );
}

function MetaItem({ label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <div className="text-[10px] uppercase tracking-wider text-white/40">
        {label}
      </div>
      <div className="mt-1 truncate text-sm font-semibold text-white">
        {value}
      </div>
    </div>
  );
}

function Field({ label, children, disabled = false }) {
  return (
    <div className={`space-y-1.5 ${disabled ? "opacity-70" : ""}`}>
      <label className="text-xs font-semibold uppercase tracking-wider text-white/50">
        {label}
      </label>
      {children}
    </div>
  );
}

function UploadField({ label, accept, onChange, preview, emptyText }) {
  return (
    <div className="space-y-2 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center justify-between gap-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-white/50">
          {label}
        </label>
        <Upload className="h-4 w-4 text-white/40" />
      </div>
      <input
        type="file"
        accept={accept}
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
        className="w-full rounded-xl border border-dashed border-white/15 bg-white/[0.03] px-3 py-2 text-sm text-white/70 file:mr-3 file:rounded-lg file:border-0 file:bg-[#dda50e] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
      />
      {preview ? (
        <div className="overflow-hidden rounded-xl border border-white/10">
          <img src={preview} alt={label} className="h-40 w-full object-cover" />
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.03] px-4 text-center text-sm text-white/40">
          {emptyText}
        </div>
      )}
    </div>
  );
}

function StatTile({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-center">
      <div className="text-[10px] uppercase tracking-wider text-white/40">
        {label}
      </div>
      <div className="mt-2 text-2xl font-bold text-[#dda50e]">{value}</div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <span className="text-white/45">{label}</span>
      <span className="text-right font-semibold text-white">{value}</span>
    </div>
  );
}
