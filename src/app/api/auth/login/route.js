import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findUserByEmail } from "@/lib/users";
import { createToken, cookieHeaderFromToken } from "@/lib/auth";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body || {};
    if (!email || !password) {
      return new NextResponse(JSON.stringify({ error: "Missing email or password" }), { status: 400 });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return new NextResponse(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return new NextResponse(JSON.stringify({ error: "Invalid credentials" }), { status: 401 });
    }

    const token = createToken({ sub: user.id, email: user.email, name: user.name });

    const res = new NextResponse(JSON.stringify({ ok: true, user: { id: user.id, email: user.email, name: user.name } }), { status: 200 });
    res.headers.set("Set-Cookie", cookieHeaderFromToken(token));
    return res;
  } catch (err) {
    console.error("Login error", err);
    return new NextResponse(JSON.stringify({ error: "Server error" }), { status: 500 });
  }
}

