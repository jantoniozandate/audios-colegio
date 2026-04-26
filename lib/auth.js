import { cookies } from "next/headers";

const AUTH_COOKIE = "notas-voz-admin";

export function getAdminSecret() {
  const secret = process.env.ADMIN_SECRET;

  if (!secret) {
    throw new Error("Missing ADMIN_SECRET env var.");
  }

  return secret;
}

export async function isAuthenticated() {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_COOKIE)?.value === getAdminSecret();
}

export async function requireAuth() {
  const ok = await isAuthenticated();

  if (!ok) {
    throw new Error("Unauthorized");
  }
}

export function authCookieName() {
  return AUTH_COOKIE;
}
