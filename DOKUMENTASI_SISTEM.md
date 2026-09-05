# 📘 DOKUMENTASI LENGKAP SISTEM FINAI (SPATIAL FINANCE)

> Versi: Phase 9 + 8.5.x — AI Groq + Structured Cards + Real Data (September 2026)

---

## 1. Ringkasan & Stack

**FinAI** adalah web app personal finance dengan AI copilot (bukan chatbot teks). Fitur: dompet, transaksi atomik, anggaran bulanan, target impian + kontribusi, analisis tren, dan **Asisten FinAI** Groq yang paham konteks finansial dan merender **card finansial** (bukan paragraf).

**Stack:** Next.js 16.3 App Router + React 19 + TypeScript strict + Tailwind 4 + Prisma 6.4 + PostgreSQL + Groq `openai/gpt-oss-20b` (fallback xAI `grok-4`) + Recharts + framer-motion + lucide-react + Zod.

**Design tokens:** `primary #7C7CE6`, `lavender #E4E2FB`, `text #242636`, `secondary #757A95`, `border #E8EAF2`, `rounded-2xl`, `shadow [0_6px_24px_rgba(36,38,54,0.04)]`, tanpa emoji, tanpa Three.js.

---

## 2. Struktur Project

```
src/
  app/
    page.tsx              # Landing (preview chart)
    login/ page.tsx       # AuthLayout login
    register/ page.tsx    # AuthLayout register
    layout.tsx            # Root + AuthProvider
    api/
      auth/{login,register,logout,me}
      wallets/{route, [id]/route, transfer/route (deprecated alias)}
      transfers/route      # canonical POST /api/transfers
      transactions/{route, [id]/route}
      budgets/{route, [id]/route}
      goals/{route, [id]/route, [id]/contributions/route}
      settings/route
      ai/chat/route        # POST /api/ai/chat → Groq
    app/                   # Protected (middleware /app/*)
      layout.tsx           # Sidebar + MobileBottomNav
      page.tsx             # Dashboard (chart real 6 bulan)
      wallets/page.tsx
      transactions/page.tsx
      budgets/page.tsx
      goals/page.tsx
      analytics/page.tsx   # chart real per period + donut/bar real
      ai-assistant/page.tsx
      settings/page.tsx
  components/
    ai/{AIAssistantPage, AIMessage, AIConversation, AIInput, AIHeader, AIContextBar, AIQuickActions,
        AIFinancialActionCard, AIThinking, AIError, AIEmptyState, AIResponseRenderer,
        cards/{BudgetCard, GoalCard, WalletCard (WalletSummaryCard), SummaryCard, TransferActionCard, GoalContributionCard, ClarificationCard}}
    charts/{IncomeExpenseChart, FinancialTooltip, ChartLegend, ChartPeriodSelect}
    wallets/*, transactions/*, budgets/*, goals/*, navigation/*, sidebar/*, settings/*, ui/*, loading/*
  lib/
    ai/{grok.ts, ai.prompts.ts, ai.schemas.ts}
    auth/{session.ts, password.ts, jwt.ts, auth.ts}
    services/{wallet, transaction, transfer, budget, goal, settings, auth}.service.ts
    serializers/{wallet, transaction, budget, goal}.ts
    validations/{wallet, transaction, budget, goal, auth, settings}.ts
    api-client.ts, api-response.ts, db.ts, format.ts, data-refresh.ts
  context/AuthContext.tsx
  types/index.ts
prisma/{schema.prisma, seed.ts, migrations/}
```

---

## 3. Arsitektur Data

```
Frontend (useState + apiClient)
  ↓ {GET,POST,PATCH,DELETE} JSON {success, data}
API Route (auth via getCurrentUser() → session.userId, Zod safeParse)
  ↓ Service (ownership where:{userId}, Prisma.$transaction)
  ↓ PrismaClient → PostgreSQL (Decimal 15,2, UUID, indexes)
```

**Sync:** `src/lib/data-refresh.ts` (`CustomEvent 'finai:refresh'` + `emitRefresh('transaction'|'wallet'|'transfer'|'budget'|'goal')` + `onRefresh`) — tanpa localStorage finansial, DB source of truth.

---

## 4. Database (schema.prisma)

