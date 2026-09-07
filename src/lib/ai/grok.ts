import {
  FINAI_GROK_BASE_URL,
  FINAI_GROK_MODEL,
  FINAI_XAI_BASE_URL,
  FINAI_XAI_MODEL,
  FINAI_SYSTEM_PROMPT,
} from './ai.prompts';
import type { GrokChatMessage, GrokCompletionResponse, GrokStructuredResponse, GrokUserContext } from './ai.schemas';
import { GrokStructuredResponseSchema } from './ai.schemas';

// ---------------------------------------------------------------------------
// Error classes
// ---------------------------------------------------------------------------

export class GrokConfigurationError extends Error {
  constructor(message = 'GROQ_API_KEY / XAI_API_KEY belum dikonfigurasi') {
    super(message);
    this.name = 'GrokConfigurationError';
  }
}

export class GrokRateLimitError extends Error {
  constructor(message = 'FinAI Assistant sedang sibuk. Coba lagi beberapa saat.') {
    super(message);
    this.name = 'GrokRateLimitError';
  }
}

export class GrokApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'GrokApiError';
    this.status = status;
  }
}

// ---------------------------------------------------------------------------
// Provider resolution — Groq primary, xAI fallback
// ---------------------------------------------------------------------------

interface ProviderConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

function getProviderConfig(): ProviderConfig {
  const groqKey = process.env.GROQ_API_KEY?.trim();
  if (groqKey) {
    return { apiKey: groqKey, baseUrl: FINAI_GROK_BASE_URL, model: FINAI_GROK_MODEL };
  }
  const xaiKey = process.env.XAI_API_KEY?.trim();
  if (xaiKey) {
    return { apiKey: xaiKey, baseUrl: FINAI_XAI_BASE_URL, model: FINAI_XAI_MODEL };
  }
  throw new GrokConfigurationError();
}

function formatIDR(numStr: string | number | undefined | null): string {
  const n = Number(numStr) || 0;
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
}

