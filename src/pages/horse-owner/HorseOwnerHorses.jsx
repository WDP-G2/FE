import { useEffect, useState } from "react";
import { Edit2, FileText, PawPrint, Plus, Search, Trash2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { horseService } from "@/services/horseService";
import { getApiErrorMessage } from "@/utils/apiError";
import { GlassCard, GhostButton, Pill, PrimaryButton, TextInput } from "../admin/AdminLayout";
import { HorseOwnerLayout } from "./HorseOwnerLayout";
import { HorseOwnerFormField } from "./components/HorseOwnerFormField";
import { HorseOwnerInfoItem } from "./components/HorseOwnerInfoItem";

const emptyForm = {
  name: "",
  breed: "",
  age: "",
  gender: "",
  height: "",
  weight: "",
  color: "",
  imageFile: null,
  documentFile: null,
};

function canDeleteHorse(horse) {
  return horse.statusCode === "PENDING" || horse.statusCode === "REJECTED";
}

function canEditHorse(horse) {
  return horse.statusCode !== "APPROVED" && horse.statusCode !== "SUSPENDED";
}

export function HorseOwnerHorses() {
  const [horses, setHorses] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadHorses() {
      try {
        setLoading(true);
        const data = await horseService.getOwnerHorses();
        if (mounted) setHorses(data);
      } catch (error) {
        console.error("Không thể tải danh sách ngựa", error?.response?.data || error);
        toast.error(getApiErrorMessage(error) || "Không thể tải danh sách ngựa");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadHorses();

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = horses.filter((horse) => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return true;
    return (
      horse.name.toLowerCase().includes(keyword) ||
      horse.breed.toLowerCase().includes(keyword)
    );
  });

  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (horse) => {
    if (!canEditHorse(horse)) {
      toast.error("Ngựa đã duyệt hoặc tạm khóa không thể chỉnh sửa");
      return;
    }

    setEditTarget(horse);
    setForm({
      name: horse.name,
      breed: horse.breed,
      age: horse.age ? String(horse.age) : "",
      gender: horse.gender,
      height: horse.height ? String(horse.height) : "",
      weight: horse.weight ? String(horse.weight) : "",
      color: horse.color,
      imageFile: null,
      documentFile: null,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Vui lòng nhập tên ngựa");
      return;
    }

    try {
      setSaving(true);
      if (editTarget) {
        const updatedHorse = await horseService.updateOwnerHorse(editTarget.id, form);
        setHorses((prev) =>
          prev.map((horse) => (horse.id === editTarget.id ? updatedHorse : horse)),
        );
        toast.success("Cập nhật thông tin ngựa thành công");
      } else {
        const createdHorse = await horseService.createOwnerHorse(form);
        setHorses((prev) => [createdHorse, ...prev]);
        toast.success("Thêm ngựa mới thành công");
      }
      setShowModal(false);
    } catch (error) {
      console.error("Không thể lưu thông tin ngựa", error?.response?.data || error);
      toast.error(getApiErrorMessage(error) || "Không thể lưu thông tin ngựa");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (horse) => {
    if (!canDeleteHorse(horse)) {
      toast.error("Chỉ có thể xóa ngựa đang chờ duyệt hoặc bị từ chối");
      return;
    }

    try {
      await horseService.deleteOwnerHorse(horse.id);
      setHorses((prev) => prev.filter((item) => item.id !== horse.id));
      toast.success("Đã xóa ngựa");
    } catch (error) {
      console.error("Không thể xóa ngựa", error?.response?.data || error);
      toast.error(getApiErrorMessage(error) || "Không thể xóa ngựa");
    }
  };

  return (
    <HorseOwnerLayout
      title="Horse Owner · Quản lý ngựa"
      subtitle={`${horses.length} ngựa trong đội · Quản lý thông tin và hồ sơ duyệt`}
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
            placeholder="Tìm theo tên, giống ngựa..."
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-white/30 focus:border-[#D4A017]/50 focus:outline-none"
          />
        </div>
      </div>

      {loading ? (
        <GlassCard className="p-10 text-center text-sm text-white/60">
          Đang tải danh sách ngựa...
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((horse) => (
            <GlassCard key={horse.id}>
              <div className="relative flex h-64 items-center justify-center overflow-hidden rounded-t-2xl bg-gradient-to-br from-[#D4A017]/10 to-[#0F1E3A] md:h-72">
                {horse.imageUrl ? (
                  <img src={horse.imageUrl} alt={horse.name} className="h-full w-full object-cover object-top" />
                ) : (
                  <PawPrint className="h-20 w-20 text-[#D4A017]/30" />
                )}
                <div className="absolute right-3 top-3">
                  <Pill tone={horse.healthTone}>{horse.status}</Pill>
                </div>
              </div>

              <div className="p-5">
                <div className="mb-3 flex items-start justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white">{horse.name}</h3>
                    <p className="mt-0.5 text-[12px] text-white/50">
                      {horse.breed || "Chưa cập nhật"} · {horse.color || "Chưa cập nhật"}
                    </p>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={() => openEdit(horse)}
                      className="rounded-lg bg-white/5 p-1.5 transition-all hover:bg-[#D4A017]/15 disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={!canEditHorse(horse)}
                      title="Chỉnh sửa"
                    >
                      <Edit2 className="h-3.5 w-3.5 text-white/60 hover:text-[#D4A017]" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(horse)}
                      className="rounded-lg bg-white/5 p-1.5 transition-all hover:bg-red-500/15 disabled:cursor-not-allowed disabled:opacity-40"
                      disabled={!canDeleteHorse(horse)}
                      title="Xóa"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-white/60 hover:text-red-400" />
                    </button>
                  </div>
                </div>

                <div className="mb-4 grid grid-cols-2 gap-2">
                  <HorseOwnerInfoItem label="Tuổi" value={`${horse.age || 0} tuổi`} />
                  <HorseOwnerInfoItem label="Cân nặng" value={`${horse.weight || 0} kg`} />
                  <HorseOwnerInfoItem label="Giới tính" value={horse.gender || "Chưa cập nhật"} />
                  <HorseOwnerInfoItem label="Chiều cao" value={horse.height ? `${horse.height} cm` : "Chưa cập nhật"} />
                </div>

                {horse.reviewReason && (
                  <div className="mb-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-200">
                    {horse.reviewReason}
                  </div>
                )}

                <div className="flex items-center gap-4 rounded-xl bg-white/[0.04] p-3">
                  <div className="flex-1 text-center">
                    <div className="text-lg font-bold text-[#D4A017]">{horse.wins}</div>
                    <div className="text-[10px] text-white/50">Thắng</div>
                  </div>
                  <div className="h-8 w-px bg-white/10" />
                  <div className="flex-1 text-center">
                    <div className="text-lg font-bold text-white">{horse.races}</div>
                    <div className="text-[10px] text-white/50">Tổng race</div>
                  </div>
                  <div className="h-8 w-px bg-white/10" />
                  <div className="flex-1 text-center">
                    <div className="text-lg font-bold text-emerald-300">
                      {horse.races > 0 ? Math.round((horse.wins / horse.races) * 100) : 0}%
                    </div>
                    <div className="text-[10px] text-white/50">Tỷ lệ thắng</div>
                  </div>
                </div>

                {horse.documentUrl && (
                  <a
                    href={horse.documentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2 text-xs text-white/60 transition-all hover:bg-white/10"
                  >
                    <FileText className="h-3.5 w-3.5" /> Xem giấy chứng nhận
                  </a>
                )}
              </div>
            </GlassCard>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full py-16 text-center text-white/40">
              <PawPrint className="mx-auto mb-3 h-12 w-12 opacity-30" />
              <p>Không tìm thấy ngựa nào</p>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <GlassCard className="w-full max-w-md">
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <h2 className="font-bold text-white">
                {editTarget ? "Chỉnh sửa thông tin ngựa" : "Thêm ngựa mới"}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1.5 transition-all hover:bg-white/10"
              >
                <X className="h-4 w-4 text-white/60" />
              </button>
            </div>
            <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5">
              <HorseOwnerFormField label="Tên ngựa *">
                <TextInput
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  placeholder="Nhập tên ngựa"
                />
              </HorseOwnerFormField>
              <div className="grid grid-cols-2 gap-3">
                <HorseOwnerFormField label="Giống ngựa">
                  <TextInput
                    value={form.breed}
                    onChange={(event) => setForm({ ...form, breed: event.target.value })}
                    placeholder="Thoroughbred..."
                  />
                </HorseOwnerFormField>
                <HorseOwnerFormField label="Màu lông">
                  <TextInput
                    value={form.color}
                    onChange={(event) => setForm({ ...form, color: event.target.value })}
                    placeholder="Hồng mã..."
                  />
                </HorseOwnerFormField>
                <HorseOwnerFormField label="Tuổi">
                  <TextInput
                    type="number"
                    min="0"
                    value={form.age}
                    onChange={(event) => setForm({ ...form, age: event.target.value })}
                    placeholder="5"
                  />
                </HorseOwnerFormField>
                <HorseOwnerFormField label="Giới tính">
                  <select
                    value={form.gender}
                    onChange={(event) => setForm({ ...form, gender: event.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-[#17191d] px-4 py-2.5 text-sm text-white focus:border-[#D4A017] focus:outline-none focus:ring-2 focus:ring-[#D4A017]/20"
                  >
                    <option value="" className="bg-[#17191d] text-white/70">
                      Chọn giới tính
                    </option>
                    <option value="Đực" className="bg-[#17191d] text-white">
                      Đực
                    </option>
                    <option value="Cái" className="bg-[#17191d] text-white">
                      Cái
                    </option>
                  </select>
                </HorseOwnerFormField>
                <HorseOwnerFormField label="Chiều cao (cm)">
                  <TextInput
                    type="number"
                    min="0"
                    value={form.height}
                    onChange={(event) => setForm({ ...form, height: event.target.value })}
                    placeholder="165"
                  />
                </HorseOwnerFormField>
                <HorseOwnerFormField label="Cân nặng (kg)">
                  <TextInput
                    type="number"
                    min="0"
                    value={form.weight}
                    onChange={(event) => setForm({ ...form, weight: event.target.value })}
                    placeholder="480"
                  />
                </HorseOwnerFormField>
              </div>
              <HorseOwnerFormField label="Ảnh ngựa">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    setForm({ ...form, imageFile: event.target.files?.[0] ?? null })
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white file:mr-3 file:rounded-lg file:border-0 file:bg-[#D4A017] file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white"
                />
              </HorseOwnerFormField>
              <HorseOwnerFormField label="Giấy chứng nhận">
                <input
                  type="file"
                  onChange={(event) =>
                    setForm({ ...form, documentFile: event.target.files?.[0] ?? null })
                  }
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white file:mr-3 file:rounded-lg file:border-0 file:bg-[#D4A017] file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white"
                />
              </HorseOwnerFormField>
            </div>
            <div className="flex items-center justify-end gap-3 border-t border-white/10 p-5">
              <GhostButton onClick={() => setShowModal(false)} disabled={saving}>
                Hủy
              </GhostButton>
              <PrimaryButton onClick={handleSave} disabled={saving} icon={Upload}>
                {saving ? "Đang lưu..." : editTarget ? "Lưu thay đổi" : "Thêm ngựa"}
              </PrimaryButton>
            </div>
          </GlassCard>
        </div>
      )}
    </HorseOwnerLayout>
  );
}
