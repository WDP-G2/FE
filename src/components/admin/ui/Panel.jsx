import { Save } from 'lucide-react'
import { primaryButton } from './styles'

export function SectionHeading({ icon: Icon, children }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <Icon className="h-6 w-6 text-[#dda50e]" />
      <h2 className="text-2xl font-bold">{children}</h2>
    </div>
  )
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
  )
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
  )
}

export function Meta({ icon: Icon, text }) {
  return (
    <span className="flex items-center gap-3">
      <Icon className="h-5 w-5 text-[#dda50e]" />
      {text}
    </span>
  )
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
  )
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
  )
}
