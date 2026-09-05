'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AIMessage as AIMessageType, AIFinancialAction } from '@/types';
import AIHeader from './AIHeader';
import AIContextBar from './AIContextBar';
import AIConversation from './AIConversation';
import AIInput from './AIInput';
import AIQuickActions from './AIQuickActions';
import { apiClient, mapApiErrorMessage } from '@/lib/api-client';
import { emitRefresh } from '@/lib/data-refresh';

interface GroqPayload {
  transactionType?: string;
  amount: string;
  description?: string;
  category?: string;
  walletId?: string | null;
  walletName?: string | null;
  sourceWalletId?: string | null;
  sourceWalletName?: string | null;
  destinationWalletId?: string | null;
  destinationWalletName?: string | null;
  goalName?: string | null;
  goalId?: string | null;
  date?: string | null;
}

interface PendingActionMeta {
  actionType: string;
  groqPayload: GroqPayload;
  walletIdResolved?: string;
  sourceWalletIdResolved?: string;
  destWalletIdResolved?: string;
  goalIdResolved?: string;
  goalCurrentAmount?: number;
  goalTargetAmount?: number;
}

function generateActionId(): string {
  // Unique per pending action — dipakai untuk pending/loading/success/cancelled.
  // Date.now saja bisa tabrakan jika dua aksi dibuat dalam 1ms yang sama.
  return `ai-action-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function toValidISODate(value?: string | null): string | undefined {
  if (!value) return undefined;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return undefined;
  return value;
}

interface LiveGoal {
  id: string;
  name: string;
  category: string;
  currentAmount: number;
  targetAmount: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  food: 'Makanan & Minuman',
  transport: 'Transportasi',
  entertainment: 'Hiburan',
  bills: 'Tagihan & Utilitas',
  shopping: 'Belanja',
  health: 'Kesehatan',
  education: 'Pendidikan',
  salary: 'Gaji & Pendapatan',
  freelance: 'Freelance',
  investment: 'Investasi',
  other: 'Lainnya',
};

function formatDateLabel(dateStr?: string | null): string {
  if (dateStr) {
    try {
      const d = new Date(dateStr);
      if (!Number.isNaN(d.getTime())) {
        return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
      }
    } catch {
      // fallback
    }
  }
  return new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function isValidWalletId(id: string | null | undefined, wallets: { id: string; name: string }[]): boolean {
  if (!id) return false;
  return wallets.some((w) => w.id === id);
}

function resolveWalletId(
  nameOrId: string | null | undefined,
  wallets: { id: string; name: string }[]
): string | null {
  if (!nameOrId) return null;
  const direct = wallets.find((w) => w.id === nameOrId);
  if (direct) return direct.id;
  const lower = nameOrId.toLowerCase().trim();
  const byName = wallets.find((w) => w.name.toLowerCase() === lower);
  if (byName) return byName.id;
  const partial = wallets.find((w) => w.name.toLowerCase().includes(lower) || lower.includes(w.name.toLowerCase()));
  if (partial) return partial.id;
  return null;
}

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<AIMessageType[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [showPresetsModal, setShowPresetsModal] = useState(false);
  const [confirmingIds, setConfirmingIds] = useState<Set<string>>(new Set());

  // Financial live context state (real data)
  const [balance, setBalance] = useState(0);
  const [monthlyExpense, setMonthlyExpense] = useState(0);
  const [wallets, setWallets] = useState<{ id: string; name: string; type: string; balance: number }[]>([]);
  const [goals, setGoals] = useState<LiveGoal[]>([]);
  const [budgetsCount, setBudgetsCount] = useState(0);
  const [contextDate, setContextDate] = useState('');
  const [aiActionConfirmation, setAiActionConfirmation] = useState<boolean>(true);

  // Map actionId -> raw Groq payload for execution on confirm
  const pendingMetaRef = useRef<Map<string, PendingActionMeta>>(new Map());
  const aiActionConfirmationRef = useRef(aiActionConfirmation);
  useEffect(() => { aiActionConfirmationRef.current = aiActionConfirmation; }, [aiActionConfirmation]);

  const fetchContextData = useCallback(async () => {
    try {
      const [walletsRes, goalsRes, budgetsRes, txRes, settingsRes] = await Promise.allSettled([
        apiClient.get<{ wallets: { id: string; name: string; type: string; balance: string }[] }>('/api/wallets'),
        apiClient.get<{ goals: { id: string; name: string; category: string }[] }>('/api/goals'),
        apiClient.get<{ budgets: unknown[] }>('/api/budgets'),
        apiClient.get<{ transactions: { type: string; amount: string; transactionDate: string }[] }>('/api/transactions?limit=50'),
        apiClient.get<{ settings: { aiActionConfirmation?: boolean } }>('/api/settings'),
      ]);

      if (walletsRes.status === 'fulfilled') {
        const list = (walletsRes.value.wallets || []).map((w) => ({
          id: w.id,
          name: w.name,
          type: w.type,
          balance: Number(w.balance),
        }));
        setWallets(list);
        const total = list.reduce((a, w) => a + w.balance, 0);
        setBalance(total);
      }

      if (goalsRes.status === 'fulfilled') {
        setGoals(
          (goalsRes.value.goals || []).map(
            (g: { id: string; name: string; category: string; currentAmount?: string; targetAmount?: string }) => ({
              id: g.id,
              name: g.name,
              category: g.category,
              currentAmount: Number(g.currentAmount ?? 0) || 0,
              targetAmount: Number(g.targetAmount ?? 0) || 0,
            })
          )
        );
      }

      if (budgetsRes.status === 'fulfilled') {
        setBudgetsCount((budgetsRes.value.budgets || []).length);
      }

      if (txRes.status === 'fulfilled') {
        const txs = txRes.value.transactions || [];
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const expenseThisMonth = txs
          .filter((t) => String(t.type).toUpperCase() === 'EXPENSE' && new Date(t.transactionDate) >= monthStart)
          .reduce((a, t) => a + Number(t.amount), 0);
        setMonthlyExpense(expenseThisMonth);
      }

      if (settingsRes.status === 'fulfilled') {
        const s = (settingsRes.value as any).settings;
        if (s && typeof s.aiActionConfirmation === 'boolean') {
          setAiActionConfirmation(s.aiActionConfirmation);
        }
      }

      const nowLabel = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      setContextDate(nowLabel.charAt(0).toUpperCase() + nowLabel.slice(1));
    } catch {
      // ignore context fetch errors
    }
  }, []);

  useEffect(() => {
    fetchContextData();
  }, [fetchContextData]);

  const handleSendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isThinking) return;

      const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      const userMsg: AIMessageType = {
        id: `usr-${Date.now()}`,
        sender: 'user',
        content: text.trim(),
        timestamp: timeStr,
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsThinking(true);

      // Build history for Grok (last 10 messages)
      const historyForApi = [...messages, userMsg]
        .slice(-10)
        .map((m) => ({
          role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
          content: m.action ? `${m.content} [Action: ${m.action.title} ${m.action.amount}]` : m.content,
        }))
        // Grok expects history without the latest user message (it is sent separately as message)
        .slice(0, -1);

      // Ensure wallets are loaded — if empty due to initial race, refetch once
      let liveWallets = wallets;
      let liveGoals = goals;
      if (liveWallets.length === 0) {
        try {
          const wRes = await apiClient.get<{ wallets: { id: string; name: string; type: string; balance: string }[] }>('/api/wallets');
          liveWallets = (wRes.wallets || []).map((w) => ({ id: w.id, name: w.name, type: w.type, balance: Number(w.balance) }));
          if (liveWallets.length > 0) setWallets(liveWallets);
        } catch {
          // keep empty
        }
      }
      if (liveGoals.length === 0) {
        try {
          const gRes = await apiClient.get<{
            goals: { id: string; name: string; category: string; currentAmount?: string; targetAmount?: string }[];
          }>('/api/goals');
          liveGoals = (gRes.goals || []).map((g) => ({
            id: g.id,
            name: g.name,
            category: g.category,
            currentAmount: Number(g.currentAmount ?? 0) || 0,
            targetAmount: Number(g.targetAmount ?? 0) || 0,
          }));
          if (liveGoals.length > 0) setGoals(liveGoals);
        } catch {
          // keep empty
        }
      }

      try {
        const data = await apiClient.post<{
          response: {
            type: 'text' | 'financial_action' | 'clarification' | 'error' | 'budget' | 'goal' | 'wallet' | 'summary' | 'insight' | 'spending_breakdown';
            message?: string;
            action?: string;
            payload?: GroqPayload;
            data?: any;
            requiresConfirmation?: boolean;
          };
        }>('/api/ai/chat', {
          message: text.trim(),
          history: historyForApi,
        });

        const grok = data.response;

        if (grok.type === 'financial_action' && grok.action && grok.payload) {
          const payload = grok.payload;
          const amountNum = Number(payload.amount) || 0;
          const dateLabel = formatDateLabel(payload.date);

          // Resolve & validate wallet IDs — Grok must return real UUID from context
          let resolvedWalletId: string | null | undefined = payload.walletId;
          let resolvedSourceId: string | null | undefined = payload.sourceWalletId;
          let resolvedDestId: string | null | undefined = payload.destinationWalletId;
          let resolvedGoalId: string | null | undefined = payload.goalId;

          // Validate IDs belong to user — if fake/placeholder, nullify and try name fallback (use liveWallets for race-free)
          const wList = liveWallets.length > 0 ? liveWallets : wallets;
          const gList = liveGoals.length > 0 ? liveGoals : goals;
          if (resolvedWalletId && !isValidWalletId(resolvedWalletId, wList)) {
            const fallback = payload.walletName ? resolveWalletId(payload.walletName, wList) : null;
            resolvedWalletId = fallback;
            if (resolvedWalletId && !isValidWalletId(resolvedWalletId, wList)) resolvedWalletId = null;
          }
          if (resolvedSourceId && !isValidWalletId(resolvedSourceId, wList)) {
            const fallback = payload.sourceWalletName ? resolveWalletId(payload.sourceWalletName, wList) : null;
            resolvedSourceId = fallback;
            if (resolvedSourceId && !isValidWalletId(resolvedSourceId, wList)) resolvedSourceId = null;
          }
          if (resolvedDestId && !isValidWalletId(resolvedDestId, wList)) {
            const fallback = payload.destinationWalletName ? resolveWalletId(payload.destinationWalletName, wList) : null;
            resolvedDestId = fallback;
            if (resolvedDestId && !isValidWalletId(resolvedDestId, wList)) resolvedDestId = null;
          }

          if (!resolvedWalletId && payload.walletName) {
            resolvedWalletId = resolveWalletId(payload.walletName, wList);
          }
          if (!resolvedSourceId && payload.sourceWalletName) {
            resolvedSourceId = resolveWalletId(payload.sourceWalletName, wList);
          }
          if (!resolvedDestId && payload.destinationWalletName) {
            resolvedDestId = resolveWalletId(payload.destinationWalletName, wList);
          }
          if (!resolvedGoalId && payload.goalName) {
            const matched = gList.find(
              (g) => g.name.toLowerCase() === payload.goalName!.toLowerCase() || g.name.toLowerCase().includes(payload.goalName!.toLowerCase())
            );
            if (matched) resolvedGoalId = matched.id;
          }

          // If wallet still unresolved and only one wallet exists, auto-resolve
          if (!resolvedWalletId && !resolvedSourceId && wList.length === 1 && (grok.action === 'create_transaction')) {
            resolvedWalletId = wList[0].id;
          }

          // Wallet validation failed or no wallets at all → helpful clarification
          if (grok.action === 'create_transaction' && !resolvedWalletId) {
            if (wList.length === 0) {
              const clarMsg: AIMessageType = {
                id: `ai-${Date.now()}`,
                sender: 'assistant',
                content: 'Kamu belum punya dompet. Buat dompet dulu di halaman Dompet sebelum mencatat transaksi. Buka /app/wallets untuk menambah dompet.',
                timestamp: timeStr,
              };
              setMessages((prev) => [...prev, clarMsg]);
              return;
            }
            const walletList = wList.map((w) => w.name).join(', ');
            const clarMsg: AIMessageType = {
              id: `ai-${Date.now()}`,
              sender: 'assistant',
              content: `${grok.message || 'Transaksi siap dicatat.'} Bayarnya dari wallet mana? Kamu punya: ${walletList}. Coba sebut: "pakai ${wList[0].name}"`,
              timestamp: timeStr,
            };
            setMessages((prev) => [...prev, clarMsg]);
            return;
          }
          if ((grok.action === 'transfer' || grok.action === 'goal_contribution') && !resolvedSourceId) {
            if (wList.length === 0) {
              const clarMsg: AIMessageType = {
                id: `ai-${Date.now()}`,
                sender: 'assistant',
                content: 'Kamu belum punya dompet untuk transfer/setoran. Buat dompet dulu di /app/wallets.',
                timestamp: timeStr,
              };
              setMessages((prev) => [...prev, clarMsg]);
              return;
            }
            const walletList = wList.map((w) => w.name).join(', ');
            const clarMsg: AIMessageType = {
              id: `ai-${Date.now()}`,
              sender: 'assistant',
              content: `Wallet sumber belum jelas. Kamu punya: ${walletList}. Sebut sumbernya, misal "dari ${wList[0].name}"`,
              timestamp: timeStr,
            };
            setMessages((prev) => [...prev, clarMsg]);
            return;
          }

          const actionId = generateActionId();

          // Snapshot goal asli untuk progress card — jangan menebak angka.
          const goalForDisplay: LiveGoal | undefined =
            (resolvedGoalId ? gList.find((g) => g.id === resolvedGoalId) : undefined) ??
            (payload.goalName
              ? gList.find((g) => g.name.toLowerCase().includes(payload.goalName!.toLowerCase()))
              : undefined);

          // Save meta for confirmation execution
          pendingMetaRef.current.set(actionId, {
            actionType: grok.action,
            groqPayload: payload,
            walletIdResolved: resolvedWalletId || undefined,
            sourceWalletIdResolved: resolvedSourceId || undefined,
            destWalletIdResolved: resolvedDestId || undefined,
            goalIdResolved: resolvedGoalId || undefined,
            goalCurrentAmount: goalForDisplay?.currentAmount,
            goalTargetAmount: goalForDisplay?.targetAmount,
          });

          // Map to AIFinancialAction
          let actionType: AIFinancialAction['type'] = 'expense';
          let title = payload.description || 'Transaksi';
          let categoryLabel = payload.category ? CATEGORY_LABELS[payload.category] || payload.category : undefined;

          if (grok.action === 'create_transaction') {
            actionType = payload.transactionType === 'INCOME' ? 'income' : 'expense';
            if (!payload.description) title = actionType === 'income' ? 'Pemasukan' : 'Pengeluaran';
          } else if (grok.action === 'goal_contribution') {
            actionType = 'goal_contribution';
            title = payload.description || payload.goalName || 'Setoran Target';
          } else if (grok.action === 'transfer') {
            actionType = 'transfer';
            title = payload.description || 'Transfer Saldo';
          }

          const wListForDisplay = liveWallets.length > 0 ? liveWallets : wallets;
          const walletNameForDisplay =
            payload.walletName ||
            (resolvedWalletId ? wListForDisplay.find((w) => w.id === resolvedWalletId)?.name : undefined) ||
            payload.sourceWalletName ||
            (resolvedSourceId ? wListForDisplay.find((w) => w.id === resolvedSourceId)?.name : undefined) ||
            'Wallet';

          const destWalletNameForDisplay =
            payload.destinationWalletName ||
            (resolvedDestId ? wListForDisplay.find((w) => w.id === resolvedDestId)?.name : undefined) ||
            undefined;

          const aiMsg: AIMessageType = {
            id: `ai-${Date.now()}`,
            sender: 'assistant',
            content: grok.message || 'Silakan konfirmasi detail berikut sebelum disimpan:',
            timestamp: timeStr,
            action: {
              id: actionId,
              type: actionType,
              title,
              amount: amountNum,
              category: categoryLabel,
              sourceWallet: walletNameForDisplay,
              destinationWallet: destWalletNameForDisplay,
              date: dateLabel,
              status: 'pending',
              goalCurrentAmount: goalForDisplay?.currentAmount,
              goalTargetAmount: goalForDisplay?.targetAmount,
            },
          };

          // Special handling for transfer: override to show both wallets
          if (grok.action === 'transfer' && resolvedSourceId && resolvedDestId) {
            const wListForDisplay2 = liveWallets.length > 0 ? liveWallets : wallets;
            const srcName = wListForDisplay2.find((w) => w.id === resolvedSourceId)?.name || payload.sourceWalletName || 'Sumber';
            const dstName = wListForDisplay2.find((w) => w.id === resolvedDestId)?.name || payload.destinationWalletName || 'Tujuan';
            aiMsg.action!.sourceWallet = srcName;
            aiMsg.action!.destinationWallet = dstName;
            // Keep as goal_contribution visual (arrow)
          }

          setMessages((prev) => [...prev, aiMsg]);

          // Toggle di Settings: jika "Konfirmasi Sebelum Eksekusi" dimatikan → auto-record
          if (!aiActionConfirmationRef.current) {
            setTimeout(() => {
              // Trigger confirm via pendingMeta — pakai timeout agar card sempat render
              const evt = new CustomEvent('finai:auto-confirm', { detail: { actionId } });
              window.dispatchEvent(evt);
            }, 500);
          }
          return;
        }

        if (grok.type === 'clarification') {
          const msg: AIMessageType = {
            id: `ai-${Date.now()}`,
            sender: 'assistant',
            content: grok.message || 'Bisa jelaskan lebih detail?',
            timestamp: timeStr,
          };
          setMessages((prev) => [...prev, msg]);
          return;
        }

        if (grok.type === 'error') {
          const msg: AIMessageType = {
            id: `ai-${Date.now()}`,
            sender: 'assistant',
            content: grok.message || 'Terjadi kesalahan. Coba lagi.',
            timestamp: timeStr,
            error: true,
          };
          setMessages((prev) => [...prev, msg]);
          return;
        }

        if (grok.type === 'budget' && (grok as any).data) {
          const d = (grok as any).data;
          const msg: AIMessageType = {
            id: `ai-${Date.now()}`,
            sender: 'assistant',
            content: grok.message || `Budget ${d.category}`,
            timestamp: timeStr,
            budgetCard: {
              category: d.category,
              limitAmount: Number(d.limitAmount),
              usedAmount: Number(d.usedAmount),
              remainingAmount: Number(d.remainingAmount),
              percentage: Number(d.percentage),
              status: d.status,
              period: d.period,
            },
          };
          setMessages((prev) => [...prev, msg]);
          return;
        }

        if (grok.type === 'goal' && (grok as any).data) {
          const d = (grok as any).data;
          const msg: AIMessageType = {
            id: `ai-${Date.now()}`,
            sender: 'assistant',
            content: grok.message || `Progress ${d.name}`,
            timestamp: timeStr,
            goalCard: {
              name: d.name,
              targetAmount: Number(d.targetAmount),
              currentAmount: Number(d.currentAmount),
              remainingAmount: Number(d.remainingAmount),
              percentage: Number(d.percentage),
              deadline: d.deadline,
              category: d.category,
            },
          };
          setMessages((prev) => [...prev, msg]);
          return;
        }

        if (grok.type === 'wallet' && (grok as any).data) {
          const d = (grok as any).data;
          const msg: AIMessageType = {
            id: `ai-${Date.now()}`,
            sender: 'assistant',
            content: grok.message || 'Berikut ringkasan dompet kamu.',
            timestamp: timeStr,
            walletCard: {
              wallets: (d.wallets || []).map((w: any) => ({ name: w.name, balance: Number(w.balance), type: w.type })),
              totalBalance: Number(d.totalBalance),
            },
          };
          setMessages((prev) => [...prev, msg]);
          return;
        }

        if (grok.type === 'summary' && (grok as any).data) {
          const d = (grok as any).data;
          const msg: AIMessageType = {
            id: `ai-${Date.now()}`,
            sender: 'assistant',
            content: grok.message || `Ringkasan ${d.period || 'keuangan'}`,
            timestamp: timeStr,
            summaryCard: {
              period: d.period,
              income: Number(d.income),
              expense: Number(d.expense),
              remaining: Number(d.remaining),
              budgetPercentage: d.budgetPercentage,
              activeGoals: d.activeGoals,
            },
          };
          setMessages((prev) => [...prev, msg]);
          return;
        }

        if (grok.type === 'insight' && (grok as any).message) {
          const d = (grok as any).data;
          const msg: AIMessageType = {
            id: `ai-${Date.now()}`,
            sender: 'assistant',
            content: grok.message || 'Insight keuangan',
            timestamp: timeStr,
            insight: d
              ? {
                  type: 'analytics',
                  title: d.title || 'Insight',
                  subtitle: d.detail,
                  metrics: [
                    ...(d.value ? [{ label: 'Nilai', value: d.value }] : []),
                    ...(d.change ? [{ label: 'Perubahan', value: d.change }] : []),
                  ],
                }
              : undefined,
          };
          setMessages((prev) => [...prev, msg]);
          return;
        }

        if ((grok as any).type === 'spending_breakdown' && (grok as any).data) {
          const d = (grok as any).data;
          const msg: AIMessageType = {
            id: `ai-${Date.now()}`,
            sender: 'assistant',
            content: grok.message || 'Pengeluaran terbesar kamu:',
            timestamp: timeStr,
            spendingBreakdownCard: {
              items: (d.items || []).map((item: any) => ({
                category: item.category,
                total: Number(item.total),
                percentage: typeof item.percentage === 'number' ? item.percentage : undefined,
              })),
              period: d.period,
            },
          };
          setMessages((prev) => [...prev, msg]);
          return;
        }

        if ((grok as any).type === 'financial_plan' && (grok as any).data) {
          const d = (grok as any).data;
          const msg: AIMessageType = {
            id: `ai-${Date.now()}`,
            sender: 'assistant',
            content: grok.message || 'Rencana keuangan:',
            timestamp: timeStr,
            financialPlanCard: {
              targetName: String(d.targetName || ''),
              targetAmount: Number(d.targetAmount) || 0,
              currentAmount: Number(d.currentAmount) || 0,
              remainingAmount: Number(d.remainingAmount) || 0,
              durationMonths: Number(d.durationMonths) || 0,
              requiredMonthlySaving: Number(d.requiredMonthlySaving) || 0,
              monthlyIncome: Number(d.monthlyIncome) || 0,
              monthlyExpense: Number(d.monthlyExpense) || 0,
              monthlyNetCashFlow: Number(d.monthlyNetCashFlow) || 0,
              requiredPercentageOfNet: Number(d.requiredPercentageOfNet) || 0,
              feasibility: typeof d.feasibility === 'string' ? d.feasibility : 'insufficient_data',
              assumptions: Array.isArray(d.assumptions) ? d.assumptions.filter((x: any) => typeof x === 'string') : [],
              relatedGoalId: typeof d.relatedGoalId === 'string' ? d.relatedGoalId : null,
              wallets: (liveWallets.length > 0 ? liveWallets : wallets).map((w) => ({ id: w.id, name: w.name })),
            },
          };
          setMessages((prev) => [...prev, msg]);
          return;
        }

        // type === 'text'
        const textMsg: AIMessageType = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          content: grok.message || 'Saya siap membantu keuanganmu.',
          timestamp: timeStr,
        };
        setMessages((prev) => [...prev, textMsg]);
      } catch (err) {
        const message = mapApiErrorMessage(err);
        const isRateLimit = message.toLowerCase().includes('sibuk') || (err as { status?: number })?.status === 429;
        const displayMessage = isRateLimit
          ? 'FinAI Assistant sedang sibuk. Coba lagi beberapa saat.'
          : message;

        const errorMsg: AIMessageType = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          content: displayMessage,
          timestamp: timeStr,
          error: true,
        };
        setMessages((prev) => [...prev, errorMsg]);
      } finally {
        setIsThinking(false);
      }
    },
    [isThinking, messages, wallets, goals]
  );

  const handleConfirmAction = useCallback(
    async (actionId: string) => {
      if (confirmingIds.has(actionId)) return;

      const meta = pendingMetaRef.current.get(actionId);
      if (!meta) {
        // No meta — just mark as confirmed locally (fallback)
        setMessages((prev) =>
          prev.map((msg) =>
            msg.action && msg.action.id === actionId ? { ...msg, action: { ...msg.action, status: 'confirmed' as const } } : msg
          )
        );
        return;
      }

      setConfirmingIds((prev) => new Set(prev).add(actionId));

      const { actionType, groqPayload, walletIdResolved, sourceWalletIdResolved, destWalletIdResolved, goalIdResolved } = meta;
      // Payload terstruktur dari AI — JANGAN parse ulang teks pesan.
      const amountNum = Number(groqPayload.amount);
      if (!Number.isFinite(amountNum) || amountNum <= 0) {
        throw new Error('Nominal tidak valid.');
      }
      // Tanggal terstruktur (opsional) — dipetakan ke nama field tiap API.
      // Tanggal invalid diabaikan agar backend memakai default hari ini.
      const actionDate = toValidISODate(groqPayload.date);

      try {
        if (actionType === 'create_transaction') {
          const walletId = walletIdResolved || groqPayload.walletId;
          if (!walletId) throw new Error('Wallet tidak ditemukan.');

          await apiClient.post('/api/transactions', {
            walletId,
            type: groqPayload.transactionType || 'EXPENSE',
            amount: amountNum,
            category: groqPayload.category || 'other',
            description: groqPayload.description || 'Transaksi via FinAI Assistant',
            ...(actionDate ? { transactionDate: actionDate } : {}),
          });
        } else if (actionType === 'goal_contribution') {
          // Could be goal_contribution or transfer routed via goal_contribution visual
          // Detect transfer: has both source and dest
          if (sourceWalletIdResolved && destWalletIdResolved && !goalIdResolved && !groqPayload.goalName) {
            // This is actually a transfer
            await apiClient.post('/api/transfers', {
              fromWalletId: sourceWalletIdResolved,
              toWalletId: destWalletIdResolved,
              amount: amountNum,
              ...(actionDate ? { date: actionDate } : {}),
            });
          } else {
            const goalId = goalIdResolved || groqPayload.goalId;
            let targetGoalId = goalId;
            if (!targetGoalId && groqPayload.goalName) {
              const matched = goals.find(
                (g) => g.name.toLowerCase().includes(groqPayload.goalName!.toLowerCase())
              );
              if (matched) targetGoalId = matched.id;
            }
            if (!targetGoalId) throw new Error('Target impian tidak ditemukan.');
            if (!sourceWalletIdResolved) throw new Error('Wallet sumber tidak ditemukan.');

            await apiClient.post(`/api/goals/${targetGoalId}/contributions`, {
              sourceWalletId: sourceWalletIdResolved,
              amount: amountNum,
              ...(actionDate ? { contributionDate: actionDate } : {}),
            });
          }
        } else if (actionType === 'transfer') {
          const fromId = sourceWalletIdResolved || groqPayload.sourceWalletId;
          const toId = destWalletIdResolved || groqPayload.destinationWalletId;
          if (!fromId || !toId) throw new Error('Wallet sumber atau tujuan tidak ditemukan.');
          await apiClient.post('/api/transfers', {
            fromWalletId: fromId,
            toWalletId: toId,
            amount: amountNum,
            ...(actionDate ? { date: actionDate } : {}),
          });
        } else {
          throw new Error('Tipe aksi belum didukung.');
        }

        // Success — update card to confirmed and trigger refresh
        setMessages((prev) =>
          prev.map((msg) =>
            msg.action && msg.action.id === actionId ? { ...msg, action: { ...msg.action, status: 'success' as const } } : msg
          )
        );

        fetchContextData();
        if (actionType === 'create_transaction') {
          emitRefresh('transaction');
          emitRefresh('wallet');
        } else if (actionType === 'transfer') {
          emitRefresh('transfer');
          emitRefresh('wallet');
          emitRefresh('transaction');
        } else if (actionType === 'goal_contribution') {
          emitRefresh('goal_contribution');
          emitRefresh('goal');
          emitRefresh('wallet');
        }
        pendingMetaRef.current.delete(actionId);
      } catch (err) {
        const apiMessage = mapApiErrorMessage(err);
        // Make wallet 404 more actionable for AI flow
        const friendlyMessage =
          apiMessage.toLowerCase().includes('tidak ditemukan') ||
          apiMessage.toLowerCase().includes('bukan milik')
            ? 'Dompet tidak ditemukan atau bukan milik Anda. Pastikan dompet masih ada di /app/wallets dan coba lagi. Jika baru buat dompet, refresh halaman.'
            : apiMessage;
        const timeStr = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        const errorMsg: AIMessageType = {
          id: `ai-err-${Date.now()}`,
          sender: 'assistant',
          content: `Gagal memproses: ${friendlyMessage}`,
          timestamp: timeStr,
          error: true,
        };
        setMessages((prev) => [...prev, errorMsg]);

        // Update action card to show error state on the original action card
        setMessages((prev) =>
          prev.map((m) =>
            m.action && m.action.id === actionId
              ? {
                  ...m,
                  action: {
                    ...m.action,
                    status: 'error' as const,
                    errorMessage: friendlyMessage,
                  },
                }
              : m
          )
        );
      } finally {
        setConfirmingIds((prev) => {
          const next = new Set(prev);
          next.delete(actionId);
          return next;
        });
      }
    },
    [confirmingIds, fetchContextData, goals]
  );

  // Auto-confirm listener for toggle OFF (opsi 3)
  useEffect(() => {
    const handler = (e: Event) => {
      const actionId = (e as CustomEvent).detail?.actionId;
      if (actionId) handleConfirmAction(actionId);
    };
    window.addEventListener('finai:auto-confirm', handler as EventListener);
    return () => window.removeEventListener('finai:auto-confirm', handler as EventListener);
  }, [handleConfirmAction]);

  const handleCancelAction = useCallback((actionId: string) => {
    pendingMetaRef.current.delete(actionId);
    setMessages((prev) =>
      prev.map((msg) => {
        if (msg.action && msg.action.id === actionId) {
          return {
            ...msg,
            action: {
              ...msg.action,
              status: 'cancelled' as const,
            },
          };
        }
        return msg;
      })
    );
  }, []);

  const handleNewChat = useCallback(() => {
    pendingMetaRef.current.clear();
    setMessages([]);
  }, []);

  const handleClearChat = useCallback(() => {
    pendingMetaRef.current.clear();
    setMessages([]);
  }, []);

  const handleRetry = useCallback(() => {
    // Retry last user message
    const lastUserMsg = [...messages].reverse().find((m) => m.sender === 'user');
    if (lastUserMsg) {
      handleSendMessage(lastUserMsg.content);
    }
  }, [messages, handleSendMessage]);

  return (
    <div className="max-w-[1150px] mx-auto pb-4 space-y-4">
      <AIHeader onNewChat={handleNewChat} onClearChat={handleClearChat} />

      <AIContextBar
        balance={balance}
        monthlyExpense={monthlyExpense}
        activeGoalsCount={goals.length || 0}
        activeBudgetsCount={budgetsCount}
        contextDate={contextDate || new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })}
      />

      <div className="sticky top-0 z-20 py-2.5 -mx-3 px-3 bg-[#F6F7FB]/95 backdrop-blur-md border-b border-[#E8EAF2]/70 shadow-[0_4px_20px_rgba(36,38,54,0.02)] transition-all">
        <div className="max-w-[920px] mx-auto">
          <AIQuickActions onSelectAction={handleSendMessage} variant="sticky-bar" />
        </div>
      </div>

      <div className="min-h-[420px] max-w-[920px] mx-auto pt-2 pb-6">
        <AIConversation
          messages={messages}
          isThinking={isThinking}
          confirmingIds={confirmingIds}
          onConfirmAction={handleConfirmAction}
          onCancelAction={handleCancelAction}
          onSelectAction={handleSendMessage}
          onRetry={handleRetry}
          wallets={wallets}
          onPlanSaved={(goalId) => {
            emitRefresh('goal');
            emitRefresh('goal_contribution');
            emitRefresh('wallet');
          }}
        />
      </div>

      <div className="sticky bottom-4 z-20 max-w-[920px] mx-auto w-full pt-2">
        <div className="relative">
          <div className="absolute -inset-2 bg-gradient-to-t from-[#F6F7FB] via-[#F6F7FB]/90 to-transparent -z-10 rounded-3xl" />
          <AIInput
            onSendMessage={handleSendMessage}
            disabled={isThinking || confirmingIds.size > 0}
            onOpenPresets={() => setShowPresetsModal(!showPresetsModal)}
          />
        </div>
      </div>
    </div>
  );
}
