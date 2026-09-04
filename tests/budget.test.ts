import assert from 'node:assert/strict';
import { prisma } from '../src/lib/db';
import { BudgetService } from '../src/lib/services/budget.service';
import { serializeBudget, serializeBudgets } from '../src/lib/serializers/budget';
import { registerUser } from '../src/lib/services/auth.service';

async function runTests() {
  console.log('🧪 Starting FinAI Phase 6 Budget Test Suite...\n');
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

  const emailA = `budget_test_a_${Date.now()}@finai.local`;
  const emailB = `budget_test_b_${Date.now()}@finai.local`;

  await prisma.budget.deleteMany({
    where: { user: { email: { in: [emailA, emailB] } } },
  });
  await prisma.user.deleteMany({
    where: { email: { in: [emailA, emailB] } },
  });

  const regA = await registerUser({ name: 'Budget User A', email: emailA, password: 'password123' });
  const regB = await registerUser({ name: 'Budget User B', email: emailB, password: 'password123' });
  const userAId = regA.data!.user.id;
  const userBId = regB.data!.user.id;

  let budgetA1Id = '';

  try {
    await test('1. GET authenticated / service getBudgets', async () => {
      const budgets = await BudgetService.getBudgets(userAId, 5, 2025);
      assert.ok(Array.isArray(budgets));
      assert.equal(budgets.length, 0);
    });

    await test('2. POST valid budget', async () => {
      const budget = await BudgetService.createBudget(userAId, {
        category: 'Food & Beverage',
        limitAmount: 1500000,
        month: 5,
        year: 2025,
      });
      assert.equal(budget.userId, userAId);
      assert.equal(budget.category, 'Food & Beverage');
      assert.equal(budget.limitAmount.toFixed(2), '1500000.00');
      budgetA1Id = budget.id;
    });

    await test('3. GET ownership isolation', async () => {
      const budgetUserA = await BudgetService.getBudgetById(userAId, budgetA1Id);
      assert.ok(budgetUserA);

      const budgetUserB = await BudgetService.getBudgetById(userBId, budgetA1Id);
      assert.equal(budgetUserB, null);
    });

    await test('4. POST invalid amount (<= 0)', async () => {
      try {
        await BudgetService.createBudget(userAId, {
          category: 'Transport',
          limitAmount: 0,
          month: 5,
          year: 2025,
        });
        assert.fail('Should fail on non-positive limitAmount');
      } catch (err: unknown) {
        assert.ok(err);
      }
    });

    await test('5. POST duplicate budget category in same period -> conflict', async () => {
      try {
        await BudgetService.createBudget(userAId, {
          category: 'Food & Beverage',
          limitAmount: 2000000,
          month: 5,
          year: 2025,
        });
        assert.fail('Should fail on duplicate category & period');
      } catch (err: unknown) {
        assert.match(String(err), /sudah dibuat/);
      }
    });

    await test('6. PATCH valid budget for owner', async () => {
      const updated = await BudgetService.updateBudget(userAId, budgetA1Id, {
        limitAmount: 2000000,
      });
      assert.ok(updated);
      assert.equal(updated.limitAmount.toFixed(2), '2000000.00');
    });

    await test('7. PATCH cross-user access -> returns null', async () => {
      try {
        const updated = await BudgetService.updateBudget(userBId, budgetA1Id, {
          limitAmount: 3000000,
        });
        assert.equal(updated, null);
      } catch (err: unknown) {
        assert.match(String(err), /BudgetNotFoundError/);
      }

      const fresh = await BudgetService.getBudgetById(userAId, budgetA1Id);
      assert.equal(fresh?.limitAmount.toFixed(2), '2000000.00');
    });

    await test('8. Decimal serialization', async () => {
      const budget = await BudgetService.getBudgetById(userAId, budgetA1Id);
      assert.ok(budget);

      const serializedSingle = serializeBudget(budget);
      assert.equal(typeof serializedSingle.limitAmount, 'string');
      assert.equal(serializedSingle.limitAmount, '2000000.00');

      const budgets = await BudgetService.getBudgets(userAId, 5, 2025);
      const serializedList = serializeBudgets(budgets);
      assert.ok(serializedList.length >= 1);
      const found = serializedList.find((b) => b.id === budgetA1Id);
      assert.ok(found);
      assert.equal(typeof found.limitAmount, 'string');
      assert.equal(found.limitAmount, '2000000.00');
    });

    await test('9. DELETE cross-user -> failed', async () => {
      try {
        const deleted = await BudgetService.deleteBudget(userBId, budgetA1Id);
        assert.equal(deleted, null);
      } catch (err: unknown) {
        assert.match(String(err), /BudgetNotFoundError/);
      }

      const fresh = await BudgetService.getBudgetById(userAId, budgetA1Id);
      assert.ok(fresh);
    });

    await test('10. DELETE valid for owner', async () => {
      const deleted = await BudgetService.deleteBudget(userAId, budgetA1Id);
      assert.ok(deleted);

      const fresh = await BudgetService.getBudgetById(userAId, budgetA1Id);
      assert.equal(fresh, null);
    });
  } finally {
    await prisma.budget.deleteMany({
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
    console.error('Fatal error in budget tests:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
