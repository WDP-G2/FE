import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Info } from "lucide-react";
import Card from "@/components/ui/Card";
import Field from "@/components/ui/Field";
import { Input, Select, TextArea } from "@/components/ui/Input";
import { PanelActions, PanelHeader } from "@/components/ui/Panel";
import {
  clampDate,
  clampTime,
  getEffectiveProvinceId,
  shiftTime,
} from "./helpers";
import { formatDisplayDate } from "@/utils/dateFormat";
import {
  findRegistrationFeeOptionId,
  getRegistrationFeeByOptionId,
} from "@/services/systemSettingsService";

export default function RaceInfo({
  race,
  tournament,
  saving,
  venues,
  distanceOptions,
  loadingOptions,
  registrationFeeOptions = [],
  onGoToSettings,
  onSave,
}) {
  const [draft, setDraft] = useState(race);

  useEffect(() => {
    setDraft(race);
  }, [race]);

  const updateDraft = (patch) => {
    setDraft((previous) => ({ ...previous, ...patch }));
  };

  const effectiveProvinceId = getEffectiveProvinceId(tournament, draft);
  const raceDateMin = tournament.startDate || undefined;
  const raceDateMax = tournament.endDate || undefined;
  const raceTimeMin =
    draft.date === tournament.startDate
      ? tournament.startTime || undefined
      : undefined;
  const raceTimeMax =
    draft.date === tournament.endDate
      ? shiftTime(tournament.endTime, -1) || undefined
      : undefined;
  const distanceIsConfigured = distanceOptions.some(
    (option) => option.value === draft.distance,
  );
  const removedDistance = draft.distance && !distanceIsConfigured;
  const distanceLoading = loadingOptions && distanceOptions.length === 0;
  const venueLoading = loadingOptions && venues.length === 0;

  const feeLoading = loadingOptions && registrationFeeOptions.length === 0;
  const selectedFeeOptionId = findRegistrationFeeOptionId(draft.entryFee, registrationFeeOptions);
  const selectedFeeOption = registrationFeeOptions.find(
    (option) => option.id === selectedFeeOptionId,
  );
  const hasCustomEntryFee =
    Number(draft.entryFee) > 0 && !selectedFeeOptionId && registrationFeeOptions.length > 0;

  const handleSave = () => {
    onSave({
      ...draft,
      entryFee: Number(draft.entryFee || 0),
    });
  };

  return (
    <Card>
      <PanelHeader
        icon={Info}
        title="Thông tin cuộc đua"
        subtitle="Tên, thời gian, đường đua, lệ phí và giới hạn ngựa"
      />
      <div className="grid gap-5 p-6 md:grid-cols-2">
        <Field label="Tên cuộc đua">
          <Input
            value={draft.name}
            disabled={saving}
            onChange={(event) => updateDraft({ name: event.target.value })}
          />
        </Field>
        <Field label="Số thứ tự">
          <Input type="number" value={draft.no} disabled />
        </Field>
        <Field label="Mô tả" full>
          <TextArea
            value={draft.description}
            disabled={saving}
            onChange={(event) =>
              updateDraft({ description: event.target.value })
            }
          />
        </Field>
        <Field label="Ngày thi đấu">
          <Input
            type="date"
            min={raceDateMin}
            max={raceDateMax}
            value={draft.date}
            disabled={saving}
            onChange={(event) => {
              const date = clampDate(
                event.target.value,
                tournament.startDate,
                tournament.endDate,
              );
              const nextRaceTimeMin =
                date === tournament.startDate ? tournament.startTime : "";
              const nextRaceTimeMax =
                date === tournament.endDate
                  ? shiftTime(tournament.endTime, -1)
                  : "";

              updateDraft({
                date,
                time: clampTime(draft.time, nextRaceTimeMin, nextRaceTimeMax),
              });
            }}
          />
          <p className="mt-2 text-xs text-white/40">
            Chỉ chọn trong thời gian mùa giải: {formatDisplayDate(tournament.startDate)} -{" "}
            {formatDisplayDate(tournament.endDate)}.
          </p>
        </Field>
        <Field label="Giờ thi đấu">
          <Input
            type="time"
            min={raceTimeMin}
            max={raceTimeMax}
            value={draft.time}
            disabled={saving}
            onChange={(event) =>
              updateDraft({
                time: clampTime(event.target.value, raceTimeMin, raceTimeMax),
              })
            }
          />
          {(raceTimeMin || raceTimeMax) && (
            <p className="mt-2 text-xs text-white/40">
              Giờ thi đấu trong ngày này: {raceTimeMin || "00:00"} -{" "}
              {raceTimeMax || "23:59"}.
            </p>
          )}
          <p className="mt-2 text-xs text-white/40">
            Các cuộc đua cùng ngày phải cách nhau ít nhất 45 phút và không trùng giờ.
          </p>
        </Field>
        <Field label="Khoảng cách">
          <Select
            value={draft.distance}
            disabled={distanceLoading || saving}
            onChange={(event) => updateDraft({ distance: event.target.value })}
          >
            <option value="">
              {distanceLoading ? "Đang tải..." : "Chọn khoảng cách"}
            </option>
            {removedDistance && (
              <option value={draft.distance} disabled>
                {draft.distance} - đã xóa khỏi cấu hình
              </option>
            )}
            {distanceOptions.map((option) => (
              <option key={option.meters} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          {removedDistance && !loadingOptions && (
            <p className="mt-2 text-xs font-medium text-amber-300">
              Khoảng cách hiện tại không còn trong cấu hình. Vui lòng chọn lại trước khi lưu.
            </p>
          )}
        </Field>
        <Field label="Địa điểm đua">
          <Select
            value={draft.venueId || ""}
            disabled={venueLoading || saving}
            onChange={(event) => {
              const venue = venues.find((item) => item.id === event.target.value);
              updateDraft({
                venueId: event.target.value,
                venueName: venue?.name || "",
                venueAddress: venue?.address || "",
                provinceId: venue?.provinceId || effectiveProvinceId,
                provinceName: venue?.provinceName || tournament.provinceName,
              });
            }}
          >
            <option value="">
              {venueLoading
                ? "Đang tải..."
                : !effectiveProvinceId
                  ? "Chọn tỉnh cho giải trước"
                  : venues.length === 0
                    ? "Chưa có địa điểm đua"
                    : "Chọn địa điểm đua"}
            </option>
            {venues.map((venue) => (
              <option key={venue.id} value={venue.id}>
                {venue.name}
              </option>
            ))}
          </Select>
          {!effectiveProvinceId && !venueLoading && (
            <p className="mt-2 text-xs font-medium text-amber-300">
              Giải chưa có tỉnh/thành phố.{" "}
              <button
                type="button"
                className="underline"
                onClick={onGoToSettings}
              >
                Mở tab Cài đặt
              </button>{" "}
              để chọn và lưu tỉnh.
            </p>
          )}
          {effectiveProvinceId && !venueLoading && venues.length === 0 && (
            <p className="mt-2 text-xs font-medium text-amber-300">
              Tỉnh này chưa có địa điểm đua. Hãy thêm venue trong cài đặt hệ thống.
            </p>
          )}
          {draft.venueAddress && (
            <p className="mt-2 text-xs text-white/45">
              {draft.venueAddress} - {draft.provinceName || tournament.provinceName}
            </p>
          )}
        </Field>
        <Field label="Số ngựa tối thiểu của cuộc đua">
          <Input
            type="number"
            min="1"
            value={draft.minHorses}
            disabled={saving}
            onChange={(event) =>
              updateDraft({ minHorses: Number(event.target.value) })
            }
          />
        </Field>
        <Field label="Số ngựa tối đa của cuộc đua">
          <Input
            type="number"
            min="1"
            value={draft.maxHorses}
            disabled={saving}
            onChange={(event) =>
              updateDraft({ maxHorses: Number(event.target.value) })
            }
          />
        </Field>
        <Field label="Lệ phí đăng ký">
          <Select
            value={selectedFeeOptionId || (hasCustomEntryFee ? "custom" : "")}
            disabled={feeLoading || saving || registrationFeeOptions.length === 0}
            onChange={(event) => {
              const nextId = event.target.value;
              if (nextId === "custom") return;
              updateDraft({
                entryFee: getRegistrationFeeByOptionId(nextId, registrationFeeOptions),
              });
            }}
          >
            <option value="">
              {feeLoading ? "Đang tải..." : "Chọn lệ phí đăng ký"}
            </option>
            {hasCustomEntryFee && (
              <option value="custom">
                {Number(draft.entryFee).toLocaleString("vi-VN")} VND (hiện tại)
              </option>
            )}
            {registrationFeeOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </Select>
          {selectedFeeOption && (
            <p className="mt-2 text-xs text-white/45">
              Phí trễ hạn: {Number(selectedFeeOption.lateFee || 0).toLocaleString("vi-VN")} VND
            </p>
          )}
          {!feeLoading && registrationFeeOptions.length === 0 && (
            <p className="mt-2 text-xs font-medium text-amber-300">
              Chưa có lệ phí trong cài đặt hệ thống.{" "}
              <Link to="/admin/settings" className="underline">
                Mở Cài đặt hệ thống
              </Link>
            </p>
          )}
        </Field>
        <Field label="Trạng thái" full>
          <Input value={draft.status || "Nháp"} disabled />
        </Field>
      </div>
      <PanelActions
        saving={saving}
        onCancel={() => {
          setDraft(race);
        }}
        onSave={handleSave}
      />
    </Card>
  );
}
