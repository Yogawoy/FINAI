import { prisma } from '../src/lib/db';
import crypto from 'crypto';
import { spawn, ChildProcess } from 'child_process';

let BASE_URL = 'http://localhost:3000';
let spawnedServer: ChildProcess | null = null;

async function ensureServerRunning(): Promise<void> {
  try {
    await fetch(`${BASE_URL}/api/auth/me`);
    return;
  } catch {}

  console.log('Starting Next.js server on port 3000 for automated testing...');
  spawnedServer = spawn('node', ['./node_modules/next/dist/bin/next', 'start', '-p', '3000'], {
    stdio: 'ignore',
    shell: true,
  });

  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 500));
    try {
      await fetch(`${BASE_URL}/api/auth/me`);
      console.log('Next.js server ready.\n');
      return;
    } catch {}
  }
  throw new Error('Failed to start test server on port 3000');
}

interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, testName: string, message?: string) {
  if (condition) {
    results.push({ name: testName, passed: true });
    console.log(`  ✓ ${testName}`);
  } else {
    results.push({ name: testName, passed: false, details: message });
    console.error(`  ✗ ${testName}: ${message}`);
  }
}

async function runTests() {
  await ensureServerRunning();
  console.log('\n=== RUNNING COMPREHENSIVE FINAI AUTHENTICATION TEST SUITE ===\n');

  // Find or create test user
  const testEmail = 'mobile.test@finai.id';
  const testPassword = 'Password123!';
  const testName = 'Mobile Test User';

  // Cleanup past test data
  const existingUser = await prisma.user.findUnique({ where: { email: testEmail } });
  if (existingUser) {
    await prisma.session.deleteMany({ where: { userId: existingUser.id } });
    await prisma.userSettings.deleteMany({ where: { userId: existingUser.id } });
    await prisma.user.delete({ where: { id: existingUser.id } });
  }

  // ==========================================
  // 1. REGISTER TESTS
  // ==========================================
  console.log('[1] REGISTER TESTS:');

  // 1a. Missing/Invalid email
  const resInvEmail = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-client-type': 'mobile' },
    body: JSON.stringify({ name: testName, email: 'not-an-email', password: testPassword }),
  });
  assert(resInvEmail.status === 400, 'Register with invalid email returns 400');

  // 1b. Short/weak password (<6 characters)
  const resShortPass = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-client-type': 'mobile' },
    body: JSON.stringify({ name: testName, email: testEmail, password: '123' }),
  });
  assert(resShortPass.status === 400, 'Register with short password returns 400');

  // 1c. Valid mobile registration
  const resRegMobile = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-client-type': 'mobile' },
    body: JSON.stringify({ name: testName, email: testEmail, password: testPassword }),
  });
  const regMobileJson = await resRegMobile.json();
  assert(resRegMobile.status === 201, 'Valid mobile registration returns 201');
  assert(Boolean(regMobileJson.data?.token), 'Mobile registration returns session token');
  assert(regMobileJson.data?.user?.email === testEmail, 'Mobile registration returns correct user');

  // 1d. Duplicate email registration
  const resDupEmail = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-client-type': 'mobile' },
    body: JSON.stringify({ name: testName, email: testEmail, password: testPassword }),
  });
  assert(resDupEmail.status === 409, 'Duplicate email registration returns 409 Conflict');

  // ==========================================
  // 2. LOGIN TESTS
  // ==========================================
  console.log('\n[2] LOGIN TESTS:');

  // 2a. Missing email
  const resMissEmail = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: testPassword }),
  });
  assert(resMissEmail.status === 400, 'Login with missing email returns 400');

  // 2b. Missing password
  const resMissPass = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail }),
  });
  assert(resMissPass.status === 400, 'Login with missing password returns 400');

  // 2c. Invalid credentials
  const resWrongPass = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'WrongPassword999!' }),
  });
  assert(resWrongPass.status === 401, 'Login with wrong password returns 401');

  // 2d. Web Login (Regression Check)
  const resWebLogin = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: testPassword }),
  });
  const webCookies = resWebLogin.headers.get('set-cookie') || '';
  const webLoginJson = await resWebLogin.json();
  assert(resWebLogin.status === 200, 'Web login returns 200');
  assert(webCookies.includes('finai_session='), 'Web login sets finai_session HTTP-Only cookie');
  assert(webLoginJson.data?.token === undefined, 'Web login DOES NOT leak token in response body');
  assert(webLoginJson.data?.user?.email === testEmail, 'Web login returns user info');

  // Extract cookie
  const cookieMatch = webCookies.match(/finai_session=([^;]+)/);
  const webSessionCookie = cookieMatch ? cookieMatch[1] : '';

  // 2e. Mobile Login
  const resMobLogin = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-client-type': 'mobile' },
    body: JSON.stringify({ email: testEmail, password: testPassword }),
  });
  const mobLoginJson = await resMobLogin.json();
  assert(resMobLogin.status === 200, 'Mobile login returns 200');
  assert(typeof mobLoginJson.data?.token === 'string', 'Mobile login returns bearer token');
  assert(mobLoginJson.data?.user?.email === testEmail, 'Mobile login returns user info');

  const mobileToken = mobLoginJson.data?.token;

  // ==========================================
  // 3. AUTHORIZATION & SESSION TESTS
  // ==========================================
  console.log('\n[3] AUTHORIZATION & SESSION TESTS:');

  // 3a. Protected route without token
  const resNoAuth = await fetch(`${BASE_URL}/api/auth/me`);
  assert(resNoAuth.status === 401, 'Protected /api/auth/me without credentials returns 401');

  // 3b. Protected route with empty Bearer
  const resEmptyBearer = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { Authorization: 'Bearer ' },
  });
  assert(resEmptyBearer.status === 401, 'Protected /api/auth/me with empty Bearer returns 401');

  // 3c. Protected route with invalid Bearer token
  const resInvBearer = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { Authorization: 'Bearer random_invalid_hex_token_xyz' },
  });
  assert(resInvBearer.status === 401, 'Protected /api/auth/me with invalid token returns 401');

  // 3d. Protected route with valid Mobile Bearer token
  const resMobMe = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${mobileToken}` },
  });
  const mobMeJson = await resMobMe.json();
  assert(resMobMe.status === 200, 'Protected /api/auth/me with Bearer token returns 200');
  assert(mobMeJson.data?.user?.email === testEmail, 'Bearer token successfully authenticates current user');

  // 3e. Protected route with valid Web Cookie
  const resWebMe = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { Cookie: `finai_session=${webSessionCookie}` },
  });
  const webMeJson = await resWebMe.json();
  assert(resWebMe.status === 200, 'Protected /api/auth/me with Web cookie returns 200');
  assert(webMeJson.data?.user?.email === testEmail, 'Web cookie successfully authenticates current user');

  // 3f. Expired token handling
  const expiredRawToken = crypto.randomBytes(32).toString('hex');
  const expiredHash = crypto.createHash('sha256').update(expiredRawToken).digest('hex');
  const userRecord = await prisma.user.findUnique({ where: { email: testEmail } });
  if (userRecord) {
    await prisma.session.create({
      data: {
        userId: userRecord.id,
        tokenHash: expiredHash,
        expiresAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour in the past
      },
    });

    const resExpired = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Authorization: `Bearer ${expiredRawToken}` },
    });
    assert(resExpired.status === 401, 'Expired token returns 401 Unauthorized');

    const sessionInDb = await prisma.session.findUnique({ where: { tokenHash: expiredHash } });
    assert(sessionInDb === null, 'Expired session is automatically cleaned from database');
  }

  // ==========================================
  // 4. LOGOUT TESTS
  // ==========================================
  console.log('\n[4] LOGOUT TESTS:');

  // 4a. Mobile Logout
  const resMobLogout = await fetch(`${BASE_URL}/api/auth/logout`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${mobileToken}` },
  });
  assert(resMobLogout.status === 200, 'Mobile logout returns 200');

  // 4b. Verify mobile token is now invalidated
  const resPostLogoutMe = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${mobileToken}` },
  });
  assert(resPostLogoutMe.status === 401, 'Logged out Bearer token is rejected with 401');

  // 4c. Verify Web session still intact until web logout
  const resWebStillActive = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { Cookie: `finai_session=${webSessionCookie}` },
  });
  assert(resWebStillActive.status === 200, 'Web session remains independently active after mobile logout');

  // 4d. Web Logout
  const resWebLogout = await fetch(`${BASE_URL}/api/auth/logout`, {
    method: 'POST',
    headers: { Cookie: `finai_session=${webSessionCookie}` },
  });
  assert(resWebLogout.status === 200, 'Web logout returns 200');

  const resPostWebLogoutMe = await fetch(`${BASE_URL}/api/auth/me`, {
    headers: { Cookie: `finai_session=${webSessionCookie}` },
  });
  assert(resPostWebLogoutMe.status === 401, 'Logged out Web cookie is rejected with 401');

  // Cleanup test user
  if (userRecord) {
    await prisma.session.deleteMany({ where: { userId: userRecord.id } });
    await prisma.userSettings.deleteMany({ where: { userId: userRecord.id } });
    await prisma.user.delete({ where: { id: userRecord.id } });
  }

  // Summary
  console.log('\n==========================================');
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;
  console.log(`TOTAL TESTS: ${results.length} | PASSED: ${passedCount} | FAILED: ${failedCount}`);
  console.log('==========================================\n');

  if (failedCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests()
  .catch((err) => {
    console.error('Test execution error:', err);
    process.exit(1);
  })
  .finally(() => {
    if (spawnedServer) {
      try {
        spawnedServer.kill();
      } catch {}
    }
  });

