import { Grid3x3 } from "lucide-react";
import Card from "@/components/ui/Card";
import { PanelHeader } from "@/components/ui/Panel";
import { registrationsFor } from "../utils";

export default function RaceGates({ race }) {
  return (
    <Card>
      <PanelHeader
        icon={Grid3x3}
        title="Vị trí xuất phát"
        subtitle="Phân làn các ngựa đã được duyệt"
      />
      <div className="grid gap-4 p-6 md:grid-cols-2">
        {registrationsFor(race)
          .slice(0, race.maxHorses)
          .map((item, index) => (
            <div
              key={item.horse}
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.035] p-4"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#dda50e] text-xl font-bold">
                {index + 1}
              </span>
              <div>
                <p className="font-bold">{item.horse}</p>
                <p className="text-sm text-white/55">{item.jockey}</p>
              </div>
            </div>
          ))}
      </div>
    </Card>
  );
}
