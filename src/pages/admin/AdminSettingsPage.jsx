import { useState } from 'react'
import { DollarSign, FileText, Mail, Palette, Settings, Shield } from 'lucide-react'
import AdminLayout from '@/components/admin/AdminLayout'
import Field from '@/components/admin/ui/Field'
import { inputClass } from '@/components/admin/ui/styles'

const tabs = [
  { key: 'fees', label: 'Lß╗ç ph├¡ mß║╖c ─æß╗ïnh', icon: DollarSign },
  { key: 'rules', label: 'Luß║¡t mß║╖c ─æß╗ïnh', icon: FileText },
  { key: 'email', label: 'Mß║½u email', icon: Mail },
  { key: 'security', label: 'Bß║úo mß║¡t', icon: Shield },
  { key: 'brand', label: 'Th╞░╞íng hiß╗çu', icon: Palette },
]

export default function AdminSettingsPage() {
  const [tab, setTab] = useState('fees')

  return (
    <AdminLayout
      heading="C├ái ─æß║╖t"
      highlight="Hß╗ç thß╗æng"
      subtitle="Cß║Ñu h├¼nh mß║╖c ─æß╗ïnh d├╣ng chung cho to├án bß╗Ö nß╗ün tß║úng admin"
    >
      <section className="mb-6 flex flex-wrap gap-2 rounded-3xl border border-white/10 bg-white/[0.045] p-2">
        {tabs.map((item) => {
          const Icon = item.icon
          const active = tab === item.key

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                active
                  ? 'bg-[#dda50e] text-white shadow-lg shadow-[#d4a017]/30'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          )
        })}
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.045]">
        <div className="flex items-center gap-4 border-b border-white/10 px-6 py-5">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dda50e]/15 text-[#dda50e]">
            <Settings className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-xl font-bold">{tabs.find((item) => item.key === tab)?.label}</h2>
            <p className="text-sm text-white/50">Thiß║┐t lß║¡p nhanh theo module</p>
          </div>
        </div>

        <div className="grid gap-5 p-6 md:grid-cols-2">
          {tab === 'fees' && (
            <>
              <Field label="Lß╗ç ph├¡ ─æ─âng k├╜ mß║╖c ─æß╗ïnh (VN─É)">
                <input type="number" defaultValue={5000000} className={inputClass} />
              </Field>
              <Field label="Tiß╗ün cß╗ìc mß║╖c ─æß╗ïnh (VN─É)">
                <input type="number" defaultValue={10000000} className={inputClass} />
              </Field>
              <Field label="Ph├¡ trß╗à hß║ín (VN─É)">
                <input type="number" defaultValue={500000} className={inputClass} />
              </Field>
              <Field label="Ho├án cß╗ìc sau">
                <select defaultValue="3" className={inputClass}>
                  <option value="3">3 ng├áy</option>
                  <option value="7">7 ng├áy</option>
                  <option value="14">14 ng├áy</option>
                </select>
              </Field>
            </>
          )}

          {tab === 'rules' && (
            <Field label="Luß║¡t mß║½u ├íp dß╗Ñng cho giß║úi ─æß║Ñu mß╗¢i" full>
              <textarea
                rows={10}
                defaultValue={
                  '1. Ngß╗▒a phß║úi c├│ giß║Ñy chß╗⌐ng nhß║¡n sß╗⌐c khß╗Åe hß╗úp lß╗ç.\n2. Jockey phß║úi c├│ chß╗⌐ng chß╗ë FIA.\n3. Kiß╗âm tra doping bß║»t buß╗Öc.\n4. Tiß╗ün cß╗ìc ─æ╞░ß╗úc ho├án sau khi giß║úi kß║┐t th├║c.'
                }
                className={`${inputClass} h-auto resize-none py-4`}
              />
            </Field>
          )}

          {tab === 'email' && (
            <>
              <Field label="Mß║½u mß╗ƒ ─æ─âng k├╜" full>
                <input
                  defaultValue="[HorseRacing] Mß╗ƒ ─æ─âng k├╜ giß║úi ─æß║Ñu {{tournament}}"
                  className={inputClass}
                />
              </Field>
              <Field label="Mß║½u nhß║»c check-in" full>
                <input
                  defaultValue="[HorseRacing] Nhß║»c check-in cuß╗Öc ─æua {{race}}"
                  className={inputClass}
                />
              </Field>
              <Field label="Mß║½u c├┤ng bß╗æ kß║┐t quß║ú" full>
                <input
                  defaultValue="[HorseRacing] Kß║┐t quß║ú cuß╗Öc ─æua {{race}}"
                  className={inputClass}
                />
              </Field>
            </>
          )}

          {tab === 'security' && (
            <>
              <Field label="X├íc thß╗▒c 2 yß║┐u tß╗æ">
                <select defaultValue="admin" className={inputClass}>
                  <option value="admin">Bß║¡t cho Admin</option>
                  <option value="all">Bß║»t buß╗Öc tß║Ñt cß║ú</option>
                  <option value="off">Tß║»t</option>
                </select>
              </Field>
              <Field label="Thß╗¥i gian phi├¬n (ph├║t)">
                <input type="number" defaultValue={60} className={inputClass} />
              </Field>
            </>
          )}

          {tab === 'brand' && (
            <>
              <Field label="T├¬n hß╗ç thß╗æng">
                <input defaultValue="Horse Racing Admin" className={inputClass} />
              </Field>
              <Field label="M├áu ch├¡nh">
                <input defaultValue="#D4A017" className={inputClass} />
              </Field>
            </>
          )}
        </div>

        <div className="flex justify-end gap-3 px-6 pb-6">
          <button
            type="button"
            className="rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-3 font-semibold text-white/70 transition hover:bg-white/[0.08]"
          >
            Hß╗ºy
          </button>
          <button
            type="button"
            className="rounded-2xl bg-[#dda50e] px-5 py-3 font-semibold text-white shadow-lg shadow-[#d4a017]/20 transition hover:bg-[#c8940f]"
          >
            L╞░u c├ái ─æß║╖t
          </button>
        </div>
      </section>
    </AdminLayout>
  )
}

