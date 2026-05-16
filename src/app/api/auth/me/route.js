import { NextResponse } from "next/server";
import { parseTokenFromCookie, verifyToken } from "@/lib/auth";
import { loadUsers } from "@/lib/users";

export async function GET(req) {
  const cookie = req.headers.get("cookie") || "";
  const token = parseTokenFromCookie(cookie);
  if (!token) return new NextResponse(JSON.stringify({ authenticated: false }), { status: 200 });

  const payload = verifyToken(token);
  if (!payload) return new NextResponse(JSON.stringify({ authenticated: false }), { status: 200 });

  const users = await loadUsers();
  const user = users.find((u) => u.id === payload.sub) || null;

  if (!user) return new NextResponse(JSON.stringify({ authenticated: false }), { status: 200 });

  return new NextResponse(JSON.stringify({ authenticated: true, user: { id: user.id, email: user.email, name: user.name } }), { status: 200 });
}

