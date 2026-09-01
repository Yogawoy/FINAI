/**
 * Automated Backend Foundation Test Script for FinAI
 * Tests all core services, atomic transactions, validations, ownership security, and calculation logic.
 */

import { PrismaClient, Prisma } from '@prisma/client';
import { hashPassword, comparePassword } from './src/lib/auth/password';
import { signToken, verifyToken } from './src/lib/auth/jwt';
import { WalletService } from './src/lib/services/wallet.service';
import { TransferService } from './src/lib/services/transfer.service';
import { TransactionService } from './src/lib/services/transaction.service';
import { BudgetService } from './src/lib/services/budget.service';
import { GoalService } from './src/lib/services/goal.service';
import { SettingsService } from './src/lib/services/settings.service';

const prisma = new PrismaClient();

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passedCount++;
  } else {
    console.error(`  ❌ [FAIL] ${testName} ${detail ? `(${detail})` : ''}`);
    failedCount++;
  }
}

async function runTests() {
  console.log('\n======================================================');
  console.log('🧪 MEMULAI AUTOMATED BACKEND FOUNDATION TESTS');
  console.log('======================================================\n');

  // Clean up any test users
  const testEmail1 = 'test_user_1@finai.design';
  const testEmail2 = 'test_user_2@finai.design';
  await prisma.user.deleteMany({
    where: { email: { in: [testEmail1, testEmail2] } },
  });

  // -------------------------------------------------------------------------
  // TEST 1: Password Hashing & Verification
  // -------------------------------------------------------------------------
  console.log('1. Testing Password Security & Hashing...');
  const rawPass = 'SecretPassword123!';
  const hashed = await hashPassword(rawPass);
  const isMatch = await comparePassword(rawPass, hashed);
  const isWrongMismatch = !(await comparePassword('WrongPass', hashed));
  assert(hashed !== rawPass && hashed.startsWith('$2'), 'Password di-hash dengan bcrypt secara aman');
  assert(isMatch && isWrongMismatch, 'Verifikasi password cocok dan menolak password salah');

  // -------------------------------------------------------------------------
  // TEST 2: JWT Signing & Verification
  // -------------------------------------------------------------------------
  console.log('\n2. Testing JWT Session Signing & Verification...');
  const token = await signToken({ userId: 'u-123', email: 'test@finai.design', name: 'Tester' });
  const payload = await verifyToken(token);
  assert(payload?.userId === 'u-123' && payload.email === 'test@finai.design', 'Token JWT valid & payload terdekripsi');

  // -------------------------------------------------------------------------
  // TEST 3: User Registration & Auto-Created Settings
  // -------------------------------------------------------------------------
  console.log('\n3. Testing User & Settings Creation...');
  const user1 = await prisma.user.create({
    data: {
      name: 'User Satu',
      email: testEmail1,
      passwordHash: hashed,
      settings: {
        create: {
          currency: 'IDR',
          language: 'id-ID',
        },
      },
    },
    include: { settings: true },
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'User Dua',
      email: testEmail2,
      passwordHash: hashed,
    },
  });

  assert(user1.id !== undefined && user1.settings?.currency === 'IDR', 'User 1 berhasil dibuat beserta default settings');

  // -------------------------------------------------------------------------
  // TEST 4: Wallet Service (Create & Ownership)
  // -------------------------------------------------------------------------
  console.log('\n4. Testing Wallet Creation & Ownership...');
  const wBca = await WalletService.createWallet(user1.id, {
    name: 'BCA Test',
    type: 'BANK',
    institution: 'BCA',
    accountLast4: '1111',
    balance: 5000000,
  });

  const wGopay = await WalletService.createWallet(user1.id, {
    name: 'GoPay Test',
    type: 'E_WALLET',
    balance: 1000000,
  });

  const wUser2 = await WalletService.createWallet(user2.id, {
    name: 'Dompet User 2',
    type: 'CASH',
    balance: 200000,
  });

  const user1Wallets = await WalletService.getWallets(user1.id);
  assert(user1Wallets.length === 2, 'User 1 memiliki 2 dompet');

  // Cross-user check: User 1 tries to fetch User 2's wallet
  const crossWallet = await WalletService.getWalletById(user1.id, wUser2.id);
  assert(crossWallet === null, 'Keamanan Ownership: User 1 tidak dapat mengakses dompet User 2');

  // -------------------------------------------------------------------------
  // TEST 5: Transactions (Income, Expense, Balance Updates)
  // -------------------------------------------------------------------------
  console.log('\n5. Testing Atomic Transactions & Balance Recalculation...');
  // Expense
  const expRes = await TransactionService.createTransaction(user1.id, {
    walletId: wBca.id,
    type: 'EXPENSE',
    amount: 500000,
    category: 'Makanan & Minuman',
    description: 'Belanja Restoran',
  });
  assert(Number(expRes.wallet.balance) === 4500000, 'Saldo berkurang Rp500.000 setelah EXPENSE (5.000.000 -> 4.500.000)');

  // Income
  const incRes = await TransactionService.createTransaction(user1.id, {
    walletId: wBca.id,
    type: 'INCOME',
    amount: 1500000,
    category: 'Bonus',
    description: 'Bonus Projek',
  });
  assert(Number(incRes.wallet.balance) === 6000000, 'Saldo bertambah Rp1.500.000 setelah INCOME (4.500.000 -> 6.000.000)');

  // -------------------------------------------------------------------------
  // TEST 6: Insufficient Balance Error Handling
  // -------------------------------------------------------------------------
  console.log('\n6. Testing Insufficient Balance Protection...');
  let failedAsExpected = false;
  try {
    await TransactionService.createTransaction(user1.id, {
      walletId: wGopay.id,
      type: 'EXPENSE',
      amount: 99999999, // exceeds GoPay balance of 1.000.000
      category: 'Belanja Mewah',
      description: 'Overdraft test',
    });
  } catch (e: any) {
    failedAsExpected = e.message.includes('Saldo dompet tidak mencukupi');
  }
  assert(failedAsExpected, 'Sistem menolak transaksi EXPENSE yang melebihi saldo dompet');

  // -------------------------------------------------------------------------
  // TEST 7: Inter-Wallet Atomic Transfer
  // -------------------------------------------------------------------------
  console.log('\n7. Testing Inter-Wallet Transfer...');
  const transferRes = await TransferService.transferBetweenWallets(user1.id, {
    fromWalletId: wBca.id,
    toWalletId: wGopay.id,
    amount: 1000000,
    note: 'Topup GoPay dari BCA',
  });

  assert(
    Number(transferRes.fromWallet.balance) === 5000000 &&
    Number(transferRes.toWallet.balance) === 2000000,
    'Transfer atomic sukses: BCA berkurang Rp1.000.000 dan GoPay bertambah Rp1.000.000'
  );

  // -------------------------------------------------------------------------
  // TEST 8: Budget Management & Health Status Computation
  // -------------------------------------------------------------------------
  console.log('\n8. Testing Budget Calculations & Status...');
  const now = new Date();
  const m = now.getMonth() + 1;
  const y = now.getFullYear();

  await BudgetService.createBudget(user1.id, {
    category: 'Makanan & Minuman',
    limitAmount: 1000000,
    month: m,
    year: y,
  });

  const budgets = await BudgetService.getBudgets(user1.id, m, y);
  const mknBudget = budgets.find((b) => b.category === 'Makanan & Minuman');

  assert(
    mknBudget !== undefined &&
    Number(mknBudget.usedAmount) === 500000 &&
    Number(mknBudget.remainingAmount) === 500000 &&
    mknBudget.percentage === 50 &&
    mknBudget.status === 'SAFE',
    'Anggaran menghitung usedAmount, remaining, percentage (50%), dan status SAFE secara otomatis'
  );

  // -------------------------------------------------------------------------
  // TEST 9: Goal Management & Atomic Goal Contribution
  // -------------------------------------------------------------------------
  console.log('\n9. Testing Goal Creation, Metrics & Contribution...');
  const deadline = new Date();
  deadline.setMonth(deadline.getMonth() + 5); // 5 months from now

  const goal = await GoalService.createGoal(user1.id, {
    name: 'Laptop M4 Pro',
    category: 'Elektronik',
    targetAmount: 20000000,
    currentAmount: 5000000,
    deadline,
    frequency: 'MONTHLY',
  });

  assert(
    Number(goal.remainingAmount) === 15000000 &&
    goal.progressPercentage === 25 &&
    Number(goal.recommendedMonthlySaving) > 0,
    'Target menghitung sisa dana (Rp15.000.000), progres (25%), dan rekomendasi bulanan'
  );

  // Add Contribution
  const contribRes = await GoalService.addGoalContribution(user1.id, goal.id, {
    sourceWalletId: wBca.id,
    amount: 1000000,
  });

  assert(
    Number(contribRes.goal.currentAmount) === 6000000 &&
    Number(contribRes.wallet.balance) === 4000000,
    'Setoran target atomic: Saldo BCA berkurang Rp1.000.000 dan saldo target bertambah menjadi Rp6.000.000 (30%)'
  );

  // -------------------------------------------------------------------------
  // TEST 10: Settings Service
  // -------------------------------------------------------------------------
  console.log('\n10. Testing Settings Service...');
  const updatedSettings = await SettingsService.updateUserSettings(user1.id, {
    currency: 'USD',
    animations: true,
  });
  assert(updatedSettings.currency === 'USD', 'Settings berhasil diperbarui');

  // -------------------------------------------------------------------------
  // CLEANUP
  // -------------------------------------------------------------------------
  await prisma.user.deleteMany({
    where: { email: { in: [testEmail1, testEmail2] } },
  });

  console.log('\n======================================================');
  console.log(`🏁 HASIL PENGUJIAN: ${passedCount} LULUS, ${failedCount} GAGAL`);
  console.log('======================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests()
  .catch((e) => {
    console.error('Fatal Test Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
