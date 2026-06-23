import { Trophy } from "lucide-react";

export default function RankingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF8F0] via-white to-[#FAFAFA]">
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-[#FFF8F0] via-white to-[#FAFAFA]" />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #1E3A5F 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#D4A017]/20 bg-gradient-to-r from-[#D4A017]/10 to-[#D4A017]/5 px-5 py-2.5 shadow-sm">
              <Trophy className="h-5 w-5 text-[#D4A017]" />
              <span className="font-semibold text-[#D4A017]">
                Bảng xếp hạng
              </span>
            </div>

            <h1 className="mb-6 text-5xl font-bold leading-tight text-[#1E3A5F] md:text-7xl">
              Bảng xếp hạng
            </h1>

            <p className="mx-auto mb-10 max-w-3xl text-xl leading-relaxed text-[#1E3A5F]/60 md:text-2xl">
              Hiện chưa có API bảng xếp hạng tổng hợp cho spectator, nên trang
              này chỉ hiển thị trạng thái rỗng thay vì dữ liệu giả.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-dashed border-[#1E3A5F]/15 bg-white p-10 text-center text-[#1E3A5F]/55 shadow-sm">
            <Trophy className="mx-auto mb-4 h-12 w-12 text-[#D4A017]" />
            <h2 className="mb-3 text-2xl font-bold text-[#1E3A5F]">
              Chưa có dữ liệu bảng xếp hạng
            </h2>
            <p className="text-base leading-7">
              Khi backend cung cấp API ranking tổng hợp, trang này sẽ hiển thị
              đúng dữ liệu của tab bảng xếp hạng.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