function buildContextBlock(ctx: GrokUserContext): string {
  const lines: string[] = [];
  lines.push(`Tanggal hari ini: ${ctx.currentDate}`);
  lines.push('');

  if (ctx.wallets.length > 0) {
    lines.push('Daftar wallet milik user:');
    ctx.wallets.forEach((w) => {
      const bal = w.balance ? `, saldo: ${formatIDR(w.balance)}` : '';
      lines.push(`- ${w.name} (id: ${w.id}, type: ${w.type}${bal})`);
    });
  } else {
    lines.push('User belum memiliki wallet.');
  }
  lines.push('');

  if (ctx.goals.length > 0) {
    lines.push('Daftar target/goal milik user:');
    ctx.goals.forEach((g) => {
      const target = typeof g.targetAmount === 'string' ? g.targetAmount : g.targetAmount != null ? String(g.targetAmount) : '';
      const current = typeof g.currentAmount === 'string' ? g.currentAmount : g.currentAmount != null ? String(g.currentAmount) : '';
      const remaining = typeof g.remainingAmount === 'string' ? g.remainingAmount : g.remainingAmount != null ? String(g.remainingAmount) : '';
      const pct = typeof g.percentage === 'number' ? g.percentage : 0;
      const deadline = typeof g.deadline === 'string' ? g.deadline : 'tidak ada';
      lines.push(`- ${g.name} (id: ${g.id}, kategori: ${g.category}, target: ${formatIDR(target)}, tercapai: ${formatIDR(current)}, sisa: ${formatIDR(remaining)}, ${pct}%, deadline: ${deadline})`);
    });
  } else {
    lines.push('User belum memiliki target/goal.');
  }
  lines.push('');

  if (ctx.budgets.length > 0) {
    lines.push('Daftar anggaran/budget (bulan ini):');
    ctx.budgets.forEach((b) => {
      if (b.limitAmount) {
        const limit = formatIDR(b.limitAmount);
        const used = b.usedAmount ? formatIDR(b.usedAmount) : 'Rp0';
        const remain = b.remainingAmount ? formatIDR(b.remainingAmount) : limit;
        const pct = typeof b.percentage === 'number' ? b.percentage : 0;
        const status = typeof b.status === 'string' ? b.status : pct >= 90 ? 'CRITICAL' : pct >= 70 ? 'WARNING' : 'SAFE';
        lines.push(`- ${b.category}: batas ${limit}, terpakai ${used}, sisa ${remain}, ${pct}% (${status})`);
      } else {
        lines.push(`- ${b.category}`);
      }
    });
  } else {
    lines.push('User belum memiliki anggaran/budget bulan ini.');
  }
  lines.push('');

  if (ctx.recentTransactions.length > 0) {
    lines.push('Transaksi terbaru (5 terakhir):');
    ctx.recentTransactions.forEach((t) => {
      const amount = typeof t.amount === 'string' ? t.amount : t.amount != null ? String(t.amount) : '';
      lines.push(`- ${t.description} | ${t.category} | ${t.type} | Rp${amount}`);
    });
  }
  lines.push('');

  if (ctx.financialSummary) {
    lines.push('Ringkasan finansial bulan ini:');
    lines.push(`- Pemasukan: ${formatIDR(Number(ctx.financialSummary.income))}`);
    lines.push(`- Pengeluaran: ${formatIDR(Number(ctx.financialSummary.expense))}`);
    lines.push(`- Sisa: ${formatIDR(Number(ctx.financialSummary.remaining))}`);
    if (typeof ctx.financialSummary.budgetPercentage === 'number') {
      lines.push(`- Penggunaan budget keseluruhan: ${ctx.financialSummary.budgetPercentage}%`);
    }
    lines.push(`- Target aktif: ${ctx.financialSummary.activeGoals}`);
  }
  lines.push('');

  if (ctx.categoryTotals?.items?.length) {
    lines.push(`Breakdown pengeluaran terbesar (${ctx.categoryTotals.period || 'periode terkait'}):`);
    ctx.categoryTotals.items.slice(0, 5).forEach((item) => {
      const total = typeof item.total === 'string' ? item.total : item.total != null ? String(item.total) : '';
      const pct = typeof item.percentage === 'number' ? item.percentage : 0;
      lines.push(`- ${item.category}: ${formatIDR(Number(total))}${pct ? `, ${pct}%` : ''}`);
    });
  }
  lines.push('');

  if (ctx.trend) {
    lines.push('Tren pengeluaran:');
    lines.push(`- Periode ini: ${formatIDR(Number(ctx.trend.currentPeriodExpense))}`);
    if (ctx.trend.previousPeriodExpense) {
      lines.push(`- Periode sebelumnya: ${formatIDR(Number(ctx.trend.previousPeriodExpense))}`);
    }
    if (typeof ctx.trend.changePercentage === 'number') {
      lines.push(`- Perubahan: ${ctx.trend.changePercentage > 0 ? '+' : ''}${ctx.trend.changePercentage}%`);
    }
  }
  lines.push('');

  lines.push('');
  lines.push('Cash flow bulanan aktual:');
  if (typeof ctx.monthlyIncome === 'string' || typeof ctx.monthlyIncome === 'number') {
    lines.push(`- Pemasukan bulanan: ${formatIDR(Number(ctx.monthlyIncome || '0'))}`);
  } else {
    lines.push('- Pemasukan bulanan: data belum tersedia');
  }
  if (typeof ctx.monthlyExpense === 'string' || typeof ctx.monthlyExpense === 'number') {
    lines.push(`- Pengeluaran bulanan: ${formatIDR(Number(ctx.monthlyExpense || '0'))}`);
  } else {
    lines.push('- Pengeluaran bulanan: data belum tersedia');
  }
  if (typeof ctx.monthlyNetCashFlow === 'string' || typeof ctx.monthlyNetCashFlow === 'number') {
    lines.push(`- Surplus bulanan: ${formatIDR(Number(ctx.monthlyNetCashFlow))}`);
  } else {
    lines.push('- Surplus bulanan: data belum tersedia');
  }
  lines.push('');

  return lines.join('\n');
}

