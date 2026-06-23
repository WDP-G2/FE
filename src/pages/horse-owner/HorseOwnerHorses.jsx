import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { horseService } from "@/services/horseService";
import { getApiErrorMessage } from "@/utils/apiError";
import { GlassCard, PrimaryButton } from "../admin/AdminLayout";
import { HorseOwnerLayout } from "./HorseOwnerLayout";
import { HorseOwnerHorseList } from "./components/horses/HorseOwnerHorseList";
import { HorseOwnerHorseModal } from "./components/horses/HorseOwnerHorseModal";
import { HorseOwnerHorseSearch } from "./components/horses/HorseOwnerHorseSearch";

const emptyForm = {
  name: "",
  breed: "",
  age: "",
  gender: "",
  height: "",
  weight: "",
  color: "",
  imageFile: null,
  documentFile: null,
};

const GENDER_LABELS = {
  MALE: "Đực",
  FEMALE: "Cái",
};

function getGenderLabel(gender) {
  return GENDER_LABELS[gender] || gender || "Chưa cập nhật";
}

function canDeleteHorse(horse) {
  return horse.statusCode === "PENDING" || horse.statusCode === "REJECTED";
}

function canEditHorse(horse) {
  return horse.statusCode !== "APPROVED" && horse.statusCode !== "SUSPENDED";
}

export function HorseOwnerHorses() {
  const [horses, setHorses] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openReasonId, setOpenReasonId] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadHorses() {
      try {
        setLoading(true);
        const data = await horseService.getOwnerHorses();
        if (mounted) setHorses(data);
      } catch (error) {
        console.error("Không thể tải danh sách ngựa", error?.response?.data || error);
        toast.error(getApiErrorMessage(error) || "Không thể tải danh sách ngựa");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadHorses();

    return () => {
      mounted = false;
    };
  }, []);

  const filtered = horses.filter((horse) => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return true;
    return (
      horse.name.toLowerCase().includes(keyword) ||
      horse.breed.toLowerCase().includes(keyword)
    );
  });

  const openAdd = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (horse) => {
    if (!canEditHorse(horse)) {
      toast.error("Ngựa đã duyệt hoặc tạm khóa không thể chỉnh sửa");
      return;
    }

    setEditTarget(horse);
    setForm({
      name: horse.name,
      breed: horse.breed,
      age: horse.age ? String(horse.age) : "",
      gender: horse.gender,
      height: horse.height ? String(horse.height) : "",
      weight: horse.weight ? String(horse.weight) : "",
      color: horse.color,
      imageFile: null,
      documentFile: null,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Vui lòng nhập tên ngựa");
      return;
    }

    try {
      setSaving(true);
      if (editTarget) {
        const updatedHorse = await horseService.updateOwnerHorse(editTarget.id, form);
        setHorses((prev) =>
          prev.map((horse) => (horse.id === editTarget.id ? updatedHorse : horse)),
        );
        toast.success("Cập nhật thông tin ngựa thành công");
      } else {
        const createdHorse = await horseService.createOwnerHorse(form);
        setHorses((prev) => [createdHorse, ...prev]);
        toast.success("Thêm ngựa mới thành công");
      }
      setShowModal(false);
    } catch (error) {
      console.error("Không thể lưu thông tin ngựa", error?.response?.data || error);
      toast.error(getApiErrorMessage(error) || "Không thể lưu thông tin ngựa");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (horse) => {
    if (!canDeleteHorse(horse)) {
      toast.error("Chỉ có thể xóa ngựa đang chờ duyệt hoặc bị từ chối");
      return;
    }

    try {
      await horseService.deleteOwnerHorse(horse.id);
      setHorses((prev) => prev.filter((item) => item.id !== horse.id));
      toast.success("Đã xóa ngựa");
    } catch (error) {
      console.error("Không thể xóa ngựa", error?.response?.data || error);
      toast.error(getApiErrorMessage(error) || "Không thể xóa ngựa");
    }
  };

  const toggleReviewReason = (horseId) => {
    setOpenReasonId((currentId) => (currentId === horseId ? null : horseId));
  };

  return (
    <HorseOwnerLayout
      title="Horse Owner · Quản lý ngựa"
      subtitle={`${horses.length} ngựa trong đội · Quản lý thông tin và hồ sơ duyệt`}
      actions={
        <PrimaryButton icon={Plus} onClick={openAdd}>
          Thêm ngựa
        </PrimaryButton>
      }
    >
      <HorseOwnerHorseSearch value={search} onChange={setSearch} />

      {loading ? (
        <GlassCard className="p-10 text-center text-sm text-white/60">
          Đang tải danh sách ngựa...
        </GlassCard>
      ) : (
        <HorseOwnerHorseList
          horses={filtered}
          canDeleteHorse={canDeleteHorse}
          canEditHorse={canEditHorse}
          getGenderLabel={getGenderLabel}
          onDelete={handleDelete}
          onEdit={openEdit}
          onToggleReason={toggleReviewReason}
          openReasonId={openReasonId}
        />
      )}

      {showModal && (
        <HorseOwnerHorseModal
          editTarget={editTarget}
          form={form}
          onChangeForm={setForm}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          saving={saving}
        />
      )}
    </HorseOwnerLayout>
  );
}
