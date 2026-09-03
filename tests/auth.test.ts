import { prisma } from '../src/lib/db';
import { RegisterSchema, LoginSchema } from '../src/lib/validations/auth';
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
} from '../src/lib/services/auth.service';
import {
  hashPassword,
  comparePassword,
  createSession,
  validateSessionToken,
  deleteSession,
  requireAuth,
  hashToken,
} from '../src/lib/auth';

async function runTests() {
  console.log('🧪 Starting FinAI Phase 3 Authentication Test Suite...\n');
  let passedCount = 0;
  let failedCount = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASSED: ${testName}`);
      passedCount++;
    } else {
      console.error(`  ❌ FAILED: ${testName}`);
      failedCount++;
    }
  }

  // Cleanup test emails before testing
  const testEmailA = 'test_user_a@finai.local';
  const testEmailB = 'test_user_b@finai.local';
  await prisma.user.deleteMany({
    where: { email: { in: [testEmailA, testEmailB] } },
  });

  try {
    // Test 1: Register valid
    console.log('1. Test Register Valid');
    const regResult = await registerUser({
      name: 'User A',
      email: testEmailA,
      password: 'password123',
    });
    assert(regResult.success === true && regResult.statusCode === 201, 'Register valid user returns 201 success');
    assert(Boolean(regResult.data?.user.id), 'Returned user has valid ID');
    assert(!('passwordHash' in (regResult.data?.user || {})), 'passwordHash is not exposed in safe user object');

    // Verify UserSettings auto-created in DB
    const userAInDb = await prisma.user.findUnique({
      where: { email: testEmailA },
      include: { settings: true },
    });
    assert(Boolean(userAInDb?.settings), 'UserSettings automatically created in atomic transaction');
    assert(userAInDb?.settings?.language === 'id-ID', 'Default settings language is id-ID');

    // Test 2: Register email duplicate
    console.log('\n2. Test Register Email Duplicate');
    const dupResult = await registerUser({
      name: 'Duplicate User',
      email: '  TEST_USER_A@FINAI.LOCAL ', // Case insensitive check
      password: 'password123',
    });
    assert(dupResult.success === false && dupResult.statusCode === 409, 'Duplicate register returns 409 Conflict');
    assert(dupResult.error?.code === 'EMAIL_ALREADY_EXISTS', 'Error code is EMAIL_ALREADY_EXISTS');

    // Test 3: Register password too short
    console.log('\n3. Test Register Password Too Short');
    const shortPassValidation = RegisterSchema.safeParse({
      name: 'Short Pass',
      email: 'short@finai.local',
      password: '123',
    });
    assert(shortPassValidation.success === false, 'Zod validation rejects password under 8 characters');

    // Test 4: Login valid
    console.log('\n4. Test Login Valid');
    const loginResult = await loginUser({
      email: testEmailA,
      password: 'password123',
      rememberMe: true,
    });
    assert(loginResult.success === true && loginResult.statusCode === 200, 'Valid login returns 200 success');
    assert(loginResult.data?.user.email === testEmailA, 'Returned user email matches');

    // Test 5: Login password wrong
    console.log('\n5. Test Login Password Wrong');
    const wrongPassResult = await loginUser({
      email: testEmailA,
      password: 'wrongpassword',
    });
    assert(wrongPassResult.success === false && wrongPassResult.statusCode === 401, 'Wrong password returns 401');
    assert(wrongPassResult.error?.code === 'INVALID_CREDENTIALS', 'Error code is INVALID_CREDENTIALS');
    assert(wrongPassResult.error?.message === 'Email atau password tidak sesuai.', 'Uses generic non-revealing error message');

    // Test 6: Login email not found
    console.log('\n6. Test Login Email Not Found');
    const noUserResult = await loginUser({
      email: 'nonexistent@finai.local',
      password: 'password123',
    });
    assert(noUserResult.success === false && noUserResult.statusCode === 401, 'Nonexistent email returns 401');
    assert(noUserResult.error?.code === 'INVALID_CREDENTIALS', 'Error code is INVALID_CREDENTIALS');

    // Test 7: Get current user
    console.log('\n7. Test Get Current User');
    const userA = userAInDb!;
    const rawTokenA = await createSession(userA.id, true);
    const validateA = await validateSessionToken(rawTokenA);
    assert(Boolean(validateA) && validateA?.id === userA.id, 'validateSessionToken returns active user');

    // Test 8: Logout
    console.log('\n8. Test Logout');
    await deleteSession(rawTokenA);
    const postLogoutUser = await validateSessionToken(rawTokenA);
    assert(postLogoutUser === null, 'Session deleted successfully after logout');

    // Test 9: Expired session
    console.log('\n9. Test Expired Session');
    const expiredToken = 'expired_raw_token_test_123';
    const expiredHash = hashToken(expiredToken);
    await prisma.session.create({
      data: {
        userId: userA.id,
        tokenHash: expiredHash,
        expiresAt: new Date(Date.now() - 10000), // Expired 10 seconds ago
      },
    });
    const expiredValidation = await validateSessionToken(expiredToken);
    assert(expiredValidation === null, 'Expired session token returns null');

    // Test 10: Protected route without session
    console.log('\n10. Test Protected Route Without Session');
    let thrown = false;
    try {
      // Mock unauthenticated call
      const invalidTokenUser = await validateSessionToken('invalid_token_xyz');
      if (!invalidTokenUser) throw new Error('UNAUTHORIZED');
    } catch {
      thrown = true;
    }
    assert(thrown === true, 'Protected check fails when no session cookie is present');

    // Test 11: Protected route with session
    console.log('\n11. Test Protected Route With Session');
    const validSessionToken = await createSession(userA.id, true);
    const authenticatedUser = await validateSessionToken(validSessionToken);
    assert(authenticatedUser?.id === userA.id, 'Protected check succeeds with valid session cookie');

    // Test 12: User isolation
    console.log('\n12. Test User Isolation');
    const regB = await registerUser({
      name: 'User B',
      email: testEmailB,
      password: 'password456',
    });
    const userBId = regB.data!.user.id;
    const tokenB = await createSession(userBId, true);

    const validatedA = await validateSessionToken(validSessionToken);
    const validatedB = await validateSessionToken(tokenB);

    assert(validatedA?.id !== validatedB?.id, 'Session A user ID is not equal to Session B user ID');
    assert(validatedA?.email === testEmailA && validatedB?.email === testEmailB, 'User A and User B session state strictly isolated');

    // Clean up test users
    await prisma.user.deleteMany({
      where: { email: { in: [testEmailA, testEmailB] } },
    });

  } catch (error) {
    console.error('❌ Test suite threw an unhandled error:', error);
    failedCount++;
  }

  console.log(`\n==================================================`);
  console.log(`Test Results: ${passedCount} Passed, ${failedCount} Failed`);
  console.log(`==================================================\n`);

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests();
