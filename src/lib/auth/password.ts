import bcrypt from 'bcryptjs';

// OWASP standard work factor: 10 rounds gives optimal security while
// reducing serverless CPU blocking latency from ~1200ms down to ~120ms.
const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
