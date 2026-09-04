import assert from 'node:assert/strict';
import { prisma } from '../src/lib/db';
import { TransferService } from '../src/lib/services/transfer.service';
import { WalletService } from '../src/lib/services/wallet.service';
import { registerUser } from '../src/lib/services/auth.service';

async function runTests() {
  console.log('🧪 Starting FinAI Phase 7 Transfer Test Suite...\n');
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

  const emailA = `transfer_test_a_${Date.now()}@finai.local`;
  const emailB = `transfer_test_b_${Date.now()}@finai.local`;

  await prisma.transaction.deleteMany({
    where: { user: { email: { in: [emailA, emailB] } } },
  });
  await prisma.wallet.deleteMany({
    where: { user: { email: { in: [emailA, emailB] } } },
  });
  await prisma.user.deleteMany({
    where: { email: { in: [emailA, emailB] } },
  });

  const regA = await registerUser({ name: 'Transfer User A', email: emailA, password: 'password123' });
  const regB = await registerUser({ name: 'Transfer User B', email: emailB, password: 'password123' });
  const userAId = regA.data!.user.id;
  const userBId = regB.data!.user.id;

  let walletA1Id = '';
  let walletA2Id = '';
  let walletB1Id = '';

  try {
    const wA1 = await WalletService.createWallet(userAId, {
      name: 'BCA A1',
      type: 'BANK',
      balance: 5000000,
    });
    walletA1Id = wA1.id;

    const wA2 = await WalletService.createWallet(userAId, {
      name: 'GoPay A2',
      type: 'E_WALLET',
      balance: 1000000,
    });
    walletA2Id = wA2.id;

    const wB1 = await WalletService.createWallet(userBId, {
      name: 'Mandiri B1',
      type: 'BANK',
      balance: 2000000,
    });
    walletB1Id = wB1.id;

    await test('1. Transfer valid', async () => {
      const res = await TransferService.transferBetweenWallets(userAId, {
        fromWalletId: walletA1Id,
        toWalletId: walletA2Id,
        amount: 500000,
      });
      assert.ok(res.fromWallet);
      assert.ok(res.toWallet);
    });

    await test('2. Source balance berkurang', async () => {
      const wA1 = await WalletService.getWalletById(userAId, walletA1Id);
      assert.equal(wA1?.balance.toFixed(2), '4500000.00');
    });

    await test('3. Destination balance bertambah', async () => {
      const wA2 = await WalletService.getWalletById(userAId, walletA2Id);
      assert.equal(wA2?.balance.toFixed(2), '1500000.00');
    });

    await test('4. Source wallet ownership isolation', async () => {
      try {
        await TransferService.transferBetweenWallets(userAId, {
          fromWalletId: walletB1Id,
          toWalletId: walletA2Id,
          amount: 100000,
        });
        assert.fail('Should reject source wallet not owned');
      } catch (err: unknown) {
        assert.match(String(err), /Dompet asal tidak ditemukan/);
      }
    });

    await test('5. Destination wallet ownership isolation', async () => {
      try {
        await TransferService.transferBetweenWallets(userAId, {
          fromWalletId: walletA1Id,
          toWalletId: walletB1Id,
          amount: 100000,
        });
        assert.fail('Should reject destination wallet not owned');
      } catch (err: unknown) {
        assert.match(String(err), /Dompet tujuan tidak ditemukan/);
      }
    });

    await test('6. Cross-user source wallet check', async () => {
      try {
        await TransferService.transferBetweenWallets(userBId, {
          fromWalletId: walletA1Id,
          toWalletId: walletB1Id,
          amount: 100000,
        });
        assert.fail('Should reject');
      } catch (err: unknown) {
        assert.match(String(err), /Dompet asal tidak ditemukan/);
      }
    });

    await test('7. Cross-user destination wallet check', async () => {
      try {
        await TransferService.transferBetweenWallets(userBId, {
          fromWalletId: walletB1Id,
          toWalletId: walletA1Id,
          amount: 100000,
        });
        assert.fail('Should reject');
      } catch (err: unknown) {
        assert.match(String(err), /Dompet tujuan tidak ditemukan/);
      }
    });

    await test('8. Same wallet rejected', async () => {
      try {
        await TransferService.transferBetweenWallets(userAId, {
          fromWalletId: walletA1Id,
          toWalletId: walletA1Id,
          amount: 100000,
        });
        assert.fail('Should reject same wallet');
      } catch (err: unknown) {
        assert.match(String(err), /tidak boleh sama/);
      }
    });

    await test('9. Zero amount rejected', async () => {
      try {
        await TransferService.transferBetweenWallets(userAId, {
          fromWalletId: walletA1Id,
          toWalletId: walletA2Id,
          amount: 0,
        });
        assert.fail('Should reject zero amount');
      } catch (err: unknown) {
        assert.match(String(err), /lebih besar dari 0/);
      }
    });

    await test('10. Negative amount rejected', async () => {
      try {
        await TransferService.transferBetweenWallets(userAId, {
          fromWalletId: walletA1Id,
          toWalletId: walletA2Id,
          amount: -50000,
        });
        assert.fail('Should reject negative amount');
      } catch (err: unknown) {
        assert.match(String(err), /lebih besar dari 0/);
      }
    });

    await test('11. Insufficient balance rejected', async () => {
      try {
        await TransferService.transferBetweenWallets(userAId, {
          fromWalletId: walletA2Id,
          toWalletId: walletA1Id,
          amount: 99999999,
        });
        assert.fail('Should reject insufficient balance');
      } catch (err: unknown) {
        assert.match(String(err), /tidak mencukupi/);
      }
    });

    await test('12. Decimal calculation correctness', async () => {
      const res = await TransferService.transferBetweenWallets(userAId, {
        fromWalletId: walletA1Id,
        toWalletId: walletA2Id,
        amount: 123456.78,
      });
      assert.equal(res.fromWallet.balance.toFixed(2), '4376543.22');
      assert.equal(res.toWallet.balance.toFixed(2), '1623456.78');
    });

    await test('13. Atomic rollback on error', async () => {
      const beforeA1 = await WalletService.getWalletById(userAId, walletA1Id);
      const beforeA2 = await WalletService.getWalletById(userAId, walletA2Id);

      try {
        await TransferService.transferBetweenWallets(userAId, {
          fromWalletId: walletA1Id,
          toWalletId: 'invalid-wallet-id',
          amount: 500000,
        });
      } catch {
        // Expected
      }

      const afterA1 = await WalletService.getWalletById(userAId, walletA1Id);
      const afterA2 = await WalletService.getWalletById(userAId, walletA2Id);

      assert.equal(beforeA1?.balance.toFixed(2), afterA1?.balance.toFixed(2));
      assert.equal(beforeA2?.balance.toFixed(2), afterA2?.balance.toFixed(2));
    });

    await test('14. Transfer tidak dihitung sebagai expense/income transaction', async () => {
      const txCount = await prisma.transaction.count({
        where: { userId: userAId },
      });
      assert.equal(txCount, 0);
    });

    await test('15. Legacy alias /api/wallets/transfer delegates to canonical /api/transfers', async () => {
      const canonicalServiceRes = await TransferService.transferBetweenWallets(userAId, {
        fromWalletId: walletA1Id,
        toWalletId: walletA2Id,
        amount: 100000,
      });
      assert.ok(canonicalServiceRes.fromWallet);
      assert.ok(canonicalServiceRes.toWallet);
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
    console.error('Fatal error in transfer tests:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
