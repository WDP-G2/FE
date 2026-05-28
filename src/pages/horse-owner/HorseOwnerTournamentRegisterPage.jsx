import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  ClipboardList,
  PawPrint,
  Search,
  Trophy,
  User,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import { HorseOwnerLayout } from "./HorseOwnerLayout";
import {
  GlassCard,
  Pill,
  PrimaryButton,
  GhostButton,
} from "../admin/AdminLayout";
import { tournamentService } from "@/services/tournamentService";

function formatDate(value) {
  if (!value) return "Chưa cập nhật";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Chưa cập nhật";
  return date.toLocaleDateString("vi-VN");
}

function formatMoney(value) {
  return new Intl.NumberFormat("vi-VN").format(Number(value || 0));
}

function statusTone(status) {
  if (status === "Đang mở đăng ký") return "green";
  if (status === "Đang diễn ra") return "blue";
  return "gold";
}

function extractTournamentId(pathname) {
  const match = pathname.match(
    /^\/horse-owner\/tournaments\/([^/]+)\/register$/,
  );
  return match ? match[1] : "";
}

export function HorseOwnerTournamentRegisterPage() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const tournamentId = extractTournamentId(pathname);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [tournament, setTournament] = useState(null);
  const [openRaces, setOpenRaces] = useState([]);
  const [selectedRaceId, setSelectedRaceId] = useState("");
  const [options, setOptions] = useState({
    horses: [],
    jockeys: [],
    registrations: [],
  });
  const [horseId, setHorseId] = useState("");
  const [jockeyId, setJockeyId] = useState("");
  const [notes, setNotes] = useState("");
  const [search, setSearch] = useState("");

  const selectedRace = useMemo(
    () => openRaces.find((race) => race.id === selectedRaceId) || null,
    [openRaces, selectedRaceId],
  );

  const selectedHorse = useMemo(
    () => options.horses.find((horse) => horse.id === horseId) || null,
    [horseId, options.horses],
  );

  const selectedJockey = useMemo(
    () => options.jockeys.find((jockey) => jockey.id === jockeyId) || null,
    [jockeyId, options.jockeys],
  );

  useEffect(() => {
    let active = true;

    const loadTournament = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await tournamentService.getById(tournamentId);
        if (!active) return;

        const races = (data.races || []).filter(
          (race) => race.status !== "Nháp",
        );
        setTournament(data);
        setOpenRaces(races);
        setSelectedRaceId((current) => current || races[0]?.id || "");
      } catch (err) {
        console.error("Error loading tournament register page:", err);
        const message =
          err?.response?.data?.error ||
          err?.message ||
          "Không thể tải giải đấu";
        if (active) {
          setError(message);
          setTournament(null);
          setOpenRaces([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    if (tournamentId) loadTournament();
    else {
      setLoading(false);
      setError("Thiếu mã giải đấu");
    }

    return () => {
      active = false;
    };
  }, [tournamentId]);

  useEffect(() => {
    let active = true;

    const loadOptions = async () => {
      if (!tournamentId || !selectedRaceId) {
        setOptions({ horses: [], jockeys: [], registrations: [] });
        return;
      }

      try {
        setLoading(true);
        const data = await tournamentService.getOwnerRaceOptions(
          tournamentId,
          selectedRaceId,
        );
        if (!active) return;
        setOptions({
          horses: data.horses || [],
          jockeys: data.jockeys || [],
          registrations: data.registrations || [],
        });
        setHorseId((current) =>
          data.horses?.some(
            (horse) => horse.id === current && horse.available !== false,
          )
            ? current
            : data.horses?.find((horse) => horse.available !== false)?.id || "",
        );
        setJockeyId((current) =>
          data.jockeys?.some((jockey) => jockey.id === current)
            ? current
            : data.jockeys?.[0]?.id || "",
        );
      } catch (err) {
        console.error("Error loading owner race options:", err);
        const message =
          err?.response?.data?.error ||
          err?.message ||
          "Không thể tải dữ liệu đăng ký race";
        if (active) {
          setOptions({ horses: [], jockeys: [], registrations: [] });
          setError(message);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadOptions();

    return () => {
      active = false;
    };
  }, [selectedRaceId, tournamentId]);

  const filteredHorses = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return options.horses;
    return options.horses.filter((horse) => {
      return (
        horse.name.toLowerCase().includes(query) ||
        horse.breed.toLowerCase().includes(query) ||
        horse.ownerName.toLowerCase().includes(query)
      );
    });
  }, [options.horses, search]);

  const handleSubmit = async () => {
    if (!selectedRaceId) {
      toast.error("Vui lòng chọn race");
      return;
    }
    if (!horseId) {
      toast.error("Vui lòng chọn ngựa");
      return;
    }
    if (!jockeyId) {
      toast.error("Vui lòng chọn jockey");
      return;
    }

    try {
      setSubmitting(true);
      await tournamentService.createOwnerRegistration(tournamentId, {
        raceId: selectedRaceId,
        horseId,
        jockeyId,
        notes,
      });
      toast.success("Đăng ký thi đấu thành công");
      navigate("/horse-owner/registrations");
    } catch (err) {
      console.error("Error creating registration:", err);
      const message =
        err?.response?.data?.error || err?.message || "Không thể tạo đăng ký";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <HorseOwnerLayout
      title="Horse Owner · Đăng ký race"
      subtitle={
        tournament
          ? `${tournament.name} · chọn race, ngựa và jockey`
          : "Chọn race và hoàn tất đăng ký"
      }
      actions={
        <div className="flex items-center gap-2">
          <GhostButton onClick={() => navigate("/horse-owner/tournaments")}>
            Quay lại giải đấu
          </GhostButton>
        </div>
      }
    >
      {loading && !tournament ? (
        <GlassCard className="p-10 text-center text-white/60">
          Đang tải dữ liệu đăng ký...
        </GlassCard>
      ) : error && !tournament ? (
        <GlassCard className="space-y-4 p-8 text-center">
          <div className="text-lg font-bold text-white">
            Không mở được trang đăng ký
          </div>
          <div className="text-sm text-white/55">{error}</div>
          <GhostButton onClick={() => navigate("/horse-owner/tournaments")}>
            Quay lại giải đấu
          </GhostButton>
        </GlassCard>
      ) : tournament ? (
        <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-5">
            <GlassCard className="overflow-hidden">
              <div className="relative h-56">
                <img
                  src={tournament.banner}
                  alt={tournament.name}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute left-5 top-5 flex gap-2">
                  <Pill tone={statusTone(tournament.status)}>
                    {tournament.status}
                  </Pill>
                  <Pill tone="gold">{tournament.location}</Pill>
                </div>
                <div className="absolute bottom-5 left-5 right-5">
                  <h2 className="text-3xl font-bold text-white">
                    {tournament.name}
                  </h2>
                  <p className="mt-1 max-w-2xl text-sm text-white/70">
                    {tournament.description || "Giải đấu đang mở đăng ký"}
                  </p>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-[#dda50e]" />
                <h3 className="text-base font-bold text-white">Chọn race</h3>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {openRaces.length ? (
                  openRaces.map((race) => (
                    <button
                      key={race.id}
                      type="button"
                      onClick={() => setSelectedRaceId(race.id)}
                      className={`rounded-3xl border p-4 text-left transition ${
                        selectedRaceId === race.id
                          ? "border-[#D4A017]/50 bg-[#D4A017]/10"
                          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-xs uppercase tracking-wider text-white/35">
                            Race {race.raceNumber}
                          </div>
                          <div className="mt-1 font-semibold text-white">
                            {race.name}
                          </div>
                        </div>
                        <Pill
                          tone={selectedRaceId === race.id ? "gold" : "gray"}
                        >
                          {race.status}
                        </Pill>
                      </div>
                      <div className="mt-3 space-y-1 text-sm text-white/65">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-3.5 w-3.5 text-white/40" />
                          {formatDate(race.scheduledAt)}
                        </div>
                        <div className="flex items-center gap-2">
                          <ClipboardList className="h-3.5 w-3.5 text-white/40" />
                          {race.distance} m · {race.surface}
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-6 text-center text-white/45 md:col-span-2">
                    Chưa có race nào mở đăng ký.
                  </div>
                )}
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <PawPrint className="h-4 w-4 text-[#dda50e]" />
                <h3 className="text-base font-bold text-white">Chọn ngựa</h3>
              </div>
              <div className="mb-4 relative max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Tìm ngựa..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#D4A017]/50"
                />
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {filteredHorses.length ? (
                  filteredHorses.map((horse) => (
                    <button
                      key={horse.id}
                      type="button"
                      onClick={() =>
                        horse.available !== false && setHorseId(horse.id)
                      }
                      disabled={horse.available === false}
                      className={`overflow-hidden rounded-3xl border text-left transition ${
                        horseId === horse.id
                          ? "border-[#D4A017]/50 bg-[#D4A017]/10"
                          : horse.available === false
                            ? "border-white/10 bg-white/[0.015] opacity-60"
                            : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                      }`}
                    >
                      <img
                        src={horse.imageUrl}
                        alt={horse.name}
                        className="h-32 w-full object-cover"
                      />
                      <div className="space-y-2 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold text-white">
                              {horse.name}
                            </div>
                            <div className="text-xs text-white/45">
                              {horse.breed || "Chưa cập nhật"}
                            </div>
                          </div>
                          <Pill
                            tone={horse.available !== false ? "green" : "red"}
                          >
                            {horse.available !== false
                              ? "Có thể đua"
                              : "Không thể chọn"}
                          </Pill>
                        </div>
                        <div className="text-sm text-white/65">
                          Chủ: {horse.ownerName || "Chưa cập nhật"}
                        </div>
                        {horse.available === false &&
                        horse.unavailableReason ? (
                          <div className="text-xs text-red-300">
                            {horse.unavailableReason}
                          </div>
                        ) : null}
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-6 text-center text-white/45 md:col-span-2">
                    Không có ngựa phù hợp cho race này.
                  </div>
                )}
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <div className="mb-4 flex items-center gap-2">
                <User className="h-4 w-4 text-[#dda50e]" />
                <h3 className="text-base font-bold text-white">Chọn jockey</h3>
              </div>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {options.jockeys.length ? (
                  options.jockeys.map((jockey) => (
                    <button
                      key={jockey.id}
                      type="button"
                      onClick={() => setJockeyId(jockey.id)}
                      className={`rounded-3xl border p-4 text-left transition ${
                        jockeyId === jockey.id
                          ? "border-[#D4A017]/50 bg-[#D4A017]/10"
                          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="font-semibold text-white">
                            {jockey.fullName || jockey.name}
                          </div>
                          <div className="text-xs text-white/45">
                            {jockey.username || "jockey"}
                          </div>
                        </div>
                        <Pill tone={jockeyId === jockey.id ? "gold" : "gray"}>
                          Rảnh
                        </Pill>
                      </div>
                      <div className="mt-3 space-y-1 text-sm text-white/65">
                        <div>{jockey.email || "Chưa có email"}</div>
                        <div>{jockey.phone || "Chưa có số điện thoại"}</div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-6 text-center text-white/45 md:col-span-2 xl:col-span-3">
                    Không có jockey rảnh cho race này.
                  </div>
                )}
              </div>
            </GlassCard>
          </div>

          <div className="space-y-5">
            <GlassCard className="p-5">
              <h3 className="mb-4 text-base font-bold text-white">
                Tổng quan đăng ký
              </h3>
              <div className="space-y-3 text-sm">
                <SummaryRow label="Giải đấu" value={tournament.name} />
                <SummaryRow
                  label="Race"
                  value={selectedRace?.name || "Chưa chọn"}
                />
                <SummaryRow
                  label="Ngựa"
                  value={selectedHorse?.name || "Chưa chọn"}
                />
                <SummaryRow
                  label="Jockey"
                  value={
                    selectedJockey?.fullName ||
                    selectedJockey?.name ||
                    "Chưa chọn"
                  }
                />
                <SummaryRow
                  label="Entry fee"
                  value={formatMoney(
                    selectedRace?.entryFee || tournament.config?.entryFee || 0,
                  )}
                />
                <SummaryRow
                  label="Deposit"
                  value={formatMoney(
                    selectedRace?.deposit || tournament.config?.depositFee || 0,
                  )}
                />
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <h3 className="mb-4 text-base font-bold text-white">
                Profile jockey
              </h3>
              {selectedJockey ? (
                <div className="space-y-3">
                  <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4">
                    <div className="text-xs uppercase tracking-wider text-white/40">
                      Tên
                    </div>
                    <div className="mt-1 text-lg font-bold text-white">
                      {selectedJockey.fullName || selectedJockey.name}
                    </div>
                    <div className="mt-1 text-sm text-white/55">
                      @{selectedJockey.username || "jockey"}
                    </div>
                  </div>
                  <SummaryRow
                    label="Email"
                    value={selectedJockey.email || "Chưa có"}
                  />
                  <SummaryRow
                    label="Số điện thoại"
                    value={selectedJockey.phone || "Chưa có"}
                  />
                  <SummaryRow
                    label="Vai trò"
                    value={selectedJockey.role || "JOCKEY"}
                  />
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-6 text-center text-white/45">
                  Chưa chọn jockey.
                </div>
              )}
            </GlassCard>

            <GlassCard className="p-5">
              <div className="mb-3 flex items-center gap-2">
                <Users className="h-4 w-4 text-[#dda50e]" />
                <h3 className="text-base font-bold text-white">Ghi chú</h3>
              </div>
              <textarea
                rows={4}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Ghi chú thêm cho đăng ký..."
                className="w-full resize-none rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-white outline-none placeholder:text-white/30 focus:border-[#dda50e]/60"
              />
            </GlassCard>

            <PrimaryButton
              onClick={handleSubmit}
              disabled={submitting || !selectedRaceId || !horseId || !jockeyId}
            >
              {submitting ? "Đang gửi..." : "Xác nhận đăng ký"}
            </PrimaryButton>
          </div>
        </div>
      ) : null}
    </HorseOwnerLayout>
  );
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <span className="text-white/45">{label}</span>
      <span className="text-right font-semibold text-white">{value}</span>
    </div>
  );
}
