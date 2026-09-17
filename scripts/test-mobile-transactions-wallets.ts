import { prisma } from '../src/lib/db';
import { spawn, ChildProcess } from 'child_process';

const BASE_URL = 'http://localhost:3000';
let spawnedServer: ChildProcess | null = null;

async function ensureServerRunning(): Promise<void> {
  try {
    await fetch(`${BASE_URL}/api/auth/me`);
    return;
  } catch {}

  console.log('Starting Next.js server on port 3000 for Step 4 test...');
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
    console.error(`  ✗ ${testName}: ${message || 'Assertion failed'}`);
    process.exit(1);
  }
}

async function cleanupUser(email: string) {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (user) {
    await prisma.transaction.deleteMany({ where: { userId: user.id } });
    await prisma.budget.deleteMany({ where: { userId: user.id } });
    await prisma.goalContribution.deleteMany({ where: { goal: { userId: user.id } } });
    await prisma.goal.deleteMany({ where: { userId: user.id } });
    await prisma.wallet.deleteMany({ where: { userId: user.id } });
    await prisma.session.deleteMany({ where: { userId: user.id } });
    await prisma.userSettings.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
  }
}

async function runStep4Tests() {
  await ensureServerRunning();
  console.log('\n=== RUNNING FINAI MOBILE STEP 4: TRANSACTIONS & WALLETS INTEGRATION TEST ===\n');

  const userAEmail = 'step4.usera@finai.id';
  const userBEmail = 'step4.userb@finai.id';
  const testPassword = 'Password123!';

  // Cleanup prior test artifacts
  await cleanupUser(userAEmail);
  await cleanupUser(userBEmail);

  // 1. Setup User A (Mobile Client)
  console.log('[1] AUTHENTICATION SETUP:');
  const regARes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-client-type': 'mobile' },
    body: JSON.stringify({ name: 'User A Mobile', email: userAEmail, password: testPassword }),
  });
  const regAData = await regARes.json();
  if (regARes.status !== 201) {
    console.error('Registration A failed with status:', regARes.status, regAData);
  }
  const tokenA = regAData.data?.token;
  assert(regARes.status === 201 && Boolean(tokenA), 'User A registered with mobile Bearer token', JSON.stringify(regAData));

  // Setup User B (For Cross-User Isolation)
  const regBRes = await fetch(`${BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-client-type': 'mobile' },
    body: JSON.stringify({ name: 'User B Mobile', email: userBEmail, password: testPassword }),
  });
  const regBData = await regBRes.json();
  const tokenB = regBData.data?.token;
  assert(regBRes.status === 201 && Boolean(tokenB), 'User B registered with mobile Bearer token');

  const headersA = {
    Authorization: `Bearer ${tokenA}`,
    'x-client-type': 'mobile',
    'Content-Type': 'application/json',
  };

  const headersB = {
    Authorization: `Bearer ${tokenB}`,
    'x-client-type': 'mobile',
    'Content-Type': 'application/json',
  };

  // 2. Wallet Lifecycle Tests
  console.log('\n[2] WALLET MANAGEMENT LIFECYCLE:');
  
  // Create Wallet 1
  const createW1Res = await fetch(`${BASE_URL}/api/wallets`, {
    method: 'POST',
    headers: headersA,
    body: JSON.stringify({
      name: 'BCA Utama',
      type: 'BANK',
      institution: 'BCA',
      accountLast4: '8812',
      balance: 1000000, // Rp 1.000.000 initial balance
    }),
  });
  const createW1Data = await createW1Res.json();
  assert(createW1Res.status === 201, 'POST /api/wallets creates wallet with 201 Created');
  const wallet1 = createW1Data.data?.wallet;
  assert(Boolean(wallet1?.id), 'Wallet response contains valid ID');
  assert(Number(wallet1?.balance) === 1000000, 'Initial balance correctly saved as 1,000,000');

  // Verify Wallet in GET /api/wallets
  const getWalletsRes = await fetch(`${BASE_URL}/api/wallets`, { headers: headersA });
  const getWalletsData = await getWalletsRes.json();
  assert(getWalletsRes.status === 200, 'GET /api/wallets returns 200 OK');
  assert(getWalletsData.data?.wallets?.length === 1, 'User A has exactly 1 wallet in list');
  assert(getWalletsData.data.wallets[0].name === 'BCA Utama', 'Wallet name in list matches');

  // Edit Wallet (Update name & institution)
  const editW1Res = await fetch(`${BASE_URL}/api/wallets/${wallet1.id}`, {
    method: 'PATCH',
    headers: headersA,
    body: JSON.stringify({
      name: 'BCA Payroll Prioritas',
      institution: 'Bank BCA',
      accountLast4: '8812',
      type: 'BANK',
    }),
  });
  const editW1Data = await editW1Res.json();
  assert(editW1Res.status === 200, 'PATCH /api/wallets/[id] returns 200 on valid update');
  assert(editW1Data.data?.wallet?.name === 'BCA Payroll Prioritas', 'Wallet name updated in response');

  // Strict Balance Security: Direct balance modification via PATCH must be REJECTED (400 VALIDATION_ERROR)
  const illegalBalanceEditRes = await fetch(`${BASE_URL}/api/wallets/${wallet1.id}`, {
    method: 'PATCH',
    headers: headersA,
    body: JSON.stringify({
      name: 'BCA Hack',
      balance: 999999999, // Should be rejected by strict schema
    }),
  });
  assert(
    illegalBalanceEditRes.status === 400,
    'PATCH /api/wallets/[id] strictly rejects balance modification with 400 Bad Request'
  );

  // 3. Transaction Lifecycle & Balance Synchronization
  console.log('\n[3] TRANSACTION MANAGEMENT & ATOMIC BALANCE SYNC:');

  // Create Income Transaction: +Rp 500.000
  const incomeRes = await fetch(`${BASE_URL}/api/transactions`, {
    method: 'POST',
    headers: headersA,
    body: JSON.stringify({
      walletId: wallet1.id,
      type: 'INCOME',
      amount: 500000,
      category: 'Gaji',
      description: 'Bonus Kinerja Bulanan',
      transactionDate: new Date().toISOString(),
    }),
  });
  const incomeData = await incomeRes.json();
  assert(incomeRes.status === 201, 'POST /api/transactions creates INCOME with 201 Created');
  const incomeTx = incomeData.data?.transaction;
  assert(incomeTx?.type === 'INCOME', 'Transaction type is INCOME');

  // Verify Wallet Balance after Income: 1.000.000 + 500.000 = 1.500.000
  const checkBalance1Res = await fetch(`${BASE_URL}/api/wallets`, { headers: headersA });
  const checkBalance1Data = await checkBalance1Res.json();
  const currentW1AfterIncome = checkBalance1Data.data.wallets.find((w: any) => w.id === wallet1.id);
  assert(
    Number(currentW1AfterIncome.balance) === 1500000,
    'Wallet balance atomically incremented to 1,500,000 after INCOME'
  );

  // Create Expense Transaction: -Rp 200.000
  const expenseRes = await fetch(`${BASE_URL}/api/transactions`, {
    method: 'POST',
    headers: headersA,
    body: JSON.stringify({
      walletId: wallet1.id,
      type: 'EXPENSE',
      amount: 200000,
      category: 'Makanan',
      description: 'Makan Siang Tim',
      transactionDate: new Date().toISOString(),
    }),
  });
  const expenseData = await expenseRes.json();
  assert(expenseRes.status === 201, 'POST /api/transactions creates EXPENSE with 201 Created');
  const expenseTx = expenseData.data?.transaction;

  // Verify Wallet Balance after Expense: 1.500.000 - 200.000 = 1.300.000
  const checkBalance2Res = await fetch(`${BASE_URL}/api/wallets`, { headers: headersA });
  const checkBalance2Data = await checkBalance2Res.json();
  const currentW1AfterExpense = checkBalance2Data.data.wallets.find((w: any) => w.id === wallet1.id);
  assert(
    Number(currentW1AfterExpense.balance) === 1300000,
    'Wallet balance atomically decremented to 1,300,000 after EXPENSE'
  );

  // Insufficient Balance Protection: Try to spend 5.000.000 (Wallet has only 1.300.000)
  const overspendRes = await fetch(`${BASE_URL}/api/transactions`, {
    method: 'POST',
    headers: headersA,
    body: JSON.stringify({
      walletId: wallet1.id,
      type: 'EXPENSE',
      amount: 5000000,
      category: 'Belanja',
      description: 'Beli Laptop Baru',
      transactionDate: new Date().toISOString(),
    }),
  });
  const overspendData = await overspendRes.json();
  assert(
    overspendRes.status === 409 && overspendData.error?.code === 'INSUFFICIENT_BALANCE',
    'Overspending rejected with 409 Conflict (INSUFFICIENT_BALANCE)'
  );

  // Verify Transactions List & Filtering
  console.log('\n[4] TRANSACTION FILTERING & QUERYING:');
  const allTxRes = await fetch(`${BASE_URL}/api/transactions`, { headers: headersA });
  const allTxData = await allTxRes.json();
  assert(allTxData.data?.transactions?.length === 2, 'GET /api/transactions returns 2 transactions');

  // Filter by type: EXPENSE
  const expenseFilterRes = await fetch(`${BASE_URL}/api/transactions?type=EXPENSE`, { headers: headersA });
  const expenseFilterData = await expenseFilterRes.json();
  assert(
    expenseFilterData.data?.transactions?.length === 1 &&
      expenseFilterData.data.transactions[0].type === 'EXPENSE',
    'Filter type=EXPENSE returns only expense transactions'
  );

  // Filter by type: INCOME
  const incomeFilterRes = await fetch(`${BASE_URL}/api/transactions?type=INCOME`, { headers: headersA });
  const incomeFilterData = await incomeFilterRes.json();
  assert(
    incomeFilterData.data?.transactions?.length === 1 &&
      incomeFilterData.data.transactions[0].type === 'INCOME',
    'Filter type=INCOME returns only income transactions'
  );

  // 5. Transaction Update & Balance Re-calculation
  console.log('\n[5] TRANSACTION EDIT & ATOMIC BALANCE REVERSAL:');
  // Update expense from 200.000 to 350.000 (Difference: -150.000)
  // Old balance 1.300.000 -> Revert old (+200.000 = 1.500.000) -> Apply new (-350.000 = 1.150.000)
  const updateTxRes = await fetch(`${BASE_URL}/api/transactions/${expenseTx.id}`, {
    method: 'PATCH',
    headers: headersA,
    body: JSON.stringify({
      amount: 350000,
      description: 'Makan Siang & Kopi Tim',
      category: 'Makanan',
      transactionDate: new Date().toISOString(),
    }),
  });
  const updateTxData = await updateTxRes.json();
  assert(updateTxRes.status === 200, 'PATCH /api/transactions/[id] returns 200 OK');
  assert(Number(updateTxData.data?.transaction?.amount) === 350000, 'Transaction amount updated to 350,000');

  const checkBalance3Res = await fetch(`${BASE_URL}/api/wallets`, { headers: headersA });
  const checkBalance3Data = await checkBalance3Res.json();
  const currentW1AfterEdit = checkBalance3Data.data.wallets.find((w: any) => w.id === wallet1.id);
  assert(
    Number(currentW1AfterEdit.balance) === 1150000,
    'Wallet balance atomically adjusted to 1,150,000 after transaction edit'
  );

  // 6. Delete Protection on Wallet with Existing Transactions
  console.log('\n[6] INTEGRITY CHECKS & DELETE RESTRICTIONS:');
  const deleteWalletWithTxRes = await fetch(`${BASE_URL}/api/wallets/${wallet1.id}`, {
    method: 'DELETE',
    headers: headersA,
  });
  const deleteWalletWithTxData = await deleteWalletWithTxRes.json();
  assert(
    deleteWalletWithTxRes.status === 409 && deleteWalletWithTxData.error?.code === 'WALLET_IN_USE',
    'DELETE /api/wallets/[id] blocked with 409 WALLET_IN_USE when transactions exist'
  );

  // 7. Delete Transactions & Balance Reversal
  console.log('\n[7] TRANSACTION DELETION & BALANCE RECOVERY:');
  // Delete expense transaction (350.000) -> Balance should revert from 1.150.000 back to 1.500.000
  const deleteExpenseRes = await fetch(`${BASE_URL}/api/transactions/${expenseTx.id}`, {
    method: 'DELETE',
    headers: headersA,
  });
  assert(deleteExpenseRes.status === 200, 'DELETE /api/transactions/[id] returns 200 OK');

  const checkBalance4Res = await fetch(`${BASE_URL}/api/wallets`, { headers: headersA });
  const checkBalance4Data = await checkBalance4Res.json();
  const currentW1AfterDelExp = checkBalance4Data.data.wallets.find((w: any) => w.id === wallet1.id);
  assert(
    Number(currentW1AfterDelExp.balance) === 1500000,
    'Wallet balance reverted back to 1,500,000 after deleting expense'
  );

  // Delete income transaction (500.000) -> Balance should revert from 1.500.000 back to 1.000.000
  const deleteIncomeRes = await fetch(`${BASE_URL}/api/transactions/${incomeTx.id}`, {
    method: 'DELETE',
    headers: headersA,
  });
  assert(deleteIncomeRes.status === 200, 'DELETE income transaction returns 200 OK');

  const checkBalance5Res = await fetch(`${BASE_URL}/api/wallets`, { headers: headersA });
  const checkBalance5Data = await checkBalance5Res.json();
  const currentW1Final = checkBalance5Data.data.wallets.find((w: any) => w.id === wallet1.id);
  assert(
    Number(currentW1Final.balance) === 1000000,
    'Wallet balance reverted back to initial 1,000,000 after deleting income'
  );

  // 8. Wallet Deletion after Clearing Transactions
  console.log('\n[8] CLEAN WALLET DELETION:');
  const deleteCleanWalletRes = await fetch(`${BASE_URL}/api/wallets/${wallet1.id}`, {
    method: 'DELETE',
    headers: headersA,
  });
  assert(deleteCleanWalletRes.status === 200, 'DELETE /api/wallets/[id] succeeds once transactions are removed');

  const verifyWalletsEmptyRes = await fetch(`${BASE_URL}/api/wallets`, { headers: headersA });
  const verifyWalletsEmptyData = await verifyWalletsEmptyRes.json();
  assert(
    verifyWalletsEmptyData.data?.wallets?.length === 0,
    'User A now has 0 wallets after clean deletion'
  );

  // 9. Cross-User Isolation & Security
  console.log('\n[9] MULTI-TENANT ISOLATION & SECURITY:');
  // User B creates a private wallet
  const userBWalletRes = await fetch(`${BASE_URL}/api/wallets`, {
    method: 'POST',
    headers: headersB,
    body: JSON.stringify({
      name: 'Dompet Rahasia User B',
      type: 'E_WALLET',
      institution: 'GoPay',
      balance: 250000,
    }),
  });
  const userBWalletData = await userBWalletRes.json();
  const walletBId = userBWalletData.data?.wallet?.id;
  assert(Boolean(walletBId), 'User B creates a separate wallet');

  // User A tries to view User B's wallet -> 404 (Not Found / Not Owned)
  const unauthorizedGetWalletRes = await fetch(`${BASE_URL}/api/wallets/${walletBId}`, {
    headers: headersA,
  });
  assert(
    unauthorizedGetWalletRes.status === 404,
    'User A cannot access User B wallet (returns 404 NOT_FOUND)'
  );

  // User A tries to edit User B's wallet -> 404
  const unauthorizedEditWalletRes = await fetch(`${BASE_URL}/api/wallets/${walletBId}`, {
    method: 'PATCH',
    headers: headersA,
    body: JSON.stringify({ name: 'Hacked by User A' }),
  });
  assert(
    unauthorizedEditWalletRes.status === 404,
    'User A cannot update User B wallet (returns 404 NOT_FOUND)'
  );

  // User A tries to delete User B's wallet -> 404
  const unauthorizedDeleteWalletRes = await fetch(`${BASE_URL}/api/wallets/${walletBId}`, {
    method: 'DELETE',
    headers: headersA,
  });
  assert(
    unauthorizedDeleteWalletRes.status === 404,
    'User A cannot delete User B wallet (returns 404 NOT_FOUND)'
  );

  // User A tries to create transaction under User B's wallet -> 404
  const unauthorizedTxCreateRes = await fetch(`${BASE_URL}/api/transactions`, {
    method: 'POST',
    headers: headersA,
    body: JSON.stringify({
      walletId: walletBId,
      type: 'EXPENSE',
      amount: 10000,
      category: 'Lainnya',
      description: 'Pencurian Saldo',
      transactionDate: new Date().toISOString(),
    }),
  });
  assert(
    unauthorizedTxCreateRes.status === 404,
    'User A cannot create transaction with User B wallet (returns 404 NOT_FOUND)'
  );

  // User B creates a transaction
  const userBTxRes = await fetch(`${BASE_URL}/api/transactions`, {
    method: 'POST',
    headers: headersB,
    body: JSON.stringify({
      walletId: walletBId,
      type: 'EXPENSE',
      amount: 25000,
      category: 'Lainnya',
      description: 'Transaksi Privat User B',
      transactionDate: new Date().toISOString(),
    }),
  });
  const userBTxData = await userBTxRes.json();
  const txBId = userBTxData.data?.transaction?.id;
  assert(Boolean(txBId), 'User B creates a transaction successfully');

  // User A tries to view User B's transaction -> 404
  const unauthorizedGetTxRes = await fetch(`${BASE_URL}/api/transactions/${txBId}`, {
    headers: headersA,
  });
  assert(
    unauthorizedGetTxRes.status === 404,
    'User A cannot access User B transaction (returns 404 NOT_FOUND)'
  );

  // User A tries to edit User B's transaction -> 404
  const unauthorizedEditTxRes = await fetch(`${BASE_URL}/api/transactions/${txBId}`, {
    method: 'PATCH',
    headers: headersA,
    body: JSON.stringify({ amount: 99999 }),
  });
  assert(
    unauthorizedEditTxRes.status === 404,
    'User A cannot update User B transaction (returns 404 NOT_FOUND)'
  );

  // User A tries to delete User B's transaction -> 404
  const unauthorizedDeleteTxRes = await fetch(`${BASE_URL}/api/transactions/${txBId}`, {
    method: 'DELETE',
    headers: headersA,
  });
  assert(
    unauthorizedDeleteTxRes.status === 404,
    'User A cannot delete User B transaction (returns 404 NOT_FOUND)'
  );

  // Validation Edge Cases: Invalid Amount (<= 0)
  const invalidAmountRes = await fetch(`${BASE_URL}/api/transactions`, {
    method: 'POST',
    headers: headersB,
    body: JSON.stringify({
      walletId: walletBId,
      type: 'EXPENSE',
      amount: 0,
      category: 'Lainnya',
      description: 'Zero amount',
      transactionDate: new Date().toISOString(),
    }),
  });
  assert(
    invalidAmountRes.status === 400,
    'POST /api/transactions with amount <= 0 rejected with 400 Bad Request'
  );

  // Validation Edge Cases: Non-existent Wallet UUID
  const invalidWalletRes = await fetch(`${BASE_URL}/api/transactions`, {
    method: 'POST',
    headers: headersB,
    body: JSON.stringify({
      walletId: '00000000-0000-0000-0000-000000000000',
      type: 'EXPENSE',
      amount: 10000,
      category: 'Lainnya',
      description: 'Non-existent wallet',
      transactionDate: new Date().toISOString(),
    }),
  });
  assert(
    invalidWalletRes.status === 404,
    'POST /api/transactions with non-existent wallet rejected with 404 NOT_FOUND'
  );

  // Unauthenticated requests without token -> 401
  const unauthenticatedRes = await fetch(`${BASE_URL}/api/wallets`, {
    headers: { 'x-client-type': 'mobile' },
  });
  assert(
    unauthenticatedRes.status === 401,
    'Requests without Authorization Bearer header return 401 Unauthorized'
  );

  // Cleanup test users
  await cleanupUser(userAEmail);
  await cleanupUser(userBEmail);

  console.log('\n======================================================');
  console.log('✓ ALL 18 STEP 4 TRANSACTIONS & WALLETS TESTS PASSED!');
  console.log('======================================================\n');

  if (spawnedServer) {
    spawnedServer.kill();
  }
}

runStep4Tests().catch((err) => {
  console.error('Test script failed with error:', err);
  if (spawnedServer) {
    spawnedServer.kill();
  }
  process.exit(1);
});
