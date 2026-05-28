import { useState } from 'react';
import { Bell, Shield, Globe, Save } from 'lucide-react';
import { HorseOwnerLayout } from './HorseOwnerLayout';
import { GlassCard, PrimaryButton } from '../admin/AdminLayout';
import { toast } from 'sonner';

export function HorseOwnerSettings() {
  const [settings, setSettings] = useState({
    emailRaceReminder: true,
    emailResults: true,
    emailPayment: true,
    pushNotif: true,
    language: 'vi',
    currency: 'VND',
    twoFactor: false,
    publicProfile: true,
  });

  const toggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const save = () => toast.success('Đã lưu cài đặt');

  return (
    <HorseOwnerLayout title="Horse Owner · Cài đặt" subtitle="Tùy chỉnh thông báo, bảo mật và giao diện" actions={<PrimaryButton icon={Save} onClick={save}>Lưu cài đặt</PrimaryButton>}>
      <div className="max-w-2xl space-y-5">
        <GlassCard>
          <div className="p-5 border-b border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 bg-[#D4A017]/15 rounded-xl flex items-center justify-center"><Bell className="w-4 h-4 text-[#D4A017]" /></div>
            <div><h3 className="font-bold text-white">Thông báo</h3><p className="text-xs text-white/50">Quản lý cách bạn nhận thông báo</p></div>
          </div>
          <div className="p-5 space-y-4">
            <Toggle label="Nhắc nhở lịch race qua email" desc="Nhận email trước race 24h" value={settings.emailRaceReminder} onChange={() => toggle('emailRaceReminder')} />
            <Toggle label="Kết quả race qua email" desc="Nhận kết quả sau khi race kết thúc" value={settings.emailResults} onChange={() => toggle('emailResults')} />
            <Toggle label="Thông báo thanh toán" desc="Xác nhận entry fee và tiền thưởng" value={settings.emailPayment} onChange={() => toggle('emailPayment')} />
            <Toggle label="Thông báo đẩy" desc="Nhận thông báo realtime trong ứng dụng" value={settings.pushNotif} onChange={() => toggle('pushNotif')} />
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-5 border-b border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-500/15 rounded-xl flex items-center justify-center"><Shield className="w-4 h-4 text-emerald-300" /></div>
            <div><h3 className="font-bold text-white">Bảo mật</h3><p className="text-xs text-white/50">Cài đặt bảo mật tài khoản</p></div>
          </div>
          <div className="p-5 space-y-4">
            <Toggle label="Xác thực 2 bước (2FA)" desc="Tăng cường bảo mật tài khoản" value={settings.twoFactor} onChange={() => toggle('twoFactor')} />
            <Toggle label="Hồ sơ công khai" desc="Cho phép người khác xem hồ sơ" value={settings.publicProfile} onChange={() => toggle('publicProfile')} />
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-5 border-b border-white/10 flex items-center gap-3">
            <div className="w-9 h-9 bg-sky-500/15 rounded-xl flex items-center justify-center"><Globe className="w-4 h-4 text-sky-300" /></div>
            <div><h3 className="font-bold text-white">Tùy chọn hiển thị</h3><p className="text-xs text-white/50">Ngôn ngữ và đơn vị tiền tệ</p></div>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div><div className="text-sm font-semibold text-white">Ngôn ngữ</div><div className="text-xs text-white/50">Ngôn ngữ hiển thị</div></div>
              <select value={settings.language} onChange={(e) => setSettings({ ...settings, language: e.target.value })} className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#D4A017]"><option value="vi">Tiếng Việt</option><option value="en">English</option></select>
            </div>
            <div className="flex items-center justify-between">
              <div><div className="text-sm font-semibold text-white">Đơn vị tiền tệ</div><div className="text-xs text-white/50">Hiển thị số tiền</div></div>
              <select value={settings.currency} onChange={(e) => setSettings({ ...settings, currency: e.target.value })} className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#D4A017]"><option value="VND">VND</option><option value="USD">USD</option></select>
            </div>
          </div>
        </GlassCard>
      </div>
    </HorseOwnerLayout>
  );
}

function Toggle({ label, desc, value, onChange }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div><div className="text-sm font-semibold text-white">{label}</div><div className="text-xs text-white/50">{desc}</div></div>
      <button onClick={onChange} className={`relative inline-flex w-11 h-6 rounded-full transition-colors flex-shrink-0 ${value ? 'bg-[#D4A017]' : 'bg-white/20'}`}>
        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${value ? 'left-6' : 'left-1'}`} />
      </button>
    </div>
  );
}
