import assert from 'node:assert/strict';
import { prisma } from '../src/lib/db';
import { GoalService } from '../src/lib/services/goal.service';
import { WalletService } from '../src/lib/services/wallet.service';
import { registerUser } from '../src/lib/services/auth.service';

async function runTests() {
  console.log('🧪 Starting FinAI Phase 7 Goal Contribution Test Suite...\n');
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

  const emailA = `contrib_test_a_${Date.now()}@finai.local`;
  const emailB = `contrib_test_b_${Date.now()}@finai.local`;

  await prisma.goalContribution.deleteMany({
    where: {
      OR: [
        { goal: { user: { email: { in: [emailA, emailB] } } } },
        { sourceWallet: { user: { email: { in: [emailA, emailB] } } } },
      ],
    },
  });
  await prisma.goal.deleteMany({
    where: { user: { email: { in: [emailA, emailB] } } },
  });
  await prisma.wallet.deleteMany({
    where: { user: { email: { in: [emailA, emailB] } } },
  });
  await prisma.user.deleteMany({
    where: { email: { in: [emailA, emailB] } },
  });

  const regA = await registerUser({ name: 'Contrib User A', email: emailA, password: 'password123' });
  const regB = await registerUser({ name: 'Contrib User B', email: emailB, password: 'password123' });
  const userAId = regA.data!.user.id;
  const userBId = regB.data!.user.id;

  let walletA1Id = '';
  let walletB1Id = '';
  let goalA1Id = '';
  let goalB1Id = '';

  try {
    const wA1 = await WalletService.createWallet(userAId, {
      name: 'BCA Tabungan',
      type: 'BANK',
      balance: 5000000,
    });
    walletA1Id = wA1.id;

    const wB1 = await WalletService.createWallet(userBId, {
      name: 'Mandiri User B',
      type: 'BANK',
      balance: 2000000,
    });
    walletB1Id = wB1.id;

    const deadline = new Date(Date.now() + 86400000 * 180).toISOString();

    const gA1 = await GoalService.createGoal(userAId, {
      name: 'Nabung Laptop',
      category: 'Gadget',
      targetAmount: 10000000,
      deadline,
      sourceWalletId: walletA1Id,
      frequency: 'MONTHLY',
    });
    goalA1Id = gA1.id;

    const gB1 = await GoalService.createGoal(userBId, {
      name: 'Nabung Liburan User B',
      category: 'Travel',
      targetAmount: 5000000,
      deadline,
      frequency: 'MONTHLY',
    });
    goalB1Id = gB1.id;

    await test('1. Contribution valid', async () => {
      const res = await GoalService.addGoalContribution(userAId, goalA1Id, {
        sourceWalletId: walletA1Id,
        amount: 500000,
      });
      assert.ok(res.contribution);
      assert.equal(res.goal.currentAmount.toFixed(2), '500000.00');
    });

    await test('2. Wallet balance berkurang', async () => {
      const wallet = await WalletService.getWalletById(userAId, walletA1Id);
      assert.equal(wallet?.balance.toFixed(2), '4500000.00');
    });

    await test('3. Goal current amount bertambah', async () => {
      const goal = await GoalService.getGoalById(userAId, goalA1Id);
      assert.equal(goal?.currentAmount.toFixed(2), '500000.00');
    });

    await test('4. Goal ownership isolation check', async () => {
      try {
        await GoalService.addGoalContribution(userBId, goalA1Id, {
          sourceWalletId: walletB1Id,
          amount: 100000,
        });
        assert.fail('Should reject goal not owned');
      } catch (err: unknown) {
        assert.match(String(err), /Target impian tidak ditemukan/);
      }
    });

    await test('5. Wallet ownership isolation check', async () => {
      try {
        await GoalService.addGoalContribution(userAId, goalA1Id, {
          sourceWalletId: walletB1Id,
          amount: 100000,
        });
        assert.fail('Should reject wallet not owned');
      } catch (err: unknown) {
        assert.match(String(err), /Dompet sumber tidak ditemukan/);
      }
    });

    await test('6. Cross-user wallet rejected', async () => {
      try {
        await GoalService.addGoalContribution(userBId, goalB1Id, {
          sourceWalletId: walletA1Id,
          amount: 100000,
        });
        assert.fail('Should reject');
      } catch (err: unknown) {
        assert.match(String(err), /Dompet sumber tidak ditemukan/);
      }
    });

    await test('7. Cross-user goal rejected', async () => {
      try {
        await GoalService.addGoalContribution(userAId, goalB1Id, {
          sourceWalletId: walletA1Id,
          amount: 100000,
        });
        assert.fail('Should reject');
      } catch (err: unknown) {
        assert.match(String(err), /Target impian tidak ditemukan/);
      }
    });

    await test('8. Zero amount rejected', async () => {
      try {
        await GoalService.addGoalContribution(userAId, goalA1Id, {
          sourceWalletId: walletA1Id,
          amount: 0,
        });
        assert.fail('Should reject zero amount');
      } catch (err: unknown) {
        assert.match(String(err), /lebih besar dari 0/);
      }
    });

    await test('9. Negative amount rejected', async () => {
      try {
        await GoalService.addGoalContribution(userAId, goalA1Id, {
          sourceWalletId: walletA1Id,
          amount: -50000,
        });
        assert.fail('Should reject negative amount');
      } catch (err: unknown) {
        assert.match(String(err), /lebih besar dari 0/);
      }
    });

    await test('10. Insufficient balance rejected', async () => {
      // Create fresh goal with high target so balance check fails before overfunding check
      const largeGoal = await GoalService.createGoal(userAId, {
        name: 'Large Target',
        category: 'Test',
        targetAmount: 999999999,
        deadline,
        frequency: 'MONTHLY',
      });
      try {
        await GoalService.addGoalContribution(userAId, largeGoal.id, {
          sourceWalletId: walletA1Id,
          amount: 99999999,
        });
        assert.fail('Should reject insufficient balance');
      } catch (err: unknown) {
        assert.match(String(err), /tidak mencukupi/);
      }
    });

    await test('11. Decimal calculation correctness', async () => {
      const res = await GoalService.addGoalContribution(userAId, goalA1Id, {
        sourceWalletId: walletA1Id,
        amount: 250000.50,
      });
      assert.equal(res.wallet.balance.toFixed(2), '4249999.50');
      assert.equal(res.goal.currentAmount.toFixed(2), '750000.50');
    });

    await test('12. Atomic rollback on failure', async () => {
      const beforeWallet = await WalletService.getWalletById(userAId, walletA1Id);
      const beforeGoal = await GoalService.getGoalById(userAId, goalA1Id);

      try {
        await GoalService.addGoalContribution(userAId, goalA1Id, {
          sourceWalletId: walletA1Id,
          amount: 99999999,
        });
      } catch {
        // Expected
      }

      const afterWallet = await WalletService.getWalletById(userAId, walletA1Id);
      const afterGoal = await GoalService.getGoalById(userAId, goalA1Id);

      assert.equal(beforeWallet?.balance.toFixed(2), afterWallet?.balance.toFixed(2));
      assert.equal(beforeGoal?.currentAmount.toFixed(2), afterGoal?.currentAmount.toFixed(2));
    });

    await test('13. Contribution tidak dihitung sebagai expense transaction', async () => {
      const txCount = await prisma.transaction.count({
        where: { userId: userAId },
      });
      assert.equal(txCount, 0);
    });

    await test('14. Goal progress updated correctly', async () => {
      const goal = await GoalService.getGoalById(userAId, goalA1Id);
      assert.ok(goal);
      assert.equal(goal.progressPercentage, 8); // 750000.50 / 10000000.00 * 100 ~ 7.5% -> round 8%
      assert.equal(goal.remainingAmount.toFixed(2), '9249999.50');
    });

    await test('15. Contribution exact equal to remaining target -> PASS', async () => {
      // Top up wallet balance to have enough funds
      await prisma.wallet.update({
        where: { id: walletA1Id },
        data: { balance: new (require('@prisma/client').Prisma.Decimal)(15000000) },
      });

      const goalBefore = await GoalService.getGoalById(userAId, goalA1Id);
      const remainingBefore = 10000000 - Number(goalBefore?.currentAmount);
      const res = await GoalService.addGoalContribution(userAId, goalA1Id, {
        sourceWalletId: walletA1Id,
        amount: remainingBefore,
      });
      assert.equal(res.goal.currentAmount.toFixed(2), '10000000.00');
      assert.equal(res.goal.progressPercentage, 100);
      assert.equal(res.goal.remainingAmount.toFixed(2), '0.00');
    });

    await test('16. Contribution exceeding remaining target -> REJECT without mutating state', async () => {
      const walletBefore = await WalletService.getWalletById(userAId, walletA1Id);
      const goalBefore = await GoalService.getGoalById(userAId, goalA1Id);

      try {
        await GoalService.addGoalContribution(userAId, goalA1Id, {
          sourceWalletId: walletA1Id,
          amount: 1,
        });
        assert.fail('Should reject contribution when goal is fully funded');
      } catch (err: unknown) {
        assert.match(String(err), /exceeds remaining goal amount/i);
      }

      const walletAfter = await WalletService.getWalletById(userAId, walletA1Id);
      const goalAfter = await GoalService.getGoalById(userAId, goalA1Id);

      assert.equal(walletBefore?.balance.toFixed(2), walletAfter?.balance.toFixed(2));
      assert.equal(goalBefore?.currentAmount.toFixed(2), goalAfter?.currentAmount.toFixed(2));
    });
  } finally {
    await prisma.goalContribution.deleteMany({
      where: {
        OR: [
          { goal: { user: { email: { in: [emailA, emailB] } } } },
          { sourceWallet: { user: { email: { in: [emailA, emailB] } } } },
        ],
      },
    });
    await prisma.goal.deleteMany({
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
    console.error('Fatal error in goal contribution tests:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
