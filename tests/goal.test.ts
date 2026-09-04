import assert from 'node:assert/strict';
import { prisma } from '../src/lib/db';
import { GoalService } from '../src/lib/services/goal.service';
import { WalletService } from '../src/lib/services/wallet.service';
import { serializeGoal, serializeGoals } from '../src/lib/serializers/goal';
import { registerUser } from '../src/lib/services/auth.service';

async function runTests() {
  console.log('🧪 Starting FinAI Phase 6 Goal Test Suite...\n');
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

  const emailA = `goal_test_a_${Date.now()}@finai.local`;
  const emailB = `goal_test_b_${Date.now()}@finai.local`;

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

  const regA = await registerUser({ name: 'Goal User A', email: emailA, password: 'password123' });
  const regB = await registerUser({ name: 'Goal User B', email: emailB, password: 'password123' });
  const userAId = regA.data!.user.id;
  const userBId = regB.data!.user.id;

  let walletA1Id = '';
  let walletB1Id = '';
  let goalA1Id = '';

  try {
    const walletA1 = await WalletService.createWallet(userAId, {
      name: 'BCA Tabungan',
      type: 'BANK',
      balance: 1000000,
    });
    walletA1Id = walletA1.id;

    const walletB1 = await WalletService.createWallet(userBId, {
      name: 'Mandiri User B',
      type: 'BANK',
      balance: 500000,
    });
    walletB1Id = walletB1.id;

    await test('1. GET authenticated / service getGoals', async () => {
      const goals = await GoalService.getGoals(userAId);
      assert.ok(Array.isArray(goals));
      assert.equal(goals.length, 0);
    });

    await test('2. POST valid goal', async () => {
      const deadline = new Date(Date.now() + 86400000 * 90).toISOString();
      const goal = await GoalService.createGoal(userAId, {
        name: 'Nabung Dana Darurat',
        category: 'Emergency',
        targetAmount: 5000000,
        deadline,
        sourceWalletId: walletA1Id,
        frequency: 'MONTHLY',
      });
      assert.equal(goal.userId, userAId);
      assert.equal(goal.name, 'Nabung Dana Darurat');
      assert.equal(goal.targetAmount.toFixed(2), '5000000.00');
      assert.equal(goal.currentAmount.toFixed(2), '0.00');
      assert.equal(goal.sourceWalletId, walletA1Id);
      goalA1Id = goal.id;
    });

    await test('3. GET ownership isolation', async () => {
      const goalUserA = await GoalService.getGoalById(userAId, goalA1Id);
      assert.ok(goalUserA);

      const goalUserB = await GoalService.getGoalById(userBId, goalA1Id);
      assert.equal(goalUserB, null);
    });

    await test('4. POST invalid targetAmount (<= 0)', async () => {
      try {
        await GoalService.createGoal(userAId, {
          category: 'Emergency',
          name: 'Invalid Target',
          targetAmount: 0,
          deadline: new Date().toISOString(),
          frequency: 'MONTHLY',
        });
        assert.fail('Should fail on non-positive targetAmount');
      } catch (err: unknown) {
        assert.ok(err);
      }
    });

    await test('5. PATCH valid goal for owner', async () => {
      const updated = await GoalService.updateGoal(userAId, goalA1Id, {
        name: 'Dana Darurat 2.0',
        targetAmount: 6000000,
      });
      assert.ok(updated);
      assert.equal(updated.name, 'Dana Darurat 2.0');
      assert.equal(updated.targetAmount.toFixed(2), '6000000.00');
    });

    await test('6. PATCH cross-user access -> returns null', async () => {
      const updated = await GoalService.updateGoal(userBId, goalA1Id, {
        name: 'Hacked Goal Name',
      });
      assert.equal(updated, null);

      const fresh = await GoalService.getGoalById(userAId, goalA1Id);
      assert.equal(fresh?.name, 'Dana Darurat 2.0');
    });

    await test('7. Decimal serialization', async () => {
      const goal = await GoalService.getGoalById(userAId, goalA1Id);
      assert.ok(goal);

      const serializedSingle = serializeGoal(goal);
      assert.equal(typeof serializedSingle.targetAmount, 'string');
      assert.equal(serializedSingle.targetAmount, '6000000.00');
      assert.equal(typeof serializedSingle.currentAmount, 'string');
      assert.equal(serializedSingle.currentAmount, '0.00');

      const goals = await GoalService.getGoals(userAId);
      const serializedList = serializeGoals(goals);
      assert.ok(serializedList.length >= 1);
      const found = serializedList.find((g) => g.id === goalA1Id);
      assert.ok(found);
      assert.equal(typeof found.targetAmount, 'string');
      assert.equal(found.targetAmount, '6000000.00');
    });

    await test('8. Wallet relation validation check', async () => {
      const goal = await GoalService.getGoalById(userAId, goalA1Id);
      assert.equal(goal?.sourceWalletId, walletA1Id);
      assert.notEqual(goal?.sourceWalletId, walletB1Id);
    });

    await test('9. DELETE cross-user -> failed', async () => {
      const deleted = await GoalService.deleteGoal(userBId, goalA1Id);
      assert.equal(deleted, null);

      const fresh = await GoalService.getGoalById(userAId, goalA1Id);
      assert.ok(fresh);
    });

    await test('10. DELETE valid for owner', async () => {
      const deleted = await GoalService.deleteGoal(userAId, goalA1Id);
      assert.ok(deleted);

      const fresh = await GoalService.getGoalById(userAId, goalA1Id);
      assert.equal(fresh, null);
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
    console.error('Fatal error in goal tests:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
