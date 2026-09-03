import { getCurrentUser, SafeUser } from './session';

export class UnauthorizedError extends Error {
  constructor(message: string = 'Silakan masuk terlebih dahulu untuk mengakses layanan ini') {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export async function requireAuth(): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new UnauthorizedError();
  }
  return user;
}
