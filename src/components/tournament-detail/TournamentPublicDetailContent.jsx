import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Flag,
  MapPin,
  Route,
  Trophy,
  Users,
} from "lucide-react";
import { GlassCard, Pill } from "@/pages/admin/AdminLayout";
import { setTournamentBannerFallback } from "@/services/tournamentService";

function formatDate(value) {
  return value || "-";
}

function formatMoney(value) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(Number(value || 0));
}

function formatCapacity(tournament) {
  const maxHorses = Number(tournament.maxHorses ?? 0);
  const registeredHorses = Number(tournament.registeredHorses ?? 0);
  return maxHorses > 0
    ? `${registeredHorses}/${maxHorses}`
    : String(registeredHorses ?? 0);
}

export default function TournamentPublicDetailContent({ tournament, backTo }) {
  return (
    <div className="space-y-6">
      <Link
        to={backTo}
        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/70 transition hover:border-[#D4A017]/40 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Trở về danh sách
      </Link>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.045]">
        <div className="relative min-h-[280px]">
          <img
            src={tournament.banner}
            alt=""
            onError={setTournamentBannerFallback}
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A1628] via-[#0A1628]/78 to-[#0A1628]/20" />
          <div className="relative flex min-h-[280px] flex-col justify-end p-6 md:p-8">
            <div className="mb-4 flex flex-wrap gap-2">
              <Pill tone={tournament.statusTone}>{tournament.status}</Pill>
              <span className="rounded-full border border-[#D4A017]/35 bg-[#D4A017]/12 px-3 py-1 text-xs font-bold text-[#D4A017]">
                {tournament.raceCount} cuộc đua
              </span>
            </div>
            <h2 className="max-w-4xl text-3xl font-bold text-white md:text-4xl">
              {tournament.name}
            </h2>
            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm text-white/72">
              <HeroMeta icon={MapPin} text={tournament.location || "Chưa cập nhật địa điểm"} />
              <HeroMeta
                icon={Calendar}
                text={`${formatDate(tournament.startDate)} → ${formatDate(tournament.endDate)}`}
              />
              <HeroMeta icon={Users} text={`${formatCapacity(tournament)} đăng ký`} />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <DetailStat label="Tổng giải thưởng" value={formatMoney(tournament.prizePool)} tone="gold" />
        <DetailStat label="Đăng ký" value={formatCapacity(tournament)} tone="green" />
        <DetailStat label="Hạn đăng ký" value={formatDate(tournament.deadline)} tone="blue" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <GlassCard className="p-5">
          <div className="mb-4 flex items-center gap-2">
            <Flag className="h-5 w-5 text-[#D4A017]" />
            <h3 className="text-lg font-bold text-white">Cuộc đua trong giải</h3>
          </div>

          {tournament.races.length === 0 ? (
            <p className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-white/45">
              Chưa có cuộc đua được công bố.
            </p>
          ) : (
            <div className="space-y-4">
              {tournament.races.map((race) => (
                <RaceCard key={race.id} race={race} />
              ))}
            </div>
          )}
        </GlassCard>

        <div className="space-y-6">
          <GlassCard className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-[#D4A017]" />
              <h3 className="text-lg font-bold text-white">Thông tin giải đấu</h3>
            </div>
            <p className="text-sm leading-6 text-white/58">
              {tournament.description || "Chưa có mô tả giải đấu."}
            </p>
          </GlassCard>

          <GlassCard className="p-5">
            <div className="mb-3 text-sm font-bold text-white">Thời gian đăng ký</div>
            <div className="space-y-3 text-sm text-white/60">
              <InfoLine label="Mở đăng ký" value={formatDate(tournament.registrationOpenDate)} />
              <InfoLine label="Kết thúc đăng ký" value={formatDate(tournament.registrationCloseDate)} />
            </div>
          </GlassCard>
        </div>
      </section>
    </div>
  );
}

function RaceCard({ race }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="text-base font-bold text-white">{race.name}</h4>
            <Pill tone="blue">{race.status}</Pill>
          </div>
          <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/52">
            <HeroMeta icon={Calendar} text={`${formatDate(race.date)} · ${race.time || "--:--"}`} />
            <HeroMeta icon={Route} text={race.distance || "Chưa cập nhật cự ly"} />
            <HeroMeta icon={MapPin} text={race.track || "Chưa cập nhật đường đua"} />
          </div>
        </div>
        <div className="rounded-xl border border-[#D4A017]/25 bg-[#D4A017]/10 px-4 py-3 text-right">
          <div className="text-[10px] font-bold uppercase tracking-wide text-white/45">
            Lệ phí
          </div>
          <div className="text-sm font-bold text-[#D4A017]">{formatMoney(race.entryFee)}</div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <RaceInfo label="Số ngựa" value={`${race.minHorses || 0} - ${race.maxHorses || 0}`} />
        <RaceInfo label="Đã đăng ký" value={`${race.registered || 0}/${race.maxHorses || 0}`} />
        <RaceInfo label="Check-in" value={race.checkIn || "--:--"} />
      </div>

      {race.description && (
        <p className="mt-4 rounded-xl bg-white/[0.035] p-3 text-sm leading-6 text-white/55">
          {race.description}
        </p>
      )}

      <div className="mt-4">
        <div className="mb-2 text-xs font-bold uppercase tracking-wide text-white/40">
          Giải thưởng
        </div>
        {race.prizes?.length ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {race.prizes.map((prize) => (
              <div
                key={prize.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.035] px-3 py-2 text-sm"
              >
                <span className="text-white/62">{prize.itemName}</span>
                <span className="font-semibold text-[#D4A017]">
                  {formatMoney(prize.amount)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/42">Chưa cấu hình giải thưởng.</p>
        )}
      </div>
    </article>
  );
}

function HeroMeta({ icon: Icon, text }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-2">
      <Icon className="h-4 w-4 shrink-0 text-[#D4A017]" />
      <span className="truncate">{text}</span>
    </span>
  );
}

function DetailStat({ label, value, tone }) {
  const tones = {
    gold: "text-[#D4A017]",
    green: "text-emerald-300",
    blue: "text-sky-300",
  };

  return (
    <GlassCard className="p-5">
      <div className="mb-2 text-xs font-bold uppercase tracking-wide text-white/40">
        {label}
      </div>
      <div className={`text-xl font-bold ${tones[tone] ?? "text-white"}`}>{value}</div>
    </GlassCard>
  );
}

function RaceInfo({ label, value }) {
  return (
    <div className="rounded-xl bg-white/[0.035] p-3">
      <div className="mb-1 text-[10px] font-bold uppercase tracking-wide text-white/35">
        {label}
      </div>
      <div className="text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

function InfoLine({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3 last:border-0 last:pb-0">
      <span>{label}</span>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}
