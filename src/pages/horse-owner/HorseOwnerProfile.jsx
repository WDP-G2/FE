import { useState } from "react";
import { User, Edit2, Upload, Save, X } from "lucide-react";
import { HorseOwnerLayout } from "./HorseOwnerLayout";
import {
  GlassCard,
  PrimaryButton,
  GhostButton,
  TextInput,
} from "../admin/AdminLayout";
import { toast } from "sonner";
import {
  HorseOwnerProfileField,
  HorseOwnerProfileValue,
} from "./components/HorseOwnerProfileField";

export function HorseOwnerProfile() {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: "Nguyễn Chủ Ngựa",
    email: "chungnua@horseracing.vn",
    phone: "0901234567",
    address: "123 Nguyễn Huệ, Q.1, TP.HCM",
    idCard: "CMND: 012345678",
    bio: "Chủ sở hữu đội đua ngựa chuyên nghiệp với hơn 10 năm kinh nghiệm trong ngành đua ngựa Việt Nam.",
  });

  const handleSave = () => {
    toast.success("Cập nhật hồ sơ thành công");
    setEditing(false);
  };

  return (
    <HorseOwnerLayout
      title="Horse Owner · Hồ sơ cá nhân"
      subtitle="Quản lý thông tin cá nhân và tài khoản"
      actions={
        editing ? (
          <>
            <GhostButton icon={X} onClick={() => setEditing(false)}>
              Hủy
            </GhostButton>
            <PrimaryButton icon={Save} onClick={handleSave}>
              Lưu thay đổi
            </PrimaryButton>
          </>
        ) : (
          <PrimaryButton icon={Edit2} onClick={() => setEditing(true)}>
            Chỉnh sửa
          </PrimaryButton>
        )
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="p-6 flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-[#D4A017]/30 to-[#0F1E3A] flex items-center justify-center text-5xl font-bold text-[#D4A017] border-2 border-[#D4A017]/30">
              N
            </div>
            <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#D4A017] rounded-xl flex items-center justify-center shadow-lg shadow-[#D4A017]/30">
              <Upload className="w-4 h-4 text-white" />
            </button>
          </div>
          <h2 className="font-bold text-white text-lg">{form.name}</h2>
          <p className="text-sm text-[#D4A017] font-semibold mt-1">
            Horse Owner
          </p>
          <p className="text-xs text-white/50 mt-2">Thành viên từ 01/2020</p>
          <div className="mt-5 w-full space-y-3">
            <div className="flex justify-between text-xs">
              <span className="text-white/50">Tổng ngựa</span>
              <span className="text-white font-bold">3</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/50">Giải đã tham gia</span>
              <span className="text-white font-bold">12</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/50">Tổng chiến thắng</span>
              <span className="text-[#D4A017] font-bold">25</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-white/50">Tổng tiền thưởng</span>
              <span className="text-emerald-300 font-bold">85.000.000đ</span>
            </div>
          </div>
          <button className="mt-5 w-full flex items-center justify-center gap-2 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs text-white/60 transition-all">
            <Upload className="w-3.5 h-3.5" /> Upload giấy tờ
          </button>
        </GlassCard>

        <div className="lg:col-span-2 space-y-4">
          <GlassCard className="p-6">
            <h3 className="font-bold text-white mb-5 flex items-center gap-2">
              <User className="w-4 h-4 text-[#D4A017]" />
              Thông tin cá nhân
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <HorseOwnerProfileField label="Họ và tên">
                {editing ? (
                  <TextInput
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                ) : (
                  <HorseOwnerProfileValue>{form.name}</HorseOwnerProfileValue>
                )}
              </HorseOwnerProfileField>
              <HorseOwnerProfileField label="Email">
                {editing ? (
                  <TextInput
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                ) : (
                  <HorseOwnerProfileValue>{form.email}</HorseOwnerProfileValue>
                )}
              </HorseOwnerProfileField>
              <HorseOwnerProfileField label="Số điện thoại">
                {editing ? (
                  <TextInput
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                  />
                ) : (
                  <HorseOwnerProfileValue>{form.phone}</HorseOwnerProfileValue>
                )}
              </HorseOwnerProfileField>
              <HorseOwnerProfileField label="CMND/CCCD">
                {editing ? (
                  <TextInput
                    value={form.idCard}
                    onChange={(e) =>
                      setForm({ ...form, idCard: e.target.value })
                    }
                  />
                ) : (
                  <HorseOwnerProfileValue>{form.idCard}</HorseOwnerProfileValue>
                )}
              </HorseOwnerProfileField>
              <HorseOwnerProfileField label="Địa chỉ" className="sm:col-span-2">
                {editing ? (
                  <TextInput
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                  />
                ) : (
                  <HorseOwnerProfileValue>
                    {form.address}
                  </HorseOwnerProfileValue>
                )}
              </HorseOwnerProfileField>
              <HorseOwnerProfileField
                label="Giới thiệu"
                className="sm:col-span-2"
              >
                {editing ? (
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#D4A017] resize-none"
                  />
                ) : (
                  <HorseOwnerProfileValue>{form.bio}</HorseOwnerProfileValue>
                )}
              </HorseOwnerProfileField>
            </div>
          </GlassCard>
          <GlassCard className="p-6">
            <h3 className="font-bold text-white mb-5">Bảo mật tài khoản</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/[0.04] rounded-xl">
                <div>
                  <div className="text-sm font-semibold text-white">
                    Mật khẩu
                  </div>
                  <div className="text-xs text-white/50">
                    Cập nhật lần cuối: 01/2026
                  </div>
                </div>
                <button
                  onClick={() => toast.success("Đã gửi email đổi mật khẩu")}
                  className="text-xs text-[#D4A017] hover:underline font-semibold"
                >
                  Đổi mật khẩu
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-white/[0.04] rounded-xl">
                <div>
                  <div className="text-sm font-semibold text-white">
                    Xác thực 2 bước
                  </div>
                  <div className="text-xs text-white/50">Chưa bật</div>
                </div>
                <button
                  onClick={() => toast.success("Đã bật xác thực 2 bước")}
                  className="text-xs text-[#D4A017] hover:underline font-semibold"
                >
                  Bật ngay
                </button>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </HorseOwnerLayout>
  );
}
