
import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  const user = await prisma.user.findFirst({
    where: { email: 'demo@finai.local' },
    select: { id: true, name: true, email: true },
  });
  if (!user) {
    console.log('NO_DEMO_USER');
    return;
  }

  const [wallets, transactions, budgets, goals, contributions] = await Promise.all([
    prisma.wallet.count({ where: { userId: user.id } }),
    prisma.transaction.count({ where: { userId: user.id } }),
    prisma.budget.count({ where: { userId: user.id } }),
    prisma.goal.count({ where: { userId: user.id } }),
    prisma.goalContribution.count({ where: { goal: { userId: user.id } } }),
  ]);

  console.log(JSON.stringify({
    user: { id: user.id, name: user.name, email: user.email },
    wallets,
    transactions,
    budgets,
    goals,
    contributions,
  }));
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('ERROR', e.message);
  process.exit(1);
});
