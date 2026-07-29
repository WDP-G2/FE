import { Upload, X } from "lucide-react";
import { GlassCard, GhostButton, PrimaryButton, TextInput } from "../../../admin/AdminLayout";
import { HorseOwnerFormField } from "../HorseOwnerFormField";

export function HorseOwnerHorseModal({
  editTarget,
  form,
  onChangeForm,
  onClose,
  onSave,
  saving,
}) {
  const updateField = (field, value) => {
    onChangeForm({ ...form, [field]: value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <GlassCard className="w-full max-w-md">
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <h2 className="font-bold text-white">
            {editTarget ? "Chỉnh sửa thông tin ngựa" : "Thêm ngựa mới"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 transition-all hover:bg-white/10"
          >
            <X className="h-4 w-4 text-white/60" />
          </button>
        </div>
        <div className="max-h-[70vh] space-y-4 overflow-y-auto p-5">
          <HorseOwnerFormField label="Tên ngựa *">
            <TextInput
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Nhập tên ngựa"
            />
          </HorseOwnerFormField>
          <div className="grid grid-cols-2 gap-3">
            <HorseOwnerFormField label="Giống ngựa">
              <TextInput
                value={form.breed}
                onChange={(event) => updateField("breed", event.target.value)}
                placeholder="Thoroughbred..."
              />
            </HorseOwnerFormField>
            <HorseOwnerFormField label="Màu lông">
              <TextInput
                value={form.color}
                onChange={(event) => updateField("color", event.target.value)}
                placeholder="Hồng mã..."
              />
            </HorseOwnerFormField>
            <HorseOwnerFormField label="Tuổi">
              <TextInput
                type="number"
                min="0"
                value={form.age}
                onChange={(event) => updateField("age", event.target.value)}
                placeholder="5"
              />
            </HorseOwnerFormField>
            <HorseOwnerFormField label="Giới tính">
              <select
                value={form.gender}
                onChange={(event) => updateField("gender", event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#17191d] px-4 py-2.5 text-sm text-white focus:border-[#D4A017] focus:outline-none focus:ring-2 focus:ring-[#D4A017]/20"
              >
                <option value="" className="bg-[#17191d] text-white/70">
                  Chọn giới tính
                </option>
                <option value="MALE" className="bg-[#17191d] text-white">
                  Đực
                </option>
                <option value="FEMALE" className="bg-[#17191d] text-white">
                  Cái
                </option>
              </select>
            </HorseOwnerFormField>
            <HorseOwnerFormField label="Chiều cao (cm)">
              <TextInput
                type="number"
                min="0"
                value={form.height}
                onChange={(event) => updateField("height", event.target.value)}
                placeholder="165"
              />
            </HorseOwnerFormField>
            <HorseOwnerFormField label="Cân nặng (kg)">
              <TextInput
                type="number"
                min="0"
                value={form.weight}
                onChange={(event) => updateField("weight", event.target.value)}
                placeholder="480"
              />
            </HorseOwnerFormField>
          </div>
          <HorseOwnerFormField label="Ảnh ngựa">
            <input
              type="file"
              accept="image/*"
              onChange={(event) => updateField("imageFile", event.target.files?.[0] ?? null)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white file:mr-3 file:rounded-lg file:border-0 file:bg-[#D4A017] file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white"
            />
          </HorseOwnerFormField>
          <HorseOwnerFormField label="Giấy chứng nhận">
            <input
              type="file"
              onChange={(event) =>
                updateField("documentFile", event.target.files?.[0] ?? null)
              }
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white file:mr-3 file:rounded-lg file:border-0 file:bg-[#D4A017] file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white"
            />
          </HorseOwnerFormField>
        </div>
        <div className="flex items-center justify-end gap-3 border-t border-white/10 p-5">
          <GhostButton onClick={onClose} disabled={saving}>
            Hủy
          </GhostButton>
          <PrimaryButton onClick={onSave} disabled={saving} icon={Upload}>
            {saving ? "Đang lưu..." : editTarget ? "Lưu thay đổi" : "Thêm ngựa"}
          </PrimaryButton>
        </div>
      </GlassCard>
    </div>
  );
}
