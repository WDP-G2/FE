import { DollarSign, Flag, Settings, Trash2, TrendingUp, Trophy, Users } from "lucide-react";
import {
  BarSummary,
  Card,
  Field,
  Input,
  PanelActions,
  PanelHeader,
  SectionHeading,
  Select,
  StatCard,
} from "@/components/admin/tournament-detail/DetailUi";
import {
  formatVnd,
  getTotalPrize,
} from "@/components/admin/tournament-detail/detailData";

export function StatisticsTab({ tournament, totalPrize, totalRegistered }) {
  const maxRegistered = Math.max(
    ...tournament.races.map((race) => race.registered),
  );
  const maxPrize = Math.max(
    ...tournament.races.map((race) => getTotalPrize(race)),
  );
  const revenue = tournament.races.reduce(
    (sum, race) => sum + race.entryFee * race.registered,
    0,
  );

  return (
    <>
      <div className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Flag}
          tone="gold"
          value={String(tournament.races.length)}
          label="Cuộc đua"
        />
        <StatCard
          icon={Users}
          tone="green"
          value={String(totalRegistered)}
          label="Tổng đăng ký"
        />
        <StatCard
          icon={DollarSign}
          tone="blue"
          value={formatVnd(revenue)}
          label="Doanh thu lệ phí"
        />
        <StatCard
          icon={Trophy}
          tone="purple"
          value={formatVnd(totalPrize)}
          label="Tổng thưởng"
        />
      </div>
      <div className="grid gap-7 lg:grid-cols-2">
        <Card className="p-7">
          <SectionHeading icon={Users}>Đăng ký theo cuộc đua</SectionHeading>
          <BarSummary
            items={tournament.races.map((race) => ({
              label: `R${race.no}`,
              value: race.registered,
            }))}
            max={maxRegistered}
          />
        </Card>
        <Card className="p-7">
          <SectionHeading icon={TrendingUp}>
            Giải thưởng theo cuộc đua
          </SectionHeading>
          <BarSummary
            items={tournament.races.map((race) => ({
              label: `R${race.no}`,
              value: getTotalPrize(race),
            }))}
            max={maxPrize}
            format={formatVnd}
          />
        </Card>
      </div>
    </>
  );
}

export function SettingsTab({ tournament, setTournament }) {
  return (
    <div className="grid gap-7 lg:grid-cols-[1fr_300px]">
      <Card>
        <PanelHeader
          icon={Settings}
          title="Cài đặt giải đấu"
          subtitle="Thông tin chung và trạng thái"
        />
        <div className="grid gap-5 p-6 md:grid-cols-2">
          <Field label="Tên giải đấu" full>
            <Input
              value={tournament.name}
              onChange={(event) =>
                setTournament({ ...tournament, name: event.target.value })
              }
            />
          </Field>
          <Field label="Địa điểm" full>
            <Input
              value={tournament.location}
              onChange={(event) =>
                setTournament({ ...tournament, location: event.target.value })
              }
            />
          </Field>
          <Field label="Ngày bắt đầu">
            <Input
              type="date"
              value={tournament.startDate}
              onChange={(event) =>
                setTournament({ ...tournament, startDate: event.target.value })
              }
            />
          </Field>
          <Field label="Ngày kết thúc">
            <Input
              type="date"
              value={tournament.endDate}
              onChange={(event) =>
                setTournament({ ...tournament, endDate: event.target.value })
              }
            />
          </Field>
          <Field label="Trạng thái" full>
            <Select
              value={tournament.status}
              onChange={(event) =>
                setTournament({ ...tournament, status: event.target.value })
              }
            >
              <option>Nháp</option>
              <option>Đang mở đăng ký</option>
              <option>Đang diễn ra</option>
              <option>Đã kết thúc</option>
            </Select>
          </Field>
        </div>
        <PanelActions />
      </Card>
      <Card className="h-fit border-rose-400/25 bg-rose-400/[0.07] p-6">
        <h3 className="mb-2 text-xl font-bold">Vùng nguy hiểm</h3>
        <p className="mb-5 text-sm text-white/55">
          Hành động không thể hoàn tác.
        </p>
        <button
          type="button"
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-rose-400/40 bg-rose-500/15 font-semibold text-rose-300"
        >
          <Trash2 className="h-5 w-5" />
          Xóa giải đấu
        </button>
      </Card>
    </div>
  );
}
