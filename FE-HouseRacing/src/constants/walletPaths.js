/** Đường dẫn trang ví theo role (khớp layout từng portal) */
export const WALLET_PATHS = {
  ADMIN: '/admin/wallet',
  OWNER: '/horse-owner/wallet',
  JOCKEY: '/jockey/wallet',
  REFEREE: '/referee/wallet',
  SPECTATOR: '/spectator/wallet',
  USER: '/dashboard/wallet',
}

export function getWalletPath(role) {
  if (!role) return WALLET_PATHS.USER
  const key = String(role).replace(/^ROLE_/, '')
  return WALLET_PATHS[key] ?? WALLET_PATHS.USER
}
