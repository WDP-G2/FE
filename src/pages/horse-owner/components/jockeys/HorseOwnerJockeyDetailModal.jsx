import { Award, FileText, Mail, X } from "lucide-react";
import { GlassCard, Pill } from "../../../admin/AdminLayout";

export function HorseOwnerJockeyDetailModal({
  formatRaceDate,
  jockey,
  loading,
  onClose,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <GlassCard className="max-h-[90vh] w-full max-w-3xl overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/10 p-5">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-[#D4A017]/20 bg-gradient-to-br from-[#D4A017]/20 to-[#0F1E3A] text-2xl font-bold text-[#D4A017]">
              {jockey.avatarUrl ? (
                <img
                  src={jockey.avatarUrl}
                  alt={jockey.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                jockey.name.charAt(0)
              )}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-xl font-bold text-white">{jockey.name}</h2>
              <p className="mt-1 text-sm text-white/45">{jockey.license}</p>
              {jockey.email && (
                <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-white/55">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-[#D4A017]" />
                  {jockey.email}
                </p>
              )}
              <div className="mt-2">
                <Pill tone={jockey.statusTone}>{jockey.status}</Pill>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 transition-all hover:bg-white/10"
          >
            <X className="h-5 w-5 text-white/60" />
          </button>
        </div>

        <div className="max-h-[calc(90vh-112px)] overflow-y-auto p-5">
          {loading ? (
            <div className="py-14 text-center text-sm text-white/55">
              Đang tải chi tiết jockey...
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-3 rounded-2xl bg-white/[0.04] p-4">
                <div className="text-center">
                  <div className="text-xl font-bold text-[#D4A017]">{jockey.wins}</div>
                  <div className="text-xs text-white/45">Thắng</div>
                </div>
                <div className="border-x border-white/10 text-center">
                  <div className="text-xl font-bold text-white">{jockey.races}</div>
                  <div className="text-xs text-white/45">Race</div>
                </div>
                <div className="text-center">
                  <div className="text-xl font-bold text-emerald-300">{jockey.winRate}%</div>
                  <div className="text-xs text-white/45">Tỷ lệ thắng</div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ["Kinh nghiệm", `${jockey.experience || 0} năm`],
                  ["Chiều cao", `${jockey.height || 0} cm`],
                  ["Cân nặng", `${jockey.weight || 0} kg`],
                  ["Ngựa đã nhận", jockey.assigned ?? "Chưa có"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-xs font-semibold uppercase tracking-wide text-white/40">
                      {label}
                    </div>
                    <div className="mt-1 font-semibold text-white">{value}</div>
                  </div>
                ))}
              </div>

              {(jockey.bio || jockey.specialties || jockey.awards) && (
                <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  {jockey.bio && (
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-white/40">
                        Giới thiệu
                      </div>
                      <p className="mt-2 text-sm leading-6 text-white/70">{jockey.bio}</p>
                    </div>
                  )}
                  {jockey.specialties && (
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-white/40">
                        Chuyên môn
                      </div>
                      <p className="mt-2 text-sm leading-6 text-white/70">{jockey.specialties}</p>
                    </div>
                  )}
                  {jockey.awards && (
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-wide text-white/40">
                        Thành tích
                      </div>
                      <p className="mt-2 text-sm leading-6 text-white/70">{jockey.awards}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                {jockey.licenseDocumentUrl && (
                  <a
                    href={jockey.licenseDocumentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white transition hover:border-[#D4A017]/50"
                  >
                    <FileText className="h-4 w-4 text-[#D4A017]" />
                    Xem giấy phép
                  </a>
                )}
                {jockey.achievements && (
                  <a
                    href={jockey.achievements}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white transition hover:border-[#D4A017]/50"
                  >
                    <Award className="h-4 w-4 text-[#D4A017]" />
                    Xem ảnh thành tích
                  </a>
                )}
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                <h3 className="mb-3 font-bold text-white">Lịch sử thi đấu</h3>
                {jockey.raceHistory?.length ? (
                  <div className="space-y-2">
                    {jockey.raceHistory.map((race, index) => (
                      <div
                        key={`${race.raceId ?? index}-${race.scheduledStartAt ?? index}`}
                        className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <div className="font-semibold text-white">
                              {race.raceName ?? "Cuộc đua"}
                            </div>
                            <div className="mt-1 text-xs text-white/45">
                              {race.tournamentName ?? "Giải đấu"} ·{" "}
                              {formatRaceDate(race.scheduledStartAt)}
                            </div>
                          </div>
                          <Pill tone={Number(race.rank) === 1 ? "gold" : "gray"}>
                            {race.rank ? `Hạng ${race.rank}` : race.status ?? "Chưa có kết quả"}
                          </Pill>
                        </div>
                        {race.horseName && (
                          <div className="mt-2 text-xs text-white/50">Ngựa: {race.horseName}</div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-white/10 py-8 text-center text-sm text-white/45">
                    Chưa có lịch sử thi đấu
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}
