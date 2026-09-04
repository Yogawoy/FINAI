import assert from 'node:assert/strict';
import { prisma } from '../src/lib/db';
import { WalletService } from '../src/lib/services/wallet.service';
import { serializeWallet, serializeWallets } from '../src/lib/serializers/wallet';
import { registerUser } from '../src/lib/services/auth.service';

async function runTests() {
  console.log('🧪 Starting FinAI Phase 4 Wallet Test Suite...\n');
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

  const emailA = 'wallet_test_a@finai.local';
  const emailB = 'wallet_test_b@finai.local';

  await prisma.wallet.deleteMany({
    where: { user: { email: { in: [emailA, emailB] } } },
  });
  await prisma.user.deleteMany({
    where: { email: { in: [emailA, emailB] } },
  });

  const regA = await registerUser({ name: 'Wallet User A', email: emailA, password: 'password123' });
  const regB = await registerUser({ name: 'Wallet User B', email: emailB, password: 'password123' });
  const userAId = regA.data!.user.id;
  const userBId = regB.data!.user.id;

  let walletA1Id = '';

  try {
    await test('1. Create wallet valid for User A', async () => {
      const wallet = await WalletService.createWallet(userAId, {
        name: 'Dompet Utang',
        type: 'BANK',
        institution: 'BCA',
        accountLast4: '1234',
        balance: 500000,
      });
      assert.equal(wallet.userId, userAId);
      assert.equal(wallet.name, 'Dompet Utang');
      assert.equal(wallet.balance.toFixed(2), '500000.00');
      walletA1Id = wallet.id;
    });

    await test('2. Get wallets returns only user wallets', async () => {
      await WalletService.createWallet(userBId, {
        name: 'Dompet User B',
        type: 'CASH',
        balance: 100000,
      });

      const userAWallets = await WalletService.getWallets(userAId);
      const userBWallets = await WalletService.getWallets(userBId);

      assert.equal(userAWallets.length, 1);
      assert.equal(userAWallets[0].id, walletA1Id);
      assert.equal(userBWallets.length, 1);
      assert.notEqual(userBWallets[0].id, walletA1Id);
    });

    await test('3. Ownership isolation for getWalletById', async () => {
      const walletForA = await WalletService.getWalletById(userAId, walletA1Id);
      assert.ok(walletForA);

      const walletForB = await WalletService.getWalletById(userBId, walletA1Id);
      assert.equal(walletForB, null);
    });

    await test('4. Ownership isolation for updateWallet', async () => {
      const updated = await WalletService.updateWallet(userBId, walletA1Id, {
        name: 'Hacked Name',
      });
      assert.equal(updated, null);

      const fresh = await WalletService.getWalletById(userAId, walletA1Id);
      assert.equal(fresh?.name, 'Dompet Utang');
    });

    await test('5. Ownership isolation for deleteWallet', async () => {
      const deleted = await WalletService.deleteWallet(userBId, walletA1Id);
      assert.equal(deleted, null);

      const fresh = await WalletService.getWalletById(userAId, walletA1Id);
      assert.ok(fresh);
    });

        await test('6. Update wallet valid for owner', async () => {
      const updated = await WalletService.updateWallet(userAId, walletA1Id, {
        name: 'Dompet Utama Updated',
      });
      assert.ok(updated);
      assert.equal(updated.name, 'Dompet Utama Updated');
      assert.equal(updated.balance.toFixed(2), '500000.00');
    });

    await test('7. Decimal serialization for single & list', async () => {
      const wallet = await WalletService.getWalletById(userAId, walletA1Id);
      assert.ok(wallet);

      const serializedSingle = serializeWallet(wallet);
      assert.equal(typeof serializedSingle.balance, 'string');
      assert.equal(serializedSingle.balance, '500000.00');

      const wallets = await WalletService.getWallets(userAId);
      const serializedList = serializeWallets(wallets);
      assert.equal(serializedList.length, 1);
      assert.equal(typeof serializedList[0].balance, 'string');
      assert.equal(serializedList[0].balance, '500000.00');
    });

    await test('8. Delete wallet valid for owner', async () => {
      const deleted = await WalletService.deleteWallet(userAId, walletA1Id);
      assert.ok(deleted);

      const fresh = await WalletService.getWalletById(userAId, walletA1Id);
      assert.equal(fresh, null);
    });
  } finally {
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
    console.error('Fatal error in wallet tests:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
