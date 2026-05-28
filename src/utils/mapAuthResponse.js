import { normalizeRole } from "@/utils/roleRedirect";

/** Map AuthResponse từ BE sang user object trong store */
export function mapAuthResponseToUser(auth) {
  if (!auth) return null;
  const user = auth.user || auth;
  return {
    id: user.id || user.userId || user._id,
    userId: user.userId || user.id || user._id,
    username: user.username,
    email: user.email,
    role: user.role,
    fullName: user.fullName || user.name || "",
    phone: user.phone || "",
  };
}

export function extractAccessToken(auth) {
  return auth?.token || auth?.accessToken || null;
}

export function applyAuthToState(auth) {
  const token = extractAccessToken(auth);
  const user = mapAuthResponseToUser(auth);
  const role = normalizeRole(user?.role);
  return { token, user, role, isAuthenticated: !!token && !!user };
}
