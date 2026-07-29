import { useEffect, useState } from "react";
import { User, Edit2, Save, X, Trophy, Star } from "lucide-react";
import { JockeyLayout } from "./JockeyLayout";
import {
  GlassCard,
  PrimaryButton,
  GhostButton,
  TextInput,
} from "../admin/AdminLayout";
import { jockeyService } from "@/services/jockeyService";
import { parseAchievementLines } from "@/utils/jockeyViewUtils";
import { useAuthStore } from "@/store/authStore";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/apiError";
import {
  JockeyProfileField,
  JockeyProfileValue,
} from "./components/JockeyProfileField";

export function JockeyProfile() {
  const authUser = useAuthStore((state) => state.user);
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    bio: "",
    licenseNumber: "",
    experienceYears: "",
    specialties: "",
  });

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        const data = await jockeyService.getMyProfile();
        if (!active) return;
        setProfile(data);
        setForm({
          bio: data.bio || "",
          licenseNumber: data.license || "",
          experienceYears: String(data.experience || ""),
          specialties: data.specialties || "",
        });
      } catch (err) {
        if (!active) return;
        toast.error(getApiErrorMessage(err) || "Không thể tải hồ sơ jockey");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      const updated = await jockeyService.updateMyProfile({
        bio: form.bio.trim(),
        licenseNumber: form.licenseNumber.trim(),
        experienceYears: form.experienceYears ? Number(form.experienceYears) : undefined,
        specialties: form.specialties.trim(),
      });
      setProfile(updated);
      setEditing(false);
      toast.success("Cập nhật hồ sơ thành công");
    } catch (err) {
      toast.error(getApiErrorMessage(err) || "Không thể cập nhật hồ sơ");
    } finally {
      setSaving(false);
    }
  };

  const displayName = profile?.name || authUser?.fullName || authUser?.username || "Jockey";
  const achievements = parseAchievementLines(profile?.achievements || profile?.awards);

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
            <PrimaryButton icon={Save} onClick={handleSave} disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </PrimaryButton>
          </>
        ) : (
          <PrimaryButton icon={Edit2} onClick={() => setEditing(true)}>
            Chỉnh sửa
          </PrimaryButton>
        )
      }
    >
      {loading ? (
        <GlassCard className="p-10 text-center text-white/50">Đang tải hồ sơ...</GlassCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlassCard className="p-6 flex flex-col items-center text-center">
            <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-[#D4A017]/30 to-[#0F1E3A] flex items-center justify-center text-5xl font-bold text-[#D4A017] border-2 border-[#D4A017]/30 overflow-hidden">
              {profile?.avatarUrl ? (
                <img src={profile.avatarUrl} alt={displayName} className="h-full w-full object-cover" />
              ) : (
                displayName.charAt(0).toUpperCase()
              )}
            </div>
            <h2 className="font-bold text-white text-lg mt-4">{displayName}</h2>
            <p className="text-sm text-[#D4A017] font-semibold mt-1">Jockey</p>
            <p className="text-xs text-white/50 mt-1">{profile?.license || "Chưa cập nhật"}</p>
          </GlassCard>

          <div className="lg:col-span-2 space-y-5">
            <GlassCard className="p-6">
              <h3 className="font-bold text-white mb-5 flex items-center gap-2">
                <User className="w-4 h-4 text-[#D4A017]" />
                Thông tin cá nhân
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <JockeyProfileField label="Họ và tên">
                  <JockeyProfileValue>{displayName}</JockeyProfileValue>
                </JockeyProfileField>
                <JockeyProfileField label="Email">
                  <JockeyProfileValue>{authUser?.email || "—"}</JockeyProfileValue>
                </JockeyProfileField>
                <JockeyProfileField label="Giấy phép">
                  {editing ? (
                    <TextInput
                      value={form.licenseNumber}
                      onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })}
                    />
                  ) : (
                    <JockeyProfileValue>{profile?.license || "—"}</JockeyProfileValue>
                  )}
                </JockeyProfileField>
                <JockeyProfileField label="Kinh nghiệm (năm)">
                  {editing ? (
                    <TextInput
                      value={form.experienceYears}
                      onChange={(e) => setForm({ ...form, experienceYears: e.target.value })}
                    />
                  ) : (
                    <JockeyProfileValue>{profile?.experience ?? 0}</JockeyProfileValue>
                  )}
                </JockeyProfileField>
                <JockeyProfileField label="Chuyên môn" className="sm:col-span-2">
                  {editing ? (
                    <TextInput
                      value={form.specialties}
                      onChange={(e) => setForm({ ...form, specialties: e.target.value })}
                    />
                  ) : (
                    <JockeyProfileValue>{profile?.specialties || "—"}</JockeyProfileValue>
                  )}
                </JockeyProfileField>
                <JockeyProfileField label="Giới thiệu" className="sm:col-span-2">
                  {editing ? (
                    <TextInput
                      value={form.bio}
                      onChange={(e) => setForm({ ...form, bio: e.target.value })}
                    />
                  ) : (
                    <JockeyProfileValue>{profile?.bio || "—"}</JockeyProfileValue>
                  )}
                </JockeyProfileField>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[#D4A017]" />
                Thành tích
              </h3>
              {achievements.length === 0 ? (
                <p className="text-sm text-white/50">Chưa có thành tích nào.</p>
              ) : (
                achievements.map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className="flex items-start gap-3 p-3 bg-white/[0.04] rounded-xl border border-white/10 mb-2"
                  >
                    <Star className="w-3.5 h-3.5 text-[#D4A017]" />
                    <span className="text-sm text-white/80">{item}</span>
                  </div>
                ))
              )}
            </GlassCard>
          </div>
        </div>
      )}
    </JockeyLayout>
  );
}
