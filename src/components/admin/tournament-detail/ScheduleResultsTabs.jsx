import { useState } from "react";
import { ArrowRight, CalendarRange, MapPin, Route, Timer } from "lucide-react";
import {
  Badge,
  Card,
  Meta,
  PanelHeader,
  SimpleTable,
} from "@/components/admin/tournament-detail/DetailUi";
import {
  formatVnd,
  getTotalPrize,
  resultsFor,
  toneForStatus,
} from "@/components/admin/tournament-detail/detailData";

export function ScheduleTab({ tournament }) {
  return (
    <Card>
      <PanelHeader
        icon={CalendarRange}
        title="Lịch thi đấu"
        subtitle="Tất cả cuộc đua theo thứ tự thời gian"
      />
      <div className="space-y-4 p-6">
        {tournament.races.map((race) => (
          <div
            key={race.id}
            className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-5 md:flex-row md:items-center"
          >
            <div className="w-28 shrink-0 text-center">
              <div className="text-sm text-white/50">{race.date.slice(5)}</div>
              <div className="text-2xl font-bold text-[#dda50e]">
                {race.time}
              </div>
            </div>
            <div className="hidden h-14 w-px bg-white/10 md:block" />
            <div className="flex-1">
              <div className="mb-2 flex items-center gap-3">
                <span className="font-bold text-[#dda50e]">R{race.no}</span>
                <span className="text-lg font-bold">{race.name}</span>
                <Badge tone={toneForStatus(race.status)}>{race.status}</Badge>
              </div>
              <div className="flex flex-wrap gap-5 text-sm text-white/55">
                <Meta icon={Route} text={race.distance} />
                <Meta icon={MapPin} text={race.track} />
                <Meta icon={Timer} text={`Check-in ${race.checkIn}`} />
              </div>
            </div>
            <Badge tone="purple">{formatVnd(getTotalPrize(race))}</Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function ResultsTab({ tournament }) {
  const [expanded, setExpanded] = useState(tournament.races[0]?.id);

  return (
    <div className="space-y-4">
      {tournament.races.map((race) => {
        const open = expanded === race.id;
        const results = resultsFor(race);

        return (
          <Card key={race.id} className="overflow-hidden">
            <button
              type="button"
              onClick={() => setExpanded(open ? "" : race.id)}
              className="flex w-full items-center gap-5 p-6 text-left transition hover:bg-white/[0.03]"
            >
              <span className="rounded-xl bg-[#dda50e] px-4 py-3 font-bold">
                R{race.no}
              </span>
              <span className="flex-1">
                <span className="mb-2 flex items-center gap-3">
                  <span className="text-xl font-bold">{race.name}</span>
                  <Badge tone={toneForStatus(race.status)}>{race.status}</Badge>
                </span>
                <span className="text-sm text-white/55">
                  {race.date} · {race.time} · Quán quân: {results[0].horse}
                </span>
              </span>
              <span className="font-bold text-[#dda50e]">
                {formatVnd(getTotalPrize(race))}
              </span>
              <ArrowRight
                className={`h-5 w-5 text-white/45 transition ${open ? "rotate-90" : ""}`}
              />
            </button>
            {open && (
              <SimpleTable
                headers={[
                  "Hạng",
                  "Ngựa",
                  "Chủ ngựa",
                  "Jockey",
                  "Thời gian",
                  "Thưởng",
                ]}
                rows={results.map((item) => [
                  `#${item.position}`,
                  item.horse,
                  item.owner,
                  item.jockey,
                  item.time,
                  item.position < 4
                    ? formatVnd(
                        [
                          race.prizes.first,
                          race.prizes.second,
                          race.prizes.third,
                        ][item.position - 1],
                      )
                    : "—",
                ])}
              />
            )}
          </Card>
        );
      })}
    </div>
  );
}
