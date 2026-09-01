import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai proses seeding data development FinAI...');

  // 1. Strategi idempotent: Bersihkan data demo sebelumnya
  const demoEmail = 'demo@finai.local';
  await prisma.user.deleteMany({
    where: { email: demoEmail },
  });

  // 2. Buat Demo User dengan password hash
  const passwordHash = await bcrypt.hash('password123', 12);
  const user = await prisma.user.create({
    data: {
      name: 'Demo User',
      email: demoEmail,
      passwordHash,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      settings: {
        create: {
          language: 'id-ID',
          currency: 'IDR',
          numberFormat: 'id-ID',
          budgetReminder: true,
          goalReminder: true,
          financialSummary: true,
          aiPersonalization: true,
          aiActionConfirmation: true,
          animations: true,
        },
      },
    },
  });

  console.log(`👤 User dibuat: ${user.name} (${user.email})`);

  // 3. Buat 3 Dompet Utama (BCA: Rp12.500.000, GoPay: Rp750.000, Cash: Rp500.000)
  const bca = await prisma.wallet.create({
    data: {
      userId: user.id,
      name: 'BCA Utama',
      type: 'BANK',
      institution: 'BCA',
      accountLast4: '4821',
      balance: new Prisma.Decimal(12500000),
    },
  });

  const gopay = await prisma.wallet.create({
    data: {
      userId: user.id,
      name: 'GoPay',
      type: 'E_WALLET',
      institution: 'GoTo Financial',
      accountLast4: '0812',
      balance: new Prisma.Decimal(750000),
    },
  });

  const cash = await prisma.wallet.create({
    data: {
      userId: user.id,
      name: 'Cash',
      type: 'CASH',
      institution: null,
      accountLast4: null,
      balance: new Prisma.Decimal(500000),
    },
  });

  console.log('💳 3 Dompet berhasil dibuat (BCA: Rp12.500.000, GoPay: Rp750.000, Cash: Rp500.000)');

  // 4. Buat Transaksi (Pemasukan & Pengeluaran)
  await prisma.transaction.createMany({
    data: [
      {
        userId: user.id,
        walletId: bca.id,
        type: 'INCOME',
        amount: new Prisma.Decimal(15000000),
        category: 'Gaji & Pendapatan',
        description: 'Gaji Bulanan Software Engineer',
        transactionDate: new Date('2026-09-01T08:00:00Z'),
      },
      {
        userId: user.id,
        walletId: gopay.id,
        type: 'EXPENSE',
        amount: new Prisma.Decimal(45000),
        category: 'Makanan',
        description: 'Makan Siang Nasi Padang',
        transactionDate: new Date('2026-09-01T12:30:00Z'),
      },
      {
        userId: user.id,
        walletId: gopay.id,
        type: 'EXPENSE',
        amount: new Prisma.Decimal(28000),
        category: 'Transportasi',
        description: 'Transportasi Ojek Online ke Kantor',
        transactionDate: new Date('2026-09-01T07:45:00Z'),
      },
      {
        userId: user.id,
        walletId: cash.id,
        type: 'EXPENSE',
        amount: new Prisma.Decimal(50000),
        category: 'Hiburan',
        description: 'Nonton Bioskop Akhir Pekan',
        transactionDate: new Date('2026-09-01T19:00:00Z'),
      },
    ],
  });

  console.log('📝 Transaksi pemasukan & pengeluaran berhasil dimasukkan');

  // 5. Buat Pos Anggaran (Makanan, Transportasi, Hiburan)
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  await prisma.budget.createMany({
    data: [
      {
        userId: user.id,
        category: 'Makanan',
        limitAmount: new Prisma.Decimal(3000000),
        month: currentMonth,
        year: currentYear,
      },
      {
        userId: user.id,
        category: 'Transportasi',
        limitAmount: new Prisma.Decimal(1000000),
        month: currentMonth,
        year: currentYear,
      },
      {
        userId: user.id,
        category: 'Hiburan',
        limitAmount: new Prisma.Decimal(1500000),
        month: currentMonth,
        year: currentYear,
      },
    ],
  });

  console.log('📊 Pos Anggaran (Makanan, Transportasi, Hiburan) berhasil disiapkan');

  // 6. Buat 2 Target Impian (Goals: Laptop Baru & Kuliah)
  const laptopDeadline = new Date();
  laptopDeadline.setMonth(laptopDeadline.getMonth() + 4);

  const kuliahDeadline = new Date();
  kuliahDeadline.setFullYear(kuliahDeadline.getFullYear() + 1);

  const laptopGoal = await prisma.goal.create({
    data: {
      userId: user.id,
      name: 'Laptop Baru',
      category: 'Teknologi & Kerja',
      targetAmount: new Prisma.Decimal(12000000),
      currentAmount: new Prisma.Decimal(3500000),
      deadline: laptopDeadline,
      sourceWalletId: bca.id,
      destinationWalletId: bca.id,
      frequency: 'MONTHLY',
    },
  });

  const kuliahGoal = await prisma.goal.create({
    data: {
      userId: user.id,
      name: 'Kuliah',
      category: 'Pendidikan',
      targetAmount: new Prisma.Decimal(25000000),
      currentAmount: new Prisma.Decimal(8000000),
      deadline: kuliahDeadline,
      sourceWalletId: bca.id,
      destinationWalletId: bca.id,
      frequency: 'MONTHLY',
    },
  });

  // Catat riwayat setoran contoh
  await prisma.goalContribution.create({
    data: {
      goalId: laptopGoal.id,
      sourceWalletId: bca.id,
      amount: new Prisma.Decimal(500000),
      contributionDate: new Date('2026-08-25T10:00:00Z'),
    },
  });

  console.log(`🎯 2 Target Impian dibuat: ${laptopGoal.name} & ${kuliahGoal.name}`);
  console.log('✅ Seeding FinAI FASE 2 selesai secara sukses!');
}

main()
  .catch((e) => {
    console.error('❌ Gagal melakukan seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
