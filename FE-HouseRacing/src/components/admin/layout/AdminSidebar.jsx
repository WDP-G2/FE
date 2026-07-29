import AdminSidebarBrand from './AdminSidebarBrand'
import AdminSidebarNav from './AdminSidebarNav'
import AdminSidebarLogout from './AdminSidebarLogout'

export default function AdminSidebar({ open, onClose, onLogout }) {
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col overflow-hidden border-r border-white/10 bg-[#0F1E3A]/95 shadow-2xl shadow-black/20 backdrop-blur-xl transition-transform duration-200 ${
        open ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}
    >
      <AdminSidebarBrand onNavigate={onClose} />
      <AdminSidebarNav onNavigate={onClose} />
      <AdminSidebarLogout onLogout={onLogout} />
    </aside>
  )
}
