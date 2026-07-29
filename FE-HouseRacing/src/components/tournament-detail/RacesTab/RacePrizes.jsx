import { useState } from "react";
import { Crown, Gift, Medal, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Card from "@/components/ui/Card";
import { Input, MoneyInput } from "@/components/ui/Input";
import { PanelActions, PanelHeader } from "@/components/ui/Panel";
import { primaryButton } from "@/components/ui/styles";
import { formatVnd, normalizePrizeList } from "../utils";

export default function RacePrizes({ race, saving, onSave }) {
  const [draftPrizes, setDraftPrizes] = useState(() =>
    normalizePrizeList(race.prizes),
  );
  const prizes = draftPrizes;
  const total = prizes.reduce(
    (sum, prize) => sum + Number(prize.amount || 0),
    0,
  );
  const updatePrize = (id, patch) => {
    setDraftPrizes((previous) =>
      previous.map((prize) =>
        prize.id === id ? { ...prize, ...patch } : prize,
      ),
    );
  };
  const addPrize = () => {
    setDraftPrizes((previous) => {
      const nextRank =
        Math.max(0, ...previous.map((prize) => Number(prize.rank || 0))) + 1;
      let suffix = previous.length + 1;
      let nextId = `new-prize-${race.id}-${nextRank}-${suffix}`;

      while (previous.some((prize) => prize.id === nextId)) {
        suffix += 1;
        nextId = `new-prize-${race.id}-${nextRank}-${suffix}`;
      }

      return [
        ...previous,
        {
          id: nextId,
          rank: nextRank,
          itemName: `Giải ${nextRank}`,
          amount: 0,
        },
      ];
    });
  };
  const removePrize = (id) => {
    setDraftPrizes((previous) => previous.filter((prize) => prize.id !== id));
  };
  const savePrizes = () => {
    const sorted = [...prizes].sort(
      (firstPrize, secondPrize) =>
        Number(firstPrize.rank) - Number(secondPrize.rank),
    );
    const ranks = new Set();

    for (const prize of sorted) {
      if (Number(prize.rank) <= 0) {
        toast.error("Hạng giải thưởng phải lớn hơn 0");
        return;
      }
      if (ranks.has(Number(prize.rank))) {
        toast.error("Hạng giải thưởng không được trùng nhau");
        return;
      }
      if (Number(prize.amount) < 0) {
        toast.error("Số tiền giải thưởng không được âm");
        return;
      }
      ranks.add(Number(prize.rank));
    }

    for (let index = 1; index < sorted.length; index += 1) {
      if (Number(sorted[index - 1].amount) <= Number(sorted[index].amount)) {
        toast.error("Số tiền giải sau phải nhỏ hơn giải trước");
        return;
      }
    }

    onSave(sorted);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <style>
        {`
          @media (min-width: 768px) {
            .race-prize-grid {
              grid-template-columns: 40px minmax(0, 1fr) 120px 180px 44px;
            }
          }
        `}
      </style>
      <Card className="overflow-hidden">
        <PanelHeader
          icon={Crown}
          title="Cấu hình giải thưởng"
          subtitle="Mỗi cuộc đua có giải thưởng riêng"
        />
        <div className="flex justify-end border-b border-white/10 bg-white/[0.018] px-6 py-4">
          <button
            type="button"
            onClick={addPrize}
            className={`${primaryButton} h-11 rounded-xl px-5 text-sm shadow-[#dda50e]/15`}
          >
            <Plus className="h-4 w-4" />
            Thêm giải thưởng
          </button>
        </div>
        <div className="space-y-3 p-6">
          <div className="race-prize-grid hidden items-center gap-4 rounded-2xl border border-[#dda50e]/20 bg-gradient-to-r from-[#dda50e]/12 to-white/[0.035] px-4 py-3 text-xs font-bold uppercase text-white/60 shadow-inner shadow-white/[0.025] md:grid">
            <span aria-hidden="true" />
            <span className="whitespace-nowrap text-white/70">
              Tên giải thưởng
            </span>
            <span className="text-center text-white/70">Hạng</span>
            <span className="text-center text-white/70">Số tiền</span>
            <span aria-hidden="true" />
          </div>
          {prizes.map((prize) => {
            const Icon =
              prize.rank === 1 ? Crown : prize.rank <= 3 ? Medal : Gift;
            const color =
              prize.rank === 1
                ? "text-[#dda50e]"
                : prize.rank <= 3
                  ? "text-orange-300"
                  : "text-emerald-300";
            return (
              <div
                key={prize.id}
                className="race-prize-grid grid gap-3 rounded-2xl border border-white/10 bg-white/[0.028] p-4 transition hover:border-[#dda50e]/25 hover:bg-white/[0.045] md:items-center md:gap-4"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#07111f]/65">
                  <Icon className={`h-5 w-5 ${color}`} />
                </span>
                <Input
                  className="font-semibold"
                  value={prize.itemName}
                  onChange={(event) =>
                    updatePrize(prize.id, { itemName: event.target.value })
                  }
                  placeholder="Tên giải thưởng"
                />
                <Input
                  type="number"
                  min="1"
                  value={prize.rank}
                  onChange={(event) =>
                    updatePrize(prize.id, { rank: Number(event.target.value) })
                  }
                  aria-label="Hạng nhận thưởng"
                  className="font-bold tabular-nums md:text-center"
                  placeholder="Hạng"
                />
                <MoneyInput
                  value={prize.amount}
                  onValueChange={(value) =>
                    updatePrize(prize.id, {
                      amount: Number(value || 0),
                    })
                  }
                  aria-label="Số tiền thưởng"
                  className="font-semibold tabular-nums md:text-right"
                  placeholder="Số tiền"
                />
                <button
                  type="button"
                  aria-label="Xóa giải thưởng"
                  onClick={() => removePrize(prize.id)}
                  disabled={prizes.length === 1}
                  className="justify-self-end rounded-xl border border-transparent p-3 text-white/45 transition hover:border-rose-300/20 hover:bg-rose-400/10 hover:text-rose-300 disabled:cursor-not-allowed disabled:hover:border-transparent disabled:hover:bg-transparent disabled:text-white/20"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            );
          })}
        </div>
        <PanelActions
          saving={saving}
          onCancel={() => setDraftPrizes(normalizePrizeList(race.prizes))}
          onSave={savePrizes}
        />
      </Card>
      <Card className="h-fit overflow-hidden">
        <div className="border-b border-white/10 bg-[#dda50e]/10 p-6">
          <h3 className="text-sm font-bold uppercase text-white/58">
            Tổng giải thưởng
          </h3>
          <p className="mt-2 text-3xl font-bold text-[#dda50e]">
            {formatVnd(total)}
          </p>
        </div>
        <div className="p-6">
          {prizes.map((prize) => (
            <div
              key={prize.id}
              className="mb-3 flex justify-between gap-4 rounded-xl bg-white/[0.035] px-4 py-3 text-sm text-white/65"
            >
              <span className="min-w-0 truncate">{prize.itemName}</span>
              <span className="shrink-0 font-semibold text-white">
                {formatVnd(prize.amount)}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
