
import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  const user = await prisma.user.findFirst({
    where: { email: 'demo@finai.local' },
    select: { id: true },
  });
  if (!user) {
    console.log('NO_DEMO_USER');
    return;
  }
  const [wallets, transactions, budgets, goals] = await Promise.all([
    prisma.wallet.findMany({ where: { userId: user.id }, select: { id: true, name: true, balance: true } }),
    prisma.transaction.findMany({ where: { userId: user.id }, select: { id: true, type: true, amount: true, category: true, description: true, transactionDate: true } }),
    prisma.budget.findMany({ where: { userId: user.id }, select: { id: true, category: true, limitAmount: true } }),
    prisma.goal.findMany({ where: { userId: user.id }, select: { id: true, name: true, targetAmount: true, currentAmount: true, deadline: true } }),
  ]);

  console.log('WALLETS=' + JSON.stringify(wallets, null, 2));
  console.log('TRANSACTIONS=' + JSON.stringify(transactions, null, 2));
  console.log('BUDGETS=' + JSON.stringify(budgets, null, 2));
  console.log('GOALS=' + JSON.stringify(goals, null, 2));
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('ERROR', e.message);
  process.exit(1);
});
