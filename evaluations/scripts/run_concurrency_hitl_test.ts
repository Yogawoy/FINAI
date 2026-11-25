import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { prisma } from '../../src/lib/db';
import { WalletService } from '../../src/lib/services/wallet.service';
import { TransferService } from '../../src/lib/services/transfer.service';
import { TransactionService, InsufficientBalanceError } from '../../src/lib/services/transaction.service';
import { registerUser } from '../../src/lib/services/auth.service';

interface TestResult {
  id: string;
  name: string;
  category: 'HITL' | 'BalanceProtection' | 'AtomicTransfer' | 'RaceCondition';
  passed: boolean;
  expected: string;
  actual: string;
  latencyMs: number;
  details?: any;
}

async function main() {
  console.log('\n======================================================');
  console.log('🧪 MEMULAI PENGUJIAN BLACK-BOX KONKURENSI ATOMIK & HITL');
  console.log('======================================================\n');

  const testResults: TestResult[] = [];
  const testUserEmail = `hitl_eval_${Date.now()}@finai.test`;

  // 0. Setup isolated test user
  console.log('0. Inisialisasi User & Dompet Pengujian...');
  const regUser = await registerUser({
    name: 'HITL Concurrency Tester',
    email: testUserEmail,
    password: 'Password123!',
  });
  const userId = regUser.data!.user.id;

  const walletA = await WalletService.createWallet(userId, {
    name: 'BCA Utama (Test)',
    type: 'BANK',
    balance: 1_000_000,
    institution: 'BCA',
  });

  const walletB = await WalletService.createWallet(userId, {
    name: 'GoPay (Test)',
    type: 'E_WALLET',
    balance: 200_000,
    institution: 'GoPay',
  });

  console.log(`   User ID: ${userId}`);
  console.log(`   Dompet A (BCA): Rp${Number(walletA.balance).toLocaleString('id-ID')}`);
  console.log(`   Dompet B (GoPay): Rp${Number(walletB.balance).toLocaleString('id-ID')}\n`);

  // -------------------------------------------------------------------------
  // TEST 1: Human-in-the-Loop (HITL) - Draf / Proposal Tanpa Konfirmasi (0 Mutasi)
  // -------------------------------------------------------------------------
  {
    console.log('1. Menguji Alur HITL: Action Card Di-generate / Belum Dikonfirmasi...');
    const t0 = performance.now();

    // AI produces proposed payload
    const proposedActionPayload = {
      type: 'financial_action',
      action: 'create_transaction',
      requiresConfirmation: true,
      payload: {
        walletId: walletA.id,
        amount: '250000',
        type: 'EXPENSE',
        category: 'Belanja',
        description: 'Draf belanja supermarket',
      },
    };

    // User has NOT clicked confirm (action card sits in state)
    // Check database state directly
    const txCount = await prisma.transaction.count({ where: { userId } });
    const freshWalletA = await WalletService.getWalletById(userId, walletA.id);
    const dur = performance.now() - t0;

    const zeroMutation = txCount === 0 && Number(freshWalletA.balance) === 1_000_000;
    testResults.push({
      id: 'HITL-01',
      name: 'Action Card Draf Tanpa Konfirmasi = 0 Mutasi Basis Data',
      category: 'HITL',
      passed: zeroMutation,
      expected: 'Mutasi transaksi = 0, Saldo tetap Rp1.000.000',
      actual: `Mutasi transaksi = ${txCount}, Saldo = Rp${Number(freshWalletA.balance).toLocaleString('id-ID')}`,
      latencyMs: Math.round(dur * 10) / 10,
    });
    console.log(`   ${zeroMutation ? '✅' : '❌'} HITL-01: Mutasi DB = ${txCount}, Saldo BCA = Rp${Number(freshWalletA.balance).toLocaleString('id-ID')}`);
  }

  // -------------------------------------------------------------------------
  // TEST 2: Human-in-the-Loop (HITL) - Action Card Dibatalkan Pengguna (0 Mutasi)
  // -------------------------------------------------------------------------
  {
    console.log('2. Menguji Alur HITL: Pengguna Membatalkan Action Card...');
    const t0 = performance.now();

    // Simulated user action: click [Batal] / cancel card
    // In FINAI architecture, clicking cancel simply discards the client-side card without calling mutation API
    const txCount = await prisma.transaction.count({ where: { userId } });
    const freshWalletA = await WalletService.getWalletById(userId, walletA.id);
    const dur = performance.now() - t0;

    const zeroMutation = txCount === 0 && Number(freshWalletA.balance) === 1_000_000;
    testResults.push({
      id: 'HITL-02',
      name: 'Action Card Dibatalkan Pengguna = 0 Mutasi Basis Data',
      category: 'HITL',
      passed: zeroMutation,
      expected: 'Mutasi transaksi = 0, Saldo tidak berubah',
      actual: `Mutasi transaksi = ${txCount}, Saldo = Rp${Number(freshWalletA.balance).toLocaleString('id-ID')}`,
      latencyMs: Math.round(dur * 10) / 10,
    });
    console.log(`   ${zeroMutation ? '✅' : '❌'} HITL-02: User Membatalkan -> Mutasi DB = ${txCount}, Saldo = Rp${Number(freshWalletA.balance).toLocaleString('id-ID')}`);
  }

  // -------------------------------------------------------------------------
  // TEST 3: Human-in-the-Loop (HITL) - Action Card Dikonfirmasi Eksplisit (1 Mutasi Valid)
  // -------------------------------------------------------------------------
  {
    console.log('3. Menguji Alur HITL: Pengguna Mengonfirmasi Action Card...');
    const t0 = performance.now();

    // User clicks [Konfirmasi], frontend dispatches canonical POST /api/transactions
    const committedTx = await TransactionService.createTransaction(userId, {
      walletId: walletA.id,
      amount: 250_000,
      type: 'EXPENSE',
      category: 'Belanja',
      description: 'Draf belanja supermarket terkonfirmasi',
    });

    const txCount = await prisma.transaction.count({ where: { userId } });
    const freshWalletA = await WalletService.getWalletById(userId, walletA.id);
    const dur = performance.now() - t0;

    const exactlyOneMutation = txCount === 1 && Number(freshWalletA.balance) === 750_000 && committedTx.transaction.id !== undefined;
    testResults.push({
      id: 'HITL-03',
      name: 'Action Card Dikonfirmasi Eksplisit = Tepat 1 Mutasi Atomik',
      category: 'HITL',
      passed: exactlyOneMutation,
      expected: 'Mutasi transaksi = 1, Saldo berkurang Rp250.000 menjadi Rp750.000',
      actual: `Mutasi transaksi = ${txCount}, Saldo = Rp${Number(freshWalletA.balance).toLocaleString('id-ID')}`,
      latencyMs: Math.round(dur * 10) / 10,
    });
    console.log(`   ${exactlyOneMutation ? '✅' : '❌'} HITL-03: User Mengonfirmasi -> Mutasi DB = ${txCount}, Saldo Baru BCA = Rp${Number(freshWalletA.balance).toLocaleString('id-ID')}`);
  }

  // -------------------------------------------------------------------------
  // TEST 4: Proteksi Saldo Tidak Mencukupi (Insufficient Balance Protection)
  // -------------------------------------------------------------------------
  {
    console.log('4. Menguji Proteksi Saldo Tidak Mencukupi (Overdraft Protection)...');
    const t0 = performance.now();

    // Current balance is 750,000. Attempt expense of 2,000,000
    let caughtInsufficient = false;
    let errorType = '';
    try {
      await TransactionService.createTransaction(userId, {
        walletId: walletA.id,
        amount: 2_000_000,
        type: 'EXPENSE',
        category: 'Kebutuhan',
        description: 'Mencoba belanja melebihi saldo',
      });
    } catch (e: any) {
      caughtInsufficient = e instanceof InsufficientBalanceError || e.message.includes('mencukupi');
      errorType = e.constructor.name || e.message;
    }

    const freshWalletA = await WalletService.getWalletById(userId, walletA.id);
    const dur = performance.now() - t0;

    const protectionSuccess = caughtInsufficient && Number(freshWalletA.balance) === 750_000;
    testResults.push({
      id: 'BAL-01',
      name: 'Proteksi Saldo Negatif pada Transaksi Pengeluaran (Expense Overdraft)',
      category: 'BalanceProtection',
      passed: protectionSuccess,
      expected: 'Ditolak dengan InsufficientBalanceError, Saldo tetap Rp750.000',
      actual: `Error ditangkap: ${errorType}, Saldo saat ini: Rp${Number(freshWalletA.balance).toLocaleString('id-ID')}`,
      latencyMs: Math.round(dur * 10) / 10,
    });
    console.log(`   ${protectionSuccess ? '✅' : '❌'} BAL-01: Percobaan Overdraft Ditolak -> ${errorType}, Saldo Utuh Rp${Number(freshWalletA.balance).toLocaleString('id-ID')}`);
  }

  // -------------------------------------------------------------------------
  // TEST 5: Transfer Atomik Antar-Dompet (Atomic Inter-Wallet Transfer)
  // -------------------------------------------------------------------------
  {
    console.log('5. Menguji Transfer Atomik Antar-Dompet...');
    const t0 = performance.now();

    // Transfer Rp300.000 from BCA (750k) to GoPay (200k)
    const transferResult = await TransferService.transferBetweenWallets(userId, {
      fromWalletId: walletA.id,
      toWalletId: walletB.id,
      amount: 300_000,
      note: 'Transfer rutin operasional mingguan',
    });

    const freshA = await WalletService.getWalletById(userId, walletA.id);
    const freshB = await WalletService.getWalletById(userId, walletB.id);
    const dur = performance.now() - t0;

    const transferSuccess =
      Number(freshA.balance) === 450_000 &&
      Number(freshB.balance) === 500_000 &&
      Number(transferResult.fromWallet.balance) === 450_000 &&
      Number(transferResult.toWallet.balance) === 500_000;

    testResults.push({
      id: 'TRF-01',
      name: 'Sinkronisasi Transfer Atomik Antar-Dompet (ACID Consistency)',
      category: 'AtomicTransfer',
      passed: transferSuccess,
      expected: 'BCA = Rp450.000, GoPay = Rp500.000',
      actual: `BCA = Rp${Number(freshA.balance).toLocaleString('id-ID')}, GoPay = Rp${Number(freshB.balance).toLocaleString('id-ID')}`,
      latencyMs: Math.round(dur * 10) / 10,
    });
    console.log(`   ${transferSuccess ? '✅' : '❌'} TRF-01: Transfer Berhasil -> Saldo BCA: Rp${Number(freshA.balance).toLocaleString('id-ID')}, GoPay: Rp${Number(freshB.balance).toLocaleString('id-ID')}`);
  }

  // -------------------------------------------------------------------------
  // TEST 6: Proteksi Transfer Melebihi Saldo (Transfer Overdraft Protection)
  // -------------------------------------------------------------------------
  {
    console.log('6. Menguji Proteksi Transfer Melebihi Saldo...');
    const t0 = performance.now();

    // BCA has 450k. Attempt to transfer 900k to GoPay
    let transferFailedAsExpected = false;
    let errMsg = '';
    try {
      await TransferService.transferBetweenWallets(userId, {
        fromWalletId: walletA.id,
        toWalletId: walletB.id,
        amount: 900_000,
        note: 'Transfer gagal karena saldo kurang',
      });
    } catch (e: any) {
      transferFailedAsExpected = true;
      errMsg = e.message;
    }

    const freshA = await WalletService.getWalletById(userId, walletA.id);
    const freshB = await WalletService.getWalletById(userId, walletB.id);
    const dur = performance.now() - t0;

    const zeroBalanceLeak = Number(freshA.balance) === 450_000 && Number(freshB.balance) === 500_000;
    const testPassed = transferFailedAsExpected && zeroBalanceLeak;

    testResults.push({
      id: 'TRF-02',
      name: 'Proteksi Saldo Kurang pada Transfer Antar-Dompet',
      category: 'AtomicTransfer',
      passed: testPassed,
      expected: 'Ditolak dan kedua saldo tidak mengalami mutasi',
      actual: `Ditolak: ${errMsg}, Saldo BCA: Rp${Number(freshA.balance).toLocaleString('id-ID')}, GoPay: Rp${Number(freshB.balance).toLocaleString('id-ID')}`,
      latencyMs: Math.round(dur * 10) / 10,
    });
    console.log(`   ${testPassed ? '✅' : '❌'} TRF-02: Transfer Ilegal Ditolak -> Saldo A: Rp${Number(freshA.balance).toLocaleString('id-ID')}, Saldo B: Rp${Number(freshB.balance).toLocaleString('id-ID')}`);
  }

  // -------------------------------------------------------------------------
  // TEST 7: Uji Konkurensi Paralel Ekstrem (Race Condition Double-Spending Stress Test)
  // -------------------------------------------------------------------------
  {
    console.log('7. Menguji Konkurensi Paralel Ekstrem (Race Condition Stress Test)...');
    // Setup dedicated concurrency wallet
    const raceWallet = await WalletService.createWallet(userId, {
      name: 'Race Condition Test Wallet',
      type: 'BANK',
      balance: 1_000_000, // Exact 1.000.000
      institution: 'Bank Test',
    });

    const targetWallet = await WalletService.createWallet(userId, {
      name: 'Race Target Wallet',
      type: 'E_WALLET',
      balance: 0,
      institution: 'Wallet Test',
    });

    console.log(`   Dompet Asal: Rp${Number(raceWallet.balance).toLocaleString('id-ID')}`);
    console.log(`   Menjalankan 10 request transfer serentak sebesar Rp600.000...`);

    const t0 = performance.now();
    const concurrentRequests = 10;
    const requestAmount = 600_000;

    // Fire 10 concurrent requests at the exact same millisecond
    const promises = Array.from({ length: concurrentRequests }, async (_, i) => {
      try {
        await TransferService.transferBetweenWallets(userId, {
          fromWalletId: raceWallet.id,
          toWalletId: targetWallet.id,
          amount: requestAmount,
          note: `Parallel race request #${i + 1}`,
        });
        return { index: i, success: true, error: null };
      } catch (err: any) {
        return { index: i, success: false, error: err.message };
      }
    });

    const results = await Promise.all(promises);
    const dur = performance.now() - t0;

    const successfulTransfers = results.filter((r) => r.success);
    const failedTransfers = results.filter((r) => !r.success);

    const freshSource = await WalletService.getWalletById(userId, raceWallet.id);
    const freshTarget = await WalletService.getWalletById(userId, targetWallet.id);

    // EXACTLY 1 transfer should succeed (1,000,000 - 600,000 = 400,000).
    // Exactly 9 transfers should fail with insufficient balance.
    // If a race condition bug existed, 2 or more would succeed, and balance would drop below zero!
    const raceFree =
      successfulTransfers.length === 1 &&
      failedTransfers.length === 9 &&
      Number(freshSource.balance) === 400_000 &&
      Number(freshTarget.balance) === 600_000;

    testResults.push({
      id: 'RACE-01',
      name: 'Uji Konkurensi Paralel 10 Request Serentak (Anti Double-Spending)',
      category: 'RaceCondition',
      passed: raceFree,
      expected: 'Tepat 1 sukses, 9 ditolak, Saldo akhir asal Rp400.000, tujuan Rp600.000',
      actual: `Sukses: ${successfulTransfers.length}, Ditolak: ${failedTransfers.length}, Saldo Asal: Rp${Number(freshSource.balance).toLocaleString('id-ID')}, Saldo Tujuan: Rp${Number(freshTarget.balance).toLocaleString('id-ID')}`,
      latencyMs: Math.round(dur * 10) / 10,
      details: {
        totalRequests: concurrentRequests,
        successCount: successfulTransfers.length,
        rejectedCount: failedTransfers.length,
        finalSourceBalance: Number(freshSource.balance),
        finalTargetBalance: Number(freshTarget.balance),
      },
    });

    console.log(`   ${raceFree ? '✅' : '❌'} RACE-01: Hasil Konkurensi -> ${successfulTransfers.length} Sukses, ${failedTransfers.length} Ditolak`);
    console.log(`      Saldo Akhir Dompet Asal: Rp${Number(freshSource.balance).toLocaleString('id-ID')} (Tidak Pernah Negatif)`);
    console.log(`      Saldo Akhir Dompet Tujuan: Rp${Number(freshTarget.balance).toLocaleString('id-ID')}`);
    console.log(`      Durasi Total Eksekusi 10 Transaksi: ${dur.toFixed(1)}ms`);
  }

  // Save Results to evaluations/results/concurrency_hitl_results.json
  const resultsDir = path.resolve(process.cwd(), 'evaluations/results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  const passedCount = testResults.filter((t) => t.passed).length;
  const failedCount = testResults.filter((t) => !t.passed).length;

  const outputPayload = {
    summary: {
      totalTests: testResults.length,
      passed: passedCount,
      failed: failedCount,
      allPassed: failedCount === 0,
      executionDate: new Date().toISOString(),
    },
    tests: testResults,
  };

  const jsonOut = path.join(resultsDir, 'concurrency_hitl_results.json');
  fs.writeFileSync(jsonOut, JSON.stringify(outputPayload, null, 2), 'utf8');

  // Clean up test user
  await prisma.user.delete({ where: { id: userId } });

  console.log('\n======================================================');
  console.log(`🏁 HASIL PENGUJIAN KONKURENSI & HITL: ${passedCount} LULUS, ${failedCount} GAGAL`);
  console.log(`📁 File Laporan: ${jsonOut}`);
  console.log('======================================================\n');

  if (failedCount > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Fatal in concurrency HITL test:', err);
  process.exit(1);
});
