import bcrypt from "bcryptjs";

export async function hashPassword(rawPassword: string) {
  return bcrypt.hash(rawPassword, 10);
}

export async function verifyPassword(rawPassword: string, hashedPassword: string) {
  return bcrypt.compare(rawPassword, hashedPassword);
}
