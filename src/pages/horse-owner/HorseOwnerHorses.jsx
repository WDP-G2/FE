import { useState } from "react";
import { PawPrint, Plus, Edit2, Trash2, Upload, Search, X } from "lucide-react";
import { HorseOwnerLayout } from "./HorseOwnerLayout";
import {
  GlassCard,
  Pill,
  PrimaryButton,
  GhostButton,
  TextInput,
} from "../admin/AdminLayout";
import { horses as initialHorses } from "./data";
import { toast } from "sonner";
import { HorseOwnerInfoItem } from "./components/HorseOwnerInfoItem";
import { HorseOwnerFormField } from "./components/HorseOwnerFormField";

export function HorseOwnerHorses() {
  const [horses, setHorses] = useState(initialHorses);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState({
    name: "",
    breed: "",
    age: "",
    weight: "",
    color: "",
    health: "Tốt",
  });

  const filtered = horses.filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      h.breed.toLowerCase().includes(search.toLowerCase()),
  );

  const openAdd = () => {
    setEditTarget(null);
    setForm({
      name: "",
      breed: "",
      age: "",
      weight: "",
      color: "",
      health: "Tốt",
    });
    setShowModal(true);
  };

  const openEdit = (h) => {
    setEditTarget(h);
    setForm({
      name: h.name,
      breed: h.breed,
      age: String(h.age),
      weight: String(h.weight),
      color: h.color,
      health: h.health,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast.error("Vui lòng nhập tên ngựa");
      return;
    }
    if (editTarget) {
      setHorses((prev) =>
        prev.map((h) =>
          h.id === editTarget.id
            ? {
                ...h,
                name: form.name,
                breed: form.breed,
                age: Number(form.age),
                weight: Number(form.weight),
                color: form.color,
                health: form.health,
                healthTone: form.health === "Tốt" ? "green" : "gold",
              }
            : h,
        ),
      );
      toast.success("Cập nhật thông tin ngựa thành công");
    } else {
      const newHorse = {
        id: `h${Date.now()}`,
        name: form.name,
        breed: form.breed,
        age: Number(form.age) || 0,
        weight: Number(form.weight) || 0,
        color: form.color,
        health: form.health,
        healthTone: form.health === "Tốt" ? "green" : "gold",
        wins: 0,
        races: 0,
        image: null,
        jockey: null,
        status: "Đang hoạt động",
      };
      setHorses((prev) => [newHorse, ...prev]);
      toast.success("Thêm ngựa mới thành công");
    }
    setShowModal(false);
  };

  const handleDelete = (id) => {
    setHorses((prev) => prev.filter((h) => h.id !== id));
    toast.success("Đã xóa ngựa");
  };

  return (
    <HorseOwnerLayout
      title="Horse Owner · Quản lý ngựa"
      subtitle={`${horses.length} ngựa trong đội · Quản lý thông tin và sức khỏe`}
      actions={
        <PrimaryButton icon={Plus} onClick={openAdd}>
          Thêm ngựa
        </PrimaryButton>
      }
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, giống ngựa..."
            className="pl-10 pr-4 py-2.5 w-full bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#D4A017]/50"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((h) => (
          <GlassCard key={h.id}>
            <div className="h-40 bg-gradient-to-br from-[#D4A017]/10 to-[#0F1E3A] rounded-t-2xl flex items-center justify-center relative overflow-hidden">
              <PawPrint className="w-20 h-20 text-[#D4A017]/30" />
              <div className="absolute top-3 right-3">
                <Pill tone={h.healthTone}>{h.health}</Pill>
              </div>
              <button className="absolute bottom-3 right-3 p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all">
                <Upload className="w-3.5 h-3.5 text-white/60" />
              </button>
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-white text-base">{h.name}</h3>
                  <p className="text-[12px] text-white/50 mt-0.5">
                    {h.breed} · {h.color}
                  </p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => openEdit(h)}
                    className="p-1.5 bg-white/5 hover:bg-[#D4A017]/15 rounded-lg transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-white/60 hover:text-[#D4A017]" />
                  </button>
                  <button
                    onClick={() => handleDelete(h.id)}
                    className="p-1.5 bg-white/5 hover:bg-red-500/15 rounded-lg transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-white/60 hover:text-red-400" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <HorseOwnerInfoItem label="Tuổi" value={`${h.age} tuổi`} />
                <HorseOwnerInfoItem label="Cân nặng" value={`${h.weight} kg`} />
                <HorseOwnerInfoItem
                  label="Jockey"
                  value={h.jockey ?? "Chưa chọn"}
                />
                <HorseOwnerInfoItem label="Trạng thái" value={h.status} />
              </div>

              <div className="flex items-center gap-4 p-3 bg-white/[0.04] rounded-xl">
                <div className="text-center flex-1">
                  <div className="text-lg font-bold text-[#D4A017]">
                    {h.wins}
                  </div>
                  <div className="text-[10px] text-white/50">Thắng</div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center flex-1">
                  <div className="text-lg font-bold text-white">{h.races}</div>
                  <div className="text-[10px] text-white/50">Tổng race</div>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="text-center flex-1">
                  <div className="text-lg font-bold text-emerald-300">
                    {h.races > 0 ? Math.round((h.wins / h.races) * 100) : 0}%
                  </div>
                  <div className="text-[10px] text-white/50">Tỷ lệ thắng</div>
                </div>
              </div>

              <button className="mt-3 w-full flex items-center justify-center gap-2 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-white/60 transition-all">
                <Upload className="w-3.5 h-3.5" /> Upload giấy chứng nhận
              </button>
            </div>
          </GlassCard>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-white/40">
            <PawPrint className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Không tìm thấy ngựa nào</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <GlassCard className="w-full max-w-md">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <h2 className="font-bold text-white">
                {editTarget ? "Chỉnh sửa thông tin ngựa" : "Thêm ngựa mới"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-all"
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <HorseOwnerFormField label="Tên ngựa *">
                <TextInput
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nhập tên ngựa"
                />
              </HorseOwnerFormField>
              <div className="grid grid-cols-2 gap-3">
                <HorseOwnerFormField label="Giống ngựa">
                  <TextInput
                    value={form.breed}
                    onChange={(e) =>
                      setForm({ ...form, breed: e.target.value })
                    }
                    placeholder="Thoroughbred..."
                  />
                </HorseOwnerFormField>
                <HorseOwnerFormField label="Màu lông">
                  <TextInput
                    value={form.color}
                    onChange={(e) =>
                      setForm({ ...form, color: e.target.value })
                    }
                    placeholder="Hồng mã..."
                  />
                </HorseOwnerFormField>
                <HorseOwnerFormField label="Tuổi">
                  <TextInput
                    type="number"
                    value={form.age}
                    onChange={(e) => setForm({ ...form, age: e.target.value })}
                    placeholder="5"
                  />
                </HorseOwnerFormField>
                <HorseOwnerFormField label="Cân nặng (kg)">
                  <TextInput
                    type="number"
                    value={form.weight}
                    onChange={(e) =>
                      setForm({ ...form, weight: e.target.value })
                    }
                    placeholder="480"
                  />
                </HorseOwnerFormField>
              </div>
              <HorseOwnerFormField label="Tình trạng sức khỏe">
                <select
                  value={form.health}
                  onChange={(e) => setForm({ ...form, health: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#D4A017]"
                >
                  <option value="Tốt">Tốt</option>
                  <option value="Trung bình">Trung bình</option>
                  <option value="Cần theo dõi">Cần theo dõi</option>
                </select>
              </HorseOwnerFormField>
            </div>
            <div className="p-5 border-t border-white/10 flex items-center justify-end gap-3">
              <GhostButton onClick={() => setShowModal(false)}>Hủy</GhostButton>
              <PrimaryButton onClick={handleSave}>
                {editTarget ? "Lưu thay đổi" : "Thêm ngựa"}
              </PrimaryButton>
            </div>
          </GlassCard>
        </div>
      )}
    </HorseOwnerLayout>
  );
}
