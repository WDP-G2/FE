import { Award, Send } from "lucide-react";
import Card from "@/components/ui/Card";
import { PanelHeader, SimpleTable } from "@/components/ui/Panel";
import { primaryButton } from "@/components/ui/styles";
import { formatVnd, getPrizeAmountByRank, resultsFor } from "../utils";

export default function RaceResults({ race }) {
  return (
    <Card>
      <PanelHeader
        icon={Award}
        title="Nhập kết quả cuộc đua"
        subtitle="Xếp hạng và công bố thành tích"
      />
      <SimpleTable
        headers={["Hạng", "Ngựa", "Jockey", "Thời gian", "Giải thưởng"]}
        rows={resultsFor(race).map((item) => [
          `#${item.position}`,
          item.horse,
          item.jockey,
          item.time,
          item.position < 4
            ? formatVnd(getPrizeAmountByRank(race, item.position))
            : "—",
        ])}
      />
      <div className="flex justify-end p-6 pt-0">
        <button type="button" className={primaryButton}>
          <Send className="h-5 w-5" />
          Công bố kết quả
        </button>
      </div>
    </Card>
  );
}
