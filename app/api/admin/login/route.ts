import { NextResponse } from "next/server";
import { adminLoginToken, setAdminCookie } from "@/lib/admin-auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Admin login isn't configured." }, { status: 500 });
  }
  const body = await request.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password : "";
  const token = adminLoginToken(password);
  if (!token) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }
  await setAdminCookie(token);
  return NextResponse.json({ ok: true });
}
