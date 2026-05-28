import { useState } from "react";
import { User, Edit2, Upload, Save, X, Trophy, Star } from "lucide-react";
import { JockeyLayout } from "./JockeyLayout";
import {
  GlassCard,
  PrimaryButton,
  GhostButton,
  TextInput,
} from "../admin/AdminLayout";
import { jockeyProfile } from "./data";
import { toast } from "sonner";
import {
  JockeyProfileField,
  JockeyProfileValue,
} from "./components/JockeyProfileField";

export function JockeyProfile() {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: jockeyProfile.name,
    email: jockeyProfile.email,
    phone: jockeyProfile.phone,
    address: jockeyProfile.address,
    bio: jockeyProfile.bio,
  });
  const handleSave = () => {
    toast.success("Cập nhật hồ sơ thành công");
    setEditing(false);
  };
  return (
    <JockeyLayout
      title="Jockey · Hồ sơ cá nhân"
      subtitle="Quản lý thông tin và chứng chỉ thi đấu"
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
          <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-[#D4A017]/30 to-[#0F1E3A] flex items-center justify-center text-5xl font-bold text-[#D4A017] border-2 border-[#D4A017]/30">
            A
          </div>
          <h2 className="font-bold text-white text-lg mt-4">{form.name}</h2>
          <p className="text-sm text-[#D4A017] font-semibold mt-1">
            Jockey Chuyên nghiệp
          </p>
          <p className="text-xs text-white/50 mt-1">{jockeyProfile.license}</p>
        </GlassCard>
        <div className="lg:col-span-2 space-y-5">
          <GlassCard className="p-6">
            <h3 className="font-bold text-white mb-5 flex items-center gap-2">
              <User className="w-4 h-4 text-[#D4A017]" />
              Thông tin cá nhân
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <JockeyProfileField label="Họ và tên">
                {editing ? (
                  <TextInput
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                ) : (
                  <JockeyProfileValue>{form.name}</JockeyProfileValue>
                )}
              </JockeyProfileField>
              <JockeyProfileField label="Email">
                {editing ? (
                  <TextInput
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                  />
                ) : (
                  <JockeyProfileValue>{form.email}</JockeyProfileValue>
                )}
              </JockeyProfileField>
              <JockeyProfileField label="Số điện thoại">
                {editing ? (
                  <TextInput
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                  />
                ) : (
                  <JockeyProfileValue>{form.phone}</JockeyProfileValue>
                )}
              </JockeyProfileField>
              <JockeyProfileField label="Địa chỉ">
                {editing ? (
                  <TextInput
                    value={form.address}
                    onChange={(e) =>
                      setForm({ ...form, address: e.target.value })
                    }
                  />
                ) : (
                  <JockeyProfileValue>{form.address}</JockeyProfileValue>
                )}
              </JockeyProfileField>
            </div>
          </GlassCard>
          <GlassCard className="p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-[#D4A017]" />
              Thành tích
            </h3>
            {jockeyProfile.achievements.map((a, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 bg-white/[0.04] rounded-xl border border-white/10 mb-2"
              >
                <Star className="w-3.5 h-3.5 text-[#D4A017]" />
                <span className="text-sm text-white/80">{a}</span>
              </div>
            ))}
          </GlassCard>
        </div>
      </div>
    </JockeyLayout>
  );
}
