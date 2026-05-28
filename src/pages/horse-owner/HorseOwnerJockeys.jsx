import { useState } from "react";
import { Users, Search, Trophy, Send, CheckCircle } from "lucide-react";
import { HorseOwnerLayout } from "./HorseOwnerLayout";
import {
  GlassCard,
  Pill,
  PrimaryButton,
  GhostButton,
} from "../admin/AdminLayout";
import { jockeys } from "./data";
import { toast } from "sonner";

export function HorseOwnerJockeys() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Tất cả");

  const filtered = jockeys.filter((j) => {
    const matchSearch =
      j.name.toLowerCase().includes(search.toLowerCase()) ||
      j.license.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === "Tất cả" || j.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleInvite = (name) => {
    toast.success(`Đã gửi lời mời đến jockey ${name}`);
  };

  const handleConfirm = (name) => {
    toast.success(`Đã xác nhận jockey ${name}`);
  };

  return (
    <HorseOwnerLayout
      title="Horse Owner · Jockey"
      subtitle="Tìm kiếm và quản lý jockey cho đội của bạn"
    >
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, mã giấy phép..."
            className="pl-10 pr-4 py-2.5 w-full bg-white/5 border border-white/10 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#D4A017]/50"
          />
        </div>
        <div className="flex gap-2">
          {["Tất cả", "Sẵn sàng", "Bận"].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                filterStatus === s
                  ? "bg-[#D4A017] text-white shadow-lg shadow-[#D4A017]/30"
                  : "bg-white/5 text-white/60 hover:bg-white/10 border border-white/10"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <GlassCard className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#D4A017]/15 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-[#D4A017]" />
          </div>
          <div>
            <div className="text-xl font-bold text-white">{jockeys.length}</div>
            <div className="text-xs text-white/50">Tổng jockey</div>
          </div>
        </GlassCard>
        <GlassCard className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500/15 rounded-xl flex items-center justify-center">
            <CheckCircle className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <div className="text-xl font-bold text-white">
              {jockeys.filter((j) => j.status === "Sẵn sàng").length}
            </div>
            <div className="text-xs text-white/50">Sẵn sàng</div>
          </div>
        </GlassCard>
        <GlassCard className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-500/15 rounded-xl flex items-center justify-center">
            <Trophy className="w-5 h-5 text-sky-300" />
          </div>
          <div>
            <div className="text-xl font-bold text-white">
              {jockeys.filter((j) => j.assigned).length}
            </div>
            <div className="text-xs text-white/50">Đang được assign</div>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map((j) => (
          <GlassCard key={j.id} className="p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#D4A017]/20 to-[#0F1E3A] flex items-center justify-center text-2xl font-bold text-[#D4A017] border border-[#D4A017]/20">
                {j.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-base truncate">
                  {j.name}
                </h3>
                <p className="text-xs text-white/50">{j.license}</p>
                <div className="mt-1">
                  <Pill tone={j.statusTone}>{j.status}</Pill>
                </div>
              </div>
              <div className="text-center shrink-0">
                <div className="text-lg font-bold text-[#D4A017]">
                  #{j.ranking}
                </div>
                <div className="text-[10px] text-white/40">Rank</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-4 p-3 bg-white/[0.04] rounded-xl">
              <div className="text-center">
                <div className="text-base font-bold text-[#D4A017]">
                  {j.wins}
                </div>
                <div className="text-[10px] text-white/40">Thắng</div>
              </div>
              <div className="text-center border-x border-white/10">
                <div className="text-base font-bold text-white">{j.races}</div>
                <div className="text-[10px] text-white/40">Race</div>
              </div>
              <div className="text-center">
                <div className="text-base font-bold text-emerald-300">
                  {j.winRate}%
                </div>
                <div className="text-[10px] text-white/40">Tỷ lệ</div>
              </div>
            </div>

            <div className="space-y-2 mb-4 text-xs">
              <div className="flex justify-between">
                <span className="text-white/50">Kinh nghiệm</span>
                <span className="text-white font-semibold">
                  {j.experience} năm
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Tuổi</span>
                <span className="text-white font-semibold">{j.age} tuổi</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/50">Ngựa hiện tại</span>
                <span className="text-white font-semibold">
                  {j.assigned ?? "Chưa có"}
                </span>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-[10px] text-white/40 mb-1">
                <span>Tỷ lệ thắng</span>
                <span>{j.winRate}%</span>
              </div>
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#D4A017] to-[#E5B82F]"
                  style={{ width: `${j.winRate}%` }}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <GhostButton
                className="flex-1"
                icon={Send}
                onClick={() => handleInvite(j.name)}
              >
                Mời
              </GhostButton>
              {j.assigned && (
                <PrimaryButton
                  className="flex-1"
                  onClick={() => handleConfirm(j.name)}
                >
                  Xác nhận
                </PrimaryButton>
              )}
            </div>
          </GlassCard>
        ))}

        {filtered.length === 0 && (
          <div className="col-span-full text-center py-16 text-white/40">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Không tìm thấy jockey nào</p>
          </div>
        )}
      </div>
    </HorseOwnerLayout>
  );
}
