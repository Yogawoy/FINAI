import { SignJWT, jwtVerify } from 'jose';

const DEFAULT_SECRET = 'finai-fallback-secret-minimum-32-chars-key-2026';
const secretKey = new TextEncoder().encode(process.env.AUTH_SECRET || DEFAULT_SECRET);

export interface TokenPayload {
  userId: string;
  email: string;
  name: string;
}

export const AUTH_COOKIE_NAME = 'finai_session';
export const TOKEN_EXPIRATION = '7d';

export async function signToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRATION)
    .sign(secretKey);
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string,
    };
  } catch {
    return null;
  }
}
