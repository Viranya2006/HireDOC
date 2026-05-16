const TOKEN_KEY = "hiredoc_token";
const SESSION_COOKIE = "hiredoc_session=1; path=/; max-age=604800; SameSite=Lax";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

export function setSessionCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie = SESSION_COOKIE;
}

export function clearSessionCookie(): void {
  if (typeof document === "undefined") return;
  document.cookie =
    "hiredoc_session=; path=/; max-age=0; SameSite=Lax";
}
