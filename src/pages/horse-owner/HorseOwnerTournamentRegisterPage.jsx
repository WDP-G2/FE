import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  ClipboardList,
  Eye,
  PawPrint,
  Search,
  Trophy,
  User,
  Users,
  X,
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

function formatNumber(value) {
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
  const [detailModal, setDetailModal] = useState(null);

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

  const closeDetailModal = () => setDetailModal(null);
  const openHorseModal = (horse) =>
    setDetailModal({ type: "horse", item: horse });
  const openJockeyModal = (jockey) =>
    setDetailModal({ type: "jockey", item: jockey });

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
          data.jockeys?.some(
            (jockey) => jockey.id === current && jockey.available !== false,
          )
            ? current
            : data.jockeys?.find((jockey) => jockey.available !== false)?.id ||
                "",
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

  const filteredJockeys = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return options.jockeys;
    return options.jockeys.filter((jockey) => {
      const name = (jockey.fullName || jockey.name || "").toLowerCase();
      const email = (jockey.email || "").toLowerCase();
      const username = (jockey.username || "").toLowerCase();
      return (
        name.includes(query) || email.includes(query) || username.includes(query)
      );
    });
  }, [options.jockeys, search]);

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
    if (selectedJockey?.available === false) {
      toast.error(
        selectedJockey.unavailableReason || "Jockey không khả dụng cho race này",
      );
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
                    <div
                      key={horse.id}
                      className={`overflow-hidden rounded-3xl border text-left transition ${
                        horseId === horse.id
                          ? "border-[#D4A017]/50 bg-[#D4A017]/10"
                          : horse.available === false
                            ? "border-white/10 bg-white/[0.015] opacity-60"
                            : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() =>
                          horse.available !== false && setHorseId(horse.id)
                        }
                        disabled={horse.available === false}
                        className="block w-full text-left"
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

                      <div className="px-4 pb-4">
                        <button
                          type="button"
                          onClick={() => openHorseModal(horse)}
                          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/75 transition hover:bg-white/10"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          Xem thông tin
                        </button>
                      </div>
                    </div>
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
              <p className="mb-4 text-xs text-white/45">
                Chỉ hiện jockey đã chấp nhận lời mời của bạn cho giải này. Vào
                mục Jockey → Mời thi đấu (chọn đúng giải) và chờ jockey chấp
                nhận trước khi đăng ký.
              </p>
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {filteredJockeys.length ? (
                  filteredJockeys.map((jockey) => (
                    <div
                      key={jockey.id}
                      className={`rounded-3xl border p-4 text-left transition ${
                        jockeyId === jockey.id
                          ? "border-[#D4A017]/50 bg-[#D4A017]/10"
                          : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          if (jockey.available === false) return;
                          setJockeyId(jockey.id);
                        }}
                        className="block w-full text-left disabled:cursor-not-allowed"
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
                          <Pill
                            tone={
                              jockey.available === false
                                ? "red"
                                : jockey.relationship === "Đã nhận lời mời"
                                  ? "green"
                                  : "gold"
                            }
                          >
                            {jockey.available === false
                              ? "Không chọn được"
                              : jockey.relationship || "Có thể chọn"}
                          </Pill>
                        </div>
                        <div className="mt-3 space-y-1 text-sm text-white/65">
                          <div>{jockey.email || "Chưa có email"}</div>
                          <div>{jockey.phone || "Chưa có số điện thoại"}</div>
                        </div>
                        {jockey.available === false &&
                        jockey.unavailableReason ? (
                          <div className="mt-2 text-xs text-red-300">
                            {jockey.unavailableReason}
                          </div>
                        ) : null}
                      </button>

                      <button
                        type="button"
                        onClick={() => openJockeyModal(jockey)}
                        className="mt-3 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/75 transition hover:bg-white/10"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Xem thông tin
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-6 text-center text-white/45 md:col-span-2 xl:col-span-3">
                    {options.jockeys.length === 0
                      ? "Chưa có jockey chấp nhận lời mời cho giải này. Mời đúng giải tại mục Jockey và chờ jockey bấm Chấp nhận."
                      : "Không tìm thấy jockey phù hợp với từ khóa tìm kiếm."}
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
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <h3 className="mb-4 text-base font-bold text-white">
                Thông tin chi tiết
              </h3>
              <div className="space-y-3">
                <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/70">
                  Bấm{" "}
                  <span className="font-semibold text-white">
                    Xem thông tin
                  </span>{" "}
                  trên thẻ ngựa hoặc jockey để mở popup hồ sơ.
                </div>
                <SummaryRow
                  label="Ngựa đã chọn"
                  value={selectedHorse?.name || "Chưa chọn"}
                />
                <SummaryRow
                  label="Jockey đã chọn"
                  value={
                    selectedJockey?.fullName ||
                    selectedJockey?.name ||
                    "Chưa chọn"
                  }
                />
                <div className="flex gap-2">
                  <GhostButton
                    className="flex-1"
                    disabled={!selectedHorse}
                    onClick={() =>
                      selectedHorse && openHorseModal(selectedHorse)
                    }
                    icon={Eye}
                  >
                    Xem ngựa
                  </GhostButton>
                  <GhostButton
                    className="flex-1"
                    disabled={!selectedJockey}
                    onClick={() =>
                      selectedJockey && openJockeyModal(selectedJockey)
                    }
                    icon={Eye}
                  >
                    Xem jockey
                  </GhostButton>
                </div>
              </div>
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

      {detailModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <GlassCard className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 p-5">
              <div>
                <h2 className="text-lg font-bold text-white">
                  {detailModal.type === "horse"
                    ? "Thông tin ngựa"
                    : "Thông tin jockey"}
                </h2>
                <p className="text-sm text-white/45">
                  {detailModal.type === "horse"
                    ? "Xem hồ sơ, trạng thái và ghi chú của ngựa"
                    : "Xem hồ sơ và liên hệ của jockey"}
                </p>
              </div>
              <button
                type="button"
                onClick={closeDetailModal}
                className="rounded-lg p-2 transition hover:bg-white/10"
              >
                <X className="h-4 w-4 text-white/60" />
              </button>
            </div>

            <div className="p-5">
              {detailModal.type === "horse" ? (
                <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                  <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
                    <img
                      src={detailModal.item.imageUrl}
                      alt={detailModal.item.name}
                      className="h-64 w-full object-cover"
                    />
                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Pill
                          tone={
                            detailModal.item.available !== false
                              ? "green"
                              : "red"
                          }
                        >
                          {detailModal.item.available !== false
                            ? "Có thể đua"
                            : "Không thể chọn"}
                        </Pill>
                        <Pill tone="gold">
                          {detailModal.item.healthStatus || "Chưa cập nhật"}
                        </Pill>
                      </div>
                      <h3 className="text-xl font-bold text-white">
                        {detailModal.item.name}
                      </h3>
                      <p className="text-sm text-white/60">
                        {detailModal.item.breed || "Chưa cập nhật"} ·{" "}
                        {detailModal.item.gender || "Chưa rõ"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <SummaryRow
                      label="Chủ ngựa"
                      value={detailModal.item.ownerName || "Chưa cập nhật"}
                    />
                    <SummaryRow
                      label="Ngày sinh"
                      value={formatDate(detailModal.item.birthDate)}
                    />
                    <SummaryRow
                      label="Số trận"
                      value={formatNumber(detailModal.item.races)}
                    />
                    <SummaryRow
                      label="Số thắng"
                      value={formatNumber(detailModal.item.wins)}
                    />
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="text-xs uppercase tracking-wider text-white/40">
                        Thành tích
                      </div>
                      {detailModal.item.achievements?.length ? (
                        <ul className="mt-3 space-y-2 text-sm text-white/75">
                          {detailModal.item.achievements.map((item, index) => (
                            <li
                              key={`${detailModal.item.id}-ach-${index}`}
                              className="flex gap-2"
                            >
                              <span className="mt-1 h-2 w-2 rounded-full bg-[#dda50e]" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="mt-2 text-sm text-white/55">
                          Chưa có thành tích.
                        </p>
                      )}
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                      <div className="text-xs uppercase tracking-wider text-white/40">
                        Ghi chú
                      </div>
                      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-white/70">
                        {detailModal.item.notes || "Không có ghi chú."}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
                  <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                    <div className="text-xs uppercase tracking-wider text-white/40">
                      Tên
                    </div>
                    <div className="mt-1 text-2xl font-bold text-white">
                      {detailModal.item.fullName || detailModal.item.name}
                    </div>
                    <div className="mt-1 text-sm text-white/55">
                      @{detailModal.item.username || "jockey"}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Pill tone="gold">
                        {detailModal.item.role || "JOCKEY"}
                      </Pill>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <SummaryRow
                      label="Email"
                      value={detailModal.item.email || "Chưa có"}
                    />
                    <SummaryRow
                      label="Số điện thoại"
                      value={detailModal.item.phone || "Chưa có"}
                    />
                    <SummaryRow
                      label="Vai trò"
                      value={detailModal.item.role || "JOCKEY"}
                    />
                  </div>
                </div>
              )}
            </div>
          </GlassCard>
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
