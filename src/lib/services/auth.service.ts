import { prisma } from '@/lib/db';
import { RegisterInput, LoginInput } from '@/lib/validations/auth';
import {
  hashPassword,
  comparePassword,
  createSession,
  deleteSession,
  getSessionTokenFromRequest,
  getCurrentUser as getCurrentUserFromSession,
  SafeUser,
} from '@/lib/auth';

export interface AuthResult<T> {
  success: boolean;
  statusCode: number;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

export interface AuthUserResponseData {
  user: SafeUser;
  token?: string;
}

export async function registerUser(
  input: RegisterInput,
  options?: { isMobile?: boolean }
): Promise<AuthResult<AuthUserResponseData>> {
  const normalizedEmail = input.email.toLowerCase().trim();

  // Check if email already registered
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    return {
      success: false,
      statusCode: 409,
      error: {
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'Email sudah terdaftar. Silakan masuk.',
      },
    };
  }

  // Hash password
  const passwordHash = await hashPassword(input.password);

  // Execute atomic transaction: Create User & UserSettings
  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        name: input.name.trim(),
        email: normalizedEmail,
        passwordHash,
        settings: {
          create: {
            language: 'id-ID',
            currency: 'IDR',
            numberFormat: 'id-ID',
            budgetReminder: true,
            goalReminder: true,
            financialSummary: true,
            aiPersonalization: true,
            aiActionConfirmation: true,
            animations: true,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
      },
    });

    return newUser;
  });

  // Create session and set cookie
  const rawToken = await createSession(user.id, true);

  const safeUser: SafeUser = {
    ...user,
    userId: user.id,
  };

  const responseData: AuthUserResponseData = {
    user: safeUser,
  };

  if (options?.isMobile) {
    responseData.token = rawToken;
  }

  return {
    success: true,
    statusCode: 201,
    data: responseData,
  };
}

export async function loginUser(
  input: LoginInput,
  options?: { isMobile?: boolean }
): Promise<AuthResult<AuthUserResponseData>> {
  const normalizedEmail = input.email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    return {
      success: false,
      statusCode: 401,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Email atau password tidak sesuai.',
      },
    };
  }

  const isPasswordValid = await comparePassword(input.password, user.passwordHash);
  if (!isPasswordValid) {
    return {
      success: false,
      statusCode: 401,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Email atau password tidak sesuai.',
      },
    };
  }

  // Create session with rememberMe support
  const rawToken = await createSession(user.id, input.rememberMe ?? true);

  const safeUser: SafeUser = {
    id: user.id,
    userId: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    createdAt: user.createdAt,
  };

  const responseData: AuthUserResponseData = {
    user: safeUser,
  };

  if (options?.isMobile) {
    responseData.token = rawToken;
  }

  return {
    success: true,
    statusCode: 200,
    data: responseData,
  };
}

export async function logoutUser(tokenOverride?: string | null): Promise<AuthResult<{ message: string }>> {
  const token = tokenOverride || await getSessionTokenFromRequest();
  await deleteSession(token);

  return {
    success: true,
    statusCode: 200,
    data: { message: 'Berhasil keluar' },
  };
}

export async function getCurrentUser(): Promise<AuthResult<{ user: SafeUser }>> {
  const user = await getCurrentUserFromSession();

  if (!user) {
    return {
      success: false,
      statusCode: 401,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Sesi tidak valid atau telah berakhir',
      },
    };
  }

  return {
    success: true,
    statusCode: 200,
    data: { user },
  };
}
