import fs from 'fs'
import path from 'path'

const srcDir = 'c:/Users/gmt/Videos/Horse Racing Tournament Website/src/app/components/referee'
const destDir = 'D:/semester 8/SWP391/Project-SWP/FE-HouseRacing/src/pages/referee'

function stripTypes(content) {
  let c = content
  c = c.replace(/from 'react-router'/g, "from 'react-router-dom'")
  c = c.replace(/from "react-router"/g, 'from "react-router-dom"')
  c = c.replace(/import\s+type\s+\{[^}]+\}\s+from\s+['"][^'"]+['"];?\n/g, '')
  c = c.replace(/,\s*type\s+[A-Za-z0-9_]+/g, '')
  c = c.replace(/^export type[\s\S]*?;\n/gm, '')
  c = c.replace(/^export interface[\s\S]*?^\}\n/gm, '')
  c = c.replace(/^type\s+[A-Za-z0-9_'| ]+\s*=[\s\S]*?;\n/gm, '')
  c = c.replace(/^interface\s+[A-Za-z0-9_]+[\s\S]*?^\}\n/gm, '')
  c = c.replace(/:\s*ReactNode/g, '')
  c = c.replace(/:\s*any/g, '')
  c = c.replace(/:\s*string(\s*\|\s*null)?/g, '')
  c = c.replace(/:\s*number/g, '')
  c = c.replace(/:\s*boolean/g, '')
  c = c.replace(/ as any/g, '')
  c = c.replace(/ as Tab/g, '')
  c = c.replace(/ as MgmtTab/g, '')
  c = c.replace(/ as ViolationType/g, '')
  c = c.replace(/ as ViolationSeverity/g, '')
  c = c.replace(/useState<[^>]+>/g, 'useState')
  c = c.replace(/useMemo<[^>]+>/g, 'useMemo')
  c = c.replace(/Record<[^>]+>/g, 'Object')
  c = c.replace(/const (\w+): \{[^}]+\}\[\] =/g, 'const $1 =')
  c = c.replace(/\)!/g, ')')
  c = c.replace(/\(sub: MgmtTab\)/g, '(sub)')
  c = c.replace(/\(t: MgmtTab\)/g, '(t)')
  c = c.replace(/\(t: Tab\)/g, '(t)')
  c = c.replace(/\(id, patch: Partial<ResultRow>\)/g, '(id, patch)')
  c = c.replace(/\(p: Object\) => void/g, '(p) => void')
  c = c.replace(/activeTab: MgmtTab;/g, '')
  c = c.replace(/horses: RefHorse\[\];/g, '')
  c = c.replace(/positions: Object;/g, '')
  c = c.replace(/setPositions: \(p: Object\) => void;/g, '')
  c = c.replace(/startPositions: Object;/g, '')
  c = c.replace(/rows: ResultRow\[\];/g, '')
  c = c.replace(/onUpdate\?: \(id, patch: Partial<ResultRow>\) => void;/g, '')
  c = c.replace(/readOnly\?;/g, '')
  c = c.replace(/goManagement: \(sub: MgmtTab\) => void;/g, '')
  c = c.replace(/const initial: Object = \{\};/g, 'const initial = {};')
  c = c.replace(/const next: Object = \{\};/g, 'const next = {};')
  c = c.replace(/const v: Violation = \{/g, 'const v = {')
  c = c.replace(/\(id, status: CheckInStatus\)/g, '(id, status)')
  c = c.replace(/const TYPE_META: Object = \{/g, 'const TYPE_META = {')
  c = c.replace(/\(v: Violation\)/g, '(v)')
  c = c.replace(/\(s: CheckInStatus\)/g, '(s)')
  c = c.replace(/\(s: AssignedStatus\)/g, '(s)')
  c = c.replace(/\(s: ViolationSeverity\)/g, '(s)')
  c = c.replace(/\(race: AssignedRace\)/g, '(race)')
  c = c.replace(/export function buildHorses\(race\): RefHorse\[\]/g, 'export function buildHorses(race)')
  c = c.replace(/const status: CheckInStatus =/g, 'const status =')
  c = c.replace(/export const violations: Violation\[\]/g, 'export const violations')
  c = c.replace(/export const notifications: RefNotification\[\]/g, 'export const notifications')
  c = c.replace(/export const checkinTone = \(s\): 'green' \| 'gold' \| 'red' \| 'purple' \| 'gray' =>/g, 'export const checkinTone = (s) =>')
  c = c.replace(/export const raceStatusTone = \(s\): 'gold' \| 'green' \| 'blue' \| 'purple' =>/g, 'export const raceStatusTone = (s) =>')
  c = c.replace(/export const severityTone = \(s\): 'gold' \| 'red' \| 'purple' \| 'gray' =>/g, 'export const severityTone = (s) =>')
  c = c.replace(/\}: \{[\s\S]*?\}\) \{/g, '}) {')
  c = c.replace(/\}: \{[\s\S]*?\}\) =>/g, '}) =>')
  c = c.replace(/useState>\(/g, 'useState(')
  c = c.replace(/const store = globalThis as any;/g, 'const store = globalThis;')
  return c
}

