import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  ClipboardList,
  Search,
  Trophy,
  User,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { HorseOwnerLayout } from "./HorseOwnerLayout";
import { GlassCard, Pill } from "../admin/AdminLayout";
import { tournamentService } from "@/services/tournamentService";

function statusTone(status) {
  if (status === "Đã duyệt") return "green";
  if (status === "Chờ duyệt") return "gold";
  if (status === "Từ chối") return "red";
  if (status === "Hoàn thành") return "blue";
  return "gray";
}

function formatDate(value) {
  if (!value) return "Chưa cập nhật";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa cập nhật";
  return date.toLocaleDateString("vi-VN");
}

export function HorseOwnerRegistrations() {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [registrations, setRegistrations] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        setLoading(true);
        const items = await tournamentService.listOwnerRegistrations();
        if (active) setRegistrations(items);
      } catch (error) {
        console.error("Error loading owner registrations:", error);
        toast.error("Không thể tải danh sách đăng ký");
        if (active) setRegistrations([]);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return registrations;
    return registrations.filter((item) => {
      return (
        item.tournamentName.toLowerCase().includes(query) ||
        item.raceName.toLowerCase().includes(query) ||
        item.horse.toLowerCase().includes(query) ||
        item.jockey.toLowerCase().includes(query)
      );
    });
  }, [registrations, search]);

  return (
    <HorseOwnerLayout
      title="Horse Owner · Đăng ký thi đấu"
      subtitle="Theo dõi các lượt đăng ký đã gửi cho race mở"
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm theo giải, race, ngựa, jockey..."
            className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#D4A017]/50"
          />
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.045] p-10 text-center text-white/50">
            Đang tải danh sách đăng ký...
          </div>
        ) : (
          filtered.map((item) => (
            <GlassCard key={item.id} className="overflow-hidden">
              <div className="grid gap-0 lg:grid-cols-[1.5fr_0.8fr]">
                <div className="p-5">
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <div>
                      <div className="mb-2 flex items-center gap-2 flex-wrap">
                        <Pill tone={statusTone(item.approval)}>
                          {item.approval}
                        </Pill>
                        <Pill tone="gray">
                          {item.tournamentStatus || "Chưa rõ trạng thái"}
                        </Pill>
                      </div>
                      <h3 className="text-base font-bold text-white">
                        {item.tournamentName}
                      </h3>
                      <p className="mt-1 text-sm text-white/55">
                        {item.raceName || "Race chưa xác định"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelected(item)}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/10"
                    >
                      Xem chi tiết
                    </button>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                    <InfoBox
                      icon={ClipboardList}
                      label="Ngựa"
                      value={item.horse}
                    />
                    <InfoBox
                      icon={User}
                      label="Jockey"
                      value={item.jockey || "Chưa chọn"}
                    />
                    <InfoBox
                      icon={Users}
                      label="Chủ ngựa"
                      value={item.owner || "Chưa cập nhật"}
                    />
                    <InfoBox
                      icon={CalendarDays}
                      label="Đăng ký lúc"
                      value={formatDate(item.registeredAt)}
                    />
                  </div>
                </div>

                <div className="border-t border-white/10 bg-white/[0.03] p-5 lg:border-l lg:border-t-0">
                  <div className="mb-2 text-xs uppercase tracking-wider text-white/40">
                    Thông tin race
                  </div>
                  <div className="space-y-2 text-sm text-white/70">
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                      <span className="text-white/45">Mã giải</span>
                      <span className="font-semibold text-white">
                        {item.tournamentId || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                      <span className="text-white/45">Mã race</span>
                      <span className="font-semibold text-white">
                        {item.raceId || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
                      <span className="text-white/45">Trạng thái duyệt</span>
                      <span className="font-semibold text-white">
                        {item.approval}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))
        )}

        {!loading && filtered.length === 0 && (
          <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.03] py-16 text-center text-white/45">
            <Trophy className="mx-auto mb-3 h-12 w-12 opacity-30" />
            <p>Chưa có lượt đăng ký nào</p>
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <GlassCard className="w-full max-w-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Chi tiết đăng ký
                </h2>
                <p className="text-sm text-white/45">
                  Thông tin race, ngựa và jockey đã chọn
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="rounded-lg p-2 transition hover:bg-white/10"
              >
                <X className="h-4 w-4 text-white/60" />
              </button>
            </div>

            <div className="grid gap-5 p-5 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="space-y-3">
                <DetailRow label="Giải đấu" value={selected.tournamentName} />
                <DetailRow
                  label="Race"
                  value={selected.raceName || "Chưa xác định"}
                />
                <DetailRow label="Ngựa" value={selected.horse} />
                <DetailRow
                  label="Jockey"
                  value={selected.jockey || "Chưa chọn"}
                />
                <DetailRow
                  label="Chủ ngựa"
                  value={selected.owner || "Chưa cập nhật"}
                />
                <DetailRow label="Trạng thái" value={selected.approval} />
              </div>
              <div className="space-y-3">
                <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                  <div className="text-xs uppercase tracking-wider text-white/40">
                    Ghi chú
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/70">
                    {selected.notes || "Không có ghi chú."}
                  </p>
                </div>
                <DetailRow
                  label="Đăng ký lúc"
                  value={formatDate(selected.registeredAt)}
                />
                <DetailRow label="Mã đăng ký" value={selected.id} />
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </HorseOwnerLayout>
  );
}

function InfoBox({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-3">
      <div className="mb-1 flex items-center gap-2 text-[10px] uppercase tracking-wider text-white/40">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <div className="truncate text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <span className="text-white/45">{label}</span>
      <span className="text-right font-semibold text-white">{value}</span>
    </div>
  );
}
