import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CalendarDays, ExternalLink, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { HorseOwnerLayout } from "./HorseOwnerLayout";
import {
  GlassCard,
  Pill,
  PrimaryButton,
  GhostButton,
} from "../admin/AdminLayout";
import { horseService } from "@/services/horseService";

function formatDate(value) {
  if (!value) return "Chưa cập nhật";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa cập nhật";
  return date.toLocaleDateString("vi-VN");
}

function formatNumber(value) {
  return new Intl.NumberFormat("vi-VN").format(Number(value || 0));
}

function statusLabel(racingStatus) {
  return racingStatus === "cannot-race" ? "Không thể đua" : "Có thể đua";
}

function statusTone(racingStatus) {
  return racingStatus === "cannot-race" ? "red" : "green";
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

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <span className="text-white/45">{label}</span>
      <span className="text-right font-semibold text-white">{value}</span>
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

export default function HorseOwnerHorseDetailPage({ horseId }) {
  const navigate = useNavigate();
  const [horse, setHorse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHorse = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await horseService.getById(horseId);
      setHorse(data);
    } catch (err) {
      console.error("Error loading horse detail:", err);
      const message =
        err?.response?.data?.error ||
        err?.message ||
        "Không thể tải chi tiết ngựa";
      setError(message);
      toast.error(message);
      setHorse(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHorse();
  }, [horseId]);

  const historyItems = useMemo(() => buildHistoryItems(horse), [horse]);

  return (
    <HorseOwnerLayout
      title="Horse Owner · Chi tiết ngựa"
      subtitle={
        horse
          ? `${horse.name} · xem giấy phép, thành tích, lịch sử và thông tin`
          : "Trang chi tiết ngựa"
      }
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <GhostButton
            onClick={() => navigate("/horse-owner/horses")}
            icon={ArrowLeft}
          >
            Quay lại danh sách
          </GhostButton>
          <PrimaryButton
            onClick={loadHorse}
            icon={RefreshCw}
            disabled={loading}
          >
            {loading ? "Đang tải..." : "Tải lại"}
          </PrimaryButton>
        </div>
      }
    >
      {loading ? (
        <GlassCard className="p-10 text-center text-white/60">
          Đang tải chi tiết ngựa...
        </GlassCard>
      ) : error ? (
        <GlassCard className="space-y-4 p-8 text-center">
          <div className="text-lg font-bold text-white">
            Không tải được chi tiết ngựa
          </div>
          <div className="text-sm text-white/55">{error}</div>
          <div className="flex justify-center gap-3">
            <GhostButton
              onClick={() => navigate("/horse-owner/horses")}
              icon={ArrowLeft}
            >
              Quay lại danh sách
            </GhostButton>
            <PrimaryButton onClick={loadHorse} icon={RefreshCw}>
              Thử lại
            </PrimaryButton>
          </div>
        </GlassCard>
      ) : horse ? (
        <div className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            <GlassCard className="overflow-hidden">
              <div className="relative h-72">
                <img
                  src={horse.imageUrl}
                  alt={horse.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                <div className="absolute left-5 top-5 flex gap-2">
                  <Pill tone={statusTone(horse.racingStatus)}>
                    {statusLabel(horse.racingStatus)}
                  </Pill>
                  <Pill tone="gold">{horse.healthStatus}</Pill>
                </div>
                <div className="absolute bottom-5 left-5 right-5">
                  <h2 className="text-3xl font-bold text-white">
                    {horse.name}
                  </h2>
                  <p className="mt-1 text-sm text-white/70">
                    {horse.breed || "Chưa cập nhật"} ·{" "}
                    {horse.gender || "Chưa rõ giới tính"}
                  </p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <CalendarDays className="h-4 w-4 text-[#dda50e]" />
                <h3 className="text-base font-bold text-white">
                  Thành tích & chỉ số
                </h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <StatTile label="Số trận" value={formatNumber(horse.races)} />
                <StatTile label="Số thắng" value={formatNumber(horse.wins)} />
                <StatTile
                  label="Tỷ lệ thắng"
                  value={
                    horse.races > 0
                      ? `${Math.round((horse.wins / horse.races) * 100)}%`
                      : "0%"
                  }
                />
              </div>
              <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <div className="text-xs uppercase tracking-wider text-white/40">
                  Thành tích nổi bật
                </div>
                {horse.achievements?.length ? (
                  <ul className="mt-3 space-y-2 text-sm text-white/75">
                    {horse.achievements.map((item, index) => (
                      <li
                        key={`${horse.id}-achievement-${index}`}
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
            </GlassCard>

            <GlassCard className="p-5">
              <h3 className="mb-3 text-base font-bold text-white">Lịch sử</h3>
              {historyItems.length ? (
                <div className="space-y-3">
                  {historyItems.map((item) => (
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
            </GlassCard>
          </div>

          <div className="space-y-5">
            <GlassCard className="p-5">
              <h3 className="mb-4 text-base font-bold text-white">Thông tin</h3>
              <div className="space-y-3 text-sm">
                <DetailRow label="Tên" value={horse.name} />
                <DetailRow label="Slug" value={horse.slug || "Chưa cập nhật"} />
                <DetailRow
                  label="Ngày sinh"
                  value={formatDate(horse.birthDate)}
                />
                <DetailRow
                  label="Chủ ngựa"
                  value={horse.ownerName || "Chưa cập nhật"}
                />
                <DetailRow
                  label="Trạng thái đua"
                  value={statusLabel(horse.racingStatus)}
                />
                <DetailRow label="Sức khỏe" value={horse.healthStatus} />
                <DetailRow
                  label="Tạo lúc"
                  value={formatDate(horse.createdAt)}
                />
                <DetailRow
                  label="Cập nhật"
                  value={formatDate(horse.updatedAt)}
                />
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <h3 className="mb-4 text-base font-bold text-white">
                Giấy phép & tài liệu
              </h3>
              {horse.licenseImageUrl ? (
                <a
                  href={horse.licenseImageUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block overflow-hidden rounded-2xl border border-white/10"
                >
                  <img
                    src={horse.licenseImageUrl}
                    alt="Giấy phép"
                    className="h-56 w-full object-cover"
                  />
                </a>
              ) : (
                <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.03] text-sm text-white/45">
                  Chưa có giấy phép / tài liệu.
                </div>
              )}
              {horse.licenseImageUrl && (
                <div className="mt-3 flex items-center gap-2 text-xs text-white/45">
                  <ExternalLink className="h-4 w-4" />
                  <a
                    href={horse.licenseImageUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-white"
                  >
                    Mở tài liệu trong tab mới
                  </a>
                </div>
              )}
            </GlassCard>

            <GlassCard className="p-5">
              <h3 className="mb-3 text-base font-bold text-white">Ghi chú</h3>
              <p className="whitespace-pre-line text-sm leading-6 text-white/70">
                {horse.notes || "Không có ghi chú."}
              </p>
            </GlassCard>
          </div>
        </div>
      ) : null}
    </HorseOwnerLayout>
  );
}
