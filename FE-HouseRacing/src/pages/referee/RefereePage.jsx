import { useLocation } from 'react-router-dom'
import { RefereeDashboard } from './RefereeDashboard'
import { RefereeRaces } from './RefereeRaces'
import { RefereeRaceDetail } from './RefereeRaceDetail'
import { RefereeViolations } from './RefereeViolations'
import { RefereeHistory } from './RefereeHistory'
import { RefereeNotifications } from './RefereeNotifications'
import { RefereeWallet } from './RefereeWallet'

export default function RefereePage() {
  const { pathname } = useLocation()

  if (/^\/referee\/races\/[^/]+/.test(pathname)) return <RefereeRaceDetail />
  if (pathname.startsWith('/referee/races')) return <RefereeRaces />
  if (pathname.startsWith('/referee/violations')) return <RefereeViolations />
  if (pathname.startsWith('/referee/history')) return <RefereeHistory />
  if (pathname.startsWith('/referee/notifications')) return <RefereeNotifications />
  if (pathname.startsWith('/referee/wallet')) return <RefereeWallet />

  return <RefereeDashboard />
}
