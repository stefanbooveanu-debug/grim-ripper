import fs from "fs";
import path from "path";

const USERS_PATH = path.join(process.cwd(), "data", "users.json");

export async function loadUsers() {
  try {
    const raw = await fs.promises.readFile(USERS_PATH, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

export async function findUserByEmail(email) {
  const users = await loadUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
}

