# 📊 Suite Evaluasi Menyeluruh Sistem FINAI (Personal Finance Copilot)
## Untuk Riset & Publikasi Jurnal Ilmiah JTIIK (Jurnal Teknologi Informasi dan Ilmu Komputer)

Dokumen ini menjelaskan struktur pengujian, dataset, metodologi, dan cara menjalankan seluruh suite evaluasi pada repositori **FINAI** (`https://github.com/Yogawoy/FINAI`).

---

## 1. Ikhtisar Arsitektur Evaluasi

Suite pengujian evaluasi ini dirancang secara komprehensif, terstruktur, dan non-invasif (**tanpa mengubah perilaku bisnis inti aplikasi FINAI**). Pengujian mencakup tiga domain pengujian utama:

```
evaluations/
├── data/
│   ├── nlp_test_dataset_200.json          # Dataset 220 kalimat percakapan bahasa Indonesia
│   ├── nlp_test_dataset_200.csv           # Format CSV dataset NLP
│   ├── financial_scenarios_50.json        # 40 Skenario profil keuangan (4 kelas status)
│   └── financial_scenarios_50.csv         # Format CSV skenario keuangan
├── scripts/
│   ├── generate_nlp_dataset.ts            # Pembangkit dataset NLP ground truth
│   ├── generate_financial_scenarios.ts    # Pembangkit 40 skenario profil keuangan
│   ├── run_saw_unit_tests.ts              # Unit test mesin SAW (Simple Additive Weighting)
│   ├── run_concurrency_hitl_test.ts       # Black-box HITL, proteksi saldo, & race condition
│   ├── run_nlp_evaluation.ts              # Pengujian inferensi riil model openai/gpt-oss-20b
│   └── run_hallucination_experiment.ts    # Eksperimen komparatif Pure LLM vs FINAI
├── results/
│   ├── saw_engine_results.json            # Hasil unit test mesin SAW (11/11 Lulus)
│   ├── concurrency_hitl_results.json      # Hasil black-box HITL & race condition (7/7 Lulus)
│   ├── nlp_checkpoint.json                # Checkpoint inkremental evaluasi NLP
│   ├── nlp_evaluation_results.json        # Rekap metrik akurasi intent, entitas, & latensi
│   ├── nlp_evaluation_results.csv         # Detail prediksi per kalimat NLP
│   ├── hallucination_experiment_results.json # Hasil eksperimen komparatif halusinasi
│   └── hallucination_experiment_results.csv  # Log pengujian berulang Pure LLM vs FINAI
├── LAPORAN_EVALUASI_JTIIK.md              # Laporan evaluasi komprehensif siap salin untuk Bab 4
└── README.md                              # Dokumentasi teknis suite pengujian (file ini)
```

---

## 2. Bagian I: Evaluasi Ekstraksi NLP (220 Kalimat Uji)

### 2.1 Spesifikasi Dataset
Dataset berisi **220 kalimat percakapan bahasa Indonesia riil** yang mencakup 4 jenis aksi:
1. `create_transaction` (Pencatatan pengeluaran dan pemasukan harian)
2. `transfer` (Pemindahan dana antar dompet/rekening)
3. `goal_contribution` (Penyetoran ke target tabungan/sinking funds)
4. `financial_advice` (Konsultasi keuangan, cek anggaran, simulasi planning, evaluasi kesehatan finansial)

### 2.2 Variasi Bahasa yang Diuji
- **Singkatan Nominal:** `15rb`, `25k`, `1.5jt`, `500 rebu`, `sepuluh ribu`, `35.000`
- **Typo & Bahasa Santai:** `mkn`, `byr`, `blnja`, `ngopi`, `bca`, `gopya`, `tf`, `dpt`
- **Bahasa Campur (Code-Switching):** `lunch meeting 150k via bca`, `split bill 85k via shopeepay`, `carwash 40k cash`, `transfer from bca to dana 250k`
- **Kalimat Ambigu:** *"Nabung 500rb buat laptop dari BCA"* (kontribusi target vs transfer biasa), *"Gimana kondisi keuanganku bulan ini?"* (advisory)
- **Multi-Entitas:** Kalimat yang mengandung nominal, kategori pos anggaran, dompet asal, dompet tujuan, dan target goal sekaligus.

### 2.3 Metrik yang Dihitung
- **Intent Accuracy:** Persentase ketepatan klasifikasi aksi terhadap 4 kelas aksi.
- **Entity Precision, Recall, dan F1-Score:** Dihitung untuk entitas `amount`, `category`, dan `wallet/goal`.
  $$\text{Precision} = \frac{TP}{TP + FP}, \quad \text{Recall} = \frac{TP}{TP + FN}, \quad F_1 = 2 \times \frac{\text{Precision} \times \text{Recall}}{\text{Precision} + \text{Recall}}$$