- **User** `{id, name, email @unique, passwordHash, avatarUrl}` → `wallets, transactions, budgets, goals, sessions, settings`
- **Session** `{userId, tokenHash @unique (sha256), expiresAt}` — httpOnly `finai_session` 7/30d
- **Wallet** `{userId, name, type BANK/E_WALLET/CASH, balance Decimal default 0, institution, accountLast4, color, icon}`
- **Transaction** `{userId, walletId → Wallet, type INCOME/EXPENSE, amount Decimal, category, description, transactionDate}`
- **Budget** `{userId, category, limitAmount Decimal, month, year} @unique[userId,category,month,year]` + computed `usedAmount, remaining, percentage, status SAFE(<70)/WARNING(70-90)/CRITICAL(>90)`
- **Goal** `{userId, name, category, targetAmount, currentAmount default 0, deadline, sourceWalletId, destinationWalletId, frequency WEEKLY/MONTHLY, autoDeposit, nextDueDate} + contributions`
- **GoalContribution** `{goalId → Goal, sourceWalletId → Wallet, amount Decimal, contributionDate}`
- **UserSettings** `{userId @unique, language, currency, defaultWalletId, budgetReminder, goalReminder, financialSummary, aiPersonalization, aiActionConfirmation @default true, animations}`

---

## 5. Auth

- `POST /api/auth/register` → hash bcrypt 12 + create user + settings defaults + `createSession` (30d) + cookie
- `POST /api/auth/login` → `comparePassword` + `createSession` (30d jika rememberMe else 7d)
- `GET /api/auth/me` → `validateSessionToken` (hash, expiry, delete expired)
- `POST /api/auth/logout` → `deleteSession` + `cookie delete`
- **Middleware** `src/middleware.ts` (proxy) — `PROTECTED_PAGE_PREFIX /app` + `PROTECTED_API_PREFIXES` (wallets, transactions, budgets, goals, settings, auth/me, transfers, ai) — 401 JSON jika API tanpa cookie, 302 `/login?redirect=` jika page, redirect `/login|/register → /app` jika sudah auth. **Matcher** cover `/app/:path*`, `/api/wallets/:path*`, `/api/transactions/:path*`, `/api/budgets/:path*`, `/api/goals/:path*`, `/api/settings`, `/api/settings/:path*`, `/api/transfers`, `/api/transfers/:path*`, `/api/ai/:path*`.
- **JWT legacy** `src/lib/auth/jwt.ts` — sekarang `getSecretKey()` throw jika `AUTH_SECRET` kosong (hapus fallback hardcoded).

---

## 6. Wallet API

- `GET /api/wallets` → `WalletService.getWallets(userId)` → `serializeWallets`
- `POST /api/wallets` → `CreateWalletSchema {name 2-50, type BANK/E_WALLET/CASH default BANK, institution ≤50, accountLast4 ≤10, balance ≥0 default 0, color, icon} strict` → `prisma.wallet.create {userId, balance Decimal}`
- `GET /api/wallets/[id]`, `PATCH /api/wallets/[id]` → `UpdateWalletSchema {name?, type?, institution?, accountLast4?, color?, icon?} strict` — **tanpa balance** (logika bisnis: saldo hanya via transaksi)
- `DELETE /api/wallets/[id]` → cek `_count {transactions, goalContributions, sourceGoals, destinationGoals}` → throw `WalletInUseError` 409 jika terpakai → `apiError WALLET_IN_USE`
- Ownership selalu `where:{id, userId}` — client tidak kontrol `userId`.

---

## 7. Transaction API

- `GET /api/transactions?walletId&type&category&startDate&endDate&limit&offset` → `TransactionService.getTransactions` (Prisma where + include wallet)
- `POST /api/transactions` → `CreateTransactionSchema {walletId uuid, type INCOME/EXPENSE, amount >0 finite, category 1-50, description 1-255, transactionDate?} strict` → `prisma.$transaction`: verify wallet ownership, `if EXPENSE && balance < amount → InsufficientBalanceError 409`, `wallet.update {balance: decrement/increment}`, `transaction.create`
- `PATCH /api/transactions/[id]` → reverse efek lama (`increment` jika EXPENSE else `decrement`), validate wallet baru & balance, apply baru, `transaction.update`
- `DELETE /api/transactions/[id]` → reverse balance lalu `transaction.delete` — semua atomik.

**Serialisasi:** `amount` dan `balance` sebagai `string Decimal "12500000.00"` via `serializeWallet/Transaction`.

---

## 8. Transfer API (Canonical)

