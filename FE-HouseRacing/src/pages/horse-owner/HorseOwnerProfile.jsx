import { useEffect, useRef, useState } from "react";
import { Camera, Edit2, Save, User, X } from "lucide-react";
import { toast } from "sonner";
import { HorseOwnerLayout } from "./HorseOwnerLayout";
import { GlassCard, TextInput } from "../admin/AdminLayout";
import {
  HorseOwnerProfileField,
  HorseOwnerProfileValue,
} from "./components/HorseOwnerProfileField";
import ChangePasswordModal from "@/components/profile/ChangePasswordModal";
import { useAuthStore } from "@/store/authStore";
import { userService } from "@/services/userService";
import { getApiErrorMessage } from "@/utils/apiError";
import { formatDisplayDate } from "@/utils/dateFormat";
import { validateFileField } from "@/utils/roleApplicationValidation";

function formatDate(value) {
  return formatDisplayDate(value, "—");
}

function ReadonlyField({ label, children, className = "" }) {
  return (
    <HorseOwnerProfileField label={label} className={className}>
      <HorseOwnerProfileValue>{children}</HorseOwnerProfileValue>
    </HorseOwnerProfileField>
  );
}

export function HorseOwnerProfile() {
  const user = useAuthStore((s) => s.user);
  const fetchProfile = useAuthStore((s) => s.fetchProfile);
  const [editingPhone, setEditingPhone] = useState(false);
  const [savingPhone, setSavingPhone] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [phoneDraft, setPhoneDraft] = useState(user?.phone || "");
  const [avatarPreview, setAvatarPreview] = useState("");
  const avatarPreviewRef = useRef("");

  useEffect(() => {
    fetchProfile()
      .then((fresh) => setPhoneDraft(fresh?.phone || ""))
      .catch(() => {});
  }, [fetchProfile]);

  useEffect(() => {
    return () => {
      if (avatarPreviewRef.current) URL.revokeObjectURL(avatarPreviewRef.current);
    };
  }, []);

  const displayName = user?.fullName || user?.username || "Chủ ngựa";
  const avatarLetter = displayName.charAt(0).toUpperCase();
  const avatarSrc = avatarPreview || user?.avatarUrl || "";

  const clearAvatarPreview = () => {
    if (avatarPreviewRef.current) URL.revokeObjectURL(avatarPreviewRef.current);
    avatarPreviewRef.current = "";
    setAvatarPreview("");
  };

  const handleCancelPhone = () => {
    setPhoneDraft(user?.phone || "");
    setEditingPhone(false);
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const fileError = validateFileField("avatar", file);
    if (fileError) {
      toast.error(fileError);
      return;
    }

    clearAvatarPreview();
    const previewUrl = URL.createObjectURL(file);
    avatarPreviewRef.current = previewUrl;
    setAvatarPreview(previewUrl);

    try {
      setSavingAvatar(true);
      await userService.updateProfile({}, file);
      await fetchProfile();
      toast.success("Cập nhật ảnh đại diện thành công");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      clearAvatarPreview();
      setSavingAvatar(false);
    }
  };

  const handleSavePhone = async () => {
    setSavingPhone(true);
    try {
      await userService.updateProfile({
        phone: phoneDraft.trim(),
      });
      const fresh = await fetchProfile();
      setPhoneDraft(fresh?.phone || "");
      setEditingPhone(false);
      toast.success("Cập nhật số điện thoại thành công");
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSavingPhone(false);
    }
  };

  return (
    <HorseOwnerLayout
      title="Horse Owner · Hồ sơ cá nhân"
      subtitle="Quản lý thông tin cá nhân và tài khoản"
    >
      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <GlassCard className="self-start p-5 text-center">
          <div className="mb-4 flex justify-center">
            <div className="relative">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border-2 border-[#D4A017]/30 bg-gradient-to-br from-[#D4A017]/30 to-[#0F1E3A] text-4xl font-bold text-[#D4A017]">
                {avatarSrc ? (
                  <img
                    src={avatarSrc}
                    alt={displayName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  avatarLetter
                )}
              </div>

              <label
                className={`absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-xl border border-[#D4A017]/40 bg-[#D4A017] text-white shadow-lg shadow-[#D4A017]/25 transition hover:bg-[#B8941F] ${
                  savingAvatar ? "cursor-wait opacity-70" : "cursor-pointer"
                }`}
                title="Đổi ảnh đại diện"
              >
                {savingAvatar ? (
                  <Camera className="h-4 w-4 animate-pulse" />
                ) : (
                  <Edit2 className="h-4 w-4" />
                )}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  disabled={savingAvatar}
                  onChange={handleAvatarChange}
                />
              </label>
            </div>
          </div>

          <h2 className="text-lg font-bold text-white">{displayName}</h2>
          <p className="mt-1 text-sm font-semibold text-[#D4A017]">Chủ ngựa</p>
          <p className="mt-2 text-xs text-white/50">
            Thành viên từ {formatDate(user?.createdAt)}
          </p>
          {savingAvatar && (
            <p className="mx-auto mt-4 max-w-64 text-xs leading-5 text-white/45">
              Đang cập nhật ảnh...
            </p>
          )}
        </GlassCard>

        <div className="space-y-4">
          <GlassCard className="p-6">
            <h3 className="mb-5 flex items-center gap-2 font-bold text-white">
              <User className="h-4 w-4 text-[#D4A017]" />
              Thông tin cá nhân
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <ReadonlyField label="Họ và tên">{user?.fullName || "—"}</ReadonlyField>
              <ReadonlyField label="Email">{user?.email || "—"}</ReadonlyField>
              <ReadonlyField label="Username">{user?.username || "—"}</ReadonlyField>
              <HorseOwnerProfileField label="Số điện thoại">
                {editingPhone ? (
                  <div className="flex gap-2">
                    <TextInput
                      value={phoneDraft}
                      maxLength={30}
                      disabled={savingPhone}
                      onChange={(event) => setPhoneDraft(event.target.value)}
                    />
                    <button
                      type="button"
                      onClick={handleSavePhone}
                      disabled={savingPhone}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#D4A017] text-white transition hover:bg-[#B8941F] disabled:cursor-not-allowed disabled:opacity-50"
                      title="Lưu số điện thoại"
                    >
                      <Save className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelPhone}
                      disabled={savingPhone}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                      title="Hủy"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="min-w-0 flex-1">
                      <HorseOwnerProfileValue>{user?.phone || "—"}</HorseOwnerProfileValue>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setPhoneDraft(user?.phone || "");
                        setEditingPhone(true);
                      }}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#D4A017]/35 bg-[#D4A017]/15 text-[#D4A017] transition hover:bg-[#D4A017]/25"
                      title="Sửa số điện thoại"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </HorseOwnerProfileField>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="mb-5 font-bold text-white">Bảo mật tài khoản</h3>
            <div className="flex items-center justify-between rounded-xl bg-white/[0.04] p-3">
              <div>
                <div className="text-sm font-semibold text-white">Mật khẩu</div>
                <div className="text-xs text-white/50">
                  Cập nhật lần cuối: {formatDate(user?.updatedAt)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswordModal(true)}
                className="text-xs font-semibold text-[#D4A017] hover:underline"
              >
                Đổi mật khẩu
              </button>
            </div>
          </GlassCard>
        </div>
      </div>

      <ChangePasswordModal
        open={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </HorseOwnerLayout>
  );
}
