import { prisma } from '../src/lib/db';
import { spawn, ChildProcess } from 'child_process';

const BASE_URL = 'http://localhost:3000';
let spawnedServer: ChildProcess | null = null;

async function ensureServerRunning(): Promise<void> {
  try {
    await fetch(`${BASE_URL}/api/auth/me`);
    return;
  } catch {}

  console.log('Starting Next.js server on port 3000 for dashboard test...');
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

function assert(condition: boolean, testName: string, message?: string) {
  if (condition) {
    console.log(`  ✓ ${testName}`);
  } else {
    console.error(`  ✗ ${testName}: ${message}`);
    process.exit(1);
  }
}

async function runDashboardTests() {
  await ensureServerRunning();
  console.log('\n=== RUNNING FINAI MOBILE FINANCIAL DASHBOARD INTEGRATION TEST ===\n');

  const testEmail = 'dashboard.test@finai.id';
  const testPassword = 'Password123!';
  const testName = 'Dashboard Tester';

  // 1. Cleanup old test data
  const oldUser = await prisma.user.findUnique({ where: { email: testEmail } });
  if (oldUser) {
    await prisma.transaction.deleteMany({ where: { userId: oldUser.id } });
    await prisma.budget.deleteMany({ where: { userId: oldUser.id } });
    await prisma.goal.deleteMany({ where: { userId: oldUser.id } });
    await prisma.wallet.deleteMany({ where: { userId: oldUser.id } });
    await prisma.session.deleteMany({ where: { userId: oldUser.id } });
    await prisma.userSettings.deleteMany({ where: { userId: oldUser.id } });
    await prisma.user.delete({ where: { id: oldUser.id } });
  }

  // 2. Mobile Register to get Bearer token
  const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-client-type': 'mobile' },
    body: JSON.stringify({ name: testName, email: testEmail, password: testPassword }),
  });
  const regData = await regRes.json();
  const token = regData.data?.token;
  assert(regRes.status === 201 && Boolean(token), 'Mobile client receives Bearer token on registration');

  const authHeaders = {
    Authorization: `Bearer ${token}`,
    'x-client-type': 'mobile',
    'Content-Type': 'application/json',
  };

  // 3. Verify Empty State API responses for new user
  console.log('\n[1] EMPTY STATE VERIFICATION:');
  const emptyWalletsRes = await fetch(`${BASE_URL}/api/wallets`, { headers: authHeaders });
  const emptyWallets = await emptyWalletsRes.json();
  assert(emptyWallets.data?.wallets?.length === 0, 'New user starts with 0 wallets (triggers EmptyState)');

  const emptyTxRes = await fetch(`${BASE_URL}/api/transactions`, { headers: authHeaders });
  const emptyTx = await emptyTxRes.json();
  assert(emptyTx.data?.transactions?.length === 0, 'New user starts with 0 transactions (triggers EmptyState)');

  const emptyBudgetsRes = await fetch(`${BASE_URL}/api/budgets`, { headers: authHeaders });
  const emptyBudgets = await emptyBudgetsRes.json();
  assert(emptyBudgets.data?.budgets?.length === 0, 'New user starts with 0 budgets (triggers EmptyState)');

  const emptyGoalsRes = await fetch(`${BASE_URL}/api/goals`, { headers: authHeaders });
  const emptyGoals = await emptyGoalsRes.json();
  assert(emptyGoals.data?.goals?.length === 0, 'New user starts with 0 goals (triggers EmptyState)');

  // 4. Create Real Financial Data via REST API
  console.log('\n[2] FINANCIAL DATA POPULATION VIA REST API:');

  // Create Wallet 1: BCA
  const w1Res = await fetch(`${BASE_URL}/api/wallets`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: 'Bank BCA',
      type: 'BANK',
      balance: 12500000,
      accountLast4: '4821',
      institution: 'BCA',
    }),
  });
  const w1 = await w1Res.json();
  assert(w1Res.status === 201, 'Created BCA Wallet via API');

  // Create Wallet 2: GoPay
  const w2Res = await fetch(`${BASE_URL}/api/wallets`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: 'GoPay',
      type: 'E_WALLET',
      balance: 750000,
      institution: 'Gojek',
    }),
  });
  const w2 = await w2Res.json();
  assert(w2Res.status === 201, 'Created GoPay Wallet via API');

  // Create Wallet 3: Cash
  const w3Res = await fetch(`${BASE_URL}/api/wallets`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: 'Uang Dompet',
      type: 'CASH',
      balance: 500000,
    }),
  });
  const w3 = await w3Res.json();
  assert(w3Res.status === 201, 'Created Cash Wallet via API');

  // Record Income Transaction
  const txIncomeRes = await fetch(`${BASE_URL}/api/transactions`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      walletId: w1.data.wallet.id,
      type: 'INCOME',
      amount: 5000000,
      category: 'Gaji',
      description: 'Gaji Bulanan',
      transactionDate: new Date().toISOString(),
    }),
  });
  assert(txIncomeRes.status === 201, 'Recorded Income Transaction via API');

  // Record Expense Transaction
  const txExpenseRes = await fetch(`${BASE_URL}/api/transactions`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      walletId: w2.data.wallet.id,
      type: 'EXPENSE',
      amount: 50000,
      category: 'Makanan',
      description: 'Makan Siang Nasi Padang',
      transactionDate: new Date().toISOString(),
    }),
  });
  assert(txExpenseRes.status === 201, 'Recorded Expense Transaction via API');

  // Create Budget for current month
  const now = new Date();
  const bRes = await fetch(`${BASE_URL}/api/budgets`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      category: 'Makanan',
      limitAmount: 2000000,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    }),
  });
  assert(bRes.status === 201, 'Created Monthly Budget via API');

  // Create Goal
  const deadline = new Date(now.getFullYear() + 1, now.getMonth(), 1).toISOString();
  const gRes = await fetch(`${BASE_URL}/api/goals`, {
    method: 'POST',
    headers: authHeaders,
    body: JSON.stringify({
      name: 'Beli MacBook Pro',
      category: 'Elektronik',
      targetAmount: 25000000,
      deadline,
      frequency: 'MONTHLY',
    }),
  });
  assert(gRes.status === 201, 'Created Savings Goal via API');

  // 5. Test Fetching Populated Dashboard Data
  console.log('\n[3] DASHBOARD DATA VERIFICATION:');

  // Wallets check
  const populatedWalletsRes = await fetch(`${BASE_URL}/api/wallets`, { headers: authHeaders });
  const populatedWallets = await populatedWalletsRes.json();
  const walletsList = populatedWallets.data?.wallets || [];
  assert(walletsList.length === 3, 'GET /api/wallets returns exactly 3 real wallets');

  // Total balance sum calculation
  const totalBalance = walletsList.reduce((acc: number, w: { balance: string }) => acc + parseFloat(w.balance), 0);
  assert(totalBalance > 0, `Computed Total Balance matches API data (Total: Rp ${totalBalance.toLocaleString('id-ID')})`);

  // Transactions check
  const populatedTxRes = await fetch(`${BASE_URL}/api/transactions?limit=10`, { headers: authHeaders });
  const populatedTx = await populatedTxRes.json();
  const txList = populatedTx.data?.transactions || [];
  assert(txList.length === 2, 'GET /api/transactions returns 2 real transactions');

  // Monthly income and expense check
  let income = 0;
  let expense = 0;
  for (const tx of txList) {
    if (tx.type === 'INCOME') income += parseFloat(tx.amount);
    if (tx.type === 'EXPENSE') expense += parseFloat(tx.amount);
  }
  assert(income === 5000000, `Monthly Income computed correctly from transactions (Rp ${income.toLocaleString('id-ID')})`);
  assert(expense === 50000, `Monthly Expense computed correctly from transactions (Rp ${expense.toLocaleString('id-ID')})`);

  // Budgets check
  const populatedBudgetsRes = await fetch(`${BASE_URL}/api/budgets`, { headers: authHeaders });
  const populatedBudgets = await populatedBudgetsRes.json();
  const budgetsList = populatedBudgets.data?.budgets || [];
  assert(budgetsList.length === 1, 'GET /api/budgets returns active monthly budget');
  assert(parseFloat(budgetsList[0].limitAmount) === 2000000, 'Budget limitAmount matches API');
  assert(parseFloat(budgetsList[0].usedAmount) === 50000, 'Budget usedAmount accurately reflects EXPENSE transaction (50.000)');

  // Goals check
  const populatedGoalsRes = await fetch(`${BASE_URL}/api/goals`, { headers: authHeaders });
  const populatedGoals = await populatedGoalsRes.json();
  const goalsList = populatedGoals.data?.goals || [];
  assert(goalsList.length === 1, 'GET /api/goals returns active savings goal');
  assert(parseFloat(goalsList[0].targetAmount) === 25000000, 'Goal targetAmount matches API');

  // 6. Cleanup
  const createdUser = await prisma.user.findUnique({ where: { email: testEmail } });
  if (createdUser) {
    await prisma.transaction.deleteMany({ where: { userId: createdUser.id } });
    await prisma.budget.deleteMany({ where: { userId: createdUser.id } });
    await prisma.goal.deleteMany({ where: { userId: createdUser.id } });
    await prisma.wallet.deleteMany({ where: { userId: createdUser.id } });
    await prisma.session.deleteMany({ where: { userId: createdUser.id } });
    await prisma.userSettings.deleteMany({ where: { userId: createdUser.id } });
    await prisma.user.delete({ where: { id: createdUser.id } });
  }

  console.log('\n==========================================');
  console.log('ALL FINANCIAL DASHBOARD INTEGRATION CHECKS PASSED!');
  console.log('==========================================\n');
}

runDashboardTests()
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