- `POST /api/transfers` (legacy alias `POST /api/wallets/transfer` → delegate `transfersPOST`) → `TransferWalletSchema {fromWalletId uuid, toWalletId uuid, amount >0, date?, note ≤200}` → `TransferService.transferBetweenWallets`: `prisma.$transaction` → `wallet.updateMany where:{id:from, userId, balance gte amount} decrement` (0 → `TransferInsufficientBalanceError`), `wallet.update where:{id:to} increment` — **tidak buat EXPENSE/INCOME transaction** (internal transfer).
- Frontend Dashboard `POST /api/transfers`, AI `POST /api/transfers` — tidak via dua transaksi.

---

## 9. Budget API

- `GET /api/budgets?month&year` → `BudgetService.getBudgets(userId, month, year)` → `enrichBudgetUsage`: `prisma.transaction.findMany where type EXPENSE + month window` → `usedAmount, remainingAmount, percentage, status SAFE/WARNING/CRITICAL` per `year-month-category`.
- `POST /api/budgets` → `CreateBudgetSchema {category 1-50, limitAmount >0, month 1-12, year 2020-2100}` → 409 CONFLICT jika sudah ada
- `PATCH /api/budgets/[id]` → `UpdateBudgetSchema {limitAmount?}` (hanya limit di UI)
- `DELETE /api/budgets/[id]`

**Dashboard preview** hanya `limitAmount`, `period/startDate` di modal tidak dikirim (by design).

---

## 10. Goal & Contribution API

- `GET /api/goals` → `GoalService.getGoals` + `computeGoalMetrics {remaining, progress%, remainingMonths, recommendedMonthly}`
- `POST /api/goals` → `CreateGoalSchema {name 2-100, category 1-50, targetAmount >0, deadline, sourceWalletId?, destinationWalletId?, frequency WEEKLY/MONTHLY default MONTHLY, autoDeposit?}` → `currentAmount 0`
- `PATCH /api/goals/[id]` → update + `nextDueDate` recalc jika `autoDeposit` toggle
- `DELETE /api/goals/[id]`
- **Contribution:** `POST /api/goals/[id]/contributions` → `CreateGoalContributionSchema {sourceWalletId uuid, amount >0, contributionDate?} strict` → `prisma.$transaction`: verify goal ownership, `remaining = target - current`, `if amount > remaining throw`, `wallet.updateMany balance gte amount decrement` (409 jika saldo kurang), `goal.update currentAmount increment` (race-proof `where currentAmount <= target - amount`), `goalContribution.create`, advance `nextDueDate` jika `autoDeposit`.
- **Initial funding** di GoalsPage: `if newGoal.currentAmount >0 → POST /api/goals/[id]/contributions` — bukan via transaksi.
- Frontend Goals: create `POST /api/goals` + optional initial contribution, edit `PATCH`, delete `DELETE`, add contribution `POST /api/goals/[id]/contributions`.

---

## 11. Settings API

- `GET /api/settings` → `SettingsService.getUserSettings`
- `PATCH /api/settings` → `UpdateSettingsSchema` (language, currency, budgetReminder, goalReminder, financialSummary, aiPersonalization, aiActionConfirmation, animations) — dipakai AI toggle `Konfirmasi Sebelum Eksekusi Aksi`.

---

## 12. Asisten FinAI — Groq

**Provider:** Groq `openai/gpt-oss-20b` (`https://api.groq.com/openai/v1`, fallback xAI `grok-4` `https://api.x.ai/v1`) — `src/lib/ai/grok.ts` (`callGrok`, `AbortController 25s`, `response_format: json_object`, 401→500 sanitized, 429→rate limit). Env `GROQ_API_KEY` (primary) / `XAI_API_KEY`, `getProviderConfig()` prioritaskan Groq.

**Prompt** (`ai.prompts.ts`): larangan mengarang, wallet resolution via UUID persis (`a1b2c3d4...`), kategori `food/transport/...`, amount string, 8 contoh + budget/goal/wallet/summary/insight. Context per request: `wallets{id,name,type,balance} + goals + budgets{limit/used/remaining/%/status} + 5 transaksi` — minimal aman.

**Route** `POST /api/ai/chat` (`src/app/api/ai/chat/route.ts`): `auth → isGrokConfigured → Zod {message 1-2000, history[10] max20} → build context (prisma 20/20/5 + BudgetService enriched) → callGrok → return {response, meta:{provider, model, timestamp}}` — never expose key, never trust `userId` dari body.

