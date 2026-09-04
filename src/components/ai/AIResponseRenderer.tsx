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

interface AIResponseRendererProps {
  message: AIMessageType;
  isConfirming?: boolean;
  onConfirmAction: (actionId: string) => void;
  onCancelAction: (actionId: string) => void;
  onRetry?: () => void;
}

export default function AIResponseRenderer({
  message,
  isConfirming = false,
  onConfirmAction,
  onCancelAction,
  onRetry,
}: AIResponseRendererProps) {
  // Text as card (no action/insight/cards)
  const isPlainText =
    message.content &&
    !message.action &&
    !message.insight &&
    !message.budgetCard &&
    !message.goalCard &&
    !message.walletCard &&
    !message.summaryCard &&
    !message.error;

  return (
    <>
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

      {/* Caption above action/insight cards */}
      {message.content && (message.action || message.insight || message.budgetCard || message.goalCard || message.walletCard || message.summaryCard) && !isPlainText && !message.error && (
        <div className="p-3 rounded-2xl bg-white border border-[#E8EAF2]/70 shadow-2xs max-w-md">
          <p className="text-xs leading-relaxed text-[#242636] whitespace-pre-line">{message.content}</p>
        </div>
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
                  : 'pending'
              }
            />
          ) : message.action.type === 'goal_contribution' ? (
            <GoalContributionCard
              goalName={message.action.title}
              amount={message.action.amount}
              sourceWalletName={message.action.sourceWallet || 'Sumber'}
              currentAmount={0}
              targetAmount={message.action.amount * 4}
              date={message.action.date}
              onConfirm={() => onConfirmAction(message.action!.id)}
              onCancel={() => onCancelAction(message.action!.id)}
              isConfirming={isConfirming}
              status={
                message.action.status === 'confirmed' || message.action.status === 'success'
                  ? 'success'
                  : message.action.status === 'cancelled'
                  ? 'cancelled'
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

      {/* Budget Card */}
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

      {/* Summary Card */}
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

      {/* Insight Card */}
      {message.insight && <AIInsightCard insight={message.insight} />}

      {/* Error */}
      {message.error && <AIError message={message.content} onRetry={onRetry} />}
    </>
  );
}
