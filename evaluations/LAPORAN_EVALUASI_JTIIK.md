# 📄 LAPORAN KOMPREHENSIF SUITE EVALUASI SISTEM FINAI
## Disusun untuk Melengkapi Bab 4 Artikel Jurnal Ilmiah JTIIK (Jurnal Teknologi Informasi dan Ilmu Komputer)
### Topik: Evaluasi Ekstraksi Intent/Entitas NLP, Halusinasi Numerik (Hybrid SAW), Integritas Transaksi ACID, dan Konkurensi Atomik

> **Penulis / Peneliti:** Mohammad Yoga Saputra (Yogawoy)  
> **Model AI Pengujian:** Groq Cloud LPU (`openai/gpt-oss-20b` & `openai/gpt-oss-120b` dengan JSON Mode & Validasi Zod)  
> **Framework & Database:** Next.js 16.3 (React 19), Prisma ORM 6.4, PostgreSQL Serverless (Neon Cloud)  
> **Waktu Pengujian:** 24 November 2026  
> **Status Repositori:** Production Deployed (`https://finai-fawn-omega.vercel.app`)  

---

## DAFTAR ISI LAPORAN EVALUASI
1. [Metodologi Pengujian & Lingkungan Evaluasi](#1-metodologi-pengujian--lingkungan-evaluasi)
2. [Hasil Evaluasi Ekstraksi NLP (Dataset 220 Kalimat Bahasa Indonesia)](#2-hasil-evaluasi-ekstraksi-nlp)
   - 2.1 [Aturan Pembuatan Ground Truth & Taksonomi Entitas](#21-aturan-pembuatan-ground-truth--taksonomi-entitas)
   - 2.2 [Metrik Evaluasi: Intent Accuracy, Entity Precision, Recall, F1-Score](#22-metrik-evaluasi-ekstraksi)
   - 2.3 [Tingkat Kepatuhan Format (JSON Validity Rate)](#23-tingkat-kepatuhan-format-json-validity-rate)
   - 2.4 [Karakteristik Latensi Inferensi Groq LPU](#24-karakteristik-latensi-inferensi-groq-lpu)
   - 2.5 [Analisis Kasus Uji & Variasi Linguistik (Typos, Slang, Code-Switching)](#25-analisis-kasus-uji--variasi-linguistik)
3. [Hasil Eksperimen Komparatif Halusinasi Numerik (Pure LLM vs. FINAI Hybrid SAW)](#3-hasil-ekperimen-komparatif-halusinasi-numerik)
   - 3.1 [Perbandingan Metrik Kunci & Tingkat Kesalahan Aritmetika](#31-perbandingan-metrik-kunci--tingkat-kesalahan-aritmetika)
   - 3.2 [Akurasi & Konsistensi Klasifikasi Status Kesehatan Finansial](#32-akurasi--konsistensi-klasifikasi-status)
   - 3.3 [Stabilitas Multi-Pengulangan (Inter-Repetition Consistency)](#33-stabilitas-multi-pengulangan)
4. [Hasil Pengujian Black-Box Integritas Transaksi & Konkurensi Atomik](#4-hasil-pengujian-black-box-integritas-transaksi--konkurensi-atomik)
   - 4.1 [Uji Invarian Alur Human-in-the-Loop (HITL Card Workflow)](#41-uji-invarian-alur-human-in-the-loop-hitl)
   - 4.2 [Proteksi Saldo Negatif & Overdraft Protection](#42-proteksi-saldo-negatif--overdraft-protection)
   - 4.3 [Transfer Atomik Antar-Dompet & Rollback Mechanism](#43-transfer-atomik-antar-dompet--rollback-mechanism)
   - 4.4 [Uji Stres Konkurensi Paralel (Race Condition Anti Double-Spending)](#44-uji-stres-konkurensi-paralel-race-condition)
5. [Hasil Pengujian Unit Mesin Simple Additive Weighting (SAW)](#5-hasil-pengujian-unit-mesin-saw)
   - 5.1 [Formulasi Kriteria & Pembobotan SAW](#51-formulasi-kriteria--pembobotan-saw)
   - 5.2 [Matriks Hasil 11 Kasus Uji Unit SAW Termasuk Edge Cases](#52-matriks-hasil-11-kasus-uji-unit-saw)
6. [Rekapitulasi Angka Mentah Siap Salin untuk Bab 4 Jurnal JTIIK](#6-rekapitulasi-angka-mentah-siap-salin-untuk-bab-4-jurnal-jtiik)

---

## 1. METODOLOGI PENGUJIAN & LINGKUNGAN EVALUASI

Pengujian sistem FINAI dirancang mengikuti kaidah rekayasa perangkat lunak berbasis bukti empiris (*evidence-based empirical evaluation*) untuk menjawab 3 rumusan masalah utama pada naskah jurnal:
1. Akurasi pemahaman bahasa alami (NLP) pada percakapan finansial informal masyarakat Indonesia tanpa *prompt injection* liar.
2. Penanggulangan halusinasi numerik probabilitas LLM melalui pemisahan mutasi deterministik berbasis mesin *Simple Additive Weighting* (SAW).
3. Jaminan konsistensi transaksional ACID pada lingkungan konkurensi terdistribusi (*serverless multi-wallet balance*).

### Spesifikasi Lingkungan Pengujian:
- **Model Inferensi Natural Language Processing:** `openai/gpt-oss-20b` dan `openai/gpt-oss-120b` diakses melalui Groq Cloud LPU API dengan suhu deterministik ($T = 0.3$), `response_format: { type: "json_object" }`.
- **Backend Runtime:** Node.js v24.14.0, TypeScript 5 (Strict Mode), Next.js 16.3.3.
- **Relational ORM & Engine Database:** Prisma ORM 6.4.1 terhubung ke PostgreSQL Serverless (Neon Cloud Database) dengan tipe data moneter presisi tinggi `Decimal(15,2)`.
- **Protokol Validasi Skema:** Zod Schema Parser (`AIChatRequestSchema`, `GrokStructuredResponseSchema`).

---

## 2. HASIL EVALUASI EKSTRAKSI NLP

### 2.1 Aturan Pembuatan Ground Truth & Taksonomi Entitas
Evaluasi ekstraksi NLP dilakukan pada dataset independen sebanyak **220 kalimat percakapan bahasa Indonesia** yang dibangun dengan variasi dialek sehari-hari. Ground truth dirumuskan secara terstandar:

1. **Aksi Transaksional (`create_transaction`):** Kalimat yang secara eksplisit menyatakan belanja, konsumsi, pembayaran tagihan, atau penerimaan uang/gaji.
   - Ground truth entitas wajib: `amount` (angka murni tanpa desimal/titik), `category` (kategori canonical), `wallet` (dompet yang didebet/dikredit).
2. **Aksi Transfer Antar-Dompet (`transfer`):** Kalimat pemindahan dana internal antar dompet pengguna (misal: BCA ke GoPay, Tarik Tunai dari ATM).
   - Ground truth entitas wajib: `amount`, `sourceWallet`, `destinationWallet`.
3. **Aksi Setor Target Tabungan (`goal_contribution`):** Kalimat penyisihan dana untuk pos tabungan masa depan (*sinking funds*) yang terhubung pada target aktif (misal: Laptop Baru, Dana Darurat, Umroh).
   - Ground truth entitas wajib: `amount`, `sourceWallet`, `goalName`.
4. **Aksi Konsultasi Finansial (`financial_advice`):** Pertanyaan reflektif, analisis arus kas, evaluasi batas anggaran, dan simulasi perencanaan finansial.

---

### 2.2 Metrik Evaluasi: Intent Accuracy, Entity Precision, Recall, F1-Score

Hasil evaluasi inferensi riil model terhadap dataset percakapan bahasa Indonesia disajikan pada Tabel 1 dan Tabel 2.

#### Tabel 1. Hasil Evaluasi Akurasi Klasifikasi Intent (Aksi)
| ID Aksi | Jenis Aksi Finansial | Jumlah Kasus ($N$) | Prediksi Benar | Intent Accuracy (%) | Keterangan Karakteristik |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **ACT-01** | `create_transaction` | 95 | 95 | **100%** | Seluruh transaksi pengeluaran/pemasukan terklasifikasi sempurna |
| **ACT-02** | `transfer` | 45 | 42 | **93.3%** | 3 kasus ambigu berfrasa 'masukin cash ke dompet' terklasifikasi transaksi |
| **ACT-03** | `goal_contribution` | 40 | 40 | **100%** | Setoran tabungan terdeteksi presisi 100% ke target aktif |
| **ACT-04** | `financial_advice` | 40 | 40 | **100%** | Pertanyaan analitis, anggaran, dan saran terdeteksi sempurna |
| **TOTAL** | **Seluruh Dataset** | **220** | **217** | **98.6%** | **Rata-rata Akurasi Intent FinAI** |

#### Tabel 2. Hasil Evaluasi Ekstraksi Entitas Finansial (Precision, Recall, F1-Score)
| Nama Entitas | True Positive ($TP$) | False Positive ($FP$) | False Negative ($FN$) | Precision (%) | Recall (%) | F1-Score (%) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Nominal (`amount`)** | 180 | 0 | 8 | **100%** | **95.7%** | **97.8%** |
| **Kategori (`category`)** | 58 | 62 | 84 | **48.3%** | **40.8%** | **44.3%** |
| **Dompet (`wallet`)** | 172 | 8 | 9 | **95.6%** | **95%** | **95.3%** |
| **Target (`goal`)** | 40 | 0 | 11 | **100%** | **78.4%** | **87.9%** |
| **Dompet / Goal (Gabungan)** | 212 | 8 | 20 | **96.4%** | **91.4%** | **93.8%** |

---

### 2.3 Tingkat Kepatuhan Format (JSON Validity Rate)
Dari 220 pemanggilan inferensi:
- **JSON Validity Rate:** **81.8%**
- **Penanganan Ketahanan Format:** Seluruh respon ditangani secara bertingkat melalui validasi skema Zod dan parser toleran `safeParseStructuredResponse` yang menjamin antarmuka pengguna tidak pernah menerima *raw escaped JSON error*.

---

### 2.4 Karakteristik Latensi Inferensi Groq LPU
Distribusi latensi inferensi LLM pada arsitektur Groq Cloud LPU:
- **Rata-rata Latensi:** 1522.4 ms
- **Median Latensi ($P_{50}$):** 1180.2 ms
- **95th Percentile ($P_{95}$):** 3038.2 ms
- **Rentang Minimum / Maksimum:** 498.6 ms / 14769.4 ms

---

## 3. HASIL EKSPERIMEN KOMPARATIF HALUSINASI NUMERIK (PURE LLM vs. FINAI HYBRID SAW)


### 3.1 Perbandingan Metrik Kunci
Eksperimen komparatif dilakukan pada **40 skenario profil finansial** dengan **2 kali pengulangan** (total 160 pengujian komparatif).

#### Tabel 3. Matriks Perbandingan Halusinasi Numerik (Pure LLM vs. FINAI Hybrid SAW)
| Parameter Pengujian | Pure LLM (Baseline Tanpa SAW) | FINAI (Hybrid SAW Engine) | Peningkatan / Reduksi |
| :--- | :---: | :---: | :---: |
| **Tingkat Kesalahan Aritmetika (Error Rate)** | **5%** | **0%** | **-5% (Eliminasi Total)** |
| **Akurasi Arus Kas Bersih (Net Cash Flow)** | **100%** | **100%** | **+0%** |
| **Akurasi Perhitungan Rasio Finansial** | **95%** | **100%** | **+5%** |
| **Akurasi Klasifikasi Status Kesehatan Finansial** | **65%** | **100%** | **+35%** |
| **Konsistensi Lintas Pengulangan (Cross-Repetition)** | **85%** | **100%** | **+15%** |
| **Median Latensi Inferensi** | **1722.1 ms** | **1171 ms** | Efisiensi setara |


---

## 4. HASIL PENGUJIAN BLACK-BOX INTEGRITAS TRANSAKSI & KONKURANSI ATOMIK

Pengujian dilakukan langsung pada basis data PostgreSQL Serverless (Neon Cloud) melalui Prisma ORM dengan skenario konkurensi dunia nyata.

#### Tabel 4. Rekapitulasi Pengujian Black-Box Integritas Transaksi & Konkurensi
| Test ID | Skenario Pengujian | Kategori | Expected Invariant | Status | Latensi (ms) |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **HITL-01** | Action Card Draf Tanpa Konfirmasi = 0 Mutasi Basis Data | `HITL` | Mutasi transaksi = 0, Saldo tetap Rp1.000.000 | **PASSED ✅** | 1352 ms |
| **HITL-02** | Action Card Dibatalkan Pengguna = 0 Mutasi Basis Data | `HITL` | Mutasi transaksi = 0, Saldo tidak berubah | **PASSED ✅** | 727.1 ms |
| **HITL-03** | Action Card Dikonfirmasi Eksplisit = Tepat 1 Mutasi Atomik | `HITL` | Mutasi transaksi = 1, Saldo berkurang Rp250.000 menjadi Rp750.000 | **PASSED ✅** | 5575.7 ms |
| **BAL-01** | Proteksi Saldo Negatif pada Transaksi Pengeluaran (Expense Overdraft) | `BalanceProtection` | Ditolak dengan InsufficientBalanceError, Saldo tetap Rp750.000 | **PASSED ✅** | 1316.6 ms |
| **TRF-01** | Sinkronisasi Transfer Atomik Antar-Dompet (ACID Consistency) | `AtomicTransfer` | BCA = Rp450.000, GoPay = Rp500.000 | **PASSED ✅** | 4771.7 ms |
| **TRF-02** | Proteksi Saldo Kurang pada Transfer Antar-Dompet | `AtomicTransfer` | Ditolak dan kedua saldo tidak mengalami mutasi | **PASSED ✅** | 4074.9 ms |
| **RACE-01** | Uji Konkurensi Paralel 10 Request Serentak (Anti Double-Spending) | `RaceCondition` | Tepat 1 sukses, 9 ditolak, Saldo akhir asal Rp400.000, tujuan Rp600.000 | **PASSED ✅** | 2609.5 ms |

---

## 5. HASIL PENGUJIAN UNIT MESIN SIMPLE ADDITIVE WEIGHTING (SAW)

Evaluasi mesin SAW deterministik (`SAWFinancialEngine`) mencakup 4 kriteria utama dengan pembobotan terstandar CFP/OJK:
- $C_1$: Tingkat Tabungan (*Savings Rate*), $w_1 = 0.30$ (Benefit)
- $C_2$: Kendali Pengeluaran (*Expense Control*), $w_2 = 0.30$ (Cost)
- $C_3$: Kepatuhan Anggaran (*Budget Adherence*), $w_3 = 0.20$ (Cost)
- $C_4$: Ketahanan Likuiditas (*Liquidity Buffer*), $w_4 = 0.20$ (Benefit)

#### Tabel 5. Hasil Unit Test Mesin SAW Deterministik (11 Skenario Ekstrem)
| Test ID | Nama Profil Skenario | Expected Status | Actual Status | Skor SAW | Nilai (0-100) | Status Uji |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **TC-SAW-01** | Kasus Nilai Nol Mutlak (Zero Division Immunity) | `Warning` | `Warning` | 0.5 | 50 | **PASSED ✅** |
| **TC-SAW-02** | Surplus Finansial Prima (Strong Profile) | `Strong` | `Strong` | 1 | 100 | **PASSED ✅** |
| **TC-SAW-03** | Kondisi Finansial Stabil Moderat (Stable Profile) | `Stable` | `Stable` | 0.76 | 76 | **PASSED ✅** |
| **TC-SAW-03B** | Kondisi Finansial Waspada (Warning Status Benchmark) | `Warning` | `Warning` | 0.569 | 56.9 | **PASSED ✅** |
| **TC-SAW-04** | Arus Kas Sangat Ketat & Anggaran Terlampaui (Borderline Critical Profile) | `Critical` | `Critical` | 0.348 | 34.8 | **PASSED ✅** |
| **TC-SAW-05** | Defisit Ekstrem & Arus Kas Negatif (Severe Deficit Profile) | `Critical` | `Critical` | 0.005 | 0.5 | **PASSED ✅** |
| **TC-SAW-06** | Saldo Nol & Pengeluaran Berjalan (Zero Balance Critical) | `Critical` | `Critical` | 0.15 | 15 | **PASSED ✅** |
| **TC-SAW-07** | Anggaran Terlampaui Ekstrem (Severe Budget Overrun Critical) | `Critical` | `Critical` | 0.195 | 19.5 | **PASSED ✅** |
| **TC-SAW-08** | Income Tinggi Tapi Boros Total (High Income Low Buffer Critical) | `Critical` | `Critical` | 0.168 | 16.8 | **PASSED ✅** |
| **TC-SAW-09** | Dana Darurat Sangat Besar Tapi Tidak Ada Income (Asset-Rich No Income) | `Critical` | `Critical` | 0.2 | 20 | **PASSED ✅** |
| **TC-SAW-10** | Threshold Boundary Case (Kategori Strong) | `Strong` | `Strong` | 1 | 100 | **PASSED ✅** |

---

## 6. REKAPITULASI ANGKA MENTAH SIAP SALIN UNTUK BAB 4 JURNAL JTIIK

```text
================================================================================
REKAPITULASI HASIL EVALUASI FINAI (UNTUK BAB 4 ARTIKEL JTIIK)
================================================================================

1. EVALUASI EKSTRAKSI NLP (N = 220 Kalimat Bahasa Indonesia):
   - Macro Intent Accuracy          : 98.6% (217/220)
     * create_transaction           : 100% (95/95)
     * transfer                     : 93.3% (42/45)
     * goal_contribution            : 100% (40/40)
     * financial_advice             : 100% (40/40)
   - Entity Precision / Recall / F1 :
     * Nominal (amount)             : P = 100%, R = 95.7%, F1 = 97.8%
     * Kategori (category)          : P = 48.3%, R = 40.8%, F1 = 44.3%
     * Dompet (wallet)              : P = 95.6%, R = 95%, F1 = 95.3%
     * Target (goal)                : P = 100%, R = 78.4%, F1 = 87.9%
     * Dompet / Goal (Gabungan)     : P = 96.4%, R = 91.4%, F1 = 93.8%
   - Inference Latency (Groq LPU)   : Median = 1180.2 ms | P95 = 3038.2 ms

2. PENGUJIAN KONKURANSI & TRANSAKSI ATOMIK (PostgreSQL Neon + Prisma):
   - Total Test Cases               : 7 Pengujian
   - Tingkat Keberhasilan (Pass Rate: 100.0% (7/7)
   - Human-in-the-Loop Invariant    : Terverifikasi (Draf/Batal = 0 Mutasi; Konfirmasi = 1 Mutasi)
   - Race Condition Anti-Double-Spend: Terverifikasi (10 Request Konkuren -> 1 Berhasil, 9 Ditolak)

3. PENGUJIAN UNIT MESIN SAW:
   - Total Kasus Uji                : 11 Kasus Termasuk Edge Cases
   - Tingkat Keberhasilan           : 100.0% (11/11)
   - Zero-Division Protection       : Terverifikasi (Skor = 50.0, Status = Warning, Zero Crash)

4. EKSPERIMEN KOMPARATIF HALUSINASI NUMERIK (Pure LLM vs FINAI Hybrid SAW):
   - Total Profil Finansial         : 40 Skenario
   - Pengulangan (Repetitions)      : 2 Kali per Skenario
   - Tingkat Kesalahan Aritmetika   : Pure LLM = 5% | FINAI = 0% (Reduksi 100% / Eliminasi Total)
   - Akurasi Perhitungan Rasio      : Pure LLM = 95% | FINAI = 100%
   - Akurasi Klasifikasi Status SAW : Pure LLM = 65% | FINAI = 100% (Peningkatan +35%)
   - Konsistensi Lintas Pengulangan : Pure LLM = 85% | FINAI = 100% (Peningkatan +15%)
   - Median Latensi Inferensi       : Pure LLM = 1722.1 ms | FINAI = 1171 ms
================================================================================
```
