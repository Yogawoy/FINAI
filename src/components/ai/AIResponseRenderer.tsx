'use client';

import React from 'react';
import { AIMessage as AIMessageType } from '@/types';
import AIFinancialActionCard from './AIFinancialActionCard';
import AIInsightCard from './AIInsightCard';
import AIError from './AIError';
import BudgetCard from './cards/BudgetCard';
import GoalCard from './cards/GoalCard';
import WalletSummaryCard from './cards/WalletCard';
import SummaryCard from './cards/SummaryCard';
import TransferActionCard from './cards/TransferActionCard';
import GoalContributionCard from './cards/GoalContributionCard';
import FinancialPlanCard from './cards/FinancialPlanCard';
import ClarificationCard from './cards/ClarificationCard';
import SpendingBreakdownCard from './cards/SpendingBreakdownCard';

interface AIResponseRendererProps {
  message: AIMessageType;
  isConfirming?: boolean;
  onConfirmAction: (actionId: string) => void;
  onCancelAction: (actionId: string) => void;
  onRetry?: () => void;
  onPlanSaved?: (goalId: string) => void;
  wallets?: { id: string; name: string }[];
}

function parseBreakdownFromText(text?: string) {
  if (!text) return null;
  // Match lines like "- Bills: Rp 750.000 (94,3%)" or "* Food: Rp 35.000"
  const bulletRegex = /[-*•]\s*([A-Za-z\s&/]+):\s*Rp\s*([\d\.,]+)(?:\s*\(([\d\.,]+)%\))?/gi;
  const items: { category: string; total: number; percentage?: number }[] = [];
  let match;

  while ((match = bulletRegex.exec(text)) !== null) {
    const category = match[1].trim();
    const rawTotal = match[2].replace(/\./g, '').replace(/,/g, '');
    const total = parseFloat(rawTotal) || 0;
    const rawPct = match[3] ? match[3].replace(',', '.') : undefined;
    const percentage = rawPct ? parseFloat(rawPct) : undefined;
    if (category && total > 0) {
      items.push({ category, total, percentage });
    }
  }

  if (items.length === 0) return null;

  // Extract total spending: e.g. "Pengeluaran bulan ini sebesar Rp 795.000"
  const totalMatch = text.match(/(?:pengeluaran|total|sebesar)\s*(?:bulan\s*ini)?\s*(?:sebesar)?\s*Rp\s*([\d\.,]+)/i);
  const totalAmount = totalMatch ? parseFloat(totalMatch[1].replace(/\./g, '').replace(/,/g, '')) : undefined;

  // Extract note at the bottom
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  const nonBulletLines = lines.filter(
    (l) => !l.startsWith('-') && !l.startsWith('*') && !l.startsWith('•') && !l.toLowerCase().includes('berikut rincian')
  );
  const note = nonBulletLines.length > 1 ? nonBulletLines[nonBulletLines.length - 1] : undefined;

  return { items, totalAmount, note };
}

