import {jwtDecode} from "jwt-decode";

interface JwtPayload {
  user_id: number;
  email: string;
  role?: string;
  exp: number;
}

export function getCurrentUser(): JwtPayload | null {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    return jwtDecode<JwtPayload>(token);
  } catch {
    localStorage.removeItem("token");
    return null;
  }
}

export function isAdmin(): boolean {
  const user = getCurrentUser();
  return user?.role === "admin";
}

export function isAuthenticated(): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  return user.exp * 1000 > Date.now(); // not expired
}
