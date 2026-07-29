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
  c = c.replace(/^type\s+[A-Za-z0-9_]+\s*=\s*[^\n]+;\n/gm, '')
  c = c.replace(/^interface\s+[A-Za-z0-9_]+[\s\S]*?^\}\n/gm, '')
  c = c.replace(/:\s*ReactNode/g, '')
  c = c.replace(/\(\s*t:\s*Tab\s*\)/g, '(t)')
  c = c.replace(/:\s*\{\s*target:\s*string\s*\}/g, '')
  c = c.replace(/:\s*\{\s*raceId:\s*string[^}]*\}/g, '')
  c = c.replace(/:\s*\{\s*raceId:\s*string;\s*raceName:\s*string\s*\}/g, '')
  c = c.replace(/:\s*\{\s*race:\s*any[^}]*\}/g, '')
  c = c.replace(/:\s*\{\s*k:\s*string;\s*v:\s*string\s*\}/g, '')
  c = c.replace(/:\s*\{\s*text:\s*string\s*\}/g, '')
  c = c.replace(/:\s*any/g, '')
  c = c.replace(/:\s*string(\s*\|\s*null)?/g, '')
  c = c.replace(/:\s*number/g, '')
  c = c.replace(/:\s*boolean/g, '')
  c = c.replace(/:\s*Tab/g, '')
  c = c.replace(/:\s*Violation(\s*\|\s*null)?/g, '')
  c = c.replace(/:\s*ViolationType/g, '')
  c = c.replace(/:\s*ViolationSeverity/g, '')
  c = c.replace(/:\s*CheckInStatus/g, '')
  c = c.replace(/:\s*AssignedStatus(\[\])?/g, '')
  c = c.replace(/:\s*ResultRow(\[\])?/g, '')
  c = c.replace(/:\s*RefHorse(\[\])?/g, '')
  c = c.replace(/ as any/g, '')
  c = c.replace(/ as Tab/g, '')
  c = c.replace(/ as ViolationType/g, '')
  c = c.replace(/ as ViolationSeverity/g, '')
  c = c.replace(/useState<[^>]+>/g, 'useState')
  c = c.replace(/useMemo<[^>]+>/g, 'useMemo')
  c = c.replace(/Record<[^>]+>/g, 'Object')
  c = c.replace(/<RefNotification\['type'\]>/g, '')
  return c
}

const dataSrc = fs.readFileSync(path.join(srcDir, 'data.ts'), 'utf8')
let dataJs = stripTypes(dataSrc)
dataJs = dataJs.replace(/:\s*AssignedStatus/g, '')
dataJs = dataJs.replace(/:\s*CheckInStatus/g, '')
dataJs = dataJs.replace(/:\s*ViolationSeverity/g, '')
dataJs = dataJs.replace(/:\s*ViolationType/g, '')
dataJs = dataJs.replace(/:\s*AssignedRace\[\]/g, '')
dataJs = dataJs.replace(/:\s*Violation\[\]/g, '')
dataJs = dataJs.replace(/:\s*RefNotification\[\]/g, '')
dataJs = dataJs.replace(/:\s*RefHorse\[\]/g, '')
dataJs = dataJs.replace(/:\s*AssignedRace/g, '')
dataJs = dataJs.replace(/:\s*Violation/g, '')
dataJs = dataJs.replace(/:\s*RefHorse/g, '')
dataJs = dataJs.replace(/:\s*'green' \| 'gold' \| 'red' \| 'purple' \| 'gray'/g, '')
dataJs = dataJs.replace(/:\s*'gold' \| 'green' \| 'blue' \| 'purple'/g, '')
dataJs = dataJs.replace(/:\s*'gold' \| 'red' \| 'purple' \| 'gray'/g, '')
dataJs = dataJs.replace(/\(v: Violation\)/g, '(v)')
dataJs = dataJs.replace(/\(s: CheckInStatus\)/g, '(s)')
dataJs = dataJs.replace(/\(s: AssignedStatus\)/g, '(s)')
dataJs = dataJs.replace(/\(s: ViolationSeverity\)/g, '(s)')
dataJs = dataJs.replace(/\(race: AssignedRace\)/g, '(race)')
fs.writeFileSync(path.join(destDir, 'data.js'), dataJs)

const files = [
  'RefereeDashboard.tsx',
  'RefereeRaces.tsx',
  'RefereeRaceDetail.tsx',
  'RefereeViolations.tsx',
  'RefereeHistory.tsx',
  'RefereeNotifications.tsx',
]

for (const file of files) {
  const src = fs.readFileSync(path.join(srcDir, file), 'utf8')
  const out = stripTypes(src)
  fs.writeFileSync(path.join(destDir, file.replace('.tsx', '.jsx')), out)
}

console.log('Converted', files.length + 1, 'files')
