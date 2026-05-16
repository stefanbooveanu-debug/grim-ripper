import { NextResponse } from "next/server";

export async function POST() {
  const expiredCookie = `token=; HttpOnly; Path=/; Max-Age=0; SameSite=Strict${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
  const res = new NextResponse(JSON.stringify({ ok: true }), { status: 200 });
  res.headers.set("Set-Cookie", expiredCookie);
  return res;
}