export default function AIResponseRenderer({
  message,
  isConfirming = false,
  onConfirmAction,
  onCancelAction,
  onRetry,
  onPlanSaved,
  wallets = [],
}: AIResponseRendererProps) {
  const parsedBreakdown = !message.spendingBreakdownCard && message.content ? parseBreakdownFromText(message.content) : null;

  // Text as card (no action/insight/cards)
  const isPlainText =
    message.content &&
    !message.action &&
    !message.insight &&
    !message.budgetCard &&
    !message.goalCard &&
    !message.walletCard &&
    !message.summaryCard &&
    !message.spendingBreakdownCard &&
    !parsedBreakdown &&
    !message.financialPlanCard &&
    !message.error &&
    !(message as any).clarification;

  return (
    <>
      {/* Spending Breakdown Card (structured or auto-parsed from text) */}
      {(message.spendingBreakdownCard || parsedBreakdown) && (
        <SpendingBreakdownCard
          items={message.spendingBreakdownCard?.items || parsedBreakdown!.items}
          period={message.spendingBreakdownCard?.period || 'Bulan Ini'}
          totalAmount={parsedBreakdown?.totalAmount}
          note={parsedBreakdown?.note}
        />
      )}

      {/* Plain text as card */}
      {isPlainText && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E8EAF2] shadow-[0_6px_24px_rgba(36,38,54,0.04)] space-y-3 max-w-md">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#EDEAFC] text-[#5F5ED4] text-[10px] font-bold uppercase tracking-wider">
              Jawaban FinAI
            </span>
          </div>
          <p className="text-xs sm:text-sm leading-relaxed text-[#242636] whitespace-pre-line">
            {message.content}
          </p>
        </div>
      )}

      {/* Clarification Card */}
      {(message as any).clarification && (
        <ClarificationCard
          message={(message as any).clarification.message || message.content}
          relatedGoalId={(message as any).clarification.relatedGoalId}
          newGoalHref={(message as any).clarification.newGoalHref}
          newGoalLabel={(message as any).clarification.newGoalLabel}
          existingGoalName={(message as any).clarification.existingGoalName}
        />
      )}

      {/* Financial Action Cards — mutation, need confirmation */}
      {message.action && (
        <>
          {message.action.type === 'transfer' ? (
            <TransferActionCard
              amount={message.action.amount}
              sourceWalletName={message.action.sourceWallet || 'Sumber'}
              destinationWalletName={message.action.destinationWallet || 'Tujuan'}
              date={message.action.date}
              onConfirm={() => onConfirmAction(message.action!.id)}
              onCancel={() => onCancelAction(message.action!.id)}
              isConfirming={isConfirming}
              status={
                message.action.status === 'confirmed' || message.action.status === 'success'
                  ? 'success'
                  : message.action.status === 'cancelled'
                  ? 'cancelled'
                  : message.action.status === 'error'
                  ? 'error'
                  : 'pending'
              }
            />
          ) : message.action.type === 'goal_contribution' ? (
            <GoalContributionCard
              goalName={message.action.title}
              amount={message.action.amount}
              sourceWalletName={message.action.sourceWallet || 'Sumber'}
              currentAmount={message.action.goalCurrentAmount ?? 0}
              targetAmount={message.action.goalTargetAmount ?? 0}
              date={message.action.date}
              onConfirm={() => onConfirmAction(message.action!.id)}
              onCancel={() => onCancelAction(message.action!.id)}
              isConfirming={isConfirming}
              status={
                message.action.status === 'confirmed' || message.action.status === 'success'
                  ? 'success'
                  : message.action.status === 'cancelled'
                  ? 'cancelled'
                  : message.action.status === 'error'
                  ? 'error'
                  : 'pending'
              }
            />
          ) : (
            <AIFinancialActionCard
              action={message.action}
              onConfirm={onConfirmAction}
              onCancel={onCancelAction}
              isConfirming={isConfirming}
            />
          )}
        </>
      )}

      {/* Read-only financial intelligence cards */}
      {message.summaryCard && (
        <SummaryCard
          period={message.summaryCard.period}
          income={message.summaryCard.income}
          expense={message.summaryCard.expense}
          remaining={message.summaryCard.remaining}
          budgetPercentage={message.summaryCard.budgetPercentage}
          activeGoals={message.summaryCard.activeGoals}
        />
      )}
      {message.budgetCard && (
        <BudgetCard
          category={message.budgetCard.category}
          limitAmount={message.budgetCard.limitAmount}
          usedAmount={message.budgetCard.usedAmount}
          remainingAmount={message.budgetCard.remainingAmount}
          percentage={message.budgetCard.percentage}
          status={message.budgetCard.status}
          period={message.budgetCard.period}
        />
      )}

      {/* Goal Card */}
      {message.goalCard && (
        <GoalCard
          name={message.goalCard.name}
          targetAmount={message.goalCard.targetAmount}
          currentAmount={message.goalCard.currentAmount}
          remainingAmount={message.goalCard.remainingAmount}
          percentage={message.goalCard.percentage}
          deadline={message.goalCard.deadline}
          category={message.goalCard.category}
        />
      )}

      {/* Wallet Card */}
      {message.walletCard && (
        <WalletSummaryCard wallets={message.walletCard.wallets} totalBalance={message.walletCard.totalBalance} />
      )}


      {/* Financial Plan Card */}
      {message.financialPlanCard && (
        <FinancialPlanCard
          plan={{
            targetName: message.financialPlanCard.targetName,
            targetAmount: message.financialPlanCard.targetAmount,
            currentAmount: message.financialPlanCard.currentAmount,
            remainingAmount: message.financialPlanCard.remainingAmount,
            durationMonths: message.financialPlanCard.durationMonths,
            requiredMonthlySaving: message.financialPlanCard.requiredMonthlySaving,
            monthlyIncome: message.financialPlanCard.monthlyIncome,
            monthlyExpense: message.financialPlanCard.monthlyExpense,
            monthlyNetCashFlow: message.financialPlanCard.monthlyNetCashFlow,
            requiredPercentageOfNet: message.financialPlanCard.requiredPercentageOfNet,
            feasibility: message.financialPlanCard.feasibility,
            assumptions: message.financialPlanCard.assumptions || [],
            relatedGoalId: message.financialPlanCard.relatedGoalId,
          }}
          wallets={(wallets && wallets.length > 0 ? wallets : message.financialPlanCard?.wallets || [])}
          onSave={(goalId) => {
            onPlanSaved?.(goalId);
            window.dispatchEvent(new CustomEvent('finai:refresh-goals'));
          }}
        />
      )}

      {/* Insight Card */}
      {message.insight && <AIInsightCard insight={message.insight} />}

      {/* Error */}
      {message.error && <AIError message={message.content} onRetry={onRetry} />}
    </>
  );
}
