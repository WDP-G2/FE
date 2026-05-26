import { Save } from "lucide-react";
import { primaryButton } from "@/components/admin/tournament-detail/detailStyles";

export function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-3xl border border-white/10 bg-white/[0.045] ${className}`}
    >
      {children}
    </div>
  );
}

export function Badge({ children, tone = "gray" }) {
  const tones = {
    gold: "border-[#dda50e]/40 bg-[#dda50e]/15 text-[#efbb2c]",
    green: "border-emerald-400/35 bg-emerald-500/15 text-emerald-300",
    blue: "border-sky-400/35 bg-sky-500/15 text-sky-300",
    purple: "border-purple-400/35 bg-purple-500/15 text-purple-300",
    red: "border-rose-400/35 bg-rose-500/15 text-rose-300",
    gray: "border-white/15 bg-white/10 text-white/65",
  };

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function StatCard({ icon: Icon, tone, value, label }) {
  const tones = {
    gold: "bg-[#dda50e]/15 text-[#dda50e]",
    green: "bg-emerald-500/15 text-emerald-300",
    blue: "bg-sky-500/15 text-sky-300",
    purple: "bg-purple-500/15 text-purple-300",
  };

  return (
    <Card className="p-7">
      <span
        className={`mb-7 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 ${tones[tone]}`}
      >
        <Icon className="h-8 w-8" />
      </span>
      <p className="truncate text-3xl font-bold">{value}</p>
      <p className="mt-3 text-base text-white/50">{label}</p>
    </Card>
  );
}

export function SectionHeading({ icon: Icon, children }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <Icon className="h-6 w-6 text-[#dda50e]" />
      <h2 className="text-2xl font-bold">{children}</h2>
    </div>
  );
}

export function PanelHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-4 border-b border-white/10 p-6">
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#dda50e]/15 text-[#dda50e]">
        <Icon className="h-6 w-6" />
      </span>
      <div>
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-sm text-white/50">{subtitle}</p>
      </div>
    </div>
  );
}

export function PanelActions() {
  return (
    <div className="flex justify-end gap-3 p-6 pt-0">
      <button
        type="button"
        className="rounded-xl border border-white/10 px-6 py-3 font-semibold text-white/70"
      >
        Hủy
      </button>
      <button type="button" className={primaryButton}>
        <Save className="h-5 w-5" />
        Lưu thay đổi
      </button>
    </div>
  );
}

export function Field({ label, children, full = false }) {
  return (
    <label className={full ? "md:col-span-2" : ""}>
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-white/55">
        {label}
      </span>
      {children}
    </label>
  );
}

export function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`h-12 w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 text-white outline-none focus:border-[#dda50e]/65 ${className}`}
    />
  );
}

export function Select({ children, ...props }) {
  return (
    <select
      {...props}
      className="h-12 w-full rounded-xl border border-white/10 bg-[#17243a] px-4 text-white outline-none focus:border-[#dda50e]/65"
    >
      {children}
    </select>
  );
}

export function TextArea(props) {
  return (
    <textarea
      {...props}
      rows={3}
      className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.05] p-4 text-white outline-none focus:border-[#dda50e]/65"
    />
  );
}

export function SimpleTable({ headers, rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-white/45">
            {headers.map((header) => (
              <th key={header} className="px-6 py-4">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="border-b border-white/5 text-sm text-white/70 last:border-0"
            >
              {row.map((item, itemIndex) => (
                <td
                  key={itemIndex}
                  className="px-6 py-4 first:font-semibold first:text-white"
                >
                  {item}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function BarSummary({ items, max, format = (value) => value }) {
  return (
    <div className="space-y-5">
      {items.map((item) => (
        <div key={item.label}>
          <div className="mb-2 flex justify-between text-sm">
            <span className="font-semibold">{item.label}</span>
            <span className="text-white/55">{format(item.value)}</span>
          </div>
          <div className="h-4 rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[#dda50e]"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Meta({ icon: Icon, text }) {
  return (
    <span className="flex items-center gap-3">
      <Icon className="h-5 w-5 text-[#dda50e]" />
      {text}
    </span>
  );
}
