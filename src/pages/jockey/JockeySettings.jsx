import { useState } from 'react'
import { Bell, Shield, Globe, Save } from 'lucide-react'
import { JockeyLayout } from './JockeyLayout'
import { GlassCard, PrimaryButton } from '../admin/AdminLayout'
import { toast } from 'sonner'

export function JockeySettings() {
  const [settings, setSettings] = useState({ emailInvitations: true, emailRaceReminder: true, emailResults: true, pushNotif: true, language: 'vi', twoFactor: false, publicProfile: true })
  const toggle = (key) => setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  return (
    <JockeyLayout title="Jockey · Cài đặt" subtitle="Tùy chỉnh thông báo, bảo mật và giao diện" actions={<PrimaryButton icon={Save} onClick={() => toast.success('Đã lưu cài đặt')}>Lưu cài đặt</PrimaryButton>}>
      <div className="max-w-2xl space-y-5">
        <GlassCard><div className="p-5 border-b border-white/10 flex items-center gap-3"><Bell className="w-4 h-4 text-[#D4A017]" /><h3 className="font-bold text-white">Thông báo</h3></div><div className="p-5 space-y-4"><Toggle label="Thông báo lời mời qua email" value={settings.emailInvitations} onChange={() => toggle('emailInvitations')} /><Toggle label="Nhắc nhở lịch race qua email" value={settings.emailRaceReminder} onChange={() => toggle('emailRaceReminder')} /><Toggle label="Kết quả race qua email" value={settings.emailResults} onChange={() => toggle('emailResults')} /></div></GlassCard>
        <GlassCard><div className="p-5 border-b border-white/10 flex items-center gap-3"><Shield className="w-4 h-4 text-emerald-300" /><h3 className="font-bold text-white">Bảo mật</h3></div><div className="p-5 space-y-4"><Toggle label="Xác thực 2 bước (2FA)" value={settings.twoFactor} onChange={() => toggle('twoFactor')} /><Toggle label="Hồ sơ công khai" value={settings.publicProfile} onChange={() => toggle('publicProfile')} /></div></GlassCard>
        <GlassCard><div className="p-5 border-b border-white/10 flex items-center gap-3"><Globe className="w-4 h-4 text-sky-300" /><h3 className="font-bold text-white">Ngôn ngữ</h3></div><div className="p-5"><select value={settings.language} onChange={(e) => setSettings({ ...settings, language: e.target.value })} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#D4A017]"><option value="vi">Tiếng Việt</option><option value="en">English</option></select></div></GlassCard>
      </div>
    </JockeyLayout>
  )
}

function Toggle({ label, value, onChange }) {
  return <div className="flex items-center justify-between gap-4"><div className="text-sm font-semibold text-white">{label}</div><button onClick={onChange} className={`relative inline-flex w-11 h-6 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-[#D4A017]' : 'bg-white/20'}`}><span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${value ? 'left-6' : 'left-1'}`} /></button></div>
}