function adaptRaceDetail(content) {
  let c = content
  c = c.replace(
    /import \{ Link, useNavigate, useParams \} from 'react-router-dom';/,
    `import { Link, useNavigate, useLocation } from 'react-router-dom';`,
  )
  c = c.replace(
    /  const \{ id \} = useParams\(\);\n  const navigate = useNavigate\(\);\n  const race = assignedRaces\.find\(\(r\) => r\.id === id\);/,
    `  const { pathname } = useLocation();
  const id = pathname.split('/').filter(Boolean)[2];
  const navigate = useNavigate();
  const race = assignedRaces.find((r) => String(r.id) === String(id));`,
  )
  return c
}

function adaptLayout(content) {
  let c = stripTypes(content)
  c = c.replace(
    /import \{ RoleWalletBadge \} from '\.\.\/wallet\/RoleWalletBadge';/,
    `import RoleWalletBadge from '@/components/wallet/RoleWalletBadge'
import { WALLET_PATHS } from '@/constants/walletPaths'
import { useAuthStore } from '@/store/authStore'`,
  )
  c = c.replace(
    /export function RefereeLayout\(\{\n  children,\n  title,\n  subtitle,\n  actions,\n\}\) \{\n  const location = useLocation\(\);\n  const navigate = useNavigate\(\);\n  const \[open, setOpen\] = useState\(false\);\n\n  const logout = \(\) => \{\n    try \{ localStorage\.removeItem\('auth_user'\); \} catch \{\}\n    navigate\('\/login'\);\n  \};/,
    `export function RefereeLayout({ children, title, subtitle, actions }) {
  const location = useLocation();
  const navigate = useNavigate();
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);
  const [open, setOpen] = useState(false);

  const displayName = user?.fullName || user?.username || 'Trọng tài';
  const avatarLetter = displayName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };`,
  )
  c = c.replace(
    /<div className="text-\[11px\] text-white\/60">Lê Trọng Tài · FIA Cert<\/div>/,
    '<div className="text-[11px] text-white/60 truncate">{displayName}</div>',
  )
  c = c.replace(
    /onClick=\{logout\}/,
    'type="button" onClick={handleLogout}',
  )
  c = c.replace(
    /<RoleWalletBadge role="referee" theme="dark" \/>/,
    '<RoleWalletBadge to={WALLET_PATHS.REFEREE} walletMode="user" theme="dark" />',
  )
  c = c.replace(
    /<div className="w-9 h-9 bg-gradient-to-br from-\[#D4A017\] to-\[#B8941F\] rounded-xl flex items-center justify-center font-bold shadow-md shadow-\[#D4A017\]\/30">\s*L\s*<\/div>\s*<div className="hidden md:block">\s*<div className="text-sm font-semibold leading-tight">Lê Trọng Tài<\/div>\s*<div className="text-\[10px\] text-white\/40">Trọng tài chính · FIA<\/div>\s*<\/div>/s,
    `<div className="w-9 h-9 bg-gradient-to-br from-[#D4A017] to-[#B8941F] rounded-xl flex items-center justify-center font-bold shadow-md shadow-[#D4A017]/30">
                {avatarLetter}
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-semibold leading-tight">{displayName}</div>
                <div className="text-[10px] text-white/40">Trọng tài</div>
              </div>`,
  )
  return c
}

function adaptWallet(content) {
  let c = stripTypes(content)
  c = c.replace(
    /import \{ WalletPanel \} from '\.\.\/wallet\/WalletPanel';\nimport \{ useWallet \} from '\.\.\/\.\.\/wallet\/WalletContext';[\s\S]*?const handleReceiveBonus[\s\S]*?\};\n\n/,
    `import WalletPanel from '@/components/wallet/WalletPanel'

`,
  )
  c = c.replace(
    /<WalletPanel[\s\S]*?\/>/,
    `<WalletPanel
        walletMode="user"
        title="Ví trọng tài"
        description="Nhận lương từ hệ thống và phụ cấp theo từng giải đấu được phân công."
      />`,
  )
  return c
}

function adaptPages(content, fileName) {
  let c = stripTypes(content)
  if (fileName === 'RefereeRaceDetail.tsx') {
    c = adaptRaceDetail(c)
  }
  c = c.replace(/from '\.\.\/admin\/AdminLayout'/g, "from '@/pages/admin/AdminLayout'")
  return c
}

const allFiles = [
  'RefereeLayout.tsx',
  'RefereeDashboard.tsx',
  'RefereeRaces.tsx',
  'RefereeRaceDetail.tsx',
  'RefereeViolations.tsx',
  'RefereeHistory.tsx',
  'RefereeNotifications.tsx',
  'RefereeWallet.tsx',
]

const dataSrc = fs.readFileSync(path.join(srcDir, 'data.ts'), 'utf8')
fs.writeFileSync(path.join(destDir, 'data.js'), stripTypes(dataSrc))

for (const file of allFiles) {
  const raw = fs.readFileSync(path.join(srcDir, file), 'utf8')
  let out
  if (file === 'RefereeLayout.tsx') out = adaptLayout(raw)
  else if (file === 'RefereeWallet.tsx') out = adaptWallet(raw)
  else out = adaptPages(raw, file)
  fs.writeFileSync(path.join(destDir, file.replace('.tsx', '.jsx')), out)
}

console.log('Synced pure referee UI (mock data) from reference project')
