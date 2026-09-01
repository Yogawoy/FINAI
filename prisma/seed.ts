import { PrismaClient, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai proses seeding data awal FinAI...');

  // 1. Bersihkan data demo sebelumnya jika ada
  const demoEmail = 'yoga@finai.design';
  await prisma.user.deleteMany({
    where: { email: demoEmail },
  });

  // 2. Buat Demo User
  const passwordHash = await bcrypt.hash('password123', 12);
  const user = await prisma.user.create({
    data: {
      name: 'Yoga W.',
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

  // 3. Buat 3 Dompet Utama (BCA, GoPay, Cash)
  const bca = await prisma.wallet.create({
    data: {
      userId: user.id,
      name: 'BCA Utama',
      type: 'BANK',
      institution: 'Bank Central Asia',
      accountLast4: '4821',
      balance: new Prisma.Decimal(24560000),
    },
  });

  const gopay = await prisma.wallet.create({
    data: {
      userId: user.id,
      name: 'GoPay Daily',
      type: 'E_WALLET',
      institution: 'GoTo Financial',
      accountLast4: '0812',
      balance: new Prisma.Decimal(1250000),
    },
  });

  const cash = await prisma.wallet.create({
    data: {
      userId: user.id,
      name: 'Kas Tunai Dompet',
      type: 'CASH',
      institution: null,
      accountLast4: null,
      balance: new Prisma.Decimal(650000),
    },
  });

  console.log('💳 3 Dompet berhasil dibuat (BCA, GoPay, Cash)');

  // 4. Buat Transaksi Contoh
  await prisma.transaction.createMany({
    data: [
      {
        userId: user.id,
        walletId: bca.id,
        type: 'INCOME',
        amount: new Prisma.Decimal(18500000),
        category: 'Gaji & Pendapatan',
        description: 'Gaji Bulanan PT Finansial Cerdas',
        transactionDate: new Date('2026-09-01T08:00:00Z'),
      },
      {
        userId: user.id,
        walletId: gopay.id,
        type: 'EXPENSE',
        amount: new Prisma.Decimal(45000),
        category: 'Makanan & Minuman',
        description: 'Makan Siang Ayam Geprek & Es Teh',
        transactionDate: new Date('2026-09-01T12:30:00Z'),
      },
      {
        userId: user.id,
        walletId: gopay.id,
        type: 'EXPENSE',
        amount: new Prisma.Decimal(28000),
        category: 'Transportasi',
        description: 'GoRide ke Kantor',
        transactionDate: new Date('2026-09-01T07:45:00Z'),
      },
      {
        userId: user.id,
        walletId: cash.id,
        type: 'EXPENSE',
        amount: new Prisma.Decimal(15000),
        category: 'Kebutuhan Harian',
        description: 'Beli Air Mineral & Camilan',
        transactionDate: new Date('2026-09-01T15:10:00Z'),
      },
    ],
  });

  console.log('📝 Transaksi contoh berhasil dimasukkan');

  // 5. Buat Pos Anggaran
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  await prisma.budget.createMany({
    data: [
      {
        userId: user.id,
        category: 'Makanan & Minuman',
        limitAmount: new Prisma.Decimal(3000000),
        month: currentMonth,
        year: currentYear,
      },
      {
        userId: user.id,
        category: 'Transportasi',
        limitAmount: new Prisma.Decimal(1200000),
        month: currentMonth,
        year: currentYear,
      },
      {
        userId: user.id,
        category: 'Belanja & Hiburan',
        limitAmount: new Prisma.Decimal(2000000),
        month: currentMonth,
        year: currentYear,
      },
    ],
  });

  console.log('📊 Pos Anggaran berhasil disiapkan');

  // 6. Buat 2 Target Impian (Goals)
  const laptopGoal = await prisma.goal.create({
    data: {
      userId: user.id,
      name: 'Laptop Baru',
      category: 'Teknologi & Kerja',
      targetAmount: new Prisma.Decimal(12000000),
      currentAmount: new Prisma.Decimal(3500000),
      deadline: new Date('2026-12-31T23:59:59Z'),
      sourceWalletId: bca.id,
      frequency: 'MONTHLY',
    },
  });

  const kuliahGoal = await prisma.goal.create({
    data: {
      userId: user.id,
      name: 'Tabungan Kuliah',
      category: 'Pendidikan',
      targetAmount: new Prisma.Decimal(25000000),
      currentAmount: new Prisma.Decimal(8000000),
      deadline: new Date('2027-06-30T23:59:59Z'),
      sourceWalletId: bca.id,
      frequency: 'MONTHLY',
    },
  });

  // Tambahkan 1 riwayat setoran contoh
  await prisma.goalContribution.create({
    data: {
      goalId: laptopGoal.id,
      sourceWalletId: bca.id,
      amount: new Prisma.Decimal(500000),
      contributionDate: new Date('2026-08-25T10:00:00Z'),
    },
  });

  console.log(`🎯 2 Target Impian berhasil dibuat: ${laptopGoal.name} & ${kuliahGoal.name}`);
  console.log('✅ Seeding FinAI selesai secara sukses!');
}

main()
  .catch((e) => {
    console.error('❌ Gagal melakukan seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
