import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { authCookieName, getAdminSecret } from "@/lib/auth";

export async function POST(request) {
  const body = await request.json();

  if (body.secret !== getAdminSecret()) {
    return NextResponse.json(
      { error: "Clave inválida." },
      { status: 401 }
    );
  }

  const cookieStore = await cookies();
  cookieStore.set(authCookieName(), body.secret, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 10
  });

  return NextResponse.json({ ok: true });
}
