import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const TOKEN_NAME = "token";
const TOKEN_MAX_AGE = 60 * 60 * 8; // 8 hours

export function createToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_MAX_AGE });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

export function cookieHeaderFromToken(token) {
  const secure = process.env.NODE_ENV === "production";
  const cookie = `${TOKEN_NAME}=${token}; HttpOnly; Path=/; Max-Age=${TOKEN_MAX_AGE}; SameSite=Strict${secure ? "; Secure" : ""}`;
  return cookie;
}

export function parseTokenFromCookie(cookieHeader) {
  if (!cookieHeader) return null;
  const parts = cookieHeader.split(";").map((s) => s.trim());
  for (const p of parts) {
    if (p.startsWith("token=")) return p.substring("token=".length);
  }
  return null;
}

