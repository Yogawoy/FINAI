# FinAI — Personal Finance Copilot

> Kelola dompet, transaksi, anggaran, target impian, dan analisis keuangan dengan **asisten AI Groq** yang paham konteks finansialmu. Dibangun dengan Next.js 16, Prisma, PostgreSQL, dan Tailwind — bukan chatbot teks biasa, tapi **financial copilot dengan card UI**.

[![Next.js](https://img.shields.io/badge/Next.js-16.3-000?logo=next.js)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![Prisma](https://img.shields.io/badge/Prisma-6.4-2D3748?logo=prisma)](https://prisma.io)
[![Groq](https://img.shields.io/badge/Groq-openai%2Fgpt--oss--20b-F5500A)](https://groq.com)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

---

## ✨ Fitur Utama

|| Modul | Deskripsi | Status |
||-------|-----------|--------|
|| **Dompet** | Bank / E-Wallet / Tunai, saldo atomik, transfer antar dompet | ✅ |
|| **Transaksi** | INCOME/EXPENSE, kategori, wallet, atomic balance, filter & pagination | ✅ |
|| **Anggaran** | Per kategori per bulan, progress, status SAFE/WARNING/CRITICAL | ✅ |
|| **Target Impian** | Goal + kontribusi atomik, progress, deadline, auto-deposit | ✅ |
|| **Analisis** | Tren arus kas (real data), kategori donut, ritme mingguan | ✅ |
|| **Asisten FinAI** | Groq `openai/gpt-oss-20b` + structured cards + konfirmasi aman | ✅ |
|| **Dashboard** | Ringkasan saldo, rasio tabungan, transaksi terakhir, chart 6 bulan real | ✅ |

**AI Assistant cards:** `Transaction`, `Transfer`, `Goal Contribution`, `Budget`, `Goal`, `Wallet`, `Summary`, `Insight` — semua **card putih premium** (`#7C7CE6`, `#E4E2FB`, `#242636`) dengan Lucide icons, tanpa emoji.

---

## 🏗️ Arsitektur

```
Browser (React 19)
  ↓ apiClient (shared fetch, 401 → /login)
Next.js API Route (/api/*)
  ↓ Service (WalletService, TransactionService, TransferService, BudgetService, GoalService)
  ↓ Prisma.$transaction (atomic increment/decrement, updateMany gte check)
  ↓ PostgreSQL (Decimal 15,2)
```

**AI Flow:**
```
AI Input → POST /api/ai/chat {message, history:10} 
  → auth via httpOnly finai_session
  → context: wallets{saldo} + budgets{limit/used/sisa/%} + goals + 5 transaksi terakhir
  → Groq openai/gpt-oss-20b (https://api.groq.com/openai/v1, json_object, temp 0.3)
  → structured JSON {type: financial_action|budget|goal|wallet|summary|insight|text|clarification}
  → AIResponseRenderer → Card UI
  → [Confirm] → POST /api/transactions|/api/transfers|/api/goals/[id]/contributions
  → emitRefresh('transaction'|'transfer'|'goal_contribution') → semua halaman refresh
```

**Data Sync:** `src/lib/data-refresh.ts` — `CustomEvent 'finai:refresh'` tanpa localStorage finansial, DB tetap source of truth.

---

## 🧩 Tech Stack

- **Framework:** Next.js 16.3 App Router, React 19, TypeScript strict
- **Styling:** Tailwind CSS 4, framer-motion, Recharts, lucide-react
- **DB:** PostgreSQL + Prisma 6.4 (Decimal, UUID, indexes)
- **Auth:** httpOnly `finai_session` (sha256, 7/30d, SameSite lax), bcrypt 12, jose (JWT legacy)
- **AI:** Groq `openai/gpt-oss-20b` (fallback xAI `grok-4`), `response_format: json_object`, 25s timeout
- **Validation:** Zod, `apiResponse {success, data|error}`
- **Design:** `#7C7CE6` primary, `#E4E2FB` lavender, `#242636` text, `#757A95` secondary, rounded-2xl, border `#E8EAF2`

---

## 🚀 Getting Started

### 1. Env
```bash
cp .env.example .env.local
# isi:
DATABASE_URL="postgresql://postgres:***@localhost:5432/finai?schema=public"
AUTH_SECRET="min-32-char-random-string-untuk-production"
GROQ_API_KEY="gsk_xxx"   # dari https://console.groq.com/keys (model openai/gpt-oss-20b)
# optional fallback:
XAI_API_KEY="xai-xxx"
```

### 2. DB
```bash
npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed   # demo@finai.local / password123
```

### 3. Dev
```bash
npm run dev      # http://localhost:3000
npm run lint     # tsc --noEmit
npm run build    # production
npx tsx tests/ai.test.ts  # 27 AI tests
```

### 4. Akun
- Register `/register` atau login `/login` → redirect `/app`
- Demo: `demo@finai.local` / `password123`

---

## 🔌 API Endpoints

|| Method | Path | Auth | Deskripsi |
||--------|------|------|-----------|
|| POST | `/api/auth/register` | No | `name, email, password` → set cookie |
|| POST | `/api/auth/login` | No | `email, password, rememberMe` |
|| POST | `/api/auth/logout` | No | hapus session + cookie |
|| GET | `/api/auth/me` | Yes | current user |
|| GET/POST | `/api/wallets` | Yes | list / create `{name, type, balance, institution, accountLast4}` |
|| GET/PATCH/DELETE | `/api/wallets/[id]` | Yes | detail/update (tanpa balance)/delete (409 jika terpakai) |
|| POST | `/api/transfers` | Yes | transfer `{fromWalletId, toWalletId, amount}` atomik |
|| GET/POST | `/api/transactions` | Yes | `?walletId&type&category&limit&offset` / create `{walletId, type, amount, category, description}` |
|| GET/PATCH/DELETE | `/api/transactions/[id]` | Yes | atomic reverse & reapply balance |
|| GET/POST | `/api/budgets` | Yes | `?month&year` / `{category, limitAmount, month, year}` |
|| PATCH/DELETE | `/api/budgets/[id]` | Yes | update `limitAmount` |
|| GET/POST | `/api/goals` | Yes | list / `{name, category, targetAmount, deadline, frequency, autoDeposit}` |
|| PATCH/DELETE | `/api/goals/[id]` | Yes | update / delete |
|| POST | `/api/goals/[id]/contributions` | Yes | `{sourceWalletId, amount}` decrement wallet + increment goal |
|| GET/PATCH | `/api/settings` | Yes | `language, currency, aiActionConfirmation, ...` |
|| POST | `/api/ai/chat` | Yes | `{message, history[10]}` → Groq structured `{type, data, message}` |

Semua `amount`/`balance` diserialisasi `Decimal → string "12500000.00"`.

---

## 🗄️ Database (Prisma)

`User 1—N Wallet, Transaction, Budget, Goal, Session, UserSettings`

`Wallet {id, userId, name, type BANK/E_WALLET/CASH, balance Decimal(15,2), institution, accountLast4, color, icon}`

`Transaction {userId, walletId, type INCOME/EXPENSE, amount Decimal, category, description, transactionDate}`

`Budget {userId, category, limitAmount Decimal, month, year} + computed usedAmount/remaining/percentage/status`

`Goal {userId, name, category, targetAmount, currentAmount, deadline, sourceWalletId, destinationWalletId, frequency, autoDeposit, nextDueDate} + GoalContribution {goalId, sourceWalletId, amount}`

---

## 🤖 Asisten FinAI

**Model:** `openai/gpt-oss-20b` via Groq (`https://api.groq.com/openai/v1`, fallback `grok-4` xAI)

**System prompt** (`src/lib/ai/ai.prompts.ts`): larangan mengarang saldo/wallet, wallet resolution via UUID persis, kategori `food/transport/...`, amount string, 8 contoh + budget/goal/wallet/summary/insight.

**Context per request:** `wallets{id,name,type,balance} + goals + budgets{limit/used/remaining/%/status} + 5 transaksi` — minimal, aman.

**Structured cards** (`src/components/ai/cards/`):
- `TransactionActionCard` (expense/income) — PENGELUARAN, nominal, kategori, dompet, tanggal, [Batal][Simpan]
- `TransferActionCard` — BCA `-500k →` GoPay `+500k`
- `GoalContributionCard` — Dari BCA → Ke Tabungan Kuliah + progress `25%→30%`
- `BudgetCard`, `GoalCard`, `WalletSummaryCard`, `SummaryCard`, `InsightCard`
- **Renderer** `AIResponseRenderer.tsx` — switch `type: financial_action|budget|goal|wallet|summary|insight|text|clarification|error`

**Safety:** Grok hanya `proposal` (`requiresConfirmation:true`), mutasi hanya `[Confirm]` → `apiClient.post` existing financial API, `confirmingIds` anti double-click, `emitRefresh`. Toggle `Settings → Konfirmasi Sebelum Eksekusi Aksi` (`aiActionConfirmation` default `true`): ON = wajib Confirm, OFF = auto-record 500ms.

**Clarification Existing Goal:** jika user mengetik pesan perencanaan (mis. “mau nabung kuliah”) dan `detectPlanningIntent()` menemukan `relatedGoal` yang sudah ada, `/api/ai/chat` bisa mengembalikan:
- `type: clarification`
- `message`: pertanyaan klarifikasi
- `data.relatedGoalId`, `data.newGoalHref`, `data.newGoalLabel`, `data.existingGoalName`

Card `ClarificationCard` akan menampilkan opsi **“Tambah ke target ini”** dan **“Buat target baru”** jika field tersebut ada. `AIAssistantPage.tsx` harus memetakan `data` dari response Grok ke objek `clarification` di `AIMessageType` (saat ini hanya `message` yang dipetakan — perlu penyesuaian jika ingin opsi tombol muncul).

**Clarification dari `financial_plan` dari Grok:** jika response Grok berupa `financial_plan` namun sistem mendeteksi `relatedGoal` yang cocok, route kini dapat memprioritaskan `clarification` agar user ditanyakan apakah akan menambahkan setoran ke target yang sudah ada atau membuat target baru.

**Chart:** `IncomeExpenseChart` presentational `data: ChartDataPoint[]` + `isLoading/error` + empty `Belum ada data arus kas` + CTA `/app/transactions` — Dashboard agregasi 6 bulan, Analytics agregasi per `7 Hari/30 Hari/3/6/12 Bulan` dari `GET /api/transactions` real (bukan `SIX_MONTHS_DATA`).

---

## 🔒 Keamanan

- `DATABASE_URL`, `GROQ_API_KEY` hanya server (`src/lib/ai/grok.ts`, `src/lib/db.ts`) — 0 `NEXT_PUBLIC_`, 0 di client bundle
- `finai_session` httpOnly, secure production, SameSite lax — tidak di `localStorage`
- `AUTH_SECRET` wajib — `jwt.ts` throw jika kosong (hapus fallback)
- Ownership `where:{userId: session.userId}` di semua service — tidak dari body client
- Middleware `proxy` lindungi `/app/*`, `/api/wallets|transactions|budgets|goals|settings|transfers|ai`
- Financial `localStorage` 0 — hanya `finai-sidebar-groups` UI pref

---

## ✅ Validasi

```bash
npm run lint   # tsc PASS 0
npm run build  # Next 16 PASS 26 pages + /api/ai/chat
npx tsx tests/ai.test.ts  # 27 PASS (validation, structured, 429, natural cases)
```

---

## 📄 Lisensi

MIT — FinAI Spatial Finance 2026.