**Schema** (`ai.schemas.ts`): `AIChatRequestSchema`, `GrokStructuredResponseSchema` discriminated union `text|financial_action|clarification|error|budget|goal|wallet|summary|insight` — `financial_action {action:create_transaction|transfer|goal_contribution, payload:{transactionType, amount:"10000", walletId, ...}, requiresConfirmation:true}` + read-only cards `budget{category,limit,used,remaining,%,period}`, `goal{name,target,current,remaining,%,deadline}`, `wallet{wallets[], totalBalance}`, `summary{period,income,expense,remaining,budget%,activeGoals}`.

**Clarification Existing Goal:**
- Saat `detectPlanningIntent()` menemukan `relatedGoal` (goal yang sama atau menyerupai intent user), route bisa memprioritaskan `clarification` daripada langsung `financial_plan`.
- Response `clarification` bisa membawa `data.relatedGoalId`, `data.newGoalHref`, `data.newGoalLabel`, `data.existingGoalName`.
- Card `ClarificationCard` menampilkan opsi **“Tambah ke target ini”** dan **“Buat target baru”** jika field tersebut ada.
- `AIAssistantPage.tsx` harus memetakan `data` dari response Grok ke objek `clarification` di `AIMessageType`.

**UI** (`src/components/ai/`):
- `AIAssistantPage.tsx` — `fetchContextData` (wallets+goals+budgets+tx+settings), `handleSendMessage` → `POST /api/ai/chat` → map `financial_action` (validate `isValidWalletId` vs `liveWallets`, resolve `walletName→id`, auto `wallets.length===1`, clarification jika unresolved, `wallets.length===0 → belum punya dompet`), `pendingMetaRef` + `confirmingIds` guard, `handleConfirmAction` → `POST /api/transactions|transfers|contributions` + `emitRefresh` + `fetchContextData`, `handleCancelAction`, `aiActionConfirmation` refetch + auto `finai:auto-confirm` 500ms jika toggle OFF.
- `AIResponseRenderer.tsx` — central switch: `text → Jawaban FinAI card`, `financial_action expense/income → AIFinancialActionCard`, `transfer → TransferActionCard`, `goal_contribution → GoalContributionCard` (progress `25%→30%`), `budget → BudgetCard`, `goal → GoalCard`, `wallet → WalletSummaryCard`, `summary → SummaryCard`, `insight → AIInsightCard`, `error → AIError`, `clarification → ClarificationCard`.
- **Cards** (`cards/`): `BudgetCard`, `GoalCard`, `WalletCard`, `SummaryCard`, `TransferActionCard`, `GoalContributionCard`, `ClarificationCard` — putih `rounded-2xl border #E8EAF2 shadow [0_6px_24px]`, badge `EDEAFC/#5F5ED4`, progress, grid Terpakai/Sisa, responsive (`ArrowRight` desktop `ArrowDown` mobile).
- **Safety:** Grok hanya proposal, mutasi hanya `[Confirm]` → existing API, `requiresConfirmation:true`, anti double-click (`confirmingIds` + disabled + spinner), `emitRefresh` sync global.

**Chart:** `IncomeExpenseChart` presentational `data: ChartDataPoint[]` + `isLoading/error` + empty `Belum ada data arus kas` + CTA `/app/transactions` — Dashboard agregasi 6 bulan, Analytics agregasi `7H/30H/3B/6B/12B` dari `GET /api/transactions` real (bukan `SIX_MONTHS_DATA`).

---

## 13. Validasi & Keamanan

- **Lint/Build:** `npm run lint (tsc --noEmit) PASS 0`, `npm run build PASS 26 pages + /api/ai/chat`
- **Tests:** `npx tsx tests/ai.test.ts 27/27 PASS` (validation, structured, 429, natural: ayam geprek 10k, kopi 25k GoPay, gaji 5jt BCA, nabung 500k kuliah NOT expense, transfer 200k)
- **Keamanan:** `DATABASE_URL`, `GROQ_API_KEY` hanya server (`grok.ts`, `db.ts`), 0 `NEXT_PUBLIC_`, `finai_session` httpOnly, `AUTH_SECRET` wajib (throw jika kosong), ownership `where:{userId}`, financial `localStorage` 0 (hanya `finai-sidebar-groups`).

---

## 14. Alur User Cont. 9 Flow (PASS via inspection)

Landing→Register→Dashboard, Add Wallet, Add Transaction→balance, Transfer→source- destinasi, Goal+Contribution, Budget, Analytics real, AI Assistant, Settings→Logout→Login persists.