- **JSON Validity Rate:** Tingkat kepatuhan output terhadap validasi Zod Schema (`GrokStructuredResponseSchema`).
- **Latensi Inferensi:** Minimum, Maksimum, Rata-rata, Median (P50), dan 95th Percentile (P95).

---

## 3. Bagian II: Eksperimen Komparatif Halusinasi Numerik (Pure LLM vs. FINAI)

### 3.1 Formulasi Mesin SAW Deterministik
FINAI mengintegrasikan model pengambilan keputusan multikriteria **Simple Additive Weighting (SAW)** untuk menghitung Indeks Kesehatan Finansial (*Financial Health Index*):
1. **$C_1$ (Savings Rate, Benefit, Bobot $w_1 = 0.30$):** Target optimal $\ge 20\%$ arus kas tabungan.
2. **$C_2$ (Expense Control, Cost, Bobot $w_2 = 0.30$):** Pengeluaran $\le 70\%$ dari pemasukan.
3. **$C_3$ (Budget Discipline, Cost, Bobot $w_3 = 0.20$):** Pemakaian anggaran $\le 85\%$ batas limit.
4. **$C_4$ (Liquidity Buffer, Benefit, Bobot $w_4 = 0.20$):** Cadangan kas darurat $\ge 3$ bulan pengeluaran.

Nilai preferensi SAW:
$$V = \sum_{j=1}^{n} w_j \cdot r_{ij}$$

Klasifikasi Status Finansial:
- $V \ge 0.80$: **Strong**
- $0.60 \le V < 0.80$: **Stable**
- $0.40 \le V < 0.60$: **Warning**
- $V < 0.40$: **Critical**

### 3.2 Protokol Pengujian Komparatif
- **Kondisi A (Pure LLM):** Model `openai/gpt-oss-20b` hanya diberikan angka mentah (pemasukan, pengeluaran, saldo, batas anggaran) tanpa bantuan skor deterministik. LLM diminta menghitung surplus, rasio pengeluaran, tingkat tabungan, rasio dana darurat, dan menentukan status secara mandiri.
- **Kondisi B (FINAI Hybrid):** Sistem menghitung seluruh rasio dan skor SAW secara deterministik melalui backend TypeScript, lalu menyuntikkan data resmi tersebut ke dalam *system context*.
- **Pengulangan (Repetition):** Dilakukan pengujian berulang per skenario untuk mengukur konsistensi stokastik (*inter-repetition consistency*).

---

## 4. Bagian III: Pengujian Black-Box Integritas Transaksi & Konkurensi Atomik

Menguji keandalan sistem backend FINAI pada PostgreSQL dan Prisma ORM:
1. **Human-in-the-Loop (HITL) Safety Invariant:**
   - Proposal/Draf kartu dibuat AI $\rightarrow$ Verifikasi basis data: **Tepat 0 mutasi**.
   - Pengguna membatalkan kartu $\rightarrow$ Verifikasi basis data: **Tepat 0 mutasi**.
   - Pengguna mengonfirmasi kartu $\rightarrow$ Verifikasi basis data: **Tepat 1 mutasi atomik**.
2. **Proteksi Saldo Tidak Mencukupi (Overdraft Protection):**
   - Transaksi pengeluaran melebihi saldo dompet ditolak dengan `InsufficientBalanceError`.
3. **Transfer Atomik Antar-Dompet:**
   - Pendebitan dompet asal dan pengkreditan dompet tujuan terjadi dalam satu `prisma.$transaction`.
4. **Uji Konkurensi Paralel (Race Condition Anti Double-Spending):**
   - 10 permintaan transfer sebesar Rp600.000 dikirimkan secara serentak (`Promise.all`) pada dompet yang hanya bersaldo Rp1.000.000.
   - Hasil yang diharapkan: **Tepat 1 transaksi berhasil, 9 transaksi ditolak**, saldo akhir tidak boleh negatif (**Rp400.000**).

---

## 5. Cara Menjalankan Suite Pengujian

Seluruh pengujian dapat dijalankan langsung menggunakan perintah npm / tsx:

```bash
# 1. Menjalankan Unit Test Mesin SAW (11 Kasus Uji)
npx tsx evaluations/scripts/run_saw_unit_tests.ts

# 2. Menjalankan Pengujian Black-Box Konkurensi Atomik & HITL
npx tsx evaluations/scripts/run_concurrency_hitl_test.ts

# 3. Menjalankan Evaluasi Ekstraksi NLP (220 Kalimat Percakapan)
npx tsx evaluations/scripts/run_nlp_evaluation.ts

# 4. Menjalankan Eksperimen Komparatif Halusinasi Numerik (Pure LLM vs FINAI)
npx tsx evaluations/scripts/run_hallucination_experiment.ts
```