function safeParseStructuredResponse(raw: string): GrokStructuredResponse | null {
  const trimmed = raw.trim();

  // Try direct JSON parse
  try {
    const parsed = JSON.parse(trimmed);
    const result = GrokStructuredResponseSchema.safeParse(parsed);
    if (result.success) return result.data;
  } catch {
    // fall through
  }

  // Try extracting JSON from markdown fence
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    try {
      const parsed = JSON.parse(fenceMatch[1].trim());
      const result = GrokStructuredResponseSchema.safeParse(parsed);
      if (result.success) return result.data;
    } catch {
      // fall through
    }
  }

  // Try finding JSON object boundaries
  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) {
    try {
      const parsed = JSON.parse(trimmed.slice(start, end + 1));
      const result = GrokStructuredResponseSchema.safeParse(parsed);
      if (result.success) return result.data;
    } catch {
      // fall through
    }
  }

  // Fallback: tolerate financial_action missing top-level action/payload wrapper
  const fallbackStart = trimmed.indexOf('{');
  const fallbackEnd = trimmed.lastIndexOf('}');
  if (fallbackStart !== -1 && fallbackEnd !== -1 && fallbackEnd > fallbackStart) {
    try {
      const parsed = JSON.parse(trimmed.slice(fallbackStart, fallbackEnd + 1));
      if (parsed && typeof parsed === 'object' && parsed.type === 'financial_action' && parsed.payload) {
        const inferredAction =
          parsed.payload.transactionType === 'INCOME' || parsed.payload.transactionType === 'EXPENSE'
            ? 'create_transaction'
            : parsed.payload.goalId || parsed.payload.goalName
            ? 'goal_contribution'
            : parsed.payload.sourceWalletId || parsed.payload.sourceWalletName ||
              parsed.payload.destinationWalletId || parsed.payload.destinationWalletName
            ? 'transfer'
            : 'create_transaction';

        return {
          type: 'financial_action',
          action: inferredAction,
          message: typeof parsed.message === 'string' ? parsed.message : 'Silakan konfirmasi detail berikut sebelum disimpan:',
          payload: {
            transactionType: typeof parsed.payload.transactionType === 'string' ? parsed.payload.transactionType : undefined,
            amount: typeof parsed.payload.amount === 'string' ? parsed.payload.amount : String(parsed.payload.amount || '0'),
            description: typeof parsed.payload.description === 'string' ? parsed.payload.description : undefined,
            category: typeof parsed.payload.category === 'string' ? parsed.payload.category : undefined,
            walletId: parsed.payload.walletId ?? null,
            walletName: parsed.payload.walletName ?? null,
            sourceWalletId: parsed.payload.sourceWalletId ?? null,
            sourceWalletName: parsed.payload.sourceWalletName ?? null,
            destinationWalletId: parsed.payload.destinationWalletId ?? null,
            destinationWalletName: parsed.payload.destinationWalletName ?? null,
            goalName: parsed.payload.goalName ?? null,
            goalId: parsed.payload.goalId ?? null,
            date: parsed.payload.date ?? null,
          },
          requiresConfirmation: true,
        };
      }
    } catch {
      // fall through
    }
  }

  // Fallback: tolerate financial_plan with number fields instead of strings
  const planStart = trimmed.indexOf('{');
  const planEnd = trimmed.lastIndexOf('}');
  if (planStart !== -1 && planEnd !== -1 && planEnd > planStart) {
    try {
      const parsed = JSON.parse(trimmed.slice(planStart, planEnd + 1));
      if (parsed && typeof parsed === 'object' && parsed.type === 'financial_plan' && parsed.data && typeof parsed.data === 'object') {
        const d = parsed.data;
        if (typeof d.targetName === 'string') {
          return {
            type: 'financial_plan',
            message: typeof parsed.message === 'string' ? parsed.message : 'Berikut rencana keuangan.',
            payload: {},
            data: {
              targetName: d.targetName,
              targetAmount: typeof d.targetAmount === 'number' ? String(d.targetAmount) : d.targetAmount,
              currentAmount: typeof d.currentAmount === 'number' ? String(d.currentAmount) : (d.currentAmount || '0'),
              remainingAmount: typeof d.remainingAmount === 'number' ? String(d.remainingAmount) : (d.remainingAmount || '0'),
              durationMonths: typeof d.durationMonths === 'number' ? d.durationMonths : 0,
              requiredMonthlySaving: typeof d.requiredMonthlySaving === 'number' ? String(d.requiredMonthlySaving) : (d.requiredMonthlySaving || '0'),
              monthlyIncome: typeof d.monthlyIncome === 'number' ? String(d.monthlyIncome) : (d.monthlyIncome || '0'),
              monthlyExpense: typeof d.monthlyExpense === 'number' ? String(d.monthlyExpense) : (d.monthlyExpense || '0'),
              monthlyNetCashFlow: typeof d.monthlyNetCashFlow === 'number' ? String(d.monthlyNetCashFlow) : (d.monthlyNetCashFlow || '0'),
              requiredPercentageOfNet: typeof d.requiredPercentageOfNet === 'number' ? d.requiredPercentageOfNet : 0,
              feasibility: typeof d.feasibility === 'string' ? d.feasibility : 'insufficient_data',
              assumptions: Array.isArray(d.assumptions) ? d.assumptions.filter((x: any) => typeof x === 'string') : [],
              relatedGoalId: typeof d.relatedGoalId === 'string' ? d.relatedGoalId : null,
            },
          };
        }
      }
    } catch {
      // fall through
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Main Grok client — server-only
// ---------------------------------------------------------------------------

export interface CallGrokOptions {
  message: string;
  history?: { role: 'user' | 'assistant'; content: string }[];
  context: GrokUserContext;
}

export async function callGrok(options: CallGrokOptions): Promise<GrokStructuredResponse> {
  const { apiKey, baseUrl, model } = getProviderConfig();

  const contextBlock = buildContextBlock(options.context);

  const systemContent = `${FINAI_SYSTEM_PROMPT}\n\n---\nCONTEKS FINANSIAL USER SAAT INI:\n${contextBlock}\n---\n\nIngat: balas HANYA dengan JSON valid tanpa markdown fence.`;

  const messages: GrokChatMessage[] = [
    { role: 'system', content: systemContent },
  ];

  if (options.history && options.history.length > 0) {
    for (const h of options.history.slice(-10)) {
      messages.push({ role: h.role, content: h.content });
    }
  }

  messages.push({ role: 'user', content: options.message });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.3,
        max_tokens: 800,
      }),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeout);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new GrokApiError('FinAI Assistant timeout. Silakan coba lagi.', 504);
    }
    throw new GrokApiError('Gagal terhubung ke FinAI Assistant. Periksa koneksi internet.', 503);
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 401) {
    throw new GrokApiError('Konfigurasi FinAI Assistant tidak valid.', 401);
  }

  if (response.status === 429) {
    throw new GrokRateLimitError();
  }

  if (!response.ok) {
    let detail = '';
    try {
      const body = (await response.json()) as { error?: { message?: string } };
      detail = body?.error?.message || '';
    } catch {
      // ignore
    }
    throw new GrokApiError(detail || `FinAI Assistant error (${response.status}). Coba lagi beberapa saat.`, response.status);
  }

  const data = (await response.json()) as GrokCompletionResponse;
  const rawContent = data.choices?.[0]?.message?.content;

  if (!rawContent || typeof rawContent !== 'string') {
    throw new GrokApiError('FinAI Assistant tidak memberikan respons. Coba lagi.', 500);
  }

  const structured = safeParseStructuredResponse(rawContent);

  if (structured) {
    return structured;
  }

  // Fallback: treat raw content as plain text response,
  // but never leak raw JSON fragments to the user.
  const looksLikeJson = /^\s*\{/.test(rawContent.trim());
  if (looksLikeJson) {
    return {
      type: 'text',
      message: 'Saya butuh detail yang lebih lengkap. Coba sebut nominal, kategori, dan dompet yang digunakan.',
    };
  }

  return {
    type: 'text',
    message: rawContent.slice(0, 2000),
  };
}

export function isGrokConfigured(): boolean {
  const groqKey = process.env.GROQ_API_KEY?.trim();
  const xaiKey = process.env.XAI_API_KEY?.trim();
  return Boolean((groqKey && groqKey.length > 0) || (xaiKey && xaiKey.length > 0));
}

export function getActiveProvider(): 'groq' | 'xai' | 'none' {
  if (process.env.GROQ_API_KEY?.trim()) return 'groq';
  if (process.env.XAI_API_KEY?.trim()) return 'xai';
  return 'none';
}
