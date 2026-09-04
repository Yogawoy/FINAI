import assert from 'node:assert/strict';
import { prisma } from '../src/lib/db';
import { TransactionService } from '../src/lib/services/transaction.service';
import { WalletService } from '../src/lib/services/wallet.service';
import { serializeTransaction, serializeTransactions } from '../src/lib/serializers/transaction';
import { registerUser } from '../src/lib/services/auth.service';

async function runTests() {
  console.log('🧪 Starting FinAI Phase 5 Transaction Test Suite...\n');
  let passedCount = 0;
  let failedCount = 0;

  function logPass(name: string) {
    console.log(`  ✅ PASSED: ${name}`);
    passedCount++;
  }

  function logFail(name: string, error: unknown) {
    console.error(`  ❌ FAILED: ${name}`);
    console.error(error);
    failedCount++;
  }

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      logPass(name);
    } catch (error) {
      logFail(name, error);
    }
  }

  const emailA = `tx_test_a_${Date.now()}@finai.local`;
  const emailB = `tx_test_b_${Date.now()}@finai.local`;

  await prisma.transaction.deleteMany({
    where: { user: { email: { in: [emailA, emailB] } } },
  });
  await prisma.wallet.deleteMany({
    where: { user: { email: { in: [emailA, emailB] } } },
  });
  await prisma.user.deleteMany({
    where: { email: { in: [emailA, emailB] } },
  });

  const regA = await registerUser({ name: 'Tx User A', email: emailA, password: 'password123' });
  const regB = await registerUser({ name: 'Tx User B', email: emailB, password: 'password123' });
  const userAId = regA.data!.user.id;
  const userBId = regB.data!.user.id;

  let walletA1Id = '';
  let walletA2Id = '';
  let walletB1Id = '';
  let txIncomeId = '';
  let txExpenseId = '';

  try {
    const wA1 = await WalletService.createWallet(userAId, {
      name: 'Wallet A1',
      type: 'BANK',
      balance: 100000,
    });
    walletA1Id = wA1.id;

    const wA2 = await WalletService.createWallet(userAId, {
      name: 'Wallet A2',
      type: 'E_WALLET',
      balance: 50000,
    });
    walletA2Id = wA2.id;

    const wB1 = await WalletService.createWallet(userBId, {
      name: 'Wallet B1',
      type: 'CASH',
      balance: 20000,
    });
    walletB1Id = wB1.id;

    await test('1. Create INCOME transaction valid', async () => {
      const res = await TransactionService.createTransaction(userAId, {
        walletId: walletA1Id,
        type: 'INCOME',
        amount: 25000,
        category: 'Salary',
        description: 'Gaji freelance',
      });
      assert.equal(res.transaction.type, 'INCOME');
      assert.equal(res.transaction.amount.toFixed(2), '25000.00');
      txIncomeId = res.transaction.id;
    });

    await test('2. Create EXPENSE transaction valid', async () => {
      const res = await TransactionService.createTransaction(userAId, {
        walletId: walletA1Id,
        type: 'EXPENSE',
        amount: 10000,
        category: 'Food',
        description: 'Makan siang',
      });
      assert.equal(res.transaction.type, 'EXPENSE');
      assert.equal(res.transaction.amount.toFixed(2), '10000.00');
      txExpenseId = res.transaction.id;
    });

    await test('3. Wallet balance updated correctly for INCOME and EXPENSE', async () => {
      const walletA1 = await WalletService.getWalletById(userAId, walletA1Id);
      assert.equal(walletA1?.balance.toFixed(2), '115000.00');
    });

    await test('4. Insufficient balance for EXPENSE throws error', async () => {
      try {
        await TransactionService.createTransaction(userAId, {
          walletId: walletA2Id,
          type: 'EXPENSE',
          amount: 999999,
          category: 'Other',
          description: 'Too big',
        });
        assert.fail('Should fail on insufficient balance');
      } catch (err: unknown) {
        assert.match(String(err), /Saldo (wallet|dompet) tidak mencukupi/i);
      }
    });

    await test('5. Ownership isolation for getTransactionById', async () => {
      const txForA = await TransactionService.getTransactionById(userAId, txIncomeId);
      assert.ok(txForA);

      const txForB = await TransactionService.getTransactionById(userBId, txIncomeId);
      assert.equal(txForB, null);
    });

    await test('6. Update transaction amount updates balance', async () => {
      const updated = await TransactionService.updateTransaction(userAId, txExpenseId, {
        amount: 15000,
      });
      assert.equal(updated.amount.toFixed(2), '15000.00');

      const walletA1 = await WalletService.getWalletById(userAId, walletA1Id);
      assert.equal(walletA1?.balance.toFixed(2), '110000.00');
    });

    await test('7. Decimal serialization for transaction', async () => {
      const tx = await TransactionService.getTransactionById(userAId, txIncomeId);
      assert.ok(tx);

      const serializedSingle = serializeTransaction(tx);
      assert.equal(typeof serializedSingle.amount, 'string');
      assert.equal(serializedSingle.amount, '25000.00');

      const txList = await TransactionService.getTransactions(userAId, { limit: 10, offset: 0 });
      const serializedList = serializeTransactions(txList.transactions);
      assert.ok(serializedList.length >= 1);
      const found = serializedList.find((t) => t.id === txIncomeId);
      assert.ok(found);
      assert.equal(typeof found.amount, 'string');
      assert.equal(found.amount, '25000.00');
    });

    await test('8. Delete EXPENSE restores balance', async () => {
      await TransactionService.deleteTransaction(userAId, txExpenseId);
      const walletA1 = await WalletService.getWalletById(userAId, walletA1Id);
      assert.equal(walletA1?.balance.toFixed(2), '125000.00');
    });
  } finally {
    await prisma.transaction.deleteMany({
      where: { user: { email: { in: [emailA, emailB] } } },
    });
    await prisma.wallet.deleteMany({
      where: { user: { email: { in: [emailA, emailB] } } },
    });
    await prisma.user.deleteMany({
      where: { email: { in: [emailA, emailB] } },
    });
  }

  console.log('\n==================================================');
  console.log(`Test Results: ${passedCount} Passed, ${failedCount} Failed`);
  console.log('==================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests()
  .catch((err) => {
    console.error('Fatal error in transaction tests:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

